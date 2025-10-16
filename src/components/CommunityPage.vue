<template>
  <div class="container my-5">
    <div class="row">
      <div class="col-12 text-center">
        <h2 class="display-5 fw-bold text-primary">
          <span aria-hidden="true">💬</span> HearYou Community Hub
        </h2>
        <p class="lead text-muted">Share your stories, find support, and rate helpful insights.</p>
      </div>
    </div>

    <div class="row mt-4">
      <div class="col-md-10 mx-auto">

        <div class="card shadow-sm mb-5" v-if="user.isLoggedIn">
          <div class="card-header bg-light">
            <h5 class="mb-0">
              <span aria-hidden="true">✍️</span> Share Your Thoughts
            </h5>
          </div>
          <div class="card-body">
            <form @submit.prevent="submitNewPost">
              <textarea 
                class="form-control mb-3"
                v-model="newPostContent"
                placeholder="What's on your mind? Share your coping strategies or ask for advice (Max 500 chars)..."
                rows="4"
                maxlength="500"
                required
              ></textarea>
              <div class="d-flex justify-content-between align-items-center">
                <small class="text-muted">{{ 500 - newPostContent.length }} characters left</small>
                <button type="submit" class="btn btn-primary">
                  Post to Community
                </button>
              </div>
            </form>
          </div>
        </div>

        <div class="card mb-4 shadow-lg post-card" v-for="post in postsWithRating" :key="post.id">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start">
              <h5 class="card-title mb-1 text-success fw-bold">
                {{ post.authorName || 'Anonymous' }}
                <span class="badge bg-secondary ms-2" v-if="post.authorId === user.uid">YOU</span>
              </h5>
              <div class="text-end">
                <span class="d-block text-muted small">
                  Avg. Rating: {{ formatStars(post.averageRating) }} ({{ post.averageRating }})
                </span>
              </div>
            </div>
            
            <p class="card-text mt-2">{{ post.content }}</p>

            <div class="d-flex justify-content-between align-items-center pt-2 border-top">
              <div v-if="user.isLoggedIn">
                <form @submit.prevent="handleRating(post.id)" class="d-flex align-items-center">
                  <select 
                    class="form-select form-select-sm me-2"
                    v-model.number="newRatings[post.id]"
                    aria-label="Select rating score from 1 to 5"
                    required
                    style="width: 100px;"
                  >
                    <option :value="null" disabled>Rate</option>
                    <option v-for="score in [5, 4.5, 4, 3.5, 3, 2.5, 2, 1.5, 1]" :key="score" :value="score">
                      {{ score.toFixed(1) }} Stars
                    </option>
                  </select>
                  <button type="submit" class="btn btn-sm btn-info text-white">Rate</button>
                </form>
              </div>
            </div>
          </div>
        </div>
        
        <div v-if="communityPosts.length === 0" class="alert alert-secondary text-center">
          No posts found. Be the first to share!
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { user } from '../userStore.js';
import { db } from '../firebase.js'; 
import { 
  collection, 
  query, 
  onSnapshot, 
  addDoc, 
  orderBy,
  serverTimestamp,
  where
} from "firebase/firestore";


// 🚨 MODIFIED: 现在 posts 也来自 Firestore
const communityPosts = ref([]); 
const ratings = ref([]); 
const newRatings = ref({});
const newPostContent = ref(''); // 🚨 NEW: 用于新帖子内容

// 🚨 Firestore Collection References
const postsCollection = collection(db, "posts");
const ratingsCollection = collection(db, "ratings");


// 🚨 NEW: 实时监听 posts 集合
const subscribeToPosts = () => {
    const postsQuery = query(postsCollection, orderBy("createdAt", "desc"));
    onSnapshot(postsQuery, (snapshot) => {
        communityPosts.value = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data() 
        }));
    }, (error) => {
        console.error("Error listening to posts:", error);
    });
};

// 实时监听 ratings 集合
const subscribeToRatings = () => {
    // 假设 ratings 集合数据量大，但为了 BR C.4，我们仍全量获取
    const ratingsQuery = query(ratingsCollection, orderBy("timestamp", "desc"));

    onSnapshot(ratingsQuery, (snapshot) => {
        ratings.value = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data() 
        }));
    }, (error) => {
        console.error("Error listening to ratings:", error);
    });
};


onMounted(() => {
  // 🚨 启动两个监听
  subscribeToPosts();
  subscribeToRatings();
});

// 🚨 NEW: 提交新帖子的逻辑
const submitNewPost = async () => {
    if (!user.value.isLoggedIn || !newPostContent.value.trim()) {
        alert('Please log in and enter content.');
        return;
    }
    
    try {
        await addDoc(postsCollection, {
            authorId: user.value.uid,
            authorName: user.value.name, // 使用 userStore 中的 name
            content: newPostContent.value.trim(),
            likes: 0,
            comments: 0, // 简化处理，实际应用中会有 comments 集合
            createdAt: serverTimestamp()
        });
        
        newPostContent.value = '';
        alert('Post published successfully!');
        
    } catch (error) {
        console.error("Error submitting new post: ", error);
        alert('Failed to publish post. Please check Firebase connection.');
    }
};


// 提交评分逻辑 (BR C.4)
const handleRating = async (postId) => { 

  if (!user.value.isLoggedIn || !user.value.uid) {
      alert('You must be logged in to submit a rating.');
      return;
  }
    
  const submittedRating = newRatings.value[postId];
  
  if (submittedRating && submittedRating >= 1 && submittedRating <= 5) {
    try {

      // 🚨 添加文档到 ratings 集合
      await addDoc(ratingsCollection, {
        postId: postId,
        userId: user.value.uid,
        score: submittedRating,
        timestamp: new Date()
      });

      // 成功后清除输入
      newRatings.value[postId] = null;
      alert('Rating submitted successfully!');
    } catch (error) {
      console.error("Error submitting rating: ", error);
      alert('Failed to submit rating. Please try again.');
    }
  } else {
      alert('Please select a valid score between 1 and 5.');
  }
};

// 🚨 Helper Function: 将数字评分转换为星级符号
const formatStars = (score) => {
    if (score === 'No ratings yet') return '☆☆☆☆☆';
    
    const num = parseFloat(score);
    const fullStars = Math.floor(num);
    const halfStar = num % 1 >= 0.25 && num % 1 <= 0.75 ? '⭐' : '';
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    return '⭐'.repeat(fullStars) + halfStar + '☆'.repeat(emptyStars);
};


const postsWithRating = computed(() => {
  return communityPosts.value.map(post => {
    const postRatings = ratings.value.filter(r => r.postId === post.id);
    const totalScore = postRatings.reduce((sum, r) => sum + r.score, 0);
    const averageRating = postRatings.length > 0
      ? (totalScore / postRatings.length).toFixed(1)
      : '0.0'; // 🚨 默认显示 0.0，而不是文本

    return {
      ...post,
      averageRating: averageRating,
      authorName: post.authorName || post.author, // 优先使用 Firestore 中的 authorName
      authorId: post.authorId // 🚨 确保存储 authorId 用于判断是否是自己的帖子
    };
  });
});
</script>

<style scoped>
.text-primary {
  color: #0d6efd !important;
}
.text-success {
    color: #198754 !important;
}
.post-card {
    border-left: 5px solid #0d6efd;
    transition: transform 0.2s;
}
.post-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
.form-select-sm {
    padding-top: 0.25rem;
    padding-bottom: 0.25rem;
    padding-left: 0.5rem;
    font-size: 0.75rem;
}
</style>