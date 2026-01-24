'use client';
import { DisplayRow } from '@/types/diffView';

function DiffRowItem({ row, onJumpToPage, forceMobileMode }: { row: DisplayRow, onJumpToPage?: (p: number, s: 'left' | 'right') => void, forceMobileMode: boolean }) {
    const { status, left, right, isCompact } = row;
    const cardBase = "rounded-lg border shadow-sm transition-all hover:shadow-md h-full flex flex-col group/card p-3 relative";
    const emptyState = forceMobileMode ? "hidden" : "hidden md:block h-full border-none bg-transparent invisible";
    const leftStyle = (status === 'REMOVE' || (isCompact && left)) ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200';
    const rightStyle = (status === 'ADD' || (isCompact && right)) ? 'bg-emerald-50 border-emerald-200' : status === 'MODIFIED' ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-200';

    const PdfButton = ({ pageNumber, side }: { pageNumber: number, side: 'left' | 'right' }) => (
        <button
            onClick={(e) => {
                e.stopPropagation();
                onJumpToPage?.(pageNumber, side);
            }}
            className="float-right ml-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded border border-slate-200 bg-white text-[10px] font-medium text-slate-400 shadow-sm transition-all hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 cursor-pointer select-none"
            title={`Open PDF at page ${pageNumber}`}
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                <path fillRule="evenodd" d="M4.5 2A1.5 1.5 0 003 3.5v13A1.5 1.5 0 004.5 18h11a1.5 1.5 0 001.5-1.5V7.621a1.5 1.5 0 00-.44-1.06l-4.12-4.122A1.5 1.5 0 0011.378 2H4.5zm2.25 8.5a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5zm0 3a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5z" clipRule="evenodd" />
            </svg>
            PDF
        </button>
    );


    const gridClass = forceMobileMode
        ? "grid grid-cols-1 gap-2 items-start group"
        : "grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4 items-start group";

    const labelClass = forceMobileMode
        ? "text-[9px] font-bold text-slate-400 uppercase mr-2 bg-slate-100 px-1 rounded"
        : "md:hidden text-[9px] font-bold text-slate-400 uppercase mr-2 bg-slate-100 px-1 rounded";

    return (
        <div className={gridClass}>
            <div className="relative w-full">
                {left ? (
                    <div className={`${cardBase} ${leftStyle}`}>
                        <div className="flex-1 font-thai-loop text-xs md:text-base text-slate-700 leading-relaxed text-justify block">
                            {left.pageNumber && <PdfButton pageNumber={left.pageNumber} side="left" />}
                            <span className="font-mono font-bold text-slate-400 mr-2 select-none text-[10px]">§ {left.id}</span>
                            <span className={labelClass}>REF</span>
                            {isCompact && <span className="text-[9px] text-red-500 font-bold bg-white/50 px-1 rounded mr-1">REMOVED</span>}
                            {left.content}
                        </div>
                    </div>
                ) : (
                    <div className={emptyState} aria-hidden="true" />
                )}
            </div>
            <div className="relative w-full">
                {right ? (
                    <div className={`${cardBase} ${rightStyle}`}>
                        <div className="flex-1 font-thai-loop text-xs md:text-base text-slate-700 leading-relaxed text-justify block">
                            {right.pageNumber && <PdfButton pageNumber={right.pageNumber} side="right" />}
                            <span className="font-mono font-bold text-slate-400 mr-2 select-none text-[10px]">§ {right.id}</span>
                            <span className={labelClass}>NEW</span>
                            {isCompact && <span className="text-[9px] text-emerald-600 font-bold bg-white/50 px-1 rounded mr-1">NEW</span>}
                            {right.content}
                        </div>
                    </div>
                ) : (
                    <div className={emptyState} aria-hidden="true" />
                )}
            </div>
        </div>
    );
}

export default DiffRowItem;
