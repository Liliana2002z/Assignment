<template>
  <div class="container my-5">
    <!-- Skip link for accessibility -->
    <a href="#calendar-container" class="skip-link">Skip to calendar</a>

    <div class="row">
      <div class="col-12">
        <!-- Header -->
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

        <!-- Info Alert -->
        <div class="alert alert-info d-flex align-items-start mb-4" role="alert">
          <span class="me-2 fs-5" aria-hidden="true">ℹ️</span>
          <div>
            <strong>How to book:</strong> Click on an available time slot to book an appointment. 
            Click on an existing appointment to view details or cancel.
          </div>
        </div>

        <!-- Main Content Row -->
        <div class="row">
          <!-- Calendar Section -->
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

          <!-- Sidebar Section -->
          <div class="col-lg-4">
            <!-- Counselor Selection -->
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

                <!-- Selected Counselor Info -->
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

            <!-- Legend -->
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
                  <div class="legend-box bg-success"></div>
                  <span class="small">Available Slots (Click to book)</span>
                </div>
                <div class="d-flex align-items-center">
                  <div class="legend-box bg-danger"></div>
                  <span class="small">Unavailable (Already booked)</span>
                </div>
              </div>
            </div>

            <!-- Your Appointments -->
            <div class="card shadow-sm">
              <div class="card-header bg-warning text-dark">
                <h2 class="h5 mb-0">
                  <span aria-hidden="true">📋</span> Your Appointments
                </h2>
              </div>
              <div class="card-body">
                <div v-if="userAppointments.length === 0" class="text-muted text-center py-3">
                  <p class="mb-0">No appointments scheduled</p>
                </div>
                <div v-else>
                  <div 
                    v-for="apt in userAppointments" 
                    :key="apt.id"
                    class="appointment-item p-2 mb-2 border rounded"
                  >
                    <div class="d-flex justify-content-between align-items-start">
                      <div class="flex-grow-1">
                        <h3 class="h6 mb-1">{{ apt.title }}</h3>
                        <small class="text-muted d-block">
                          {{ formatDate(apt.start) }}
                        </small>
                        <small class="text-muted d-block">
                          {{ formatTime(apt.start) }} - {{ formatTime(apt.end) }}
                        </small>
                      </div>
                      <button 
                        class="btn btn-sm btn-outline-danger"
                        @click="cancelAppointment(apt)"
                        :aria-label="`Cancel appointment with ${apt.counselorName}`"
                      >
                        <span aria-hidden="true">🗑️</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Booking Modal -->
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

              <!-- Conflict Warning -->
              <div v-if="hasConflict" class="alert alert-danger" role="alert">
                <strong>⚠️ Booking Conflict!</strong> You already have an appointment at this time.
              </div>

              <div class="d-grid gap-2">
                <button 
                  type="submit" 
                  class="btn btn-primary"
                  :disabled="hasConflict"
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

    <!-- Appointment Details Modal -->
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
            >
              <span aria-hidden="true">🗑️</span> Cancel Appointment
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

    <!-- Screen reader announcements -->
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
import { ref, computed, onMounted } from 'vue';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';

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

// Mock counselors data
const counselors = ref([
  {
    id: 1,
    name: 'Dr. Sarah Johnson',
    specialty: 'Anxiety & Depression',
    availability: 'Mon-Fri 9AM-5PM'
  },
  {
    id: 2,
    name: 'Dr. Michael Chen',
    specialty: 'Teen Counseling',
    availability: 'Tue-Sat 10AM-6PM'
  },
  {
    id: 3,
    name: 'Dr. Emily Williams',
    specialty: 'Trauma & PTSD',
    availability: 'Mon-Thu 8AM-4PM'
  },
  {
    id: 4,
    name: 'Dr. James Brown',
    specialty: 'Family Therapy',
    availability: 'Wed-Sun 11AM-7PM'
  }
]);

// Helper functions (defined before calendar options)
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

