import { FormControl } from '@angular/forms';
import { telefoneValidator } from './telefone.validator';

describe('telefone.validator', () => {
  it('should accept valid 10-digit phone number', () => {
    const control = new FormControl('(11) 3456-7890', { nonNullable: true });

    expect(telefoneValidator(control)).toBeNull();
  });

  it('should accept valid 11-digit phone number', () => {
    const control = new FormControl('(11) 91234-5678', { nonNullable: true });

    expect(telefoneValidator(control)).toBeNull();
  });

  it('should return null for empty value to let required handle it', () => {
    const control = new FormControl('', { nonNullable: true });

    expect(telefoneValidator(control)).toBeNull();
  });

  it('should return error for phone without area code parentheses', () => {
    const control = new FormControl('11 91234-5678', { nonNullable: true });

    expect(telefoneValidator(control)).toEqual({ telefoneInvalido: true });
  });

  it('should return error for phone with too few digits', () => {
    const control = new FormControl('(11) 9123-567', { nonNullable: true });

    expect(telefoneValidator(control)).toEqual({ telefoneInvalido: true });
  });

  it('should return error for phone with letters', () => {
    const control = new FormControl('(11) 9abc-5678', { nonNullable: true });

    expect(telefoneValidator(control)).toEqual({ telefoneInvalido: true });
  });
});
