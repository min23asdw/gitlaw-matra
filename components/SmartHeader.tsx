'use client';

import React, { useState, useEffect } from 'react';

interface Constitution {
    id: string;
    year: number | string;
    name: string;
}

interface SmartHeaderProps {
    leftId: string;
    setLeftId: (id: string) => void;
    rightId: string;
    setRightId: (id: string) => void;
    allConstitutions: Constitution[];
}

function SmartHeader({
    leftId,
    setLeftId,
    rightId,
    setRightId,
    allConstitutions
}: SmartHeaderProps) {
    const [isIsland, setIsIsland] = useState(false);

    useEffect(() => {
        let ticking = false;

        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const currentScrollY = window.scrollY;
                    const shouldBeIsland = currentScrollY > 100;

                    setIsIsland(prev => {
                        if (prev !== shouldBeIsland) return shouldBeIsland;
                        return prev;
                    });

                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className={`fixed top-0 left-0 right-0 z-30 transition-all duration-500 ease-in-out flex justify-center pointer-events-none translate-y-0 pt-0`}>

            <header className={`
                pointer-events-auto
                transition-all duration-500 ease-in-out
                bg-white/80 backdrop-blur-md border border-white/40 shadow-sm
                flex flex-row  items-center justify-between
                
                ${isIsland
                    ? 'w-[90%] rounded-2xl shadow-2xl px-6 py-2 gap-4'
                    : 'w-full px-4   py-3  gap-3  '
                }
            `}>

                {/* Logo Area */}
                <div className={`flex items-center gap-3 transition-all duration-300 w-auto`}>
                    <div className={`
                        bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30 ring-1 ring-white/50 relative overflow-hidden group
                        transition-all duration-300
                        ${isIsland ? 'w-8 h-8 rounded-full' : 'w-10 h-10 rounded-xl'}
                    `}>
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                        <span className={`relative z-10 ${isIsland ? 'text-sm' : 'text-xl'}`}>🧬</span>
                    </div>

                    <div className={`flex flex-row transition-all duration-300`}>
                        <h1 className={`font-bold text-slate-800 tracking-tight font-sans leading-tight ${isIsland ? 'text-sm' : 'text-lg md:text-xl'}`}>
                            MATRA
                        </h1>
                    </div>
                </div>

                {/* Controls Area */}
                <div className={`
                    flex   flex-row items-center gap-2 
                    transition-all duration-300
                    ${isIsland
                        ? 'bg-transparent   border-0 shadow-none p-0 w-auto'
                        : 'bg-slate-100/80 p-2 rounded-2xl border border-white/50 shadow-inner  md:w-auto md:gap-4'
                    }
                `}>

                    {/* Left Selector */}
                    <div className="relative group w-full md:w-auto">
                        <select
                            value={leftId}
                            onChange={(e) => setLeftId(e.target.value)}
                            className={`
                                appearance-none rounded-xl border border-transparent hover:border-blue-200 font-bold bg-white text-slate-700 shadow-sm hover:shadow focus:ring-2 focus:ring-blue-500/20 focus:outline-none cursor-pointer transition-all duration-200 truncate
                                ${isIsland
                                    ? 'py-1.5 pl-3 pr-8 text-xs w-full'
                                    : 'py-2.5 pl-4 pr-10 text-sm w-full'
                                }
                            `}
                        >
                            {allConstitutions.map(c => <option key={c.id} value={c.id}>{c.year} - {c.name}</option>)}
                        </select>
                        <div className={`absolute top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-blue-500 transition-colors ${isIsland ? 'right-2' : 'right-3'}`}>
                            ▼
                        </div>
                    </div>

                    <div className={`
                        shrink-0 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 font-black shadow-sm transform group-hover:rotate-180 transition-transform
                        ${isIsland ? 'w-6 h-6 text-[8px]' : 'w-8 h-8 text-[10px]'}
                    `}>
                        VS
                    </div>

                    {/* Right Selector */}
                    <div className="relative group w-full md:w-auto">
                        <select
                            value={rightId}
                            onChange={(e) => setRightId(e.target.value)}
                            className={`
                                appearance-none rounded-xl border border-transparent hover:border-blue-200 font-bold bg-white text-slate-700 shadow-sm hover:shadow focus:ring-2 focus:ring-blue-500/20 focus:outline-none cursor-pointer transition-all duration-200 truncate
                                ${isIsland
                                    ? 'py-1.5 pl-3 pr-8 text-xs w-full'
                                    : 'py-2.5 pl-4 pr-10 text-sm w-full'
                                }
                            `}
                        >
                            {allConstitutions.map(c => <option key={c.id} value={c.id}>{c.year} - {c.name}</option>)}
                        </select>
                        <div className={`absolute top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-blue-500 transition-colors ${isIsland ? 'right-2' : 'right-3'}`}>
                            ▼
                        </div>
                    </div>
                </div>
            </header>
        </div>
    );
}

export default React.memo(SmartHeader);
