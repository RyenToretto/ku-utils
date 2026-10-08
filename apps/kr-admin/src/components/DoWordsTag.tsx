import { CheckOutlined, CloseOutlined, ReloadOutlined } from '@ant-design/icons';
import { getTextLength } from '@ku-utils/utils';
import { Button, Input, type InputRef, Space } from 'antd';
import { useRef, useState } from 'react';

import { message } from '@/plugins/antdApp';

export type DoWordsTagProps = {
  value?: string[] | null;
  tipsMain?: string;
  max?: number;
  tagLength?: number;
  minTagLength?: number;
  recommends?: string[];
  recommendLayout?: 'aside' | 'inline';
  onChange?: (value: string[]) => void;
};

function cutByVisualLength(text: string, maxLen: number) {
  if (getTextLength(text) <= maxLen) return text;
  let len = 0;
  let result = '';
  for (const ch of text) {
    const chLen = getTextLength(ch);
    if (len + chLen > maxLen) break;
    len += chLen;
    result += ch;
  }
  return result;
}

/** 关键词标签录入 + 推荐词（对齐 kv3 DoWordsTag：aside 复选 / inline 芯片）。 */
export function DoWordsTag({
  value,
  tipsMain = '标签',
  max = 10,
  tagLength = 9,
  minTagLength = 0,
  recommends = [],
  recommendLayout = 'aside',
  onChange,
}: DoWordsTagProps) {
  const inputRef = useRef<InputRef>(null);
  const [draft, setDraft] = useState('');
  const tagList = value ?? [];

  const maxCount = max > 0 ? max : 0;
  const maxTagLength = tagLength > 0 ? tagLength : 0;
  const minLength = minTagLength > 0 ? minTagLength : 0;
  const isAtMax = maxCount > 0 && tagList.length >= maxCount;

  let placeholder = '请输入';
  if (isAtMax) placeholder = `最多添加${maxCount}个${tipsMain}`;
  else if (tipsMain && maxTagLength > 0) placeholder = `每个${tipsMain}最多${maxTagLength}个字符`;

  function onDraftInput(text: string) {
    setDraft(maxTagLength ? cutByVisualLength(text, maxTagLength) : text);
  }

  function focusInput() {
    inputRef.current?.focus();
  }

  function removeAt(index: number) {
    if (index < 0) return;
    onChange?.(tagList.filter((_, i) => i !== index));
  }

  function addTag(raw: string, options?: { fromInput?: boolean; toggle?: boolean }) {
    const text = (raw || '').trim();
    if (!text) return;

    if (options?.fromInput) {
      const len = getTextLength(text);
      if (maxTagLength > 0 && len > maxTagLength) {
        message.warning(`长度必须小于等于${maxTagLength}`);
        focusInput();
        return;
      }
      if (minLength > 0 && len < minLength) {
        message.warning(`长度必须大于等于${minLength}`);
        focusInput();
        return;
      }
      setDraft('');
      focusInput();
    }

    const foundIndex = tagList.indexOf(text);
    if (foundIndex >= 0) {
      if (options?.toggle) removeAt(foundIndex);
      return;
    }

    if (isAtMax) {
      message.warning(`最多添加${maxCount}个${tipsMain}`);
      return;
    }

    onChange?.([...tagList, text]);
  }

  function addFromInput() {
    addTag(draft, { fromInput: true });
  }

  function toggleTag(text: string) {
    addTag(text, { toggle: true });
  }

  function clearTags() {
    if (!tagList.length) return;
    onChange?.([]);
  }

  const showRecommends = recommends.length > 0;

  return (
    <div
      className={['do-words-tag', recommendLayout === 'inline' ? 'is-inline-recommend' : '']
        .filter(Boolean)
        .join(' ')}
    >
      <div className="do-words-tag-layer">
        <div className="do-words-tag-panel">
          <Space.Compact
            block
            className="do-words-tag-header"
          >
            <Input
              ref={inputRef}
              allowClear
              disabled={isAtMax}
              placeholder={placeholder}
              value={draft}
              onChange={(e) => onDraftInput(e.target.value)}
              onPressEnter={addFromInput}
            />
            <Button
              disabled={isAtMax}
              onClick={addFromInput}
            >
              添加(回车键)
            </Button>
          </Space.Compact>

          {showRecommends && recommendLayout === 'inline' ? (
            <div className="do-words-tag-recommend-inline">
              <span className="do-words-tag-recommend-inline-label">推荐{tipsMain}</span>
              <div className="do-words-tag-recommend-inline-list">
                {recommends.map((item, index) => (
                  <span
                    key={`${item}-${index}`}
                    className={[
                      'do-words-tag-recommend-chip',
                      tagList.includes(item) ? 'is-active' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    role="button"
                    tabIndex={0}
                    onClick={() => toggleTag(item)}
                    onKeyUp={(e) => {
                      if (e.key === 'Enter') toggleTag(item);
                    }}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <div className="do-words-tag-body">
            <div className="do-words-tag-card">
              <div className="do-words-tag-card-hd">
                <div className="do-words-tag-card-hd-left">
                  <span className="do-words-tag-main-tips">已添加{tipsMain}</span>
                  {maxCount > 0 ? (
                    <span className="do-words-tag-count-tips">
                      {tagList.length}/{maxCount}
                    </span>
                  ) : null}
                </div>
                <button
                  type="button"
                  className="do-words-tag-clear-btn"
                  onClick={clearTags}
                >
                  <span>清空</span>
                  <ReloadOutlined />
                </button>
              </div>
              <div className="do-words-tag-chosen-list">
                {tagList.map((tag, index) => (
                  <div
                    key={`${tag}-${index}`}
                    className="do-words-tag-chosen-item"
                  >
                    <div
                      className="do-words-tag-chosen-cell"
                      title={tag}
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        className="do-words-tag-chosen-remove"
                        aria-label="移除"
                        onClick={() => removeAt(index)}
                      >
                        <CloseOutlined />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {showRecommends && recommendLayout === 'aside' ? (
          <div className="do-words-tag-aside">
            <div className="do-words-tag-recommend-title">推荐{tipsMain}：</div>
            <div className="do-words-tag-recommend-card">
              <div className="do-words-tag-recommend-scroller">
                {recommends.map((item, index) => {
                  const active = tagList.includes(item);
                  return (
                    <div
                      key={`${item}-${index}`}
                      className={['do-words-tag-recommend-item', active ? 'is-active' : '']
                        .filter(Boolean)
                        .join(' ')}
                      onClick={() => toggleTag(item)}
                    >
                      <span
                        className={['do-words-tag-recommend-check', active ? 'is-active' : '']
                          .filter(Boolean)
                          .join(' ')}
                      >
                        {active ? <CheckOutlined /> : null}
                      </span>
                      <span className="do-words-tag-recommend-label">{item}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default DoWordsTag;
