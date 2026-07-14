import {
  formatCpfForDisplay,
  formatDateToApi,
  formatPhoneForDisplay,
  parseApiDate,
  sanitizeCpf,
  sanitizePhone,
} from './personal-data-format.util';

describe('personal-data-format.util', () => {
  it('should sanitize cpf keeping only numeric digits', () => {
    expect(sanitizeCpf('123.456.789-25')).toBe('12345678925');
    expect(formatCpfForDisplay('12345678925')).toBe('123.456.789-25');
  });

  it('should ignore non-numeric characters in cpf input', () => {
    expect(sanitizeCpf('123a456b789c25')).toBe('12345678925');
  });

  it('should format telefone for 10 and 11 digits', () => {
    expect(formatPhoneForDisplay('1198765432')).toBe('(11) 9876-5432');
    expect(formatPhoneForDisplay('11998765432')).toBe('(11) 99876-5432');
  });

  it('should sanitize telefone keeping only digits', () => {
    expect(sanitizePhone('(11) 99876-5432')).toBe('11998765432');
  });

  it('should parse and format api date consistently', () => {
    const date = parseApiDate('1990-01-15');

    expect(date).toEqual(new Date(1990, 0, 15));
    expect(formatDateToApi(date)).toBe('1990-01-15');
  });
});
