<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  modelValue: Number,
  disabledDates: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['update:modelValue'])

const isCalendarVisible = ref(false)
const dateRange = ref(null)
const formattedDate = ref('Выберите дату')

const calendarAttributes = computed(() => [
  {
    highlight: true,
    dates: new Date(),
  },
])

// Переключение видимости календаря
const toggleCalendar = () => {
  isCalendarVisible.value = !isCalendarVisible.value
}

const handleDateUpdate = (date) => {
  if (date) {
    const timestamp = new Date(date).getTime()
    emit('update:modelValue', timestamp)
    formatDisplayDate(date)
  }
}

const formatDisplayDate = (date) => {
  const dateObj = new Date(date)
  formattedDate.value = dateObj
    .toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
    .replace(/\//g, '.')
}

watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) {
      dateRange.value = new Date(newVal)
      formatDisplayDate(new Date(newVal))
    } else {
      formattedDate.value = 'Выберите дату'
      dateRange.value = null
    }
  },
  { immediate: true }
)

// Закрытие календаря при клике вне его
const handleClickOutside = (event) => {
  const calendarEl = event.target.closest('.wrap-calendar')
  if (!calendarEl && isCalendarVisible.value) {
    isCalendarVisible.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="wrap-calendar">
    <div class="price__item-btnCalendar" @click="toggleCalendar">
      {{ formattedDate }}
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M14.9386 6.7124L10.0486 11.6024C9.47109 12.1799 8.52609 12.1799 7.94859 11.6024L3.05859 6.7124"
          stroke="#1A1A1A"
          stroke-width="1.5"
          stroke-miterlimit="10"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </div>
    <div v-if="isCalendarVisible" class="calendar-container">
      <VDatePicker
        v-model="dateRange"
        :attributes="calendarAttributes"
        :disabled-dates="disabledDates"
        mode="dateTime"
        is24hr
        :columns="1"
        :is-range="false"
        @update:modelValue="handleDateUpdate"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.wrap-calendar {
  position: relative;
  width: max-content;
}

.price__item-btnCalendar {
  cursor: pointer;
  padding: 8px 15px;
  border: 1px solid #1a1a1a;
  border-radius: 7px;
  font-family: Aeroport;
  font-size: 16px;
  font-weight: 400;
  max-width: 233px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-bottom: 15px;
}

.calendar-container {
  position: absolute;
  top: 43px;
  transform: translateX(50%);
  right: 0;
  z-index: 4;
}
</style>
