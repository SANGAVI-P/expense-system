import React from 'react';
import { ThemeToggle } from './ThemeToggle';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';

const navItems = [
  { name: 'Transactions', href: '/' },
  { name: 'Recurring', href: '/recurring' },
  { name: 'Budgets', href: '/budgets' },
  { name: 'Dashboard', href: '/dashboard' },
];

const Header = () => {
  const location = useLocation();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Logout error:", error);
      showError("Failed to log out.");
    }
  };

  return (
    <header className="bg-card border-b border-border bg-gradient-to-r from-background/50 to-background/100 sticky top-0 z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-primary mr-8">
              <Link to="/">ExpenseBox</Link>
            </h1>
            <nav className="hidden md:flex space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    location.pathname === item.href
                      ? "text-primary border-b-2 border-primary pb-1"
                      : "text-muted-foreground"
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
              <LogOut className="h-[1.2rem] w-[1.2rem]" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;