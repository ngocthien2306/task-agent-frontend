/**
 * Real-time validation utilities for forms
 */

// Email validation
export const validateEmail = (email) => {
  const errors = [];
  
  if (!email) {
    errors.push('Email là bắt buộc');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push('Email không hợp lệ');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    type: errors.length > 0 ? 'error' : 'success'
  };
};

// Username validation  
export const validateUsername = (username) => {
  const errors = [];
  
  if (!username) {
    errors.push('Username là bắt buộc');
  } else {
    if (username.length < 3) {
      errors.push('Username phải có ít nhất 3 ký tự');
    }
    if (username.length > 30) {
      errors.push('Username không được quá 30 ký tự');
    }
    if (!/^[a-zA-Z0-9_.-]+$/.test(username)) {
      errors.push('Username chỉ được chứa chữ cái, số, dấu gạch dưới, dấu chấm và dấu gạch ngang');
    }
    if (/^[._-]/.test(username) || /[._-]$/.test(username)) {
      errors.push('Username không được bắt đầu hoặc kết thúc bằng ký tự đặc biệt');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    type: errors.length > 0 ? 'error' : 'success'
  };
};

// Password validation
export const validatePassword = (password) => {
  const errors = [];
  const suggestions = [];
  
  if (!password) {
    errors.push('Mật khẩu là bắt buộc');
  } else {
    if (password.length < 8) {
      errors.push('Mật khẩu phải có ít nhất 8 ký tự');
    }
    if (password.length > 128) {
      errors.push('Mật khẩu không được quá 128 ký tự');
    }
    
    // Strong password checks with suggestions
    const hasLowerCase = /[a-z]/.test(password);
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    if (!hasLowerCase) {
      suggestions.push('Thêm chữ thường');
    }
    if (!hasUpperCase) {
      suggestions.push('Thêm chữ hoa');
    }
    if (!hasNumbers) {
      suggestions.push('Thêm số');
    }
    if (!hasSpecialChar) {
      suggestions.push('Thêm ký tự đặc biệt (!@#$%^&*...)');
    }
    
    // Common password patterns
    if (/^(.)\1+$/.test(password)) {
      errors.push('Mật khẩu không được chứa toàn ký tự giống nhau');
    }
    if (/123456|password|qwerty|admin|letmein/i.test(password)) {
      errors.push('Mật khẩu quá đơn giản và dễ đoán');
    }
  }
  
  // Calculate strength
  let strength = 0;
  if (password.length >= 8) strength += 1;
  if (password.length >= 12) strength += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 1;
  if (/\d/.test(password)) strength += 1;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 1;
  
  const strengthLabel = ['Rất yếu', 'Yếu', 'Trung bình', 'Khá', 'Mạnh'][strength] || 'Rất yếu';
  const strengthColor = ['red', 'orange', 'yellow', 'blue', 'green'][strength] || 'red';
  
  return {
    isValid: errors.length === 0,
    errors,
    suggestions,
    strength,
    strengthLabel,
    strengthColor,
    type: errors.length > 0 ? 'error' : suggestions.length > 0 ? 'warning' : 'success'
  };
};

// Confirm password validation
export const validateConfirmPassword = (password, confirmPassword) => {
  const errors = [];
  
  if (!confirmPassword) {
    errors.push('Xác nhận mật khẩu là bắt buộc');
  } else if (password !== confirmPassword) {
    errors.push('Mật khẩu xác nhận không khớp');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    type: errors.length > 0 ? 'error' : 'success'
  };
};

// Name validation
export const validateName = (name, fieldName = 'Tên', required = false) => {
  const errors = [];
  
  if (required && !name) {
    errors.push(`${fieldName} là bắt buộc`);
  } else if (name) {
    if (name.length < 1) {
      errors.push(`${fieldName} không được để trống`);
    }
    if (name.length > 50) {
      errors.push(`${fieldName} không được quá 50 ký tự`);
    }
    if (!/^[a-zA-ZÀ-ỹĐđ\s'-]+$/.test(name)) {
      errors.push(`${fieldName} chỉ được chứa chữ cái, khoảng trắng, dấu nháy đơn và dấu gạch ngang`);
    }
    if (/^\s|\s$/.test(name)) {
      errors.push(`${fieldName} không được bắt đầu hoặc kết thúc bằng khoảng trắng`);
    }
    if (/\s{2,}/.test(name)) {
      errors.push(`${fieldName} không được chứa nhiều khoảng trắng liên tiếp`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    type: errors.length > 0 ? 'error' : 'success'
  };
};

// Phone validation
export const validatePhone = (phone, required = false) => {
  const errors = [];
  
  if (required && !phone) {
    errors.push('Số điện thoại là bắt buộc');
  } else if (phone) {
    // Remove all non-digit characters for validation
    const cleanPhone = phone.replace(/\D/g, '');
    
    if (cleanPhone.length < 10) {
      errors.push('Số điện thoại phải có ít nhất 10 chữ số');
    }
    if (cleanPhone.length > 15) {
      errors.push('Số điện thoại không được quá 15 chữ số');
    }
    
    // Vietnam phone number patterns
    const vietnamPatterns = [
      /^(84|0)?[3|5|7|8|9][0-9]{8}$/, // Mobile
      /^(84|0)?2[0-9]{8,9}$/ // Landline
    ];
    
    if (!vietnamPatterns.some(pattern => pattern.test(cleanPhone))) {
      errors.push('Số điện thoại không hợp lệ');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    type: errors.length > 0 ? 'error' : 'success'
  };
};

// Date validation
export const validateDate = (date, fieldName = 'Ngày', required = false) => {
  const errors = [];
  
  if (required && !date) {
    errors.push(`${fieldName} là bắt buộc`);
  } else if (date) {
    const dateObj = new Date(date);
    const today = new Date();
    const minDate = new Date('1900-01-01');
    
    if (isNaN(dateObj.getTime())) {
      errors.push(`${fieldName} không hợp lệ`);
    } else {
      if (dateObj < minDate) {
        errors.push(`${fieldName} không được nhỏ hơn năm 1900`);
      }
      if (dateObj > today) {
        errors.push(`${fieldName} không được lớn hơn ngày hiện tại`);
      }
      
      // Age validation for birth date
      if (fieldName.toLowerCase().includes('sinh')) {
        const age = Math.floor((today - dateObj) / (365.25 * 24 * 60 * 60 * 1000));
        if (age < 13) {
          errors.push('Bạn phải ít nhất 13 tuổi');
        }
        if (age > 120) {
          errors.push('Tuổi không hợp lệ');
        }
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    type: errors.length > 0 ? 'error' : 'success'
  };
};

// URL validation
export const validateUrl = (url, required = false) => {
  const errors = [];
  
  if (required && !url) {
    errors.push('URL là bắt buộc');
  } else if (url) {
    try {
      new URL(url);
      if (!/^https?:\/\//i.test(url)) {
        errors.push('URL phải bắt đầu với http:// hoặc https://');
      }
    } catch {
      errors.push('URL không hợp lệ');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    type: errors.length > 0 ? 'error' : 'success'
  };
};

// Generic required field validation
export const validateRequired = (value, fieldName) => {
  const errors = [];
  
  if (!value || (typeof value === 'string' && !value.trim())) {
    errors.push(`${fieldName} là bắt buộc`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    type: errors.length > 0 ? 'error' : 'success'
  };
};

// Array validation (for multi-select fields)
export const validateArray = (array, fieldName, minItems = 0, maxItems = null) => {
  const errors = [];
  
  if (!Array.isArray(array)) {
    errors.push(`${fieldName} phải là một danh sách`);
  } else {
    if (array.length < minItems) {
      errors.push(`${fieldName} phải có ít nhất ${minItems} mục`);
    }
    if (maxItems && array.length > maxItems) {
      errors.push(`${fieldName} không được quá ${maxItems} mục`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    type: errors.length > 0 ? 'error' : 'success'
  };
};

// Comprehensive form validation
export const validateForm = (formData, validationRules) => {
  const results = {};
  let isFormValid = true;
  
  Object.keys(validationRules).forEach(field => {
    const rules = validationRules[field];
    const value = formData[field];
    let fieldResult = { isValid: true, errors: [], type: 'success' };
    
    // Apply validation rules
    rules.forEach(rule => {
      let result;
      
      switch (rule.type) {
        case 'email':
          result = validateEmail(value);
          break;
        case 'username':
          result = validateUsername(value);
          break;
        case 'password':
          result = validatePassword(value);
          break;
        case 'confirmPassword':
          result = validateConfirmPassword(formData[rule.compareField], value);
          break;
        case 'name':
          result = validateName(value, rule.fieldName, rule.required);
          break;
        case 'phone':
          result = validatePhone(value, rule.required);
          break;
        case 'date':
          result = validateDate(value, rule.fieldName, rule.required);
          break;
        case 'url':
          result = validateUrl(value, rule.required);
          break;
        case 'required':
          result = validateRequired(value, rule.fieldName);
          break;
        case 'array':
          result = validateArray(value, rule.fieldName, rule.minItems, rule.maxItems);
          break;
        default:
          result = { isValid: true, errors: [], type: 'success' };
      }
      
      if (!result.isValid) {
        fieldResult.isValid = false;
        fieldResult.errors.push(...result.errors);
        fieldResult.type = 'error';
      }
      
      // Preserve password strength info
      if (rule.type === 'password' && result.strength !== undefined) {
        fieldResult.strength = result.strength;
        fieldResult.strengthLabel = result.strengthLabel;
        fieldResult.strengthColor = result.strengthColor;
        fieldResult.suggestions = result.suggestions || [];
      }
    });
    
    results[field] = fieldResult;
    if (!fieldResult.isValid) {
      isFormValid = false;
    }
  });
  
  return {
    isValid: isFormValid,
    fields: results
  };
};

// Debounce utility for real-time validation
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};