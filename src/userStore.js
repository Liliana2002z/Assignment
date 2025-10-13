import { ref } from 'vue';
import { auth } from './firebase.js';
import { onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";


const user = ref({
  isLoggedIn: false,
  uid: null, // Firebase User ID
  name: 'Guest',
  role: 'user',
  points: 0,
  badges: []
});

onAuthStateChanged(auth, (firebaseUser) => {
  if (firebaseUser) {

    user.value.isLoggedIn = true;
    user.value.uid = firebaseUser.uid;
    user.value.name = firebaseUser.displayName || firebaseUser.email;

  //C.2
    const userEmail = firebaseUser.email || '';
    user.value.role = userEmail.endsWith('@volunteer.com') ? 'volunteer' : 'user';
    

  } else {
    user.value.isLoggedIn = false;
    user.value.uid = null;
    user.value.name = 'Guest';
    user.value.role = 'user';
  }
});


const signOut = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error("Sign out error:", error);
  }
};


export { user, signOut };