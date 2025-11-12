import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../pages/HomeView.vue'
import SalaryPage from '@/pages/SalaryPage.vue'
import IrpfCreditForRentPage from '@/pages/IrpfCreditForRentPage.vue'
import FonasaPage from '@/pages/FonasaPage.vue'
import SalaryDataPage from '@/pages/SalaryDataPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/salary',
      name: 'salary',
      component: SalaryPage,
    },
    {
      path: '/irpf-credit-for-rent',
      name: 'irpf-credit-for-rent',
      component: IrpfCreditForRentPage,
    },
    {
      path: '/fonasa',
      name: 'fonasa',
      component: FonasaPage,
    },
    {
      path: '/salary-data',
      name: 'salary-data',
      component: SalaryDataPage,
    },
  ],
})

export default router
