import { useState } from 'react';

const AICustomizationStep = ({ data, onChange }) => {
  const [formData, setFormData] = useState({
    interaction_preference: data.interaction_preference || 'detailed',
    custom_instructions: data.custom_instructions || '',
    reminder_style: data.reminder_style || '',
    feedback_preference: data.feedback_preference || '',
    privacy_level: data.privacy_level || ''
  });

  const interactionStyles = [
    {
      id: 'detailed',
      title: 'Chi tiết',
      description: 'Giải thích đầy đủ, nhiều thông tin',
      icon: '📋',
      example: '"Để hoàn thành task này, bạn có thể làm theo 3 bước: 1) Chuẩn bị... 2) Thực hiện... 3) Kiểm tra..."'
    },
    {
      id: 'concise',
      title: 'Súc tích',
      description: 'Thông tin cốt lõi, đi thẳng vào vấn đề',
      icon: '⚡',
      example: '"Task deadline: 2PM. Priority: High. Next action: Call client."'
    },
    {
      id: 'conversational',
      title: 'Trò chuyện',
      description: 'Tự nhiên, thân thiện như bạn bè',
      icon: '💬',
      example: '"Hey! Nhớ gọi cho client lúc 2PM nhé. Việc này quan trọng đấy!"'
    }
  ];

  const reminderStyles = [
    {
      id: 'gentle',
      title: 'Nhẹ nhàng',
      description: 'Nhắc nhở một cách dịu dàng',
      icon: '🕊️',
      example: '"Bạn có thể xem xét làm task này khi rảnh nhé"'
    },
    {
      id: 'firm',
      title: 'Quyết đoán',
      description: 'Nhắc nhở rõ ràng, cụ thể',
      icon: '⏰',
      example: '"Task deadline trong 2 giờ. Cần hoàn thành ngay."'
    },
    {
      id: 'motivational',
      title: 'Động viên',
      description: 'Khuyến khích, tích cực',
      icon: '🚀',
      example: '"Bạn đang làm rất tốt! Chỉ còn 1 task nữa là hoàn thành mục tiêu hôm nay!"'
    },
    {
      id: 'casual',
      title: 'Tự nhiên',
      description: 'Nhắc nhở một cách bình thường',
      icon: '😊',
      example: '"Đừng quên meeting lúc 3PM nhé!"'
    }
  ];

  const feedbackPreferences = [
    {
      id: 'immediate',
      title: 'Phản hồi ngay lập tức',
      description: 'Nhận feedback sau mỗi task',
      icon: '⚡'
    },
    {
      id: 'daily_summary',
      title: 'Tổng kết cuối ngày',
      description: 'Báo cáo tổng hợp hàng ngày',
      icon: '🌅'
    },
    {
      id: 'weekly_review',
      title: 'Review hàng tuần',
      description: 'Phân tích chi tiết mỗi tuần',
      icon: '📊'
    },
    {
      id: 'milestone_based',
      title: 'Theo milestone',
      description: 'Feedback khi đạt mục tiêu lớn',
      icon: '🎯'
    },
    {
      id: 'minimal',
      title: 'Tối thiểu',
      description: 'Chỉ khi có vấn đề quan trọng',
      icon: '🔕'
    }
  ];

  const privacyLevels = [
    {
      id: 'open',
      title: 'Chia sẻ mọi thứ',
      description: 'AI có thể truy cập tất cả thông tin để hỗ trợ tốt nhất',
      icon: '🌐',
      details: 'Tasks, calendar, location, contacts, app usage'
    },
    {
      id: 'work_only',
      title: 'Chỉ công việc',
      description: 'AI chỉ truy cập thông tin liên quan đến công việc',
      icon: '💼',
      details: 'Work tasks, meetings, work calendar, work contacts'
    },
    {
      id: 'limited',
      title: 'Hạn chế',
      description: 'AI chỉ truy cập thông tin cơ bản',
      icon: '🔒',
      details: 'Tasks và calendar cơ bản, không truy cập contacts'
    },
    {
      id: 'minimal',
      title: 'Tối thiểu',
      description: 'AI chỉ biết những gì bạn chủ động chia sẻ',
      icon: '🛡️',
      details: 'Chỉ tasks và thông tin bạn nhập trực tiếp'
    }
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
    <div className="space-y-8">
      {/* Interaction Preference */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Cách AI nói chuyện với bạn <span className="text-red-500">*</span>
        </label>
        <div className="space-y-3">
          {interactionStyles.map(style => (
            <div key={style.id}>
              <div
                onClick={() => handleInputChange('interaction_preference', style.id)}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  formData.interaction_preference === style.id
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">{style.icon}</span>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{style.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{style.description}</p>
                    <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600 italic">
                      Ví dụ: {style.example}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reminder Style */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Phong cách nhắc nhở <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {reminderStyles.map(style => (
            <div key={style.id}>
              <div
                onClick={() => handleInputChange('reminder_style', style.id)}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  formData.reminder_style === style.id
                    ? 'border-green-500 bg-green-50 ring-2 ring-green-200'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">{style.icon}</span>
                  <div>
                    <h3 className="font-medium text-gray-900">{style.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{style.description}</p>
                    <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600 italic">
                      {style.example}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feedback Preference */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Tần suất phản hồi <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {feedbackPreferences.map(pref => (
            <div
              key={pref.id}
              onClick={() => handleInputChange('feedback_preference', pref.id)}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                formData.feedback_preference === pref.id
                  ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-200'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="flex items-start space-x-3">
                <span className="text-2xl">{pref.icon}</span>
                <div>
                  <h3 className="font-medium text-gray-900">{pref.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{pref.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Privacy Level */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Mức độ riêng tư <span className="text-red-500">*</span>
        </label>
        <div className="space-y-3">
          {privacyLevels.map(level => (
            <div
              key={level.id}
              onClick={() => handleInputChange('privacy_level', level.id)}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                formData.privacy_level === level.id
                  ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-200'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="flex items-start space-x-3">
                <span className="text-2xl">{level.icon}</span>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{level.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{level.description}</p>
                  <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
                    Truy cập: {level.details}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Instructions */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Hướng dẫn tùy chỉnh <span className="text-gray-500">(tùy chọn)</span>
        </label>
        <textarea
          value={formData.custom_instructions}
          onChange={(e) => handleInputChange('custom_instructions', e.target.value)}
          placeholder="Có điều gì đặc biệt bạn muốn AI nhớ về cách làm việc của bạn? 
Ví dụ: 
- Tôi không làm việc sau 6PM
- Luôn hỏi trước khi schedule meeting
- Ưu tiên tasks liên quan đến khách hàng VIP"
          rows={4}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
        <p className="text-xs text-gray-500 mt-1">
          AI sẽ nhớ những hướng dẫn này và áp dụng trong tất cả các tương tác
        </p>
      </div>

      {/* Completion Message */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border border-green-200">
        <div className="flex items-center space-x-3">
          <span className="text-3xl">🎉</span>
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Gần hoàn thành rồi!</h3>
            <p className="text-sm text-gray-600 mb-3">
              Bạn đã cung cấp đủ thông tin để AI có thể hỗ trợ bạn một cách tốt nhất. 
              Những thông tin này sẽ giúp AI:
            </p>
            <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
              <li>Tùy chỉnh cách giao tiếp phù hợp với style của bạn</li>
              <li>Đưa ra gợi ý và nhắc nhở phù hợp</li>
              <li>Tạo kế hoạch work-life balance tối ưu</li>
              <li>Bảo vệ privacy theo mức độ bạn mong muốn</li>
            </ul>
            <div className="mt-4 p-3 bg-white bg-opacity-60 rounded">
              <p className="text-xs text-gray-500">
                💡 <strong>Lưu ý:</strong> Bạn có thể thay đổi tất cả các cài đặt này bất kỳ lúc nào 
                trong phần Settings sau khi hoàn thành setup.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { AICustomizationStep };