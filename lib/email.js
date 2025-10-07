// Email Service - Supports both Resend API and SMTP
// Resend: Free tier: 3,000 emails/month, 100 emails/day - Sign up at https://resend.com
// SMTP: Use any provider (Gmail, Outlook, SendGrid, Mailgun, etc.)
// Settings are stored in database and managed through admin panel

const nodemailer = require('nodemailer');

// Get email settings from database
async function getEmailConfig() {
  try {
    const { getEmailSettings } = require('./database');
    const result = await getEmailSettings();

    if (result.success && result.settings) {
      return result.settings;
    }
  } catch (error) {
    console.error('Failed to get email settings from database:', error);
  }

  // Fallback to environment variables if database not available
  return {
    provider: process.env.EMAIL_PROVIDER || 'resend',
    enabled: false,
    resend_api_key: process.env.RESEND_API_KEY,
    smtp_host: process.env.SMTP_HOST,
    smtp_port: process.env.SMTP_PORT || 587,
    smtp_user: process.env.SMTP_USER,
    smtp_pass: process.env.SMTP_PASS,
    smtp_secure: process.env.SMTP_SECURE === 'true',
    email_from: process.env.EMAIL_FROM || 'noreply@yourdomain.com',
    admin_email: process.env.ADMIN_EMAIL
  };
}

