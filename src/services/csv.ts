type CsvValue = string | number | boolean | Date | null | undefined;

export function formatCsv(rows: Record<string, CsvValue>[], columns: string[]) {
  const lines = [
    columns.map(escapeCsvCell).join(","),
    ...rows.map((row) => columns.map((column) => escapeCsvCell(row[column])).join(","))
  ];
  return `${lines.join("\n")}\n`;
}

export function csvHeaders(filename: string) {
  return {
    "content-type": "text/csv; charset=utf-8",
    "content-disposition": `attachment; filename="${filename}"`
  };
}

function escapeCsvCell(value: CsvValue) {
  const text = value instanceof Date ? value.toISOString() : String(value ?? "");
  return /[",\n\r]/.test(text) ? `"${text.replaceAll("\"", "\"\"")}"` : text;
}
