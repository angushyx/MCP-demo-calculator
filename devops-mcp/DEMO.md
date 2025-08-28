# 🎯 DevOps MCP - 完整 Demo 演示

## 📺 Demo 場景：電商網站 API 重構

假設你正在重構一個電商網站的 API，需要添加認證、錯誤處理和文檔。

## Step 1: 啟動應用

```bash
cd /Users/angushyx/Desktop/mcp-multi-service/devops-mcp
chmod +x run.sh
./run.sh
```

## Step 2: 打開瀏覽器

訪問：http://localhost:5173

## Step 3: 複製以下完整的 diff 範例

```diff
diff --git a/src/api/products.js b/src/api/products.js
index a1b2c3d..e4f5g6h 100644
--- a/src/api/products.js
+++ b/src/api/products.js
@@ -1,20 +1,45 @@
 const express = require('express');
 const router = express.Router();
+const { authenticate } = require('../middleware/auth');
+const { validateProduct } = require('../validators/product');
+const cache = require('../utils/cache');
 
-router.get('/products', (req, res) => {
-  const products = db.getAllProducts();
-  res.json(products);
+router.get('/products', async (req, res, next) => {
+  try {
+    const { category, minPrice, maxPrice, sortBy = 'name' } = req.query;
+    
+    const cacheKey = `products:${category}:${minPrice}:${maxPrice}:${sortBy}`;
+    const cached = await cache.get(cacheKey);
+    
+    if (cached) {
+      return res.json(cached);
+    }
+    
+    const products = await db.getProducts({
+      category,
+      priceRange: { min: minPrice, max: maxPrice },
+      sort: sortBy
+    });
+    
+    await cache.set(cacheKey, products, 300);
+    res.json(products);
+  } catch (error) {
+    next(error);
+  }
 });
 
-router.post('/products', (req, res) => {
-  const product = req.body;
-  db.createProduct(product);
-  res.status(201).json(product);
+router.post('/products', authenticate, validateProduct, async (req, res, next) => {
+  try {
+    const product = await db.createProduct({
+      ...req.body,
+      createdBy: req.user.id,
+      createdAt: new Date()
+    });
+    
+    await cache.invalidate('products:*');
+    res.status(201).json(product);
+  } catch (error) {
+    next(error);
+  }
 });
 
-router.delete('/products/:id', (req, res) => {
-  db.deleteProduct(req.params.id);
-  res.status(204).send();
-});
-
 module.exports = router;
diff --git a/src/api/orders.js b/src/api/orders.js
index b2c3d4e..f6g7h8i 100644
--- a/src/api/orders.js
+++ b/src/api/orders.js
@@ -1,15 +1,68 @@
 const express = require('express');
 const router = express.Router();
+const { authenticate } = require('../middleware/auth');
+const OrderService = require('../services/OrderService');
+const EmailService = require('../services/EmailService');
+const logger = require('../utils/logger');
 
-router.post('/orders', (req, res) => {
-  const order = {
-    items: req.body.items,
-    total: req.body.total,
-    user: req.body.userId
-  };
+class OrderController {
+  async createOrder(req, res, next) {
+    const session = await db.startSession();
+    
+    try {
+      await session.startTransaction();
+      
+      const { items, shippingAddress, paymentMethod } = req.body;
+      const userId = req.user.id;
+      
+      // Validate inventory
+      const validationResult = await OrderService.validateInventory(items);
+      if (!validationResult.success) {
+        return res.status(400).json({
+          error: 'Insufficient inventory',
+          details: validationResult.errors
+        });
+      }
+      
+      // Calculate pricing
+      const pricing = await OrderService.calculatePricing(items, shippingAddress);
+      
+      // Create order
+      const order = await db.orders.create({
+        userId,
+        items,
+        shippingAddress,
+        paymentMethod,
+        subtotal: pricing.subtotal,
+        tax: pricing.tax,
+        shipping: pricing.shipping,
+        total: pricing.total,
+        status: 'pending',
+        createdAt: new Date()
+      }, { session });
+      
+      // Process payment
+      const paymentResult = await OrderService.processPayment(order, paymentMethod);
+      
+      if (!paymentResult.success) {
+        await session.abortTransaction();
+        return res.status(400).json({
+          error: 'Payment failed',
+          message: paymentResult.error
+        });
+      }
+      
+      // Update inventory
+      await OrderService.updateInventory(items, { session });
+      
+      await session.commitTransaction();
+      
+      // Send confirmation email
+      await EmailService.sendOrderConfirmation(req.user.email, order);
+      
+      logger.info(`Order created: ${order.id} for user: ${userId}`);
+      res.status(201).json(order);
+      
+    } catch (error) {
+      await session.abortTransaction();
+      logger.error('Order creation failed:', error);
+      next(error);
+    } finally {
+      await session.endSession();
+    }
+  }
+}
 
-  db.createOrder(order);
-  res.json(order);
-});
+router.post('/orders', authenticate, new OrderController().createOrder);
 
 module.exports = router;
diff --git a/src/middleware/auth.js b/src/middleware/auth.js
new file mode 100644
index 0000000..1234567
--- /dev/null
+++ b/src/middleware/auth.js
@@ -0,0 +1,28 @@
+const jwt = require('jsonwebtoken');
+const { UnauthorizedError } = require('../errors');
+
+const authenticate = async (req, res, next) => {
+  try {
+    const token = req.headers.authorization?.split(' ')[1];
+    
+    if (!token) {
+      throw new UnauthorizedError('No token provided');
+    }
+    
+    const decoded = jwt.verify(token, process.env.JWT_SECRET);
+    const user = await db.users.findById(decoded.userId);
+    
+    if (!user || !user.isActive) {
+      throw new UnauthorizedError('Invalid user');
+    }
+    
+    req.user = user;
+    next();
+  } catch (error) {
+    if (error instanceof jwt.TokenExpiredError) {
+      return res.status(401).json({ error: 'Token expired' });
+    }
+    next(error);
+  }
+};
+
+module.exports = { authenticate };
diff --git a/package.json b/package.json
index 3a4b5c6..8d9e10f 100644
--- a/package.json
+++ b/package.json
@@ -1,15 +1,20 @@
 {
   "name": "ecommerce-api",
-  "version": "1.0.0",
+  "version": "2.0.0",
   "description": "E-commerce REST API",
   "scripts": {
     "start": "node src/server.js",
-    "dev": "nodemon src/server.js"
+    "dev": "nodemon src/server.js",
+    "test": "jest",
+    "test:coverage": "jest --coverage",
+    "lint": "eslint src/",
+    "migrate": "node scripts/migrate.js"
   },
   "dependencies": {
     "express": "^4.18.0",
-    "mongodb": "^4.5.0"
+    "mongodb": "^5.0.0",
+    "jsonwebtoken": "^9.0.0",
+    "bcrypt": "^5.1.0",
+    "redis": "^4.5.0",
+    "joi": "^17.7.0"
   },
   "devDependencies": {
-    "nodemon": "^2.0.0"
+    "nodemon": "^2.0.0",
+    "jest": "^29.0.0",
+    "eslint": "^8.0.0"
   }
 }
```

