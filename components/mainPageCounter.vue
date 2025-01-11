<template>
    <div class="main">
        <h2 class="">{{ props.title }}</h2>
        <p class="number">{{ Math.round(props.count * 10) / 10 }}</p>
    </div>
</template>

<script setup>

const props = defineProps({
    title: {
        type: String,
        default: 'Default Title'
    },
    count: {
        type: Number,
        default: 0
    }
});
</script>

<style scoped>
.main {
    border-radius: 1rem;
    background-color: var(--p-form-field-border-color);
    padding: 1rem;
}

.number {
    font-size: 3rem;
    font-weight: 900;
    color: var(--p-primary-color);
}
</style>