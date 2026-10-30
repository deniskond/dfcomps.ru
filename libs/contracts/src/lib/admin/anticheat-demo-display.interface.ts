export interface AnticheatDemoDisplayInterface {
  summary: { label: string; value: string }[];
  tables: { title: string; columns: string[]; rows: string[][] }[];
  warnings: string[];
}
