import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Application } from '../../core/models/job.model';
import { JobsService } from '../../core/services/jobs.service';
import { ApplicationsStore } from '../../core/stores/applications.store';
import { CompanyLogo } from '../../shared/components/company-logo/company-logo';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { FileDrop } from '../../shared/components/file-drop/file-drop';
import { Icon } from '../../shared/components/icon/icon';
import { FileSizePipe, OptionLabelPipe, SalaryPipe, formatFileSize } from '../../shared/pipes/formatting.pipes';
import {
  CV_EXTENSIONS,
  CV_MAX_BYTES,
  fileTypeValidator,
  maxFileSizeValidator,
} from '../../shared/validators/file.validators';
import { linkedinValidator, urlValidator } from '../../shared/validators/url.validators';

export const COVER_LETTER_MIN = 50;
export const COVER_LETTER_MAX = 2000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_PATTERN = /^\+?[0-9][0-9\s().-]{5,19}$/;

type ApplyForm = FormGroup<{
  name: FormControl<string>;
  email: FormControl<string>;
  phone: FormControl<string>;
  linkedin: FormControl<string>;
  portfolio: FormControl<string>;
  coverLetter: FormControl<string>;
  cv: FormControl<File | null>;
}>;

type FieldName = keyof ApplyForm['controls'];

@Component({
  selector: 'app-apply-page',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    DatePipe,
    CompanyLogo,
    EmptyState,
    FileDrop,
    Icon,
    FileSizePipe,
    OptionLabelPipe,
    SalaryPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './apply-page.html',
  styleUrl: './apply-page.scss',
})
export class ApplyPage {
  private readonly jobs = inject(JobsService);
  private readonly applications = inject(ApplicationsStore);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly id = input.required<string>();

  protected readonly job = computed(() => this.jobs.byId(this.id()));
  protected readonly existing = computed(() => this.applications.forJob(this.id()));
  protected readonly submitted = signal(false);
  protected readonly sending = signal(false);
  protected readonly result = signal<Application | null>(null);

  protected readonly coverMin = COVER_LETTER_MIN;
  protected readonly coverMax = COVER_LETTER_MAX;
  protected readonly accept = '.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  protected readonly maxSizeLabel = formatFileSize(CV_MAX_BYTES);

  protected readonly form: ApplyForm = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2), Validators.maxLength(80)],
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(EMAIL_PATTERN)],
    }),
    phone: new FormControl('', { nonNullable: true, validators: [Validators.pattern(PHONE_PATTERN)] }),
    linkedin: new FormControl('', { nonNullable: true, validators: [linkedinValidator] }),
    portfolio: new FormControl('', { nonNullable: true, validators: [urlValidator] }),
    coverLetter: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(COVER_LETTER_MIN),
        Validators.maxLength(COVER_LETTER_MAX),
      ],
    }),
    cv: new FormControl<File | null>(null, [
      Validators.required,
      fileTypeValidator(CV_EXTENSIONS),
      maxFileSizeValidator(CV_MAX_BYTES),
    ]),
  });

  private readonly coverValue = toSignal(this.form.controls.coverLetter.valueChanges, { initialValue: '' });
  protected readonly coverLength = computed(() => this.coverValue().length);

  constructor() {
    // reuse contact details from the last application to save some typing
    const last = this.applications.items()[0];
    if (last) {
      this.form.patchValue({
        name: last.name,
        email: last.email,
        phone: last.phone ?? '',
        linkedin: last.linkedin ?? '',
        portfolio: last.portfolio ?? '',
      });
    }

    const title = inject(Title);
    effect(() => {
      const job = this.job();
      title.setTitle(job ? `Apply: ${job.title} · Hireline` : 'Job not found · Hireline');
    });
  }

  protected showError(name: FieldName): boolean {
    const control = this.form.controls[name];
    return control.invalid && (control.touched || this.submitted());
  }

  protected errorText(name: FieldName): string {
    return messageFor(name, this.form.controls[name]);
  }

  protected submit(): void {
    this.submitted.set(true);
    const job = this.job();
    if (!job || this.sending()) return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.focusFirstInvalid();
      return;
    }

    const v = this.form.getRawValue();
    this.sending.set(true);
    this.form.disable({ emitEvent: false });
    // pretend to upload the CV
    setTimeout(() => {
      const application = this.applications.add({
        jobId: job.id,
        jobTitle: job.title,
        companyName: job.company.name,
        name: v.name.trim(),
        email: v.email.trim(),
        phone: v.phone.trim() || undefined,
        linkedin: v.linkedin.trim() || undefined,
        portfolio: v.portfolio.trim() || undefined,
        coverLetter: v.coverLetter.trim(),
        cvName: v.cv!.name,
        cvSize: v.cv!.size,
      });
      this.sending.set(false);
      this.result.set(application);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 700);
  }

  private focusFirstInvalid(): void {
    setTimeout(() => {
      const el = this.host.nativeElement.querySelector<HTMLElement>(
        'input.invalid, textarea.invalid, .cv-field.invalid button',
      );
      el?.focus();
      el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    });
  }
}

function messageFor(name: FieldName, control: AbstractControl): string {
  const e = control.errors;
  if (!e) return '';
  switch (name) {
    case 'name':
      if (e['required']) return 'Please enter your full name.';
      if (e['minlength']) return 'Name looks too short.';
      return 'Name must be 80 characters or less.';
    case 'email':
      return e['required'] ? 'Email is required so the employer can reply.' : 'Enter a valid email, e.g. jane@example.com.';
    case 'phone':
      return 'Enter a valid phone number, e.g. +31 20 123 4567.';
    case 'linkedin':
      return 'Use your LinkedIn profile URL, e.g. https://www.linkedin.com/in/your-name.';
    case 'portfolio':
      return 'Enter a full URL starting with https://, e.g. https://janedoe.dev.';
    case 'coverLetter':
      if (e['required']) return 'Write a short cover letter.';
      if (e['minlength']) return `Please write at least ${COVER_LETTER_MIN} characters.`;
      return `Cover letter must be ${COVER_LETTER_MAX} characters or less.`;
    case 'cv':
      if (e['required']) return 'Please attach your CV.';
      if (e['fileType']) return `“.${e['fileType'].actual}” files are not accepted. Upload a PDF, DOC or DOCX file.`;
      if (e['fileEmpty']) return 'This file is empty. Please choose another one.';
      if (e['fileSize'])
        return `File is too large (${formatFileSize(e['fileSize'].actual)}). Maximum size is ${formatFileSize(e['fileSize'].max)}.`;
      return 'This file cannot be used.';
  }
}
