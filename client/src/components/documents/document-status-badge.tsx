import { cn } from "@/lib/utils";

type DocumentStatus = 'active' | 'lost' | 'found';

interface DocumentStatusBadgeProps {
  status: DocumentStatus;
  className?: string;
}

export function DocumentStatusBadge({ status, className }: DocumentStatusBadgeProps) {
  const baseClasses = "text-xs px-2 py-1 rounded";
  
  const statusClasses = {
    active: "bg-green-100 text-green-800",
    lost: "bg-red-100 text-red-800",
    found: "bg-blue-100 text-blue-800",
  };
  
  const statusLabels = {
    active: "Active",
    lost: "Lost",
    found: "Found",
  };

  return (
    <div className={cn(baseClasses, statusClasses[status], className)}>
      {statusLabels[status]}
    </div>
  );
}
