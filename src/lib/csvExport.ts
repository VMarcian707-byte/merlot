// ============================================
// EXPORT RAPOARTE CSV — fără dependențe externe
// Compatibil Excel RO (BOM + separator ;), escizare corectă
// ============================================

export interface CsvColumn<T> {
  key: string;
  label: string;
  value?: (row: T) => string | number | null | undefined;
}

function escapeCsvValue(val: unknown): string {
  if (val === null || val === undefined) return '';
  const s = String(val);
  // Esczează ghilimelele duble și câmpurile cu ; , \n "
  if (/[";\n,\t]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function toCsv<T>(rows: T[], columns: CsvColumn<T>[]): string {
  const header = columns.map(c => escapeCsvValue(c.label)).join(';');
  const lines = rows.map(row =>
    columns
      .map(col => escapeCsvValue(col.value ? col.value(row) : (row as any)[col.key]))
      .join(';')
  );
  return [header, ...lines].join('\r\n');
}

export function downloadCsv<T>(filename: string, rows: T[], columns: CsvColumn<T>[]) {
  const csv = toCsv(rows, columns);
  // BOM UTF-8 pentru diacritice în Excel
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return rows.length;
}

export function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.json') ? filename : `${filename}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString('ro-RO', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

// Coloane pentru rapoartele principale din AdminPanel
export const visitColumns = (clientName: (id: string) => string, barmanName: (id: string) => string) => [
  { key: 'scanned_at', label: 'Data & Ora', value: (v: any) => fmtDate(v.scanned_at) },
  { key: 'client', label: 'Client', value: (v: any) => clientName(v.client_id) },
  { key: 'barman', label: 'Barman', value: (v: any) => barmanName(v.barman_id) },
  { key: 'discount_applied', label: 'Reducere (%)' },
  { key: 'bill_amount', label: 'Nota (RON)', value: (v: any) => v.bill_amount ?? '' },
  { key: 'discount_amount', label: 'Economie (RON)', value: (v: any) => v.discount_amount ?? '' },
  { key: 'final_amount', label: 'Încasat (RON)', value: (v: any) => v.final_amount ?? '' },
];

export const clientColumns = () => [
  { key: 'name', label: 'Nume' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Telefon' },
  { key: 'created_at', label: 'Membru din', value: (u: any) => fmtDate(u.created_at) },
  { key: 'gdpr_consent_accepted', label: 'Consimțământ GDPR', value: (u: any) => (u.gdpr_consent_accepted ? 'DA' : 'NU') },
];

export const cardColumns = (clientName: (id: string | null) => string) => [
  { key: 'card_uuid', label: 'UUID Card' },
  { key: 'status', label: 'Status' },
  { key: 'assigned_to', label: 'Atribuit lui', value: (c: any) => clientName(c.assigned_user_id) },
  { key: 'issued_at', label: 'Emis la', value: (c: any) => fmtDate(c.issued_at) },
];
