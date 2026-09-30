import { Card } from 'antd';
import { useState } from 'react';

import DoNamePattern from '@/components/DoNamePattern';

const patternList = ['{应用名}', '{日期}', '{时分秒}', '{动态标号}'];

export default function UiKitNamePatternDemo() {
  const [patternBottom, setPatternBottom] = useState('{应用名}-{日期}-{动态标号}');
  const [patternPopover, setPatternPopover] = useState('');
  const [patternTextarea, setPatternTextarea] = useState('{应用名}-{日期}');

  return (
    <div className="page-ui-kit-name-pattern">
      <Card
        size="small"
        className="ui-kit-demo-card"
      >
        <h3>底栏芯片（默认）</h3>
        <DoNamePattern
          value={patternBottom}
          patternList={patternList}
          onChange={setPatternBottom}
        />
        <p className="ui-kit-demo-hint">{patternBottom || '—'}</p>
      </Card>

      <Card
        size="small"
        className="ui-kit-demo-card"
      >
        <h3>浮层插入</h3>
        <DoNamePattern
          value={patternPopover}
          usePopover
          patternList={patternList}
          style={{ maxWidth: 420 }}
          onChange={setPatternPopover}
        />
        <p className="ui-kit-demo-hint">{patternPopover || '—'}</p>
      </Card>

      <Card
        size="small"
        className="ui-kit-demo-card"
      >
        <h3>textarea + useOnly</h3>
        <DoNamePattern
          value={patternTextarea}
          textarea
          useOnly
          patternList={patternList}
          onChange={setPatternTextarea}
        />
        <p className="ui-kit-demo-hint">{patternTextarea || '—'}</p>
      </Card>
    </div>
  );
}
