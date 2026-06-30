/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import { motion, AnimatePresence } from 'motion/react';
import type { ZoomedImageState } from './types';

export interface ImageZoomModalProps {
  zoomedImage: ZoomedImageState | null;
  onClose: () => void;
}

export function ImageZoomModal({ zoomedImage, onClose }: ImageZoomModalProps) {
  return (
    <AnimatePresence>
        {zoomedImage && (
          <div 
            id="zoom-modal-container"
            onClick={() => onClose()}
            className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-150 flex items-center justify-center p-4 cursor-zoom-out"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#14161f] border border-slate-800 rounded-2xl max-w-xl w-full p-4 relative text-center space-y-3"
              onClick={e => e.stopPropagation()}
            >
              <button 
                onClick={() => onClose()}
                className="absolute top-4 right-4 text-slate-400 hover:text-white font-bold font-mono text-[11px] bg-slate-900 p-2 border border-slate-800 rounded-lg cursor-pointer"
              >
                ✖ FECHAR
              </button>
              <h3 className="font-bold text-slate-100 text-xs text-left mb-1 pr-6 truncate">{zoomedImage.title}</h3>
              <div className="aspect-[4/3] bg-slate-900 rounded-xl overflow-hidden border border-slate-850 flex items-center justify-center p-2">
                <img src={zoomedImage.url} alt={zoomedImage.title} className="max-w-full max-h-full object-contain rounded-lg" />
              </div>
              <p className="text-[10px] text-slate-400 font-mono">Fotografia física do espécime arquivada e registrada localmente.</p>
            </motion.div>
          </div>
        )}
    </AnimatePresence>
  );
}
