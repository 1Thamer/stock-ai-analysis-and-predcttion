// Application State
const appState = {
    currentSection: 'dashboard',
    selectedStock: null,
    selectedPredictionTimeframe: '1M',
    selectedAnalysisTimeframe: '10Y',
    portfolio: [],
    stockData: {},
    charts: {},
    currentModal: null
};

// Stock Data
const stocksData = {
    "stocks": [
        {"symbol": "AAPL", "name": "Apple Inc.", "sector": "Technology", "market_cap": "3.64T", "current_price": 245.50},
        {"symbol": "MSFT", "name": "Microsoft Corporation", "sector": "Technology", "market_cap": "3.85T", "current_price": 517.93},
        {"symbol": "NVDA", "name": "NVIDIA Corporation", "sector": "Technology", "market_cap": "4.29T", "current_price": 176.67},
        {"symbol": "GOOGL", "name": "Alphabet Inc.", "sector": "Technology", "market_cap": "3.08T", "current_price": 254.72},
        {"symbol": "AMZN", "name": "Amazon.com Inc.", "sector": "Consumer Discretionary", "market_cap": "2.47T", "current_price": 231.48},
        {"symbol": "META", "name": "Meta Platforms Inc.", "sector": "Technology", "market_cap": "1.96T", "current_price": 778.38},
        {"symbol": "TSLA", "name": "Tesla Inc.", "sector": "Consumer Discretionary", "market_cap": "1.42T", "current_price": 426.07},
        {"symbol": "BRK.B", "name": "Berkshire Hathaway Inc.", "sector": "Financial", "market_cap": "1.06T", "current_price": 492.85},
        {"symbol": "JPM", "name": "JPMorgan Chase & Co.", "sector": "Financial", "market_cap": "866B", "current_price": 314.78},
        {"symbol": "V", "name": "Visa Inc.", "sector": "Financial", "market_cap": "658B", "current_price": 341.61},
        {"symbol": "UNH", "name": "UnitedHealth Group Inc.", "sector": "Healthcare", "market_cap": "524B", "current_price": 524.12},
        {"symbol": "JNJ", "name": "Johnson & Johnson", "sector": "Healthcare", "market_cap": "378B", "current_price": 162.85},
        {"symbol": "WMT", "name": "Walmart Inc.", "sector": "Consumer Staples", "market_cap": "692B", "current_price": 95.63},
        {"symbol": "MA", "name": "Mastercard Inc.", "sector": "Financial", "market_cap": "413B", "current_price": 527.89},
        {"symbol": "PG", "name": "Procter & Gamble Co.", "sector": "Consumer Staples", "market_cap": "386B", "current_price": 166.34}
    ],
    "ml_models": {
        "LSTM": {
            "accuracy": 0.74,
            "description": "Long Short-Term Memory neural network"
        },
        "Random_Forest": {
            "accuracy": 0.68,
            "description": "Ensemble of decision trees"
        },
        "SVM_RBF": {
            "accuracy": 0.88,
            "description": "Support Vector Machine with RBF kernel"
        },
        "XGBoost": {
            "accuracy": 0.72,
            "description": "Extreme Gradient Boosting"
        },
        "Neural_Network": {
            "accuracy": 0.76,
            "description": "Deep Neural Network"
        },
        "ARIMA": {
            "accuracy": 0.62,
            "description": "Autoregressive model"
        },
        "Prophet": {
            "accuracy": 0.65,
            "description": "Facebook Prophet forecasting"
        },
        "Ensemble": {
            "accuracy": 0.81,
            "description": "Weighted ensemble model"
        }
    },
    "market_summary": {
        "total_market_cap": "52.7T",
        "sp500_change": "+0.45%",
        "nasdaq_change": "+0.78%",
        "dow_change": "+0.23%",
        "vix": "16.32",
        "active_stocks": 5234,
        "advancing": 3456,
        "declining": 1778
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

function generateRandomPrice(base = 150, volatility = 0.02) {
    return base * (1 + (Math.random() - 0.5) * volatility);
}

function generateHistoricalData(days, basePrice = 150) {
    const prices = [];
    let currentPrice = basePrice * (0.3 + Math.random() * 0.4);
    
    for (let i = 0; i < days; i++) {
        const trendFactor = 1 + (0.0002 * Math.random());
        const volatility = (Math.random() - 0.5) * 0.03;
        
        currentPrice = currentPrice * trendFactor * (1 + volatility);
        
        prices.push({
            date: new Date(Date.now() - (days - i - 1) * 24 * 60 * 60 * 1000),
            price: Math.max(currentPrice, 1),
            volume: Math.floor(Math.random() * 50000000) + 1000000
        });
    }
    return prices;
}

function generatePredictions(symbol, timeframe) {
    const predictions = {};
    const timeframeMonths = {
        '1M': 1, '3M': 3, '6M': 6, '1Y': 12, '2Y': 24, '5Y': 60, '10Y': 120
    };
    
    const months = timeframeMonths[timeframe] || 1;
    
    Object.keys(stocksData.ml_models).forEach(model => {
        const modelInfo = stocksData.ml_models[model];
        const baseAccuracy = modelInfo.accuracy;
        
        const timeframePenalty = Math.min(months / 120, 0.3);
        const adjustedAccuracy = baseAccuracy * (1 - timeframePenalty);
        
        const currentPrice = appState.stockData[symbol]?.currentPrice || 150;
        const volatility = 0.3;
        const trend = Math.random() > 0.4 ? 1 : -1;
        const magnitude = Math.random() * volatility;
        
        const targetPrice = currentPrice * (1 + (trend * magnitude));
        const expectedReturn = ((targetPrice - currentPrice) / currentPrice) * 100;
        
        let trendLabel = 'Neutral';
        if (expectedReturn > 20) trendLabel = 'Strongly Bullish';
        else if (expectedReturn > 5) trendLabel = 'Bullish';
        else if (expectedReturn < -20) trendLabel = 'Strongly Bearish';
        else if (expectedReturn < -5) trendLabel = 'Bearish';
        
        predictions[model] = {
            prediction: trendLabel,
            confidence: Math.max((adjustedAccuracy * 100 + Math.random() * 10 - 5), 40).toFixed(1),
            targetPrice: targetPrice.toFixed(2),
            expectedReturn: expectedReturn.toFixed(1),
            timeframe: timeframe,
            riskScore: Math.min((100 - adjustedAccuracy * 100) + (months / 2), 100).toFixed(0)
        };
    });
    return predictions;
}

function calculateHoldingPeriod(purchaseDate) {
    const purchase = new Date(purchaseDate);
    const now = new Date();
    const diffTime = Math.abs(now - purchase);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) return `${diffDays} days`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months`;
    return `${(diffDays / 365).toFixed(1)} years`;
}

// Initialize stock data
function initializeStockData() {
    console.log('Initializing stock data...');
    
    stocksData.stocks.forEach(stock => {
        const basePrice = stock.current_price || (50 + Math.random() * 400);
        const changePercent = (Math.random() - 0.5) * 5;
        const change = basePrice * (changePercent / 100);
        
        appState.stockData[stock.symbol] = {
            ...stock,
            currentPrice: basePrice.toFixed(2),
            change: change.toFixed(2),
            changePercent: changePercent.toFixed(2),
            historicalData: generateHistoricalData(3653, basePrice),
            predictions: {},
            riskMetrics: {
                beta: (0.5 + Math.random() * 1.5).toFixed(2),
                volatility: (10 + Math.random() * 40).toFixed(1),
                sharpeRatio: (0.5 + Math.random() * 2).toFixed(2)
            }
        };
    });
    
    console.log('Stock data initialized:', Object.keys(appState.stockData).length, 'stocks');
}

// Navigation functionality - COMPLETELY FIXED
function initializeNavigation() {
    console.log('Initializing navigation...');
    
    // Force sidebar to be visible
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        sidebar.style.display = 'block';
        sidebar.style.visibility = 'visible';
        sidebar.style.opacity = '1';
        console.log('Sidebar forced to be visible');
    }
    
    const navLinks = document.querySelectorAll('.nav-link');
    console.log('Found navigation links:', navLinks.length);
    
    if (navLinks.length === 0) {
        console.error('No navigation links found! Navigation will not work.');
        return;
    }
    
    // Add click handler to logo for dashboard
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.style.cursor = 'pointer';
        logo.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Logo clicked, going to dashboard');
            showSection('dashboard');
            updateActiveNav('dashboard');
            appState.currentSection = 'dashboard';
        });
    }
    
    // Add click handlers to navigation links with immediate event setup
    navLinks.forEach((link, index) => {
        const sectionId = link.getAttribute('data-section');
        console.log(`Setting up navigation link ${index}: ${sectionId}`);
        
        if (!sectionId) {
            console.warn('Navigation link missing data-section attribute:', link);
            return;
        }
        
        // Remove any existing event listeners
        link.removeEventListener('click', handleNavClick);
        
        // Add new event listener
        function handleNavClick(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('Navigation clicked:', sectionId);
            
            // Update active state immediately
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // Show section
            showSection(sectionId);
            appState.currentSection = sectionId;
        }
        
        link.addEventListener('click', handleNavClick);
        
        // Also add touch event for mobile
        link.addEventListener('touchstart', handleNavClick, { passive: false });
    });
    
    console.log('Navigation initialization complete');
    
    // Ensure dashboard is shown initially
    setTimeout(() => {
        showSection('dashboard');
        updateActiveNav('dashboard');
    }, 100);
}

function updateActiveNav(sectionId) {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-section') === sectionId) {
            link.classList.add('active');
        }
    });
}

function showSection(sectionId) {
    console.log('Showing section:', sectionId);
    
    // Hide all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.classList.remove('active');
        section.style.display = 'none';
    });
    
    // Show target section
    const targetSection = document.getElementById(`${sectionId}-section`);
    if (targetSection) {
        targetSection.style.display = 'block';
        targetSection.classList.add('active');
        console.log('Section shown successfully:', sectionId);
        
        // Initialize section-specific functionality
        setTimeout(() => {
            switch(sectionId) {
                case 'dashboard':
                    initializeDashboard();
                    break;
                case 'analysis':
                    initializeLongTermAnalysis();
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
        }, 50);
    } else {
        console.error('Section not found:', `${sectionId}-section`);
    }
}

// Search functionality - FIXED
function initializeSearch() {
    const searchInput = document.getElementById('stock-search');
    const searchResults = document.getElementById('search-results');

    if (!searchInput || !searchResults) {
        console.warn('Search elements not found');
        return;
    }

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        
        if (query.length < 1) {
            searchResults.classList.add('hidden');
            return;
        }

        const filteredStocks = stocksData.stocks.filter(stock => 
            stock.symbol.toLowerCase().includes(query) || 
            stock.name.toLowerCase().includes(query) ||
            stock.sector.toLowerCase().includes(query)
        );

        displaySearchResults(filteredStocks, searchResults);
        searchResults.classList.remove('hidden');
    });

    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.classList.add('hidden');
        }
    });
}

function displaySearchResults(stocks, container) {
    container.innerHTML = stocks.slice(0, 10).map(stock => {
        const stockData = appState.stockData[stock.symbol];
        return `
            <div class="search-result-item" data-symbol="${stock.symbol}" style="cursor: pointer;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div><strong>${stock.symbol}</strong> - ${stock.name}</div>
                        <div style="font-size: 12px; color: var(--color-text-secondary);">${stock.sector} • $${stockData.currentPrice}</div>
                    </div>
                    <div style="text-align: right;">
                        <div class="${parseFloat(stockData.changePercent) >= 0 ? 'positive' : 'negative'}" style="font-size: 12px;">
                            ${parseFloat(stockData.changePercent) >= 0 ? '+' : ''}${stockData.changePercent}%
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    container.querySelectorAll('.search-result-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const symbol = item.dataset.symbol;
            console.log('Search result clicked:', symbol);
            selectStock(symbol);
            container.classList.add('hidden');
            document.getElementById('stock-search').value = '';
        });
    });
}

