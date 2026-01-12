// State Management
let currentDate = new Date();
let appData = {
    settings: {
        targetCalories: 1200
    },
    records: {}
};
let charts = {}; // Store chart instances
let chartRange = 'week'; // 'week', 'month', 'year'

// DOM Elements
const datePickerInput = document.getElementById('date-picker');
const dateDisplay = document.getElementById('date-display');
const prevDayBtn = document.getElementById('prev-day');
const nextDayBtn = document.getElementById('next-day');

const remainingEl = document.getElementById('remaining-calories');
const targetEl = document.getElementById('target-calories-display');
const intakeEl = document.getElementById('intake-calories');
const burnedEl = document.getElementById('burned-calories');

const weightInput = document.getElementById('weight-input');
const waterTotalEl = document.getElementById('water-total');
const waterBtns = document.querySelectorAll('.water-btn');
const waterCustomInput = document.getElementById('water-custom-input');
const addCustomWaterBtn = document.getElementById('add-custom-water');
const resetWaterBtn = document.querySelector('.reset-water');

const mealListEl = document.getElementById('meal-list');
const exerciseListEl = document.getElementById('exercise-list');

const addMealBtn = document.getElementById('add-meal-btn');
const addExerciseBtn = document.getElementById('add-exercise-btn');
// const openSettingsBtn = document.getElementById('open-settings'); // Removed in new layout

const mealModal = document.getElementById('meal-modal');
const exerciseModal = document.getElementById('exercise-modal');
const settingsModal = document.getElementById('settings-modal');
const overlay = document.getElementById('overlay');
const closeButtons = document.querySelectorAll('.close-modal');

const saveMealBtn = document.getElementById('save-meal');
const saveExerciseBtn = document.getElementById('save-exercise');
const saveSettingsBtn = document.getElementById('save-settings');

// Profile Page Elements
const openSettingsProfileBtn = document.getElementById('open-settings-profile');
const exportDataProfileBtn = document.getElementById('export-data-profile');
const importDataProfileBtn = document.getElementById('import-data-profile');
const importFileInput = document.getElementById('import-file-input');

// AI Settings Elements
const openAiSettingsBtn = document.getElementById('open-ai-settings');
const aiSettingsModal = document.getElementById('ai-settings-modal');
const saveAiSettingsBtn = document.getElementById('save-ai-settings');
const openaiApiKeyInput = document.getElementById('openai-api-key');
const openaiBaseUrlInput = document.getElementById('openai-base-url');
const openaiModelInput = document.getElementById('openai-model');

// AI Plan Elements
const openAiPlanBtn = document.getElementById('open-ai-plan');
const aiPlanModal = document.getElementById('ai-plan-modal');
const aiResultModal = document.getElementById('ai-result-modal');
const startAiAnalysisBtn = document.getElementById('start-ai-analysis');
const saveAiPlanBtn = document.getElementById('save-ai-plan');
const reAnalyzeBtn = document.getElementById('re-analyze-btn');
const aiPlanFormArea = document.getElementById('ai-plan-form-area');
const aiPlanLoading = document.getElementById('ai-plan-loading');

// AI Plan Inputs
const aiGenderInput = document.getElementById('ai-gender');
const aiAgeInput = document.getElementById('ai-age');
const aiHeightInput = document.getElementById('ai-height');
const aiCurrentWeightInput = document.getElementById('ai-current-weight');
const aiActivityInput = document.getElementById('ai-activity');
const aiTargetWeightInput = document.getElementById('ai-target-weight');

// AI Plan Results
const weightLossSlider = document.getElementById('weight-loss-slider');
const weightLossRateDisplay = document.getElementById('weight-loss-rate-display');
const aiRecommendCalories = document.getElementById('ai-recommend-calories');
const aiEstimatedDate = document.getElementById('ai-estimated-date');
const aiAdviceText = document.getElementById('ai-advice-text');

// AI Camera Elements
const scanFoodBtn = document.getElementById('scan-food-btn');
const foodImageInput = document.getElementById('food-image-input');
const aiLoading = document.getElementById('ai-loading');

// Navigation
const navItems = document.querySelectorAll('.nav-item');
const pages = document.querySelectorAll('.page');

