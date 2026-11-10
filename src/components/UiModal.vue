<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from "vue";
import UiIcon from "./UiIcon.vue";
defineProps({ title: String });
const emit = defineEmits(["close"]);
const dialog = ref(null);
let previous;
function key(e) {
  if (e.key === "Escape") emit("close");
  if (e.key !== "Tab") return;
  const nodes = [
    ...dialog.value.querySelectorAll('button,input,[tabindex="0"]'),
  ].filter((n) => !n.disabled);
  const first = nodes[0],
    last = nodes.at(-1);
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}
onMounted(async () => {
  previous = document.activeElement;
  document.body.style.overflow = "hidden";
  document.addEventListener("keydown", key);
  await nextTick();
  dialog.value.querySelector("input,button")?.focus();
});
onBeforeUnmount(() => {
  document.body.style.overflow = "";
  document.removeEventListener("keydown", key);
  previous?.focus();
});
</script>
<template>
  <Teleport to="body"
    ><div class="modal-backdrop" @click.self="$emit('close')">
      <section
        ref="dialog"
        class="modal"
        role="dialog"
        aria-modal="true"
        :aria-label="title"
      >
        <div class="modal-heading">
          <h2>{{ title }}</h2>
          <button class="icon-button" aria-label="关闭" @click="$emit('close')">
            <UiIcon name="close" />
          </button>
        </div>
        <slot />
      </section></div
  ></Teleport>
</template>