function selectStock(symbol) {
    console.log('Selecting stock for analysis:', symbol);
    appState.selectedStock = symbol;
    showSection('analysis');
    updateActiveNav('analysis');
    appState.currentSection = 'analysis';
}

// Dashboard functionality
function initializeDashboard() {
    console.log('Initializing dashboard...');
    updateMarketSummary();
    updateTopStocksTable();
    initializeDashboardFilters();
}

function updateMarketSummary() {
    const summary = stocksData.market_summary;
    
    const elements = {
        'total-market-cap': `$${summary.total_market_cap}`,
        'available-stocks': stocksData.stocks.length,
        'advancing': summary.advancing.toLocaleString(),
        'declining': summary.declining.toLocaleString(),
        'vix-value': summary.vix
    };
    
    Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    });
}

function initializeDashboardFilters() {
    const sectorFilter = document.getElementById('dashboard-sector-filter');
    if (sectorFilter) {
        sectorFilter.addEventListener('change', (e) => {
            updateTopStocksTable(e.target.value);
        });
    }
}

function updateTopStocksTable(sectorFilter = '') {
    const tableBody = document.getElementById('top-stocks-table');
    if (!tableBody) return;
    
    let displayStocks = stocksData.stocks;
    
    if (sectorFilter) {
        displayStocks = displayStocks.filter(stock => stock.sector === sectorFilter);
    }
    
    const rows = displayStocks.map(stock => {
        const stockInfo = appState.stockData[stock.symbol];
        const changeClass = parseFloat(stockInfo.changePercent) >= 0 ? 'positive' : 'negative';
        
        return `
            <tr>
                <td><strong style="cursor: pointer;" data-symbol="${stock.symbol}">${stock.symbol}</strong></td>
                <td>${stock.name}</td>
                <td><span class="sector-tag">${stock.sector}</span></td>
                <td>$${stock.market_cap}</td>
                <td class="currency">$${stockInfo.currentPrice}</td>
                <td class="${changeClass}">
                    ${parseFloat(stockInfo.changePercent) >= 0 ? '+' : ''}${stockInfo.changePercent}%
                </td>
                <td>
                    <button type="button" class="btn btn--sm btn--primary" data-symbol="${stock.symbol}">
                        Analyze
                    </button>
                </td>
            </tr>
        `;
    }).join('');
    
    tableBody.innerHTML = rows;
    
    // Add click handlers to analyze buttons and stock symbols
    tableBody.querySelectorAll('button[data-symbol]').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const symbol = e.target.dataset.symbol;
            console.log('Analyze button clicked for:', symbol);
            selectStock(symbol);
        });
    });
    
    tableBody.querySelectorAll('strong[data-symbol]').forEach(symbol => {
        symbol.addEventListener('click', (e) => {
            e.preventDefault();
            const symbolCode = e.target.dataset.symbol;
            console.log('Stock symbol clicked:', symbolCode);
            selectStock(symbolCode);
        });
    });
}

