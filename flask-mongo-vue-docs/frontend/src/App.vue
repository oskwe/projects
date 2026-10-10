<template>
  <!-- Главный компонент приложения -->
  <div id="app">
    <!-- Навигационная панель с Bootstrap стилями -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
      <div class="container-fluid">
        <!-- Логотип/название приложения с ссылкой на главную -->
        <router-link class="navbar-brand" to="/">Vue-Flask App</router-link>

        <!-- Кнопка для мобильного меню -->
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
          aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>

        <!-- Основное меню -->
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav">
            <!-- Пункт меню - Главная -->
            <li class="nav-item">
              <router-link class="nav-link" to="/">Главная</router-link>
            </li>

            <li class="nav-item dropdown">
              <a class="nav-link dropdown-toggle" href="#" id="documentsDropdown" role="button" data-bs-toggle="dropdown">
                Документы
              </a>
              <ul class="dropdown-menu" aria-labelledby="documentsDropdown">
                <li>
                  <router-link class="dropdown-item" to="/proxies">Доверенность</router-link>
                </li>
                <li>
                  <router-link class="dropdown-item" to="/torg12">Товарная накладная</router-link>
                </li>
              </ul>
            </li>

            <!-- Выпадающее меню справочников -->
            <li class="nav-item dropdown">
              <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown">
                Справочники
              </a>
              <ul class="dropdown-menu" aria-labelledby="navbarDropdown">
                <li>
                  <router-link class="dropdown-item" to="/organizations">Организации</router-link>
                </li>
                <li>
                  <router-link class="dropdown-item" to="/items">Товары</router-link>
                </li>
                <li>
                  <router-link class="dropdown-item" to="/positions">Должности</router-link>
                </li>
                <li>
                  <router-link class="dropdown-item" to="/individuals">Физические лица</router-link>
                </li>
                <li>
                  <router-link class="dropdown-item" to="/units">Единицы измерения</router-link>
                </li>
                <li>
                  <router-link class="dropdown-item" to="/package-types">Виды упаковки</router-link>
                </li>
                <li>
                  <router-link class="dropdown-item" to="/basis-documents">Основания</router-link>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <!-- Основное содержимое приложения -->
    <div class="container mt-4">
      <!-- Здесь будут отображаться компоненты маршрутов -->
      <router-view />
    </div>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
</style>
