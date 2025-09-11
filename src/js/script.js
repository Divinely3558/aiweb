// 优化点：
// 1. 移除重复声明 let favorites = [];
// 2. 删除未使用的 addFavorite/loadFavorites/saveFavorites/initIconUpload/resetIconSelection/updateFavoritesUI 等旧函数
// 3. 收藏栏渲染统一用 renderFavorites
// 4. 收藏图标支持 base64 或 favicon
// 5. 收藏栏右键删除逻辑优化
// 6. 代码结构更清晰，避免全局污染

// 封装DOM元素获取
function getDOM() {
  return {
    canvas: document.getElementById("particle-canvas"),
    settingsBtn: document.getElementById("settingsBtn"),
    resetBgBtn: document.getElementById("resetBgBtn"),
    settingsMenu: document.getElementById("settingsMenu"),
    settingsContainer: document.getElementById("settingsContainer"),
    backgroundLayers: document.querySelectorAll(".fixed.inset-0.z-0"),
    searchForm: document.getElementById("searchForm"),
    searchInput: document.getElementById("searchInput"),
    searchHistory: document.getElementById("searchHistory"),
    historyList: document.getElementById("historyList"),
    clearHistoryBtn: document.getElementById("clearHistory"),
    addFavoriteBtn: document.getElementById("addFavoriteBtn"),
    addFavoriteDialog: document.getElementById("addFavoriteDialog"),
    dialogOverlay: document.getElementById("dialogOverlay"),
    cancelAddFavorite: document.getElementById("cancelAddFavorite"),
    confirmAddFavorite: document.getElementById("confirmAddFavorite"),
    favoriteName: document.getElementById("favoriteName"),
    favoriteUrl: document.getElementById("favoriteUrl"),
    favoritesBar: document.getElementById("favoritesBar"),
    selectedIcon: document.getElementById("selectedIcon"),
    uploadIcon: document.getElementById("uploadIcon"),
    iconPreview: document.getElementById("iconPreview"),
    previewImg: document.getElementById("previewImg"),
    uploadArea: document.getElementById("uploadArea"),
  };
}

let DOM;
let isCustomWallpaperActive = false;
let customWallpaperElement = null;
let fileInput = null;
const STORAGE_KEY = "custom-wallpaper";
const MAX_HISTORY_ITEMS = 10;
let searchHistory = [];
let favorites = [];

document.addEventListener("DOMContentLoaded", () => {
  DOM = getDOM();

  // 左下角按钮容器
  const leftBottomContainer = document.getElementById("leftBottomContainer");
  const changeWallpaperBtn = document.getElementById("changeWallpaperBtn");
  const resetBgBtn = document.getElementById("resetBgBtn");
  const addFavoriteBtn = document.getElementById("addFavoriteBtn");

  // 更换壁纸
  fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "image/*";
  fileInput.style.display = "none";
  fileInput.addEventListener("change", handleFileSelection);
  document.body.appendChild(fileInput);

  if (changeWallpaperBtn) {
    changeWallpaperBtn.addEventListener("click", () => fileInput.click());
  }
  if (resetBgBtn) {
    resetBgBtn.addEventListener("click", resetBackground);
  }
  if (addFavoriteBtn) {
    addFavoriteBtn.addEventListener("click", () => {
      if (DOM.favoriteName && DOM.favoriteUrl) {
        DOM.favoriteName.value = "";
        DOM.favoriteUrl.value = "";
        DOM.favoriteName.focus();
      }
      if (DOM.previewImg) DOM.previewImg.src = "";
      if (DOM.iconPreview) DOM.iconPreview.classList.add("hidden");
      if (DOM.dialogOverlay && DOM.addFavoriteDialog) {
        DOM.dialogOverlay.classList.remove("hidden");
        DOM.addFavoriteDialog.classList.remove("hidden");
      }
    });
  }

  // 鼠标悬停显示
  leftBottomContainer.addEventListener("mouseenter", () => {
    leftBottomContainer.classList.add("opacity-100");
  });
  leftBottomContainer.addEventListener("mouseleave", () => {
    leftBottomContainer.classList.remove("opacity-100");
  });

  // 初始化功能
  initParticles();
  if (DOM.searchForm && DOM.searchInput) initSearchFunctionality();
  initFavoritesFunctionality();
  restoreWallpaperFromStorage(); // 保证刷新后壁纸不消失
});

