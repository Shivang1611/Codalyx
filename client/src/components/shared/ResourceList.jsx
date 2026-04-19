import { Terminal, Play, Compass, ExternalLink } from 'lucide-react'

export default function ResourceList({ resources, title = "Recommended Learning Resources" }) {
  if (!resources || resources.length === 0) return null;

  return (
    <section className="mt-12 bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl p-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
        <Terminal size={160} />
      </div>
      
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[var(--cyan-glow)] rounded-xl flex items-center justify-center text-[var(--cyan)] shadow-inner">
                <Terminal size={20} />
            </div>
            <div>
                <h2 className="text-xl font-bold font-['Space_Grotesk'] text-[var(--text-primary)] leading-none">{title}</h2>
                <div className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
                    <div className="w-1 h-1 bg-[var(--cyan)] rounded-full animate-ping" />
                    AI-Curated Based on your recent performance
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources.map((res, i) => {
          const getSafeLink = () => {
            if (res.url && res.url.startsWith('http') && res.url !== 'string') return res.url;
            const query = encodeURIComponent(res.title || "LeetCode problem pattern");
            if (res.type?.toLowerCase().includes('video') || res.source?.toLowerCase().includes('youtube')) {
              return `https://www.youtube.com/results?search_query=${query}`;
            }
            return `https://www.google.com/search?q=${query}`;
          };

          return (
            <a 
              key={i} 
              href={getSafeLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-[var(--bg-surface)] border border-[var(--border)] p-6 rounded-2xl flex flex-col hover:border-[var(--cyan)]/30 hover:shadow-xl hover:shadow-[var(--cyan-glow)] transition-all duration-500 cursor-pointer no-underline"
            >
              <div className="flex items-start justify-between mb-5">
              <div className="w-12 h-12 bg-[var(--bg-hover)] rounded-xl flex items-center justify-center text-[var(--cyan)] group-hover:scale-110 group-hover:bg-[var(--cyan)]/10 transition-all duration-500">
                {res.type === 'Video' ? <Play size={24} /> : <Compass size={24} />}
              </div>
              <span className="px-2 py-0.5 bg-[var(--bg-hover)] text-[9px] font-bold text-[var(--text-muted)] rounded uppercase tracking-widest border border-[var(--border)] group-hover:border-[var(--cyan)]/20 transition-colors">
                {res.type}
              </span>
            </div>

            <div className="flex-1">
              <div className="text-[10px] font-bold text-[var(--cyan)] uppercase tracking-tight mb-1">{res.source}</div>
              <h4 className="text-sm font-bold text-[var(--text-primary)] mb-2 leading-snug group-hover:text-[var(--cyan)] transition-colors">{res.title}</h4>
              <div className="text-[10px] text-[var(--text-muted)] mb-6 flex items-center gap-1.5">
                <div className="w-1 h-1 bg-[var(--border)] rounded-full" />
                {res.durationOrLength || res.duration || res.length}
              </div>
            </div>

            <div className="mt-auto px-4 py-2.5 bg-[var(--bg-hover)] group-hover:bg-[var(--cyan)] text-[var(--text-primary)] group-hover:text-white border border-[var(--border)] group-hover:border-transparent rounded-xl text-[11px] font-bold flex items-center justify-between transition-all">
              Master Concept
              <ExternalLink size={14} className="opacity-50" />
            </div>
          </a>
          );
        })}
        
        {/* ADD A "VIEW MORE" CARD */}
        <div className="hidden lg:flex bg-gradient-to-br from-[var(--purple)]/5 to-[var(--cyan)]/5 border border-dashed border-[var(--border)] p-6 rounded-2xl flex-col items-center justify-center text-center group hover:border-[var(--cyan)]/50 transition-all">
            <div className="w-10 h-10 bg-[var(--bg-card)] rounded-full flex items-center justify-center text-[var(--text-muted)] mb-4 group-hover:rotate-12 transition-transform">
                <Compass size={20} />
            </div>
            <h4 className="text-xs font-bold text-[var(--text-primary)]">Explore More Resources</h4>
            <p className="text-[10px] text-[var(--text-muted)] mt-1">Discover deeper concepts</p>
        </div>
      </div>
    </section>
  )
}
