<template>
  <div class="container my-5">
    <div class="row">
      <div class="col-12 text-center">
        <h2>Community</h2>
        <p class="lead">Share your stories, link with interests.</p>
      </div>
    </div>

    <div class="row mt-4">
      <div class="col-md-10 mx-auto">
        <div class="card mb-4" v-for="post in postsWithRating" :key="post.id">
          <div class="card-body">
            <h5 class="card-title">{{ post.author }}</h5>
            <p class="card-text">{{ post.content }}</p>
            <div class="d-flex justify-content-between align-items-center mt-3">
              <div class="text-muted">
                Likes: {{ post.likes }} | Comments: {{ post.comments }}
              </div>
              <div class="text-end">
                <strong>Average Score: {{ post.averageRating }}</strong>
              </div>
            </div>

            <div class="mt-3" v-if="user.isLoggedIn">
              <h6>Rate this post:</h6>
              <form @submit.prevent="handleRating(post.id)">
                <div class="d-flex align-items-center">
                  <input
                    type="number"
                    class="form-control me-2"
                    v-model.number="newRatings[post.id]"
                    min="1"
                    max="5"
                    step="0.1"
                    required
                  />
                  <button type="submit" class="btn btn-sm btn-primary">Submit</button>
                </div>
              </form>
            </div>
            
            <div class="mt-2 text-muted" v-else>
              Please log in to submit a rating.
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watchEffect } from 'vue';
import { user } from '../userStore.js';

// dynamic posts
const communityPosts = ref([
  {
    id: 1,
    author: 'Alex',
    content: 'I have tons of study pressure, but listening to music helps a lot.',
    likes: 5,
    comments: 2
  },
  {
    id: 2,
    author: 'Chloe',
    content: 'Glad to be here to help, my aim is to share positive energy!',
    likes: 12,
    comments: 5
  },
  {
    id: 3,
    author: 'Nobody',
    content: 'First post here, feel safe and no judgement.',
    likes: 8,
    comments: 3
  }
]);


const getInitialRatings = () => {
  const savedRatings = localStorage.getItem('communityRatings');

  return savedRatings ? JSON.parse(savedRatings) : [
    { postId: 1, userId: 'user1', score: 4 },
    { postId: 1, userId: 'user2', score: 5 },
    { postId: 2, userId: 'user1', score: 3.5 },
    { postId: 3, userId: 'user3', score: 4.5 },
    { postId: 1, userId: 'user3', score: 3 },
    { postId: 2, userId: 'user4', score: 5 },
    { postId: 3, userId: 'user5', score: 4 }
  ];
};

const ratings = ref(getInitialRatings());
const newRatings = ref({});

// watchEffect，save to localStorage
watchEffect(() => {
  localStorage.setItem('communityRatings', JSON.stringify(ratings.value));
});

const handleRating = (postId) => {
  const submittedRating = newRatings.value[postId];
  
  if (submittedRating) {
    ratings.value.push({
      postId: postId,
      userId: user.value.name,
      score: submittedRating
    });
    newRatings.value[postId] = null;
    alert('Rating submitted successfully!');
  }
};

const postsWithRating = computed(() => {
  return communityPosts.value.map(post => {
    const postRatings = ratings.value.filter(r => r.postId === post.id);
    const totalScore = postRatings.reduce((sum, r) => sum + r.score, 0);
    const averageRating = postRatings.length > 0
      ? (totalScore / postRatings.length).toFixed(1)
      : 'No ratings yet';

    return {
      ...post,
      averageRating: averageRating
    };
  });
});
</script>

<style scoped>
/* 可选的样式 */
</style>