// 壁纸相关
function handleFileSelection(event) {
  const file = event.target.files[0];
  if (!file || !file.type.startsWith("image/")) {
    alert("请选择图片文件");
    return;
  }
  const reader = new FileReader();
  reader.onload = function (e) {
    setCustomWallpaper(e.target.result);
    saveWallpaperToStorage(e.target.result);
    fileInput.value = "";
  };
  reader.readAsDataURL(file);
}

function setCustomWallpaper(imageData) {
  document.querySelectorAll(".custom-wallpaper").forEach((el) => el.remove());
  customWallpaperElement = null;
  DOM.backgroundLayers.forEach((layer) => layer.classList.add("hidden"));
  DOM.canvas.classList.add("hidden");
  customWallpaperElement = document.createElement("div");
  customWallpaperElement.className =
    "fixed inset-0 z-0 bg-cover bg-center custom-wallpaper";
  customWallpaperElement.style.backgroundImage = `url('${imageData}')`;
  document.body.prepend(customWallpaperElement);
  const glassEffect = document.createElement("div");
  glassEffect.className =
    "fixed inset-0 z-5 bg-black/40 backdrop-blur-sm custom-wallpaper";
  document.body.prepend(glassEffect);
  isCustomWallpaperActive = true;
}

function saveWallpaperToStorage(imageData) {
  try {
    localStorage.setItem(STORAGE_KEY, imageData);
  } catch (error) {
    console.error("保存壁纸到本地存储失败:", error);
  }
}

function restoreWallpaperFromStorage() {
  try {
    const savedWallpaper = localStorage.getItem(STORAGE_KEY);
    if (savedWallpaper) {
      setCustomWallpaper(savedWallpaper);
    }
  } catch (error) {
    console.error("从本地存储恢复壁纸失败:", error);
  }
}

function resetBackground() {
  document.querySelectorAll(".custom-wallpaper").forEach((el) => el.remove());
  customWallpaperElement = null;
  DOM.backgroundLayers.forEach((layer) => layer.classList.remove("hidden"));
  DOM.canvas.classList.remove("hidden");
  isCustomWallpaperActive = false;
  localStorage.removeItem(STORAGE_KEY);
}

// 搜索相关
function initSearchFunctionality() {
  loadSearchHistory();
  DOM.searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const query = DOM.searchInput.value.trim();
    if (query) {
      addToSearchHistory(query);
      window.open(
        `https://www.baidu.com/s?wd=${encodeURIComponent(query)}`,
        "_self"
      );
    }
  });
  DOM.searchInput.addEventListener("focus", () => {
    updateSearchHistoryUI();
    DOM.searchHistory.classList.remove("hidden");
  });
  document.addEventListener("click", (e) => {
    if (
      !DOM.searchForm.contains(e.target) &&
      !DOM.searchHistory.contains(e.target)
    ) {
      DOM.searchHistory.classList.add("hidden");
    }
  });
  DOM.clearHistoryBtn.addEventListener("click", () => {
    if (confirm("确定要清除所有搜索历史吗？")) clearSearchHistory();
  });
}

function loadSearchHistory() {
  try {
    const saved = localStorage.getItem("searchHistory");
    searchHistory = saved ? JSON.parse(saved) : [];
  } catch (e) {
    searchHistory = [];
  }
}

function saveSearchHistory() {
  try {
    localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
  } catch (e) {
    console.error("保存搜索历史失败:", e);
  }
}

