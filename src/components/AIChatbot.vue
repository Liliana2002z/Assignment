<template>
  <div class="container my-5">
    <a href="#chat-container" class="skip-link">Skip to chat</a>

    <div class="row">
      <div class="col-lg-8 mx-auto">
        <div class="card shadow-sm mb-3">
          <div class="card-header bg-gradient-primary text-white">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h1 class="h4 mb-0">
                  <span aria-hidden="true">🤖</span> AI Mental Health Assistant
                </h1>
                <p class="mb-0 small">
                  Powered by Google Gemini AI - Available 24/7 for emotional support
                </p>
              </div>
              <button 
                class="btn btn-sm btn-light"
                @click="clearChat"
                aria-label="Clear chat history"
                v-if="messages.length > 1"
              >
                <span aria-hidden="true">🗑️</span> Clear
              </button>
            </div>
          </div>
        </div>

        <div class="alert alert-info d-flex align-items-start" role="alert">
          <span class="me-2 fs-4" aria-hidden="true">ℹ️</span>
          <div>
            <strong>Important:</strong> This AI assistant provides supportive conversations 
            but is not a substitute for professional mental health care. In case of crisis, 
            please contact <strong>Lifeline: 13 11 14</strong> or emergency services immediately.
          </div>
        </div>

        <div 
          v-if="crisisDetected" 
          class="alert alert-danger d-flex align-items-start" 
          role="alert"
          aria-live="assertive"
        >
          <span class="me-2 fs-4" aria-hidden="true">⚠️</span>
          <div>
            <strong>Crisis Support Resources:</strong>
            <ul class="mb-0 mt-2">
              <li><strong>Lifeline:</strong> 13 11 14 (24/7 crisis support)</li>
              <li><strong>Beyond Blue:</strong> 1300 22 4636</li>
              <li><strong>Kids Helpline:</strong> 1800 55 1800</li>
              <li><strong>Emergency:</strong> 000</li>
            </ul>
          </div>
        </div>

        <div v-if="!apiKeyConfigured" class="alert alert-warning d-flex align-items-start" role="alert">
          <span class="me-2 fs-4" aria-hidden="true">🔒</span>
          <div>
            <strong>Authentication Required:</strong> To use the real AI Assistant, you must be **logged in** to authorize the secure connection.
            <span v-if="apiKey === 'DEMO_MODE'">
              Currently running in **Demo Mode** with mock responses.
            </span>
            <button v-else class="btn btn-sm btn-outline-dark mt-2" @click="enableDemoMode">
              Enable Demo Mode
            </button>
          </div>
        </div>
        <div 
          id="chat-container"
          class="card shadow-sm chat-container"
          role="log"
          aria-live="polite"
          aria-label="Chat conversation"
        >
          <div class="card-body p-0">
            <div 
              class="messages-area p-3"
              ref="messagesArea"
              style="height: 500px; overflow-y: auto;"
            >
              <div 
                v-for="(message, index) in messages" 
                :key="index"
                class="message-wrapper mb-3"
                :class="message.role === 'user' ? 'text-end' : 'text-start'"
              >
                <div 
                  class="message d-inline-block"
                  :class="message.role === 'user' ? 'message-user' : 'message-ai'"
                  role="article"
                  :aria-label="`${message.role === 'user' ? 'Your message' : 'AI response'}: ${message.content}`"
                >
                  <div class="message-header mb-1">
                    <strong>
                      <span v-if="message.role === 'user'" aria-hidden="true">👤</span>
                      <span v-else aria-hidden="true">🤖</span>
                      {{ message.role === 'user' ? 'You' : 'AI Assistant' }}
                    </strong>
                    <small class="text-muted ms-2">{{ formatTime(message.timestamp) }}</small>
                  </div>
                  <div class="message-content" v-html="formatMessage(message.content)"></div>
                  
                  <div v-if="message.emotion" class="mt-2">
                    <span 
                      class="badge"
                      :class="getEmotionBadgeClass(message.emotion)"
                      :aria-label="`Detected emotion: ${message.emotion}`"
                    >
                      {{ getEmotionIcon(message.emotion) }} {{ message.emotion }}
                    </span>
                  </div>
                </div>
              </div>

              <div v-if="isTyping" class="message-wrapper text-start mb-3">
                <div class="message message-ai d-inline-block">
                  <div class="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            </div>

            <div class="input-area border-top p-3">
              <form @submit.prevent="sendMessage" aria-label="Message input form">
                <div class="input-group">
                  <label for="message-input" class="visually-hidden">
                    Type your message
                  </label>
                  <textarea
                    id="message-input"
                    v-model="userInput"
                    class="form-control"
                    placeholder="Share how you're feeling today..."
                    rows="2"
                    :disabled="isTyping || !apiKeyConfigured"
                    @keydown.enter.exact.prevent="sendMessage"
                    aria-describedby="input-help"
                  ></textarea>
                  <button 
                    class="btn btn-primary"
                    type="submit"
                    :disabled="!userInput.trim() || isTyping || !apiKeyConfigured"
                    aria-label="Send message"
                  >
                    <span v-if="!isTyping" aria-hidden="true">📤</span>
                    <span v-else class="spinner-border spinner-border-sm" role="status">
                      <span class="visually-hidden">Sending...</span>
                    </span>
                    Send
                  </button>
                </div>
                <small id="input-help" class="form-text text-muted">
                  Press Enter to send, Shift+Enter for new line
                </small>
              </form>
            </div>
          </div>
        </div>

        <div class="card shadow-sm mt-3">
          <div class="card-header">
            <h2 class="h6 mb-0">
              <span aria-hidden="true">💭</span> Quick Start Prompts
            </h2>
          </div>
          <div class="card-body">
            <div class="d-flex flex-wrap gap-2">
              <button 
                v-for="prompt in quickPrompts" 
                :key="prompt"
                class="btn btn-sm btn-outline-primary"
                @click="useQuickPrompt(prompt)"
                :disabled="isTyping || !apiKeyConfigured"
              >
                {{ prompt }}
              </button>
            </div>
          </div>
        </div>

        <div class="card shadow-sm mt-3">
          <div class="card-header bg-light">
            <h2 class="h6 mb-0">
              <span aria-hidden="true">✨</span> AI Assistant Features
            </h2>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-md-6">
                <h3 class="h6"><span aria-hidden="true">🎭</span> Emotion Detection</h3>
                <p class="small text-muted">
                  AI analyzes your messages to understand your emotional state
                </p>
              </div>
              <div class="col-md-6">
                <h3 class="h6"><span aria-hidden="true">🆘</span> Crisis Detection</h3>
                <p class="small text-muted">
                  Automatic detection of crisis keywords with resource suggestions
                </p>
              </div>
              <div class="col-md-6">
                <h3 class="h6"><span aria-hidden="true">💡</span> Supportive Responses</h3>
                <p class="small text-muted">
                  Empathetic and non-judgmental conversation support
                </p>
              </div>
              <div class="col-md-6">
                <h3 class="h6"><span aria-hidden="true">🔒</span> Privacy First</h3>
                <p class="small text-muted">
                  Your conversations are processed securely and not stored
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div 
      role="status" 
      aria-live="polite" 
      aria-atomic="true" 
      class="visually-hidden"
    >
      {{ announcement }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted } from 'vue';
