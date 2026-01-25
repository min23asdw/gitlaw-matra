'use client';
import React, { useMemo } from 'react';
import { CategoryOverview, ConstitutionMeta } from '@/utils/dataLoader';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface Props {
    leftMeta: ConstitutionMeta;
    rightMeta: ConstitutionMeta;
    categories: CategoryOverview[];
    isCollapsed: boolean;
    onToggleCollapse: () => void;
}

function ConceptDiff({ leftMeta, rightMeta, categories, isCollapsed, onToggleCollapse }: Props) {
    // 1. Calculate "Weight" of each category (Total Page Ratio)
    const calculateWeight = (meta: ConstitutionMeta) => {
        const weights: Record<string, number> = {};
        meta.pages.flat().forEach(p => {
            weights[p.categoryId] = (weights[p.categoryId] || 0) + p.pageRatio;
        });
        // Convert to % relative to total pages
        Object.keys(weights).forEach(k => {
            weights[k] = (weights[k] / meta.pageCount) * 100;
        });
        return weights;
    };

    const leftWeights = useMemo(() => calculateWeight(leftMeta), [leftMeta]);
    const rightWeights = useMemo(() => calculateWeight(rightMeta), [rightMeta]);

    return (
        <div className={`w-full bg-white/80 backdrop-blur border-b border-gray-200 px-4 md:px-8 shadow-sm z-20 relative transition-all duration-300 ${isCollapsed ? 'py-1' : 'py-4'}`}>

            {/* Toggle Button - Centered Absolute */}
            <button
                onClick={onToggleCollapse}
                className="absolute left-1/2 -translate-x-1/2 -bottom-3 z-30 bg-white border border-gray-200 rounded-b-lg px-3 py-0.5 shadow-sm text-slate-400 hover:text-blue-500 hover:shadow-md transition-all flex items-center justify-center"
            >
                {isCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
            </button>

            {/* Comparison Area - Collapsible */}
            <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${isCollapsed ? 'grid-rows-[0fr]' : 'grid-rows-[1fr]'}`}>
                <div className="overflow-hidden">
                    <div className="flex flex-col md:flex-row gap-1 md:gap-8 items-stretch pt-2">

                        {/* --- LEFT SIDE --- */}
                        <div className="flex-1 flex flex-col gap-2 group/left">
                            <div className="flex justify-between items-end px-1">
                                <div className="text-sm font-semibold text-slate-700 truncate max-w-none">
                                    {leftMeta.year} - {leftMeta.name}
                                </div>
                                <div className="text-[10px] text-slate-400 font-mono">{leftMeta.pageCount} หน้า</div>
                            </div>

                            <div className="h-2 md:h-4 w-full flex rounded-xl overflow-hidden bg-slate-100 relative shadow-inner ring-1 ring-slate-200/50">
                                {categories.map(cat => {
                                    const width = leftWeights[cat.id] || 0;
                                    if (width === 0) return null;
                                    return (
                                        <div
                                            key={cat.id}
                                            style={{ width: `${width}%`, backgroundColor: cat.color }}
                                            className="h-full hover:brightness-110 hover:scale-y-110 transition-all duration-200 relative group"
                                        >
                                            {/* Tooltip */}
                                            <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded-md whitespace-nowrap z-30 pointer-events-none shadow-xl transform translate-y-1 group-hover:translate-y-0 transition-transform">
                                                <div className="font-bold mb-0.5">{cat.title}</div>
                                                <div className="text-slate-300 font-mono text-[9px]">{width.toFixed(1)}%</div>
                                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* --- VS Separator --- */}
                        <div className="relative flex items-center justify-center py-0">
                            <div className="hidden md:flex absolute inset-0 items-center justify-center">
                                <div className="w-full h-px bg-slate-200"></div>
                            </div>
                            <div className="hidden md:flex absolute inset-0 items-center justify-center">
                                <div className="h-full w-px bg-slate-200"></div>
                            </div>
                            <div className="hidden md:flex relative z-10 bg-white rounded-full p-1.5 border border-slate-100 shadow-sm text-[10px] font-black text-slate-400">
                                VS
                            </div>
                        </div>

                        {/* --- RIGHT SIDE --- */}
                        <div className="flex-1 flex flex-col gap-2 group/right">
                            <div className="flex justify-between items-end px-1 md:flex-row">
                                <div className="text-sm font-semibold text-slate-700 truncate  max-w-none">
                                    {rightMeta.year} - {rightMeta.name}
                                </div>
                                <div className="text-[10px] text-slate-400 font-mono">{rightMeta.pageCount} หน้า</div>
                            </div>

                            <div className="h-2 md:h-4 w-full flex rounded-xl overflow-hidden bg-slate-100 relative shadow-inner ring-1 ring-slate-200/50 flex-row">
                                {categories.map(cat => {
                                    const width = rightWeights[cat.id] || 0;
                                    if (width === 0) return null;
                                    return (
                                        <div
                                            key={cat.id}
                                            style={{ width: `${width}%`, backgroundColor: cat.color }}
                                            className="h-full hover:brightness-110 hover:scale-y-110 transition-all duration-200 relative group"
                                        >
                                            {/* Tooltip */}
                                            <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded-md whitespace-nowrap z-30 pointer-events-none shadow-xl transform translate-y-1 group-hover:translate-y-0 transition-transform">
                                                <div className="font-bold mb-0.5">{cat.title}</div>
                                                <div className="text-slate-300 font-mono text-[9px]">{width.toFixed(1)}%</div>
                                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}

export default React.memo(ConceptDiff);