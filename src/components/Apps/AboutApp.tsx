import React from 'react'
import { motion } from 'framer-motion'
import portfolioData from '../../data/portfolioData.json'
import { MapPin, Mail, Briefcase } from 'lucide-react'
import { Github, Linkedin, Twitter } from '../Common/BrandIcons'

export const AboutApp: React.FC = () => {
  const { profile, skills, experience } = portfolioData

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring' as const, stiffness: 100 } }
  }

  return (
    <div className="h-full overflow-y-auto p-6 md:p-8 select-text">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-12 gap-8"
      >
        {/* Left Column - Profile Card */}
        <motion.div variants={itemVariants} className="lg:col-span-4 flex flex-col items-center text-center p-6 rounded-2xl glass border border-white/10 dark:border-white/5">
          <div className="relative w-28 h-28 mb-4 rounded-full overflow-hidden border-2 border-primary/30 p-1 bg-white/10">
            <img 
              src={profile.avatar} 
              alt={profile.name} 
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white font-display">
            {profile.name}
          </h2>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            {profile.title}
          </p>

          <div className="flex flex-col gap-2 mt-6 w-full text-left text-sm text-slate-600 dark:text-slate-300 border-t border-slate-200/50 dark:border-slate-800/50 pt-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span>{profile.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-slate-400" />
              <a href={`mailto:${profile.email}`} className="hover:text-violet-500 transition-colors">{profile.email}</a>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <a href={profile.github} target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800/80 hover:bg-violet-500 hover:text-white dark:hover:bg-violet-600 transition-all">
              <Github className="w-5 h-5" />
            </a>
            <a href={profile.linkedin} target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800/80 hover:bg-violet-500 hover:text-white dark:hover:bg-violet-600 transition-all">
              <Linkedin className="w-5 h-5" />
            </a>
            <a href={profile.twitter} target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800/80 hover:bg-violet-500 hover:text-white dark:hover:bg-violet-600 transition-all">
              <Twitter className="w-5 h-5" />
            </a>
          </div>
        </motion.div>

        {/* Right Column - Details */}
        <div className="lg:col-span-8 space-y-8">
          {/* Bio section */}
          <motion.div variants={itemVariants} className="p-6 rounded-2xl glass border border-white/10 dark:border-white/5">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-3 font-display">About Me</h3>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm md:text-base">
              {profile.bio}
            </p>
          </motion.div>

          {/* Skills Section */}
          <motion.div variants={itemVariants} className="p-6 rounded-2xl glass border border-white/10 dark:border-white/5">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 font-display">Technical Toolkit</h3>
            
            <div className="space-y-4 text-xs md:text-sm">
              {Object.entries(skills).map(([category, list]) => (
                <div key={category} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
                  <span className="font-semibold text-slate-400 capitalize md:col-span-1">{category}</span>
                  <div className="flex flex-wrap gap-2 md:col-span-3">
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
          </motion.div>

          {/* Experience Section */}
          <motion.div variants={itemVariants} className="p-6 rounded-2xl glass border border-white/10 dark:border-white/5">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 font-display flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-violet-500" />
              <span>Work Experience</span>
            </h3>

            <div className="relative pl-6 border-l border-slate-200 dark:border-slate-800 space-y-6">
              {experience.map((exp: any, index: number) => {
                const bullets = exp.description.split('•').filter((s: string) => s.trim())
                const hasBullets = bullets.length > 1

                return (
                  <div key={index} className="relative">
                    {/* Timeline dot */}
                    <div className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full bg-violet-500 border-4 border-white dark:border-[#171c29]" />
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                      <div>
                        <h4 className="text-base font-bold text-slate-800 dark:text-white">{exp.role}</h4>
                        <p className="text-sm font-medium text-violet-500 dark:text-violet-400">{exp.company}</p>
                      </div>
                      <span className="text-xs font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full mt-1 sm:mt-0 self-start">
                        {exp.period}
                      </span>
                    </div>
                    {hasBullets ? (
                      <ul className="list-none space-y-1.5 mt-2">
                        {bullets.map((bullet: string, i: number) => (
                          <li key={i} className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed flex items-start gap-2">
                            <span className="text-violet-500 mt-0.5 flex-shrink-0 text-[10px]">▸</span>
                            <span>{bullet.trim()}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                        {exp.description}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </motion.div>

          {/* Awards Highlight */}
          <motion.div variants={itemVariants} className="p-6 rounded-2xl glass border border-white/10 dark:border-white/5">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 font-display flex items-center gap-2">
              <span className="text-xl">🏆</span>
              <span>Awards & Recognition</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-500/10 dark:to-amber-500/5 border border-amber-200/50 dark:border-amber-500/20">
                <p className="text-sm font-bold text-slate-800 dark:text-white">Winner — Jio AI Agent Hackathon</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Company-wide hackathon across Reliance Jio, July 2025</p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-violet-50 to-violet-100/50 dark:from-violet-500/10 dark:to-violet-500/5 border border-violet-200/50 dark:border-violet-500/20">
                <p className="text-sm font-bold text-slate-800 dark:text-white">Top Partner Employee ×2</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Dec 2023 & Jan 2025 — Recognized for GenAI contributions</p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
