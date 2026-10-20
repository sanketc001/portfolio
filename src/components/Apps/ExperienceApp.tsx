import React from 'react'
import { motion } from 'framer-motion'
import { Briefcase, Trophy, GraduationCap, MapPin } from 'lucide-react'
import portfolioData from '../../data/portfolioData.json'
import { parseDescription } from '../../utils/description'

interface ExperienceEntry {
  role: string
  company: string
  period: string
  location?: string
  description: string
}

interface EducationEntry {
  school: string
  degree?: string
  start?: string
  end?: string
  notes?: string
  activities?: string
}

/** "August 2019" -> "Aug 2019"; year-only values are kept. */
const shortDate = (d?: string) => (d ? d.replace(/^([A-Za-z]{3})[a-z]+/, '$1') : '')

export const ExperienceApp: React.FC = () => {
  const experience = portfolioData.experience as ExperienceEntry[]
  const education = ((portfolioData as { education?: EducationEntry[] }).education ?? [])

  return (
    <div className="h-full overflow-y-auto p-5 md:p-8 select-text">
      <div className="max-w-3xl mx-auto space-y-6">
        <section className="p-6 rounded-2xl glass border border-white/10 dark:border-white/5">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 font-display flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-violet-500" />
            <span>Work Experience</span>
          </h3>

          <ol className="relative pl-6 border-l border-slate-200 dark:border-slate-800 space-y-7">
            {experience.map((exp, index) => {
              const blocks = parseDescription(exp.description)
              return (
                <motion.li
                  key={`${exp.company}-${exp.role}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06 }}
                  className="relative"
                >
                  <div className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full bg-violet-500 border-4 border-white dark:border-[#171c29]" />
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                    <div>
                      <h4 className="text-base font-bold text-slate-800 dark:text-white">{exp.role}</h4>
                      <p className="text-sm font-medium text-violet-600 dark:text-violet-400">{exp.company}</p>
                      {exp.location && (
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{exp.location}</span>
                        </p>
                      )}
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full self-start whitespace-nowrap">
                      {exp.period}
                    </span>
                  </div>
                  <div className="mt-3 space-y-3">
                    {blocks.map((block, b) => (
                      <div key={b}>
                        {block.heading && (
                          <p
                            className={
                              block.bullets.length
                                ? 'text-[13px] font-semibold text-slate-700 dark:text-slate-200 mb-1.5'
                                : 'text-sm text-slate-600 dark:text-slate-300 leading-relaxed'
                            }
                          >
                            {block.heading}
                          </p>
                        )}
                        {block.bullets.length > 0 && (
                          <ul className="list-none space-y-1.5">
                            {block.bullets.map((bullet, i) => (
                              <li key={i} className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed flex items-start gap-2">
                                <span className="text-violet-500 mt-1 flex-shrink-0 text-[10px]">▸</span>
                                <span>{bullet}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.li>
              )
            })}
          </ol>
        </section>

        {education.length > 0 && (
          <section className="p-6 rounded-2xl glass border border-white/10 dark:border-white/5">
            <h3 className="text-base font-bold text-slate-800 dark:text-white mb-4 font-display flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-sky-500" />
              <span>Education</span>
            </h3>
            <div className="space-y-3">
              {education.map(edu => (
                <div
                  key={`${edu.school}-${edu.start ?? ''}`}
                  className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60"
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-white">{edu.school}</p>
                      {edu.degree && <p className="text-sm text-sky-600 dark:text-sky-400 mt-0.5">{edu.degree}</p>}
                    </div>
                    {(edu.start || edu.end) && (
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full self-start whitespace-nowrap">
                        {[shortDate(edu.start), shortDate(edu.end)].filter(Boolean).join(' - ')}
                      </span>
                    )}
                  </div>
                  {edu.notes && <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">{edu.notes}</p>}
                  {edu.activities && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                      <span className="font-semibold">Activities:</span> {edu.activities}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="p-6 rounded-2xl glass border border-white/10 dark:border-white/5">
          <h3 className="text-base font-bold text-slate-800 dark:text-white mb-4 font-display flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
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
        </section>
      </div>
    </div>
  )
}
