import { FormControl, FormGroup } from '@angular/forms';
import { CV_MAX_BYTES, fileTypeValidator, maxFileSizeValidator } from './file.validators';
import { salaryRangeValidator } from './salary-range.validator';
import { linkedinValidator, urlValidator } from './url.validators';

describe('salaryRangeValidator', () => {
  const group = (min: number | null, max: number | null) =>
    new FormGroup(
      { salaryMin: new FormControl(min), salaryMax: new FormControl(max) },
      { validators: salaryRangeValidator() },
    );

  it('accepts a valid or equal range', () => {
    expect(group(60000, 90000).errors).toBeNull();
    expect(group(70000, 70000).errors).toBeNull();
  });

  it('flags a maximum below the minimum', () => {
    expect(group(90000, 60000).errors).toEqual({ salaryRange: { min: 90000, max: 60000 } });
  });

  it('stays quiet while one of the fields is empty', () => {
    expect(group(null, 50000).errors).toBeNull();
    expect(group(50000, null).errors).toBeNull();
  });

  it('re-validates when either field changes', () => {
    const g = group(50000, 80000);
    g.controls.salaryMin.setValue(100000);
    expect(g.hasError('salaryRange')).toBe(true);
    g.controls.salaryMax.setValue(120000);
    expect(g.valid).toBe(true);
  });
});

describe('file validators', () => {
  const file = (name: string, size: number) => new File([new Uint8Array(size)], name);
  const typeCheck = fileTypeValidator(['pdf', 'doc', 'docx']);
  const sizeCheck = maxFileSizeValidator(CV_MAX_BYTES);

  it('accepts PDF, DOC and DOCX in any case', () => {
    for (const name of ['cv.pdf', 'cv.DOC', 'my.cv.docx']) {
      expect(typeCheck(new FormControl(file(name, 10)))).toBeNull();
    }
  });

  it('rejects other file types', () => {
    expect(typeCheck(new FormControl(file('photo.png', 10)))).toEqual({
      fileType: { allowed: ['pdf', 'doc', 'docx'], actual: 'png' },
    });
    expect(typeCheck(new FormControl(file('README', 10)))?.['fileType'].actual).toBe('unknown');
  });

  it('enforces the 5 MB limit and rejects empty files', () => {
    expect(sizeCheck(new FormControl(file('cv.pdf', CV_MAX_BYTES)))).toBeNull();
    expect(sizeCheck(new FormControl(file('cv.pdf', CV_MAX_BYTES + 1)))).toEqual({
      fileSize: { max: CV_MAX_BYTES, actual: CV_MAX_BYTES + 1 },
    });
    expect(sizeCheck(new FormControl(file('cv.pdf', 0)))).toEqual({ fileEmpty: true });
  });
});

describe('url validators', () => {
  const check = (v: string, fn = urlValidator) => fn(new FormControl(v));

  it('treats empty values as valid (optional fields)', () => {
    expect(check('')).toBeNull();
    expect(check('', linkedinValidator)).toBeNull();
  });

  it('requires a full http(s) URL', () => {
    expect(check('https://janedoe.dev')).toBeNull();
    expect(check('janedoe.dev')).toEqual({ url: true });
    expect(check('ftp://janedoe.dev')).toEqual({ url: true });
    expect(check('https://localhost')).toEqual({ url: true });
  });

  it('only accepts LinkedIn profile URLs for the LinkedIn field', () => {
    expect(check('https://www.linkedin.com/in/jane-doe', linkedinValidator)).toBeNull();
    expect(check('https://linkedin.com/in/jane', linkedinValidator)).toBeNull();
    expect(check('https://www.linkedin.com/company/acme', linkedinValidator)).toEqual({ linkedin: true });
    expect(check('https://fakelinkedin.com/in/jane', linkedinValidator)).toEqual({ linkedin: true });
  });
});
