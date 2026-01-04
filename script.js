// CSV parsing and display logic
let resolutionsData = [];
let runsData = [];
let gymData = [];

// Parse CSV content
function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        if (values.length === headers.length) {
            const obj = {};
            headers.forEach((header, index) => {
                obj[header] = values[index];
            });
            data.push(obj);
        }
    }
    
    return data;
}

// Calculate progress percentage
function calculateProgress(status) {
    const statusMap = {
        'completed': 100,
        'in-progress': 50,
        'not-started': 0
    };
    return statusMap[status.toLowerCase()] || 0;
}

// Format status for display
function formatStatus(status) {
    return status.toLowerCase().replace(/-/g, ' ');
}

// Create resolution card HTML
function createResolutionCard(resolution) {
    const status = resolution.status || resolution.Status || 'not-started';
    const formattedStatus = formatStatus(status);
    const statusClass = status.toLowerCase().replace(/\s+/g, '-');
    
    const title = resolution.title || resolution.Title || 'Untitled Resolution';
    const description = resolution.description || resolution.Description || '';
    const category = resolution.category || resolution.Category || '';
    const current = resolution.current || resolution.Current || '';
    const target = resolution.target || resolution.Target || '';
    const link = resolution.link || resolution.Link || '';
    
    // Only show current/target section if both values are provided
    const hasValues = current && target;
    
    // Create current value display - make it a link if link is provided
    const currentDisplay = link && current 
        ? `<a href="${escapeHtml(link)}" target="_blank" rel="noopener noreferrer" class="value-number value-link">${escapeHtml(current)}</a>`
        : `<div class="value-number">${escapeHtml(current)}</div>`;
    
    return `
        <div class="resolution-card ${statusClass}">
            <div class="card-header">
                <div>
                    <h3 class="resolution-title">${escapeHtml(title)}</h3>
                </div>
                <span class="status-badge ${statusClass}">${formattedStatus}</span>
            </div>
            ${description ? `<p class="resolution-description">${escapeHtml(description)}</p>` : ''}
            ${hasValues ? `
            <div class="progress-section">
                <div class="value-display">
                    <div class="value-item">
                        <div class="value-label">Current</div>
                        ${currentDisplay}
                    </div>
                    <div class="value-separator">→</div>
                    <div class="value-item">
                        <div class="value-label">Target</div>
                        <div class="value-number target">${escapeHtml(target)}</div>
                    </div>
                </div>
            </div>
            ` : ''}
            ${category ? `<span class="category-tag">${escapeHtml(category)}</span>` : ''}
        </div>
    `;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Calculate day of year
function getDayOfYear(date = new Date()) {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date - start;
    return Math.floor(diff / (1000 * 60 * 60 * 24));
}

// Calculate total days in year (handles leap years)
function getDaysInYear(year) {
    return ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) ? 366 : 365;
}

// Calculate running goal progress
function calculateRunningProgress(runs, targetKm = 2000) {
    const totalDistance = runs.reduce((sum, run) => {
        const distance = parseFloat(run.distance || run.Distance || 0);
        return sum + (isNaN(distance) ? 0 : distance);
    }, 0);
    
    const now = new Date();
    const year = now.getFullYear();
    const dayOfYear = getDayOfYear(now);
    const daysInYear = getDaysInYear(year);
    const expectedDistance = (dayOfYear / daysInYear) * targetKm;
    const difference = totalDistance - expectedDistance;
    const percentage = (totalDistance / targetKm) * 100;
    const expectedPercentage = (expectedDistance / targetKm) * 100;
    
    return {
        totalDistance: totalDistance.toFixed(1),
        expectedDistance: expectedDistance.toFixed(1),
        difference: difference.toFixed(1),
        percentage: percentage.toFixed(1),
        expectedPercentage: expectedPercentage.toFixed(1),
        targetKm
    };
}

// Get week number from date (ISO week)
function getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

// Get year-week key (e.g., "2026-01")
function getYearWeekKey(date) {
    const year = date.getFullYear();
    const week = getWeekNumber(date);
    return `${year}-W${week.toString().padStart(2, '0')}`;
}

