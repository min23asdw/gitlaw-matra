'use client';
import React, { useMemo } from 'react';
import { SectionContent } from '@/utils/dataLoader';
import { alignSections, DiffRow } from '@/utils/diffEngine';

interface Props {
    leftSections: SectionContent[];
    rightSections: SectionContent[];
    onJumpToPage?: (page: number, side: 'left' | 'right') => void;
}

type DisplayRow = DiffRow & { isCompact?: boolean };

export default function DiffViewer({ leftSections, rightSections, onJumpToPage }: Props) {
    // 1. คำนวณ Diff ตามปกติ
    const rawRows = useMemo(() => alignSections(leftSections, rightSections), [leftSections, rightSections]);

    // 2. Logic จัดระเบียบแถวใหม่ (Zip Compact)
    const displayRows = useMemo(() => {
        const result: DisplayRow[] = [];
        let bufferRemoves: DiffRow[] = [];
        let bufferAdds: DiffRow[] = [];

        // ฟังก์ชันช่วยเคลียร์ Buffer (จับคู่ Remove/Add ที่สะสมไว้)
        const flushBuffers = () => {
            const maxLen = Math.max(bufferRemoves.length, bufferAdds.length);
            for (let i = 0; i < maxLen; i++) {
                const rem = bufferRemoves[i];
                const add = bufferAdds[i];

                // สร้าง Row ใหม่ที่มัดรวมกัน
                result.push({
                    key: `compact-${rem?.key || ''}-${add?.key || ''}`,
                    // ถ้ามีทั้งคู่ ให้ใช้ ID ของฝั่งซ้ายเป็นหลัก หรือแล้วแต่ Logic
                    status: 'COMPACT' as any, // Status พิเศษ
                    isCompact: true,
                    left: rem?.left || undefined,
                    right: add?.right || undefined,
                    // ข้อมูล Category (หยิบจากตัวที่มี)
                    categoryId: (rem || add).categoryId,
                    categoryTitle: (rem || add).categoryTitle,
                    sectionId: (rem || add).sectionId
                });
            }
            bufferRemoves = [];
            bufferAdds = [];
        };

        rawRows.forEach(row => {
            if (row.status === 'MODIFIED' || row.status === 'MATCH') {
                // ถ้าเจอตัวที่ Match/Modify ให้เคลียร์ของเก่าที่ค้างใน Buffer ก่อน
                flushBuffers();
                result.push(row);
            } else if (row.status === 'REMOVE') {
                bufferRemoves.push(row);
            } else if (row.status === 'ADD') {
                bufferAdds.push(row);
            }
        });

        // เคลียร์เศษที่เหลือตอนจบ Loop
        flushBuffers();

        return result;
    }, [rawRows]);

    return (
        <div className="w-full font-sans text-sm pb-20 bg-slate-50/50">
            <div className="grid grid-cols-2 gap-4 sticky top-0 bg-white/95 backdrop-blur z-10 border-b border-slate-200 shadow-sm px-4 py-2 font-bold text-slate-500 uppercase text-xs tracking-wider">
                <div className="text-center">Reference Document</div>
                <div className="text-center">Comparison Document</div>
            </div>

            <div className="px-4 py-4 space-y-1">
                {displayRows.map((row, index) => {
                    const prevRow = displayRows[index - 1];
                    const isNewCategory = !prevRow || prevRow.categoryId !== row.categoryId;

                    return (
                        <React.Fragment key={row.key}>
                            {/* Category Separator */}
                            {isNewCategory && (
                                <div className="col-span-2 pt-8 pb-4">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="h-[1px] flex-1 bg-slate-200"></div>
                                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest bg-white px-4 py-1 rounded-full border border-slate-200 shadow-sm relative z-10">
                                            {row.categoryTitle}
                                        </h3>
                                        <div className="h-[1px] flex-1 bg-slate-200"></div>
                                    </div>

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

            {displayRows.length === 0 && (
                <div className="p-10 text-center text-slate-400">No content to compare.</div>
            )}
        </div>
    );
}

function DiffRowItem({ row, onJumpToPage }: { row: DisplayRow, onJumpToPage?: (p: number, s: 'left' | 'right') => void }) { // เปลี่ยน Type เป็น DisplayRow
    const { status, left, right, isCompact } = row;

    const cardBase = "rounded-lg border shadow-sm transition-all hover:shadow-md h-full flex flex-col group/card p-3 relative";
    const emptyState = "h-full border-none bg-transparent invisible";

    // --- Color Logic ใหม่ ---
    // ถ้าเป็น Compact: 
    //   - ฝั่งซ้าย (ถ้ามี) เป็น REMOVE เสมอ -> สีแดง
    //   - ฝั่งขวา (ถ้ามี) เป็น ADD เสมอ -> สีเขียว
    // ถ้าไม่ใช่ Compact: ใช้ Logic เดิม

    const leftStyle = (status === 'REMOVE' || (isCompact && left))
        ? 'bg-red-50 border-red-200'
        : 'bg-white border-slate-200';

    const rightStyle = (status === 'ADD' || (isCompact && right))
        ? 'bg-emerald-50 border-emerald-200'
        : status === 'MODIFIED'
            ? 'bg-amber-50 border-amber-200'
            : 'bg-white border-slate-200';

    const PdfButton = ({ pageNumber, side }: { pageNumber: number, side: 'left' | 'right' }) => (
        <button
            onClick={(e) => {
                e.stopPropagation();
                onJumpToPage?.(pageNumber, side);
            }}
            // ใช้ float-right เพื่อให้ชิดขวา และ ml-2 เพื่อเว้นระยะจากตัวอักษรถ้ามันมาชน
            className="float-right ml-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded border border-slate-200 bg-white text-[10px] font-medium text-slate-400 shadow-sm transition-all hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 cursor-pointer select-none"
            title={`Open PDF at page ${pageNumber}`}
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                <path fillRule="evenodd" d="M4.5 2A1.5 1.5 0 003 3.5v13A1.5 1.5 0 004.5 18h11a1.5 1.5 0 001.5-1.5V7.621a1.5 1.5 0 00-.44-1.06l-4.12-4.122A1.5 1.5 0 0011.378 2H4.5zm2.25 8.5a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5zm0 3a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5z" clipRule="evenodd" />
            </svg>
            PDF
        </button>
    );

    return (
        <div className="grid grid-cols-2 gap-4 items-start group"> {/* items-start สำคัญมาก! */}
            {/* LEFT SIDE */}
            <div className="relative">
                {left ? (
                    <div className={`${cardBase} ${leftStyle}`}>
                        {/* ... Content ... */}
                        <div className="flex-1 font-thai-loop text-xs text-slate-600 leading-relaxed text-justify block">
                            {left.pageNumber && <PdfButton pageNumber={left.pageNumber} side="left" />}
                            <span className="font-mono font-bold text-slate-400 mr-2 select-none">
                                § {left.id}
                            </span>
                            {/* เพิ่ม Badge บอกสถานะ ถ้าเป็น Compact mode */}
                            {isCompact && <span className="text-[9px] text-red-500 font-bold bg-white/50 px-1 rounded mr-1">REMOVED</span>}

                            {left.content}
                        </div>
                    </div>
                ) : (
                    <div className={emptyState} aria-hidden="true" />
                )}
            </div>

            {/* RIGHT SIDE */}
            <div className="relative">
                {right ? (
                    <div className={`${cardBase} ${rightStyle}`}>
                        {/* ... Content ... */}
                        <div className="flex-1 font-thai-loop text-xs text-slate-600 leading-relaxed text-justify block">
                            {right.pageNumber && <PdfButton pageNumber={right.pageNumber} side="right" />}
                            <span className="font-mono font-bold text-slate-400 mr-2 select-none">
                                § {right.id}
                            </span>
                            {/* เพิ่ม Badge บอกสถานะ ถ้าเป็น Compact mode */}
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