// 🚨 NEW: 导入 auth 服务和 Firebase Auth 方法
import { auth } from '@/firebase'; 
import { getAuth, getIdToken, onAuthStateChanged } from 'firebase/auth'; 

// State
// 🚨 MODIFIED: 标记为后端控制
const apiKey = ref(''); 
const tempApiKey = ref(''); // 保持，但不再使用
// 🚨 MODIFIED: 默认为 false，等待认证成功
const apiKeyConfigured = ref(false); 
const userInput = ref('');
const messages = ref([]);
const isTyping = ref(false);
const crisisDetected = ref(false);
const announcement = ref('');
const messagesArea = ref(null);

// Quick prompts
const quickPrompts = [
  "I'm feeling anxious today",
  "How can I manage stress?",
  "I need someone to talk to",
  "Tips for better sleep",
  "Dealing with loneliness"
];

// Crisis keywords
const crisisKeywords = [
  'suicide', 'kill myself', 'end my life', 'want to die', 
  'self harm', 'hurt myself', 'no reason to live'
];

// 🚨 NEW: 获取用户ID Token的辅助函数
const getCurrentUserIdToken = async () => {
  const user = getAuth().currentUser;
  return user ? await getIdToken(user) : null;
};

// 🚨 NEW: Cloud Function URL
// !! 请替换 <REGION> 和 <PROJECT_ID> 为你的实际部署值 !!
const FUNCTION_URL = 'https://generatecontent-xzfjneptdq-uc.a.run.app';


