import { Input } from 'antd';
import { useEffect, useRef, useState } from 'react';

const DEFAULT_PATTERNS = ['{date}', '{time}', '{seq}'];
const DEFAULT_SPLIT_SIGN = '-';
const DEFAULT_TIP = '点击插入通配符；同一通配符默认可重复使用';

export type DoNamePatternProps = {
  value?: string | null;
  /** 可插入通配符；不传则用组件内默认列表 */
  patternList?: string[];
  placeholder?: string;
  disabled?: boolean;
  clearable?: boolean;
  /** 插入前自动补连接符（如 `-` / `_`） */
  splitSign?: string;
  /** 同一通配符仅允许出现一次 */
  useOnly?: boolean;
  /** true：浮层；false：输入框下方芯片列表 */
  usePopover?: boolean;
  textarea?: boolean;
  tip?: string;
  style?: React.CSSProperties;
  onChange?: (value: string) => void;
};

/** 命名模板插入器（对齐 kv3 DoNamePattern：底栏芯片 / 浮层 / useOnly）。 */
export function DoNamePattern({
  value = '',
  patternList,
  placeholder = '请输入命名规则',
  disabled = false,
  clearable = true,
  splitSign = DEFAULT_SPLIT_SIGN,
  useOnly = false,
  usePopover = false,
  textarea = false,
  tip = DEFAULT_TIP,
  style,
  onChange,
}: DoNamePatternProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  /** 未聚焦过输入框时为 null，插入落到末尾 */
  const cursorRef = useRef<number | null>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const tokens = patternList?.length ? patternList : DEFAULT_PATTERNS;
  const inner = value ?? '';

  useEffect(() => {
    if (!popoverOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setPopoverOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [popoverOpen]);

  function recordCursor() {
    const el = inputRef.current;
    if (el && typeof el.selectionStart === 'number') cursorRef.current = el.selectionStart;
  }

  function focusAt(pos: number) {
    requestAnimationFrame(() => {
      const el = inputRef.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(pos, pos);
      cursorRef.current = pos;
    });
  }

  function choosePattern(token: string) {
    if (disabled) return;
    if (!inner) {
      onChange?.(token);
      focusAt(token.length);
      return;
    }
    const cursor = cursorRef.current;
    const pos = cursor !== null && cursor <= inner.length ? cursor : inner.length;
    if (useOnly && inner.includes(token)) {
      focusAt(pos);
      return;
    }
    const before = inner.slice(0, pos);
    const after = inner.slice(pos);
    let insert =
      splitSign && pos > 0 && !before.endsWith(splitSign) ? `${splitSign}${token}` : token;
    if (splitSign && after.startsWith(splitSign) && insert.endsWith(splitSign)) {
      insert = insert.slice(0, -splitSign.length);
    }
    onChange?.(`${before}${insert}${after}`);
    focusAt(pos + insert.length);
  }

  function openPopover() {
    recordCursor();
    if (usePopover && !disabled && tokens.length) setPopoverOpen(true);
  }

  const panel = (
    <div
      className={['do-name-pattern-popover', usePopover ? 'is-popover' : 'bottom-list'].join(' ')}
    >
      {usePopover ? <div className="do-name-pattern-arrow" /> : null}
      <div className="do-name-pattern-panel">
        <ul className="do-name-pattern-list">
          {tokens.map((token) => (
            <li
              key={token}
              className="do-name-pattern-option"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => choosePattern(token)}
            >
              <span className="do-name-pattern-token">{token}</span>
            </li>
          ))}
        </ul>
        {tip ? <div className="do-name-pattern-tip">{tip}</div> : null}
      </div>
    </div>
  );

  const shared = {
    allowClear: clearable,
    disabled,
    placeholder,
    value: inner,
    autoComplete: 'off',
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      onChange?.(e.target.value);
    },
    onClick: openPopover,
    onFocus: openPopover,
    onBlur: recordCursor,
    onSelect: recordCursor,
    onKeyUp: recordCursor,
  };

  return (
    <div
      ref={rootRef}
      className="do-name-pattern"
      style={style}
    >
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
      {!usePopover || popoverOpen ? panel : null}
    </div>
  );
}

export default DoNamePattern;
