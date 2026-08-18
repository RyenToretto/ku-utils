import type { MockMethod } from '@/mock/_types';

/** 生产/关闭 Demo 时的空 mock 占位（Vite alias 指向此处，避免打入 `_example`） */
const emptyExampleMocks: MockMethod[] = [];

export default emptyExampleMocks;
