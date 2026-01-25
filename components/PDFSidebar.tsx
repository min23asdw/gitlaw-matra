'use client';

import React from 'react';
import { Document, Page } from 'react-pdf';
import { FileText, X } from 'lucide-react';
import { ConstitutionContent, ConstitutionMeta } from '@/utils/dataLoader';

interface PDFSidebarProps {
    side: 'left' | 'right';
    data: ConstitutionContent;
    meta?: ConstitutionMeta;
    isOpen: boolean;
    isMobile: boolean;
    windowWidth: number;
    onClose: () => void;
}

const PDFSidebar = React.forwardRef<HTMLDivElement, PDFSidebarProps>(({
    side,
    data,
    meta,
    isOpen,
    isMobile,
    windowWidth,
    onClose
}, ref) => {

    const pdfUrl = `/${data.id}.pdf`;
    const pageCount = meta?.pageCount || 15;

    const mobileClasses = `
        fixed top-0 bottom-0 z-[60] w-[65vw] h-full
        transition-transform duration-300 ease-out
        ${side === 'left' ? 'left-0 border-r' : 'right-0 border-l'}
        ${isOpen ? 'translate-x-0' : (side === 'left' ? '-translate-x-full' : 'translate-x-full')}
    `;

    const desktopClasses = `
        relative z-0 h-full border-slate-700
        transition-[width,opacity] duration-300 ease-in-out overflow-hidden
        ${isOpen ? 'w-[450px] border-x opacity-100' : 'w-0 border-none opacity-0'}
    `;

    const containerClasses = isMobile ? mobileClasses : desktopClasses;

    return (
        <React.Fragment>
            {/* Mobile Backdrop */}
            {isMobile && (
                <div
                    className={`
                        fixed inset-0 z-[50] bg-black/60 backdrop-blur-sm transition-opacity duration-300
                        ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
                    `}
                    onClick={onClose}
                    aria-hidden="true"
                />
            )}

            <div
                className={`bg-slate-900 border-slate-700 shadow-2xl flex flex-col ${containerClasses}`}
            >
                <div className={`flex flex-col h-full w-full ${isMobile ? 'min-w-[65vw]' : 'min-w-[450px]'}`}>
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 bg-black/40 backdrop-blur-md border-b border-white/10 text-white shrink-0">
                        <span className="text-xs font-mono text-slate-300 flex items-center gap-2">
                            <FileText size={14} /> {side === 'left' ? 'Ref (Left)' : 'Comp (Right)'}
                        </span>
                        <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-full transition active:bg-white/30">
                            <X size={18} />
                        </button>
                    </div>

                    <div ref={ref} className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6 bg-slate-900/95">
                        <Document file={pdfUrl} className="flex flex-col gap-6 items-center" loading={null} error={null}>
                            {Array.from(new Array(pageCount), (_, i) => (
                                <div key={i + 1} data-page-number={i + 1} className="relative w-full flex justify-center">
                                    <Page
                                        pageNumber={i + 1}
                                        width={isMobile ? (windowWidth * 0.65) - 32 : 300}
                                        renderTextLayer={false}
                                        renderAnnotationLayer={false}
                                        className="shadow-lg rounded-sm bg-white"
                                        loading={<div className="bg-white w-full h-[400px] shadow-lg rounded-sm" />}
                                    />
                                    <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] text-slate-500 font-mono">{i + 1}</span>
                                </div>
                            ))}
                        </Document>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
});

PDFSidebar.displayName = 'PDFSidebar';

export default React.memo(PDFSidebar);