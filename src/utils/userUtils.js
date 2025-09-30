// Utility functions for user data handling

export const getUserFullName = (user) => {
  if (!user) return '';
  
  const firstName = user.profile?.first_name || user.first_name || '';
  const lastName = user.profile?.last_name || user.last_name || '';
  
  const fullName = `${firstName} ${lastName}`.trim();
  return fullName || user.username || user.email || 'User';
};

export const getUserAvatar = (user) => {
  if (!user) return null;
  return user.profile?.avatar_url || user.avatar_url || null;
};

export const getUserPhone = (user) => {
  if (!user) return '';
  return user.profile?.phone || user.phone || '';
};

export const getUserDateOfBirth = (user) => {
  if (!user) return '';
  return user.profile?.date_of_birth || user.date_of_birth || '';
};

export const formatUserDisplayName = (user) => {
  const fullName = getUserFullName(user);
  if (fullName && fullName !== user?.username) {
    return fullName;
  }
  return user?.username || 'User';
};