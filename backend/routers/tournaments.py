from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import uuid

from common.database import get_db
from common.models import User, Tournament, TournamentParticipant, TournamentMatch, TournamentReward, PvPMatch
import auth as auth_module
from pydantic import BaseModel

router = APIRouter(prefix="/tournaments", tags=["Tournaments"])

# --- Pydantic Schemas ---

class TournamentCreate(BaseModel):
    name: str
    description: Optional[str] = None
    skill_id: Optional[str] = None
    tournament_type: str = "single_elimination"
    max_players: int = 32
    registration_open: Optional[datetime] = None
    registration_close: Optional[datetime] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None

class TournamentRewardSchema(BaseModel):
    position: int
    xp_reward: int
    rank_points: int
    badge: Optional[str] = None
    title: Optional[str] = None

class TournamentResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    skill_id: Optional[str]
    tournament_type: str
    max_players: int
    status: str
    registration_open: Optional[datetime]
    registration_close: Optional[datetime]
    start_time: Optional[datetime]
    participant_count: int

    class Config:
        orm_mode = True

# --- API Endpoints ---

@router.post("/create", response_model=TournamentResponse)
async def create_tournament(
    data: TournamentCreate,
    current_user: User = Depends(auth_module.get_current_user),
    db: Session = Depends(get_db)
):
    # In a real app, check if current_user is admin
    new_tournament = Tournament(
        name=data.name,
        description=data.description,
        skill_id=data.skill_id,
        tournament_type=data.tournament_type,
        max_players=data.max_players,
        registration_open=data.registration_open,
        registration_close=data.registration_close,
        start_time=data.start_time,
        end_time=data.end_time,
        status="upcoming",
        created_by=current_user.id
    )
    db.add(new_tournament)
    db.commit()
    db.refresh(new_tournament)
    
    # Add participant_count for response
    new_tournament.participant_count = 0
    return new_tournament

@router.get("/", response_model=List[TournamentResponse])
async def list_tournaments(db: Session = Depends(get_db)):
    tournaments = db.query(Tournament).all()
    for t in tournaments:
        t.participant_count = db.query(TournamentParticipant).filter(TournamentParticipant.tournament_id == t.id).count()
    return tournaments

@router.get("/{tournament_id}", response_model=TournamentResponse)
async def get_tournament_details(tournament_id: int, db: Session = Depends(get_db)):
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    tournament.participant_count = db.query(TournamentParticipant).filter(TournamentParticipant.tournament_id == tournament.id).count()
    return tournament

