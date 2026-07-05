import { useEffect } from "react";
import { CommunityLayout } from "@/components/communities/CommunityLayout";
import { CommunityFeed } from "@/components/communities/CommunityFeed";
import { useCommunityStore } from "@/hooks/useCommunityStore";

const Communities = () => {
    const fetchJoined = useCommunityStore((s) => s.fetchJoined);
    const fetchDiscover = useCommunityStore((s) => s.fetchDiscover);

    useEffect(() => {
        fetchJoined();
        fetchDiscover();
    }, []);

    return (
        <CommunityLayout>
            <CommunityFeed />
        </CommunityLayout>
    );
};

export default Communities;
