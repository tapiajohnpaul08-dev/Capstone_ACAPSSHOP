import { h } from 'vue'

// Simple icon components
const MailIcon = {
  render() {
    return h('svg', {
      xmlns: 'http://www.w3.org/2000/svg',
      width: '16',
      height: '16',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '2'
    }, [
      h('rect', { x: '2', y: '4', width: '20', height: '16', rx: '2' }),
      h('path', { d: 'm22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7' })
    ])
  }
}

const FacebookIcon = {
  render() {
    return h('svg', {
      xmlns: 'http://www.w3.org/2000/svg',
      width: '16',
      height: '16',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '2'
    }, [
      h('path', { d: 'M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z' })
    ])
  }
}

export const appName = 'ACAPSHOP'

export const loginData = {
  title: 'Customer Login',
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
      icon: MailIcon
    },
    {
      provider: 'facebook',
      label: 'Facebook',
      icon: FacebookIcon
    }
  ],
  
  signUpText: {
    prefix: "Don't have an account?",
    link: 'Sign Up'
  }
}