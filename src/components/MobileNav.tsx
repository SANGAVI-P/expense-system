import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';

const navItems = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Transactions', href: '/' },
  { name: 'Budgets', href: '/budgets' },
  { name: 'Recurring', href: '/recurring' },
];

export function MobileNav() {
  const location = useLocation();
  const [open, setOpen] = React.useState(false);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Logout error:", error);
      showError("Failed to log out.");
    }
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[250px] sm:w-[300px]">
        <SheetHeader>
          <SheetTitle className="text-2xl font-bold text-primary">ExpenseBox</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col space-y-2 mt-6">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center p-3 rounded-lg text-base font-medium transition-colors",
                location.pathname === item.href
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "text-foreground hover:bg-muted"
              )}
            >
              {item.name}
            </Link>
          ))}
           <Link
              to="/profile"
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center p-3 rounded-lg text-base font-medium transition-colors",
                location.pathname === "/profile"
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "text-foreground hover:bg-muted"
              )}
            >
              <User className="mr-2 h-4 w-4" />
              Profile
            </Link>
        </nav>
        <div className="absolute bottom-4 left-4 right-4">
          <Button variant="outline" className="w-full justify-start" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}