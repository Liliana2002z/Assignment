<template>
  <div class="container my-5">
    <div class="row">
      <div class="col-md-8 mx-auto">
        <div class="card p-4 shadow-lg">
          <h2 class="card-title text-center">BR (D.2) Email Sender</h2>
          
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
              <textarea class="form-control" id="text" rows="3" v-model="emailForm.text" required></textarea>
            </div>

            <div class="mb-3">
              <label for="attachment" class="form-label">Attachment (PDF, TXT, etc.)</label>
              <input type="file" class="form-control" id="attachment" @change="handleFileChange"> 
              <div class="form-text">Accepted formats include PDF, TXT, and common image files (max 5MB).</div>
            </div>

            <button type="submit" class="btn btn-primary w-100" :disabled="isSending">
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

// Cloud Function URL (请确保 LOCATION 和 PROJECT_ID 正确)
const FUNCTION_URL = 'https://us-central1-a-a5d64.cloudfunctions.net/sendEmailV2';

const MAX_FILE_SIZE = 5242880; 

const emailForm = ref({
  to: '',
  subject: 'Test Email from HealthYouth App',
  text: 'This email was sent with optional attachment functionality.',
  file: null, // file 对象
});

const isSending = ref(false);
const message = ref(null); // { text: string, type: 'success' | 'danger' }

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

const sendEmail = async () => {
  if (!auth.currentUser) {
    message.value = { text: 'Authentication required. Please log in before sending an email.', type: 'danger' };
    return;
  }
  // 🚨 修复点 2：移除对 emailForm.value.file 的强制检查

  isSending.value = true;
  message.value = null;

  const file = emailForm.value.file;
  let base64Attachment = null;
  let fileName = null;
  let fileType = null;
  
  // 🚨 修复点 3：仅当文件存在且大小合适时，才进行 Base64 转换
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
        FUNCTION_URL,
        {
            to: emailForm.value.to,
            subject: emailForm.value.subject,
            text: emailForm.value.text,
            attachmentBase64: base64Attachment, // 值为 null 或 Base64 字符串
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