// Global variables
let charts = {
    userActivity: null,
    resourceUsage: null,
    errorRate: null,
    dbGrowth: null
};

// Check authentication before initializing
document.addEventListener('DOMContentLoaded', async () => {
    try {
        if (!isAuthenticated()) {
            redirectToLogin('Please log in to access the admin portal');
            return;
        }

        // Verify token is still valid
        const response = await fetch('/api/admin/stats', {
            headers: getAuthHeaders()
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                redirectToLogin('Session expired. Please log in again');
                return;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        await initializeAdminPortal();
    } catch (error) {
        console.error('Initialization error:', error);
        redirectToLogin('Authentication failed. Please log in again');
    }
});

// Authentication check
function isAuthenticated() {
    const token = localStorage.getItem('adminToken');
    if (!token) return false;
    
    // Check if token is expired
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp * 1000 < Date.now()) {
            localStorage.removeItem('adminToken');
            return false;
        }
        return true;
    } catch (error) {
        localStorage.removeItem('adminToken');
        return false;
    }
}

// Redirect to login page
function redirectToLogin(message = null) {
    localStorage.removeItem('adminToken');
    if (message) {
        // Store message to show after redirect
        sessionStorage.setItem('loginMessage', message);
    }
    window.location.href = '/admin/login';
}

// Get auth headers
function getAuthHeaders() {
    return {
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        'Content-Type': 'application/json'
    };
}

// Initialize the admin portal
async function initializeAdminPortal() {
    try {
        // Load initial data
        await Promise.all([
            loadSystemStats(),
            loadLogs(),
            loadBackupHistory(),
            loadUserList()
        ]);

        // Initialize charts if we're on the analytics tab
        if (document.querySelector('#analytics.active')) {
            await initializeCharts();
        }

        // Set up auto-refresh for system stats
        setInterval(loadSystemStats, 30000); // Refresh every 30 seconds

        // Initialize event listeners
        setupEventListeners();
    } catch (error) {
        handleApiError(error);
    }
}

// Tab switching
async function switchTab(tabId) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });

    // Show selected section
    document.getElementById(tabId).classList.add('active');

    // Update nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[href="#${tabId}"]`).classList.add('active');

    // Initialize charts if switching to analytics tab
    if (tabId === 'analytics') {
        try {
            await initializeCharts();
        } catch (error) {
            console.error('Failed to initialize charts:', error);
            showNotification('Failed to initialize charts: ' + error.message, 'error');
        }
    }

    // Refresh data for the selected tab
    switch (tabId) {
        case 'dashboard':
            loadSystemStats();
            break;
        case 'logs':
            loadLogs();
            break;
        case 'backup':
            loadBackupHistory();
            break;
        case 'users':
            loadUserList();
            break;
    }
}

