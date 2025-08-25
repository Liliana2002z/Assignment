import { ref } from 'vue';

// 使用 ref() 创建一个可响应的用户对象
export const user = ref({
  isLoggedIn: false, // 用户登录状态，默认为未登录
  role: null,        // 用户角色，例如 'user' 或 'volunteer'
  name: '',          // 用户名或昵称
  points: 0,         // 游戏化积分
  badges: []         // 获得的徽章数组
});

/**
 * 模拟登录功能
 * @param {string} userName 用户名
 * @param {string} userRole 用户角色
 */
export function login(userName, userRole) {
  user.value.isLoggedIn = true;
  user.value.name = userName;
  user.value.role = userRole;
  // 登录后，您可以根据角色初始化其他数据
  if (userRole === 'volunteer') {
    user.value.points = 100; // 志愿者有初始积分
  } else {
    user.value.points = 0;
  }
}

/**
 * 模拟登出功能
 */
export function logout() {
  user.value.isLoggedIn = false;
  user.value.role = null;
  user.value.name = '';
  user.value.points = 0;
  user.value.badges = [];
}