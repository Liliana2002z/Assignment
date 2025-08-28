<template>
  <div class="container my-5">
    <div class="row">
      <div class="col-md-6 mx-auto">
        <div class="card p-4 shadow-sm">
          <h2 class="card-title text-center">UserLogin</h2>
          
          <form @submit.prevent="handleRegister">
            <div class="mb-3">
              <label for="email" class="form-label">Email</label>
              <input 
                type="email" 
                class="form-control" 
                :class="{ 'is-invalid': emailError }"
                id="email" 
                v-model="registrationForm.email" 
                @input="validateEmail"
                required
              >
              <div class="invalid-feedback">{{ emailError }}</div>
            </div>
            
            <div class="mb-3">
              <label for="password" class="form-label">Password</label>
              <input 
                type="password" 
                class="form-control" 
                :class="{ 'is-invalid': passwordError }"
                id="password" 
                v-model="registrationForm.password" 
                @input="validatePassword"
                required
              >
              <div class="invalid-feedback">{{ passwordError }}</div>
              <div class="form-text">At least 6 characters, including Upper & Lower letters and number.</div>
            </div>
            
            <div class="mb-3">
              <label for="confirmPassword" class="form-label">confirm password</label>
              <input 
                type="password" 
                class="form-control" 
                :class="{ 'is-invalid': confirmPasswordError }"
                id="confirmPassword" 
                v-model="registrationForm.confirmPassword" 
                @input="validateConfirmPassword"
                required
              >
              <div class="invalid-feedback">{{ confirmPasswordError }}</div>
            </div>

            <button type="submit" class="btn btn-primary w-100" :disabled="!isFormValid">注册</button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { login } from '../userStore.js';

const registrationForm = ref({
  email: '',
  password: '',
  confirmPassword: ''
});

// 验证状态
const emailError = ref('');
const passwordError = ref('');
const confirmPasswordError = ref('');

// 计算属性，用于启用/禁用提交按钮
const isFormValid = computed(() => {
  return !emailError.value && !passwordError.value && !confirmPasswordError.value &&
         registrationForm.value.email && registrationForm.value.password && registrationForm.value.confirmPassword;
});

// 验证函数
const validateEmail = () => {
  if (!/^\S+@\S+\.\S+$/.test(registrationForm.value.email)) {
    emailError.value = 'Please enter a validate Email address.';
  } else {
    emailError.value = '';
  }
};

const validatePassword = () => {
  const password = registrationForm.value.password;
  if (password.length < 6) {
    passwordError.value = 'At least 6 characters.';
  } else if (!/[A-Z]/.test(password)) {
    passwordError.value = 'At least include one Upper letter.';
  } else if (!/[a-z]/.test(password)) {
    passwordError.value = 'At least include one lower letter.';
  } else if (!/[0-9]/.test(password)) {
    passwordError.value = 'At least include one number.';
  } else {
    passwordError.value = '';
  }
  // 重新验证确认密码
  validateConfirmPassword();
};

const validateConfirmPassword = () => {
  if (registrationForm.value.password !== registrationForm.value.confirmPassword) {
    confirmPasswordError.value = 'Not match.';
  } else {
    confirmPasswordError.value = '';
  }
};

// 提交处理函数
const router = useRouter();
const handleRegister = () => {
  // 最终提交前再次验证所有字段
  validateEmail();
  validatePassword();
  validateConfirmPassword();

  if (isFormValid.value) {
    const userRole = registrationForm.value.email.endsWith('@volunteer.com') ? 'volunteer' : 'user';
    login('New user', userRole);

    alert('Succeed register!');
    router.push('/');
  }
};
</script>