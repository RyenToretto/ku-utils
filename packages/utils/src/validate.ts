export interface PasswordValidationRules {
  minLength: number;
  requireLetters: boolean;
  requireNumbers: boolean;
  requireSpecialChars?: boolean;
  requireUppercase?: boolean;
  requireLowercase?: boolean;
}

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

export const DEFAULT_PASSWORD_RULES: PasswordValidationRules = {
  minLength: 6,
  requireLetters: true,
  requireNumbers: true,
  requireSpecialChars: false,
  requireUppercase: false,
  requireLowercase: false,
};

export const PASSWORD_REGEX = {
  LETTERS: /[a-zA-Z]/,
  NUMBERS: /[0-9]/,
  UPPERCASE: /[A-Z]/,
  LOWERCASE: /[a-z]/,
  SPECIAL_CHARS: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>?/]/,
} as const;

export function validatePasswordLength(password: string, minLength = 6): boolean {
  return password.length >= minLength;
}

export function validatePasswordHasLetters(password: string): boolean {
  return PASSWORD_REGEX.LETTERS.test(password);
}

export function validatePasswordHasNumbers(password: string): boolean {
  return PASSWORD_REGEX.NUMBERS.test(password);
}

export function validatePasswordHasUppercase(password: string): boolean {
  return PASSWORD_REGEX.UPPERCASE.test(password);
}

export function validatePasswordHasLowercase(password: string): boolean {
  return PASSWORD_REGEX.LOWERCASE.test(password);
}

export function validatePasswordHasSpecialChars(password: string): boolean {
  return PASSWORD_REGEX.SPECIAL_CHARS.test(password);
}

export function validatePassword(
  password: string,
  rules: Partial<PasswordValidationRules> = DEFAULT_PASSWORD_RULES,
): PasswordValidationResult {
  const finalRules = { ...DEFAULT_PASSWORD_RULES, ...rules };
  const errors: string[] = [];

  if (!validatePasswordLength(password, finalRules.minLength)) {
    errors.push(`Password must be at least ${finalRules.minLength} characters`);
  }
  if (finalRules.requireLetters && !validatePasswordHasLetters(password)) {
    errors.push('Password must contain letters');
  }
  if (finalRules.requireNumbers && !validatePasswordHasNumbers(password)) {
    errors.push('Password must contain numbers');
  }
  if (finalRules.requireUppercase && !validatePasswordHasUppercase(password)) {
    errors.push('Password must contain uppercase letters');
  }
  if (finalRules.requireLowercase && !validatePasswordHasLowercase(password)) {
    errors.push('Password must contain lowercase letters');
  }
  if (finalRules.requireSpecialChars && !validatePasswordHasSpecialChars(password)) {
    errors.push('Password must contain special characters');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validatePasswordQuick(password: string): PasswordValidationResult {
  return validatePassword(password, {
    minLength: 6,
    requireLetters: true,
    requireNumbers: true,
  });
}
