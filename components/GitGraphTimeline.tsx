'use client';
import React, { useMemo } from 'react';
import { TimelineNode } from '@/utils/timelineEngine';


interface TimelineGraphProps {
    nodes: TimelineNode[];
}

export default function TimelineGraph({ nodes }: TimelineGraphProps) {
    // 1. Setup Grid System
    // Y-axis = Years (Constitutions)
    // X-axis = Section IDs (Columns)

    const sortedNodes = useMemo(() => {
        // Sort by Year Descending (Newest Top)
        return [...nodes].sort((a, b) => b.year - a.year);
    }, [nodes]);

    // Get all unique Section IDs to assign columns
    const sectionColumns = useMemo(() => {
        const ids = Array.from(new Set(nodes.map(n => n.section.id)));
        // Sort numerically if possible due to Thai section IDs (e.g. 5, 5/1, 6)
        // Simple alphanumeric sort for now
        return ids.sort((a, b) => {
            const numA = parseInt(a.replace(/\D/g, '') || '0');
            const numB = parseInt(b.replace(/\D/g, '') || '0');
            return numA - numB || a.localeCompare(b);
        });
    }, [nodes]);

    // Dimensions
    const ROW_HEIGHT = 120;
    const COL_WIDTH = 120; // Increased spacing for labels
    const PADDING_TOP = 60;
    const PADDING_LEFT = 100; // For Year/Con labels on the left

    const width = Math.max(800, sectionColumns.length * COL_WIDTH + PADDING_LEFT + 100);
    const height = sortedNodes.length * ROW_HEIGHT + PADDING_TOP + 50;

    // Helper to get coordinates
    const getPos = (node: TimelineNode, index: number) => {
        const colIndex = sectionColumns.indexOf(node.section.id);
        const x = PADDING_LEFT + (colIndex * COL_WIDTH) + (COL_WIDTH / 2);
        const y = PADDING_TOP + (index * ROW_HEIGHT);
        return { x, y };
    };

    return (
        <div className="w-full overflow-x-auto bg-slate-50 rounded-xl border border-slate-200 shadow-inner p-8">
            <svg width={width} height={height} className="mx-auto select-none">
                {/* --- Definitions for Gradients/Filters --- */}
                <defs>
                    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
                    </marker>
                    <linearGradient id="line-gradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#cbd5e1" />
                        <stop offset="100%" stopColor="#94a3b8" />
                    </linearGradient>
                </defs>

                {/* --- Column Guides (Background) --- */}
                {sectionColumns.map((id, i) => {
                    const x = PADDING_LEFT + (i * COL_WIDTH) + (COL_WIDTH / 2);
                    return (
                        <g key={`col-${id}`} opacity="0.1">
                            <line x1={x} y1={0} x2={x} y2={height} stroke="#000" strokeDasharray="4 4" />
                            <text x={x} y={30} textAnchor="middle" className="font-mono text-xs fill-slate-900 font-bold">
                                Section {id}
                            </text>
                        </g>
                    );
                })}

                {/* --- Connecting Lines --- */}
                {sortedNodes.map((node, i) => {
                    if (i === sortedNodes.length - 1) return null; // Last node has no next
                    const nextNode = sortedNodes[i + 1];

                    const start = getPos(node, i);
                    const end = getPos(nextNode, i + 1);

                    // Bezier Curve
                    const midY = (start.y + end.y) / 2;
                    const pathD = `M ${start.x} ${start.y} C ${start.x} ${midY}, ${end.x} ${midY}, ${end.x} ${end.y}`;

                    const isJump = start.x !== end.x;

                    return (
                        <path
                            key={`path-${i}`}
                            d={pathD}
                            fill="none"
                            stroke={isJump ? "#f59e0b" : "#cbd5e1"} // Amber for jumps, Slate for straight
                            strokeWidth={isJump ? 3 : 2}
                            strokeDasharray={isJump ? "5 3" : ""}
                            markerEnd="url(#arrowhead)"
                            className="transition-all duration-500"
                        />
                    );
                })}

                {/* --- Nodes --- */}
                {sortedNodes.map((node, i) => {
                    const { x, y } = getPos(node, i);
                    const isFocus = node.isCurrent;
                    const colorClass = isFocus ? "fill-blue-600" : node.status === 'MATCH' ? "fill-slate-400" : "fill-amber-400";

                    return (
                        <g key={`node-${i}`} className="group cursor-pointer hover:opacity-100 transition-opacity">

                            {/* Left Label (Year + Con) */}
                            <text x={PADDING_LEFT - 20} y={y + 5} textAnchor="end" className="text-sm font-bold fill-slate-700 font-mono">
                                {node.year}
                            </text>
                            <text x={PADDING_LEFT - 20} y={y + 20} textAnchor="end" className="text-[10px] fill-slate-400 font-sans uppercase tracking-wider">
                                {node.constitutionId}
                            </text>

                            {/* Node Circle */}
                            <circle
                                cx={x}
                                cy={y}
                                r={isFocus ? 8 : 6}
                                className={`${colorClass} stroke-white stroke-[3px] shadow-sm transition-all duration-300 group-hover:r-8`}
                            />

                            {/* Hover Tooltip (Simulated SVG Group) */}
                            <foreignObject x={x + 15} y={y - 20} width="200" height="100" className="overflow-visible pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50">
                                <div className="bg-slate-900 text-white text-xs p-2 rounded shadow-lg">
                                    <div className="font-bold mb-1">Section {node.section.id}</div>
                                    <div className="opacity-80 line-clamp-3 leading-xs text-[10px]">
                                        {node.section.content}
                                    </div>
                                </div>
                            </foreignObject>

                            {/* Section Label (Next to node) */}
                            <text x={x + 14} y={y + 4} className={`text-xs font-bold font-mono ${isFocus ? 'fill-blue-700' : 'fill-slate-500'}`}>
                                §{node.section.id}
                            </text>

                        </g>
                    );
                })}


            </svg>
        </div>
    );
}
