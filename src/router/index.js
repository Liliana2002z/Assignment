import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '../components/HomePage.vue';
import CommunityPage from '../components/CommunityPage.vue';
import LoginForm from '../components/LoginForm.vue';
import RegisterForm from '../components/RegisterForm.vue';
import UserProfile from '../components/UserProfile.vue';
import VolunteerOnlyPage from '../components/VolunteerOnlyPage.vue';
import EmailSender from '../components/EmailSender.vue'; 
import MapComponent from '../components/MapComponent.vue';
import AnalyticsDashboard from '../components/AnalyticsDashboard.vue';
import AdminDashboard from '../components/AdminDashboard.vue';
import AIChatbot from '../components/AIChatbot.vue';
import AppointmentBooking from '../components/AppointmentBooking.vue';

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
  { path: '/analytics', name: 'Analytics', component: AnalyticsDashboard,
    meta: { requiresRole: 'admin' }
  },
  { path: '/admin', name: 'AdminDashboard', component: AdminDashboard,
    meta: { requiresRole: 'admin' }
  },
  { path: '/ai-chat', name: 'AIChat', component: AIChatbot},
  { path: '/appointments', name: 'Appointments', component: AppointmentBooking},
  { path: '/email-sender', name: 'EmailSender', component: EmailSender, meta: { requiresAuth: true }}
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const loggedIn = user.value.isLoggedIn;
  const userRole = user.value.role;
  
  //检查是否需要登录
  if (to.meta.requiresAuth && !loggedIn) {
    alert("Access Denied! Please log in to view this page.");
    next({ path: '/login' });
    return;
  }
  //检查角色权限
  if (to.meta.requiresRole) {
    if (loggedIn && userRole === to.meta.requiresRole) {
      next();
    } else {
      // 检查是否是 Admin/Volunteer 页面但用户是普通用户
      alert(`Access Denied! You do not have the required role to view this page.`);
      next({ path: '/' }); 
      return;
    }
  }
    next();
  
});

export default router;