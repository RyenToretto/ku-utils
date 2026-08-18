import { CLAZZ_STATUS_DISABLED, CLAZZ_STATUS_ENABLED } from '../_map/clazzStatus';

import type { MockMethod } from '@/mock/_types';
import { defaultSuccess, ok, parsePageQuery, slicePage } from '@/mock/utils';

/** 硬编码 10 条 */
const SEED_LISTS = [
  {
    id: 301,
    clazzName: '一年级1班',
    status: CLAZZ_STATUS_ENABLED,
    schoolId: 201,
    schoolName: '阳光小学',
    createTime: '2026-04-01 10:00:00',
  },
  {
    id: 302,
    clazzName: '初二3班',
    status: CLAZZ_STATUS_ENABLED,
    schoolId: 202,
    schoolName: '育才中学',
    createTime: '2026-04-02 11:00:00',
  },
  {
    id: 303,
    clazzName: '高一2班',
    status: CLAZZ_STATUS_DISABLED,
    schoolId: 204,
    schoolName: '海棠实验小学',
    createTime: '2026-04-03 12:00:00',
  },
  {
    id: 304,
    clazzName: '二年级2班',
    status: CLAZZ_STATUS_ENABLED,
    schoolId: 205,
    schoolName: '翠湖中学',
    createTime: '2026-04-04 13:00:00',
  },
  {
    id: 305,
    clazzName: '初三1班',
    status: CLAZZ_STATUS_ENABLED,
    schoolId: 208,
    schoolName: '博雅中学',
    createTime: '2026-04-05 14:00:00',
  },
  {
    id: 306,
    clazzName: '高二4班',
    status: CLAZZ_STATUS_ENABLED,
    schoolId: 209,
    schoolName: '青禾高中',
    createTime: '2026-04-06 15:00:00',
  },
  {
    id: 307,
    clazzName: '三年级1班',
    status: CLAZZ_STATUS_DISABLED,
    schoolId: 207,
    schoolName: '启明小学',
    createTime: '2026-04-07 16:00:00',
  },
  {
    id: 308,
    clazzName: '待分配班级',
    status: CLAZZ_STATUS_ENABLED,
    schoolId: null,
    schoolName: '',
    createTime: '2026-04-08 17:00:00',
  },
  {
    id: 309,
    clazzName: '初一5班',
    status: CLAZZ_STATUS_ENABLED,
    schoolId: 211,
    schoolName: '云杉中学',
    createTime: '2026-04-09 18:00:00',
  },
  {
    id: 310,
    clazzName: '四年级3班',
    status: CLAZZ_STATUS_DISABLED,
    schoolId: 212,
    schoolName: '竹影小学',
    createTime: '2026-04-10 19:00:00',
  },
];

const mocksClazzManage: MockMethod[] = [
  {
    url: '/api/example/clazz',
    method: 'GET',
    response: ({ query }) => {
      const { pageNum, pageSize } = parsePageQuery(query);
      let lists = [...SEED_LISTS];
      if (query.clazzName) {
        lists = lists.filter((row) => row.clazzName.includes(String(query.clazzName)));
      }
      if (query.status !== undefined && query.status !== '') {
        lists = lists.filter((row) => String(row.status) === String(query.status));
      }
      return ok({
        lists: slicePage(lists, pageNum, pageSize),
        total: lists.length,
      });
    },
  },
  {
    url: '/api/example/clazz',
    method: 'POST',
    response: () => defaultSuccess,
  },
  {
    url: '/api/example/clazz/:id',
    method: 'PUT',
    response: () => defaultSuccess,
  },
  {
    url: '/api/example/clazz/:id',
    method: 'DELETE',
    response: () => defaultSuccess,
  },
];

export default mocksClazzManage;
