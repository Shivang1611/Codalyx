import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, BookOpen, Code, Award, CheckCircle, ChevronRight, ChevronLeft, Target } from 'lucide-react'

// Mock database mapping topics to subtopics, questions, and action plans
const TOPIC_KNOWLEDGE_BASE = {
  'Array': {
    tags: ['Two Pointers', 'Sliding Window', 'Prefix Sum'],
    questions: [
      { id: 1, title: 'Container With Most Water', diff: 'Medium', success: 68 },
      { id: 2, title: 'Trapping Rain Water', diff: 'Hard', success: 52 },
      { id: 3, title: 'Subarray Sum Equals K', diff: 'Medium', success: 71 },
    ],
    plan: [
      {
        title: 'Learn Core Concepts', duration: '1 week', desc: 'Study fundamental array operations and memory layout.',
        tasks: ['Understand contiguous memory allocation', 'Master kadane\'s algorithm for maximum subarray', 'Practice basic prefix sum implementations']
      },
      {
        title: 'Study Pattern Templates', duration: '2 weeks', desc: 'Master common problem-solving patterns.',
        tasks: ['Memorize sliding window templates', 'Practice two-pointer convergence', 'Build mental models for monotonic queues']
      }
    ]
  },
  'Dynamic Programming': {
    tags: ['Memoization', 'Tabulation', 'State Machine'],
    questions: [
      { id: 4, title: 'Longest Increasing Subsequence', diff: 'Medium', success: 55 },
      { id: 5, title: 'Edit Distance', diff: 'Hard', success: 42 },
      { id: 6, title: 'House Robber II', diff: 'Medium', success: 61 },
    ],
    plan: [
      {
        title: 'Learn Core Concepts', duration: '2 weeks', desc: 'Understand overlapping subproblems and optimal substructure.',
        tasks: ['Read about top-down vs bottom-up', 'Practice state definition', 'Watch recursion tree breakdown videos']
      },
      {
        title: 'Study Pattern Templates', duration: '3 weeks', desc: 'Master classic DP families.',
        tasks: ['Knapsack 0/1 variants', 'Longest common subsequence templates', 'Palindromic DP problems']
      }
    ]
  },
  'Graph': {
    tags: ['BFS', 'DFS', 'Topological Sort'],
    questions: [
      { id: 7, title: 'Number of Islands', diff: 'Medium', success: 65 },
      { id: 8, title: 'Alien Dictionary', diff: 'Hard', success: 38 },
      { id: 9, title: 'Course Schedule II', diff: 'Medium', success: 50 },
    ],
    plan: [
      {
        title: 'Learn Core Concepts', duration: '1 week', desc: 'Data structures for graphs and basic traversal.',
        tasks: ['Adjacency matrix vs list', 'Master recursive DFS', 'Master Queue-based BFS']
      },
      {
        title: 'Study Pattern Templates', duration: '2 weeks', desc: 'Advanced graph algorithms.',
        tasks: ['Dijkstra\'s shortest path', 'Kahn\'s algorithm for Topo Sort', 'Union Find (Disjoint Set)']
      }
    ]
  }
}

// Fallback logic for unknown topics
function getTopicData(topicName) {
  const normalized = Object.keys(TOPIC_KNOWLEDGE_BASE).find(k => 
    topicName.toLowerCase().includes(k.toLowerCase()) || 
    k.toLowerCase().includes(topicName.toLowerCase())
  )
  if (normalized) return TOPIC_KNOWLEDGE_BASE[normalized]
  
  return {
    tags: ['Core Fundamentals', 'Algorithm Deep Dive', 'Optimization'],
    questions: [
      { id: 101, title: `Classic ${topicName} Problem 1`, diff: 'Easy', success: 85 },
      { id: 102, title: `Classic ${topicName} Problem 2`, diff: 'Medium', success: 60 },
      { id: 103, title: `Advanced ${topicName} Problem`, diff: 'Hard', success: 40 },
    ],
    plan: [
      {
        title: 'Learn Core Concepts', duration: '1 week', desc: `Master fundamental ${topicName} theory.`,
        tasks: [`Read comprehensive guide on ${topicName}`, `Watch tutorial videos`, `Implement base data structure`]
      },
      {
        title: 'Study Pattern Templates', duration: '2 weeks', desc: `Master common ${topicName} problem-solving patterns.`,
        tasks: ['Analyze 20+ solved problems', 'Create pattern flashcards', 'Build mental models']
      }
    ]
  }
}

