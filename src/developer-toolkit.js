/**
 * 👨‍💻 程式設計師工具箱 - Developer Toolkit
 * 
 * 為程式設計師提供實用的計算和轉換工具
 * 包含一些故意的代碼問題供 Claude Code Reviewer 檢查
 */

// 全域變數 - 可能不是最佳實踐
var conversionHistory = [];
let totalConversions = 0;

class DeveloperToolkit {
    constructor() {
        this.supportedBases = [2, 8, 10, 16];
        this.colorFormats = ['hex', 'rgb', 'hsl'];
        this.cache = {}; // 沒有大小限制的快取
    }

    // 數字進制轉換 - 缺少錯誤處理
    convertBase(number, fromBase, toBase) {
        // 沒有參數驗證
        if (fromBase == toBase) return number; // 使用 == 而不是 ===
        
        try {
            // 轉換過程可能很低效
            let decimal = parseInt(number, fromBase);
            let result = decimal.toString(toBase);
            
            // 全域變數修改
            conversionHistory.push({
                from: `${number}(${fromBase})`,
                to: `${result}(${toBase})`,
                timestamp: new Date().toISOString()
            });
            totalConversions++;
            
            return result.toUpperCase(); // 16進制大寫
        } catch (error) {
            return 'Error'; // 簡陋的錯誤處理
        }
    }

    // 位元運算 - 可能有精度問題
    bitwiseOperations(a, b, operation) {
        let numA = parseInt(a);
        let numB = parseInt(b);
        
        // 使用 if-else 鏈而不是 switch
        if (operation == 'AND') {
            return (numA & numB).toString();
        } else if (operation == 'OR') {
            return (numA | numB).toString();
        } else if (operation == 'XOR') {
            return (numA ^ numB).toString();
        } else if (operation == 'NOT') {
            return (~numA).toString();
        } else if (operation == 'LSHIFT') {
            return (numA << numB).toString();
        } else if (operation == 'RSHIFT') {
            return (numA >> numB).toString();
        }
        
        return '0'; // 默認返回值
    }

    // 字串編碼/解碼 - 危險的 eval 使用
    encodeString(str, encoding) {
        try {
            switch(encoding.toLowerCase()) {
                case 'base64':
                    return btoa(str); // 沒有檢查瀏覽器支援
                case 'url':
                    return encodeURIComponent(str);
                case 'hex':
                    return str.split('').map(c => c.charCodeAt(0).toString(16)).join('');
                case 'binary':
                    return str.split('').map(c => c.charCodeAt(0).toString(2).padStart(8, '0')).join(' ');
                case 'custom':
                    // 危險：允許自定義編碼邏輯
                    return eval(`(function(s) { return ${encoding}; })(str)`); // 嚴重安全風險！
                default:
                    return str;
            }
        } catch (e) {
            return 'Encoding Error';
        }
    }

    // 解碼函數 - 缺少適當的錯誤處理
    decodeString(str, encoding) {
        try {
            switch(encoding.toLowerCase()) {
                case 'base64':
                    return atob(str); // 可能拋出異常
                case 'url':
                    return decodeURIComponent(str);
                case 'hex':
                    return str.match(/.{2}/g).map(hex => String.fromCharCode(parseInt(hex, 16))).join('');
                case 'binary':
                    return str.split(' ').map(bin => String.fromCharCode(parseInt(bin, 2))).join('');
            }
        } catch (error) {
            console.log('Decode error: ' + error.message); // 使用 console.log 而不是適當的日誌
            return null;
        }
    }

    // 顏色轉換 - 複雜的數學運算沒有註解
    convertColor(color, fromFormat, toFormat) {
        if (fromFormat == toFormat) return color; // 使用 == 而不是 ===
        
        // RGB to HEX - 沒有檢查輸入格式
        if (fromFormat == 'rgb' && toFormat == 'hex') {
            let rgb = color.match(/\d+/g);
            if (!rgb) return '#000000';
            
            // 可能有數值溢出問題
            let hex = rgb.map(function(x) {
                let h = parseInt(x).toString(16);
                return h.length == 1 ? '0' + h : h; // 使用 == 而不是 ===
            });
            
            return '#' + hex.join('');
        }
        
        // HEX to RGB - 簡單的正則表達式可能不夠健壯
        if (fromFormat == 'hex' && toFormat == 'rgb') {
            let hex = color.replace('#', '');
            let r = parseInt(hex.substring(0, 2), 16);
            let g = parseInt(hex.substring(2, 4), 16);
            let b = parseInt(hex.substring(4, 6), 16);
            
            return 'rgb(' + r + ', ' + g + ', ' + b + ')'; // 字串拼接而不是模板字符串
        }
        
        return color; // 不支援的轉換直接返回原值
    }