// Initialize
onMounted(() => {
  // 🚨 MODIFIED: 移除所有前端 API Key 检查，改为检查认证状态。
  
  // 检查用户的认证状态。如果用户已登录，我们认为功能已配置。
  onAuthStateChanged(auth, (user) => {
    if (user) {
      apiKeyConfigured.value = true;
      apiKey.value = 'BACKEND_CONTROLLED';
      console.log('✅ User authenticated. AI Functionality enabled.');
    } else {
      // 只有在非 Demo Mode 下才禁用功能
      if (apiKey.value !== 'DEMO_MODE') {
          apiKeyConfigured.value = false;
          apiKey.value = '';
      }
      console.log('❌ User not authenticated.');
    }
  });
  
  // Add welcome message
  messages.value.push({
    role: 'assistant',
    content: "Hello! I'm your AI mental health assistant. I'm here to listen and provide support. How are you feeling today?",
    timestamp: new Date(),
    emotion: null
  });
});

// 🚨 REMOVED: saveApiKey 
const saveApiKey = () => {
  // 留空，因为 UI 元素已被移除
};

// 🚨 MODIFIED: Demo Mode 
const enableDemoMode = () => {
  apiKey.value = 'DEMO_MODE';
  apiKeyConfigured.value = true;
  announce('Demo mode enabled - using mock AI responses');
};

// Send message to Gemini API (逻辑保持不变，调用 callGeminiAPI)
const sendMessage = async () => {
  if (!userInput.value.trim() || isTyping.value || !apiKeyConfigured.value) return;

  const userMessage = userInput.value.trim();
  
  // Add user message
  messages.value.push({
    role: 'user',
    content: userMessage,
    timestamp: new Date(),
    emotion: detectEmotion(userMessage)
  });

  // Check for crisis keywords
  checkForCrisis(userMessage);

  userInput.value = '';
  isTyping.value = true;
  announce('Sending message');

  // Scroll to bottom
  await nextTick();
  scrollToBottom();

  try {
    // Call Gemini API
    const response = await callGeminiAPI(userMessage);
    
    // Add AI response
    messages.value.push({
      role: 'assistant',
      content: response,
      timestamp: new Date(),
      emotion: null
    });

    announce('Received response from AI');

  } catch (error) {
    console.error('Gemini API Error:', error);
    
    messages.value.push({
      role: 'assistant',
      content: `I apologize, but I'm having trouble connecting right now. Reason: ${error.message}. If you need immediate support, please contact Lifeline at 13 11 14.`,
      timestamp: new Date(),
      emotion: null
    });

    announce('Error sending message');
  } finally {
    isTyping.value = false;
    await nextTick();
    scrollToBottom();
  }
};