export default function WeaknessIntelligenceDash({ weakAreas = [] }) {
  const [activeRank, setActiveRank] = useState(0)
  const [activeImproveTab, setActiveImproveTab] = useState('conceptual')

  // Top 3 weakest areas to populate Primary, Secondary, Tertiary
  const intelligenceTargets = useMemo(() => {
    let sorted = [...weakAreas].sort((a, b) => (a.accuracy || 0) - (b.accuracy || 0))
    if (!sorted.length) {
      sorted = [
        { topic: 'Dynamic Programming', attempts: 12, accuracy: 35 },
        { topic: 'Graph', attempts: 8, accuracy: 42 },
        { topic: 'Tree', attempts: 15, accuracy: 55 }
      ]
    }
    return sorted.slice(0, 3)
  }, [weakAreas])

  const currentTarget = intelligenceTargets[activeRank]
  const currentData = currentTarget ? getTopicData(currentTarget.topic) : null

  if (!currentTarget || !currentData) return null

  // Metric visual calculations
  const rankLabels = ['PRIMARY', 'SECONDARY', 'TERTIARY']
  const scoreBadge = Math.max(100 - (currentTarget.accuracy || 0), 10)

  return (
    <div className="w-full rounded-3xl overflow-hidden border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-primary)] shadow-[var(--shadow-card)]">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        
        {/* LEFT PANEL: WEAKNESS INTELLIGENCE */}
        <div className="p-8 border-b lg:border-b-0 lg:border-r border-[var(--border)] flex flex-col relative bg-[var(--bg-card)]">
          
          <h2 className="text-xl font-black text-[var(--cyan)] uppercase tracking-widest mb-6 font-['Space_Grotesk']">
            Weakness Intelligence
          </h2>

          {/* Rank Tabs */}
          <div className="flex gap-2 mb-8">
            {rankLabels.map((label, idx) => {
              const isActive = activeRank === idx
              const isAvailable = idx < intelligenceTargets.length
              return (
                <button 
                  key={label}
                  onClick={() => isAvailable && setActiveRank(idx)}
                  className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg border transition-all ${
                    isActive 
                      ? 'bg-[var(--cyan)]/10 border-[var(--cyan)] text-[var(--text-primary)] shadow-sm' 
                      : isAvailable 
                        ? 'bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)]' 
                        : 'bg-[var(--bg-hover)] border-[var(--border-subtle)] text-[var(--text-muted)] opacity-50 cursor-not-allowed'
                  }`}
                >
                  {label}
                </button>
              )
            })}
          </div>

          {/* Main Target Header */}
          <div className="flex justify-between items-start mb-8">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-[var(--red)]/10 border border-[var(--red)]/30 rounded-xl">
                <AlertTriangle size={24} className="text-[var(--red)]" />
              </div>
              <div>
                <p className="text-xs text-[var(--red)] font-bold tracking-widest uppercase mb-1">Critical Priority</p>
                <h3 className="text-3xl font-bold font-['Space_Grotesk'] text-[var(--text-primary)]">{currentTarget.topic}</h3>
              </div>
            </div>
            <div className="text-right">
              <span className="text-5xl font-light text-[var(--red)]">{scoreBadge}</span>
            </div>
          </div>

          {/* Core Metrics */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 text-center">
              <p className="text-[10px] uppercase text-[var(--text-muted)] font-bold mb-2">Accuracy</p>
              <p className="text-xl font-black text-[var(--red)]">{currentTarget.accuracy}%</p>
            </div>
            <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 text-center">
              <p className="text-[10px] uppercase text-[var(--text-muted)] font-bold mb-2">Attempts</p>
              <p className="text-xl font-black text-[var(--red)]">{currentTarget.attempts}</p>
            </div>
            <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 text-center">
              <p className="text-[10px] uppercase text-[var(--text-muted)] font-bold mb-2">Time Loss</p>
              <p className="text-xl font-black text-[var(--red)]">-12m</p>
            </div>
          </div>

          {/* Key Topics */}
          <div className="mb-8">
            <p className="text-[10px] text-[var(--text-muted)] uppercase font-bold mb-3 tracking-wider">Key Topics</p>
            <div className="flex flex-wrap gap-2">
              {currentData.tags.map(tag => (
                <span key={tag} className="px-3 py-1 rounded-full border border-[var(--red)]/30 text-[var(--red)] text-[10px] font-bold bg-[var(--red)]/10">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Recommended Questions */}
          <div className="flex-1 flex flex-col">
            <p className="text-[10px] text-[var(--text-muted)] uppercase font-bold mb-3 tracking-wider">Personalized Recommended Questions</p>
            <div className="space-y-3 flex-1 overflow-y-auto pr-2">
              {currentData.questions.map((q) => (
                <div key={q.id} className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 h-full w-1 bg-[var(--cyan)]" />
                  <p className="font-bold text-sm text-[var(--text-primary)] mb-2">{q.title}</p>
                  <div className="flex items-center gap-4 text-xs font-bold">
                    <span className={`${q.diff === 'Easy' ? 'text-[var(--green)]' : q.diff === 'Medium' ? 'text-[var(--orange)]' : 'text-[var(--red)]'}`}>
                      {q.diff}
                    </span>
                    <span className="text-[var(--text-secondary)] font-normal">{q.success}% success rate</span>
                  </div>
                  <div className="h-1 bg-[var(--bg-hover)] rounded-full mt-3 overflow-hidden">
                    <div 
                      className="h-full rounded-full" 
                      style={{ 
                        width: `${q.success}%`, 
                        backgroundColor: q.diff === 'Easy' ? 'var(--green)' : q.diff === 'Medium' ? 'var(--orange)' : 'var(--red)'
                      }} 
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center gap-4 mt-6">
              <button disabled className="w-8 h-8 rounded-full border border-[var(--border-subtle)] flex items-center justify-center opacity-50"><ChevronLeft size={16} /></button>
              <div className="flex items-center gap-2">
                <div className="w-6 h-1.5 bg-[var(--cyan)] rounded-full" />
                <div className="w-1.5 h-1.5 bg-[var(--border-subtle)] rounded-full" />
                <div className="w-1.5 h-1.5 bg-[var(--border-subtle)] rounded-full" />
              </div>
              <button disabled className="w-8 h-8 rounded-full border border-[var(--border-subtle)] flex items-center justify-center opacity-50"><ChevronRight size={16} /></button>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: HOW TO IMPROVE */}
        <div className="p-8 flex flex-col bg-[var(--bg-card)]">
          
          <h2 className="text-xl font-black text-[var(--cyan)] uppercase tracking-widest mb-6 font-['Space_Grotesk']">
            How to Improve
          </h2>

          {/* Tab Selection */}
          <div className="flex gap-2 mb-8">
            <button
              onClick={() => setActiveImproveTab('conceptual')}
              className={`flex-1 py-3 px-2 flex flex-col items-center gap-2 text-[10px] font-bold uppercase rounded-lg border transition-all ${
                activeImproveTab === 'conceptual' ? 'bg-[var(--cyan)]/10 border-[var(--cyan)]/50 text-[var(--text-primary)]' : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <BookOpen size={16} className={activeImproveTab === 'conceptual' ? 'text-[var(--cyan)]' : ''} />
              Conceptual Foundation
            </button>
            <button
              onClick={() => setActiveImproveTab('practice')}
              className={`flex-1 py-3 px-2 flex flex-col items-center gap-2 text-[10px] font-bold uppercase rounded-lg border transition-all ${
                activeImproveTab === 'practice' ? 'bg-[var(--orange)]/10 border-[var(--orange)]/50 text-[var(--text-primary)]' : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Code size={16} className={activeImproveTab === 'practice' ? 'text-[var(--orange)]' : ''} />
              Problem Practice
            </button>
            <button
              onClick={() => setActiveImproveTab('mastery')}
              className={`flex-1 py-3 px-2 flex flex-col items-center gap-2 text-[10px] font-bold uppercase rounded-lg border transition-all ${
                activeImproveTab === 'mastery' ? 'bg-[var(--green)]/10 border-[var(--green)]/50 text-[var(--text-primary)]' : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Award size={16} className={activeImproveTab === 'mastery' ? 'text-[var(--green)]' : ''} />
              Assessment & Mastery
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeImproveTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col"
            >
              {/* Active Tab Header */}
              <div className="flex items-center gap-4 mb-8">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                  activeImproveTab === 'conceptual' ? 'bg-[var(--cyan)]/10 border-[var(--cyan)]/30 text-[var(--cyan)]' :
                  activeImproveTab === 'practice' ? 'bg-[var(--orange)]/10 border-[var(--orange)]/30 text-[var(--orange)]' :
                  'bg-[var(--green)]/10 border-[var(--green)]/30 text-[var(--green)]'
                }`}>
                  {activeImproveTab === 'conceptual' ? <BookOpen size={20} /> :
                  activeImproveTab === 'practice' ? <Code size={20} /> :
                  <Award size={20} />}
                </div>
                <div>
                  <h3 className="font-bold text-[var(--text-primary)]">
                    {activeImproveTab === 'conceptual' ? 'Conceptual Foundation' :
                    activeImproveTab === 'practice' ? 'Problem Practice Path' :
                    'Assessment & Mastery'}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    Total Duration: {activeImproveTab === 'practice' ? '13 weeks' : '7 weeks'}
                  </p>
                </div>
              </div>

              {/* Timeline Steps */}
              <div className="flex-1 space-y-6 relative pl-4 overflow-y-auto pr-2 custom-scrollbar">
                <div className="absolute left-[23px] top-6 bottom-6 w-[1px] bg-[var(--border-subtle)]" />

                {(activeImproveTab === 'conceptual' ? [
                  { title: 'Learn Core Concepts', duration: '2 weeks', desc: `Study fundamental ${currentTarget.topic} concepts and theory.`, tasks: [`Read comprehensive guide on ${currentTarget.topic}`, 'Watch tutorial videos', 'Take notes on key patterns'] },
                  { title: 'Study Pattern Templates', duration: '3 weeks', desc: `Master common ${currentTarget.topic} problem-solving patterns.`, tasks: [`Analyze 50+ solved ${currentTarget.topic} problems`, 'Create pattern flashcards', 'Build mental models'] }
                ] : activeImproveTab === 'practice' ? [
                  { title: 'Easy Problems (50+)', duration: '3 weeks', desc: `Build confidence with fundamental ${currentTarget.topic} problems.`, tasks: ['Solve 50 easy problems', 'Focus on accuracy over speed', 'Review solutions thoroughly'] },
                  { title: 'Medium Problems (100+)', duration: '6 weeks', desc: `Tackle intermediate ${currentTarget.topic} complexity challenges.`, tasks: ['Complete 100 medium problems', 'Time yourself (45 min limit)', 'Optimize solutions'] }
                ] : [
                  { title: 'Mock Interviews', duration: '4 weeks', desc: `Simulate real ${currentTarget.topic} interview conditions.`, tasks: ['Schedule 2 mocks per week', 'Practice whiteboarding', 'Get feedback from peers'] },
                  { title: 'Review & Refine', duration: '2 weeks', desc: `Analyze ${currentTarget.topic} performance and fill gaps.`, tasks: ['Identify weak patterns', 'Revisit difficult problems', 'Improve communication'] }
                ]).map((step, idx) => (
                  <div key={idx} className="relative z-10 flex gap-6">
                    <div className={`w-6 h-6 rounded-full border-2 bg-[var(--bg-card)] flex items-center justify-center text-xs font-bold shrink-0 ${
                      activeImproveTab === 'conceptual' ? 'border-[var(--cyan)] text-[var(--cyan)]' :
                      activeImproveTab === 'practice' ? 'border-[var(--orange)] text-[var(--orange)]' :
                      'border-[var(--green)] text-[var(--green)]'
                    }`}>
                      {idx + 1}
                    </div>
                    <div className="flex-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-5 relative overflow-hidden">
                      <div className={`absolute right-0 top-0 bottom-0 w-1 ${
                        activeImproveTab === 'conceptual' ? 'bg-[var(--cyan)]' :
                        activeImproveTab === 'practice' ? 'bg-[var(--orange)]' :
                        'bg-[var(--green)]'
                      }`} />
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-sm text-[var(--text-primary)]">{step.title}</h4>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                          activeImproveTab === 'conceptual' ? 'text-[var(--cyan)] bg-[var(--cyan)]/10' :
                          activeImproveTab === 'practice' ? 'text-[var(--orange)] bg-[var(--orange)]/10' :
                          'text-[var(--green)] bg-[var(--green)]/10'
                        }`}>{step.duration}</span>
                      </div>
                      <p className="text-[11px] text-[var(--text-secondary)] mb-4">{step.desc}</p>
                      <ul className="space-y-2">
                        {step.tasks.map((task, tIdx) => (
                          <li key={tIdx} className="flex items-center gap-2 text-[11px] text-[var(--text-secondary)]">
                            <CheckCircle size={14} className={
                              activeImproveTab === 'conceptual' ? 'text-[var(--cyan)]' :
                              activeImproveTab === 'practice' ? 'text-[var(--orange)]' :
                              'text-[var(--green)]'
                            } />
                            {task}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-[var(--border-subtle)]">
                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase mb-3 text-center">Next Steps After Completion</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {activeImproveTab === 'conceptual' ? (
                    <>
                      <button className="px-3 py-2 border border-[var(--cyan)]/50 text-[var(--cyan)] hover:bg-[var(--cyan)]/10 rounded-lg text-[10px] font-bold transition-all">Move to problem practice</button>
                      <button className="px-3 py-2 border border-[var(--border-subtle)] text-[var(--text-muted)] rounded-lg text-[10px] font-bold">Join study group</button>
                      <button className="px-3 py-2 border border-[var(--border-subtle)] text-[var(--text-muted)] rounded-lg text-[10px] font-bold">Start mock interviews</button>
                    </>
                  ) : activeImproveTab === 'practice' ? (
                    <>
                      <button className="px-3 py-2 border border-[var(--orange)]/50 text-[var(--orange)] hover:bg-[var(--orange)]/10 rounded-lg text-[10px] font-bold transition-all">Weekly contest participation</button>
                      <button className="px-3 py-2 border border-[var(--border-subtle)] text-[var(--text-muted)] rounded-lg text-[10px] font-bold">Peer code review</button>
                      <button className="px-3 py-2 border border-[var(--border-subtle)] text-[var(--text-muted)] rounded-lg text-[10px] font-bold">Algorithm deep dives</button>
                    </>
                  ) : (
                    <>
                      <button className="px-3 py-2 border border-[var(--green)]/50 text-[var(--green)] hover:bg-[var(--green)]/10 rounded-lg text-[10px] font-bold transition-all">Start applying to companies</button>
                      <button className="px-3 py-2 border border-[var(--border-subtle)] text-[var(--text-muted)] rounded-lg text-[10px] font-bold">Update resume with achievements</button>
                      <button className="px-3 py-2 border border-[var(--border-subtle)] text-[var(--text-muted)] rounded-lg text-[10px] font-bold">Network with recruiters</button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </div>
  )
}
