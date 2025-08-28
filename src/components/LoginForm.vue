<template>
  <div class="container my-5">
    <div class="row">
      <div class="col-md-6 mx-auto">
        <div class="card p-4 shadow-sm">
          <h2 class="card-title text-center">UserLogin</h2>

          <form @submit.prevent="handleLogin">
            <div class="mb-3">
              <label for="loginEmail" class="form-label">Email</label>
              <input 
                type="email" 
                class="form-control" 
                id="loginEmail" 
                v-model="loginForm.email" 
                required
                aria-label="Key your register Email"
              >
            </div>
            
            <div class="mb-3">
              <label for="loginPassword" class="form-label">Password</label>
              <input 
                type="password" 
                class="form-control" 
                id="loginPassword" 
                v-model="loginForm.password" 
                required
                aria-label="Key your password"
              >
            </div>

            <button type="submit" class="btn btn-primary w-100">Login</button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { login } from '../userStore.js';

const loginForm = ref({
  email: '',
  password: ''
});

const router = useRouter();

const handleLogin = () => {
  // 模拟登录成功，并根据邮箱分配角色
  // 这里可根据邮箱或其他条件来决定角色
  const userRole = loginForm.value.email.endsWith('@volunteer.com') ? 'volunteer' : 'user';
  
  // 调用登录函数更新全局状态
  login('测试用户', userRole); // 模拟登录用户名为“测试用户”

  // 登录成功后，跳转到主页或用户资料页
  router.push('/');
};
</script>

<style scoped>
/* 组件特有样式 */
</style>