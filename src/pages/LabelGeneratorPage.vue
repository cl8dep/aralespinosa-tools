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

type ProductLine = { name: string; quantity: number }

const productLines = ref<ProductLine[]>([{ name: '', quantity: 1 }])

function addProductLine() {
    productLines.value.push({ name: '', quantity: 1 })
}

function removeProductLine(index: number) {
    if (productLines.value.length > 1) {
        productLines.value.splice(index, 1)
    }
}

const form = useForm({
    initialValues: {
        saleId: '',
        buyerId: '',
        trackingCode: '',
        shippingMethod: 'PAC',
        recipientName: '',
        recipientStreet: '',
        recipientApartment: '',
        recipientPostalCode: '',
        recipientCity: '',
        recipientDepartment: '',
        recipientPhone: '',
        senderName: '',
        senderStreet: '',
        senderApartment: '',
        senderPostalCode: '',
        senderCity: '',
        senderRut: '',
        showQr: false,
        qrData: '',
    }
})

type LabelData = {
    products: ProductLine[]
    saleId: string
    buyerId: string
    trackingCode: string
    shippingMethod: string
    recipientName: string
    recipientStreet: string
    recipientApartment: string
    recipientPostalCode: string
    recipientCity: string
    recipientDepartment: string
    recipientPhone: string
    senderName: string
    senderStreet: string
    senderApartment: string
    senderPostalCode: string
    senderCity: string
    senderRut: string
    showQr: boolean
    qrData: string
}

const label = ref<LabelData | null>(null)
const labelSection = ref<HTMLElement | null>(null)
const logoUrl = ref<string | null>(null)

function onLogoChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
            logoUrl.value = e.target?.result as string
        }
        reader.readAsDataURL(file)
    }
}

const onSubmit = form.handleSubmit(async (values) => {
    label.value = {
        products: productLines.value.filter(p => p.name.trim() !== '').map(p => ({
            name: p.name,
            quantity: Number(p.quantity) || 1,
        })),
        saleId: values.saleId || '',
        buyerId: values.buyerId || '',
        trackingCode: values.trackingCode || '',
        shippingMethod: values.shippingMethod || 'PAC',
        recipientName: values.recipientName || '',
        recipientStreet: values.recipientStreet || '',
        recipientApartment: values.recipientApartment || '',
        recipientPostalCode: values.recipientPostalCode || '',
        recipientCity: values.recipientCity || '',
        recipientDepartment: values.recipientDepartment || '',
        recipientPhone: values.recipientPhone || '',
        senderName: values.senderName || '',
        senderStreet: values.senderStreet || '',
        senderApartment: values.senderApartment || '',
        senderPostalCode: values.senderPostalCode || '',
        senderCity: values.senderCity || '',
        senderRut: values.senderRut || '',
        showQr: Boolean(values.showQr),
        qrData: values.qrData || '',
    }

    await nextTick()
    labelSection.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
})

function printLabel() {
    window.print()
}
</script>

