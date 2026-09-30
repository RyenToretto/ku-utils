import { Card } from 'antd';
import { useState } from 'react';

import DoWordsTag from '@/components/DoWordsTag';

const recommendList = ['新品', '促销', '高转化', '品牌词'];

export default function UiKitWordsTagDemo() {
  const [asideTags, setAsideTags] = useState<string[]>(['新品']);
  const [inlineTags, setInlineTags] = useState<string[]>([]);

  return (
    <div className="page-ui-kit-words-tag">
      <Card
        size="small"
        className="ui-kit-demo-card"
      >
        <h3>侧栏推荐</h3>
        <DoWordsTag
          value={asideTags}
          max={6}
          tagLength={12}
          recommends={recommendList}
          recommendLayout="aside"
          onChange={setAsideTags}
        />
        <p className="ui-kit-demo-hint">{asideTags.join(' / ') || '—'}</p>
      </Card>

      <Card
        size="small"
        className="ui-kit-demo-card"
      >
        <h3>行内推荐</h3>
        <DoWordsTag
          value={inlineTags}
          tipsMain="可从推荐词快速添加；超出长度会截断提示。"
          max={5}
          tagLength={16}
          recommends={recommendList}
          recommendLayout="inline"
          onChange={setInlineTags}
        />
        <p className="ui-kit-demo-hint">{inlineTags.join(' / ') || '—'}</p>
      </Card>
    </div>
  );
}
