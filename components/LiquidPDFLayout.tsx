'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { pdfjs } from 'react-pdf';
import DiffViewer from './DiffViewer';
import { ConstitutionContent, ConstitutionMeta } from '@/utils/dataLoader';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useDebouncedElementWidth, useDebouncedWindowWidth } from '@/utils/useDebouncedDimensions';
import PDFSidebar from './PDFSidebar';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface Props {
    leftData: ConstitutionContent;
    rightData: ConstitutionContent;
    leftMeta?: ConstitutionMeta;
    rightMeta?: ConstitutionMeta;
}

export default function LiquidPDFLayout({ leftData, rightData, leftMeta, rightMeta }: Props) {
    const [showLeftPdf, setShowLeftPdf] = useState(false);
    const [showRightPdf, setShowRightPdf] = useState(false);


    const leftPdfRef = useRef<HTMLDivElement>(null);
    const rightPdfRef = useRef<HTMLDivElement>(null);
    const centerRef = useRef<HTMLDivElement>(null);


    const windowWidth = useDebouncedWindowWidth(150);
    const centerWidth = useDebouncedElementWidth(centerRef, 100);
    const isMobile = windowWidth > 0 && windowWidth < 768;
    const isContentNarrow = centerWidth > 0 && centerWidth < 400;
    const isCanOpenBothPDF = windowWidth > 900;

    useEffect(() => {
        if ((isMobile || !isCanOpenBothPDF) && showLeftPdf && showRightPdf) {
            setShowRightPdf(false);
        }
    }, [isMobile, isCanOpenBothPDF, showLeftPdf, showRightPdf]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (showRightPdf) {
                    toggleRight(false);
                } else if (showLeftPdf) {
                    toggleLeft(false);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [showLeftPdf, showRightPdf]);

    const toggleLeft = useCallback((val: boolean) => {
        if (val && (isMobile || !isCanOpenBothPDF)) setShowRightPdf(false);
        setShowLeftPdf(val);
    }, [isMobile, isCanOpenBothPDF]);

    const toggleRight = useCallback((val: boolean) => {
        if (val && (isMobile || !isCanOpenBothPDF)) setShowLeftPdf(false);
        setShowRightPdf(val);
    }, [isMobile, isCanOpenBothPDF]);

    const handleJump = useCallback((pageNum: number, side: 'left' | 'right') => {
        if (side === 'left') toggleLeft(true);
        else toggleRight(true);

        setTimeout(() => {
            const container = side === 'left' ? leftPdfRef.current : rightPdfRef.current;
            if (!container) return;

            const pageEl = container.querySelector(`[data-page-number="${pageNum}"]`);
            if (pageEl) {
                pageEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                const canvas = pageEl.querySelector('canvas');
                if (canvas) {
                    canvas.style.transition = 'transform 0.3s';
                    canvas.style.transform = 'scale(1.05)';
                    canvas.style.boxShadow = '0 0 0 4px #FACC15';
                    setTimeout(() => {
                        canvas.style.transform = 'scale(1)';
                        canvas.style.boxShadow = 'none';
                    }, 1500);
                }
            }
        }, 350);
    }, [toggleLeft, toggleRight]);


    return (
        <div className="flex h-[calc(100dvh-140px)] w-full max-w-[2000px] mx-auto overflow-hidden bg-slate-200 rounded-xl shadow-2xl border border-slate-300 relative group/main">

            <PDFSidebar
                key={`left-${isMobile ? 'mobile' : 'desktop'}`}
                ref={leftPdfRef}
                side="left"
                data={leftData}
                meta={leftMeta}
                isOpen={showLeftPdf}
                isMobile={isMobile}
                windowWidth={windowWidth}
                onClose={() => toggleLeft(false)}
            />

            <div ref={centerRef} className="flex-1 flex min-w-0 bg-white overflow-hidden relative z-0 transition-all duration-300">
                <div className={`
                    fixed md:absolute left-4 bottom-6 z-[50] 
                    transition-all duration-300 
                    ${showLeftPdf ? '-translate-x-24 opacity-0' : 'translate-x-0 opacity-100'}
                `}>
                    <button onClick={() => toggleLeft(true)} className="bg-slate-800 text-white p-3 md:py-2 md:px-4 rounded-full shadow-xl hover:bg-blue-600 flex items-center gap-2 transition-all hover:scale-105 active:scale-95">
                        <ChevronRight size={18} /> <span className="text-xs font-bold hidden md:inline">Original</span>
                    </button>
                </div>

                <div className={`
                    fixed md:absolute right-4 bottom-6 z-[50] 
                    transition-all duration-300 
                    ${showRightPdf ? 'translate-x-24 opacity-0' : 'translate-x-0 opacity-100'}
                `}>
                    <button onClick={() => toggleRight(true)} className="bg-slate-800 text-white p-3 md:py-2 md:px-4 rounded-full shadow-xl hover:bg-emerald-600 flex items-center gap-2 transition-all hover:scale-105 active:scale-95">
                        <span className="text-xs font-bold hidden md:inline">Changed</span> <ChevronLeft size={18} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar h-full">
                    <DiffViewer
                        leftSections={leftData.sections}
                        rightSections={rightData.sections}
                        onJumpToPage={handleJump}
                        forceMobileMode={isContentNarrow}
                    />
                </div>
            </div>

            <PDFSidebar
                key={`right-${isMobile ? 'mobile' : 'desktop'}`}
                ref={rightPdfRef}
                side="right"
                data={rightData}
                meta={rightMeta}
                isOpen={showRightPdf}
                isMobile={isMobile}
                windowWidth={windowWidth}
                onClose={() => toggleRight(false)}
            />
        </div>
    );
}