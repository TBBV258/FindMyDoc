import { ReactNode } from "react";
import { Button } from "./button";
import { HintBox } from "./hint-box";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  hintTitle?: string;
  hintText?: string;
  hintKey?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  hintTitle,
  hintText,
  hintKey
}: EmptyStateProps) {
  return (
    <div className="text-center py-8 card-minimalist">
      <div className="bg-muted p-4 rounded-full inline-flex items-center justify-center mb-3">
        {icon}
      </div>
      
      <h3 className="font-medium mb-2">{title}</h3>
      
      {description && (
        <p className="text-sm text-muted-foreground mb-4">
          {description}
        </p>
      )}
      
      {actionLabel && onAction && (
        <Button 
          onClick={onAction}
          variant="default" 
          className="bg-primary hover:bg-primary/90 mt-2"
        >
          {actionLabel}
        </Button>
      )}
      
      {hintText && hintKey && (
        <div className="mt-4">
          <HintBox 
            title={hintTitle} 
            hintKey={hintKey}
          >
            {hintText}
          </HintBox>
        </div>
      )}
    </div>
  );
}