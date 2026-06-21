/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Trash2, RotateCcw, Info, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'info'
}) => {
  if (!isOpen) return null;

  // Choose icon and color scheme based on action depth type
  let accentColor = 'from-blue-500 to-indigo-600';
  let hoverAccent = 'hover:from-blue-600 hover:to-indigo-500';
  let ringColor = 'focus:ring-blue-500';
  let btnText = 'text-white';
  let Icon = Info;

  if (type === 'danger') {
    accentColor = 'from-red-600 to-rose-700';
    hoverAccent = 'hover:from-red-500 hover:to-rose-600';
    ringColor = 'focus:ring-red-500';
    Icon = Trash2;
  } else if (type === 'warning') {
    accentColor = 'from-amber-500 to-yellow-600';
    hoverAccent = 'hover:from-amber-600 hover:to-yellow-500';
    ringColor = 'focus:ring-amber-500';
    Icon = AlertTriangle;
  } else if (type === 'info') {
    accentColor = 'from-indigo-600 to-violet-700';
    hoverAccent = 'hover:from-indigo-500 hover:to-violet-600';
    ringColor = 'focus:ring-indigo-500';
    Icon = Info;
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/85 backdrop-blur-sm"
        />

        {/* Modal Window Container */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: 'spring', duration: 0.3 }}
          className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-800 bg-[#14161F] shadow-2xl p-6"
        >
          {/* Close button top right */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-500 hover:text-white hover:bg-slate-900 p-1.5 rounded-lg transition-all"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Heading block with icon */}
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl bg-slate-900 border border-slate-805 shrink-0`}>
              <Icon className={`w-6 h-6 ${type === 'danger' ? 'text-red-500' : type === 'warning' ? 'text-amber-500' : 'text-indigo-400'}`} />
            </div>
            <div className="space-y-1 select-none">
              <h3 className="text-base font-bold text-white tracking-wide">
                {title}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed pr-2">
                {description}
              </p>
            </div>
          </div>

          {/* Action buttons footer */}
          <div className="flex items-center gap-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 py-3 text-xs bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white font-bold border border-slate-800 rounded-xl transition-all uppercase tracking-wider"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`flex-1 py-3 text-xs bg-gradient-to-r ${accentColor} ${hoverAccent} ${btnText} font-extrabold uppercase tracking-widest rounded-xl shadow-lg active:scale-95 transition-all focus:outline-none focus:ring-2 ${ringColor} focus:ring-offset-2 focus:ring-offset-[#14161F]`}
            >
              {confirmText}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
