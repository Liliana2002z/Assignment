<template>
  <div class="container my-5">
    <div class="row">
      <div class="col-md-8 mx-auto">
        <div class="card p-4 shadow-lg">
          <h2 class="card-title text-center">BR (D.2) Email Sender & GenAI</h2>
          
          <div v-if="message" :class="['alert mt-3', message.type === 'success' ? 'alert-success' : 'alert-danger']">
            {{ message.text }}
          </div>

          <form @submit.prevent="sendEmail">
            
            <div class="mb-3">
              <label for="toEmail" class="form-label">Recipient Email</label>
              <input type="email" class="form-control" id="toEmail" v-model="emailForm.to" required>
            </div>
            
            <div class="mb-3">
              <label for="subject" class="form-label">Subject</label>
              <input type="text" class="form-control" id="subject" v-model="emailForm.subject" required>
            </div>
            
            <div class="mb-3">
              <label for="text" class="form-label">Body Text</label>
              <textarea class="form-control" id="text" rows="5" v-model="emailForm.text" required></textarea>
            </div>

            <div class="card bg-light p-3 mb-4">
              <h5 class="card-title mb-2">GenAI Assistant (Gemini)</h5>
              <div class="mb-3">
                <label for="aiPrompt" class="form-label">AI Prompt</label>
                <input 
                    type="text" 
                    class="form-control" 
                    id="aiPrompt" 
                    v-model="aiPrompt" 
                    placeholder="e.g., Draft a welcome email for new users"
                >
              </div>
              <button 
                type="button" 
                class="btn btn-info w-100" 
                @click="generateEmailContent"
                :disabled="isGenerating || isSending"
              >
                {{ isGenerating ? 'Generating...' : 'Generate Email Body' }}
              </button>
            </div>
            <div class="mb-3">
              <label for="attachment" class="form-label">Attachment (PDF, TXT, etc.)</label>
              <input type="file" class="form-control" id="attachment" @change="handleFileChange"> 
              <div class="form-text">Accepted formats include PDF, TXT, and common image files (max 5MB).</div>
            </div>

            <button type="submit" class="btn btn-primary w-100" :disabled="isSending || isGenerating">
              {{ isSending ? 'Sending...' : 'Send Email' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { auth } from '../firebase.js'; 
import axios from 'axios';

// 🚨 必须更新这两个 URL！请在部署 functions/index.js 后替换为您实际的 Cloud Function URL
const SEND_FUNCTION_URL = 'https://sendemailv2-xzfjneptdq-uc.a.run.app'; 
const GENERATE_FUNCTION_URL = 'https://us-central1-a-a5d64.cloudfunctions.net/generateContent'; 

const MAX_FILE_SIZE = 5242880; 

const emailForm = ref({
  to: '',
  subject: 'Test Email from HealthYouth App',
  text: 'This email was sent with optional attachment functionality.',
  file: null, // file 对象
});

const isSending = ref(false);
const isGenerating = ref(false); // 🚨 新增：AI 状态变量
const message = ref(null); // { text: string, type: 'success' | 'danger' }

// 🚨 新增：AI 提示词
const aiPrompt = ref('Draft a polite short email body to a client about a small project delay.'); 

const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file && file.size > MAX_FILE_SIZE) {
    alert('File size exceeds the 5MB limit. Please choose a smaller file.');
    event.target.value = null; 
    emailForm.value.file = null;
  } else {
    emailForm.value.file = file;
  }
};

// -----------------------------------------------------
// 🚨 新增：AI 内容生成函数
// -----------------------------------------------------
const generateEmailContent = async () => {
  if (!auth.currentUser) {
    message.value = { text: 'Authentication required for AI feature. Please log in.', type: 'danger' };
    return;
  }
  if (!aiPrompt.value.trim()) {
    message.value = { text: 'Please enter a prompt for the AI.', type: 'danger' };
    return;
  }

  isGenerating.value = true;
  message.value = null;

  try {
    const token = await auth.currentUser.getIdToken();
    
    const response = await axios.post(
        GENERATE_FUNCTION_URL, // 调用新的 AI 函数
        { prompt: aiPrompt.value.trim() },
        {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            }
        }
    );

    const generatedText = response.data.content;
    
    // 成功后，将生成的内容填充到邮件正文
    emailForm.value.text = generatedText;

    message.value = { 
        text: 'AI content generated and filled into body text!', 
        type: 'success' 
    };

  } catch (error) {
    console.error("AI Function call failed:", error);
    const errorData = error.response ? error.response.data : {};
    let errorText = errorData.error || error.message;

    message.value = { text: `AI generation failed. Error: ${errorText}`, type: 'danger' };
  } finally {
    isGenerating.value = false;
  }
};


// -----------------------------------------------------
// 现有函数: sendEmail (注意更新 FUNCTION_URL)
// -----------------------------------------------------
const sendEmail = async () => {
  if (!auth.currentUser) {
    message.value = { text: 'Authentication required. Please log in before sending an email.', type: 'danger' };
    return;
  }

  isSending.value = true;
  message.value = null;

  const file = emailForm.value.file;
  let base64Attachment = null;
  let fileName = null;
  let fileType = null;
  
  if (file && file.size <= MAX_FILE_SIZE) {
    base64Attachment = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
          const base64String = reader.result.split(',')[1].replace(/[\r\n\s]/g, '');
          resolve(base64String); 
      };
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
    
    fileName = file.name;
    fileType = file.type;
  }

  try {
    const token = await auth.currentUser.getIdToken();
    
    const response = await axios.post(
        SEND_FUNCTION_URL, // 🚨 注意这里使用了 SEND_FUNCTION_URL
        {
            to: emailForm.value.to,
            subject: emailForm.value.subject,
            text: emailForm.value.text,
            attachmentBase64: base64Attachment, 
            filename: fileName,
            filetype: fileType,
        },
        {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            }
        }
    );

    message.value = { 
        text: response.data.message || 'Email sent successfully!', 
        type: 'success' 
    };
    emailForm.value.to = '';
    emailForm.value.file = null;

  } catch (error) {
    console.error("Function call failed:", error);
    const errorData = error.response ? error.response.data : {};
    let errorText = errorData.error || error.message;

    message.value = { text: `Email failed to send. Error: ${errorText}`, type: 'danger' };
  } finally {
    isSending.value = false;
  }
};
</script>