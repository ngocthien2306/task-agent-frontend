import { useState } from 'react';

const PersonalInfoStep = ({ data, onChange }) => {
  const [formData, setFormData] = useState({
    occupation: data.occupation || '',
    company: data.company || '',
    industry: data.industry || '',
    position_level: data.position_level || '',
    work_location: data.work_location || ''
  });

  const industries = [
    'Công nghệ thông tin',
    'Marketing & Quảng cáo', 
    'Tài chính & Ngân hàng',
    'Y tế & Sức khỏe',
    'Giáo dục',
    'Bán lẻ & Thương mại',
    'Sản xuất',
    'Tư vấn',
    'Bất động sản',
    'Du lịch & Khách sạn',
    'Truyền thông & Giải trí',
    'Phi lợi nhuận',
    'Chính phủ',
    'Khác'
  ];

  const positionLevels = [
    'Thực tập sinh',
    'Nhân viên',
    'Chuyên viên', 
    'Trưởng nhóm',
    'Quản lý',
    'Giám đốc',
    'C-level (CEO, CTO, etc.)',
    'Freelancer',
    'Chủ doanh nghiệp'
  ];

  const workLocations = [
    'Văn phòng',
    'Làm việc từ xa',
    'Hybrid (kết hợp)',
    'Di động (thường xuyên đi công tác)',
    'Khác'
  ];

  const handleInputChange = (field, value) => {
    const updated = {
      ...formData,
      [field]: value
    };
    setFormData(updated);
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      {/* Occupation */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nghề nghiệp của bạn <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.occupation}
          onChange={(e) => handleInputChange('occupation', e.target.value)}
          placeholder="Ví dụ: Software Developer, Marketing Manager..."
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>

      {/* Company */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Công ty hiện tại
        </label>
        <input
          type="text"
          value={formData.company}
          onChange={(e) => handleInputChange('company', e.target.value)}
          placeholder="Tên công ty (có thể để trống)"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Industry */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Lĩnh vực làm việc <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.industry}
          onChange={(e) => handleInputChange('industry', e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        >
          <option value="">Chọn lĩnh vực của bạn</option>
          {industries.map(industry => (
            <option key={industry} value={industry}>
              {industry}
            </option>
          ))}
        </select>
      </div>

      {/* Position Level */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Cấp độ vị trí <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.position_level}
          onChange={(e) => handleInputChange('position_level', e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        >
          <option value="">Chọn cấp độ của bạn</option>
          {positionLevels.map(level => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
      </div>

      {/* Work Location */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Hình thức làm việc <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.work_location}
          onChange={(e) => handleInputChange('work_location', e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        >
          <option value="">Chọn hình thức làm việc</option>
          {workLocations.map(location => (
            <option key={location} value={location}>
              {location}
            </option>
          ))}
        </select>
      </div>

      {/* Help Text */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex">
          <svg className="w-5 h-5 text-blue-500 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div>
            <h4 className="text-sm font-medium text-blue-800">Tại sao chúng tôi cần thông tin này?</h4>
            <p className="text-sm text-blue-700 mt-1">
              AI sẽ sử dụng thông tin này để:
            </p>
            <ul className="text-sm text-blue-700 mt-1 list-disc list-inside ml-4">
              <li>Đề xuất tasks phù hợp với vai trò của bạn</li>
              <li>Tạo schedule theo môi trường làm việc</li>
              <li>Sử dụng ngôn ngữ chuyên ngành phù hợp</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export { PersonalInfoStep };