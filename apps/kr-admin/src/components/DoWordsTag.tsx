import { PlusOutlined } from '@ant-design/icons';
import { Input, Tag } from 'antd';
import { useMemo, useState } from 'react';

import { message } from '@/plugins/antdApp';

export type DoWordsTagProps = {
  value?: string[];
  words?: string[];
  max?: number;
  tagLength?: number;
  recommends?: string[];
  recommendLayout?: 'aside' | 'inline';
  tipsMain?: string;
  onChange?: (value: string[]) => void;
};

/** 可编辑标签 + 推荐词，对齐 kv3 DoWordsTag 主路径（aside / inline）。 */
export function DoWordsTag({
  value,
  words,
  max = 6,
  tagLength = 12,
  recommends = [],
  recommendLayout = 'aside',
  tipsMain,
  onChange,
}: DoWordsTagProps) {
  const tags = value ?? words ?? [];
  const [draft, setDraft] = useState('');
  const editable = !!onChange || value != null;

  const shown = useMemo(() => tags.slice(0, max), [tags, max]);

  function commit(next: string[]) {
    onChange?.(next);
  }

  function addTag(raw: string) {
    const text = raw.trim().slice(0, tagLength);
    if (!text) return;
    if (tags.includes(text)) {
      message.warning('标签已存在');
      return;
    }
    if (tags.length >= max) {
      message.warning(`最多 ${max} 个标签`);
      return;
    }
    commit([...tags, text]);
    setDraft('');
  }

  function removeTag(tag: string) {
    commit(tags.filter((t) => t !== tag));
  }

  const recommendPanel =
    recommends.length > 0 ? (
      <div className={['do-words-tag-recommends', `is-${recommendLayout}`].join(' ')}>
        {recommends.map((item) => (
          <Tag
            key={item}
            className="do-words-tag-recommend"
            onClick={() => editable && addTag(item)}
          >
            <PlusOutlined /> {item}
          </Tag>
        ))}
      </div>
    ) : null;

  return (
    <div className={['do-words-tag', `layout-${recommendLayout}`].join(' ')}>
      <div className="do-words-tag-main">
        {shown.map((w) => (
          <Tag
            key={w}
            closable={editable}
            onClose={(e) => {
              e.preventDefault();
              removeTag(w);
            }}
          >
            {w}
          </Tag>
        ))}
        {editable && tags.length < max ? (
          <Input
            size="small"
            style={{ width: 120 }}
            placeholder="回车添加"
            value={draft}
            maxLength={tagLength}
            onChange={(e) => setDraft(e.target.value)}
            onPressEnter={() => addTag(draft)}
          />
        ) : null}
        {tipsMain ? <p className="do-words-tag-tips">{tipsMain}</p> : null}
      </div>
      {recommendPanel}
    </div>
  );
}

export default DoWordsTag;
