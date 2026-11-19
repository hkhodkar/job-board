import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { debounceTime, map, merge } from 'rxjs';
import { JobFilters, JobWithCompany, SortOption } from '../../../core/models/job.model';
import {
  CATEGORIES,
  JOB_TYPES,
  LEVELS,
  POSTED_WITHIN,
  SORT_OPTIONS,
  WORK_MODES,
  labelOf,
} from '../../../core/models/options';
import { JobsService } from '../../../core/services/jobs.service';
import {
  DEFAULT_FILTERS,
  countActiveFilters,
  filterJobs,
  filtersToParams,
  parseFilters,
  sortJobs,
} from '../../../core/utils/job-filters';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { Icon } from '../../../shared/components/icon/icon';
import { JobCard } from '../../../shared/components/job-card/job-card';

type ListKey = 'modes' | 'types' | 'levels';

interface ActiveChip {
  label: string;
  clear: Partial<JobFilters>;
}

const PAGE_SIZE = 12;

@Component({
  selector: 'app-job-list',
  imports: [ReactiveFormsModule, RouterLink, JobCard, Icon, EmptyState],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './job-list.html',
  styleUrl: './job-list.scss',
})
export class JobList {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly jobsService = inject(JobsService);

  protected readonly modes = WORK_MODES;
  protected readonly types = JOB_TYPES;
  protected readonly levels = LEVELS;
  protected readonly categories = CATEGORIES;
  protected readonly postedOptions = POSTED_WITHIN;
  protected readonly sortOptions = SORT_OPTIONS;

  // text and number inputs are debounced before they reach the URL
  protected readonly keyword = new FormControl('', { nonNullable: true });
  protected readonly location = new FormControl('', { nonNullable: true });
  protected readonly salaryMin = new FormControl<number | null>(null);
  protected readonly salaryMax = new FormControl<number | null>(null);

  private readonly params = toSignal(this.route.queryParams, { initialValue: {} });
  protected readonly filters = computed(() => parseFilters(this.params()));
  protected readonly activeCount = computed(() => countActiveFilters(this.filters()));
  protected readonly filtersOpen = signal(false);
  protected readonly visible = signal(PAGE_SIZE);

  protected readonly allJobs = this.jobsService.jobs;
  protected readonly results = computed(() =>
    sortJobs(filterJobs(this.allJobs(), this.filters()), this.filters().sort),
  );
  protected readonly page = computed(() => this.results().slice(0, this.visible()));
  protected readonly remoteCount = computed(() => this.allJobs().filter((j) => j.workMode === 'remote').length);
  protected readonly companyCount = computed(() => new Set(this.allJobs().map((j) => j.company.id)).size);
  protected readonly salaryInvalid = computed(() => {
    const { salaryMin, salaryMax } = this.filters();
    return salaryMin != null && salaryMax != null && salaryMin > salaryMax;
  });

  /** Counts per option with every other filter applied, so users see what a click would give */
  protected readonly facetCounts = computed(() => {
    const f = this.filters();
    const jobs = this.allJobs();
    const countBy = (key: ListKey, field: keyof JobWithCompany) => {
      const counts = new Map<string, number>();
      for (const job of filterJobs(jobs, { ...f, [key]: [] })) {
        const value = job[field] as string;
        counts.set(value, (counts.get(value) ?? 0) + 1);
      }
      return counts;
    };
    return {
      modes: countBy('modes', 'workMode'),
      types: countBy('types', 'type'),
      levels: countBy('levels', 'level'),
    };
  });

