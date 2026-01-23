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
            <div className="grid grid-cols-2 gap-4 sticky top-0 bg-white/95 backdrop-blur z-10 border-b border-slate-200 shadow-sm px-4 py-2 font-bold text-slate-500 uppercase text-xs tracking-wider">
                <div className="text-center">Reference Document</div>
                <div className="text-center">Comparison Document</div>
            </div>

            <div className="px-4 py-4 space-y-2">
                {rows.map((row, index) => {
                    const prevRow = rows[index - 1];
                    const isNewCategory = !prevRow || prevRow.categoryId !== row.categoryId;

                    return (
                        <React.Fragment key={row.key}>
                            {/* Category Header with Rich Data */}
                            {isNewCategory && (
                                <div className="col-span-2 pt-8 pb-4">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="h-[1px] flex-1 bg-slate-200"></div>
                                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest bg-white px-4 py-1 rounded-full border border-slate-200 shadow-sm relative z-10">
                                            {row.categoryTitle}
                                        </h3>
                                        <div className="h-[1px] flex-1 bg-slate-200"></div>
                                    </div>

                                    {/* Rich Data Block */}
                                    {(row.aiSummary || row.keyChange) && (
                                        <div className="mx-4 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {row.aiSummary && (
                                                <div className="md:col-span-2 bg-slate-100/50 p-4 rounded-lg text-xs leading-relaxed text-slate-600 border border-slate-200/50">
                                                    <strong className="block text-slate-400 text-[10px] uppercase tracking-wider mb-1">Summary</strong>
                                                    {row.aiSummary}
                                                </div>
                                            )}
                                            {row.keyChange && (
                                                <div className="bg-amber-50/50 p-4 rounded-lg text-xs leading-relaxed text-slate-700 border border-amber-100/50">
                                                    <strong className="block text-amber-400 text-[10px] uppercase tracking-wider mb-1">Key Change</strong>
                                                    {row.keyChange}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                            <DiffRowItem row={row} onJumpToPage={onJumpToPage} />
                        </React.Fragment>
                    );
                })}
            </div>

            {rows.length === 0 && (
                <div className="p-10 text-center text-slate-400">No content to compare.</div>
            )}
        </div>
    );
}

function DiffRowItem({ row, onJumpToPage }: { row: DiffRow, onJumpToPage?: (p: number, s: 'left' | 'right') => void }) {
    const { status, left, right } = row;

    // Compact Card Styles
    const cardBase = "bg-white p-3 rounded-lg border border-slate-200 shadow-sm transition-all hover:shadow-md h-full flex flex-col group/card";

    // Status Styles
    let containerClass = "grid grid-cols-2 gap-4 items-stretch group";

    return (
        <div className={containerClass}>

            {/* LEFT SIDE */}
            <div className="relative">
                {left ? (
                    <div className={`${cardBase} ${status === 'REMOVE' ? 'bg-red-50/30 border-red-200' : ''}`}>
                        <div className="flex items-baseline justify-between mb-2 pb-2 border-b border-slate-50">
                            <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-slate-600 text-xs bg-slate-100 px-1.5 rounded">
                                    § {left.id}
                                </span>
                            </div>
                            {left.pageNumber && (
                                <button
                                    onClick={() => onJumpToPage?.(left.pageNumber!, 'left')}
                                    className="opacity-0 group-hover/card:opacity-100 text-[9px] font-medium text-slate-400 hover:text-blue-600 px-1 rounded transition-all"
                                >
                                    PDF p.{left.pageNumber}
                                </button>
                            )}
                        </div>

                        <div className="flex-1 font-thai-loop text-sm text-slate-800 leading-6 text-justify">
                            {left.content}
                        </div>

                        {status === 'REMOVE' && (
                            <div className="mt-2 pt-1 border-t border-red-100 flex justify-end">
                                <span className="text-[9px] font-bold text-red-500">REMOVED</span>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="h-full rounded-lg border border-dashed border-slate-200 flex items-center justify-center min-h-[40px] bg-slate-50/50">
                        <span className="text-slate-300 text-[10px]">Empty</span>
                    </div>
                )}
            </div>

            {/* RIGHT SIDE */}
            <div className="relative">
                {right ? (
                    <div className={`${cardBase} ${status === 'ADD' ? 'bg-emerald-50/30 border-emerald-200' : ''} ${status === 'MODIFIED' ? 'bg-amber-50/20 border-amber-200' : ''}`}>
                        <div className="flex items-baseline justify-between mb-2 pb-2 border-b border-slate-50">
                            <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-slate-600 text-xs bg-slate-100 px-1.5 rounded">
                                    § {right.id}
                                </span>
                                {status === 'ADD' && <span className="text-[9px] font-bold text-emerald-600 bg-emerald-100 px-1 rounded">NEW</span>}
                                {status === 'MODIFIED' && <span className="text-[9px] font-bold text-amber-600 bg-amber-100 px-1 rounded">MOD</span>}
                            </div>
                            {right.pageNumber && (
                                <button
                                    onClick={() => onJumpToPage?.(right.pageNumber!, 'right')}
                                    className="opacity-0 group-hover/card:opacity-100 text-[9px] font-medium text-slate-400 hover:text-blue-600 px-1 rounded transition-all"
                                >
                                    PDF p.{right.pageNumber}
                                </button>
                            )}
                        </div>

                        <div className="flex-1 font-thai-loop text-sm text-slate-800 leading-6 text-justify">
                            {right.content}
                        </div>
                    </div>
                ) : (
                    <div className="h-full rounded-lg border border-dashed border-slate-200 flex items-center justify-center min-h-[40px] bg-slate-50/50">
                        <span className="text-slate-300 text-[10px]">Empty</span>
                    </div>
                )}
            </div>

        </div>
    );
}
