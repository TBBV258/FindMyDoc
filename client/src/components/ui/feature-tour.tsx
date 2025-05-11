import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/language';
import { 
  Shield, 
  FileText, 
  Search, 
  UserRound, 
  BellRing, 
  MapPin, 
  MessageCircle,
  Award,
  HelpCircle,
  X,
  ChevronRight
} from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface Step {
  icon: React.ReactNode;
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  element?: string; // CSS selector for element to highlight
}

export function FeatureTour() {
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);

  const steps: Step[] = [
    {
      icon: <FileText className="h-5 w-5" />,
      title: t('tour.documentsTitle'),
      description: t('tour.documentsDescription'),
      position: 'bottom',
      element: '[data-tour="documents"]',
    },
    {
      icon: <Search className="h-5 w-5" />,
      title: t('tour.searchTitle'),
      description: t('tour.searchDescription'),
      position: 'bottom',
      element: '[data-tour="search"]',
    },
    {
      icon: <MapPin className="h-5 w-5" />,
      title: t('tour.reportTitle'),
      description: t('tour.reportDescription'),
      position: 'bottom',
      element: '[data-tour="report"]',
    },
    {
      icon: <MessageCircle className="h-5 w-5" />,
      title: t('tour.messagesTitle'),
      description: t('tour.messagesDescription'),
      position: 'bottom',
      element: '[data-tour="messages"]',
    },
    {
      icon: <Award className="h-5 w-5" />,
      title: t('tour.pointsTitle'),
      description: t('tour.pointsDescription'),
      position: 'bottom',
      element: '[data-tour="points"]',
    },
  ];

  useEffect(() => {
    // Check if this is the first visit
    const hasSeenTour = localStorage.getItem('has-seen-feature-tour');
    if (!hasSeenTour && !isDismissed) {
      // Wait a bit to show the tour after the page loads
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [isDismissed]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleDismiss();
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem('has-seen-feature-tour', 'true');
  };

  if (!isVisible) return null;

  const currentTourStep = steps[currentStep];
  
  // Find the element to highlight
  let tooltipStyle = {};
  let arrowStyle = {};
  
  if (currentTourStep.element) {
    const element = document.querySelector(currentTourStep.element);
    if (element) {
      const rect = element.getBoundingClientRect();
      
      switch (currentTourStep.position) {
        case 'bottom':
          tooltipStyle = {
            position: 'absolute',
            top: `${rect.bottom + 10}px`,
            left: `${rect.left + rect.width / 2 - 150}px`,
          };
          arrowStyle = {
            position: 'absolute',
            top: '-8px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '0',
            height: '0',
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderBottom: '8px solid white',
          };
          break;
          
        case 'top':
          tooltipStyle = {
            position: 'absolute',
            bottom: `${window.innerHeight - rect.top + 10}px`,
            left: `${rect.left + rect.width / 2 - 150}px`,
          };
          arrowStyle = {
            position: 'absolute',
            bottom: '-8px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '0',
            height: '0',
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderTop: '8px solid white',
          };
          break;
          
        // Add more positions as needed
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div 
        className="bg-white rounded-lg shadow-lg p-5 w-[300px] relative"
        style={tooltipStyle}
      >
        <div style={arrowStyle}></div>
        
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2"
          onClick={handleDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center space-x-3 mb-3">
          <div className="bg-primary/10 p-2 rounded-full">
            {currentTourStep.icon}
          </div>
          <h3 className="font-medium">{currentTourStep.title}</h3>
        </div>
        
        <p className="text-sm text-muted-foreground mb-4">
          {currentTourStep.description}
        </p>
        
        <div className="flex justify-between items-center">
          <div className="flex space-x-1">
            {steps.map((_, index) => (
              <div 
                key={index} 
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  index === currentStep ? "bg-primary" : "bg-muted"
                )}
              ></div>
            ))}
          </div>
          
          <Button size="sm" onClick={handleNext}>
            {currentStep < steps.length - 1 ? (
              <>
                {t('tour.next')}
                <ChevronRight className="h-4 w-4 ml-1" />
              </>
            ) : (
              t('tour.finish')
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}