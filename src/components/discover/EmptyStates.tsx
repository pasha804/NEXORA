import { motion } from "framer-motion";
import { Search, Inbox, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description: string;
    action?: {
        label: string;
        onClick: () => void;
    };
}

export const EmptyState = ({
    icon = <Search className="w-16 h-16 text-muted-foreground/50" />,
    title,
    description,
    action
}: EmptyStateProps) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-12 text-center space-y-4"
    >
        <div className="flex justify-center opacity-50">
            {icon}
        </div>
        <div>
            <h3 className="font-bold text-lg mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">{description}</p>
        </div>
        {action && (
            <Button onClick={action.onClick} variant="default">
                {action.label}
            </Button>
        )}
    </motion.div>
);

// No Results State
export const NoResultsState = ({ onClearFilters }: { onClearFilters: () => void }) => (
    <EmptyState
        icon={<Inbox className="w-16 h-16 text-muted-foreground/50" />}
        title="No Results Found"
        description="Try adjusting your search or filters to find what you're looking for."
        action={{
            label: "Clear Filters",
            onClick: onClearFilters
        }}
    />
);

// No Content State
export const NoContentState = ({ category }: { category: string }) => (
    <EmptyState
        icon={<TrendingUp className="w-16 h-16 text-muted-foreground/50" />}
        title={`No ${category} Yet`}
        description={`Check back later for new ${category.toLowerCase()} content.`}
    />
);