// Long-term analysis section
function initializeLongTermAnalysis() {
    console.log('Initializing long-term analysis...');
    populateStockSelectors();
    initializeAnalysisTimeframes();
    
    if (appState.selectedStock) {
        const stockSelector = document.getElementById('stock-selector');
        if (stockSelector) {
            stockSelector.value = appState.selectedStock;
            loadLongTermAnalysis(appState.selectedStock);
        }
    }
}

function populateStockSelectors() {
    const selectors = ['stock-selector', 'prediction-stock-selector'];
    
    selectors.forEach(selectorId => {
        const selector = document.getElementById(selectorId);
        if (selector) {
            selector.innerHTML = '<option value="">Select a stock...</option>' +
                stocksData.stocks.map(stock => 
                    `<option value="${stock.symbol}">${stock.symbol} - ${stock.name}</option>`
                ).join('');
        }
    });

    const stockSelector = document.getElementById('stock-selector');
    if (stockSelector) {
        stockSelector.addEventListener('change', (e) => {
            if (e.target.value) {
                loadLongTermAnalysis(e.target.value);
            }
        });
    }
}

function initializeAnalysisTimeframes() {
    const timeframeButtons = document.querySelectorAll('.timeframe-btn');
    const chartTimeframe = document.getElementById('chart-timeframe');
    
    timeframeButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            timeframeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            appState.selectedPredictionTimeframe = btn.dataset.timeframe;
            
            if (appState.selectedStock) {
                updateLongTermPredictions(appState.selectedStock, appState.selectedPredictionTimeframe);
            }
        });
    });

    if (chartTimeframe) {
        chartTimeframe.addEventListener('change', (e) => {
            appState.selectedAnalysisTimeframe = e.target.value;
            if (appState.selectedStock) {
                updateLongTermChart(appState.selectedStock, e.target.value);
            }
        });
    }
}

