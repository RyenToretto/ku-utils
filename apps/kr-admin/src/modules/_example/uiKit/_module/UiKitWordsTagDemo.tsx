import { Card } from 'antd';

import { DoWordsTag } from '@/components/DoSelector';

export default function UiKitWordsTagDemo() {
  return (
    <Card title="WordsTag">
      <DoWordsTag
        words={['春', '夏', '秋', '冬', '雨', '雪']}
        max={4}
      />
    </Card>
  );
}
