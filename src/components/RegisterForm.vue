<template>
  <div class="container my-5">
    <div class="row">
      <div class="col-md-6 mx-auto">
        <div class="card p-4 shadow-sm">
          <h2 class="card-title text-center">User Register</h2>
          
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

            <button type="submit" class="btn btn-primary w-100" :disabled="!isFormValid">Register</button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { auth } from '../firebase.js'; 
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";

const registrationForm = ref({
  email: '',
  password: '',
  confirmPassword: ''
});

// Verification status
const emailError = ref('');
const passwordError = ref('');
const confirmPasswordError = ref('');

// used to enable/disable the submit button
const isFormValid = computed(() => {
  return !emailError.value && !passwordError.value && !confirmPasswordError.value &&
         registrationForm.value.email && registrationForm.value.password && registrationForm.value.confirmPassword;
});

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
  // Re-verify and confirm the password
  validateConfirmPassword();
};

const validateConfirmPassword = () => {
  if (registrationForm.value.password !== registrationForm.value.confirmPassword) {
    confirmPasswordError.value = 'Not match.';
  } else {
    confirmPasswordError.value = '';
  }
};

// Submit processing function
const router = useRouter();
const handleRegister = async () => { 
  validateEmail();
  validatePassword();
  validateConfirmPassword();

  if (isFormValid.value) {
    const { email, password } = registrationForm.value;
    try {

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      await updateProfile(userCredential.user, {
        displayName: '新用户' 
      });

      alert('Succeed register!');

      router.push('/');
    } catch (error) {

      alert(`Registration failed: ${error.message}`);
    }
  }
};
</script>