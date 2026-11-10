<script setup>
import UiIcon from "./UiIcon.vue";
defineProps({
  modelValue: [String, Number],
  label: String,
  placeholder: String,
  icon: String,
  type: { type: String, default: "text" },
});
defineEmits(["update:modelValue"]);
</script>
<template>
  <label class="input-field"
    ><span v-if="label" class="field-label">{{ label }}</span
    ><span class="input-shell"
      ><UiIcon v-if="icon" :name="icon" /><input
        :value="modelValue"
        :type="type"
        :placeholder="placeholder"
        :aria-label="label || placeholder"
        @input="$emit('update:modelValue', $event.target.value)"
        v-bind="$attrs" /></span
  ></label>
</template>
