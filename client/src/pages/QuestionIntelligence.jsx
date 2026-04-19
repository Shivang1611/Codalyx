import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import api from '../utils/api.js'
import { toast } from 'sonner'
import SlidingPanel from '../components/question/SlidingPanel.jsx'
import PageWrapper from '../components/shared/PageWrapper.jsx'
import ConceptMastery from '../components/question/ConceptMastery.jsx'
import PsychologicalProfile from '../components/question/PsychologicalProfile.jsx'
import LearningPath from '../components/question/LearningPath.jsx'
import ResourceList from '../components/shared/ResourceList.jsx'
import QuestionOverview from '../components/question/QuestionOverview.jsx'
import { ChevronLeft, Terminal, GitMerge, Brain, Target, Compass, ExternalLink, Play, BookOpen, Layers } from 'lucide-react'

const EditorialBlock = ({ editorial }) => {
  const [lang, setLang] = useState('cpp')
  if (!editorial) return null;

  const code = editorial.implementations ? editorial.implementations[lang] : '// loading...';

  return (
    <div className="mb-12 w-full bg-[var(--bg-card)] rounded-2xl p-8 shadow-xl">
      <h2 className="text-2xl font-bold text-[var(--text-primary)] font-['Space_Grotesk'] tracking-tight mb-8 flex items-center gap-3 border-b border-[var(--border)] pb-4">
        <BookOpen size={24} className="text-[var(--cyan)]" /> Optimal Solution Editorial
      </h2>
      
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-bold text-[var(--text-primary)] mb-3">Intuition</h3>
          <p className="text-[var(--text-secondary)] leading-relaxed text-base">{editorial.intuition}</p>
        </div>

        <div>
          <h3 className="text-lg font-bold text-[var(--text-primary)] mb-3">Algorithm</h3>
          <p className="text-[var(--text-secondary)] leading-relaxed text-base">{editorial.algorithm}</p>
        </div>

        <div>
          <h3 className="text-lg font-bold text-[var(--text-primary)] mb-3">Implementation</h3>
          <div className="rounded-xl overflow-hidden border border-[#30363d] bg-[#0d1117]">
            <div className="flex bg-[#161b22] border-b border-[#30363d]">
              {['cpp', 'java', 'python'].map(l => (
                <button 
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-6 py-3 text-sm font-medium transition-colors ${lang === l ? 'bg-[#0d1117] text-[var(--cyan)] border-t-2 border-t-[var(--cyan)]' : 'text-[#8b949e] hover:bg-[#1f242c] hover:text-[#c9d1d9]'}`}
                >
                  {l === 'cpp' ? 'C++' : l === 'java' ? 'Java' : 'Python3'}
                </button>
              ))}
            </div>
            <pre className="p-6 overflow-x-auto text-[#e6edf3] font-['JetBrains_Mono'] text-sm leading-relaxed min-h-[200px]">
              {code}
            </pre>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">Complexity Analysis</h3>
          <ul className="space-y-4 list-disc list-inside text-[var(--text-secondary)]">
            <li className="leading-relaxed">
              <span className="font-bold text-[var(--text-primary)]">Time complexity:</span> <code className="bg-[#161b22] px-2 py-0.5 rounded text-[#a8d8f0] font-['JetBrains_Mono']">{editorial.timeComplexity?.split(' ')[0] || 'O(N)'}</code>
              <p className="mt-1 ml-6">{editorial.timeComplexity}</p>
            </li>
            <li className="leading-relaxed">
              <span className="font-bold text-[var(--text-primary)]">Space complexity:</span> <code className="bg-[#161b22] px-2 py-0.5 rounded text-[var(--purple)] font-['JetBrains_Mono']">{editorial.spaceComplexity?.split(' ')[0] || 'O(1)'}</code>
              <p className="mt-1 ml-6">{editorial.spaceComplexity}</p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default function QuestionIntelligence() {
  const { profileId, questionId } = useParams()
  const navigate = useNavigate()

  // Sliding states for each panel (added one for Solutions)
  const [panelStates, setPanelStates] = useState([0, 0, 0, 0, 0])

  const handleNext = (idx, max) => {
    setPanelStates(prev => {
      const copy = [...prev]
      copy[idx] = Math.min(copy[idx] + 1, max - 1)
      return copy
    })
  }

  const handlePrev = (idx) => {
    setPanelStates(prev => {
      const copy = [...prev]
      copy[idx] = Math.max(copy[idx] - 1, 0)
      return copy
    })
  }

  const [report, setReport] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [userCode, setUserCode] = useState("")
  const [isReanalyzing, setIsReanalyzing] = useState(false)
  const [hasAudited, setHasAudited] = useState(false)
  const [activeTitle, setActiveTitle] = useState("")

  useEffect(() => {
    async function load() {
      try {
        const pRes = await api.get('/profiles')
        const profile = pRes.data.find(p => p._id === profileId)
        if (!profile) return navigate('/dashboard')

        const sub = profile.recentSubmissions?.find(s => s.id === questionId)
        const titleMatch = sub ? sub.title : questionId.replace(/-/g, ' ')
        setActiveTitle(titleMatch)

        const aiRes = await api.post('/ai/analyze-problem', { title: titleMatch })
        setReport(aiRes.data)
      } catch (err) {
        toast.error(err.response?.data?.error || 'Failed to generate intelligence report')
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [profileId, questionId])

  const handleReanalyze = async () => {
    if (!userCode.trim()) return;
    setIsReanalyzing(true);
    try {
      const aiRes = await api.post('/ai/analyze-problem', { title: activeTitle, userCode });
      setReport(aiRes.data);
      setHasAudited(true);
      toast.success("Analysis rebuilt around your code!");
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to analyze your code');
    } finally {
      setIsReanalyzing(false);
    }
  }

  if (isLoading) return <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center"><div className="w-8 h-8 rounded-full border-4 border-[var(--cyan)] border-t-transparent animate-spin" /></div>
  if (!report) return (
    <div className="min-h-screen bg-[var(--bg-base)] flex flex-col gap-6 items-center justify-center text-[var(--text-muted)]">
      <div className="flex flex-col items-center">
        <Target size={48} className="text-[var(--red)] mb-4 opacity-50" />
        <h2 className="text-xl font-bold font-['Space_Grotesk'] text-[var(--text-primary)]">AI Rate Limit Reached</h2>
        <p className="mt-2 text-sm text-center max-w-md leading-relaxed">The Gemini Free Tier is currently saturated. Please wait 30 seconds before retrying the analysis compilation.</p>
      </div>
      <div className="flex gap-4">
        <button 
          onClick={() => navigate(`/analysis/${profileId}`)}
          className="px-6 py-2 border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-xl font-bold text-sm transition-all"
        >
          Go Back
        </button>
        <button 
          onClick={() => {
            setIsLoading(true);
            api.post('/ai/analyze-problem', { title: activeTitle || questionId.replace(/-/g, ' ') })
              .then(res => setReport(res.data))
              .catch(err => toast.error(err.response?.data?.error || 'Rate limit still hit. Try again later.'))
              .finally(() => setIsLoading(false));
          }}
          className="px-6 py-2 bg-[var(--cyan)] hover:bg-[var(--cyan-dark)] text-white rounded-xl font-bold text-sm shadow-lg shadow-[var(--cyan-glow)] transition-all flex items-center gap-2"
        >
          <Play size={16} /> Retry Analysis
        </button>
      </div>
    </div>
  )

  return (
    <PageWrapper>
      <div className="mb-4">
        <button 
          onClick={() => navigate(`/analysis/${profileId}`)}
          className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--cyan)] transition-colors mb-4 group"
        >
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-bold uppercase tracking-wider">Back to Analysis</span>
        </button>
        <h1 className="text-3xl font-bold text-[var(--text-primary)] font-['Space_Grotesk'] tracking-tight flex items-center gap-3">
          Intelligence Report: <span className="text-[var(--cyan)]">{report.title}</span>
        </h1>
      </div>

      <QuestionOverview overview={report.overview} />

      {/* CODE INJECTION MODULE */}
      <div className="mb-8 bg-[#0d1117] border border-[var(--border)] rounded-2xl p-6 relative overflow-hidden group shadow-lg">
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[var(--cyan)] to-[var(--blue)]" />
        <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-widest mb-2 flex items-center gap-2">
          <Terminal size={16} className="text-[var(--cyan)]"/> Exact Code Audit
        </h3>
        <p className="text-xs text-[var(--text-secondary)] mb-4 w-full md:w-2/3 leading-relaxed">
          Paste your exact code below to unlock the Architectural Code Review. The AI will audit your logic and provide a professional optimized reconstruction.
        </p>
        <div className="flex flex-col gap-3">
          <textarea 
            value={userCode}
            onChange={(e) => setUserCode(e.target.value)}
            placeholder={`class Solution {\n  public:\n    bool isPalindrome(string s) { \n       // Paste your exact LeetCode submission here...\n       // The AI will rebuild the report around your specific bugs or architecture.\n    }\n};`}
            spellCheck="false"
            className="w-full min-h-[300px] h-[300px] bg-[#0d1117] border border-[#30363d] focus:border-[var(--cyan)] rounded-xl p-6 text-[#a8d8f0] font-['JetBrains_Mono'] text-sm leading-relaxed transition-colors outline-none resize-y shadow-inner"
          />
          <button 
            onClick={handleReanalyze}
            disabled={isReanalyzing || !userCode.trim()}
            className="self-end px-6 py-2 bg-[var(--cyan)] text-[#0d1117] font-bold text-sm tracking-wider uppercase rounded-lg hover:bg-[var(--cyan)]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_rgba(34,211,238,0.2)] flex items-center gap-2"
          >
            {isReanalyzing ? <span className="animate-pulse">Auditing...</span> : <>Audit My Code <Target size={16}/></>}
          </button>
        </div>
      </div>

      {hasAudited && (
        <div className="mb-8 p-6 bg-[#0d1117] border border-[var(--orange)]/30 rounded-2xl shadow-xl">
          <h2 className="text-xl font-bold text-[var(--text-primary)] font-['Space_Grotesk'] tracking-tight mb-6 flex items-center gap-3">
            <GitMerge size={20} className="text-[var(--orange)]" /> Architectural Code Review
          </h2>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="space-y-3 flex flex-col">
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--orange)]">Your Implementation</p>
              <pre className="p-5 bg-black text-[#e0e0e0] font-['JetBrains_Mono'] text-sm rounded-xl overflow-x-auto min-h-[300px] flex-1 border border-[var(--border)] leading-relaxed whitespace-pre">
                {report.detectedMistake?.buggy || '// No code found'}
              </pre>
            </div>
            <div className="space-y-3 flex flex-col">
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--cyan)]">Optimized Construct</p>
              <pre className="p-5 bg-black text-[#e0e0e0] font-['JetBrains_Mono'] text-sm rounded-xl overflow-x-auto min-h-[300px] flex-1 border border-[var(--border)] leading-relaxed whitespace-pre">
                {report.detectedMistake?.correct || '// Fix unavailable'}
              </pre>
            </div>
          </div>
          <div className="mt-6 bg-[var(--orange)]/10 p-5 rounded-xl border border-[var(--orange)]/30 text-sm text-[var(--orange)] font-semibold leading-relaxed tracking-wide shadow-inner shadow-[var(--orange)]/5">
            <span className="font-bold tracking-widest text-xs uppercase opacity-80 mr-3 block mb-1">Assessment:</span> 
            {report.detectedMistake?.explanation || 'Syntax error.'}
          </div>
        </div>
      )}

      {/* OFFICIAL EDITORIAL SECTION */}
      <EditorialBlock editorial={report.editorial} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        
        {/* PANEL 2 - THOUGHT PROCESS */}
        <SlidingPanel 
          title="Thought Process Audit" 
          accentColor="var(--purple)"
          currentSlide={panelStates[1]}
          onPrev={() => handlePrev(1)}
          onNext={() => handleNext(1, 1)}
          slides={[
            <div className="flex flex-col gap-6 py-2">
              <div className="bg-[var(--purple)]/10 text-[var(--purple)] text-xs p-4 rounded-xl border border-[var(--purple)]/20 leading-relaxed font-medium mb-2 shadow-inner shadow-[var(--purple)]/5">
                 <strong className="block tracking-widest uppercase mb-1 opacity-80 text-[10px]">Execution Trace Protocol:</strong>
                 The AI has simulated your problem-solving flow line by line across common edge-case vulnerabilities and architectural constraints.
              </div>
              {(report.thoughtProcess || []).map((node, i, arr) => (
                <div key={i} className="relative flex items-center gap-4">
                  {i < arr.length - 1 && <div className="absolute left-3 top-6 bottom-[-1.5rem] w-[2px] bg-[var(--border)] border-dashed border-r border-transparent" />}
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 ${node.status === 'success' ? 'bg-[var(--green)]' : 'bg-[var(--orange)] animate-pulse shadow-lg shadow-[var(--orange)]/30'}`}>
                    {node.status === 'success' ? <div className="w-1.5 h-1.5 bg-white rounded-full" /> : <span className="text-white text-[10px]">!</span>}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[var(--text-primary)]">{node.label}</h4>
                    {node.msg && <p className="text-[10px] text-[var(--orange)] font-bold uppercase tracking-tighter mt-0.5">{node.msg}</p>}
                  </div>
                </div>
              ))}
            </div>
          ]}
        />

        {/* PANEL 3 - ADAPTIVE LEARNING PATH */}
        <SlidingPanel 
          title="Adaptive Learning Path" 
          accentColor="var(--cyan)"
          currentSlide={panelStates[2]}
          onPrev={() => handlePrev(2)}
          onNext={() => handleNext(2, 1)}
          slides={[
            <LearningPath paths={report.paths || []} />
          ]}
        />

        {/* PANEL 4 - CONCEPT MASTERY */}
        <SlidingPanel 
          title="Concept Mastery 🧠" 
          accentColor="var(--blue)"
          currentSlide={panelStates[3]}
          onPrev={() => handlePrev(3)}
          onNext={() => handleNext(3, 1)}
          slides={[
            <ConceptMastery mastery={report.mastery} />
          ]}
        />

        {/* PANEL 5 - PSYCHOLOGICAL PROFILE */}
        <SlidingPanel 
          title="Psychological Profile & Traits" 
          accentColor="var(--teal)"
          currentSlide={panelStates[4]}
          onPrev={() => handlePrev(4)}
          onNext={() => handleNext(4, 1)}
          slides={[
            <PsychologicalProfile profile={report.psychologicalProfile} />
          ]}
        />
      </div>

      {/* RESOURCES */}
      <ResourceList resources={report.resources || []} title={`Recommended Resources for ${report.title}`} />
    </PageWrapper>
  )
}
