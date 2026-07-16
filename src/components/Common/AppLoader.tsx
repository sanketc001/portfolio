import React from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

export const AppLoader: React.FC = () => (
  <div className="h-full w-full flex items-center justify-center bg-slate-50/50 dark:bg-slate-950/50">
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-3 text-center"
    >
      <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
      <p className="text-xs font-semibold text-slate-400 tracking-wide">Loading application...</p>
    </motion.div>
  </div>
)
