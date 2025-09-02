class Calculator {
    constructor() {
        this.display = document.getElementById('display');
        this.currentInput = '0';
        this.shouldResetDisplay = false;
        this.lastOperation = null;
        this.history = [];
        
        // 新增科學計算器功能
        this.scientificMode = false;
        this.scientific = new ScientificCalculator();
        this.angleMode = 'degree'; // degree 或 radian
    }

    updateDisplay() {
        this.display.value = this.currentInput;
    }

    appendToDisplay(value) {
        if (this.shouldResetDisplay) {
            this.currentInput = '';
            this.shouldResetDisplay = false;
        }

        if (this.currentInput === '0' && value !== '.') {
            this.currentInput = value;
        } else {
            this.currentInput += value;
        }
        
        this.updateDisplay();
    }

    clearDisplay() {
        this.currentInput = '0';
        this.shouldResetDisplay = false;
        this.updateDisplay();
        console.log('Display cleared');
    }

    clearEntry() {
        this.currentInput = '0';
        this.updateDisplay();
    }

    deleteLast() {
        if (this.currentInput.length > 1) {
            this.currentInput = this.currentInput.slice(0, -1);
        } else {
            this.currentInput = '0';
        }
        this.updateDisplay();
    }

    calculate() {
        try {
            // 處理特殊函數
            let expression = this.currentInput
                .replace(/sqrt\(/g, 'Math.sqrt(')
                .replace(/pow\(/g, 'Math.pow(')
                .replace(/sin\(/g, 'Math.sin(')
                .replace(/cos\(/g, 'Math.cos(')
                .replace(/tan\(/g, 'Math.tan(')
                .replace(/×/g, '*');

            // 安全的數學表達式評估
            const result = this.evaluateExpression(expression);
            
            // 儲存計算歷史
            this.history.push({
                expression: this.currentInput,
                result: result,
                timestamp: new Date().toLocaleString()
            });

            this.currentInput = result.toString();
            this.shouldResetDisplay = true;
            this.updateDisplay();

            console.log(`計算完成: ${expression} = ${result}`);
            
            // 發送統計數據到 MCP (如果在生產環境)
            this.sendCalculationStats(expression, result);

        } catch (error) {
            this.currentInput = 'Error';
            this.shouldResetDisplay = true;
            this.updateDisplay();
            console.error('計算錯誤:', error);
        }
    }

    evaluateExpression(expression) {
        // 基本的安全檢查
        const allowedChars = /^[0-9+\-*/.() \s]*$/;
        const mathFunctions = /Math\.(sqrt|pow|sin|cos|tan|PI|E)\(/g;
        
        if (!allowedChars.test(expression.replace(mathFunctions, ''))) {
            throw new Error('不允許的字符');
        }

        // 使用 Function constructor 進行安全評估
        const func = new Function('return ' + expression);
        const result = func();
        
        if (!isFinite(result)) {
            throw new Error('無效的計算結果');
        }

        return Math.round(result * 1000000000) / 1000000000; // 精度處理
    }

    sendCalculationStats(expression, result) {
        // 模擬發送統計數據到 MCP 服務
        if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
            fetch('/api/stats/calculation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    expression,
                    result,
                    timestamp: Date.now(),
                    userAgent: navigator.userAgent
                })
            }).catch(err => console.log('統計發送失敗:', err));
        }
    }

    // 快速貨幣轉換功能
    quickCurrencyConvert(amount, fromCurrency, toCurrency) {
        if (typeof currencyConverter !== 'undefined' && currencyConverter) {
            try {
                return currencyConverter.convert(amount, fromCurrency, toCurrency);
            } catch (error) {
                console.error('快速貨幣轉換失敗:', error);
                return null;
            }
        }
        return null;
    }

    getHistory() {
        return this.history;
    }

    clearHistory() {
        this.history = [];
        console.log('計算歷史已清除');
    }
}

// 初始化計算器
const calc = new Calculator();

// 全域函數供 HTML 調用
function appendToDisplay(value) {
    calc.appendToDisplay(value);
}

function clearDisplay() {
    calc.clearDisplay();
}

function clearEntry() {
    calc.clearEntry();
}

function deleteLast() {
    calc.deleteLast();
}

function calculate() {
    calc.calculate();
}

// 鍵盤支援
document.addEventListener('keydown', function(event) {
    const key = event.key;
    
    if ('0123456789.+-*/'.includes(key)) {
        const displayKey = key === '*' ? '×' : key;
        appendToDisplay(displayKey);
    } else if (key === 'Enter' || key === '=') {
        event.preventDefault();
        calculate();
    } else if (key === 'Escape') {
        clearDisplay();
    } else if (key === 'Backspace') {
        deleteLast();
    }
});

// 版本資訊
console.log('🧮 MCP Demo Calculator v1.1.0 - Enhanced Edition');
console.log('🤖 Integrated with MCP CI/CD Pipeline');
console.log('🚀 Ready for automated release notes generation!');
console.log('✨ New: Advanced functions & improved UI');

// 導出供測試使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Calculator };
}
// MCP Demo Feature - 自動創建於 $(date)
class MCPIntegration {
    static sendAnalytics(operation, result) {
        console.log(`📊 MCP Analytics: ${operation} = ${result}`);
        // 這裡可以集成真實的 MCP 分析
    }
    
    static logCurrencyConversion(amount, from, to, result) {
        console.log(`💱 Currency: ${amount} ${from} → ${result} ${to}`);
    }
}

// 整合到現有計算器
const originalCalculate = calc.calculate;
calc.calculate = function() {
    const result = originalCalculate.call(this);
    MCPIntegration.sendAnalytics(this.currentInput, result);
    return result;
};

console.log('🚀 MCP Demo Integration Loaded!');

// 計算歷史查看功能 - Demo 範例
function showCalculationHistory() {
    const history = calc.getHistory();
    if (history.length === 0) {
        alert("📊 尚無計算歷史");
        return;
    }
    
    const historyWindow = window.open("", "history", "width=500,height=700");
    historyWindow.document.write(`
        <html>
        <head>
            <title>📊 計算歷史</title>
            <style>
                body { 
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                    padding: 20px; 
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    margin: 0;
                }
                .container {
                    background: rgba(255,255,255,0.95);
                    border-radius: 15px;
                    padding: 20px;
                    backdrop-filter: blur(10px);
                    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                }
                h2 { 
                    color: #4a5568; 
                    text-align: center; 
                    margin-bottom: 20px;
                    font-size: 1.5em;
                }
                .history-item { 
                    border-bottom: 1px solid #e2e8f0; 
                    padding: 12px 0; 
                    transition: background 0.2s;
                }
                .history-item:hover {
                    background: rgba(102, 126, 234, 0.1);
                    border-radius: 8px;
                    padding: 12px 8px;
                }
                .expression { 
                    font-weight: 600; 
                    color: #2d3748; 
                    font-size: 1.1em;
                }
                .result { 
                    color: #38a169; 
                    font-weight: 700;
                }
                .timestamp { 
                    color: #718096; 
                    font-size: 0.85em; 
                    margin-top: 4px;
                }
                .stats {
                    background: #f7fafc;
                    padding: 15px;
                    border-radius: 10px;
                    margin-bottom: 20px;
                    text-align: center;
                    color: #4a5568;
                }
                .close-btn {
                    background: linear-gradient(145deg, #f56565, #e53e3e);
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                    margin-top: 15px;
                    width: 100%;
                }
                .close-btn:hover {
                    background: linear-gradient(145deg, #e53e3e, #c53030);
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h2>📊 計算歷史記錄</h2>
                <div class="stats">
                    <strong>總計算次數:</strong> ${history.length} 次 | 
                    <strong>最早記錄:</strong> ${history[0]?.timestamp || 'N/A'}
                </div>
                <div class="history-list">
                    ${history.map((item, index) => 
                        `<div class="history-item">
                            <div class="expression">#${index + 1} ${item.expression} = <span class="result">${item.result}</span></div>
                            <div class="timestamp">⏰ ${item.timestamp}</div>
                        </div>`
                    ).join("")}
                </div>
                <button class="close-btn" onclick="window.close()">關閉歷史視窗</button>
            </div>
        </body>
        </html>
    `);
}

console.log("✨ 歷史查看功能已載入 - 點擊 📊 按鈕查看計算記錄");

// 🧮 科學計算器擴展功能 - 故意包含一些可以改進的地方
window.scientificCalculator = {
    memory: 0,
    angleMode: 'degree',
    
    // 科學運算方法 - 有錯誤處理問題
    power: function(base, exp) {
        // 沒有參數驗證
        return Math.pow(base, exp);
    },
    
    sqrt: function(n) {
        // 沒有檢查負數
        return Math.sqrt(n);
    },
    
    factorial: function(n) {
        if (n == 0) return 1; // 使用 == 而不是 ===
        // 遞歸可能導致堆疊溢出
        return n * this.factorial(n - 1);
    },
    
    // 三角函數 - 角度轉換邏輯
    sin: function(angle) {
        var radian = angle; // 使用 var
        if (this.angleMode == 'degree') {
            radian = angle * Math.PI / 180;
        }
        return Math.sin(radian);
    },
    
    // 危險的表達式求值
    evaluateExpression: function(expr) {
        try {
            // 使用 eval - 安全風險！
            return eval(expr.replace(/π/g, 'Math.PI').replace(/e/g, 'Math.E'));
        } catch (e) {
            return NaN;
        }
    },
    
    // 記憶體功能 - 簡單實現
    memStore: function(value) {
        this.memory = value;
        console.log('Stored: ' + value); // 字串連接而非模板字符串
    },
    
    memRecall: function() {
        return this.memory;
    }
};

// 全域函數 - 可能造成命名空間污染
function calculateScientific(operation) {
    const input = parseFloat(document.getElementById('display').value);
    let result;
    
    // 大量的 if-else - 可以用 switch 或策略模式
    if (operation == 'sin') {
        result = window.scientificCalculator.sin(input);
    } else if (operation == 'cos') {
        result = Math.cos(input * Math.PI / 180); // 重複的角度轉換邏輯
    } else if (operation == 'tan') {
        result = Math.tan(input * Math.PI / 180);
    } else if (operation == 'sqrt') {
        result = window.scientificCalculator.sqrt(input);
    } else if (operation == 'factorial') {
        result = window.scientificCalculator.factorial(input);
    } else if (operation == 'power') {
        const exp = prompt('輸入指數:'); // 使用 prompt - 不好的 UX
        result = window.scientificCalculator.power(input, parseFloat(exp));
    }
    
    // 沒有檢查結果有效性
    document.getElementById('display').value = result;
    
    // 簡單的歷史記錄
    calc.addToHistory(`${operation}(${input}) = ${result}`);
}

// 複雜表達式求值 - 使用危險的 eval 方法
function evaluateComplexExpression() {
    const expressionInput = document.getElementById('expression-input');
    let expression = expressionInput.value.trim();
    
    if (!expression) {
        // 從主顯示器讀取
        expression = document.getElementById('display').value;
    }
    
    try {
        // 預處理表達式 - 替換常數和函數
        let processedExpression = expression
            .replace(/π/g, 'Math.PI')
            .replace(/pi/g, 'Math.PI')  
            .replace(/e/g, 'Math.E')
            .replace(/sin\(/g, 'Math.sin(')
            .replace(/cos\(/g, 'Math.cos(')
            .replace(/tan\(/g, 'Math.tan(')
            .replace(/sqrt\(/g, 'Math.sqrt(')
            .replace(/log\(/g, 'Math.log10(')
            .replace(/ln\(/g, 'Math.log(');
        
        console.log('Original expression:', expression);
        console.log('Processed expression:', processedExpression);
        
        // ⚠️ 安全風險：使用 eval！Claude 應該會指出這個問題
        const result = eval(processedExpression);
        
        if (!isFinite(result)) {
            throw new Error('結果無效');
        }
        
        // 顯示結果
        document.getElementById('display').value = result;
        
        // 添加到歷史
        calc.addToHistory(`${expression} = ${result}`);
        
        // 清空表達式輸入
        expressionInput.value = '';
        
        // 統計 - 全域變數修改
        window.calculationCount = (window.calculationCount || 0) + 1;
        console.log('Total calculations:', window.calculationCount);
        
    } catch (error) {
        console.error('Expression evaluation error:', error);
        document.getElementById('display').value = 'Error';
        alert('表達式錯誤: ' + error.message); // 使用 alert - 不好的用戶體驗
    }
}

// 👨‍💻 程式設計師工具箱功能實作
let developerToolkit = null;

// 初始化工具箱
function initDeveloperToolkit() {
    if (typeof DeveloperToolkit !== 'undefined') {
        developerToolkit = new DeveloperToolkit();
        console.log('👨‍💻 程式設計師工具箱已初始化');
    }
}

// 切換工具箱標籤
function switchToolkitTab(tabName) {
    // 隱藏所有面板
    const panels = document.querySelectorAll('.toolkit-panel');
    panels.forEach(panel => panel.classList.remove('active'));
    
    // 移除所有標籤的 active 狀態
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    // 顯示選中的面板
    const targetPanel = document.getElementById(tabName);
    if (targetPanel) {
        targetPanel.classList.add('active');
    }
    
    // 標記選中的標籤
    event.target.classList.add('active');
}

// 進制轉換功能 - 有一些可以改進的地方
function convertBase() {
    if (!developerToolkit) initDeveloperToolkit();
    
    const input = document.getElementById('base-input').value;
    const fromBase = parseInt(document.getElementById('from-base').value);
    const toBase = parseInt(document.getElementById('to-base').value);
    const resultDiv = document.getElementById('base-result');
    
    if (!input) {
        resultDiv.textContent = '請輸入數字';
        return;
    }
    
    // 沒有驗證輸入是否符合指定進制
    const result = developerToolkit.convertBase(input, fromBase, toBase);
    
    // 簡單的結果顯示
    resultDiv.innerHTML = `
        <strong>${input}</strong> (${fromBase}進制) = <strong>${result}</strong> (${toBase}進制)
        <br><small>轉換時間: ${new Date().toLocaleTimeString()}</small>
    `;
    
    // 添加到計算歷史 - 可能不是最佳實踐
    calc.addToHistory(`${input}(${fromBase}) → ${result}(${toBase})`);
}

// 顏色轉換功能
function convertColor() {
    if (!developerToolkit) initDeveloperToolkit();
    
    const input = document.getElementById('color-input').value.trim();
    const fromFormat = document.getElementById('color-from').value;
    const toFormat = document.getElementById('color-to').value;
    const resultDiv = document.getElementById('color-result');
    const colorText = document.getElementById('color-text');
    const colorPreview = document.getElementById('color-preview');
    
    if (!input) {
        colorText.textContent = '請輸入顏色值';
        return;
    }
    
    const result = developerToolkit.convertColor(input, fromFormat, toFormat);
    
    // 設置顏色預覽 - 可能會失敗
    try {
        colorPreview.style.backgroundColor = result.startsWith('#') ? result : input;
    } catch (e) {
        console.log('Color preview failed'); // 簡單的錯誤處理
    }
    
    colorText.innerHTML = `<strong>${result}</strong>`;
}

// 文字編碼功能 - 包含安全風險
function encodeText() {
    if (!developerToolkit) initDeveloperToolkit();
    
    const input = document.getElementById('encode-input').value;
    const encoding = document.getElementById('encoding-type').value;
    const resultDiv = document.getElementById('encode-result');
    
    if (!input) {
        resultDiv.textContent = '請輸入要編碼的文字';
        return;
    }
    
    // 可能包含安全風險的編碼
    const result = developerToolkit.encodeString(input, encoding);
    
    resultDiv.innerHTML = `
        <strong>編碼結果 (${encoding.toUpperCase()}):</strong><br>
        <textarea readonly style="width: 100%; height: 80px;">${result}</textarea>
    `;
}

// 文字解碼功能
function decodeText() {
    if (!developerToolkit) initDeveloperToolkit();
    
    const input = document.getElementById('encode-input').value;
    const encoding = document.getElementById('encoding-type').value;
    const resultDiv = document.getElementById('encode-result');
    
    if (!input) {
        resultDiv.textContent = '請輸入要解碼的文字';
        return;
    }
    
    const result = developerToolkit.decodeString(input, encoding);
    
    if (result === null) {
        resultDiv.innerHTML = '<span style="color: red;">解碼失敗！請檢查輸入格式</span>';
    } else {
        resultDiv.innerHTML = `
            <strong>解碼結果:</strong><br>
            <textarea readonly style="width: 100%; height: 80px;">${result}</textarea>
        `;
    }
}

// 時間戳轉換功能
function convertTimestamp() {
    if (!developerToolkit) initDeveloperToolkit();
    
    const input = document.getElementById('timestamp-input').value;
    const format = document.getElementById('timestamp-format').value;
    const resultDiv = document.getElementById('timestamp-result');
    
    if (!input) {
        resultDiv.textContent = '請輸入時間戳或日期';
        return;
    }
    
    const result = developerToolkit.convertTimestamp(input, format);
    
    resultDiv.innerHTML = `
        <strong>轉換結果:</strong> ${result}<br>
        <small>輸入: ${input} | 格式: ${format}</small>
    `;
}

// 獲取當前時間戳
function getCurrentTimestamp() {
    const now = Date.now();
    const resultDiv = document.getElementById('timestamp-result');
    
    document.getElementById('timestamp-input').value = now;
    
    resultDiv.innerHTML = `
        <strong>當前時間戳:</strong> ${now}<br>
        <strong>人類可讀:</strong> ${new Date(now).toString()}
    `;
}

// 生成 UUID
function generateUUID() {
    if (!developerToolkit) initDeveloperToolkit();
    
    const uuid = developerToolkit.generateUUID();
    
    // 簡單的顯示方式 - 使用 alert
    const message = `生成的 UUID: ${uuid}\n\n已複製到剪貼板！`;
    
    // 嘗試複製到剪貼板 - 可能會失敗
    try {
        navigator.clipboard.writeText(uuid);
        alert(message);
    } catch (e) {
        alert(`生成的 UUID: ${uuid}`);
    }
}

// 簡單雜湊計算
function calculateHash() {
    const input = prompt('輸入要計算雜湊的文字:'); // 使用 prompt - 不好的 UX
    
    if (input) {
        if (!developerToolkit) initDeveloperToolkit();
        
        const hash = developerToolkit.simpleHash(input, 'simple');
        alert(`簡單雜湊結果: ${hash}`); // 使用 alert
    }
}

// 顯示轉換歷史
function showConversionHistory() {
    // 訪問全域變數 - 不好的實踐
    if (typeof conversionHistory !== 'undefined' && conversionHistory.length > 0) {
        let historyText = '轉換歷史:\n\n';
        
        // 使用傳統 for 迴圈
        for (var i = 0; i < conversionHistory.length; i++) { // 使用 var
            const item = conversionHistory[i];
            historyText += `${item.from} → ${item.to}\n`;
        }
        
        historyText += `\n總轉換次數: ${totalConversions}`;
        
        alert(historyText); // 使用 alert - 不好的 UX
    } else {
        alert('尚無轉換歷史');
    }
}

// 頁面載入完成後初始化
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        initDeveloperToolkit();
    }, 100);
});
