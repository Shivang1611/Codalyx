import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware.js'

const router = Router()

const RESOURCES = [
  {
    id: 'core-oops',
    title: 'Object Oriented Programming Notes',
    category: 'Core CS Fundamentals',
    description: 'Deep dive into Pillars of OOPs, Design Patterns, and Real-world applications.',
    filename: 'OOPS Notes.pdf',
    icon: 'Code',
    readTime: '3.5 Hrs'
  },
  {
    id: 'core-os',
    title: 'Operating Systems Full Notes',
    category: 'Core CS Fundamentals',
    description: 'Complete revision of Deadlocks, Threading, Memory Mapping, and Process Scheduling.',
    filename: 'OS_Full_Notes.pdf',
    icon: 'Terminal',
    readTime: '4 Hrs'
  },
  {
    id: 'core-dbms',
    title: 'DBMS GATE Notes',
    category: 'Core CS Fundamentals',
    description: 'Master Database Management Systems, Normalization, ACID properties, and B+ Trees.',
    filename: 'DBMS GATE Notes.pdf',
    icon: 'Database',
    readTime: '4.5 Hrs'
  },
  {
    id: 'company-google',
    title: 'Google LeetCode Archive',
    category: 'Company specific',
    description: 'Highly curated list of frequently asked LeetCode questions at Google SDE interviews.',
    filename: 'Google - LeetCode.pdf',
    icon: 'Briefcase',
    readTime: '10+ Hrs'
  },
  {
    id: 'company-adobe',
    title: 'Adobe LeetCode Archive',
    category: 'Company specific',
    description: 'Top array and string manipulation questions heavily favored in Adobe technical rounds.',
    filename: 'Adobe - LeetCode.pdf',
    icon: 'Briefcase',
    readTime: '8+ Hrs'
  },
  {
    id: 'company-jpmorgan',
    title: 'JPMorgan LeetCode Archive',
    category: 'Company specific',
    description: 'Crucial dynamic programming and system design questions from JPMorgan Chase.',
    filename: 'JPMorgan - LeetCode.pdf',
    icon: 'Briefcase',
    readTime: '5+ Hrs'
  },
  {
    id: 'sql-handbook',
    title: 'SQL Handbook',
    category: 'Database & SQL',
    description: 'Advanced Guide: Window Functions, CTEs, Subqueries, and Complex Joins.',
    filename: 'SQL Handbook .pdf',
    icon: 'Server',
    readTime: '2.5 Hrs'
  },
  {
    id: 'sql-notes',
    title: 'SQL Revision Notes',
    category: 'Database & SQL',
    description: 'Quick cheat-sheet for rapid SQL syntax and constraint revision before interviews.',
    filename: 'SQL (notes).pdf',
    icon: 'FileText',
    readTime: '1 Hr'
  },
  {
    id: 'aptitude-ninja',
    title: 'Aptitude Notes by Coding Ninjas',
    category: 'General Aptitude',
    description: 'Master Probabilities, Permutations, Time/Work, and mathematical problem-solving.',
    filename: '#Aptitude Notes by Coding Ninjas.pdf',
    icon: 'Calculator',
    readTime: '6 Hrs'
  },
  {
    id: 'leetcode-java',
    title: 'LeetCode Java Solved Questions',
    category: 'General Aptitude',
    description: 'Hundreds of thoroughly explained Java solutions for maximum code reuse.',
    filename: 'LeetCode Java Practice Solved Questions - by SYNTAX ERROR.pdf',
    icon: 'Coffee',
    readTime: '15+ Hrs'
  }
]

router.get('/', requireAuth, (req, res) => {
  // Add direct download URL formulation
  const baseUrl = `${req.protocol}://${req.get('host')}/resources`
  
  const mapped = RESOURCES.map(r => ({
    ...r,
    url: `${baseUrl}/${encodeURIComponent(r.filename)}`
  }))

  const categories = [...new Set(mapped.map(r => r.category))]
  const grouped = categories.map(cat => ({
    category: cat,
    items: mapped.filter(r => r.category === cat)
  }))

  res.json({ success: true, data: grouped })
})

export default router
