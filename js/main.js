document.addEventListener('DOMContentLoaded', async () => {
    console.log('%c' + `
███╗   ██╗██╗   ██╗██████╗ ██████╗ ██╗███╗   ██╗███████╗
████╗  ██║╚██╗ ██╔╝██╔══██╗██╔══██╗██║████╗  ██║██╔════╝
██╔██╗ ██║ ╚████╔╝ ██████╔╝██████╔╝██║██╔██╗ ██║█████╗  
██║╚██╗██║  ╚██╔╝  ██╔══██╗██╔══██╗██║██║╚██╗██║██╔══╝  
██║ ╚████║   ██║   ██║  ██║██║  ██║██║██║ ╚████║███████╗
╚═╝  ╚═══╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝╚══════╝`, 'color: #FFB6C1; font-family: monospace; font-size: 12px; font-weight: bold;');
    console.log('%cContact me on Discord if there\'s any issues with this website!', 'color: #FFB6C1; font-size: 12px;');
    if (window.languageManager) {
        await window.languageManager.init();
    }
    lucide.createIcons();
    initializeSidebar();
    initializeSearch();
    initializeContentSections();
    initializeExpandableContent();
    initializeMobileMenu();
    initializeSmoothScroll();
    initializeEasterEgg();
});
function initializeSidebar() {
    const navItems = document.querySelectorAll('.nav-item.expandable');
    navItems.forEach(item => {
        const link = item.querySelector('.nav-link');
        link.addEventListener('click', (e) => {
            if (link.classList.contains('has-submenu')) {
                e.preventDefault();
                item.classList.toggle('expanded');
                lucide.createIcons();
            }
        });
    });
    const allNavLinks = document.querySelectorAll('.nav-link[data-section]');
    allNavLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            if (!link.classList.contains('has-submenu')) {
                e.preventDefault();
                const sectionId = link.getAttribute('data-section');
                showSection(sectionId);
                document.querySelectorAll('.nav-item').forEach(item => {
                    item.classList.remove('active');
                });
                link.closest('.nav-item').classList.add('active');
                document.querySelectorAll('.sub-nav a').forEach(a => a.classList.remove('active'));
            }
        });
    });
    const subNavLinks = document.querySelectorAll('.sub-nav a');
    subNavLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                const parentSection = targetElement.closest('.content-section');
                if (parentSection) {
                    showSection(parentSection.id);
                }
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                document.querySelectorAll('.sub-nav a').forEach(a => a.classList.remove('active'));
                link.classList.add('active');
                const parentNavItem = link.closest('.nav-item');
                if (parentNavItem) {
                    document.querySelectorAll('.nav-item').forEach(item => {
                        item.classList.remove('active');
                    });
                    parentNavItem.classList.add('active');
                }
            }
        });
    });
}
function showSection(sectionId) {
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}
function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchContainer = document.querySelector('.search-container');
    const clearButton = document.querySelector('.search-clear');
    let searchTimeout;
    let searchDropdown = null;
    function createSearchDropdown() {
        if (!searchDropdown) {
            searchDropdown = document.createElement('div');
            searchDropdown.className = 'search-dropdown';
            searchContainer.appendChild(searchDropdown);
        }
        return searchDropdown;
    }
    function updateClearButton() {
        if (searchInput.value.length > 0) {
            clearButton.style.display = 'flex';
        } else {
            clearButton.style.display = 'none';
        }
    }
    clearButton.addEventListener('click', () => {
        searchInput.value = '';
        updateClearButton();
        hideSearchDropdown();
        clearSearchHighlights();
        searchInput.focus();
    });
    document.addEventListener('click', (e) => {
        if (!searchContainer.contains(e.target)) {
            hideSearchDropdown();
        }
    });
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        const query = e.target.value.toLowerCase().trim();
        updateClearButton();
        if (query.length === 0) {
            hideSearchDropdown();
            clearSearchHighlights();
            return;
        }
        searchTimeout = setTimeout(() => {
            if (query.length > 0) {
                performSearch(query);
            }
        }, 1000);
    });
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const firstResult = document.querySelector('.search-result-item');
            if (firstResult) {
                firstResult.click();
            }
        }
    });
    searchInput.addEventListener('keydown', (e) => {
        const results = document.querySelectorAll('.search-result-item');
        const activeResult = document.querySelector('.search-result-item.active');
        let currentIndex = Array.from(results).indexOf(activeResult);
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            currentIndex = currentIndex < results.length - 1 ? currentIndex + 1 : 0;
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            currentIndex = currentIndex > 0 ? currentIndex - 1 : results.length - 1;
        } else {
            return;
        }
        results.forEach(r => r.classList.remove('active'));
        if (results[currentIndex]) {
            results[currentIndex].classList.add('active');
        }
    });
}
function performSearch(query) {
    clearSearchHighlights();
    const contentSections = document.querySelectorAll('.content-section');
    const searchResults = [];
    const searchPatterns = createSearchPatterns(query);
    contentSections.forEach(section => {
        const title = section.querySelector('h2')?.textContent || '';
        const textContent = section.textContent.toLowerCase();
        let matched = false;
        let matchedQuery = query;
        for (const pattern of searchPatterns) {
            if (textContent.includes(pattern)) {
                matched = true;
                matchedQuery = pattern;
                break;
            }
        }
        if (matched) {
            const fullText = section.textContent;
            const index = fullText.toLowerCase().indexOf(matchedQuery);
            const start = Math.max(0, index - 50);
            const end = Math.min(fullText.length, index + matchedQuery.length + 50);
            let snippet = fullText.substring(start, end).trim();
            if (start > 0) snippet = '...' + snippet;
            if (end < fullText.length) snippet = snippet + '...';
            searchResults.push({
                id: section.id,
                title: title,
                snippet: snippet,
                section: section,
                matchedQuery: matchedQuery
            });
        }
    });
    showSearchResults(searchResults, query);
}
function createSearchPatterns(query) {
    const patterns = [query];
    const compoundWords = {
        'selfharm': ['self-harm', 'self harm'],
        'self-harm': ['selfharm', 'self harm'],
        'self harm': ['selfharm', 'self-harm'],
        'cyberbullying': ['cyber-bullying', 'cyber bullying'],
        'cyber-bullying': ['cyberbullying', 'cyber bullying'],
        'cyber bullying': ['cyberbullying', 'cyber-bullying'],
        'doxxing': ['doxing'],
        'doxing': ['doxxing'],
        'ai': ['artificial intelligence', 'a.i.'],
        'artificialintelligence': ['artificial intelligence', 'ai', 'a.i.'],
        'artificial intelligence': ['ai', 'a.i.'],
        'tos': ['terms of service'],
        'termsofservice': ['terms of service', 'tos'],
        'terms of service': ['tos'],
        'ocsn': ['oc social network', 'oc sn'],
        'oc social network': ['ocsn'],
        'fandoms': ['fandom'],
        'fandom': ['fandoms'],
        'screenshots': ['screenshot', 'screen shots'],
        'screenshot': ['screenshots', 'screen shot'],
        'username': ['user name'],
        'user name': ['username'],
        'email': ['e-mail'],
        'e-mail': ['email']
    };
    if (compoundWords[query]) {
        patterns.push(...compoundWords[query]);
    }
    if (query.includes('-')) {
        patterns.push(query.replace(/-/g, ''));
        patterns.push(query.replace(/-/g, ' '));
    }
    if (query.includes(' ')) {
        patterns.push(query.replace(/ /g, ''));
        patterns.push(query.replace(/ /g, '-'));
    }
    if (!query.includes(' ') && !query.includes('-') && query.length > 6) {
        const commonPrefixes = ['self', 'cyber', 'anti', 'auto', 'multi', 'over', 'under', 'super'];
        for (const prefix of commonPrefixes) {
            if (query.startsWith(prefix)) {
                const remainder = query.substring(prefix.length);
                patterns.push(`${prefix}-${remainder}`);
                patterns.push(`${prefix} ${remainder}`);
            }
        }
    }
    return [...new Set(patterns)]; 
}
function showSearchResults(results, query) {
    const dropdown = createSearchDropdown();
    if (results.length === 0) {
        dropdown.innerHTML = `
            <div class="search-no-results">
                <i data-lucide="x-circle"></i>
                <span>No results found for "${escapeHtml(query)}"</span>
            </div>
        `;
    } else {
        dropdown.innerHTML = results.map((result, index) => `
            <div class="search-result-item ${index === 0 ? 'active' : ''}" data-section="${result.id}">
                <div class="search-result-title">
                    <i data-lucide="file-text"></i>
                    <span>${escapeHtml(result.title)}</span>
                </div>
                <div class="search-result-snippet">
                    ${highlightSnippet(result.snippet, query)}
                </div>
            </div>
        `).join('');
        dropdown.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', () => {
                const sectionId = item.getAttribute('data-section');
                navigateToSection(sectionId);
                hideSearchDropdown();
                document.getElementById('searchInput').value = '';
                clearSearchHighlights();
            });
            item.addEventListener('mouseenter', () => {
                dropdown.querySelectorAll('.search-result-item').forEach(r => r.classList.remove('active'));
                item.classList.add('active');
            });
        });
    }
    dropdown.style.display = 'block';
    setTimeout(() => {
        dropdown.classList.add('show');
        lucide.createIcons();
    }, 10);
}
function navigateToSection(sectionId) {
    showSection(sectionId);
    const navLink = document.querySelector(`[data-section="${sectionId}"]`);
    if (navLink) {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        navLink.closest('.nav-item').classList.add('active');
    }
}
function hideSearchDropdown() {
    const dropdown = document.querySelector('.search-dropdown');
    if (dropdown) {
        dropdown.classList.remove('show');
        setTimeout(() => {
            dropdown.style.display = 'none';
        }, 300);
    }
}
function createSearchDropdown() {
    let dropdown = document.querySelector('.search-dropdown');
    if (!dropdown) {
        dropdown = document.createElement('div');
        dropdown.className = 'search-dropdown';
        document.querySelector('.search-container').appendChild(dropdown);
    }
    return dropdown;
}
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
function highlightSnippet(snippet, query) {
    const patterns = createSearchPatterns(query);
    let highlightedSnippet = snippet;
    patterns.forEach(pattern => {
        const regex = new RegExp(`(${escapeRegExp(pattern)})`, 'gi');
        highlightedSnippet = highlightedSnippet.replace(regex, '<mark>$1</mark>');
    });
    return highlightedSnippet;
}
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
function clearSearchHighlights() {
    const highlights = document.querySelectorAll('.search-highlight');
    highlights.forEach(highlight => {
        const parent = highlight.parentNode;
        parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
        parent.normalize();
    });
}
function initializeExpandableContent() {
    const expandButtons = document.querySelectorAll('.expand-btn');
    expandButtons.forEach(button => {
        button.addEventListener('click', () => {
            const container = button.closest('.expandable-content');
            container.classList.toggle('expanded');
            const isExpanded = container.classList.contains('expanded');
            const buttonText = isExpanded ? 'Less information' : 'More information';
            button.innerHTML = `<i data-lucide="info"></i> ${buttonText}`;
            lucide.createIcons();
        });
    });
}
function initializeEasterEgg() {
    const logo = document.querySelector('.logo');
    if (!logo) return;
    
    let clickCount = 0;
    let clickTimer = null;
    
    logo.style.cursor = 'pointer';
    
    logo.addEventListener('click', (e) => {
        e.preventDefault();
        clickCount++;
        
        if (clickTimer) clearTimeout(clickTimer);
        
        clickTimer = setTimeout(() => {
            clickCount = 0;
        }, 10000);
        
        if (clickCount === 5) {
            clickCount = 0;
            clearTimeout(clickTimer);
            
            const existingEasterEgg = document.querySelector('.easter-egg-container');
            if (existingEasterEgg) return;
            
            const container = document.createElement('div');
            container.className = 'easter-egg-container';
            container.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                pointer-events: none;
            `;
            
            const img = document.createElement('img');
            img.src = './assets/frappppperchino.png';
            img.style.cssText = `
                max-width: 80%;
                max-height: 80%;
                object-fit: contain;
                animation: ominousFadeIn 2s ease-in-out, ominousFloat 4s ease-in-out infinite;
                filter: drop-shadow(0 0 30px rgba(0, 0, 0, 0.8));
            `;
            
            const style = document.createElement('style');
            style.textContent = `
                @keyframes ominousFadeIn {
                    0% {
                        opacity: 0;
                        transform: scale(0.5) rotate(-10deg);
                    }
                    50% {
                        opacity: 1;
                        transform: scale(1.1) rotate(5deg);
                    }
                    100% {
                        opacity: 1;
                        transform: scale(1) rotate(0deg);
                    }
                }
                
                @keyframes ominousFloat {
                    0%, 100% {
                        transform: translateY(0) scale(1);
                    }
                    25% {
                        transform: translateY(-20px) scale(1.02) rotate(2deg);
                    }
                    75% {
                        transform: translateY(20px) scale(0.98) rotate(-2deg);
                    }
                }
                
                @keyframes ominousFadeOut {
                    0% {
                        opacity: 1;
                        transform: scale(1) rotate(0deg);
                    }
                    100% {
                        opacity: 0;
                        transform: scale(1.5) rotate(20deg);
                        filter: blur(10px) drop-shadow(0 0 50px rgba(0, 0, 0, 1));
                    }
                }
            `;
            
            document.head.appendChild(style);
            container.appendChild(img);
            document.body.appendChild(container);
            
            setTimeout(() => {
                img.style.animation = 'ominousFadeOut 1.5s ease-in-out forwards';
                
                setTimeout(() => {
                    container.remove();
                    style.remove();
                }, 1500);
            }, 5000);
        }
    });
}

function initializeMobileMenu() {
    const mobileToggle = document.createElement('button');
    mobileToggle.className = 'mobile-menu-toggle';
    mobileToggle.innerHTML = '<i data-lucide="menu"></i>';
    mobileToggle.setAttribute('aria-label', 'Toggle menu');
    const navLeft = document.querySelector('.nav-left');
    navLeft.insertBefore(mobileToggle, navLeft.firstChild);
    const overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    document.body.appendChild(overlay);
    mobileToggle.addEventListener('click', () => {
        const sidebar = document.querySelector('.sidebar');
        sidebar.classList.toggle('mobile-open');
        overlay.classList.toggle('active');
        lucide.createIcons();
    });
    overlay.addEventListener('click', () => {
        const sidebar = document.querySelector('.sidebar');
        sidebar.classList.remove('mobile-open');
        overlay.classList.remove('active');
    });
    if (window.innerWidth <= 1024) {
        const navLinks = document.querySelectorAll('.nav-link:not(.has-submenu)');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                const sidebar = document.querySelector('.sidebar');
                sidebar.classList.remove('mobile-open');
                overlay.classList.remove('active');
            });
        });
    }
    lucide.createIcons();
}
function initializeSmoothScroll() {
    document.addEventListener('click', (e) => {
        if (e.target.tagName === 'A' && e.target.getAttribute('href')?.startsWith('#')) {
            e.preventDefault();
            const targetId = e.target.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                });
            }
        }
    });
}
function initializeContentSections() {
    if (window.location.hash) {
        const targetId = window.location.hash.substring(1);
        const targetSection = document.getElementById(targetId);
        if (targetSection && targetSection.classList.contains('content-section')) {
            showSection(targetId);
            const navLink = document.querySelector(`[data-section="${targetId}"]`);
            if (navLink) {
                document.querySelectorAll('.nav-item').forEach(item => {
                    item.classList.remove('active');
                });
                navLink.closest('.nav-item').classList.add('active');
            }
        }
    }
}
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);