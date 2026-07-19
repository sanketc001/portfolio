import React, { useState } from 'react'
import { Download, Printer, Eye, Award, Trophy, Star } from 'lucide-react'
import portfolioData from '../../data/portfolioData.json'

export const ResumeApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'interactive' | 'pdf'>('interactive')
  const { profile, skills, experience } = portfolioData

  const handlePrint = () => {
    window.print()
  }

  // Parse experience descriptions: split on bullet (•) to render as list items
  const renderDescription = (desc: string) => {
    const bullets = desc.split('•').filter(s => s.trim())
    if (bullets.length > 1) {
      return (
        <ul className="list-none space-y-2 mt-2">
          {bullets.map((bullet, i) => (
            <li key={i} className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed flex items-start gap-2">
              <span className="text-violet-500 mt-0.5 flex-shrink-0 text-[10px]">▸</span>
              <span>{bullet.trim()}</span>
            </li>
          ))}
        </ul>
      )
    }
    return (
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
        {desc}
      </p>
    )
  }

  return (
    <div className="h-full flex flex-col select-text">
      {/* Control Top Bar */}
      <div className="p-3 border-b border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between bg-white/5 backdrop-blur-md">
        <div className="flex bg-slate-100 dark:bg-slate-800/70 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('interactive')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              activeTab === 'interactive'
                ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            Interactive Resume
          </button>
          <button
            onClick={() => setActiveTab('pdf')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              activeTab === 'pdf'
                ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            PDF Preview
          </button>
        </div>

        <div className="flex gap-2">
          <a
            href={`${import.meta.env.BASE_URL}Resume.pdf`}
            download="Sanket_Choudhary_Resume.pdf"
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-violet-500 hover:text-white dark:hover:bg-violet-600 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            title="Download PDF"
          >
            <Download className="w-4 h-4" />
          </a>
          <button
            onClick={handlePrint}
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-violet-500 hover:text-white dark:hover:bg-violet-600 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            title="Print Resume"
          >
            <Printer className="w-4 h-4" />
          </button>
          <a
            href={`${import.meta.env.BASE_URL}Resume.pdf`}
            target="_blank"
            rel="noreferrer"
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-violet-500 hover:text-white dark:hover:bg-violet-600 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            title="Open in new tab"
          >
            <Eye className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900/60 p-6 md:p-10">
        {activeTab === 'interactive' ? (
          <div className="max-w-3xl mx-auto bg-white dark:bg-slate-950 p-6 md:p-10 rounded-xl shadow-md border border-slate-200/50 dark:border-slate-800/80">
            {/* Header info */}
            <div className="border-b border-slate-200 dark:border-slate-800 pb-6 text-center sm:text-left flex flex-col sm:flex-row justify-between items-center sm:items-start gap-4">
              <div>
                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-display">{profile.name}</h1>
                <p className="text-base font-semibold text-violet-500 dark:text-violet-400 mt-1">{profile.title}</p>
                <p className="text-xs text-slate-400 mt-0.5">{profile.location}</p>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-300 text-center sm:text-right space-y-1 sm:border-l sm:border-slate-200 dark:sm:border-slate-800 sm:pl-6">
                <p><a href={`mailto:${profile.email}`} className="hover:text-violet-500 transition-colors">{profile.email}</a></p>
                <p><a href={profile.github} target="_blank" rel="noreferrer" className="hover:text-violet-500 transition-colors">github.com/sanketc001</a></p>
                <p><a href={profile.linkedin} target="_blank" rel="noreferrer" className="hover:text-violet-500 transition-colors">linkedin.com/in/sanket-choudhary</a></p>
              </div>
            </div>

            {/* Profile Summary */}
            <div className="mt-6">
              <h2 className="text-sm font-extrabold uppercase tracking-widest text-violet-500 mb-2 font-display">Executive Summary</h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {profile.bio}
              </p>
            </div>

            {/* Technical Skills */}
            <div className="mt-8">
              <h2 className="text-sm font-extrabold uppercase tracking-widest text-violet-500 mb-3 font-display">Technical Expertise</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {Object.entries(skills).map(([category, list]) => (
                  <div key={category} className="border border-slate-100 dark:border-slate-800 p-3 rounded-lg bg-slate-50/50 dark:bg-slate-900/30">
                    <span className="font-bold text-slate-800 dark:text-white block mb-1.5">{category}</span>
                    <span className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      {list.join(' · ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Professional Experience */}
            <div className="mt-8">
              <h2 className="text-sm font-extrabold uppercase tracking-widest text-violet-500 mb-4 font-display">Professional History</h2>
              <div className="space-y-6">
                {experience.map((exp: any, index: number) => (
                  <div key={index} className="group relative pl-4 border-l-2 border-slate-200 dark:border-slate-800 hover:border-violet-500/50 transition-colors">
                    <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-violet-500" />
                    <div className="flex justify-between items-start flex-wrap gap-1">
                      <h3 className="text-sm font-bold text-slate-800 dark:text-white">{exp.role}</h3>
                      <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">{exp.period}</span>
                    </div>
                    <p className="text-xs font-semibold text-violet-500 dark:text-violet-400 mt-0.5">{exp.company}</p>
                    {renderDescription(exp.description)}
                  </div>
                ))}
              </div>
            </div>

            {/* Awards & Recognition */}
            <div className="mt-8">
              <h2 className="text-sm font-extrabold uppercase tracking-widest text-violet-500 mb-3 font-display">Awards & Recognition</h2>
              <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-start gap-2 p-3 rounded-lg bg-gradient-to-r from-amber-50 to-amber-100/50 dark:from-amber-500/10 dark:to-amber-500/5 border border-amber-200/50 dark:border-amber-500/20">
                  <Trophy className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-slate-800 dark:text-white">Winner — Jio AI Agent Hackathon</span>
                    <span className="text-slate-400 ml-2">July 2025</span>
                    <p className="text-slate-500 dark:text-slate-400 mt-0.5">Company-wide hackathon across Reliance Jio — built and demonstrated an AI agent solution.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-3 rounded-lg bg-gradient-to-r from-violet-50 to-violet-100/50 dark:from-violet-500/10 dark:to-violet-500/5 border border-violet-200/50 dark:border-violet-500/20">
                  <Star className="w-4 h-4 text-violet-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-slate-800 dark:text-white">Top Partner Employee of the Month (×2)</span>
                    <span className="text-slate-400 ml-2">December 2023 & January 2025</span>
                    <p className="text-slate-500 dark:text-slate-400 mt-0.5">Recognized twice at Reliance Jio for exceptional contributions to JioAds GenAI creative platform.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/30 border border-slate-200/50 dark:border-slate-800/50">
                  <Award className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-slate-800 dark:text-white">Google Developer Student Club Lead</span>
                    <span className="text-slate-400 ml-2">GDSC DYPIU, 2021–2022</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Education */}
            <div className="mt-8">
              <h2 className="text-sm font-extrabold uppercase tracking-widest text-violet-500 mb-3 font-display">Education</h2>
              <div className="border border-slate-100 dark:border-slate-800 p-4 rounded-lg bg-slate-50/50 dark:bg-slate-900/30">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">B.Tech in Computer Science & Engineering</h3>
                <p className="text-xs text-violet-500 dark:text-violet-400 font-semibold mt-0.5">Dr. D. Y. Patil International University, Pune</p>
                <p className="text-xs text-slate-400 mt-0.5">2019 – 2023</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full h-full min-h-[500px] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white shadow">
            <iframe
              src={`${import.meta.env.BASE_URL}Resume.pdf`}
              title="Resume PDF"
              className="w-full h-full border-none"
            />
          </div>
        )}
      </div>
    </div>
  )
}
