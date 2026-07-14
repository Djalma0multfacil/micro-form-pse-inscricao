import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

const TELEFONE_PATTERN = /^\(\d{2}\)\s(?:\d{4}-\d{4}|\d{5}-\d{4})$/;

export const telefoneValidator: ValidatorFn = (
  control: AbstractControl<string>,
): ValidationErrors | null => {
  const value = control.value?.trim();
  if (!value) {
    return null;
  }

  return TELEFONE_PATTERN.test(value) ? null : { telefoneInvalido: true };
};
