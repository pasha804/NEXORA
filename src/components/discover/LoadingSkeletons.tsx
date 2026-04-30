import { Skeleton } from "@/components/ui/skeleton";

// Card Skeleton for Discovery Pages
export const CardSkeleton = () => (
    <div className="glass-card p-5 space-y-4">
        <div className="flex items-start gap-3">
            <Skeleton className="w-12 h-12 rounded-lg" />
            <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
            </div>
        </div>
        <Skeleton className="h-20 w-full" />
        <div className="flex gap-2">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-16" />
        </div>
    </div>
);

// Compact Card Skeleton
export const CompactCardSkeleton = () => (
    <div className="glass-card p-4 space-y-3">
        <div className="flex items-center gap-2">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="flex-1 space-y-1">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-2 w-16" />
            </div>
        </div>
        <Skeleton className="h-12 w-full" />
    </div>
);

// Grid Skeleton Loader
export const GridSkeleton = ({ count = 6, columns = 3 }: { count?: number; columns?: number }) => (
    <div className={`grid sm:grid-cols-2 lg:grid-cols-${columns} gap-4`}>
        {Array.from({ length: count }).map((_, i) => (
            <CardSkeleton key={i} />
        ))}
    </div>
);

// List Skeleton Loader
export const ListSkeleton = ({ count = 4 }: { count?: number }) => (
    <div className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
            <CardSkeleton key={i} />
        ))}
    </div>
);