function addToSearchHistory(query) {
  searchHistory = searchHistory.filter((item) => item !== query);
  searchHistory.unshift(query);
  if (searchHistory.length > MAX_HISTORY_ITEMS) {
    searchHistory = searchHistory.slice(0, MAX_HISTORY_ITEMS);
  }
  saveSearchHistory();
  updateSearchHistoryUI();
}

function clearSearchHistory() {
  searchHistory = [];
  saveSearchHistory();
  updateSearchHistoryUI();
}

function updateSearchHistoryUI() {
  DOM.historyList.innerHTML = "";
  if (searchHistory.length === 0) {
    const emptyItem = document.createElement("li");
    emptyItem.className = "px-3 py-2 text-gray-400 text-sm text-left";
    emptyItem.textContent = "暂无搜索历史";
    DOM.historyList.appendChild(emptyItem);
    DOM.clearHistoryBtn.classList.add("hidden");
  } else {
    DOM.clearHistoryBtn.classList.remove("hidden");
    searchHistory.forEach((item) => {
      const historyItem = document.createElement("li");
      historyItem.className =
        "px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer text-left";
      historyItem.textContent = item;
      historyItem.addEventListener("click", () => {
        DOM.searchInput.value = item;
        DOM.searchForm.dispatchEvent(new Event("submit"));
      });
      DOM.historyList.appendChild(historyItem);
    });
  }
}

// 收藏相关
function initFavoritesFunctionality() {
  if (
    !DOM.addFavoriteBtn ||
    !DOM.addFavoriteDialog ||
    !DOM.dialogOverlay ||
    !DOM.cancelAddFavorite ||
    !DOM.confirmAddFavorite ||
    !DOM.favoritesBar
  )
    return;
  loadFavoritesFromStorage();
  DOM.addFavoriteBtn.addEventListener("click", () => {
    if (DOM.favoriteName && DOM.favoriteUrl) {
      DOM.favoriteName.value = "";
      DOM.favoriteUrl.value = "";
      DOM.favoriteName.focus();
    }
    if (DOM.previewImg) DOM.previewImg.src = "";
    if (DOM.iconPreview) DOM.iconPreview.classList.add("hidden");
    if (DOM.dialogOverlay && DOM.addFavoriteDialog) {
      DOM.dialogOverlay.classList.remove("hidden");
      DOM.addFavoriteDialog.classList.remove("hidden");
    }
  });
  DOM.cancelAddFavorite.addEventListener("click", closeAddFavoriteDialog);
  DOM.confirmAddFavorite.addEventListener("click", handleAddFavorite);
  DOM.dialogOverlay.addEventListener("click", function (e) {
    if (e.target === DOM.dialogOverlay) closeAddFavoriteDialog();
  });
  if (DOM.uploadArea && DOM.uploadIcon && DOM.previewImg && DOM.iconPreview) {
    DOM.uploadArea.addEventListener("click", () => DOM.uploadIcon.click());
    DOM.uploadIcon.addEventListener("change", function (e) {
      const file = e.target.files[0];
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        alert("请上传图片文件");
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        alert("图片文件大小不能超过2MB");
        return;
      }
      const reader = new FileReader();
      reader.onload = function (ev) {
        DOM.previewImg.src = ev.target.result;
        DOM.iconPreview.classList.remove("hidden");
      };
      reader.readAsDataURL(file);
    });
    // 拖拽上传
    DOM.uploadArea.addEventListener("dragover", function (e) {
      e.preventDefault();
      this.classList.add("bg-primary/10");
    });
    DOM.uploadArea.addEventListener("dragleave", function () {
      this.classList.remove("bg-primary/10");
    });
    DOM.uploadArea.addEventListener("drop", function (e) {
      e.preventDefault();
      this.classList.remove("bg-primary/10");
      const file = e.dataTransfer.files[0];
      if (file) {
        DOM.uploadIcon.files = e.dataTransfer.files;
        DOM.uploadIcon.dispatchEvent(new Event("change"));
      }
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !DOM.dialogOverlay.classList.contains("hidden")) {
      closeAddFavoriteDialog();
    }
  });
  renderFavorites();
}

