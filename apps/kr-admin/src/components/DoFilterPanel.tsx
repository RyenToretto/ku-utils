import { Button } from 'antd';
import { useEffect, useRef, useState, type ReactNode } from 'react';

export type DoFilterPanelProps = {
  line?: number;
  disableFold?: boolean;
  eachLineHeight?: number;
  hideSearch?: boolean;
  mainText?: string;
  loading?: boolean;
  children?: ReactNode;
  ctl?: ReactNode;
  onSearch?: (toFirstPage: boolean) => void;
};

export function DoFilterPanel({
  line = 2,
  disableFold = false,
  eachLineHeight = 52,
  hideSearch = false,
  mainText = '搜索',
  loading = false,
  children,
  ctl,
  onSearch,
}: DoFilterPanelProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isFold, setIsFold] = useState(true);
  const [canFold, setCanFold] = useState(false);

  useEffect(() => {
    if (disableFold) {
      setCanFold(false);
      return;
    }
    const el = contentRef.current;
    if (!el) return;

    const measure = () => {
      const height = el.scrollHeight;
      const visible = line * eachLineHeight;
      setCanFold(height > visible + 4);
    };

    measure();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    ro?.observe(el);
    return () => ro?.disconnect();
  }, [disableFold, eachLineHeight, line, children]);

  const maxHeight = isFold && canFold ? line * eachLineHeight : undefined;

  return (
    <section
      className={[
        'do-filter-panel',
        !isFold ? 'active' : '',
        canFold ? 'can-fold' : '',
        !hideSearch ? 'has-ctl' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="do-filter-box">
        <div className="do-filter-body">
          <div
            ref={contentRef}
            className="do-filter-content"
            style={maxHeight != null ? { maxHeight, overflow: 'hidden' } : undefined}
          >
            {children}
          </div>
          {canFold ? (
            <button
              type="button"
              className="do-filter-fold-toggle"
              onClick={() => setIsFold((v) => !v)}
            >
              {isFold ? '展开' : '收起'}
            </button>
          ) : null}
        </div>
        {!hideSearch ? (
          <div className="do-filter-ctl">
            <Button
              type="primary"
              loading={loading}
              onClick={() => onSearch?.(true)}
            >
              {mainText}
            </Button>
            {ctl}
          </div>
        ) : null}
      </div>
    </section>
  );
}

export default DoFilterPanel;
