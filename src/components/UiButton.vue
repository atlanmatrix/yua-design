<script setup>
import UiIcon from "./UiIcon.vue";
defineProps({
  variant: { type: String, default: "secondary" },
  icon: String,
  size: { type: String, default: "normal" },
  type: { type: String, default: "button" },
});
</script>
<template>
  <button
    :type="type"
    :class="['button', `button--${variant}`, `button--${size}`]"
  >
    <UiIcon v-if="icon" :name="icon" /><slot />
  </button>
</template>
