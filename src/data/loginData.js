// loginData.js
import { Mail, Facebook } from 'lucide-vue-next'

export const appName = 'ACAPSHOP'

export const loginData = {
  title: 'Login',
  subtitle: 'Welcome back! Please login to your account',
  buttonText: 'Login',
  buttonLoadingText: 'Logging in...',
  dividerText: 'Or continue with',
  forgotPasswordText: 'Forgot Password?',
  
  fields: {
    email: {
      label: 'Email',
      placeholder: 'your@email.com'
    },
    password: {
      label: 'Password',
      placeholder: '••••••••'
    }
  },
  
  socialLogins: [
    {
      provider: 'google',
      label: 'Google',
      icon: 'Mail'
    },
    {
      provider: 'facebook',
      label: 'Facebook',
      icon: 'Facebook'
    }
  ],
  
  signUpText: {
    prefix: "Don't have an account?",
    link: 'Sign Up'
  }
}

// Demo credentials
export const demoCredentials = [
  {
    email: 'user@example.com',
    password: 'password123',
    name: 'John Doe',
    role: 'user'
  },
  {
    email: 'admin@acapshop.com',
    password: 'admin123',
    name: 'Admin User',
    role: 'admin'
  },
  {
    email: 'demo@acapshop.com',
    password: 'demo123',
    name: 'Demo User',
    role: 'user'
  }
]