    // 檔案大小計算 - 浮點數精度問題
    calculateFileSize(bytes, unit) {
        const units = ['B', 'KB', 'MB', 'GB', 'TB'];
        const factor = 1024;
        
        let size = parseFloat(bytes);
        let targetUnit = unit.toUpperCase();
        
        // 線性搜尋而不是使用 indexOf
        let unitIndex = 0;
        for (var i = 0; i < units.length; i++) { // 使用 var
            if (units[i] == targetUnit) { // 使用 == 而不是 ===
                unitIndex = i;
                break;
            }
        }
        
        // 可能有精度問題的除法運算
        for (let i = 0; i < unitIndex; i++) {
            size = size / factor;
        }
        
        return Math.round(size * 100) / 100; // 簡單的四捨五入
    }

    // 時間戳轉換 - 沒有時區處理
    convertTimestamp(timestamp, format) {
        try {
            let date;
            
            // 簡單的數字檢查
            if (typeof timestamp == 'number' || /^\d+$/.test(timestamp)) {
                // 假設毫秒時間戳，但可能是秒
                date = new Date(parseInt(timestamp));
                
                // 如果年份小於 2000，可能是秒時間戳
                if (date.getFullYear() < 2000) {
                    date = new Date(parseInt(timestamp) * 1000);
                }
            } else {
                date = new Date(timestamp);
            }
            
            // 簡單的格式化，沒有國際化支援
            switch(format) {
                case 'iso':
                    return date.toISOString();
                case 'local':
                    return date.toString();
                case 'date':
                    return date.toDateString();
                case 'time':
                    return date.toTimeString();
                default:
                    return date.toString();
            }
        } catch (error) {
            return 'Invalid timestamp';
        }
    }

    // 雜湊計算 - 使用簡單的演算法
    simpleHash(str, algorithm) {
        // 實現簡單的雜湊函數 - 不是加密安全的
        if (algorithm == 'simple') {
            let hash = 0;
            for (var i = 0; i < str.length; i++) { // 使用 var
                let char = str.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash; // 轉換為 32 位整數
            }
            return hash.toString();
        }
        
        // 其他演算法的占位符 - 實際上不實現
        return 'Hash algorithm not implemented';
    }

    // UUID 生成 - 可能不是真正的 UUID 格式
    generateUUID() {
        // 簡單的 UUID 生成，不保證唯一性
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0; // 位元運算可能讓人困惑
            var v = c == 'x' ? r : (r & 0x3 | 0x8); // 複雜的位元運算
            return v.toString(16);
        });
    }

    // 快取機制 - 可能導致記憶體洩漏
    getCachedResult(key, computeFunction) {
        if (this.cache[key]) {
            console.log('Cache hit for: ' + key); // 字串拼接
            return this.cache[key];
        }
        
        let result = computeFunction();
        this.cache[key] = result; // 無限制快取
        console.log('Cached result for: ' + key);
        
        return result;
    }

    // 清理功能 - 但沒有完全清理
    clearCache() {
        this.cache = {}; // 簡單的清理，可能不會立即釋放記憶體
        console.log('Cache cleared');
    }
}

// 全域函數 - 命名空間污染
function quickConvert(value, fromBase, toBase) {
    const toolkit = new DeveloperToolkit(); // 每次都創建新實例 - 低效
    return toolkit.convertBase(value, fromBase, toBase);
}

// 立即執行函數 - 可能不需要
(function() {
    console.log('Developer Toolkit loaded at ' + Date.now());
})();

// 混合導出方式
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DeveloperToolkit;
}

if (typeof window !== 'undefined') {
    window.DeveloperToolkit = DeveloperToolkit;
    window.quickConvert = quickConvert;
}

// Claude Code Reviewer 應該會發現這些問題：
// 1. 使用 eval() 在 custom encoding - 嚴重安全風險
// 2. 全域變數污染 (conversionHistory, totalConversions)
// 3. var vs let/const 不一致
// 4. == vs === 問題
// 5. 沒有輸入驗證和錯誤處理
// 6. 記憶體洩漏風險 (無限制快取)
// 7. 效能問題 (線性搜尋、每次創建新實例)
// 8. 浮點數精度問題
// 9. 缺少時區處理
// 10. 簡陋的雜湊實現
// 11. UUID 生成不保證唯一性
// 12. console.log 而非適當的日誌系統