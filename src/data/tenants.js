import { reactive } from "vue";

const seeds = [
  {
    name: "2026 福清核电一厂运行部",
    description: "常规岛与核岛综合主控组",
    code: "FUQING-OP-01",
    plant: "FUQING",
    area: "OP",
    units: "1# 2# 机组",
    admin: "pg",
    initials: "pg",
    projects: 6,
    status: "progress",
  },
  {
    name: "秦山第二核电运维与技术支持中心",
    description: "全厂机电定期预防性维保",
    code: "QINSHAN-TECH-02",
    plant: "QINSHAN",
    area: "MM",
    units: "1# 2# 3# 4# 机组",
    admin: "wang.jie",
    initials: "wj",
    projects: 12,
    status: "active",
  },
  {
    name: "福清核电5/6号华龙一号综合自评估组",
    description: "三代核电先进安全设计验证",
    code: "FUQING-HL-05",
    plant: "FUQING",
    area: "EN",
    units: "5# 6# 华龙机组",
    admin: "chen.wei",
    initials: "cw",
    projects: 4,
    status: "progress",
  },
  {
    name: "秦山核电基地辐射防护与应急安全中心",
    description: "三厂区辐射剂量联防联控平台",
    code: "QINSHAN-RP-BASE",
    plant: "QINSHAN",
    area: "RP",
    units: "全基地机组",
    admin: "zhang.min",
    initials: "zm",
    projects: 9,
    status: "active",
  },
  {
    name: "福清核电运行二处 (FUQING Unit 3/4)",
    description: "二期工程机组值际绩效对标",
    code: "FUQING-OP-02",
    plant: "FUQING",
    area: "OP",
    units: "3# 4# 机组",
    admin: "lin.feng",
    initials: "lf",
    projects: 5,
    status: "active",
  },
  {
    name: "秦山核电重水堆联合质保监察部",
    description: "CANDU-6 特殊构件寿命周期质保",
    code: "QINSHAN-QA-CANDU",
    plant: "QINSHAN",
    area: "QA",
    units: "重水堆机组",
    admin: "li.hong",
    initials: "lh",
    projects: 2,
    status: "progress",
  },
];
const more = [
  [
    "福清核电设备可靠性管理组",
    "FUQING-MM-03",
    "FUQING",
    "MM",
    "3# 4# 机组",
    "liu.yang",
    4,
  ],
  [
    "秦山核电运行一处",
    "QINSHAN-OP-01",
    "QINSHAN",
    "OP",
    "1# 2# 机组",
    "xu.ming",
    5,
  ],
  [
    "福清核电辐射防护中心",
    "FUQING-RP-01",
    "FUQING",
    "RP",
    "全基地机组",
    "huang.yu",
    3,
  ],
  [
    "秦山核电工程技术中心",
    "QINSHAN-EN-01",
    "QINSHAN",
    "EN",
    "全基地机组",
    "zhou.lin",
    4,
  ],
  [
    "福清核电质量保证部",
    "FUQING-QA-01",
    "FUQING",
    "QA",
    "1# 2# 机组",
    "wu.ning",
    3,
  ],
  [
    "秦山核电维修工程部",
    "QINSHAN-MM-03",
    "QINSHAN",
    "MM",
    "3# 4# 机组",
    "sun.wei",
    4,
  ],
  [
    "福清核电华龙运行中心",
    "FUQING-OP-06",
    "FUQING",
    "OP",
    "5# 6# 机组",
    "chen.lin",
    5,
  ],
  [
    "秦山核电设备管理组",
    "QINSHAN-MM-04",
    "QINSHAN",
    "MM",
    "全基地机组",
    "zhao.jun",
    4,
  ],
  [
    "福清核电安全评估中心",
    "FUQING-EN-02",
    "FUQING",
    "EN",
    "全基地机组",
    "li.wei",
    5,
  ],
  [
    "秦山核电环境监测站",
    "QINSHAN-RP-02",
    "QINSHAN",
    "RP",
    "全基地机组",
    "he.ping",
    4,
  ],
  [
    "福清核电运行培训中心",
    "FUQING-OP-07",
    "FUQING",
    "OP",
    "全基地机组",
    "lin.yu",
    5,
  ],
  [
    "秦山核电综合质保组",
    "QINSHAN-QA-02",
    "QINSHAN",
    "QA",
    "全基地机组",
    "wang.lin",
    2,
  ],
].map(([name, code, plant, area, units, admin, projects], i) => ({
  name,
  description: "",
  code,
  plant,
  area,
  units,
  admin,
  projects,
  initials: admin
    .split(".")
    .map((x) => x[0])
    .join(""),
  status: i % 3 === 0 ? "progress" : "active",
}));

export const state = reactive({
  tenants: [...seeds, ...more].map((t, i) => ({
    ...t,
    id: i + 1,
    members: i === 0 ? 42 : 12 + i,
    seats: 100,
    storage: 1.4,
    storageLimit: 5,
  })),
  modal: null,
  toast: "",
  language: "中",
});
export const plants = [
  { value: "", label: "全部电厂 (All plants)" },
  { value: "FUQING", label: "福清核电 (FUQING)" },
  { value: "QINSHAN", label: "秦山核电 (QINSHAN)" },
];
export const areas = [
  { value: "", label: "全部领域 (All areas)" },
  ...["OP", "MM", "RP", "EN", "QA"].map((value) => ({
    value,
    label: {
      OP: "OP 运行",
      MM: "MM 维修工程",
      RP: "RP 辐射防护",
      EN: "EN 工程技术",
      QA: "QA 质量保证",
    }[value],
  })),
];
export const statuses = [
  { value: "", label: "全部状态 (All status)" },
  { value: "active", label: "Active" },
  { value: "progress", label: "In progress" },
  { value: "disabled", label: "Disabled" },
];
let toastTimer;
export function notify(message) {
  state.toast = message;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (state.toast = ""), 3200);
}
export function openTenantForm(tenant = null) {
  state.modal = { type: "tenant", tenant };
}
export function exportCsv(rows, filename = "租户列表") {
  const escape = (value) =>
    `"${String(value ?? "")
      .replace(/^[=+@\-]/, "'")
      .replaceAll('"', '""')}"`;
  const csv =
    "\uFEFF" +
    [
      [
        "租户名称",
        "租户标识",
        "所属电厂",
        "业务领域",
        "关联机组",
        "租户管理员",
        "评估项目数",
        "状态",
      ],
      ...rows.map((t) => [
        t.name,
        t.code,
        t.plant,
        t.area,
        t.units,
        t.admin,
        t.projects,
        t.status,
      ]),
    ]
      .map((row) => row.map(escape).join(","))
      .join("\r\n");
  const url = URL.createObjectURL(
    new Blob([csv], { type: "text/csv;charset=utf-8;" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 500);
  notify("导出成功");
}
