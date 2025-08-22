# HH310 Academic Management System - Login & Authentication

## Overview
This is a comprehensive login and signup system for the HH310 Academic Management System. It provides a modern, responsive authentication interface with role-based access control.

## Features

### 🔐 Authentication Features
- **Login System**: Secure user authentication with email/password
- **Signup System**: New user registration with role selection
- **Password Security**: Password strength indicator and validation
- **Password Reset**: Forgot password functionality
- **Remember Me**: Session persistence option
- **Profile Setup**: Complete profile after signup

### 🎨 UI/UX Features
- **Modern Design**: Clean, professional interface
- **Dark/Light Mode**: Theme toggle functionality
- **Responsive Layout**: Mobile-first design
- **Animated Background**: Dynamic gradient background
- **Form Validation**: Real-time input validation
- **Loading States**: User feedback during operations
- **Error Handling**: Comprehensive error messages
- **Accessibility**: Keyboard navigation and screen reader support

### 👥 Role-Based System
- **Student Role**: Access to student dashboard and features
- **Faculty Role**: Access to teacher tools and management
- **Admin Role**: Full system administration access

## Files Structure

```
home page/
├── login.html          # Main login/signup page
├── login.css           # Styling for login page
├── login.js            # Authentication logic
├── home.html           # Main dashboard (protected)
├── home.css            # Dashboard styling
└── home.js             # Dashboard functionality
```

## Demo Accounts

For testing purposes, use these demo accounts:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@hh310.edu | admin123 |
| Faculty | teacher@hh310.edu | teacher123 |
| Student | student@hh310.edu | student123 |

## Getting Started

### 1. Access the Login Page
Open `login.html` in your browser to start using the system.

### 2. Login Process
1. Enter your email and password
2. Click "Sign In"
3. You'll be redirected to the appropriate dashboard based on your role

### 3. Signup Process
1. Click "Create Account" on the login page
2. Fill in your details (name, email, role, etc.)
3. Create a secure password
4. Complete your profile setup
5. Access your dashboard

### 4. Navigation
- From the dashboard, click "Logout" in the user menu to return to login
- The system remembers your session if you check "Remember me"

## Technical Implementation

### Authentication Flow
1. **Login**: Validates credentials → Creates session → Redirects to dashboard
2. **Signup**: Creates account → Profile setup → Session creation → Dashboard redirect
3. **Session Management**: Token-based authentication with localStorage/sessionStorage
4. **Role Redirect**: Automatic redirection based on user role

### Security Features
- Password strength validation
- Email format validation
- CSRF protection ready
- Session timeout handling
- Secure token storage

### Responsive Design
- Mobile-first approach
- Tablet and desktop optimizations
- Touch-friendly interface
- Adaptive layouts

## Integration with Supabase

The system is designed to be easily integrated with Supabase. Replace the simulation functions in `login.js` with actual Supabase calls:

```javascript
// Replace simulateLogin with:
const { data, error } = await supabase.auth.signInWithPassword({
  email: email,
  password: password
})

// Replace simulateSignup with:
const { data, error } = await supabase.auth.signUp({
  email: email,
  password: password,
  options: {
    data: {
      first_name: firstName,
      last_name: lastName,
      role: role
    }
  }
})

// Replace simulateForgotPassword with:
const { data, error } = await supabase.auth.resetPasswordForEmail(email)
```

## Customization

### Themes
- Modify CSS variables in `login.css` to change colors
- Add new themes by extending the `[data-theme]` selectors

### Roles
- Add new roles in the signup form select options
- Update role-based redirects in `login.js`
- Modify dashboard access in `home.js`

### Validation
- Extend validation rules in the `validateField` function
- Add custom validation for specific requirements

## Browser Support
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## Keyboard Shortcuts
- `Alt + L`: Switch to login form
- `Alt + S`: Switch to signup form
- `Escape`: Close modals
- `Tab`: Navigate between form fields

## Accessibility Features
- ARIA labels and roles
- Keyboard navigation
- Screen reader support
- High contrast mode support
- Focus indicators
- Reduced motion support

## Performance Optimizations
- CSS animations with GPU acceleration
- Lazy loading of non-critical resources
- Optimized image assets
- Minified and compressed code ready

## Future Enhancements
- [ ] Social login (Google, GitHub, etc.)
- [ ] Two-factor authentication
- [ ] Biometric authentication
- [ ] Single Sign-On (SSO)
- [ ] Advanced password policies
- [ ] Audit logging
- [ ] Rate limiting
- [ ] Advanced session management

## Support
For questions or issues, please refer to the main project documentation or contact the development team.

---

**Note**: This is a demo implementation. For production use, ensure proper security measures, use HTTPS, implement proper backend validation, and follow security best practices.