  protected readonly chips = computed<ActiveChip[]>(() => {
    const f = this.filters();
    const chips: ActiveChip[] = [];
    if (f.q) chips.push({ label: `“${f.q}”`, clear: { q: '' } });
    if (f.location) chips.push({ label: `Location: ${f.location}`, clear: { location: '' } });
    for (const m of f.modes) chips.push({ label: labelOf(WORK_MODES, m), clear: { modes: f.modes.filter((x) => x !== m) } });
    for (const t of f.types) chips.push({ label: labelOf(JOB_TYPES, t), clear: { types: f.types.filter((x) => x !== t) } });
    for (const l of f.levels) chips.push({ label: labelOf(LEVELS, l), clear: { levels: f.levels.filter((x) => x !== l) } });
    if (f.category) chips.push({ label: labelOf(CATEGORIES, f.category), clear: { category: '' } });
    if (f.salaryMin != null || f.salaryMax != null) {
      const label =
        f.salaryMin != null && f.salaryMax != null
          ? `$${f.salaryMin}k – $${f.salaryMax}k`
          : f.salaryMin != null
            ? `From $${f.salaryMin}k`
            : `Up to $${f.salaryMax}k`;
      chips.push({ label, clear: { salaryMin: null, salaryMax: null } });
    }
    if (f.postedWithin) chips.push({ label: labelOf(POSTED_WITHIN, f.postedWithin), clear: { postedWithin: null } });
    return chips;
  });

  constructor() {
    // URL -> inputs (initial load, back/forward, "clear all")
    effect(() => {
      const f = this.filters();
      untracked(() => {
        this.syncControl(this.keyword, f.q);
        this.syncControl(this.location, f.location);
        this.syncControl(this.salaryMin, f.salaryMin);
        this.syncControl(this.salaryMax, f.salaryMax);
        this.visible.set(PAGE_SIZE);
      });
    });

    // inputs -> URL
    merge(
      this.keyword.valueChanges.pipe(map((q) => ({ q }))),
      this.location.valueChanges.pipe(map((location) => ({ location }))),
      this.salaryMin.valueChanges.pipe(map((salaryMin) => ({ salaryMin: clean(salaryMin) }))),
      this.salaryMax.valueChanges.pipe(map((salaryMax) => ({ salaryMax: clean(salaryMax) }))),
    )
      .pipe(debounceTime(300), takeUntilDestroyed(inject(DestroyRef)))
      .subscribe(() => this.applyInputs());
  }

  protected search(event: Event): void {
    event.preventDefault();
    this.applyInputs();
  }

  protected isChecked(key: ListKey, value: string): boolean {
    return (this.filters()[key] as string[]).includes(value);
  }

  protected toggle(key: ListKey, value: string): void {
    const current = this.filters()[key] as string[];
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    this.update({ [key]: next });
  }

  protected setCategory(value: string): void {
    this.update({ category: value as JobFilters['category'] });
  }

  protected setPosted(value: string): void {
    this.update({ postedWithin: value ? Number(value) : null });
  }

  protected setSort(value: string): void {
    this.update({ sort: value as SortOption });
  }

  protected removeChip(chip: ActiveChip): void {
    this.update(chip.clear);
  }

  protected clearAll(): void {
    this.update({ ...DEFAULT_FILTERS, sort: this.filters().sort });
  }

  protected toggleFilters(): void {
    this.filtersOpen.update((v) => !v);
  }

  protected showMore(): void {
    this.visible.update((v) => v + PAGE_SIZE);
  }

  protected countFor(key: ListKey, value: string): number {
    return this.facetCounts()[key].get(value) ?? 0;
  }

  private applyInputs(): void {
    this.update({
      q: this.keyword.value,
      location: this.location.value,
      salaryMin: clean(this.salaryMin.value),
      salaryMax: clean(this.salaryMax.value),
    });
  }

  private update(patch: Partial<JobFilters>): void {
    const next = { ...this.filters(), ...patch };
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: filtersToParams(next),
      replaceUrl: true,
    });
  }

  private syncControl<T>(control: FormControl<T>, value: T): void {
    const current = control.value;
    const same =
      typeof value === 'string' ? (current as string).trim() === value : clean(current as number | null) === value;
    if (!same) control.setValue(value, { emitEvent: false });
  }
}

function clean(value: number | null | undefined): number | null {
  return value == null || Number.isNaN(value) || value < 0 ? null : value;
}
