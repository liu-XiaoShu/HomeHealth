import { test, expect } from '@playwright/test';

// See here how to get started:
// https://playwright.dev/docs/intro
test('visits the app root url', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toHaveText('You did it!');
})

// 登录页面测试
test('登录页面应正确显示', async ({ page }) => {
  // 访问登录页面
  await page.goto('/login')
  
  // 验证页面标题
  await expect(page.locator('.login-header h2')).toHaveText('小树家健康管理系统')
  
  // 验证登录表单存在
  await expect(page.locator('form')).toBeVisible()
  await expect(page.locator('input[placeholder="请输入用户名"]')).toBeVisible()
  await expect(page.locator('input[placeholder="请输入密码"]')).toBeVisible()
  await expect(page.locator('button.login-button')).toBeVisible()
})

// 健康检查页面测试
test('健康检查页面应正确显示', async ({ page }) => {
  // 访问健康检查页面
  await page.goto('/health')
  
  // 验证标题
  await expect(page.locator('.card-header h2')).toHaveText('系统健康状态')
  
  // 验证前端状态显示
  await expect(page.locator('text=前端状态')).toBeVisible()
  
  // 验证后端状态显示
  await expect(page.locator('text=后端状态')).toBeVisible()
  
  // 验证按钮
  await expect(page.locator('button:has-text("重新检查")')).toBeVisible()
  await expect(page.locator('button:has-text("返回登录")')).toBeVisible()
})

// 测试登录流程
test('登录流程应正常工作', async ({ page }) => {
  // 访问登录页面
  await page.goto('/login')
  
  // 输入登录信息
  await page.fill('input[placeholder="请输入用户名"]', 'testuser')
  await page.fill('input[placeholder="请输入密码"]', 'password123')
  
  // 点击登录按钮
  await page.click('button.login-button')
  
  // 验证登录成功后跳转
  await page.waitForURL('/home')
  
  // 验证成功消息
  await expect(page.locator('.el-message--success')).toBeVisible()
})

// 测试注册流程
test('注册流程应正常工作', async ({ page }) => {
  // 访问登录页面
  await page.goto('/login')
  
  // 点击注册链接
  await page.click('text=立即注册')
  
  // 验证跳转到注册页面
  await page.waitForURL('/register')
  
  // 填写注册表单
  await page.fill('input[placeholder="请输入用户名"]', 'newuser')
  await page.fill('input[placeholder="请输入邮箱"]', 'newuser@example.com')
  await page.fill('input[placeholder="请输入手机号"]', '13800138000')
  await page.fill('input[placeholder="请输入密码"]', 'password123')
  await page.fill('input[placeholder="请确认密码"]', 'password123')
  
  // 提交注册表单
  await page.click('button.register-button')
  
  // 验证注册成功后跳转
  await page.waitForURL('/login')
})

// 测试健康检查功能
test('健康检查功能应正常工作', async ({ page }) => {
  // 访问健康检查页面
  await page.goto('/health')
  
  // 点击重新检查按钮
  await page.click('button:has-text("重新检查")')
  
  // 验证检查结果显示
  await expect(page.locator('text=后端消息')).toBeVisible()
  
  // 测试返回登录按钮
  await page.click('button:has-text("返回登录")')
  await page.waitForURL('/login')
})