// Calculate gym statistics
function calculateGymProgress(gymVisits) {
    const now = new Date();
    const year = now.getFullYear();
    const yearStart = new Date(year, 0, 1);
    
    // Parse gym visit dates
    const visits = gymVisits
        .map(visit => {
            const dateStr = visit.date || visit.Date || '';
            if (!dateStr) return null;
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return null;
            return date;
        })
        .filter(date => date !== null && date >= yearStart && date <= now);
    
    // Group visits by week
    const visitsByWeek = {};
    visits.forEach(date => {
        const weekKey = getYearWeekKey(date);
        if (!visitsByWeek[weekKey]) {
            visitsByWeek[weekKey] = 0;
        }
        visitsByWeek[weekKey]++;
    });
    
    // Calculate total weeks from start of year to now
    // Count all unique weeks from year start to now
    const allWeeks = new Set();
    const currentDate = new Date(yearStart);
    while (currentDate <= now) {
        allWeeks.add(getYearWeekKey(currentDate));
        currentDate.setDate(currentDate.getDate() + 7); // Jump by weeks for efficiency
    }
    // Also check the current date's week
    allWeeks.add(getYearWeekKey(now));
    const totalWeeks = Math.max(allWeeks.size, 1);
    
    // Count weeks with at least one visit
    const weeksWithVisits = Object.keys(visitsByWeek).length;
    
    // Count weeks without visits
    const weeksWithoutVisits = Math.max(0, totalWeeks - weeksWithVisits);
    
    // Calculate average visits per week
    const totalVisits = visits.length;
    const avgVisitsPerWeek = totalWeeks > 0 ? (totalVisits / totalWeeks) : 0;
    
    return {
        weeksWithVisits,
        weeksWithoutVisits,
        avgVisitsPerWeek: avgVisitsPerWeek.toFixed(2),
        totalVisits,
        totalWeeks
    };
}

// Create featured gym goal card
function createFeaturedGymCard(progress) {
    return `
        <div class="featured-goal-card in-progress">
            <div class="featured-goal-header">
                <h2 class="featured-goal-title">
                    💪 Gym Goal: At Least Once Per Week
                </h2>
                <span class="status-badge in-progress">in progress</span>
            </div>
            
            <div class="featured-goal-stats">
                <div class="stat-item">
                    <div class="stat-value actual">${progress.weeksWithVisits}</div>
                    <div class="stat-label">Weeks with Visits</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value ${progress.weeksWithoutVisits > 0 ? 'difference' : 'actual'}">${progress.weeksWithoutVisits}</div>
                    <div class="stat-label">Weeks Missed</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value expected">${progress.avgVisitsPerWeek}</div>
                    <div class="stat-label">Avg Visits/Week</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${progress.totalVisits}</div>
                    <div class="stat-label">Total Visits</div>
                </div>
            </div>
            
            <div class="comparison-section">
                <div class="progress-label">
                    <span>Weekly Attendance</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress.totalWeeks > 0 ? (progress.weeksWithVisits / progress.totalWeeks * 100) : 0}%"></div>
                </div>
                <div style="display: flex; justify-content: space-between; margin-top: 0.5rem; font-size: 0.875rem; color: var(--text-secondary);">
                    <span>${progress.weeksWithVisits} of ${progress.totalWeeks} weeks</span>
                    <span>${progress.totalWeeks > 0 ? ((progress.weeksWithVisits / progress.totalWeeks * 100).toFixed(1)) : 0}%</span>
                </div>
            </div>
            <span class="category-tag">Gym</span>
        </div>
    `;
}

// Create featured running goal card
function createFeaturedRunningCard(progress) {
    const isAhead = parseFloat(progress.difference) >= 0;
    const diffClass = isAhead ? 'actual' : 'difference';
    const diffSign = isAhead ? '+' : '';
    
    return `
        <div class="featured-goal-card in-progress">
            <div class="featured-goal-header">
                <h2 class="featured-goal-title">
                    🏃 Run 2000km in 2026
                </h2>
                <span class="status-badge in-progress">in progress</span>
            </div>
            
            <div class="featured-goal-stats">
                <div class="stat-item">
                    <div class="stat-value actual">${progress.totalDistance} km</div>
                    <div class="stat-label">Distance Run</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value expected">${progress.expectedDistance} km</div>
                    <div class="stat-label">Expected</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value ${diffClass}">${diffSign}${progress.difference} km</div>
                    <div class="stat-label">${isAhead ? 'Ahead' : 'Behind'}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${progress.percentage}%</div>
                    <div class="stat-label">Of Goal</div>
                </div>
            </div>
            
            <div class="comparison-section">
                <div class="progress-label">
                    <span>Progress Comparison</span>
                </div>
                <div class="comparison-bars">
                    <div class="comparison-bar">
                        <div class="comparison-bar-label">
                            <span>Actual</span>
                            <span>${progress.totalDistance} km</span>
                        </div>
                        <div class="comparison-bar-fill actual">
                            <div class="fill" style="width: ${Math.min(progress.percentage, 100)}%"></div>
                        </div>
                    </div>
                    <div class="comparison-bar">
                        <div class="comparison-bar-label">
                            <span>Expected</span>
                            <span>${progress.expectedDistance} km</span>
                        </div>
                        <div class="comparison-bar-fill expected">
                            <div class="fill" style="width: ${Math.min(progress.expectedPercentage, 100)}%"></div>
                        </div>
                    </div>
                </div>
            </div>
            <span class="category-tag">Running</span>
        </div>
    `;
}

