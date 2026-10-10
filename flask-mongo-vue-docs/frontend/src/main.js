// Главный входной файл приложения Vue

import { createApp } from 'vue'  // Импорт функции создания приложения Vue
import App from './App.vue'      // Импорт главного компонента App
import router from './router'    // Импорт конфигурации маршрутизатора
import store from './store'      // Импорт хранилища Vuex

// Импорт стилей Bootstrap
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

// Создание экземпляра приложения Vue
const app = createApp(App)

// Подключение плагинов:
app.use(router)  // Маршрутизатор
app.use(store)   // Хранилище состояния

// Монтирование приложения в DOM-элемент с id="app"
app.mount('#app')

// Глобальная конфигурация
app.config.globalProperties.$filters = {
  // Глобальный фильтр для форматирования даты
  formatDate(value) {
    if (!value) return ''
    const date = new Date(value)
    return date.toLocaleDateString()
  }
}