import React from 'react'
import { Award, ExternalLink, Calendar, ShieldCheck } from 'lucide-react'
import portfolioData from '../../data/portfolioData.json'

interface Certificate {
  id: string
  title: string
  issuer: string
  date: string
  credentialId: string
  url: string
}

export const CertificationsApp: React.FC = () => {
  const certifications = (portfolioData as any).certifications as Certificate[] || []

  return (
    <div className="h-full overflow-y-auto p-6 md:p-8 select-text bg-slate-50/50 dark:bg-slate-950/20">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-2.5 mb-8 border-b border-slate-200/50 dark:border-slate-800/50 pb-4">
          <Award className="w-7 h-7 text-violet-500" />
          <div>
            <h2 className="text-xl font-bold font-display text-slate-850 dark:text-white">Professional Certifications</h2>
            <p className="text-xs text-slate-400 mt-0.5">Verified credentials from LinkedIn & resume registries</p>
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
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white leading-snug tracking-tight group-hover:text-violet-500 dark:group-hover:text-violet-400 transition-colors">
                  {cert.title}
                </h3>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
                  {cert.issuer}
                </p>

                <div className="flex items-center gap-1.5 text-[10px] text-slate-450 dark:text-slate-500 mt-2 font-medium">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Issued: {cert.date}</span>
                </div>

                <div className="text-[10px] font-mono text-slate-450 dark:text-slate-500 mt-1">
                  ID: {cert.credentialId}
                </div>
              </div>

              {/* Verify Link */}
              <a
                href={cert.url}
                target="_blank"
                rel="noreferrer"
                className="absolute right-4 bottom-4 p-2 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-450 hover:text-slate-800 dark:hover:text-white border border-slate-200/50 dark:border-slate-800/50 hover:border-violet-500/25 transition-all shadow-sm flex items-center justify-center"
                title="Verify Credential"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
