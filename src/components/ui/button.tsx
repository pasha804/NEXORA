import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_hsl(var(--primary)/0.3)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.5)]",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-primary/30 bg-transparent text-primary hover:bg-primary/10 hover:border-primary/60",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-[0_0_20px_hsl(var(--secondary)/0.3)]",
        ghost: "hover:bg-muted hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        // Nexora custom variants
        hero: "relative overflow-hidden bg-gradient-to-r from-primary to-neon-purple text-primary-foreground font-semibold tracking-wide shadow-[0_0_30px_hsl(var(--primary)/0.4)] hover:shadow-[0_0_50px_hsl(var(--primary)/0.6)] hover:scale-105",
        neon: "border-2 border-secondary bg-secondary/10 text-secondary hover:bg-secondary/20 shadow-[0_0_20px_hsl(var(--secondary)/0.3)] hover:shadow-[0_0_40px_hsl(var(--secondary)/0.5)]",
        glass: "bg-card/50 backdrop-blur-xl border border-primary/20 text-foreground hover:bg-card/70 hover:border-primary/40",
        pvp: "bg-gradient-to-r from-neon-magenta to-neon-purple text-white font-bold tracking-wider shadow-[0_0_30px_hsl(var(--neon-magenta)/0.4)] hover:shadow-[0_0_50px_hsl(var(--neon-magenta)/0.6)] hover:scale-105",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-12 rounded-lg px-8 text-base",
        xl: "h-14 rounded-xl px-10 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
