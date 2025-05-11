import { ReactNode, useState, useEffect } from "react";
import { HelpCircle, X, ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface HintBoxProps {
  children: ReactNode;
  title?: string;
  hintKey: string; // Used to save the state in localStorage
  className?: string;
  variant?: 'default' | 'warning' | 'info' | 'success';
}

export function HintBox({ 
  children, 
  title = "Hint",
  hintKey,
  className,
  variant = 'default'
}: HintBoxProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isExpanded, setIsExpanded] = useState(true);
  
  useEffect(() => {
    // Check if the user has previously dismissed this hint
    const dismissedHint = localStorage.getItem(`hint-dismissed-${hintKey}`);
    if (dismissedHint) {
      setIsVisible(false);
    }
  }, [hintKey]);

  const handleDismiss = () => {
    setIsVisible(false);
    // Save the user's preference
    localStorage.setItem(`hint-dismissed-${hintKey}`, 'true');
  };

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  if (!isVisible) return null;

  return (
    <div 
      className={cn(
        "rounded-lg p-3 shadow-sm mb-4 text-sm relative border",
        {
          "bg-primary/10 border-primary/20": variant === 'default',
          "bg-warning/10 border-warning/20": variant === 'warning',
          "bg-info/10 border-info/20": variant === 'info',
          "bg-success/10 border-success/20": variant === 'success',
        },
        className
      )}
    >
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-primary" />
          <h4 className="font-medium text-sm">{title}</h4>
        </div>
        
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={handleToggle}
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={handleDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {isExpanded && (
        <div className="text-sm leading-relaxed">
          {children}
        </div>
      )}
    </div>
  );
}