## Step 4: 貼到 DevOps 面板

1. 點擊左側 **"DevOps"** 按鈕
2. 將上面的 diff 完整複製貼到文字框中
3. 點擊功能按鈕

## Step 5: 查看結果

### 🔧 點擊 "Generate Patch" 後的結果：

系統會生成類似這樣的文檔補丁：

```diff
diff --git a/README.md b/README.md
index 0000000..1111111 100644
--- a/README.md
+++ b/README.md
@@ -15,6 +15,45 @@ E-commerce REST API
+## API Endpoints
+
+### Products API
+
+#### GET /products
+Retrieve products with filtering and caching support.
+
+Query Parameters:
+- `category` (string): Filter by category
+- `minPrice` (number): Minimum price filter
+- `maxPrice` (number): Maximum price filter  
+- `sortBy` (string): Sort field (default: 'name')
+
+#### POST /products
+Create a new product (requires authentication).
+
+### Orders API
+
+#### POST /orders
+Create a new order with transaction support.
+
+Features:
+- Inventory validation
+- Automatic pricing calculation
+- Payment processing
+- Email confirmation
+
+## Authentication
+
+All protected endpoints require JWT token in Authorization header:
+```
+Authorization: Bearer <token>
+```
+
+## New Features in v2.0.0
+
+- JWT Authentication
+- Redis caching for products
+- Transaction support for orders
+- Automated inventory management
+- Email notifications

diff --git a/CHANGELOG.md b/CHANGELOG.md
new file mode 100644
index 0000000..2222222
--- /dev/null
+++ b/CHANGELOG.md
@@ -0,0 +1,20 @@
+# Changelog
+
+## [2.0.0] - 2024-01-15
+
+### Added
+- JWT authentication middleware
+- Redis caching for product queries
+- Order transaction support with rollback
+- Inventory validation before order creation
+- Automated email confirmations
+- Comprehensive error handling
+
+### Changed
+- All routes now use async/await
+- Products API now supports filtering and sorting
+- Orders use database transactions
+
+### Security
+- Added authentication to product creation
+- Token-based authorization system
```

