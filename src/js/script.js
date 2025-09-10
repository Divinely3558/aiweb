// 封装DOM元素获取
const DOM = {
  canvas: document.getElementById("particle-canvas"),
  bgUploadBtn: document.getElementById("bgUploadBtn"),
  uploadContainer: document.getElementById("uploadContainer"),
  settingsBtn: document.getElementById("settingsBtn"),
  resetBgBtn: document.getElementById("resetBgBtn"),
  settingsMenu: document.getElementById("settingsMenu"),
  settingsContainer: document.getElementById("settingsContainer"),
  backgroundLayers: document.querySelectorAll(".fixed.inset-0.z-0"),
  // 搜索功能
  searchForm: document.getElementById("searchForm"),
  searchInput: document.getElementById("searchInput"),
  searchHistory: document.getElementById("searchHistory"),
  historyList: document.getElementById("historyList"),
  clearHistoryBtn: document.getElementById("clearHistory"),
  // 收藏功能
  addFavoriteBtn: document.getElementById("addFavoriteBtn"),
  addFavoriteDialog: document.getElementById("addFavoriteDialog"),
  dialogOverlay: document.getElementById("dialogOverlay"),
  cancelAddFavoriteBtn: document.getElementById("cancelAddFavorite"),
  confirmAddFavoriteBtn: document.getElementById("confirmAddFavorite"),
  favoriteNameInput: document.getElementById("favoriteName"),
  favoriteUrlInput: document.getElementById("favoriteUrl"),
  favoritesBar: document.getElementById("favoritesBar"),
  selectedIcon: document.getElementById("selectedIcon"),
  uploadIcon: document.getElementById("uploadIcon"),
  iconPreview: document.getElementById("iconPreview"),
  previewImg: document.getElementById("previewImg"),
};

// 页面初始化
document.addEventListener("DOMContentLoaded", () => {
  // 移除greeting元素，避免历史遗留的"欢迎回家"文本
  const greetingElement = document.getElementById("greeting");
  if (greetingElement) {
    greetingElement.remove();
  }

  initParticles();
  initBackgroundToggle();
  // 初始化搜索历史功能
  if (DOM.searchForm && DOM.searchInput) {
    initSearchFunctionality();
  }
  // 初始化收藏功能
  if (DOM.addFavoriteBtn) {
    initFavoritesFunctionality();
  }
});

// 全局变量
let isCustomWallpaperActive = false;
let customWallpaperElement = null;
let fileInput = null;
const STORAGE_KEY = "custom-wallpaper";

// 搜索历史相关
const MAX_HISTORY_ITEMS = 10;
let searchHistory = [];

// 收藏相关
let favorites = [];

// 初始化背景功能
function initBackgroundToggle() {
  // 创建隐藏的文件输入元素
  fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "image/*";
  fileInput.style.display = "none";
  fileInput.addEventListener("change", handleFileSelection);
  document.body.appendChild(fileInput);

  // 绑定上传按钮点击事件
  DOM.bgUploadBtn.addEventListener("click", triggerFileUpload);

  // 绑定设置按钮点击事件
  DOM.settingsBtn.addEventListener("click", toggleSettingsMenu);

  // 绑定恢复默认背景按钮点击事件
  DOM.resetBgBtn.addEventListener("click", resetBackground);

  // 点击页面其他区域关闭设置菜单
  document.addEventListener("click", closeSettingsMenuOnClickOutside);

  // 从本地存储恢复壁纸
  restoreWallpaperFromStorage();
}

