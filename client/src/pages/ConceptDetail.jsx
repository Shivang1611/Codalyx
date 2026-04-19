import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ChevronLeft, Sparkles, BookOpen, Brain, 
  Lightbulb, CheckCircle2, Copy, Play, Terminal, Target, AlertCircle,
  Share2, MessageCircle, MoreVertical, Layers, Zap, Clock, GraduationCap, Star
} from 'lucide-react'
import { motion } from 'framer-motion'
import api from '../utils/api.js'
import PageWrapper from '../components/shared/PageWrapper.jsx'
import { toast } from 'sonner'

export default function ConceptDetail() {
  const { title } = useParams()
  const navigate = useNavigate()
  const [concept, setConcept] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchConcept()
  }, [title])

  const fetchConcept = async () => {
    try {
      setIsLoading(true)
      const res = await api.get(`/roadmaps/concept/${title}`)
      setConcept(res.data)
    } catch (err) {
      toast.error('Failed to load explanation')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const copyCode = () => {
    navigator.clipboard.writeText(concept.code)
    toast.success('Code copied to clipboard!')
  }

  if (isLoading) return (
    <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-[var(--cyan)] border-t-transparent rounded-full animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] animate-pulse">Building Knowledge Base...</p>
      </div>
    </div>
  )

  if (!concept) return null

  const sections = [
    { id: 'analogy', label: 'Mental Model' },
    { id: 'history', label: 'History' },
    { id: 'mechanics', label: 'Core Mechanics' },
    { id: 'variants', label: 'Variants' },
    { id: 'complexity', label: 'Complexity' },
    { id: 'interview', label: 'Interview Prep' },
    { id: 'pitfalls', label: 'Pitfalls' },
    { id: 'code', label: 'Code study' }
  ]

  return (
    <PageWrapper>
      <div className="max-w-[1400px] mx-auto px-4 lg:px-12 pb-20">
        
        {/* Navigation & Actions */}
        <div className="flex items-center justify-between mb-12">
           <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--cyan)] transition-colors group"
          >
            <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Terminal / Roadmap / Concept</span>
          </button>
          
          <div className="flex items-center gap-4">
            <button className="p-2 text-[var(--text-muted)] hover:text-[var(--cyan)] transition-colors"><Share2 size={18} /></button>
            <button className="p-2 text-[var(--text-muted)] hover:text-[var(--cyan)] transition-colors"><MessageCircle size={18} /></button>
            <div className="w-px h-4 bg-[var(--border)]" />
            <button className="p-2 text-[var(--text-muted)] hover:text-[var(--cyan)] transition-colors"><MoreVertical size={18} /></button>
          </div>
        </div>

        {/* Hero Header */}
        <header className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="px-3 py-1 rounded-full bg-[var(--cyan)]/10 border border-[var(--cyan)]/20 text-[var(--cyan)] text-[10px] font-black uppercase tracking-widest">
              Lvl 99 Principal Documentation
            </div>
            <div className="px-3 py-1 rounded-full bg-[var(--purple)]/10 border border-[var(--purple)]/20 text-[var(--purple)] text-[10px] font-black uppercase tracking-widest">
              10-Minute Read
            </div>
          </div>
          <h1 className="text-5xl lg:text-7xl font-black text-[var(--text-primary)] font-['Space_Grotesk'] tracking-tight mb-8">
            {concept.title}
          </h1>
          <div className="flex flex-wrap items-center gap-8 text-[11px] font-bold text-[var(--text-muted)]">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-[var(--cyan)]" />
              <span>Revision : {concept.lastUpdated || 'April 18, 2026'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Brain size={16} className="text-[var(--purple)]" />
              <span>Cognitive Load: High</span>
            </div>
             <div className="flex items-center gap-2 text-[var(--green)]">
              <CheckCircle2 size={16} />
              <span>Technical Accuracy Verified</span>
            </div>
          </div>
        </header>

        {/* Table of Contents */}
        <nav className="mb-20 flex flex-wrap gap-4 p-2 bg-[var(--bg-card)]/50 border border-[var(--border)] rounded-2xl">
          {sections.map(s => (
            <a key={s.id} href={`#${s.id}`} className="px-4 py-2 text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--cyan)] hover:bg-[var(--bg-hover)] rounded-xl transition-all">
              {s.label}
            </a>
          ))}
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          {/* Main Academic Track */}
          <div className="lg:col-span-8 space-y-24">
            
            {/* Analogy Deep Dive */}
            <section id="analogy" className="scroll-mt-24">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-[var(--cyan)]/10 flex items-center justify-center text-[var(--cyan)]">
                   <Lightbulb size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[var(--text-primary)] font-['Space_Grotesk']">The Mental Model</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Abstract Contextualization</p>
                </div>
              </div>
              <div className="prose prose-xl prose-invert max-w-none">
                <p className="text-xl font-medium text-[var(--text-secondary)] leading-relaxed italic border-l-4 border-[var(--cyan)] pl-8 py-2">
                  {concept.analogy}
                </p>
              </div>
            </section>

            {/* Historical Context */}
            {concept.history && (
              <section id="history" className="scroll-mt-24">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--purple)]/10 flex items-center justify-center text-[var(--purple)]">
                     <Clock size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[var(--text-primary)] font-['Space_Grotesk']">Historical Evolution</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Legacy & Origins</p>
                  </div>
                </div>
                <div className="prose prose-xl prose-invert max-w-none px-4 border-l border-[var(--border)] ml-6">
                  <p className="text-base text-[var(--text-secondary)] leading-loose whitespace-pre-wrap font-medium">
                    {concept.history}
                  </p>
                </div>
              </section>
            )}

            {/* Core Mechanics */}
            <section id="mechanics" className="scroll-mt-24 p-10 bg-[var(--bg-card)]/30 border border-[var(--border)] rounded-[48px]">
              <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 rounded-2xl bg-[var(--cyan)]/10 flex items-center justify-center text-[var(--cyan)]">
                   <Target size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[var(--text-primary)] font-['Space_Grotesk']">Deep Technical Mechanics</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Principal Engineer Deep Dive</p>
                </div>
              </div>
              <div className="prose prose-xl prose-invert max-w-none">
                <p className="text-base text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap font-medium">
                  {concept.explanation}
                </p>
              </div>
            </section>

            {/* Variants */}
            {concept.variants && (
              <section id="variants" className="scroll-mt-24">
                <h3 className="text-2xl font-black text-[var(--text-primary)] mb-8 font-['Space_Grotesk'] uppercase tracking-tight">Variations & Implementations</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {concept.variants.map((v, i) => (
                    <div key={i} className="p-8 bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl hover:border-[var(--cyan)]/30 transition-all group">
                      <div className="w-8 h-8 rounded-lg bg-[var(--cyan)]/5 flex items-center justify-center mb-4 text-[var(--cyan)] group-hover:bg-[var(--cyan)] group-hover:text-white transition-all text-xs font-black">
                        0{i+1}
                      </div>
                      <h4 className="text-sm font-black text-[var(--text-primary)] mb-3 uppercase tracking-widest">{v.title}</h4>
                      <p className="text-xs text-[var(--text-muted)] leading-relaxed font-medium">{v.desc}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Interview Prep Accordion */}
            {concept.interviewQA && (
              <section id="interview" className="scroll-mt-24 pt-16 border-t border-[var(--border)]">
                 <div className="flex items-center gap-4 mb-10">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--orange)]/10 flex items-center justify-center text-[var(--orange)]">
                    <GraduationCap size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[var(--text-primary)] font-['Space_Grotesk']">Interview Mastery Audit</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Expect these at Google/Meta</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {concept.interviewQA.map((qa, i) => (
                    <div key={i} className="p-6 bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl hover:border-[var(--orange)]/30 transition-all">
                      <div className="flex items-center gap-3 mb-3">
                         <div className="px-2 py-0.5 rounded-md bg-[var(--orange)] text-white text-[8px] font-black uppercase">Question</div>
                         <h4 className="text-xs font-bold text-[var(--text-primary)]">{qa.q}</h4>
                      </div>
                      <div className="pl-14">
                        <p className="text-xs text-[var(--text-muted)] leading-relaxed font-medium">
                          {qa.a}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

          </div>

          {/* Theoretical & Performance Sidebar */}
          <aside className="lg:col-span-4 space-y-8 sticky top-10">
            
            {/* Complexity Dashboard */}
            <div id="complexity" className="bg-[var(--bg-card)] border border-[var(--border)] p-8 rounded-[32px] shadow-2xl">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] mb-8 flex items-center gap-2">
                <Clock size={16} className="text-[var(--cyan)]" /> Theoretical Audit
              </h4>
              <div className="space-y-6">
                <div className="group">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[9px] font-black text-[var(--text-disabled)] uppercase tracking-widest">Time Analysis</span>
                    <span className="text-sm font-black text-[var(--cyan)]">{concept.complexity?.time}</span>
                  </div>
                  <div className="h-1 bg-[var(--border)] rounded-full overflow-hidden">
                    <div className="h-full w-4/5 bg-[var(--cyan)] opacity-20" />
                  </div>
                </div>
                <div className="group">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[9px] font-black text-[var(--text-disabled)] uppercase tracking-widest">Memory Footprint</span>
                    <span className="text-sm font-black text-[var(--purple)]">{concept.complexity?.space}</span>
                  </div>
                  <div className="h-1 bg-[var(--border)] rounded-full overflow-hidden">
                    <div className="h-full w-2/5 bg-[var(--purple)] opacity-20" />
                  </div>
                </div>
              </div>
            </div>

            {/* Pitfalls & Anti-Patterns */}
            <div id="pitfalls" className="bg-[var(--red)]/5 border border-[var(--red)]/20 p-8 rounded-[32px]">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--red)] mb-8 flex items-center gap-2">
                <AlertCircle size={16} /> Engineering Pitfalls
              </h4>
              <div className="space-y-6">
                {concept.pitfalls?.map((p, i) => (
                  <div key={i} className="group">
                    <h5 className="text-[11px] font-black text-[var(--text-primary)] uppercase mb-1 tracking-tight group-hover:text-[var(--red)] transition-colors">{p.title}</h5>
                    <p className="text-[10px] text-[var(--text-muted)] leading-relaxed font-bold">{p.desc}</p>
                  </div>
                ))}
              </div>
            </div>

             {/* Prerequisites */}
             <div className="bg-[var(--bg-card)]/50 border border-[var(--border)] p-8 rounded-[32px]">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] mb-8 flex items-center gap-2">
                <BookOpen size={16} className="text-[var(--purple)]" /> Learning Chain
              </h4>
              <ul className="space-y-4">
                {concept.prerequisites?.map((pre, i) => (
                  <li key={i} className="flex items-center gap-3 text-[11px] font-bold text-[var(--text-secondary)] hover:text-[var(--purple)] transition-colors cursor-default">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--purple)]" />
                    {pre}
                  </li>
                ))}
              </ul>
            </div>

            {/* Why it Matters Academic */}
            <div className="p-8 bg-zinc-900 border border-zinc-800 rounded-[32px] relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                  <Star size={80} />
               </div>
               <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-4">Strategic Impact</h4>
               <p className="text-xs font-bold text-zinc-400 leading-relaxed italic">
                 "{concept.whyItMatters}"
               </p>
            </div>

          </aside>

        </div>

        {/* Global Implementation Case Study */}
        <section id="code" className="mt-32 space-y-8 scroll-mt-24">
          <div className="flex items-center justify-between px-8 py-6 bg-[var(--bg-card)] border border-[var(--border)] rounded-[32px]">
            <div>
              <h3 className="text-xl font-bold text-[var(--text-primary)] font-['Space_Grotesk']">Case Study: Production Implementation</h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mt-1">Enterprise-Grade Source Code Breakdown</p>
            </div>
             <button 
              onClick={copyCode}
              className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-white bg-[var(--cyan)] hover:bg-[var(--cyan-dark)] px-6 py-3 rounded-xl transition-all shadow-lg shadow-[var(--cyan)]/20"
            >
              <Copy size={14} /> CLONE REPO
            </button>
          </div>
          
          <div className="bg-[#0b0e14] rounded-[48px] overflow-hidden border border-[var(--border)] shadow-2xl">
            <div className="flex items-center justify-between px-10 py-5 bg-white/5 border-b border-white/10">
              <div className="flex items-center gap-6">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
                  <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                  <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                  <Terminal size={14} />
                  principal_architect_module.js
                </div>
              </div>
              <div className="text-[10px] font-black text-[var(--cyan)] uppercase tracking-widest">
                Read-Only Module
              </div>
            </div>
            <pre className="p-10 text-sm font-medium leading-loose overflow-x-auto text-zinc-300">
              <code>{concept.code}</code>
            </pre>
          </div>
        </section>

      </div>
    </PageWrapper>
  )
}
