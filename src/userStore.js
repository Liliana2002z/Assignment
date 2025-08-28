import { ref } from 'vue';

// Create a responsive user object
export const user = ref({
  isLoggedIn: false,
  role: null,
  name: '',
  points: 0,
  badges: []
});

/**
 * Simulated login function
 * @param {string} userName user name
 * @param {string} userRole user charactor
 */
export function login(userName, userRole) {
  user.value.isLoggedIn = true;
  user.value.name = userName;
  user.value.role = userRole;
  // After logging in, initialize other data based on your role
  if (userRole === 'volunteer') {
    user.value.points = 100; // Volunteers have initial points
  } else {
    user.value.points = 0;
  }
}

/**
 * Simulated logout function
 */
export function logout() {
  user.value.isLoggedIn = false;
  user.value.role = null;
  user.value.name = '';
  user.value.points = 0;
  user.value.badges = [];
}