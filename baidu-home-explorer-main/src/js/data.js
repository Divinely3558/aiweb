// Trending topics data
const trendingTopics = [
    { rank: 1, title: "AI Technology Breakthrough", isHot: true, isNew: false },
    { rank: 2, title: "Climate Change Summit 2024", isHot: false, isNew: true },
    { rank: 3, title: "Space Exploration Updates", isHot: false, isNew: false },
    { rank: 4, title: "Economic Market Analysis", isHot: false, isNew: false },
    { rank: 5, title: "Digital Currency Trends", isHot: true, isNew: false },
    { rank: 6, title: "Renewable Energy Progress", isHot: false, isNew: true },
    { rank: 7, title: "Medical Research News", isHot: false, isNew: false },
    { rank: 8, title: "Technology Innovation", isHot: false, isNew: false }
];

// Navigation items
const navItems = [
    { name: "News", href: "#" },
    { name: "Images", href: "#" },
    { name: "Videos", href: "#" },
    { name: "Maps", href: "#" },
    { name: "Translate", href: "#" },
    { name: "Scholar", href: "#" }
];

// Export data for use in other scripts
window.appData = {
    trendingTopics,
    navItems
};