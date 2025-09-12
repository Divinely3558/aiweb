// Main application initialization
document.addEventListener('DOMContentLoaded', function() {
    console.log('Baidu Search app initialized');

    // Initialize components
    const searchBox = new window.components.SearchBox();
    const trendingTopics = new window.components.TrendingTopics('trendingGrid');
    const themeToggle = new window.components.ThemeToggle();

    // Render trending topics
    trendingTopics.render();

    // Add some interactive effects
    addInteractiveEffects();

    // Initialize keyboard shortcuts
    initKeyboardShortcuts();

    console.log('All components initialized successfully');
});

// Add interactive effects
function addInteractiveEffects() {
    // Add hover effects to nav links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        link.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    // Add click effect to buttons
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            this.classList.add('bounce');
            setTimeout(() => {
                this.classList.remove('bounce');
            }, 500);
        });
    });

    // Add focus effects to search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('focus', function() {
            this.parentElement.style.transform = 'scale(1.02)';
        });
        
        searchInput.addEventListener('blur', function() {
            this.parentElement.style.transform = 'scale(1)';
        });
    }
}

// Initialize keyboard shortcuts
function initKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Focus search on '/' key
        if (e.key === '/' && !isInputFocused()) {
            e.preventDefault();
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                searchInput.focus();
            }
        }
        
        // Escape to clear search
        if (e.key === 'Escape') {
            const searchInput = document.getElementById('searchInput');
            if (searchInput && searchInput === document.activeElement) {
                searchInput.blur();
                searchInput.value = '';
            }
        }
    });
}

// Utility function to check if an input is focused
function isInputFocused() {
    const activeElement = document.activeElement;
    return activeElement && (
        activeElement.tagName === 'INPUT' || 
        activeElement.tagName === 'TEXTAREA' || 
        activeElement.contentEditable === 'true'
    );
}

// Add some animation delays for trending topics
setTimeout(() => {
    const trendingItems = document.querySelectorAll('.trending-item');
    trendingItems.forEach((item, index) => {
        setTimeout(() => {
            item.classList.add('fade-in');
        }, index * 100);
    });
}, 500);

// Add window resize handler for responsive behavior
window.addEventListener('resize', function() {
    // Could add responsive logic here if needed
    console.log('Window resized');
});

// Export utilities for potential use
window.utils = {
    isInputFocused,
    addInteractiveEffects,
    initKeyboardShortcuts
};