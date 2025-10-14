<template>
  <div class="container my-5">
    <!-- Accessibility: Skip link -->
    <a href="#main-content" class="skip-link">Skip to charts</a>

    <div class="row mb-4">
      <div class="col-12">
        <h1 id="main-content" class="text-center mb-4">
          <span aria-hidden="true">📊</span> Community Analytics Dashboard
        </h1>
        <p class="text-center text-muted">
          Interactive data visualization for HearYou community insights
        </p>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="row mb-4">
      <div class="col-md-3 mb-3">
        <div class="card text-center shadow-sm h-100">
          <div class="card-body">
            <div class="display-4 text-primary" aria-hidden="true">👥</div>
            <h2 class="h5 mt-2">Total Users</h2>
            <p class="display-6 mb-0">{{ totalUsers }}</p>
            <small class="text-muted">Active members</small>
          </div>
        </div>
      </div>

      <div class="col-md-3 mb-3">
        <div class="card text-center shadow-sm h-100">
          <div class="card-body">
            <div class="display-4 text-success" aria-hidden="true">📝</div>
            <h2 class="h5 mt-2">Total Posts</h2>
            <p class="display-6 mb-0">{{ totalPosts }}</p>
            <small class="text-muted">Community posts</small>
          </div>
        </div>
      </div>

      <div class="col-md-3 mb-3">
        <div class="card text-center shadow-sm h-100">
          <div class="card-body">
            <div class="display-4 text-warning" aria-hidden="true">⭐</div>
            <h2 class="h5 mt-2">Avg Rating</h2>
            <p class="display-6 mb-0">{{ avgRating }}</p>
            <small class="text-muted">Out of 5.0</small>
          </div>
        </div>
      </div>

      <div class="col-md-3 mb-3">
        <div class="card text-center shadow-sm h-100">
          <div class="card-body">
            <div class="display-4 text-info" aria-hidden="true">💬</div>
            <h2 class="h5 mt-2">Total Comments</h2>
            <p class="display-6 mb-0">{{ totalComments }}</p>
            <small class="text-muted">User interactions</small>
          </div>
        </div>
      </div>
    </div>

    <!-- Chart 1: User Points Bar Chart -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="card shadow-sm">
          <div class="card-header bg-primary text-white">
            <h2 class="h5 mb-0">
              <span aria-hidden="true">🏆</span> Top Users by Points
            </h2>
          </div>
          <div class="card-body">
            <canvas 
              id="userPointsChart" 
              role="img" 
              :aria-label="`Bar chart showing top ${chartUsers.length} users by points`"
            ></canvas>
          </div>
        </div>
      </div>
    </div>

    <!-- Chart 2: User Role Distribution Pie Chart -->
    <div class="row mb-4">
      <div class="col-md-6 mb-3">
        <div class="card shadow-sm h-100">
          <div class="card-header bg-success text-white">
            <h2 class="h5 mb-0">
              <span aria-hidden="true">👤</span> User Role Distribution
            </h2>
          </div>
          <div class="card-body">
            <canvas 
              id="roleChart" 
              role="img" 
              aria-label="Pie chart showing distribution of user roles"
            ></canvas>
          </div>
        </div>
      </div>

      <!-- Chart 3: Post Performance Line Chart -->
      <div class="col-md-6 mb-3">
        <div class="card shadow-sm h-100">
          <div class="card-header bg-warning text-dark">
            <h2 class="h5 mb-0">
              <span aria-hidden="true">📈</span> Post Ratings Trend
            </h2>
          </div>
          <div class="card-body">
            <canvas 
              id="postRatingsChart" 
              role="img" 
              aria-label="Line chart showing post rating trends"
            ></canvas>
          </div>
        </div>
      </div>
    </div>

    <!-- Chart 4: Comments Distribution -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="card shadow-sm">
          <div class="card-header bg-info text-white">
            <h2 class="h5 mb-0">
              <span aria-hidden="true">💭</span> Post Engagement (Comments)
            </h2>
          </div>
          <div class="card-body">
            <canvas 
              id="commentsChart" 
              role="img" 
              aria-label="Bar chart showing number of comments per post"
            ></canvas>
          </div>
        </div>
      </div>
    </div>

    <!-- Interactive Data Table -->
    <div class="row">
      <div class="col-12">
        <div class="card shadow-sm">
          <div class="card-header bg-secondary text-white">
            <h2 class="h5 mb-0">
              <span aria-hidden="true">📋</span> Detailed User Statistics
            </h2>
          </div>
          <div class="card-body">
            <div class="table-responsive">
              <table 
                class="table table-hover table-striped" 
                role="table"
                aria-label="Detailed user statistics table"
              >
                <thead class="table-dark">
                  <tr>
                    <th scope="col">Rank</th>
                    <th scope="col">Name</th>
                    <th scope="col">Role</th>
                    <th scope="col">Points</th>
                    <th scope="col">Last Activity</th>
                    <th scope="col">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(user, index) in sortedUsers" :key="user.id">
                    <td>{{ index + 1 }}</td>
                    <td><strong>{{ user.name }}</strong></td>
                    <td>
                      <span 
                        class="badge" 
                        :class="getRoleBadgeClass(user.role)"
                      >
                        {{ user.role }}
                      </span>
                    </td>
                    <td>{{ user.points }}</td>
                    <td>{{ user.last_activity }}</td>
                    <td>
                      <span 
                        class="badge bg-success" 
                        v-if="isRecentlyActive(user.last_activity)"
                      >
                        Active
                      </span>
                      <span class="badge bg-secondary" v-else>
                        Inactive
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
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
import { ref, computed, onMounted } from 'vue';
import Chart from 'chart.js/auto';

