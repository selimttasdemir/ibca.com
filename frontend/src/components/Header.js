import React from 'react';
import { useLanguage, languages } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { Globe, Sun, Moon, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

const Header = () => {
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme, currentTheme } = useTheme();
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { key: 'home', path: '/' },
    { key: 'cv', path: '/cv' },
    { key: 'courses', path: '/courses' },
    { key: 'publications', path: '/publications' },
    { key: 'gallery', path: '/gallery' },
    ...(user ? [{ key: 'admin', path: '/admin' }] : [])
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header 
      className="sticky top-0 z-50 shadow-lg transition-all duration-300"
      style={{ backgroundColor: currentTheme.primary }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Logo/Title */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="text-2xl font-serif" style={{ color: currentTheme.secondary }}>
              İbrahim Çayıroğlu
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.key}
                to={item.path}
                className="px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105"
                style={{
                  color: isActive(item.path) ? currentTheme.accent : currentTheme.secondary,
                  backgroundColor: isActive(item.path) ? 'rgba(255,255,255,0.1)' : 'transparent',
                  fontWeight: isActive(item.path) ? '600' : '400'
                }}
              >
                {t(`nav.${item.key}`)}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" style={{ color: currentTheme.secondary }}>
                  <Globe className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {languages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={language === lang.code ? 'bg-accent text-white' : ''}
                  >
                    <span className="mr-2">{lang.flag}</span>
                    {lang.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Toggle */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleTheme}
              style={{ color: currentTheme.secondary }}
            >
              {theme === 'classic' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            {/* Logout (if authenticated) */}
            {user && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={logout}
                style={{ color: currentTheme.secondary }}
              >
                <LogOut className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="md:hidden pb-3 flex overflow-x-auto space-x-2">
          {navItems.map((item) => (
            <Link
              key={item.key}
              to={item.path}
              className="px-3 py-1 rounded-lg whitespace-nowrap text-sm transition-all"
              style={{
                color: isActive(item.path) ? currentTheme.accent : currentTheme.secondary,
                backgroundColor: isActive(item.path) ? 'rgba(255,255,255,0.1)' : 'transparent',
                fontWeight: isActive(item.path) ? '600' : '400'
              }}
            >
              {t(`nav.${item.key}`)}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Header;