// Initialization
function init() {
    loadData();
    initDatePicker();
    updateDateDisplay();
    render();
    setupEventListeners();
}

// Data Persistence
function loadData() {
    const storedData = localStorage.getItem('healthApp_data');
    if (storedData) {
        appData = JSON.parse(storedData);
    }
    // Ensure settings exist
    if (!appData.settings) {
        appData.settings = { targetCalories: 1200 };
    }
    // Ensure AI config structure
    if (!appData.settings.aiConfig) {
        appData.settings.aiConfig = null;
    }
}

function saveData() {
    localStorage.setItem('healthApp_data', JSON.stringify(appData));
    render();
}

// Date Handling
function getFormattedDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

let fpInstance;

function initDatePicker() {
    fpInstance = flatpickr(datePickerInput, {
        locale: "zh",
        dateFormat: "Y-m-d",
        defaultDate: currentDate,
        disableMobile: true, // Force custom UI on mobile
        onChange: function(selectedDates, dateStr, instance) {
            if (selectedDates.length > 0) {
                currentDate = selectedDates[0];
                updateDateDisplay();
                render();
            }
        }
    });
}

function updateDateDisplay() {
    const dateStr = getFormattedDate(currentDate);
    // Update flatpickr without triggering onChange
    if (fpInstance) {
        fpInstance.setDate(currentDate, false);
    }
    
    const todayStr = getFormattedDate(new Date());
    if (dateStr === todayStr) {
        dateDisplay.textContent = "今天";
    } else {
        dateDisplay.textContent = `${currentDate.getMonth() + 1}月${currentDate.getDate()}日`;
    }
}

function changeDate(offset) {
    currentDate.setDate(currentDate.getDate() + offset);
    updateDateDisplay();
    render();
}

// Data Access Helpers
function getCurrentRecord() {
    const dateKey = getFormattedDate(currentDate);
    if (!appData.records[dateKey]) {
        appData.records[dateKey] = {
            weight: null,
            water: 0,
            meals: [],
            exercises: []
        };
    }
    return appData.records[dateKey];
}

// Rendering
function render() {
    const record = getCurrentRecord();
    const target = appData.settings.targetCalories;
    
    // Calculate totals
    const intake = record.meals.reduce((sum, item) => sum + item.calories, 0);
    const burned = record.exercises.reduce((sum, item) => sum + item.calories, 0);
    const remaining = target - intake + burned;

    // Update Dashboard
    if (remainingEl) remainingEl.textContent = remaining;
    if (targetEl) targetEl.textContent = target;
    if (intakeEl) intakeEl.textContent = intake;
    if (burnedEl) burnedEl.textContent = burned;

    // Color coding for remaining calories
    if (remainingEl) {
        if (remaining < 0) {
            remainingEl.style.color = '#ffadad'; // Light red if over limit
        } else {
            remainingEl.style.color = '#fff';
        }
    }

    // Update Weight
    if (weightInput) weightInput.value = record.weight || '';

    // Update Water
    if (waterTotalEl) waterTotalEl.textContent = `${record.water} ml`;

    // Update Lists
    if (mealListEl) renderList(mealListEl, record.meals, 'meal');
    if (exerciseListEl) renderList(exerciseListEl, record.exercises, 'exercise');
}

function renderList(container, items, type) {
    container.innerHTML = '';
    items.forEach((item, index) => {
        const li = document.createElement('li');
        li.className = 'record-item';
        li.innerHTML = `
            <div class="record-info">
                <span class="record-name">${item.name}</span>
                <span class="record-cal">${item.calories} 千卡</span>
            </div>
            <button class="delete-btn" onclick="deleteItem('${type}', ${index})">
                <i class="fas fa-trash-alt"></i>
            </button>
        `;
        container.appendChild(li);
    });
}

// Actions
window.deleteItem = function(type, index) {
    const record = getCurrentRecord();
    if (type === 'meal') {
        record.meals.splice(index, 1);
    } else if (type === 'exercise') {
        record.exercises.splice(index, 1);
    }
    saveData();
};

