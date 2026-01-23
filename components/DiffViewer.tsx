'use client';
import React, { useMemo } from 'react';
import { SectionContent } from '@/utils/dataLoader';
import { alignSections, DiffRow } from '@/utils/diffEngine';

interface Props {
    leftSections: SectionContent[];
    rightSections: SectionContent[];
    onJumpToPage?: (page: number, side: 'left' | 'right') => void;
}

export default function DiffViewer({ leftSections, rightSections, onJumpToPage }: Props) {
    const rows = useMemo(() => alignSections(leftSections, rightSections), [leftSections, rightSections]);

    return (
        <div className="w-full font-sans text-sm pb-20 bg-slate-50/50">
            {/* Header Column */}
            <div className="grid grid-cols-2 gap-8 sticky top-0 bg-white/95 backdrop-blur z-10 border-b border-slate-200 shadow-sm px-8 py-4 font-bold text-slate-500 uppercase text-xs tracking-wider">
                <div className="text-center">Reference Document</div>
                <div className="text-center">Comparison Document</div>
            </div>

            <div className="px-8 py-8 space-y-4">
                {rows.map((row, index) => {
                    const prevRow = rows[index - 1];
                    const isNewCategory = !prevRow || prevRow.categoryId !== row.categoryId;

                    return (
                        <React.Fragment key={row.key}>
                            {/* Category Header */}
                            {isNewCategory && (
                                <div className="col-span-2 pt-8 pb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="h-[1px] flex-1 bg-slate-200"></div>
                                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full">
                                            {row.categoryTitle}
                                        </h3>
                                        <div className="h-[1px] flex-1 bg-slate-200"></div>
                                    </div>
                                </div>
                            )}
                            <DiffRowItem row={row} onJumpToPage={onJumpToPage} />
                        </React.Fragment>
                    );
                })}
            </div>

            {rows.length === 0 && (
                <div className="p-20 text-center text-slate-400">No content to compare.</div>
            )}
        </div>
    );
}

function DiffRowItem({ row, onJumpToPage }: { row: DiffRow, onJumpToPage?: (p: number, s: 'left' | 'right') => void }) {
    const { status, left, right } = row;

    // Card Styles
    const cardBase = "bg-white p-6 rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md h-full flex flex-col";

    // Status Styles
    let containerClass = "grid grid-cols-2 gap-8 items-stretch group";

    return (
        <div className={containerClass}>

            {/* LEFT SIDE */}
            <div className="relative">
                {left ? (
                    <div className={`${cardBase} ${status === 'REMOVE' ? 'bg-red-50/50 border-red-200' : ''}`}>
                        <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 font-mono font-bold text-slate-500 text-sm">
                                    §{left.id}
                                </span>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                                    {left.chapter_name || 'General'}
                                </span>
                            </div>
                            {left.pageNumber && (
                                <button
                                    onClick={() => onJumpToPage?.(left.pageNumber!, 'left')}
                                    className="text-[10px] font-medium text-slate-400 hover:text-blue-600 hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                                >
                                    PDF p.{left.pageNumber}
                                </button>
                            )}
                        </div>

                        <div className="flex-1 font-thai-loop text-base text-slate-700 leading-8 text-justify">
                            {left.content}
                        </div>

                        {status === 'REMOVE' && (
                            <div className="mt-4 pt-3 border-t border-red-100 flex justify-end">
                                <span className="text-[10px] font-bold bg-red-100 text-red-600 px-2 py-1 rounded">REMOVED</span>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="h-full rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center min-h-[150px]">
                        <span className="text-slate-300 text-xs font-medium">Not in Reference</span>
                    </div>
                )}
            </div>

            {/* RIGHT SIDE */}
            <div className="relative">
                {right ? (
                    <div className={`${cardBase} ${status === 'ADD' ? 'bg-emerald-50/50 border-emerald-200' : ''} ${status === 'MODIFIED' ? 'bg-amber-50/30 border-amber-200 ring-1 ring-amber-100' : ''}`}>
                        <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 font-mono font-bold text-slate-500 text-sm">
                                    §{right.id}
                                </span>
                                {status === 'ADD' && <span className="text-[10px] font-bold bg-emerald-100 text-emerald-600 px-2 py-1 rounded">NEW</span>}
                                {status === 'MODIFIED' && <span className="text-[10px] font-bold bg-amber-100 text-amber-600 px-2 py-1 rounded">MODIFIED</span>}
                            </div>
                            {right.pageNumber && (
                                <button
                                    onClick={() => onJumpToPage?.(right.pageNumber!, 'right')}
                                    className="text-[10px] font-medium text-slate-400 hover:text-blue-600 hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                                >
                                    PDF p.{right.pageNumber}
                                </button>
                            )}
                        </div>

                        <div className="flex-1 font-thai-loop text-base text-slate-700 leading-8 text-justify">
                            {right.content}
                        </div>
                    </div>
                ) : (
                    <div className="h-full rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center min-h-[150px]">
                        <span className="text-slate-300 text-xs font-medium">Not in Comparison</span>
                    </div>
                )}
            </div>

        </div>
    );
}
