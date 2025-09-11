// 封装DOM元素获取
// 使用一个安全的方式来获取DOM元素，避免在DOMContentLoaded前获取导致的问题
function getDOM() {
  return {
    canvas: document.getElementById("particle-canvas"),
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
    favoriteIconUpload: document.getElementById("uploadIcon"),
  };
}

// 初始化DOM对象
let DOM;

document.addEventListener("DOMContentLoaded", () => {
  DOM = getDOM();
});

// 页面初始化
document.addEventListener("DOMContentLoaded", () => {
  // 移除greeting元素，避免历史遗留的"欢迎回家"文本
  const greetingElement = document.getElementById("greeting");
  if (greetingElement) {
    greetingElement.remove();
  }

  // 确保DOM已经初始化
  if (!DOM) {
    DOM = getDOM();
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
  
  // 初始化更换壁纸功能
  initWallpaperFunctionality();
});

// 全局变量
let isCustomWallpaperActive = false;
let customWallpaperElement = null;
let fileInput = null;
const STORAGE_KEY = "custom-wallpaper";
let favorites = [];

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

  // 绑定设置按钮点击事件
  if (DOM.settingsBtn) {
    DOM.settingsBtn.addEventListener("click", toggleSettingsMenu);
  }

  // 绑定恢复默认背景按钮点击事件
  if (DOM.resetBgBtn) {
    DOM.resetBgBtn.addEventListener("click", resetBackground);
  }

  // 点击页面其他区域关闭设置菜单
  document.addEventListener("click", closeSettingsMenuOnClickOutside);

  // 从本地存储恢复壁纸
  restoreWallpaperFromStorage();
}

// 初始化更换壁纸功能
function initWallpaperFunctionality() {
  // 检查设置菜单是否存在，如果不存在则创建
  if (!DOM.settingsMenu) {
    // 创建设置菜单
    const settingsMenu = document.createElement("div");
    settingsMenu.id = "settingsMenu";
    settingsMenu.className = "hidden absolute bottom-full right-0 mt-2 w-48 rounded-lg bg-dark/90 backdrop-blur-md border border-primary/30 shadow-xl overflow-hidden z-30";
    
    // 添加更换壁纸按钮
    const changeWallpaperBtn = document.createElement("button");
    changeWallpaperBtn.id = "changeWallpaperBtn";
    changeWallpaperBtn.className = "w-full text-left px-4 py-2 hover:bg-primary/20 transition-colors duration-200 text-white flex items-center gap-2";
    changeWallpaperBtn.innerHTML = '<i class="fa fa-picture-o text-primary" aria-hidden="true"></i><span>更换壁纸</span>';
    changeWallpaperBtn.addEventListener("click", triggerFileUpload);
    
    // 添加恢复默认背景按钮（如果不存在）
    if (!DOM.resetBgBtn) {
      const resetBgBtn = document.createElement("button");
      resetBgBtn.id = "resetBgBtn";
      resetBgBtn.className = "w-full text-left px-4 py-2 hover:bg-primary/20 transition-colors duration-200 text-white flex items-center gap-2";
      resetBgBtn.innerHTML = '<i class="fa fa-refresh text-primary" aria-hidden="true"></i><span>恢复默认背景</span>';
      resetBgBtn.addEventListener("click", resetBackground);
      
      settingsMenu.appendChild(resetBgBtn);
      DOM.resetBgBtn = resetBgBtn;
    }
    
    settingsMenu.appendChild(changeWallpaperBtn);
    
    // 将设置菜单添加到设置容器中
    if (DOM.settingsContainer) {
      DOM.settingsContainer.appendChild(settingsMenu);
      DOM.settingsMenu = settingsMenu;
    }
  } else {
    // 检查更换壁纸按钮是否已存在
    let changeWallpaperBtn = document.getElementById("changeWallpaperBtn");
    if (!changeWallpaperBtn) {
      // 创建更换壁纸按钮
      changeWallpaperBtn = document.createElement("button");
      changeWallpaperBtn.id = "changeWallpaperBtn";
      changeWallpaperBtn.className = "w-full text-left px-4 py-2 hover:bg-primary/20 transition-colors duration-200 text-white flex items-center gap-2";
      changeWallpaperBtn.innerHTML = '<i class="fa fa-picture-o text-primary" aria-hidden="true"></i><span>更换壁纸</span>';
      changeWallpaperBtn.addEventListener("click", triggerFileUpload);
      
      // 将按钮添加到设置菜单中
      // 找到恢复默认背景按钮，在它后面添加
      if (DOM.resetBgBtn && DOM.resetBgBtn.nextSibling) {
        DOM.settingsMenu.insertBefore(changeWallpaperBtn, DOM.resetBgBtn.nextSibling);
      } else {
        DOM.settingsMenu.appendChild(changeWallpaperBtn);
      }
    }
  }
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

// 初始化收藏功能
function initFavoritesFunctionality() {
  // 确保DOM元素存在
  if (!DOM.addFavoriteBtn || !DOM.addFavoriteDialog || !DOM.dialogOverlay || !DOM.cancelAddFavorite || !DOM.confirmAddFavorite || !DOM.favoritesBar) {
    return;
  }
  
  // 加载已保存的收藏
  loadFavoritesFromStorage();
  
  // 绑定添加收藏按钮点击事件
  DOM.addFavoriteBtn.addEventListener('click', function() {
    // 确保输入框存在
    if (DOM.favoriteName && DOM.favoriteUrl) {
      DOM.favoriteName.value = '';
      DOM.favoriteUrl.value = '';
      DOM.favoriteName.focus();
    }
    
    // 重置图标预览
    if (DOM.previewImg) {
      DOM.previewImg.src = '';
    }
    
    // 显示对话框
    if (DOM.dialogOverlay && DOM.addFavoriteDialog) {
      DOM.dialogOverlay.classList.remove('hidden');
      DOM.addFavoriteDialog.classList.remove('hidden');
    }
  });
  
  // 绑定取消按钮点击事件
  DOM.cancelAddFavorite.addEventListener('click', closeAddFavoriteDialog);
  
  // 绑定确认按钮点击事件
  DOM.confirmAddFavorite.addEventListener('click', handleAddFavorite);
  
  // 绑定遮罩层点击事件
  DOM.dialogOverlay.addEventListener('click', function(e) {
    if (e.target === DOM.dialogOverlay) {
      closeAddFavoriteDialog();
    }
  });
  
  // 绑定上传图标事件
  if (DOM.favoriteIconUpload) {
    DOM.favoriteIconUpload.addEventListener('click', function() {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.click();
      
      input.addEventListener('change', function(e) {
        if (e.target.files && e.target.files[0]) {
          handleIconUpload(e.target.files[0]);
        }
      });
    });
  }
  
  // 添加ESC键关闭对话框
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && !DOM.dialogOverlay.classList.contains('hidden')) {
      closeAddFavoriteDialog();
    }
  });
  
  // 渲染收藏列表
  renderFavorites();
}