// Display resolutions
function displayResolutions(data) {
    const container = document.getElementById('resolutions-container');
    const loading = document.getElementById('loading');
    
    if (!data || data.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No resolutions found. Add some to your CSV file!</p>';
        loading.classList.add('hidden');
        return;
    }
    
    // Display resolutions in the order they appear in the CSV (no sorting)
    container.innerHTML = data.map((resolution, index) => {
        const card = createResolutionCard(resolution);
        // Add staggered animation delay
        return card.replace('<div class="resolution-card', 
            `<div class="resolution-card" style="animation-delay: ${index * 0.1}s"`);
    }).join('');
    
    loading.classList.add('hidden');
    container.classList.remove('hidden');
}

// Load gym CSV file
async function loadGym() {
    try {
        const response = await fetch('gym.csv');
        if (!response.ok) {
            console.warn('gym.csv not found, skipping gym goal');
            return null;
        }
        
        const csvText = await response.text();
        gymData = parseCSV(csvText);
        
        // Calculate and return gym card
        const progress = calculateGymProgress(gymData);
        return createFeaturedGymCard(progress);
    } catch (error) {
        console.warn('Error loading gym.csv:', error);
        return null;
    }
}

// Load runs CSV file
async function loadRuns() {
    try {
        const response = await fetch('runs.csv');
        if (!response.ok) {
            console.warn('runs.csv not found, skipping running goal');
            return null;
        }
        
        const csvText = await response.text();
        runsData = parseCSV(csvText);
        
        // Calculate and return running card
        const progress = calculateRunningProgress(runsData);
        return createFeaturedRunningCard(progress);
    } catch (error) {
        console.warn('Error loading runs.csv:', error);
        return null;
    }
}

// Load and parse CSV file
async function loadResolutions() {
    try {
        // Load gym and runs (for featured goals)
        const runningCard = await loadRuns();
        const gymCard = await loadGym();

        
        // Display featured goals in order: running card first, then gym card
        const featuredContainer = document.getElementById('featured-goal-container');
        if (featuredContainer) {
            const cards = [];
            if (runningCard) cards.push(runningCard);
            if (gymCard) cards.push(gymCard);
            
            if (cards.length > 0) {
                featuredContainer.innerHTML = cards.join('<div style="margin-top: 2rem;"></div>');
            }
        }
        
        const response = await fetch('resolutions.csv');
        if (!response.ok) {
            throw new Error('Failed to load CSV file');
        }
        
        const csvText = await response.text();
        resolutionsData = parseCSV(csvText);
        displayResolutions(resolutionsData);
        
        // Update last updated time
        const lastUpdated = document.getElementById('last-updated');
        if (lastUpdated) {
            const now = new Date();
            lastUpdated.textContent = now.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    } catch (error) {
        console.error('Error loading resolutions:', error);
        const container = document.getElementById('resolutions-container');
        const loading = document.getElementById('loading');
        loading.classList.add('hidden');
        
        // Check if we're running from file:// protocol
        const isLocalFile = window.location.protocol === 'file:';
        
        if (isLocalFile) {
            container.innerHTML = `
                <div style="text-align: center; color: var(--danger-color); padding: 2rem; max-width: 600px; margin: 0 auto;">
                    <p style="font-size: 1.1rem; margin-bottom: 1rem;">⚠️ Cannot load CSV file locally</p>
                    <p style="font-size: 0.95rem; color: var(--text-secondary); margin-bottom: 1.5rem; line-height: 1.6;">
                        Browsers block local file access for security reasons. To test locally, run a local web server:
                    </p>
                    <div style="background: var(--card-bg); padding: 1.5rem; border-radius: 8px; text-align: left; margin-top: 1rem;">
                        <p style="color: var(--text-primary); margin-bottom: 0.75rem; font-weight: 600;">Python 3:</p>
                        <code style="background: var(--bg-color); padding: 0.5rem 1rem; border-radius: 4px; display: block; color: var(--success-color);">
                            cd new-year-resolutions<br>
                            python3 -m http.server 8000
                        </code>
                        <p style="color: var(--text-secondary); margin-top: 1rem; margin-bottom: 0.75rem; font-size: 0.875rem;">
                            Then open: <a href="http://localhost:8000" style="color: var(--primary-color);">http://localhost:8000</a>
                        </p>
                    </div>
                    <p style="font-size: 0.875rem; color: var(--text-secondary); margin-top: 1.5rem;">
                        On GitHub Pages, this will work automatically!
                    </p>
                </div>
            `;
        } else {
            container.innerHTML = `
                <div style="text-align: center; color: var(--danger-color); padding: 2rem;">
                    <p>Error loading resolutions.csv</p>
                    <p style="font-size: 0.875rem; color: var(--text-secondary); margin-top: 0.5rem;">
                        Make sure the file exists and is properly formatted.
                    </p>
                </div>
            `;
        }
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', loadResolutions);