// 搜索历史功能
function initSearchFunctionality() {
  // 从本地存储加载搜索历史
  loadSearchHistory();

  // 搜索表单提交
  DOM.searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const query = DOM.searchInput.value.trim();
    if (query) {
      addToSearchHistory(query);
      // 跳转到百度搜索
      window.open(
        `https://www.baidu.com/s?wd=${encodeURIComponent(query)}`,
        "_self"
      );
    }
  });

  // 输入框焦点事件 - 显示历史记录
  DOM.searchInput.addEventListener("focus", () => {
    updateSearchHistoryUI();
    DOM.searchHistory.classList.remove("hidden");
  });

  // 点击页面其他地方隐藏历史记录
  document.addEventListener("click", (e) => {
    if (
      !DOM.searchForm.contains(e.target) &&
      !DOM.searchHistory.contains(e.target)
    ) {
      DOM.searchHistory.classList.add("hidden");
    }
  });

  // 清除历史记录按钮
  DOM.clearHistoryBtn.addEventListener("click", () => {
    if (confirm("确定要清除所有搜索历史吗？")) {
      clearSearchHistory();
    }
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
  // 移除重复项
  searchHistory = searchHistory.filter((item) => item !== query);
  // 添加到开头
  searchHistory.unshift(query);
  // 限制数量
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

    searchHistory.forEach((item, index) => {
      const historyItem = document.createElement("li");
      historyItem.className =
        "px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer text-left";
      historyItem.textContent = item;

      // 点击历史记录项进行搜索
      historyItem.addEventListener("click", () => {
        DOM.searchInput.value = item;
        DOM.searchForm.dispatchEvent(new Event("submit"));
      });

      DOM.historyList.appendChild(historyItem);
    });
  }
}

// 收藏功能
function initFavoritesFunctionality() {
  // 从本地存储加载收藏
  loadFavorites();

  // 确保添加收藏按钮始终可见
  DOM.addFavoriteBtn.classList.remove("opacity-0");
  DOM.addFavoriteBtn.classList.add("opacity-100");

  // 添加收藏按钮
  DOM.addFavoriteBtn.addEventListener("click", () => {
    // 清空输入框
    DOM.favoriteNameInput.value = "";
    DOM.favoriteUrlInput.value = "";
    // 重置选中的图标
    resetIconSelection();
    // 显示对话框
    DOM.addFavoriteDialog.classList.remove("hidden");
    DOM.dialogOverlay.classList.remove("hidden");
    // 聚焦到名称输入框
    DOM.favoriteNameInput.focus();
  });

  // 取消添加收藏
  DOM.cancelAddFavoriteBtn.addEventListener("click", hideAddFavoriteDialog);
  DOM.dialogOverlay.addEventListener("click", hideAddFavoriteDialog);

  // 确认添加收藏
  DOM.confirmAddFavoriteBtn.addEventListener("click", addFavorite);

  // 初始化图标上传功能
  initIconUpload();
}

function hideAddFavoriteDialog() {
  DOM.addFavoriteDialog.classList.add("hidden");
  DOM.dialogOverlay.classList.add("hidden");
}

function loadFavorites() {
  try {
    // 尝试从favorites.json文件加载数据
    fetch("src/data/favorites.json")
      .then((response) => {
        if (!response.ok) throw new Error("网络响应异常");
        return response.json();
      })
      .then((data) => {
        favorites = data || [];
        // 确保每个收藏项都有icon属性，如果没有则使用默认图标
        favorites = favorites.map((fav) => ({
          ...fav,
          icon: fav.icon || "fa-globe",
        }));
        // 同时保存到localStorage作为后备存储
        localStorage.setItem("favorites", JSON.stringify(favorites));
        updateFavoritesUI();
      })
      .catch((error) => {
        console.warn("从文件加载收藏失败，尝试从localStorage加载:", error);
        // 从localStorage加载作为后备方案
        const saved = localStorage.getItem("favorites");
        favorites = saved ? JSON.parse(saved) : [];
        updateFavoritesUI();
      });
  } catch (e) {
    favorites = [];
    console.error("加载收藏失败:", e);
  }
}

function saveFavorites() {
  try {
    // 保存到localStorage以便在页面刷新时快速恢复
    localStorage.setItem("favorites", JSON.stringify(favorites));

    // 创建下载链接，让用户可以保存数据文件
    const dataStr = JSON.stringify(favorites, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = "favorites.json";

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();

    console.log(
      "收藏数据已保存，请将下载的文件替换src/data/favorites.json以永久保存"
    );
  } catch (e) {
    console.error("保存收藏失败:", e);
  }
}

function addFavorite() {
  const name = DOM.favoriteNameInput.value.trim();
  let url = DOM.favoriteUrlInput.value.trim();
  const icon = DOM.selectedIcon.value;

  if (name.length === 0 || url.length === 0) {
    alert("请输入名称和网址");
    return;
  }

  // 确保URL有协议
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = "https://" + url;
  }

  // 添加到收藏列表
  favorites.push({ name, url, icon });
  saveFavorites();

  // 更新收藏UI
  updateFavoritesUI();

  // 隐藏对话框
  hideAddFavoriteDialog();
}

