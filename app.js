// Application state
const appState = {
    currentSection: 'dashboard',
    selectedStock: null,
    selectedTimeframe: '1D',
    portfolio: [],
    stockData: {},
    searchCache: {},
    charts: {}
};

// Stock data from JSON
const stocksData = {
    "stocks": [
        {"symbol": "AAPL", "name": "Apple Inc.", "sector": "Technology", "market_cap": "3.64T"},
        {"symbol": "MSFT", "name": "Microsoft Corporation", "sector": "Technology", "market_cap": "3.85T"},
        {"symbol": "NVDA", "name": "NVIDIA Corporation", "sector": "Technology", "market_cap": "4.29T"},
        {"symbol": "GOOGL", "name": "Alphabet Inc.", "sector": "Technology", "market_cap": "3.08T"},
        {"symbol": "AMZN", "name": "Amazon.com Inc.", "sector": "Consumer Discretionary", "market_cap": "2.47T"},
        {"symbol": "META", "name": "Meta Platforms Inc.", "sector": "Technology", "market_cap": "1.96T"},
        {"symbol": "TSLA", "name": "Tesla Inc.", "sector": "Consumer Discretionary", "market_cap": "1.42T"},
        {"symbol": "BRK.B", "name": "Berkshire Hathaway Inc.", "sector": "Financial", "market_cap": "1.06T"},
        {"symbol": "JPM", "name": "JPMorgan Chase & Co.", "sector": "Financial", "market_cap": "866B"},
        {"symbol": "V", "name": "Visa Inc.", "sector": "Financial", "market_cap": "658B"}
    ],
    "technical_indicators": [
        "RSI", "MACD", "EMA_12", "EMA_26", "EMA_50", "EMA_200", 
        "Bollinger_Upper", "Bollinger_Lower", "ATR", "STOCH_K", "STOCH_D",
        "CCI", "Williams_R", "ADX", "Fibonacci_23.6", "Fibonacci_38.2", 
        "Fibonacci_50", "Fibonacci_61.8", "Volume_SMA", "Price_SMA_20"
    ],
    "ml_models": {
        "LSTM": {"accuracy": 0.74, "description": "Long Short-Term Memory neural network"},
        "Random_Forest": {"accuracy": 0.68, "description": "Random Forest regression"},
        "SVM_RBF": {"accuracy": 0.88, "description": "Support Vector Machine with RBF kernel"},
        "XGBoost": {"accuracy": 0.72, "description": "Extreme Gradient Boosting"},
        "Neural_Network": {"accuracy": 0.76, "description": "Deep Neural Network"}
    },
    "market_summary": {
        "total_market_cap": "47.2T",
        "sp500_change": "+0.45%",
        "nasdaq_change": "+0.78%",
        "dow_change": "+0.23%",
        "vix": "16.32",
        "active_stocks": 4127,
        "advancing": 2841,
        "declining": 1286
    }
};

// Utility functions
function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
    }).format(value);
}

function formatLargeNumber(value) {
    const num = parseFloat(value.replace(/[^\d.]/g, ''));
    if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return num.toFixed(2);
}

function generateRandomPrice(base = 150, volatility = 0.02) {
    return base * (1 + (Math.random() - 0.5) * volatility);
}

function generatePriceHistory(days, basePrice = 150) {
    const prices = [];
    let currentPrice = basePrice;
    
    for (let i = 0; i < days; i++) {
        const change = (Math.random() - 0.5) * 0.05;
        currentPrice *= (1 + change);
        prices.push({
            date: new Date(Date.now() - (days - i - 1) * 24 * 60 * 60 * 1000),
            price: currentPrice,
            volume: Math.floor(Math.random() * 10000000) + 1000000
        });
    }
    return prices;
}

function generateTechnicalIndicators() {
    const indicators = {};
    stocksData.technical_indicators.forEach(indicator => {
        indicators[indicator] = (Math.random() * 100).toFixed(2);
    });
    return indicators;
}

