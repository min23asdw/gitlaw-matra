'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ConstitutionData, getAllConstitutions, fetchConstitutionData } from '@/utils/dataLoader';
import ConceptDiff from '@/components/ConceptDiff';
import WelcomeHero from '@/components/WelcomeHero';
import dynamic from 'next/dynamic';

// ✅ 1. ใช้ React.memo กับ Layout เพื่อป้องกันการ Render ซ้ำตอน isLoading เปลี่ยน
const LiquidPDFLayout = dynamic(() => import('@/components/LiquidPDFLayout'), { ssr: false });
const MemoizedLayout = React.memo(LiquidPDFLayout);

interface Props {
    initialLeftId: string;
    initialRightId: string;
    initialLeftData: ConstitutionData;
    initialRightData: ConstitutionData;
}

export default function DeepLinkView({
    initialLeftId,
    initialRightId,
    initialLeftData,
    initialRightData
}: Props) {
    // State UI (Dropdown & URL) - แยกออกจาก Data เพื่อความลื่น
    const [leftId, setLeftId] = useState(initialLeftId);
    const [rightId, setRightId] = useState(initialRightId);

    // State Data (Content)
    const [leftData, setLeftData] = useState(initialLeftData);
    const [rightData, setRightData] = useState(initialRightData);

    const [isLoading, setIsLoading] = useState(false);
    const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);

    // กัน Race Condition (กดรัวๆ แล้วข้อมูลอันเก่ามาทับอันใหม่)
    const activeRequest = useRef<string>("");

    const allConstitutions = useMemo(() => getAllConstitutions(), []);

    const updateComparison = async (newLeftId: string, newRightId: string) => {
        // ✅ 2. Optimistic Update: เปลี่ยน UI ทันที ไม่ต้องรอ fetch
        setLeftId(newLeftId);
        setRightId(newRightId);

        // เปลี่ยน URL ทันที
        const newUrl = `/${newLeftId}-vs-${newRightId}`;
        window.history.pushState(null, '', newUrl);

        // ถ้าข้อมูลมีอยู่แล้ว ไม่ต้องโหลดใหม่ (Cache check ง่ายๆ)
        if (newLeftId === leftData.meta.id && newRightId === rightData.meta.id) {
            return;
        }

        setIsLoading(true);
        const requestId = `${newLeftId}-${newRightId}`;
        activeRequest.current = requestId;

        try {
            // เช็คว่าต้องโหลดฝั่งไหนบ้าง
            const leftPromise = newLeftId !== leftData.meta.id ? fetchConstitutionData(newLeftId) : Promise.resolve(leftData);
            const rightPromise = newRightId !== rightData.meta.id ? fetchConstitutionData(newRightId) : Promise.resolve(rightData);

            const [newLeftData, newRightData] = await Promise.all([leftPromise, rightPromise]);

            // ✅ 3. Race Condition Check: ถ้า Request นี้เก่ากว่าล่าสุด ให้ทิ้งไปเลย
            if (activeRequest.current === requestId) {
                setLeftData(newLeftData);
                setRightData(newRightData);
            }
        } catch (error) {
            console.error("Error swapping constitution:", error);
            // ถ้า Error อาจจะ Rollback UI กลับ (Optional)
        } finally {
            if (activeRequest.current === requestId) {
                setIsLoading(false);
            }
        }
    };

    const handleLeftChange = (newId: string) => {
        if (newId === leftId) return;
        if (newId === 'con2495') {
            updateComparison('con2475', 'con2495');
        } else {
            updateComparison(newId, rightId);
        }
    };

    const handleRightChange = (newId: string) => {
        if (newId === rightId) return;
        if (newId === 'con2495') {
            updateComparison('con2475', 'con2495');
        } else {
            updateComparison(leftId, newId);
        }
    };

    useEffect(() => {
        const onPopState = async () => {
            const path = window.location.pathname.replace('/', '');
            const parts = path.split('-vs-');
            if (parts.length === 2) {
                const [l, r] = parts;
                // Back Button ก็ต้อง update แบบ Optimistic
                setLeftId(l);
                setRightId(r);
                setIsLoading(true);
                const [dl, dr] = await Promise.all([fetchConstitutionData(l), fetchConstitutionData(r)]);
                setLeftData(dl);
                setRightData(dr);
                setIsLoading(false);
            }
        };
        window.addEventListener('popstate', onPopState);
        return () => window.removeEventListener('popstate', onPopState);
    }, []);

    return (
        <main className="bg-slate-200 font-sans min-h-screen flex flex-col">
            <div className="relative z-10">
                <WelcomeHero />
            </div>

            <div className="shrink-0 relative">
                {isLoading && (
                    <div className="absolute top-0 left-0 w-full h-1 bg-blue-200 overflow-hidden z-50">
                        <div className="h-full bg-blue-600 animate-pulse w-full origin-left transform scale-x-50"></div>
                    </div>
                )}

                <ConceptDiff
                    leftMeta={leftData.meta} // ⚠️ สังเกต: Header ยังโชว์ Meta เก่าแป๊บนึงจนกว่า Data ใหม่จะมา (ยอมรับได้แลกกับความลื่น)
                    rightMeta={rightData.meta}
                    categories={leftData.categories}
                    isCollapsed={isHeaderCollapsed}
                    onToggleCollapse={() => setIsHeaderCollapsed(!isHeaderCollapsed)}
                    leftId={leftId}     // UI เปลี่ยนทันที
                    setLeftId={handleLeftChange}
                    rightId={rightId}   // UI เปลี่ยนทันที
                    setRightId={handleRightChange}
                    allConstitutions={allConstitutions}
                />
            </div>

            <div id="workspace" className="flex-1 overflow-hidden flex flex-col relative min-h-0">
                <div className="flex-1 min-h-0">
                    {/* ใช้ Memoized Component */}
                    <MemoizedLayout
                        leftData={leftData.content}
                        rightData={rightData.content}
                        leftMeta={leftData.meta}
                        rightMeta={rightData.meta}
                        headerCollapsed={isHeaderCollapsed}
                    />
                </div>
            </div>
        </main>
    );
}
