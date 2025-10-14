import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '../components/HomePage.vue';
import CommunityPage from '../components/CommunityPage.vue';
import LoginForm from '../components/LoginForm.vue';
import RegisterForm from '../components/RegisterForm.vue';
import UserProfile from '../components/UserProfile.vue';
import VolunteerOnlyPage from '../components/VolunteerOnlyPage.vue';
import EmailSender from '../components/EmailSender.vue'; 
import MapComponent from '../components/MapComponent.vue';
import AnalyticsDashboard from '../components/AnalyticsDashboard.vue'
import AdminDashboard from '../components/AdminDashboard.vue'
import AIChatbot from '../components/AIChatbot.vue'

import { user } from '../userStore.js'; 

const routes = [
  { path: '/', name: 'Home', component: HomePage },
  { path: '/community', name: 'Community', component: CommunityPage },
  { path: '/login', name: 'Login', component: LoginForm },
  { path: '/register', name: 'Register', component: RegisterForm },
  { path: '/profile', name: 'Profile', component: UserProfile },
  { path: '/map', name: 'MapService', component: MapComponent },
  { path: '/volunteer', name: 'VolunteerDashboard', component: VolunteerOnlyPage,
    meta: { requiresRole: 'volunteer' } 
  },
  { path: '/analytics', name: 'Analytics', component: AnalyticsDashboard},
  { path: '/admin', name: 'AdminDashboard', component: AdminDashboard},
  { path: '/ai-chat', name: 'AIChat', component: AIChatbot},
  { path: '/email-sender', name: 'EmailSender', component: EmailSender, meta: { requiresAuth: true }}
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {

  if (to.meta.requiresRole) {
    if (user.value.isLoggedIn && user.value.role === to.meta.requiresRole) {
      next();
    } else {
      alert(`Access Denied! Only users with the '${to.meta.requiresRole}' role can view this page.`);
      next({ path: '/' }); 
    }
  } else {
    next();
  }
});

export default router;