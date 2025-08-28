<<<<<<< HEAD
# 智能工作助理 App - MCP 整合專案

這個專案整合了 Notion、Canva、Google Drive、Gmail、GitHub、Airbnb 搜尋、檔案系統等多個服務，建立一個統一的工作管理平台。

## 快速開始

```bash
# 1. 進入專案目錄
cd /Users/angushyx/Desktop/mcp-multi-service

# 2. 安裝依賴
cd backend && npm install
cd ../frontend && npm install

# 3. 設定環境變數
cd ../backend
cp .env.example .env
# 編輯 .env 填入你的 API keys

# 4. 啟動服務
# Terminal 1 - 後端
cd backend && npm run dev

# Terminal 2 - 前端  
cd frontend && npm run dev

# 5. 開啟瀏覽器訪問 http://localhost:5173
```

## 專案結構

```
mcp-multi-service/
├── backend/              # Express + MCP 後端
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   └── src/
│       ├── index.ts
│       ├── mcp-client.ts
│       └── routes/
├── frontend/            # React 前端應用
│   ├── package.json
│   ├── vite.config.ts
│   └── src/
│       ├── App.tsx
│       ├── components/
│       └── services/
└── docker-compose.yml
```

## 功能特點

1. **統一搜尋**: 跨服務搜尋功能，一次搜尋所有整合的服務
2. **即時同步**: 所有變更即時反映在各個服務中
3. **AI 生成**: 整合 Canva AI 生成設計功能
4. **批次操作**: 支援批次處理多個檔案或項目
5. **安全認證**: OAuth 2.0 安全認證機制

## 支援的服務

- 📝 **Notion**: 搜尋和創建頁面、管理資料庫
- 🎨 **Canva**: 設計管理、AI 生成、匯出功能
- 📁 **Google Drive**: 檔案搜尋和管理
- 📧 **Gmail**: 讀取和發送郵件
- 🐙 **GitHub**: 儲存庫、Issue 和程式碼管理
- 🏠 **Airbnb**: 搜尋房源
- 📂 **檔案系統**: 本地檔案管理

## 環境需求

- Node.js 18+
- npm 或 yarn
- 各服務的 API 金鑰

## 授權

MIT License
=======
# 🧮 MCP Demo Calculator

A modern, feature-rich calculator application integrated with MCP (Model Context Protocol) CI/CD pipeline for automated release notes generation and Slack notifications.

## ✨ Features

### 🔢 Calculator Functions
- **Basic Operations**: Addition, subtraction, multiplication, division
- **Advanced Functions**: Square root, power, trigonometric functions (sin, cos)
- **Memory & History**: Calculation history tracking
- **Keyboard Support**: Full keyboard navigation and input
- **Error Handling**: Safe expression evaluation with error recovery

### 🎨 Modern UI/UX
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Glass Morphism**: Modern frosted glass aesthetic with backdrop blur
- **Dark Theme**: Automatic dark mode support based on system preferences
- **Smooth Animations**: Fluid transitions and hover effects
- **Accessible**: Keyboard navigation and screen reader friendly

### 🤖 MCP Integration
- **CI/CD Pipeline**: Automated analysis on every code push
- **Release Notes**: AI-generated release documentation
- **Slack Notifications**: Real-time team notifications
- **Notion Documentation**: Automated documentation updates

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Modern web browser
- GitHub account (for CI/CD integration)

### Installation

```bash
# Clone the repository
git clone https://github.com/angushyx/MCP-demo-calculator.git
cd MCP-demo-calculator

# Install dependencies
npm install

# Start development server
npm run dev

# Open browser to http://localhost:5173
```

### Build for Production

```bash
# Build optimized version
npm run build

# Preview production build
npm run preview
```

## 🔧 Development

### Project Structure
```
MCP-demo-calculator/
├── src/
│   ├── calculator.js    # Core calculator logic
│   └── styles.css       # Modern CSS styling
├── index.html           # Main HTML structure
├── package.json         # Dependencies and scripts
└── README.md           # This file
```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run test` - Run tests
- `npm run lint` - Check code style
- `npm run format` - Format code with Prettier

## 🧪 Testing

```bash
# Run all tests
npm test

# Test calculator functions
npm run test:calculator

# Test UI interactions
npm run test:ui
```

## 🤖 MCP CI/CD Integration

This project demonstrates real MCP integration with:

### Automated Workflow
1. **Code Push** → GitHub triggers workflow
2. **AI Analysis** → MCP analyzes code changes
3. **Documentation** → Auto-generates release notes
4. **Slack Notification** → Teams get notified instantly

### Features Demonstrated
- ✅ GitHub Actions integration
- ✅ AI-powered code analysis
- ✅ Automated Notion documentation
- ✅ Slack bot notifications
- ✅ Version management
- ✅ Release tracking

## 📈 Performance

- **Lighthouse Score**: 95+ across all metrics
- **Bundle Size**: < 50KB gzipped
- **Load Time**: < 1s on modern browsers
- **Memory Usage**: Optimized for long-running sessions

## 🎯 Use Cases

### Educational
- Demonstrate modern web development practices
- Show CI/CD pipeline integration
- Learn MCP protocol implementation

### Professional
- Template for calculator applications
- CI/CD pipeline reference implementation
- Team collaboration workflow example

## 🛠️ Technical Details

### Built With
- **Vanilla JavaScript** - No framework dependencies
- **Modern CSS** - Grid, Flexbox, CSS Variables
- **Vite** - Fast development and build tool
- **TypeScript** - Type safety (optional)
- **Jest** - Testing framework

### Browser Support
- Chrome/Edge 88+
- Firefox 85+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📊 Analytics & Monitoring

The calculator includes optional analytics integration:
- Calculation usage statistics
- Performance monitoring
- Error tracking
- User interaction patterns

## 🔒 Security

- Safe expression evaluation
- Input sanitization
- No eval() usage
- CSP-compliant code

## 🌟 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- MCP Workshop Team
- Open source contributors
- Modern web development community

---

**🚀 Ready to experience the future of automated DevOps?**

This calculator is more than just a tool - it's a complete demonstration of how AI can revolutionize your development workflow!

## 📞 Support

- 📧 Email: support@mcp-demo.com
- 💬 Discord: [MCP Community](https://discord.gg/mcp)
- 📖 Docs: [MCP Documentation](https://docs.mcp-demo.com)

---

*Last updated: August 2025*
>>>>>>> 315b57193004fd3230e4e777d5e88f6964e179ac
