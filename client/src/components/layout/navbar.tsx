import React from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import { useLanguage } from '@/lib/language';
import { LanguageSwitcher } from '@/components/language/language-switcher';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Icons
import { Home, LogOut, Menu, Search, User, Bell } from 'lucide-react';
import { getInitials } from '@/lib/utils';

export function Navbar() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = React.useState(false);
  const [location] = useLocation();

  const isActive = (path: string) => {
    return location === path;
  };

  const handleLogout = async () => {
    await logout();
  };

  const navLinks = [
    { name: 'home', path: '/home', icon: <Home className="h-5 w-5" /> },
    { name: 'documentLost', path: '/lost-feed', icon: <Search className="h-5 w-5" /> },
    { name: 'documentFound', path: '/found-feed', icon: <Bell className="h-5 w-5" /> },
  ];

  // Mobile menu toggle
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <header className="sticky top-0 z-10 bg-white border-b shadow-sm">
      <div className="container px-4 mx-auto flex items-center justify-between h-16">
        {/* Logo */}
        <Link href={user ? '/home' : '/'} className="flex items-center">
          <span className="text-xl font-bold text-primary">
            FindMyDocs
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-4">
          {user && (
            <>
              {navLinks.map((link) => (
                <Link key={link.path} href={link.path}>
                  <Button 
                    variant={isActive(link.path) ? 'default' : 'ghost'} 
                    className="flex items-center gap-2"
                  >
                    {link.icon}
                    <span>{t(`common.${link.name}`)}</span>
                  </Button>
                </Link>
              ))}
            </>
          )}
        </nav>

        {/* User menu & Language switcher */}
        <div className="flex items-center gap-2">
          <LanguageSwitcher variant="dropdown" className="mr-2" />
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.photoURL || ''} alt={user.username} />
                    <AvatarFallback>{getInitials(user.username)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user.username}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link href="/profile">
                  <DropdownMenuItem>
                    <User className="h-4 w-4 mr-2" />
                    <span>{t('common.profile')}</span>
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  <span>{t('common.logout')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex gap-2">
              <Link href="/login">
                <Button variant="ghost">{t('common.login')}</Button>
              </Link>
              <Link href="/register">
                <Button variant="default">{t('common.register')}</Button>
              </Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={toggleMenu}
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <nav className="md:hidden bg-white border-t p-4">
          <div className="flex flex-col space-y-2">
            {user && (
              <>
                {navLinks.map((link) => (
                  <Link key={link.path} href={link.path}>
                    <Button 
                      variant={isActive(link.path) ? 'default' : 'ghost'} 
                      className="w-full justify-start"
                    >
                      {link.icon}
                      <span className="ml-2">{t(`common.${link.name}`)}</span>
                    </Button>
                  </Link>
                ))}
                <Link href="/profile">
                  <Button variant="ghost" className="w-full justify-start">
                    <User className="h-5 w-5" />
                    <span className="ml-2">{t('common.profile')}</span>
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-red-500" 
                  onClick={handleLogout}
                >
                  <LogOut className="h-5 w-5" />
                  <span className="ml-2">{t('common.logout')}</span>
                </Button>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}