function generateMLPredictions(symbol) {
    const predictions = {};
    Object.keys(stocksData.ml_models).forEach(model => {
        const baseAccuracy = stocksData.ml_models[model].accuracy;
        predictions[model] = {
            prediction: Math.random() > 0.5 ? 'Bullish' : 'Bearish',
            confidence: (baseAccuracy * 100 + Math.random() * 10 - 5).toFixed(1),
            targetPrice: generateRandomPrice(200, 0.1).toFixed(2),
            timeframe: '30 days'
        };
    });
    return predictions;
}

// Initialize stock data
function initializeStockData() {
    stocksData.stocks.forEach(stock => {
        const basePrice = Math.random() * 300 + 50;
        appState.stockData[stock.symbol] = {
            ...stock,
            currentPrice: basePrice.toFixed(2),
            change: ((Math.random() - 0.5) * 10).toFixed(2),
            changePercent: ((Math.random() - 0.5) * 5).toFixed(2),
            priceHistory: generatePriceHistory(252, basePrice), // 1 year of data
            technicalIndicators: generateTechnicalIndicators(),
            mlPredictions: generateMLPredictions(stock.symbol)
        };
    });
}

// Navigation functionality
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section');

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            const sectionId = link.dataset.section;
            showSection(sectionId);
            
            // Update active nav link
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            appState.currentSection = sectionId;
        });
    });
}

function showSection(sectionId) {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => section.classList.remove('active'));
    
    const targetSection = document.getElementById(`${sectionId}-section`);
    if (targetSection) {
        targetSection.classList.add('active');
        
        // Initialize section-specific content
        switch(sectionId) {
            case 'dashboard':
                initializeDashboard();
                break;
            case 'analysis':
                initializeAnalysis();
                break;
            case 'predictions':
                initializePredictions();
                break;
            case 'portfolio':
                initializePortfolio();
                break;
            case 'screener':
                initializeScreener();
                break;
            case 'risk':
                initializeRiskAssessment();
                break;
        }
    }
}

// Search functionality
function initializeSearch() {
    const searchInput = document.getElementById('stock-search');
    const searchResults = document.getElementById('search-results');

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        
        if (query.length < 1) {
            searchResults.classList.add('hidden');
            return;
        }

        const filteredStocks = stocksData.stocks.filter(stock => 
            stock.symbol.toLowerCase().includes(query) || 
            stock.name.toLowerCase().includes(query)
        );

        displaySearchResults(filteredStocks, searchResults);
        searchResults.classList.remove('hidden');
    });

    // Hide search results when clicking outside
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.classList.add('hidden');
        }
    });
}

function displaySearchResults(stocks, container) {
    container.innerHTML = stocks.map(stock => `
        <div class="search-result-item" data-symbol="${stock.symbol}">
            <div><strong>${stock.symbol}</strong> - ${stock.name}</div>
            <div style="font-size: 12px; color: var(--color-text-secondary);">${stock.sector}</div>
        </div>
    `).join('');

    // Add click handlers
    container.querySelectorAll('.search-result-item').forEach(item => {
        item.addEventListener('click', () => {
            const symbol = item.dataset.symbol;
            selectStock(symbol);
            container.classList.add('hidden');
            document.getElementById('stock-search').value = '';
        });
    });
}

function selectStock(symbol) {
    appState.selectedStock = symbol;
    showSection('analysis');
    document.querySelector('[data-section="analysis"]').classList.add('active');
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    document.querySelector('[data-section="analysis"]').classList.add('active');
}

// Dashboard initialization
function initializeDashboard() {
    updateMarketSummary();
    updateTopStocksTable();
    
    // Update data periodically
    if (!window.dashboardInterval) {
        window.dashboardInterval = setInterval(() => {
            updateMarketSummary();
            updateTopStocksTable();
        }, 5000);
    }
}

