# GDPR Compliance Guide

## Overview
This guide explains the GDPR-compliant data management features built into the EVU-WEB platform, allowing users to exercise their data rights.

---

## User Data Rights

### 1. Right to Access (Data Export)

Users can download all their personal data in JSON format.

**How to Use:**
1. Log in to your account at `/profile`
2. Navigate to the "Privacy & Data" section
3. Click "📥 Download My Data"
4. A JSON file will be downloaded with all your information

**What's Included in the Export:**
- User information (username, email, display name, bio, avatar URL)
- Account metadata (creation date, last update, role)
- Active sessions information
- Data usage and legal basis
- Your GDPR rights explained

**Export Format:**
```json
{
  "export_date": "2025-01-15T10:30:00.000Z",
  "export_type": "GDPR Data Request",
  "user_information": {
    "id": "uuid",
    "username": "johndoe",
    "email": "john@example.com",
    "display_name": "John Doe",
    "bio": "...",
    "avatar_url": "...",
    "role": "user",
    "created_at": "...",
    "updated_at": "..."
  },
  "active_sessions": [...],
  "data_usage": {...},
  "your_rights": {...}
}
```

**Security:**
- Password hashes are redacted for security
- Only accessible when logged in
- Requires valid session

---

### 2. Right to Erasure (Account Deletion)

Users can permanently delete their account and all associated data.

**How to Use:**
1. Log in to your account at `/profile`
2. Navigate to the "Privacy & Data" section
3. Click "🗑️ Delete Account" in the Danger Zone
4. Confirm by:
   - Entering your exact username
   - Entering your password
5. Click "Delete Forever"

**What Gets Deleted:**
- ✅ User profile (username, email, display name, bio)
- ✅ All active sessions (automatic logout)
- ✅ Profile avatar from storage (if uploaded)
- ✅ All personal information from database
- ✅ Account creation and update records

**Important Notes:**
- ⚠️ **This action is PERMANENT and IRREVERSIBLE**
- ⚠️ There is no way to recover your account after deletion
- ⚠️ Last admin cannot delete their account (must create another admin first)
- ⚠️ You will be immediately logged out and redirected to homepage

**Security Measures:**
- Requires username confirmation (exact match)
- Requires current password verification
- Double confirmation modal
- Prevents last admin deletion
- Cascading deletion of all related data

---

## GDPR Rights Implemented

### ✅ Right to Access
Users can download their data at any time via the "Download My Data" button.

### ✅ Right to Rectification
Users can update their profile information at any time:
- Display name
- Email address
- Bio
- Avatar

### ✅ Right to Erasure
Users can permanently delete their account and all data via the "Delete Account" feature.

### ✅ Right to Data Portability
Data export is provided in standard JSON format for easy portability.

### ✅ Right to Be Informed
- Cookie consent banner on first visit
- Privacy policy accessible from cookie banner
- Clear data usage information in exports
- Transparent about data storage (Supabase)

### ⚠️ Right to Object & Withdraw Consent
Users can delete their account to withdraw consent. For specific objections, contact the administrator.

---

## Data Controller Information

**Service**: EVU Gaming Network
**Platform**: EVU-WEB
**Data Storage**: Supabase (PostgreSQL)
**Data Location**: EU/US (depending on Supabase region)

**Data Collected:**
- Username (required for authentication)
- Password hash (bcrypt, 10 rounds)
- Email (optional, user-provided)
- Display name (optional, user-provided)
- Bio (optional, user-provided)
- Avatar URL/image (optional, user-uploaded)
- Account creation date
- Last update date
- Session information (expires after 24 hours)

**Legal Basis:**
- GDPR Article 6.1.a - Consent
- Users provide consent by creating an account

**Retention Policy:**
- Data retained until account deletion
- Sessions auto-expire after 24 hours
- Expired sessions cleaned up hourly

**Third-Party Sharing:**
- None - all data stored in Supabase
- Supabase is GDPR-compliant data processor

---

## API Endpoints

### GET `/api/profile/export-data`
**Purpose**: Export user data
**Authentication**: Required (valid session)
**Response**: JSON file download
**Security**: Password hashes redacted

