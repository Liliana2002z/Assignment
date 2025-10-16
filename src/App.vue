<template>
  <div>
    <nav class="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
      <div class="container-fluid">
        <router-link to="/" class="navbar-brand">HearYou</router-link>
        
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            
            <li class="nav-item">
              <router-link to="/" class="nav-link">Homepage</router-link>
            </li>
            <li class="nav-item"> 
              <router-link to="/map" class="nav-link">Map</router-link>
            </li>
            
            <template v-if="user.isLoggedIn">
              
              <li class="nav-item">
                <router-link to="/ai-chat" class="nav-link">🤖 AI Chat</router-link>
              </li>
              <li class="nav-item">
                <router-link to="/appointments" class="nav-link">🗓️ Appointments</router-link>
              </li>
              
              <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" id="moreDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  More Features
                </a>
                <ul class="dropdown-menu" aria-labelledby="moreDropdown">
                  <li>
                    <router-link to="/community" class="dropdown-item">Community</router-link>
                  </li>
                  <li>
                    <router-link to="/email-sender" class="dropdown-item">Send Email</router-link>
                  </li>
                  <li>
                    <router-link to="/profile" class="dropdown-item">User Profile</router-link>
                  </li>
                  <template v-if="user.role === 'volunteer'">
                    <li><hr class="dropdown-divider"></li>
                    <li>
                      <router-link to="/volunteer" class="dropdown-item text-success">
                        Volunteer Dashboard
                      </router-link>
                    </li>
                  </template>
                </ul>
              </li>

              <template v-if="user.role === 'admin'">
                <li class="nav-item">
                  <router-link to="/analytics" class="nav-link text-info">
                    📊 Analytics
                  </router-link>
                </li>
                <li class="nav-item">
                  <router-link to="/admin" class="nav-link text-danger">
                    🛡️ Admin
                  </router-link>
                </li>
              </template>
              
            </template>
          </ul>

          <ul class="navbar-nav ms-auto">
            <template v-if="user.isLoggedIn">
              <li class="nav-item d-flex align-items-center me-3">
                <span class="navbar-text">
                  Welcome, {{ user.name }} ({{ user.role }})
                </span>
              </li>
              <li class="nav-item">
                <a href="#" @click.prevent="signOut" class="btn btn-sm btn-outline-danger">Logout</a>
              </li>
            </template>

            <template v-else>
              <li class="nav-item">
                <router-link to="/login" class="btn btn-sm btn-outline-primary me-2">Login</router-link>
              </li>
              <li class="nav-item">
                <router-link to="/register" class="btn btn-sm btn-primary">Register</router-link>
              </li>
            </template>
          </ul>
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
/* ... (样式保持不变) ... */
</style>