// 从本地存储加载收藏
function loadFavoritesFromStorage() {
  try {
    const storedFavorites = localStorage.getItem('favorites');
    if (storedFavorites) {
      favorites = JSON.parse(storedFavorites);
    } else {
      favorites = [];
    }
  } catch (error) {
    console.error('加载收藏失败:', error);
    favorites = [];
  }
}

// 保存收藏到本地存储
function saveFavoritesToStorage() {
  try {
    localStorage.setItem('favorites', JSON.stringify(favorites));
    return true;
  } catch (error) {
    console.error('保存收藏失败:', error);
    return false;
  }
}

// 处理添加收藏
function handleAddFavorite() {
  if (!DOM.favoriteName || !DOM.favoriteUrl) return;
  
  const name = DOM.favoriteName.value.trim();
  const url = DOM.favoriteUrl.value.trim();
  
  if (!name || !url) {
    alert('请输入网站名称和网址');
    return;
  }
  
  // 验证URL格式
  let validUrl = url;
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    validUrl = 'https://' + url;
  }
  
  try {
    new URL(validUrl);
  } catch (error) {
    alert('请输入有效的网址');
    return;
  }
  
  // 生成图标URL（使用favicon或自定义上传的图标）
  let iconUrl = getFaviconUrl(validUrl);
  
  // 检查是否有自定义上传的图标
  if (DOM.iconPreview && DOM.previewImg && DOM.previewImg.src && DOM.previewImg.src !== window.location.href) {
    iconUrl = DOM.previewImg.src;
  }
  
  // 创建新的收藏项
  const newFavorite = {
    id: Date.now().toString(),
    name: name,
    url: validUrl,
    icon: iconUrl,
    createdAt: new Date().toISOString()
  };
  
  // 添加到收藏列表
  favorites.push(newFavorite);
  
  // 保存到本地存储
  if (saveFavoritesToStorage()) {
    // 更新UI
    renderFavorites();
    
    // 关闭对话框并重置表单
    closeAddFavoriteDialog();
    
    // 显示成功提示
    showNotification('收藏添加成功');
  } else {
    alert('保存收藏失败，请稍后再试');
  }
}

