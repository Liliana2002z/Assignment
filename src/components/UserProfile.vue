<template>
  <div class="container my-5">
    <div class="row">
      <div class="col-md-8 mx-auto">
        <div class="card p-4 shadow-sm">
          <h2 class="card-title text-center">用户资料</h2>
          <div class="card-body">
            <h5 class="card-text">你好, {{ user.name }}!</h5>
            <p class="card-text">您的角色是: {{ user.role === 'volunteer' ? '志愿者' : '普通用户' }}</p>
            <p class="card-text">您当前的积分: {{ user.points }}</p>

            <h5 class="mt-4">我的徽章:</h5>
            <ul class="list-group">
              <li class="list-group-item" v-if="user.badges.length === 0">
                您还没有获得任何徽章。
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