// 🚨 MODIFIED: Call Gemini API (现在调用 Firebase Function)
const callGeminiAPI = async (message) => {
  // 1. 如果在 Demo 模式，返回 Mock Response
  if (apiKey.value === 'DEMO_MODE') {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return getMockResponse(message);
  }

  // 2. 获取 ID Token 进行后端认证
  const idToken = await getCurrentUserIdToken();
  if (!idToken) {
    // 理论上 apiKeyConfigured 已经是 false 了，但做双重检查
    throw new Error("User not logged in."); 
  }

  // 3. 构造请求体 (与 functions/index.js 匹配)
  const requestBody = {
    prompt: message, // Function 期望的 key 是 prompt
  };

  try {
    const response = await fetch(FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 🚨 关键：发送 ID Token 进行身份验证
        'Authorization': `Bearer ${idToken}`, 
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage = errorData.error || `AI request failed with status: ${response.status}`;
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    if (data.content) {
      return data.content; // 返回 AI 生成的文本
    } else {
      throw new Error('Invalid response format from AI Function.');
    }
  } catch (error) {
    throw error;
  }
};


// Mock responses for demo mode (保持不变)
const getMockResponse = (message) => {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('anxious') || lowerMessage.includes('anxiety')) {
    return "I hear that you're feeling anxious, and I want you to know that your feelings are valid. Anxiety can be overwhelming, but there are ways to manage it.\n\nTry taking some slow, deep breaths - inhale for 4 counts, hold for 4, and exhale for 4. This can help calm your nervous system. Also, remember that it's okay to reach out for support from friends, family, or a counselor. Would you like to talk more about what's making you feel anxious?";
  }
  
  if (lowerMessage.includes('sad') || lowerMessage.includes('depressed')) {
    return "I'm sorry you're feeling this way. It takes courage to acknowledge when you're struggling, and I'm glad you're reaching out. Sadness is a natural emotion, but if it persists, it's important to talk to someone.\n\nIn the meantime, try to be gentle with yourself. Small things like going for a walk, listening to music you enjoy, or spending time with supportive people can help. Remember, you're not alone in this. How long have you been feeling this way?";
  }
  
  if (lowerMessage.includes('stress') || lowerMessage.includes('overwhelmed')) {
    return "Feeling stressed and overwhelmed is tough, and it's great that you're acknowledging it. When we're stressed, it's important to break things down into smaller, manageable steps.\n\nTry making a list of what's causing stress, then prioritize. Focus on one thing at a time. Also, make sure you're taking breaks, getting enough sleep, and doing activities that help you relax. Would you like to talk about specific stressors you're dealing with?";
  }
  
  if (lowerMessage.includes('lonely') || lowerMessage.includes('alone')) {
    return "Loneliness can feel really heavy, and I want you to know that you're heard. Even when it feels like you're alone, there are people and resources available to support you.\n\nConsider reaching out to someone you trust - even a small connection can help. You might also try joining online communities or groups based on your interests. Remember, asking for help is a sign of strength, not weakness. What kind of support would be most helpful for you right now?";
  }
  
  if (lowerMessage.includes('happy') || lowerMessage.includes('great') || lowerMessage.includes('good')) {
    return "That's wonderful to hear! I'm so glad you're feeling positive today. It's important to acknowledge and celebrate these good moments.\n\nWhat's contributing to your happiness today? Recognizing what brings you joy can help you cultivate more of it in your life. Keep doing what makes you feel good!";
  }
  
  // Default response
  return "Thank you for sharing that with me. I'm here to listen and support you. Your feelings are valid, and it's okay to not be okay sometimes.\n\nWould you like to tell me more about what you're experiencing? I'm here to help in any way I can. Remember, if you ever feel like you need immediate support, services like Lifeline (13 11 14) are available 24/7.";
};


