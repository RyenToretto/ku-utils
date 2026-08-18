export const REGEX = {
  PHONE: /^1[3-9]\d{9}$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  // eslint-disable-next-line @stylistic/max-len
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)$/,
  ID_CARD: /^\d{17}[\dXx]$/,
  CHINESE: /^[\u4e00-\u9fa5]+$/,
  INTEGER: /^-?\d+$/,
  POSITIVE_INTEGER: /^[1-9]\d*$/,
  DECIMAL: /^-?\d+\.\d+$/,
  IP_V4: /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/,
  PASSWORD_STRONG: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/,
} as const;
