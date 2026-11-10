<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import { Chart, DoughnutController, ArcElement, Tooltip } from "chart.js";
Chart.register(DoughnutController, ArcElement, Tooltip);
const props = defineProps({
  values: { type: Array, default: () => [33, 22, 17, 14] },
});
const canvas = ref(null);
let chart;
onMounted(() => {
  chart = new Chart(canvas.value, {
    type: "doughnut",
    data: {
      labels: ["OP 运行领域", "MM 维修工程", "RP 辐射与环评", "EN/QA 综合支撑"],
      datasets: [
        {
          data: props.values,
          backgroundColor: ["#050606", "#5c6278", "#4c78ff", "#bec7e2"],
          borderWidth: 0,
        },
      ],
    },
    options: {
      animation: false,
      cutout: "72%",
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
    },
  });
});
watch(
  () => props.values,
  (v) => {
    if (chart) {
      chart.data.datasets[0].data = v;
      chart.update();
    }
  },
);
onBeforeUnmount(() => chart?.destroy());
</script>
<template>
  <div class="donut">
    <canvas
      ref="canvas"
      role="img"
      :aria-label="`专业领域评估实例分布：${values.join('、')}`"
    ></canvas
    ><span
      ><strong>{{ values.reduce((a, b) => a + b, 0) }}</strong
      >评估实例</span
    >
  </div>
</template>
