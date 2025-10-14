<template>
  <div class="container-fluid my-4">
    <!-- Skip link for accessibility -->
    <a href="#dashboard-content" class="skip-link">Skip to dashboard</a>

    <!-- Header -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <h1 id="dashboard-content">
              <span aria-hidden="true">🛡️</span> Admin Dashboard
            </h1>
            <p class="text-muted mb-0">
              System overview and management for HearYou platform
            </p>
          </div>
          <div>
            <span class="badge bg-success fs-6">
              <span aria-hidden="true">✓</span> System Online
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Stats Cards -->
    <div class="row g-3 mb-4">
      <div class="col-md-3">
        <div class="stat-card card border-primary shadow-sm h-100">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h2 class="h6 text-muted mb-1">Total Users</h2>
                <p class="h2 mb-0 text-primary">{{ stats.totalUsers }}</p>
                <small class="text-success">
                  <span aria-hidden="true">↑</span> {{ stats.newUsersThisWeek }} this week
                </small>
              </div>
              <div class="stat-icon bg-primary">
                <span aria-hidden="true">👥</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-3">
        <div class="stat-card card border-success shadow-sm h-100">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h2 class="h6 text-muted mb-1">Total Posts</h2>
                <p class="h2 mb-0 text-success">{{ stats.totalPosts }}</p>
                <small class="text-success">
                  <span aria-hidden="true">↑</span> {{ stats.newPostsToday }} today
                </small>
              </div>
              <div class="stat-icon bg-success">
                <span aria-hidden="true">📝</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-3">
        <div class="stat-card card border-warning shadow-sm h-100">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h2 class="h6 text-muted mb-1">Avg Satisfaction</h2>
                <p class="h2 mb-0 text-warning">{{ stats.avgRating }}/5</p>
                <small class="text-muted">
                  Based on {{ stats.totalRatings }} ratings
                </small>
              </div>
              <div class="stat-icon bg-warning">
                <span aria-hidden="true">⭐</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-3">
        <div class="stat-card card border-info shadow-sm h-100">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h2 class="h6 text-muted mb-1">Active Now</h2>
                <p class="h2 mb-0 text-info">{{ stats.activeUsers }}</p>
                <small class="text-muted">
                  {{ stats.activePercentage }}% of total
                </small>
              </div>
              <div class="stat-icon bg-info">
                <span aria-hidden="true">🟢</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content Row -->
    <div class="row g-3">
      <!-- User Management Table -->
      <div class="col-lg-8">
        <div class="card shadow-sm mb-3">
          <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
            <h2 class="h5 mb-0">
              <span aria-hidden="true">👤</span> User Management
            </h2>
            <div class="btn-group btn-group-sm" role="group" aria-label="Filter users">
              <input 
                type="radio" 
                class="btn-check" 
                name="userFilter" 
                id="filter-all" 
                value="all"
                v-model="userFilter"
                autocomplete="off"
              >
              <label class="btn btn-outline-light" for="filter-all">All</label>

              <input 
                type="radio" 
                class="btn-check" 
                name="userFilter" 
                id="filter-active" 
                value="active"
                v-model="userFilter"
                autocomplete="off"
              >
              <label class="btn btn-outline-light" for="filter-active">Active</label>

              <input 
                type="radio" 
                class="btn-check" 
                name="userFilter" 
                id="filter-moderator" 
                value="Moderator"
                v-model="userFilter"
                autocomplete="off"
              >
              <label class="btn btn-outline-light" for="filter-moderator">Moderators</label>
            </div>
          </div>
          <div class="card-body p-0">
            <div class="table-responsive" style="max-height: 400px; overflow-y: auto;">
              <table 
                class="table table-hover table-sm mb-0"
                role="table"
                aria-label="User management table"
              >
                <thead class="table-light sticky-top">
                  <tr>
                    <th scope="col">ID</th>
                    <th scope="col">Name</th>
                    <th scope="col">Role</th>
                    <th scope="col">Points</th>
                    <th scope="col">Last Active</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="user in filteredUsers" :key="user.id">
                    <td>{{ user.id }}</td>
                    <td>
                      <strong>{{ user.name }}</strong>
                      <span 
                        v-if="isActiveUser(user)" 
                        class="badge bg-success ms-2"
                        aria-label="Active user"
                      >
                        <span aria-hidden="true">●</span> Online
                      </span>
                    </td>
                    <td>
                      <span 
                        class="badge" 
                        :class="getRoleBadgeClass(user.role)"
                      >
                        {{ user.role }}
                      </span>
                    </td>
                    <td>{{ user.points }}</td>
                    <td>
                      <small>{{ formatDate(user.last_activity) }}</small>
                    </td>
                    <td>
                      <button 
                        class="btn btn-sm btn-outline-primary me-1"
                        @click="viewUserDetails(user)"
                        :aria-label="`View details for ${user.name}`"
                      >
                        <span aria-hidden="true">👁️</span>
                      </button>
                      <button 
                        class="btn btn-sm btn-outline-warning"
                        @click="editUser(user)"
                        :aria-label="`Edit ${user.name}`"
                      >
                        <span aria-hidden="true">✏️</span>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Recent Posts -->
        <div class="card shadow-sm">
          <div class="card-header bg-success text-white">
            <h2 class="h5 mb-0">
              <span aria-hidden="true">📰</span> Recent Posts
            </h2>
          </div>
          <div class="card-body p-0">
            <div class="list-group list-group-flush">
              <div 
                v-for="post in recentPosts" 
                :key="post.id"
                class="list-group-item list-group-item-action"
              >
                <div class="d-flex w-100 justify-content-between align-items-start">
                  <div class="flex-grow-1">
                    <h3 class="h6 mb-1">{{ post.title }}</h3>
                    <p class="mb-1 text-muted">
                      <small>By: <strong>{{ post.author_name }}</strong></small>
                    </p>
                  </div>
                  <small class="text-muted">{{ formatDate(post.created_at) }}</small>
                </div>
                <div class="d-flex justify-content-between align-items-center mt-2">
                  <div>
                    <span class="badge bg-warning text-dark me-2">
                      <span aria-hidden="true">⭐</span> {{ post.avg_rating }}
                    </span>
                    <span class="badge bg-info">
                      <span aria-hidden="true">💬</span> {{ post.total_comments }} comments
                    </span>
                  </div>
                  <button 
                    class="btn btn-sm btn-outline-secondary"
                    @click="viewPost(post)"
                    :aria-label="`View post ${post.title}`"
                  >
                    View
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Sidebar -->
      <div class="col-lg-4">
        <!-- User Role Distribution -->
        <div class="card shadow-sm mb-3">
          <div class="card-header bg-info text-white">
            <h2 class="h5 mb-0">
              <span aria-hidden="true">📊</span> User Roles
            </h2>
          </div>
          <div class="card-body">
            <div 
              v-for="(count, role) in roleDistribution" 
              :key="role"
              class="mb-3"
            >
              <div class="d-flex justify-content-between mb-1">
                <span>{{ role }}</span>
                <strong>{{ count }}</strong>
              </div>
              <div class="progress" style="height: 20px;">
                <div 
                  class="progress-bar"
                  :class="getRoleProgressClass(role)"
                  role="progressbar"
                  :style="{ width: getRolePercentage(count) + '%' }"
                  :aria-valuenow="count"
                  :aria-valuemin="0"
                  :aria-valuemax="stats.totalUsers"
                  :aria-label="`${role}: ${count} users`"
                >
                  {{ getRolePercentage(count) }}%
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- System Health -->
        <div class="card shadow-sm mb-3">
          <div class="card-header bg-warning text-dark">
            <h2 class="h5 mb-0">
              <span aria-hidden="true">💊</span> System Health
            </h2>
          </div>
          <div class="card-body">
            <div class="mb-3">
              <div class="d-flex justify-content-between mb-1">
                <span>Server Status</span>
                <span class="badge bg-success">Excellent</span>
              </div>
              <div class="progress">
                <div 
                  class="progress-bar bg-success" 
                  role="progressbar" 
                  style="width: 98%"
                  aria-valuenow="98"
                  aria-valuemin="0"
                  aria-valuemax="100"
                  aria-label="Server uptime 98%"
                >
                  98%
                </div>
              </div>
            </div>

            <div class="mb-3">
              <div class="d-flex justify-content-between mb-1">
                <span>Database Performance</span>
                <span class="badge bg-success">Good</span>
              </div>
              <div class="progress">
                <div 
                  class="progress-bar bg-success" 
                  role="progressbar" 
                  style="width: 95%"
                  aria-valuenow="95"
                  aria-valuemin="0"
                  aria-valuemax="100"
                  aria-label="Database performance 95%"
                >
                  95%
                </div>
              </div>
            </div>

            <div class="mb-0">
              <div class="d-flex justify-content-between mb-1">
                <span>Response Time</span>
                <span class="badge bg-warning text-dark">Average</span>
              </div>
              <div class="progress">
                <div 
                  class="progress-bar bg-warning" 
                  role="progressbar" 
                  style="width: 75%"
                  aria-valuenow="75"
                  aria-valuemin="0"
                  aria-valuemax="100"
                  aria-label="Response time 75%"
                >
                  75%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- User Detail Modal -->
    <div 
      v-if="selectedUser"
      class="modal fade show d-block" 
      tabindex="-1"
      role="dialog"
      aria-labelledby="userDetailModalLabel"
      aria-modal="true"
      style="background-color: rgba(0,0,0,0.5);"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header bg-primary text-white">
            <h3 class="modal-title h5" id="userDetailModalLabel">
              User Details: {{ selectedUser.name }}
            </h3>
            <button 
              type="button" 
              class="btn-close btn-close-white" 
              @click="selectedUser = null"
              aria-label="Close modal"
            ></button>
          </div>
          <div class="modal-body">
            <dl class="row">
              <dt class="col-sm-4">User ID:</dt>
              <dd class="col-sm-8">{{ selectedUser.id }}</dd>

              <dt class="col-sm-4">Name:</dt>
              <dd class="col-sm-8">{{ selectedUser.name }}</dd>

              <dt class="col-sm-4">Role:</dt>
              <dd class="col-sm-8">
                <span 
                  class="badge" 
                  :class="getRoleBadgeClass(selectedUser.role)"
                >
                  {{ selectedUser.role }}
                </span>
              </dd>

              <dt class="col-sm-4">Points:</dt>
              <dd class="col-sm-8">{{ selectedUser.points }}</dd>

              <dt class="col-sm-4">Last Activity:</dt>
              <dd class="col-sm-8">{{ formatDate(selectedUser.last_activity) }}</dd>

              <dt class="col-sm-4">Status:</dt>
              <dd class="col-sm-8">
                <span 
                  class="badge"
                  :class="isActiveUser(selectedUser) ? 'bg-success' : 'bg-secondary'"
                >
                  {{ isActiveUser(selectedUser) ? 'Active' : 'Inactive' }}
                </span>
              </dd>
            </dl>
          </div>
          <div class="modal-footer">
            <button 
              type="button" 
              class="btn btn-secondary" 
              @click="selectedUser = null"
            >
              Close
            </button>
            <button 
              type="button" 
              class="btn btn-primary"
              @click="editUser(selectedUser)"
            >
              Edit User
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Screen reader announcements -->
    <div 
      role="status" 
      aria-live="polite" 
      aria-atomic="true" 
      class="visually-hidden"
    >
      {{ announcement }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import userPointsData from '../data/UserPointsData.json';
import postPerformanceData from '../data/PostPerformanceData.json';

const userFilter = ref('all');
const selectedUser = ref(null);
const announcement = ref('');

// Computed Statistics
const stats = computed(() => {
  const totalUsers = userPointsData.length;
  const totalPosts = postPerformanceData.length;
  
  const avgRating = (postPerformanceData.reduce((acc, p) => acc + parseFloat(p.avg_rating), 0) / totalPosts).toFixed(2);
  
  const activeUsers = userPointsData.filter(u => isActiveUser(u)).length;
  const activePercentage = ((activeUsers / totalUsers) * 100).toFixed(1);
  
  // Mock data for demonstration
  const newUsersThisWeek = Math.floor(totalUsers * 0.15);
  const newPostsToday = Math.floor(totalPosts * 0.1);
  
  return {
    totalUsers,
    totalPosts,
    avgRating,
    totalRatings: totalPosts,
    activeUsers,
    activePercentage,
    newUsersThisWeek,
    newPostsToday
  };
});

// Filtered Users
const filteredUsers = computed(() => {
  if (userFilter.value === 'all') {
    return userPointsData;
  } else if (userFilter.value === 'active') {
    return userPointsData.filter(u => isActiveUser(u));
  } else {
    return userPointsData.filter(u => u.role === userFilter.value);
  }
});

// Recent Posts (last 5)
const recentPosts = computed(() => {
  return postPerformanceData.slice(0, 5).map(post => ({
    ...post,
    created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
  }));
});

// Role Distribution
const roleDistribution = computed(() => {
  const roles = {};
  userPointsData.forEach(user => {
    roles[user.role] = (roles[user.role] || 0) + 1;
  });
  return roles;
});

// Helper Functions
const isActiveUser = (user) => {
  const lastActivity = new Date(user.last_activity);
  const now = new Date();
  const daysDiff = (now - lastActivity) / (1000 * 60 * 60 * 24);
  return daysDiff <= 7;
};

const getRoleBadgeClass = (role) => {
  const classes = {
    'Admin': 'bg-danger',
    'Moderator': 'bg-warning text-dark',
    'User': 'bg-primary',
    'Listener': 'bg-info',
    'Counselor': 'bg-success'
  };
  return classes[role] || 'bg-secondary';
};

const getRoleProgressClass = (role) => {
  const classes = {
    'Admin': 'bg-danger',
    'Moderator': 'bg-warning',
    'User': 'bg-primary',
    'Listener': 'bg-info',
    'Counselor': 'bg-success'
  };
  return classes[role] || 'bg-secondary';
};

const getRolePercentage = (count) => {
  return ((count / stats.value.totalUsers) * 100).toFixed(1);
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString();
};

const announce = (message) => {
  announcement.value = message;
  setTimeout(() => {
    announcement.value = '';
  }, 3000);
};

// Action Handlers
const viewUserDetails = (user) => {
  selectedUser.value = user;
  announce(`Viewing details for ${user.name}`);
};

const editUser = (user) => {
  announce(`Editing user ${user.name}`);
  alert(`Edit user: ${user.name}\n(This would open an edit form)`);
};

const viewPost = (post) => {
  announce(`Viewing post ${post.title}`);
  alert(`View post: ${post.title}\n(This would navigate to post details)`);
};

const exportData = () => {
  announce('Exporting data');
  alert('Exporting data to CSV...\n(This would trigger a CSV download)');
};

const sendBulkEmail = () => {
  announce('Opening bulk email interface');
  alert('Send Bulk Email\n(This would open the bulk email interface)');
};

const generateReport = () => {
  announce('Generating analytics report');
  alert('Generating Report...\n(This would generate a PDF report)');
};

const systemSettings = () => {
  announce('Opening system settings');
  alert('System Settings\n(This would open settings panel)');
};
</script>

<style scoped>
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: #0d6efd;
  color: white;
  padding: 8px;
  text-decoration: none;
  z-index: 100;
}

.skip-link:focus {
  top: 0;
}

.stat-card {
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
}

.table thead {
  position: sticky;
  top: 0;
  z-index: 10;
}

.list-group-item-action:hover {
  background-color: #f8f9fa;
}

.progress {
  height: 20px;
}

.modal.show {
  display: block;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
</style>