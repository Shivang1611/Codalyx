/**
 * @typedef {'LEETCODE'|'CODEFORCES'|'CODECHEF'} Platform
 *
 * @typedef {Object} UserProfile
 * @property {string} _id
 * @property {Platform} platform
 * @property {string} username
 * @property {number} totalQuestions
 * @property {number} solvedQuestions
 * @property {number} accuracy
 * @property {number} streak
 * @property {number} bestStreak
 * @property {string|null} lastSyncedAt
 * @property {string} createdAt
 * @property {WeakArea[]} weakAreas
 *
 * @typedef {Object} WeakArea
 * @property {string} topic
 * @property {number} accuracy
 * @property {number} attempts
 * @property {'critical'|'high'|'medium'|'low'} priority
 *
 * @typedef {Object} AggregatedStats
 * @property {number} totalQuestions
 * @property {number} solvedQuestions
 * @property {number} accuracy
 * @property {number} bestStreak
 * @property {number} profileCount
 *
 * @typedef {Object} RevisionDay
 * @property {string} date
 * @property {boolean} completed
 * @property {number} questions
 * @property {number} durationMin
 *
 * @typedef {Object} WeeklyActivity
 * @property {string} day
 * @property {number} count
 * @property {string} color
 *
 * @typedef {Object} Milestone
 * @property {string} id
 * @property {string} label
 * @property {string} icon
 * @property {number} targetDays
 * @property {number} progress
 * @property {boolean} unlocked
 *
 * @typedef {Object} PerformanceInsight
 * @property {string} label
 * @property {string} value
 * @property {string} description
 * @property {string} icon
 *
 * @typedef {Object} RevisionStats
 * @property {number} currentStreak
 * @property {number} bestStreak
 * @property {number} totalRevisions
 * @property {number} completionRate
 * @property {RevisionDay[]} calendar
 * @property {WeeklyActivity[]} weeklyActivity
 * @property {Milestone[]} milestones
 * @property {PerformanceInsight[]} insights
 * @property {string[]} recommendations
 *
 * @typedef {Object} Question
 * @property {string} id
 * @property {string} title
 * @property {'Easy'|'Medium'|'Hard'} difficulty
 * @property {string} topic
 * @property {number} accuracy
 * @property {number} attempts
 * @property {string} lastAttempted
 * @property {string[]} companies
 * @property {number} timeEstimateMin
 *
 * @typedef {Object} PsychologyTrait
 * @property {string} trait
 * @property {number} score
 * @property {string} color
 *
 * @typedef {Object} QuestionAnalysis
 * @property {Question} question
 * @property {string} buggyCode
 * @property {string} correctCode
 * @property {PsychologyTrait[]} psychologyProfile
 * @property {{ mastered: string[], needsWork: string[] }} conceptMastery
 * @property {Array<{ priority: number, title: string, problems: string[],
 *   estimatedHours: string, targetAccuracy: number }>} learningPaths
 * @property {Array<{ type: string, title: string, source: string,
 *   durationOrLength: string, url: string }>} resources
 */

// This file has no runtime exports — JSDoc only.
export default {}
