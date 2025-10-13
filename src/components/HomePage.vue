<template>
  <div class="container my-5">
    <div class="row">
      <div class="col-12 text-center">
        <h1>Welcome to {{ appName }}!</h1>
        <p class="lead mt-3">This is a space for listening and sharing. (BR C & D Demo)</p>
      </div>
    </div>
    
    <div class="row mt-4">
      <div class="col-md-8 mx-auto">
        <div class="card p-4 shadow-sm">
          <h2 class="card-title">About this web</h2>
          <p>
            According to BR (A.1), BR (A.2), BR (B.1) and BR (B.2).
          </p>
        </div>
      </div>
    </div>
    
    <div class="row mt-4">
      <div class="col-md-6">
        <InteractiveTable 
          title="User Activity and Points"
          table-id="userPointsTable"
          :headers="['ID', 'Name', 'Role', 'Points', 'Last Activity']"
          :column-defs="userPointsColumnDefs"
          :table-data="userPointsData"
        />
      </div>
      <div class="col-md-6">
        <InteractiveTable 
          title="Community Post Performance"
          table-id="postPerformanceTable"
          :headers="['ID', 'Title', 'Author', 'Avg. Rating', 'Comments']"
          :column-defs="postPerformanceColumnDefs"
          :table-data="postPerformanceData"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import InteractiveTable from './InteractiveTable.vue'; // 确保路径正确

// 导入 Mock 数据
// 确保这些 JSON 文件在 src/data 目录下存在
import userPointsData from '../data/UserPointsData.json';
import postPerformanceData from '../data/PostPerformanceData.json';

// Use ref() to define dynamic data
const appName = ref('HealthYouth');
// 原始 About Text 的 ref 已移除，保留了 card 内容

// 🌟 定义 DataTables 所需的列定义 (告诉 DataTables 如何映射 JSON 字段)
const userPointsColumnDefs = [
    { data: 'id' }, 
    { data: 'name' }, 
    { data: 'role' }, 
    { data: 'points' },
    { data: 'last_activity' }
];

const postPerformanceColumnDefs = [
    { data: 'id' }, 
    { data: 'title' }, 
    { data: 'author_name' }, 
    { data: 'avg_rating' }, 
    { data: 'total_comments' }
];

</script>

<style scoped>
h1 {
  color: #0d6efd; /* Bootstrap primary color */
}
</style>