// 处理图标上传
function handleIconUpload(file) {
  // 检查文件类型
  if (!file.type.startsWith('image/')) {
    alert('请上传图片文件');
    return;
  }
  
  // 检查文件大小（限制为2MB）
  if (file.size > 2 * 1024 * 1024) {
    alert('图片文件大小不能超过2MB');
    return;
  }
  
  // 创建文件读取器
  const reader = new FileReader();
  reader.onload = function(e) {
    if (DOM.previewImg && DOM.iconPreview) {
      DOM.previewImg.src = e.target.result;
      DOM.iconPreview.classList.remove('hidden');
      // 隐藏上传提示文本
      const uploadText = DOM.uploadArea.querySelector('.upload-text');
      if (uploadText) {
        uploadText.classList.add('hidden');
      }
    }
  };
  reader.readAsDataURL(file);
}

// 获取网站图标URL
function getFaviconUrl(url) {
  try {
    const urlObj = new URL(url);
    return `${urlObj.protocol}//${urlObj.hostname}/favicon.ico`;
  } catch (error) {
    console.error('获取favicon失败:', error);
    return 'src/png/home.png';
  }
}

// 关闭添加收藏对话框
function closeAddFavoriteDialog() {
  if (DOM.addFavoriteDialog) {
    DOM.addFavoriteDialog.classList.add('hidden');
  }
  if (DOM.dialogOverlay) {
    DOM.dialogOverlay.classList.add('hidden');
  }
  
  // 重置表单
  if (DOM.favoriteName) {
    DOM.favoriteName.value = '';
  }
  if (DOM.favoriteUrl) {
    DOM.favoriteUrl.value = '';
  }
  if (DOM.uploadIcon) {
    DOM.uploadIcon.value = '';
  }
  if (DOM.previewImg && DOM.iconPreview) {
    DOM.previewImg.src = '';
    DOM.iconPreview.classList.add('hidden');
    // 显示上传提示文本
    const uploadText = document.querySelector('.upload-text');
    if (uploadText) {
      uploadText.classList.remove('hidden');
    }
  }
}

// 显示通知
function showNotification(message) {
  // 检查是否已有通知元素，如果没有则创建
  let notification = document.getElementById('notification');
  if (!notification) {
    notification = document.createElement('div');
    notification.id = 'notification';
    notification.className = 'fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-dark/90 text-white px-4 py-2 rounded-lg shadow-lg z-50 opacity-0 transition-opacity duration-300';
    document.body.appendChild(notification);
  }
  
  // 设置消息并显示
  notification.textContent = message;
  notification.classList.remove('opacity-0');
  notification.classList.add('opacity-100');
  
  // 3秒后自动隐藏
  setTimeout(() => {
    notification.classList.remove('opacity-100');
    notification.classList.add('opacity-0');
  }, 3000);
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

// 渲染收藏列表
function renderFavorites() {
  if (!DOM.favoritesBar) return;
  
  // 清空现有收藏
  DOM.favoritesBar.innerHTML = '';
  
  // 按创建时间排序（最新的在前）
  favorites.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  // 创建并添加收藏项
  favorites.forEach(favorite => {
    const favoriteItem = document.createElement('div');
    favoriteItem.className = 'flex flex-col items-center justify-center group';
    favoriteItem.setAttribute('data-id', favorite.id);
    
    // 创建图标容器
    const iconContainer = document.createElement('div');
    iconContainer.className = 'w-12 h-12 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center mb-1 transition-all duration-300 group-hover:bg-white/20 overflow-hidden';
    
    // 创建图标
    const icon = document.createElement('img');
    icon.src = favorite.icon;
    icon.alt = favorite.name;
    icon.className = 'w-8 h-8 object-contain';
    
    // 创建名称标签
    const nameTag = document.createElement('span');
    nameTag.className = 'text-xs text-white/80 max-w-[80px] truncate text-center';
    nameTag.textContent = favorite.name;
    
    // 组装元素
    iconContainer.appendChild(icon);
    favoriteItem.appendChild(iconContainer);
    favoriteItem.appendChild(nameTag);
    
    // 添加点击事件
    favoriteItem.addEventListener('click', () => {
      window.open(favorite.url, '_blank');
    });
    
    // 添加右键菜单支持
    favoriteItem.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      if (confirm(`确定要删除收藏"${favorite.name}"吗？`)) {
        // 从列表中移除
        favorites = favorites.filter(item => item.id !== favorite.id);
        
        // 保存到本地存储
        saveFavoritesToStorage();
        
        // 重新渲染
        renderFavorites();
        
        // 显示删除成功提示
        showNotification('收藏已删除');
      }
    });
    
    // 添加到收藏栏
    DOM.favoritesBar.appendChild(favoriteItem);
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