function updateMarketSummary() {
    const summary = stocksData.market_summary;
    
    document.getElementById('total-market-cap').textContent = `$${summary.total_market_cap}`;
    document.getElementById('active-stocks').textContent = summary.active_stocks.toLocaleString();
    document.getElementById('advancing').textContent = summary.advancing.toLocaleString();
    document.getElementById('declining').textContent = summary.declining.toLocaleString();
    document.getElementById('vix-value').textContent = summary.vix;
    
    // Add small random variations to make it look live
    const sp500Change = parseFloat(summary.sp500_change.replace('%', ''));
    const nasdaqChange = parseFloat(summary.nasdaq_change.replace('%', ''));
    const dowChange = parseFloat(summary.dow_change.replace('%', ''));
    
    document.getElementById('sp500-change').textContent = `${sp500Change >= 0 ? '+' : ''}${sp500Change.toFixed(2)}%`;
    document.getElementById('nasdaq-change').textContent = `${nasdaqChange >= 0 ? '+' : ''}${nasdaqChange.toFixed(2)}%`;
    document.getElementById('dow-change').textContent = `${dowChange >= 0 ? '+' : ''}${dowChange.toFixed(2)}%`;
}

function updateTopStocksTable() {
    const tableBody = document.getElementById('top-stocks-table');
    
    const rows = stocksData.stocks.map(stock => {
        const stockInfo = appState.stockData[stock.symbol];
        const changeClass = parseFloat(stockInfo.changePercent) >= 0 ? 'positive' : 'negative';
        
        return `
            <tr class="clickable" data-symbol="${stock.symbol}">
                <td><strong>${stock.symbol}</strong></td>
                <td>${stock.name}</td>
                <td>${stock.sector}</td>
                <td>$${stock.market_cap}</td>
                <td class="currency">$${stockInfo.currentPrice}</td>
                <td class="${changeClass}">
                    ${parseFloat(stockInfo.changePercent) >= 0 ? '+' : ''}${stockInfo.changePercent}%
                    <span style="font-size: 10px;">(${parseFloat(stockInfo.change) >= 0 ? '+' : ''}$${stockInfo.change})</span>
                </td>
            </tr>
        `;
    }).join('');
    
    tableBody.innerHTML = rows;
    
    // Add click handlers
    tableBody.querySelectorAll('tr[data-symbol]').forEach(row => {
        row.addEventListener('click', () => {
            const symbol = row.dataset.symbol;
            selectStock(symbol);
        });
    });
}

// Analysis section
function initializeAnalysis() {
    populateStockSelectors();
    initializeTimeframeButtons();
    
    if (appState.selectedStock) {
        document.getElementById('stock-selector').value = appState.selectedStock;
        loadStockAnalysis(appState.selectedStock);
    }
}

function populateStockSelectors() {
    const selectors = ['stock-selector', 'prediction-stock-selector', 'portfolio-stock-selector'];
    
    selectors.forEach(selectorId => {
        const selector = document.getElementById(selectorId);
        if (selector) {
            selector.innerHTML = '<option value="">Select a stock...</option>' +
                stocksData.stocks.map(stock => 
                    `<option value="${stock.symbol}">${stock.symbol} - ${stock.name}</option>`
                ).join('');
        }
    });

    // Add change handlers
    document.getElementById('stock-selector')?.addEventListener('change', (e) => {
        if (e.target.value) {
            loadStockAnalysis(e.target.value);
        }
    });
}

function initializeTimeframeButtons() {
    const timeframeButtons = document.querySelectorAll('.timeframe-btn');
    
    timeframeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            timeframeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            appState.selectedTimeframe = btn.dataset.timeframe;
            
            if (appState.selectedStock) {
                updatePriceChart(appState.selectedStock, appState.selectedTimeframe);
            }
        });
    });
}

