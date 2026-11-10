<script setup>
defineProps({ label: String, value: String, percent: Number, note: String });
</script>
<template>
  <div class="quota-meter">
    <div>
      <span>{{ label }}</span
      ><strong>{{ value }}</strong>
    </div>
    <progress :value="percent" max="100" :aria-label="label" />
    <p v-if="note">{{ note }}</p>
  </div>
</template>
