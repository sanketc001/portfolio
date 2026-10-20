import React from 'react'
import { Award, ExternalLink, Calendar, ShieldCheck, Hash } from 'lucide-react'
import portfolioData from '../../data/portfolioData.json'

interface Certificate {
  id: string
  title: string
  issuer: string
  date?: string
  credentialId?: string
  url?: string
}

export const CertificationsApp: React.FC = () => {
  const certifications = ((portfolioData as { certifications?: Certificate[] }).certifications ?? [])

  return (
    <div className="h-full overflow-y-auto p-6 md:p-8 select-text bg-slate-50/50 dark:bg-slate-950/20">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-2.5 mb-8 border-b border-slate-200/50 dark:border-slate-800/50 pb-4">
          <Award className="w-7 h-7 text-violet-500" />
          <div>
            <h2 className="text-xl font-bold font-display text-slate-800 dark:text-white">Professional Certifications</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {certifications.length} certificates, as listed on LinkedIn
            </p>
          </div>
        </div>

        {/* Credentials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certifications.map(cert => (
            <div
              key={cert.id}
              className="p-5 rounded-2xl glass border border-white/10 dark:border-white/5 hover:border-violet-500/30 hover:shadow-md transition-all flex gap-4 relative group"
            >
              {/* Badge Icon */}
              <div className="w-12 h-12 rounded-xl bg-violet-500/10 text-violet-500 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-6.5 h-6.5" />
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0 flex flex-col">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white leading-snug tracking-tight group-hover:text-violet-500 dark:group-hover:text-violet-400 transition-colors">
                  {cert.title}
                </h3>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
                  {cert.issuer}
                </p>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400 mt-2 font-medium">
                  {cert.date && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Issued {cert.date}</span>
                    </span>
                  )}
                  {cert.credentialId && (
                    <span className="flex items-center gap-1 font-mono" title="Credential ID">
                      <Hash className="w-3.5 h-3.5" />
                      <span className="break-all">{cert.credentialId}</span>
                    </span>
                  )}
                </div>

                {cert.url && (
                  <a
                    href={cert.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 self-start inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-300 border border-slate-200/60 dark:border-slate-800/60 hover:border-violet-500/30 transition-colors"
                  >
                    <span>Show credential</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
