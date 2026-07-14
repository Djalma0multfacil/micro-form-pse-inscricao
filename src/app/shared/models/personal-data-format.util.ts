const CPF_PREFIX_DIGITS = 9;
const CPF_SUFFIX_DIGITS = 2;
const CPF_TOTAL_DIGITS = CPF_PREFIX_DIGITS + CPF_SUFFIX_DIGITS;
const PHONE_MAX_DIGITS = 11;
const DATE_SEGMENT_COUNT = 3;

export function sanitizeCpf(value: string): string {
  return value.replace(/\D/g, '').slice(0, CPF_TOTAL_DIGITS);
}

export function formatCpfForDisplay(value: string): string {
  const sanitized = sanitizeCpf(value);
  const prefix = sanitized.slice(0, CPF_PREFIX_DIGITS);
  const suffix = sanitized.slice(CPF_PREFIX_DIGITS, CPF_PREFIX_DIGITS + CPF_SUFFIX_DIGITS);

  const firstPart = prefix.slice(0, 3);
  const secondPart = prefix.slice(3, 6);
  const thirdPart = prefix.slice(6, 9);

  const dottedPrefix = [firstPart, secondPart, thirdPart].filter(Boolean).join('.');
  if (!suffix) {
    return dottedPrefix;
  }

  return `${dottedPrefix}-${suffix}`;
}

export function sanitizePhone(value: string): string {
  return value.replace(/\D/g, '').slice(0, PHONE_MAX_DIGITS);
}

export function formatPhoneForDisplay(value: string): string {
  const digits = sanitizePhone(value);
  if (!digits) {
    return '';
  }

  const ddd = digits.slice(0, 2);
  const localNumber = digits.slice(2);

  if (digits.length <= 2) {
    return `(${ddd}`;
  }

  if (digits.length <= 6) {
    return `(${ddd}) ${localNumber}`;
  }

  const middleLength = digits.length <= 10 ? 4 : 5;
  const middle = localNumber.slice(0, middleLength);
  const ending = localNumber.slice(middleLength, middleLength + 4);

  if (!ending) {
    return `(${ddd}) ${middle}`;
  }

  return `(${ddd}) ${middle}-${ending}`;
}

export function parseApiDate(value?: string | null): Date | null {
  if (!value) {
    return null;
  }

  const [yearRaw, monthRaw, dayRaw] = value.split('T')[0].split('-');
  const year = Number.parseInt(yearRaw, 10);
  const month = Number.parseInt(monthRaw, 10);
  const day = Number.parseInt(dayRaw, 10);

  if (
    [yearRaw, monthRaw, dayRaw].length !== DATE_SEGMENT_COUNT ||
    Number.isNaN(year) ||
    Number.isNaN(month) ||
    Number.isNaN(day)
  ) {
    return null;
  }

  return new Date(year, month - 1, day);
}

export function formatDateToApi(value: Date | null): string | undefined {
  if (!value || Number.isNaN(value.getTime())) {
    return undefined;
  }

  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}
