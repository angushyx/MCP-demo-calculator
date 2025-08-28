class Calculator {
    constructor() {
        this.display = document.getElementById('display');
        this.currentInput = '0';
        this.shouldResetDisplay = false;
        this.lastOperation = null;
        this.history = [];
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