function loadLongTermAnalysis(symbol) {
    console.log('Loading long-term analysis for:', symbol);
    appState.selectedStock = symbol;
    const stock = appState.stockData[symbol];
    
    if (!stock) {
        console.error('Stock not found:', symbol);
        return;
    }
    
    // Update stock info panel
    const selectedStockName = document.getElementById('selected-stock-name');
    if (selectedStockName) {
        selectedStockName.textContent = stock.name;
    }
    
    const stockDetails = document.getElementById('stock-details');
    if (stockDetails) {
        const currentPrice = parseFloat(stock.currentPrice);
        const change = parseFloat(stock.change);
        const changePercent = parseFloat(stock.changePercent);
        
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
                <span class="detail-value currency">$${currentPrice.toFixed(2)}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Today's Change</span>
                <span class="detail-value ${changePercent >= 0 ? 'positive' : 'negative'}">
                    ${changePercent >= 0 ? '+' : ''}${changePercent}% (${change >= 0 ? '+' : ''}$${change.toFixed(2)})
                </span>
            </div>
        `;
    }

    // Update predictions and charts
    updateLongTermPredictions(symbol, appState.selectedPredictionTimeframe);
    updateLongTermChart(symbol, appState.selectedAnalysisTimeframe);
    updateRiskIndicators(symbol);
}

function updateLongTermPredictions(symbol, timeframe) {
    const predictions = generatePredictions(symbol, timeframe);
    const container = document.getElementById('long-term-predictions');
    
    if (!container) return;
    
    const ensemble = predictions.Ensemble;
    const avgConfidence = Object.values(predictions).reduce((sum, pred) => 
        sum + parseFloat(pred.confidence), 0) / Object.keys(predictions).length;
    
    container.innerHTML = `
        <div class="prediction-summary-item">
            <span class="prediction-label">Ensemble Prediction</span>
            <span class="prediction-value ${ensemble.prediction.toLowerCase().includes('bullish') ? 'prediction-bullish' : 
                ensemble.prediction.toLowerCase().includes('bearish') ? 'prediction-bearish' : 'prediction-neutral'}">
                ${ensemble.prediction}
            </span>
        </div>
        <div class="prediction-summary-item">
            <span class="prediction-label">Target Price (${timeframe})</span>
            <span class="prediction-value">$${ensemble.targetPrice}</span>
        </div>
        <div class="prediction-summary-item">
            <span class="prediction-label">Expected Return</span>
            <span class="prediction-value ${parseFloat(ensemble.expectedReturn) >= 0 ? 'prediction-bullish' : 'prediction-bearish'}">
                ${parseFloat(ensemble.expectedReturn) >= 0 ? '+' : ''}${ensemble.expectedReturn}%
            </span>
        </div>
        <div class="prediction-summary-item">
            <span class="prediction-label">Average Confidence</span>
            <span class="prediction-value">${avgConfidence.toFixed(1)}%</span>
        </div>
    `;
    
    // Store predictions for use in other sections
    appState.stockData[symbol].predictions[timeframe] = predictions;
}

function updateLongTermChart(symbol, timeframe) {
    const ctx = document.getElementById('long-term-chart');
    if (!ctx) return;
    
    const stock = appState.stockData[symbol];
    
    if (appState.charts.longTermChart) {
        appState.charts.longTermChart.destroy();
    }
    
    // Get data based on timeframe
    let data = stock.historicalData;
    const timeframeDays = {
        '1Y': 365, '2Y': 730, '5Y': 1826, '10Y': 3653, 'MAX': data.length
    };
    
    const days = timeframeDays[timeframe] || data.length;
    data = data.slice(-days);
    
    appState.charts.longTermChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(d => d.date.toLocaleDateString()),
            datasets: [{
                label: `${symbol} Price`,
                data: data.map(d => d.price),
                borderColor: '#1FB8CD',
                backgroundColor: 'rgba(31, 184, 205, 0.1)',
                fill: true,
                tension: 0.1,
                pointRadius: 0,
                pointHoverRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--color-text')
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: $${context.parsed.y.toFixed(2)}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(119, 124, 124, 0.1)'
                    },
                    ticks: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--color-text-secondary'),
                        maxTicksLimit: 10
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(119, 124, 124, 0.1)'
                    },
                    ticks: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--color-text-secondary'),
                        callback: function(value) {
                            return '$' + value.toFixed(0);
                        }
                    }
                }
            }
        }
    });
}

function updateRiskIndicators(symbol) {
    const stock = appState.stockData[symbol];
    const risk = stock.riskMetrics;
    const container = document.getElementById('risk-indicators');
    
    if (!container) return;
    
    container.innerHTML = `
        <div class="risk-indicator-item">
            <span class="risk-indicator-label">Beta</span>
            <span class="risk-indicator-value">${risk.beta}</span>
        </div>
        <div class="risk-indicator-item">
            <span class="risk-indicator-label">Volatility</span>
            <span class="risk-indicator-value">${risk.volatility}%</span>
        </div>
        <div class="risk-indicator-item">
            <span class="risk-indicator-label">Sharpe Ratio</span>
            <span class="risk-indicator-value">${risk.sharpeRatio}</span>
        </div>
    `;
}

// Predictions section
function initializePredictions() {
    console.log('Initializing predictions...');
    const selector = document.getElementById('prediction-stock-selector');
    const timeframeButtons = document.querySelectorAll('.pred-timeframe-btn');
    
    if (selector) {
        selector.addEventListener('change', (e) => {
            if (e.target.value) {
                loadPredictions(e.target.value);
            }
        });
    }

    timeframeButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            timeframeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            appState.selectedPredictionTimeframe = btn.dataset.timeframe;
            
            const selectedStock = selector ? selector.value : appState.selectedStock;
            if (selectedStock) {
                loadPredictions(selectedStock);
            }
        });
    });

    if (appState.selectedStock && selector) {
        selector.value = appState.selectedStock;
        loadPredictions(appState.selectedStock);
    }
}

function loadPredictions(symbol) {
    console.log('Loading predictions for:', symbol);
    const predictions = generatePredictions(symbol, appState.selectedPredictionTimeframe);
    
    // Update ML models grid
    const modelsGrid = document.getElementById('enhanced-ml-models-grid');
    if (!modelsGrid) return;
    
    modelsGrid.innerHTML = Object.entries(predictions).map(([model, pred]) => {
        const modelInfo = stocksData.ml_models[model];
        const accuracy = modelInfo.accuracy;
        
        const predictionClass = pred.prediction.toLowerCase().includes('bullish') ? 'prediction-bullish' : 
                               pred.prediction.toLowerCase().includes('bearish') ? 'prediction-bearish' : 'prediction-neutral';
        
        return `
            <div class="ml-model-card">
                <div class="model-header">
                    <div class="model-name">${model.replace('_', ' ')}</div>
                    <div class="accuracy-badge">${(accuracy * 100).toFixed(1)}%</div>
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
                        <span class="metric-label">Expected Return</span>
                        <span class="prediction-value ${parseFloat(pred.expectedReturn) >= 0 ? 'prediction-bullish' : 'prediction-bearish'}">
                            ${parseFloat(pred.expectedReturn) >= 0 ? '+' : ''}${pred.expectedReturn}%
                        </span>
                    </div>
                    <div class="prediction-metric">
                        <span class="metric-label">Risk Score</span>
                        <span class="prediction-value">${pred.riskScore}/100</span>
                    </div>
                </div>
                <div class="confidence-bar">
                    <div class="confidence-fill" style="width: ${pred.confidence}%"></div>
                </div>
                <div style="text-align: center; margin-top: 8px; font-size: 12px; color: var(--color-text-secondary);">
                    Confidence: ${pred.confidence}% • ${appState.selectedPredictionTimeframe} Forecast
                </div>
            </div>
        `;
    }).join('');

    // Update model comparison chart
    updateModelComparisonChart(symbol, predictions);
}

function updateModelComparisonChart(symbol, predictions) {
    const ctx = document.getElementById('model-comparison-chart');
    if (!ctx) return;
    
    if (appState.charts.modelComparisonChart) {
        appState.charts.modelComparisonChart.destroy();
    }

    const models = Object.keys(predictions);
    const confidences = models.map(model => parseFloat(predictions[model].confidence));
    const returns = models.map(model => parseFloat(predictions[model].expectedReturn));
    
    appState.charts.modelComparisonChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Model Predictions',
                data: models.map((model, index) => ({
                    x: confidences[index],
                    y: returns[index],
                    model: model
                })),
                backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F', '#DB4545', '#D2BA4C', '#964325'],
                borderColor: ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F', '#DB4545', '#D2BA4C', '#964325'],
                pointRadius: 8,
                pointHoverRadius: 12
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const point = context.raw;
                            return `${point.model}: ${point.y.toFixed(1)}% return, ${point.x.toFixed(1)}% confidence`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: { display: true, text: 'Confidence (%)' },
                    grid: { color: 'rgba(119, 124, 124, 0.1)' },
                    ticks: { color: getComputedStyle(document.documentElement).getPropertyValue('--color-text-secondary') }
                },
                y: {
                    title: { display: true, text: 'Expected Return (%)' },
                    grid: { color: 'rgba(119, 124, 124, 0.1)' },
                    ticks: { 
                        color: getComputedStyle(document.documentElement).getPropertyValue('--color-text-secondary'),
                        callback: function(value) { return value + '%'; }
                    }
                }
            }
        }
    });
}

// Portfolio Management - WORKING FUNCTIONS
function initializePortfolio() {
    console.log('Initializing portfolio...');
    initializeAddStockModal();
    updatePortfolioDisplay();
    updatePortfolioCharts();
    
    const addStockBtn = document.getElementById('add-stock-btn');
    if (addStockBtn) {
        addStockBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showAddStockModal();
        });
    }
    
    const exportBtn = document.getElementById('export-portfolio');
    if (exportBtn) {
        exportBtn.addEventListener('click', (e) => {
            e.preventDefault();
            exportPortfolio();
        });
    }
}

function initializeAddStockModal() {
    const modal = document.getElementById('add-stock-modal');
    const closeBtn = document.getElementById('close-add-modal');
    const cancelBtn = document.getElementById('cancel-add-stock');
    const confirmBtn = document.getElementById('confirm-add-stock');
    const searchInput = document.getElementById('modal-stock-search');
    const searchResults = document.getElementById('modal-search-results');
    const purchaseDateInput = document.getElementById('purchase-date');
    const purchasePriceInput = document.getElementById('purchase-price');
    const sharesInput = document.getElementById('shares-quantity');
    
    if (!modal) return;
    
    // Set default date to today
    if (purchaseDateInput) {
        purchaseDateInput.value = new Date().toISOString().split('T')[0];
    }
    
    // Modal close handlers
    [closeBtn, cancelBtn].forEach(btn => {
        if (btn) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                hideAddStockModal();
            });
        }
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) hideAddStockModal();
    });
    
    // Stock search in modal
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            if (query.length < 1) {
                if (searchResults) searchResults.classList.add('hidden');
                return;
            }
            
            const filteredStocks = stocksData.stocks.filter(stock => 
                stock.symbol.toLowerCase().includes(query) || 
                stock.name.toLowerCase().includes(query)
            );
            
            displayModalSearchResults(filteredStocks, searchResults);
            if (searchResults) searchResults.classList.remove('hidden');
        });
    }
    
    // Update total investment calculation
    [purchasePriceInput, sharesInput].forEach(input => {
        if (input) {
            input.addEventListener('input', updateTotalInvestment);
        }
    });
    
    // Confirm add stock
    if (confirmBtn) {
        confirmBtn.addEventListener('click', (e) => {
            e.preventDefault();
            confirmAddStock();
        });
    }
}

function showAddStockModal() {
    const modal = document.getElementById('add-stock-modal');
    if (!modal) return;
    
    modal.classList.remove('hidden');
    appState.currentModal = 'add-stock';
    
    // Reset form
    const searchInput = document.getElementById('modal-stock-search');
    const searchResults = document.getElementById('modal-search-results');
    const selectedDisplay = document.getElementById('selected-stock-display');
    const priceInput = document.getElementById('purchase-price');
    const sharesInput = document.getElementById('shares-quantity');
    
    if (searchInput) searchInput.value = '';
    if (searchResults) searchResults.classList.add('hidden');
    if (selectedDisplay) selectedDisplay.innerHTML = '<span>No stock selected</span>';
    if (priceInput) priceInput.value = '';
    if (sharesInput) sharesInput.value = '';
    
    updateTotalInvestment();
}

function hideAddStockModal() {
    const modal = document.getElementById('add-stock-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
    appState.currentModal = null;
}

function displayModalSearchResults(stocks, container) {
    if (!container) return;
    
    container.innerHTML = stocks.slice(0, 8).map(stock => {
        const stockData = appState.stockData[stock.symbol];
        return `
            <div class="search-result-item" data-symbol="${stock.symbol}" style="cursor: pointer;">
                <div><strong>${stock.symbol}</strong> - ${stock.name}</div>
                <div style="font-size: 12px; color: var(--color-text-secondary);">
                    ${stock.sector} • Current: $${stockData.currentPrice}
                </div>
            </div>
        `;
    }).join('');

    container.querySelectorAll('.search-result-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const symbol = item.dataset.symbol;
            selectStockForPortfolio(symbol);
            container.classList.add('hidden');
        });
    });
}

function selectStockForPortfolio(symbol) {
    const stock = appState.stockData[symbol];
    const stockInfo = stocksData.stocks.find(s => s.symbol === symbol);
    const selectedDisplay = document.getElementById('selected-stock-display');
    const priceInput = document.getElementById('purchase-price');
    const searchInput = document.getElementById('modal-stock-search');
    
    if (selectedDisplay) {
        selectedDisplay.innerHTML = `
            <strong>${symbol}</strong> - ${stockInfo.name}
            <br><small>Current Price: $${stock.currentPrice}</small>
        `;
        selectedDisplay.setAttribute('data-selected-symbol', symbol);
    }
    
    // Set current price as default purchase price
    if (priceInput) {
        priceInput.value = stock.currentPrice;
    }
    
    if (searchInput) {
        searchInput.value = `${symbol} - ${stockInfo.name}`;
    }
    
    updateTotalInvestment();
}

function updateTotalInvestment() {
    const priceInput = document.getElementById('purchase-price');
    const sharesInput = document.getElementById('shares-quantity');
    const totalDisplay = document.getElementById('total-investment-display');
    
    if (!priceInput || !sharesInput || !totalDisplay) return;
    
    const price = parseFloat(priceInput.value) || 0;
    const shares = parseInt(sharesInput.value) || 0;
    const total = price * shares;
    
    totalDisplay.textContent = formatCurrency(total);
}

function confirmAddStock() {
    const selectedDisplay = document.getElementById('selected-stock-display');
    const purchaseDateInput = document.getElementById('purchase-date');
    const purchasePriceInput = document.getElementById('purchase-price');
    const sharesInput = document.getElementById('shares-quantity');
    
    if (!selectedDisplay || !purchaseDateInput || !purchasePriceInput || !sharesInput) {
        alert('Required form elements not found');
        return;
    }
    
    const symbol = selectedDisplay.getAttribute('data-selected-symbol');
    const purchaseDate = purchaseDateInput.value;
    const purchasePrice = parseFloat(purchasePriceInput.value);
    const shares = parseInt(sharesInput.value);
    
    if (!symbol || !purchaseDate || !purchasePrice || !shares || shares <= 0) {
        alert('Please select a stock and fill in all fields with valid values');
        return;
    }
    
    // Check if stock exists
    const stockExists = stocksData.stocks.find(s => s.symbol === symbol);
    if (!stockExists) {
        alert('Please select a valid stock from the search results');
        return;
    }
    
    // Add to portfolio
    const newHolding = {
        symbol: symbol,
        purchaseDate: purchaseDate,
        purchasePrice: purchasePrice,
        shares: shares,
        totalCost: purchasePrice * shares,
        id: Date.now()
    };
    
    appState.portfolio.push(newHolding);
    
    // Update displays
    updatePortfolioDisplay();
    updatePortfolioCharts();
    
    hideAddStockModal();
    
    // Show success message
    alert(`Successfully added ${shares} shares of ${symbol} to your portfolio!`);
}

function updatePortfolioDisplay() {
    const tableBody = document.getElementById('enhanced-portfolio-table');
    const holdingsCount = document.getElementById('holdings-count');
    
    if (!tableBody || !holdingsCount) return;
    
    holdingsCount.textContent = `${appState.portfolio.length} positions`;
    
    if (appState.portfolio.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="9" class="empty-state">No holdings in portfolio. Click "Add Stock" to get started.</td></tr>';
        updatePortfolioSummary(0, 0, 0, null);
        return;
    }

    let totalValue = 0;
    let totalCost = 0;
    let bestPerformer = { symbol: '', return: -Infinity };

    const rows = appState.portfolio.map(holding => {
        const stock = appState.stockData[holding.symbol];
        const stockInfo = stocksData.stocks.find(s => s.symbol === holding.symbol);
        const currentPrice = parseFloat(stock.currentPrice);
        const marketValue = holding.shares * currentPrice;
        const gainLoss = marketValue - holding.totalCost;
        const gainLossPercent = (gainLoss / holding.totalCost) * 100;
        const holdingPeriod = calculateHoldingPeriod(holding.purchaseDate);
        
        totalValue += marketValue;
        totalCost += holding.totalCost;
        
        if (gainLossPercent > bestPerformer.return) {
            bestPerformer = { symbol: holding.symbol, return: gainLossPercent };
        }

        return `
            <tr>
                <td>
                    <strong>${holding.symbol}</strong><br>
                    <small style="color: var(--color-text-secondary);">${stockInfo?.name || 'Unknown'}</small>
                </td>
                <td>${holding.shares.toLocaleString()}</td>
                <td class="currency">$${holding.purchasePrice.toFixed(2)}</td>
                <td>${new Date(holding.purchaseDate).toLocaleDateString()}</td>
                <td class="currency">$${currentPrice.toFixed(2)}</td>
                <td class="currency">$${marketValue.toFixed(2)}</td>
                <td class="${gainLoss >= 0 ? 'positive' : 'negative'} currency">
                    ${gainLoss >= 0 ? '+' : ''}$${Math.abs(gainLoss).toFixed(2)}<br>
                    <small>${gainLoss >= 0 ? '+' : ''}${gainLossPercent.toFixed(2)}%</small>
                </td>
                <td>${holdingPeriod}</td>
                <td>
                    <button type="button" class="btn btn--sm btn--outline" onclick="removeFromPortfolio(${holding.id})">
                        Remove
                    </button>
                </td>
            </tr>
        `;
    }).join('');
    
    tableBody.innerHTML = rows;
    updatePortfolioSummary(totalValue, totalCost, totalValue - totalCost, bestPerformer);
}

function updatePortfolioSummary(totalValue, totalCost, totalReturn, bestPerformer) {
    const totalReturnPercent = totalCost > 0 ? (totalReturn / totalCost) * 100 : 0;
    
    const elements = {
        'portfolio-total-value': formatCurrency(totalValue),
        'portfolio-total-invested': formatCurrency(totalCost),
        'portfolio-total-return': `${totalReturn >= 0 ? '+' : ''}${formatCurrency(totalReturn)}`,
        'portfolio-return-percent': `${totalReturn >= 0 ? '+' : ''}${totalReturnPercent.toFixed(2)}%`
    };
    
    Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    });
    
    if (bestPerformer && bestPerformer.symbol) {
        const symbolElement = document.getElementById('best-performer-symbol');
        const returnElement = document.getElementById('best-performer-return');
        if (symbolElement) symbolElement.textContent = bestPerformer.symbol;
        if (returnElement) returnElement.textContent = `+${bestPerformer.return.toFixed(2)}%`;
    } else {
        const symbolElement = document.getElementById('best-performer-symbol');
        const returnElement = document.getElementById('best-performer-return');
        if (symbolElement) symbolElement.textContent = '-';
        if (returnElement) returnElement.textContent = '0.00%';
    }
    
    // Apply color classes
    const returnElement = document.getElementById('portfolio-total-return');
    const percentElement = document.getElementById('portfolio-return-percent');
    
    if (returnElement) {
        returnElement.className = `metric-value ${totalReturn >= 0 ? 'positive' : 'negative'}`;
    }
    if (percentElement) {
        percentElement.className = `metric-change ${totalReturn >= 0 ? 'positive' : 'negative'}`;
    }
}

function updatePortfolioCharts() {
    const ctx = document.getElementById('sector-allocation-chart');
    if (!ctx) return;
    
    if (appState.charts.sectorAllocationChart) {
        appState.charts.sectorAllocationChart.destroy();
    }

    if (appState.portfolio.length === 0) return;

    // Calculate sector allocation
    const sectorData = {};
    let totalPortfolioValue = 0;
    
    appState.portfolio.forEach(holding => {
        const stock = stocksData.stocks.find(s => s.symbol === holding.symbol);
        const currentValue = holding.shares * parseFloat(appState.stockData[holding.symbol].currentPrice);
        
        if (stock && !sectorData[stock.sector]) {
            sectorData[stock.sector] = 0;
        }
        if (stock) {
            sectorData[stock.sector] += currentValue;
            totalPortfolioValue += currentValue;
        }
    });

    const sectors = Object.keys(sectorData);
    const values = sectors.map(sector => sectorData[sector]);

    appState.charts.sectorAllocationChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: sectors,
            datasets: [{
                data: values,
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
                        padding: 15,
                        generateLabels: function(chart) {
                            const data = chart.data;
                            return data.labels.map((label, i) => {
                                const value = data.datasets[0].data[i];
                                const percentage = totalPortfolioValue > 0 ? ((value / totalPortfolioValue) * 100).toFixed(1) : '0.0';
                                return {
                                    text: `${label} (${percentage}%)`,
                                    fillStyle: data.datasets[0].backgroundColor[i],
                                    index: i
                                };
                            });
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.parsed;
                            const percentage = totalPortfolioValue > 0 ? ((value / totalPortfolioValue) * 100).toFixed(1) : '0.0';
                            return `${context.label}: ${formatCurrency(value)} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

function removeFromPortfolio(holdingId) {
    appState.portfolio = appState.portfolio.filter(holding => holding.id !== holdingId);
    updatePortfolioDisplay();
    updatePortfolioCharts();
}

function exportPortfolio() {
    if (appState.portfolio.length === 0) {
        alert('No holdings to export');
        return;
    }
    
    // Create CSV content
    const headers = ['Symbol', 'Company', 'Shares', 'Purchase Price', 'Purchase Date', 'Current Price', 'Market Value', 'Gain/Loss', 'Gain/Loss %', 'Holding Period'];
    
    const rows = appState.portfolio.map(holding => {
        const stock = appState.stockData[holding.symbol];
        const company = stocksData.stocks.find(s => s.symbol === holding.symbol)?.name || '';
        const currentPrice = parseFloat(stock.currentPrice);
        const marketValue = holding.shares * currentPrice;
        const gainLoss = marketValue - holding.totalCost;
        const gainLossPercent = (gainLoss / holding.totalCost) * 100;
        const holdingPeriod = calculateHoldingPeriod(holding.purchaseDate);
        
        return [
            holding.symbol,
            company,
            holding.shares,
            holding.purchasePrice.toFixed(2),
            holding.purchaseDate,
            currentPrice.toFixed(2),
            marketValue.toFixed(2),
            gainLoss.toFixed(2),
            gainLossPercent.toFixed(2) + '%',
            holdingPeriod
        ];
    });
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    
    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portfolio_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

// Screener section - WORKING FUNCTIONS
function initializeScreener() {
    console.log('Initializing screener...');
    populateScreenerFilters();
    displayAllStocks();
    
    const applyBtn = document.getElementById('apply-enhanced-filters');
    const clearBtn = document.getElementById('clear-enhanced-filters');
    
    if (applyBtn) {
        applyBtn.addEventListener('click', (e) => {
            e.preventDefault();
            applyFilters();
        });
    }
    
    if (clearBtn) {
        clearBtn.addEventListener('click', (e) => {
            e.preventDefault();
            clearFilters();
        });
    }
}

function populateScreenerFilters() {
    const sectorFilter = document.getElementById('sector-filter');
    if (!sectorFilter) return;
    
    const sectors = [...new Set(stocksData.stocks.map(s => s.sector))];
    
    sectorFilter.innerHTML = '<option value="">All Sectors</option>' +
        sectors.map(sector => `<option value="${sector}">${sector}</option>`).join('');
}

function displayAllStocks() {
    displayScreenerResults(stocksData.stocks);
}

function applyFilters() {
    console.log('Applying screener filters...');
    
    const sectorFilter = document.getElementById('sector-filter')?.value || '';
    const marketCapFilter = document.getElementById('market-cap-filter')?.value || '';
    const predictionFilter = document.getElementById('long-term-prediction-filter')?.value || '';
    const riskFilter = document.getElementById('risk-filter')?.value || '';

    let filteredStocks = stocksData.stocks.filter(stock => {
        const stockData = appState.stockData[stock.symbol];
        
        // Sector filter
        if (sectorFilter && stock.sector !== sectorFilter) return false;

        // Market cap filter
        if (marketCapFilter) {
            const marketCapValue = parseFloat(stock.market_cap.replace(/[^\d.]/g, ''));
            const marketCapUnit = stock.market_cap.slice(-1).toUpperCase();
            const marketCapInB = marketCapUnit === 'T' ? marketCapValue * 1000 : marketCapValue;
            
            if (marketCapFilter === 'mega' && marketCapInB < 200) return false;
            if (marketCapFilter === 'large' && (marketCapInB < 10 || marketCapInB >= 200)) return false;
            if (marketCapFilter === 'mid' && (marketCapInB < 2 || marketCapInB >= 10)) return false;
            if (marketCapFilter === 'small' && marketCapInB >= 2) return false;
        }

        // Risk filter
        if (riskFilter) {
            const volatility = parseFloat(stockData.riskMetrics.volatility);
            
            if (riskFilter === 'low' && volatility > 20) return false;
            if (riskFilter === 'medium' && (volatility <= 20 || volatility > 35)) return false;
            if (riskFilter === 'high' && volatility <= 35) return false;
        }

        return true;
    });

    console.log('Filtered stocks:', filteredStocks.length);
    displayScreenerResults(filteredStocks);
}

function clearFilters() {
    console.log('Clearing screener filters...');
    
    ['sector-filter', 'market-cap-filter', 'long-term-prediction-filter', 'risk-filter'].forEach(id => {
        const element = document.getElementById(id);
        if (element) element.value = '';
    });
    
    displayAllStocks();
}

function displayScreenerResults(stocks) {
    const tableBody = document.getElementById('enhanced-screener-results');
    const resultsCount = document.getElementById('enhanced-results-count');
    
    if (!tableBody || !resultsCount) return;
    
    resultsCount.textContent = `${stocks.length} stocks found`;

    if (stocks.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="8" class="empty-state">No stocks match the current filters</td></tr>';
        return;
    }

    const rows = stocks.map(stock => {
        const stockData = appState.stockData[stock.symbol];
        const predictions = generatePredictions(stock.symbol, '1Y');
        const ensemble = predictions.Ensemble;
        const riskScore = stockData.riskMetrics.volatility;
        
        const predictionClass = ensemble.prediction.toLowerCase().includes('bullish') ? 'prediction-bullish' : 
                               ensemble.prediction.toLowerCase().includes('bearish') ? 'prediction-bearish' : 'prediction-neutral';

        return `
            <tr>
                <td><strong>${stock.symbol}</strong></td>
                <td>${stock.name}</td>
                <td><span class="sector-tag">${stock.sector}</span></td>
                <td>$${stock.market_cap}</td>
                <td class="currency">$${stockData.currentPrice}</td>
                <td class="${predictionClass}">${ensemble.prediction}</td>
                <td>${riskScore}% volatility</td>
                <td>
                    <button type="button" class="btn btn--sm btn--primary" data-symbol="${stock.symbol}">
                        Analyze
                    </button>
                </td>
            </tr>
        `;
    }).join('');
    
    tableBody.innerHTML = rows;
    
    // Add click handlers to analyze buttons
    tableBody.querySelectorAll('button[data-symbol]').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const symbol = e.target.dataset.symbol;
            console.log('Screener analyze button clicked for:', symbol);
            selectStock(symbol);
        });
    });
}

