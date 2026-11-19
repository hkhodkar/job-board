import { Params } from '@angular/router';
import {
  ExperienceLevel,
  JobCategory,
  JobFilters,
  JobType,
  JobWithCompany,
  SortOption,
  WorkMode,
} from '../models/job.model';
import { CATEGORIES, JOB_TYPES, LEVELS, POSTED_WITHIN, SORT_OPTIONS, WORK_MODES } from '../models/options';

export const DEFAULT_FILTERS: JobFilters = {
  q: '',
  location: '',
  modes: [],
  types: [],
  levels: [],
  category: '',
  salaryMin: null,
  salaryMax: null,
  postedWithin: null,
  sort: 'newest',
};

const DAY = 24 * 60 * 60 * 1000;

/** Salary filter values are in thousands (USD / year), e.g. 80 = $80k. */
export function filterJobs(jobs: JobWithCompany[], f: JobFilters, now = new Date()): JobWithCompany[] {
  const terms = normalize(f.q).split(/\s+/).filter(Boolean);
  const location = normalize(f.location);
  const minSalary = f.salaryMin != null ? f.salaryMin * 1000 : null;
  const maxSalary = f.salaryMax != null ? f.salaryMax * 1000 : null;
  const postedAfter = f.postedWithin ? now.getTime() - f.postedWithin * DAY : null;

  return jobs.filter((job) => {
    if (terms.length) {
      const haystack = normalize(
        [job.title, job.company.name, job.location, job.summary, ...job.tags].join(' '),
      );
      if (!terms.every((t) => haystack.includes(t))) return false;
    }
    if (location && !normalize(job.location).includes(location)) return false;
    if (f.modes.length && !f.modes.includes(job.workMode)) return false;
    if (f.types.length && !f.types.includes(job.type)) return false;
    if (f.levels.length && !f.levels.includes(job.level)) return false;
    if (f.category && job.category !== f.category) return false;
    // ranges overlap: the job pays at least the minimum and starts below the maximum
    if (minSalary != null && job.salaryMax < minSalary) return false;
    if (maxSalary != null && job.salaryMin > maxSalary) return false;
    if (postedAfter != null && new Date(job.postedAt).getTime() < postedAfter) return false;
    return true;
  });
}

export function sortJobs<T extends { postedAt: string; salaryMin: number; salaryMax: number }>(
  jobs: T[],
  sort: SortOption,
): T[] {
  const copy = [...jobs];
  const byDate = (a: T, b: T) => b.postedAt.localeCompare(a.postedAt);
  switch (sort) {
    case 'salary-desc':
      return copy.sort((a, b) => b.salaryMax - a.salaryMax || b.salaryMin - a.salaryMin || byDate(a, b));
    case 'salary-asc':
      return copy.sort((a, b) => a.salaryMin - b.salaryMin || a.salaryMax - b.salaryMax || byDate(a, b));
    default:
      return copy.sort(byDate);
  }
}

export function countActiveFilters(f: JobFilters): number {
  return (
    (f.q ? 1 : 0) +
    (f.location ? 1 : 0) +
    f.modes.length +
    f.types.length +
    f.levels.length +
    (f.category ? 1 : 0) +
    (f.salaryMin != null || f.salaryMax != null ? 1 : 0) +
    (f.postedWithin ? 1 : 0)
  );
}

export function parseFilters(params: Params): JobFilters {
  return {
    q: str(params['q']),
    location: str(params['location']),
    modes: list<WorkMode>(params['mode'], WORK_MODES.map((o) => o.value)),
    types: list<JobType>(params['type'], JOB_TYPES.map((o) => o.value)),
    levels: list<ExperienceLevel>(params['level'], LEVELS.map((o) => o.value)),
    category: oneOf<JobCategory>(params['category'], CATEGORIES.map((o) => o.value)) ?? '',
    salaryMin: num(params['minSalary']),
    salaryMax: num(params['maxSalary']),
    postedWithin: oneOf<number>(num(params['posted']), POSTED_WITHIN.map((o) => o.value)) ?? null,
    sort: oneOf<SortOption>(params['sort'], SORT_OPTIONS.map((o) => o.value)) ?? 'newest',
  };
}

/** Only non-default values end up in the URL so links stay short. */
export function filtersToParams(f: JobFilters): Params {
  const params: Params = {};
  if (f.q.trim()) params['q'] = f.q.trim();
  if (f.location.trim()) params['location'] = f.location.trim();
  if (f.modes.length) params['mode'] = f.modes.join(',');
  if (f.types.length) params['type'] = f.types.join(',');
  if (f.levels.length) params['level'] = f.levels.join(',');
  if (f.category) params['category'] = f.category;
  if (f.salaryMin != null) params['minSalary'] = f.salaryMin;
  if (f.salaryMax != null) params['maxSalary'] = f.salaryMax;
  if (f.postedWithin) params['posted'] = f.postedWithin;
  if (f.sort !== 'newest') params['sort'] = f.sort;
  return params;
}

function normalize(value: string): string {
  return value.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').trim();
}

function str(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function num(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

function list<T extends string>(value: unknown, allowed: T[]): T[] {
  const parts = str(value).split(',');
  return allowed.filter((a) => parts.includes(a));
}

function oneOf<T>(value: unknown, allowed: T[]): T | undefined {
  return allowed.find((a) => a === value);
}
