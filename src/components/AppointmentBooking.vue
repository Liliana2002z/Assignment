<template>
  <div class="container my-5">
    <a href="#calendar-container" class="skip-link">Skip to calendar</a>

    <div class="row">
      <div class="col-12">
        <div class="card shadow-sm mb-4">
          <div class="card-header bg-gradient-primary text-white">
            <h1 class="h4 mb-0">
              <span aria-hidden="true">🗓️</span> Appointment Booking System
            </h1>
            <p class="mb-0 small">
              Book counseling sessions with our mental health professionals
            </p>
          </div>
        </div>

        <div class="alert alert-info d-flex align-items-start mb-4" role="alert">
          <span class="me-2 fs-5" aria-hidden="true">ℹ️</span>
          <div>
            <strong>How to book:</strong> Click on an available time slot to book an appointment. 
            Click on an existing appointment to view details or cancel.
          </div>
        </div>

        <div v-if="!currentUserId" class="alert alert-warning d-flex align-items-start mb-4" role="alert">
          <span class="me-2 fs-5" aria-hidden="true">🔒</span>
          <strong>Please Log In:</strong> You must be logged in to view or book appointments.
        </div>
        
        <div class="row">
          <div class="col-lg-8 mb-4">
            <div class="card shadow-sm">
              <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                <h2 class="h5 mb-0">
                  <span aria-hidden="true">📅</span> Available Time Slots
                </h2>
                <div class="btn-group btn-group-sm" role="group" aria-label="Calendar view options">
                  <input 
                    type="radio" 
                    class="btn-check" 
                    name="calendarView" 
                    id="view-week" 
                    value="timeGridWeek"
                    v-model="currentView"
                    @change="changeView"
                    autocomplete="off"
                  >
                  <label class="btn btn-outline-light" for="view-week">Week</label>

                  <input 
                    type="radio" 
                    class="btn-check" 
                    name="calendarView" 
                    id="view-day" 
                    value="timeGridDay"
                    v-model="currentView"
                    @change="changeView"
                    autocomplete="off"
                  >
                  <label class="btn btn-outline-light" for="view-day">Day</label>

                  <input 
                    type="radio" 
                    class="btn-check" 
                    name="calendarView" 
                    id="view-list" 
                    value="listWeek"
                    v-model="currentView"
                    @change="changeView"
                    autocomplete="off"
                  >
                  <label class="btn btn-outline-light" for="view-list">List</label>
                </div>
              </div>
              <div class="card-body p-3" id="calendar-container">
                <FullCalendar
                  ref="fullCalendar"
                  :options="calendarOptions"
                  role="application"
                  aria-label="Appointment calendar"
                />
              </div>
            </div>
          </div>

          <div class="col-lg-4">
            <div class="card shadow-sm mb-3">
              <div class="card-header bg-success text-white">
                <h2 class="h5 mb-0">
                  <span aria-hidden="true">👨‍⚕️</span> Select Counselor
                </h2>
              </div>
              <div class="card-body">
                <div class="mb-3">
                  <label for="counselor-select" class="form-label">Choose a counselor</label>
                  <select 
                    id="counselor-select"
                    class="form-select" 
                    v-model="selectedCounselor"
                    @change="loadCounselorSchedule"
                    aria-describedby="counselor-help"
                    :disabled="!currentUserId"
                  >
                    <option value="">All Counselors</option>
                    <option 
                      v-for="counselor in counselors" 
                      :key="counselor.id"
                      :value="counselor.id"
                    >
                      {{ counselor.name }} - {{ counselor.specialty }}
                    </option>
                  </select>
                  <div id="counselor-help" class="form-text">
                    Filter appointments by counselor
                  </div>
                </div>

                <div v-if="selectedCounselorInfo" class="alert alert-light">
                  <h3 class="h6 mb-2">{{ selectedCounselorInfo.name }}</h3>
                  <p class="small mb-1">
                    <strong>Specialty:</strong> {{ selectedCounselorInfo.specialty }}
                  </p>
                  <p class="small mb-0">
                    <strong>Available:</strong> {{ selectedCounselorInfo.availability }}
                  </p>
                </div>
              </div>
            </div>

            <div class="card shadow-sm mb-3">
              <div class="card-header bg-info text-white">
                <h2 class="h5 mb-0">
                  <span aria-hidden="true">🎨</span> Legend
                </h2>
              </div>
              <div class="card-body">
                <div class="d-flex align-items-center mb-2">
                  <div class="legend-box bg-primary"></div>
                  <span class="small">Your Appointments (Click to view details)</span>
                </div>
                <div class="d-flex align-items-center mb-2">
                  <div class="legend-box bg-danger"></div>
                  <span class="small">Unavailable (Booked by others)</span>
                </div>
                </div>
            </div>

            </div>
        </div>
      </div>
    </div>

    <div 
      v-if="showBookingModal"
      class="modal fade show d-block" 
      tabindex="-1"
      role="dialog"
      aria-labelledby="bookingModalLabel"
      aria-modal="true"
      style="background-color: rgba(0,0,0,0.5);"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header bg-primary text-white">
            <h3 class="modal-title h5" id="bookingModalLabel">
              Book Appointment
            </h3>
            <button 
              type="button" 
              class="btn-close btn-close-white" 
              @click="closeBookingModal"
              aria-label="Close modal"
            ></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="confirmBooking">
              <div class="mb-3">
                <label for="apt-counselor" class="form-label">Counselor</label>
                <input 
                  id="apt-counselor"
                  type="text" 
                  class="form-control" 
                  :value="bookingData.counselorName"
                  readonly
                  aria-readonly="true"
                />
              </div>

              <div class="mb-3">
                <label for="apt-date" class="form-label">Date</label>
                <input 
                  id="apt-date"
                  type="text" 
                  class="form-control" 
                  :value="formatDate(bookingData.start)"
                  readonly
                  aria-readonly="true"
                />
              </div>

              <div class="row">
                <div class="col-6 mb-3">
                  <label for="apt-start" class="form-label">Start Time</label>
                  <input 
                    id="apt-start"
                    type="text" 
                    class="form-control" 
                    :value="formatTime(bookingData.start)"
                    readonly
                    aria-readonly="true"
                  />
                </div>
                <div class="col-6 mb-3">
                  <label for="apt-end" class="form-label">End Time</label>
                  <input 
                    id="apt-end"
                    type="text" 
                    class="form-control" 
                    :value="formatTime(bookingData.end)"
                    readonly
                    aria-readonly="true"
                  />
                </div>
              </div>

              <div class="mb-3">
                <label for="apt-type" class="form-label">Session Type</label>
                <select 
                  id="apt-type"
                  class="form-select" 
                  v-model="bookingData.type"
                  required
                >
                  <option value="individual">Individual Counseling</option>
                  <option value="group">Group Session</option>
                  <option value="emergency">Crisis Support</option>
                </select>
              </div>

              <div class="mb-3">
                <label for="apt-notes" class="form-label">
                  Notes (Optional)
                </label>
                <textarea 
                  id="apt-notes"
                  class="form-control" 
                  v-model="bookingData.notes"
                  rows="3"
                  placeholder="Any specific concerns or topics you'd like to discuss..."
                ></textarea>
              </div>

              <div v-if="hasConflict" class="alert alert-danger" role="alert">
                <strong>⚠️ Booking Conflict!</strong> You already have an appointment at this time.
              </div>
              
              <div v-if="!currentUserId" class="alert alert-danger" role="alert">
                <strong>⚠️ Login Required!</strong> Please log in before confirming a booking.
              </div>

              <div class="d-grid gap-2">
                <button 
                  type="submit" 
                  class="btn btn-primary"
                  :disabled="hasConflict || !currentUserId"
                >
                  <span aria-hidden="true">✓</span> Confirm Booking
                </button>
                <button 
                  type="button" 
                  class="btn btn-secondary"
                  @click="closeBookingModal"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <div 
      v-if="showDetailsModal"
      class="modal fade show d-block" 
      tabindex="-1"
      role="dialog"
      aria-labelledby="detailsModalLabel"
      aria-modal="true"
      style="background-color: rgba(0,0,0,0.5);"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header bg-info text-white">
            <h3 class="modal-title h5" id="detailsModalLabel">
              Appointment Details
            </h3>
            <button 
              type="button" 
              class="btn-close btn-close-white" 
              @click="showDetailsModal = false"
              aria-label="Close modal"
            ></button>
          </div>
          <div class="modal-body">
            <dl class="row">
              <dt class="col-sm-4">Counselor:</dt>
              <dd class="col-sm-8">{{ selectedEvent?.extendedProps?.counselorName }}</dd>

              <dt class="col-sm-4">Date:</dt>
              <dd class="col-sm-8">{{ formatDate(selectedEvent?.start) }}</dd>

              <dt class="col-sm-4">Time:</dt>
              <dd class="col-sm-8">
                {{ formatTime(selectedEvent?.start) }} - {{ formatTime(selectedEvent?.end) }}
              </dd>

              <dt class="col-sm-4">Type:</dt>
              <dd class="col-sm-8">{{ getSessionTypeLabel(selectedEvent?.extendedProps?.type) }}</dd>

              <dt class="col-sm-4">Status:</dt>
              <dd class="col-sm-8">
                <span class="badge bg-success">Confirmed</span>
              </dd>

              <dt class="col-sm-4" v-if="selectedEvent?.extendedProps?.notes">Notes:</dt>
              <dd class="col-sm-8" v-if="selectedEvent?.extendedProps?.notes">
                {{ selectedEvent.extendedProps.notes }}
              </dd>
            </dl>
          </div>
          <div class="modal-footer">
            <button 
              type="button" 
              class="btn btn-danger"
              @click="cancelAppointmentFromModal"
              :disabled="selectedEvent?.extendedProps?.userId !== currentUserId"
            >
              <span aria-hidden="true">🗑️</span> Cancel My Appointment
            </button>
            <button 
              type="button" 
              class="btn btn-secondary"
              @click="showDetailsModal = false"
            >
              Close
            </button>
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
import { ref, computed, onMounted, watch } from 'vue';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';

