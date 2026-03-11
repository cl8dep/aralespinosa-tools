<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { useForm } from 'vee-validate'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/components/ui/form'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import Footer from '@/components/footer/Footer.vue'

// =====================
// Constantes - actualizá este valor cada año
// =====================
const CUOTA_IVA_MINIMA_2026 = 5910

// Tasa sobre ingresos para e-Factura
const TASA_EFACTURA = 0.033

type PorcentajeAnticipo = '25' | '50' | '100'

const form = useForm({
    initialValues: {
        porcentaje: '100' as PorcentajeAnticipo,
        usaEfactura: false,
        ingresosMes: 0,
    }
})

type Result = {
    cuotaBase: number
    cuotaCorrespondiente: number
    porcentaje: PorcentajeAnticipo
    usaEfactura: boolean
    ingresosMes: number
    // Con e-Factura
    porTasa?: number
    limitadorUsado?: 'tasa' | 'cuota' | 'cero'
    // Sin e-Factura
    anticipoFinal: number
}

const result = ref<Result | null>(null)
const resultSection = ref<HTMLElement | null>(null)

function toNumber(n: unknown): number {
    if (typeof n === 'number') return n
    if (typeof n === 'string' && n.trim() !== '') return Number(n)
    return 0
}

function round2(n: number): number {
    return Math.round((n + Number.EPSILON) * 100) / 100
}

function fmt(n: number): string {
    return Number(n ?? 0).toLocaleString('es-UY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const onSubmit = form.handleSubmit(async (values) => {
    const porcentaje = values.porcentaje as PorcentajeAnticipo
    const usaEfactura = Boolean(values.usaEfactura)
    const ingresosMes = toNumber(values.ingresosMes)
    const factor = Number(porcentaje) / 100

    const cuotaCorrespondiente = round2(CUOTA_IVA_MINIMA_2026 * factor)

    if (usaEfactura) {
        // Con e-Factura: pagar el MENOR entre 3.3% de ingresos y la cuota correspondiente
        // Si ingresos = 0, no se paga nada
        const porTasa = round2(ingresosMes * TASA_EFACTURA)
        let anticipoFinal: number
        let limitadorUsado: 'tasa' | 'cuota' | 'cero'

        if (ingresosMes === 0) {
            anticipoFinal = 0
            limitadorUsado = 'cero'
        } else if (porTasa <= cuotaCorrespondiente) {
            anticipoFinal = porTasa
            limitadorUsado = 'tasa'
        } else {
            anticipoFinal = cuotaCorrespondiente
            limitadorUsado = 'cuota'
        }

        result.value = {
            cuotaBase: CUOTA_IVA_MINIMA_2026,
            cuotaCorrespondiente,
            porcentaje,
            usaEfactura,
            ingresosMes,
            porTasa,
            limitadorUsado,
            anticipoFinal,
        }
    } else {
        // Sin e-Factura: pagar el % de la cuota fija
        result.value = {
            cuotaBase: CUOTA_IVA_MINIMA_2026,
            cuotaCorrespondiente,
            porcentaje,
            usaEfactura,
            ingresosMes,
            anticipoFinal: cuotaCorrespondiente,
        }
    }

    await nextTick()
    resultSection.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
})
</script>

