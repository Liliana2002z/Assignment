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
        <div class="card mb-3" v-for="post in postsWithRating" :key="post.id">
          <div class="card-body">
            <h5 class="card-title">{{ post.author }}</h5>
            <p class="card-text">{{ post.content }}</p>
            <div class="d-flex justify-content-between align-items-center mt-3">
              <div class="text-muted">
                Likes: {{ post.likes }} | Comments: {{ post.comments }}
              </div>
              <div class="text-end">
                <strong>Scores: {{ post.rating }}</strong>
              </div>
            </div>
            </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

// Simulate dynamic post data
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

// Create a computational attribute to calculate the aggregated score of each post
const postsWithRating = computed(() => {
  return communityPosts.value.map(post => {
    const rating = post.likes + post.comments;
    return {
      ...post,
      rating: rating
    };
  });
});
</script>