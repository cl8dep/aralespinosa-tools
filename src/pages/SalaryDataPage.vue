<script setup lang="ts">
import * as salaryData from '@/data/salary'
import globalData from '@/data/global.json'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'

const lastUpdated = globalData.lastUpdated

const labelsAndTooltips: Record<string, { label: string; tooltip: string }> = {
    BPC: { label: 'BPC (Base de Prestaciones y Contribuciones)', tooltip: 'Unidad de medida para prestaciones y contribuciones a la seguridad social.' },
    CPE: { label: 'CPE (Costo Promedio Equivalente)', tooltip: 'Monto mensual minimo para la cobertura de salud a través del FONASA.' },
    IRPF_BRACKETS: { label: 'Franjas de IRPF', tooltip: 'Tramos de ingresos con sus respectivas tasas de impuesto a la renta.' },
    RETIREMENT_CONTRIBUTION_PERCENTAJE: { label: 'Porcentaje de Aporte Jubilatorio', tooltip: 'Porcentaje del salario destinado a la jubilación.' },
    RETIREMENT_CONTRIBUTION_CAP: { label: 'Tope de Aporte Jubilatorio', tooltip: 'Monto máximo de salario sobre el cual se calcula el aporte jubilatorio.' },
    FONASA_UNDER25BPC: { label: 'FONASA (Ingresos <= 2.5 BPC)', tooltip: 'Tasas de aporte al FONASA para ingresos menores o iguales a 2.5 BPC.' },
    FONASA_OVER25BPC: { label: 'FONASA (Ingresos > 2.5 BPC)', tooltip: 'Tasas de aporte al FONASA para ingresos mayores a 2.5 BPC.' },
    FRL_CONTRIBUTION: { label: 'Aporte al FRL (Fondo de Reconversión Laboral)', tooltip: 'Contribución para programas de capacitación y reconversión laboral.' },
    AFAP_CAP: { label: 'Tope de AFAP', tooltip: 'Monto máximo de salario para aportes a las AFAP.' },
    TAXABLE_INCOME_SURCHARGE: { label: 'Sobretasa de Ingresos Imponibles', tooltip: 'Porcentaje adicional aplicado a ingresos que superan 10 BPC.' },
    DEDUCTION_RATE_UNDER15BPC: { label: 'Tasa de Deducción (<= 15 BPC)', tooltip: 'Tasa de deducción del IRPF para ingresos hasta 15 BPC.' },
    DEDUCTION_RATE_OVER15BPC: { label: 'Tasa de Deducción (> 15 BPC)', tooltip: 'Tasa de deducción del IRPF para ingresos superiores a 15 BPC.' },
    DEDUCTION_PER_CHILD: { label: 'Deducción por Hijo', tooltip: 'Monto de deducción del IRPF por cada hijo a cargo.' },
    DEDUCTION_PER_DISABLED_CHILD: { label: 'Deducción por Hijo con Discapacidad', tooltip: 'Monto de deducción del IRPF por cada hijo con discapacidad a cargo.' },
    EXTRA_SOLIDARITY_CONTRIBUTION: { label: 'Aporte Adicional al Fondo de Solidaridad', tooltip: 'Pago adicional para carreras universitarias de cinco años o más.' },
}

function formatValue(key: string, value: unknown) {
    const percentageKeys = [
        'RETIREMENT_CONTRIBUTION_PERCENTAJE',
        'FRL_CONTRIBUTION',
        'TAXABLE_INCOME_SURCHARGE',
        'DEDUCTION_RATE_UNDER15BPC',
        'DEDUCTION_RATE_OVER15BPC'
    ];

    if (key.includes('FONASA') && typeof value === 'object' && value !== null && 'base' in value && 'spouse' in value && 'children' in value) {
        return `Base: ${value.base}%, Cónyuge: ${value.spouse}%, Hijos: ${value.children}%`
    }
    if (typeof value === 'number') {
        if (percentageKeys.includes(key)) {
            if (key === 'FRL_CONTRIBUTION') {
                return `${value}%`
            }
            return `${value}%`
        }
        return value.toLocaleString('es-UY', { style: 'currency', currency: 'UYU', currencyDisplay: "code"})
    }
    if (key === 'IRPF_BRACKETS' && Array.isArray(value)) {
        return value.map(bracket => {
            const to = bracket.to === 0 ? 'en adelante' : `hasta ${bracket.to} BPC`;
            return `Desde ${bracket.from} BPC ${to}: ${bracket.rate}%`;
        }).join('\n');
    }
    if (typeof value === 'object' && value !== null) {
        return JSON.stringify(value, null, 2)
    }
    return value
}
</script>

<template>
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        <button @click="$router.back()"
            class="text-sm text-blue-600 hover:underline mb-4 inline-flex items-center cursor-pointer">
            ← Volver
        </button>

        <div class="text-center border-b border-gray-200 pb-6">
            <h1 class="text-3xl font-bold tracking-tight text-gray-900">
                Valores para Cálculos Salariales
            </h1>
            <p class="mt-2 text-gray-600 text-base max-w-2xl mx-auto">
                Última actualización: {{ new Date(lastUpdated).toLocaleDateString('es-UY') }}
            </p>
        </div>

        <div class="overflow-x-auto">
            <table class="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead class="bg-gray-50">
                    <tr>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Variable
                        </th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Valor
                        </th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                    <tr v-for="(value, key) in salaryData" :key="key">
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            <div class="flex items-center">
                                <span>{{ labelsAndTooltips[key]?.label || key }}</span>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger class="ml-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                                            </svg>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>{{ labelsAndTooltips[key]?.tooltip }}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                        </td>
                        <td class="px-6 py-4 whitespace-pre-wrap text-sm text-gray-500">
                            <pre>{{ formatValue(key, value) }}</pre>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>