async function sendEmail(to, subject, htmlContent, textContent) {
  // Get configuration from database
  const config = await getEmailConfig();

  // Check if email is enabled
  if (!config.enabled) {
    console.warn('Email notifications are disabled');
    return { success: false, error: 'Email notifications are disabled' };
  }

  // Check if provider is configured
  if (config.provider === 'resend') {
    if (!config.resend_api_key) {
      console.warn('Resend API key not configured - email not sent');
      return { success: false, error: 'Resend API key not configured' };
    }
  } else if (config.provider === 'smtp') {
    if (!config.smtp_host || !config.smtp_user || !config.smtp_pass) {
      console.warn('SMTP not configured - email not sent');
      return { success: false, error: 'SMTP credentials not configured' };
    }
  }

  try {
    if (config.provider === 'smtp') {
      // Create SMTP transporter
      const transporter = nodemailer.createTransport({
        host: config.smtp_host,
        port: parseInt(config.smtp_port),
        secure: config.smtp_secure,
        auth: {
          user: config.smtp_user,
          pass: config.smtp_pass
        }
      });

      // Send via SMTP
      const info = await transporter.sendMail({
        from: config.email_from,
        to: to,
        subject: subject,
        html: htmlContent,
        text: textContent || htmlContent.replace(/<[^>]*>/g, '') // Strip HTML for text version
      });

      return { success: true, id: info.messageId };
    } else {
      // Send via Resend API
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.resend_api_key}`
        },
        body: JSON.stringify({
          from: config.email_from,
          to: to,
          subject: subject,
          html: htmlContent,
          text: textContent || htmlContent.replace(/<[^>]*>/g, '')
        })
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, id: data.id };
      } else {
        console.error('Email send error:', data);
        return { success: false, error: data.message || 'Failed to send email' };
      }
    }
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: error.message };
  }
}

// Email Templates
function getEmailTemplate(content) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #ffffff;
      background-color: #0f1419;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #00d4ff, #ff006e);
      padding: 30px;
      text-align: center;
      border-radius: 10px 10px 0 0;
    }
    .header h1 {
      margin: 0;
      color: #0f1419;
      font-size: 28px;
    }
    .content {
      background-color: #1a1f2e;
      padding: 30px;
      border-radius: 0 0 10px 10px;
    }
    .button {
      display: inline-block;
      padding: 12px 30px;
      background: linear-gradient(135deg, #00d4ff, #ff006e);
      color: #0f1419;
      text-decoration: none;
      border-radius: 8px;
      font-weight: bold;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      padding: 20px;
      color: #a0aec0;
      font-size: 14px;
    }
    .divider {
      border-top: 1px solid rgba(0, 212, 255, 0.2);
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎮 EVU Gaming Network</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} EVU Gaming Network. All rights reserved.</p>
      <p style="font-size: 12px;">You received this email because you have an account or submitted a support ticket on EVU Gaming Network.</p>
    </div>
  </div>
</body>
</html>
  `;
}

// Specific email templates
async function sendWelcomeEmail(to, username) {
  const content = `
    <h2 style="color: #00d4ff;">Welcome to EVU Gaming Network! 🎉</h2>
    <p>Hi <strong>${username}</strong>,</p>
    <p>Thank you for creating an account with EVU Gaming Network! We're excited to have you as part of our gaming community.</p>
    <div class="divider"></div>
    <h3 style="color: #00d4ff;">What's Next?</h3>
    <ul>
      <li>Explore our Minecraft and FiveM servers</li>
      <li>Join discussions in our community forum</li>
      <li>Get support from our team when you need it</li>
      <li>Connect with other players</li>
    </ul>
    <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com'}" class="button">Visit EVU Gaming</a>
    <p>If you have any questions, feel free to reach out through our support system.</p>
    <p>Happy gaming!<br>The EVU Team</p>
  `;

  return await sendEmail(
    to,
    'Welcome to EVU Gaming Network! 🎮',
    getEmailTemplate(content)
  );
}

async function sendTicketCreatedEmail(to, ticketNumber, subject) {
  const content = `
    <h2 style="color: #00d4ff;">Support Ticket Created 🎫</h2>
    <p>Your support ticket has been successfully created.</p>
    <div class="divider"></div>
    <p><strong>Ticket Number:</strong> #${ticketNumber}</p>
    <p><strong>Subject:</strong> ${subject}</p>
    <p><strong>Status:</strong> <span style="color: #00ff88;">Open</span></p>
    <div class="divider"></div>
    <p>Our team will review your ticket and respond as soon as possible. You can track the status and reply to your ticket by logging into your account.</p>
    <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com'}/support" class="button">View Your Tickets</a>
    <p>Thank you for contacting EVU Gaming Network support!</p>
  `;

  return await sendEmail(
    to,
    `Support Ticket Created - #${ticketNumber}`,
    getEmailTemplate(content)
  );
}

async function sendTicketReplyEmail(to, ticketNumber, replyAuthor, isAdmin) {
  const content = `
    <h2 style="color: #00d4ff;">New Reply on Your Ticket 💬</h2>
    <p>${isAdmin ? 'An admin' : replyAuthor} has replied to your support ticket.</p>
    <div class="divider"></div>
    <p><strong>Ticket Number:</strong> #${ticketNumber}</p>
    <p><strong>Replied by:</strong> ${replyAuthor} ${isAdmin ? '<span style="background: #ff006e; padding: 2px 8px; border-radius: 4px; font-size: 12px;">ADMIN</span>' : ''}</p>
    <div class="divider"></div>
    <p>Log in to view the full conversation and reply to your ticket.</p>
    <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com'}/support" class="button">View Ticket</a>
  `;

  return await sendEmail(
    to,
    `New Reply on Ticket #${ticketNumber}`,
    getEmailTemplate(content)
  );
}

async function sendTicketStatusEmail(to, ticketNumber, newStatus) {
  const statusColors = {
    'open': '#00ff88',
    'in-progress': '#ffaa00',
    'closed': '#ff6b6b'
  };

  const content = `
    <h2 style="color: #00d4ff;">Ticket Status Updated 📝</h2>
    <p>The status of your support ticket has been updated.</p>
    <div class="divider"></div>
    <p><strong>Ticket Number:</strong> #${ticketNumber}</p>
    <p><strong>New Status:</strong> <span style="color: ${statusColors[newStatus] || '#a0aec0'};">${newStatus.replace('-', ' ').toUpperCase()}</span></p>
    <div class="divider"></div>
    ${newStatus === 'closed' ?
      '<p>Your ticket has been closed. If you need further assistance, you can create a new ticket or reopen this one.</p>' :
      '<p>Our team is working on your ticket. Log in to view updates and communicate with our support team.</p>'
    }
    <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com'}/support" class="button">View Ticket</a>
  `;

  return await sendEmail(
    to,
    `Ticket Status Updated - #${ticketNumber}`,
    getEmailTemplate(content)
  );
}

async function sendPasswordResetEmail(to, username, resetToken) {
  const resetLink = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com'}/reset-password?token=${resetToken}`;

  const content = `
    <h2 style="color: #00d4ff;">Password Reset Request 🔐</h2>
    <p>Hi <strong>${username}</strong>,</p>
    <p>We received a request to reset your password for your EVU Gaming Network account.</p>
    <div class="divider"></div>
    <p>Click the button below to reset your password. This link will expire in 1 hour.</p>
    <a href="${resetLink}" class="button">Reset Password</a>
    <div class="divider"></div>
    <p style="font-size: 14px; color: #a0aec0;">If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
    <p style="font-size: 12px; color: #a0aec0; word-break: break-all;">If the button doesn't work, copy and paste this link into your browser:<br>${resetLink}</p>
  `;

  return await sendEmail(
    to,
    'Password Reset Request - EVU Gaming Network',
    getEmailTemplate(content)
  );
}

async function sendAdminTicketNotification(adminEmail, ticketNumber, subject, author) {
  const content = `
    <h2 style="color: #00d4ff;">New Support Ticket Created 🎫</h2>
    <p>A new support ticket has been submitted and requires your attention.</p>
    <div class="divider"></div>
    <p><strong>Ticket Number:</strong> #${ticketNumber}</p>
    <p><strong>Subject:</strong> ${subject}</p>
    <p><strong>Submitted by:</strong> ${author}</p>
    <p><strong>Status:</strong> <span style="color: #00ff88;">Open</span></p>
    <div class="divider"></div>
    <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com'}/admin" class="button">View in Admin Panel</a>
  `;

  return await sendEmail(
    adminEmail,
    `New Support Ticket - #${ticketNumber}`,
    getEmailTemplate(content)
  );
}

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendTicketCreatedEmail,
  sendTicketReplyEmail,
  sendTicketStatusEmail,
  sendPasswordResetEmail,
  sendAdminTicketNotification
};
