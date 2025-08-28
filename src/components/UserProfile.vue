<template>
  <div class="container my-5">
    <div class="row">
      <div class="col-md-8 mx-auto">
        <div class="card p-4 shadow-sm">
          <h2 class="card-title text-center">UserMessage</h2>
          <div class="card-body">
            <h5 class="card-text">Hello, {{ user.name }}!</h5>
            <p class="card-text">Your charactor is: {{ user.role === 'volunteer' ? 'Volunteer' : 'Normal User' }}</p>
            <p class="card-text">Your current scores: {{ user.points }}</p>

            <h5 class="mt-4">My badges:</h5>
            <ul class="list-group">
              <li class="list-group-item" v-if="user.badges.length === 0">
                You haven't get any badge.
              </li>
              <li class="list-group-item" v-for="badge in user.badges" :key="badge.id">
                {{ badge.name }} - {{ badge.description }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { user } from '../userStore.js';
</script>