<template>
    <main class="min-h-screen bg-gray-50 flex flex-col">
        <div class="flex-grow max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 w-full">
            <button @click="$router.back()"
                class="text-sm text-blue-600 hover:underline mb-4 inline-flex items-center cursor-pointer">
                ← Volver
            </button>

            <div class="text-center border-b border-gray-200 pb-6">
                <h1 class="text-3xl font-bold tracking-tight text-gray-900">
                    Anticipo IVA Mínimo - Uruguay <span class="text-blue-600">2026</span>
                </h1>
                <p class="mt-2 text-gray-600 text-base max-w-2xl mx-auto">
                    Calculá el anticipo mensual de IVA mínimo para trabajadores independientes (unipersonales).
                </p>
            </div>

            <form @submit="onSubmit">
                <section class="bg-white shadow-sm border border-gray-200 rounded-xl p-6 sm:p-8">
                    <h2 class="text-xl font-semibold text-gray-800 mb-6 text-center">Ingresá tus datos</h2>

                    <div class="space-y-6">
                        <!-- Porcentaje de anticipo -->
                        <FormField v-slot="{ componentField }" name="porcentaje">
                            <FormItem>
                                <FormLabel class="text-sm font-medium text-gray-700">
                                    Porcentaje de la cuota mínima
                                </FormLabel>
                                <Select v-bind="componentField">
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccioná el porcentaje" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectItem value="25">25%</SelectItem>
                                            <SelectItem value="50">50%</SelectItem>
                                            <SelectItem value="100">100%</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        </FormField>

                        <!-- Facturación electrónica -->
                        <FormField v-slot="{ value, handleChange }" type="checkbox" name="usaEfactura">
                            <FormItem class="flex flex-row items-start gap-3 py-1">
                                <FormControl>
                                    <Checkbox :model-value="value" @update:model-value="handleChange" />
                                </FormControl>
                                <div class="space-y-0 leading-none">
                                    <FormLabel>¿Documentás tus operaciones exclusivamente con e-Factura?</FormLabel>
                                    <p class="text-xs text-gray-500 mt-1">
                                        Se pagará el menor entre el {{ (TASA_EFACTURA * 100).toFixed(1) }}% de los ingresos
                                        del mes y la cuota correspondiente. Sin ventas, no hay pago mínimo.
                                    </p>
                                    <FormMessage />
                                </div>
                            </FormItem>
                        </FormField>

                        <!-- Ingresos del mes -->
                        <FormField name="ingresosMes" v-slot="{ componentField }">
                            <FormItem>
                                <FormLabel class="text-sm font-medium text-gray-700">
                                    Ingresos del mes (sin IVA)
                                    <span v-if="!form.values.usaEfactura" class="text-gray-400 font-normal">
                                        — no aplica sin e-Factura
                                    </span>
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        type="text"
                                        placeholder="Ej: 45000"
                                        :disabled="!form.values.usaEfactura"
                                        v-bind="componentField"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        </FormField>
                    </div>

                    <div class="pt-6">
                        <button type="submit"
                            class="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600">
                            Calcular anticipo
                        </button>
                    </div>
                </section>
            </Form>

            <!-- Resultado -->
            <section v-if="result" ref="resultSection"
                class="bg-white shadow-sm border border-gray-200 rounded-xl p-6 sm:p-8">
                <h2 class="text-xl font-semibold text-gray-800 mb-6 text-center">
                    Resultado del cálculo
                </h2>

                <div class="space-y-3 max-w-md mx-auto">
                    <div class="flex justify-between">
                        <span class="text-gray-600">Cuota IVA mínima 2026</span>
                        <span class="font-medium">UYU {{ fmt(result.cuotaBase) }}</span>
                    </div>

                    <div class="flex justify-between">
                        <span class="text-gray-600">Porcentaje aplicado</span>
                        <span class="font-medium">{{ result.porcentaje }}%</span>
                    </div>

                    <div class="flex justify-between">
                        <span class="text-gray-600">Cuota correspondiente</span>
                        <span class="font-medium">UYU {{ fmt(result.cuotaCorrespondiente) }}</span>
                    </div>

                    <!-- Con e-Factura -->
                    <template v-if="result.usaEfactura">
                        <div class="flex justify-between">
                            <span class="text-gray-600">Ingresos del mes</span>
                            <span class="font-medium">UYU {{ fmt(result.ingresosMes) }}</span>
                        </div>

                        <div class="flex justify-between">
                            <span class="text-gray-600">{{ (TASA_EFACTURA * 100).toFixed(1) }}% de los ingresos</span>
                            <span class="font-medium">UYU {{ fmt(result.porTasa ?? 0) }}</span>
                        </div>

                        <div class="bg-blue-50 border border-blue-100 rounded-lg px-4 py-2 text-sm text-blue-700">
                            <template v-if="result.limitadorUsado === 'cero'">
                                Sin ingresos en el mes → no hay pago mínimo obligatorio.
                            </template>
                            <template v-else-if="result.limitadorUsado === 'tasa'">
                                Se aplica el {{ (TASA_EFACTURA * 100).toFixed(1) }}% de ingresos por ser menor a la cuota correspondiente.
                            </template>
                            <template v-else>
                                Se aplica la cuota correspondiente por ser menor al {{ (TASA_EFACTURA * 100).toFixed(1) }}% de ingresos.
                            </template>
                        </div>
                    </template>

                    <div class="border-t pt-3 flex justify-between">
                        <span class="text-gray-800 font-semibold">Anticipo a pagar</span>
                        <span class="text-gray-900 font-extrabold text-lg">UYU {{ fmt(result.anticipoFinal) }}</span>
                    </div>

                    <p class="text-xs text-gray-500 pt-2">
                        * Cuota mínima vigente para 2026: UYU {{ fmt(result.cuotaBase) }}.
                        Quedan excluidos del beneficio de e-Factura los contribuyentes con giro taxímetro.
                        Los valores son referenciales y deben verificarse con DGI.
                    </p>
                </div>
            </section>
        </div>

        <Footer />
    </main>
</template>
