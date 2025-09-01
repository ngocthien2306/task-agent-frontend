import { useState } from 'react';

const WorkStyleStep = ({ data, onChange }) => {
  const [formData, setFormData] = useState({
    work_style: data.work_style || 'organized',
    communication_style: data.communication_style || 'friendly',
    working_hours: data.working_hours || '',
    break_style: data.break_style || ''
  });

  const workStyles = [
    {
      id: 'organized',
      title: 'Có tổ chức',
      description: 'Thích lập kế hoạch chi tiết, làm theo checklist',
      icon: '📋'
    },
    {
      id: 'flexible',
      title: 'Linh hoạt',
      description: 'Thích thích ứng, làm việc theo cảm hứng',
      icon: '🌊'
    },
    {
      id: 'creative',
      title: 'Sáng tạo',
      description: 'Thích brainstorm, tìm giải pháp mới',
      icon: '🎨'
    },
    {
      id: 'analytical',
      title: 'Phân tích',
      description: 'Thích dữ liệu, quy trình logic',
      icon: '📊'
    }
  ];

  const communicationStyles = [
    {
      id: 'friendly',
      title: 'Thân thiện',
      description: 'Giao tiếp ấm áp, gần gũi',
      icon: '😊'
    },
    {
      id: 'professional',
      title: 'Chuyên nghiệp',
      description: 'Giao tiếp trang trọng, súc tích',
      icon: '💼'
    },
    {
      id: 'direct',
      title: 'Trực tiếp',
      description: 'Nói thẳng, không lòng vòng',
      icon: '🎯'
    }
  ];

  const workingHours = [
    'Early bird (5:00-9:00)',
    'Morning person (9:00-12:00)',
    'Afternoon focused (13:00-17:00)',
    'Evening productive (17:00-21:00)',
    'Night owl (21:00-01:00)',
    'Flexible - tùy theo công việc'
  ];

  const breakStyles = [
    'Pomodoro (25 phút làm, 5 phút nghỉ)',
    'Deep work (90-120 phút tập trung)',
    'Frequent breaks (mỗi 45 phút)',
    'Theo cảm giác (nghỉ khi cần)',
    'Minimal breaks (chỉ nghỉ trưa)'
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
      {/* Work Style */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Phong cách làm việc của bạn <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {workStyles.map(style => (
            <div
              key={style.id}
              onClick={() => handleInputChange('work_style', style.id)}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                formData.work_style === style.id
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="flex items-start space-x-3">
                <span className="text-2xl">{style.icon}</span>
                <div>
                  <h3 className="font-medium text-gray-900">{style.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{style.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Communication Style */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Cách giao tiếp bạn thích <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {communicationStyles.map(style => (
            <div
              key={style.id}
              onClick={() => handleInputChange('communication_style', style.id)}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                formData.communication_style === style.id
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="text-center">
                <span className="text-2xl block mb-2">{style.icon}</span>
                <h3 className="font-medium text-gray-900">{style.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{style.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Working Hours */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Thời gian làm việc hiệu quả nhất <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.working_hours}
          onChange={(e) => handleInputChange('working_hours', e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        >
          <option value="">Chọn thời gian làm việc tốt nhất</option>
          {workingHours.map(hour => (
            <option key={hour} value={hour}>
              {hour}
            </option>
          ))}
        </select>
      </div>

      {/* Break Style */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Cách nghỉ ngơi bạn thích <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.break_style}
          onChange={(e) => handleInputChange('break_style', e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        >
          <option value="">Chọn cách nghỉ ngơi</option>
          {breakStyles.map(style => (
            <option key={style} value={style}>
              {style}
            </option>
          ))}
        </select>
      </div>

      {/* Help Text */}
      <div className="bg-green-50 p-4 rounded-lg">
        <div className="flex">
          <svg className="w-5 h-5 text-green-500 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <div>
            <h4 className="text-sm font-medium text-green-800">AI sẽ sử dụng thông tin này để:</h4>
            <ul className="text-sm text-green-700 mt-1 list-disc list-inside ml-4">
              <li>Tùy chỉnh cách nói chuyện cho phù hợp với bạn</li>
              <li>Đề xuất thời gian tốt nhất để làm tasks</li>
              <li>Tạo lịch nghỉ ngơi hợp lý</li>
              <li>Đưa ra lời khuyên theo style của bạn</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export { WorkStyleStep };