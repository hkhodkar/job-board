import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Icon, IconName } from '../icon/icon';

@Component({
  selector: 'app-empty-state',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="empty">
      <span class="icon"><app-icon [name]="icon()" [size]="26" /></span>
      <h2>{{ title() }}</h2>
      <p>{{ text() }}</p>
      <div class="actions"><ng-content /></div>
    </div>
  `,
  styles: `
    .empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 56px 24px;
      background: var(--c-surface);
      border: 1px dashed var(--c-border-strong);
      border-radius: var(--radius);
    }
    .icon {
      display: grid;
      place-items: center;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: var(--c-primary-50);
      color: var(--c-primary);
      margin-bottom: 16px;
    }
    h2 {
      font-size: 18px;
    }
    p {
      max-width: 420px;
      margin-top: 6px;
      color: var(--c-muted);
    }
    .actions {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 10px;
      margin-top: 20px;
    }
    .actions:empty {
      display: none;
    }
  `,
})
export class EmptyState {
  readonly icon = input<IconName>('inbox');
  readonly title = input.required<string>();
  readonly text = input('');
}
