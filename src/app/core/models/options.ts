import { ExperienceLevel, JobCategory, JobType, SortOption, WorkMode } from './job.model';

export interface Option<T> {
  value: T;
  label: string;
}

export const WORK_MODES: Option<WorkMode>[] = [
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'onsite', label: 'On-site' },
];

export const JOB_TYPES: Option<JobType>[] = [
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
];

export const LEVELS: Option<ExperienceLevel>[] = [
  { value: 'entry', label: 'Entry level' },
  { value: 'mid', label: 'Mid level' },
  { value: 'senior', label: 'Senior' },
  { value: 'lead', label: 'Lead / Principal' },
];

export const CATEGORIES: Option<JobCategory>[] = [
  { value: 'engineering', label: 'Engineering' },
  { value: 'design', label: 'Design' },
  { value: 'product', label: 'Product' },
  { value: 'data', label: 'Data & Analytics' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'sales', label: 'Sales' },
  { value: 'support', label: 'Customer Support' },
  { value: 'operations', label: 'Operations' },
];

export const POSTED_WITHIN: Option<number>[] = [
  { value: 1, label: 'Last 24 hours' },
  { value: 3, label: 'Last 3 days' },
  { value: 7, label: 'Last 7 days' },
  { value: 14, label: 'Last 14 days' },
  { value: 30, label: 'Last 30 days' },
];

export const SORT_OPTIONS: Option<SortOption>[] = [
  { value: 'newest', label: 'Newest first' },
  { value: 'salary-desc', label: 'Highest salary' },
  { value: 'salary-asc', label: 'Lowest salary' },
];

export function labelOf<T>(options: Option<T>[], value: T): string {
  return options.find((o) => o.value === value)?.label ?? String(value);
}
