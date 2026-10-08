import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

export type DoFilterPanelProps = {
  line?: number;
  /** 分组式筛选 / 含非表单节点时关掉按行折叠，交给内容自然撑开 */
  disableFold?: boolean;
  eachLineHeight?: number;
  /** 筛选项标签宽度（px，含右侧 12px 间距），对齐 kv3 el-form label-width */
  labelWidth?: number;
  maxCtlWidth?: string;
  hideSearch?: boolean;
  mainText?: string;
  loading?: boolean;
  children?: ReactNode;
  ctl?: ReactNode;
  onSearch?: (toFirstPage: boolean) => void;
};

const PANEL_GAP = 18;

/** 列表筛选面板：按行折叠 + 右下角操作区，对齐 kv3 `DoFilterPanel.vue`。 */
export function DoFilterPanel({
  line = 2,
  disableFold = false,
  eachLineHeight = 52,
  labelWidth,
  maxCtlWidth,
  hideSearch = false,
  mainText = '搜索',
  loading = false,
  children,
  ctl,
  onSearch,
}: DoFilterPanelProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isFold, setIsFold] = useState(true);
  const [lineCount, setLineCount] = useState(line);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const measure = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        setLineCount(Math.round(el.clientHeight / eachLineHeight));
      }, 300);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => {
      clearTimeout(timer);
      ro.disconnect();
    };
  }, [eachLineHeight]);

  const canFold = !disableFold && lineCount > line;
  const wrapperHeight = disableFold
    ? 'auto'
    : `${(canFold && isFold ? line : lineCount) * eachLineHeight - PANEL_GAP}px`;

  const panelStyle =
    labelWidth != null
      ? ({ '--do-filter-label-width': `${labelWidth}px` } as CSSProperties)
      : undefined;

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
      style={panelStyle}
    >
      <div className="do-filter-box">
        <div className="do-filter-body">
          <div
            className="do-filter-wrapper"
            style={{ height: wrapperHeight }}
          >
            <div
              ref={contentRef}
              className="do-filter-content"
            >
              {children}
            </div>
          </div>
          {canFold ? (
            <button
              type="button"
              className="more-filter-option"
              aria-expanded={!isFold}
              onClick={() => setIsFold((v) => !v)}
            >
              {isFold ? <DownOutlined /> : <UpOutlined />}
              <span>{isFold ? '更多筛选' : '收起筛选'}</span>
            </button>
          ) : null}
        </div>
        {!hideSearch ? (
          <div
            className="do-filter-ctl"
            style={maxCtlWidth ? { maxWidth: maxCtlWidth } : undefined}
          >
            <Button
              type="primary"
              loading={loading}
              disabled={loading}
              onClick={() => {
                if (!loading) onSearch?.(true);
              }}
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
