import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  input,
  signal,
  untracked,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Router, RouterLink } from '@angular/router';
import { startWith } from 'rxjs';
import { ExperienceLevel, JobCategory, JobType, WorkMode } from '../../../core/models/job.model';
import { CATEGORIES, JOB_TYPES, LEVELS, WORK_MODES } from '../../../core/models/options';
import { PostedJobDraft, PostedJobsStore } from '../../../core/stores/posted-jobs.store';
import { CompanyLogo } from '../../../shared/components/company-logo/company-logo';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { Icon } from '../../../shared/components/icon/icon';
import { TagInput } from '../../../shared/components/tag-input/tag-input';
import { ToastService } from '../../../shared/components/toast/toast';
import { OptionLabelPipe, SalaryPipe } from '../../../shared/pipes/formatting.pipes';
import { salaryRangeValidator } from '../../../shared/validators/salary-range.validator';

export const DESCRIPTION_MIN = 80;
export const DESCRIPTION_MAX = 3000;
export const MAX_REQUIREMENTS = 10;
export const MAX_TAGS = 8;

type SalaryGroup = FormGroup<{
  salaryMin: FormControl<number | null>;
  salaryMax: FormControl<number | null>;
}>;

type PostJobForm = FormGroup<{
  title: FormControl<string>;
  companyName: FormControl<string>;
  location: FormControl<string>;
  workMode: FormControl<WorkMode>;
  type: FormControl<JobType>;
  level: FormControl<ExperienceLevel>;
  category: FormControl<JobCategory | ''>;
  salary: SalaryGroup;
  description: FormControl<string>;
  requirements: FormArray<FormControl<string>>;
  tags: FormControl<string[]>;
}>;

const tagsRequired = (c: AbstractControl): ValidationErrors | null =>
  (c.value as string[]).length ? null : { required: true };

