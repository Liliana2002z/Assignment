import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '../components/HomePage.vue';
import RegisterForm from '../components/RegisterForm.vue';
import LoginForm from '../components/LoginForm.vue';
import UserProfile from '../components/UserProfile.vue';
import CommunityPage from '../components/CommunityPage.vue';

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
    component: UserProfile
  },
  {
    path: '/community',
    name: 'Community',
    component: CommunityPage
  }

];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;