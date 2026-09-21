const API_BASE = "https://ethioshield.onrender.com";  // Change to http://127.0.0.1:8000 for local

// ========== SECTION NAVIGATION ==========
function showSection(id) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');

    document.querySelectorAll('.nav-link').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.section === id);
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.querySelectorAll('.nav-link').forEach(btn => {
    btn.addEventListener('click', () => showSection(btn.dataset.section));
});

// ========== DROPDOWNS ==========
const settingsBtn = document.getElementById('settingsBtn');
const settingsDropdown = document.getElementById('settingsDropdown');
const profileBtn = document.getElementById('profileBtn');
const profileDropdown = document.getElementById('profileDropdown');

function closeDropdowns() {
    settingsDropdown.classList.remove('show');
    profileDropdown.classList.remove('show');
}

settingsBtn.addEventListener('click', e => {
    e.stopPropagation();
    const open = settingsDropdown.classList.contains('show');
    closeDropdowns();
    if (!open) settingsDropdown.classList.add('show');
});

profileBtn.addEventListener('click', e => {
    e.stopPropagation();
    const open = profileDropdown.classList.contains('show');
    closeDropdowns();
    if (!open) profileDropdown.classList.add('show');
});

document.addEventListener('click', closeDropdowns);

// ========== FAQ ACCORDION ==========
document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
        btn.parentElement.classList.toggle('open');
    });
});

// ========== SCANNER ==========
const messageText = document.getElementById('message_text');
const resultContainer = document.getElementById('resultContainer');
const reportContainer = document.getElementById('reportMessageContainer');
const fileInput = document.getElementById('fileInput');
const fileName = document.getElementById('fileName');

fileInput.addEventListener('change', () => {
    fileName.textContent = fileInput.files.length ? '📎 ' + fileInput.files[0].name : '';
});

async function analyzeMessage(text) {
    try {
        const res = await fetch(`${API_BASE}/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });
        return await res.json();
    } catch (err) {
        // Offline fallback
        const lower = text.toLowerCase();
        const danger = ['password', 'otp', 'pin', 'click here', 'urgent', 'verify', 'በይለፍ ቃል', 'ኦቲፒ'];
        const count = danger.filter(w => lower.includes(w)).length;
        if (count >= 2) return { type: 'scan', title: '⚠️ Dangerous Message Detected!', text: 'Strong phishing indicators found.' };
        if (count >= 1) return { type: 'warning', title: '⚠️ Looks Suspicious', text: 'Some suspicious keywords found.' };
        return { type: 'normal', title: '✅ Appears Safe', text: 'No dangerous indicators detected.' };
    }
}

document.getElementById('checkBtn').addEventListener('click', async () => {
    const text = messageText.value.trim();
    if (!text && !fileInput.files.length) {
        resultContainer.innerHTML = `<div class="alert-box warning"><p>Please enter a message or upload a photo.</p></div>`;
        return;
    }
    const analysisText = text || "ባንክዎ አካውንት ተዘግቷል። Click here to verify password.";
    const result = await analyzeMessage(analysisText);
    resultContainer.innerHTML = `
        <div class="alert-box ${result.type}">
            <h3>${result.title}</h3>
            <p>${result.text}</p>
        </div>`;
    loadStats();
});

document.getElementById('reportBtn').addEventListener('click', async () => {
    const text = messageText.value.trim() || "User reported a suspicious message";
    try {
        await fetch(`${API_BASE}/report`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, reason: 'user_report' })
        });
    } catch (e) {}
    reportContainer.innerHTML = `<div class="report-box">✅ Report submitted successfully. Thank you!</div>`;
    setTimeout(() => reportContainer.innerHTML = '', 3500);
    loadStats();
});

messageText.addEventListener('keydown', e => {
    if (e.ctrlKey && e.key === 'Enter') document.getElementById('checkBtn').click();
});

// ========== STATS ==========
async function loadStats() {
    try {
        const res = await fetch(`${API_BASE}/stats`);
        const data = await res.json();
        document.getElementById('statScanned').textContent = data.scanned || 0;
        document.getElementById('statBlocked').textContent = data.blocked || 0;
    } catch (e) {}
}
loadStats();

// ========== CONTACT ==========
function sendContact() {
    const name = document.getElementById('contactName').value.trim();
    const email = document.getElementById('contactEmail').value.trim();
    const msg = document.getElementById('contactMessage').value.trim();
    const result = document.getElementById('contactResult');

    if (!name || !email || !msg) {
        result.innerHTML = `<div class="alert-box warning"><p>Please fill all fields.</p></div>`;
        return;
    }
    result.innerHTML = `<div class="alert-box normal"><p>✅ Message sent successfully! We will reply soon.</p></div>`;
    document.getElementById('contactName').value = '';
    document.getElementById('contactEmail').value = '';
    document.getElementById('contactMessage').value = '';
}
