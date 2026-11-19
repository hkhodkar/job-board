import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

function parseUrl(value: string): URL | null {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url : null;
  } catch {
    return null;
  }
}

/** Optional http(s) URL with a real-looking host */
export const urlValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = (control.value as string | null)?.trim();
  if (!value) return null;
  const url = parseUrl(value);
  return url && url.hostname.includes('.') ? null : { url: true };
};

/** Optional LinkedIn profile URL, e.g. https://www.linkedin.com/in/jane-doe */
export const linkedinValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = (control.value as string | null)?.trim();
  if (!value) return null;
  const url = parseUrl(value);
  const ok =
    !!url &&
    /(^|\.)linkedin\.com$/i.test(url.hostname) &&
    /^\/(in|pub)\/[^/]+/i.test(url.pathname);
  return ok ? null : { linkedin: true };
};
