import { FormControl } from '@angular/forms';
import { cpfValidator, isValidCpf } from './cpf.validator';

describe('cpf.validator', () => {
  it('should validate known valid cpf', () => {
    expect(isValidCpf('529.982.247-25')).toBe(true);
    expect(isValidCpf('52998224725')).toBe(true);
  });

  it('should invalidate cpf with wrong check digits', () => {
    expect(isValidCpf('123.456.789-12')).toBe(false);
  });

  it('should invalidate cpf with all repeated digits', () => {
    expect(isValidCpf('111.111.111-11')).toBe(false);
  });

  it('should return validation error for invalid value', () => {
    const control = new FormControl('123.456.789-12', { nonNullable: true });

    expect(cpfValidator(control)).toEqual({ cpfInvalido: true });
  });

  it('should return null when empty to let required handle it', () => {
    const control = new FormControl('', { nonNullable: true });

    expect(cpfValidator(control)).toBeNull();
  });
});