// 🚨 NEW: 导入 userStore (用于同步登录状态)
import { user } from '../userStore.js'; 
import { db, auth } from '@/firebase'; 
import { collection, onSnapshot, query, addDoc, deleteDoc, doc } from 'firebase/firestore';


// State
const fullCalendar = ref(null);
const currentView = ref('timeGridWeek');
const selectedCounselor = ref('');
const showBookingModal = ref(false);
const showDetailsModal = ref(false);
const selectedEvent = ref(null);
const announcement = ref('');
const appointments = ref([]);
const bookingData = ref({
  counselorId: '',
  counselorName: '',
  start: null,
  end: null,
  type: 'individual',
  notes: ''
});
// 🚨 MODIFIED: 使用 userStore 的状态作为计算属性 (解决时序问题)
const currentUserId = computed(() => user.value.uid); 


// Firestore 集合引用
const appointmentsCollection = collection(db, 'appointments');

// Mock counselors data (作为常量保留)
const counselors = ref([
  {
    id: 'coun1',
    name: 'Dr. Sarah Johnson',
    specialty: 'Anxiety & Depression',
    availability: 'Mon-Fri 9AM-5PM'
  },
  {
    id: 'coun2',
    name: 'Dr. Michael Chen',
    specialty: 'Teen Counseling',
    availability: 'Tue-Sat 10AM-6PM'
  },
  {
    id: 'coun3',
    name: 'Dr. Emily Williams',
    specialty: 'Trauma & PTSD',
    availability: 'Mon-Thu 8AM-4PM'
  },
  {
    id: 'coun4',
    name: 'Dr. James Brown',
    specialty: 'Family Therapy',
    availability: 'Wed-Sun 11AM-7PM'
  }
]);