function addMeal() {
    const name = document.getElementById('meal-name').value;
    const calories = parseInt(document.getElementById('meal-calories').value);
    
    if (name && !isNaN(calories)) {
        const record = getCurrentRecord();
        record.meals.push({ name, calories });
        saveData();
        closeModal(mealModal);
        document.getElementById('meal-name').value = '';
        document.getElementById('meal-calories').value = '';
    } else {
        alert('请输入有效的名称和热量');
    }
}

function addExercise() {
    const name = document.getElementById('exercise-name').value;
    const calories = parseInt(document.getElementById('exercise-calories').value);
    
    if (name && !isNaN(calories)) {
        const record = getCurrentRecord();
        record.exercises.push({ name, calories });
        saveData();
        closeModal(exerciseModal);
        document.getElementById('exercise-name').value = '';
        document.getElementById('exercise-calories').value = '';
    } else {
        alert('请输入有效的名称和热量');
    }
}

function saveSettings() {
    const target = parseInt(document.getElementById('setting-target').value);
    if (!isNaN(target) && target > 0) {
        appData.settings.targetCalories = target;
        saveData();
        closeModal(settingsModal);
    } else {
        alert('请输入有效的目标热量');
    }
}

// AI Functions
function saveAiSettings() {
    const key = openaiApiKeyInput.value.trim();
    const baseUrl = openaiBaseUrlInput.value.trim();
    const model = openaiModelInput.value.trim();
    
    if (!key) {
        alert('请输入 API Key');
        return;
    }
    
    appData.settings.aiConfig = {
        apiKey: key,
        baseUrl: baseUrl.replace(/\/$/, '') || 'https://api.openai.com/v1',
        model: model || 'gpt-4o'
    };
    saveData();
    closeModal(aiSettingsModal);
    alert('AI 配置已保存');
}

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Check for API Key
    if (!appData.settings.aiConfig || !appData.settings.aiConfig.apiKey) {
        alert('请先在“我的”页面配置 AI 识别设置 (API Key)');
        event.target.value = ''; // Reset
        return;
    }

    // Limit file size (e.g., 4MB) to avoid payload issues
    if (file.size > 4 * 1024 * 1024) {
        alert('图片过大，请上传小于 4MB 的图片');
        event.target.value = '';
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const base64Image = e.target.result;
        analyzeFoodImage(base64Image);
    };
    reader.readAsDataURL(file);
    event.target.value = ''; // Reset
}

async function analyzeFoodImage(base64Image) {
    // Show loading
    aiLoading.classList.remove('hidden');
    scanFoodBtn.disabled = true;
    scanFoodBtn.style.opacity = '0.7';

    try {
        const config = appData.settings.aiConfig;
        const modelName = config.model || 'gpt-4o';
        
        const response = await fetch(`${config.baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.apiKey}`
            },
            body: JSON.stringify({
                model: modelName,
                messages: [
                    {
                        role: "user",
                        content: [
                            { type: "text", text: "Identify the food in this image and estimate its calories (kcal). Return ONLY a valid JSON object with no markdown formatting, like {\"name\": \"food name\", \"calories\": 100}. If you cannot identify it, return {\"name\": \"未知食物\", \"calories\": 0}." },
                            { type: "image_url", image_url: { url: base64Image } }
                        ]
                    }
                ],
                max_tokens: 300
            })
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(`API Error: ${response.status} ${errData.error?.message || ''}`);
        }

        const data = await response.json();
        const content = data.choices[0].message.content;
        
        // Parse JSON from content (handle potential markdown code blocks)
        let jsonStr = content.replace(/```json\n?|```/g, '').trim();
        // Sometimes models add extra text, try to find the JSON object
        const jsonStart = jsonStr.indexOf('{');
        const jsonEnd = jsonStr.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1) {
            jsonStr = jsonStr.substring(jsonStart, jsonEnd + 1);
        }

        const result = JSON.parse(jsonStr);

        // Fill inputs
        document.getElementById('meal-name').value = result.name;
        document.getElementById('meal-calories').value = result.calories;

    } catch (error) {
        console.error('AI Analysis Error:', error);
        alert('识别失败，请检查 API Key 或网络连接。\n错误信息: ' + error.message);
    } finally {
        aiLoading.classList.add('hidden');
        scanFoodBtn.disabled = false;
        scanFoodBtn.style.opacity = '1';
    }
}

