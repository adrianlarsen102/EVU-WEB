let contentData = {};

// Authentication
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password })
        });

        if (response.ok) {
            document.getElementById('loginSection').classList.add('hidden');
            document.getElementById('adminSection').classList.remove('hidden');
            loadContent();
        } else {
            const error = document.getElementById('loginError');
            error.textContent = 'Invalid password';
            error.style.display = 'block';
        }
    } catch (error) {
        console.error('Login error:', error);
    }
});

document.getElementById('logoutBtn')?.addEventListener('click', async () => {
    await fetch('/api/logout', { method: 'POST' });
    location.reload();
});

// Check authentication on load
async function checkAuth() {
    try {
        const response = await fetch('/api/auth/check');
        const data = await response.json();

        if (data.authenticated) {
            document.getElementById('loginSection').classList.add('hidden');
            document.getElementById('adminSection').classList.remove('hidden');
            loadContent();
        }
    } catch (error) {
        console.error('Auth check error:', error);
    }
}

// Load content from API
async function loadContent() {
    try {
        const response = await fetch('/api/content');
        contentData = await response.json();
        populateFields();
    } catch (error) {
        console.error('Load error:', error);
    }
}

// Populate form fields
function populateFields() {
    // Server Info
    document.getElementById('serverName').value = contentData.serverInfo?.name || '';
    document.getElementById('serverTitle').value = contentData.serverInfo?.title || '';
    document.getElementById('serverSubtitle').value = contentData.serverInfo?.subtitle || '';
    document.getElementById('serverVersion').value = contentData.serverInfo?.version || '';

    // Server Status
    document.getElementById('serverOnline').value = contentData.serverStatus?.isOnline || 'true';
    document.getElementById('maxPlayers').value = contentData.serverStatus?.maxPlayers || 64;
    document.getElementById('uptime').value = contentData.serverStatus?.uptime || '99.9%';

    // Features
    renderFeatures();

    // Join Info
    document.getElementById('serverIP').value = contentData.joinInfo?.serverIP || '';
    document.getElementById('discordLink').value = contentData.joinInfo?.discordLink || '';

    // Changelog
    renderChangelog();

    // Forum
    renderForum();
}

// Save functions
async function saveServerInfo() {
    contentData.serverInfo = {
        name: document.getElementById('serverName').value,
        title: document.getElementById('serverTitle').value,
        subtitle: document.getElementById('serverSubtitle').value,
        version: document.getElementById('serverVersion').value
    };

    contentData.serverStatus = {
        isOnline: document.getElementById('serverOnline').value === 'true',
        maxPlayers: parseInt(document.getElementById('maxPlayers').value),
        uptime: document.getElementById('uptime').value
    };

    await saveContent();
}

async function saveFeatures() {
    const features = [];
    document.querySelectorAll('#featuresContainer .array-item').forEach(item => {
        features.push({
            icon: item.querySelector('.feature-icon').value,
            title: item.querySelector('.feature-title').value,
            description: item.querySelector('.feature-desc').value
        });
    });

    contentData.features = features;
    await saveContent();
}

async function saveJoinInfo() {
    contentData.joinInfo = {
        serverIP: document.getElementById('serverIP').value,
        discordLink: document.getElementById('discordLink').value
    };

    await saveContent();
}

async function saveChangelog() {
    const changelog = [];
    document.querySelectorAll('#changelogContainer .array-item').forEach(item => {
        const featuresText = item.querySelector('.changelog-features').value;
        const improvementsText = item.querySelector('.changelog-improvements').value;
        const fixesText = item.querySelector('.changelog-fixes').value;

        changelog.push({
            version: item.querySelector('.changelog-version').value,
            date: item.querySelector('.changelog-date').value,
            changes: {
                features: featuresText.split('\n').filter(f => f.trim()),
                improvements: improvementsText.split('\n').filter(f => f.trim()),
                fixes: fixesText.split('\n').filter(f => f.trim())
            }
        });
    });

    contentData.changelog = changelog;
    await saveContent();
}

async function saveForum() {
    const categories = [];
    document.querySelectorAll('#forumContainer .array-item').forEach(item => {
        categories.push({
            name: item.querySelector('.forum-name').value,
            description: item.querySelector('.forum-desc').value,
            topics: parseInt(item.querySelector('.forum-topics').value) || 0,
            posts: parseInt(item.querySelector('.forum-posts').value) || 0
        });
    });

    contentData.forumCategories = categories;
    await saveContent();
}