// Handle date selection (defined before calendar options)
const handleDateSelect = (selectInfo) => {
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
  
  // Default to first counselor if none selected
  let counselor = selectedCounselorInfo.value;
  if (!counselor) {
    counselor = counselors.value[0];
  }
  
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

// Handle event click (defined before calendar options)
const handleEventClick = (clickInfo) => {
  const event = clickInfo.event;
  
  if (event.extendedProps.isUserAppointment) {
    // User's own appointment - show details
    selectedEvent.value = event;
    showDetailsModal.value = true;
    announce('Appointment details opened');
  } else if (event.extendedProps.isAvailable) {
    // Available slot - allow booking
    const start = event.start;
    const end = event.end;
    
    bookingData.value = {
      counselorId: event.extendedProps.counselorId,
      counselorName: event.extendedProps.counselorName,
      start: start,
      end: end,
      type: 'individual',
      notes: ''
    };
    
    showBookingModal.value = true;
    announce('Booking form opened for available slot');
  } else {
    // Unavailable slot
    announce('This time slot is not available');
    alert('This time slot is already booked by another user');
  }
};

// Selected counselor info
const selectedCounselorInfo = computed(() => {
  if (!selectedCounselor.value) return null;
  return counselors.value.find(c => c.id === selectedCounselor.value);
});

// User's appointments
const userAppointments = computed(() => {
  return appointments.value.filter(apt => apt.isUserAppointment);
});

// Check for booking conflicts
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

// Calendar options
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
    daysOfWeek: [1, 2, 3, 4, 5], // Monday - Friday
    startTime: '09:00',
    endTime: '17:00'
  },
  slotDuration: '01:00:00',
  snapDuration: '00:30:00'
});

// Initialize with mock data
onMounted(() => {
  generateMockAppointments();
  announce('Calendar loaded successfully');
});

// Generate mock appointments
const generateMockAppointments = () => {
  const now = new Date();
  const mockAppointments = [];
  
  // Add some booked slots (unavailable) - with more visible colors
  for (let i = 0; i < 8; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() + Math.floor(Math.random() * 7));
    date.setHours(9 + Math.floor(Math.random() * 8), 0, 0, 0);
    
    const counselor = counselors.value[Math.floor(Math.random() * counselors.value.length)];
    
    mockAppointments.push({
      id: `apt-${i}`,
      title: `Unavailable - ${counselor.name}`,
      start: date.toISOString(),
      end: new Date(date.getTime() + 60 * 60 * 1000).toISOString(),
      backgroundColor: '#dc3545',
      borderColor: '#dc3545',
      textColor: '#ffffff',
      display: 'block',
      extendedProps: {
        counselorId: counselor.id,
        counselorName: counselor.name,
        isUserAppointment: false,
        isAvailable: false
      }
    });
  }
  
  // Add user's existing appointment
  const userDate = new Date(now);
  userDate.setDate(userDate.getDate() + 2);
  userDate.setHours(14, 0, 0, 0);
  
  mockAppointments.push({
    id: 'user-apt-1',
    title: '✓ Your Appointment - Dr. Sarah Johnson',
    start: userDate.toISOString(),
    end: new Date(userDate.getTime() + 60 * 60 * 1000).toISOString(),
    backgroundColor: '#0d6efd',
    borderColor: '#0d6efd',
    textColor: '#ffffff',
    display: 'block',
    extendedProps: {
      counselorId: 1,
      counselorName: 'Dr. Sarah Johnson',
      type: 'individual',
      notes: 'Discussing anxiety management techniques',
      isUserAppointment: true,
      isAvailable: false
    }
  });

  // Add another user appointment
  const userDate2 = new Date(now);
  userDate2.setDate(userDate2.getDate() + 4);
  userDate2.setHours(10, 0, 0, 0);
  
  mockAppointments.push({
    id: 'user-apt-2',
    title: '✓ Your Appointment - Dr. Michael Chen',
    start: userDate2.toISOString(),
    end: new Date(userDate2.getTime() + 60 * 60 * 1000).toISOString(),
    backgroundColor: '#0d6efd',
    borderColor: '#0d6efd',
    textColor: '#ffffff',
    display: 'block',
    extendedProps: {
      counselorId: 2,
      counselorName: 'Dr. Michael Chen',
      type: 'individual',
      notes: 'Follow-up session',
      isUserAppointment: true,
      isAvailable: false
    }
  });

  // Add some available slots (shown in green)
  for (let i = 0; i < 6; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() + Math.floor(Math.random() * 7) + 1);
    date.setHours(10 + i * 2, 0, 0, 0);
    
    const counselor = counselors.value[i % counselors.value.length];
    
    mockAppointments.push({
      id: `available-${i}`,
      title: `Available - ${counselor.name}`,
      start: date.toISOString(),
      end: new Date(date.getTime() + 60 * 60 * 1000).toISOString(),
      backgroundColor: '#28a745',
      borderColor: '#28a745',
      textColor: '#ffffff',
      display: 'block',
      classNames: ['available-slot'],
      extendedProps: {
        counselorId: counselor.id,
        counselorName: counselor.name,
        isUserAppointment: false,
        isAvailable: true
      }
    });
  }
  
  appointments.value = mockAppointments;
  calendarOptions.value.events = mockAppointments;
};