// Modal Handling
function openModal(modal) {
    modal.classList.remove('hidden');
    overlay.classList.remove('hidden');
}

function closeModal(modal) {
    modal.classList.add('hidden');
    overlay.classList.add('hidden');
}

// Chart Rendering
function renderCharts() {
    const ctxWeight = document.getElementById('weight-chart');
    const ctxCalories = document.getElementById('calories-chart');
    const ctxWater = document.getElementById('water-chart');
    
    // Check if canvas elements exist (in case we are on a page without them, though renderCharts is usually called when active)
    if (!ctxWeight || !ctxCalories || !ctxWater) return;

    let labels = [];
    let weights = [];
    let waters = [];
    let intakes = [];
    let burneds = [];

    const today = new Date();
    
    if (chartRange === 'week' || chartRange === 'month') {
        const days = chartRange === 'week' ? 7 : 30;
        
        for (let i = days - 1; i >= 0; i--) {
            const d = new Date();
            d.setDate(today.getDate() - i);
            const dateStr = getFormattedDate(d);
            
            labels.push(dateStr.substring(5)); // MM-DD
            
            const record = appData.records[dateStr];
            if (record) {
                weights.push(record.weight || null); // Use null for gaps in line chart
                waters.push(record.water || 0);
                intakes.push(record.meals.reduce((s, i) => s + i.calories, 0));
                burneds.push(record.exercises.reduce((s, i) => s + i.calories, 0));
            } else {
                weights.push(null);
                waters.push(0);
                intakes.push(0);
                burneds.push(0);
            }
        }
    } else if (chartRange === 'year') {
        // Last 12 months
        for (let i = 11; i >= 0; i--) {
            const d = new Date();
            d.setMonth(today.getMonth() - i);
            const year = d.getFullYear();
            const month = d.getMonth() + 1;
            const monthKey = `${year}-${String(month).padStart(2, '0')}`;
            
            labels.push(monthKey);
            
            // Aggregate data for this month
            let totalWeight = 0;
            let weightCount = 0;
            let totalWater = 0;
            let totalIntake = 0;
            let totalBurned = 0;
            let daysCount = 0;

            // Find all records matching this month
            Object.keys(appData.records).forEach(date => {
                if (date.startsWith(monthKey)) {
                    const record = appData.records[date];
                    if (record.weight) {
                        totalWeight += record.weight;
                        weightCount++;
                    }
                    totalWater += record.water || 0;
                    totalIntake += record.meals.reduce((s, item) => s + item.calories, 0);
                    totalBurned += record.exercises.reduce((s, item) => s + item.calories, 0);
                    daysCount++;
                }
            });

            weights.push(weightCount > 0 ? (totalWeight / weightCount).toFixed(1) : null);
            // For water/calories in year view, maybe show daily average? Or total? 
            // Let's show Daily Average for the month to keep scale consistent-ish
            const daysInMonth = new Date(year, month, 0).getDate();
            // Actually, showing total might be huge numbers. Let's show Average Daily for that month.
            // But we only have recorded days. Let's divide by recorded days count or days in month?
            // Dividing by days in month makes sense for "how well did I do this month".
            // But if I only recorded 1 day, it skews low. 
            // Let's divide by daysCount (recorded days) to show "Average on recorded days".
            
            waters.push(daysCount > 0 ? Math.round(totalWater / daysCount) : 0);
            intakes.push(daysCount > 0 ? Math.round(totalIntake / daysCount) : 0);
            burneds.push(daysCount > 0 ? Math.round(totalBurned / daysCount) : 0);
        }
    }

    // Weight Chart
    renderChart('weight-chart', 'line', {
        labels: labels,
        datasets: [{
            label: '体重 (kg)',
            data: weights,
            borderColor: '#2a9d8f',
            backgroundColor: '#2a9d8f',
            tension: 0.1,
            fill: false,
            spanGaps: true // Connect points even if there are nulls
        }]
    });

    // Calories Chart
    renderChart('calories-chart', 'bar', {
        labels: labels,
        datasets: [
            {
                label: '摄入',
                data: intakes,
                backgroundColor: '#e76f51'
            },
            {
                label: '消耗',
                data: burneds,
                backgroundColor: '#2a9d8f'
            }
        ]
    });

    // Water Chart
    renderChart('water-chart', 'line', {
        labels: labels,
        datasets: [{
            label: '饮水量 (ml)',
            data: waters,
            borderColor: '#4fc3f7',
            backgroundColor: 'rgba(79, 195, 247, 0.2)',
            fill: true,
            tension: 0.4
        }]
    });
}

