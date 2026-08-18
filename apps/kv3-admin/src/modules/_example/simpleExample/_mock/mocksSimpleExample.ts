import { EXAMPLE_STATUS_DISABLED, EXAMPLE_STATUS_ENABLED } from '../_map/exampleStatus';
import {
  EXAMPLE_TASK_CREATE,
  EXAMPLE_TASK_DELETE,
  EXAMPLE_TASK_UPDATE,
} from '../_map/exampleTaskAction';

import type { MockMethod } from '@/mock/_types';
import { defaultSuccess, ok, parsePageQuery, slicePage } from '@/mock/utils';

/** 硬编码 10 条样本，禁止循环生成 */
const SEED_LISTS = [
  {
    id: 101,
    exampleName: '示例-春季投放',
    status: EXAMPLE_STATUS_ENABLED,
    taskAction: EXAMPLE_TASK_CREATE,
    pkg: 'com.demo.app.a',
    createTime: '2026-03-01 10:00:00',
    createBy: '张三',
    lastModifyTime: '2026-03-02 11:00:00',
    lastModifyBy: '张三',
  },
  {
    id: 102,
    exampleName: '示例-暑期冲量',
    status: EXAMPLE_STATUS_ENABLED,
    taskAction: EXAMPLE_TASK_UPDATE,
    pkg: 'com.demo.app.b',
    createTime: '2026-03-03 09:20:00',
    createBy: '李四',
    lastModifyTime: '2026-03-04 14:10:00',
    lastModifyBy: '李四',
  },
  {
    id: 103,
    exampleName: '示例-素材复用',
    status: EXAMPLE_STATUS_DISABLED,
    taskAction: EXAMPLE_TASK_DELETE,
    pkg: 'com.demo.app.c',
    createTime: '2026-03-05 08:15:00',
    createBy: '王五',
    lastModifyTime: '2026-03-05 16:40:00',
    lastModifyBy: '王五',
  },
  {
    id: 104,
    exampleName: '示例-账户巡检',
    status: EXAMPLE_STATUS_ENABLED,
    taskAction: EXAMPLE_TASK_CREATE,
    pkg: 'com.demo.app.a',
    createTime: '2026-03-06 12:00:00',
    createBy: '赵六',
    lastModifyTime: '2026-03-06 12:30:00',
    lastModifyBy: '赵六',
  },
  {
    id: 105,
    exampleName: '示例-出价实验',
    status: EXAMPLE_STATUS_ENABLED,
    taskAction: EXAMPLE_TASK_UPDATE,
    pkg: 'com.demo.app.d',
    createTime: '2026-03-07 13:22:00',
    createBy: '钱七',
    lastModifyTime: '2026-03-08 09:01:00',
    lastModifyBy: '钱七',
  },
  {
    id: 106,
    exampleName: '示例-定向收敛',
    status: EXAMPLE_STATUS_DISABLED,
    taskAction: EXAMPLE_TASK_UPDATE,
    pkg: 'com.demo.app.b',
    createTime: '2026-03-08 15:40:00',
    createBy: '孙八',
    lastModifyTime: '2026-03-09 10:10:00',
    lastModifyBy: '孙八',
  },
  {
    id: 107,
    exampleName: '示例-预算护栏',
    status: EXAMPLE_STATUS_ENABLED,
    taskAction: EXAMPLE_TASK_CREATE,
    pkg: 'com.demo.app.e',
    createTime: '2026-03-09 11:11:00',
    createBy: '周九',
    lastModifyTime: '2026-03-09 18:18:00',
    lastModifyBy: '周九',
  },
  {
    id: 108,
    exampleName: '示例-素材清洗',
    status: EXAMPLE_STATUS_ENABLED,
    taskAction: EXAMPLE_TASK_DELETE,
    pkg: 'com.demo.app.c',
    createTime: '2026-03-10 07:45:00',
    createBy: '吴十',
    lastModifyTime: '2026-03-10 08:00:00',
    lastModifyBy: '吴十',
  },
  {
    id: 109,
    exampleName: '示例-周末加投',
    status: EXAMPLE_STATUS_DISABLED,
    taskAction: EXAMPLE_TASK_CREATE,
    pkg: 'com.demo.app.a',
    createTime: '2026-03-11 19:00:00',
    createBy: '郑十一',
    lastModifyTime: '2026-03-11 19:30:00',
    lastModifyBy: '郑十一',
  },
  {
    id: 110,
    exampleName: '示例-复盘归档',
    status: EXAMPLE_STATUS_ENABLED,
    taskAction: EXAMPLE_TASK_UPDATE,
    pkg: 'com.demo.app.d',
    createTime: '2026-03-12 10:05:00',
    createBy: '冯十二',
    lastModifyTime: '2026-03-12 21:00:00',
    lastModifyBy: '冯十二',
  },
];

const mocksSimpleExample: MockMethod[] = [
  {
    url: '/api/example/simple',
    method: 'GET',
    response: ({ query }) => {
      const { pageNum, pageSize } = parsePageQuery(query);
      let lists = [...SEED_LISTS];
      if (query.exampleName) {
        lists = lists.filter((row) => row.exampleName.includes(query.exampleName));
      }
      if (query.status !== undefined && query.status !== '') {
        lists = lists.filter((row) => String(row.status) === String(query.status));
      }
      if (query.taskAction) {
        lists = lists.filter((row) => row.taskAction === query.taskAction);
      }
      return ok({
        lists: slicePage(lists, pageNum, pageSize),
        total: lists.length,
      });
    },
  },
  {
    url: '/api/example/simple',
    method: 'POST',
    response: () => defaultSuccess,
  },
  {
    url: '/api/example/simple/:id',
    method: 'PUT',
    response: () => defaultSuccess,
  },
  {
    url: '/api/example/simple/:id',
    method: 'DELETE',
    response: () => defaultSuccess,
  },
  {
    url: '/api/example/simple/batch',
    method: 'POST',
    response: () => defaultSuccess,
  },
];

export default mocksSimpleExample;
