import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Settings, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Header() {
  const { profile, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  const displayName = profile?.display_name || profile?.first_name || 'User';

  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-medium mr-8">Welcome, {displayName}!</h2>
      </div>
      
      <div className="flex items-center gap-2">
        <Link to="/settings">
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </Link>
        <Button variant="outline" size="sm" onClick={handleSignOut}>
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
}