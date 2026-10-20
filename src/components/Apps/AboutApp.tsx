import React, { useState } from 'react'
import { motion } from 'framer-motion'
import portfolioData from '../../data/portfolioData.json'
import { MapPin, Mail, FileText, Sparkles } from 'lucide-react'
import { Github, Linkedin } from '../Common/BrandIcons'

const RESUME_URL = `${import.meta.env.BASE_URL}Resume.pdf`

export const AboutApp: React.FC = () => {
  const { profile, skills } = portfolioData
  const [avatarFailed, setAvatarFailed] = useState(false)
  const initials = profile.name
    .split(' ')
    .map(part => part[0])
    .join('')
    .slice(0, 2)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  }

  const itemVariants = {
    hidden: { y: 16, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring' as const, stiffness: 120, damping: 20 } }
  }

  const linkClass =
    'inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:bg-violet-500 hover:text-white dark:hover:bg-violet-600 transition-colors'

  return (
    <div className="h-full overflow-y-auto p-5 md:p-8 select-text">
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-4xl mx-auto space-y-6">
        {/* Intro card: who, what, where, and the next click */}
        <motion.section
          variants={itemVariants}
          className="p-6 md:p-7 rounded-2xl glass border border-white/10 dark:border-white/5 flex flex-col md:flex-row gap-6 items-center md:items-start"
        >
          <div className="w-28 h-28 md:w-32 md:h-32 flex-shrink-0 rounded-full overflow-hidden border-2 border-violet-500/30 p-1 bg-white/10">
            {avatarFailed ? (
              <div className="w-full h-full rounded-full bg-gradient-to-tr from-violet-500 to-indigo-600 text-white flex items-center justify-center text-3xl font-bold font-display" aria-label={profile.name}>
                {initials}
              </div>
            ) : (
              <img src={profile.avatar} alt={profile.name} onError={() => setAvatarFailed(true)} className="w-full h-full object-cover rounded-full" />
            )}
          </div>

          <div className="flex-1 min-w-0 text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-800 dark:text-white font-display">
              {profile.name}
            </h2>
            <p className="text-sm font-semibold text-violet-600 dark:text-violet-400 mt-1">{profile.title}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 inline-flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>{profile.location}</span>
            </p>

            <p className="text-sm md:text-[15px] text-slate-600 dark:text-slate-300 leading-relaxed mt-4">{profile.pitch}</p>

            <div className="flex flex-wrap gap-2 mt-5 justify-center md:justify-start">
              <a
                href={RESUME_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold bg-violet-600 hover:bg-violet-700 text-white shadow-md transition-colors"
              >
                <FileText className="w-4 h-4" />
                <span>Résumé (PDF)</span>
              </a>
              <a href={profile.github} target="_blank" rel="noreferrer" className={linkClass}>
                <Github className="w-4 h-4" />
                <span>GitHub</span>
              </a>
              <a href={profile.linkedin} target="_blank" rel="noreferrer" className={linkClass}>
                <Linkedin className="w-4 h-4" />
                <span>LinkedIn</span>
              </a>
              <a href={`mailto:${profile.email}`} className={linkClass} title={profile.email}>
                <Mail className="w-4 h-4" />
                <span>Email</span>
              </a>
            </div>
          </div>
        </motion.section>

        {/* Background */}
        <motion.section variants={itemVariants} className="p-6 rounded-2xl glass border border-white/10 dark:border-white/5">
          <h3 className="text-base font-bold text-slate-800 dark:text-white mb-2 font-display flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-500" />
            <span>Background</span>
          </h3>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">{profile.bio}</p>
        </motion.section>

        {/* Skills */}
        <motion.section variants={itemVariants} className="p-6 rounded-2xl glass border border-white/10 dark:border-white/5">
          <h3 className="text-base font-bold text-slate-800 dark:text-white mb-4 font-display">Technical Toolkit</h3>
          <div className="space-y-3 text-xs">
            {Object.entries(skills).map(([category, list]) => (
              <div key={category} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-start">
                <span className="font-semibold text-slate-400 md:col-span-1 md:pt-1">{category}</span>
                <div className="flex flex-wrap gap-1.5 md:col-span-3">
                  {list.map((skill: string) => (
                    <span
                      key={skill}
                      className="px-2.5 py-1 rounded-md bg-violet-500/10 text-violet-600 dark:text-violet-300 border border-violet-500/20 font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.section>
      </motion.div>
    </div>
  )
}