// Risk assessment section - WORKING FUNCTIONS
function initializeRiskAssessment() {
    console.log('Initializing risk assessment...');
    updateRiskMetrics();
    updateRiskChart();
    updateCorrelationMatrix();
}

function updateRiskMetrics() {
    const betaElement = document.getElementById('enhanced-portfolio-beta');
    const varElement = document.getElementById('enhanced-var-95');
    const sharpeElement = document.getElementById('enhanced-sharpe-ratio');
    const drawdownElement = document.getElementById('enhanced-max-drawdown');
    
    if (appState.portfolio.length === 0) {
        // Show default/example metrics
        if (betaElement) betaElement.textContent = '1.00';
        if (varElement) varElement.textContent = '$0';
        if (sharpeElement) sharpeElement.textContent = '0.00';
        if (drawdownElement) drawdownElement.textContent = '0.0%';
        return;
    }

    // Calculate portfolio metrics based on actual holdings
    let portfolioBeta = 0;
    let totalValue = 0;
    let weightedVolatility = 0;

    appState.portfolio.forEach(holding => {
        const stockData = appState.stockData[holding.symbol];
        const currentValue = holding.shares * parseFloat(stockData.currentPrice);
        const beta = parseFloat(stockData.riskMetrics.beta);
        const volatility = parseFloat(stockData.riskMetrics.volatility);
        
        totalValue += currentValue;
        portfolioBeta += beta * currentValue;
        weightedVolatility += volatility * currentValue;
    });

    if (totalValue > 0) {
        portfolioBeta = portfolioBeta / totalValue;
        weightedVolatility = weightedVolatility / totalValue;
    }

    const var95 = totalValue * (weightedVolatility / 100) * 1.645;
    const sharpeRatio = Math.max(0, 1.5 - (weightedVolatility / 20));
    const maxDrawdown = weightedVolatility * 0.6;

    if (betaElement) betaElement.textContent = portfolioBeta.toFixed(2);
    if (varElement) varElement.textContent = formatCurrency(-var95);
    if (sharpeElement) sharpeElement.textContent = sharpeRatio.toFixed(2);
    if (drawdownElement) drawdownElement.textContent = `-${maxDrawdown.toFixed(1)}%`;
}

