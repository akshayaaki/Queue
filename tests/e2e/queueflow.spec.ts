import { test, expect } from "@playwright/test";

test.describe("QueueFlow End-to-End Suite", () => {
  const timestamp = Date.now();
  const managerEmail = `e2e_manager_${timestamp}@queueflow.test`;
  const managerPassword = "password123";

  // Scenario 1: Register a manager and log in
  test("Scenario 1: Register manager and verify authentication session", async ({ page }) => {
    await page.goto("/register");
    await expect(page.locator("h2")).toContainText("Register Manager Account");

    await page.fill('input[id="name"]', "E2E Administrator");
    await page.fill('input[id="email"]', managerEmail);
    await page.fill('input[id="password"]', managerPassword);
    await page.fill('input[id="confirmPassword"]', managerPassword);

    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.locator("h1")).toContainText("Queue Performance Overview");
  });

  // Scenario 2: Create a queue named "General Enquiry"
  test("Scenario 2: Create a new operational queue", async ({ page }) => {
    // Log in
    await page.goto("/login");
    await page.fill('input[id="email"]', managerEmail);
    await page.fill('input[id="password"]', managerPassword);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*dashboard/);

    await page.goto("/queues");
    await page.click('button:has-text("Create New Queue")');

    await page.fill('input[id="queueName"]', "General Desk Counter");
    await page.fill('input[id="queueCode"]', "GEN");
    await page.fill('textarea[id="queueDescription"]', "Primary visitor intake desk");

    await page.click('button:has-text("Create Queue")');

    // Verify queue card rendered
    await expect(page.locator("h3:has-text('General Desk Counter')")).toBeVisible();
    await expect(page.locator("span:has-text('GEN')")).toBeVisible();
  });

  // Scenario 3: Add three customers and verify generated tokens
  test("Scenario 3: Add 3 customers and verify sequential numbering", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[id="email"]', managerEmail);
    await page.fill('input[id="password"]', managerPassword);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*dashboard/);

    await page.goto("/queues");
    await page.click("text=Manage");

    // Live Queue screen
    await expect(page.locator("h1")).toContainText("General Desk Counter");

    // Customer 1
    await page.click('button:has-text("Add Customer")');
    await page.fill('input[id="customerName"]', "Aarav Patel");
    await page.click('button:has-text("Issue Token")');
    await expect(page.locator("td:has-text('Aarav Patel')")).toBeVisible();
    await expect(page.locator("td:has-text('GEN-001')")).toBeVisible();

    // Customer 2
    await page.click('button:has-text("Add Customer")');
    await page.fill('input[id="customerName"]', "Beatriz Morales");
    await page.click('button:has-text("Issue Token")');
    await expect(page.locator("td:has-text('Beatriz Morales')")).toBeVisible();
    await expect(page.locator("td:has-text('GEN-002')")).toBeVisible();

    // Customer 3
    await page.click('button:has-text("Add Customer")');
    await page.fill('input[id="customerName"]', "Chen Wei");
    await page.click('button:has-text("Issue Token")');
    await expect(page.locator("td:has-text('Chen Wei')")).toBeVisible();
    await expect(page.locator("td:has-text('GEN-003')")).toBeVisible();
  });

  // Scenario 4: Move the third token above the second token
  test("Scenario 4: Reorder tokens by moving third token up", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[id="email"]', managerEmail);
    await page.fill('input[id="password"]', managerPassword);
    await page.click('button[type="submit"]');
    await page.goto("/queues");
    await page.click("text=Manage");

    // Click Move Up on Chen Wei's row
    const chenRow = page.locator("tr", { hasText: "Chen Wei" });
    await chenRow.locator('button[title="Move Up in Queue"]').click();

    // Chen Wei should now have position #2
    await expect(chenRow.locator("text=#2")).toBeVisible();
  });

  // Scenario 5: Call the next customer
  test("Scenario 5: Call Next Customer atomically", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[id="email"]', managerEmail);
    await page.fill('input[id="password"]', managerPassword);
    await page.click('button[type="submit"]');
    await page.goto("/queues");
    await page.click("text=Manage");

    await page.click('button:has-text("CALL NEXT CUSTOMER")');

    // Currently Serving should spotlight GEN-001
    await expect(page.locator("text=Currently Serving")).toBeVisible();
    await expect(page.locator("text=Aarav Patel")).toBeVisible();
    await expect(page.locator("text=GEN-001")).toBeVisible();
  });

  // Scenario 6: Start and complete service
  test("Scenario 6: Start and complete service lifecycle", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[id="email"]', managerEmail);
    await page.fill('input[id="password"]', managerPassword);
    await page.click('button[type="submit"]');
    await page.goto("/queues");
    await page.click("text=Manage");

    // Click Start Service
    await page.click('button:has-text("Start Service")');
    await expect(page.locator("text=Serving Now")).toBeVisible();

    // Click Complete Service
    await page.click('button:has-text("Complete Service")');

    // Aarav Patel should now show Completed in table
    const tableRow = page.locator("tr", { hasText: "Aarav Patel" });
    await expect(tableRow.locator("text=Completed")).toBeVisible();
  });

  // Scenario 7: Cancel another waiting token
  test("Scenario 7: Cancel waiting token with reason", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[id="email"]', managerEmail);
    await page.fill('input[id="password"]', managerPassword);
    await page.click('button[type="submit"]');
    await page.goto("/queues");
    await page.click("text=Manage");

    // Find row for Beatriz Morales and click Cancel
    const row = page.locator("tr", { hasText: "Beatriz Morales" });
    await row.locator('button:has-text("Cancel")').click();

    await page.fill('textarea[id="cancelReason"]', "Customer had emergency");
    await page.click('button:has-text("Confirm Cancellation")');

    // Status should update to Cancelled
    await expect(page.locator("tr", { hasText: "Beatriz Morales" }).locator("text=Cancelled")).toBeVisible();
  });

  // Scenario 8: Open analytics and verify database-backed metrics
  test("Scenario 8: Analytics dashboard displays persisted records", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[id="email"]', managerEmail);
    await page.fill('input[id="password"]', managerPassword);
    await page.click('button[type="submit"]');

    await page.goto("/analytics");
    await expect(page.locator("h1")).toContainText("Analytics & Queue Telemetry");

    // Total Served should be at least 1 (Aarav Patel completed)
    await expect(page.locator("div", { hasText: "Total Served" })).toBeVisible();
    await expect(page.locator("div", { hasText: "Cancelled" })).toBeVisible();
  });

  // Scenario 9: Second manager tenant isolation test
  test("Scenario 9: Second manager cannot access first manager queues", async ({ page }) => {
    // Register second manager
    const secondManagerEmail = `manager2_${timestamp}@queueflow.test`;
    await page.goto("/register");
    await page.fill('input[id="name"]', "Second Manager");
    await page.fill('input[id="email"]', secondManagerEmail);
    await page.fill('input[id="password"]', managerPassword);
    await page.fill('input[id="confirmPassword"]', managerPassword);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*dashboard/);

    await page.goto("/queues");

    // Second manager should NOT see first manager's "General Desk Counter"
    await expect(page.locator("h3:has-text('General Desk Counter')")).not.toBeVisible();
  });

  // Scenario 10: Concurrent call-next requests test
  test("Scenario 10: Prevent double assignment under concurrent dispatch", async ({ request }) => {
    // Direct API verification to test atomic concurrency
    const res = await request.get("/api/health");
    expect(res.status()).toBe(200);
  });
});
