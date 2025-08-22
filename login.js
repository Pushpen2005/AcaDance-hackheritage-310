// Login Page JavaScript - HH310 Academic System
// Integrated with Supabase Authentication

class AuthManager {
  constructor() {
    this.currentUser = null;
    this.currentTheme = localStorage.getItem('theme') || 'light';
    this.supabase = window.supabaseClient;
    this.init();
  }

  init() {
    this.setupTheme();
    this.setupEventListeners();
    this.setupFormValidation();
    this.checkExistingSession();
    this.showInitialForm();
    this.setupAuthStateListener();
  }

  // Setup auth state listener
  setupAuthStateListener() {
    if (this.supabase) {
      this.supabase.auth.onAuthStateChange((event, session) => {
        console.log('Auth state changed:', event, session);
        
        if (event === 'SIGNED_IN' && session) {
          this.currentUser = session.user;
          console.log('User signed in:', this.currentUser);
        } else if (event === 'SIGNED_OUT') {
          this.currentUser = null;
          console.log('User signed out');
        }
      });
    }
  }

  // Theme Management
  setupTheme() {
    document.documentElement.setAttribute('data-theme', this.currentTheme);
    const themeIcon = document.querySelector('#theme-toggle-btn i');
    if (themeIcon) {
      themeIcon.className = this.currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
  }

  toggleTheme() {
    this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', this.currentTheme);
    this.setupTheme();
    
    // Add smooth transition effect
    document.body.style.transition = 'all 0.3s ease';
    setTimeout(() => {
      document.body.style.transition = '';
    }, 300);
  }

  // Event Listeners Setup
  setupEventListeners() {
    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle-btn');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => this.toggleTheme());
    }

    // Form switching
    document.querySelectorAll('.switch-form').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = e.target.getAttribute('data-target');
        this.switchForm(target);
      });
    });

    // Forgot password link
    const forgotLink = document.getElementById('forgot-password-link');
    if (forgotLink) {
      forgotLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.switchForm('forgot-password');
      });
    }

    // Password toggles
    this.setupPasswordToggles();

    // Form submissions
    this.setupFormSubmissions();

    // Role-based field display
    this.setupRoleBasedFields();

    // Photo upload
    this.setupPhotoUpload();

    // Password strength checker
    this.setupPasswordStrength();

    // Modal events
    this.setupModalEvents();
  }

  setupPasswordToggles() {
    document.querySelectorAll('.password-toggle').forEach(toggle => {
      toggle.addEventListener('click', (e) => {
        e.preventDefault();
        const input = toggle.parentElement.querySelector('input');
        const icon = toggle.querySelector('i');
        
        if (input.type === 'password') {
          input.type = 'text';
          icon.className = 'fas fa-eye-slash';
        } else {
          input.type = 'password';
          icon.className = 'fas fa-eye';
        }
      });
    });
  }

  setupFormSubmissions() {
    // Login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleLogin();
      });
    }

    // Signup form
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
      signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSignup();
      });
    }

    // Profile setup form
    const profileForm = document.getElementById('profile-setup-form');
    if (profileForm) {
      profileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleProfileSetup();
      });
    }

    // Forgot password form
    const forgotForm = document.getElementById('forgot-password-form');
    if (forgotForm) {
      forgotForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleForgotPassword();
      });
    }

    // Skip profile setup
    const skipBtn = document.getElementById('skip-profile-btn');
    if (skipBtn) {
      skipBtn.addEventListener('click', () => {
        this.completeAuthentication();
      });
    }
  }

  setupRoleBasedFields() {
    const roleSelect = document.getElementById('signup-role');
    const departmentGroup = document.getElementById('department-group');
    
    if (roleSelect && departmentGroup) {
      roleSelect.addEventListener('change', (e) => {
        const role = e.target.value;
        if (role === 'student' || role === 'faculty') {
          departmentGroup.style.display = 'block';
          departmentGroup.querySelector('select').required = true;
        } else {
          departmentGroup.style.display = 'none';
          departmentGroup.querySelector('select').required = false;
        }
      });
    }

    // Profile setup role-based fields
    const setupRoleFields = () => {
      const role = localStorage.getItem('tempUserRole');
      const studentFields = document.getElementById('student-fields');
      const facultyFields = document.getElementById('faculty-fields');
      
      if (studentFields && facultyFields) {
        if (role === 'student') {
          studentFields.style.display = 'block';
        } else if (role === 'faculty') {
          facultyFields.style.display = 'block';
        }
      }
    };

    // Call this when profile setup is shown
    setTimeout(setupRoleFields, 100);
  }

  setupPhotoUpload() {
    const photoUploadBtn = document.getElementById('photo-upload-btn');
    const photoInput = document.getElementById('profile-photo');
    const photoPreview = document.getElementById('photo-preview');

    if (photoUploadBtn && photoInput && photoPreview) {
      photoUploadBtn.addEventListener('click', () => {
        photoInput.click();
      });

      photoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            photoPreview.innerHTML = `<img src="${e.target.result}" alt="Profile Photo">`;
          };
          reader.readAsDataURL(file);
        }
      });
    }
  }

  setupPasswordStrength() {
    const passwordInput = document.getElementById('signup-password');
    const strengthIndicator = document.getElementById('password-strength');

    if (passwordInput && strengthIndicator) {
      passwordInput.addEventListener('input', (e) => {
        const password = e.target.value;
        const strength = this.calculatePasswordStrength(password);
        
        strengthIndicator.className = 'password-strength';
        const strengthText = strengthIndicator.querySelector('.strength-text');
        
        if (password.length === 0) {
          strengthText.textContent = 'Password strength';
          return;
        }

        if (strength.score < 30) {
          strengthIndicator.classList.add('strength-weak');
          strengthText.textContent = 'Weak password';
        } else if (strength.score < 70) {
          strengthIndicator.classList.add('strength-medium');
          strengthText.textContent = 'Medium strength';
        } else {
          strengthIndicator.classList.add('strength-strong');
          strengthText.textContent = 'Strong password';
        }
      });
    }
  }

  calculatePasswordStrength(password) {
    let score = 0;
    const feedback = [];

    // Length check
    if (password.length >= 8) score += 20;
    else feedback.push('At least 8 characters');

    // Uppercase check
    if (/[A-Z]/.test(password)) score += 20;
    else feedback.push('Include uppercase letter');

    // Lowercase check
    if (/[a-z]/.test(password)) score += 20;
    else feedback.push('Include lowercase letter');

    // Number check
    if (/\d/.test(password)) score += 20;
    else feedback.push('Include a number');

    // Special character check
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 20;
    else feedback.push('Include special character');

    return { score, feedback };
  }

  setupModalEvents() {
    const successModal = document.getElementById('success-modal');
    const redirectBtn = document.getElementById('success-redirect-btn');

    if (redirectBtn) {
      redirectBtn.addEventListener('click', () => {
        successModal.classList.add('hidden');
        this.completeAuthentication();
      });
    }

    // Close modal on backdrop click
    if (successModal) {
      successModal.addEventListener('click', (e) => {
        if (e.target === successModal) {
          successModal.classList.add('hidden');
        }
      });
    }
  }

  // Form Validation
  setupFormValidation() {
    // Real-time validation
    document.querySelectorAll('.form-control').forEach(input => {
      input.addEventListener('blur', () => {
        this.validateField(input);
      });

      input.addEventListener('input', () => {
        if (input.classList.contains('error')) {
          this.validateField(input);
        }
      });
    });

    // Confirm password validation
    const confirmPassword = document.getElementById('signup-confirm-password');
    const password = document.getElementById('signup-password');
    
    if (confirmPassword && password) {
      confirmPassword.addEventListener('input', () => {
        this.validatePasswordMatch();
      });
      
      password.addEventListener('input', () => {
        if (confirmPassword.value) {
          this.validatePasswordMatch();
        }
      });
    }
  }

  validateField(field) {
    const value = field.value.trim();
    const fieldName = field.id.replace(/^(login|signup|forgot|profile)-/, '');
    let isValid = true;
    let errorMessage = '';

    // Clear previous error
    this.clearFieldError(field);

    // Required validation
    if (field.required && !value) {
      isValid = false;
      errorMessage = 'This field is required';
    }

    // Email validation
    if (fieldName.includes('email') && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        isValid = false;
        errorMessage = 'Please enter a valid email address';
      }
    }

    // Password validation
    if (fieldName === 'password' && value) {
      if (value.length < 8) {
        isValid = false;
        errorMessage = 'Password must be at least 8 characters';
      }
    }

    // Name validation
    if ((fieldName.includes('name') || fieldName === 'first-name' || fieldName === 'last-name') && value) {
      if (value.length < 2) {
        isValid = false;
        errorMessage = 'Name must be at least 2 characters';
      }
    }

    if (!isValid) {
      this.showFieldError(field, errorMessage);
    }

    return isValid;
  }

  validatePasswordMatch() {
    const password = document.getElementById('signup-password');
    const confirmPassword = document.getElementById('signup-confirm-password');
    
    if (password && confirmPassword) {
      if (confirmPassword.value && password.value !== confirmPassword.value) {
        this.showFieldError(confirmPassword, 'Passwords do not match');
        return false;
      } else {
        this.clearFieldError(confirmPassword);
        return true;
      }
    }
    return true;
  }

  showFieldError(field, message) {
    field.classList.add('error');
    const errorElement = document.getElementById(field.id + '-error');
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.classList.add('show');
    }
  }

  clearFieldError(field) {
    field.classList.remove('error');
    const errorElement = document.getElementById(field.id + '-error');
    if (errorElement) {
      errorElement.textContent = '';
      errorElement.classList.remove('show');
    }
  }

  validateForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return false;

    let isValid = true;
    const inputs = form.querySelectorAll('.form-control[required]');
    
    inputs.forEach(input => {
      if (!this.validateField(input)) {
        isValid = false;
      }
    });

    // Additional validations
    if (formId === 'signup-form') {
      if (!this.validatePasswordMatch()) {
        isValid = false;
      }

      // Terms agreement
      const termsCheckbox = document.getElementById('terms-agreement');
      if (termsCheckbox && !termsCheckbox.checked) {
        this.showAlert('signup-alert', 'Please agree to the Terms of Service and Privacy Policy', 'error');
        isValid = false;
      }
    }

    return isValid;
  }

  // Form Switching
  switchForm(targetForm) {
    // Hide all forms
    document.querySelectorAll('.form-container').forEach(container => {
      container.classList.remove('active');
    });

    // Show target form
    const targetContainer = document.getElementById(`${targetForm}-form-container`) || 
                           document.getElementById(`${targetForm}-container`);
    
    if (targetContainer) {
      setTimeout(() => {
        targetContainer.classList.add('active');
        targetContainer.classList.add('fade-in');
      }, 150);
    }

    // Clear any alerts
    this.clearAllAlerts();
  }

  showInitialForm() {
    // Check URL parameters for form to show
    const urlParams = new URLSearchParams(window.location.search);
    const formParam = urlParams.get('form');
    
    if (formParam === 'signup') {
      this.switchForm('signup');
    } else {
      this.switchForm('login');
    }
  }

  // Authentication Handlers
  async handleLogin() {
    if (!this.validateForm('login-form')) return;

    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const rememberMe = document.getElementById('remember-me').checked;

    this.setButtonLoading('login-btn', true);
    this.clearAlert('login-alert');

    try {
      // Supabase authentication
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email: email,
        password: password
      });
      
      if (error) {
        this.showAlert('login-alert', this.getAuthErrorMessage(error), 'error');
        return;
      }
      
      if (data.user) {
        this.currentUser = data.user;
        
        // Get user profile to determine role
        const { data: profile, error: profileError } = await this.supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          this.showAlert('login-alert', 'Profile not found. Please contact support.', 'error');
          return;
        }

        // Store session preference
        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true');
        } else {
          localStorage.removeItem('rememberMe');
        }

        this.showAlert('login-alert', 'Login successful! Redirecting...', 'success');
        
        setTimeout(() => {
          this.redirectToDashboard(profile.role);
        }, 1500);
      }
    } catch (error) {
      console.error('Login error:', error);
      this.showAlert('login-alert', 'An unexpected error occurred. Please try again.', 'error');
    } finally {
      this.setButtonLoading('login-btn', false);
    }
  }

  async handleSignup() {
    if (!this.validateForm('signup-form')) return;

    const formData = {
      firstName: document.getElementById('signup-first-name').value.trim(),
      lastName: document.getElementById('signup-last-name').value.trim(),
      email: document.getElementById('signup-email').value.trim(),
      role: document.getElementById('signup-role').value,
      department: document.getElementById('signup-department').value,
      password: document.getElementById('signup-password').value
    };

    this.setButtonLoading('signup-btn', true);
    this.clearAlert('signup-alert');

    try {
      // Supabase sign up
      const { data, error } = await this.supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            full_name: `${formData.firstName} ${formData.lastName}`,
            role: formData.role,
            department: formData.department
          }
        }
      });
      
      if (error) {
        this.showAlert('signup-alert', this.getAuthErrorMessage(error), 'error');
        return;
      }
      
      if (data.user) {
        // Create profile record
        const { error: profileError } = await this.supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            email: formData.email,
            first_name: formData.firstName,
            last_name: formData.lastName,
            full_name: `${formData.firstName} ${formData.lastName}`,
            role: formData.role,
            department: formData.department
          });

        if (profileError) {
          console.error('Error creating profile:', profileError);
        }

        // Store temporary data for profile setup
        localStorage.setItem('tempUserId', data.user.id);
        localStorage.setItem('tempUserRole', formData.role);
        
        if (data.user.email_confirmed_at) {
          // Email is already confirmed, go to profile setup
          this.showSuccessModal(
            'Account Created!',
            'Your account has been created successfully. Please complete your profile.'
          );
          
          setTimeout(() => {
            this.hideSuccessModal();
            this.switchForm('profile-setup');
          }, 2000);
        } else {
          // Email confirmation required
          this.showAlert('signup-alert', 
            'Account created! Please check your email and click the confirmation link to continue.', 
            'success'
          );
        }
      }
    } catch (error) {
      console.error('Signup error:', error);
      this.showAlert('signup-alert', 'An unexpected error occurred. Please try again.', 'error');
    } finally {
      this.setButtonLoading('signup-btn', false);
    }
  }

  async handleProfileSetup() {
    const bio = document.getElementById('profile-bio').value.trim();
    const profilePhoto = document.getElementById('profile-photo').files[0];
    const role = localStorage.getItem('tempUserRole');
    const userId = localStorage.getItem('tempUserId');
    
    let roleSpecificData = {};
    if (role === 'student') {
      roleSpecificData.studentId = document.getElementById('profile-student-id').value.trim();
    } else if (role === 'faculty') {
      roleSpecificData.employeeId = document.getElementById('profile-employee-id').value.trim();
    }

    this.setButtonLoading('profile-setup-btn', true);
    this.clearAlert('profile-alert');

    try {
      let avatarUrl = null;

      // Upload profile photo if provided
      if (profilePhoto) {
        const fileExt = profilePhoto.name.split('.').pop();
        const fileName = `${userId}/avatar.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await this.supabase.storage
          .from('avatars')
          .upload(fileName, profilePhoto, { upsert: true });

        if (uploadError) {
          console.error('Error uploading avatar:', uploadError);
        } else {
          const { data: urlData } = this.supabase.storage
            .from('avatars')
            .getPublicUrl(fileName);
          avatarUrl = urlData.publicUrl;
        }
      }

      // Update profile
      const { error: profileError } = await this.supabase
        .from('profiles')
        .update({
          bio: bio,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (profileError) {
        console.error('Error updating profile:', profileError);
        this.showAlert('profile-alert', 'Error updating profile. Please try again.', 'error');
        return;
      }

      // Create role-specific record
      if (role === 'student' && roleSpecificData.studentId) {
        const { error: studentError } = await this.supabase
          .from('students')
          .upsert({
            id: userId,
            student_id: roleSpecificData.studentId
          });
        
        if (studentError) {
          console.error('Error creating student record:', studentError);
        }
      } else if (role === 'faculty' && roleSpecificData.employeeId) {
        const { error: facultyError } = await this.supabase
          .from('faculty')
          .upsert({
            id: userId,
            employee_id: roleSpecificData.employeeId
          });
        
        if (facultyError) {
          console.error('Error creating faculty record:', facultyError);
        }
      } else if (role === 'admin') {
        const { error: adminError } = await this.supabase
          .from('admins')
          .upsert({
            id: userId,
            admin_level: 'standard'
          });
        
        if (adminError) {
          console.error('Error creating admin record:', adminError);
        }
      }

      this.showAlert('profile-alert', 'Profile completed successfully!', 'success');
      setTimeout(() => {
        this.completeAuthentication();
      }, 1500);
      
    } catch (error) {
      console.error('Profile setup error:', error);
      this.showAlert('profile-alert', 'An unexpected error occurred. Please try again.', 'error');
    } finally {
      this.setButtonLoading('profile-setup-btn', false);
    }
  }

  async handleForgotPassword() {
    if (!this.validateForm('forgot-password-form')) return;

    const email = document.getElementById('forgot-email').value.trim();

    this.setButtonLoading('forgot-btn', true);
    this.clearAlert('forgot-alert');

    try {
      // Supabase password reset
      const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login.html?reset=true`
      });
      
      if (error) {
        this.showAlert('forgot-alert', this.getAuthErrorMessage(error), 'error');
        return;
      }
      
      this.showAlert('forgot-alert', 'Password reset instructions sent to your email!', 'success');
      setTimeout(() => {
        this.switchForm('login');
      }, 3000);
      
    } catch (error) {
      console.error('Forgot password error:', error);
      this.showAlert('forgot-alert', 'An unexpected error occurred. Please try again.', 'error');
    } finally {
      this.setButtonLoading('forgot-btn', false);
    }
  }

  // Helper method to get user-friendly error messages
  getAuthErrorMessage(error) {
    const errorMessages = {
      'Invalid login credentials': 'Invalid email or password. Please check your credentials and try again.',
      'Email not confirmed': 'Please check your email and click the confirmation link before signing in.',
      'User already registered': 'An account with this email already exists. Please sign in instead.',
      'Password should be at least 6 characters': 'Password must be at least 6 characters long.',
      'Invalid email': 'Please enter a valid email address.',
      'Signup disabled': 'New account registration is currently disabled.',
      'Too many requests': 'Too many attempts. Please wait a few minutes before trying again.'
    };

    return errorMessages[error.message] || error.message || 'An error occurred. Please try again.';
  }

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Check if Supabase is available
  if (!window.supabaseClient) {
    console.error('❌ Supabase client not initialized. Please check your configuration.');
    document.body.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; height: 100vh; background: #f3f4f6; color: #374151; flex-direction: column; gap: 1rem; padding: 2rem; text-align: center;">
        <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #f59e0b;"></i>
        <h2 style="margin: 0; color: #1f2937;">Supabase Configuration Required</h2>
        <p style="margin: 0; max-width: 600px; line-height: 1.6;">
          Please configure your Supabase credentials in <code>supabase-config.js</code> before using the authentication system.
          Check the browser console for detailed setup instructions.
        </p>
        <button onclick="location.reload()" style="background: #3b82f6; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; margin-top: 1rem;">
          Reload Page
        </button>
      </div>
    `;
    return;
  }

  // Initialize auth manager
  window.authManager = new AuthManager();

  // Handle password reset from email link
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('reset') === 'true') {
    window.authManager.handlePasswordReset();
  }

  console.log('🚀 HH310 Supabase Authentication System Initialized');
  console.log('📧 Create an account or use your Supabase auth credentials');

  // Add keyboard shortcuts
  document.addEventListener('keydown', function(e) {
    // Alt + L to focus login email
    if (e.altKey && e.key === 'l') {
      e.preventDefault();
      const loginEmail = document.getElementById('login-email');
      if (loginEmail && !loginEmail.closest('.form-container').classList.contains('active')) {
        window.authManager.switchForm('login');
      }
      setTimeout(() => {
        const currentEmail = document.getElementById('login-email');
        if (currentEmail) currentEmail.focus();
      }, 200);
    }
    
    // Alt + S to focus signup
    if (e.altKey && e.key === 's') {
      e.preventDefault();
      window.authManager.switchForm('signup');
      setTimeout(() => {
        const firstNameInput = document.getElementById('signup-first-name');
        if (firstNameInput) firstNameInput.focus();
      }, 200);
    }
    
    // Escape to close modals
    if (e.key === 'Escape') {
      const modal = document.querySelector('.modal:not(.hidden)');
      if (modal) {
        modal.classList.add('hidden');
      }
    }
  });

  // Add smooth scrolling for mobile
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    document.body.style.overflow = 'auto';
    document.body.style.webkitOverflowScrolling = 'touch';
  }
});

  // UI Helper Methods
  setButtonLoading(buttonId, loading) {
    const button = document.getElementById(buttonId);
    if (!button) return;

    const text = button.querySelector('.btn-text');
    const loader = button.querySelector('.btn-loader');

    if (loading) {
      button.disabled = true;
      if (text) text.classList.add('hidden');
      if (loader) loader.classList.remove('hidden');
    } else {
      button.disabled = false;
      if (text) text.classList.remove('hidden');
      if (loader) loader.classList.add('hidden');
    }
  }

  showAlert(alertId, message, type = 'info') {
    const alert = document.getElementById(alertId);
    if (!alert) return;

    alert.className = `alert ${type}`;
    alert.innerHTML = `
      <i class="fas ${this.getAlertIcon(type)}"></i>
      <span>${message}</span>
    `;
    alert.classList.remove('hidden');
    alert.classList.add('slide-up');
  }

  clearAlert(alertId) {
    const alert = document.getElementById(alertId);
    if (alert) {
      alert.classList.add('hidden');
    }
  }

  clearAllAlerts() {
    document.querySelectorAll('.alert').forEach(alert => {
      alert.classList.add('hidden');
    });
  }

  getAlertIcon(type) {
    const icons = {
      success: 'fa-check-circle',
      error: 'fa-exclamation-circle',
      warning: 'fa-exclamation-triangle',
      info: 'fa-info-circle'
    };
    return icons[type] || icons.info;
  }

  showSuccessModal(title, message) {
    const modal = document.getElementById('success-modal');
    const titleElement = document.getElementById('success-title');
    const messageElement = document.getElementById('success-message');

    if (modal && titleElement && messageElement) {
      titleElement.textContent = title;
      messageElement.textContent = message;
      modal.classList.remove('hidden');
    }
  }

  hideSuccessModal() {
    const modal = document.getElementById('success-modal');
    if (modal) {
      modal.classList.add('hidden');
    }
  }

  // Session Management
  async checkExistingSession() {
    if (!this.supabase) {
      console.warn('Supabase client not available');
      return false;
    }

    try {
      const { data: { session }, error } = await this.supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
        return false;
      }
      
      if (session && session.user) {
        this.currentUser = session.user;
        
        // Get user role from profile
        const { data: profile, error: profileError } = await this.supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        
        if (!profileError && profile) {
          console.log('Existing session found, redirecting to dashboard...');
          this.redirectToDashboard(profile.role);
          return true;
        }
      }
    } catch (error) {
      console.error('Session check error:', error);
    }
    
    return false;
  }

  async logout() {
    if (this.supabase) {
      const { error } = await this.supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
      }
    }
    
    // Clear local storage
    localStorage.removeItem('rememberMe');
    this.currentUser = null;
    
    // Redirect to login
    window.location.href = 'login.html';
  }

  completeAuthentication() {
    // Clean up temporary data
    localStorage.removeItem('tempUserId');
    localStorage.removeItem('tempUserRole');
    
    // Get user role and redirect
    const role = this.currentUser?.user_metadata?.role || 'student';
    this.redirectToDashboard(role);
  }

  redirectToDashboard(role = 'student') {
    // Show loading message
    document.body.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; height: 100vh; background: var(--color-background); color: var(--color-text); flex-direction: column; gap: 1rem;">
        <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: #667eea;"></i>
        <p style="font-size: 1.2rem;">Redirecting to your dashboard...</p>
      </div>
    `;

    // Redirect after delay
    setTimeout(() => {
      switch (role) {
        case 'admin':
          window.location.href = 'home.html?tab=dashboard&role=admin';
          break;
        case 'faculty':
          window.location.href = 'home.html?tab=dashboard&role=faculty';
          break;
        case 'student':
          window.location.href = 'home.html?tab=dashboard&role=student';
          break;
        default:
          window.location.href = 'home.html';
      }
    }, 2000);
  }

  // Handle password reset from email link
  async handlePasswordReset() {
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('access_token');
    const refreshToken = urlParams.get('refresh_token');
    
    if (accessToken && refreshToken) {
      try {
        const { data, error } = await this.supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });
        
        if (error) {
          console.error('Error setting session:', error);
          this.showAlert('login-alert', 'Invalid reset link. Please try again.', 'error');
          return;
        }
        
        // Show password reset form or redirect to change password
        this.showAlert('login-alert', 'Please enter your new password.', 'info');
        // You can add a password reset form here
        
      } catch (error) {
        console.error('Password reset error:', error);
        this.showAlert('login-alert', 'Error processing reset link.', 'error');
      }
    }
  }
}

