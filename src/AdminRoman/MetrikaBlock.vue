<script setup>
import { Chart, registerables } from "chart.js";
import axios from "axios";
import { onMounted } from "vue";
import { useStore } from "vuex";

const store = useStore();
const user = store.getters.getUser;
const apiUrl = store.getters.getApiUrl;
Chart.register(...registerables);
// const salary = ref([]);
onMounted(() => {
  //   renderChart();
  getRegister();
});

const getRegister = () => {
  let authGet = `&auth=${user.username}:${user.auth_key}`;
  axios.get(apiUrl + "api-stat/reg" + authGet).then((response) => {
    console.log(response.data);
    renderChart(response.data);
  });
  axios.get(apiUrl + "api-stat/reg-by-school" + authGet).then((response) => {
    const schoolsData = response.data.stat;
   
    
    const filteredSchools = schoolsData.filter(
      (school) => school.school_id != null
    );

    // Сортируем по количеству регистраций в порядке убывания
    const sortedSchools = filteredSchools.sort((a, b) => b.count - a.count);

    // Берем топ-5 школ
    const top5Schools = sortedSchools.slice(0, 5);
   
    const top5SchoolsIds = top5Schools.map((school) => school.school_id);
    
    // Выполним запросы для получения данных по каждой школе
    Promise.all(
      top5SchoolsIds.map((id) => axios.get(apiUrl + "api-school/get&id=" + id + authGet))
    ).then((responses) => {
        
      const schoolsInfo = responses.map((res) => res.data);
      // Формируем финальные данные для построения графика
      const finalData = schoolsInfo.map((info, i) => ({
        label: info.school.name,
        data: [top5Schools[i].count],
      }));
      
      // Строим график
      buildBarChart(finalData);
    });
  });


  axios.get(apiUrl + "api-stat/reg-by-city" + authGet).then((response) => {
    const schoolsData = response.data.stat;
   console.log('reg-by-city', schoolsData);
   
    
    const filteredSchools = schoolsData.filter(
      (school) => school.school_id != null
    );

    // Сортируем по количеству регистраций в порядке убывания
    const sortedSchools = filteredSchools.sort((a, b) => b.count - a.count);

    // Берем топ-5 школ
    const top5Schools = sortedSchools.slice(0, 5);
   
    const top5SchoolsIds = top5Schools.map((school) => school.school_id);
    console.log(top5SchoolsIds);
    // Выполним запросы для получения данных по каждой школе
    Promise.all(
      top5SchoolsIds.map((id) => axios.get(apiUrl + "api-school/get&id=" + id + authGet))
    ).then((responses) => {
        
      const schoolsInfo = responses.map((res) => res.data);
      console.log('schoolsInfo', schoolsInfo);
      // Формируем финальные данные для построения графика
      const finalData = schoolsInfo.map((info, i) => ({
        label: info.school.name,
        data: [top5Schools[i].count],
      }));
      console.log(finalData);
      
      // Строим график
      citiesBarChart(finalData);
    });
  });
};

