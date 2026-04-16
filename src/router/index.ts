import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../pages/HomeView.vue'
import SalaryPage from '@/pages/SalaryPage.vue'
import IrpfCreditForRentPage from '@/pages/IrpfCreditForRentPage.vue'
import FonasaPage from '@/pages/FonasaPage.vue'
import SalaryDataPage from '@/pages/SalaryDataPage.vue'
import IvaMinimumPage from '@/pages/IvaMinimumPage.vue'
import SalesCommissionPage from '@/pages/SalesCommissionPage.vue'
import LabelGeneratorPage from '@/pages/LabelGeneratorPage.vue'
import MecExpedientePage from '@/pages/MecExpedientePage.vue'

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
    {
      path: '/iva-minimum',
      name: 'iva-minimum',
      component: IvaMinimumPage,
    },
    {
      path: '/sales-commission',
      name: 'sales-commission',
      component: SalesCommissionPage,
    },
    {
      path: '/label-generator',
      name: 'label-generator',
      component: LabelGeneratorPage,
    },
    {
      path: '/mec-expediente',
      name: 'mec-expediente',
      component: MecExpedientePage,
    },
  ],
})

export default router
