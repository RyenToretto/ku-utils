import { SCHOOL_STATUS_DISABLED, SCHOOL_STATUS_ENABLED } from '../_map/schoolStatus';

import type { MockMethod } from '@/mock/_types';
import { defaultSuccess, ok, parsePageQuery, slicePage } from '@/mock/utils';

/** 硬编码 12 条，便于选择器 pageSize=5 时测跨页多选 */
const SEED_LISTS = [
  {
    id: 201,
    schoolName: '阳光小学',
    status: SCHOOL_STATUS_ENABLED,
    remark: '城东校区',
    createTime: '2026-03-01 10:00:00',
  },
  {
    id: 202,
    schoolName: '育才中学',
    status: SCHOOL_STATUS_ENABLED,
    remark: '初中部',
    createTime: '2026-03-02 11:00:00',
  },
  {
    id: 203,
    schoolName: '星河高中',
    status: SCHOOL_STATUS_DISABLED,
    remark: '已停招',
    createTime: '2026-03-03 12:00:00',
  },
  {
    id: 204,
    schoolName: '海棠实验小学',
    status: SCHOOL_STATUS_ENABLED,
    remark: '双语',
    createTime: '2026-03-04 13:00:00',
  },
  {
    id: 205,
    schoolName: '翠湖中学',
    status: SCHOOL_STATUS_ENABLED,
    remark: '寄宿',
    createTime: '2026-03-05 14:00:00',
  },
  {
    id: 206,
    schoolName: '文澜书院',
    status: SCHOOL_STATUS_DISABLED,
    remark: '归档',
    createTime: '2026-03-06 15:00:00',
  },
  {
    id: 207,
    schoolName: '启明小学',
    status: SCHOOL_STATUS_ENABLED,
    remark: '城西',
    createTime: '2026-03-07 16:00:00',
  },
  {
    id: 208,
    schoolName: '博雅中学',
    status: SCHOOL_STATUS_ENABLED,
    remark: '艺体特色',
    createTime: '2026-03-08 17:00:00',
  },
  {
    id: 209,
    schoolName: '青禾高中',
    status: SCHOOL_STATUS_ENABLED,
    remark: '新校区',
    createTime: '2026-03-09 18:00:00',
  },
  {
    id: 210,
    schoolName: '南门小学',
    status: SCHOOL_STATUS_DISABLED,
    remark: '迁址中',
    createTime: '2026-03-10 19:00:00',
  },
  {
    id: 211,
    schoolName: '云杉中学',
    status: SCHOOL_STATUS_ENABLED,
    remark: '北部',
    createTime: '2026-03-11 09:00:00',
  },
  {
    id: 212,
    schoolName: '竹影小学',
    status: SCHOOL_STATUS_ENABLED,
    remark: '乡镇',
    createTime: '2026-03-12 09:30:00',
  },
];

const mocksSchoolResource: MockMethod[] = [
  {
    url: '/api/example/school',
    method: 'GET',
    response: ({ query }) => {
      const { pageNum, pageSize } = parsePageQuery(query);
      let lists = [...SEED_LISTS];
      if (query.schoolName) {
        lists = lists.filter((row) => row.schoolName.includes(String(query.schoolName)));
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
    url: '/api/example/school',
    method: 'POST',
    response: () => defaultSuccess,
  },
  {
    url: '/api/example/school/:id',
    method: 'PUT',
    response: () => defaultSuccess,
  },
  {
    url: '/api/example/school/:id',
    method: 'DELETE',
    response: () => defaultSuccess,
  },
  {
    url: '/api/example/school/batch',
    method: 'POST',
    response: () => defaultSuccess,
  },
];

export default mocksSchoolResource;