function loadFavoritesFromStorage() {
  try {
    const storedFavorites = localStorage.getItem("favorites");
    favorites = storedFavorites ? JSON.parse(storedFavorites) : [];
  } catch (error) {
    favorites = [];
  }
}

function saveFavoritesToStorage() {
  try {
    localStorage.setItem("favorites", JSON.stringify(favorites));
    return true;
  } catch (error) {
    return false;
  }
}

function handleAddFavorite() {
  if (!DOM.favoriteName || !DOM.favoriteUrl) return;
  const name = DOM.favoriteName.value.trim();
  const url = DOM.favoriteUrl.value.trim();
  if (!name || !url) {
    alert("请输入网站名称和网址");
    return;
  }
  let validUrl = url;
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    validUrl = "https://" + url;
  }
  try {
    new URL(validUrl);
  } catch (error) {
    alert("请输入有效的网址");
    return;
  }
  let iconUrl = getFaviconUrl(validUrl);
  if (
    DOM.previewImg &&
    DOM.previewImg.src &&
    DOM.previewImg.src !== window.location.href
  ) {
    iconUrl = DOM.previewImg.src;
  }
  const newFavorite = {
    id: Date.now().toString(),
    name: name,
    url: validUrl,
    icon: iconUrl,
    createdAt: new Date().toISOString(),
  };
  favorites.push(newFavorite);
  if (saveFavoritesToStorage()) {
    renderFavorites();
    closeAddFavoriteDialog();
    showNotification("收藏添加成功");
  } else {
    alert("保存收藏失败，请稍后再试");
  }
}

function getFaviconUrl(url) {
  try {
    const urlObj = new URL(url);
    return `${urlObj.protocol}//${urlObj.hostname}/favicon.ico`;
  } catch (error) {
    return "src/png/home.png";
  }
}

function closeAddFavoriteDialog() {
  if (DOM.addFavoriteDialog) DOM.addFavoriteDialog.classList.add("hidden");
  if (DOM.dialogOverlay) DOM.dialogOverlay.classList.add("hidden");
  if (DOM.favoriteName) DOM.favoriteName.value = "";
  if (DOM.favoriteUrl) DOM.favoriteUrl.value = "";
  if (DOM.uploadIcon) DOM.uploadIcon.value = "";
  if (DOM.previewImg && DOM.iconPreview) {
    DOM.previewImg.src = "";
    DOM.iconPreview.classList.add("hidden");
  }
}

function showNotification(message) {
  let notification = document.getElementById("notification");
  if (!notification) {
    notification = document.createElement("div");
    notification.id = "notification";
    notification.className =
      "fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-dark/90 text-white px-4 py-2 rounded-lg shadow-lg z-50 opacity-0 transition-opacity duration-300";
    document.body.appendChild(notification);
  }
  notification.textContent = message;
  notification.classList.remove("opacity-0");
  notification.classList.add("opacity-100");
  setTimeout(() => {
    notification.classList.remove("opacity-100");
    notification.classList.add("opacity-0");
  }, 3000);
}

// 收藏栏渲染
function renderFavorites() {
  if (!DOM.favoritesBar) return;
  DOM.favoritesBar.innerHTML = "";
  favorites.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  favorites.forEach((favorite) => {
    const favoriteItem = document.createElement("div");
    favoriteItem.className = "flex flex-col items-center justify-center group";
    favoriteItem.setAttribute("data-id", favorite.id);
    const iconContainer = document.createElement("div");
    iconContainer.className =
      "w-12 h-12 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center mb-1 transition-all duration-300 group-hover:bg-white/20 overflow-hidden";
    const icon = document.createElement("img");
    icon.src = favorite.icon;
    icon.alt = favorite.name;
    icon.className = "w-8 h-8 object-contain";
    const nameTag = document.createElement("span");
    nameTag.className =
      "text-xs text-white/80 max-w-[80px] truncate text-center";
    nameTag.textContent = favorite.name;
    iconContainer.appendChild(icon);
    favoriteItem.appendChild(iconContainer);
    favoriteItem.appendChild(nameTag);
    favoriteItem.addEventListener("click", () => {
      window.open(favorite.url, "_blank");
    });
    favoriteItem.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      if (confirm(`确定要删除收藏"${favorite.name}"吗？`)) {
        favorites = favorites.filter((item) => item.id !== favorite.id);
        saveFavoritesToStorage();
        renderFavorites();
        showNotification("收藏已删除");
      }
    });
    DOM.favoritesBar.appendChild(favoriteItem);
  });
}

