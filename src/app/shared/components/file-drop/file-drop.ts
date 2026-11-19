import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  forwardRef,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { FileSizePipe } from '../../pipes/formatting.pipes';
import { Icon } from '../icon/icon';

let nextId = 0;

@Component({
  selector: 'app-file-drop',
  imports: [Icon, FileSizePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => FileDrop), multi: true }],
  templateUrl: './file-drop.html',
  styleUrl: './file-drop.scss',
})
export class FileDrop implements ControlValueAccessor {
  readonly accept = input('');
  readonly hint = input('');
  readonly invalid = input(false);
  readonly inputId = input(`file-drop-${nextId++}`);

  protected readonly file = signal<File | null>(null);
  protected readonly dragging = signal(false);
  protected readonly disabled = signal(false);

  private readonly fileInput = viewChild.required<ElementRef<HTMLInputElement>>('fileInput');
  private onChange: (value: File | null) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: File | null): void {
    this.file.set(value ?? null);
  }

  registerOnChange(fn: (value: File | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.disabled.set(disabled);
  }

  protected onSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.setFile(input.files?.[0] ?? null);
    // allow picking the same file again after removing it
    input.value = '';
  }

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
    if (!this.disabled()) this.dragging.set(true);
  }

  protected onDragLeave(event: DragEvent): void {
    const related = event.relatedTarget as Node | null;
    if (!related || !(event.currentTarget as HTMLElement).contains(related)) {
      this.dragging.set(false);
    }
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(false);
    if (this.disabled()) return;
    const file = event.dataTransfer?.files?.[0];
    if (file) this.setFile(file);
  }

  protected browse(): void {
    this.fileInput().nativeElement.click();
  }

  protected remove(): void {
    this.setFile(null);
  }

  private setFile(file: File | null): void {
    this.file.set(file);
    this.onChange(file);
    this.onTouched();
  }
}