@Component({
  selector: 'app-post-job',
  imports: [ReactiveFormsModule, RouterLink, CompanyLogo, EmptyState, Icon, TagInput, OptionLabelPipe, SalaryPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './post-job.html',
  styleUrl: './post-job.scss',
})
export class PostJob {
  private readonly store = inject(PostedJobsStore);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /** set by the router on /employer/:id/edit */
  readonly id = input<string>();

  protected readonly modes = WORK_MODES;
  protected readonly types = JOB_TYPES;
  protected readonly levels = LEVELS;
  protected readonly categories = CATEGORIES;
  protected readonly descMin = DESCRIPTION_MIN;
  protected readonly descMax = DESCRIPTION_MAX;
  protected readonly maxRequirements = MAX_REQUIREMENTS;
  protected readonly maxTags = MAX_TAGS;

  protected readonly submitted = signal(false);
  protected readonly editing = computed(() => (this.id() ? this.store.get(this.id()!) : undefined));
  protected readonly notFound = computed(() => !!this.id() && !this.editing());

  protected readonly form: PostJobForm = new FormGroup({
    title: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(4), Validators.maxLength(80)],
    }),
    companyName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(60)],
    }),
    location: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(60)],
    }),
    workMode: new FormControl<WorkMode>('hybrid', { nonNullable: true }),
    type: new FormControl<JobType>('full-time', { nonNullable: true }),
    level: new FormControl<ExperienceLevel>('mid', { nonNullable: true }),
    category: new FormControl<JobCategory | ''>('', { nonNullable: true, validators: [Validators.required] }),
    salary: new FormGroup(
      {
        salaryMin: new FormControl<number | null>(null, [
          Validators.required,
          Validators.min(1000),
          Validators.max(1000000),
        ]),
        salaryMax: new FormControl<number | null>(null, [
          Validators.required,
          Validators.min(1000),
          Validators.max(1000000),
        ]),
      },
      { validators: salaryRangeValidator() },
    ),
    description: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(DESCRIPTION_MIN),
        Validators.maxLength(DESCRIPTION_MAX),
      ],
    }),
    requirements: new FormArray([this.requirementControl()]),
    tags: new FormControl<string[]>([], { nonNullable: true, validators: [tagsRequired] }),
  });

  protected readonly value = toSignal(this.form.valueChanges.pipe(startWith(this.form.getRawValue())), {
    initialValue: this.form.getRawValue(),
  });

  protected readonly preview = computed(() => {
    const v = this.value();
    return {
      title: v.title?.trim() || 'Job title',
      company: v.companyName?.trim() || 'Your company',
      location: v.location?.trim() || 'Location',
      workMode: v.workMode ?? 'hybrid',
      type: v.type ?? 'full-time',
      level: v.level ?? 'mid',
      category: v.category || '',
      salaryMin: v.salary?.salaryMin ?? null,
      salaryMax: v.salary?.salaryMax ?? null,
      description: v.description?.trim() || '',
      requirements: (v.requirements ?? []).map((r) => r?.trim()).filter((r): r is string => !!r),
      tags: v.tags ?? [],
    };
  });
  protected readonly descLength = computed(() => this.value().description?.length ?? 0);

  constructor() {
    effect(() => {
      const job = this.editing();
      if (!job) return;
      untracked(() => {
        this.requirements.clear();
        for (const r of job.requirements.length ? job.requirements : ['']) {
          this.requirements.push(this.requirementControl(r));
        }
        this.form.patchValue({
          title: job.title,
          companyName: job.companyName,
          location: job.location,
          workMode: job.workMode,
          type: job.type,
          level: job.level,
          category: job.category,
          salary: { salaryMin: job.salaryMin, salaryMax: job.salaryMax },
          description: job.summary,
          tags: job.tags,
        });
      });
    });

    const title = inject(Title);
    effect(() => {
      if (this.id()) title.setTitle('Edit job post · Hireline');
    });
  }

  protected get requirements(): FormArray<FormControl<string>> {
    return this.form.controls.requirements;
  }

  protected get salary(): SalaryGroup {
    return this.form.controls.salary;
  }

  protected show(control: AbstractControl): boolean {
    return control.invalid && (control.touched || this.submitted());
  }

  protected showSalaryRange(): boolean {
    const g = this.salary;
    return g.hasError('salaryRange') && (g.controls.salaryMax.touched || this.submitted());
  }

  protected salaryError(control: FormControl<number | null>, label: string): string {
    if (control.hasError('required')) return `${label} salary is required.`;
    if (control.hasError('min')) return 'Must be at least $1,000.';
    if (control.hasError('max')) return 'Must be $1,000,000 or less.';
    return '';
  }

  protected addRequirement(focus = true): void {
    if (this.requirements.length >= MAX_REQUIREMENTS) return;
    this.requirements.push(this.requirementControl());
    if (focus) this.focusRequirement(this.requirements.length - 1);
  }

  protected removeRequirement(index: number): void {
    if (this.requirements.length === 1) {
      this.requirements.at(0).setValue('');
      return;
    }
    this.requirements.removeAt(index);
    this.focusRequirement(Math.max(0, index - 1));
  }

  /** Enter in a requirement jumps to (or creates) the next bullet instead of submitting */
  protected onRequirementEnter(event: Event, index: number): void {
    event.preventDefault();
    if (index < this.requirements.length - 1) {
      this.focusRequirement(index + 1);
    } else if (this.requirements.at(index).value.trim()) {
      this.addRequirement();
    }
  }

  protected submit(): void {
    this.submitted.set(true);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.focusFirstInvalid();
      return;
    }
    const v = this.form.getRawValue();
    const draft: PostedJobDraft = {
      title: v.title,
      companyName: v.companyName,
      location: v.location,
      workMode: v.workMode,
      type: v.type,
      level: v.level,
      category: v.category as JobCategory,
      salaryMin: v.salary.salaryMin!,
      salaryMax: v.salary.salaryMax!,
      description: v.description,
      requirements: v.requirements,
      tags: v.tags,
    };
    const existing = this.editing();
    const job = existing ? this.store.update(existing.id, draft) : this.store.create(draft);
    this.toast.show(existing ? 'Job post updated' : 'Your job is live!');
    void this.router.navigate(['/jobs', job!.id]);
  }

  private requirementControl(value = ''): FormControl<string> {
    return new FormControl(value, {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(160)],
    });
  }

  private focusRequirement(index: number): void {
    setTimeout(() => {
      this.host.nativeElement.querySelector<HTMLInputElement>(`#req-${index}`)?.focus();
    });
  }

  private focusFirstInvalid(): void {
    setTimeout(() => {
      const el = this.host.nativeElement.querySelector<HTMLElement>(
        '.post-form .invalid input, .post-form input.invalid, .post-form select.invalid, .post-form textarea.invalid',
      );
      el?.focus();
      el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    });
  }
}
