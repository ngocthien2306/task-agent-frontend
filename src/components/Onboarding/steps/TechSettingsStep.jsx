import { useState } from 'react';

const TechSettingsStep = ({ data, onChange }) => {
  const [formData, setFormData] = useState({
    timezone: data.timezone || 'Asia/Ho_Chi_Minh',
    language_preference: data.language_preference || 'vi',
    notification_preferences: data.notification_preferences || [],
    device_usage: data.device_usage || '',
    tech_level: data.tech_level || ''
  });

  const timezones = [
    'Asia/Ho_Chi_Minh',
    'Asia/Bangkok',
    'Asia/Singapore',
    'Asia/Tokyo',
    'America/New_York',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Australia/Sydney',
    'UTC'
  ];

  const languages = [
    { id: 'vi', title: 'Tiếng Việt', flag: '🇻🇳' },
    { id: 'en', title: 'English', flag: '🇺🇸' },
    { id: 'both', title: 'Cả hai (Vietnamese + English)', flag: '🌐' }
  ];

  const notificationTypes = [
    {
      id: 'task_reminders',
      title: 'Nhắc nhở tasks',
      description: 'Thông báo khi có deadline gần',
      icon: '⏰'
    },
    {
      id: 'daily_summary',
      title: 'Tổng kết hàng ngày',
      description: 'Báo cáo cuối ngày về tiến độ',
      icon: '📊'
    },
    {
      id: 'weekly_review',
      title: 'Review hàng tuần',
      description: 'Tổng kết và kế hoạch tuần mới',
      icon: '📅'
    },
    {
      id: 'motivational',
      title: 'Tin nhắn động viên',
      description: 'Lời khuyên và motivation',
      icon: '💪'
    },
    {
      id: 'break_reminders',
      title: 'Nhắc nghỉ ngơi',
      description: 'Nhắc bạn nghỉ ngơi khi làm việc lâu',
      icon: '☕'
    },
    {
      id: 'achievement',
      title: 'Thành tích',
      description: 'Chúc mừng khi hoàn thành mục tiêu',
      icon: '🎉'
    }
  ];

  const deviceUsages = [
    {
      id: 'desktop_primary',
      title: 'Chủ yếu Desktop/Laptop',
      description: 'Làm việc chính trên máy tính',
      icon: '💻'
    },
    {
      id: 'mobile_primary',
      title: 'Chủ yếu Mobile',
      description: 'Sử dụng điện thoại nhiều hơn',
      icon: '📱'
    },
    {
      id: 'balanced',
      title: 'Kết hợp cả hai',
      description: 'Sử dụng đều cả desktop và mobile',
      icon: '⚖️'
    },
    {
      id: 'tablet_included',
      title: 'Bao gồm Tablet',
      description: 'Có sử dụng thêm tablet',
      icon: '📲'
    }
  ];

  const techLevels = [
    {
      id: 'beginner',
      title: 'Người mới bắt đầu',
      description: 'Cần hướng dẫn chi tiết, UI đơn giản',
      icon: '🌱'
    },
    {
      id: 'intermediate',
      title: 'Trung cấp',
      description: 'Quen thuộc với các app cơ bản',
      icon: '📈'
    },
    {
      id: 'advanced',
      title: 'Nâng cao',
      description: 'Thích tùy chỉnh, shortcuts, automation',
      icon: '🚀'
    },
    {
      id: 'expert',
      title: 'Chuyên gia',
      description: 'Developer hoặc IT professional',
      icon: '👨‍💻'
    }
  ];

  const handleNotificationToggle = (notifId) => {
    const updated = formData.notification_preferences.includes(notifId)
      ? formData.notification_preferences.filter(id => id !== notifId)
      : [...formData.notification_preferences, notifId];
    
    setFormData(prev => ({ ...prev, notification_preferences: updated }));
    onChange({ ...formData, notification_preferences: updated });
  };

  const handleInputChange = (field, value) => {
    const updated = {
      ...formData,
      [field]: value
    };
    setFormData(updated);
    onChange(updated);
  };

  return (
    <div className="space-y-8">
      {/* Timezone */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Múi giờ của bạn <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.timezone}
          onChange={(e) => handleInputChange('timezone', e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        >
          {timezones.map(tz => (
            <option key={tz} value={tz}>
              {tz.replace('_', ' ')} {tz === 'Asia/Ho_Chi_Minh' && '(Việt Nam)'}
            </option>
          ))}
        </select>
      </div>

      {/* Language Preference */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Ngôn ngữ ưu tiên <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {languages.map(lang => (
            <div
              key={lang.id}
              onClick={() => handleInputChange('language_preference', lang.id)}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                formData.language_preference === lang.id
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="text-center">
                <span className="text-2xl block mb-2">{lang.flag}</span>
                <h3 className="font-medium text-gray-900">{lang.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notification Preferences */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Loại thông báo bạn muốn nhận <span className="text-gray-500">(chọn những gì bạn cần)</span>
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {notificationTypes.map(notif => (
            <div
              key={notif.id}
              onClick={() => handleNotificationToggle(notif.id)}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                formData.notification_preferences.includes(notif.id)
                  ? 'border-green-500 bg-green-50 ring-2 ring-green-200'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="flex items-start space-x-3">
                <span className="text-2xl">{notif.icon}</span>
                <div>
                  <h3 className="font-medium text-gray-900">{notif.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{notif.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Device Usage */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Thiết bị bạn thường sử dụng <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {deviceUsages.map(device => (
            <div
              key={device.id}
              onClick={() => handleInputChange('device_usage', device.id)}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                formData.device_usage === device.id
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="flex items-start space-x-3">
                <span className="text-2xl">{device.icon}</span>
                <div>
                  <h3 className="font-medium text-gray-900">{device.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{device.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tech Level */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Mức độ am hiểu công nghệ <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {techLevels.map(level => (
            <div
              key={level.id}
              onClick={() => handleInputChange('tech_level', level.id)}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                formData.tech_level === level.id
                  ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-200'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="flex items-start space-x-3">
                <span className="text-2xl">{level.icon}</span>
                <div>
                  <h3 className="font-medium text-gray-900">{level.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{level.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Help Text */}
      <div className="bg-cyan-50 p-4 rounded-lg">
        <div className="flex">
          <svg className="w-5 h-5 text-cyan-500 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
          </svg>
          <div>
            <h4 className="text-sm font-medium text-cyan-800">Cài đặt kỹ thuật giúp:</h4>
            <ul className="text-sm text-cyan-700 mt-1 list-disc list-inside ml-4">
              <li>Hiển thị thời gian và deadline đúng múi giờ</li>
              <li>Giao tiếp bằng ngôn ngữ bạn thích</li>
              <li>Gửi thông báo phù hợp với nhu cầu</li>
              <li>Tối ưu giao diện cho thiết bị bạn sử dụng</li>
              <li>Điều chỉnh độ phức tạp phù hợp trình độ</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export { TechSettingsStep };