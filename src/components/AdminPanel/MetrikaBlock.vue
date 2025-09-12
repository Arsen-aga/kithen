<script setup>
import { Chart, registerables } from 'chart.js/auto'
import axios from 'axios'
import { onMounted } from 'vue'
import { useDefaultItems } from '@/stores/default'

const store = useDefaultItems()
const user = store.getUser
const apiUrl = store.getApiUrl
Chart.register(...registerables)

// const getRegister = () => {
//   let authGet = `&auth=${user.username}:${user.auth_key}`
//   axios.get(apiUrl + 'api-stat/reg' + authGet).then((response) => {
//     console.log(response.data)
//     renderChart(response.data)
//   })
// }

const renderChart = (state) => {
  const ctx = document.getElementById('allRegisterChart').getContext('2d')
  console.log(ctx)

  // Текущая дата
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth() + 1 // Месяцы начинаются с 0
  //   const currentDay = currentDate.getDate();

  // Дата начала регистрации (например, 1 сентября 2024 года)
  const startDate = new Date(2025, 8, 1) // Месяцы начинаются с 0, поэтому 8 означает сентябрь
  const startYear = startDate.getFullYear()
  const startMonth = startDate.getMonth() + 1 // Месяцы начинаются с 0

  // Подготовка данных для графика
  const usersCount = state.stat // Количество зарегистрированных пользователей
  const labels = [`${startMonth}.${startYear}`, `${currentMonth}.${currentYear}`] // Оси X
  const data = [0, usersCount] // Данные для графика

  // Настройки графика
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Кол-во регистраций',
          data: data,
          borderColor: 'purple',
          pointBackgroundColor: 'white',
          pointBorderColor: 'purple',
          pointRadius: 5,
          pointHoverRadius: 7,
          pointHitRadius: 15,
          borderWidth: 2,
          backgroundColor: 'rgba(128, 0, 128, 0.1)',
          tension: 0.4, // Сглаживание линии
          animation: {
            duration: 3000, // Время анимации в миллисекундах
            easing: 'easeInOutQuart', // Тип анимации
          },
        },
      ],
    },
    options: {
      plugins: {
        legend: {
          display: false, // Скрываем легенду
        },
      },
      scales: {},
    },
  })
}

onMounted(() => {
  renderChart()
  // getRegister()
})
</script>

<template>
  <div class="metrika">
    <div class="chart">
      <div class="biggesthead">Кол-во пользователей</div>
      <canvas id="allRegisterChart"></canvas>
    </div>
  </div>
</template>

<style scoped>
.metrika {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}
.chart {
  width: calc(50% - 10px);
  display: flex;
  flex-direction: column;

  gap: 20px;
}
.biggesthead {
  color: #333;
  font-family: Onest;
  font-size: 16px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
}
</style>
