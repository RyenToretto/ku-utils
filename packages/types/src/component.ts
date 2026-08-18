export interface TableColumn {
  key: string;
  title: string;
  dataIndex?: string;
  width?: number | string;
  align?: 'left' | 'center' | 'right';
  fixed?: 'left' | 'right';
  sortable?: boolean;
  filterable?: boolean;
  slot?: string;
  formatter?: (value: unknown, row: Record<string, unknown>) => string;
}

export interface FormField {
  key: string;
  label: string;
  type: 'input' | 'select' | 'date' | 'radio' | 'checkbox' | 'textarea' | 'number' | 'switch';
  placeholder?: string;
  rules?: FormRule[];
  options?: Array<{ label: string; value: unknown }>;
  props?: Record<string, unknown>;
  span?: number;
  defaultValue?: unknown;
}

export interface FormRule {
  required?: boolean;
  message?: string;
  trigger?: 'blur' | 'change';
  min?: number;
  max?: number;
  pattern?: RegExp;
  validator?: (value: unknown) => boolean | string | Promise<boolean | string>;
}

export interface BreadcrumbItem {
  label: string;
  path?: string;
  icon?: string;
}

export interface TabItem {
  key: string;
  label: string;
  icon?: string;
  closable?: boolean;
}
