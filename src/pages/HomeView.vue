<script setup lang="ts">
import { ref, computed } from 'vue'
import Footer from '@/components/footer/Footer.vue'
import globalData from '@/data/global.json'

const lastUpdated = new Date(globalData.lastUpdated).toLocaleDateString('es-UY', {
  day: '2-digit', month: 'long', year: 'numeric'
})

const search = ref('')

type Tool = {
  title: string
  description: string
  to: string
  soon?: boolean
}

type Group = {
  label: string
  icon: string
  tools: Tool[]
}

const groups: Group[] = [
  {
    label: 'Calculadoras Laborales',
    icon: '💼',
    tools: [
      {
        title: 'Salario Líquido',
        description: 'Calculá tu salario líquido en Uruguay para 2026, con descuentos de BPS e IRPF.',
        to: '/salary',
      },
      {
        title: 'Devolución de IRPF por Alquiler',
        description: 'Estimá tu posible devolución de impuestos sobre la renta por pago de alquileres.',
        to: '/irpf-credit-for-rent',
      },
      {
        title: 'FONASA',
        description: 'Calculá tus aportes mensuales obligatorios o complementarios.',
        to: '/fonasa',
      },
      {
        title: 'Valores para Cálculos',
        description: 'Consultá los valores y fechas de actualización para los cálculos (BPC, BFC, CPE).',
        to: '/salary-data',
      },
    ],
  },
  {
    label: 'Emprendedores',
    icon: '🚀',
    tools: [
      {
        title: 'Anticipo IVA Mínimo',
        description: 'Calculá el anticipo mensual de IVA mínimo para unipersonales, con descuento por e-Factura.',
        to: '/iva-minimum',
      },
      {
        title: 'Comisión por Venta',
        description: 'Calculá tu ganancia neta por venta: costo, packaging, envío, comisión de plataforma e IVA.',
        to: '/sales-commission',
      },
      {
        title: 'Generador de Etiquetas',
        description: 'Generá etiquetas de envío listas para imprimir en formato 100×150mm.',
        to: '/label-generator',
      },
      {
        title: 'Liquidaciones para Unipersonales',
        description: 'Calculá impuestos y aportes jubilatorios para tu empresa unipersonal.',
        to: '/unipersonal',
        soon: true,
      },
    ],
  },
  {
    label: 'Trámites',
    icon: '📋',
    tools: [
      {
        title: 'Expedientes MEC',
        description: 'Consultá el estado de un expediente del Ministerio de Educación y Cultura.',
        to: '/mec-expediente',
      },
    ],
  },
]

const filteredGroups = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return groups

  return groups
    .map(group => ({
      ...group,
      tools: group.tools.filter(
        t => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
      ),
    }))
    .filter(group => group.tools.length > 0)
})

const totalResults = computed(() =>
  filteredGroups.value.reduce((sum, g) => sum + g.tools.length, 0)
)
</script>

<template>
  <main class="min-h-screen bg-gray-50 flex flex-col">
    <section class="flex-grow">

      <!-- Header -->
      <section class="max-w-3xl mx-auto text-center pt-12 pb-8 px-6">
        <h1 class="text-4xl font-bold text-gray-900 mb-2 tracking-tight">
          Arael's Tools
        </h1>
        <p class="text-gray-500 text-base">
          Calculadoras y herramientas para trabajadores y profesionales en Uruguay.
        </p>
      </section>

      <!-- Search -->
      <div class="max-w-3xl mx-auto px-6 pb-6 space-y-3">
        <div class="relative">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
          </svg>
          <input v-model="search" type="text" placeholder="Buscar herramienta..."
            class="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <!-- Info badge -->
        <div class="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2.5 text-sm text-blue-700">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24"
            stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z" />
          </svg>
          Valores actualizados al <strong class="ml-1">{{ lastUpdated }}</strong>
        </div>
      </div>

      <!-- No results -->
      <div v-if="search && totalResults === 0" class="max-w-3xl mx-auto px-6 pb-10 text-center text-gray-400 text-sm py-10">
        No se encontraron herramientas para "<strong class="text-gray-600">{{ search }}</strong>"
      </div>

      <!-- Groups -->
      <div class="max-w-3xl mx-auto px-6 pb-12 space-y-10">
        <div v-for="group in filteredGroups" :key="group.label">
          <h2 class="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
            <span>{{ group.icon }}</span>
            <span>{{ group.label }}</span>
          </h2>

          <div class="grid gap-4 sm:grid-cols-2">
            <template v-for="tool in group.tools" :key="tool.to">
              <!-- Soon -->
              <div v-if="tool.soon"
                class="p-5 rounded-xl border border-gray-200 bg-gray-100 opacity-60 cursor-not-allowed">
                <div class="flex items-start justify-between mb-1">
                  <h3 class="text-sm font-semibold text-gray-700">{{ tool.title }}</h3>
                  <span class="text-xs bg-gray-200 text-gray-500 rounded-full px-2 py-0.5 ml-2 shrink-0">Pronto</span>
                </div>
                <p class="text-xs text-gray-500">{{ tool.description }}</p>
              </div>

              <!-- Active -->
              <RouterLink v-else :to="tool.to"
                class="group p-5 rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md hover:border-blue-200 transition flex flex-col justify-between">
                <div>
                  <h3 class="text-sm font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                    {{ tool.title }}
                  </h3>
                  <p class="text-xs text-gray-500 leading-relaxed">{{ tool.description }}</p>
                </div>
                <div class="mt-3 text-xs text-blue-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Abrir →
                </div>
              </RouterLink>
            </template>
          </div>
        </div>
      </div>

    </section>

    <Footer />
  </main>
</template>
