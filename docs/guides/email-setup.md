# Email Setup Guide

This guide explains how to configure email notifications for the EVU Gaming Network website.

## Overview

The email system supports **two methods** for sending notifications:
1. **Resend API** (Recommended) - Easy setup, free tier
2. **SMTP** - Use any email provider (Gmail, Outlook, SendGrid, etc.)

**Email notifications include:**
- **Welcome emails** when users register
- **Ticket creation** confirmations
- **Ticket replies** notifications
- **Ticket status changes** updates
- **Admin notifications** for new support tickets

## Choose Your Email Provider

### Option 1: Resend API (Recommended)

**Pros:**
- ✅ Easy setup (just an API key)
- ✅ Generous free tier (3,000/month, 100/day)
- ✅ No email account needed
- ✅ Built-in analytics
- ✅ Better deliverability with domain verification

**Cons:**
- ❌ Requires internet API calls
- ❌ Free tier limits may be insufficient for large communities

### Option 2: SMTP

**Pros:**
- ✅ Works with any email provider
- ✅ Use existing email accounts (Gmail, Outlook, etc.)
- ✅ More control over sending
- ✅ No third-party service dependency

**Cons:**
- ❌ More complex setup (host, port, credentials)
- ❌ Gmail requires App Passwords (2FA)
- ❌ May have stricter rate limits
- ❌ Less deliverability without proper DNS setup

---

## Setup Instructions

### Option 1: Resend API Setup

### 1. Create Resend Account

