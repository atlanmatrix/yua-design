<script setup>
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import UiIcon from "./components/UiIcon.vue";
import UiButton from "./components/UiButton.vue";
import UiBadge from "./components/UiBadge.vue";
import UiModal from "./components/UiModal.vue";
import TenantForm from "./components/TenantForm.vue";
import { state, notify } from "./data/tenants";
const route = useRoute(),
  router = useRouter(),
  profile = ref(false);
const avatar = `${import.meta.env.BASE_URL}images/admin-avatar.png`;
const isOverview = computed(() => route.name === "overview");
const projects = computed(() =>
  state.tenants.flatMap((t) =>
    Array.from({ length: Math.min(t.projects, 2) }, (_, i) => ({
      name: `${t.plant} ${t.area} ${i === 0 ? "核安全综合自评估" : "运行绩效评估"}`,
      tenant: t.name,
    })),
  ),
);
watch(
  () => route.name,
  (name) => {
    document.title = `WANO · ${{ tenants: "租户管理", overview: "运营统计", detail: "租户详情" }[name] || "租户管理"}`;
    profile.value = false;
  },
);
</script>
<template>
  <div class="app-frame">
    <header class="app-header">
      <RouterLink
        class="brand"
        :to="{ name: 'overview' }"
        aria-label="WANO 运营统计"
        ><span class="brand-mark"><UiIcon name="logo" :size="31" /></span
        ><strong>{{
          route.name !== "tenants"
            ? "WANO Nuclear Assessment Platform"
            : "WANO 电厂评估评测管理后台"
        }}</strong
        ><UiBadge>平台管理控制台</UiBadge></RouterLink
      >
      <nav class="main-nav" aria-label="主导航">
        <RouterLink :to="{ name: 'overview' }" :class="{ active: isOverview }"
          >租户总览<br />统计</RouterLink
        ><RouterLink :to="{ name: 'tenants' }" :class="{ active: !isOverview }"
          >租户管理<br />列表</RouterLink
        ><button @click="state.modal = { type: 'projects' }">
          评估项目<br />治理</button
        ><button @click="state.modal = { type: 'security' }">
          权限与安全<br />审计
        </button>
      </nav>
      <div class="header-tools">
        <button
          class="icon-button header-search"
          aria-label="搜索租户"
          @click="router.push({ name: 'tenants', query: { search: '1' } })"
        >
          <UiIcon name="search" :size="24" />
        </button>
        <div class="language-switch" aria-label="语言">
          <button
            :class="{ selected: state.language === '中' }"
            @click="state.language = '中'"
          >
            中</button
          ><button
            :class="{ selected: state.language === 'EN' }"
            @click="
              state.language = 'EN';
              notify('English / 中文 双语视图');
            "
          >
            EN
          </button>
        </div>
        <button
          class="icon-button notification-button"
          aria-label="通知"
          @click="state.modal = { type: 'notifications' }"
        >
          <UiIcon name="bell" :size="24" /><span></span>
        </button>
        <div class="profile-wrap">
          <button
            class="profile-button"
            :aria-expanded="profile"
            @click="profile = !profile"
          >
            <img :src="avatar" alt="pg" /><strong>pg</strong
            ><UiBadge>平台超管</UiBadge><UiIcon name="down" :size="18" />
          </button>
          <div v-if="profile" class="profile-menu">
            <strong>pg · 平台超级管理员</strong
            ><button
              @click="
                profile = false;
                state.modal = { type: 'security' };
              "
            >
              <UiIcon name="shield" />安全与权限
            </button>
          </div>
        </div>
      </div>
    </header>
    <main class="app-main"><RouterView /></main>
  </div>
  <TenantForm
    v-if="state.modal?.type === 'tenant'"
    :tenant="state.modal.tenant"
    @close="state.modal = null"
  />
  <UiModal
    v-else-if="state.modal?.type === 'notifications'"
    title="通知"
    @close="state.modal = null"
    ><div class="notification-item">
      <UiIcon name="checkCircle" />
      <div>
        <strong>核安全数据同步完成</strong>
        <p>福清、秦山租户数据已同步</p>
      </div>
    </div>
    <div class="notification-item">
      <UiIcon name="shield" />
      <div>
        <strong>安全基线检查通过</strong>
        <p>双因子认证与租户隔离策略已启用</p>
      </div>
    </div>
    <UiButton
      class="full-width"
      @click="
        notify('全部通知已读');
        state.modal = null;
      "
      >全部标为已读</UiButton
    ></UiModal
  >
  <UiModal
    v-else-if="state.modal?.type === 'projects'"
    title="评估项目治理"
    @close="state.modal = null"
    ><div class="dialog-list">
      <div v-for="(p, i) in projects" :key="i">
        <div>
          <strong>{{ p.name }}</strong>
          <p>{{ p.tenant }}</p>
        </div>
        <UiBadge tone="blue" dot>进行中</UiBadge>
      </div>
    </div></UiModal
  >
  <UiModal
    v-else-if="state.modal?.type === 'security'"
    title="权限与安全审计"
    @close="state.modal = null"
    ><div class="security-list">
      <div>
        <UiIcon name="lock" /><strong>双因子认证 (2FA)</strong
        ><UiBadge>强制开启</UiBadge>
      </div>
      <div>
        <UiIcon name="sitemap" /><strong>数据隔离级别</strong
        ><UiBadge>独立逻辑物理库</UiBadge>
      </div>
      <div>
        <UiIcon name="shield" /><strong>基线安全校验</strong
        ><UiBadge>通过</UiBadge>
      </div>
    </div>
    <p class="audit-note">审计执行人：系统超管 (pg)</p></UiModal
  >
  <Transition name="toast"
    ><div v-if="state.toast" class="toast" role="status">
      <UiIcon name="checkCircle" />{{ state.toast }}
    </div></Transition
  >
</template>
