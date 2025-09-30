import { useState } from 'react';

const AvatarDisplay = ({ 
  avatarUrl, 
  size = 'md', 
  className = '',
  alt = 'Avatar',
  fallback = null 
}) => {
  const [imageError, setImageError] = useState(false);
  
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12', 
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
    '2xl': 'w-32 h-32'
  };

  const getImageUrl = (url) => {
    if (!url) return null;
    
    // If it's already a full URL (http/https), use as is - this covers server URLs
    if (url.startsWith('http')) {
      return url;
    }
    
    // If it's base64 data URL, use as is
    if (url.startsWith('data:')) {
      return url;
    }
    
    // Legacy support: if it's a relative path or filename, construct full URL
    const pythonApiUrl = import.meta.env.VITE_PYTHON_API_URL || "http://localhost:8000";
    
    if (url.startsWith('/api/')) {
      return `${pythonApiUrl}${url}`;
    }
    
    // Default: assume it's a filename
    return `${pythonApiUrl}/api/v1/upload/avatar/${url}`;
  };

  const imageUrl = getImageUrl(avatarUrl);

  const handleImageError = () => {
    setImageError(true);
  };

  // If no avatar URL or image failed to load, show fallback
  if (!imageUrl || imageError) {
    return (
      <div className={`${sizeClasses[size]} ${className} rounded-full bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center border-2 border-gray-200`}>
        {fallback || (
          <svg className="w-1/2 h-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        )}
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      className={`${sizeClasses[size]} ${className} rounded-full object-cover border-2 border-gray-200`}
      onError={handleImageError}
    />
  );
};

export default AvatarDisplay;