function updateRiskChart() {
    const ctx = document.getElementById('enhanced-risk-chart');
    if (!ctx) return;
    
    if (appState.charts.enhancedRiskChart) {
        appState.charts.enhancedRiskChart.destroy();
    }

    const riskLevels = ['Low Risk', 'Medium Risk', 'High Risk'];
    let riskData;

    if (appState.portfolio.length === 0) {
        riskData = [30, 50, 20];
    } else {
        const riskBuckets = { 'Low Risk': 0, 'Medium Risk': 0, 'High Risk': 0 };
        let totalValue = 0;

        appState.portfolio.forEach(holding => {
            const stockData = appState.stockData[holding.symbol];
            const currentValue = holding.shares * parseFloat(stockData.currentPrice);
            const volatility = parseFloat(stockData.riskMetrics.volatility);
            
            if (volatility < 20) riskBuckets['Low Risk'] += currentValue;
            else if (volatility < 35) riskBuckets['Medium Risk'] += currentValue;
            else riskBuckets['High Risk'] += currentValue;
            
            totalValue += currentValue;
        });

        Object.keys(riskBuckets).forEach(risk => {
            riskBuckets[risk] = totalValue > 0 ? (riskBuckets[risk] / totalValue) * 100 : 0;
        });

        riskData = Object.values(riskBuckets);
    }

    appState.charts.enhancedRiskChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: riskLevels,
            datasets: [{
                data: riskData,
                backgroundColor: ['#5D878F', '#FFC185', '#B4413C']
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
                        generateLabels: function(chart) {
                            const data = chart.data;
                            return data.labels.map((label, i) => {
                                const value = data.datasets[0].data[i];
                                return {
                                    text: `${label} (${value.toFixed(1)}%)`,
                                    fillStyle: data.datasets[0].backgroundColor[i],
                                    index: i
                                };
                            });
                        }
                    }
                }
            }
        }
    });
}

