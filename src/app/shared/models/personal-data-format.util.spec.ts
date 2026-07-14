import {
  formatCpfForDisplay,
  formatDateToApi,
  formatPhoneForDisplay,
  parseApiDate,
  sanitizeCpf,
  sanitizePhone,
} from './personal-data-format.util';

describe('personal-data-format.util', () => {
  it('should sanitize cpf with uppercase alphanumeric suffix', () => {
    expect(sanitizeCpf('123.456.789-ab')).toBe('123456789AB');
    expect(formatCpfForDisplay('123456789ab')).toBe('123.456.789-AB');
  });

  it('should ignore non-numeric characters before cpf suffix', () => {
    expect(sanitizeCpf('123a456b789cd')).toBe('123456789CD');
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
