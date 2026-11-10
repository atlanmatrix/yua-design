<script setup>
import { computed, ref, onMounted, nextTick, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import UiButton from "../components/UiButton.vue";
import UiSelect from "../components/UiSelect.vue";
import UiInput from "../components/UiInput.vue";
import UiBadge from "../components/UiBadge.vue";
import UiIcon from "../components/UiIcon.vue";
import {
  state,
  plants,
  areas,
  statuses,
  openTenantForm,
  exportCsv,
  notify,
} from "../data/tenants";
const route = useRoute(),
  router = useRouter();
const plant = ref(""),
  area = ref([]),
  status = ref(""),
  query = ref(""),
  page = ref(1),
  pageSize = 10;
const applied = ref({ plant: "", area: [], status: "", query: "" }),
  menu = ref(null);
const filtered = computed(() =>
  state.tenants.filter(
    (t) =>
      (!applied.value.plant || t.plant === applied.value.plant) &&
      (!applied.value.area.length || applied.value.area.includes(t.area)) &&
      (!applied.value.status || t.status === applied.value.status) &&
      [t.name, t.code, t.admin].some((v) =>
        v.toLowerCase().includes(applied.value.query.toLowerCase()),
      ),
  ),
);
const pages = computed(() =>
  Math.max(1, Math.ceil(filtered.value.length / pageSize)),
);
const visible = computed(() =>
  filtered.value.slice((page.value - 1) * pageSize, page.value * pageSize),
);
function search() {
  applied.value = {
    plant: plant.value,
    area: area.value,
    status: status.value,
    query: query.value.trim(),
  };
  page.value = 1;
  menu.value = null;
}
function reset() {
  plant.value = "";
  area.value = [];
  status.value = "";
  query.value = "";
  search();
}
function changePage(n) {
  page.value = n;
  document.querySelector(".table-scroll")?.scrollTo({ top: 0 });
}
function details(t, tab) {
  menu.value = null;
  router.push({ name: "detail", query: { id: t.id, ...(tab ? { tab } : {}) } });
}
function enable() {
  const targets = filtered.value.filter((t) => t.status !== "active");
  targets.forEach((t) => (t.status = "active"));
  notify(
    targets.length ? `已启用 ${targets.length} 个租户` : "当前租户均已启用",
  );
}
watch(
  () => route.query.search,
  async (v) => {
    if (v) {
      await nextTick();
      document.querySelector(".tenant-search input")?.focus();
    }
  },
);
onMounted(() => {
  if (route.query.search)
    document.querySelector(".tenant-search input")?.focus();
});
</script>
<template>
  <section class="tenant-panel surface">
    <div class="page-heading">
      <div>
        <h1>租户管理 (Tenants)</h1>
        <p>管理多电厂多域核能评估租户、成员配额与权限范围</p>
      </div>
      <UiButton variant="primary" icon="plus" @click="openTenantForm()"
        >新建租户 (+ New tenant)</UiButton
      >
    </div>
    <form class="tenant-filters" @submit.prevent="search">
      <div class="filter-grid">
        <UiSelect
          v-model="plant"
          label="所属电厂 (Plant)"
          :options="plants"
        /><UiSelect
          v-model="area"
          multiple
          label="专业领域 (Areas - multiple)"
          :options="areas"
        /><UiSelect
          v-model="status"
          label="租户状态 (Status)"
          :options="statuses"
        />
      </div>
      <div class="search-row">
        <UiInput
          v-model="query"
          class="tenant-search"
          icon="search"
          placeholder="搜索租户名称、租户标识 ID 或负责人..."
        /><UiButton variant="primary" type="submit" icon="search"
          >查询 (Search)</UiButton
        ><UiButton variant="outline" @click="reset">重置 (Reset)</UiButton>
      </div>
    </form>
    <div class="list-heading">
      <div>
        <h2>租户列表 (Tenant list)</h2>
        <UiBadge>{{ filtered.length }} tenants</UiBadge>
      </div>
      <div>
        <UiButton size="small" variant="blue" icon="settings" @click="enable"
          >批量启用</UiButton
        ><UiButton
          size="small"
          variant="blue"
          icon="download"
          @click="exportCsv(filtered)"
          >导出租户列表</UiButton
        >
      </div>
    </div>
    <div class="table-scroll">
      <table class="tenant-table">
        <colgroup>
          <col class="col-name" />
          <col class="col-code" />
          <col class="col-plant" />
          <col class="col-area" />
          <col class="col-units" />
          <col class="col-admin" />
          <col class="col-projects" />
          <col class="col-status" />
          <col class="col-actions" />
        </colgroup>
        <thead>
          <tr>
            <th>租户名称</th>
            <th>租户标识</th>
            <th>所属电厂</th>
            <th>业务领域</th>
            <th>关联机组</th>
            <th>租户管理员</th>
            <th>评估项目数</th>
            <th>状态</th>
            <th class="action-heading">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="tenant in visible" :key="tenant.id">
            <td>
              <button class="tenant-name" @click="details(tenant)">
                {{ tenant.name }}
              </button>
              <p v-if="tenant.description" class="tenant-description">
                {{ tenant.description }}
              </p>
            </td>
            <td class="tenant-code">{{ tenant.code }}</td>
            <td>
              <UiBadge>{{ tenant.plant }}</UiBadge>
            </td>
            <td>
              <UiBadge tone="area">{{ tenant.area }}</UiBadge>
            </td>
            <td>{{ tenant.units }}</td>
            <td>
              <span class="admin-cell"
                ><span
                  :class="['initial-avatar', { dark: tenant.admin === 'pg' }]"
                  >{{ tenant.initials }}</span
                >{{ tenant.admin
                }}{{ tenant.admin === "pg" ? " (超管)" : "" }}</span
              >
            </td>
            <td>
              <button class="text-button" @click="details(tenant, 'projects')">
                {{ tenant.projects }} 项
              </button>
            </td>
            <td>
              <UiBadge
                :tone="
                  tenant.status === 'progress'
                    ? 'blue'
                    : tenant.status === 'disabled'
                      ? 'muted'
                      : 'soft'
                "
                dot
                ><span class="status-label">{{
                  tenant.status === "progress"
                    ? "In progress"
                    : tenant.status === "disabled"
                      ? "Disabled"
                      : "Active"
                }}</span></UiBadge
              >
            </td>
            <td>
              <div class="row-actions">
                <button @click="details(tenant)">查看详情</button><span></span
                ><button @click="details(tenant, 'quota')">配置</button>
                <div class="row-more">
                  <button
                    class="icon-button"
                    :aria-label="`${tenant.name} 更多操作`"
                    :aria-expanded="menu === tenant.id"
                    @click="menu = menu === tenant.id ? null : tenant.id"
                  >
                    <UiIcon name="more" :size="18" />
                  </button>
                  <div v-if="menu === tenant.id" class="row-menu">
                    <button
                      @click="
                        openTenantForm(tenant);
                        menu = null;
                      "
                    >
                      编辑租户</button
                    ><button
                      @click="
                        tenant.status =
                          tenant.status === 'disabled' ? 'active' : 'disabled';
                        menu = null;
                        notify('租户状态已更新');
                      "
                    >
                      {{
                        tenant.status === "disabled" ? "启用租户" : "停用租户"
                      }}
                    </button>
                  </div>
                </div>
              </div>
            </td>
          </tr>
          <tr v-if="!visible.length">
            <td colspan="9" class="empty-state">
              暂无匹配租户<UiButton size="small" @click="reset"
                >重置筛选</UiButton
              >
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <footer class="pagination">
      <span>{{ filtered.length }} results</span>
      <div>
        <span>{{ pageSize }} / page</span
        ><button
          class="page-button"
          aria-label="上一页"
          :disabled="page <= 1"
          @click="changePage(page - 1)"
        >
          <UiIcon name="left" /></button
        ><button
          v-for="n in pages"
          :key="n"
          class="page-button"
          :class="{ current: page === n }"
          :aria-label="`第 ${n} 页`"
          :aria-current="page === n ? 'page' : undefined"
          @click="changePage(n)"
        >
          {{ n }}</button
        ><button
          class="page-button"
          aria-label="下一页"
          :disabled="page >= pages"
          @click="changePage(page + 1)"
        >
          <UiIcon name="right" />
        </button>
      </div>
    </footer>
  </section>
</template>
