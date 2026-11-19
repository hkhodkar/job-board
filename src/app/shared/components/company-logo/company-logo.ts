import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { colorFor, initials } from '../../../core/utils/color';

/** Generated logo: company initials on a tinted rounded square */
@Component({
  selector: 'app-company-logo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'company-logo', '[style.width.px]': 'size()', '[style.height.px]': 'size()' },
  template: `
    <svg [attr.viewBox]="'0 0 48 48'" role="img" [attr.aria-label]="name() + ' logo'">
      <rect width="48" height="48" rx="12" [attr.fill]="bg()" />
      <rect x="0.5" y="0.5" width="47" height="47" rx="11.5" fill="none" [attr.stroke]="tint()" stroke-opacity="0.25" />
      <text
        x="24"
        y="25"
        text-anchor="middle"
        dominant-baseline="central"
        font-family="Inter, system-ui, sans-serif"
        font-size="18"
        font-weight="700"
        [attr.fill]="tint()"
      >
        {{ letters() }}
      </text>
    </svg>
  `,
  styles: `
    :host {
      display: block;
      flex: none;
    }
    svg {
      width: 100%;
      height: 100%;
    }
  `,
})
export class CompanyLogo {
  readonly name = input.required<string>();
  readonly color = input<string>();
  readonly size = input(48);

  protected readonly tint = computed(() => this.color() || colorFor(this.name()));
  protected readonly bg = computed(() => `${this.tint()}1f`);
  protected readonly letters = computed(() => initials(this.name()));
}
