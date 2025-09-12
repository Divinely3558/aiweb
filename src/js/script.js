// 数据模型
const AppData = {
  init() {
    this.loadData();
  },

  loadData() {
    // 从localStorage加载数据
    const savedData = localStorage.getItem("appData");
    if (savedData) {
      const data = JSON.parse(savedData);
      this.settings = data.settings || {
        theme: "light",
        searchEngine: "baidu",
        lastUpdated: new Date().toISOString().split("T")[0],
        background: "",
      };
    } else {
      // 默认数据
      this.settings = {
        theme: "light",
        searchEngine: "baidu",
        lastUpdated: new Date().toISOString().split("T")[0],
        background: "",
      };
    }
  },

  saveData() {
    // 保存数据到localStorage
    const data = {
      settings: this.settings,
    };
    localStorage.setItem("appData", JSON.stringify(data));
  },

  // 设置相关方法
  getSettings() {
    return this.settings;
  },

  saveSettings(settings) {
    this.settings = { ...this.settings, ...settings };
    this.saveData();
  },

  // 更新最后修改时间
  updateLastUpdated() {
    this.settings.lastUpdated = new Date().toISOString().split("T")[0];
    this.saveData();
  },
};
// 视图控制器
const ViewController = {
  // 初始化视图
  init() {
    this.renderTheme();
    this.renderSearchEngine();
    this.updateLastUpdated();

    // 获取并设置Bing每日壁纸
    this.getBingDailyWallpaper();

    // 绑定事件监听
    this.bindEvents();
  },

  // 渲染主题
  renderTheme() {
    const settings = AppData.getSettings();
    if (settings.theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  },

  // 渲染搜索引擎
  renderSearchEngine() {
    const settings = AppData.getSettings();
    const searchEngine = document.getElementById("search-engine");
    searchEngine.value = settings.searchEngine || "baidu";
  },

  // 收藏功能已替换为历史记录功能，renderBookmarks方法已移除

  // 更新最后修改时间显示
  updateLastUpdated() {
    const settings = AppData.getSettings();
    document.getElementById("last-updated").textContent =
      settings.lastUpdated || new Date().toISOString().split("T")[0];
  },

  // 收藏功能已替换为历史记录功能，openBookmarkModal和closeBookmarkModal方法已移除

  // 打开确认对话框
  openConfirmDialog(title, message, confirmCallback) {
    const dialog = document.getElementById("confirm-dialog");
    const dialogTitle = document.getElementById("confirm-title");
    const dialogMessage = document.getElementById("confirm-message");
    const confirmOk = document.getElementById("confirm-ok");
    const confirmCancel = document.getElementById("confirm-cancel");

    // 设置对话框内容
    dialogTitle.textContent = title;
    dialogMessage.textContent = message;

    // 显示对话框
    dialog.classList.remove("hidden");
    setTimeout(() => {
      dialog
        .querySelector('div[class*="rounded-2xl"]')
        .classList.add("scale-100");
      dialog
        .querySelector('div[class*="rounded-2xl"]')
        .classList.remove("scale-95");
    }, 10);

    // 绑定确认按钮事件
    const okHandler = () => {
      confirmCallback();
      this.closeConfirmDialog();
      confirmOk.removeEventListener("click", okHandler);
      confirmCancel.removeEventListener("click", cancelHandler);
    };

    // 绑定取消按钮事件
    const cancelHandler = () => {
      this.closeConfirmDialog();
      confirmOk.removeEventListener("click", okHandler);
      confirmCancel.removeEventListener("click", cancelHandler);
    };

    confirmOk.addEventListener("click", okHandler);
    confirmCancel.addEventListener("click", cancelHandler);
  },

  // 关闭确认对话框
  closeConfirmDialog() {
    const dialog = document.getElementById("confirm-dialog");
    const dialogContent = dialog.querySelector('div[class*="rounded-2xl"]');

    dialogContent.classList.remove("scale-100");
    dialogContent.classList.add("scale-95");

    setTimeout(() => {
      dialog.classList.add("hidden");
    }, 300);
  },

  // 渲染背景图片
  renderBackground() {
    const settings = AppData.getSettings();
    const bgImage = document.getElementById("background-image");
    if (settings.background) {
      bgImage.src = settings.background;
    }
  },

  // 获取Bing每日壁纸
  getBingDailyWallpaper() {
    // 使用Bing每日壁纸API
    const apiUrl =
      "https://bing.biturl.top/?resolution=1920&format=json&index=0&mkt=zh-CN";

    fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => {
        if (data && data.url) {
          // 更新背景图片
          AppData.saveSettings({ background: data.url });
          this.renderBackground();
        }
      })
      .catch((error) => {
        console.error("获取Bing每日壁纸失败:", error);
        // 如果获取失败，使用默认图片
        const defaultImage = "https://source.unsplash.com/random/1920x1080";
        AppData.saveSettings({ background: defaultImage });
        this.renderBackground();
      });
  },

  // 显示通知
  showNotification(title, message, type = "success") {
    const notification = document.getElementById("notification");
    const notificationTitle = document.getElementById("notification-title");
    const notificationMessage = document.getElementById("notification-message");
    const notificationIcon = document.getElementById("notification-icon");
    const closeBtn = document.getElementById("close-notification");

    // 设置通知内容
    notificationTitle.textContent = title;
    notificationMessage.textContent = message;

    // 设置通知图标和颜色
    if (type === "success") {
      notificationIcon.src = "src/img/check-circle-icon.svg";
      notificationIcon.alt = "成功";
      notificationIcon.className = "text-success text-xl";
      notification.classList.remove("bg-danger/10", "bg-warning/10");
      notification.classList.add("bg-success/10");
    } else if (type === "error") {
      notificationIcon.src = "src/img/exclamation-circle-icon.svg";
      notificationIcon.alt = "错误";
      notificationIcon.className = "text-danger text-xl";
      notification.classList.remove("bg-success/10", "bg-warning/10");
      notification.classList.add("bg-danger/10");
    } else if (type === "warning") {
      notificationIcon.src = "src/img/exclamation-triangle-icon.svg";
      notificationIcon.alt = "警告";
      notificationIcon.className = "text-warning text-xl";
      notification.classList.remove("bg-success/10", "bg-danger/10");
      notification.classList.add("bg-warning/10");
    }

    // 显示通知
    notification.classList.remove("translate-y-20", "opacity-0");
    notification.classList.add("translate-y-0", "opacity-100");

    // 3秒后自动关闭
    const timer = setTimeout(() => {
      this.closeNotification();
    }, 3000);

    // 手动关闭
    closeBtn.addEventListener("click", () => {
      clearTimeout(timer);
      this.closeNotification();
    });
  },

  // 关闭通知
  closeNotification() {
    const notification = document.getElementById("notification");
    notification.classList.remove("translate-y-0", "opacity-100");
    notification.classList.add("translate-y-20", "opacity-0");
  },

  // 收藏功能已替换为历史记录功能，批量操作相关方法已移除

  // 绑定事件
  bindEvents() {
    // h1点击跳转到百度
    document.querySelector("h1").addEventListener("click", () => {
      window.location.href = "/BookWEB";
    });

    // 搜索表单提交
    document.getElementById("search-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const searchInput = document.getElementById("search-input");
      const query = searchInput.value.trim();

      if (query) {
        // 根据选择的搜索引擎进行搜索
        const searchEngine = document.getElementById("search-engine").value;
        let searchUrl = "";

        if (searchEngine === "baidu") {
          searchUrl = `https://www.baidu.com/s?wd=${encodeURIComponent(query)}`;
        } else if (searchEngine === "bing") {
          searchUrl = `https://www.bing.com/search?q=${encodeURIComponent(
            query
          )}`;
        }

        // 打开搜索页面
        window.open(searchUrl, "_blank");

        // 清空搜索框
        searchInput.value = "";
      }
    });

    // 搜索引擎切换
    document.getElementById("search-engine").addEventListener("change", (e) => {
      AppData.saveSettings({ searchEngine: e.target.value });
    });

    // 移除了收藏相关的事件监听，因为收藏功能已替换为历史记录功能

    // 主题切换
    document.getElementById("theme-toggle").addEventListener("click", () => {
      const settings = AppData.getSettings();
      const newTheme = settings.theme === "dark" ? "light" : "dark";
      AppData.saveSettings({ theme: newTheme });
      this.renderTheme();
      this.showNotification(
        "主题已切换",
        `已切换到${newTheme === "dark" ? "深色" : "浅色"}模式`,
        "success"
      );
    });

    // 移除了批量操作相关的事件监听，因为收藏功能已替换为历史记录功能
  },
};

// 初始化应用
document.addEventListener("DOMContentLoaded", () => {
  AppData.init();
  ViewController.init();
});
