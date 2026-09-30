import { Input } from 'antd';
import { useMemo, useRef, useState } from 'react';

const DEFAULT_PATTERNS = ['{应用名}', '{日期}', '{时分秒}', '{动态标号}'];

export type DoNamePatternProps = {
  value?: string | null;
  patternList?: string[];
  placeholder?: string;
  disabled?: boolean;
  clearable?: boolean;
  splitSign?: string;
  useOnly?: boolean;
  usePopover?: boolean;
  textarea?: boolean;
  tip?: string;
  style?: React.CSSProperties;
  onChange?: (value: string) => void;
};

/** 命名模板插入器（精简对齐 kv3 DoNamePattern：底栏芯片 / 浮层 / useOnly）。 */
export function DoNamePattern({
  value = '',
  patternList,
  placeholder = '请输入命名规则',
  disabled = false,
  clearable = true,
  splitSign = '-',
  useOnly = false,
  usePopover = false,
  textarea = false,
  tip,
  style,
  onChange,
}: DoNamePatternProps) {
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const [cursor, setCursor] = useState(0);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const tokens = patternList?.length ? patternList : DEFAULT_PATTERNS;
  const inner = value ?? '';

  const tipText = useMemo(() => tip ?? (useOnly ? '同一通配符仅可出现一次' : ''), [tip, useOnly]);

  function recordCursor() {
    const el = inputRef.current;
    if (!el) return;
    setCursor(el.selectionStart ?? inner.length);
  }

  function choosePattern(token: string) {
    if (useOnly && inner.includes(token)) return;
    const pos = cursor;
    const before = inner.slice(0, pos);
    const after = inner.slice(pos);
    const needSplit =
      !!splitSign &&
      before.length > 0 &&
      !before.endsWith(splitSign) &&
      !token.startsWith(splitSign);
    const insert = `${needSplit ? splitSign : ''}${token}`;
    const next = `${before}${insert}${after}`;
    onChange?.(next);
    const nextPos = before.length + insert.length;
    setCursor(nextPos);
    requestAnimationFrame(() => {
      const el = inputRef.current;
      el?.focus();
      el?.setSelectionRange(nextPos, nextPos);
    });
  }

  const panel = (
    <div
      className={[
        'do-name-pattern-popover',
        usePopover ? 'is-popover' : 'bottom-list',
        usePopover && popoverOpen ? 'active' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <ul className="do-name-pattern-list">
        {tokens.map((token) => {
          const used = useOnly && inner.includes(token);
          return (
            <li
              key={token}
              className={['do-name-pattern-option', used ? 'is-disabled' : ''].filter(Boolean).join(' ')}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                if (!used) choosePattern(token);
              }}
            >
              <span className="do-name-pattern-token">{token}</span>
            </li>
          );
        })}
      </ul>
      {tipText ? <div className="do-name-pattern-tip">{tipText}</div> : null}
    </div>
  );

  const shared = {
    allowClear: clearable,
    disabled,
    placeholder,
    value: inner,
    style,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      onChange?.(e.target.value);
    },
    onClick: () => {
      recordCursor();
      if (usePopover) setPopoverOpen(true);
    },
    onFocus: () => {
      recordCursor();
      if (usePopover) setPopoverOpen(true);
    },
    onBlur: () => {
      recordCursor();
      if (usePopover) setTimeout(() => setPopoverOpen(false), 150);
    },
    onSelect: recordCursor,
    onKeyUp: recordCursor,
  };

  return (
    <div className="do-name-pattern">
      {textarea ? (
        <Input.TextArea
          {...shared}
          rows={2}
          ref={(node) => {
            inputRef.current = node?.resizableTextArea?.textArea ?? null;
          }}
        />
      ) : (
        <Input
          {...shared}
          ref={(node) => {
            inputRef.current = node?.input ?? null;
          }}
        />
      )}
      {usePopover ? (popoverOpen ? panel : null) : panel}
    </div>
  );
}

export default DoNamePattern;