// 初始化图标上传功能
function initIconUpload() {
  if (!DOM.uploadIcon || !DOM.previewImg || !DOM.iconPreview) return;

  // 图标上传处理
  DOM.uploadIcon.addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (file) {
      // 检查文件类型
      const validTypes = [
        "image/png",
        "image/jpeg",
        "image/svg+xml",
        "image/gif",
      ];
      if (validTypes.includes(file.type)) {
        // 使用FileReader读取文件内容
        const reader = new FileReader();

        reader.onload = function (e) {
          // 显示预览
          DOM.previewImg.src = e.target.result;
          DOM.iconPreview.classList.remove("hidden");

          // 保存Base64编码的图标数据
          DOM.selectedIcon.value = e.target.result;
        };

        reader.readAsDataURL(file);
      } else {
        alert("请上传有效的图片文件（PNG、JPEG、SVG或GIF）");
        this.value = ""; // 清空文件输入
      }
    }
  });

  // 点击上传区域触发文件选择
  const uploadArea = document.getElementById("uploadArea");
  if (uploadArea) {
    uploadArea.addEventListener("click", function () {
      DOM.uploadIcon.click();
    });

    // 拖放上传
    uploadArea.addEventListener("dragover", function (e) {
      e.preventDefault();
      this.classList.add("bg-primary/10");
    });

    uploadArea.addEventListener("dragleave", function () {
      this.classList.remove("bg-primary/10");
    });

    uploadArea.addEventListener("drop", function (e) {
      e.preventDefault();
      this.classList.remove("bg-primary/10");

      const file = e.dataTransfer.files[0];
      if (file) {
        // 触发文件输入的change事件
        const event = new Event("change");
        DOM.uploadIcon.files = e.dataTransfer.files;
        DOM.uploadIcon.dispatchEvent(event);
      }
    });
  }
}

// 重置图标选择
function resetIconSelection() {
  // 重置选中的图标
  DOM.selectedIcon.value = "";
  // 重置预览
  DOM.previewImg.src = "";
  DOM.iconPreview.classList.add("hidden");
}

function updateFavoritesUI() {
  // 使用renderFavorites函数代替重复实现
  renderFavorites();
}

// 添加收藏按钮的初始化已经在renderFavorites函数中处理

// 触发文件上传对话框
function triggerFileUpload() {
  fileInput.click();
}

// 切换设置菜单显示/隐藏
function toggleSettingsMenu() {
  DOM.settingsMenu.classList.toggle("hidden");
}

// 点击页面其他区域关闭设置菜单
function closeSettingsMenuOnClickOutside(event) {
  if (
    !DOM.settingsBtn.contains(event.target) &&
    !DOM.settingsMenu.contains(event.target) &&
    !DOM.settingsContainer.contains(event.target)
  ) {
    DOM.settingsMenu.classList.add("hidden");
  }
}

// 恢复默认背景
function resetBackground() {
  // 移除所有与自定义壁纸相关的元素
  const customElements = document.querySelectorAll(".custom-wallpaper");
  customElements.forEach((el) => el.remove());
  customWallpaperElement = null;

  // 显示默认背景层
  DOM.backgroundLayers.forEach((layer) => {
    layer.classList.remove("hidden");
  });
  DOM.canvas.classList.remove("hidden");

  // 更新状态
  isCustomWallpaperActive = false;

  // 从本地存储中删除壁纸
  localStorage.removeItem(STORAGE_KEY);

  // 关闭设置菜单
  DOM.settingsMenu.classList.add("hidden");
}

