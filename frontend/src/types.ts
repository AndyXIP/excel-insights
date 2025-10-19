// frontend/src/types.ts
export interface ParsedData {
  success: boolean;
  filename: string;
  rowCount: number;
  columns: string[];
  data: Record<string, any>[];
}
