// Toast component functionality
class Toast {
    constructor() {
        this.element = document.getElementById('toast');
        this.titleElement = document.getElementById('toastTitle');
        this.descriptionElement = document.getElementById('toastDescription');
    }

    show(title, description, duration = 3000) {
        this.titleElement.textContent = title;
        this.descriptionElement.textContent = description;
        
        this.element.classList.remove('hidden');
        this.element.classList.add('fade-in');
        
        setTimeout(() => {
            this.hide();
        }, duration);
    }

    hide() {
        this.element.classList.add('hidden');
        this.element.classList.remove('fade-in');
    }
}

// Trending Topics component
class TrendingTopics {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.topics = window.appData.trendingTopics;
    }

    render() {
        if (!this.container) return;

        this.container.innerHTML = this.topics.map(topic => `
            <div class="trending-item" data-rank="${topic.rank}">
                <span class="trending-item-rank">${topic.rank}</span>
                <span class="trending-item-title">${topic.title}</span>
                ${topic.isHot ? '<span class="trending-item-badge badge-hot">Hot</span>' : ''}
                ${topic.isNew ? '<span class="trending-item-badge badge-new">New</span>' : ''}
            </div>
        `).join('');

        // Add click handlers
        this.container.querySelectorAll('.trending-item').forEach(item => {
            item.addEventListener('click', () => {
                const title = item.querySelector('.trending-item-title').textContent;
                this.handleTopicClick(title);
            });
        });
    }

    handleTopicClick(title) {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.value = title;
        }
        
        const toast = new Toast();
        toast.show('Topic Selected', `Searching for: "${title}"`);
    }
}

// Search functionality
class SearchBox {
    constructor() {
        this.form = document.getElementById('searchForm');
        this.input = document.getElementById('searchInput');
        this.toast = new Toast();
        
        this.bindEvents();
    }

    bindEvents() {
        if (this.form) {
            this.form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSearch();
            });
        }

        // Voice search button
        const voiceBtn = document.querySelector('[title="Voice search"]');
        if (voiceBtn) {
            voiceBtn.addEventListener('click', () => {
                this.handleVoiceSearch();
            });
        }

        // Image search button
        const imageBtn = document.querySelector('[title="Search by image"]');
        if (imageBtn) {
            imageBtn.addEventListener('click', () => {
                this.handleImageSearch();
            });
        }

        // Lucky button
        const luckyBtn = document.querySelector('.btn-secondary');
        if (luckyBtn) {
            luckyBtn.addEventListener('click', () => {
                this.handleLuckySearch();
            });
        }
    }

    handleSearch() {
        const query = this.input.value.trim();
        if (!query) return;

        this.toast.show('Searching...', `Looking for: "${query}"`);
        
        // Add some visual feedback
        this.input.style.transform = 'scale(1.02)';
        setTimeout(() => {
            this.input.style.transform = 'scale(1)';
        }, 150);
    }

    handleVoiceSearch() {
        this.toast.show('Voice Search', 'Voice search functionality would be implemented here');
    }

    handleImageSearch() {
        this.toast.show('Image Search', 'Image search functionality would be implemented here');
    }

    handleLuckySearch() {
        const luckySearches = [
            'Latest technology news',
            'Beautiful landscapes',
            'Interesting facts',
            'Science discoveries',
            'Art inspiration'
        ];
        
        const randomSearch = luckySearches[Math.floor(Math.random() * luckySearches.length)];
        this.input.value = randomSearch;
        this.toast.show("I'm Feeling Lucky!", `Random search: "${randomSearch}"`);
    }
}

// Theme toggle functionality (optional)
class ThemeToggle {
    constructor() {
        this.currentTheme = localStorage.getItem('theme') || 'dark';
        this.applyTheme();
    }

    toggle() {
        this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.applyTheme();
        localStorage.setItem('theme', this.currentTheme);
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
    }
}

// Export components for use in main.js
window.components = {
    Toast,
    TrendingTopics,
    SearchBox,
    ThemeToggle
};