// 处理文件选择
function handleFileSelection(event) {
  const file = event.target.files[0];
  if (!file) return;

  // 检查文件类型是否为图片
  if (!file.type.startsWith("image/")) {
    alert("请选择图片文件");
    return;
  }

  // 创建文件读取器
  const reader = new FileReader();
  reader.onload = function (e) {
    // 移除已存在的自定义壁纸元素
    const customElements = document.querySelectorAll(".custom-wallpaper");
    customElements.forEach((el) => el.remove());
    customWallpaperElement = null;

    // 隐藏默认背景层
    DOM.backgroundLayers.forEach((layer) => {
      layer.classList.add("hidden");
    });
    DOM.canvas.classList.add("hidden");

    // 创建并添加自定义壁纸元素
    customWallpaperElement = document.createElement("div");
    customWallpaperElement.className =
      "fixed inset-0 z-0 bg-cover bg-center custom-wallpaper";
    customWallpaperElement.style.backgroundImage = `url('${e.target.result}')`;
    document.body.prepend(customWallpaperElement);

    // 添加毛玻璃效果以确保内容可读性
    const glassEffect = document.createElement("div");
    glassEffect.className =
      "fixed inset-0 z-5 bg-black/40 backdrop-blur-sm custom-wallpaper";
    document.body.prepend(glassEffect);

    // 记录当前状态
    isCustomWallpaperActive = true;

    // 将壁纸保存到本地存储
    saveWallpaperToStorage(e.target.result);

    // 重置文件输入，允许再次选择同一文件
    fileInput.value = "";
  };

  // 读取文件为DataURL
  reader.readAsDataURL(file);
}

// 保存壁纸到本地存储
function saveWallpaperToStorage(imageData) {
  try {
    localStorage.setItem(STORAGE_KEY, imageData);
  } catch (error) {
    console.error("保存壁纸到本地存储失败:", error);
  }
}

// 从本地存储恢复壁纸
function restoreWallpaperFromStorage() {
  try {
    const savedWallpaper = localStorage.getItem(STORAGE_KEY);
    if (savedWallpaper) {
      // 隐藏默认背景层
      DOM.backgroundLayers.forEach((layer) => {
        layer.classList.add("hidden");
      });
      DOM.canvas.classList.add("hidden");

      // 创建并添加自定义壁纸元素
      customWallpaperElement = document.createElement("div");
      customWallpaperElement.className =
        "fixed inset-0 z-0 bg-cover bg-center custom-wallpaper";
      customWallpaperElement.style.backgroundImage = `url('${savedWallpaper}')`;
      document.body.prepend(customWallpaperElement);

      // 添加毛玻璃效果以确保内容可读性
      const glassEffect = document.createElement("div");
      glassEffect.className =
        "fixed inset-0 z-5 bg-black/40 backdrop-blur-sm custom-wallpaper";
      document.body.prepend(glassEffect);

      // 更新状态
      isCustomWallpaperActive = true;
    }
  } catch (error) {
    console.error("从本地存储恢复壁纸失败:", error);
  }
}

