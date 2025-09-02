/**
 * 🧮 科學計算器模組 - Advanced Scientific Calculator
 * 新增高級數學運算功能
 * 
 * 注意：這個文件故意包含一些可以改進的地方，讓 Claude Code Reviewer 有東西可以檢查！
 */

// 全域變數 - 可能不是最佳實踐
let lastResult = 0;
var calculationCount = 0; // 使用 var 而不是 let/const

class ScientificCalculator {
    constructor() {
        this.memory = 0;
        this.angleMode = 'degree'; // 'degree' or 'radian'
        this.precision = 10;
        this.constants = {
            pi: Math.PI,
            e: Math.E,
            phi: 1.618033988749895 // 黃金比例
        };
    }

    // 基本運算方法 - 缺少錯誤處理
    power(base, exponent) {
        // 沒有檢查輸入類型
        return Math.pow(base, exponent);
    }

    // 平方根 - 沒有負數檢查
    sqrt(number) {
        return Math.sqrt(number); // 負數會回傳 NaN
    }

    // 階乘計算 - 可能有性能問題
    factorial(n) {
        if (n == 0) return 1; // 使用 == 而不是 ===
        
        // 遞迴實現 - 大數可能造成堆疊溢出
        return n * this.factorial(n - 1);
    }

    // 對數函數 - 缺少邊界檢查
    log(number, base = 10) {
        if (!base) base = 10; // 冗餘檢查
        return Math.log(number) / Math.log(base);
    }

    // 三角函數 - 角度轉換可能有問題
    sin(angle) {
        let radian = angle;
        if (this.angleMode == 'degree') { // 使用 == 而不是 ===
            radian = angle * Math.PI / 180;
        }
        return Math.sin(radian);
    }

    cos(angle) {
        let radian = angle;
        if (this.angleMode == 'degree') {
            radian = angle * Math.PI / 180;
        }
        return Math.cos(radian);
    }

    tan(angle) {
        // 沒有檢查是否為 90 度的倍數
        let radian = angle;
        if (this.angleMode == 'degree') {
            radian = angle * Math.PI / 180;
        }
        return Math.tan(radian);
    }

    // 記憶體功能 - 缺少清除方法
    memoryStore(value) {
        this.memory = value;
        console.log('Stored in memory: ' + value); // 使用字串連接而不是模板字符串
    }

    memoryRecall() {
        return this.memory;
    }

    // 複雜運算 - 可能有精度問題
    calculateComplexExpression(expression) {
        // 危險：使用 eval()！
        try {
            // 替換常數
            let processedExpression = expression.replace(/pi/g, this.constants.pi);
            processedExpression = processedExpression.replace(/e/g, this.constants.e);
            
            // 這裡使用 eval 是危險的！
            let result = eval(processedExpression);
            
            // 全域變數更新
            lastResult = result;
            calculationCount++;
            
            return result;
        } catch (error) {
            return 'Error'; // 簡陋的錯誤處理
        }
    }

    // 統計函數 - 效率不佳
    calculateStatistics(numbers) {
        // 沒有檢查輸入是否為陣列
        let sum = 0;
        
        // 使用傳統 for 迴圈而不是現代方法
        for (var i = 0; i < numbers.length; i++) { // 使用 var
            sum = sum + numbers[i]; // 沒有檢查是否為數字
        }
        
        let mean = sum / numbers.length;
        
        // 計算標準差 - 多次遍歷陣列
        let variance = 0;
        for (var i = 0; i < numbers.length; i++) {
            variance = variance + Math.pow(numbers[i] - mean, 2);
        }
        variance = variance / numbers.length;
        
        return {
            sum: sum,
            mean: mean,
            variance: variance,
            standardDeviation: Math.sqrt(variance),
            count: numbers.length
        };
    }

    // 格式化結果 - 字串處理可以改進
    formatResult(number) {
        if (typeof number != 'number') return number; // 使用 != 而不是 !==
        
        // 簡單的四捨五入 - 可能有精度問題
        return Math.round(number * Math.pow(10, this.precision)) / Math.pow(10, this.precision);
    }

    // 公用方法但沒有適當的訪問控制
    _internalCalculation(a, b) {
        // 應該是私有方法但使用錯誤的命名慣例
        return a + b * 2;
    }

    // 同步版本 - 可以考慮異步
    performHeavyCalculation(iterations) {
        let result = 0;
        // 可能阻塞 UI 的長時間運算
        for (let i = 0; i < iterations; i++) {
            result += Math.sin(i) * Math.cos(i);
        }
        return result;
    }
}

// 工具函數 - 全域污染
function degreeToRadian(degree) {
    return degree * Math.PI / 180;
}

function radianToDegree(radian) {
    return radian * 180 / Math.PI;
}

// 立即執行函數表達式 - 可能不需要
(function() {
    console.log('Scientific Calculator module loaded');
})();

// 導出 - 混合使用不同的導出方式
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ScientificCalculator;
}

// 也提供全域訪問 - 可能造成名稱衝突
if (typeof window !== 'undefined') {
    window.ScientificCalculator = ScientificCalculator;
    window.degreeToRadian = degreeToRadian;
    window.radianToDegree = radianToDegree;
}