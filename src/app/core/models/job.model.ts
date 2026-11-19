export type WorkMode = 'remote' | 'hybrid' | 'onsite';
export type JobType = 'full-time' | 'part-time' | 'contract' | 'internship';
export type ExperienceLevel = 'entry' | 'mid' | 'senior' | 'lead';
export type JobCategory =
  | 'engineering'
  | 'design'
  | 'product'
  | 'data'
  | 'marketing'
  | 'sales'
  | 'support'
  | 'operations';

export interface Company {
  id: string;
  name: string;
  industry: string;
  size: string;
  headquarters: string;
  founded?: number;
  website?: string;
  about: string;
  color: string;
}

export interface Job {
  id: string;
  title: string;
  companyId: string;
  location: string;
  workMode: WorkMode;
  type: JobType;
  level: ExperienceLevel;
  category: JobCategory;
  salaryMin: number;
  salaryMax: number;
  postedAt: string;
  tags: string[];
  summary: string;
  responsibilities: string[];
  requirements: string[];
  niceToHave: string[];
  benefits: string[];
  applicants?: number;
  /** true for jobs created through the "Post a job" form */
  isOwn?: boolean;
  updatedAt?: string;
}

export interface JobWithCompany extends Job {
  company: Company;
}

export type SortOption = 'newest' | 'salary-desc' | 'salary-asc';

export interface JobFilters {
  q: string;
  location: string;
  modes: WorkMode[];
  types: JobType[];
  levels: ExperienceLevel[];
  category: JobCategory | '';
  salaryMin: number | null;
  salaryMax: number | null;
  postedWithin: number | null;
  sort: SortOption;
}

export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  name: string;
  email: string;
  phone?: string;
  linkedin?: string;
  portfolio?: string;
  coverLetter: string;
  cvName: string;
  cvSize: number;
  appliedAt: string;
}