function updateCorrelationMatrix() {
    const container = document.getElementById('enhanced-correlation-matrix');
    if (!container) return;
    
    if (appState.portfolio.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--color-text-secondary);">Add stocks to your portfolio to see correlation matrix</p>';
        return;
    }

    const portfolioStocks = [...new Set(appState.portfolio.map(h => h.symbol))].slice(0, 6);
    
    let html = '<div class="correlation-header">Stock</div>';
    portfolioStocks.forEach(symbol => {
        html += `<div class="correlation-header">${symbol}</div>`;
    });
    
    portfolioStocks.forEach(symbolA => {
        html += `<div class="correlation-header">${symbolA}</div>`;
        
        portfolioStocks.forEach(symbolB => {
            let correlation;
            if (symbolA === symbolB) {
                correlation = 1.0;
            } else {
                const stockA = stocksData.stocks.find(s => s.symbol === symbolA);
                const stockB = stocksData.stocks.find(s => s.symbol === symbolB);
                
                if (stockA && stockB && stockA.sector === stockB.sector) {
                    correlation = 0.3 + Math.random() * 0.5;
                } else {
                    correlation = -0.2 + Math.random() * 0.6;
                }
            }
            
            const intensity = Math.abs(correlation);
            const hue = correlation > 0 ? '120' : '0';
            const lightness = 70 - intensity * 30;
            const backgroundColor = `hsl(${hue}, 70%, ${lightness}%)`;
            
            html += `
                <div class="correlation-cell" style="background-color: ${backgroundColor}">
                    ${correlation.toFixed(2)}
                </div>
            `;
        });
    });
    
    container.innerHTML = html;
}

