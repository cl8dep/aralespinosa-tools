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

// Tablas de FONASA (porcentaje en puntos) para <= 2.5 BPC y > 2.5 BPC.
// Estructura esperada: { base: number, spouse: number, children: number }
import { BPC, CPE, FONASA_OVER25BPC, FONASA_UNDER25BPC } from '@/data/salary'
import type { TaxRegime } from '@/types/common'

const form = useForm({
    initialValues: {
        grossAmount: 0,          // número o string numérico
        taxRegime: 'IRPF' as TaxRegime,
        iraeRate: 0.48,           // fracción (0..1) cuando taxRegime === 'IRAE'
        hasChildren: false,
        hasSpouse: false,
        useCpe: false,
    }
})

// =====================
// Resultado y helpers
// =====================
type Result = {
    grossAmount: number
    baseCalc: number
    bpc: number
    bracketLabel: string
    hasSpouse: boolean
    hasChildren: boolean
    ratePct: number   // en %
    rate: number      // fracción
    aporte: number
    useCpe: boolean
    cpeMonthly?: number
    cpeComplement?: number
    totalToPay: number
    regimeLabel: string
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

// Base de cálculo:
// - IRPF: 70% del bruto (sin IVA).
// - IRAE: bruto * alícuota (0..1).
function computeBaseCalc(grossAmount: number, taxRegime: TaxRegime, iraeRate: number): number {
    if (taxRegime === 'IRPF')
        return grossAmount * 0.70;

    throw new Error("Not implemented IRAE")

    // const a = Math.max(0, Math.min(1, Number.isFinite(iraeRate) ? iraeRate : 0))
    // return grossAmount * a
}

// Selección de tabla y tasa total (en %).
function computeRatePct(baseCalc: number, bpc: number, hasSpouse: boolean, hasChildren: boolean): number {
    const threshold = 2.5 * bpc
    const table = baseCalc <= threshold ? FONASA_UNDER25BPC : FONASA_OVER25BPC
    let pct = table.base
    if (hasSpouse) pct += table.spouse
    if (hasChildren) pct += table.children
    return pct
}

const onSubmit = form.handleSubmit(async (values) => {
    const grossAmount = toNumber(values.grossAmount)
    const iraeRate = toNumber(values.iraeRate)
    const useCpe = Boolean(values.useCpe)
    const hasChildren = Boolean(values.hasChildren)
    const hasSpouse = Boolean(values.hasSpouse)
    const taxRegime = values.taxRegime as TaxRegime

    const baseCalc = computeBaseCalc(grossAmount, taxRegime, iraeRate)
    const ratePct = computeRatePct(baseCalc, BPC, hasSpouse, hasChildren) // en %
    const rate = ratePct / 100
    const aporte = round2(baseCalc * rate)

    let cpeComplement = 0
    if (useCpe) {
        cpeComplement = Math.max(0, round2(CPE - aporte))
    }

    result.value = {
        grossAmount,
        baseCalc: round2(baseCalc),
        bpc: BPC,
        bracketLabel: baseCalc <= 2.5 * BPC ? '≤ 2,5 BPC' : '> 2,5 BPC',
        hasSpouse,
        hasChildren,
        ratePct,
        rate,
        aporte,
        useCpe,
        cpeMonthly: CPE,
        cpeComplement: useCpe ? cpeComplement : undefined,
        totalToPay: round2(aporte + (useCpe ? cpeComplement : 0)),
        regimeLabel: taxRegime
    }

    await nextTick()
    resultSection.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
})

// =====================
// Expose to template
// =====================
defineExpose({ fmt, result, resultSection, form, onSubmit })
</script>

<template>

    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        <button @click="$router.back()"
            class="text-sm text-blue-600 hover:underline mb-4 inline-flex items-center cursor-pointer">
            ← Volver
        </button>

        <div class="text-center border-b border-gray-200 pb-6">
            <h1 class="text-3xl font-bold tracking-tight text-gray-900">
                Calculadora de FONASA - Uruguay <span class="text-blue-600">2025</span>
            </h1>
            <p class="mt-2 text-gray-600 text-base max-w-2xl mx-auto">
                Calculá tus aportes mensuales de FONASA para trabajadores independientes.
            </p>
        </div>


        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
            <form @submit="onSubmit">
                <section class="bg-white shadow-sm border border-gray-200 rounded-xl p-6 sm:p-8">
                    <h2 class="text-xl font-semibold text-gray-800 mb-4 text-center">Ingresá tus datos</h2>

                    <div class="grid sm:grid-cols-2 gap-4">
                        <FormField name="grossAmount" v-slot="{ componentField }">
                            <FormItem>
                                <FormLabel class="text-sm font-medium text-gray-700">Facturación del mes (sin IVA)
                                </FormLabel>
                                <FormControl>
                                    <Input type="text" placeholder="Ej: 22911.72" v-bind="componentField" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        </FormField>
                    </div>

                    <!-- Régimen -->
                    <div class="grid sm:grid-cols-2 gap-4">
                        <FormField v-slot="{ componentField }" name="taxRegime">
                            <FormItem>
                                <FormLabel class="text-sm font-medium text-gray-700">
                                    Régimen fiscal
                                </FormLabel>
                                <!-- select enlazado al form -->
                                <!-- <select
                                    class="mt-1 w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 px-3 py-2"
                                    v-bind="componentField">
                                    <option value="IRPF">IRPF</option>
                                    <option value="IRAE" disabled>IRAE</option>
                                </select> -->

                                <Select v-bind="componentField">
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecciona el regimen de tributacion" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectItem value="IRPF">
                                                IRPF
                                            </SelectItem>
                                            <!-- <SelectItem value="IRAE" disabled>
                                                IRAE
                                            </SelectItem> -->
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        </FormField>

                        <!-- <FormField name="iraeRate" v-slot="{ componentField }">
                                <FormItem v-if="form.values.taxRegime === 'IRAE'">
                                    <FormLabel class="text-sm font-medium text-gray-700">Alícuota IRAE (0–1)</FormLabel>
                                    <FormControl>
                                        <Input type="number" step="0.01" min="0" max="1" placeholder="Ej: 0.48"
                                            v-bind="componentField" />
                                    </FormControl>
                                    <FormDescription>Si estás en inicio, se suele usar 0,48 como referencia.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            </FormField> -->
                    </div>

                    <!-- Beneficiarios -->
                    <FormField v-slot="{ value, handleChange }" type="checkbox" name="hasChildren">
                        <FormItem class="flex flex-row py-1">
                            <FormControl>
                                <Checkbox :model-value="value" @update:model-value="handleChange" />
                            </FormControl>
                            <div class="space-y-0 leading-none">
                                <FormLabel>¿Tenés hijos a cargo?</FormLabel>
                                <FormMessage />
                            </div>
                        </FormItem>
                    </FormField>

                    <FormField v-slot="{ value, handleChange }" type="checkbox" name="hasSpouse">
                        <FormItem class="flex flex-row py-1">
                            <FormControl>
                                <Checkbox :model-value="value" @update:model-value="handleChange" />
                            </FormControl>
                            <div class="space-y-0 leading-none">
                                <FormLabel>¿Tu cónyuge está a cargo?</FormLabel>
                                <FormMessage />
                            </div>
                        </FormItem>
                    </FormField>

                    <!-- CPE opcional -->
                    <div class="grid sm:grid-cols-2 gap-4">
                        <FormField v-slot="{ value, handleChange }" type="checkbox" name="useCpe">
                            <FormItem class="flex flex-row py-1">
                                <FormControl>
                                    <Checkbox :model-value="value" @update:model-value="handleChange" />
                                </FormControl>
                                <div class="space-y-0 leading-none">
                                    <FormLabel>¿Simular complemento hasta CPE (opcional)</FormLabel>
                                    <FormMessage />
                                </div>
                            </FormItem>
                        </FormField>
                    </div>

                    <div class="pt-2">
                        <button type="submit"
                            class="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600">
                            Calcular FONASA
                        </button>
                    </div>
                </section>
            </Form>

            <!-- RESULTADO (ejemplo) -->
            <section v-if="result" ref="resultSection"
                class="bg-white shadow-sm border border-gray-200 rounded-xl p-6 sm:p-8">
                <h2 class="text-xl font-semibold text-gray-800 mb-4 text-center">
                    Resultado del cálculo
                </h2>

                <div class="grid lg:grid-cols-2 gap-6">
                    <!-- Columna izquierda -->
                    <div class="space-y-3">
                        <div class="flex justify-between">
                            <span class="text-gray-600">Facturado (sin IVA)</span>
                            <span class="font-medium">UYU {{ fmt(result.grossAmount) }}</span>
                        </div>

                        <div class="flex justify-between">
                            <span class="text-gray-600">Régimen</span>
                            <span class="font-medium">{{ result.regimeLabel }}</span>
                        </div>

                        <div class="flex justify-between">
                            <span class="text-gray-600">Base de cálculo</span>
                            <span class="font-medium">UYU {{ fmt(result.baseCalc) }}</span>
                        </div>

                        <div class="flex justify-between">
                            <span class="text-gray-600">BPC</span>
                            <span class="font-medium">UYU {{ fmt(result.bpc) }}</span>
                        </div>

                        <div class="flex justify-between">
                            <span class="text-gray-600">Franja</span>
                            <span class="font-medium">{{ result.bracketLabel }}</span>
                        </div>

                        <div class="flex justify-between">
                            <span class="text-gray-600">Beneficiarios</span>
                            <span class="font-medium">
                                <template v-if="!result.hasChildren && !result.hasSpouse">
                                    Sin beneficiarios
                                </template>
                                <template v-else-if="result.hasChildren && !result.hasSpouse">
                                    Hijos a cargo
                                </template>
                                <template v-else-if="!result.hasChildren && result.hasSpouse">
                                    Cónyuge/concubino a cargo
                                </template>
                                <template v-else>
                                    Cónyuge + hijos
                                </template>
                            </span>
                        </div>

                        <div class="flex justify-between">
                            <span class="text-gray-600">Tasa FONASA</span>
                            <span class="font-medium">{{ result.ratePct }}%</span>
                        </div>
                    </div>

                    <!-- Columna derecha -->
                    <div class="space-y-3">
                        <div class="flex justify-between">
                            <span class="text-gray-600">Aporte FONASA</span>
                            <span class="font-semibold">UYU {{ fmt(result.aporte) }}</span>
                        </div>

                        <div v-if="result.useCpe" class="flex justify-between">
                            <span class="text-gray-600">CPE mensual</span>
                            <span class="font-medium">UYU {{ fmt(result.cpeMonthly || 0) }}</span>
                        </div>

                        <div v-if="result.useCpe" class="flex justify-between">
                            <span class="text-gray-600">Complemento por CPE</span>
                            <span class="font-semibold">UYU {{ fmt(result.cpeComplement || 0) }}</span>
                        </div>

                        <div class="border-t pt-3 flex justify-between">
                            <span class="text-gray-800 font-semibold">
                                Total a pagar (FONASA + complemento CPE si aplica)
                            </span>
                            <span class="text-gray-900 font-extrabold">
                                UYU {{ fmt(result.totalToPay) }}
                            </span>
                        </div>

                        <p class="text-xs text-gray-500">
                            * Las tasas dependen de la franja (≤ o &gt; 2,5 BPC) y la situación familiar.
                            Los valores son referenciales y deben verificarse con BPS.
                        </p>
                    </div>
                </div>
            </section>
        </div>

    </div>
</template>