const buildBarChart = (data) => {
  const ctx = document.getElementById("salaryChart").getContext("2d");
  
  
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: data.map((item) => item.label),
      datasets: [
        {
          label: "Количество зарегистрированных пользователей",
          data: data.map((item) => item.data),
          backgroundColor: "rgba(75, 192, 192, 1)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderRadius: { topLeft: 15, topRight: 15},
            barThickness: 46,
            maxBarThickness: 30,
            borderSkipped: false
        },
      ],
    },
    options: {
          scales: {
            y: {
              beginAtZero: false, // Столбцы начинаются не с 0
              min: 0, // Поднимаем столбцы чуть выше оси X
              max: Number(data.map((item) => item.data)) + 1,
              ticks: {
                callback: function (value) {
                  // Не отображаем отрицательные значения
                  return value >= 0 ? value : '';
                },
                font: {
                  size: 14, // Размер шрифта для оси Y
                  family: 'Aeroport', // Шрифт для оси Y
                  style: 'normal', // Нормальный стиль шрифта для оси Y
                  weight: 'normal' // Нормальная толщина шрифта для оси Y
                }
              }
            },
            x: {
              offset: true, // Включаем отступы
              grid: {
                display: false // Отключаем вертикальные линии сетки
              },
              ticks: {
                font: {
                  size: 14, // Размер шрифта для оси X
                  family: 'Aeroport', // Шрифт для оси X
                  style: 'normal', // Нормальный стиль шрифта для оси X
                  weight: 'normal' // Нормальная толщина шрифта для оси X
                }
              }
            }
          },
          layout: {
            padding: {
              top: 20, // Отступ сверху
              bottom: 20 // Отступ снизу для большей видимости
            }
          },
          plugins: {
            legend: {
              display: false // Отключаем легенду
            }
          }
        }
  });
};
const citiesBarChart = (data) => {
  const ctx = document.getElementById("salaryChartCity").getContext("2d");
  
  
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: data.map((item) => item.label),
      datasets: [
        {
          label: "Количество зарегистрированных пользователей",
          data: data.map((item) => item.data),
          backgroundColor: "rgba(75, 192, 192, 1)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderRadius: { topLeft: 15, topRight: 15},
            barThickness: 46,
            maxBarThickness: 30,
            borderSkipped: false
        },
      ],
    },
    options: {
          scales: {
            y: {
              beginAtZero: false, // Столбцы начинаются не с 0
              min: 0, // Поднимаем столбцы чуть выше оси X
              max: Number(data.map((item) => item.data)) + 1,
              ticks: {
                callback: function (value) {
                  // Не отображаем отрицательные значения
                  return value >= 0 ? value : '';
                },
                font: {
                  size: 14, // Размер шрифта для оси Y
                  family: 'Aeroport', // Шрифт для оси Y
                  style: 'normal', // Нормальный стиль шрифта для оси Y
                  weight: 'normal' // Нормальная толщина шрифта для оси Y
                }
              }
            },
            x: {
              offset: true, // Включаем отступы
              grid: {
                display: false // Отключаем вертикальные линии сетки
              },
              ticks: {
                font: {
                  size: 14, // Размер шрифта для оси X
                  family: 'Aeroport', // Шрифт для оси X
                  style: 'normal', // Нормальный стиль шрифта для оси X
                  weight: 'normal' // Нормальная толщина шрифта для оси X
                }
              }
            }
          },
          layout: {
            padding: {
              top: 20, // Отступ сверху
              bottom: 20 // Отступ снизу для большей видимости
            }
          },
          plugins: {
            legend: {
              display: false // Отключаем легенду
            }
          }
        }
  });
};
const renderChart = (state) => {
  const ctx = document.getElementById("allRegisterChart").getContext("2d");

  // Текущая дата
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; // Месяцы начинаются с 0
  //   const currentDay = currentDate.getDate();

  // Дата начала регистрации (например, 1 сентября 2024 года)
  const startDate = new Date(2024, 8, 1); // Месяцы начинаются с 0, поэтому 8 означает сентябрь
  const startYear = startDate.getFullYear();
  const startMonth = startDate.getMonth() + 1; // Месяцы начинаются с 0
  //   const startDay = startDate.getDate();

  // Подготовка данных для графика
  const usersCount = state.stat; // Количество зарегистрированных пользователей
  const labels = [
    `${startMonth}.${startYear}`,
    `${currentMonth}.${currentYear}`,
  ]; // Оси X
  const data = [0, usersCount]; // Данные для графика

  // Настройки графика
  new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Кол-во регистраций",
          data: data,
          borderColor: "purple",
          pointBackgroundColor: "white",
          pointBorderColor: "purple",
          pointRadius: 5,
          pointHoverRadius: 7,
          pointHitRadius: 15,
          borderWidth: 2,
          backgroundColor: "rgba(128, 0, 128, 0.1)",
          tension: 0.4, // Сглаживание линии
          animation: {
            duration: 3000, // Время анимации в миллисекундах
            easing: "easeInOutQuart", // Тип анимации
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
      scales: {
      
      },
    },
  });
};
// const getMaxSalary = () => {
//   if (this.salary.length > 0 && this.price.length === 0) {
//     // Если есть только зарплата, возвращаем максимальную зарплату
//     return Math.max(...this.salary.map((item) => item.salary));
//   } else if (this.price.length > 0) {
//     // Если есть цена (даже если зарплаты нет), возвращаем максимальную цену
//     return Math.max(...this.price.map((item) => item.price));
//   }
//   // Если оба массива пустые, возвращаем 0
//   return 0;
// };
</script>

<template>
  <div class="metrika">
    <div class="chart">
      <div class="biggesthead">Кол-во регистраций</div>
      <canvas id="allRegisterChart"></canvas>
    </div>
    <div class="chart">
      <div class="biggesthead">Топ 5 школ по регистрации</div>
      <canvas id="salaryChart"></canvas>
    </div>
    <div class="chart">
      <div class="biggesthead">Топ 5 городов по регистрации</div>
      <canvas id="salaryChartCity"></canvas>
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