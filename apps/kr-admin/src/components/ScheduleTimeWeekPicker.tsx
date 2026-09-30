import { Tooltip } from 'antd';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  EMPTY_SCHEDULE_TIME,
  SCHEDULE_TIME_LENGTH,
  SCHEDULE_TIME_SLOTS_PER_DAY,
  buildScheduleTimeBoundaryLabels,
  formatScheduleTimeDaySummaries,
  normalizeScheduleTimeBitmap,
} from '@/utils/scheduleTime';

const WEEK_LABELS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const CELL_INDICES = Array.from({ length: SCHEDULE_TIME_LENGTH }, (_, i) => i);
const SLOTS_PER_DAY = SCHEDULE_TIME_SLOTS_PER_DAY;
const BOUNDARY_LABELS = buildScheduleTimeBoundaryLabels();

export type ScheduleTimeWeekPickerProps = {
  value?: string | null;
  onChange?: (value: string) => void;
};

type Axis = {
  startx?: number;
  starty?: number;
  endx?: number;
  endy?: number;
};

function parseIndex(raw: string | null | undefined) {
  if (raw == null || raw === '') return null;
  const index = Number(raw);
  if (!Number.isInteger(index) || index < 0 || index >= SCHEDULE_TIME_LENGTH) return null;
  return index;
}

function readIndex(event: MouseEvent) {
  const hit = document.elementFromPoint(event.clientX, event.clientY) as HTMLElement | null;
  const cell = hit?.closest?.('[data-index]') as HTMLElement | null;
  return parseIndex(cell?.getAttribute('data-index'));
}

