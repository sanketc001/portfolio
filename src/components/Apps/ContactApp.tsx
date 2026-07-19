import React, { useState } from 'react'
import { Mail, MapPin, Send, CheckCircle2, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import portfolioData from '../../data/portfolioData.json'

export const ContactApp: React.FC = () => {
  const { profile } = portfolioData
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !message.trim()) {
      setStatus('error')
      return
    }

    setStatus('submitting')

    // Simulate sending email api call
    setTimeout(() => {
      setStatus('success')
      setName('')
      setEmail('')
      setMessage('')
    }, 1500)
  }

  return (
    <div className="h-full overflow-y-auto p-6 md:p-8 select-text">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 h-full items-center">
        
        {/* Left Column: Info card */}
        <div className="md:col-span-5 space-y-6">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-white font-display">
              Let's Connect
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Have a project in mind or want to talk shop? Drop a message in the form, or reach out directly via email.
            </p>
          </div>

          <div className="space-y-4 text-xs md:text-sm">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-100/50 dark:bg-slate-900/30 border border-slate-200/20 min-w-0 w-full">
              <Mail className="w-5 h-5 text-violet-500 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-400">Email Address</p>
                <a href={`mailto:${profile.email}`} className="text-slate-700 dark:text-slate-200 font-medium hover:text-violet-500 transition-colors block truncate" title={profile.email}>
                  {profile.email}
                </a>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-100/50 dark:bg-slate-900/30 border border-slate-200/20">
              <MapPin className="w-5 h-5 text-violet-500 flex-shrink-0" />
              <div>
                <p className="font-semibold text-slate-400">Location</p>
                <p className="text-slate-700 dark:text-slate-200 font-medium">{profile.location}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Contact form */}
        <div className="md:col-span-7">
          <div className="p-6 rounded-2xl glass border border-white/10 dark:border-white/5 relative min-h-[350px] flex flex-col justify-center">
            <AnimatePresence mode="wait">
              {status === 'success' ? (
                <motion.div
                  key="success"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="text-center py-8 space-y-4"
                >
                  <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
                  <div>
                    <h3 className="text-lg font-bold text-slate-805 dark:text-white font-display">Message Dispatched!</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
                      Thank you for reaching out. A confirmation will be sent shortly, and I'll get back to you soon.
                    </p>
                  </div>
                  <button
                    onClick={() => setStatus('idle')}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Send another message
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={handleSubmit}
                  className="space-y-4 text-xs md:text-sm"
                >
                  <div>
                    <label className="block text-slate-500 dark:text-slate-400 font-semibold mb-1">Your Name</label>
                    <input
                       type="text"
                       value={name}
                       onChange={e => setName(e.target.value)}
                       placeholder="Jane Doe"
                       disabled={status === 'submitting'}
                       className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 dark:text-slate-400 font-semibold mb-1">Email Address</label>
                    <input
                       type="email"
                       value={email}
                       onChange={e => setEmail(e.target.value)}
                       placeholder="jane@example.com"
                       disabled={status === 'submitting'}
                       className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 dark:text-slate-400 font-semibold mb-1">Message</label>
                    <textarea
                       value={message}
                       onChange={e => setMessage(e.target.value)}
                       placeholder="Hi! I'd love to collaborate on a new project..."
                       rows={4}
                       disabled={status === 'submitting'}
                       className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                    />
                  </div>

                  {status === 'error' && (
                    <div className="flex items-center gap-1.5 text-xs text-red-500 font-semibold">
                      <AlertCircle className="w-4 h-4" />
                      <span>Please populate all fields.</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'submitting'}
                    className="w-full flex items-center justify-center gap-1.5 py-3 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 text-white font-bold rounded-xl transition-all cursor-pointer shadow-md"
                  >
                    {status === 'submitting' ? (
                      <span>Sending...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </div>
  )
}