// 粒子背景
function initParticles() {
  if (!DOM.canvas) return;

  const ctx = DOM.canvas.getContext("2d");
  let particlesArray = [];
  let mouse = {
    x: null,
    y: null,
    radius: 100, // 鼠标影响范围半径
  };

  // 设置canvas尺寸
  function resizeCanvas() {
    DOM.canvas.width = window.innerWidth;
    DOM.canvas.height = window.innerHeight;
    // 重新初始化粒子以适应新尺寸
    initParticlesArray();
  }

  // 粒子类
  class Particle {
    constructor() {
      this.x = Math.random() * DOM.canvas.width;
      this.y = Math.random() * DOM.canvas.height;
      this.size = Math.random() * 2 + 1; // 稍微减小粒子大小，更精致
      this.speedX = (Math.random() - 0.5) * 0.3; // 稍微减慢速度，更优雅
      this.speedY = (Math.random() - 0.5) * 0.3;

      // 根据位置设置渐变的颜色，与背景更融合
      const colors = [
        `rgba(59, 130, 246, ${Math.random() * 0.6 + 0.2})`, // 蓝色
        `rgba(139, 92, 246, ${Math.random() * 0.5 + 0.2})`, // 紫色
        `rgba(16, 185, 129, ${Math.random() * 0.5 + 0.2})`, // 绿色
        `rgba(245, 158, 11, ${Math.random() * 0.4 + 0.2})`, // 黄色
      ];
      this.color = colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;

      // 边界检测
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

  // 初始化粒子数组
  function initParticlesArray() {
    particlesArray = [];
    const particleCount = Math.min(Math.floor(window.innerWidth / 15), 80);

    for (let i = 0; i < particleCount; i++) {
      particlesArray.push(new Particle());
    }
  }

  // 鼠标移动事件处理
  document.addEventListener("mousemove", (event) => {
    mouse.x = event.x;
    mouse.y = event.y;
  });

  // 鼠标离开画布事件处理
  document.addEventListener("mouseout", () => {
    mouse.x = null;
    mouse.y = null;
  });

  // 动画循环
  function animateParticles() {
    ctx.clearRect(0, 0, DOM.canvas.width, DOM.canvas.height);

    // 更新和绘制粒子
    for (let i = 0; i < particlesArray.length; i++) {
      particlesArray[i].update();
      // 鼠标交互效果
      if (mouse.x !== null && mouse.y !== null) {
        const dx = particlesArray[i].x - mouse.x;
        const dy = particlesArray[i].y - mouse.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // 如果粒子在鼠标范围内，添加排斥效果
        if (distance < mouse.radius) {
          const force = (mouse.radius - distance) / mouse.radius;
          const angle = Math.atan2(dy, dx);
          particlesArray[i].x += Math.cos(angle) * force * 2;
          particlesArray[i].y += Math.sin(angle) * force * 2;

          // 鼠标范围内的粒子稍微变大并改变透明度
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

    // 绘制连接线
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

  // 事件监听和初始化
  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();
  animateParticles();
}

// 收藏数据管理
function getFavorites() {
  // 优先返回内存中的favorites数组
  if (Array.isArray(favorites) && favorites.length > 0) {
    return favorites;
  }
  // 如果内存中没有，从localStorage加载
  try {
    return JSON.parse(localStorage.getItem("favorites") || "[]");
  } catch (e) {
    console.error("获取收藏失败:", e);
    return [];
  }
}
function setFavorites(list) {
  // 更新内存中的favorites数组
  favorites = list;
  // 保存到localStorage
  localStorage.setItem("favorites", JSON.stringify(list));
  // 同时提示用户保存到文件
  const dataStr = JSON.stringify(list, null, 2);
  const dataUri =
    "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

  const exportFileDefaultName = "favorites.json";

  const linkElement = document.createElement("a");
  linkElement.setAttribute("href", dataUri);
  linkElement.setAttribute("download", exportFileDefaultName);
  linkElement.click();

  console.log(
    "收藏数据已保存，请将下载的文件替换src/data/favorites.json以永久保存"
  );
}

// 渲染收藏栏
// 只展示收藏（后台维护 favorites.json）
function renderFavorites() {
  fetch("src/data/favorites.json")
    .then((res) => res.json())
    .then((favorites) => {
      const favoritesBar = document.getElementById("favoritesBar");
      favoritesBar.innerHTML = "";
      favorites.forEach((fav) => {
        const item = document.createElement("a");
        item.href = fav.url;
        item.target = "_blank";
        item.className =
          "flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-primary/20 transition-colors";
        item.innerHTML = `
          <img src="${
            fav.icon || "src/png/home.png"
          }" alt="icon" class="w-6 h-6 rounded object-cover border border-white/20" />
          <span class="text-white text-sm">${fav.name}</span>
        `;
        favoritesBar.appendChild(item);
      });
    });
}

document.addEventListener("DOMContentLoaded", renderFavorites);

// 初始化
document.addEventListener("DOMContentLoaded", () => {
  // 确保addToSearchHistory函数存在
  if (typeof addToSearchHistory === "undefined") {
    window.addToSearchHistory = function (query) {
      // 简化版的搜索历史添加函数
      try {
        let searchHistory = JSON.parse(
          localStorage.getItem("searchHistory") || "[]"
        );
        // 移除重复项
        searchHistory = searchHistory.filter((item) => item !== query);
        // 添加到开头
        searchHistory.unshift(query);
        // 限制数量
        if (searchHistory.length > 10) {
          searchHistory = searchHistory.slice(0, 10);
        }
        localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
      } catch (e) {
        console.error("保存搜索历史失败:", e);
      }
    };
  }
  renderFavorites();
});
