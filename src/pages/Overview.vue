<script setup>
import { computed, ref } from "vue";
import UiButton from "../components/UiButton.vue";
import UiBadge from "../components/UiBadge.vue";
import UiIcon from "../components/UiIcon.vue";
import UiSelect from "../components/UiSelect.vue";
import UiInput from "../components/UiInput.vue";
import ActivityChart from "../components/ActivityChart.vue";
import QuotaMeter from "../components/QuotaMeter.vue";
import {
  state,
  areas,
  openTenantForm,
  exportCsv,
  notify,
} from "../data/tenants";
const standard = ref(""),
  area = ref(""),
  year = ref("2026"),
  query = ref(""),
  applied = ref(null);
const standards = [
  { value: "", label: "All standards (全部评估准则)" },
  { value: "wano", label: "WANO 绩效目标与准则" },
  { value: "iaea", label: "IAEA 核安全标准" },
];
const years = ["2026", "2025", "2024"].map((value) => ({
  value,
  label: `${value} 年度统计`,
}));
const selected = computed(() =>
  !applied.value
    ? state.tenants
    : state.tenants.filter(
        (t) =>
          (!applied.value.area || t.area === applied.value.area) &&
          [t.name, t.code, t.units].some((v) =>
            v.toLowerCase().includes(applied.value.query.toLowerCase()),
          ),
      ),
);
const isFiltered = computed(
  () =>
    applied.value &&
    (applied.value.area ||
      applied.value.query ||
      applied.value.standard ||
      applied.value.year !== "2026"),
);
const selectedProjects = computed(() =>
  selected.value.reduce((sum, t) => sum + t.projects, 0),
);
const chartValues = computed(() =>
  !isFiltered.value
    ? [33, 22, 17, 14]
    : ["OP", "MM", "RP", "EN"].map((a) =>
        selected.value
          .filter((t) => t.area === a || (a === "EN" && t.area === "QA"))
          .reduce((s, t) => s + t.projects, 0),
      ),
);
const plants = [
  {
    id: "FUQING",
    name: "福清核电基地",
    location: "福建省福清市",
    units: "6 台机组 (1-6号)",
    badge: "华龙一号示范工程",
    tenants: 16,
    projects: 42,
    safety: "100%",
    load: 48.8,
  },
  {
    id: "QINSHAN",
    name: "秦山核电基地",
    location: "浙江省嘉兴市海盐县",
    units: "7 台机组 (一/二/三期)",
    badge: "中国核电摇篮",
    tenants: 12,
    projects: 44,
    safety: "99.8%",
    load: 51.2,
  },
];
function apply() {
  applied.value = {
    standard: standard.value,
    area: area.value,
    year: year.value,
    query: query.value.trim(),
  };
  notify("筛选已更新");
}
function reset() {
  standard.value = "";
  area.value = "";
  year.value = "2026";
  query.value = "";
  applied.value = null;
}
function number(p, key) {
  return isFiltered.value
    ? key === "tenants"
      ? selected.value.filter((t) => t.plant === p.id).length
      : selected.value
          .filter((t) => t.plant === p.id)
          .reduce((s, t) => s + t.projects, 0)
    : p[key];
}
</script>
<template>
  <div class="overview-page">
    <div class="breadcrumb">
      <span>平台管理</span><UiIcon name="right" :size="16" /><span
        >租户中心</span
      ><UiIcon name="right" :size="16" /><strong>运营统计</strong>
    </div>
    <div class="page-heading overview-heading">
      <div>
        <h1>租户与电厂运营统计</h1>
        <p>监控多电厂多组织租户入驻、资源配额与核安全评估运行概况</p>
      </div>
      <div class="heading-actions">
        <UiButton
          variant="white"
          icon="download"
          @click="exportCsv(selected, '运营报告')"
          >导出运营报表</UiButton
        ><UiButton variant="primary" icon="plus" @click="openTenantForm()"
          >接入新租户</UiButton
        >
      </div>
    </div>
    <section class="metric-grid" aria-label="运营指标">
      <article class="metric-card surface">
        <div><span>总入驻租户数</span><UiBadge>环比提升</UiBadge></div>
        <p>
          <strong>{{
            isFiltered
              ? selected.length
              : 28 + Math.max(0, state.tenants.length - 18)
          }}</strong
          ><span>个组织机构</span>
        </p>
        <footer>
          <b><UiIcon name="up" :size="19" />+16.7%</b>较上月净增 4 个
        </footer>
      </article>
      <article class="metric-card surface">
        <div>
          <span>覆盖核电厂区</span
          ><span class="metric-badges"
            ><UiBadge>FUQING</UiBadge><UiBadge>QINSHAN</UiBadge></span
          >
        </div>
        <p>
          <strong>{{
            isFiltered ? new Set(selected.map((t) => t.plant)).size : 2
          }}</strong
          ><span>大主要核电基地</span>
        </p>
        <footer>
          <UiBadge tone="plain" dot>涵盖 14 个连续运行商运机组</UiBadge>
        </footer>
      </article>
      <article class="metric-card surface">
        <div><span>活跃评估项目</span><UiBadge>在线进行</UiBadge></div>
        <p>
          <strong>{{ isFiltered ? selectedProjects : 86 }}</strong
          ><span>项 WANO 体系</span>
        </p>
        <footer>自评 52 · 同业 24 · 复查 10</footer>
      </article>
      <article class="metric-card surface">
        <div><span>系统可用与合规</span><UiBadge>100% 审计</UiBadge></div>
        <p>
          <strong>99.98<small>%</small></strong
          ><span>SLA 达标</span>
        </p>
        <footer>
          <UiIcon
            class="blue-text"
            name="settings"
            :size="21"
          />三级等保与核安全合规认证
        </footer>
      </article>
    </section>
    <form class="overview-filters surface" @submit.prevent="apply">
      <div class="filter-grid">
        <UiSelect
          v-model="standard"
          label="评估标准体系 (Standard)"
          :options="standards"
        /><UiSelect
          v-model="area"
          label="评估领域 (Areas)"
          :options="[
            {
              value: '',
              label: 'All areas (全部专业领域: OP, MM, RP, EN, QA)',
            },
            ...areas.slice(1),
          ]"
        /><UiSelect
          v-model="year"
          label="统计周期年度 (Year)"
          :options="years"
        />
      </div>
      <div class="search-row">
        <UiInput
          v-model="query"
          icon="search"
          placeholder="输入租户名称、机构代码或电厂机组 ID..."
        /><UiButton type="submit" variant="primary" icon="search"
          >筛选查询</UiButton
        ><UiButton variant="white" @click="reset">重置条件</UiButton>
      </div>
    </form>
    <div class="overview-columns">
      <section class="distribution-card surface">
        <div class="section-heading">
          <h2><UiIcon name="plant" :size="28" />所属电厂分布与机组容量监控</h2>
          <span>实时更新: 10 分钟前</span>
        </div>
        <p class="section-caption">
          按核电基地维度的租户组织分配、核电机组数与当前在线评估负荷状态
        </p>
        <article v-for="p in plants" :key="p.id" class="plant-card">
          <header>
            <div>
              <UiBadge tone="white">{{ p.id }}</UiBadge
              ><strong>{{ p.name }}</strong
              ><span>{{ p.location }}</span>
            </div>
            <div>
              <UiBadge tone="white">{{ p.units }}</UiBadge
              ><UiBadge tone="blue">{{ p.badge }}</UiBadge>
            </div>
          </header>
          <div class="plant-metrics">
            <div>
              <strong>{{ number(p, "tenants") }}</strong
              ><span>入驻专业租户</span>
            </div>
            <div>
              <strong class="blue-text">{{ number(p, "projects") }}</strong
              ><span>活跃评估项目</span>
            </div>
            <div>
              <strong>{{ p.safety }}</strong
              ><span>机组安全指标受控</span>
            </div>
          </div>
          <QuotaMeter
            label="项目进度整体饱和度"
            :value="`${p.load}% 负荷`"
            :percent="p.load"
          />
        </article>
      </section>
      <section class="area-card surface">
        <div class="section-heading">
          <h2><UiIcon name="pie" :size="28" />各专业领域租户活跃度分布</h2>
          <UiBadge>5 大专业板块</UiBadge>
        </div>
        <p class="section-caption">
          对应 WANO 治理框架下 Operations、Maintenance、Radiation 等领域比重
        </p>
        <div class="area-chart">
          <ActivityChart :values="chartValues" />
          <div class="chart-legend">
            <div
              v-for="(entry, i) in [
                'OP 运行领域',
                'MM 维修工程',
                'RP 辐射与环评',
                'EN/QA 综合支撑',
              ]"
              :key="entry"
            >
              <span class="legend-dot" :class="`legend-dot--${i}`"></span
              ><span>{{ entry }}</span
              ><strong :class="{ 'blue-text': i === 2 }"
                >{{
                  isFiltered
                    ? Math.round(
                        (chartValues[i] / (selectedProjects || 1)) * 100,
                      )
                    : [38, 26, 20, 16][i]
                }}% ({{ chartValues[i] }}项)</strong
              >
            </div>
          </div>
        </div>
        <div class="isolation-note">
          <UiIcon name="shield" :size="26" /><strong
            >多租户逻辑强隔离保护：各电厂各专业租户之间严格实施数字证书双向校验与加密沙箱隔离，跨租户评审仅授权脱敏数据。</strong
          >
        </div>
      </section>
    </div>
  </div>
</template>