@router.post("/{tournament_id}/register")
async def register_for_tournament(
    tournament_id: int,
    current_user: User = Depends(auth_module.get_current_user),
    db: Session = Depends(get_db)
):
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    if tournament.status != "registration_open" and tournament.status != "upcoming":
        raise HTTPException(status_code=400, detail="Registration is not open for this tournament")
    
    # Check if already registered
    existing = db.query(TournamentParticipant).filter(
        TournamentParticipant.tournament_id == tournament_id,
        TournamentParticipant.user_id == current_user.id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already registered for this tournament")
    
    # Check max players
    count = db.query(TournamentParticipant).filter(TournamentParticipant.tournament_id == tournament_id).count()
    if count >= tournament.max_players:
        raise HTTPException(status_code=400, detail="Tournament is full")
    
    # Skill requirement check (example: user must have skill)
    # if tournament.skill_id and not user_has_skill(current_user, tournament.skill_id):
    #     raise HTTPException(status_code=400, detail=f"You do not meet the skill requirement: {tournament.skill_id}")

    participant = TournamentParticipant(
        tournament_id=tournament_id,
        user_id=current_user.id,
        status="registered"
    )
    db.add(participant)
    db.commit()
    
    return {"message": "Successfully registered", "tournament_id": tournament_id}

@router.get("/{tournament_id}/bracket")
async def get_tournament_bracket(tournament_id: int, db: Session = Depends(get_db)):
    matches = db.query(TournamentMatch).filter(TournamentMatch.tournament_id == tournament_id).all()
    # Simple list for now, frontend will structure it
    return matches

import math

# --- Helper Functions ---

def get_next_power_of_2(n):
    if n <= 0: return 1
    return 2**(n - 1).bit_length()

# --- API Endpoints ---

@router.post("/{tournament_id}/start")
async def start_tournament(
    tournament_id: int,
    db: Session = Depends(get_db)
):
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    if tournament.status != "registration_open" and tournament.status != "upcoming":
        raise HTTPException(status_code=400, detail="Cannot start tournament from current status")
    
    participants = db.query(TournamentParticipant).filter(
        TournamentParticipant.tournament_id == tournament_id
    ).all()
    
    if len(participants) < 2:
        raise HTTPException(status_code=400, detail="Not enough participants to start")

    # 1. Seeding (MMR based)
    # In a real app, join with PvPRating. For now, we take users
    # Sort by ID as a fallback, but here we cluster participants
    participants.sort(key=lambda p: p.user_id) # Mock seeding
    
    for i, p in enumerate(participants):
        p.seed = i + 1
    
    # 2. Bracket Generation (Single Elimination)
    num_players = len(participants)
    next_pow_2 = get_next_power_of_2(num_players)
    
    # Initial round
    # round_number 1: matches needed to reach power of 2
    # If num_players = 32, pow2 = 32, matches = 16
    # If num_players = 12, pow2 = 16. Some get byes or play in round 0.
    # For simplicity, we assume players are powers of 2 for this MVP
    # or we handle the first round as full power of 2 with 'Byes'
    
    rounds = int(math.log2(next_pow_2))
    matches_to_create = next_pow_2 - 1
    
    # We'll create the matches for the first round
    num_matches_r1 = next_pow_2 // 2
    
    # Shuffle or seed-pair (1 vs 32, 2 vs 31, etc.)
    p_seeds = {p.seed: p.user_id for p in participants}
    
    for i in range(1, num_matches_r1 + 1):
        # Traditional seeding: 1 vs 32, 16 vs 17...
        # 1 vs last, 2 vs second last...
        p1_seed = i
        p2_seed = next_pow_2 - i + 1
        
        p1_id = p_seeds.get(p1_seed)
        p2_id = p_seeds.get(p2_seed)
        
        new_match = TournamentMatch(
            tournament_id=tournament_id,
            round_number=1,
            match_number=i,
            player1_id=p1_id,
            player2_id=p2_id,
            match_status="pending"
        )
        
        # If one player is missing, it's a Bye
        if p1_id and not p2_id:
            new_match.winner_id = p1_id
            new_match.match_status = "completed"
        elif not p1_id and p2_id:
            new_match.winner_id = p2_id
            new_match.match_status = "completed"
            
        db.add(new_match)
    
    tournament.status = "in_progress"
    tournament.start_time = datetime.now()
    db.commit()
    
@router.post("/match/{match_id}/resolve")
async def resolve_tournament_match(
    match_id: int,
    winner_id: int,
    db: Session = Depends(get_db)
):
    match = db.query(TournamentMatch).filter(TournamentMatch.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    match.winner_id = winner_id
    match.match_status = "completed"
    
    # ADVANCE TO NEXT ROUND
    # In single elimination, match N and N+1 feed into match floor(N/2) of next round
    next_round = match.round_number + 1
    next_match_num = (match.match_number + 1) // 2
    
    # Check if this was the FINAL match
    tournament = db.query(Tournament).filter(Tournament.id == match.tournament_id).first()
    participants_count = db.query(TournamentParticipant).filter(TournamentParticipant.tournament_id == match.tournament_id).count()
    max_rounds = math.ceil(math.log2(participants_count))
    
    if match.round_number >= max_rounds:
        # TOURNAMENT OVER
        tournament.status = "completed"
        tournament.end_time = datetime.now()
        
        # Mark winner in participants
        winner_participant = db.query(TournamentParticipant).filter(
            TournamentParticipant.tournament_id == tournament.id,
            TournamentParticipant.user_id == winner_id
        ).first()
        if winner_participant:
            winner_participant.status = "winner"
            
        # Award champion rewards
        reward = db.query(TournamentReward).filter(
            TournamentReward.tournament_id == tournament.id,
            TournamentReward.position == 1
        ).first()
        if reward:
            user = db.query(User).filter(User.id == winner_id).first()
            if user:
                user.xp_points += reward.xp_reward
                user.ranking_score += reward.rank_points
                # logic to add badge to UserBadges table if exists
    else:
        # Find or create the match in next round
        next_match = db.query(TournamentMatch).filter(
            TournamentMatch.tournament_id == match.tournament_id,
            TournamentMatch.round_number == next_round,
            TournamentMatch.match_number == next_match_num
        ).first()
        
        if not next_match:
            next_match = TournamentMatch(
                tournament_id=match.tournament_id,
                round_number=next_round,
                match_number=next_match_num,
                match_status="pending"
            )
            db.add(next_match)
            db.flush()
            
        # Assign player to next match (player1 if match_num was odd, player2 if even)
        if match.match_number % 2 != 0:
            next_match.player1_id = winner_id
        else:
            next_match.player2_id = winner_id
            
    db.commit()
    return {"message": "Match resolved and progression updated"}
