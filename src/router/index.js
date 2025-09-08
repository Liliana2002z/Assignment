import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '../components/HomePage.vue';
import RegisterForm from '../components/RegisterForm.vue';
import LoginForm from '../components/LoginForm.vue';
import UserProfile from '../components/UserProfile.vue';
import CommunityPage from '../components/CommunityPage.vue';
import VolunteerOnlyPage from '../components/VolunteerOnlyPage.vue'; // 导入新组件
import { user } from '../userStore.js'; // 导入用户状态

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterForm
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginForm
  },
  {
    path: '/profile',
    name: 'Profile',
    component: UserProfile,
    meta: { requiresAuth: true }
  },
  {
    path: '/community',
    name: 'Community',
    component: CommunityPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/volunteer',
    name: 'Volunteer',
    component: VolunteerOnlyPage,
    // 这个页面只对 'volunteer' 角色开放
    meta: { requiresAuth: true, requiredRole: 'volunteer' }
  }

];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !user.value.isLoggedIn) {
    alert('Please login to access this page.');
    next('/login');
  } 
  else if (to.meta.requiredRole && user.value.role !== to.meta.requiredRole) {
    alert('Access Denied: You do not have the required role to view this page.');
    next('/');
  } 
  else {
    next();
  }
});

export default router;