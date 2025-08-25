<template>
  <div class="container my-5">
    <div class="row">
      <div class="col-12 text-center">
        <h1>欢迎来到 {{ appName }}!</h1>
        <p class="lead mt-3">这是一个为 FIT5032 A1.2 作业创建的 Vue.js 3 应用。</p>
      </div>
    </div>
    
    <div class="row mt-4">
      <div class="col-md-8 mx-auto">
        <div class="card p-4 shadow-sm">
          <h2 class="card-title">关于此应用</h2>
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

// 使用 ref() 定义动态数据
const appName = ref('我的 Vue 应用');
const aboutText = ref('该应用正在根据商业需求 BR (A.1), BR (A.2), BR (B.1) 和 BR (B.2) 进行开发，它将具备用户认证、数据验证和动态内容展示等功能。');
</script>

<style scoped>
h1 {
  color: #0d6efd; /* Bootstrap primary color */
}
</style>