import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Group validator: max salary must not be lower than min salary.
 * The error lives on the group so the template can show it under both fields.
 */
export function salaryRangeValidator(minKey = 'salaryMin', maxKey = 'salaryMax'): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const min = group.get(minKey)?.value as number | null | undefined;
    const max = group.get(maxKey)?.value as number | null | undefined;
    if (min == null || max == null || Number.isNaN(min) || Number.isNaN(max)) return null;
    return max < min ? { salaryRange: { min, max } } : null;
  };
}