function renderChart(canvasId, type, data) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    if (charts[canvasId]) {
        charts[canvasId].destroy();
    }

    charts[canvasId] = new Chart(ctx, {
        type: type,
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        boxWidth: 12,
                        padding: 10
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                }
            },
            scales: {
                y: {
                    beginAtZero: type !== 'line' // Line chart (weight) doesn't need to start at 0
                },
                x: {
                    ticks: {
                        maxTicksLimit: 8, // Limit x-axis labels
                        maxRotation: 0
                    }
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        }
    });
}


// Event Listeners
function setupEventListeners() {
    // Chart Filters
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update UI
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Update State
            chartRange = btn.dataset.range;
            
            // Re-render
            renderCharts();
        });
    });

    // Navigation
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            // Update Nav UI
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            // Switch Page
            const targetId = item.dataset.target;
            pages.forEach(page => {
                page.classList.remove('active');
                if (page.id === targetId) {
                    page.classList.add('active');
                }
            });

            // Specific Page Actions
            if (targetId === 'page-analysis') {
                renderCharts();
            }
        });
    });

    // Date Navigation
    prevDayBtn.addEventListener('click', () => changeDate(-1));
    nextDayBtn.addEventListener('click', () => changeDate(1));
    
    // Flatpickr handles the date picker click now

    // Weight
    weightInput.addEventListener('change', (e) => {
        const val = parseFloat(e.target.value);
        if (!isNaN(val)) {
            getCurrentRecord().weight = val;
            saveData();
        }
    });

    // Water - Fixed Amounts
    waterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const amount = parseInt(btn.dataset.amount);
            getCurrentRecord().water += amount;
            saveData();
        });
    });

    // Water - Custom Amount
    addCustomWaterBtn.addEventListener('click', () => {
        const amount = parseInt(waterCustomInput.value);
        if (!isNaN(amount) && amount > 0) {
            getCurrentRecord().water += amount;
            waterCustomInput.value = '';
            saveData();
        } else {
            alert('请输入有效的饮水量');
        }
    });

    // Water - Reset
    if (resetWaterBtn) {
        resetWaterBtn.addEventListener('click', () => {
            if(confirm('确定要重置今日饮水量吗？')) {
                getCurrentRecord().water = 0;
                saveData();
            }
        });
    }

    // Modals
    addMealBtn.addEventListener('click', () => openModal(mealModal));
    addExerciseBtn.addEventListener('click', () => openModal(exerciseModal));
    
    // Profile Page Actions
    if (openSettingsProfileBtn) {
        openSettingsProfileBtn.addEventListener('click', () => {
            document.getElementById('setting-target').value = appData.settings.targetCalories;
            openModal(settingsModal);
        });
    }

    if (openAiSettingsBtn) {
        openAiSettingsBtn.addEventListener('click', () => {
            if (appData.settings.aiConfig) {
                openaiApiKeyInput.value = appData.settings.aiConfig.apiKey;
                openaiBaseUrlInput.value = appData.settings.aiConfig.baseUrl;
                openaiModelInput.value = appData.settings.aiConfig.model || 'gpt-4o';
            }
            openModal(aiSettingsModal);
        });
    }

    closeButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            closeModal(modal);
        });
    });

    overlay.addEventListener('click', () => {
        document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
        overlay.classList.add('hidden');
    });

    // Save Actions
    saveMealBtn.addEventListener('click', addMeal);
    saveExerciseBtn.addEventListener('click', addExercise);
    saveSettingsBtn.addEventListener('click', saveSettings);
    if (saveAiSettingsBtn) {
        saveAiSettingsBtn.addEventListener('click', saveAiSettings);
    }
    
    // AI Camera
    if (scanFoodBtn) {
        scanFoodBtn.addEventListener('click', () => {
            foodImageInput.click();
        });
    }
    
    if (foodImageInput) {
        foodImageInput.addEventListener('change', handleImageUpload);
    }
    
    // AI Plan
    if (openAiPlanBtn) {
        console.log('AI Plan button found:', openAiPlanBtn);
        openAiPlanBtn.addEventListener('click', () => {
            console.log('AI Plan clicked!');
            // Reset form area visible, loading hidden
            if (aiPlanFormArea) aiPlanFormArea.classList.remove('hidden');
            if (aiPlanLoading) aiPlanLoading.classList.add('hidden');
            
            // Pre-fill current weight if available
            const todayRecord = getCurrentRecord();
            if (todayRecord.weight && aiCurrentWeightInput) {
                aiCurrentWeightInput.value = todayRecord.weight;
            }
            
            openModal(aiPlanModal);
        });
    } else {
        console.error('AI Plan button not found!');
    }
    
    if (startAiAnalysisBtn) {
        startAiAnalysisBtn.addEventListener('click', startAiAnalysis);
    }
    
    if (saveAiPlanBtn) {
        saveAiPlanBtn.addEventListener('click', saveAiPlan);
    }
    
    if (reAnalyzeBtn) {
        reAnalyzeBtn.addEventListener('click', () => {
            // Close result modal and reopen form modal
            closeModal(aiResultModal);
            if (aiPlanLoading) aiPlanLoading.classList.add('hidden');
            openModal(aiPlanModal);
        });
    }
    
    if (weightLossSlider) {
        weightLossSlider.addEventListener('input', updatePlanCalculations);
    }
    
    // Data Export
    if (exportDataProfileBtn) {
        exportDataProfileBtn.addEventListener('click', exportData);
    }
    
    // Data Import
    if (importDataProfileBtn) {
        importDataProfileBtn.addEventListener('click', () => {
            importFileInput.click();
        });
    }
    
    if (importFileInput) {
        importFileInput.addEventListener('change', handleFileImport);
    }
}

