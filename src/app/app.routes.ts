import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'jobs' },
  {
    path: 'jobs',
    title: 'Find jobs · Hireline',
    loadComponent: () => import('./features/jobs/job-list/job-list').then((m) => m.JobList),
  },
  {
    path: 'jobs/:id',
    loadComponent: () => import('./features/jobs/job-detail/job-detail').then((m) => m.JobDetail),
  },
  {
    path: 'jobs/:id/apply',
    loadComponent: () => import('./features/apply/apply-page').then((m) => m.ApplyPage),
  },
  {
    path: 'saved',
    title: 'Saved jobs · Hireline',
    loadComponent: () => import('./features/saved/saved-jobs').then((m) => m.SavedJobs),
  },
  {
    path: 'applications',
    title: 'My applications · Hireline',
    loadComponent: () =>
      import('./features/applications/my-applications').then((m) => m.MyApplications),
  },
  {
    path: 'employer',
    title: 'My job posts · Hireline',
    loadComponent: () => import('./features/employer/my-posts/my-posts').then((m) => m.MyPosts),
  },
  {
    path: 'employer/new',
    title: 'Post a job · Hireline',
    loadComponent: () => import('./features/employer/post-job/post-job').then((m) => m.PostJob),
  },
  {
    path: 'employer/:id/edit',
    title: 'Edit job post · Hireline',
    loadComponent: () => import('./features/employer/post-job/post-job').then((m) => m.PostJob),
  },
  {
    path: '**',
    title: 'Page not found · Hireline',
    loadComponent: () => import('./features/not-found').then((m) => m.NotFound),
  },
];
