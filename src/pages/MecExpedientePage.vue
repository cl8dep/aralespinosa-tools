<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import Footer from '@/components/footer/Footer.vue'

const route = useRoute()
const currentYear = new Date().getFullYear()

const year = ref(currentYear)
const unidad = ref('')
const numero = ref('')

const loading = ref(false)
const error = ref<string | null>(null)
const copied = ref(false)

type ExpedienteResult = {
    Numero: string
    Caratula: string
    Asunto: string
    UnidadActual: string
    OficinaAnterior: string
    tam: string
}

const result = ref<ExpedienteResult | null>(null)
const resultSection = ref<HTMLElement | null>(null)

const unidadPadded = computed(() => unidad.value.padStart(4, '0'))
const numeroPadded = computed(() => numero.value.padStart(4, '0'))
const queryString = computed(() => `${year.value}-11-${unidadPadded.value}-${numeroPadded.value}`)

const canSearch = computed(() => unidad.value.length > 0 && numero.value.length > 0)

const years = computed(() => {
    const list = []
    for (let y = currentYear; y >= 2000; y--) list.push(y)
    return list
})

async function buscar() {
    if (!canSearch.value) return

    loading.value = true
    error.value = null
    result.value = null

    try {
        const res = await fetch(`/api/mec?query=${queryString.value}`)
        if (!res.ok) throw new Error(`Error ${res.status}`)

        const data: ExpedienteResult = await res.json()

        if (!data.Numero) {
            error.value = 'No se encontró ningún expediente con ese número.'
            return
        }

        result.value = data
        await new Promise(r => setTimeout(r, 50))
        resultSection.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } catch (e) {
        error.value = 'No se pudo consultar el expediente. Verificá los datos e intentá nuevamente.'
    } finally {
        loading.value = false
    }
}

function onUnidadInput(e: Event) {
    const val = (e.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 4)
    unidad.value = val
}

function onNumeroInput(e: Event) {
    const val = (e.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 4)
    numero.value = val
}

function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') buscar()
}

async function compartir() {
    if (!result.value) return
    const texto = `Expediente MEC ${result.value.Numero}
Estado: ${result.value.Caratula}
Asunto: ${result.value.Asunto}
Oficina Actual: ${result.value.UnidadActual}
Oficina Anterior: ${result.value.OficinaAnterior}`
    await navigator.clipboard.writeText(texto)
    copied.value = true
    setTimeout(() => (copied.value = false), 2000)
}

onMounted(() => {
    const q = route.query.query as string | undefined
    if (!q) return

    // formato esperado: YYYY-11-XXXX-XXXX
    const parts = q.split('-')
    if (parts.length === 4) {
        year.value = parseInt(parts[0]) || currentYear
        unidad.value = parts[2].replace(/^0+/, '') || parts[2]
        numero.value = parts[3].replace(/^0+/, '') || parts[3]
        buscar()
    }
})
</script>

