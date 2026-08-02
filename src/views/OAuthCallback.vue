<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="text-center">
      <div class="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <h2 class="mt-4 text-xl font-semibold text-gray-700">Logging you in...</h2>
      <p class="mt-2 text-gray-500">Please wait while we redirect you.</p>
    </div>
  </div>
</template>

<script>
import { onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';

export default {
  name: 'OAuthCallback',
  setup() {
    const router = useRouter();
    const route = useRoute();

    onMounted(() => {
      console.log('🔄 OAuth Callback page mounted');
      console.log('📋 Query params:', route.query);
      
      const token = route.query.token;
      const userDataParam = route.query.user;
      const error = route.query.error;
      
      // Handle error
      if (error) {
        console.error('❌ OAuth error:', error);
        localStorage.removeItem('customerToken');
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
        router.replace('/customer/login?error=oauth_failed');
        return;
      }
      
      // Handle success
      if (token) {
        try {
          console.log('✅ OAuth token found');
          
          // Store token
          localStorage.setItem('customerToken', token);
          localStorage.setItem('token', token);
          
          // Store user data if present
          if (userDataParam) {
            try {
              const userData = JSON.parse(decodeURIComponent(userDataParam));
              localStorage.setItem('currentUser', JSON.stringify(userData));
              localStorage.setItem('userName', `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || userData.email);
              localStorage.setItem('userEmail', userData.email);
              console.log('✅ User data saved:', userData.firstName);
            } catch (parseError) {
              console.error('❌ Error parsing user data:', parseError);
            }
          }
          
          // Redirect to dashboard
          console.log('🚀 Redirecting to dashboard...');
          router.replace('/customer/dashboard');
          
        } catch (error) {
          console.error('❌ OAuth processing error:', error);
          localStorage.removeItem('customerToken');
          localStorage.removeItem('token');
          localStorage.removeItem('currentUser');
          router.replace('/customer/login?error=oauth_failed');
        }
      } else {
        console.warn('⚠️ No token found in OAuth callback');
        router.replace('/customer/login');
      }
    })
  }
};
</script>

<style scoped>
@keyframes spin {
  to { transform: rotate(360deg); }
}
.animate-spin {
  animation: spin 1s linear infinite;
}
</style>