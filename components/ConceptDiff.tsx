'use client';
import React, { useMemo } from 'react';
import { CategoryOverview, ConstitutionMeta } from '@/utils/dataLoader';

interface Props {
    leftMeta: ConstitutionMeta;
    rightMeta: ConstitutionMeta;
    categories: CategoryOverview[];
    onCategoryClick: (catId: string) => void;
}

export default function ConceptDiff({ leftMeta, rightMeta, categories, onCategoryClick }: Props) {

    // 1. คำนวณ "น้ำหนัก" ของแต่ละหมวด (Total Page Ratio)
    const calculateWeight = (meta: ConstitutionMeta) => {
        const weights: Record<string, number> = {};
        meta.pages.flat().forEach(p => {
            weights[p.categoryId] = (weights[p.categoryId] || 0) + p.pageRatio;
        });
        // แปลงเป็น % เทียบกับจำนวนหน้าทั้งหมด
        Object.keys(weights).forEach(k => {
            weights[k] = (weights[k] / meta.pageCount) * 100;
        });
        return weights;
    };

    const leftWeights = useMemo(() => calculateWeight(leftMeta), [leftMeta]);
    const rightWeights = useMemo(() => calculateWeight(rightMeta), [rightMeta]);

    // Helper หาข้อมูลหมวด
    const getCat = (id: string) => categories.find(c => c.id === id);

    return (
        <div className="w-full bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-6 shadow-sm z-20 relative">

            {/* Legend / Title */}
            <div className="shrink-0 flex flex-col justify-center">
                <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Structure Analysis</div>
                <div className="flex gap-2 text-[10px] text-gray-500">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400"></span>เพิ่ม</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400"></span>ลบ</span>
                </div>
            </div>

            <div className="flex-1 flex gap-4 items-center">
                {/* --- LEFT DNA BAR --- */}
                <div className="flex-1 relative group/bar">
                    <div className="h-6 w-full flex rounded overflow-hidden bg-gray-100 relative">
                        {categories.map(cat => {
                            const width = leftWeights[cat.id] || 0;
                            if (width === 0) return null;
                            return (
                                <div
                                    key={cat.id}
                                    style={{ width: `${width}%`, backgroundColor: cat.color }}
                                    className="h-full hover:brightness-110 cursor-pointer transition-all relative group"
                                    onClick={() => onCategoryClick(cat.id)}
                                >
                                    {/* Tooltip */}
                                    <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-30 pointer-events-none shadow-lg">
                                        {cat.title} ({width.toFixed(1)}%)
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* --- VS / Stats --- */}
                <div className="text-[10px] font-mono text-gray-400">VS</div>

                {/* --- RIGHT DNA BAR --- */}
                <div className="flex-1 relative group/bar">
                    <div className="h-6 w-full flex rounded overflow-hidden bg-gray-100 relative">
                        {categories.map(cat => {
                            const width = rightWeights[cat.id] || 0;
                            if (width === 0) return null;
                            return (
                                <div
                                    key={cat.id}
                                    style={{ width: `${width}%`, backgroundColor: cat.color }}
                                    className="h-full hover:brightness-110 cursor-pointer transition-all relative group"
                                    onClick={() => onCategoryClick(cat.id)}
                                >
                                    {/* Tooltip */}
                                    <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-30 pointer-events-none shadow-lg">
                                        {cat.title} ({width.toFixed(1)}%)
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}