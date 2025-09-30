import AvatarDisplay from './AvatarDisplay';
import { getUserAvatar, getUserFullName } from '../../utils/userUtils';

const UserAvatar = ({ 
  user, 
  size = 'md', 
  className = '',
  showName = false,
  ...props 
}) => {
  const avatarUrl = getUserAvatar(user);
  const userName = getUserFullName(user);

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <AvatarDisplay 
        avatarUrl={avatarUrl}
        size={size}
        alt={`${userName} avatar`}
        {...props}
      />
      {showName && (
        <span className="text-sm font-medium text-gray-700">
          {userName}
        </span>
      )}
    </div>
  );
};

export default UserAvatar;