// 实时监听函数
const subscribeToAppointments = () => {
  if (!currentUserId.value) return; 
  
  const q = query(appointmentsCollection); 
  const currentUID = currentUserId.value; 

  onSnapshot(q, (snapshot) => {
    const fetchedAppointments = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      const isUser = data.userId === currentUID; 
      const counselor = counselors.value.find(c => c.id === data.counselorId);
      
      const startDate = data.start?.toDate ? data.start.toDate() : new Date(data.start);
      const endDate = data.end?.toDate ? data.end.toDate() : new Date(data.end);

      // 映射 Firestore 数据到 FullCalendar event 格式
      fetchedAppointments.push({
        id: doc.id, 
        title: isUser 
          ? `✓ Your Appointment - ${counselor ? counselor.name : 'Unknown'}`
          : `Booked - ${counselor ? counselor.name : 'Unknown'}`,
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        backgroundColor: isUser ? '#0d6efd' : '#dc3545', 
        borderColor: isUser ? '#0d6efd' : '#dc3545',
        textColor: '#ffffff',
        display: 'block',
        extendedProps: {
          counselorId: data.counselorId,
          counselorName: counselor ? counselor.name : 'Unknown',
          type: data.type,
          notes: data.notes || '',
          userId: data.userId, 
          isUserAppointment: isUser,
          isAvailable: false 
        }
      });
    });

    appointments.value = fetchedAppointments;
    calendarOptions.value.events = fetchedAppointments;
    announce('Appointments synchronized');
  }, (error) => {
    console.error("Firestore appointment subscription failed:", error);
    announce('Error loading appointments');
  });
};