// Detect emotion in text (保持不变)
const detectEmotion = (text) => {
  const lowerText = text.toLowerCase();
  
  if (lowerText.match(/happy|joy|excited|great|wonderful|amazing/)) return 'Happy';
  if (lowerText.match(/sad|depressed|down|unhappy|miserable/)) return 'Sad';
  if (lowerText.match(/anxious|worried|nervous|scared|afraid|panic/)) return 'Anxious';
  if (lowerText.match(/angry|mad|furious|frustrated|annoyed/)) return 'Angry';
  if (lowerText.match(/lonely|alone|isolated|empty/)) return 'Lonely';
  if (lowerText.match(/stressed|overwhelmed|pressure|exhausted/)) return 'Stressed';
  
  return null;
};

// Check for crisis keywords (保持不变)
const checkForCrisis = (text) => {
  const lowerText = text.toLowerCase();
  const hasCrisisKeyword = crisisKeywords.some(keyword => lowerText.includes(keyword));
  
  if (hasCrisisKeyword) {
    crisisDetected.value = true;
    announce('Crisis resources displayed');
  }
};

// Use quick prompt (保持不变)
const useQuickPrompt = (prompt) => {
  userInput.value = prompt;
  announce(`Quick prompt selected: ${prompt}`);
};

// Clear chat (保持不变)
const clearChat = () => {
  if (confirm('Are you sure you want to clear the chat history?')) {
    messages.value = [{
      role: 'assistant',
      content: "Chat cleared. How can I support you today?",
      timestamp: new Date(),
      emotion: null
    }];
    crisisDetected.value = false;
    announce('Chat cleared');
  }
};

// Format message with line breaks (保持不变)
const formatMessage = (content) => {
  return content
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
};

// Format timestamp (保持不变)
const formatTime = (date) => {
  return new Date(date).toLocaleTimeString('en-AU', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

// Get emotion badge class (保持不变)
const getEmotionBadgeClass = (emotion) => {
  const classes = {
    'Happy': 'bg-success',
    'Sad': 'bg-primary',
    'Anxious': 'bg-warning text-dark',
    'Angry': 'bg-danger',
    'Lonely': 'bg-info',
    'Stressed': 'bg-secondary'
  };
  return classes[emotion] || 'bg-secondary';
};

// Get emotion icon (保持不变)
const getEmotionIcon = (emotion) => {
  const icons = {
    'Happy': '😊',
    'Sad': '😢',
    'Anxious': '😰',
    'Angry': '😠',
    'Lonely': '😔',
    'Stressed': '😓'
  };
  return icons[emotion] || '💭';
};

// Scroll to bottom (保持不变)
const scrollToBottom = () => {
  if (messagesArea.value) {
    messagesArea.value.scrollTop = messagesArea.value.scrollHeight;
  }
};

// Announce to screen readers (保持不变)
const announce = (message) => {
  announcement.value = message;
  setTimeout(() => {
    announcement.value = '';
  }, 3000);
};
</script>

<style scoped>
/* Styles remain unchanged */
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: #0d6efd;
  color: white;
  padding: 8px;
  text-decoration: none;
  z-index: 100;
}

.skip-link:focus {
  top: 0;
}

.bg-gradient-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.chat-container {
  border: none;
}

.messages-area {
  background-color: #f8f9fa;
}

.messages-area::-webkit-scrollbar {
  width: 8px;
}

.messages-area::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.messages-area::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.messages-area::-webkit-scrollbar-thumb:hover {
  background: #555;
}

.message {
  max-width: 75%;
  padding: 12px 16px;
  border-radius: 16px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

.message-user {
  background-color: #0d6efd;
  color: white;
}

.message-ai {
  background-color: white;
  border: 1px solid #dee2e6;
}

.message-header {
  font-size: 0.875rem;
}

.message-content {
  line-height: 1.5;
}

.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 8px;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #6c757d;
  animation: typing 1.4s infinite;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.7;
  }
  30% {
    transform: translateY(-10px);
    opacity: 1;
  }
}

.input-area textarea {
  resize: none;
  border-right: none;
}

.input-area textarea:focus {
  border-color: #ced4da;
  box-shadow: none;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.gap-2 {
  gap: 0.5rem;
}
</style>