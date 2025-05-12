<script setup>
import { ref, computed } from 'vue'

const emit = defineEmits(['update:isShow', 'update:changeDate'])
const props = defineProps({
  isShow: {
    type: Boolean,
    default: false,
  },
  changeDate: {
    type: null,
  },
})

const currentDate = ref(new Date())
const selectedDate = ref(null)

const monthYear = computed(() => {
  return currentDate.value.toLocaleString('default', { month: 'long', year: 'numeric' })
})

const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

const dates = computed(() => {
  const startOfMonth = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), 1)
  const endOfMonth = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 0)
  const datesArray = []

  // Добавляем пустые ячейки для дней перед первым числом месяца
  const firstDayIndex = (startOfMonth.getDay() + 6) % 7 // Преобразуем воскресенье (0) в 6
  for (let i = 0; i < firstDayIndex; i++) {
    datesArray.push('')
  }

  // Добавляем числа месяца
  for (let i = 1; i <= endOfMonth.getDate(); i++) {
    datesArray.push(i)
  }

  return datesArray
})

const prevMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
}

const nextMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
}

const selectDate = (date) => {
  if (date) {
    selectedDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), date)
    emit('update:changeDate', selectedDate.value)
    closeCalendar()
  }
}

const isSelected = (date) => {
  if (!date) return false
  const selected = selectedDate.value
  return selected && selected.getDate() === date && selected.getMonth() === currentDate.value.getMonth()
}

const closeCalendar = () => {
  emit('update:isShow', !props.isShow)
}
</script>

<template>
  <div class="calendar">
    <div class="calendar__header">
      <button class="calendar__btn" @click="prevMonth">«</button>
      <h2>{{ monthYear }}</h2>
      <button class="calendar__btn" @click="nextMonth">»</button>
    </div>
    <div class="calendar__grid">
      <div class="calendar__day" v-for="day in days" :key="day">{{ day }}</div>
      <div
        class="calendar__date"
        v-for="date in dates"
        :key="date"
        @click="
          () => {
            selectDate(date)
            closeCalendar()
          }
        "
        :class="{ selected: isSelected(date) }"
      >
        {{ date }}
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.calendar {
  max-width: 308px;
  width: 100%;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: var(--light-color);
  overflow: hidden;
  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    background-color: #f0f0f0;
  }
  &__grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
  }

  &__day {
    font-weight: bold;
    text-align: center;
    padding: 10px;
  }

  &__date {
    text-align: center;
    padding: 10px;
    cursor: pointer;
    &.selected {
      background-color: var(--accent-color);
      color: white;
    }
  }

  &__btn {
    height: 25px;
    width: 25px;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    border-radius: 5px;
    border: 1px solid var(--accent-color);
    background-color: var(--accent-color);
    color: var(--light-color);
  }
}
</style>
