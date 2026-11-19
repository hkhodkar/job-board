import { COMPANIES } from '../data/companies';
import { buildSeedJobs } from '../data/jobs';
import { JobFilters, JobWithCompany } from '../models/job.model';
import {
  DEFAULT_FILTERS,
  countActiveFilters,
  filterJobs,
  filtersToParams,
  parseFilters,
  sortJobs,
} from './job-filters';

const now = new Date('2026-03-10T12:00:00Z');
const companies = new Map(COMPANIES.map((c) => [c.id, c]));
const jobs: JobWithCompany[] = buildSeedJobs(now).map((j) => ({ ...j, company: companies.get(j.companyId)! }));

const run = (patch: Partial<JobFilters>) => filterJobs(jobs, { ...DEFAULT_FILTERS, ...patch }, now);

describe('filterJobs', () => {
  it('returns every job without filters', () => {
    expect(jobs.length).toBe(30);
    expect(run({})).toHaveLength(30);
  });

  it('matches every keyword term across title, company and tags', () => {
    const result = run({ q: 'angular brightloop' });
    expect(result.map((j) => j.id)).toEqual(['senior-angular-developer-brightloop']);
    expect(run({ q: 'KUBERNETES' }).every((j) => /kubernetes/i.test(j.title + j.tags.join() + j.summary))).toBe(true);
  });

  it('filters by location substring, ignoring case', () => {
    const result = run({ location: 'lisbon' });
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((j) => j.location.includes('Lisbon'))).toBe(true);
  });

  it('combines multi-select filters with AND between groups and OR inside a group', () => {
    const result = run({ modes: ['remote', 'hybrid'], types: ['contract'] });
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((j) => j.type === 'contract' && j.workMode !== 'onsite')).toBe(true);
    expect(run({ levels: ['entry'], category: 'design' }).every((j) => j.level === 'entry' && j.category === 'design')).toBe(true);
  });

  it('keeps jobs whose salary range overlaps the requested range (in thousands)', () => {
    const result = run({ salaryMin: 150, salaryMax: 180 });
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((j) => j.salaryMax >= 150_000 && j.salaryMin <= 180_000)).toBe(true);
    expect(run({ salaryMin: 500 })).toHaveLength(0);
  });

  it('filters by posting date', () => {
    const result = run({ postedWithin: 1 });
    expect(result.length).toBeGreaterThan(0);
    const dayAgo = now.getTime() - 24 * 3600 * 1000;
    expect(result.every((j) => new Date(j.postedAt).getTime() >= dayAgo)).toBe(true);
    expect(run({ postedWithin: 30 }).length).toBe(30);
  });
});

describe('sortJobs', () => {
  it('sorts by newest first by default', () => {
    const sorted = sortJobs(jobs, 'newest');
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i - 1].postedAt >= sorted[i].postedAt).toBe(true);
    }
  });

  it('sorts by salary in both directions without mutating the input', () => {
    const first = jobs[0];
    const desc = sortJobs(jobs, 'salary-desc');
    const asc = sortJobs(jobs, 'salary-asc');
    expect(desc[0].salaryMax).toBe(Math.max(...jobs.map((j) => j.salaryMax)));
    expect(asc[0].salaryMin).toBe(Math.min(...jobs.map((j) => j.salaryMin)));
    expect(jobs[0]).toBe(first);
  });
});

describe('URL params', () => {
  it('round-trips filters through query params', () => {
    const filters: JobFilters = {
      q: 'designer',
      location: 'Berlin',
      modes: ['remote', 'onsite'],
      types: ['full-time'],
      levels: ['senior'],
      category: 'design',
      salaryMin: 60,
      salaryMax: 120,
      postedWithin: 7,
      sort: 'salary-desc',
    };
    const params = filtersToParams(filters);
    expect(params).toEqual({
      q: 'designer',
      location: 'Berlin',
      mode: 'remote,onsite',
      type: 'full-time',
      level: 'senior',
      category: 'design',
      minSalary: 60,
      maxSalary: 120,
      posted: 7,
      sort: 'salary-desc',
    });
    const stringified = Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)]));
    expect(parseFilters(stringified)).toEqual(filters);
    expect(countActiveFilters(filters)).toBe(9);
  });

  it('drops defaults and ignores unknown or invalid values', () => {
    expect(filtersToParams(DEFAULT_FILTERS)).toEqual({});
    expect(
      parseFilters({ mode: 'remote,space', category: 'cooking', posted: '5', minSalary: '-3', sort: 'random' }),
    ).toEqual({ ...DEFAULT_FILTERS, modes: ['remote'] });
  });
});
