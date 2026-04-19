import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Code, Terminal, Database, Briefcase, Server, FileText, Calculator, Coffee, Download, Eye, Loader2, BookOpen } from 'lucide-react'
import PageWrapper from '../components/shared/PageWrapper.jsx'
import api from '../utils/api.js'

const IconMap = {
  Code, Terminal, Database, Briefcase, Server, FileText, Calculator, Coffee
}

export default function Resources() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('')

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const res = await api.get('/resources')
        if (res.data.success) {
          setData(res.data.data)
          if (res.data.data.length > 0) {
            setActiveTab(res.data.data[0].category)
          }
        }
      } catch (err) {
        console.error('Failed to fetch resources:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchResources()
  }, [])

  if (loading) {
    return (
      <PageWrapper>
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--cyan)]" />
        </div>
      </PageWrapper>
    )
  }

  const activeCategory = data.find(d => d.category === activeTab)

  return (
    <PageWrapper>
      <div className="max-w-6xl mx-auto space-y-8 pb-12">
        {/* Header Section */}
        <section className="relative px-8 py-10 rounded-3xl overflow-hidden shadow-xl bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-base)] border border-[var(--border)] overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-[var(--cyan)] rounded-full blur-[120px] opacity-10"></div>
          
          <div className="relative z-10 text-center space-y-4">
            <div className="flex justify-center mb-2">
              <div className="p-3 bg-[var(--cyan)]/10 text-[var(--cyan)] rounded-xl border border-[var(--cyan)]/20 shadow-[0_0_15px_rgba(45,212,191,0.2)]">
                <BookOpen size={28} />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[var(--text-primary)] font-space">
              Library &amp; Study <span className="text-[var(--cyan)]">Materials</span>
            </h1>
            <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto font-medium">
              Curated, battle-tested PDF playbooks, revision cheat-sheets, and interview archives from top tier companies. Read them here or save them for later.
            </p>
          </div>
        </section>

        {/* Tab Navigation */}
        <div className="flex gap-2 overflow-x-auto pb-4 hide-scrollbar">
          {data.map((group) => (
            <button
              key={group.category}
              onClick={() => setActiveTab(group.category)}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-300 ${
                activeTab === group.category
                  ? 'bg-[var(--cyan)] text-white shadow-[0_0_15px_rgba(45,212,191,0.3)]'
                  : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border)] hover:border-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              {group.category}
            </button>
          ))}
        </div>

        {/* Resource Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activeCategory?.items.map((resource, i) => {
            const IconComponent = IconMap[resource.icon] || FileText
            
            return (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                key={resource.id}
                className="group relative bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border)] hover:border-[var(--cyan)]/30 transition-all duration-300 hover:shadow-xl hover:shadow-[var(--cyan)]/5 overflow-hidden flex flex-col"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--cyan)]/5 rounded-full blur-3xl -tranglate-y-10 translate-x-10 group-hover:bg-[var(--cyan)]/10 transition-colors"></div>
                
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 bg-[var(--bg-hover)] border border-[var(--border)] rounded-xl text-[var(--cyan)] group-hover:scale-110 transition-transform duration-300 shrink-0">
                    <IconComponent size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-[var(--text-primary)] text-lg leading-tight group-hover:text-[var(--cyan)] transition-colors">{resource.title}</h3>
                    <div className="flex items-center gap-2 mt-2 font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
                      <span className="bg-[var(--bg-hover)] px-2 py-0.5 rounded-md">{resource.readTime} Read</span>
                      <span>•</span>
                      <span className="bg-[var(--bg-hover)] px-2 py-0.5 rounded-md text-[var(--cyan)]">PDF</span>
                    </div>
                  </div>
                </div>
                
                <p className="text-[var(--text-secondary)] text-sm mb-6 flex-1 line-clamp-2">
                  {resource.description}
                </p>
                
                <div className="flex items-center gap-3 pt-4 border-t border-[var(--border)]">
                  <a 
                    href={resource.url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex-1 flex justify-center items-center gap-2 py-2.5 bg-[var(--cyan)]/10 text-[var(--cyan)] rounded-xl font-bold text-sm hover:bg-[var(--cyan)]/20 transition-colors"
                  >
                    <Eye size={16} />
                    Read Note
                  </a>
                  <a 
                    href={resource.url}
                    download={resource.filename}
                    className="p-2.5 bg-[var(--bg-hover)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-gray-500 rounded-xl transition-all"
                    title="Download PDF"
                  >
                    <Download size={16} />
                  </a>
                </div>
              </motion.div>
            )
          })}
        </div>
        
        {(!activeCategory || activeCategory.items.length === 0) && (
          <div className="p-12 text-center text-[var(--text-muted)] border border-dashed border-[var(--border)] rounded-2xl">
            <FileText className="mx-auto h-12 w-12 mb-3 opacity-20" />
            <p>No resources found for this category.</p>
          </div>
        )}

      </div>
    </PageWrapper>
  )
}
