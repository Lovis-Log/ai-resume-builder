import { expect, test } from "@playwright/test";

test("landing page explains the product and the free score", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      name: /Built to be read/i,
    }),
  ).toBeVisible();

  await expect(
    page.getByRole("link", { name: /Build my resume/i }).first(),
  ).toBeVisible();

  await expect(page.getByText("Ten checks. One honest score.")).toBeVisible();
  await expect(
    page.getByText("Start free. Upgrade when it pays off."),
  ).toBeVisible();
  await expect(page.getByText("Questions worth asking.")).toBeVisible();
});
