import { Pipe, PipeTransform } from '@angular/core';
import { CATEGORIES, JOB_TYPES, LEVELS, WORK_MODES } from '../../core/models/options';

export function formatSalary(value: number): string {
  if (value >= 1000) {
    const k = value / 1000;
    return `$${Number.isInteger(k) ? k : k.toFixed(1)}k`;
  }
  return `$${value}`;
}

export function timeAgo(iso: string, now = Date.now()): string {
  const diff = Math.max(0, now - new Date(iso).getTime());
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;
  const months = Math.floor(days / 30);
  return `${months} month${months === 1 ? '' : 's'} ago`;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

@Pipe({ name: 'salary' })
export class SalaryPipe implements PipeTransform {
  transform(min: number | null | undefined, max?: number | null): string {
    if (min == null && max == null) return 'Salary not set';
    if (min != null && max != null && min !== max) return `${formatSalary(min)} – ${formatSalary(max)}`;
    return formatSalary((min ?? max)!);
  }
}

@Pipe({ name: 'timeAgo' })
export class TimeAgoPipe implements PipeTransform {
  transform(iso: string | undefined | null): string {
    return iso ? timeAgo(iso) : '';
  }
}

@Pipe({ name: 'fileSize' })
export class FileSizePipe implements PipeTransform {
  transform(bytes: number | null | undefined): string {
    return bytes == null ? '' : formatFileSize(bytes);
  }
}

const LISTS = { mode: WORK_MODES, type: JOB_TYPES, level: LEVELS, category: CATEGORIES };

@Pipe({ name: 'optionLabel' })
export class OptionLabelPipe implements PipeTransform {
  transform(value: string | null | undefined, list: keyof typeof LISTS): string {
    if (!value) return '';
    const options = LISTS[list] as { value: string; label: string }[];
    return options.find((o) => o.value === value)?.label ?? value;
  }
}
