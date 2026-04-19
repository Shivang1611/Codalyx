/**
 * Compute current streak counting backwards from today.
 * @param {Array} days - RevisionDay documents from MongoDB
 */
function computeCurrentStreak(days) {
  if (!days.length) return 0
  
  const completed = days
    .filter(d => d.completed)
    .map(d => new Date(d.date).toISOString().slice(0, 10))
    .sort()
    .reverse()

  let streak = 0
  
  const today = new Date()
  let checkDate = new Date()
  let check = checkDate.toISOString().slice(0, 10)

  // If today not completed, start from yesterday
  if (!completed.includes(check)) {
    checkDate.setDate(checkDate.getDate() - 1)
    check = checkDate.toISOString().slice(0, 10)
  }

  for (let i = 0; i < 365; i++) {
    if (completed.includes(check)) {
      streak++
      checkDate.setDate(checkDate.getDate() - 1)
      check = checkDate.toISOString().slice(0, 10)
    } else {
      break
    }
  }
  return streak
}

function computeCompletionRate(days, profileCreatedAt) {
  const start = profileCreatedAt ? new Date(profileCreatedAt).getTime() : Date.now()
  const totalDays = Math.max(1, Math.ceil((Date.now() - start) / (1000 * 60 * 60 * 24)))
  const completedDays = days.filter(d => d.completed).length
  return Math.round((completedDays / totalDays) * 100)
}

function computeWeeklyActivity(days) {
  const dayNames = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
  const today = new Date()
  
  return dayNames.map((name, i) => {
    // Current week logic: find same day in the last 7 days
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    const target = d.toISOString().slice(0, 10);
    
    const found  = days.find(day => {
      const dayStr = new Date(day.date).toISOString().slice(0, 10)
      return dayStr === target
    })
    
    const count  = found?.questions || 0
    const color  = count > 5 ? 'var(--cyan)'
                 : count >= 3 ? 'var(--orange)'
                 : count >= 1 ? 'var(--purple)'
                 : 'var(--border)'
    return { day: name, count, color }
  })
}

function computeMilestones(currentStreak) {
  const MILESTONES = [
    { id: 'week_warrior',      label: 'Week Warrior',      icon: '🦸', targetDays: 7   },
    { id: 'consistency_champ', label: 'Consistency Champ', icon: '🏆', targetDays: 14  },
    { id: 'thirty_legend',     label: '30-Day Legend',     icon: '⭐', targetDays: 30  },
    { id: 'century_master',    label: 'Century Master',    icon: '🎯', targetDays: 100 },
  ]
  return MILESTONES.map(m => ({
    ...m,
    progress: Math.min((currentStreak / m.targetDays) * 100, 100),
    unlocked: currentStreak >= m.targetDays,
  }))
}

/**
 * Main entry — returns full RevisionStats object.
 * @param {Array} days
 * @param {Object} profile - Mongoose Profile document
 */
export function computeRevisionStats(days, profile) {
  // Merge manual check-ins with real platform activity
  const manualDays = new Set(days.filter(d => d.completed).map(d => new Date(d.date).toISOString().slice(0, 10)));
  const activityDays = new Set();
  
  if (profile.recentSubmissions) {
    profile.recentSubmissions.forEach(sub => {
      const date = new Date(sub.timestamp || sub.date);
      if (!isNaN(date)) activityDays.add(date.toISOString().slice(0, 10));
    });
  }

  // Unified activity set (Manual + Automatic)
  const unifiedDays = new Set([...manualDays, ...activityDays]);
  const unifiedList = Array.from(unifiedDays).map(d => ({ date: d, completed: true, questions: 1 }));

  const currentStreak   = computeCurrentStreak(unifiedList)
  const completionRate  = computeCompletionRate(unifiedList, profile.createdAt)
  const weeklyActivity  = computeWeeklyActivity(unifiedList)
  const milestones      = computeMilestones(currentStreak)
  const totalRevisions  = unifiedList.length

  // Difficulty Distribution
  const solvedByDifficulty = { Easy: 0, Medium: 0, Hard: 0 };
  if (profile.recentSubmissions) {
    profile.recentSubmissions.forEach(sub => {
      if (sub.status === 'Accepted') {
        const diff = sub.difficulty || 'Medium';
        if (solvedByDifficulty[diff] !== undefined) solvedByDifficulty[diff]++;
      }
    });
  }

  // Insights
  const insights = [
    {
      label: 'Consistency Score',
      value: `${Math.min(10, ((currentStreak * 0.4 + completionRate * 0.04))).toFixed(1)}/10`,
      description: 'Activity consistency across platforms',
      icon: '📊',
    },
    {
      label: 'Success Rate',
      value: `${completionRate}%`,
      description: 'Active days vs lifetime tracked',
      icon: '✅',
    },
    {
      label: 'Hard Solves',
      value: solvedByDifficulty.Hard,
      description: 'High-complexity problem count',
      icon: '🔥',
    },
    {
      label: 'Revision Readiness',
      value: profile.weakAreas?.length > 1 ? 'Urgent' : 'Optimal',
      description: 'Gap analysis based on performance',
      icon: '🎯',
    },
  ]

  const recommendations = []
  if (profile.weakAreas && profile.weakAreas.length > 0) {
    const worst = [...profile.weakAreas].sort((a,b) => a.accuracy - b.accuracy)[0];
    recommendations.push(`Priority: Master ${worst.topic}. Recent accuracy is low (${worst.accuracy}%).`);
  }
  
  const nextMilestone = milestones.find(m => !m.unlocked)
  if (nextMilestone) {
    recommendations.push(`${nextMilestone.targetDays - currentStreak} days left for "${nextMilestone.label}" badge.`);
  }

  const activeThisWeek = weeklyActivity.filter(d => d.count > 0).length;
  if (activeThisWeek < 2) {
    recommendations.push('Warning: Low platform activity this week. Aim for at least 3 active days.');
  }

  const roadmaps = [
    {
      id: 'dsa_zero_hero',
      title: 'DSA: Zero to Hero',
      description: 'Complete guide from Arrays to Advanced Graphs.',
      progress: Math.min(Math.round((profile.solvedQuestions / 300) * 100), 100),
      items: 300,
      tags: ['Core', 'SDE-1'],
      link: '/analysis/total'
    },
    {
      id: 'top_100_interview',
      title: 'Top 100 Interview Prep',
      description: 'Most asked questions in FAANG interviews.',
      progress: Math.min(Math.round((profile.solvedQuestions / 1000) * 85), 100),
      items: 100,
      tags: ['FAANG', 'Product'],
      link: '/analysis/total'
    }
  ]

  return {
    currentStreak,
    bestStreak:    Math.max(profile.bestStreak || 0, currentStreak),
    totalRevisions,
    completionRate,
    solvedByDifficulty,
    calendar: Array.from(unifiedDays).map(d => ({ date: d, completed: true, questions: 1 })),
    weeklyActivity,
    milestones,
    insights,
    recommendations,
    roadmaps
  }
}

