import { cn } from "@/lib/utils";

interface DocumentIconProps {
  type: string;
  className?: string;
  warning?: boolean;
  accent?: boolean;
}

export function DocumentIcon({ type, className, warning = false, accent = false }: DocumentIconProps) {
  const getIconClass = () => {
    switch (type) {
      case 'id_card':
        return 'ri-id-card-line';
      case 'drivers_license':
        return 'ri-car-line';
      case 'passport':
        return 'ri-passport-line';
      case 'bank_card':
        return 'ri-bank-card-line';
      default:
        return 'ri-file-list-line';
    }
  };
  
  const getBgClass = () => {
    if (warning) return 'bg-warning/10';
    if (accent) return 'bg-accent/10';
    return 'bg-primary/10';
  };
  
  const getTextClass = () => {
    if (warning) return 'text-warning';
    if (accent) return 'text-accent';
    return 'text-primary';
  };

  return (
    <div className={cn(getBgClass(), "p-2 rounded-full", className)}>
      <i className={cn(getIconClass(), getTextClass(), "text-xl")}></i>
    </div>
  );
}
