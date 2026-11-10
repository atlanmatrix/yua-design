import { test, expect } from "@playwright/test";
const root = "/wano/tenant/v1";

test("filters, multi-select, empty state, reset and pagination", async ({
  page,
}) => {
  await page.goto(root);
  await expect(page.getByText("18 results", { exact: true })).toBeVisible();
  await page.getByRole("combobox", { name: "所属电厂 (Plant)" }).click();
  await page
    .getByRole("option", { name: "福清核电 (FUQING)", exact: true })
    .click();
  await page
    .getByRole("combobox", { name: "专业领域 (Areas - multiple)" })
    .click();
  await page.getByRole("option", { name: "OP 运行", exact: true }).click();
  await page.getByRole("option", { name: "MM 维修工程", exact: true }).click();
  await page
    .getByRole("combobox", { name: "专业领域 (Areas - multiple)" })
    .press("Escape");
  await page
    .getByRole("button", { name: "查询 (Search)", exact: true })
    .click();
  await expect(page.getByText("5 results", { exact: true })).toBeVisible();
  await expect(page.locator("tbody")).not.toContainText("秦山");
  await page
    .getByPlaceholder("搜索租户名称、租户标识 ID 或负责人...")
    .fill("不存在的租户");
  await page
    .getByRole("button", { name: "查询 (Search)", exact: true })
    .click();
  await expect(page.getByText("暂无匹配租户")).toBeVisible();
  await page.getByRole("button", { name: "重置 (Reset)", exact: true }).click();
  await expect(page.getByText("18 results", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "下一页", exact: true }).click();
  await expect(page.getByRole("button", { name: "第 2 页" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await expect(
    page.getByText("福清核电质量保证部", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "上一页", exact: true }).click();
  await expect(
    page.getByText("2026 福清核电一厂运行部", { exact: true }),
  ).toBeVisible();
});

test("create and edit a tenant with validation and CSV export", async ({
  page,
}) => {
  await page.goto(root);
  await page
    .getByRole("button", { name: "新建租户 (+ New tenant)", exact: true })
    .click();
  const dialog = page.getByRole("dialog");
  await dialog
    .getByRole("textbox", { name: "租户名称", exact: true })
    .fill("测试核安全评估租户");
  await dialog
    .getByRole("textbox", { name: "租户标识", exact: true })
    .fill("FUQING-OP-01");
  await dialog
    .getByRole("textbox", { name: "租户管理员", exact: true })
    .fill("test.admin");
  await dialog.getByRole("button", { name: "创建租户", exact: true }).click();
  await expect(dialog.getByRole("alert")).toHaveText("租户标识已存在");
  await dialog
    .getByRole("textbox", { name: "租户标识", exact: true })
    .fill("FUQING-TEST-01");
  await dialog.getByRole("button", { name: "创建租户", exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await expect(page.getByText("19 results", { exact: true })).toBeVisible();
  await page
    .getByRole("button", { name: "测试核安全评估租户", exact: true })
    .click();
  await page.getByRole("button", { name: "编辑基本信息", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("textbox", { name: "租户名称", exact: true })
    .fill("测试核安全评估租户（更新）");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "保存修改", exact: true })
    .click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "测试核安全评估租户（更新）",
  );
  await page.getByRole("button", { name: "返回租户列表", exact: true }).click();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "导出租户列表", exact: true }).click();
  expect((await download).suggestedFilename()).toBe("租户列表.csv");
});

test("detail tabs, quota allocation, project creation, and direct-route refresh", async ({
  page,
}) => {
  await page.goto(`${root}/detail?id=1`);
  await expect(
    page.getByRole("heading", { name: /福清核电一厂运行部自评估租户/ }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "配额与权限分配", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("spinbutton", { name: "文件存储配额 (TB)", exact: true })
    .fill("9");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "取消", exact: true })
    .click();
  await expect(
    page.getByText("1.4 TB / 5.0 TB", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "配额与权限分配", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("spinbutton", { name: "成员席位", exact: true })
    .fill("150");
  await page.getByRole("button", { name: "保存分配", exact: true }).click();
  await expect(page.getByText("42 / 150 席", { exact: true })).toBeVisible();
  await page
    .getByRole("button", { name: "+ 发起新评估项目", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("textbox", { name: "项目名称", exact: true })
    .fill("2026 运行领域复查");
  await page.getByRole("button", { name: "创建项目", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "2026 运行领域复查", exact: true }),
  ).toBeVisible();
  await page.getByRole("tab", { name: /租户成员与账号/ }).click();
  await expect(page.locator(".member-list")).toContainText("wang.jie");
  await page.getByRole("tab", { name: "操作审计日志", exact: true }).click();
  await expect(
    page.getByText("基线安全校验通过", { exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("tab", { name: "操作审计日志", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await page.getByRole("button", { name: "返回租户列表", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "租户管理 (Tenants)", exact: true }),
  ).toBeVisible();
});

test("overview, navigation, custom menus and responsive layout without browser errors", async ({
  page,
}, testInfo) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(`${root}/overview`);
  await expect(
    page.getByRole("heading", { name: "租户与电厂运营统计", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("img", { name: /专业领域评估实例分布/ }),
  ).toBeVisible();
  await page
    .getByPlaceholder("输入租户名称、机构代码或电厂机组 ID...")
    .fill("FUQING-OP-01");
  await page.getByRole("button", { name: "筛选查询", exact: true }).click();
  await expect(
    page.locator(".metric-card").first().locator("p strong"),
  ).toHaveText("1");
  await page.getByRole("button", { name: "重置条件", exact: true }).click();
  await expect(
    page.locator(".metric-card").first().locator("p strong"),
  ).toHaveText("28");
  await page.getByRole("link", { name: "租户管理 列表" }).click();
  await expect(
    page.getByRole("heading", { name: "租户管理 (Tenants)", exact: true }),
  ).toBeVisible();
  for (const path of ["", "/overview", "/detail?id=1"]) {
    if (testInfo.project.name === "desktop")
      await page.setViewportSize({
        width: path ? 1750 : 1760,
        height: path ? 1408 : 1425,
      });
    await page.goto(root + path);
    await page.waitForLoadState("networkidle");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: `artifacts/${testInfo.project.name}-${path.includes("overview") ? "overview" : path.includes("detail") ? "detail" : "tenants"}.png`,
      fullPage: false,
      scale: "css",
    });
  }
  expect(errors).toEqual([]);
});
