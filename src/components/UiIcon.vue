<script setup>
import {
  IconSearch,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconBell,
  IconPlus,
  IconDownload,
  IconSettings,
  IconDotsVertical,
  IconArrowLeft,
  IconBuildingFactory2,
  IconChartPie2,
  IconShieldCheck,
  IconBuilding,
  IconIdBadge2,
  IconEdit,
  IconLock,
  IconSitemap,
  IconArrowUp,
  IconCircleCheck,
  IconX,
  IconCheck,
  IconLogout,
  IconLoader3,
  IconPlug,
  IconChartBar,
  IconHistory,
  IconUsers,
  IconDatabase,
  IconMenu2,
} from "@tabler/icons-vue";
defineProps({ name: String, size: { type: [Number, String], default: 20 } });
const icons = {
  search: IconSearch,
  down: IconChevronDown,
  left: IconChevronLeft,
  right: IconChevronRight,
  bell: IconBell,
  plus: IconPlus,
  download: IconDownload,
  settings: IconSettings,
  more: IconDotsVertical,
  back: IconArrowLeft,
  plant: IconBuildingFactory2,
  pie: IconChartPie2,
  shield: IconShieldCheck,
  building: IconBuilding,
  id: IconIdBadge2,
  edit: IconEdit,
  lock: IconLock,
  sitemap: IconSitemap,
  up: IconArrowUp,
  checkCircle: IconCircleCheck,
  close: IconX,
  check: IconCheck,
  logout: IconLogout,
  logo: IconLoader3,
  plug: IconPlug,
  chart: IconChartBar,
  history: IconHistory,
  users: IconUsers,
  database: IconDatabase,
  menu: IconMenu2,
};
</script>
<template>
  <component
    :is="icons[name] || icons.building"
    :size="size"
    :stroke-width="1.9"
    aria-hidden="true"
  />
</template>
