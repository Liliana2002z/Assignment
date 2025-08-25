<template>
  <div class="container my-5">
    <div class="row">
      <div class="col-12 text-center">
        <h2>社区论坛</h2>
        <p class="lead">分享你的故事，连接志同道合的人。</p>
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
                点赞: {{ post.likes }} | 评论: {{ post.comments }}
              </div>
              <div class="text-end">
                <strong>聚合评分: {{ post.rating }}</strong>
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
    content: '最近学业压力有点大，但是听音乐让我放松了许多。',
    likes: 5,
    comments: 2
  },
  {
    id: 2,
    author: 'Chloe',
    content: '很高兴能在这里帮助大家，分享正能量是我的目标！',
    likes: 12,
    comments: 5
  },
  {
    id: 3,
    author: '匿名用户',
    content: '第一次在这里发帖，感觉这里很安全，没有评判。',
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