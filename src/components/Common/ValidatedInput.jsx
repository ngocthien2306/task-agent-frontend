import { useState, useEffect } from 'react';
import { debounce } from '../../utils/validation';

/**
 * ValidatedInput - A reusable input component with real-time validation
 */
export const ValidatedInput = ({
  type = 'text',
  name,
  value,
  onChange,
  onValidation,
  validation,
  label,
  placeholder,
  required = false,
  disabled = false,
  className = '',
  showPasswordStrength = false,
  debounceMs = 300,
  ...props
}) => {
  const [validationResult, setValidationResult] = useState({
    isValid: true,
    errors: [],
    type: 'success'
  });
  const [isTouched, setIsTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Debounced validation function
  const debouncedValidate = debounce((val) => {
    if (validation && isTouched) {
      const result = validation(val);
      setValidationResult(result);
      if (onValidation) {
        onValidation(name, result);
      }
    }
  }, debounceMs);

  // Run validation when value changes
  useEffect(() => {
    if (isTouched) {
      debouncedValidate(value);
    }
  }, [value, isTouched]);

  // Handle input change
  const handleChange = (e) => {
    const newValue = e.target.value;
    onChange(e);
    
    if (!isTouched) {
      setIsTouched(true);
    }
  };

  // Handle blur (immediate validation)
  const handleBlur = () => {
    if (!isTouched) {
      setIsTouched(true);
    }
    if (validation) {
      const result = validation(value);
      setValidationResult(result);
      if (onValidation) {
        onValidation(name, result);
      }
    }
  };

  // Get border color based on validation state
  const getBorderColor = () => {
    if (!isTouched) return 'border-gray-300';
    
    switch (validationResult.type) {
      case 'error':
        return 'border-red-500 focus:border-red-500';
      case 'warning':
        return 'border-yellow-500 focus:border-yellow-500';
      case 'success':
        return 'border-green-500 focus:border-green-500';
      default:
        return 'border-gray-300';
    }
  };

  // Get ring color for focus
  const getRingColor = () => {
    if (!isTouched) return 'focus:ring-blue-500';
    
    switch (validationResult.type) {
      case 'error':
        return 'focus:ring-red-500';
      case 'warning':
        return 'focus:ring-yellow-500';
      case 'success':
        return 'focus:ring-green-500';
      default:
        return 'focus:ring-blue-500';
    }
  };

  // Render password strength indicator
  const renderPasswordStrength = () => {
    if (!showPasswordStrength || type !== 'password' || !isTouched || !validationResult.strength) {
      return null;
    }

    const strength = validationResult.strength;
    const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];
    
    return (
      <div className="mt-2">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-gray-600">Độ mạnh mật khẩu:</span>
          <span className={`font-medium ${
            strength <= 1 ? 'text-red-600' :
            strength <= 2 ? 'text-yellow-600' :
            strength <= 3 ? 'text-blue-600' : 'text-green-600'
          }`}>
            {validationResult.strengthLabel}
          </span>
        </div>
        <div className="flex space-x-1">
          {[0, 1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className={`h-2 flex-1 rounded-full ${
                level < strength ? strengthColors[level] : 'bg-gray-200'
              } transition-colors duration-300`}
            />
          ))}
        </div>
        {validationResult.suggestions && validationResult.suggestions.length > 0 && (
          <div className="mt-1 text-xs text-gray-600">
            <span>Gợi ý: {validationResult.suggestions.join(', ')}</span>
          </div>
        )}
      </div>
    );
  };

  // Render validation messages
  const renderValidationMessages = () => {
    if (!isTouched || validationResult.errors.length === 0) {
      return null;
    }

    return (
      <div className="mt-1 space-y-1">
        {validationResult.errors.map((error, index) => (
          <div key={index} className="flex items-center text-sm text-red-600">
            <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        ))}
      </div>
    );
  };

  // Render success indicator
  const renderSuccessIndicator = () => {
    if (!isTouched || validationResult.type !== 'success' || !value) {
      return null;
    }

    return (
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      </div>
    );
  };

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <input
          type={type === 'password' && showPassword ? 'text' : type}
          name={name}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`
            w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 
            ${getBorderColor()} ${getRingColor()}
            disabled:bg-gray-100 disabled:cursor-not-allowed
            transition-colors duration-200
            ${type === 'password' ? 'pr-20' : validationResult.type === 'success' && isTouched && value ? 'pr-10' : ''}
            ${className}
          `}
          {...props}
        />
        
        {/* Password toggle button */}
        {type === 'password' && (
          <div className="absolute inset-y-0 right-0 flex items-center">
            {validationResult.type === 'success' && isTouched && value && (
              <svg className="w-5 h-5 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="px-2 py-1 text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              {showPassword ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
        )}
        
        {/* Success indicator for non-password fields */}
        {type !== 'password' && renderSuccessIndicator()}
      </div>
      
      {/* Password strength indicator */}
      {renderPasswordStrength()}
      
      {/* Validation messages */}
      {renderValidationMessages()}
    </div>
  );
};