// 🤖 Claude Code Reviewer 測試文件
// 這個文件故意包含一些可以改進的地方，供 Claude 審查

function calculateSum(numbers) {
    // 可能的問題: 沒有參數驗證
    let sum = 0;
    for (let i = 0; i < numbers.length; i++) {
        sum += numbers[i];
    }
    return sum;
}

function processUserData(userData) {
    // 可能的安全問題: 沒有輸入清理
    const result = {
        name: userData.name,
        email: userData.email,
        // 可能的問題: 直接使用用戶輸入
        html: '<div>' + userData.message + '</div>'
    };
    
    // 性能問題: 同步處理可能很慢
    return JSON.stringify(result);
}

class UserManager {
    constructor() {
        this.users = [];
    }
    
    // 可能的問題: 沒有錯誤處理
    async addUser(user) {
        this.users.push(user);
        // 沒有返回值
    }
    
    // 可能的問題: 線性搜索效率不高
    findUser(id) {
        for (let user of this.users) {
            if (user.id == id) { // 使用 == 而非 ===
                return user;
            }
        }
        return null;
    }
}

// 全局變量 - 可能不是最佳實踐
let globalCounter = 0;

// 導出
module.exports = {
    calculateSum,
    processUserData,
    UserManager
};

// Claude 應該會指出以下問題:
// 1. 缺少輸入驗證
// 2. XSS 安全風險
// 3. 性能問題 (線性搜索)
// 4. 使用 == 而非 ===
// 5. 全局變量的使用
// 6. 缺少錯誤處理
// 7. 可以使用現代 ES6+ 特性