<template>
    <main class="min-h-screen bg-gray-50 flex flex-col">
        <div class="flex-grow max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 w-full">
            <button @click="$router.back()"
                class="text-sm text-blue-600 hover:underline inline-flex items-center cursor-pointer">
                ← Volver
            </button>

            <div class="text-center border-b border-gray-200 pb-6">
                <h1 class="text-3xl font-bold tracking-tight text-gray-900">
                    Consulta de Expedientes MEC
                </h1>
                <p class="mt-2 text-gray-600 text-base max-w-2xl mx-auto">
                    Consultá el estado de un expediente del Ministerio de Educación y Cultura.
                </p>
            </div>

            <section class="bg-white shadow-sm border border-gray-200 rounded-xl p-6 sm:p-8">
                <h2 class="text-lg font-semibold text-gray-800 mb-2">Número de expediente</h2>
                <p class="text-sm text-gray-500 mb-6">
                    El número está formado por: año · inciso (11) · código de unidad (4 dígitos) · número correlativo (4 dígitos).
                </p>

                <div class="flex flex-wrap items-end gap-3">
                    <!-- Año -->
                    <div class="flex flex-col gap-1">
                        <label class="text-xs font-medium text-gray-500 uppercase tracking-wide">Año</label>
                        <select v-model="year" @keydown="onKeydown"
                            class="h-10 rounded-md border border-gray-300 bg-white px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
                        </select>
                    </div>

                    <div class="flex flex-col gap-1">
                        <label class="text-xs font-medium text-gray-500 uppercase tracking-wide">Inciso</label>
                        <div
                            class="h-10 flex items-center px-4 rounded-md border border-gray-200 bg-gray-100 text-sm font-medium text-gray-600 select-none">
                            11
                        </div>
                    </div>

                    <!-- Código de unidad -->
                    <div class="flex flex-col gap-1">
                        <label class="text-xs font-medium text-gray-500 uppercase tracking-wide">Cód. de Unidad</label>
                        <input :value="unidad" @input="onUnidadInput" @keydown="onKeydown" type="text"
                            inputmode="numeric" placeholder="0000" maxlength="4"
                            class="h-10 w-24 rounded-md border border-gray-300 px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono" />
                    </div>

                    <!-- Número correlativo -->
                    <div class="flex flex-col gap-1">
                        <label class="text-xs font-medium text-gray-500 uppercase tracking-wide">N° de Expediente</label>
                        <input :value="numero" @input="onNumeroInput" @keydown="onKeydown" type="text"
                            inputmode="numeric" placeholder="0000" maxlength="4"
                            class="h-10 w-24 rounded-md border border-gray-300 px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono" />
                    </div>

                    <!-- Botón -->
                    <button @click="buscar" :disabled="!canSearch || loading"
                        class="h-10 inline-flex items-center gap-2 px-5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
                        <svg v-if="loading" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                stroke-width="4" />
                            <path class="opacity-75" fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        {{ loading ? 'Buscando...' : 'Buscar' }}
                    </button>
                </div>

                <!-- Preview del código -->
                <p class="mt-4 text-xs text-gray-400 font-mono">
                    Expediente: <span class="text-gray-600">{{ queryString }}</span>
                </p>
            </section>

            <!-- Error -->
            <div v-if="error"
                class="bg-red-50 border border-red-200 rounded-xl px-6 py-4 text-sm text-red-700">
                {{ error }}
            </div>

            <!-- Resultado -->
            <section v-if="result" ref="resultSection"
                class="bg-white shadow-sm border border-gray-200 rounded-xl p-6 sm:p-8">
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-xl font-semibold text-gray-800">Resultado</h2>
                    <button @click="compartir"
                        class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 cursor-pointer transition">
                        <svg v-if="!copied" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none"
                            viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-4 10h6a2 2 0 002-2v-8a2 2 0 00-2-2h-6a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-green-600" fill="none"
                            viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        {{ copied ? 'Copiado' : 'Compartir' }}
                    </button>
                </div>

                <dl class="divide-y divide-gray-100">
                    <div class="grid grid-cols-[180px_1fr] py-3 gap-4">
                        <dt class="text-sm text-gray-500">Número de Expediente</dt>
                        <dd class="text-sm font-semibold text-gray-900 font-mono">{{ result.Numero }}</dd>
                    </div>
                    <div class="grid grid-cols-[180px_1fr] py-3 gap-4">
                        <dt class="text-sm text-gray-500">Estado</dt>
                        <dd class="text-sm font-medium">
                            <span class="inline-flex items-center gap-1.5">
                                <span class="w-2 h-2 rounded-full"
                                    :class="result.Caratula === 'En Tránsito' ? 'bg-yellow-400' : 'bg-green-400'"></span>
                                {{ result.Caratula }}
                            </span>
                        </dd>
                    </div>
                    <div class="grid grid-cols-[180px_1fr] py-3 gap-4">
                        <dt class="text-sm text-gray-500">Asunto</dt>
                        <dd class="text-sm text-gray-900">{{ result.Asunto }}</dd>
                    </div>
                    <div class="grid grid-cols-[180px_1fr] py-3 gap-4">
                        <dt class="text-sm text-gray-500">Oficina Actual</dt>
                        <dd class="text-sm text-gray-900">{{ result.UnidadActual }}</dd>
                    </div>
                    <div class="grid grid-cols-[180px_1fr] py-3 gap-4">
                        <dt class="text-sm text-gray-500">Oficina Anterior</dt>
                        <dd class="text-sm text-gray-900">{{ result.OficinaAnterior }}</dd>
                    </div>
                </dl>
            </section>
        </div>

        <Footer />
    </main>
</template>
