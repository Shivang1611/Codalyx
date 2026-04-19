import { AlertTriangle, TrendingUp, Building2, PhoneCall, Clock, Target, Users } from 'lucide-react'

export default function QuestionOverview({ overview }) {
  if (!overview) return null;

  const { difficulty, frequency, ratingReason, companies, rounds, expectedTime } = overview;

  return (
    <div className="mb-8 bg-[var(--bg-card)] rounded-[32px] p-8 border border-[var(--border)] shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--cyan)]/5 rounded-full blur-[100px] pointer-events-none translate-x-1/3 -translate-y-1/3" />
      
      <h2 className="text-2xl font-bold text-[var(--text-primary)] font-['Space_Grotesk'] tracking-tight mb-8 flex items-center gap-3 relative z-10">
        <Target size={24} className="text-[var(--cyan)]" /> Question Overview
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
        
        {/* LEFT COLUMN: QUESTION LEVEL */}
        <div className="space-y-4">
           <h3 className="text-sm font-bold text-[var(--cyan)] uppercase tracking-widest flex items-center gap-2 mb-2">
             <div className="w-4 h-5 rounded-sm bg-[var(--cyan)]/20 border border-[var(--cyan)]/40" />
             Question Level
           </h3>

           {/* Difficulty Card */}
           <div className="bg-[#0b0e14] border border-[#1e2329] rounded-2xl p-6">
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs text-[var(--text-muted)] font-medium">Difficulty</span>
                <span className={`text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full border ${difficulty.level === 'Hard' ? 'text-[var(--red)] border-[var(--red)]/20 bg-[var(--red)]/10' : difficulty.level === 'Medium' ? 'text-[var(--orange)] border-[var(--orange)]/20 bg-[var(--orange)]/10' : 'text-[var(--green)] border-[var(--green)]/20 bg-[var(--green)]/10'}`}>
                  {difficulty.level}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm font-bold text-white mb-3">
                <AlertTriangle size={16} className="text-[var(--orange)]" />
                Actual Complexity: {difficulty.actualComplexity}
              </div>
              <div className="h-1.5 bg-[#1e2329] rounded-full overflow-hidden w-full">
                 <div className="h-full bg-gradient-to-r from-[var(--orange)] to-[var(--red)]" style={{ width: `${difficulty.complexityScore}%` }} />
              </div>
           </div>

           {/* Frequency Card */}
           <div className="bg-[#0b0e14] border border-[#1e2329] rounded-2xl p-6 relative overflow-hidden">
             <div className="flex justify-between items-start">
               <div>
                  <span className="text-xs text-[var(--text-muted)] font-medium block mb-1">Interview Frequency</span>
                  <h4 className="text-2xl font-black text-white">{frequency.level}</h4>
                  <p className="text-[10px] text-[var(--text-muted)] mt-1 font-medium">Asked in {frequency.percentage} of interviews</p>
               </div>
               <TrendingUp size={20} className="text-[var(--cyan)] opacity-70" />
             </div>
           </div>

           {/* Rating Reason */}
           <div className="bg-[#0b0e14] border border-[#1e2329] rounded-2xl p-6">
             <h4 className="text-xs font-bold text-[var(--purple)] mb-4">{ratingReason.title}</h4>
             <ul className="space-y-2">
               {(ratingReason.reasons || []).map((reason, i) => (
                 <li key={i} className="text-xs text-[var(--text-secondary)] flex items-start gap-2">
                   <span className="mt-1.5 w-1 h-1 rounded-full shrink-0 bg-[var(--text-muted)]" />
                   {reason}
                 </li>
               ))}
             </ul>
           </div>
        </div>

        {/* RIGHT COLUMN: COMPANIES & CONTEXT */}
        <div className="space-y-4">
           <h3 className="text-sm font-bold text-[var(--cyan)] uppercase tracking-widest flex items-center gap-2 mb-2">
             <Building2 size={16} className="text-[var(--cyan)]" />
             Companies & Context
           </h3>

           {/* Companies Card */}
           <div className="bg-[#0b0e14] border border-[#1e2329] rounded-2xl p-6">
             <h4 className="text-xs text-[var(--text-muted)] font-medium mb-4 flex items-center gap-2">
               <Building2 size={14} /> Top Companies Asking
             </h4>
             <div className="grid grid-cols-2 gap-3">
               {(companies || []).map((company, i) => (
                 <div key={i} className="bg-[#161b22] border border-[#30363d] rounded-xl px-4 py-2.5 flex items-center gap-2 text-xs font-bold text-white shadow-sm hover:border-[var(--blue)]/50 transition-colors">
                   <div className={`w-1.5 h-1.5 rounded-full ${i%2===0 ? 'bg-[var(--cyan)]' : 'bg-[var(--orange)]'}`} />
                   {company}
                 </div>
               ))}
             </div>
           </div>

           {/* Interview Round */}
           <div className="bg-[#0b0e14] border border-[#1e2329] rounded-2xl p-6">
             <h4 className="text-xs text-[var(--text-muted)] font-medium mb-4 flex items-center gap-2">
               <PhoneCall size={14} /> Interview Round
             </h4>
             <div className="flex gap-2 mb-3">
                <span className="px-3 py-1 bg-[var(--green)]/10 text-[var(--green)] border border-[var(--green)]/20 rounded-full text-[10px] font-bold uppercase tracking-wider">Phone Screen</span>
                <span className="px-3 py-1 bg-[var(--blue)]/10 text-[var(--blue)] border border-[var(--blue)]/20 rounded-full text-[10px] font-bold uppercase tracking-wider">On-site</span>
             </div>
             <p className="text-[10px] text-[var(--text-secondary)] font-medium">{rounds.phone} phone screen, {rounds.onsite} on-site</p>
           </div>

           {/* Expected Time Card */}
           <div className="bg-[#0b0e14] border border-[#1e2329] rounded-2xl p-6 flex justify-between items-center relative overflow-hidden group">
             <div className="absolute top-0 right-0 h-full w-1/3 bg-gradient-to-l from-[var(--orange)]/5 to-transparent pointer-events-none" />
             <div>
               <h4 className="text-xs text-[var(--text-muted)] font-medium flex items-center gap-2 mb-2">
                 <Clock size={14} className="text-[var(--orange)]" /> Expected Time
               </h4>
               <p className="text-[10px] text-[var(--text-secondary)] font-medium flex items-center gap-1.5 mt-4">
                 <Users size={12} /> {expectedTime.successRate} of candidates solve it in time
               </p>
             </div>
             <div className="text-right">
               <span className="text-3xl font-black text-[var(--orange)] block">{expectedTime.minutes}</span>
               <span className="text-[10px] text-[var(--orange)] font-bold uppercase tracking-widest opacity-80">minutes</span>
             </div>
           </div>

        </div>
      </div>
    </div>
  )
}
