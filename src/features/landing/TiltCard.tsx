'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';

export interface TiltCardProps {
  name: string;
  set: string;
  number: string;
  purchasePrice: number;
  currentValue: number;
  image: string;
  condition: string;
  roi: number;
}

export function TiltCard({
  name,
  set,
  number,
  purchasePrice,
  currentValue,
  image,
  condition,
  roi,
}: TiltCardProps) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [sheen, setSheen] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const positionX = event.clientX - rect.left;
    const positionY = event.clientY - rect.top;
    const centerOffsetX = (positionX / rect.width) - 0.5;
    const centerOffsetY = (positionY / rect.height) - 0.5;

    setTilt({ x: centerOffsetX * 16, y: -centerOffsetY * 16 });
    setSheen({
      x: (positionX / rect.width) * 100,
      y: (positionY / rect.height) * 100,
    });
  };

  return (
    <div
      className="relative aspect-[3/4.2] rounded-2xl overflow-hidden bg-slate-900 border border-slate-850 cursor-pointer shadow-lg hover:shadow-2xl hover:shadow-indigo-500/10 transition-shadow duration-300 group"
      style={{ perspective: '1000px' }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setTilt({ x: 0, y: 0 });
        setIsHovered(false);
      }}
    >
      <motion.div
        className="w-full h-full relative p-3 flex flex-col justify-between"
        animate={{
          rotateY: tilt.x,
          rotateX: tilt.y,
          scale: isHovered ? 1.03 : 1,
        }}
        transition={{
          type: 'spring',
          stiffness: 250,
          damping: 22,
        }}
      >
        {isHovered && (
          <div
            className="absolute inset-0 pointer-events-none mix-blend-color-dodge z-20 rounded-2xl transition-opacity duration-300"
            style={{
              background: `radial-gradient(circle at ${sheen.x}% ${sheen.y}%, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 65%), linear-gradient(115deg, transparent 20%, rgba(255,255,255,0.1) 40%, transparent 60%)`,
            }}
          />
        )}

        <div className="relative aspect-[3/4.2] bg-slate-950/85 border border-slate-850/40 rounded-xl overflow-hidden mb-3 flex items-center justify-center p-1">
          <img
            src={image}
            alt={name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain select-none"
          />

          <div className={`absolute inset-0 bg-[#0c0e14]/90 backdrop-blur-sm border border-slate-800 p-4 flex flex-col justify-between transition-all duration-300 z-10 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
            <div className="space-y-1">
              <span className="text-[9px] text-[#FFCB05] font-mono tracking-widest block uppercase font-bold">{set}</span>
              <h4 className="text-xs font-black text-white leading-tight font-mono">{name}</h4>
              <p className="text-[10px] text-slate-400 font-mono"># {number}</p>
            </div>

            <div className="space-y-2 border-t border-slate-850 pt-2 font-mono">
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-500">Condition:</span>
                <span className="text-white font-bold">{condition}</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-500">Cost Basis:</span>
                <span className="text-slate-300 font-bold">${purchasePrice}</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-500">Market Value:</span>
                <span className="text-[#FFCB05] font-black">${currentValue}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2 select-none group-hover:opacity-0 transition-opacity z-0">
          <div>
            <span className="text-[8px] text-indigo-400 font-bold tracking-wider font-mono uppercase">{set}</span>
            <h4 className="text-xs font-bold text-white block truncate leading-tight mt-0.5">{name}</h4>
          </div>
          <div className="grid grid-cols-2 gap-1 bg-slate-950/60 p-1.5 rounded-xl border border-slate-900 text-center font-mono">
            <div>
              <span className="text-[7px] text-slate-500 block">VALUE</span>
              <span className="text-[9px] font-bold text-white block mt-0.5">${currentValue}</span>
            </div>
            <div>
              <span className="text-[7px] text-slate-500 block">ROI</span>
              <span className="text-[9px] font-bold text-green-400 block mt-0.5">+{roi.toFixed(0)}%</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
