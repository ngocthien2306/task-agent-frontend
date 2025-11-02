import { useState, useRef } from 'react';
import AvatarDisplay from '../../Common/AvatarDisplay';
import { ValidatedInput } from '../../Common/ValidatedInput';
import { validateName, validatePhone, validateDate } from '../../../utils/validation';

const PersonalInfoStepEnhanced = ({ data, onChange }) => {
  const [formData, setFormData] = useState({
    // Basic profile info
    first_name: data.first_name || '',
    last_name: data.last_name || '',
    phone: data.phone || '',
    date_of_birth: data.date_of_birth || '',
    avatar_url: data.avatar_url || '',
    // Professional info
    occupation: data.occupation || '',
    company: data.company || '',
    industry: data.industry || '',
    position_level: data.position_level || '',
    work_location: data.work_location || ''
  });

  const [avatarPreview, setAvatarPreview] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);

  const industries = [
    { value: 'Công nghệ thông tin', icon: '💻' },
    { value: 'Marketing & Quảng cáo', icon: '📢' }, 
    { value: 'Tài chính & Ngân hàng', icon: '💰' },
    { value: 'Y tế & Sức khỏe', icon: '🏥' },
    { value: 'Giáo dục', icon: '📚' },
    { value: 'Bán lẻ & Thương mại', icon: '🛒' },
    { value: 'Sản xuất', icon: '🏭' },
    { value: 'Tư vấn', icon: '💼' },
    { value: 'Bất động sản', icon: '🏠' },
    { value: 'Du lịch & Khách sạn', icon: '✈️' },
    { value: 'Truyền thông & Giải trí', icon: '🎬' },
    { value: 'Phi lợi nhuận', icon: '❤️' },
    { value: 'Chính phủ', icon: '🏛️' },
    { value: 'Khác', icon: '🔧' }
  ];

  const positionLevels = [
    { value: 'Thực tập sinh', icon: '🌱' },
    { value: 'Nhân viên', icon: '👤' },
    { value: 'Chuyên viên', icon: '⭐' }, 
    { value: 'Trưởng nhóm', icon: '👥' },
    { value: 'Quản lý', icon: '📋' },
    { value: 'Giám đốc', icon: '🎯' },
    { value: 'C-level (CEO, CTO, etc.)', icon: '👑' },
    { value: 'Freelancer', icon: '🚀' },
    { value: 'Chủ doanh nghiệp', icon: '💎' }
  ];

  const workLocations = [
    { value: 'Văn phòng', icon: '🏢' },
    { value: 'Làm việc từ xa', icon: '🏡' },
    { value: 'Hybrid (kết hợp)', icon: '🔄' },
    { value: 'Di động (thường xuyên đi công tác)', icon: '🧳' },
    { value: 'Khác', icon: '📍' }
  ];

  const handleInputChange = (field, value) => {
    const updated = {
      ...formData,
      [field]: value
    };
    setFormData(updated);
    onChange(updated);
  };

  // Handle validated input changes
  const handleValidatedInputChange = (e) => {
    const { name, value } = e.target;
    handleInputChange(name, value);
  };

  // Handle validation results (optional - for future use)
  const handleValidation = (fieldName, result) => {
    // Could store validation results here if needed
    console.log(`Validation for ${fieldName}:`, result);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file ảnh hợp lệ');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      alert('File ảnh phải nhỏ hơn 5MB');
      return;
    }

    setUploadingAvatar(true);

    try {
      // Upload file to server
      const formData = new FormData();
      formData.append('file', file);

      const pythonApiUrl = "https://task-agent-api.ngrok.dev";
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${pythonApiUrl}/api/v1/upload/avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload avatar');
      }

      const result = await response.json();
      
      // Server now returns full URL, store and use for preview
      const fullAvatarUrl = result.avatar_url;
      handleInputChange('avatar_url', fullAvatarUrl);
      setAvatarPreview(fullAvatarUrl); // Use full URL for immediate preview
      setUploadingAvatar(false);
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Lỗi tải ảnh lên server. Vui lòng thử lại.');
      setUploadingAvatar(false);
    }
  };

  const removeAvatar = () => {
    setAvatarPreview('');
    handleInputChange('avatar_url', '');
  };

  return (
    <div className="space-y-8">
      {/* Avatar Upload Section */}
      <div className="text-center">
        <div className="relative inline-block">
          <div 
            onClick={handleAvatarClick}
            className="relative w-32 h-32 rounded-full border-4 border-gray-200 hover:border-blue-400 cursor-pointer transition-all duration-200 overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center group"
          >
            <AvatarDisplay 
              avatarUrl={avatarPreview || formData.avatar_url}
              size="2xl"
              className="w-full h-full absolute inset-0"
              fallback={
                <div className="text-center">
                  <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <p className="text-xs text-gray-500">Click để tải ảnh</p>
                </div>
              }
            />
            
            {/* Upload overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
              <svg className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>

            {/* Loading spinner */}
            {uploadingAvatar && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            )}
          </div>
          
          {/* Remove button */}
          {avatarPreview && !uploadingAvatar && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeAvatar();
              }}
              className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleAvatarChange}
          className="hidden"
        />
        
        <p className="text-sm text-gray-600 mt-3">
          Ảnh đại diện sẽ giúp AI nhận diện bạn tốt hơn
        </p>
      </div>

      {/* Personal Information */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6">
        <div className="flex items-center mb-4">
          <div className="bg-blue-500 rounded-full p-2 mr-3">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Thông tin cá nhân</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* First Name */}
          <div>
            <ValidatedInput
              type="text"
              name="first_name"
              label={
                <span className="flex items-center">
                  <span className="text-lg mr-2">👤</span>
                  Họ
                </span>
              }
              value={formData.first_name}
              onChange={handleValidatedInputChange}
              validation={(value) => validateName(value, 'Họ', false)}
              onValidation={handleValidation}
              placeholder="Nguyễn"
              className="p-3 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Last Name */}
          <div>
            <ValidatedInput
              type="text"
              name="last_name"
              label={
                <span className="flex items-center">
                  <span className="text-lg mr-2">✨</span>
                  Tên
                </span>
              }
              value={formData.last_name}
              onChange={handleValidatedInputChange}
              validation={(value) => validateName(value, 'Tên', false)}
              onValidation={handleValidation}
              placeholder="Văn A"
              className="p-3 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Phone */}
          <div>
            <ValidatedInput
              type="tel"
              name="phone"
              label={
                <span className="flex items-center">
                  <span className="text-lg mr-2">📱</span>
                  Số điện thoại
                </span>
              }
              value={formData.phone}
              onChange={handleValidatedInputChange}
              validation={(value) => validatePhone(value, false)}
              onValidation={handleValidation}
              placeholder="+84 xxx xxx xxx"
              className="p-3 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Date of Birth */}
          <div>
            <ValidatedInput
              type="date"
              name="date_of_birth"
              label={
                <span className="flex items-center">
                  <span className="text-lg mr-2">🎂</span>
                  Ngày sinh
                </span>
              }
              value={formData.date_of_birth}
              onChange={handleValidatedInputChange}
              validation={(value) => validateDate(value, 'Ngày sinh', false)}
              onValidation={handleValidation}
              className="p-3 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Professional Information */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6">
        <div className="flex items-center mb-4">
          <div className="bg-emerald-500 rounded-full p-2 mr-3">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Thông tin nghề nghiệp</h3>
        </div>

        <div className="space-y-4">
          {/* Occupation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <span className="text-lg mr-2">💼</span>
              Nghề nghiệp <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              value={formData.occupation}
              onChange={(e) => handleInputChange('occupation', e.target.value)}
              placeholder="Ví dụ: Software Developer, Marketing Manager..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              required
            />
          </div>

          {/* Company */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <span className="text-lg mr-2">🏢</span>
              Công ty hiện tại
            </label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => handleInputChange('company', e.target.value)}
              placeholder="Tên công ty (có thể để trống)"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Industry */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <span className="text-lg mr-2">🎯</span>
                Lĩnh vực <span className="text-red-500 ml-1">*</span>
              </label>
              <select
                value={formData.industry}
                onChange={(e) => handleInputChange('industry', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                required
              >
                <option value="">Chọn lĩnh vực</option>
                {industries.map(industry => (
                  <option key={industry.value} value={industry.value}>
                    {industry.icon} {industry.value}
                  </option>
                ))}
              </select>
            </div>

            {/* Position Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <span className="text-lg mr-2">📊</span>
                Cấp độ <span className="text-red-500 ml-1">*</span>
              </label>
              <select
                value={formData.position_level}
                onChange={(e) => handleInputChange('position_level', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                required
              >
                <option value="">Chọn cấp độ</option>
                {positionLevels.map(level => (
                  <option key={level.value} value={level.value}>
                    {level.icon} {level.value}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Work Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <span className="text-lg mr-2">📍</span>
              Hình thức làm việc <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {workLocations.map(location => (
                <label
                  key={location.value}
                  className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all hover:border-emerald-400 ${
                    formData.work_location === location.value
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="work_location"
                    value={location.value}
                    checked={formData.work_location === location.value}
                    onChange={(e) => handleInputChange('work_location', e.target.value)}
                    className="sr-only"
                  />
                  <span className="text-lg mr-2">{location.icon}</span>
                  <span className="text-sm font-medium">{location.value}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Help Information */}
      <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-2xl p-6">
        <div className="flex items-start">
          <div className="bg-orange-500 rounded-full p-2 mr-3 mt-1">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-orange-800 mb-2">💡 AI sẽ sử dụng thông tin này để:</h4>
            <ul className="text-sm text-orange-700 space-y-1">
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Đề xuất tasks phù hợp với vai trò và kinh nghiệm của bạn
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Tạo schedule tối ưu theo môi trường làm việc
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Sử dụng ngôn ngữ và thuật ngữ chuyên ngành phù hợp
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Cá nhân hóa trải nghiệm dựa trên profile của bạn
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export { PersonalInfoStepEnhanced };