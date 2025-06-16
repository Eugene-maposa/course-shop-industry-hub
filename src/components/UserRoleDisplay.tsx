
import { User } from '@supabase/supabase-js';
import { Badge } from '@/components/ui/badge';
import { Shield, User as UserIcon } from 'lucide-react';
import { useUserRoles } from '@/hooks/useUserRoles';

interface UserRoleDisplayProps {
  user: User;
  className?: string;
}

const UserRoleDisplay = ({ user, className = '' }: UserRoleDisplayProps) => {
  const { userRoles, loading, isAdmin } = useUserRoles(user);

  if (loading) {
    return <div className={`text-sm text-gray-500 ${className}`}>Loading roles...</div>;
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {isAdmin ? (
        <Badge variant="destructive" className="flex items-center space-x-1">
          <Shield className="w-3 h-3" />
          <span>Admin</span>
        </Badge>
      ) : (
        <Badge variant="secondary" className="flex items-center space-x-1">
          <UserIcon className="w-3 h-3" />
          <span>User</span>
        </Badge>
      )}
    </div>
  );
};

export default UserRoleDisplay;