async function saveContent() {
    try {
        const response = await fetch('/api/content', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(contentData)
        });

        if (response.ok) {
            showMessage('success');
        } else {
            showMessage('error');
        }
    } catch (error) {
        showMessage('error');
        console.error('Save error:', error);
    }
}

function showMessage(type) {
    const msg = document.getElementById(type === 'success' ? 'successMessage' : 'errorMessage');
    msg.style.display = 'block';
    setTimeout(() => msg.style.display = 'none', 3000);
}

// Render functions
function renderFeatures() {
    const container = document.getElementById('featuresContainer');
    container.innerHTML = '';

    contentData.features?.forEach((feature, index) => {
        container.innerHTML += `
            <div class="array-item">
                <button onclick="removeFeature(${index})" class="btn btn-danger remove-btn">Remove</button>
                <div class="form-group">
                    <label>Icon (emoji):</label>
                    <input type="text" class="feature-icon content-field" value="${feature.icon}">
                </div>
                <div class="form-group">
                    <label>Title:</label>
                    <input type="text" class="feature-title content-field" value="${feature.title}">
                </div>
                <div class="form-group">
                    <label>Description:</label>
                    <textarea class="feature-desc content-field">${feature.description}</textarea>
                </div>
            </div>
        `;
    });
}

function addFeature() {
    if (!contentData.features) contentData.features = [];
    contentData.features.push({ icon: '🎮', title: 'New Feature', description: 'Description' });
    renderFeatures();
}

function removeFeature(index) {
    contentData.features.splice(index, 1);
    renderFeatures();
}

function renderChangelog() {
    const container = document.getElementById('changelogContainer');
    container.innerHTML = '';

    contentData.changelog?.forEach((entry, index) => {
        const features = entry.changes.features?.join('\n') || '';
        const improvements = entry.changes.improvements?.join('\n') || '';
        const fixes = entry.changes.fixes?.join('\n') || '';

        container.innerHTML += `
            <div class="array-item">
                <button onclick="removeChangelog(${index})" class="btn btn-danger remove-btn">Remove</button>
                <div class="form-group">
                    <label>Version:</label>
                    <input type="text" class="changelog-version content-field" value="${entry.version}">
                </div>
                <div class="form-group">
                    <label>Date:</label>
                    <input type="date" class="changelog-date content-field" value="${entry.date}">
                </div>
                <div class="form-group">
                    <label>Features (one per line):</label>
                    <textarea class="changelog-features content-field">${features}</textarea>
                </div>
                <div class="form-group">
                    <label>Improvements (one per line):</label>
                    <textarea class="changelog-improvements content-field">${improvements}</textarea>
                </div>
                <div class="form-group">
                    <label>Fixes (one per line):</label>
                    <textarea class="changelog-fixes content-field">${fixes}</textarea>
                </div>
            </div>
        `;
    });
}

function addChangelog() {
    if (!contentData.changelog) contentData.changelog = [];
    const today = new Date().toISOString().split('T')[0];
    contentData.changelog.unshift({
        version: '1.0.0',
        date: today,
        changes: { features: [], improvements: [], fixes: [] }
    });
    renderChangelog();
}

function removeChangelog(index) {
    contentData.changelog.splice(index, 1);
    renderChangelog();
}

function renderForum() {
    const container = document.getElementById('forumContainer');
    container.innerHTML = '';

    contentData.forumCategories?.forEach((category, index) => {
        container.innerHTML += `
            <div class="array-item">
                <button onclick="removeForumCategory(${index})" class="btn btn-danger remove-btn">Remove</button>
                <div class="form-group">
                    <label>Name:</label>
                    <input type="text" class="forum-name content-field" value="${category.name}">
                </div>
                <div class="form-group">
                    <label>Description:</label>
                    <textarea class="forum-desc content-field">${category.description}</textarea>
                </div>
                <div class="form-group">
                    <label>Topics:</label>
                    <input type="number" class="forum-topics content-field" value="${category.topics}">
                </div>
                <div class="form-group">
                    <label>Posts:</label>
                    <input type="number" class="forum-posts content-field" value="${category.posts}">
                </div>
            </div>
        `;
    });
}

function addForumCategory() {
    if (!contentData.forumCategories) contentData.forumCategories = [];
    contentData.forumCategories.push({
        name: 'New Category',
        description: 'Category description',
        topics: 0,
        posts: 0
    });
    renderForum();
}

function removeForumCategory(index) {
    contentData.forumCategories.splice(index, 1);
    renderForum();
}

// Tab switching
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

        tab.classList.add('active');
        document.getElementById(tab.dataset.tab + 'Tab').classList.add('active');
    });
});

// Initialize
checkAuth();