function loadStockAnalysis(symbol) {
    appState.selectedStock = symbol;
    const stock = appState.stockData[symbol];
    
    // Update stock info panel
    document.getElementById('selected-stock-name').textContent = stock.name;
    
    const stockDetails = document.getElementById('stock-details');
    stockDetails.innerHTML = `
        <div class="detail-item">
            <span class="detail-label">Symbol</span>
            <span class="detail-value">${stock.symbol}</span>
        </div>
        <div class="detail-item">
            <span class="detail-label">Sector</span>
            <span class="detail-value">${stock.sector}</span>
        </div>
        <div class="detail-item">
            <span class="detail-label">Market Cap</span>
            <span class="detail-value">$${stock.market_cap}</span>
        </div>
        <div class="detail-item">
            <span class="detail-label">Current Price</span>
            <span class="detail-value currency">$${stock.currentPrice}</span>
        </div>
        <div class="detail-item">
            <span class="detail-label">Change</span>
            <span class="detail-value ${parseFloat(stock.changePercent) >= 0 ? 'positive' : 'negative'}">
                ${parseFloat(stock.changePercent) >= 0 ? '+' : ''}${stock.changePercent}%
            </span>
        </div>
    `;

    // Update technical indicators
    updateTechnicalIndicators(stock.technicalIndicators);
    
    // Update price chart
    updatePriceChart(symbol, appState.selectedTimeframe);
}

function updateTechnicalIndicators(indicators) {
    const container = document.getElementById('technical-indicators');
    
    container.innerHTML = Object.entries(indicators).map(([name, value]) => `
        <div class="indicator-item">
            <span class="indicator-name">${name}</span>
            <span class="indicator-value">${value}</span>
        </div>
    `).join('');
}

function updatePriceChart(symbol, timeframe) {
    const ctx = document.getElementById('price-chart').getContext('2d');
    const stock = appState.stockData[symbol];
    
    // Destroy existing chart
    if (appState.charts.priceChart) {
        appState.charts.priceChart.destroy();
    }
    
    // Get data based on timeframe
    let data = stock.priceHistory;
    const timeframeDays = {
        '1D': 1,
        '5D': 5,
        '1M': 30,
        '3M': 90,
        '1Y': 252
    };
    
    const days = timeframeDays[timeframe] || 30;
    data = data.slice(-days);
    
    appState.charts.priceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(d => d.date.toLocaleDateString()),
            datasets: [{
                label: `${symbol} Price`,
                data: data.map(d => d.price),
                borderColor: '#1FB8CD',
                backgroundColor: 'rgba(31, 184, 205, 0.1)',
                fill: true,
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--color-text')
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(119, 124, 124, 0.1)'
                    },
                    ticks: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--color-text-secondary')
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(119, 124, 124, 0.1)'
                    },
                    ticks: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--color-text-secondary'),
                        callback: function(value) {
                            return '$' + value.toFixed(2);
                        }
                    }
                }
            }
        }
    });
}

// Predictions section
function initializePredictions() {
    const selector = document.getElementById('prediction-stock-selector');
    
    selector.addEventListener('change', (e) => {
        if (e.target.value) {
            loadPredictions(e.target.value);
        }
    });

    if (appState.selectedStock) {
        selector.value = appState.selectedStock;
        loadPredictions(appState.selectedStock);
    }
}