1. Visit [resend.com](https://resend.com)
2. Click "Sign Up" and create an account
3. Verify your email address

### 2. Get API Key

1. Navigate to your Resend dashboard
2. Go to **API Keys** section
3. Click **Create API Key**
4. Give it a name (e.g., "EVU Gaming Production")
5. Copy the API key (starts with `re_`)

### 3. Verify Domain (Optional but Recommended)

For production use, verify your domain:

1. Go to **Domains** in Resend dashboard
2. Click **Add Domain**
3. Enter your domain (e.g., `yourdomain.com`)
4. Add the provided DNS records to your domain:
   - SPF record
   - DKIM records
   - DMARC record
5. Wait for verification (usually a few minutes)

**Without domain verification:**
- Emails will be sent from `onboarding@resend.dev`
- May be marked as spam by some providers

**With domain verification:**
- Emails sent from your custom domain (e.g., `noreply@yourdomain.com`)
- Better deliverability and trust

### 4. Configure Environment Variables (Resend)

#### Local Development

Copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add:

```env
# Choose Resend as email provider
EMAIL_PROVIDER=resend

# Resend API Configuration
RESEND_API_KEY=re_your_api_key_here
EMAIL_FROM=noreply@yourdomain.com
ADMIN_EMAIL=admin@yourdomain.com
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

#### Production (Vercel)

1. Go to your Vercel project
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:

| Variable | Value | Environment |
|----------|-------|-------------|
| `EMAIL_PROVIDER` | resend | Production, Preview, Development |
| `RESEND_API_KEY` | Your Resend API key | Production, Preview, Development |
| `EMAIL_FROM` | Your sender email | Production, Preview, Development |
| `ADMIN_EMAIL` | Admin notification email | Production, Preview, Development |
| `NEXT_PUBLIC_SITE_URL` | Your site URL (e.g., https://yourdomain.com) | Production, Preview, Development |

4. Redeploy your application

---

### Option 2: SMTP Setup

Use any SMTP provider (Gmail, Outlook, SendGrid, Mailgun, etc.).

#### Gmail Setup Example

1. **Enable 2-Factor Authentication** on your Google account
2. **Create App Password:**
   - Go to Google Account → Security
   - Under "2-Step Verification", find "App passwords"
   - Select "Mail" and your device
   - Copy the 16-character password

3. **Configure Environment Variables:**

```env
# Choose SMTP as email provider
EMAIL_PROVIDER=smtp

# Gmail SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-app-password
SMTP_SECURE=false

# Shared settings
EMAIL_FROM=your-email@gmail.com
ADMIN_EMAIL=admin@yourdomain.com
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

#### Other SMTP Providers

**Outlook/Hotmail:**
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
SMTP_SECURE=false
```

**SendGrid:**
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
SMTP_SECURE=false
```

**Mailgun:**
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@your-domain.mailgun.org
SMTP_PASS=your-mailgun-smtp-password
SMTP_SECURE=false
```

**Custom SMTP (port 465 with SSL):**
```env
SMTP_HOST=mail.yourdomain.com
SMTP_PORT=465
SMTP_USER=no-reply@yourdomain.com
SMTP_PASS=your-password
SMTP_SECURE=true
```

---

## Environment Variables Explained

### `EMAIL_PROVIDER` (Optional)
- **Purpose**: Choose between 'resend' or 'smtp'
- **Options**: `resend` | `smtp`
- **Default**: `resend`
- **Note**: Determines which email service to use

### Resend Variables

#### `RESEND_API_KEY` (Required for Resend)
- **Purpose**: Authenticate with Resend API
- **Format**: `re_xxxxxxxxxxxxxxxxxxxxxxxx`
- **Security**: Keep this secret! Never commit to Git

### SMTP Variables

#### `SMTP_HOST` (Required for SMTP)
- **Purpose**: SMTP server hostname
- **Examples**: `smtp.gmail.com`, `smtp-mail.outlook.com`

#### `SMTP_PORT` (Required for SMTP)
- **Purpose**: SMTP server port
- **Common ports**: `587` (TLS), `465` (SSL), `25` (plain)
- **Default**: `587`

#### `SMTP_USER` (Required for SMTP)
- **Purpose**: SMTP authentication username
- **Usually**: Your email address

#### `SMTP_PASS` (Required for SMTP)
- **Purpose**: SMTP authentication password
- **Note**: Use App Passwords for Gmail
- **Security**: Keep this secret!

#### `SMTP_SECURE` (Optional for SMTP)
- **Purpose**: Use SSL/TLS encryption
- **Values**: `true` (port 465) or `false` (port 587)
- **Default**: `false`

### Shared Variables (Both Resend and SMTP)

#### `EMAIL_FROM` (Optional)
- **Purpose**: Sender email address for all outgoing emails
- **Format**: `noreply@yourdomain.com`
- **Default**: `noreply@yourdomain.com`
- **Note**: Must match verified domain for Resend

#### `ADMIN_EMAIL` (Optional)
- **Purpose**: Where to send admin notifications (new tickets)
- **Format**: `admin@yourdomain.com`
- **Example**: Your personal or team email
- **Note**: Admin won't receive notifications if not set

#### `NEXT_PUBLIC_SITE_URL` (Optional)
- **Purpose**: Base URL for links in emails
- **Format**: `https://yourdomain.com` (no trailing slash)
- **Local**: `http://localhost:3000`
- **Production**: Your actual domain
- **Required for**: Password reset links, ticket links, profile links

## Email Templates

All emails use the EVU Gaming branding with:
- Gradient header (cyan to magenta)
- Dark theme matching the website
- Responsive design
- Call-to-action buttons
- Professional footer

### Email Types

#### 1. Welcome Email
**Sent when:** User registers an account
**Recipient:** New user (if email provided during registration)
**Contains:**
- Welcome message
- Quick start guide
- Link to website
- Server features overview

#### 2. Ticket Created Email
**Sent when:** User submits a support ticket
**Recipient:** Ticket author (if email provided)
**Contains:**
- Ticket number for reference
- Subject and status
- Link to view ticket
- Confirmation message

#### 3. Ticket Reply Email
**Sent when:** Someone replies to a ticket
**Recipient:** Ticket author (if different from replier)
**Contains:**
- Ticket number
- Who replied (with admin badge if admin)
- Link to view conversation
- Notification that response is waiting

#### 4. Ticket Status Change Email
**Sent when:** Admin changes ticket status
**Recipient:** Ticket author
**Contains:**
- Ticket number
- New status (Open, In Progress, Closed)
- Color-coded status indicator
- Next steps guidance

#### 5. Admin Notification Email
**Sent when:** New support ticket is created
**Recipient:** Admin (configured in `ADMIN_EMAIL`)
**Contains:**
- Ticket number
- Subject and author
- Link to admin panel
- Quick access to ticket management

## Testing Emails

### Local Testing

1. Set up environment variables in `.env.local`
2. Start development server: `npm run dev`
3. Test each email type:
   - Register a new account with email
   - Create a support ticket with email
   - Reply to a ticket
   - Change ticket status

### Check Logs

Email send errors are logged to console:
```javascript
console.error('Failed to send welcome email:', emailError);
```

The application will continue working even if emails fail to send.

### Verify Delivery

1. Check your email inbox (including spam folder)
2. Check Resend dashboard → **Emails** tab
3. View send status, opens, clicks, bounces

## Troubleshooting

### Emails Not Sending

**Check API Key:**
```bash
# In your .env.local
echo $RESEND_API_KEY
```

**Check logs:**
- Look for email errors in console
- Check Vercel logs if in production

**Common Issues:**
- Invalid API key format
- API key not set in environment
- Rate limit exceeded (100/day, 3,000/month)
- Invalid sender email format

### Emails Going to Spam

**Solutions:**
1. Verify your domain in Resend
2. Add SPF, DKIM, and DMARC records
3. Use a real "from" address (not noreply@example.com)
4. Warm up your domain by sending emails gradually

### Rate Limiting

Free tier limits:
- **100 emails per day**
- **3,000 emails per month**

If exceeded, emails will fail silently. Upgrade to paid plan if needed.

## Email HTML Structure

All emails use this structure:
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    /* EVU Gaming brand colors */
    /* Dark theme (#0f1419 background) */
    /* Gradient header (cyan to magenta) */
  </style>
</head>
<body>
  <div class="container">
    <div class="header">🎮 EVU Gaming Network</div>
    <div class="content">
      <!-- Email-specific content -->
    </div>
    <div class="footer">
      © 2025 EVU Gaming Network
      <!-- Privacy notice -->
    </div>
  </div>
</body>
</html>
```

## Customization

### Change Email Colors

Edit `lib/email.js`:

```javascript
// Find the <style> section in getEmailTemplate()
:root {
  --primary: #00d4ff;   // Cyan
  --accent: #ff006e;    // Magenta
  --bg: #0f1419;        // Dark background
}
```

### Modify Email Content

Edit email functions in `lib/email.js`:
- `sendWelcomeEmail()` - Welcome message
- `sendTicketCreatedEmail()` - Ticket confirmation
- `sendTicketReplyEmail()` - Reply notification
- `sendTicketStatusEmail()` - Status change
- `sendAdminTicketNotification()` - Admin alerts

### Add New Email Types

1. Create new function in `lib/email.js`:
```javascript
async function sendYourEmail(to, data) {
  const content = `
    <h2>Your Title</h2>
    <p>Your content here</p>
  `;

  return await sendEmail(
    to,
    'Your Subject',
    getEmailTemplate(content)
  );
}
```

2. Export function:
```javascript
module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendYourEmail  // Add here
};
```

3. Import and use in API routes

## Security Best Practices

### ✅ DO:
- Keep `RESEND_API_KEY` secret
- Use environment variables
- Never commit `.env.local` to Git
- Rotate API keys periodically
- Use HTTPS for production
- Verify domain for better security

### ❌ DON'T:
- Hardcode API keys in code
- Share API keys publicly
- Use same key for dev and prod
- Send passwords in emails
- Include sensitive data in emails

## Cost Optimization

### Free Tier Optimization:
- Only send essential emails
- Don't send emails for test accounts
- Batch notifications when possible
- Use conditional sending (check if email provided)

### Upgrade When:
- Exceeding 3,000 emails/month
- Need better deliverability
- Want custom domain sending
- Need email analytics

## Resend Pricing

**Free Tier:**
- 3,000 emails/month
- 100 emails/day
- All features included

**Paid Plans (if needed):**
- **Pro**: $20/month - 50,000 emails
- **Business**: $85/month - 250,000 emails
- **Enterprise**: Custom pricing

Most small to medium gaming communities will be fine on the free tier.

## Disable Email Notifications

To disable emails without removing code:

1. Don't set `RESEND_API_KEY` in environment
2. Emails will log warnings but won't send
3. Application continues working normally

```javascript
// From lib/email.js
if (!RESEND_API_KEY) {
  console.warn('RESEND_API_KEY not configured - email not sent');
  return { success: false, error: 'Email service not configured' };
}
```

## Support

**Resend Support:**
- Documentation: [resend.com/docs](https://resend.com/docs)
- Discord: [Resend Community](https://resend.com/discord)
- Email: support@resend.com

**EVU-WEB Issues:**
- Check `lib/email.js` for email logic
- Check API routes for integration
- View console logs for errors

---

**Last Updated**: 2025-10-07
**Resend API Version**: v1
**Tested with**: Node.js 22.x, Next.js 15.5.4
