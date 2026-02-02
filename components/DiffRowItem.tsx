'use client';
import React, { memo } from 'react';
import { DisplayRow } from '@/types/diffView';
import PdfButton from './PdfButton';
import { formatText } from '@/utils/textFormatter';

const getCardStyle = (status: string, isCompact: boolean, hasData: boolean, side: 'left' | 'right') => {
    if (side === 'left') {
        return (status === 'REMOVE' || (isCompact && hasData)) ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200';
    } else {
        return (status === 'ADD' || (isCompact && hasData))
            ? 'bg-emerald-50 border-emerald-200'
            : status === 'MODIFIED'
                ? 'bg-amber-50 border-amber-200'
                : 'bg-white border-slate-200';
    }
};

import { Clock } from 'lucide-react';
import Link from 'next/link';

// Helper for Timeline Button
const TimelineButton = ({ conId, sectionId }: { conId: string, sectionId: string }) => (
    <Link
        href={`/timeline?conId=${conId}&sectionId=${sectionId}`}
        onClick={(e) => e.stopPropagation()}
        className="ml-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full text-slate-300 hover:text-slate-700 hover:bg-slate-100 transition-all"
        title="View Evolution"
    >
        <Clock size={12} strokeWidth={2.5} />
    </Link>
);


function DiffRowItem({ row, onJumpToPage, forceMobileMode, leftId, rightId }: { row: DisplayRow, onJumpToPage?: (p: number, s: 'left' | 'right') => void, forceMobileMode: boolean, leftId: string, rightId: string }) {
    const { status, left, right, isCompact } = row;
    const cardBase = "rounded-lg border shadow-sm transition-shadow duration-200 hover:shadow-md h-full flex flex-col group/card p-3 mb-1 relative";
    const emptyState = forceMobileMode ? "hidden" : "hidden md:block h-full border-none bg-transparent invisible";

    const leftStyle = getCardStyle(status, !!isCompact, !!left, 'left');
    const rightStyle = getCardStyle(status, !!isCompact, !!right, 'right');

    const gridClass = forceMobileMode
        ? "grid grid-cols-1 gap-2 items-start group"
        : "grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4 items-start group";

    const labelClass = forceMobileMode
        ? "text-[9px] font-bold text-slate-400 uppercase mr-2 bg-slate-100 px-1 rounded"
        : "md:hidden text-[9px] font-bold text-slate-400 uppercase mr-2 bg-slate-100 px-1 rounded";

    // --- MATCH STATUS: Special Mobile View ---
    if (status === 'MATCH') {
        const DesktopView = (
            <div className={`hidden md:grid grid-cols-2 md:gap-4 items-start group w-full ${forceMobileMode ? '!hidden' : ''}`}>
                <div className="relative w-full">
                    <div className={`${cardBase} ${leftStyle}`}>
                        <div className="flex-1 text-xs text-slate-700 leading-relaxed text-justify block">
                            <div className="float-right flex items-center">
                                {left?.pageNumber && <PdfButton pageNumber={left.pageNumber} side="left" onJumpToPage={onJumpToPage} />}
                            </div>
                            <span className="font-mono font-bold text-slate-700 select-none text-xs">#{left?.id}</span>
                            {left?.id && <TimelineButton conId={leftId} sectionId={left.id} />}
                            <span className="md:hidden text-[9px] font-bold text-slate-400 uppercase mr-2 bg-slate-100 px-1 rounded">REF</span>
                            {left?.content && <ExpandableText content={left.content} />}
                        </div>
                    </div>
                </div>
                <div className="relative w-full">
                    <div className={`${cardBase} ${rightStyle}`}>
                        <div className="flex-1 text-xs text-slate-700 leading-relaxed text-justify block">
                            <div className="float-right flex items-center">
                                {right?.pageNumber && <PdfButton pageNumber={right.pageNumber} side="right" onJumpToPage={onJumpToPage} />}
                            </div>
                            <span className="font-mono font-bold text-slate-700 select-none text-xs">#{right?.id}</span>
                            {right?.id && <TimelineButton conId={rightId} sectionId={right.id} />}
                            <span className="md:hidden text-[9px] font-bold text-slate-400 uppercase mr-2 bg-slate-100 px-1 rounded">NEW</span>
                            {right?.content && <ExpandableText content={right.content} />}
                        </div>
                    </div>
                </div>
            </div>
        );

        const MobileView = (
            <div className={`md:hidden w-full ${forceMobileMode ? '!block' : ''}`}>
                <div className={`${cardBase} bg-white border-slate-200 border-dashed opacity-80`}>
                    <div className="flex-1 text-xs text-slate-600 leading-relaxed text-justify block">
                        <div className="flex items-center gap-2 mb-2">

                            <span className="font-mono font-bold text-slate-500 select-none text-xs">#{left?.id}</span>
                            {left?.id && <TimelineButton conId={leftId} sectionId={left.id} />}

                            <span className="text-[9px] font-bold text-slate-400 uppercase bg-slate-100 px-1.5 py-0.5 rounded">
                                MATCH
                            </span>
                            <div className="flex  flex-1 gap-1 justify-between">
                                {left?.pageNumber && <PdfButton pageNumber={left.pageNumber} side="left" onJumpToPage={onJumpToPage} />}
                                {right?.pageNumber && right.pageNumber !== left?.pageNumber && <PdfButton pageNumber={right.pageNumber} side="right" onJumpToPage={onJumpToPage} />}
                            </div>
                        </div>
                        {left?.content && <ExpandableText content={left.content} />}
                    </div>
                </div>
            </div>
        );

        return (
            <div className="w-full">
                {DesktopView}
                {MobileView}
            </div>
        );
    }

    // --- NON-MATCH STATUS (or fallback) ---
    return (
        <div className={gridClass}>
            <div className="relative w-full">
                {left ? (
                    <div className={`${cardBase} ${leftStyle}`}>
                        <div className="flex-1  text-xs  text-slate-700 leading-relaxed text-justify block">
                            <div className="float-right flex items-center">
                                {left.pageNumber && <PdfButton pageNumber={left.pageNumber} side="left" onJumpToPage={onJumpToPage} />}
                            </div>

                            <span className="font-mono font-bold text-slate-700 select-none text-xs">#{left.id}</span>
                            {left.id && <TimelineButton conId={leftId} sectionId={left.id} />}

                            <span className={labelClass}>REF</span>
                            {isCompact && <span className="text-[9px] text-red-400 font-bold bg-white/50 px-1 rounded mr-1">REMOVED</span>}
                            {left.content && <ExpandableText content={left.content} />}
                        </div>
                    </div>
                ) : (
                    <div className={emptyState} aria-hidden="true" />
                )}
            </div>
            <div className="relative w-full">
                {right ? (
                    <div className={`${cardBase} ${rightStyle}`}>
                        <div className="flex-1   text-xs  text-slate-700 leading-relaxed text-justify block">
                            <div className="float-right flex items-center">
                                {right.pageNumber && <PdfButton pageNumber={right.pageNumber} side="right" onJumpToPage={onJumpToPage} />}
                            </div>
                            <span className="font-mono font-bold text-slate-700 select-none text-xs">#{right.id}</span>
                            {right.id && <TimelineButton conId={rightId} sectionId={right.id} />}

                            <span className={labelClass}>NEW</span>
                            {isCompact && <span className="text-[9px] text-emerald-400 font-bold bg-white/50 px-1 rounded mr-1">NEW</span>}
                            {right.content && <ExpandableText content={right.content} />}
                        </div>
                    </div>
                ) : (
                    <div className={emptyState} aria-hidden="true" />
                )}
            </div>
        </div>
    );
}

