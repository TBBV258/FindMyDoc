import { useState } from 'react';
import { useLanguage } from '@/lib/language';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface LanguageSwitcherProps {
  variant?: 'button' | 'dropdown';
  className?: string;
}

export function LanguageSwitcher({ 
  variant = 'button',
  className
}: LanguageSwitcherProps) {
  const { language, setLanguage, t } = useLanguage();
  const [open, setOpen] = useState(false);
  
  const handleLanguageChange = (lang: 'en' | 'pt') => {
    setLanguage(lang);
    setOpen(false);
  };

  if (variant === 'dropdown') {
    return (
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon"
            className={cn("rounded-full", className)}
          >
            <Globe className="h-5 w-5" />
            <span className="sr-only">{t('common.switchLanguage')}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem 
            onClick={() => handleLanguageChange('en')}
            className={language === 'en' ? 'bg-primary/10 font-medium' : ''}
          >
            <span className="mr-2">{language === 'en' && '✓'}</span>
            {t('common.english')}
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleLanguageChange('pt')}
            className={language === 'pt' ? 'bg-primary/10 font-medium' : ''}
          >
            <span className="mr-2">{language === 'pt' && '✓'}</span>
            {t('common.portuguese')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Button variant
  return (
    <div className={cn("flex space-x-2", className)}>
      <Button
        variant={language === 'en' ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleLanguageChange('en')}
        className={cn("text-sm flex gap-1 items-center", 
          language === 'en' && "bg-primary text-white"
        )}
      >
        <span>EN</span>
      </Button>
      <Button
        variant={language === 'pt' ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleLanguageChange('pt')}
        className={cn("text-sm flex gap-1 items-center", 
          language === 'pt' && "bg-primary text-white"
        )}
      >
        <span>PT</span>
      </Button>
    </div>
  );
}