function loadPredictions(symbol) {
    const stock = appState.stockData[symbol];
    const predictions = stock.mlPredictions;
    
    // Update ML models grid
    const modelsGrid = document.getElementById('ml-models-grid');
    modelsGrid.innerHTML = Object.entries(predictions).map(([model, pred]) => {
        const modelInfo = stocksData.ml_models[model];
        const predictionClass = pred.prediction.toLowerCase() === 'bullish' ? 'prediction-bullish' : 
                               pred.prediction.toLowerCase() === 'bearish' ? 'prediction-bearish' : 'prediction-neutral';
        
        return `
            <div class="ml-model-card">
                <div class="model-header">
                    <div class="model-name">${model.replace('_', ' ')}</div>
                    <div class="accuracy-badge">${(modelInfo.accuracy * 100).toFixed(1)}%</div>
                </div>
                <div class="model-description">${modelInfo.description}</div>
                <div class="prediction-metrics">
                    <div class="prediction-metric">
                        <span class="metric-label">Prediction</span>
                        <span class="prediction-value ${predictionClass}">${pred.prediction}</span>
                    </div>
                    <div class="prediction-metric">
                        <span class="metric-label">Target Price</span>
                        <span class="prediction-value">$${pred.targetPrice}</span>
                    </div>
                    <div class="prediction-metric">
                        <span class="metric-label">Timeframe</span>
                        <span class="prediction-value">${pred.timeframe}</span>
                    </div>
                </div>
                <div class="confidence-bar">
                    <div class="confidence-fill" style="width: ${pred.confidence}%"></div>
                </div>
                <div style="text-align: center; margin-top: 8px; font-size: 12px; color: var(--color-text-secondary);">
                    Confidence: ${pred.confidence}%
                </div>
            </div>
        `;
    }).join('');

    // Update predictions chart
    updatePredictionsChart(symbol, predictions);
}

function updatePredictionsChart(symbol, predictions) {
    const ctx = document.getElementById('predictions-chart').getContext('2d');
    
    if (appState.charts.predictionsChart) {
        appState.charts.predictionsChart.destroy();
    }

    const models = Object.keys(predictions);
    const confidences = models.map(model => parseFloat(predictions[model].confidence));
    const targets = models.map(model => parseFloat(predictions[model].targetPrice));
    
    appState.charts.predictionsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: models.map(m => m.replace('_', ' ')),
            datasets: [{
                label: 'Confidence Score',
                data: confidences,
                backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F'],
                borderColor: ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--color-text')
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(119, 124, 124, 0.1)'
                    },
                    ticks: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--color-text-secondary')
                    }
                },
                y: {
                    beginAtZero: true,
                    max: 100,
                    grid: {
                        color: 'rgba(119, 124, 124, 0.1)'
                    },
                    ticks: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--color-text-secondary'),
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            }
        }
    });
}

// Portfolio section
function initializePortfolio() {
    document.getElementById('add-to-portfolio').addEventListener('click', addStockToPortfolio);
    updatePortfolioDisplay();
    updatePortfolioCharts();
}

function addStockToPortfolio() {
    const stockSelector = document.getElementById('portfolio-stock-selector');
    const quantityInput = document.getElementById('stock-quantity');
    
    const symbol = stockSelector.value;
    const quantity = parseInt(quantityInput.value);
    
    if (!symbol || !quantity || quantity <= 0) {
        alert('Please select a stock and enter a valid quantity');
        return;
    }

    const existingIndex = appState.portfolio.findIndex(item => item.symbol === symbol);
    
    if (existingIndex >= 0) {
        appState.portfolio[existingIndex].quantity += quantity;
    } else {
        appState.portfolio.push({
            symbol: symbol,
            quantity: quantity,
            purchasePrice: parseFloat(appState.stockData[symbol].currentPrice)
        });
    }

    // Clear form
    stockSelector.value = '';
    quantityInput.value = '';
    
    updatePortfolioDisplay();
    updatePortfolioCharts();
}

function removeFromPortfolio(symbol) {
    appState.portfolio = appState.portfolio.filter(item => item.symbol !== symbol);
    updatePortfolioDisplay();
    updatePortfolioCharts();
}