// Helper Component for Expandable Text
const ExpandableText = ({ content }: { content: string }) => {
    const [isExpanded, setIsExpanded] = React.useState(false);
    const MAX_LENGTH = 300; // Characters before truncation

    const shouldTruncate = content.length > MAX_LENGTH;

    const displayedContent = (!isExpanded && shouldTruncate)
        ? content.slice(0, MAX_LENGTH)
        : content;

    const formattedContent = React.useMemo(() => formatText(displayedContent), [displayedContent]);

    return (
        <div
            className={`relative ${shouldTruncate ? 'cursor-pointer' : ''}`}
            onClick={(e) => {
                if (shouldTruncate) {
                    e.stopPropagation();
                    setIsExpanded(!isExpanded);
                }
            }}
        >
            {formattedContent}
            {!isExpanded && shouldTruncate && <span className="text-slate-400 select-none">... </span>}

            {shouldTruncate && (
                <button
                    onClick={(e) => {
                        e.stopPropagation(); // Double safety, though parent handles it now too
                        setIsExpanded(!isExpanded);
                    }}
                    className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-slate-400 hover:text-slate-600 uppercase tracking-wide transition-colors ml-1 select-none"
                    type="button"
                >
                    {isExpanded ? 'Collapse' : 'More'}
                </button>
            )}
        </div>
    );
};


export default memo(DiffRowItem);
