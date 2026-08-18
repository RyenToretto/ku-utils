import { CLUB_STATUS_DISABLED, CLUB_STATUS_ENABLED } from '../_map/clubStatus';

import type { MockMethod } from '@/mock/_types';
import { defaultSuccess, ok, parsePageQuery, slicePage } from '@/mock/utils';

/** 硬编码 10 条，含多所学校 */
const SEED_LISTS = [
  {
    id: 401,
    clubName: '机器人社团',
    status: CLUB_STATUS_ENABLED,
    schools: [
      { id: 201, schoolName: '阳光小学' },
      { id: 202, schoolName: '育才中学' },
    ],
    createTime: '2026-05-01 10:00:00',
  },
  {
    id: 402,
    clubName: '合唱团',
    status: CLUB_STATUS_ENABLED,
    schools: [{ id: 204, schoolName: '海棠实验小学' }],
    createTime: '2026-05-02 11:00:00',
  },
  {
    id: 403,
    clubName: '篮球联赛组',
    status: CLUB_STATUS_DISABLED,
    schools: [
      { id: 205, schoolName: '翠湖中学' },
      { id: 208, schoolName: '博雅中学' },
      { id: 211, schoolName: '云杉中学' },
    ],
    createTime: '2026-05-03 12:00:00',
  },
  {
    id: 404,
    clubName: '编程兴趣班',
    status: CLUB_STATUS_ENABLED,
    schools: [
      { id: 207, schoolName: '启明小学' },
      { id: 212, schoolName: '竹影小学' },
    ],
    createTime: '2026-05-04 13:00:00',
  },
  {
    id: 405,
    clubName: '天文社',
    status: CLUB_STATUS_ENABLED,
    schools: [{ id: 209, schoolName: '青禾高中' }],
    createTime: '2026-05-05 14:00:00',
  },
  {
    id: 406,
    clubName: '话剧社',
    status: CLUB_STATUS_ENABLED,
    schools: [
      { id: 201, schoolName: '阳光小学' },
      { id: 207, schoolName: '启明小学' },
      { id: 204, schoolName: '海棠实验小学' },
    ],
    createTime: '2026-05-06 15:00:00',
  },
  {
    id: 407,
    clubName: '航模社',
    status: CLUB_STATUS_DISABLED,
    schools: [{ id: 202, schoolName: '育才中学' }],
    createTime: '2026-05-07 16:00:00',
  },
  {
    id: 408,
    clubName: '待建社团',
    status: CLUB_STATUS_ENABLED,
    schools: [],
    createTime: '2026-05-08 17:00:00',
  },
  {
    id: 409,
    clubName: '书法研习社',
    status: CLUB_STATUS_ENABLED,
    schools: [
      { id: 208, schoolName: '博雅中学' },
      { id: 209, schoolName: '青禾高中' },
    ],
    createTime: '2026-05-09 18:00:00',
  },
  {
    id: 410,
    clubName: '志愿服务队',
    status: CLUB_STATUS_DISABLED,
    schools: [
      { id: 211, schoolName: '云杉中学' },
      { id: 212, schoolName: '竹影小学' },
    ],
    createTime: '2026-05-10 19:00:00',
  },
];

const mocksClubActivity: MockMethod[] = [
  {
    url: '/api/example/club',
    method: 'GET',
    response: ({ query }) => {
      const { pageNum, pageSize } = parsePageQuery(query);
      let lists = [...SEED_LISTS];
      if (query.clubName) {
        lists = lists.filter((row) => row.clubName.includes(String(query.clubName)));
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
    url: '/api/example/club',
    method: 'POST',
    response: () => defaultSuccess,
  },
  {
    url: '/api/example/club/:id',
    method: 'PUT',
    response: () => defaultSuccess,
  },
  {
    url: '/api/example/club/:id',
    method: 'DELETE',
    response: () => defaultSuccess,
  },
  {
    url: '/api/example/club/batch',
    method: 'POST',
    response: () => defaultSuccess,
  },
];

export default mocksClubActivity;
