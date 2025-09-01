class CurrencyConverter {
    constructor() {
        this.rates = {};
        this.baseCurrency = 'USD';
        this.lastUpdate = null;
        this.apiKey = null; // 可以設置 API key
        this.supportedCurrencies = [
            { code: 'USD', name: '美元', symbol: '$' },
            { code: 'EUR', name: '歐元', symbol: '€' },
            { code: 'GBP', name: '英鎊', symbol: '£' },
            { code: 'JPY', name: '日元', symbol: '¥' },
            { code: 'CNY', name: '人民幣', symbol: '¥' },
            { code: 'KRW', name: '韓元', symbol: '₩' },
            { code: 'TWD', name: '台幣', symbol: 'NT$' },
            { code: 'HKD', name: '港幣', symbol: 'HK$' },
            { code: 'SGD', name: '新加坡元', symbol: 'S$' },
            { code: 'AUD', name: '澳幣', symbol: 'A$' }
        ];
        this.initializeRates();
    }

    async initializeRates() {
        await this.fetchExchangeRates();
        // 每5分鐘更新一次匯率
        setInterval(() => this.fetchExchangeRates(), 5 * 60 * 1000);
    }

    async fetchExchangeRates() {
        try {
            // 使用免費的匯率API (exchangerate-api.com)
            const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${this.baseCurrency}`);
            const data = await response.json();
            
            if (data && data.rates) {
                this.rates = data.rates;
                this.lastUpdate = new Date();
                console.log('💱 匯率數據已更新:', this.lastUpdate.toLocaleString());
                this.updateUI();
                return true;
            }
        } catch (error) {
            console.error('獲取匯率失敗，使用備用數據:', error);
            // 使用備用匯率數據
            this.setFallbackRates();
            return false;
        }
    }

    setFallbackRates() {
        // 備用匯率數據 (相對於 USD)
        this.rates = {
            USD: 1.0,
            EUR: 0.85,
            GBP: 0.73,
            JPY: 110.0,
            CNY: 6.45,
            KRW: 1180.0,
            TWD: 28.0,
            HKD: 7.8,
            SGD: 1.35,
            AUD: 1.35,
            CAD: 1.25
        };
        this.lastUpdate = new Date();
        console.log('💱 使用備用匯率數據');
    }

    convert(amount, fromCurrency, toCurrency) {
        if (!this.rates[fromCurrency] || !this.rates[toCurrency]) {
            throw new Error('不支援的貨幣');
        }

        // 先轉換為基礎貨幣 (USD)，再轉換為目標貨幣
        const usdAmount = amount / this.rates[fromCurrency];
        const convertedAmount = usdAmount * this.rates[toCurrency];
        
        return Math.round(convertedAmount * 10000) / 10000; // 四位小數
    }

    getCurrencyInfo(code) {
        return this.supportedCurrencies.find(currency => currency.code === code);
    }

    formatCurrency(amount, currencyCode) {
        const currencyInfo = this.getCurrencyInfo(currencyCode);
        if (!currencyInfo) return `${amount} ${currencyCode}`;

        const formattedAmount = amount.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 4
        });

        return `${currencyInfo.symbol}${formattedAmount}`;
    }

    getLastUpdateTime() {
        if (!this.lastUpdate) return '未更新';
        return this.lastUpdate.toLocaleString('zh-TW', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    updateUI() {
        // 更新 UI 上的匯率信息
        const updateElement = document.getElementById('rate-update-time');
        if (updateElement) {
            updateElement.textContent = this.getLastUpdateTime();
        }

        // 觸發匯率更新事件
        const event = new CustomEvent('ratesUpdated', {
            detail: { rates: this.rates, lastUpdate: this.lastUpdate }
        });
        document.dispatchEvent(event);
    }

    // 獲取熱門貨幣對的匯率
    getPopularRates() {
        const popular = [
            { from: 'USD', to: 'TWD' },
            { from: 'USD', to: 'CNY' },
            { from: 'EUR', to: 'USD' },
            { from: 'JPY', to: 'USD' },
            { from: 'GBP', to: 'USD' }
        ];

        return popular.map(pair => {
            try {
                const rate = this.convert(1, pair.from, pair.to);
                return {
                    from: pair.from,
                    to: pair.to,
                    rate: rate,
                    formatted: `1 ${pair.from} = ${this.formatCurrency(rate, pair.to)}`
                };
            } catch (error) {
                return {
                    from: pair.from,
                    to: pair.to,
                    rate: null,
                    formatted: '無法取得'
                };
            }
        });
    }
}

// 全域變數
let currencyConverter = null;

// 初始化貨幣轉換器
function initializeCurrency() {
    currencyConverter = new CurrencyConverter();
    setupCurrencyUI();
}

function setupCurrencyUI() {
    // 填充貨幣選項
    const fromSelect = document.getElementById('currency-from');
    const toSelect = document.getElementById('currency-to');
    
    if (fromSelect && toSelect) {
        currencyConverter.supportedCurrencies.forEach(currency => {
            const option1 = new Option(`${currency.code} - ${currency.name}`, currency.code);
            const option2 = new Option(`${currency.code} - ${currency.name}`, currency.code);
            fromSelect.add(option1);
            toSelect.add(option2);
        });

        // 設置預設值
        fromSelect.value = 'USD';
        toSelect.value = 'TWD';
    }
}

function convertCurrency() {
    if (!currencyConverter) return;

    try {
        const amount = parseFloat(document.getElementById('currency-amount').value);
        const fromCurrency = document.getElementById('currency-from').value;
        const toCurrency = document.getElementById('currency-to').value;

        if (isNaN(amount) || amount <= 0) {
            document.getElementById('conversion-result').textContent = '請輸入有效金額';
            return;
        }

        const result = currencyConverter.convert(amount, fromCurrency, toCurrency);
        const formattedResult = currencyConverter.formatCurrency(result, toCurrency);
        
        document.getElementById('conversion-result').innerHTML = 
            `<strong>${currencyConverter.formatCurrency(amount, fromCurrency)}</strong> = <strong>${formattedResult}</strong>`;

        // 記錄轉換歷史
        console.log(`💱 匯率轉換: ${amount} ${fromCurrency} → ${result} ${toCurrency}`);
        
    } catch (error) {
        document.getElementById('conversion-result').textContent = '轉換失敗: ' + error.message;
        console.error('匯率轉換錯誤:', error);
    }
}

function swapCurrencies() {
    const fromSelect = document.getElementById('currency-from');
    const toSelect = document.getElementById('currency-to');
    
    const temp = fromSelect.value;
    fromSelect.value = toSelect.value;
    toSelect.value = temp;
    
    // 重新計算
    convertCurrency();
}

function showPopularRates() {
    if (!currencyConverter) return;

    const popularRates = currencyConverter.getPopularRates();
    const container = document.getElementById('popular-rates');
    
    if (container) {
        container.innerHTML = popularRates.map(rate => 
            `<div class="rate-item">${rate.formatted}</div>`
        ).join('');
    }
}

// 自動初始化
document.addEventListener('DOMContentLoaded', function() {
    // 延遲初始化，確保其他元素已載入
    setTimeout(initializeCurrency, 100);
});

// 監聽匯率更新事件
document.addEventListener('ratesUpdated', function(event) {
    showPopularRates();
    console.log('🔄 UI 已更新匯率數據');
});

// 導出供其他模組使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CurrencyConverter };
}