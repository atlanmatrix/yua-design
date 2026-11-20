import { expect, test } from "@playwright/test";

test("首页进入新版演示，刷新后仍可切换页面", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto("/");
  await expect(page).toHaveURL(/\/wano\/v1\/$/);
  await page.reload();
  await expect(page.locator('nav [data-nav="leadership"]')).toHaveClass(/active/);
  await page.getByRole("button", { name: "租户管理", exact: true }).click();
  await expect(page.locator('nav [data-nav="tenants"]')).toHaveClass(/active/);
  await expect(page.locator("main table").first()).toBeVisible();
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