import { blind75Problems } from '../data/blind75.js'

/**
 * Filter and prioritize questions that need revision based on status and accuracy.
 */
export function getOverdueQuestions(profiles) {
  const candidates = []
  const blind75Titles = blind75Problems.map(p => p.title.toLowerCase())
  
  profiles.forEach(p => {
    if (!p.recentSubmissions) return
    
    // 1. Prioritize real failures and low accuracy
    p.recentSubmissions.forEach(sub => {
      const isBlind75 = sub.title && blind75Titles.includes(sub.title.toLowerCase())
      
      if (sub.title && (sub.status !== 'Accepted' || (sub.accuracy || 0) < 65)) {
        candidates.push({ 
          id: sub.id || sub.titleSlug,
          title: sub.title,
          topic: sub.topic,
          difficulty: sub.difficulty,
          accuracy: sub.accuracy,
          status: sub.status,
          profileId: p._id, 
          platform: p.platform, 
          reason: isBlind75 ? 'Blind 75 Gap' : 'Low Accuracy' 
        })
      }
    })

    // 2. If candidates are low, inject questions from Weak Areas
    if (candidates.length < 5 && p.weakAreas?.length > 0) {
      const topWeakTopics = p.weakAreas.slice(0, 2).map(w => w.topic)
      p.recentSubmissions.forEach(sub => {
        if (topWeakTopics.includes(sub.topic) && !candidates.find(c => c.id === (sub.id || sub.titleSlug))) {
          candidates.push({ 
            id: sub.id || sub.titleSlug,
            title: sub.title,
            topic: sub.topic,
            difficulty: sub.difficulty,
            accuracy: sub.accuracy,
            status: sub.status,
            profileId: p._id, 
            platform: p.platform, 
            reason: 'Weak Area Gap' 
          })
        }
      })
    }

    // 3. Final Fallback: Random solved problems from different accounts
    // Removing the recent submissions dependency so it works even for empty profiles
  })

  // 3. Final Fallback: Random Blind 75 questions (Daily Checklist)
  const leetcodeProfile = profiles.find(p => p.platform?.toUpperCase() === 'LEETCODE');
  const fallbackProfileId = leetcodeProfile ? leetcodeProfile._id : profiles[0]?._id;
  const fallbackPlatform  = 'LEETCODE'; // Blind 75 questions are strictly LeetCode

  if (candidates.length < 5 && fallbackProfileId) {
    const shuffledBlind75 = [...blind75Problems].sort(() => 0.5 - Math.random()).slice(0, 5 - candidates.length);
    
    shuffledBlind75.forEach(b75 => {
      if (!candidates.find(c => c.title?.toLowerCase() === b75.title.toLowerCase())) {
        candidates.push({
          id: b75.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          title: b75.title,
          topic: b75.topic || 'Blind 75',
          platform: fallbackPlatform,
          profileId: fallbackProfileId,
          accuracy: 0,
          status: 'Todo',
          difficulty: b75.difficulty || 'Medium',
          reason: 'Daily Target'
        });
      }
    });
  }

  return candidates
    .sort((a, b) => (a.accuracy || 0) - (b.accuracy || 0))
    .slice(0, 10)
    .map(s => ({
      id: s.id || s.titleSlug || (s.title || s.questionTitle || s.name)?.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      title: s.title || s.questionTitle || s.name || 'Untitled Challenge',
      topic: s.topic || 'General',
      platform: s.platform,
      profileId: s.profileId,
      accuracy: s.accuracy || 0,
      status: s.status,
      difficulty: s.difficulty || 'Medium',
      reason: s.reason
    }))
}
