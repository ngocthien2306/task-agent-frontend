import { useState } from 'react';

const GoalsStep = ({ data, onChange }) => {
  const [formData, setFormData] = useState({
    primary_goals: data.primary_goals || [],
    task_priorities: data.task_priorities || '',
    planning_horizon: data.planning_horizon || '',
    success_metrics: data.success_metrics || []
  });

  const primaryGoals = [
    {
      id: 'career_growth',
      title: 'Phát triển sự nghiệp',
      description: 'Thăng tiến, học kỹ năng mới',
      icon: '📈'
    },
    {
      id: 'work_life_balance',
      title: 'Cân bằng cuộc sống',
      description: 'Làm việc hiệu quả, có thời gian cá nhân',
      icon: '⚖️'
    },
    {
      id: 'skill_development',
      title: 'Nâng cao kỹ năng',
      description: 'Học hỏi, trở thành chuyên gia',
      icon: '🎓'
    },
    {
      id: 'productivity',
      title: 'Tăng năng suất',
      description: 'Hoàn thành nhiều việc hơn',
      icon: '⚡'
    },
    {
      id: 'team_collaboration',
      title: 'Hợp tác nhóm',
      description: 'Làm việc nhóm hiệu quả',
      icon: '🤝'
    },
    {
      id: 'innovation',
      title: 'Sáng tạo & Đổi mới',
      description: 'Tạo ra những ý tưởng mới',
      icon: '💡'
    }
  ];

  const taskPrioritiesOptions = [
    {
      id: 'urgent_first',
      title: 'Làm việc khẩn cấp trước',
      description: 'Ưu tiên deadline và yêu cầu gấp',
      icon: '🔥'
    },
    {
      id: 'important_first',
      title: 'Làm việc quan trọng trước',
      description: 'Ưu tiên impact cao dù không gấp',
      icon: '⭐'
    },
    {
      id: 'balanced',
      title: 'Cân bằng khẩn cấp & quan trọng',
      description: 'Xem xét cả hai yếu tố',
      icon: '⚖️'
    },
    {
      id: 'energy_based',
      title: 'Theo mức năng lượng',
      description: 'Việc khó khi có năng lượng cao',
      icon: '🔋'
    }
  ];

  const planningHorizons = [
    'Tập trung theo ngày (Daily focus)',
    'Lập kế hoạch theo tuần (Weekly planning)',
    'Tầm nhìn theo tháng (Monthly goals)',
    'Mục tiêu dài hạn (Long-term vision)',
    'Kết hợp tất cả (Mixed approach)'
  ];

  const successMetrics = [
    {
      id: 'completion_rate',
      title: 'Tỷ lệ hoàn thành',
      description: 'Đo lường bao nhiêu tasks được hoàn thành',
      icon: '✅'
    },
    {
      id: 'quality',
      title: 'Chất lượng công việc',
      description: 'Mức độ hoàn hảo của sản phẩm',
      icon: '⭐'
    },
    {
      id: 'time_efficiency',
      title: 'Hiệu quả thời gian',
      description: 'Hoàn thành nhanh chóng',
      icon: '⏱️'
    },
    {
      id: 'learning_growth',
      title: 'Học hỏi & Phát triển',
      description: 'Kỹ năng và kiến thức mới',
      icon: '📚'
    },
    {
      id: 'impact',
      title: 'Tác động tích cực',
      description: 'Ảnh hưởng đến team/công ty',
      icon: '🎯'
    }
  ];

  const handleGoalToggle = (goalId) => {
    const updated = formData.primary_goals.includes(goalId)
      ? formData.primary_goals.filter(id => id !== goalId)
      : [...formData.primary_goals, goalId];
    
    setFormData(prev => ({ ...prev, primary_goals: updated }));
    onChange({ ...formData, primary_goals: updated });
  };

  const handleMetricToggle = (metricId) => {
    const updated = formData.success_metrics.includes(metricId)
      ? formData.success_metrics.filter(id => id !== metricId)
      : [...formData.success_metrics, metricId];
    
    setFormData(prev => ({ ...prev, success_metrics: updated }));
    onChange({ ...formData, success_metrics: updated });
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
      {/* Primary Goals */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Mục tiêu chính của bạn <span className="text-gray-500">(chọn 1-3 mục tiêu)</span>
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {primaryGoals.map(goal => (
            <div
              key={goal.id}
              onClick={() => handleGoalToggle(goal.id)}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                formData.primary_goals.includes(goal.id)
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="flex items-start space-x-3">
                <span className="text-2xl">{goal.icon}</span>
                <div>
                  <h3 className="font-medium text-gray-900">{goal.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        {formData.primary_goals.length > 3 && (
          <p className="text-sm text-orange-600 mt-2">
            💡 Gợi ý: Chọn tối đa 3 mục tiêu để AI có thể tập trung hỗ trợ bạn tốt hơn
          </p>
        )}
      </div>

      {/* Task Priorities */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Cách bạn ưu tiên công việc <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {taskPrioritiesOptions.map(option => (
            <div
              key={option.id}
              onClick={() => handleInputChange('task_priorities', option.id)}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                formData.task_priorities === option.id
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="flex items-start space-x-3">
                <span className="text-2xl">{option.icon}</span>
                <div>
                  <h3 className="font-medium text-gray-900">{option.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Planning Horizon */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Cách lập kế hoạch bạn thích <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.planning_horizon}
          onChange={(e) => handleInputChange('planning_horizon', e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        >
          <option value="">Chọn cách lập kế hoạch</option>
          {planningHorizons.map(horizon => (
            <option key={horizon} value={horizon}>
              {horizon}
            </option>
          ))}
        </select>
      </div>

      {/* Success Metrics */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Thước đo thành công <span className="text-gray-500">(chọn 2-4 tiêu chí)</span>
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {successMetrics.map(metric => (
            <div
              key={metric.id}
              onClick={() => handleMetricToggle(metric.id)}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                formData.success_metrics.includes(metric.id)
                  ? 'border-green-500 bg-green-50 ring-2 ring-green-200'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="flex items-start space-x-3">
                <span className="text-2xl">{metric.icon}</span>
                <div>
                  <h3 className="font-medium text-gray-900">{metric.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{metric.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Help Text */}
      <div className="bg-purple-50 p-4 rounded-lg">
        <div className="flex">
          <svg className="w-5 h-5 text-purple-500 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
          </svg>
          <div>
            <h4 className="text-sm font-medium text-purple-800">AI sẽ cá nhân hóa trải nghiệm:</h4>
            <ul className="text-sm text-purple-700 mt-1 list-disc list-inside ml-4">
              <li>Đề xuất tasks phù hợp với mục tiêu của bạn</li>
              <li>Sắp xếp ưu tiên theo cách bạn thích</li>
              <li>Tạo báo cáo tiến độ theo thước đo bạn quan tâm</li>
              <li>Đưa ra lời khuyên để đạt được mục tiêu</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export { GoalsStep };