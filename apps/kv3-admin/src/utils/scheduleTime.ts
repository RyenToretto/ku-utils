/** 投放时段：336 半小时位图（周一～周日 × 48 格，每格 30 分钟） */
export const SCHEDULE_TIME_LENGTH = 336;
/** 每天半小时格数（24 × 2） */
export const SCHEDULE_TIME_SLOTS_PER_DAY = 48;
export const SCHEDULE_TIME_DAYS = 7;
/** 历史合同 168 整点位图长度（读入时按小时拆成两格半小时） */
export const LEGACY_SCHEDULE_TIME_LENGTH = 168;

/** 指定模式初始值：336 全 0，须至少勾选一格；不限提交仍传 null */
export const EMPTY_SCHEDULE_TIME = '0'.repeat(SCHEDULE_TIME_LENGTH);

/** 边界时刻表：00:00、00:30 … 24:00、24:30（长度 50） */
export function buildScheduleTimeBoundaryLabels(): string[] {
  const hours: string[] = [];
  for (let i = 0; i <= 24; i++) {
    hours.push(i < 10 ? `0${i}` : String(i));
  }
  const labels: string[] = [];
  for (const hour of hours) {
    for (const minute of ['00', '30']) {
      labels.push(`${hour}:${minute}`);
    }
  }
  return labels;
}

const BOUNDARY_LABELS = buildScheduleTimeBoundaryLabels();

/** 将历史 168 整点位图扩成 336（每位小时 → 连续两个半小时） */
export function expandLegacyHourlyBitmap(raw: string): string {
  if (raw.length !== LEGACY_SCHEDULE_TIME_LENGTH) return raw;
  return raw
    .split('')
    .map((bit) => bit + bit)
    .join('');
}

export function normalizeScheduleTimeBitmap(value: string | null | undefined): string {
  let raw = String(value ?? '').replace(/[^01]/g, '');
  if (!raw) return EMPTY_SCHEDULE_TIME;
  if (raw.length === LEGACY_SCHEDULE_TIME_LENGTH) {
    raw = expandLegacyHourlyBitmap(raw);
  }
  if (raw.length === SCHEDULE_TIME_LENGTH) return raw;
  if (raw.length < SCHEDULE_TIME_LENGTH) return raw.padEnd(SCHEDULE_TIME_LENGTH, '0');
  return raw.slice(0, SCHEDULE_TIME_LENGTH);
}

/** 是否已配置有效投放半小时格（至少一格为 1） */
export function hasScheduleTimeSelection(value: string | null | undefined): boolean {
  return /1/.test(String(value ?? ''));
}

/**
 * 空 / null / 仅空白 → 不限（全天）。
 * 指定模式下表单可能暂存 336 全 0，此时不算「不限」。
 */
export function isUnlimitedScheduleTime(value: string | null | undefined): boolean {
  const raw = String(value ?? '').trim();
  return !raw;
}

/** 提交前：不限传 null；指定传 336 位图 */
export function toScheduleTimePayload(
  modeSpecified: boolean,
  bitmap: string | null | undefined,
): string | null {
  if (!modeSpecified) return null;
  const normalized = normalizeScheduleTimeBitmap(bitmap);
  return hasScheduleTimeSelection(normalized) ? normalized : null;
}

/** 单日 48 位图 →「08:00~12:00、14:00~18:00」；无选中返回空串 */
export function formatDayScheduleSegments(dayBits: string): string {
  const bits = String(dayBits || '')
    .padEnd(SCHEDULE_TIME_SLOTS_PER_DAY, '0')
    .slice(0, SCHEDULE_TIME_SLOTS_PER_DAY);
  let isSelect = false;
  let timeText = '';
  for (let index = 0; index < bits.length; index++) {
    if (bits[index] === '1') {
      if (!isSelect) {
        timeText += BOUNDARY_LABELS[index];
        isSelect = true;
      }
      if (index === bits.length - 1) {
        timeText += `~${BOUNDARY_LABELS[index + 1]}、`;
      }
    } else if (isSelect) {
      timeText += `~${BOUNDARY_LABELS[index]}、`;
      isSelect = false;
    }
  }
  return timeText.slice(0, -1);
}

/**
 * 336 位图按日摘要。
 * @param weekLabels 长度 7，如 ['星期一', …]
 */
export function formatScheduleTimeDaySummaries(
  value: string | null | undefined,
  weekLabels: string[],
): Array<{ label: string; text: string }> {
  const bitmap = normalizeScheduleTimeBitmap(value);
  return Array.from({ length: SCHEDULE_TIME_DAYS }, (_, day) => {
    const slice = bitmap.slice(
      day * SCHEDULE_TIME_SLOTS_PER_DAY,
      (day + 1) * SCHEDULE_TIME_SLOTS_PER_DAY,
    );
    return {
      label: weekLabels[day] || `星期${day + 1}`,
      text: formatDayScheduleSegments(slice),
    };
  }).filter((row) => !!row.text);
}
