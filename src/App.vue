<template>
  <div>
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
      <div class="container-fluid">
        <a class="navbar-brand" href="#">HearYou</a>
        <div class="collapse navbar-collapse">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            <li class="nav-item">
              <router-link to="/" class="nav-link">Homepage</router-link>
            </li>
            <li class="nav-item"> 
              <router-link to="/map" class="nav-link">Map</router-link>
            </li>

            <li class="nav-item" v-if="!user.isLoggedIn">
              <router-link to="/login" class="nav-link">Login</router-link>
            </li>
            <li class="nav-item" v-if="user.isLoggedIn">
            <router-link to="/email-sender" class="nav-link">Send Email</router-link>
            </li>
            <li class="nav-item" v-if="!user.isLoggedIn">
              <router-link to="/register" class="nav-link">Register</router-link>
            </li>
            
            <li class="nav-item" v-if="user.isLoggedIn">
              <router-link to="/profile" class="nav-link">UserMessage</router-link>
            </li>
            <li class="nav-item" v-if="user.isLoggedIn">
              <router-link to="/community" class="nav-link">Community</router-link>
            </li>
            <li class="nav-item" v-if="user.isLoggedIn && user.role === 'volunteer'">
              <router-link to="/volunteer" class="nav-link">Volunteer Dashboard</router-link>
            </li>
            
            <li class="nav-item" v-if="user.isLoggedIn">
              <a href="#" @click.prevent="signOut" class="nav-link">Logout</a>
            </li>
            
            <li class="nav-item">
              <router-link to="/ai-chat" class="nav-link">🤖 AI Chat</router-link>
            </li>
            
            <li class="nav-item">
              <router-link to="/analytics" class="nav-link">
                📊 Analytics
              </router-link>
            </li>
            <li class="nav-item">
              <router-link to="/admin" class="nav-link">
                🛡️ Admin
              </router-link>
            </li>
          </ul>

          <span class="navbar-text ms-auto" v-if="user.isLoggedIn">
            Welcome, {{ user.name }} ({{ user.role === 'volunteer' ? 'Volunteer' : 'Normal User' }})
          </span>
        </div>
      </div>
    </nav>
    
    <router-view></router-view>
  </div>
</template>

<script setup>
import { user, signOut } from './userStore.js';
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