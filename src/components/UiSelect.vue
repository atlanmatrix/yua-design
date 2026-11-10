<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import UiIcon from "./UiIcon.vue";
const props = defineProps({
  modelValue: [String, Number, Array],
  options: Array,
  label: String,
  placeholder: String,
  multiple: Boolean,
});
const emit = defineEmits(["update:modelValue"]);
const open = ref(false),
  root = ref(null),
  active = ref(0);
const selected = computed(() =>
  props.multiple
    ? props.modelValue.length
      ? props.options
          .filter((o) => props.modelValue.includes(o.value))
          .map((o) => o.label)
          .join("、")
      : props.options.find((o) => o.value === "")?.label
    : props.options.find((o) => o.value === props.modelValue)?.label ||
      props.placeholder,
);
function isSelected(option) {
  return props.multiple
    ? option.value
      ? props.modelValue.includes(option.value)
      : !props.modelValue.length
    : option.value === props.modelValue;
}
function choose(option) {
  if (props.multiple) {
    emit(
      "update:modelValue",
      !option.value
        ? []
        : props.modelValue.includes(option.value)
          ? props.modelValue.filter((v) => v !== option.value)
          : [...props.modelValue, option.value],
    );
  } else {
    emit("update:modelValue", option.value);
    open.value = false;
  }
  root.value.querySelector("button").focus();
}
function outside(e) {
  if (!root.value?.contains(e.target)) open.value = false;
}
function keyboard(e) {
  if (e.key === "Escape") open.value = false;
  if (["ArrowDown", "ArrowUp"].includes(e.key)) {
    e.preventDefault();
    open.value = true;
    active.value =
      (active.value + (e.key === "ArrowDown" ? 1 : -1) + props.options.length) %
      props.options.length;
  }
  if (e.key === "Enter" && open.value) {
    e.preventDefault();
    choose(props.options[active.value]);
  }
}
onMounted(() => document.addEventListener("pointerdown", outside));
onBeforeUnmount(() => document.removeEventListener("pointerdown", outside));
</script>
<template>
  <div ref="root" class="select-field" @keydown="keyboard">
    <span v-if="label" class="field-label">{{ label }}</span>
    <button
      type="button"
      class="select-trigger"
      role="combobox"
      :aria-label="label || placeholder"
      :aria-expanded="open"
      aria-haspopup="listbox"
      @click="open = !open"
    >
      <span>{{ selected }}</span
      ><UiIcon name="down" :size="19" />
    </button>
    <div
      v-if="open"
      class="select-options"
      role="listbox"
      :aria-label="label || placeholder"
      :aria-multiselectable="multiple || undefined"
    >
      <button
        v-for="(option, i) in options"
        :key="option.value"
        type="button"
        role="option"
        :aria-selected="isSelected(option)"
        :class="{ chosen: isSelected(option), focused: i === active }"
        @click="choose(option)"
      >
        {{ option.label
        }}<UiIcon v-if="isSelected(option)" name="check" :size="17" />
      </button>
    </div>
  </div>
</template>
