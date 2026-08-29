export function exportToCsv(
  filename: string,
  headers: { label: string; key: string }[],
  data: any[],
) {
  const dateStr = new Date().toISOString().split('T')[0];
  const fullFilename = `${filename}_${dateStr}.csv`;

  const headerRow = headers.map((h) => `"${h.label.replace(/"/g, '""')}"`).join(',');
  const rows = data.map((item) => {
    return headers
      .map((h) => {
        let val = item[h.key];
        if (val === undefined || val === null) val = '';
        else if (typeof val === 'object') {
          if (Array.isArray(val)) val = val.join('; ');
          else val = JSON.stringify(val);
        }
        return `"${String(val).replace(/"/g, '""')}"`;
      })
      .join(',');
  });

  const csvContent = [headerRow, ...rows].join('\r\n');

  if (typeof window !== 'undefined') {
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', fullFilename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return csvContent;
}
