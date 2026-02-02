'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { generateTimeline, TimelineNode } from '@/utils/timelineEngine';
import { ArrowLeft, Clock, Minus, AlertCircle } from 'lucide-react';
import GitGraphTimeline from '@/components/GitGraphTimeline';
import Link from 'next/link';




function TimelineContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const sectionId = searchParams.get('sectionId');
    const conId = searchParams.get('conId');

    const [nodes, setNodes] = useState<TimelineNode[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!sectionId || !conId) {
                setError("Missing parameters.");
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                const results = await generateTimeline(sectionId, conId);
                setNodes(results);
            } catch (err) {
                console.error(err);
                setError("Could not generate timeline.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [sectionId, conId]);

    const handleBack = () => router.back();

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 animate-in fade-in duration-700">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-slate-400 font-medium tracking-wide text-xs uppercase">Tracing History...</p>
        </div>
    );

    if (error) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-red-500">
            <AlertCircle size={48} />
            <p className="text-lg font-medium">{error}</p>
            <button onClick={handleBack} className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 text-sm font-medium transition">Back</button>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto py-12 px-6 md:px-12 font-sans">
            <div className="mb-12 text-center">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">Evolution of Section {nodes[0]?.section.id}</h1>
                <p className="text-slate-500 text-sm uppercase tracking-widest font-mono">
                    {nodes[0]?.section.chapter_name || 'Uncategorized'}
                </p>
            </div>

            <GitGraphTimeline nodes={nodes} />

            <div className="mt-12 text-center text-slate-300 text-sm flex justify-center items-center gap-2">
                <Minus size={16} /> End of History
            </div>
        </div>
    );
}

export default function TimelinePage() {
    return (
        <main className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100">
            <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
                <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition group">
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="font-medium text-sm">Back</span>
                    </Link>
                    <div className="flex items-center gap-2 text-slate-800 font-bold text-sm uppercase tracking-wide">
                        <Clock size={16} className="text-blue-600" /> Historia Timeline
                    </div>
                    <div className="w-16"></div>
                </div>
            </div>
            <Suspense fallback={<div className="h-screen w-full flex items-center justify-center"><div className="w-8 h-8 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div></div>}>
                <TimelineContent />
            </Suspense>
        </main>
    );
}