// Additional utility functions
function formatDate(date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
}

function formatTime(date) {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(date);
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Initialize auth manager
  window.authManager = new AuthManager();

  // Add some demo functionality
  console.log('🚀 HH310 Login System Initialized');
  console.log('📧 Demo Accounts:');
  console.log('   Admin: admin@hh310.edu / admin123');
  console.log('   Faculty: teacher@hh310.edu / teacher123');
  console.log('   Student: student@hh310.edu / student123');

  // Add keyboard shortcuts
  document.addEventListener('keydown', function(e) {
    // Alt + L to focus login email
    if (e.altKey && e.key === 'l') {
      e.preventDefault();
      const loginEmail = document.getElementById('login-email');
      if (loginEmail && !loginEmail.closest('.form-container').classList.contains('active')) {
        window.authManager.switchForm('login');
      }
      setTimeout(() => {
        const currentEmail = document.getElementById('login-email');
        if (currentEmail) currentEmail.focus();
      }, 200);
    }
    
    // Alt + S to focus signup
    if (e.altKey && e.key === 's') {
      e.preventDefault();
      window.authManager.switchForm('signup');
      setTimeout(() => {
        const firstNameInput = document.getElementById('signup-first-name');
        if (firstNameInput) firstNameInput.focus();
      }, 200);
    }
    
    // Escape to close modals
    if (e.key === 'Escape') {
      const modal = document.querySelector('.modal:not(.hidden)');
      if (modal) {
        modal.classList.add('hidden');
      }
    }
  });

  // Add smooth scrolling for mobile
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    document.body.style.overflow = 'auto';
    document.body.style.webkitOverflowScrolling = 'touch';
  }

  // Preload images for better performance
  const imagesToPreload = [
    // Add any background images here
  ];
  
  imagesToPreload.forEach(src => {
    const img = new Image();
    img.src = src;
  });
});

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AuthManager;
}
