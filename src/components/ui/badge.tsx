import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide",
  {
    variants: {
      variant: {
        live: "bg-live/20 text-live",
        upcoming: "bg-upcoming/20 text-upcoming",
        final: "bg-gray-500/20 text-gray-500",
        unbet: "bg-unbet text-white",
        bet: "bg-bet text-white",
        next: "bg-[#D99739] text-[#91000A]",
        count: "bg-primary text-white text-[10px] px-2 py-0.5 rounded-full",
      },
    },
    defaultVariants: {
      variant: "upcoming",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

export function Badge({ className, variant, dot, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && (
        <span className={cn(
          "w-2 h-2 rounded-full animate-pulse",
          variant === 'live' && "bg-live"
        )} />
      )}
      {children}
    </span>
  );
}
