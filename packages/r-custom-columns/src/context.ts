import { createContext, useContext } from 'react';

import type { SchemaColumnConfigReturn } from './useSchemaColumnConfig';

export const SchemaColumnConfigContext = createContext<SchemaColumnConfigReturn | null>(null);

export function useSchemaColumnConfigContext(): SchemaColumnConfigReturn {
  const ctx = useContext(SchemaColumnConfigContext);
  if (!ctx) {
    throw new Error(
      '[r-custom-columns] 请在 SchemaColumnConfigContext.Provider 内使用，或向组件传入 props',
    );
  }
  return ctx;
}

export function useOptionalSchemaColumnConfigContext(): SchemaColumnConfigReturn | null {
  return useContext(SchemaColumnConfigContext);
}
