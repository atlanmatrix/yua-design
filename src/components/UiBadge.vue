<script setup>
defineProps({ tone: { type: String, default: "soft" }, dot: Boolean });
</script>
<template>
  <span :class="['badge', `badge--${tone}`, { 'badge--dot': dot }]"
    ><slot
  /></span>
</template>