// System Stats
async function loadSystemStats() {
    try {
        const response = await fetch('/api/admin/stats', {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const stats = await response.json();

        document.getElementById('totalUsers').textContent = stats.totalUsers;
        document.getElementById('dbSize').textContent = formatBytes(stats.dbSize);
        document.getElementById('systemUptime').textContent = formatUptime(stats.uptime);
        document.getElementById('memoryUsage').textContent = formatBytes(stats.memoryUsage.heapUsed);
    } catch (error) {
        handleApiError(error);
    }
}

// Logs Management
async function loadLogs() {
    try {
        const level = document.getElementById('logLevel').value;
        const date = document.getElementById('logDate').value;
        
        // Build query parameters
        const params = new URLSearchParams();
        if (level !== 'all') {
            params.append('level', level);
        }
        if (date) {
            // Convert date to ISO string and get just the date part
            const formattedDate = new Date(date).toISOString().split('T')[0];
            params.append('date', formattedDate);
        }
        
        const queryString = params.toString();
        const url = `/api/admin/logs${queryString ? `?${queryString}` : ''}`;
        
        const response = await fetch(url, {
            headers: getAuthHeaders()
        });
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const logs = await response.json();
        
        const logContent = document.getElementById('logContent');
        if (logs.length === 0) {
            logContent.innerHTML = '<tr><td colspan="4">No logs found for the selected filters</td></tr>';
            return;
        }
        
        logContent.innerHTML = formatLogs(logs);
    } catch (error) {
        handleApiError(error);
        document.getElementById('logContent').innerHTML = '<tr><td colspan="4">Error loading logs: ' + error.message + '</td></tr>';
    }
}

function formatLogs(logs) {
    return logs.map(log => {
        const timestamp = new Date(log.timestamp).toLocaleString();
        const level = log.level.toUpperCase();
        const levelClass = getLevelClass(log.level);
        let details = '';
        
        if (log.details) {
            if (typeof log.details === 'string') {
                details = log.details;
            } else {
                const formattedDetails = [];
                for (const [key, value] of Object.entries(log.details)) {
                    switch(key) {
                        case 'error':
                            formattedDetails.push(`Error: ${value}`);
                            break;
                        case 'userId':
                            formattedDetails.push(`User: ${value}`);
                            break;
                        case 'action':
                            formattedDetails.push(`Action: ${value}`);
                            break;
                        case 'duration':
                            formattedDetails.push(`Duration: ${value}ms`);
                            break;
                        case 'size':
                            formattedDetails.push(`Size: ${formatBytes(value)}`);
                            break;
                        default:
                            if (typeof value === 'object') {
                                formattedDetails.push(`${key}: ${JSON.stringify(value)}`);
                            } else {
                                formattedDetails.push(`${key}: ${value}`);
                            }
                    }
                }
                details = formattedDetails.join(' | ');
            }
        }

        return `
            <tr class="${levelClass}">
                <td class="log-timestamp">${timestamp}</td>
                <td><span class="log-level">${level}</span></td>
                <td class="log-message">${log.message}</td>
                <td class="log-details">${details || '-'}</td>
            </tr>
        `;
    }).join('');
}

// Log control functions
function refreshLogs() {
    loadLogs();
    showNotification('Logs refreshed', 'info');
}

function clearLogFilters() {
    document.getElementById('logLevel').value = 'all';
    document.getElementById('logDate').value = '';
    loadLogs();
    showNotification('Filters cleared', 'info');
}

function exportLogs() {
    try {
        const logContent = document.getElementById('logContent');
        const rows = Array.from(logContent.getElementsByTagName('tr'));
        
        let csv = 'Timestamp,Level,Message,Details\n';
        rows.forEach(row => {
            const cells = Array.from(row.getElementsByTagName('td'));
            if (cells.length === 4) {
                const values = cells.map(cell => {
                    // Remove HTML tags and escape quotes
                    let text = cell.textContent.replace(/<[^>]+>/g, '');
                    text = text.replace(/"/g, '""');
                    // Wrap in quotes if contains comma
                    return text.includes(',') ? `"${text}"` : text;
                });
                csv += values.join(',') + '\n';
            }
        });

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `logs-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        showNotification('Logs exported successfully', 'success');
    } catch (error) {
        showNotification('Failed to export logs: ' + error.message, 'error');
    }
}

// Database Backup
async function createBackup() {
    try {
        const response = await fetch('/api/admin/backup', {
            method: 'POST',
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const result = await response.json();
        
        if (result.success) {
            showNotification('Backup created successfully', 'success');
            loadBackupHistory();
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        handleApiError(error);
    }
}

async function loadBackupHistory() {
    try {
        const response = await fetch('/api/admin/backup/history', {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const history = await response.json();
        
        const tbody = document.getElementById('backupHistory');
        tbody.innerHTML = history.map(backup => `
            <tr data-backup-id="${backup._id}">
                <td>${new Date(backup.timestamp).toLocaleString()}</td>
                <td>${formatBytes(backup.size)}</td>
                <td><span class="status ${backup.status}">${backup.status}</span></td>
                <td>
                    ${backup.status === 'completed' ? `
                        <button class="backup-action-btn restore" onclick="restoreBackup('${backup._id}')" title="Restore this backup">
                            <i class="fas fa-undo"></i>
                        </button>
                    ` : ''}
                    <button class="backup-action-btn delete" onclick="deleteBackup('${backup._id}')" title="Delete this backup">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        handleApiError(error);
        document.getElementById('backupHistory').innerHTML = '<tr><td colspan="4">Error loading backup history: ' + error.message + '</td></tr>';
    }
}

// User Management
async function loadUserList() {
    try {
        const response = await fetch('/api/admin/users', {
            headers: getAuthHeaders()
        });
        const users = await response.json();
        
        const tbody = document.getElementById('userList');
        tbody.innerHTML = users.map(user => `
            <tr>
                <td>${user.username}</td>
                <td>${user.role}</td>
                <td>${user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}</td>
                <td><span class="status ${user.status}">${user.status}</span></td>
                <td>
                    <button class="btn" onclick="editUser('${user.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn" onclick="toggleUserStatus('${user.id}')">
                        <i class="fas fa-power-off"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        handleApiError(error);
    }
}

// Analytics Charts
async function initializeCharts() {
    try {
        // Initialize charts
        if (!charts.userActivity && document.getElementById('userActivityChart')) {
            charts.userActivity = createUserActivityChart();
        }
        if (!charts.resourceUsage && document.getElementById('resourceUsageChart')) {
            charts.resourceUsage = createResourceUsageChart();
        }
        if (!charts.errorRate && document.getElementById('errorRateChart')) {
            charts.errorRate = createErrorRateChart();
        }
        if (!charts.dbGrowth && document.getElementById('dbGrowthChart')) {
            charts.dbGrowth = createDbGrowthChart();
        }
        
        // Load initial data
        await refreshCharts();
    } catch (error) {
        console.error('Failed to initialize charts:', error);
        showNotification('Failed to initialize charts: ' + error.message, 'error');
    }
}

async function refreshCharts() {
    try {
        if (!charts.userActivity || !charts.resourceUsage || !charts.errorRate || !charts.dbGrowth) {
            console.warn('Charts not fully initialized');
            return;
        }

        // Helper function to handle fetch with error checking
        async function fetchAnalytics(endpoint) {
            try {
                const response = await fetch(`/api/admin/analytics/${endpoint}`, {
                    headers: getAuthHeaders()
                });
                
                if (!response.ok) {
                    console.warn(`API endpoint not ready for ${endpoint}, using mock data`);
                    return getMockData(endpoint);
                }
                
                const contentType = response.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) {
                    console.warn(`Invalid response type for ${endpoint}, using mock data`);
                    return getMockData(endpoint);
                }
                
                return response.json();
            } catch (error) {
                console.warn(`Error fetching ${endpoint}, using mock data:`, error);
                return getMockData(endpoint);
            }
        }

        // Fetch all analytics data with proper error handling
        const [userActivity, resourceUsage, errorRate, dbGrowth] = await Promise.all([
            fetchAnalytics('user-activity').catch(error => {
                console.error('User activity error:', error);
                return { labels: [], values: [] };
            }),
            fetchAnalytics('resource-usage').catch(error => {
                console.error('Resource usage error:', error);
                return { labels: [], cpu: [], memory: [] };
            }),
            fetchAnalytics('error-rate').catch(error => {
                console.error('Error rate error:', error);
                return { labels: [], values: [] };
            }),
            fetchAnalytics('db-growth').catch(error => {
                console.error('DB growth error:', error);
                return { labels: [], values: [] };
            })
        ]);

        // Update charts with fallback for missing data
        if (userActivity && Array.isArray(userActivity.labels)) {
            updateUserActivityChart(userActivity);
        }
        if (resourceUsage && Array.isArray(resourceUsage.labels)) {
            updateResourceUsageChart(resourceUsage);
        }
        if (errorRate && Array.isArray(errorRate.labels)) {
            updateErrorRateChart(errorRate);
        }
        if (dbGrowth && Array.isArray(dbGrowth.labels)) {
            updateDbGrowthChart(dbGrowth);
        }
    } catch (error) {
        console.error('Failed to refresh charts:', error);
        showNotification('Failed to refresh charts: ' + error.message, 'error');
    }
}

// Chart Creation Functions
function createUserActivityChart() {
    const ctx = document.getElementById('userActivityChart').getContext('2d');
    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Active Users',
                data: [],
                borderColor: 'rgb(100, 255, 218)',
                backgroundColor: 'rgba(100, 255, 218, 0.1)',
                tension: 0.1,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 750,
                easing: 'easeInOutQuart'
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)',
                        font: {
                            size: 12
                        }
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)',
                        font: {
                            size: 12
                        },
                        maxRotation: 45,
                        minRotation: 45
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: 'rgba(255, 255, 255, 0.7)',
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleFont: {
                        size: 14
                    },
                    bodyFont: {
                        size: 13
                    }
                }
            }
        }
    });
}

function createResourceUsageChart() {
    const ctx = document.getElementById('resourceUsageChart').getContext('2d');
    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'CPU Usage (%)',
                data: [],
                borderColor: 'rgb(187, 134, 252)',
                backgroundColor: 'rgba(187, 134, 252, 0.1)',
                tension: 0.1,
                fill: true,
                yAxisID: 'cpu'
            }, {
                label: 'Memory Usage (MB)',
                data: [],
                borderColor: 'rgb(255, 183, 77)',
                backgroundColor: 'rgba(255, 183, 77, 0.1)',
                tension: 0.1,
                fill: true,
                yAxisID: 'memory'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            animation: {
                duration: 750,
                easing: 'easeInOutQuart'
            },
            scales: {
                cpu: {
                    type: 'linear',
                    position: 'left',
                    beginAtZero: true,
                    max: 100,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)',
                        callback: value => value + '%'
                    },
                    title: {
                        display: true,
                        text: 'CPU Usage',
                        color: 'rgba(255, 255, 255, 0.7)'
                    }
                },
                memory: {
                    type: 'linear',
                    position: 'right',
                    beginAtZero: true,
                    grid: {
                        drawOnChartArea: false
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)',
                        callback: value => value + ' MB'
                    },
                    title: {
                        display: true,
                        text: 'Memory Usage',
                        color: 'rgba(255, 255, 255, 0.7)'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)',
                        maxRotation: 45,
                        minRotation: 45
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: 'rgba(255, 255, 255, 0.7)'
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)'
                }
            }
        }
    });
}

function createErrorRateChart() {
    const ctx = document.getElementById('errorRateChart').getContext('2d');
    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Errors',
                data: [],
                backgroundColor: 'rgba(255, 82, 82, 0.5)',
                borderColor: 'rgb(255, 82, 82)',
                borderWidth: 1,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 750,
                easing: 'easeInOutQuart'
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)',
                        stepSize: 1
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)',
                        maxRotation: 45,
                        minRotation: 45
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: 'rgba(255, 255, 255, 0.7)'
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)'
                }
            }
        }
    });
}

function createDbGrowthChart() {
    const ctx = document.getElementById('dbGrowthChart').getContext('2d');
    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Database Size (MB)',
                data: [],
                borderColor: 'rgb(100, 181, 246)',
                backgroundColor: 'rgba(100, 181, 246, 0.1)',
                tension: 0.1,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 750,
                easing: 'easeInOutQuart'
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)',
                        callback: value => formatBytes(value * 1024 * 1024) // Convert MB to bytes for formatting
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)',
                        maxRotation: 45,
                        minRotation: 45
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: 'rgba(255, 255, 255, 0.7)'
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    callbacks: {
                        label: (context) => {
                            const value = context.raw;
                            return `Size: ${formatBytes(value * 1024 * 1024)}`;
                        }
                    }
                }
            }
        }
    });
}

// Chart Update Functions
function updateUserActivityChart(data) {
    try {
        if (!charts.userActivity) return;
        
        const newData = {
            labels: data.labels || [],
            datasets: [{
                ...charts.userActivity.data.datasets[0],
                data: data.values || []
            }]
        };
        
        charts.userActivity.data = newData;
        charts.userActivity.update('none');
    } catch (error) {
        console.error('Error updating user activity chart:', error);
    }
}

function updateResourceUsageChart(data) {
    try {
        if (!charts.resourceUsage) return;
        
        const newData = {
            labels: data.labels || [],
            datasets: [
                {
                    ...charts.resourceUsage.data.datasets[0],
                    data: data.cpu || []
                },
                {
                    ...charts.resourceUsage.data.datasets[1],
                    data: data.memory || []
                }
            ]
        };
        
        charts.resourceUsage.data = newData;
        charts.resourceUsage.update('none');
    } catch (error) {
        console.error('Error updating resource usage chart:', error);
    }
}

function updateErrorRateChart(data) {
    try {
        if (!charts.errorRate) return;
        
        const newData = {
            labels: data.labels || [],
            datasets: [{
                ...charts.errorRate.data.datasets[0],
                data: data.values || []
            }]
        };
        
        charts.errorRate.data = newData;
        charts.errorRate.update('none');
    } catch (error) {
        console.error('Error updating error rate chart:', error);
    }
}

function updateDbGrowthChart(data) {
    try {
        if (!charts.dbGrowth) return;
        
        const newData = {
            labels: data.labels || [],
            datasets: [{
                ...charts.dbGrowth.data.datasets[0],
                data: data.values || []
            }]
        };
        
        charts.dbGrowth.data = newData;
        charts.dbGrowth.update('none');
    } catch (error) {
        console.error('Error updating db growth chart:', error);
    }
}

// Utility Functions
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatUptime(seconds) {
    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);
    return `${days}d ${hours}h ${minutes}m`;
}

function getLevelClass(level) {
    switch (level.toLowerCase()) {
        case 'error':
            return 'log-error';
        case 'warn':
            return 'log-warning';
        case 'info':
            return 'log-info';
        case 'debug':
            return 'log-debug';
        default:
            return 'log-info';
    }
}

function showNotification(message, type = 'info') {
    const container = document.querySelector('.notification-container');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas ${getNotificationIcon(type)}"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(notification);
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

function getNotificationIcon(type) {
    switch (type) {
        case 'success': return 'fa-check-circle';
        case 'error': return 'fa-exclamation-circle';
        case 'warning': return 'fa-exclamation-triangle';
        default: return 'fa-info-circle';
    }
}

function loadScript(src) {
    return new Promise((resolve, reject) => {
        // Check if script is already loaded
        if (document.querySelector(`script[src="${src}"]`)) {
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.src = src;
        script.crossOrigin = 'anonymous'; // Add CORS support
        
        script.onload = () => {
            resolve();
        };
        
        script.onerror = (error) => {
            reject(new Error(`Failed to load script: ${src}`));
        };
        
        document.head.appendChild(script);
    });
}

// Event Listeners
function setupEventListeners() {
    // Log filters - use input event for date to catch manual changes
    document.getElementById('logLevel').addEventListener('change', () => {
        loadLogs();
        showNotification('Filtering logs by level: ' + document.getElementById('logLevel').value, 'info');
    });
    
    document.getElementById('logDate').addEventListener('change', () => {
        loadLogs();
        showNotification('Filtering logs by date: ' + document.getElementById('logDate').value, 'info');
    });
    
    // Settings form
    document.getElementById('backupFrequency').addEventListener('change', saveSettings);
    document.getElementById('retentionPeriod').addEventListener('change', saveSettings);
    document.getElementById('systemLogLevel').addEventListener('change', saveSettings);
    document.getElementById('logRotation').addEventListener('change', saveSettings);
}

// Settings Management
async function saveSettings() {
    try {
        const settings = {
            backup: {
                frequency: document.getElementById('backupFrequency').value,
                retentionPeriod: parseInt(document.getElementById('retentionPeriod').value)
            },
            logging: {
                level: document.getElementById('systemLogLevel').value,
                rotation: document.getElementById('logRotation').value
            }
        };
        
        const response = await fetch('/api/admin/settings', {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(settings)
        });
        
        const result = await response.json();
        if (result.success) {
            showNotification('Settings saved successfully', 'success');
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        handleApiError(error);
    }
}

// Error handling
function handleApiError(error) {
    console.error('API Error:', error);
    if (error.status === 401 || error.message?.includes('401')) {
        redirectToLogin('Session expired. Please log in again');
    } else {
        showNotification(error.message || 'An error occurred', 'error');
    }
}

// Mock data for testing charts
function getMockData(type) {
    const now = new Date();
    const labels = Array.from({length: 7}, (_, i) => {
        const date = new Date(now);
        date.setDate(date.getDate() - (6 - i));
        return date.toLocaleDateString();
    });

    switch(type) {
        case 'user-activity':
            return {
                labels,
                values: labels.map(() => Math.floor(Math.random() * 100))
            };
        case 'resource-usage':
            return {
                labels,
                cpu: labels.map(() => Math.floor(Math.random() * 100)),
                memory: labels.map(() => Math.floor(Math.random() * 1000))
            };
        case 'error-rate':
            return {
                labels,
                values: labels.map(() => Math.floor(Math.random() * 10))
            };
        case 'db-growth':
            return {
                labels,
                values: labels.map((_, i) => 100 + i * 10 + Math.floor(Math.random() * 20))
            };
        default:
            return { labels: [], values: [] };
    }
}

async function restoreBackup(backupId) {
    try {
        // Show confirmation dialog
        if (!confirm('Are you sure you want to restore this backup? This will overwrite current data.')) {
            return;
        }

        // Update UI to show pending status
        const statusSpan = document.querySelector(`tr[data-backup-id="${backupId}"] .status`);
        if (statusSpan) {
            statusSpan.className = 'status pending';
            statusSpan.textContent = 'pending';
        }

        const response = await fetch(`/api/admin/backup/${backupId}/restore`, {
            method: 'POST',
            headers: getAuthHeaders()
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const result = await response.json();
        
        if (result.success) {
            showNotification('Backup restored successfully', 'success');
            // Reload backup history to show updated status
            await loadBackupHistory();
        } else {
            throw new Error(result.message || 'Failed to restore backup');
        }
    } catch (error) {
        handleApiError(error);
        // Reload backup history to show correct status
        await loadBackupHistory();
    }
}

async function deleteBackup(backupId) {
    try {
        // Show confirmation dialog
        if (!confirm('Are you sure you want to delete this backup? This action cannot be undone.')) {
            return;
        }

        const response = await fetch(`/api/admin/backup/${backupId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const result = await response.json();
        
        if (result.success) {
            showNotification('Backup deleted successfully', 'success');
            loadBackupHistory(); // Refresh the backup list
        } else {
            throw new Error(result.message || 'Failed to delete backup');
        }
    } catch (error) {
        console.error('Delete error:', error);
        showNotification('Failed to delete backup: ' + error.message, 'error');
    }
} 