function updatePortfolioDisplay() {
    const tableBody = document.getElementById('portfolio-holdings-table');
    
    if (appState.portfolio.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="empty-state">No holdings in portfolio</td></tr>';
        
        // Update portfolio metrics
        document.getElementById('portfolio-total').textContent = '$0.00';
        document.getElementById('portfolio-gain-loss').textContent = '$0.00';
        document.getElementById('portfolio-percentage').textContent = '0.00%';
        return;
    }

    let totalValue = 0;
    let totalCost = 0;

    const rows = appState.portfolio.map(holding => {
        const stock = appState.stockData[holding.symbol];
        const currentPrice = parseFloat(stock.currentPrice);
        const value = holding.quantity * currentPrice;
        const cost = holding.quantity * holding.purchasePrice;
        const gainLoss = value - cost;
        const gainLossPercent = (gainLoss / cost * 100);
        
        totalValue += value;
        totalCost += cost;

        return `
            <tr>
                <td><strong>${holding.symbol}</strong></td>
                <td>${holding.quantity}</td>
                <td class="currency">$${currentPrice.toFixed(2)}</td>
                <td class="currency">$${value.toFixed(2)}</td>
                <td class="${gainLoss >= 0 ? 'positive' : 'negative'} currency">
                    ${gainLoss >= 0 ? '+' : ''}$${gainLoss.toFixed(2)}
                    (${gainLoss >= 0 ? '+' : ''}${gainLossPercent.toFixed(2)}%)
                </td>
                <td>
                    <button class="btn btn--sm btn--outline" onclick="removeFromPortfolio('${holding.symbol}')">
                        Remove
                    </button>
                </td>
            </tr>
        `;
    }).join('');
    
    tableBody.innerHTML = rows;

    // Update portfolio metrics
    const totalGainLoss = totalValue - totalCost;
    const totalPercent = totalCost > 0 ? (totalGainLoss / totalCost * 100) : 0;
    
    document.getElementById('portfolio-total').textContent = formatCurrency(totalValue);
    document.getElementById('portfolio-gain-loss').textContent = 
        `${totalGainLoss >= 0 ? '+' : ''}${formatCurrency(totalGainLoss)}`;
    document.getElementById('portfolio-percentage').textContent = 
        `${totalGainLoss >= 0 ? '+' : ''}${totalPercent.toFixed(2)}%`;
    
    // Apply color classes
    const gainLossElement = document.getElementById('portfolio-gain-loss');
    const percentElement = document.getElementById('portfolio-percentage');
    
    gainLossElement.className = `metric-value ${totalGainLoss >= 0 ? 'positive' : 'negative'}`;
    percentElement.className = `metric-value ${totalGainLoss >= 0 ? 'positive' : 'negative'}`;
}

function updatePortfolioCharts() {
    const ctx = document.getElementById('allocation-chart').getContext('2d');
    
    if (appState.charts.allocationChart) {
        appState.charts.allocationChart.destroy();
    }

    if (appState.portfolio.length === 0) {
        return;
    }

    const data = appState.portfolio.map(holding => {
        const stock = appState.stockData[holding.symbol];
        const value = holding.quantity * parseFloat(stock.currentPrice);
        return {
            label: holding.symbol,
            value: value
        };
    });

    appState.charts.allocationChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: data.map(d => d.label),
            datasets: [{
                data: data.map(d => d.value),
                backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F', '#DB4545', '#D2BA4C', '#964325', '#944454', '#13343B']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--color-text'),
                        padding: 20
                    }
                }
            }
        }
    });
}

// Screener section
function initializeScreener() {
    document.getElementById('apply-filters').addEventListener('click', applyScreenerFilters);
    document.getElementById('clear-filters').addEventListener('click', clearScreenerFilters);
    
    // Show all stocks initially
    displayScreenerResults(stocksData.stocks);
}

