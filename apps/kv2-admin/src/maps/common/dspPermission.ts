/**
 * starter 模块权限。业务仓可替换为真实权限码表。
 */
export const EXAMPLE_MODULE = 'EXAMPLE_MODULE';

export const MODULE_PERMISSION_KEYS = [EXAMPLE_MODULE] as const;

export type ModulePermission = (typeof MODULE_PERMISSION_KEYS)[number];
