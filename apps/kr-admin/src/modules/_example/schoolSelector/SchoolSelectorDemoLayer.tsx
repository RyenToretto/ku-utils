import { Button } from 'antd';
import { useState } from 'react';

import DialogEditSchoolSelectorDemo, {
  type SchoolSelectorDemoForm,
} from './_module/DialogEditSchoolSelectorDemo';

import DoFilterPanel from '@/components/DoFilterPanel';
import SchoolSelector, {
  type SchoolSelectorValue,
} from '@/modules/_example/schoolResource/_module/SchoolSelector';

function formatMultiLabels(list: Array<{ label: string }>) {
  if (!list.length) return '';
  return list.map((item) => item.label).join('、');
}

export default function SchoolSelectorDemoLayer() {
  const [schoolSingle, setSchoolSingle] = useState<SchoolSelectorValue>(null);
  const [schoolMulti, setSchoolMulti] = useState<SchoolSelectorValue>([]);
  const [lastFilterSnapshot, setLastFilterSnapshot] = useState('');
  const [lastDialogSnapshot, setLastDialogSnapshot] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [editSeed, setEditSeed] = useState<SchoolSelectorDemoForm | null>(null);

  const multiList = Array.isArray(schoolMulti) ? schoolMulti : [];

  function handleFilterSearch() {
    setLastFilterSnapshot(
      JSON.stringify({
        single: schoolSingle && !Array.isArray(schoolSingle) ? schoolSingle.id : null,
        multi: multiList.map((item) => item.id),
      }),
    );
  }

  function handleFilterReset() {
    setSchoolSingle(null);
    setSchoolMulti([]);
    setLastFilterSnapshot('');
  }

  function openCreateDemo() {
    setEditSeed(null);
    setEditOpen(true);
  }

  function openEditDemo() {
    setEditSeed({
      id: 'demo-1',
      demoName: '演示班级计划',
      schoolSingle: schoolSingle && !Array.isArray(schoolSingle) ? schoolSingle : null,
      schoolMulti: [...multiList],
    });
    setEditOpen(true);
  }

  function onDialogSuccess(payload: SchoolSelectorDemoForm) {
    setLastDialogSnapshot(
      `${payload.demoName}｜单选=${payload.schoolSingle?.label || '—'}｜多选=${
        formatMultiLabels(payload.schoolMulti) || '—'
      }`,
    );
  }

  return (
    <div className="page-example-school-selector-demo">
      <section className="page-example-school-selector-demo-card">
        <h3 className="page-example-school-selector-demo-section">筛选区（单选 / 多选）</h3>
        <DoFilterPanel
          line={1}
          onSearch={handleFilterSearch}
          ctl={<Button onClick={handleFilterReset}>重置</Button>}
        >
          <div className="do-filter-field">
            <span className="do-filter-field-label do-filter-field-label-wide">学校（单选）</span>
            <SchoolSelector
              value={schoolSingle}
              onChange={setSchoolSingle}
              placeholder="请选择学校"
            />
          </div>
          <div className="do-filter-field">
            <span className="do-filter-field-label do-filter-field-label-wide">学校（多选）</span>
            <SchoolSelector
              value={schoolMulti}
              onChange={setSchoolMulti}
              multiple
              placeholder="请选择学校（可多选）"
              defaultPageSize={5}
            />
          </div>
        </DoFilterPanel>
        <p className="page-example-school-selector-demo-meta">
          当前值：单选=
          {schoolSingle && !Array.isArray(schoolSingle) ? schoolSingle.label : '—'}
          ；多选={formatMultiLabels(multiList) || '—'}
        </p>
        {lastFilterSnapshot ? (
          <p className="page-example-school-selector-demo-meta">
            上次查询快照：{lastFilterSnapshot}
          </p>
        ) : null}
      </section>

      <section className="page-example-school-selector-demo-card">
        <h3 className="page-example-school-selector-demo-section">弹层表单回填</h3>
        <div className="page-example-school-selector-demo-actions">
          <Button
            type="primary"
            onClick={openCreateDemo}
          >
            新建演示
          </Button>
          <Button onClick={openEditDemo}>编辑演示</Button>
        </div>
        {lastDialogSnapshot ? (
          <p className="page-example-school-selector-demo-meta">
            上次弹层提交：{lastDialogSnapshot}
          </p>
        ) : null}
      </section>

      <DialogEditSchoolSelectorDemo
        open={editOpen}
        seed={editSeed}
        onClose={() => setEditOpen(false)}
        onSuccess={onDialogSuccess}
      />
    </div>
  );
}
