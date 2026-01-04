// CSV parsing and display logic
let resolutionsData = [];

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
    const progress = calculateProgress(status);
    const formattedStatus = formatStatus(status);
    const statusClass = status.toLowerCase().replace(/\s+/g, '-');
    
    const title = resolution.title || resolution.Title || 'Untitled Resolution';
    const description = resolution.description || resolution.Description || '';
    const category = resolution.category || resolution.Category || '';
    
    return `
        <div class="resolution-card ${statusClass}">
            <div class="card-header">
                <div>
                    <h3 class="resolution-title">${escapeHtml(title)}</h3>
                </div>
                <span class="status-badge ${statusClass}">${formattedStatus}</span>
            </div>
            ${description ? `<p class="resolution-description">${escapeHtml(description)}</p>` : ''}
            <div class="progress-section">
                <div class="progress-label">
                    <span>Progress</span>
                    <span>${progress}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress}%"></div>
                </div>
            </div>
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

// Display resolutions
function displayResolutions(data) {
    const container = document.getElementById('resolutions-container');
    const loading = document.getElementById('loading');
    
    if (!data || data.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No resolutions found. Add some to your CSV file!</p>';
        loading.classList.add('hidden');
        return;
    }
    
    // Sort by status: completed last, in-progress middle, not-started first
    const statusOrder = { 'not-started': 0, 'in-progress': 1, 'completed': 2 };
    data.sort((a, b) => {
        const statusA = (a.status || a.Status || 'not-started').toLowerCase();
        const statusB = (b.status || b.Status || 'not-started').toLowerCase();
        return (statusOrder[statusA] || 0) - (statusOrder[statusB] || 0);
    });
    
    container.innerHTML = data.map((resolution, index) => {
        const card = createResolutionCard(resolution);
        // Add staggered animation delay
        return card.replace('<div class="resolution-card', 
            `<div class="resolution-card" style="animation-delay: ${index * 0.1}s"`);
    }).join('');
    
    loading.classList.add('hidden');
    container.classList.remove('hidden');
}

// Load and parse CSV file
async function loadResolutions() {
    try {
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

// Initialize when page loads
document.addEventListener('DOMContentLoaded', loadResolutions);
