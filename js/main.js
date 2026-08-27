document.addEventListener('DOMContentLoaded', () => {
    // ---- UI Navigation Logic ----
    const navItems = document.querySelectorAll('.nav-links li');
    const toolSections = document.querySelectorAll('.tool-section');
    const titleElement = document.getElementById('current-tool-title');

    // ---- Mobile Menu Logic ----
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');

    function toggleMobileMenu() {
        if (sidebar && sidebarOverlay) {
            sidebar.classList.toggle('open');
            sidebarOverlay.classList.toggle('active');
        }
    }

    if (mobileMenuBtn && sidebarOverlay) {
        mobileMenuBtn.addEventListener('click', toggleMobileMenu);
        sidebarOverlay.addEventListener('click', toggleMobileMenu);
    }

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remove active from all nav items
            navItems.forEach(nav => nav.classList.remove('active'));
            // Add active to clicked nav item
            item.classList.add('active');

            // Hide all sections
            toolSections.forEach(section => {
                section.classList.remove('active-section');
            });

            // Show target section
            const targetId = item.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active-section');

            // Update Header Title
            titleElement.textContent = item.querySelector('span').textContent;

            // Close mobile menu if open
            if (sidebar && sidebar.classList.contains('open')) {
                toggleMobileMenu();
            }
        });
    });

    // ---- JSON Beautifier Logic ----
    const jsonInput = document.getElementById('json-input');
    const jsonOutput = document.getElementById('json-output');
    const btnFormat = document.getElementById('btn-format-json');
    const btnMinify = document.getElementById('btn-minify-json');
    const btnClear = document.getElementById('btn-clear-json');
    const btnCopyJson = document.getElementById('btn-copy-json');
    const statusBadge = document.getElementById('json-status');

    function processJson(action) {
        const rawData = jsonInput.value.trim();
        if (!rawData) return;

        try {
            const parsedData = JSON.parse(rawData);
            
            if (action === 'format') {
                jsonOutput.value = JSON.stringify(parsedData, null, 4);
            } else if (action === 'minify') {
                jsonOutput.value = JSON.stringify(parsedData);
            }

            statusBadge.textContent = 'Valid JSON';
            statusBadge.className = 'status-badge valid';
        } catch (e) {
            statusBadge.textContent = 'Invalid JSON';
            statusBadge.className = 'status-badge invalid';
            jsonOutput.value = e.message;
        }
    }

    btnFormat.addEventListener('click', () => processJson('format'));
    btnMinify.addEventListener('click', () => processJson('minify'));
    
    btnClear.addEventListener('click', () => {
        jsonInput.value = '';
        jsonOutput.value = '';
        statusBadge.className = 'status-badge';
    });

    btnCopyJson.addEventListener('click', () => {
        if (!jsonOutput.value) return;
        navigator.clipboard.writeText(jsonOutput.value).then(() => {
            const icon = btnCopyJson.querySelector('i');
            icon.className = 'fa-solid fa-check';
            setTimeout(() => {
                icon.className = 'fa-regular fa-copy';
            }, 2000);
        });
    });
});
