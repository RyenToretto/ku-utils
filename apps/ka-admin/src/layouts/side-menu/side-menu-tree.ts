export type SideMenuNode = {
  path: string;
  title: string;
  /** ng-zorro 图标名（如 `appstore`） */
  icon?: string;
  children?: Array<string | SideMenuNode>;
};

export type SideMenuItem = {
  key: string;
  label: string;
  icon?: string;
  children?: SideMenuItem[];
};

const LEAF_TITLES: Record<string, string> = {
  '/example/simple/list': '示例管理',
  '/example/simple/batch-select': '表外全选（#batch）',
  '/example/school/list': '学校管理',
  '/example/school-selector/demo': '学校选择器 Demo',
  '/example/clazz/list': '班级管理',
  '/example/club/list': '社团活动',
  '/example/ui-kit/panel': '筛选 / 表格 / 分页',
  '/example/ui-kit/cells': '单元格与编辑器',
  '/example/ui-kit/max-height': '表格 max-height',
  '/example/ui-kit/name-pattern': '命名模板',
  '/example/ui-kit/selector': 'DoSelector',
  '/example/ui-kit/words-tag': 'WordsTag',
  '/example/ui-kit/preview-video': '预览视频',
  '/example/ui-kit/schedule-week': '投放时段周',
  '/example/do-filter-panel/buttons-1': '按钮×1',
  '/example/do-filter-panel/buttons-2': '按钮×2',
  '/example/do-filter-panel/buttons-3': '按钮×3',
  '/example/do-filter-panel/buttons-4': '按钮×4',
  '/example/do-filter-panel/rows-1': '行数·少',
  '/example/do-filter-panel/rows-2': '行数·中',
  '/example/do-filter-panel/rows-3': '行数·多',
  '/example/do-filter-panel/rows-50': '行数·50项',
  '/example/do-filter-panel/layout-fold': '布局折叠压表格',
  '/example/custom-columns/basic': '01 基础用法',
  '/example/custom-columns/el-attrs': '02 elAttrs 属性透传',
  '/example/custom-columns/slots': '03 自定义 Slot',
  '/example/custom-columns/nested': '04 嵌套表头',
  '/example/custom-columns/version': '05 版本管理',
  '/example/custom-columns/slot-components': '06 单元格三种写法',
  '/example/custom-columns/header-slots': '07 表头三种写法',
  '/example/custom-columns/fixed-cols': '08 固定列 schema.fixed',
  '/example/nest-menus/a1/page-alpha': '四级 · Alpha',
  '/example/nest-menus/a1/page-beta': '四级 · Beta',
  '/example/nest-menus/a2/page-gamma': '四级 · Gamma',
  '/example/nest-menus/b1/page-delta': '四级 · Delta',
};

function resolveTitle(path: string) {
  return LEAF_TITLES[path] || path.split('/').pop() || path;
}

export function mapChildren(children: Array<string | SideMenuNode> = []): SideMenuItem[] {
  return children.map((child) => {
    if (typeof child === 'string') return { key: child, label: resolveTitle(child) };
    return {
      key: child.path,
      label: child.title,
      children: child.children ? mapChildren(child.children) : undefined,
    };
  });
}

export function firstLeafPath(node: string | SideMenuNode | undefined): string | undefined {
  if (!node) return undefined;
  if (typeof node === 'string') return node;
  if (node.children?.length) return firstLeafPath(node.children[0]);
  return node.path;
}

/** 收集 pathname 所在分支的全部祖先 key（与 kv3 el-menu 默认只展开当前链一致） */
export function collectOpenKeysForPath(menus: SideMenuNode[], pathname: string): string[] {
  const found: string[] = [];

  const walk = (nodes: SideMenuNode[], ancestors: string[]): boolean => {
    for (const node of nodes) {
      const chain = [...ancestors, node.path];
      if (!node.children?.length) {
        if (node.path === pathname) {
          found.push(...ancestors);
          return true;
        }
        continue;
      }
      for (const child of node.children) {
        if (typeof child === 'string') {
          if (child === pathname) {
            found.push(...chain);
            return true;
          }
        } else if (walk([child], chain)) {
          return true;
        }
      }
    }
    return false;
  };

  walk(menus, []);
  return [...new Set(found)];
}
