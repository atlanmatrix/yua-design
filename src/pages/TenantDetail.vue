<script setup>
import { computed, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import UiButton from "../components/UiButton.vue";
import UiBadge from "../components/UiBadge.vue";
import UiIcon from "../components/UiIcon.vue";
import UiModal from "../components/UiModal.vue";
import UiInput from "../components/UiInput.vue";
import UiSelect from "../components/UiSelect.vue";
import QuotaMeter from "../components/QuotaMeter.vue";
import { state, openTenantForm, notify, areas } from "../data/tenants";
const route = useRoute(),
  router = useRouter();
const tenant = computed(
  () =>
    state.tenants.find((t) => t.id === Number(route.query.id || 1)) ||
    state.tenants[0],
);
const tab = ref(route.query.tab || "basic"),
  modal = ref(null);
const quota = reactive({
    seats: tenant.value.seats,
    storage: tenant.value.storageLimit || 5,
  }),
  project = reactive({ name: "", area: tenant.value.area });
const addedProjects = ref([]),
  projectError = ref("");
const plantName = computed(() =>
  tenant.value.plant === "FUQING" ? "福清核电厂" : "秦山核电厂",
);
const tabs = computed(() => [
  { id: "basic", label: "基本信息与电厂机组", icon: "building" },
  { id: "projects", label: "下属评估项目", count: tenant.value.projects },
  { id: "members", label: "租户成员与账号", count: tenant.value.members },
  { id: "quota", label: "资源配额与存储" },
  { id: "audit", label: "操作审计日志" },
]);
watch(tab, (value) =>
  router.replace({ query: { ...route.query, tab: value } }),
);
watch(
  () => route.query.tab,
  (v) => {
    if (v) tab.value = v;
  },
);
const title = computed(() =>
  tenant.value.id === 1 ? "福清核电一厂运行部自评估租户" : tenant.value.name,
);
const info = computed(() => [
  [
    "租户全称",
    tenant.value.id === 1 ? "福清核电有限公司第一厂运行部" : tenant.value.name,
  ],
  [
    "统一信用代码 / 组织编码",
    tenant.value.id === 1 ? "91350181751389421P" : tenant.value.code,
  ],
  [
    "租户管理员",
    `${tenant.value.admin} (${tenant.value.admin === "pg" ? "平台评估员 / 运行部" : "租户管理员"})`,
  ],
  ["联系专线 / 内部电话", "+86 (0591) 8688-2101"],
  ["租户创建时间", "2024-03-12 (运行归档)"],
  ["授权有效期至", "长期有效 (核设施全生命周期)"],
]);
const members = computed(() =>
  [
    tenant.value.admin,
    "wang.jie",
    "chen.wei",
    "zhang.min",
    "lin.feng",
    "li.hong",
  ].slice(0, Math.min(tenant.value.members, 6)),
);
function saveQuota() {
  if (Number(quota.seats) < tenant.value.members) {
    notify("席位不得少于当前成员数");
    return;
  }
  tenant.value.seats = Number(quota.seats);
  tenant.value.storageLimit = Number(quota.storage);
  notify("配额已更新");
  modal.value = null;
}
function createProject() {
  if (!project.name.trim()) {
    projectError.value = "请输入项目名称";
    return;
  }
  addedProjects.value.push({ name: project.name, area: project.area });
  tenant.value.projects++;
  modal.value = null;
  tab.value = "projects";
  project.name = "";
  notify("评估项目已创建");
}
</script>
<template>
  <div class="detail-page">
    <div class="detail-breadcrumb">
      <div class="breadcrumb">
        <UiButton
          size="small"
          variant="white"
          icon="back"
          @click="router.push({ name: 'tenants' })"
          >返回租户列表</UiButton
        ><span>/</span><span>平台管理</span><span>/</span><span>租户管理</span
        ><span>/</span><strong>{{ tenant.name }} ({{ tenant.code }})</strong>
      </div>
      <div>
        <UiBadge>核安全一级保障租户</UiBadge><span>同步周期：即时保全</span>
      </div>
    </div>
    <section class="detail-hero surface">
      <span class="tenant-emblem"><UiIcon name="building" :size="37" /></span>
      <div class="detail-identity">
        <h1>
          {{ title }}
          <small
            >({{
              tenant.plant === "FUQING"
                ? "FUQING Nuclear Plant Unit 1 OP Tenant"
                : "QINSHAN Nuclear Plant Tenant"
            }})</small
          >
        </h1>
        <div>
          <UiBadge
            >所属电厂: {{ plantName.replace("厂", "") }} ({{
              tenant.plant
            }})</UiBadge
          ><UiBadge
            >领域: {{ tenant.area }} ({{
              areas
                .find((a) => a.value === tenant.area)
                ?.label.split(" ")
                .slice(1)
                .join(" ")
            }})</UiBadge
          ><UiBadge tone="blue" dot>运行中 (Active)</UiBadge>
        </div>
        <UiBadge
          >代码:
          {{ tenant.id === 1 ? "TENANT-FQ-2026-OP01" : tenant.code }}</UiBadge
        >
      </div>
      <div class="detail-hero-actions">
        <UiButton variant="white" icon="edit" @click="openTenantForm(tenant)"
          >编辑基本信息</UiButton
        ><UiButton
          variant="white"
          icon="shield"
          @click="
            quota.seats = tenant.seats;
            quota.storage = tenant.storageLimit || 5;
            modal = 'quota';
          "
          >配额与权限分配</UiButton
        ><UiButton variant="primary" icon="plus" @click="modal = 'project'"
          >+ 发起新评估项目</UiButton
        >
      </div>
    </section>
    <nav class="detail-tabs" aria-label="租户详情" role="tablist">
      <button
        v-for="item in tabs"
        :key="item.id"
        role="tab"
        :aria-selected="tab === item.id"
        :class="{ active: tab === item.id }"
        @click="tab = item.id"
      >
        <UiIcon v-if="item.icon" :name="item.icon" :size="18" />{{ item.label
        }}<UiBadge v-if="item.count !== undefined">{{ item.count }}</UiBadge>
      </button>
    </nav>
    <div v-if="tab === 'basic'" class="detail-columns">
      <div class="detail-main-column">
        <section class="information-card surface">
          <div class="section-heading">
            <h2>
              <UiIcon name="id" :size="27" />基本信息 (Tenant Information)
            </h2>
            <span>更新于：2025-05-12 09:15</span>
          </div>
          <dl class="information-grid">
            <div v-for="([label, value], i) in info" :key="label">
              <dt>{{ label }}</dt>
              <dd>
                <span v-if="i === 2" class="initial-avatar dark">{{
                  tenant.initials
                }}</span
                ><UiIcon v-if="i === 5" name="settings" :size="20" />{{ value }}
              </dd>
            </div>
          </dl>
          <div class="responsibility">
            <span>租户职责与范围描述</span>
            <p>
              负责{{ plantName }} 1 号及 2
              号百万千瓦级压水堆机组运行领域自评估、WANO
              同业指标追踪与定期核安全审查治理工作。该组织具备核安全操作规程审核、对标数据归档及跨系统专家评审权限。
            </p>
          </div>
        </section>
        <section class="associated-card surface">
          <div class="section-heading">
            <h2>
              <UiIcon name="plant" :size="27" />所属核电厂与关联机组资产
              (Associated Nuclear Plant &amp; Units)
            </h2>
            <UiBadge>已绑定 2 个运行机组</UiBadge>
          </div>
          <div class="associated-plant">
            <span class="plant-plug"><UiIcon name="plug" :size="28" /></span>
            <div>
              <h3>
                {{ plantName }} ({{
                  tenant.plant === "FUQING" ? "Fuqing" : "Qinshan"
                }}
                Nuclear Power Plant) <UiBadge>国资核准</UiBadge>
              </h3>
              <p>
                地理位置：中国福建省福清市三山镇前薛村 · 运营管理单位：中核集团
                (CNNC)
              </p>
            </div>
            <div>
              <span>核防线安全级别</span><strong>LEVEL I (最高防御深度)</strong>
            </div>
            <UiBadge tone="plain" dot />
          </div>
          <div class="reactor-grid">
            <article v-for="n in 2" :key="n">
              <span class="reactor-number">0{{ n }}</span
              ><strong
                >{{ plantName.slice(0, 2) }} {{ n }} 号机组 (#{{
                  n
                }}
                Reactor)</strong
              ><UiBadge tone="blue" dot>商业运行 (Commercial)</UiBadge>
              <dl>
                <div>
                  <dt>堆型</dt>
                  <dd>压水堆 PWR</dd>
                </div>
                <div>
                  <dt>装机容量</dt>
                  <dd>1,089 MWe</dd>
                </div>
              </dl>
            </article>
          </div>
        </section>
      </div>
      <aside class="detail-side-column">
        <section class="health-card surface">
          <div class="section-heading">
            <h2><UiIcon name="chart" :size="26" />配额与健康度总览</h2>
            <UiBadge tone="plain" dot />
          </div>
          <QuotaMeter
            label="评估员与成员席位"
            :value="`${tenant.members} / ${tenant.seats} 席`"
            :percent="(tenant.members / tenant.seats) * 100"
            :note="`剩余 ${tenant.seats - tenant.members} 名授权席位可随时分配`"
          /><QuotaMeter
            label="合规加密文件库"
            :value="`${tenant.storage.toFixed(1)} TB / ${Number(tenant.storageLimit || 5).toFixed(1)} TB`"
            :percent="(tenant.storage / (tenant.storageLimit || 5)) * 100"
            note="物理机房已完成每周全量异地快照备份"
          />
          <div class="compliance">
            <div>
              <span>WANO 指标合规率</span>
              <p><strong>98.4%</strong> 超额达到同业安全阈值</p>
              <span>(95.0%)</span>
            </div>
            <div class="compliance-ring">98%</div>
          </div>
        </section>
        <section class="security-card surface">
          <h2><UiIcon name="shield" :size="27" />租户安全审计策略</h2>
          <div class="security-list">
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
              ><span>2025-05-10 通过</span>
            </div>
          </div>
          <footer>
            审计执行人：系统超管 (pg)<button
              class="text-button"
              @click="tab = 'audit'"
            >
              查看审计追溯
            </button>
          </footer>
        </section>
      </aside>
    </div>
    <section v-else-if="tab === 'projects'" class="tab-panel surface">
      <div class="section-heading">
        <h2>
          下属评估项目 <UiBadge>{{ tenant.projects }}</UiBadge>
        </h2>
        <UiButton variant="primary" icon="plus" @click="modal = 'project'"
          >发起新评估项目</UiButton
        >
      </div>
      <div class="project-list">
        <article
          v-for="(p, i) in [
            ...Array.from(
              { length: Math.max(0, tenant.projects - addedProjects.length) },
              (_, i) => ({
                name: [
                  `${plantName}运行领域综合自评估`,
                  'WANO 同业指标对标评估',
                  '机组安全运行绩效复查',
                ][i % 3],
                area: tenant.area,
              }),
            ),
            ...addedProjects,
          ]"
          :key="i"
        >
          <span class="project-icon"><UiIcon name="chart" /></span>
          <div>
            <h3>{{ p.name }}</h3>
            <p>{{ tenant.code }} · {{ p.area }} · 2026</p>
          </div>
          <UiBadge tone="blue" dot>进行中</UiBadge
          ><UiButton
            size="small"
            @click="notify('项目状态：自评进行中，资料归档待完成')"
            >查看项目</UiButton
          >
        </article>
        <p v-if="!tenant.projects" class="empty-state">暂无评估项目</p>
      </div>
    </section>
    <section v-else-if="tab === 'members'" class="tab-panel surface">
      <div class="section-heading">
        <h2>
          租户成员与账号 <UiBadge>{{ tenant.members }}</UiBadge>
        </h2>
        <UiBadge>{{ tenant.members }} / {{ tenant.seats }} 席</UiBadge>
      </div>
      <div class="member-list">
        <article v-for="(member, i) in members" :key="member">
          <span :class="['initial-avatar', { dark: i === 0 }]">{{
            member
              .split(".")
              .map((x) => x[0])
              .join("")
          }}</span
          ><strong>{{ member }}</strong
          ><UiBadge>{{ i === 0 ? "租户管理员" : "评估员" }}</UiBadge
          ><UiBadge dot>Active</UiBadge>
        </article>
      </div>
    </section>
    <section v-else-if="tab === 'quota'" class="tab-panel surface">
      <div class="section-heading">
        <h2>资源配额与存储</h2>
        <UiButton
          variant="primary"
          icon="settings"
          @click="
            quota.seats = tenant.seats;
            quota.storage = tenant.storageLimit || 5;
            modal = 'quota';
          "
          >分配配额</UiButton
        >
      </div>
      <div class="quota-tab-grid">
        <QuotaMeter
          label="评估员与成员席位"
          :value="`${tenant.members} / ${tenant.seats} 席`"
          :percent="(tenant.members / tenant.seats) * 100"
        /><QuotaMeter
          label="合规加密文件库"
          :value="`${tenant.storage} TB / ${tenant.storageLimit || 5} TB`"
          :percent="(tenant.storage / (tenant.storageLimit || 5)) * 100"
        />
      </div>
    </section>
    <section v-else class="tab-panel surface">
      <div class="section-heading">
        <h2>操作审计日志</h2>
        <UiBadge>安全留痕</UiBadge>
      </div>
      <div class="audit-list">
        <article
          v-for="(item, i) in [
            '基本信息更新',
            '基线安全校验通过',
            '成员配额分配完成',
            '租户创建并归档',
          ]"
          :key="item"
        >
          <UiIcon name="history" />
          <div>
            <strong>{{ item }}</strong>
            <p>{{ tenant.code }} · pg</p>
          </div>
          <time>{{
            [
              "2025-05-12 09:15",
              "2025-05-10 14:30",
              "2025-04-18 10:20",
              "2024-03-12 09:00",
            ][i]
          }}</time
          ><UiBadge>成功</UiBadge>
        </article>
      </div>
    </section>
  </div>
  <UiModal v-if="modal === 'quota'" title="配额与权限分配" @close="modal = null"
    ><form class="modal-form" @submit.prevent="saveQuota">
      <UiInput
        v-model="quota.seats"
        type="number"
        label="成员席位"
        :min="tenant.members"
        max="10000"
        required
      /><UiInput
        v-model="quota.storage"
        type="number"
        label="文件存储配额 (TB)"
        :min="Math.ceil(tenant.storage)"
        max="1000"
        required
      />
      <div class="security-list">
        <div>
          <UiIcon name="lock" /><strong>双因子认证</strong
          ><UiBadge>强制开启</UiBadge>
        </div>
      </div>
      <div class="modal-actions">
        <UiButton @click="modal = null">取消</UiButton
        ><UiButton variant="primary" type="submit">保存分配</UiButton>
      </div>
    </form></UiModal
  >
  <UiModal
    v-if="modal === 'project'"
    title="发起新评估项目"
    @close="modal = null"
    ><form class="modal-form" @submit.prevent="createProject">
      <UiInput v-model="project.name" label="项目名称" required /><UiSelect
        v-model="project.area"
        label="评估领域"
        :options="areas.slice(1)"
      />
      <p v-if="projectError" class="form-error">{{ projectError }}</p>
      <div class="modal-actions">
        <UiButton @click="modal = null">取消</UiButton
        ><UiButton variant="primary" type="submit">创建项目</UiButton>
      </div>
    </form></UiModal
  >
</template>
