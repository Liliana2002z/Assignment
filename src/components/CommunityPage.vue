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
                <strong>Average Score: {{ post.averageRating }}</strong>
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

const ratings = ref([
  { postId: 1, userId: 'user1', score: 4 },
  { postId: 1, userId: 'user2', score: 5 },
  { postId: 2, userId: 'user1', score: 3.5 },
  { postId: 3, userId: 'user3', score: 4.5 },
  { postId: 1, userId: 'user3', score: 3 },
  { postId: 2, userId: 'user4', score: 5 },
  { postId: 3, userId: 'user5', score: 4 }
]);

// Create a computational attribute to calculate the aggregated score of each post
const postsWithRating = computed(() => {
  return communityPosts.value.map(post => {
    // 过滤出与当前帖子 ID 匹配的所有评分
    const postRatings = ratings.value.filter(r => r.postId === post.id);
    // 计算总分
    const totalScore = postRatings.reduce((sum, r) => sum + r.score, 0);
    // 计算平均分，如果没有评分则显示“No ratings yet”
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