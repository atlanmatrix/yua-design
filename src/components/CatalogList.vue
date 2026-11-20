<script setup>
import UiIcon from "./UiIcon.vue";

defineProps({
  title: { type: String, required: true },
  entries: { type: Array, required: true },
  designName: String,
});
</script>

<template>
  <main class="catalog">
    <nav v-if="designName" aria-label="面包屑">
      <a href="../">设计列表</a>
      <UiIcon name="right" :size="14" />
      <span>{{ designName }}</span>
    </nav>
    <h1>{{ title }}</h1>
    <ul>
      <li v-for="entry in entries" :key="entry.href">
        <a class="entry" :href="entry.href">
          <span class="icon"><UiIcon :name="entry.icon" :size="24" /></span>
          <span>{{ entry.label }}</span>
          <UiIcon class="next" name="right" :size="18" />
        </a>
      </li>
    </ul>
  </main>
</template>

<style>
body {
  margin: 0;
  background: #f4f5f6;
  color: #191b1e;
  font-family: "Inter", "PingFang SC", "Microsoft YaHei", sans-serif;
}
</style>

<style scoped>
.catalog {
  max-width: 56rem;
  margin: clamp(2.5rem, 9vw, 7rem) auto;
  padding: 0 1.25rem;
}
nav {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #535961;
  font-size: 0.875rem;
}
a { color: inherit; }
nav a { text-underline-offset: 0.2em; }
h1 {
  margin: 0 0 1.5rem;
  font-size: clamp(1.75rem, 4vw, 2.5rem);
}
nav + h1 { margin-top: 1.25rem; }
ul { padding: 0; margin: 0; list-style: none; }
li + li { margin-top: 0.75rem; }
.entry {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: white;
  border: 1px solid #dde0e3;
  border-radius: 1rem;
  text-decoration: none;
  font-size: 1.125rem;
  font-weight: 600;
}
.entry:hover { border-color: #848a90; }
a:focus-visible { outline: 2px solid #191b1e; outline-offset: 3px; }
.icon {
  display: grid;
  place-items: center;
  flex: none;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 0.75rem;
  background: #eef0f2;
}
.next { flex: none; margin-left: auto; }
</style>
