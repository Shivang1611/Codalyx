import express from 'express'
import { requireAuth } from '../middleware/auth.middleware.js'
import SupportTicket from '../models/SupportTicket.js'
import User from '../models/User.js'
import { sendAdminNotification, sendUserConfirmation } from '../utils/mail.js'

const router = express.Router()

router.post('/ticket', requireAuth, async (req, res) => {
  try {
    const { subject, category, message } = req.body
    const userId = req.userId

    if (!subject?.trim() || !message?.trim()) {
      return res.status(400).json({ success: false, message: 'Subject and message are required.' })
    }

    // Fetch user for email dispatch
    const user = await User.findById(userId)
    if (!user) return res.status(404).json({ error: 'User not found' })

    // 1. Save ticket to DB first (always succeeds independently of mail)
    const ticket = new SupportTicket({ userId, subject, category, message })
    await ticket.save()
    console.log(`✅ Support ticket saved: [${category}] "${subject}" from ${user.email}`)

    // 2. Dispatch emails — log full errors for debugging
    const mailResults = await Promise.allSettled([
      sendAdminNotification({
        userEmail: user.email,
        userName: user.name,
        subject,
        category,
        message
      }),
      sendUserConfirmation({
        userEmail: user.email,
        userName: user.name,
        subject,
        message
      })
    ])

    mailResults.forEach((result, i) => {
      const label = i === 0 ? 'Admin notification' : 'User confirmation'
      if (result.status === 'fulfilled') {
        console.log(`📧 ${label} sent successfully → messageId: ${result.value?.messageId}`)
      } else {
        // Full error dump so we can see exactly why mail failed
        console.error(`❌ ${label} FAILED:`, result.reason?.message || result.reason)
      }
    })

    return res.status(201).json({
      success: true,
      message: 'Ticket logged. Confirmation email dispatched.',
      ticketId: ticket._id,
      mailStatus: {
        adminNotified: mailResults[0].status === 'fulfilled',
        userConfirmed: mailResults[1].status === 'fulfilled'
      }
    })
  } catch (err) {
    console.error('Support Ticket Error:', err)
    res.status(500).json({ success: false, message: 'Server error. Please try again.' })
  }
})

export default router
