# Database Security & Password Management

## Overview

The admin panel now uses **SQLite database** with **bcrypt password hashing** for secure authentication instead of storing passwords in files.

## Features

### 🔒 Secure Password Storage
- Passwords are hashed using bcrypt with 10 salt rounds
- No plain-text passwords stored anywhere
- Database-backed session management

### ⚠️ Default Password Protection
- System creates a default admin account on first run
  - Username: `admin`
  - Password: `admin123`
- **You are REQUIRED to change the default password on first login**
- System will show a modal forcing password change
- Cannot dismiss without changing password or logging out

### 🔐 Password Requirements
- Minimum 8 characters
- Cannot be the same as the default password (`admin123`)
- Must match confirmation field

## Database Schema

The system uses SQLite with two main tables:

### `admins` table
- `id` - Primary key
- `username` - Admin username (unique)
- `password_hash` - Bcrypt hashed password
- `is_default_password` - Flag indicating if using default password
- `created_at` - Account creation timestamp
- `updated_at` - Last password change timestamp

### `sessions` table
- `id` - Session ID (random hex string)
- `admin_id` - Foreign key to admins table
- `created_at` - Session creation time
- `expires_at` - Session expiration time (24 hours)

## File Locations

- **Database**: `data/admin.db`
- **Database Config**: `lib/database.js`
- **Auth Logic**: `lib/auth.js`

The database file is automatically created on first run and is excluded from git via `.gitignore`.

## First Time Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the server:**
   ```bash
   npm run dev
   ```

3. **Navigate to admin panel:**
   - Open http://localhost:3000/admin
   - Login with default credentials: `admin` / `admin123`

4. **Change password immediately:**
   - System will display a modal requiring password change
   - Enter a secure password (min 8 characters)
   - Confirm the password
   - Click "Change Password"

5. **You're secure!**
   - Default password flag is cleared
   - Your new password is securely hashed in the database
   - You can now access the admin panel normally

## Password Management

### Changing Password Later

Even after initial setup, you can change your password anytime:

1. Login to admin panel
2. Click "Change Password" button in the header
3. Enter new password and confirmation
4. Submit

### Password Security Indicators

- If using default password: **⚠️ Using default password** appears in the header
- Once changed: Indicator disappears

## Session Management

- Sessions expire after 24 hours
- Expired sessions are automatically cleaned up
- Logging out destroys the session immediately
- Sessions are stored in database (not memory)
- Sessions persist across server restarts

## Security Best Practices

### ✅ DO:
- Change the default password immediately
- Use a strong, unique password
- Keep the database file secure
- Back up `data/admin.db` regularly
- Use HTTPS in production

### ❌ DON'T:
- Share your admin password
- Use the default password in production
- Commit `data/admin.db` to git (already in .gitignore)
- Use simple passwords like "password123"

## API Endpoints

### Login
```
POST /api/login
Body: { "password": "your-password" }
Response: { "success": true, "isDefaultPassword": boolean }
```

### Change Password
```
POST /api/change-password
Body: { "newPassword": "...", "confirmPassword": "..." }
Response: { "success": true }
```

### Check Auth
```
GET /api/auth/check
Response: { "authenticated": boolean, "isDefaultPassword": boolean }
```

### Logout
```
POST /api/logout
Response: { "success": true }
```

## Troubleshooting

### "Invalid credentials" error
- Make sure you're using the correct password
- If you forgot the password, delete `data/admin.db` to reset (loses all settings)

### Database locked error
- Make sure only one instance of the server is running
- Close any database browser tools accessing the file

### Can't access admin panel
- Ensure server is running (`npm run dev`)
- Check console for errors
- Try clearing browser cookies

### Reset to Default

If you need to reset everything:

1. Stop the server
2. Delete `data/admin.db`
3. Restart the server
4. Default admin account will be recreated
5. Change the password again

## Migration from Old System

If you were using the old system (password in `lib/auth.js`):

1. The new system automatically creates the database
2. Old sessions won't work (users need to re-login)
3. Default password is `admin123` (must be changed)
4. No manual migration needed

## Advanced: Adding More Admins

Currently, the system supports one admin account. To add multiple admins:

1. Modify `lib/database.js` to add a registration function
2. Create a new API route for admin creation
3. Update the admin panel to include user management
4. Consider adding role-based permissions

## Dependencies

- **better-sqlite3**: Fast, synchronous SQLite database
- **bcrypt**: Industry-standard password hashing
- **crypto**: Built-in Node.js module for session IDs

## Performance

- Database is file-based (no separate server needed)
- Bcrypt hashing is intentionally slow (security feature)
- Sessions are indexed for fast lookups
- Automatic cleanup of expired sessions

## Backup & Recovery

### Backing Up
```bash
# Copy the database file
cp data/admin.db data/admin.db.backup
```

### Restoring
```bash
# Stop the server first
cp data/admin.db.backup data/admin.db
# Restart the server
```

### Export Credentials (Emergency)
If you need to backup the admin password hash:
```bash
# Install sqlite3 CLI tool
# Then run:
sqlite3 data/admin.db "SELECT * FROM admins;"
```

## Production Deployment

For production environments:

1. Use environment variables for sensitive data
2. Enable HTTPS (required for secure cookies)
3. Set `cookie: { secure: true }` in session config
4. Consider using a more robust database (PostgreSQL, MySQL)
5. Implement rate limiting on login attempts
6. Add 2FA for extra security
7. Regular database backups
8. Monitor for suspicious login attempts
