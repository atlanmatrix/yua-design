import { expect, test } from "@playwright/test";

test("从设计列表选择版本进入演示，支持刷新和逐级返回", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto("/");
  await expect(page.getByRole("heading", { name: "设计列表" })).toBeVisible();
  await page.getByRole("link", { name: "WANO 核电评估平台" }).click();
  await expect(page).toHaveURL(/\/wano\/$/);
  await page.reload();
  await expect(page.getByRole("heading", { name: "版本列表" })).toBeVisible();
  await page.getByRole("link", { name: "v1", exact: true }).click();
  await expect(page).toHaveURL(/\/wano\/v1\/$/);
  await page.reload();
  await expect(page.locator('nav [data-nav="leadership"]')).toHaveClass(/active/);
  await page.getByRole("button", { name: "租户管理", exact: true }).click();
  await expect(page.locator('nav [data-nav="tenants"]')).toHaveClass(/active/);
  await expect(page.locator("main table").first()).toBeVisible();
  await page.goBack();
  await expect(page.getByRole("heading", { name: "版本列表" })).toBeVisible();
  await page.goBack();
  await expect(page.getByRole("heading", { name: "设计列表" })).toBeVisible();
  expect(errors).toEqual([]);
});

test("新版目录支持直接访问，旧版入口已移除", async ({ page, request }) => {
  await page.goto("/wano/v1");
  await expect(page).toHaveURL(/\/wano\/v1\/$/);
  await expect(page.getByRole("navigation")).toBeVisible();
  for (const suffix of ["", "/overview", "/detail?id=1"]) {
    const response = await request.get("/wano/tenant/v1" + suffix);
    expect(response.status()).toBe(404);
  }
});
