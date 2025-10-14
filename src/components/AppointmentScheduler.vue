<template>
  <div class="container my-5">
    <div class="row">
      <div class="col-md-10 mx-auto">
        <div class="card p-4 shadow-lg">
          <h2 class="card-title text-center mb-4">Book Your Session</h2>
          
          <div v-if="message" :class="['alert mt-3', message.type === 'success' ? 'alert-success' : 'alert-danger']">
            {{ message.text }}
          </div>

          <FullCalendar 
            :options="calendarOptions"
          />
          
        </div>
      </div>
    </div>
    <BookingModal :isOpen="isModalOpen" :selectedSlot="selectedSlot" @close="isModalOpen = false" @confirm="handleBookingConfirm" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { auth } from '../firebase.js'; 
import axios from 'axios';
// 假设您还需要创建一个 BookingModal.vue 组件，这里暂时省略其实现
// import BookingModal from '../components/BookingModal.vue'; 

const API_BASE_URL = 'YOUR_API_BASE_URL'; // 您的 Cloud Function 基础 URL

const isModalOpen = ref(false);
const selectedSlot = ref(null);
const message = ref(null);

// ------------------------------------
// 核心日历配置
// ------------------------------------
const calendarOptions = ref({
  plugins: [dayGridPlugin, interactionPlugin],
  initialView: 'dayGridMonth', 
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,dayGridWeek'
  },
  editable: false, // 用户不能拖拽事件
  selectable: true, // 允许用户选择时段
  events: [], // 这里将从 Firebase 加载事件
  
  // 核心交互：用户点击事件 (预约时段)
  eventClick: handleEventClick,

  // 时间格式化和区域设置（可选）
  locale: 'zh-cn',
});

// ------------------------------------
// 事件处理逻辑
// ------------------------------------

// 用户点击日历上的事件（可预约时段）
function handleEventClick(clickInfo) {
  // 检查是否是可预约事件
  if (clickInfo.event.extendedProps.isAvailable) {
    selectedSlot.value = {
      id: clickInfo.event.id,
      start: clickInfo.event.start,
      end: clickInfo.event.end,
      title: clickInfo.event.title,
      // 假设咨询师 ID 存储在事件中
      consultantId: clickInfo.event.extendedProps.consultantId
    };
    isModalOpen.value = true; // 打开确认模态框
  } else {
    message.value = { text: 'This slot is already booked or unavailable.', type: 'danger' };
  }
}

// 假设预约确认发生在模态框中并触发此函数
async function handleBookingConfirm(details) {
  isModalOpen.value = false;
  if (!auth.currentUser) {
    message.value = { text: 'Please log in to make a booking.', type: 'danger' };
    return;
  }
  
  // 真实实现中，这里会调用 Cloud Function 来创建预约
  message.value = { text: `Attempting to book slot from ${selectedSlot.value.start.toLocaleString()}...`, type: 'success' };
  
  // 最终的预约逻辑将放入 Phase 2/3 (后端)
}

// ------------------------------------
// 数据加载 (目前是模拟数据)
// ------------------------------------
onMounted(() => {
  // 🚨 真实场景中，这里应该调用 Cloud Function 获取预约数据
  loadScheduleEvents(); 
});

// 模拟加载可预约事件
function loadScheduleEvents() {
  // 模拟一些可预约时段（需要咨询师先在后端创建）
  calendarOptions.value.events = [
    {
      id: 'slot-1',
      title: 'Available',
      start: '2025-10-20T10:00:00',
      end: '2025-10-20T11:00:00',
      color: '#28a745', // 绿色表示可用
      extendedProps: {
        isAvailable: true,
        consultantId: 'cons-1'
      }
    },
    {
      id: 'slot-2',
      title: 'Booked',
      start: '2025-10-21T14:00:00',
      end: '2025-10-21T15:00:00',
      color: '#dc3545', // 红色表示已预约
      extendedProps: {
        isAvailable: false,
        consultantId: 'cons-1'
      }
    },
    // ... 更多事件
  ];
}
</script>

<style scoped>
/* 可以添加一些 FullCalendar 的自定义样式 */
</style>