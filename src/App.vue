<template>
  <div>
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
      <div class="container-fluid">
        <a class="navbar-brand" href="#">FIT5032</a>
        <div class="collapse navbar-collapse">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            <li class="nav-item">
              <router-link to="/" class="nav-link">主页</router-link>
            </li>

            <li class="nav-item" v-if="!user.isLoggedIn">
              <router-link to="/login" class="nav-link">登录</router-link>
            </li>
            <li class="nav-item" v-if="!user.isLoggedIn">
              <router-link to="/register" class="nav-link">注册</router-link>
            </li>
            
            <li class="nav-item" v-if="user.isLoggedIn">
              <router-link to="/profile" class="nav-link">用户资料</router-link>
            </li>
            <li class="nav-item" v-if="user.isLoggedIn">
              <router-link to="/community" class="nav-link">社区</router-link>
            </li>
            <li class="nav-item" v-if="user.isLoggedIn">
              <a href="#" @click.prevent="logout" class="nav-link">登出</a>
            </li>
          </ul>

          <span class="navbar-text ms-auto" v-if="user.isLoggedIn">
            欢迎, {{ user.name }} ({{ user.role === 'volunteer' ? '志愿者' : '普通用户' }})
          </span>
        </div>
      </div>
    </nav>
    
    <router-view></router-view>
  </div>
</template>

<script setup>
import { user, logout } from './userStore.js';
</script>

<style>
/* 这里可以添加全局样式 */
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
</style>