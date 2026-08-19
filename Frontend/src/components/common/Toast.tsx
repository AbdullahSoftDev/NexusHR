import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useHR } from '../../context/HRContext';

export const Toast: React.FC = () => {
  const { toastMessage } = useHR();

  return (
    <div id="toast-container" className="fixed bottom-6 right-6 z-50 pointer-events-none">
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border bg-[#141418] ${
              toastMessage.type === 'success'
                ? 'border-emerald-500/30 text-emerald-400 shadow-emerald-500/10'
                : toastMessage.type === 'error'
                ? 'border-rose-500/30 text-rose-400 shadow-rose-500/10'
                : 'border-orange-500/30 text-orange-400 shadow-orange-500/10'
            }`}
          >
            {toastMessage.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
            {toastMessage.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
            {toastMessage.type === 'info' && <Info className="w-5 h-5 text-[#F16E15] shrink-0" />}
            <span className="text-sm font-semibold text-zinc-100">{toastMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
