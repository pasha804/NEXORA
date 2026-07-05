import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CommunityLayout } from "@/components/communities/CommunityLayout";
import { CommunityFeed } from "@/components/communities/CommunityFeed";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const CommunityDetail = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const [community, setCommunity] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!slug) return;
        const fetchCommunity = async () => {
            setLoading(true);
            try {
                const resp = await fetch(`${API_URL}/communities/${slug}`);
                if (resp.ok) {
                    setCommunity(await resp.json());
                }
            } catch (err) {
                console.error("Failed to fetch community:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchCommunity();
    }, [slug]);

    if (loading) {
        return (
            <CommunityLayout>
                <div className="flex-1 flex items-center justify-center bg-zinc-950/50">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            </CommunityLayout>
        );
    }

    if (!community) {
        return (
            <CommunityLayout>
                <div className="flex-1 flex flex-col items-center justify-center gap-4 bg-zinc-950/50">
                    <p className="text-muted-foreground">Community not found</p>
                    <Button variant="outline" onClick={() => navigate("/communities")}>
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Communities
                    </Button>
                </div>
            </CommunityLayout>
        );
    }

    return (
        <CommunityLayout>
            <CommunityFeed community={community} />
        </CommunityLayout>
    );
};

export default CommunityDetail;
