<template>
    <div class="dashboard-card">
        <div class="dashboard-card__header">
            <h3 class="card__title">{{ title }}</h3>
            <span class="card__subtitle">{{ subtitle }}</span>
            <span class="card__description">{{ description }}</span>
        </div>
        <div class="dashboard-card__content">
            <slot name="content"></slot>
        </div>
        <div class="dashboard-card__footer">
            <slot name="actions"></slot>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    title: {
        type: String,
        required: true
    },
    subtitle: {
        type: String,
    },
    description: {
        type: String,
    }
})
</script>

<style scoped lang="scss">
@use './styles.scss';
</style>