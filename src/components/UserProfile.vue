<template>
  <div class="container my-5">
    <div class="row">
      <div class="col-md-8 mx-auto">
        <div class="card p-4 shadow-sm">
          <h2 class="card-title text-center">UserMessage</h2>
          <div class="card-body">
            <h5 class="card-text">Hello, {{ user.name }}!</h5>
            <p class="card-text">Your character is: {{ userRoleDisplay }}</p>
            <p class="card-text">Your current scores: {{ user.points }}</p>

            
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { user } from '../userStore.js';
import { computed } from 'vue';
const userRoleDisplay = computed(() => {
  switch (user.value.role) {
    case 'admin':
      return 'Administrator';
    case 'volunteer':
      return 'Volunteer';
    case 'user':
    default:
      return 'Normal User';
  }
});
</script>