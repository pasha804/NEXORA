import random
from typing import Dict, Any

class AIJudge:
    """
    Simulates the AI Judge for PvP Code Challenges.
    In a production env, this would call an LLM (GPT-4/Claude) via API.
    """
    
    @staticmethod
    def evaluate_submission(code: str, challenge_context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Evaluates a code submission and returns scores and feedback.
        """
        # Mock evaluation logic
        # 1. Basic Analysis
        line_count = len(code.split('\n'))
        has_comments = '#' in code or '//' in code
        complexity_check = 'for' in code and 'if' in code
        
        # 2. Score Calculation (Simulated)
        accuracy_score = random.randint(70, 100) if complexity_check else random.randint(40, 70)
        quality_score = 90 if has_comments else random.randint(60, 85)
        creativity_score = random.randint(70, 95)
        
        total_ai_score = int((accuracy_score * 0.4) + (quality_score * 0.4) + (creativity_score * 0.2))
        
        # 3. Generate Feedback
        feedback_strengths = [
            "Good variable naming conventions.",
            "Efficient use of loops.",
            "Clear logical flow."
        ]
        feedback_weaknesses = [
            "Could add more comments for clarity.",
            "Consider edge cases for empty inputs.",
            "Function is slightly too long."
        ]
        
        if line_count < 5:
            feedback_weaknesses.append("Solution seems too brief, check for completeness.")
        
        return {
            "ai_score": total_ai_score,
            "breakdown": {
                "accuracy": accuracy_score,
                "quality": quality_score,
                "creativity": creativity_score
            },
            "feedback": {
                "strengths": random.sample(feedback_strengths, 2),
                "weaknesses": random.sample(feedback_weaknesses, 1),
                "summary": "Solid attempt! Your logic holds up well, but a few refinements could make it production-ready."
            }
        }

    @staticmethod
    def calculate_final_match_score(
        ai_score: int, 
        vote_score: int, 
        time_taken_seconds: int, 
        max_time_seconds: int
    ) -> int:
        """
        Formula: (AI * 0.6) + (Vote * 0.3) + (Speed * 0.1)
        """
        # Speed Bonus: Scale 0-100 based on how fast they were
        time_ratio = 1 - (time_taken_seconds / max_time_seconds)
        speed_score = max(0, int(time_ratio * 100))
        
        final = (ai_score * 0.6) + (vote_score * 0.3) + (speed_score * 0.1)
        return int(final)
