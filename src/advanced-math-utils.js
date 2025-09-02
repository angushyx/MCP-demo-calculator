/**
 * 🧮 高級數學工具類 - Advanced Math Utilities
 * 
 * 這個文件故意包含了多種 Claude Code Reviewer 可以發現的問題：
 * - 安全漏洞 (eval 使用)
 * - 性能問題 (低效算法)  
 * - 代碼風格問題 (var vs let, == vs ===)
 * - 錯誤處理缺失
 * - 類型檢查缺失
 * - 現代 JavaScript 特性未使用
 */

// 全域變數 - 命名空間污染
var mathOperationCount = 0;
let lastCalculationTime = null;

class AdvancedMathUtils {
    constructor() {
        this.cache = {}; // 簡單的快取，沒有大小限制
        this.precision = 15;
    }
    
    // 問題1: 使用 eval() - 嚴重安全風險
    evaluateFormula(formula) {
        try {
            // 危險：直接使用 eval 而沒有任何清理
            return eval(formula);
        } catch (e) {
            return null; // 簡陋的錯誤處理
        }
    }
    
    // 問題2: 低效的質數檢查算法
    isPrime(n) {
        if (n <= 1) return false;
        if (n == 2) return true; // 使用 == 而不是 ===
        
        // O(n) 複雜度 - 非常低效！
        for (var i = 2; i < n; i++) { // 使用 var 而不是 let
            if (n % i == 0) { // 使用 == 而不是 ===
                return false;
            }
        }
        return true;
    }
    
    // 問題3: 遞歸計算斐波那契 - 指數時間複雜度
    fibonacci(n) {
        // 沒有參數驗證
        if (n <= 1) return n;
        
        // 極低效的遞歸實現
        return this.fibonacci(n - 1) + this.fibonacci(n - 2);
    }
    
    // 問題4: 缺少類型檢查和錯誤處理
    calculateMean(numbers) {
        // 沒有檢查 numbers 是否為陣列
        var sum = 0; // 使用 var
        for (var i = 0; i < numbers.length; i++) {
            sum = sum + numbers[i]; // 沒有檢查是否為數字
        }
        return sum / numbers.length; // 可能除以零
    }
    
    // 問題5: 同步操作可能阻塞 UI
    calculatePrimeFactors(n) {
        let factors = [];
        let divisor = 2;
        
        // 可能長時間阻塞的迴圈
        while (n > 1) {
            while (n % divisor == 0) { // 使用 == 而不是 ===
                factors.push(divisor);
                n = n / divisor;
            }
            divisor++;
            
            // 沒有進度回報或中斷機制
            if (divisor > 1000000) break; // 硬編碼限制
        }
        
        return factors;
    }
    
    // 問題6: 字串拼接而不是模板字符串
    formatResult(result, operation) {
        return 'Operation: ' + operation + ', Result: ' + result + ', Time: ' + new Date();
    }
    
    // 問題7: 沒有使用 Map 或 Set 等現代數據結構
    findDuplicates(array) {
        let duplicates = [];
        
        // O(n²) 複雜度
        for (let i = 0; i < array.length; i++) {
            for (let j = i + 1; j < array.length; j++) {
                if (array[i] == array[j]) { // 使用 == 而不是 ===
                    if (duplicates.indexOf(array[i]) == -1) { // 使用 indexOf 而不是 includes
                        duplicates.push(array[i]);
                    }
                }
            }
        }
        
        return duplicates;
    }
    
    // 問題8: 記憶體洩漏風險 - 無限制的快取
    cachedExpensiveOperation(input) {
        let key = input.toString();
        
        // 快取永遠不會清理
        if (this.cache[key]) {
            return this.cache[key];
        }
        
        // 模擬昂貴的計算
        let result = 0;
        for (let i = 0; i < 1000000; i++) {
            result += Math.sin(input + i) * Math.cos(input + i);
        }
        
        this.cache[key] = result;
        return result;
    }
    
    // 問題9: Promise 但沒有使用 async/await
    slowAsyncOperation(n) {
        return new Promise(function(resolve, reject) {
            setTimeout(function() {
                // 可能拋出錯誤但沒有適當處理
                if (n < 0) {
                    reject('Negative number');
                } else {
                    resolve(n * 2);
                }
            }, 1000);
        });
    }
    
    // 問題10: 混合使用 var, let, const
    complexCalculation(a, b, c) {
        var result = 0; // 應該使用 const 或 let
        let temp1 = a + b;
        const temp2 = b * c;
        var temp3 = a - c; // 不一致的變數宣告
        
        // 複雜的條件邏輯 - 可以簡化
        if (a > b) {
            if (b > c) {
                result = temp1 + temp2;
            } else {
                if (c > a) {
                    result = temp2 - temp3;
                } else {
                    result = temp1 * temp3;
                }
            }
        } else {
            result = temp1 + temp2 + temp3;
        }
        
        // 全域變數修改
        mathOperationCount++;
        lastCalculationTime = Date.now();
        
        return result;
    }
    
    // 問題11: 沒有適當的 JSDoc 註解和類型資訊
    matrix multiply(matrix1, matrix2) {
        // 沒有檢查矩陣維度兼容性
        let result = [];
        
        for (let i = 0; i < matrix1.length; i++) {
            result[i] = [];
            for (let j = 0; j < matrix2[0].length; j++) {
                let sum = 0;
                for (let k = 0; k < matrix2.length; k++) {
                    sum += matrix1[i][k] * matrix2[k][j];
                }
                result[i][j] = sum;
            }
        }
        
        return result;
    }
}

// 問題12: 全域函數污染命名空間
function quickMath(operation, a, b) {
    // 使用 switch 但沒有 default case
    switch(operation) {
        case 'add':
            return a + b;
        case 'multiply':
            return a * b;
        case 'divide':
            return a / b; // 沒有檢查除零
    }
    // 沒有返回值可能導致 undefined
}

// 問題13: 立即執行函數但可能不需要
(function() {
    console.log('Advanced Math Utils loaded at ' + new Date()); // 字串拼接
})();

// 問題14: 混合導出方式
if (typeof module !== 'undefined') {
    module.exports = AdvancedMathUtils;
}

// 全域暴露
window.AdvancedMathUtils = AdvancedMathUtils;
window.quickMath = quickMath;

// Claude Code Reviewer 應該能發現以下問題：
// 1. 使用 eval() - 嚴重安全風險
// 2. 低效算法 (O(n), O(n²), 指數時間複雜度)
// 3. var vs let/const 不一致性
// 4. == vs === 問題  
// 5. 缺少錯誤處理和參數驗證
// 6. 同步阻塞操作
// 7. 記憶體洩漏風險 (無限制快取)
// 8. 沒有使用現代 JavaScript 特性
// 9. 字串拼接而非模板字符串
// 10. Promise 反模式
// 11. 複雜的條件邏輯
// 12. 全域命名空間污染
// 13. 缺少適當的類型註解