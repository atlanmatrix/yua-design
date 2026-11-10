import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import App from "./App.vue";
import TenantList from "./pages/TenantList.vue";
import Overview from "./pages/Overview.vue";
import TenantDetail from "./pages/TenantDetail.vue";
import "./style.css";

const root = "/wano/tenant/v1";
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: "/", redirect: root },
    { path: root, component: TenantList, name: "tenants" },
    { path: `${root}/overview`, component: Overview, name: "overview" },
    { path: `${root}/detail`, component: TenantDetail, name: "detail" },
    { path: "/:pathMatch(.*)*", redirect: root },
  ],
  scrollBehavior: () => ({ top: 0 }),
});
createApp(App).use(router).mount("#app");
