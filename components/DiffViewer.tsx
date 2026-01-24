'use client';
import React, { useMemo } from 'react';
import { SectionContent } from '@/utils/dataLoader';
import { alignSections, DiffRow } from '@/utils/diffEngine';

interface Props {
    leftSections: SectionContent[];
    rightSections: SectionContent[];
    onJumpToPage?: (page: number, side: 'left' | 'right') => void;
    forceMobileMode?: boolean;
}

type DisplayRow = DiffRow & { isCompact?: boolean };

function DiffViewerComponent({ leftSections, rightSections, onJumpToPage, forceMobileMode = false }: Props) {

    const rawRows = useMemo(() => alignSections(leftSections, rightSections), [leftSections, rightSections]);
    const displayRows = useMemo(() => {
        const result: DisplayRow[] = [];
        let bufferRemoves: DiffRow[] = [];
        let bufferAdds: DiffRow[] = [];
        const flushBuffers = () => {
            const maxLen = Math.max(bufferRemoves.length, bufferAdds.length);
            for (let i = 0; i < maxLen; i++) {
                const rem = bufferRemoves[i];
                const add = bufferAdds[i];
                const mainSource = rem || add;
                result.push({
                    key: `compact-${rem?.key || 'x'}-${add?.key || 'y'}`,
                    status: 'COMPACT' as any,
                    isCompact: true,
                    left: rem?.left || undefined,
                    right: add?.right || undefined,
                    categoryId: mainSource.categoryId,
                    categoryTitle: mainSource.categoryTitle,
                    sectionId: mainSource.sectionId
                });
            }
            bufferRemoves = [];
            bufferAdds = [];
        };
        rawRows.forEach(row => {
            if (row.status === 'MODIFIED' || row.status === 'MATCH') {
                flushBuffers();
                result.push(row);
            } else if (row.status === 'REMOVE') {
                bufferRemoves.push(row);
            } else if (row.status === 'ADD') {
                bufferAdds.push(row);
            }
        });
        flushBuffers();
        return result;
    }, [rawRows]);

    return (
        <div className="w-full font-sans text-sm pb-20 bg-slate-50/50">
            <div className={`${forceMobileMode ? 'hidden' : 'hidden md:grid'} grid-cols-2 gap-4 sticky top-0 bg-white/95 backdrop-blur z-10 border-b border-slate-200 shadow-sm px-4 py-2 font-bold text-slate-500 uppercase text-xs tracking-wider`}>
                <div className="text-center">Reference Document</div>
                <div className="text-center">Comparison Document</div>
            </div>

            <div className="px-4 py-4 space-y-1">
                {displayRows.map((row, index) => {
                    const prevRow = displayRows[index - 1];
                    const isNewCategory = !prevRow || prevRow.categoryId !== row.categoryId;

                    return (
                        <React.Fragment key={row.key}>
                            {isNewCategory && (
                                <div className={`${forceMobileMode ? 'col-span-1' : 'md:col-span-2'} pt-8 pb-4`}>
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="h-[1px] flex-1 bg-slate-200"></div>
                                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest bg-white px-4 py-1 rounded-full border border-slate-200 shadow-sm relative z-10 text-center">
                                            {row.categoryTitle}
                                        </h3>
                                        <div className="h-[1px] flex-1 bg-slate-200"></div>
                                    </div>
                                    {(row.aiSummary || row.keyChange) && (
                                        <div className={`mx-0 ${forceMobileMode ? '' : 'md:mx-4'} mb-6 grid grid-cols-1 ${forceMobileMode ? '' : 'md:grid-cols-3'} gap-4`}>
                                            {row.aiSummary && <div className={`bg-slate-100/50 p-4 rounded-lg text-xs leading-relaxed text-slate-600 border border-slate-200/50 ${forceMobileMode ? '' : 'md:col-span-2'}`}><strong>Summary</strong> {row.aiSummary}</div>}
                                            {row.keyChange && <div className="bg-amber-50/50 p-4 rounded-lg text-xs leading-relaxed text-slate-700 border border-amber-100/50"><strong>Key Change</strong> {row.keyChange}</div>}
                                        </div>
                                    )}
                                </div>
                            )}
                            <DiffRowItem row={row} onJumpToPage={onJumpToPage} forceMobileMode={forceMobileMode} />
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
}

export default React.memo(DiffViewerComponent);
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
                        <div className="flex-1 font-thai-loop text-[11px] text-slate-700 leading-relaxed text-justify block">
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
                        <div className="flex-1 font-thai-loop text-[11px] text-slate-700 leading-relaxed text-justify block">
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