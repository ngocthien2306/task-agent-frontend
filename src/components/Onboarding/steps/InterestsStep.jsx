import { useState } from 'react';

const InterestsStep = ({ data, onChange }) => {
  const [formData, setFormData] = useState({
    interests: data.interests || [],
    learning_style: data.learning_style || '',
    motivation_factors: data.motivation_factors || [],
    stress_management: data.stress_management || []
  });

  const interestCategories = [
    {
      id: 'technology',
      title: 'Công nghệ',
      description: 'Programming, AI, gadgets',
      icon: '💻'
    },
    {
      id: 'sports',
      title: 'Thể thao',
      description: 'Bóng đá, gym, chạy bộ',
      icon: '⚽'
    },
    {
      id: 'reading',
      title: 'Đọc sách',
      description: 'Tiểu thuyết, sách chuyên môn',
      icon: '📚'
    },
    {
      id: 'music',
      title: 'Âm nhạc',
      description: 'Nghe nhạc, chơi nhạc cụ',
      icon: '🎵'
    },
    {
      id: 'travel',
      title: 'Du lịch',
      description: 'Khám phá địa điểm mới',
      icon: '✈️'
    },
    {
      id: 'cooking',
      title: 'Nấu ăn',
      description: 'Thử món mới, food blogger',
      icon: '👨‍🍳'
    },
    {
      id: 'art',
      title: 'Nghệ thuật',
      description: 'Vẽ, nhiếp ảnh, thiết kế',
      icon: '🎨'
    },
    {
      id: 'business',
      title: 'Kinh doanh',
      description: 'Khởi nghiệp, đầu tư, marketing',
      icon: '💼'
    },
    {
      id: 'health',
      title: 'Sức khỏe',
      description: 'Yoga, meditation, dinh dưỡng',
      icon: '🧘‍♀️'
    },
    {
      id: 'gaming',
      title: 'Game',
      description: 'Video games, board games',
      icon: '🎮'
    },
    {
      id: 'learning',
      title: 'Học tập',
      description: 'Khóa học online, workshops',
      icon: '🎓'
    },
    {
      id: 'social',
      title: 'Hoạt động xã hội',
      description: 'Gặp gỡ bạn bè, networking',
      icon: '👥'
    }
  ];

  const learningStyles = [
    {
      id: 'visual',
      title: 'Học qua hình ảnh',
      description: 'Charts, diagrams, videos',
      icon: '👁️'
    },
    {
      id: 'auditory',
      title: 'Học qua nghe',
      description: 'Podcasts, thảo luận, giải thích',
      icon: '👂'
    },
    {
      id: 'hands_on',
      title: 'Học qua thực hành',
      description: 'Làm thử, experiments, practice',
      icon: '🤲'
    },
    {
      id: 'reading',
      title: 'Học qua đọc',
      description: 'Tài liệu, sách, articles',
      icon: '📖'
    }
  ];

  const motivationFactors = [
    {
      id: 'achievement',
      title: 'Thành tích',
      description: 'Hoàn thành mục tiêu, đạt kết quả',
      icon: '🏆'
    },
    {
      id: 'recognition',
      title: 'Được ghi nhận',
      description: 'Praise từ team, boss, customers',
      icon: '👏'
    },
    {
      id: 'growth',
      title: 'Phát triển bản thân',
      description: 'Học kỹ năng mới, challenge',
      icon: '📈'
    },
    {
      id: 'autonomy',
      title: 'Tự chủ',
      description: 'Quyền quyết định, làm theo cách mình',
      icon: '🗽'
    },
    {
      id: 'purpose',
      title: 'Ý nghĩa',
      description: 'Công việc có tác động tích cực',
      icon: '🎯'
    },
    {
      id: 'team',
      title: 'Tinh thần đồng đội',
      description: 'Hỗ trợ lẫn nhau, collaboration',
      icon: '🤝'
    }
  ];

  const stressManagement = [
    {
      id: 'exercise',
      title: 'Tập thể dục',
      description: 'Gym, chạy bộ, yoga',
      icon: '💪'
    },
    {
      id: 'meditation',
      title: 'Thiền/Thở',
      description: 'Mindfulness, deep breathing',
      icon: '🧘'
    },
    {
      id: 'music',
      title: 'Nghe nhạc',
      description: 'Thư giãn với nhạc yêu thích',
      icon: '🎧'
    },
    {
      id: 'social',
      title: 'Gặp gỡ bạn bè',
      description: 'Trò chuyện, chia sẻ',
      icon: '👫'
    },
    {
      id: 'nature',
      title: 'Gần gũi thiên nhiên',
      description: 'Đi bộ, picnic, travel',
      icon: '🌳'
    },
    {
      id: 'hobbies',
      title: 'Sở thích cá nhân',
      description: 'Đọc sách, nấu ăn, game',
      icon: '🎨'
    }
  ];

  const handleInterestToggle = (interestId) => {
    const updated = formData.interests.includes(interestId)
      ? formData.interests.filter(id => id !== interestId)
      : [...formData.interests, interestId];
    
    setFormData(prev => ({ ...prev, interests: updated }));
    onChange({ ...formData, interests: updated });
  };

  const handleMotivationToggle = (factorId) => {
    const updated = formData.motivation_factors.includes(factorId)
      ? formData.motivation_factors.filter(id => id !== factorId)
      : [...formData.motivation_factors, factorId];
    
    setFormData(prev => ({ ...prev, motivation_factors: updated }));
    onChange({ ...formData, motivation_factors: updated });
  };

  const handleStressToggle = (methodId) => {
    const updated = formData.stress_management.includes(methodId)
      ? formData.stress_management.filter(id => id !== methodId)
      : [...formData.stress_management, methodId];
    
    setFormData(prev => ({ ...prev, stress_management: updated }));
    onChange({ ...formData, stress_management: updated });
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
      {/* Interests */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Sở thích của bạn <span className="text-gray-500">(chọn 3-6 sở thích)</span>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {interestCategories.map(interest => (
            <div
              key={interest.id}
              onClick={() => handleInterestToggle(interest.id)}
              className={`p-3 border rounded-lg cursor-pointer transition-all text-center ${
                formData.interests.includes(interest.id)
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <span className="text-2xl block mb-1">{interest.icon}</span>
              <h3 className="font-medium text-gray-900 text-sm">{interest.title}</h3>
              <p className="text-xs text-gray-600 mt-1">{interest.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Learning Style */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Cách học tập bạn thích <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {learningStyles.map(style => (
            <div
              key={style.id}
              onClick={() => handleInputChange('learning_style', style.id)}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                formData.learning_style === style.id
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

      {/* Motivation Factors */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Động lực làm việc <span className="text-gray-500">(chọn 2-4 yếu tố)</span>
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {motivationFactors.map(factor => (
            <div
              key={factor.id}
              onClick={() => handleMotivationToggle(factor.id)}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                formData.motivation_factors.includes(factor.id)
                  ? 'border-green-500 bg-green-50 ring-2 ring-green-200'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="flex items-start space-x-3">
                <span className="text-2xl">{factor.icon}</span>
                <div>
                  <h3 className="font-medium text-gray-900">{factor.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{factor.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stress Management */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Cách giải tỏa stress <span className="text-gray-500">(chọn 2-4 cách)</span>
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {stressManagement.map(method => (
            <div
              key={method.id}
              onClick={() => handleStressToggle(method.id)}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                formData.stress_management.includes(method.id)
                  ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-200'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="flex items-start space-x-3">
                <span className="text-2xl">{method.icon}</span>
                <div>
                  <h3 className="font-medium text-gray-900">{method.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{method.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Help Text */}
      <div className="bg-pink-50 p-4 rounded-lg">
        <div className="flex">
          <svg className="w-5 h-5 text-pink-500 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
          </svg>
          <div>
            <h4 className="text-sm font-medium text-pink-800">Thông tin cá nhân giúp AI:</h4>
            <ul className="text-sm text-pink-700 mt-1 list-disc list-inside ml-4">
              <li>Gợi ý tasks liên quan đến sở thích của bạn</li>
              <li>Tùy chỉnh cách giải thích phù hợp với learning style</li>
              <li>Đưa ra lời động viên phù hợp khi bạn cần</li>
              <li>Đề xuất cách thư giãn khi bạn stress</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export { InterestsStep };