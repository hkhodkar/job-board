import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const CV_EXTENSIONS = ['pdf', 'doc', 'docx'];
export const CV_MAX_BYTES = 5 * 1024 * 1024;

export function fileExtension(name: string): string {
  const dot = name.lastIndexOf('.');
  return dot > -1 ? name.slice(dot + 1).toLowerCase() : '';
}

export function fileTypeValidator(extensions: string[]): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const file = control.value as File | null;
    if (!file) return null;
    return extensions.includes(fileExtension(file.name))
      ? null
      : { fileType: { allowed: extensions, actual: fileExtension(file.name) || 'unknown' } };
  };
}

export function maxFileSizeValidator(maxBytes: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const file = control.value as File | null;
    if (!file) return null;
    if (file.size === 0) return { fileEmpty: true };
    return file.size > maxBytes ? { fileSize: { max: maxBytes, actual: file.size } } : null;
  };
}
