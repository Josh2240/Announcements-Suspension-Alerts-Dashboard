(function () {
    const searchInput = document.getElementById('searchInput');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const alertsContainer = document.getElementById('alertsContainer');
    const emptyState = document.getElementById('emptyState');
    const lastUpdated = document.getElementById('lastUpdated');
    const refreshBtn = document.getElementById('refreshBtn');
    const addForm = document.getElementById('addForm');
    const formMsg = document.getElementById('formMsg');

    let activeFilter = 'all';
    let query = '';

    function formatTime(d) {
        return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }

    function escapeHtml(s) {
        return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        }[c]));
    }

    function applyFilters() {
        const q = query.trim().toLowerCase();
        const cards = alertsContainer.querySelectorAll('.card');
        let anyVisible = false;

        cards.forEach(card => {
            const province = card.dataset.province;
            const matchesProvince = activeFilter === 'all' || province === activeFilter;
            let cardVisible = false;

            card.querySelectorAll('.suspension-list li').forEach(li => {
                const text = li.textContent.toLowerCase();
                const visible = (q === '' || text.includes(q)) && matchesProvince;
                li.classList.toggle('hidden', !visible);
                if (visible) cardVisible = true;
            });

            card.classList.toggle('hidden', !cardVisible);
            if (cardVisible) anyVisible = true;
        });

        emptyState.classList.toggle('hidden', anyVisible);
    }

    function updateLastUpdated() {
        lastUpdated.textContent = 'Last updated: ' + formatTime(new Date());
    }

    async function loadSuspensions() {
        const params = new URLSearchParams();
        if (activeFilter !== 'all') params.set('province', activeFilter);
        if (query.trim()) params.set('q', query.trim());
        const res = await fetch('/api/suspensions?' + params.toString());
        const data = await res.json();

        const byProvince = {};
        data.forEach(s => {
            if (!byProvince[s.province]) byProvince[s.province] = [];
            byProvince[s.province].push(s);
        });

        alertsContainer.querySelectorAll('.card').forEach(c => c.remove());
        Object.keys(byProvince).forEach(prov => {
            const list = byProvince[prov];
            const card = document.createElement('article');
            card.className = 'card province';
            card.dataset.province = prov;
            card.innerHTML = `
                <header class="card-header">
                    <h3>${escapeHtml(prov)} Province</h3>
                    <span class="count">${list.length} suspension${list.length === 1 ? '' : 's'}</span>
                </header>
                <ul class="suspension-list">
                    ${list.map(s => `
                        <li data-id="${s.id}">
                            <span class="muni">${escapeHtml(s.municipality)}</span>
                            <span class="level">
                                ${escapeHtml(s.level)}${s.modality ? ' — ' + escapeHtml(s.modality) : ''}${s.until_date ? ` <span class="until">(until ${escapeHtml(s.until_date)})</span>` : ''}
                                <button class="del-btn" data-id="${s.id}" title="Remove">✕</button>
                            </span>
                        </li>
                    `).join('')}
                </ul>
            `;
            alertsContainer.appendChild(card);
        });

        updateLastUpdated();
        applyFilters();
    }

    async function deleteSuspension(id, btn) {
        if (!confirm('Remove this suspension entry?')) return;
        btn.disabled = true;
        const res = await fetch('/api/suspensions/' + id, { method: 'DELETE' });
        if (res.ok) {
            await loadSuspensions();
        } else {
            btn.disabled = false;
            alert('Failed to delete.');
        }
    }

    async function addSuspension(form) {
        const data = Object.fromEntries(new FormData(form).entries());
        formMsg.textContent = '';
        formMsg.className = 'form-msg';
        const res = await fetch('/api/suspensions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (res.ok) {
            form.reset();
            formMsg.textContent = '✓ Suspension added.';
            formMsg.classList.add('success');
            await loadSuspensions();
        } else {
            const err = await res.json().catch(() => ({}));
            formMsg.textContent = '✕ ' + (err.error || 'Failed to add.');
            formMsg.classList.add('error');
        }
    }

    function init() {
        searchInput.addEventListener('input', (e) => {
            query = e.target.value;
            loadSuspensions();
        });

        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                activeFilter = btn.dataset.filter;
                loadSuspensions();
            });
        });

        refreshBtn.addEventListener('click', loadSuspensions);

        alertsContainer.addEventListener('click', (e) => {
            const btn = e.target.closest('.del-btn');
            if (btn) deleteSuspension(btn.dataset.id, btn);
        });

        addForm.addEventListener('submit', (e) => {
            e.preventDefault();
            addSuspension(addForm);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();