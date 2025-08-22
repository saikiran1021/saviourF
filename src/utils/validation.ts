export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[a-z][a-z0-9]*@gmail\.com$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): { valid: boolean; message?: string } => {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  
  if (!/(?=.*\d)/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  
  return { valid: true };
};

export const validateName = (name: string): boolean => {
  return name.trim().length > 0 && /^[a-zA-Z\s]+$/.test(name.trim());
};

export const validateAge = (age: number): boolean => {
  return age >= 18 && age <= 65;
};