function applyScreenerFilters() {
    const sectorFilter = document.getElementById('sector-filter').value;
    const marketCapFilter = document.getElementById('market-cap-filter').value;
    const predictionFilter = document.getElementById('prediction-filter').value;

    let filteredStocks = stocksData.stocks.filter(stock => {
        const stockData = appState.stockData[stock.symbol];
        
        // Sector filter
        if (sectorFilter && stock.sector !== sectorFilter) {
            return false;
        }

        // Market cap filter
        if (marketCapFilter) {
            const marketCapValue = parseFloat(stock.market_cap.replace(/[^\d.]/g, ''));
            const marketCapUnit = stock.market_cap.slice(-1).toUpperCase();
            const marketCapInB = marketCapUnit === 'T' ? marketCapValue * 1000 : marketCapValue;
            
            if (marketCapFilter === 'large' && marketCapInB < 10) return false;
            if (marketCapFilter === 'mid' && (marketCapInB < 2 || marketCapInB > 10)) return false;
            if (marketCapFilter === 'small' && marketCapInB > 2) return false;
        }

        // Prediction filter (simplified)
        if (predictionFilter) {
            const predictions = stockData.mlPredictions;
            const avgPrediction = Object.values(predictions).reduce((acc, pred) => {
                return acc + (pred.prediction === 'Bullish' ? 1 : pred.prediction === 'Bearish' ? -1 : 0);
            }, 0) / Object.keys(predictions).length;
            
            if (predictionFilter === 'bullish' && avgPrediction <= 0.2) return false;
            if (predictionFilter === 'bearish' && avgPrediction >= -0.2) return false;
            if (predictionFilter === 'neutral' && Math.abs(avgPrediction) > 0.2) return false;
        }

        return true;
    });

    displayScreenerResults(filteredStocks);
}

function clearScreenerFilters() {
    document.getElementById('sector-filter').value = '';
    document.getElementById('market-cap-filter').value = '';
    document.getElementById('prediction-filter').value = '';
    
    displayScreenerResults(stocksData.stocks);
}

function displayScreenerResults(stocks) {
    const tableBody = document.getElementById('screener-results-table');
    const resultsCount = document.getElementById('results-count');
    
    resultsCount.textContent = `${stocks.length} stocks found`;

    if (stocks.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="empty-state">No stocks match the current filters</td></tr>';
        return;
    }

    const rows = stocks.map(stock => {
        const stockData = appState.stockData[stock.symbol];
        const predictions = stockData.mlPredictions;
        
        // Calculate average prediction
        const avgConfidence = Object.values(predictions).reduce((acc, pred) => 
            acc + parseFloat(pred.confidence), 0) / Object.keys(predictions).length;
        
        const bullishCount = Object.values(predictions).filter(pred => pred.prediction === 'Bullish').length;
        const bearishCount = Object.values(predictions).filter(pred => pred.prediction === 'Bearish').length;
        
        const overallPrediction = bullishCount > bearishCount ? 'Bullish' : 
                                 bearishCount > bullishCount ? 'Bearish' : 'Neutral';
        
        const predictionClass = overallPrediction.toLowerCase() === 'bullish' ? 'prediction-bullish' : 
                               overallPrediction.toLowerCase() === 'bearish' ? 'prediction-bearish' : 'prediction-neutral';

        return `
            <tr class="clickable" data-symbol="${stock.symbol}">
                <td><strong>${stock.symbol}</strong></td>
                <td>${stock.name}</td>
                <td>${stock.sector}</td>
                <td>$${stock.market_cap}</td>
                <td class="${predictionClass}">${overallPrediction}</td>
                <td>${avgConfidence.toFixed(1)}%</td>
            </tr>
        `;
    }).join('');
    
    tableBody.innerHTML = rows;
    
    // Add click handlers
    tableBody.querySelectorAll('tr[data-symbol]').forEach(row => {
        row.addEventListener('click', () => {
            const symbol = row.dataset.symbol;
            selectStock(symbol);
        });
    });
}

// Risk assessment section
function initializeRiskAssessment() {
    updateRiskMetrics();
    updateRiskChart();
    updateCorrelationMatrix();
}