// Initialize the application - COMPLETELY FIXED
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing application...');
    
    // Force critical styles to ensure sidebar is visible
    const style = document.createElement('style');
    style.textContent = `
        .sidebar {
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
            position: fixed !important;
            left: 0 !important;
            width: 240px !important;
            background-color: var(--color-surface) !important;
            z-index: 999 !important;
        }
        .nav-link {
            display: flex !important;
            width: 100% !important;
            cursor: pointer !important;
        }
    `;
    document.head.appendChild(style);
    
    // Initialize stock data first
    initializeStockData();
    
    // Initialize core functionality with delays to ensure proper loading
    setTimeout(() => {
        initializeNavigation();
        initializeSearch();
        
        // Show dashboard by default
        showSection('dashboard');
        
        console.log('Application initialization complete');
    }, 200);
    
    // Make global functions available for onclick handlers
    window.selectStock = selectStock;
    window.removeFromPortfolio = removeFromPortfolio;
    
    // Periodic data updates to simulate live market
    setInterval(() => {
        Object.keys(appState.stockData).forEach(symbol => {
            const stock = appState.stockData[symbol];
            const change = (Math.random() - 0.5) * 0.01;
            const newPrice = parseFloat(stock.currentPrice) * (1 + change);
            
            stock.currentPrice = newPrice.toFixed(2);
            const priceChange = newPrice - (parseFloat(stock.currentPrice) - parseFloat(stock.change));
            stock.change = priceChange.toFixed(2);
            stock.changePercent = ((priceChange / (newPrice - priceChange)) * 100).toFixed(2);
        });
        
        // Update displays if on relevant sections
        if (appState.currentSection === 'dashboard') {
            const sectorFilter = document.getElementById('dashboard-sector-filter');
            updateTopStocksTable(sectorFilter ? sectorFilter.value : '');
        } else if (appState.currentSection === 'portfolio') {
            updatePortfolioDisplay();
        }
    }, 15000);
    
    console.log('AI Stock Platform initialized with', stocksData.stocks.length, 'stocks and full navigation');
});