// Helper Functions
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Data Management Functions
function exportData() {
    const data = {};
    // Get all data from localStorage
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        data[key] = localStorage.getItem(key);
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `health_record_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            if (confirm('导入数据将覆盖现有的部分记录，确定要继续吗？')) {
                // Import data to localStorage
                Object.keys(data).forEach(key => {
                    localStorage.setItem(key, data[key]);
                });
                
                alert('数据导入成功！页面将刷新。');
                location.reload();
            }
        } catch (error) {
            alert('导入失败：文件格式不正确');
            console.error('Import error:', error);
        }
        // Reset input
        event.target.value = '';
    };
    reader.readAsText(file);
}

// AI Plan Functions
let currentTDEE = 0;
let currentWeightToLose = 0;

async function startAiAnalysis() {
    // Validate inputs
    const gender = aiGenderInput ? aiGenderInput.value : '';
    const age = aiAgeInput ? parseInt(aiAgeInput.value) : 0;
    const height = aiHeightInput ? parseInt(aiHeightInput.value) : 0;
    const currentWeight = aiCurrentWeightInput ? parseFloat(aiCurrentWeightInput.value) : 0;
    const activity = aiActivityInput ? aiActivityInput.value : '';
    const targetWeight = aiTargetWeightInput ? parseFloat(aiTargetWeightInput.value) : 0;
    
    if (!gender || !age || !height || !currentWeight || !activity || !targetWeight) {
        alert('请填写所有信息');
        return;
    }
    
    if (targetWeight >= currentWeight) {
        alert('目标体重需要小于当前体重');
        return;
    }
    
    // Check AI config
    if (!appData.settings.aiConfig || !appData.settings.aiConfig.apiKey) {
        alert('请先在"我的"页面配置 AI 识别设置');
        return;
    }
    
    // Show loading overlay (覆盖在表单上方)
    if (aiPlanLoading) aiPlanLoading.classList.remove('hidden');
    
    try {
        // Calculate TDEE using Mifflin-St Jeor equation
        let bmr;
        if (gender === 'male') {
            bmr = 10 * currentWeight + 6.25 * height - 5 * age + 5;
        } else {
            bmr = 10 * currentWeight + 6.25 * height - 5 * age - 161;
        }
        
        // Activity multiplier
        const activityMultipliers = {
            'sedentary': 1.2,
            'light': 1.375,
            'moderate': 1.55,
            'active': 1.725,
            'very_active': 1.9
        };
        
        currentTDEE = Math.round(bmr * (activityMultipliers[activity] || 1.2));
        currentWeightToLose = currentWeight - targetWeight;
        
        // Call AI for personalized advice
        const config = appData.settings.aiConfig;
        const activityNames = {
            'sedentary': '久坐不动',
            'light': '轻度活动',
            'moderate': '中度活动',
            'active': '高度活动',
            'very_active': '剧烈活动'
        };
        
        const prompt = `作为一名专业营养师，请根据以下用户信息提供简短的减重建议：
- 性别：${gender === 'male' ? '男' : '女'}
- 年龄：${age}岁
- 身高：${height}cm
- 当前体重：${currentWeight}kg
- 目标体重：${targetWeight}kg
- 活动水平：${activityNames[activity]}
- 计算TDEE：${currentTDEE}千卡

请用中文回复，控制在100字以内，给出最关键的饮食和运动建议。`;
        
        const response = await fetch(`${config.baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.apiKey}`
            },
            body: JSON.stringify({
                model: config.model || 'gpt-4o',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 200
            })
        });
        
        let aiAdvice = '保持合理饮食，适量运动，循序渐进达成目标。';
        
        if (response.ok) {
            const data = await response.json();
            aiAdvice = data.choices[0].message.content;
        }
        
        // Update UI
        if (aiAdviceText) aiAdviceText.textContent = aiAdvice;
        if (weightLossSlider) weightLossSlider.value = 0.5; // Default 0.5kg/week
        
        updatePlanCalculations();
        
        // Close form modal and show result modal
        closeModal(aiPlanModal);
        openModal(aiResultModal);
        
    } catch (error) {
        console.error('AI Analysis Error:', error);
        alert('分析失败：' + error.message);
        if (aiPlanLoading) aiPlanLoading.classList.add('hidden');
    }
}

function updatePlanCalculations() {
    const weeklyLoss = weightLossSlider ? parseFloat(weightLossSlider.value) : 0.5;
    
    // Display current rate
    if (weightLossRateDisplay) {
        weightLossRateDisplay.textContent = `${weeklyLoss} 公斤`;
    }
    
    // Calculate daily calorie deficit needed
    // 1kg fat ≈ 7700 kcal
    const dailyDeficit = Math.round((weeklyLoss * 7700) / 7);
    const recommendedCalories = Math.max(1200, currentTDEE - dailyDeficit); // Minimum 1200
    
    if (aiRecommendCalories) {
        aiRecommendCalories.textContent = recommendedCalories;
    }
    
    // Calculate estimated date
    if (currentWeightToLose > 0 && weeklyLoss > 0) {
        const weeksNeeded = currentWeightToLose / weeklyLoss;
        const daysNeeded = Math.ceil(weeksNeeded * 7);
        
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + daysNeeded);
        
        const dateStr = `${targetDate.getFullYear()}年${targetDate.getMonth() + 1}月${targetDate.getDate()}日`;
        
        if (aiEstimatedDate) {
            aiEstimatedDate.textContent = dateStr;
        }
    } else {
        if (aiEstimatedDate) {
            aiEstimatedDate.textContent = weeklyLoss === 0 ? '维持体重' : '-';
        }
    }
}

function saveAiPlan() {
    const recommendedCalories = aiRecommendCalories ? parseInt(aiRecommendCalories.textContent) : 0;
    
    if (recommendedCalories > 0) {
        appData.settings.targetCalories = recommendedCalories;
        saveData();
        closeModal(aiResultModal);
        alert(`已将每日目标热量设置为 ${recommendedCalories} 千卡`);
    }
}

// Start App
init();