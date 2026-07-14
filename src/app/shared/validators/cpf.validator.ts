import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

const CPF_DIGITS_LENGTH = 11;
const FIRST_CHECK_DIGIT_POSITION = 9;
const SECOND_CHECK_DIGIT_POSITION = 10;

function sanitizeCpfDigits(value: string): string {
  return value.replace(/\D/g, '').slice(0, CPF_DIGITS_LENGTH);
}

function hasAllDigitsEqual(cpfDigits: string): boolean {
  return /^([0-9])\1{10}$/.test(cpfDigits);
}

function calculateCheckDigit(cpfDigits: string, startWeight: number): number {
  let sum = 0;

  for (let index = 0; index < startWeight - 1; index += 1) {
    sum += Number(cpfDigits[index]) * (startWeight - index);
  }

  const remainder = (sum * 10) % 11;
  return remainder === 10 ? 0 : remainder;
}

export function isValidCpf(value: string): boolean {
  const cpfDigits = sanitizeCpfDigits(value);

  if (cpfDigits.length !== CPF_DIGITS_LENGTH || hasAllDigitsEqual(cpfDigits)) {
    return false;
  }

  const firstCheckDigit = calculateCheckDigit(cpfDigits, 10);
  const secondCheckDigit = calculateCheckDigit(cpfDigits, 11);

  return (
    firstCheckDigit === Number(cpfDigits[FIRST_CHECK_DIGIT_POSITION]) &&
    secondCheckDigit === Number(cpfDigits[SECOND_CHECK_DIGIT_POSITION])
  );
}

export const cpfValidator: ValidatorFn = (
  control: AbstractControl<string>,
): ValidationErrors | null => {
  const value = control.value?.trim();
  if (!value) {
    return null;
  }

  return isValidCpf(value) ? null : { cpfInvalido: true };
};
