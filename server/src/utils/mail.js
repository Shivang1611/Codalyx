import nodemailer from 'nodemailer'

// Lazy factory: creates and verifies transporter at call-time so env vars are always resolved
function getTransporter() {
  const user = process.env.MAIL_USER
  const pass = process.env.MAIL_PASS

  if (!user || !pass) {
    throw new Error(`Mail env vars missing — MAIL_USER: ${user ? 'SET' : 'MISSING'}, MAIL_PASS: ${pass ? 'SET' : 'MISSING'}`)
  }

  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user, pass },
    tls: { rejectUnauthorized: false }
  })
}

const ADMIN_MAIL_TEMPLATE = ({ userName, userEmail, subject, category, message }) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background: #f4f4f5; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
    <div style="background: linear-gradient(135deg, #0d9488, #0891b2); padding: 28px 32px;">
      <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 700;">🎫 New Support Ticket</h1>
      <p style="margin: 6px 0 0; color: rgba(255,255,255,0.8); font-size: 13px;">Codalyx Engineering Queue</p>
    </div>
    <div style="padding: 32px;">
      <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #374151;">
        <tr><td style="padding: 8px 0; font-weight: 600; color: #6b7280; width: 100px;">From</td><td style="padding: 8px 0;">${userName} &lt;${userEmail}&gt;</td></tr>
        <tr><td style="padding: 8px 0; font-weight: 600; color: #6b7280;">Category</td><td style="padding: 8px 0;"><span style="background: #f0fdf4; color: #16a34a; padding: 2px 10px; border-radius: 999px; font-size: 12px; font-weight: 700;">${category}</span></td></tr>
        <tr><td style="padding: 8px 0; font-weight: 600; color: #6b7280;">Subject</td><td style="padding: 8px 0; font-weight: 600;">${subject}</td></tr>
      </table>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
      <p style="margin: 0 0 8px; font-size: 12px; font-weight: 700; text-transform: uppercase; color: #9ca3af; letter-spacing: 0.05em;">Message</p>
      <div style="background: #f9fafb; border-left: 4px solid #0d9488; padding: 16px; border-radius: 0 8px 8px 0; font-size: 14px; color: #374151; white-space: pre-wrap; line-height: 1.6;">${message}</div>
    </div>
    <div style="background: #f9fafb; padding: 16px 32px; font-size: 11px; color: #9ca3af; text-align: center;">
      Codalyx Support System • Auto-generated notification
    </div>
  </div>
</body>
</html>
`

const USER_CONFIRM_TEMPLATE = ({ userName, subject, message }) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background: #f4f4f5; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
    <div style="background: linear-gradient(135deg, #0d9488, #0891b2); padding: 28px 32px;">
      <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 700;">✅ We've got your message!</h1>
      <p style="margin: 6px 0 0; color: rgba(255,255,255,0.8); font-size: 13px;">Codalyx Support Team</p>
    </div>
    <div style="padding: 32px;">
      <p style="font-size: 16px; color: #111827; font-weight: 600;">Hello ${userName},</p>
      <p style="font-size: 14px; color: #4b5563; line-height: 1.6;">
        Thank you for reaching out. Your support ticket regarding <strong>"${subject}"</strong> has been logged and assigned to our engineering team.
      </p>
      <div style="background: #f0fdfa; border: 1px solid #99f6e4; border-radius: 8px; padding: 16px 20px; margin: 20px 0;">
        <p style="margin: 0 0 8px; font-size: 12px; font-weight: 700; text-transform: uppercase; color: #0d9488; letter-spacing: 0.05em;">Your message</p>
        <p style="margin: 0; font-size: 13px; color: #374151; font-style: italic; line-height: 1.6;">"${message}"</p>
      </div>
      <div style="display: flex; gap: 12px; margin-top: 20px;">
        <div style="flex: 1; background: #fafafa; border-radius: 8px; padding: 14px; text-align: center; border: 1px solid #e5e7eb;">
          <p style="margin: 0; font-size: 20px;">⏱️</p>
          <p style="margin: 4px 0 0; font-size: 12px; font-weight: 700; color: #374151;">Response Time</p>
          <p style="margin: 2px 0 0; font-size: 11px; color: #6b7280;">2–4 business hours</p>
        </div>
        <div style="flex: 1; background: #fafafa; border-radius: 8px; padding: 14px; text-align: center; border: 1px solid #e5e7eb;">
          <p style="margin: 0; font-size: 20px;">🔒</p>
          <p style="margin: 4px 0 0; font-size: 12px; font-weight: 700; color: #374151;">Secure Channel</p>
          <p style="margin: 2px 0 0; font-size: 11px; color: #6b7280;">Encrypted & private</p>
        </div>
      </div>
    </div>
    <div style="background: #f9fafb; padding: 16px 32px; font-size: 11px; color: #9ca3af; text-align: center;">
      Codalyx Platform • You're receiving this because you submitted a support ticket.
    </div>
  </div>
</body>
</html>
`

export async function sendAdminNotification({ userEmail, userName, subject, category, message }) {
  const transporter = getTransporter()
  return transporter.sendMail({
    from: `"Codalyx Support" <${process.env.MAIL_USER}>`,
    to: process.env.ADMIN_EMAIL,
    subject: `[SUPPORT] ${category}: ${subject}`,
    html: ADMIN_MAIL_TEMPLATE({ userName, userEmail, subject, category, message })
  })
}

export async function sendUserConfirmation({ userEmail, userName, subject, message }) {
  const transporter = getTransporter()
  return transporter.sendMail({
    from: `"Codalyx" <${process.env.MAIL_USER}>`,
    to: userEmail,
    subject: `We received your request: ${subject}`,
    html: USER_CONFIRM_TEMPLATE({ userName, subject, message })
  })
}
