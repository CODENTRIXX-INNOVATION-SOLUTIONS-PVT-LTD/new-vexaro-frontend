type BackendError = {
  error?: {
    message?: string;
    errors?: Array<{ field?: string; message?: string }>;
    code?: string;
  };
  message?: string;
  status?: number;
};

const technicalPatterns = [
  /E11000/i,
  /Validation failed/i,
  /CastError/i,
  /Prisma/i,
  /Mongo/i,
  /Sequelize/i,
  /SQL/i,
  /AxiosError/i,
  /HttpError/i,
  /Cannot (GET|POST|PUT|PATCH|DELETE)/i,
  /\bat\s+\S+\s+\(/,
  /^[A-Z0-9_:-]{4,}$/,
];

const codeMessages: Record<string, string> = {
  INSUFFICIENT_BALANCE: 'Your wallet balance is not enough for this action.',
  INSUFFICIENT_WALLET_BALANCE: 'Your wallet balance is not enough for this action.',
  DUPLICATE_EMAIL: 'This email address is already in use. Please use a different email.',
  EMAIL_ALREADY_EXISTS: 'This email address is already in use. Please use a different email.',
  INVALID_TOKEN: 'This link is invalid, expired, or already used. Please request a new link.',
  TOKEN_EXPIRED: 'This link has expired. Please request a new link.',
  UNAUTHORIZED: 'You are not allowed to perform this action.',
  FORBIDDEN: 'You are not allowed to perform this action.',
};

export function getUserFriendlyError(error: BackendError | unknown, fallback: string): string {
  const err = error as BackendError;
  const errors = err?.error?.errors;

  if (Array.isArray(errors) && errors.length) {
    const messages = errors
      .map((item) => formatFieldError(item.field, item.message))
      .filter(Boolean);

    if (messages.length && !messages.some(isTechnicalMessage)) {
      return messages.join(' ');
    }
  }

  const raw =
    err?.error?.code ||
    err?.error?.message ||
    err?.message ||
    '';

  const message = String(raw).trim();
  const mapped = mapKnownMessage(message);
  if (mapped) {
    return mapped;
  }

  if (!message || isTechnicalMessage(message)) {
    return fallbackForStatus(err?.status, fallback);
  }

  return message;
}

function formatFieldError(field = '', message = ''): string {
  const cleanMessage = String(message).trim();
  if (!cleanMessage) {
    return '';
  }

  const mapped = mapKnownMessage(cleanMessage);
  if (mapped) {
    return mapped;
  }

  const label = field
    ? `${field.replace(/([A-Z])/g, ' $1').replace(/[_-]/g, ' ').trim()}: `
    : '';

  return `${label}${cleanMessage}.`.replace(/\.\.+$/, '.');
}

function mapKnownMessage(message: string): string {
  const normalized = message.trim();
  const code = normalized.toUpperCase();

  if (codeMessages[code]) {
    return codeMessages[code];
  }

  if (/duplicate|already exists|already registered|E11000/i.test(normalized)) {
    return 'This information is already in use. Please check it and try again.';
  }

  if (/invalid token|token expired|expired token/i.test(normalized)) {
    return 'This link is invalid, expired, or already used. Please request a new link.';
  }

  if (/validation failed|bad request/i.test(normalized)) {
    return 'Please check the details and try again.';
  }

  if (/unauthorized|forbidden/i.test(normalized)) {
    return 'You are not allowed to perform this action.';
  }

  return '';
}

function isTechnicalMessage(message: string): boolean {
  return technicalPatterns.some((pattern) => pattern.test(message));
}

function fallbackForStatus(status: number | undefined, fallback: string): string {
  if (status === 0) {
    return 'We could not connect to the server. Please check your internet connection and try again.';
  }

  if (status === 401 || status === 403) {
    return fallback || 'You are not allowed to perform this action.';
  }

  if (status && status >= 500) {
    return 'Something went wrong on our side. Please try again in a moment.';
  }

  return fallback;
}
