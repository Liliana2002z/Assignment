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

// 模拟动态帖子数据
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

// 创建一个计算属性来计算每个帖子的聚合评分
const postsWithRating = computed(() => {
  return communityPosts.value.map(post => {
    // 聚合评分逻辑：点赞数 + 评论数，或者您可以设计更复杂的算法
    const rating = post.likes + post.comments;
    return {
      ...post,
      rating: rating
    };
  });
});
</script>