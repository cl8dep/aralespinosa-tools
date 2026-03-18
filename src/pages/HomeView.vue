<script setup lang="ts">
import Footer from '@/components/footer/Footer.vue'
import globalData from '@/data/global.json'

const lastUpdated = new Date(globalData.lastUpdated).toLocaleDateString('es-UY', {
  day: '2-digit', month: 'long', year: 'numeric'
})
</script>

<template>
  <main class="min-h-screen bg-gray-50 flex flex-col">
    <!-- Contenido principal -->
    <section class="flex-grow">
      <section class="max-w-4xl mx-auto text-center py-12 px-6">
        <h1 class="text-3xl font-bold text-gray-900 mb-4">
          Bienvenido a tu Kit Financiero
        </h1>
        <p class="text-gray-600">
          Explorá calculadoras útiles para trabajadores y profesionales en Uruguay. ¡Más herramientas próximamente!
        </p>
      </section>

      <div class="max-w-3xl mx-auto px-6 pb-4">
        <div class="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2.5 text-sm text-blue-700">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z" />
          </svg>
          Valores actualizados al <strong class="ml-1">{{ lastUpdated }}</strong>
        </div>
      </div>

      <section class="max-w-3xl mx-auto grid gap-6 sm:grid-cols-2 px-6 pb-10">
        <!-- Herramienta 1 -->
        <RouterLink to="/salary"
          class="block p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md bg-white transition">
          <h2 class="text-lg font-semibold text-gray-900 mb-1">Calculadora de Salario Líquido</h2>
          <p class="text-sm text-gray-600">
            Calculá tu salario líquido en Uruguay para 2026, con descuentos de BPS e IRPF.
          </p>
        </RouterLink>

        <RouterLink to="/irpf-credit-for-rent"
          class="block p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md bg-white transition">
          <h2 class="text-lg font-semibold text-gray-700 mb-1">Devolución de IRPF por Alquiler</h2>
          <p class="text-sm text-gray-500">
            Estimá tu posible devolución de impuestos sobre la renta por pago de alquileres.
          </p>
        </RouterLink>

        <RouterLink to="/fonasa"
          class="block p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md bg-white transition">
          <h2 class="text-lg font-semibold text-gray-700 mb-1">FONASA</h2>
          <p class="text-sm text-gray-500">
            Calcula tus aportes mensuales obligatorios o complementarios.
          </p>
        </RouterLink>

        <RouterLink to="/salary-data"
          class="block p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md bg-white transition">
          <h2 class="text-lg font-semibold text-gray-700 mb-1">Ver Valores para Cálculos</h2>
          <p class="text-sm text-gray-500">
            Consulta los valores y fechas de actualización para los cálculos.
          </p>
        </RouterLink>

        <RouterLink to="/iva-minimum"
          class="block p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md bg-white transition">
          <h2 class="text-lg font-semibold text-gray-700 mb-1">Anticipo IVA Mínimo</h2>
          <p class="text-sm text-gray-500">
            Calculá el anticipo mensual de IVA mínimo para unipersonales, con descuento por e-Factura.
          </p>
        </RouterLink>

        <RouterLink to="/sales-commission"
          class="block p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md bg-white transition">
          <h2 class="text-lg font-semibold text-gray-700 mb-1">Comisión por Venta</h2>
          <p class="text-sm text-gray-500">
            Calculá tu ganancia neta por venta: costo, packaging, envío, comisión de plataforma e IVA.
          </p>
        </RouterLink>

        <!-- Herramienta (Próximamente) -->
        <div class="p-6 rounded-lg border border-gray-200 bg-gray-100 opacity-60 cursor-not-allowed">
          <h2 class="text-lg font-semibold text-gray-700 mb-1">Liquidaciones para Unipersonales</h2>
          <p class="text-sm text-gray-500">
            Calculá impuestos y aportes jubilatorios para tu empresa unipersonal.
          </p>
          <span class="text-xs text-gray-500 mt-2 block">Próximamente</span>
        </div>
      </section>
    </section>

    <Footer />
  </main>
</template>