<template>
    <main class="min-h-screen bg-gray-50 flex flex-col">
        <div class="flex-grow max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 w-full print:hidden">
            <button @click="$router.back()"
                class="text-sm text-blue-600 hover:underline mb-4 inline-flex items-center cursor-pointer">
                ← Volver
            </button>

            <div class="text-center border-b border-gray-200 pb-6">
                <h1 class="text-3xl font-bold tracking-tight text-gray-900">
                    Generador de Etiquetas de Envío
                </h1>
                <p class="mt-2 text-gray-600 text-base max-w-2xl mx-auto">
                    Generá etiquetas de envío listas para imprimir. Completá los datos y obtené tu etiqueta en formato
                    100×150mm.
                </p>
            </div>

            <form @submit="onSubmit">
                <section class="bg-white shadow-sm border border-gray-200 rounded-xl p-6 sm:p-8 space-y-8">
                    <!-- Logo -->
                    <div>
                        <h2 class="text-lg font-semibold text-gray-800 mb-4">Logo del negocio (opcional)</h2>
                        <div class="flex items-center gap-4">
                            <input type="file" accept="image/*" @change="onLogoChange"
                                class="text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 file:cursor-pointer" />
                            <img v-if="logoUrl" :src="logoUrl" alt="Logo preview"
                                class="h-12 w-12 object-contain rounded border border-gray-200" />
                        </div>
                    </div>

                    <!-- Productos -->
                    <div>
                        <div class="flex items-center justify-between mb-4">
                            <h2 class="text-lg font-semibold text-gray-800">Productos</h2>
                            <button type="button" @click="addProductLine"
                                class="text-sm text-blue-600 hover:text-blue-800 font-medium cursor-pointer">
                                + Agregar línea
                            </button>
                        </div>
                        <div class="space-y-3">
                            <div v-for="(line, index) in productLines" :key="index"
                                class="grid grid-cols-[1fr_80px_32px] sm:grid-cols-[1fr_100px_32px] gap-2 items-end">
                                <div>
                                    <label v-if="index === 0"
                                        class="text-sm font-medium text-gray-700 mb-1 block">Producto</label>
                                    <Input v-model="line.name" type="text" placeholder="Ej: Camiseta algodón" />
                                </div>
                                <div>
                                    <label v-if="index === 0"
                                        class="text-sm font-medium text-gray-700 mb-1 block">Cant.</label>
                                    <Input v-model="line.quantity" type="number" placeholder="1" />
                                </div>
                                <button type="button" @click="removeProductLine(index)"
                                    :disabled="productLines.length <= 1"
                                    class="h-9 w-8 flex items-center justify-center text-gray-400 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer">
                                    ✕
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Datos del envío -->
                    <div>
                        <h2 class="text-lg font-semibold text-gray-800 mb-4">Datos del envío</h2>
                        <div class="grid sm:grid-cols-2 gap-4">
                            <FormField name="saleId" v-slot="{ componentField }">
                                <FormItem>
                                    <FormLabel class="text-sm font-medium text-gray-700">N° de venta</FormLabel>
                                    <FormControl>
                                        <Input type="text" placeholder="Ej: 162362546597" v-bind="componentField" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            </FormField>

                            <FormField name="buyerId" v-slot="{ componentField }">
                                <FormItem>
                                    <FormLabel class="text-sm font-medium text-gray-700">ID Comprador</FormLabel>
                                    <FormControl>
                                        <Input type="text" placeholder="Ej: MLB_ME2" v-bind="componentField" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            </FormField>

                            <FormField name="trackingCode" v-slot="{ componentField }">
                                <FormItem>
                                    <FormLabel class="text-sm font-medium text-gray-700">Código de rastreo</FormLabel>
                                    <FormControl>
                                        <Input type="text" placeholder="Ej: PP335284972BR" v-bind="componentField" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            </FormField>

                            <FormField name="shippingMethod" v-slot="{ componentField }">
                                <FormItem>
                                    <FormLabel class="text-sm font-medium text-gray-700">Método de envío</FormLabel>
                                    <FormControl>
                                        <Input type="text" placeholder="Ej: PAC, SEDEX" v-bind="componentField" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            </FormField>
                        </div>
                    </div>

                    <!-- Destinatario -->
                    <div>
                        <h2 class="text-lg font-semibold text-gray-800 mb-4">Destinatario</h2>
                        <div class="grid sm:grid-cols-2 gap-4">
                            <FormField name="recipientName" v-slot="{ componentField }">
                                <FormItem class="sm:col-span-2">
                                    <FormLabel class="text-sm font-medium text-gray-700">Nombre completo</FormLabel>
                                    <FormControl>
                                        <Input type="text" placeholder="Ej: Mirta Esteves" v-bind="componentField" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            </FormField>

                            <FormField name="recipientStreet" v-slot="{ componentField }">
                                <FormItem>
                                    <FormLabel class="text-sm font-medium text-gray-700">Calle y número</FormLabel>
                                    <FormControl>
                                        <Input type="text" placeholder="Ej: R. Velha, 29" v-bind="componentField" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            </FormField>

                            <FormField name="recipientApartment" v-slot="{ componentField }">
                                <FormItem>
                                    <FormLabel class="text-sm font-medium text-gray-700">Apto / Depto (opcional)</FormLabel>
                                    <FormControl>
                                        <Input type="text" placeholder="Ej: apto 3B" v-bind="componentField" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            </FormField>

                            <FormField name="recipientPostalCode" v-slot="{ componentField }">
                                <FormItem>
                                    <FormLabel class="text-sm font-medium text-gray-700">Código postal</FormLabel>
                                    <FormControl>
                                        <Input type="text" placeholder="Ej: 22753-737" v-bind="componentField" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            </FormField>

                            <FormField name="recipientCity" v-slot="{ componentField }">
                                <FormItem>
                                    <FormLabel class="text-sm font-medium text-gray-700">Ciudad</FormLabel>
                                    <FormControl>
                                        <Input type="text" placeholder="Ej: Rio de Janeiro" v-bind="componentField" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            </FormField>

                            <FormField name="recipientDepartment" v-slot="{ componentField }">
                                <FormItem>
                                    <FormLabel class="text-sm font-medium text-gray-700">Departamento / Estado</FormLabel>
                                    <FormControl>
                                        <Input type="text" placeholder="Ej: Montevideo" v-bind="componentField" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            </FormField>

                            <FormField name="recipientPhone" v-slot="{ componentField }">
                                <FormItem>
                                    <FormLabel class="text-sm font-medium text-gray-700">Teléfono</FormLabel>
                                    <FormControl>
                                        <Input type="text" placeholder="Ej: 099 123 456" v-bind="componentField" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            </FormField>
                        </div>
                    </div>

                    <!-- Remitente -->
                    <div>
                        <h2 class="text-lg font-semibold text-gray-800 mb-4">Remitente</h2>
                        <div class="grid sm:grid-cols-2 gap-4">
                            <FormField name="senderName" v-slot="{ componentField }">
                                <FormItem class="sm:col-span-2">
                                    <FormLabel class="text-sm font-medium text-gray-700">Nombre completo</FormLabel>
                                    <FormControl>
                                        <Input type="text" placeholder="Ej: Juan Pérez" v-bind="componentField" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            </FormField>

                            <FormField name="senderStreet" v-slot="{ componentField }">
                                <FormItem>
                                    <FormLabel class="text-sm font-medium text-gray-700">Calle y número</FormLabel>
                                    <FormControl>
                                        <Input type="text" placeholder="Ej: R. São Felipe 1200" v-bind="componentField" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            </FormField>

                            <FormField name="senderApartment" v-slot="{ componentField }">
                                <FormItem>
                                    <FormLabel class="text-sm font-medium text-gray-700">Apto / Depto (opcional)</FormLabel>
                                    <FormControl>
                                        <Input type="text" placeholder="Ej: Dpto. B" v-bind="componentField" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            </FormField>

                            <FormField name="senderPostalCode" v-slot="{ componentField }">
                                <FormItem>
                                    <FormLabel class="text-sm font-medium text-gray-700">Código postal</FormLabel>
                                    <FormControl>
                                        <Input type="text" placeholder="Ej: 03085-010" v-bind="componentField" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            </FormField>

                            <FormField name="senderCity" v-slot="{ componentField }">
                                <FormItem>
                                    <FormLabel class="text-sm font-medium text-gray-700">Ciudad</FormLabel>
                                    <FormControl>
                                        <Input type="text" placeholder="Ej: São Paulo" v-bind="componentField" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            </FormField>

                            <FormField name="senderRut" v-slot="{ componentField }">
                                <FormItem>
                                    <FormLabel class="text-sm font-medium text-gray-700">RUT</FormLabel>
                                    <FormControl>
                                        <Input type="text" placeholder="Ej: 21 234 567 0019" v-bind="componentField" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            </FormField>
                        </div>
                    </div>

                    <!-- QR opcional -->
                    <div>
                        <h2 class="text-lg font-semibold text-gray-800 mb-4">QR Code (opcional)</h2>
                        <div class="space-y-4">
                            <FormField v-slot="{ value, handleChange }" type="checkbox" name="showQr">
                                <FormItem class="flex flex-row items-start gap-3 py-1">
                                    <FormControl>
                                        <Checkbox :model-value="value" @update:model-value="handleChange" />
                                    </FormControl>
                                    <div class="space-y-0 leading-none">
                                        <FormLabel>Incluir código QR en la etiqueta</FormLabel>
                                        <FormMessage />
                                    </div>
                                </FormItem>
                            </FormField>

                            <FormField name="qrData" v-slot="{ componentField }">
                                <FormItem>
                                    <FormLabel class="text-sm font-medium text-gray-700">Datos del QR (URL o texto)</FormLabel>
                                    <FormControl>
                                        <Input type="text" placeholder="Ej: https://rastreo.correos.com/PP335284972BR"
                                            v-bind="componentField" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            </FormField>
                        </div>
                    </div>

                    <div class="pt-2">
                        <button type="submit"
                            class="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600">
                            Generar etiqueta
                        </button>
                    </div>
                </section>
            </form>

            <!-- Vista previa -->
            <section v-if="label" ref="labelSection" class="space-y-4">
                <div class="flex items-center justify-between">
                    <h2 class="text-xl font-semibold text-gray-800">Vista previa</h2>
                    <button @click="printLabel"
                        class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 text-white text-sm font-medium hover:bg-gray-900 cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                        Imprimir
                    </button>
                </div>

                <p class="text-sm text-gray-500">La etiqueta se imprimirá en tamaño 100×150mm. Asegurate de configurar
                    tu impresora para ese tamaño de papel.</p>
            </section>
        </div>

        <!-- Etiqueta imprimible -->
        <div v-if="label" class="flex justify-center pb-10 print:pb-0 print:flex">
            <div class="label-container bg-white border-2 border-black flex flex-col"
                style="width: 100mm; height: 150mm; font-family: Arial, Helvetica, sans-serif;">

                <!-- 1. Remitente + Logo -->
                <div class="border-b-2 border-black px-3 py-2 flex items-start gap-2" style="font-size: 9px; line-height: 1.4;">
                    <img v-if="logoUrl" :src="logoUrl" alt="Logo" class="h-10 w-10 object-contain grayscale shrink-0" />
                    <div class="flex-1">
                        <div>{{ label.senderStreet }}<template v-if="label.senderApartment">, {{ label.senderApartment }}</template></div>
                        <div>{{ label.senderCity }}</div>
                        <div v-if="label.senderRut">RUT: {{ label.senderRut }}</div>
                        <div class="flex gap-3">
                            <span>Venta: <strong>{{ label.saleId }}</strong></span>
                            <span>Envío: <strong>{{ label.trackingCode }}</strong></span>
                        </div>
                    </div>
                </div>

                <!-- 2. Método de envío -->
                <div class="border-b-2 border-black text-center py-1.5">
                    <div class="font-bold" style="font-size: 14px;">{{ label.shippingMethod }}</div>
                </div>

                <!-- 3. QR + Código postal / Ciudad / Departamento -->
                <div class="border-b-2 border-black px-3 py-2 flex items-center gap-3">
                    <img v-if="label.showQr && label.qrData"
                        :src="`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(label.qrData)}`"
                        alt="QR Code" class="w-20 h-20 shrink-0" />
                    <div class="flex-1 text-right">
                        <div style="font-size: 11px;">CP: <strong>{{ label.recipientPostalCode }}</strong></div>
                        <div class="font-bold" style="font-size: 14px;">{{ label.recipientCity }}</div>
                        <div v-if="label.recipientDepartment" class="font-bold" style="font-size: 13px;">{{ label.recipientDepartment }}</div>
                    </div>
                </div>

                <!-- 4. Productos -->
                <div class="border-b border-black px-3 py-1.5" style="font-size: 9px;">
                    <div v-for="(product, i) in label.products" :key="i" class="leading-tight"
                        :class="{ 'mt-0.5': i > 0 }">
                        <span class="font-bold">{{ product.name }}</span>
                        <span class="ml-1">× {{ product.quantity }}</span>
                    </div>
                </div>

                <!-- 6. Destinatario -->
                <div class="border-b-2 border-black px-3 py-2 flex-1" style="font-size: 10px; line-height: 1.5;">
                    <div class="mb-1">
                        <span class="font-bold">Dirección:</span> {{ label.recipientStreet }}
                    </div>
                    <div v-if="label.recipientApartment" class="mb-1">
                        <span class="font-bold">Complemento:</span> {{ label.recipientApartment }}
                    </div>
                    <div class="mb-1">
                        <span class="font-bold">Barrio:</span> {{ label.recipientCity }}
                    </div>
                    <div v-if="label.recipientPhone" class="mb-1">
                        <span class="font-bold">Teléfono:</span> {{ label.recipientPhone }}
                    </div>
                    <div>
                        <span class="font-bold">Destinatario:</span> {{ label.recipientName }}
                    </div>
                </div>

                <!-- 7. Comprobante de entrega (línea de corte) -->
                <div class="border-t-2 border-dashed border-black px-3 py-2" style="font-size: 8px;">
                    <div class="text-center font-bold mb-1.5" style="font-size: 9px;">✂ COMPROBANTE DE ENTREGA</div>
                    <div class="flex justify-between mb-2">
                        <span>Pedido: <strong>{{ label.saleId }}</strong></span>
                        <span>Código: <strong>{{ label.trackingCode }}</strong></span>
                    </div>
                    <div class="flex gap-2">
                        <div class="flex-1 border-b border-dotted border-black pb-3">
                            <span class="text-gray-600">Nombre:</span>
                        </div>
                    </div>
                    <div class="flex gap-3 mt-2">
                        <div class="flex-1 border-b border-dotted border-black pb-3">
                            <span class="text-gray-600">Firma:</span>
                        </div>
                        <div class="flex-1 border-b border-dotted border-black pb-3">
                            <span class="text-gray-600">Documento:</span>
                        </div>
                    </div>
                    <div class="flex gap-3 mt-2">
                        <div class="flex-1 border-b border-dotted border-black pb-3">
                            <span class="text-gray-600">Fecha:</span>
                        </div>
                        <div class="flex-1 border-b border-dotted border-black pb-3">
                            <span class="text-gray-600">Hora:</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="print:hidden">
            <Footer />
        </div>
    </main>
</template>

<style>
@media print {
    @page {
        size: 100mm 150mm;
        margin: 0;
    }

    body * {
        visibility: hidden !important;
    }

    .label-container,
    .label-container * {
        visibility: visible !important;
    }

    .label-container {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100mm !important;
        height: 150mm !important;
        border: 1px solid black !important;
    }
}
</style>
