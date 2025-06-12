export interface User {
  _id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedAt?: string;
  approvedBy?: string;
}

export interface ColumnStatsNumeric {
  min: number;
  max: number;
  average: number;
  sum: number;
  count: number;
}

export interface ColumnStatsCategorical {
  uniqueValues: string[];
  count: number;
  type: 'categorical';
}

export type ColumnStatistics = ColumnStatsNumeric | ColumnStatsCategorical | null;

export interface SheetValidation {
  sheetName: string;
  hasData: boolean;
  hasHeaders: boolean;
  isConsistent: boolean;
}

export interface SheetProcessedData {
  sheetName: string;
  headers: string[];
  columnTypes: Record<string, string>; // e.g., { "ColumnA": "number", "ColumnB": "string" }
  data: Record<string, any>[]; // The actual JSON rows
  rowCount: number;
  columnCount: number;
}

export interface SheetStatistics {
  sheetName: string;
  columns: Record<string, ColumnStatistics>; // e.g., { "ColumnA": {min: 1, ...}, "ColumnB": {uniqueValues: [...], ...} }
}

export type ChartType = 'bar' | 'line' | 'pie' | 'scatter' | 'area' | 'radar' | '3d-column';

// Base chart data from the backend
export interface ChartData {
  _id?: string;
  fileId: string;
  userId: string;
  chartType: string;
  chartTitle: string;
  title: string;
  type: '2d' | '3d';
  xAxis: string;
  yAxis: string;
  sheetName: string;
  config?: {
    colorScheme?: string[];
    animationSpeed?: number;
  };
  data: Record<string, any>[];
  isPublic?: boolean;
  tags?: string[];
  updatedAt: string;
  createdAt: string;
  user?: string;
}

// Extended Chart interface for rendering with data
export interface Chart extends ChartData {
  data: Record<string, any>[];
  config: {
    colorScheme: string[];
    animationSpeed: number;
  };
}

export interface ExcelFile {
  _id: string;
  fileName: string;
  user?: string; // MongoDB ObjectId as string
  userId?: string; // For backward compatibility
  uploadDate: string;
  totalSheets: number;
  sheets: SheetProcessedData[];
  validations?: SheetValidation[];
  statistics?: SheetStatistics[];
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
}