// Helper functions (保持不变)
const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-AU', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const formatTime = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleTimeString('en-AU', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getSessionTypeLabel = (type) => {
  const labels = {
    'individual': 'Individual Counseling',
    'group': 'Group Session',
    'emergency': 'Crisis Support'
  };
  return labels[type] || type;
};

const announce = (message) => {
  announcement.value = message;
  setTimeout(() => {
    announcement.value = '';
  }, 3000);
};

// Handle date selection (处理日历上的空闲时间选择)
const handleDateSelect = (selectInfo) => {
  if (!currentUserId.value) {
    announce('Please log in to book an appointment.');
    alert('Please log in to book an appointment.');
    return;
  }
  
  const start = selectInfo.start;
  const end = selectInfo.end;
  
  // Check if selecting past time
  if (start < new Date()) {
    announce('Cannot book appointments in the past');
    alert('Cannot book appointments in the past');
    return;
  }
  
  // Check if outside business hours
  const hour = start.getHours();
  if (hour < 8 || hour >= 20) {
    announce('Selected time is outside business hours');
    alert('Please select a time between 8 AM and 8 PM');
    return;
  }
  
  // 检查所选时间段是否已被预定 (检查 appointments.value)
  const isBooked = appointments.value.some(apt => {
    const aptStart = new Date(apt.start);
    const aptEnd = new Date(apt.end);
    return (start < aptEnd && end > aptStart);
  });

  if (isBooked) {
    announce('Selected time slot is already booked.');
    alert('Selected time slot is already booked.');
    return;
  }

  let counselor = selectedCounselorInfo.value || counselors.value[0];
  
  bookingData.value = {
    counselorId: counselor.id,
    counselorName: counselor.name,
    start: start,
    end: end,
    type: 'individual',
    notes: ''
  };
  
  showBookingModal.value = true;
  announce('Booking form opened');
};

// Handle event click (处理日历上的已有事件点击) (保持不变)
const handleEventClick = (clickInfo) => {
  const event = clickInfo.event;
  
  if (event.extendedProps.isUserAppointment) {
    selectedEvent.value = event;
    showDetailsModal.value = true;
    announce('Appointment details opened');
  } else {
    announce('This is a booked appointment. You cannot view or modify it.');
    alert('This slot is booked by another user.');
  }
};

// Selected counselor info (保持不变)
const selectedCounselorInfo = computed(() => {
  if (!selectedCounselor.value) return null;
  return counselors.value.find(c => c.id === selectedCounselor.value);
});

// User's appointments (保持不变)
const userAppointments = computed(() => {
  return appointments.value.filter(apt => apt.extendedProps.isUserAppointment);
});

// Check for booking conflicts (保持不变)
const hasConflict = computed(() => {
  if (!bookingData.value.start || !bookingData.value.end) return false;
  
  const newStart = new Date(bookingData.value.start);
  const newEnd = new Date(bookingData.value.end);
  
  return userAppointments.value.some(apt => {
    const aptStart = new Date(apt.start);
    const aptEnd = new Date(apt.end);
    
    return (newStart < aptEnd && newEnd > aptStart);
  });
});


// Calendar options (保持不变)
const calendarOptions = ref({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin],
  initialView: 'timeGridWeek',
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: ''
  },
  slotMinTime: '08:00:00',
  slotMaxTime: '20:00:00',
  allDaySlot: false,
  expandRows: true,
  height: 'auto',
  selectable: true, 
  selectMirror: true,
  select: handleDateSelect,
  eventClick: handleEventClick,
  events: [], 
  businessHours: {
    daysOfWeek: [1, 2, 3, 4, 5], 
    startTime: '09:00',
    endTime: '17:00'
  },
  slotDuration: '01:00:00',
  snapDuration: '00:30:00'
});

// 🚨 MODIFIED: Initialize - 移除 onAuthStateChanged 的重复监听，改用 watch
onMounted(() => {
  // 监控 currentUserId 的变化，以防用户在当前页面登录/登出
  watch(currentUserId, (newUid) => {
      if (newUid) {
          subscribeToAppointments();
          announce('User logged in. Appointments subscribing.');
      } else {
          // 清除数据
          appointments.value = [];
          calendarOptions.value.events = []; 
          announce('User logged out. Appointments cleared.');
      }
  }, { immediate: true }); // immediate: true 确保在组件挂载时立即检查一次 UID

  announce('Calendar mounted successfully');
});


