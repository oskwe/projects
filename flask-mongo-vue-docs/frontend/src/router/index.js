import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ProxiesView from '../views/ProxiesView.vue'
import ProxyDetailView from '../views/ProxyDetailView.vue'
import Torg12View from '../views/Torg12View.vue'
import Torg12DetailView from '../views/Torg12DetailView.vue'
import OrganizationsView from '../views/OrganizationsView.vue'
import ItemsView from '../views/ItemsView.vue'
import PositionsView from '../views/PositionsView.vue'
import IndividualsView from '../views/IndividualsView.vue'
import UnitsView from '../views/UnitsView.vue'
import PackageTypesView from '../views/PackageTypesView.vue'
import BasisDocumentsView from '../views/BasisDocumentsView.vue'

// Определение маршрутов приложения
const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/proxies',
    name: 'proxies',
    component: ProxiesView
  },
  {
    path: '/proxies/:id',
    name: 'proxy-detail',
    component: ProxyDetailView,
    props: true
  },
  {
    path: '/torg12',
    name: 'torg12',
    component: Torg12View
  },
  {
    path: '/torg12/:id',
    name: 'torg12-detail',
    component: Torg12DetailView,
    props: true
  },
  {
    path: '/organizations',
    name: 'organizations',
    component: OrganizationsView
  },
  {
    path: '/items',
    name: 'items',
    component: ItemsView
  },
  {
    path: '/positions',
    name: 'positions',
    component: PositionsView
  },
  {
    path: '/individuals',
    name: 'individuals',
    component: IndividualsView
  },
  {
    path: '/units',
    name: 'units',
    component: UnitsView
  },
  {
    path: '/package-types',
    name: 'package-types',
    component: PackageTypesView
  },
  {
    path: '/basis-documents',
    name: 'basis-documents',
    component: BasisDocumentsView
  },
  // Редирект для несуществующих путей
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

// Создание роутера с историей браузера
const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
