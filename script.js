(function () {
    const searchInput = document.getElementById('searchInput');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.alerts .card');
    const items = document.querySelectorAll('.suspension-list li');
    const datePill = document.getElementById('datePill');
    const lastUpdated = document.getElementById('lastUpdated');
    const refreshBtn = document.getElementById('refreshBtn');

    let activeFilter = 'all';
    let query = '';

    function formatDate(d) {
        return d.toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
    }

    function formatTime(d) {
        return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }

    function applyFilters() {
        const q = query.trim().toLowerCase();

        cards.forEach(card => {
            const province = card.dataset.province;
            const matchesProvince = activeFilter === 'all' || province === activeFilter;
            let matchesSearch = true;
            let anyVisible = false;

            const listItems = card.querySelectorAll('.suspension-list li');
            listItems.forEach(li => {
                const text = li.textContent.toLowerCase();
                const visible = (q === '' || text.includes(q)) && matchesProvince;
                li.style.display = visible ? '' : 'none';
                if (visible) anyVisible = true;
            });

            card.classList.toggle('hidden', !anyVisible);
        });
    }

    function setUpdatedNow() {
        const now = new Date();
        lastUpdated.textContent = 'Last updated: ' + formatTime(now);
    }

    function init() {
        const now = new Date();
        datePill.textContent = formatDate(now);
        setUpdatedNow();

        searchInput.addEventListener('input', (e) => {
            query = e.target.value;
            applyFilters();
        });

        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                activeFilter = btn.dataset.filter;
                applyFilters();
            });
        });

        refreshBtn.addEventListener('click', () => {
            refreshBtn.disabled = true;
            refreshBtn.textContent = '⏳ Refreshing…';
            setTimeout(() => {
                setUpdatedNow();
                applyFilters();
                refreshBtn.disabled = false;
                refreshBtn.textContent = '↻ Refresh';
            }, 600);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();