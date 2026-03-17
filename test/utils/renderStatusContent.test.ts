import { describe, expect, it } from 'vitest';
import { renderStatusContent } from '../../src/utils/renderStatusContent';
import { FileStatus } from '../../src/service/ConversionStatusTracker';

describe('renderStatusContent', () => {
    it('shows error message inline under errored file', () => {
        const files: FileStatus[] = [
            { path: 'a.pdf', status: 'error', errorMessage: 'API rate limit' },
        ];
        const html = renderStatusContent(files);
        expect(html).toContain('Error');
        expect(html).toContain('a.pdf');
        expect(html).toContain('API rate limit');
    });

    it('does not render sections with no files', () => {
        const files: FileStatus[] = [
            { path: 'a.pdf', status: 'done' },
        ];
        const html = renderStatusContent(files);
        expect(html).not.toContain('Processing');
        expect(html).not.toContain('Pending');
        expect(html).not.toContain('Error');
        expect(html).toContain('Done');
    });

    it('renders sections in order: Processing, Pending, Error, Done', () => {
        const files: FileStatus[] = [
            { path: 'a.pdf', status: 'done' },
            { path: 'b.pdf', status: 'error', errorMessage: 'fail' },
            { path: 'c.pdf', status: 'pending' },
            { path: 'd.pdf', status: 'processing' },
        ];
        const html = renderStatusContent(files);
        const processingIdx = html.indexOf('Processing');
        const pendingIdx = html.indexOf('Pending');
        const errorIdx = html.indexOf('Error');
        const doneIdx = html.indexOf('Done');
        expect(processingIdx).toBeLessThan(pendingIdx);
        expect(pendingIdx).toBeLessThan(errorIdx);
        expect(errorIdx).toBeLessThan(doneIdx);
    });

    it('shows Processing section with processing files', () => {
        const files: FileStatus[] = [
            { path: 'folder/a.pdf', status: 'processing' },
        ];
        const html = renderStatusContent(files);
        expect(html).toContain('Processing');
        expect(html).toContain('folder/a.pdf');
    });
});