### 📝 點擊 "Summarize" 後的結果：

```markdown
## 程式碼變更摘要

### 🔴 重大變更（Breaking Changes）
1. **認證需求**：POST /products 現在需要認證
2. **API 版本**：從 v1.0.0 升級到 v2.0.0
3. **請求格式**：訂單 API 的請求結構完全改變

### ✨ 新功能
- **快取系統**：使用 Redis 快取產品查詢（5分鐘 TTL）
- **交易支援**：訂單創建使用資料庫交易，失敗自動回滾
- **庫存管理**：下單前自動驗證庫存
- **郵件通知**：訂單確認自動發送郵件

### 🏗️ 架構改進
- **錯誤處理**：統一的錯誤處理中介軟體
- **驗證層**：使用 Joi 進行請求驗證
- **服務層**：新增 OrderService 和 EmailService
- **日誌系統**：整合結構化日誌記錄

### 📦 受影響模組
- `src/api/products.js`：完全重構，支援過濾和快取
- `src/api/orders.js`：重寫為類別架構，支援交易
- `src/middleware/auth.js`：新增 JWT 認證中介軟體
- `package.json`：新增 5 個依賴項

### 🔍 需要測試的區域
1. 產品快取失效邏輯
2. 訂單交易回滾機制
3. JWT token 過期處理
4. 庫存併發更新

### 📋 建議的後續行動
- [ ] 更新 API 文檔（Swagger/OpenAPI）
- [ ] 添加整合測試覆蓋交易流程
- [ ] 配置 Redis 連線池參數
- [ ] 設定監控告警閾值
```

## 🎉 完整操作流程

### 1️⃣ 複製 diff
將上面的完整 diff 範例複製

### 2️⃣ 貼到應用
在 http://localhost:5173 的 DevOps 面板貼上

### 3️⃣ 生成文檔
點擊 "Generate Patch" 生成文檔補丁

### 4️⃣ 查看摘要
點擊 "Summarize" 查看變更影響分析

## 💡 這個 Demo 展示了什麼？

這個 Demo 展示了 DevOps MCP 如何幫助你：

1. **自動識別程式碼變更的重要性**
   - 檢測到認證系統的添加
   - 發現交易處理的實現
   - 識別快取層的引入

2. **生成專業的文檔更新**
   - README 的 API 文檔
   - CHANGELOG 的版本記錄
   - 函數級別的 JSDoc 註釋

3. **提供可操作的建議**
   - 需要測試的關鍵區域
   - 後續的行動項目
   - 潛在的問題點

## 🚀 立即試用！

1. 確保服務已啟動（執行 `./run.sh`）
2. 打開 http://localhost:5173
3. 複製上面的 diff 範例
4. 體驗自動文檔生成的威力！

這就是一個完整的 Demo 範例，展示了從電商 API v1.0 升級到 v2.0 的完整重構過程！
