<template>
  <div class="container my-5">
    <div class="row">
      <div class="col-12 text-center">
        <h1>Welcome to {{ appName }}!</h1>
        <p class="lead mt-3">This is a space for listening and sharing.</p>
      </div>
    </div>
    
    <div class="row mt-4">
      <div class="col-md-8 mx-auto">
        <div class="card p-4 shadow-sm">
          <h2 class="card-title">About this web</h2>
          <p>
            {{ aboutText }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// Use ref() to define dynamic data
const appName = ref('HealthYouth');
const aboutText = ref('According to BR (A.1), BR (A.2), BR (B.1) and BR (B.2).');
</script>

<style scoped>
h1 {
  color: #0d6efd; /* Bootstrap primary color */
}
</style>