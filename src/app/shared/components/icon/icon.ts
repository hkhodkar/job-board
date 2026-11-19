import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type IconName =
  | 'search'
  | 'pin'
  | 'briefcase'
  | 'clock'
  | 'bookmark'
  | 'bookmark-filled'
  | 'building'
  | 'money'
  | 'arrow-left'
  | 'arrow-right'
  | 'x'
  | 'plus'
  | 'trash'
  | 'edit'
  | 'upload'
  | 'file'
  | 'check'
  | 'check-circle'
  | 'filter'
  | 'users'
  | 'globe'
  | 'layers'
  | 'alert'
  | 'send'
  | 'eye'
  | 'inbox'
  | 'grid'
  | 'menu';

@Component({
  selector: 'app-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true', style: 'display: contents' },
  template: `
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      [attr.width]="size()"
      [attr.height]="size()"
    >
      @switch (name()) {
        @case ('search') {
          <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
        }
        @case ('pin') {
          <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" />
        }
        @case ('briefcase') {
          <rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18" />
        }
        @case ('clock') {
          <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
        }
        @case ('bookmark') {
          <path d="M6 3h12v18l-6-4-6 4z" />
        }
        @case ('bookmark-filled') {
          <path d="M6 3h12v18l-6-4-6 4z" fill="currentColor" />
        }
        @case ('building') {
          <rect x="4" y="3" width="16" height="18" rx="1.5" /><path d="M9 7h1M14 7h1M9 11h1M14 11h1M9 15h1M14 15h1M10 21v-3h4v3" />
        }
        @case ('money') {
          <rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="2.5" /><path d="M6 10v4M18 10v4" />
        }
        @case ('arrow-left') {
          <path d="M19 12H5M11 18l-6-6 6-6" />
        }
        @case ('arrow-right') {
          <path d="M5 12h14M13 6l6 6-6 6" />
        }
        @case ('x') {
          <path d="M18 6 6 18M6 6l12 12" />
        }
        @case ('plus') {
          <path d="M12 5v14M5 12h14" />
        }
        @case ('trash') {
          <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13M9 7V4h6v3" />
        }
        @case ('edit') {
          <path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z" /><path d="m13.5 6.5 4 4" />
        }
        @case ('upload') {
          <path d="M12 15V3M7 8l5-5 5 5" /><path d="M4 15v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4" />
        }
        @case ('file') {
          <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5M9 13h6M9 17h4" />
        }
        @case ('check') {
          <path d="m5 12 5 5 9-10" />
        }
        @case ('check-circle') {
          <circle cx="12" cy="12" r="9" /><path d="m8 12 3 3 5-6" />
        }
        @case ('filter') {
          <path d="M4 5h16M7 12h10M10 19h4" />
        }
        @case ('users') {
          <circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6" />
        }
        @case ('globe') {
          <circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
        }
        @case ('layers') {
          <path d="m12 3 9 5-9 5-9-5z" /><path d="m3 13 9 5 9-5" />
        }
        @case ('alert') {
          <circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16.5v.01" />
        }
        @case ('send') {
          <path d="M21 3 10 14M21 3l-7 18-4-7-7-4z" />
        }
        @case ('eye') {
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" />
        }
        @case ('inbox') {
          <path d="M3 13h5l1.5 3h5L16 13h5" /><path d="M5.5 5h13L21 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6z" />
        }
        @case ('menu') {
          <path d="M4 6h16M4 12h16M4 18h16" />
        }
        @case ('grid') {
          <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
        }
      }
    </svg>
  `,
})
export class Icon {
  readonly name = input.required<IconName>();
  readonly size = input(18);
}