/** 投放时段周网格，对齐 kv3 `ScheduleTimeWeekPicker.vue`（336 位半小时位图）。 */
export function ScheduleTimeWeekPicker({ value, onChange }: ScheduleTimeWeekPickerProps) {
  const [bits, setBits] = useState(() => normalizeScheduleTimeBitmap(value));
  const [isMove, setIsMove] = useState(false);
  const isMoveRef = useRef(false);
  const startIndexRef = useRef(-1);
  const axisRef = useRef<Axis>({});
  const [previewIndexes, setPreviewIndexes] = useState<number[]>([]);

  const previewSet = useMemo(() => new Set(previewIndexes), [previewIndexes]);
  const daySummaries = useMemo(() => formatScheduleTimeDaySummaries(bits, WEEK_LABELS), [bits]);

  useEffect(() => {
    const next = normalizeScheduleTimeBitmap(value);
    setBits((prev) => (next !== prev ? next : prev));
  }, [value]);

  const emitValue = useCallback(
    (next: string) => {
      setBits(next);
      onChange?.(next);
    },
    [onChange],
  );

  const cellTitle = useCallback((index: number) => {
    const slot = index % SLOTS_PER_DAY;
    const day = Math.floor(index / SLOTS_PER_DAY);
    const label = WEEK_LABELS[day] || '';
    return `${label} ${BOUNDARY_LABELS[slot]}~${BOUNDARY_LABELS[slot + 1]}`;
  }, []);

  const getSelectIndexes = useCallback(() => {
    const { startx, starty, endx, endy } = axisRef.current;
    if (startx == null || starty == null) return [] as number[];
    const ex = endx ?? startx;
    const ey = endy ?? starty;
    const minX = Math.min(startx, ex);
    const maxX = Math.max(startx, ex);
    const minY = Math.min(starty, ey);
    const maxY = Math.max(starty, ey);
    const list: number[] = [];
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        list.push(x + y * SLOTS_PER_DAY);
      }
    }
    return list;
  }, []);

  const applySelectIndexes = useCallback(
    (indexList: number[]) => {
      if (!indexList.length || startIndexRef.current < 0) return;
      const newData = bits[startIndexRef.current] === '1' ? '0' : '1';
      const chars = bits.split('');
      for (const index of indexList) {
        chars[index] = newData;
      }
      emitValue(chars.join(''));
    },
    [bits, emitValue],
  );

  const onCellMouseDown = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      const index = readIndex(event.nativeEvent);
      if (index == null) return;
      setIsMove(true);
      isMoveRef.current = true;
      startIndexRef.current = index;
      const x = index % SLOTS_PER_DAY;
      const y = Math.floor(index / SLOTS_PER_DAY);
      axisRef.current = { startx: x, starty: y, endx: x, endy: y };
      setPreviewIndexes(getSelectIndexes());
    },
    [getSelectIndexes],
  );

  const onCellMouseMove = useCallback(
    (event: React.MouseEvent) => {
      if (!isMove) return;
      const index = readIndex(event.nativeEvent);
      if (index == null) return;
      axisRef.current = {
        ...axisRef.current,
        endx: index % SLOTS_PER_DAY,
        endy: Math.floor(index / SLOTS_PER_DAY),
      };
      setPreviewIndexes(getSelectIndexes());
    },
    [getSelectIndexes, isMove],
  );

  const resetMousemove = useCallback(
    (event?: MouseEvent) => {
      if (!isMoveRef.current) return;
      if (event) {
        const index = readIndex(event);
        if (index != null) {
          axisRef.current = {
            ...axisRef.current,
            endx: index % SLOTS_PER_DAY,
            endy: Math.floor(index / SLOTS_PER_DAY),
          };
        }
      }
      const indexes = getSelectIndexes();
      applySelectIndexes(indexes);
      setIsMove(false);
      isMoveRef.current = false;
      startIndexRef.current = -1;
      axisRef.current = {};
      setPreviewIndexes([]);
    },
    [applySelectIndexes, getSelectIndexes],
  );

  useEffect(() => {
    const onDocMouseUp = (event: MouseEvent) => {
      resetMousemove(event);
    };
    document.addEventListener('mouseup', onDocMouseUp);
    return () => document.removeEventListener('mouseup', onDocMouseUp);
  }, [resetMousemove]);

  const clearSelection = useCallback(() => {
    emitValue(EMPTY_SCHEDULE_TIME);
  }, [emitValue]);

  return (
    <div className="schedule-time-week-picker">
      <div className="schedule-time-week-picker-inner">
        <div className="schedule-time-week-picker-main">
          <div className="schedule-time-week-picker-hd">
            <div className="schedule-time-week-picker-hd-title">时段</div>
            <div className="schedule-time-week-picker-hd-con">
              <div className="schedule-time-week-picker-hd-ranges">
                <div className="schedule-time-week-picker-range">00:00 - 12:00</div>
                <div className="schedule-time-week-picker-range">12:00 - 24:00</div>
              </div>
              <div className="schedule-time-week-picker-hd-hours">
                {HOURS.map((hour) => (
                  <span
                    key={hour}
                    className="schedule-time-week-picker-hour-label"
                  >
                    {hour}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="schedule-time-week-picker-bd">
            <div className="schedule-time-week-picker-weeks">
              {WEEK_LABELS.map((weekLabel, dayIndex) => (
                <div
                  key={dayIndex}
                  className="schedule-time-week-picker-week"
                >
                  {weekLabel}
                </div>
              ))}
            </div>
            <div
              className="schedule-time-week-picker-cells"
              onMouseDown={onCellMouseDown}
              onMouseMove={onCellMouseMove}
            >
              {CELL_INDICES.map((cellIndex) => (
                <Tooltip
                  key={cellIndex}
                  title={cellTitle(cellIndex)}
                  mouseEnterDelay={0.8}
                  open={isMove ? false : undefined}
                  placement="top"
                >
                  <div
                    className={[
                      'schedule-time-week-picker-cell',
                      bits[cellIndex] === '1' ? 'is-active' : '',
                      previewSet.has(cellIndex) ? 'is-preview' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    data-index={cellIndex}
                  />
                </Tooltip>
              ))}
            </div>
          </div>
        </div>

        <div className="schedule-time-week-picker-help">
          <div className="schedule-time-week-picker-help-bar">
            <div className="schedule-time-week-picker-legend">
              <span className="schedule-time-week-picker-swatch" />
              <span className="schedule-time-week-picker-legend-text">未选</span>
              <span className="schedule-time-week-picker-swatch is-active" />
              <span className="schedule-time-week-picker-legend-text">已选</span>
            </div>
            <button
              type="button"
              className="schedule-time-week-picker-clear"
              onClick={clearSelection}
            >
              清空
            </button>
          </div>
          {daySummaries.length > 0 && (
            <div className="schedule-time-week-picker-summary">
              {daySummaries.map((row) => (
                <p
                  key={row.label}
                  className="schedule-time-week-picker-summary-row"
                >
                  <span className="schedule-time-week-picker-summary-day">{row.label}：</span>
                  <span>{row.text}</span>
                </p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ScheduleTimeWeekPicker;
