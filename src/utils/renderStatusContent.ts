import { FileStatus, ConversionStatus } from '../service/ConversionStatusTracker';

const SECTION_ORDER: ConversionStatus[] = ['processing', 'pending', 'error', 'done'];
const SECTION_LABELS: Record<ConversionStatus, string> = {
    processing: 'Processing',
    pending: 'Pending',
    error: 'Error',
    done: 'Done',
};

export function renderStatusContent(files: FileStatus[]): string {
    const grouped = new Map<ConversionStatus, FileStatus[]>();
    for (const status of SECTION_ORDER) grouped.set(status, []);
    for (const file of files) grouped.get(file.status)?.push(file);

    let html = '';
    for (const status of SECTION_ORDER) {
        const group = grouped.get(status)!;
        if (group.length === 0) continue;
        html += `<h3>${SECTION_LABELS[status]}</h3><ul>`;
        for (const file of group) {
            html += `<li>${file.path}`;
            if (file.errorMessage) html += `<br><small>${file.errorMessage}</small>`;
            html += `</li>`;
        }
        html += `</ul>`;
    }
    return html;
}
