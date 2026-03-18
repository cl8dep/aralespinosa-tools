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
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import Footer from '@/components/footer/Footer.vue'

const IVA_RATE = 0.22

const form = useForm({
    initialValues: {
        precioVenta: 0,
        precioCosto: 0,
        packaging: 0,
        envio: 0,
        comisionPlataforma: 0,
        otrosGastos: 0,
        incluyeIva: false,
    }
})

type Result = {
    precioVenta: number
    precioVentaSinIva: number
    incluyeIva: boolean
    ivaAmount: number
    precioCosto: number
    packaging: number
    envio: number
    comisionPlataforma: number
    comisionAmount: number
    otrosGastos: number
    totalGastos: number
    ganancia: number
    margen: number
}

const result = ref<Result | null>(null)
const resultSection = ref<HTMLElement | null>(null)

function toNumber(n: unknown): number {
    if (typeof n === 'number') return isNaN(n) ? 0 : n
    if (typeof n === 'string' && n.trim() !== '') {
        const parsed = Number(n)
        return isNaN(parsed) ? 0 : parsed
    }
    return 0
}

function round2(n: number): number {
    return Math.round((n + Number.EPSILON) * 100) / 100
}

function fmt(n: number): string {
    return Number(n ?? 0).toLocaleString('es-UY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const onSubmit = form.handleSubmit(async (values) => {
    const precioVenta = toNumber(values.precioVenta)
    const precioCosto = toNumber(values.precioCosto)
    const packaging = toNumber(values.packaging)
    const envio = toNumber(values.envio)
    const comisionPlataforma = toNumber(values.comisionPlataforma)
    const otrosGastos = toNumber(values.otrosGastos)
    const incluyeIva = Boolean(values.incluyeIva)

    let precioVentaSinIva: number
    let ivaAmount: number

    if (incluyeIva) {
        precioVentaSinIva = round2(precioVenta / (1 + IVA_RATE))
        ivaAmount = round2(precioVenta - precioVentaSinIva)
    } else {
        precioVentaSinIva = precioVenta
        ivaAmount = 0
    }

    const comisionAmount = round2(precioVentaSinIva * comisionPlataforma / 100)
    const totalGastos = round2(precioCosto + packaging + envio + comisionAmount + otrosGastos)
    const ganancia = round2(precioVentaSinIva - totalGastos)
    const margen = precioVentaSinIva > 0 ? round2((ganancia / precioVentaSinIva) * 100) : 0

    result.value = {
        precioVenta,
        precioVentaSinIva,
        incluyeIva,
        ivaAmount,
        precioCosto,
        packaging,
        envio,
        comisionPlataforma,
        comisionAmount,
        otrosGastos,
        totalGastos,
        ganancia,
        margen,
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
                    Calculadora de Comisión por Venta
                </h1>
                <p class="mt-2 text-gray-600 text-base max-w-2xl mx-auto">
                    Calculá tu ganancia neta por venta considerando costos, envío, packaging, comisión de plataforma e IVA.
                </p>
            </div>

            <form @submit="onSubmit">
                <section class="bg-white shadow-sm border border-gray-200 rounded-xl p-6 sm:p-8">
                    <h2 class="text-xl font-semibold text-gray-800 mb-6 text-center">Ingresá los datos de la venta</h2>

                    <div class="space-y-6">
                        <!-- Precio de venta -->
                        <FormField name="precioVenta" v-slot="{ componentField }">
                            <FormItem>
                                <FormLabel class="text-sm font-medium text-gray-700">
                                    Precio de venta ($)
                                </FormLabel>
                                <FormControl>
                                    <Input type="text" placeholder="Ej: 1500" v-bind="componentField" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        </FormField>

                        <!-- IVA -->
                        <FormField v-slot="{ value, handleChange }" type="checkbox" name="incluyeIva">
                            <FormItem class="flex flex-row items-start gap-3 py-1">
                                <FormControl>
                                    <Checkbox :model-value="value" @update:model-value="handleChange" />
                                </FormControl>
                                <div class="space-y-0 leading-none">
                                    <FormLabel>El precio de venta incluye IVA (22%)</FormLabel>
                                    <p class="text-xs text-gray-500 mt-1">
                                        Si está marcado, se descontará el IVA del precio de venta para calcular la ganancia.
                                    </p>
                                    <FormMessage />
                                </div>
                            </FormItem>
                        </FormField>

                        <!-- Precio de costo -->
                        <FormField name="precioCosto" v-slot="{ componentField }">
                            <FormItem>
                                <FormLabel class="text-sm font-medium text-gray-700">
                                    Precio de costo ($)
                                </FormLabel>
                                <FormControl>
                                    <Input type="text" placeholder="Ej: 800" v-bind="componentField" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        </FormField>

                        <!-- Packaging -->
                        <FormField name="packaging" v-slot="{ componentField }">
                            <FormItem>
                                <FormLabel class="text-sm font-medium text-gray-700">
                                    Packaging ($)
                                </FormLabel>
                                <FormControl>
                                    <Input type="text" placeholder="Ej: 50" v-bind="componentField" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        </FormField>

                        <!-- Envío -->
                        <FormField name="envio" v-slot="{ componentField }">
                            <FormItem>
                                <FormLabel class="text-sm font-medium text-gray-700">
                                    Costo de envío ($)
                                </FormLabel>
                                <FormControl>
                                    <Input type="text" placeholder="Ej: 150" v-bind="componentField" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        </FormField>

                        <!-- Comisión plataforma -->
                        <FormField name="comisionPlataforma" v-slot="{ componentField }">
                            <FormItem>
                                <FormLabel class="text-sm font-medium text-gray-700">
                                    Comisión de plataforma (%)
                                </FormLabel>
                                <FormControl>
                                    <Input type="text" placeholder="Ej: 13" v-bind="componentField" />
                                </FormControl>
                                <p class="text-xs text-gray-500 mt-1">
                                    Porcentaje que cobra la plataforma (MercadoLibre, etc.) sobre el precio de venta sin IVA.
                                </p>
                                <FormMessage />
                            </FormItem>
                        </FormField>

                        <!-- Otros gastos -->
                        <FormField name="otrosGastos" v-slot="{ componentField }">
                            <FormItem>
                                <FormLabel class="text-sm font-medium text-gray-700">
                                    Otros gastos ($)
                                </FormLabel>
                                <FormControl>
                                    <Input type="text" placeholder="Ej: 30" v-bind="componentField" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        </FormField>
                    </div>

                    <div class="pt-6">
                        <button type="submit"
                            class="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600">
                            Calcular ganancia
                        </button>
                    </div>
                </section>
            </Form>

            <!-- Resultado -->
            <section v-if="result" ref="resultSection"
                class="bg-white shadow-sm border border-gray-200 rounded-xl p-6 sm:p-8">
                <h2 class="text-xl font-semibold text-gray-800 mb-6 text-center">
                    Resultado
                </h2>

                <div class="space-y-3 max-w-md mx-auto">
                    <div class="flex justify-between">
                        <span class="text-gray-600">Precio de venta</span>
                        <span class="font-medium">$ {{ fmt(result.precioVenta) }}</span>
                    </div>

                    <template v-if="result.incluyeIva">
                        <div class="flex justify-between">
                            <span class="text-gray-600">IVA (22%)</span>
                            <span class="font-medium text-red-600">- $ {{ fmt(result.ivaAmount) }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">Precio sin IVA</span>
                            <span class="font-medium">$ {{ fmt(result.precioVentaSinIva) }}</span>
                        </div>
                    </template>

                    <div class="border-t pt-3"></div>

                    <div class="flex justify-between">
                        <span class="text-gray-600">Costo del producto</span>
                        <span class="font-medium text-red-600">- $ {{ fmt(result.precioCosto) }}</span>
                    </div>

                    <div class="flex justify-between">
                        <span class="text-gray-600">Packaging</span>
                        <span class="font-medium text-red-600">- $ {{ fmt(result.packaging) }}</span>
                    </div>

                    <div class="flex justify-between">
                        <span class="text-gray-600">Envío</span>
                        <span class="font-medium text-red-600">- $ {{ fmt(result.envio) }}</span>
                    </div>

                    <div class="flex justify-between">
                        <span class="text-gray-600">Comisión plataforma ({{ result.comisionPlataforma }}%)</span>
                        <span class="font-medium text-red-600">- $ {{ fmt(result.comisionAmount) }}</span>
                    </div>

                    <div v-if="result.otrosGastos > 0" class="flex justify-between">
                        <span class="text-gray-600">Otros gastos</span>
                        <span class="font-medium text-red-600">- $ {{ fmt(result.otrosGastos) }}</span>
                    </div>

                    <div class="flex justify-between text-sm text-gray-500">
                        <span>Total gastos</span>
                        <span>$ {{ fmt(result.totalGastos) }}</span>
                    </div>

                    <div class="border-t pt-3 flex justify-between">
                        <span class="text-gray-800 font-semibold">Ganancia neta</span>
                        <span :class="[
                            'font-extrabold text-lg',
                            result.ganancia >= 0 ? 'text-green-700' : 'text-red-700'
                        ]">
                            $ {{ fmt(result.ganancia) }}
                        </span>
                    </div>

                    <div class="flex justify-between">
                        <span class="text-gray-600">Margen de ganancia</span>
                        <span :class="[
                            'font-semibold',
                            result.margen >= 0 ? 'text-green-700' : 'text-red-700'
                        ]">
                            {{ fmt(result.margen) }}%
                        </span>
                    </div>

                    <p class="text-xs text-gray-500 pt-2">
                        * Este cálculo es referencial. No incluye impuestos adicionales como IRPF o aportes patronales.
                    </p>
                </div>
            </section>
        </div>

        <Footer />
    </main>
</template>