// 粒子背景
function initParticles() {
  if (!DOM.canvas) return;
  const ctx = DOM.canvas.getContext("2d");
  let particlesArray = [];
  let mouse = { x: null, y: null, radius: 100 };
  function resizeCanvas() {
    DOM.canvas.width = window.innerWidth;
    DOM.canvas.height = window.innerHeight;
    initParticlesArray();
  }
  class Particle {
    constructor() {
      this.x = Math.random() * DOM.canvas.width;
      this.y = Math.random() * DOM.canvas.height;
      this.size = Math.random() * 2 + 1;
      this.speedX = (Math.random() - 0.5) * 0.3;
      this.speedY = (Math.random() - 0.5) * 0.3;
      const colors = [
        `rgba(59, 130, 246, ${Math.random() * 0.6 + 0.2})`,
        `rgba(139, 92, 246, ${Math.random() * 0.5 + 0.2})`,
        `rgba(16, 185, 129, ${Math.random() * 0.5 + 0.2})`,
        `rgba(245, 158, 11, ${Math.random() * 0.4 + 0.2})`,
      ];
      this.color = colors[Math.floor(Math.random() * colors.length)];
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      if (this.x < 0) this.x = DOM.canvas.width;
      if (this.x > DOM.canvas.width) this.x = 0;
      if (this.y < 0) this.y = DOM.canvas.height;
      if (this.y > DOM.canvas.height) this.y = 0;
    }
    draw() {
      ctx.beginPath();
      ctx.fillStyle = this.color;
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  function initParticlesArray() {
    particlesArray = [];
    const particleCount = Math.min(Math.floor(window.innerWidth / 15), 80);
    for (let i = 0; i < particleCount; i++) {
      particlesArray.push(new Particle());
    }
  }
  document.addEventListener("mousemove", (event) => {
    mouse.x = event.x;
    mouse.y = event.y;
  });
  document.addEventListener("mouseout", () => {
    mouse.x = null;
    mouse.y = null;
  });
  function animateParticles() {
    ctx.clearRect(0, 0, DOM.canvas.width, DOM.canvas.height);
    for (let i = 0; i < particlesArray.length; i++) {
      particlesArray[i].update();
      if (mouse.x !== null && mouse.y !== null) {
        const dx = particlesArray[i].x - mouse.x;
        const dy = particlesArray[i].y - mouse.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < mouse.radius) {
          const force = (mouse.radius - distance) / mouse.radius;
          const angle = Math.atan2(dy, dx);
          particlesArray[i].x += Math.cos(angle) * force * 2;
          particlesArray[i].y += Math.sin(angle) * force * 2;
          ctx.beginPath();
          ctx.fillStyle = `rgba(255, 255, 255, ${
            (mouse.radius - distance) / (mouse.radius * 5)
          })`;
          ctx.arc(
            particlesArray[i].x,
            particlesArray[i].y,
            particlesArray[i].size * 1.5,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }
      }
      particlesArray[i].draw();
    }
    for (let a = 0; a < particlesArray.length; a++) {
      for (let b = a; b < particlesArray.length; b++) {
        const dx = particlesArray[a].x - particlesArray[b].x;
        const dy = particlesArray[a].y - particlesArray[b].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 100) {
          ctx.beginPath();
          ctx.strokeStyle = particlesArray[a].color;
          ctx.lineWidth = 0.2;
          ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
          ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(animateParticles);
  }
  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();
  animateParticles();
}