// Confirm booking - 写入 Firestore (保持不变)
const confirmBooking = async () => {
  if (hasConflict.value || !currentUserId.value) {
    if (!currentUserId.value) alert('Booking failed: You must be logged in.');
    if (hasConflict.value) announce('Booking failed: Time conflict detected.');
    return;
  }
  
  const counselor = counselors.value.find(c => c.id === bookingData.value.counselorId);

  const newAppointmentDoc = {
    userId: currentUserId.value, 
    counselorId: bookingData.value.counselorId,
    start: new Date(bookingData.value.start), 
    end: new Date(bookingData.value.end),
    type: bookingData.value.type,
    notes: bookingData.value.notes,
    counselorName: counselor.name,
    createdAt: new Date()
  };
  
  try {
    await addDoc(appointmentsCollection, newAppointmentDoc);
    
    closeBookingModal();
    announce('Appointment booked successfully and saved!');
    alert('Appointment booked successfully!');
    
  } catch (error) {
    console.error("Error booking appointment:", error);
    announce('Error booking appointment');
    alert('Error booking appointment. Please check your network and Firebase rules.');
  }
};

// Cancel appointment - 删除 Firestore 文档 (保持不变)
const cancelAppointment = async (apt) => {
  if (!currentUserId.value || apt.extendedProps.userId !== currentUserId.value) {
    announce('Error: You can only cancel your own appointments.');
    return;
  }
  
  if (confirm('Are you sure you want to cancel this appointment?')) {
    try {
      const docRef = doc(db, 'appointments', apt.id);
      await deleteDoc(docRef);
      
      announce('Appointment cancelled successfully');
      
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      announce('Error cancelling appointment');
      alert('Error cancelling appointment. Check console for details.');
    }
  }
};

// Cancel from modal (保持不变)
const cancelAppointmentFromModal = () => {
  if (selectedEvent.value) {
    cancelAppointment(selectedEvent.value);
    showDetailsModal.value = false;
  }
};

// Close booking modal (保持不变)
const closeBookingModal = () => {
  showBookingModal.value = false;
  bookingData.value = {
    counselorId: '',
    counselorName: '',
    start: null,
    end: null,
    type: 'individual',
    notes: ''
  };
};

// Change calendar view (保持不变)
const changeView = () => {
  if (fullCalendar.value) {
    const calendarApi = fullCalendar.value.getApi();
    calendarApi.changeView(currentView.value);
    announce(`Calendar view changed to ${currentView.value}`);
  }
};

// Load counselor schedule (保持不变)
const loadCounselorSchedule = () => {
  if (selectedCounselor.value) {
    const counselor = counselors.value.find(c => c.id === selectedCounselor.value);
    announce(`Showing schedule for ${counselor.name}`);
    
    calendarOptions.value.events = appointments.value.filter(
      apt => apt.extendedProps.counselorId === selectedCounselor.value
    );
  } else {
    announce('Showing all counselors');
    calendarOptions.value.events = [...appointments.value];
  }
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

.legend-box {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  margin-right: 8px;
}

.appointment-item {
  background-color: #f8f9fa;
  transition: background-color 0.2s;
}

.appointment-item:hover {
  background-color: #e9ecef;
}

.modal.show {
  display: block;
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

/* FullCalendar custom styles */
:deep(.fc) {
  font-family: inherit;
}

:deep(.fc-button) {
  background-color: #0d6efd !important;
  border-color: #0d6efd !important;
}

:deep(.fc-button:hover) {
  background-color: #0b5ed7 !important;
}

:deep(.fc-button:disabled) {
  background-color: #6c757d !important;
  border-color: #6c757d !important;
}

:deep(.fc-event) {
  cursor: pointer;
  font-size: 0.85rem;
  padding: 2px 4px;
  border-radius: 3px;
}

:deep(.fc-event:hover) {
  opacity: 0.8;
  transform: scale(1.02);
}

:deep(.available-slot) {
  cursor: pointer;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.85;
  }
}

:deep(.fc-timegrid-slot) {
  height: 3rem;
}

:deep(.fc-toolbar-title) {
  font-size: 1.25rem;
  font-weight: 600;
}
</style>