function updateRiskMetrics() {
    // Simulate risk metrics based on portfolio or random values
    const metrics = {
        beta: (1 + (Math.random() - 0.5) * 0.5).toFixed(2),
        var95: -Math.floor(Math.random() * 5000 + 1000),
        volatility: (Math.random() * 30 + 10).toFixed(1),
        sharpeRatio: (Math.random() * 2 + 0.5).toFixed(2),
        maxDrawdown: -(Math.random() * 20 + 5).toFixed(1)
    };

    document.getElementById('portfolio-beta').textContent = metrics.beta;
    document.getElementById('var-95').textContent = formatCurrency(metrics.var95);
    document.getElementById('volatility').textContent = metrics.volatility + '%';
    document.getElementById('sharpe-ratio').textContent = metrics.sharpeRatio;
    document.getElementById('max-drawdown').textContent = metrics.maxDrawdown + '%';
}

function updateRiskChart() {
    const ctx = document.getElementById('risk-chart').getContext('2d');
    
    if (appState.charts.riskChart) {
        appState.charts.riskChart.destroy();
    }

    // Generate risk distribution data
    const riskLevels = ['Very Low', 'Low', 'Medium', 'High', 'Very High'];
    const riskData = riskLevels.map(() => Math.floor(Math.random() * 30) + 5);

    appState.charts.riskChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: riskLevels,
            datasets: [{
                label: 'Risk Distribution',
                data: riskData,
                backgroundColor: ['#5D878F', '#1FB8CD', '#FFC185', '#B4413C', '#944454'],
                borderColor: ['#5D878F', '#1FB8CD', '#FFC185', '#B4413C', '#944454'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(119, 124, 124, 0.1)'
                    },
                    ticks: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--color-text-secondary')
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(119, 124, 124, 0.1)'
                    },
                    ticks: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--color-text-secondary')
                    }
                }
            }
        }
    });
}

function updateCorrelationMatrix() {
    const matrix = document.getElementById('correlation-matrix');
    const topStocks = stocksData.stocks.slice(0, 5); // Show top 5 stocks
    
    let html = '<div class="correlation-header">Stock</div>';
    topStocks.forEach(stock => {
        html += `<div class="correlation-header">${stock.symbol}</div>`;
    });
    
    topStocks.forEach(stockA => {
        html += `<div class="correlation-header">${stockA.symbol}</div>`;
        
        topStocks.forEach(stockB => {
            const correlation = stockA.symbol === stockB.symbol ? 1.0 : 
                               (Math.random() * 1.8 - 0.9); // -0.9 to 0.9
            
            const intensity = Math.abs(correlation);
            const hue = correlation > 0 ? '120' : '0'; // Green for positive, red for negative
            const backgroundColor = `hsl(${hue}, 70%, ${70 - intensity * 30}%)`;
            
            html += `
                <div class="correlation-cell" style="background-color: ${backgroundColor}">
                    ${correlation.toFixed(2)}
                </div>
            `;
        });
    });
    
    matrix.innerHTML = html;
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeStockData();
    initializeNavigation();
    initializeSearch();
    
    // Show dashboard by default
    showSection('dashboard');
    
    // Make removeFromPortfolio function globally available
    window.removeFromPortfolio = removeFromPortfolio;
});

// Periodic data updates
setInterval(() => {
    // Update stock prices with small random changes
    Object.keys(appState.stockData).forEach(symbol => {
        const stock = appState.stockData[symbol];
        const change = (Math.random() - 0.5) * 0.02; // ±1% change
        const newPrice = parseFloat(stock.currentPrice) * (1 + change);
        
        stock.currentPrice = newPrice.toFixed(2);
        stock.change = (newPrice - parseFloat(stock.currentPrice) + parseFloat(stock.change)).toFixed(2);
        stock.changePercent = ((parseFloat(stock.change) / (newPrice - parseFloat(stock.change))) * 100).toFixed(2);
    });
    
    // Update displays if on relevant sections
    if (appState.currentSection === 'dashboard') {
        updateTopStocksTable();
    } else if (appState.currentSection === 'portfolio') {
        updatePortfolioDisplay();
    }
}, 10000); // Update every 10 seconds