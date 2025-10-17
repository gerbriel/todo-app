# Admin Panel Updates - User Management & Settings

## Summary of Changes

### ✅ Completed

1. **Removed SQL Console** - The dangerous SQL execution interface has been completely removed from the admin panel
2. **Added Application Settings Tab** - New dedicated settings management interface
3. **Auto-Archive Setting** - Now **disabled by default** and fully configurable
4. **Cleaned UI** - Removed demo/mock data, simplified interface to Users, Settings, and Themes tabs

### 🎯 Application Settings Features

The new Settings tab includes:

- **General Settings**
  - Default board template (Kanban, Scrum, Simple)
  - Max cards per list
  - Allow guest access

- **Auto-Archive** (Disabled by default)
  - Toggle to enable/disable auto-archiving
  - Configurable days before archiving

- **Security & Authentication**
  - Require email verification
  - Password minimum length
  - Session timeout

- **Notifications**
  - Email notifications toggle

- **Maintenance Mode**
  - App-wide maintenance mode toggle

## User Invitation & Password Management

### How to Invite Users (Admin)

1. Go to Admin Panel → Users tab
2. Click "Invite User" button
3. Enter email address
4. Select role (Admin, User, or Viewer)
5. Click "Send Invitation"

**What happens:**
- Supabase automatically sends an invitation email to the user
- The email contains a secure link to set up their account
- User creates their password during signup
- Account is activated once they complete signup

### Password Reset (Admin)

Admins can send password reset emails to users:

1. Go to Admin Panel → Users tab
2. Find the user in the list
3. Click the Key icon (🔑) next to their name
4. Confirm the action

**What happens:**
- User receives a password reset email from Supabase
- Email contains a secure reset link
- User clicks link and sets new password
- Password is updated immediately

### Password Reset (User Self-Service)

Users can reset their own passwords:

1. Go to the login page
2. Click "Forgot Password?"
3. Enter email address
4. Check email for reset link
5. Click link and set new password

**Implementation needed:**
- Add "Forgot Password" link to LoginPage.tsx
- Create /reset-password route
- Use `supabase.auth.resetPasswordForEmail()`

## Supabase Auth Functions Used

### Admin Functions
```typescript
// Invite user
await supabase.auth.admin.inviteUserByEmail(email, {
  data: { role: 'user' },
  redirectTo: `${window.location.origin}/login`
})

// Send password reset
await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${window.location.origin}/reset-password`
})

// Update user role
await supabase.auth.admin.updateUserById(userId, {
  user_metadata: { role: newRole }
})

// Delete user
await supabase.auth.admin.deleteUser(userId)

// List all users
const { data } = await supabase.auth.admin.listUsers()
```

### User Functions
```typescript
// User self-service password reset
await supabase.auth.resetPasswordForEmail(email)
```

## Email Configuration in Supabase

### Required Setup

1. **Email Templates** (in Supabase Dashboard)
   - Go to Authentication → Email Templates
   - Customize the invitation email template
   - Customize the password reset email template

2. **SMTP Configuration** (for production)
   - Go to Project Settings → Auth → SMTP Settings
   - Configure custom SMTP provider (SendGrid, Mailgun, etc.)
   - Or use Supabase's default email service

3. **Redirect URLs**
   - Go to Authentication → URL Configuration
   - Add allowed redirect URLs:
     - `http://localhost:5173/login`
     - `http://localhost:5173/reset-password`
     - `https://gerbriel.github.io/todo-app/login`
     - `https://gerbriel.github.io/todo-app/reset-password`

## Next Steps

### To Complete Full User Management:

1. **Create Password Reset Page**
```typescript
// src/pages/ResetPasswordPage.tsx
import { useEffect, useState } from 'react'
import { supabase } from '@/app/supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (error) {
      alert(error.message)
    } else {
      alert('Password updated successfully!')
      navigate('/login')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold">Reset Your Password</h2>
        <form onSubmit={handlePasswordReset} className="space-y-4">
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            minLength={8}
            required
            className="w-full px-3 py-2 border rounded"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  )
}
```

2. **Add to Router**
```typescript
{ path: 'reset-password', element: <ResetPasswordPage /> }
```

3. **Update Login Page**
```typescript
<Link to="/reset-password" className="text-sm text-indigo-600 hover:underline">
  Forgot Password?
</Link>
```

## Settings Storage

Currently, settings are stored in component state (mock data). To persist:

1. **Update the save function in ApplicationSettings.tsx**
```typescript
const handleSave = async () => {
  setIsSaving(true)
  try {
    for (const setting of settings) {
      await supabase
        .from('admin_settings')
        .upsert({
          setting_key: setting.setting_key,
          setting_value: setting.setting_value,
          description: setting.description,
          updated_by: user?.id
        })
    }
    setSaveStatus({ type: 'success', message: 'Settings saved!' })
  } catch (error) {
    setSaveStatus({ type: 'error', message: 'Failed to save' })
  } finally {
    setIsSaving(false)
  }
}
```

2. **Load settings on mount**
```typescript
useEffect(() => {
  async function loadSettings() {
    const { data } = await supabase
      .from('admin_settings')
      .select('*')
    if (data) setSettings(data)
  }
  loadSettings()
}, [])
```

## Testing Checklist

- [ ] Admin can invite new users
- [ ] Invitation emails are received
- [ ] New users can set passwords via invitation link
- [ ] Admin can send password reset emails
- [ ] Users can reset their own passwords
- [ ] Settings can be changed and saved
- [ ] Auto-archive is disabled by default
- [ ] SQL Console is completely removed
- [ ] Only admins can access admin panel

## Security Notes

- All user management requires admin privileges
- Admin check: `user?.email?.includes('admin') || user?.id === 'ad146555-19f4-4eb7-8d22-9ccdedd6a917'`
- Supabase RLS policies should be configured to enforce permissions
- Password reset links expire after a set time (configurable in Supabase)
- Invitation links also have expiration
