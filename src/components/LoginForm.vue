<template>
  <div class="container my-5">
    <div class="row">
      <div class="col-md-6 mx-auto">
        <div class="card p-4 shadow-sm">
          <h2 class="card-title text-center">User Login</h2>

          <form @submit.prevent="handleLogin">
            <div class="mb-3">
              <label for="loginEmail" class="form-label">Email</label>
              <input 
                type="email" 
                class="form-control" 
                id="loginEmail" 
                v-model="loginForm.email" 
                required
                aria-label="Key your register Email"
              >
            </div>
            
            <div class="mb-3">
              <label for="loginPassword" class="form-label">Password</label>
              <input 
                type="password" 
                class="form-control" 
                id="loginPassword" 
                v-model="loginForm.password" 
                required
                aria-label="Key your password"
              >
            </div>

            <button type="submit" class="btn btn-primary w-100">Login</button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { auth } from '../firebase.js'; 
import { signInWithEmailAndPassword } from "firebase/auth";

const loginForm = ref({
  email: '',
  password: ''
});

const router = useRouter();

const handleLogin = async () => { 
  const { email, password } = loginForm.value;
  try {

    await signInWithEmailAndPassword(auth, email, password);


    router.push('/');
  } catch (error) {
    alert(`Login failed: ${error.message}`);
  }
};
</script>