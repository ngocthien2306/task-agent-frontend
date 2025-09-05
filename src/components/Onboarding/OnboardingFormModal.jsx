import { useState } from 'react';
import { PersonalInfoStepEnhanced } from './steps/PersonalInfoStepEnhanced';
import { WorkStyleStep } from './steps/WorkStyleStep';
import { GoalsStep } from './steps/GoalsStep';
import { InterestsStep } from './steps/InterestsStep';
import { TechSettingsStep } from './steps/TechSettingsStep';
import { AICustomizationStep } from './steps/AICustomizationStep';

const OnboardingFormModal = ({ 
  user, 
  onComplete, 
  onCancel, 
  initialData = null,
  mode = 'onboarding', // 'onboarding' or 'edit'
  title,
  subtitle 
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Personal Info
    first_name: initialData?.first_name || '',
    last_name: initialData?.last_name || '',
    phone: initialData?.phone || '',
    date_of_birth: initialData?.date_of_birth || '',
    avatar_url: initialData?.avatar_url || '',
    
    // Professional Info
    occupation: initialData?.occupation || '',
    company: initialData?.company || '',
    industry: initialData?.industry || '',
    position_level: initialData?.position_level || '',
    work_location: initialData?.work_location || '',
    
    // Work Style
    work_style: initialData?.work_style || user?.personality?.work_style || 'organized',
    communication_style: initialData?.communication_style || user?.personality?.communication_style || 'friendly',
    working_hours: initialData?.working_hours || '',
    break_style: initialData?.break_style || '',
    
    // Goals & Priorities
    primary_goals: initialData?.primary_goals || [],
    task_priorities: initialData?.task_priorities || '',
    planning_horizon: initialData?.planning_horizon || '',
    success_metrics: initialData?.success_metrics || [],
    
    // Personal Interests
    interests: initialData?.interests || user?.interests || [],
    learning_style: initialData?.learning_style || '',
    motivation_factors: initialData?.motivation_factors || [],
    stress_management: initialData?.stress_management || [],
    
    // Tech Settings
    timezone: initialData?.timezone || user?.timezone || 'UTC',
    language_preference: initialData?.language_preference || user?.language_preference || 'en',
    notification_preferences: initialData?.notification_preferences || [],
    device_usage: initialData?.device_usage || '',
    tech_level: initialData?.tech_level || '',
    
    // AI Customization
    interaction_preference: initialData?.interaction_preference || user?.personality?.interaction_preference || 'detailed',
    custom_instructions: initialData?.custom_instructions || user?.custom_instructions || '',
    reminder_style: initialData?.reminder_style || '',
    feedback_preference: initialData?.feedback_preference || '',
    privacy_level: initialData?.privacy_level || ''
  });

  const steps = [
    {
      id: 1,
      title: "Thông tin cá nhân",
      subtitle: "Hãy cho chúng tôi biết về bản thân và công việc của bạn",
      icon: "👤",
      component: PersonalInfoStepEnhanced
    },
    {
      id: 2,
      title: "Phong cách làm việc", 
      subtitle: "Cách bạn thích làm việc và giao tiếp",
      icon: "⚡",
      component: WorkStyleStep
    },
    {
      id: 3,
      title: "Mục tiêu & Ưu tiên",
      subtitle: "Những gì bạn muốn đạt được",
      icon: "🎯", 
      component: GoalsStep
    },
    {
      id: 4,
      title: "Sở thích cá nhân",
      subtitle: "Để AI hiểu bạn hơn",
      icon: "❤️",
      component: InterestsStep
    },
    {
      id: 5,
      title: "Cài đặt kỹ thuật",
      subtitle: "Tùy chỉnh trải nghiệm công nghệ",
      icon: "⚙️",
      component: TechSettingsStep
    },
    {
      id: 6,
      title: "Tùy chỉnh AI Assistant", 
      subtitle: "Cách AI sẽ hỗ trợ bạn",
      icon: "🤖",
      component: AICustomizationStep
    }
  ];

  const currentStepData = steps.find(step => step.id === currentStep);
  const StepComponent = currentStepData.component;

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final step - save data and complete
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    try {
      // Call the onComplete callback with the form data
      await onComplete(formData);
    } catch (error) {
      console.error('Error completing form:', error);
      // Still complete but show warning
      onComplete(formData);
    }
  };

  const updateFormData = (stepData) => {
    setFormData(prev => ({
      ...prev,
      ...stepData
    }));
  };

  const progressPercentage = (currentStep / steps.length) * 100;

  // Default titles based on mode
  const defaultTitle = mode === 'edit' ? 'Cập nhật thông tin cá nhân' : 'Chào mừng đến với AI Assistant!';
  const defaultSubtitle = mode === 'edit' ? 'Chỉnh sửa thông tin để AI có thể hỗ trợ bạn tốt hơn' : 'Hãy cùng tùy chỉnh trải nghiệm cho bạn';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold">{title || defaultTitle}</h1>
              <p className="text-blue-100">{subtitle || defaultSubtitle}</p>
            </div>
            <button
              onClick={onCancel}
              className="text-blue-100 hover:text-white text-sm underline flex items-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              {mode === 'edit' ? 'Hủy' : 'Đóng'}
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-blue-400 bg-opacity-30 rounded-full h-2">
            <div 
              className="bg-white rounded-full h-2 transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-blue-100 mt-2">
            <span>Bước {currentStep} / {steps.length}</span>
            <span>{Math.round(progressPercentage)}% hoàn thành</span>
          </div>
        </div>

        {/* Step Content */}
        <div className="p-8 overflow-y-auto max-h-[60vh]">
          <div className="text-center mb-8">
            <div className="text-4xl mb-3">{currentStepData.icon}</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              {currentStepData.title}
            </h2>
            <p className="text-gray-600">
              {currentStepData.subtitle}
            </p>
          </div>

          <StepComponent 
            data={formData}
            onChange={updateFormData}
          />
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-6 flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              currentStep === 1
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            ← Trước
          </button>

          <div className="flex gap-2">
            {steps.map(step => (
              <div
                key={step.id}
                className={`w-3 h-3 rounded-full transition-all ${
                  step.id === currentStep
                    ? 'bg-blue-500 scale-125'
                    : step.id < currentStep
                    ? 'bg-green-500'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-2 rounded-lg font-medium hover:shadow-lg transition-all"
          >
            {currentStep === steps.length ? 
              (mode === 'edit' ? 'Cập nhật' : 'Hoàn thành') : 
              'Tiếp theo →'
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export { OnboardingFormModal };