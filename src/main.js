import './assets/css/main.css'
import 'v-calendar/style.css'
import 'vue3-toastify/dist/index.css'
import router from './router/router'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import VCalendar from 'v-calendar'

import App from './App.vue'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(VCalendar, {})
app.mount('#app')