### DELETE `/api/profile/delete-account`
**Purpose**: Permanently delete account
**Authentication**: Required (valid session)
**Request Body**:
```json
{
  "confirmUsername": "username",
  "confirmPassword": "password"
}
```
**Response**: Success or error message
**Side Effects**:
- Deletes user from database
- Deletes all sessions
- Deletes avatar from storage
- Clears session cookie

---

## Admin Considerations

### Preventing Last Admin Deletion
The system prevents the last admin account from being deleted to ensure platform access.

**How it works:**
1. Before deletion, count total admin accounts
2. If deleting user is admin and count ≤ 1, prevent deletion
3. Return error: "Cannot delete the last admin account. Please create another admin first."

**Best Practice:**
- Always maintain at least 2 admin accounts
- Create a backup admin before deleting your admin account
- Use the Users tab in admin panel to create additional admins

### Data Cleanup
When a user deletes their account:
- Avatar images in Supabase Storage are automatically deleted
- Database records are removed
- Sessions are invalidated
- No manual cleanup required

---

## Compliance Checklist

### ✅ User Rights
- [x] Right to access data
- [x] Right to rectify data
- [x] Right to delete data
- [x] Right to data portability
- [x] Right to be informed

### ✅ Data Protection
- [x] Passwords hashed with bcrypt
- [x] Secure session management
- [x] HTTPS enforced (on Vercel)
- [x] HttpOnly cookies
- [x] SameSite cookie protection

### ✅ Transparency
- [x] Privacy policy available
- [x] Cookie consent banner
- [x] Data usage disclosure
- [x] Clear retention policies

### ✅ User Control
- [x] Self-service data export
- [x] Self-service account deletion
- [x] Profile update capabilities
- [x] Session management

---

## Testing

### Test Data Export
1. Create a test user account
2. Add profile information (email, bio, avatar)
3. Log in and navigate to `/profile`
4. Click "Download My Data"
5. Verify JSON file downloads with correct data
6. Check that password is redacted

### Test Account Deletion
1. Create a test user account (not admin)
2. Add some profile data
3. Log in and navigate to `/profile`
4. Click "Delete Account"
5. Try incorrect username → Should fail
6. Try incorrect password → Should fail
7. Enter correct credentials → Should succeed
8. Verify redirect to homepage
9. Try logging in again → Should fail
10. Check database → User should be gone

### Test Last Admin Protection
1. Ensure only one admin exists
2. Try to delete that admin account
3. Should receive error about being last admin
4. Create another admin
5. Now deletion should work

---

## Troubleshooting

**"Cannot delete the last admin account"**
- Create another admin user first
- Go to `/admin` → Users tab
- Create a new user with "admin" role
- Then retry deletion

**Export fails with 401 error**
- Ensure you're logged in
- Check session hasn't expired
- Try logging out and back in

**Deletion fails with "Username does not match"**
- Username is case-sensitive
- Must match exactly
- Check for extra spaces

**Avatar not deleted from storage**
- Check Supabase Storage manually
- The API attempts deletion but continues even if it fails
- This is a non-critical error

---

## Future Enhancements

### Potential Improvements
- [ ] Email confirmation before deletion
- [ ] Cooling-off period (e.g., 30 days to restore)
- [ ] Export history/activity logs
- [ ] Automated data cleanup jobs
- [ ] GDPR request logging
- [ ] Admin dashboard for GDPR requests
- [ ] Bulk data export for admins
- [ ] Data anonymization option (instead of deletion)

---

## Resources

- [GDPR Official Text](https://gdpr-info.eu/)
- [ICO Guide to GDPR](https://ico.org.uk/for-organisations/guide-to-data-protection/guide-to-the-general-data-protection-regulation-gdpr/)
- [Supabase GDPR Compliance](https://supabase.com/docs/guides/platform/gdpr)
- [Next.js Security Best Practices](https://nextjs.org/docs/advanced-features/security-headers)

---

**Last Updated**: 2025-01-15
**Version**: 1.0.0
**Compliance Standard**: GDPR (EU Regulation 2016/679)
