<template>
  <div class="container my-5">
    <div class="row">
      <div class="col-12 text-center">
        <h1>Welcome to {{ appName }}!</h1>
        <p class="lead mt-3">This is a space for listening and sharing.</p>
      </div>
    </div>
    
    <div v-if="!user.isLoggedIn" class="row mt-5">
      <div class="col-md-8 mx-auto text-center">
        <div class="alert alert-warning" role="alert">
          <strong>🔒 Access Restricted:</strong> Please log in to view the Administrative Data Overview tables.
        </div>
        <router-link to="/login" class="btn btn-primary btn-lg">Go to Login</router-link>
      </div>
    </div>

    <div class="row mt-4" v-if="user.isLoggedIn">
      <div class="col-md-6">
        <InteractiveTable 
          title="User Activity and Points"
          table-id="userPointsTable"
          :headers="['ID', 'Name', 'Role', 'Points', 'Last Activity']"
          :column-defs="userPointsColumnDefs"
          :table-data="userPointsData"
          />
        <button class="btn btn-sm btn-outline-success mt-2" @click="exportUserPoints">
          Export User Data (CSV)
        </button>
      </div>
      <div class="col-md-6">
        <InteractiveTable 
          title="Community Post Performance"
          table-id="postPerformanceTable"
          :headers="['ID', 'Title', 'Author', 'Avg. Rating', 'Comments']"
          :column-defs="postPerformanceColumnDefs"
          :table-data="postPerformanceData"
        />
        <button class="btn btn-sm btn-outline-success mt-2" @click="exportPostData">
          Export Post Data (CSV) </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import InteractiveTable from './InteractiveTable.vue'; 
// 🚨 NEW: 导入 userStore
import { user } from '../userStore.js'; 

// 导入 Mock 数据
import userPointsData from '../data/UserPointsData.json';
import postPerformanceData from '../data/PostPerformanceData.json';

import { exportToCSV } from '../utils/exportData.js'; 

// Use ref() to define dynamic data
const appName = ref('HealthYouth');

// 🌟 定义 DataTables 所需的列定义 (保持不变)
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

// BR (E.4)
const exportUserPoints = () => {
    // 将用户积分的 JSON 数据导出
    exportToCSV(userPointsData, 'user_points_data');
};

const exportPostData = () => {
    // 修正了之前代码中第二个按钮的错误调用
    exportToCSV(postPerformanceData, 'post_performance_data');
};
</script>

<style scoped>
h1 {
  color: #0d6efd; /* Bootstrap primary color */
}
</style>