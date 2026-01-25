'use client';

import React from 'react';

export default function WelcomeHero() {
    return (
        <section className="relative min-h-[70vh]  pt-32 flex flex-col items-center justify-center bg-slate-900 text-white overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-grid-white/[0.05] bg-[length:30px_30px]"></div>
            <div className="absolute -top-20 -left-20 w-96 h-96 bg-blue-500/30 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-indigo-500/30 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
                <div className="inline-block mb-4">
                    <span className="text-5xl md:text-7xl">🧬</span>
                </div>
                <h1 className="text-4xl md:text-7xl font-bold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-indigo-200">
                    MATRA <span className="font-serif italic font-light">มาตรา</span>
                </h1>

                <p className="text-lg md:text-2xl text-slate-300 font-light max-w-2xl mx-auto leading-relaxed">
                    Explore the <span className="text-blue-300 font-medium">Evolution of Thai Constitutions</span> through structural analysis and intelligent semantic diffing.
                </p>
                <p className="text-lg md:text-2xl text-slate-300 font-light max-w-2xl mx-auto leading-relaxed">
                    Explore the <span className="text-blue-300 font-medium">Evolution of Thai Constitutions</span> through structural analysis and intelligent semantic diffing.
                </p>
                <p className="text-lg md:text-2xl text-slate-300 font-light max-w-2xl mx-auto leading-relaxed">
                    Explore the <span className="text-blue-300 font-medium">Evolution of Thai Constitutions</span> through structural analysis and intelligent semantic diffing.
                </p>
                <p className="text-lg md:text-2xl text-slate-300 font-light max-w-2xl mx-auto leading-relaxed">
                    Explore the <span className="text-blue-300 font-medium">Evolution of Thai Constitutions</span> through structural analysis and intelligent semantic diffing.
                </p>
                <p className="text-lg md:text-2xl text-slate-300 font-light max-w-2xl mx-auto leading-relaxed">
                    Explore the <span className="text-blue-300 font-medium">Evolution of Thai Constitutions</span> through structural analysis and intelligent semantic diffing.
                </p>
                <p className="text-lg md:text-2xl text-slate-300 font-light max-w-2xl mx-auto leading-relaxed">
                    Explore the <span className="text-blue-300 font-medium">Evolution of Thai Constitutions</span> through structural analysis and intelligent semantic diffing.
                </p>
                <p className="text-lg md:text-2xl text-slate-300 font-light max-w-2xl mx-auto leading-relaxed">
                    Explore the <span className="text-blue-300 font-medium">Evolution of Thai Constitutions</span> through structural analysis and intelligent semantic diffing.
                </p>
                {/* scroll down icon */}
                <div
                    className="mt-12 animate-bounce text-slate-500 cursor-pointer hover:text-blue-400 transition-colors"
                    onClick={() => {
                        const workspace = document.getElementById('workspace');
                        if (workspace) {
                            workspace.scrollIntoView({ behavior: 'smooth' });
                        }
                    }}
                >
                    <div className="text-xs uppercase tracking-[0.2em] mb-2">Scroll to Analyze</div>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mx-auto">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                </div>
            </div>
        </section>
    );
}
