import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CsvExportService {
  export(filename: string, headers: string[], rows: any[][]): void {
    if (!rows || rows.length === 0) {
      alert('No data to export.');
      return;
    }

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(value => {
        const stringVal = value !== null && value !== undefined ? String(value) : '';
        const escaped = stringVal.replace(/"/g, '""');
        return `"${escaped}"`;
      }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
