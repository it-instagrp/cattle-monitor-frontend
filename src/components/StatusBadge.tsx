import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: 'Normal' | 'Warning' | 'Critical';
  className?: string;
}

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const variants = {
    Normal: "bg-status-normal text-white border-status-normal",
    Warning: "bg-status-warning text-foreground border-status-warning",
    Critical: "bg-status-critical text-white border-status-critical"
  };

  return (
    <Badge 
      className={cn(variants[status], className)}
      variant="outline"
    >
      {status}
    </Badge>
  );
};