// Confirm booking
const confirmBooking = () => {
  if (hasConflict.value) {
    announce('Cannot book - time conflict detected');
    return;
  }
  
  const newAppointment = {
    id: `user-apt-${Date.now()}`,
    title: `Your Appointment - ${bookingData.value.counselorName}`,
    start: bookingData.value.start.toISOString(),
    end: bookingData.value.end.toISOString(),
    backgroundColor: '#0d6efd',
    borderColor: '#0d6efd',
    display: 'block',
    extendedProps: {
      counselorId: bookingData.value.counselorId,
      counselorName: bookingData.value.counselorName,
      type: bookingData.value.type,
      notes: bookingData.value.notes,
      isUserAppointment: true,
      isAvailable: false
    }
  };
  
  appointments.value.push(newAppointment);
  calendarOptions.value.events = [...appointments.value];
  
  closeBookingModal();
  announce('Appointment booked successfully');
  alert('Appointment booked successfully!');
};

// Cancel appointment
const cancelAppointment = (apt) => {
  if (confirm('Are you sure you want to cancel this appointment?')) {
    appointments.value = appointments.value.filter(a => a.id !== apt.id);
    calendarOptions.value.events = [...appointments.value];
    announce('Appointment cancelled');
  }
};

// Cancel from modal
const cancelAppointmentFromModal = () => {
  if (selectedEvent.value) {
    const aptId = selectedEvent.value.id;
    if (confirm('Are you sure you want to cancel this appointment?')) {
      appointments.value = appointments.value.filter(a => a.id !== aptId);
      calendarOptions.value.events = [...appointments.value];
      showDetailsModal.value = false;
      announce('Appointment cancelled');
    }
  }
};

// Close booking modal
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

// Change calendar view
const changeView = () => {
  if (fullCalendar.value) {
    const calendarApi = fullCalendar.value.getApi();
    calendarApi.changeView(currentView.value);
    announce(`Calendar view changed to ${currentView.value}`);
  }
};

// Load counselor schedule
const loadCounselorSchedule = () => {
  if (selectedCounselor.value) {
    const counselor = counselors.value.find(c => c.id === selectedCounselor.value);
    announce(`Showing schedule for ${counselor.name}`);
  } else {
    announce('Showing all counselors');
  }
  
  // Filter events by counselor if selected
  if (selectedCounselor.value) {
    calendarOptions.value.events = appointments.value.filter(
      apt => apt.extendedProps.counselorId === selectedCounselor.value
    );
  } else {
    calendarOptions.value.events = [...appointments.value];
  }
};
</script>

<style scoped>
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