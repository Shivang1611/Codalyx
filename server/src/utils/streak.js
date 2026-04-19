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

/**
 * Filter and prioritize questions that need revision based on status and accuracy.
 */
export function getOverdueQuestions(profiles) {
  const allSubs = []
  profiles.forEach(p => {
    if (!p.recentSubmissions) return
    p.recentSubmissions.forEach(sub => {
      allSubs.push({
        ...sub,
        profileId: p._id,
        platform: p.platform
      })
    })
  })

  return allSubs
    .filter(s => s.title && (s.status !== 'Accepted' || (s.accuracy || 0) < 60))
    .sort((a, b) => (a.accuracy || 0) - (b.accuracy || 0)) // Lowest accuracy first
    .slice(0, 10)
    .map(s => ({
      id: s.id,
      title: s.title,
      topic: s.topic || 'General',
      platform: s.platform,
      profileId: s.profileId,
      accuracy: s.accuracy || 0,
      status: s.status,
      difficulty: s.difficulty || 'Medium'
    }))
}