// Import mock data
import userPointsData from '../data/UserPointsData.json';
import postPerformanceData from '../data/PostPerformanceData.json';

const announcement = ref('');
const charts = ref([]);

// Computed statistics
const totalUsers = computed(() => userPointsData.length);
const totalPosts = computed(() => postPerformanceData.length);
const avgRating = computed(() => {
  const sum = postPerformanceData.reduce((acc, post) => acc + parseFloat(post.avg_rating), 0);
  return (sum / postPerformanceData.length).toFixed(2);
});
const totalComments = computed(() => {
  return postPerformanceData.reduce((acc, post) => acc + post.total_comments, 0);
});

// Sorted users by points (descending)
const sortedUsers = computed(() => {
  return [...userPointsData].sort((a, b) => b.points - a.points);
});

// Top 10 users for chart
const chartUsers = computed(() => sortedUsers.value.slice(0, 10));

// Role distribution
const roleDistribution = computed(() => {
  const roles = {};
  userPointsData.forEach(user => {
    roles[user.role] = (roles[user.role] || 0) + 1;
  });
  return roles;
});

// Helper functions
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

const isRecentlyActive = (lastActivity) => {
  const activityDate = new Date(lastActivity);
  const now = new Date();
  const daysDiff = (now - activityDate) / (1000 * 60 * 60 * 24);
  return daysDiff <= 7; // Active within last 7 days
};

const announce = (message) => {
  announcement.value = message;
  setTimeout(() => {
    announcement.value = '';
  }, 3000);
};

// Chart creation functions
const createUserPointsChart = () => {
  const ctx = document.getElementById('userPointsChart');
  if (!ctx) return;

  const chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: chartUsers.value.map(u => u.name),
      datasets: [{
        label: 'Points',
        data: chartUsers.value.map(u => u.points),
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)',
          'rgba(255, 159, 64, 0.7)',
          'rgba(199, 199, 199, 0.7)',
          'rgba(83, 102, 255, 0.7)',
          'rgba(255, 99, 255, 0.7)',
          'rgba(99, 255, 132, 0.7)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(199, 199, 199, 1)',
          'rgba(83, 102, 255, 1)',
          'rgba(255, 99, 255, 1)',
          'rgba(99, 255, 132, 1)'
        ],
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: false
        },
        title: {
          display: true,
          text: 'Top 10 Users by Points'
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `Points: ${context.parsed.y}`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Points'
          }
        }
      }
    }
  });

  charts.value.push(chart);
  announce('User points chart loaded');
};

const createRoleChart = () => {
  const ctx = document.getElementById('roleChart');
  if (!ctx) return;

  const roles = roleDistribution.value;
  
  const chart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: Object.keys(roles),
      datasets: [{
        data: Object.values(roles),
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)'
        ],
        borderColor: '#fff',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'bottom'
        },
        title: {
          display: true,
          text: 'User Roles Distribution'
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.parsed;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = ((value / total) * 100).toFixed(1);
              return `${label}: ${value} (${percentage}%)`;
            }
          }
        }
      }
    }
  });

  charts.value.push(chart);
  announce('Role distribution chart loaded');
};

const createPostRatingsChart = () => {
  const ctx = document.getElementById('postRatingsChart');
  if (!ctx) return;

  const chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: postPerformanceData.map(p => `Post ${p.id}`),
      datasets: [{
        label: 'Average Rating',
        data: postPerformanceData.map(p => parseFloat(p.avg_rating)),
        borderColor: 'rgba(255, 159, 64, 1)',
        backgroundColor: 'rgba(255, 159, 64, 0.2)',
        tension: 0.4,
        fill: true,
        pointRadius: 5,
        pointHoverRadius: 7
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: true,
          position: 'top'
        },
        title: {
          display: true,
          text: 'Post Rating Trends'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 5,
          title: {
            display: true,
            text: 'Rating (out of 5)'
          }
        }
      }
    }
  });

  charts.value.push(chart);
  announce('Post ratings chart loaded');
};

const createCommentsChart = () => {
  const ctx = document.getElementById('commentsChart');
  if (!ctx) return;

  const chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: postPerformanceData.map(p => p.title.substring(0, 20) + '...'),
      datasets: [{
        label: 'Number of Comments',
        data: postPerformanceData.map(p => p.total_comments),
        backgroundColor: 'rgba(54, 162, 235, 0.7)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: false
        },
        title: {
          display: true,
          text: 'Comments per Post'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Comments Count'
          }
        }
      }
    }
  });

  charts.value.push(chart);
  announce('Comments chart loaded');
};

onMounted(() => {
  // Wait for DOM to be ready
  setTimeout(() => {
    createUserPointsChart();
    createRoleChart();
    createPostRatingsChart();
    createCommentsChart();
    announce('All analytics charts loaded successfully');
  }, 100);
});
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

.card {
  transition: transform 0.2s;
}

.card:hover {
  transform: translateY(-5px);
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

canvas {
  max-height: 400px;
}

.table-responsive {
  max-height: 500px;
  overflow-y: auto;
}
</style>