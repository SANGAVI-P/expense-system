import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { Skeleton } from '@/components/ui/skeleton';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const publicPaths = ['/login', '/404'];
  const isPublicPath = publicPaths.includes(location.pathname);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      setSession(currentSession);
      setLoading(false);

      if (event === 'SIGNED_IN' && currentSession) {
        // Redirect authenticated users away from /login
        if (location.pathname === '/login') {
          navigate('/', { replace: true });
        }
      } else if (event === 'SIGNED_OUT') {
        // Redirect unauthenticated users to /login, unless they are already on a public path
        if (!isPublicPath) {
          navigate('/login', { replace: true });
        }
      }
    });

    // Initial session check
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      setLoading(false);
      
      if (!initialSession && !isPublicPath) {
        navigate('/login', { replace: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [location.pathname, navigate, isPublicPath]);

  if (loading) {
    // Show a full-screen loading state while checking session
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="space-y-4 w-full max-w-md">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  // If user is not logged in and trying to access a protected route, AuthGuard handles the redirect.
  // If user is logged in, or if it's a public path, render children.
  return <>{children}</>;
};