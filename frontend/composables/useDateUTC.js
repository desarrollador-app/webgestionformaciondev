import { ref, watch } from 'vue'

/**
 * Composable para manejar fechas en UTC de forma consistente
 * Evita problemas de timezone al trabajar siempre en UTC
 */
export function useDateUTC(initialValue = null) {
    const localValue = ref(initialValue)
    const utcValue = ref(null)

    // Convierte fecha local a UTC manteniendo la fecha visual
    const localDateToUTC = (localDate) => {
        if (!localDate || !(localDate instanceof Date)) return null
        const year = localDate.getFullYear()
        const month = localDate.getMonth()
        const day = localDate.getDate()
        return new Date(Date.UTC(year, month, day))
    }

    // Convierte fecha UTC a fecha local para mostrar en DatePicker
    const utcDateToLocal = (utcDate) => {
        if (!utcDate) return null
        const date = utcDate instanceof Date ? utcDate : new Date(utcDate)
        if (isNaN(date.getTime())) return null
        const year = date.getUTCFullYear()
        const month = date.getUTCMonth()
        const day = date.getUTCDate()
        return new Date(year, month, day)
    }

    // Watcher: cuando cambia la fecha local, convertir a UTC
    watch(localValue, (newLocalDate) => {
        const newUtcDate = localDateToUTC(newLocalDate)
        // Solo actualizar si el valor es diferente para evitar ciclos
        if (newUtcDate?.getTime() !== utcValue.value?.getTime()) {
            utcValue.value = newUtcDate
        }
    }, { immediate: true })

    // Watcher: cuando cambia la fecha UTC, convertir a local
    watch(utcValue, (newUtcDate) => {
        const newLocalDate = utcDateToLocal(newUtcDate)
        // Solo actualizar si el valor es diferente para evitar ciclos
        if (newLocalDate?.getTime() !== localValue.value?.getTime()) {
            localValue.value = newLocalDate
        }
    }, { immediate: true })

    return {
        localValue,    // Para usar con v-model del DatePicker
        utcValue,      // Para enviar al backend
        localDateToUTC,
        utcDateToLocal
    }
}

/**
 * Composable para manejar fechas múltiples en UTC
 * Útil para DatePickers con selectionMode="multiple"
 */
export function useMultipleDateUTC(initialValue = []) {
    const localDates = ref(initialValue)
    const utcDates = ref([])

    // Convierte array de fechas locales a UTC
    const convertLocalArrayToUTC = (localArray) => {
        if (!Array.isArray(localArray)) return []
        return localArray.map(date => {
            if (!date || !(date instanceof Date)) return null
            const year = date.getFullYear()
            const month = date.getMonth()
            const day = date.getDate()
            return new Date(Date.UTC(year, month, day))
        }).filter(date => date !== null)
    }

    // Convierte array de fechas UTC a local
    const convertUTCArrayToLocal = (utcArray) => {
        if (!Array.isArray(utcArray)) return []
        return utcArray.map(date => {
            if (!date) return null
            const utcDate = date instanceof Date ? date : new Date(date)
            if (isNaN(utcDate.getTime())) return null
            const year = utcDate.getUTCFullYear()
            const month = utcDate.getUTCMonth()
            const day = utcDate.getUTCDate()
            return new Date(year, month, day)
        }).filter(date => date !== null)
    }

    // Watcher: cuando cambian las fechas locales, convertir a UTC
    watch(localDates, (newLocalDates) => {
        const newUtcDates = convertLocalArrayToUTC(newLocalDates)
        // Solo actualizar si el array es diferente para evitar ciclos
        const isDifferent = newUtcDates.length !== utcDates.value.length || 
            newUtcDates.some((date, index) => date?.getTime() !== utcDates.value[index]?.getTime())
        if (isDifferent) {
            utcDates.value = newUtcDates
        }
    }, { immediate: true, deep: true })

    // Watcher: cuando cambian las fechas UTC, convertir a local
    watch(utcDates, (newUtcDates) => {
        const newLocalDates = convertUTCArrayToLocal(newUtcDates)
        // Solo actualizar si el array es diferente para evitar ciclos
        const isDifferent = newLocalDates.length !== localDates.value.length || 
            newLocalDates.some((date, index) => date?.getTime() !== localDates.value[index]?.getTime())
        if (isDifferent) {
            localDates.value = newLocalDates
        }
    }, { immediate: true, deep: true })

    return {
        localDates,
        utcDates
    }
}
