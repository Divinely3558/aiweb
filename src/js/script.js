// 数据模型
const AppData = {
  // 初始化数据
  init() {
    // 检查本地存储中是否有数据，没有则初始化
    if (!localStorage.getItem("bookmarks")) {
      localStorage.setItem("bookmarks", JSON.stringify([]));
    }

    if (!localStorage.getItem("searchHistory")) {
      localStorage.setItem("searchHistory", JSON.stringify([]));
    }

    if (!localStorage.getItem("settings")) {
      const defaultSettings = {
        theme: "light",
        background: "https://picsum.photos/id/1002/1920/1080",
        searchEngine: "baidu",
        minimalMode: false,
        lastUpdated: new Date().toISOString().split("T")[0],
      };
      localStorage.setItem("settings", JSON.stringify(defaultSettings));
    }
  },

  // 获取收藏
  getBookmarks() {
    return JSON.parse(localStorage.getItem("bookmarks") || "[]");
  },

  // 保存收藏
  saveBookmarks(bookmarks) {
    localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
    this.updateLastUpdated();
  },

  // 添加收藏
  addBookmark(bookmark) {
    const bookmarks = this.getBookmarks();
    const newBookmark = {
      id: Date.now().toString(),
      name: bookmark.name,
      url: bookmark.url,
      icon: bookmark.icon || "fa-link",
      createdAt: new Date().toISOString(),
    };
    bookmarks.push(newBookmark);
    this.saveBookmarks(bookmarks);
    return newBookmark;
  },

  // 更新收藏
  updateBookmark(id, updatedBookmark) {
    const bookmarks = this.getBookmarks();
    const index = bookmarks.findIndex((bookmark) => bookmark.id === id);
    if (index !== -1) {
      bookmarks[index] = { ...bookmarks[index], ...updatedBookmark };
      this.saveBookmarks(bookmarks);
      return bookmarks[index];
    }
    return null;
  },

  // 删除收藏
  deleteBookmark(id) {
    let bookmarks = this.getBookmarks();
    const bookmarkToDelete = bookmarks.find(
      (bookmark) => bookmark.id === id
    );
    if (bookmarkToDelete) {
      bookmarks = bookmarks.filter((bookmark) => bookmark.id !== id);
      this.saveBookmarks(bookmarks);
      return true;
    }
    return false;
  },

  // 批量删除收藏
  batchDeleteBookmarks(ids) {
    let bookmarks = this.getBookmarks();
    bookmarks = bookmarks.filter(
      (bookmark) => !ids.includes(bookmark.id)
    );
    this.saveBookmarks(bookmarks);
    return true;
  },

  // 重新排序收藏
  reorderBookmarks(newOrder) {
    const bookmarks = this.getBookmarks();
    // 按照新的ID顺序重新排列
    const reordered = newOrder.map((id) =>
      bookmarks.find((b) => b.id === id)
    );
    this.saveBookmarks(reordered);
    return reordered;
  },

  // 获取搜索历史
  getSearchHistory() {
    return JSON.parse(localStorage.getItem("searchHistory") || "[]");
  },

  // 保存搜索历史
  saveSearchHistory(history) {
    // 限制最多10条记录
    if (history.length > 10) {
      history = history.slice(-10);
    }
    localStorage.setItem("searchHistory", JSON.stringify(history));
  },

  // 添加搜索记录
  addSearchQuery(query) {
    if (!query.trim()) return;

    let history = this.getSearchHistory();
    // 移除已存在的相同记录
    history = history.filter((item) => item !== query.trim());
    // 添加新记录到末尾
    history.push(query.trim());
    this.saveSearchHistory(history);
  },

  // 清空搜索历史
  clearSearchHistory() {
    localStorage.setItem("searchHistory", JSON.stringify([]));
  },

  // 获取设置
  getSettings() {
    return JSON.parse(localStorage.getItem("settings") || "{}");
  },

  // 保存设置
  saveSettings(settings) {
    const currentSettings = this.getSettings();
    const updatedSettings = { ...currentSettings, ...settings };
    localStorage.setItem("settings", JSON.stringify(updatedSettings));
  },

  // 更新最后修改时间
  updateLastUpdated() {
    const settings = this.getSettings();
    settings.lastUpdated = new Date().toISOString().split("T")[0];
    this.saveSettings(settings);
  },
};

// 视图控制器
const ViewController = {
  // 初始化视图
  init() {
    this.renderTheme();
    this.renderBackground();
    this.renderSearchEngine();
    this.renderSearchHistory();
    this.renderBookmarks();
    this.renderMinimalMode();
    this.updateLastUpdated();

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

  // 渲染背景
  renderBackground() {
    const settings = AppData.getSettings();
    const bgImage = document.getElementById("background-image");
    bgImage.src =
      settings.background || "https://picsum.photos/id/1002/1920/1080";
  },

  // 渲染搜索引擎
  renderSearchEngine() {
    const settings = AppData.getSettings();
    const searchEngine = document.getElementById("search-engine");
    searchEngine.value = settings.searchEngine || "baidu";
  },

  // 渲染搜索历史
  renderSearchHistory() {
    const history = AppData.getSearchHistory();
    const historyList = document.getElementById("history-list");
    const searchHistoryContainer =
      document.getElementById("search-history");

    // 清空列表
    historyList.innerHTML = "";

    // 如果没有历史记录，隐藏容器
    if (history.length === 0) {
      searchHistoryContainer.classList.add("hidden");
      return;
    }

    // 添加历史记录项
    history.forEach((item) => {
      const li = document.createElement("li");
      li.className =
        "px-4 py-2 hover:bg-gray-100 dark:hover:bg-dark-500 cursor-pointer transition-all-custom flex items-center";
      li.innerHTML = `
            <i class="fa fa-history text-gray-400 mr-2"></i>
            <span>${item}</span>
          `;

      // 点击历史项填充搜索框
      li.addEventListener("click", () => {
        document.getElementById("search-input").value = item;
        searchHistoryContainer.classList.add("hidden");
      });

      historyList.appendChild(li);
    });
  },

  // 渲染收藏
  renderBookmarks() {
    const bookmarks = AppData.getBookmarks();
    const bookmarksContainer = document.getElementById(
      "bookmarks-container"
    );
    const emptyBookmarks = document.getElementById("empty-bookmarks");

    // 清空容器
    bookmarksContainer.innerHTML = "";

    // 如果没有收藏，显示空状态
    if (bookmarks.length === 0) {
      bookmarksContainer.appendChild(emptyBookmarks);
      return;
    }

    // 隐藏空状态
    emptyBookmarks.remove();

    // 添加收藏项
    bookmarks.forEach((bookmark) => {
      const bookmarkEl = document.createElement("div");
      bookmarkEl.className =
        "bookmark-item bg-white dark:bg-dark-500 rounded-xl shadow-sm border border-gray-200 dark:border-dark-400 p-4 flex flex-col items-center text-center hover:shadow-md transition-all-custom cursor-pointer relative group";
      bookmarkEl.setAttribute("data-id", bookmark.id);
      bookmarkEl.setAttribute("draggable", "true");

      bookmarkEl.innerHTML = `
            <div class="bookmark-select hidden absolute top-2 left-2 w-4 h-4 rounded border border-gray-300 dark:border-gray-600 flex items-center justify-center">
              <i class="fa fa-check text-xs text-primary"></i>
            </div>
            <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <i class="fa ${bookmark.icon} text-primary text-xl"></i>
            </div>
            <h3 class="font-medium text-sm mb-1 truncate w-full">${
              bookmark.name
            }</h3>
            <p class="text-xs text-gray-500 dark:text-gray-400 truncate w-full">${
              new URL(bookmark.url).hostname
            }</p>
            <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all-custom">
              <button class="edit-bookmark p-1.5 text-gray-400 hover:text-primary hover:bg-gray-100 dark:hover:bg-dark-400 rounded-full transition-all-custom">
                <i class="fa fa-pencil"></i>
              </button>
            </div>
          `;

      // 点击收藏项打开链接
      bookmarkEl.addEventListener("click", (e) => {
        // 如果点击的是编辑按钮，不打开链接
        if (e.target.closest(".edit-bookmark") || this.isBatchMode) {
          return;
        }
        window.open(bookmark.url, "_blank");
      });

      // 编辑收藏
      bookmarkEl
        .querySelector(".edit-bookmark")
        .addEventListener("click", (e) => {
          e.stopPropagation();
          this.openBookmarkModal(bookmark);
        });

      // 拖拽排序事件
      bookmarkEl.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("text/plain", bookmark.id);
        setTimeout(() => {
          bookmarkEl.classList.add("opacity-50");
        }, 0);
      });

      bookmarkEl.addEventListener("dragend", () => {
        bookmarkEl.classList.remove("opacity-50");
        // 移除所有拖拽相关类
        document.querySelectorAll(".bookmark-item").forEach((item) => {
          item.classList.remove("drag-over");
        });
      });

      bookmarkEl.addEventListener("dragover", (e) => {
        e.preventDefault();
        bookmarkEl.classList.add("drag-over");
      });

      bookmarkEl.addEventListener("dragleave", () => {
        bookmarkEl.classList.remove("drag-over");
      });

      bookmarkEl.addEventListener("drop", (e) => {
        e.preventDefault();
        bookmarkEl.classList.remove("drag-over");

        const draggedId = e.dataTransfer.getData("text/plain");
        if (draggedId !== bookmark.id) {
          const bookmarks = AppData.getBookmarks();
          const draggedIndex = bookmarks.findIndex(
            (b) => b.id === draggedId
          );
          const targetIndex = bookmarks.findIndex(
            (b) => b.id === bookmark.id
          );

          // 重新排序
          const newBookmarks = [...bookmarks];
          const [draggedItem] = newBookmarks.splice(draggedIndex, 1);
          newBookmarks.splice(targetIndex, 0, draggedItem);

          // 保存新顺序
          AppData.saveBookmarks(newBookmarks);
          // 重新渲染
          this.renderBookmarks();

          this.showNotification("排序成功", "收藏顺序已更新", "success");
        }
      });

      bookmarksContainer.appendChild(bookmarkEl);
    });
  },

  // 渲染极简模式
  renderMinimalMode() {
    const settings = AppData.getSettings();
    const minimalMode = settings.minimalMode || false;
    const minimalModeIndicator = document.getElementById(
      "minimal-mode-indicator"
    );
    const bookmarksSection = document.getElementById("bookmarks-section");

    if (minimalMode) {
      minimalModeIndicator.classList.remove("hidden");
      bookmarksSection.classList.add("hidden");
    } else {
      minimalModeIndicator.classList.add("hidden");
      bookmarksSection.classList.remove("hidden");
    }
  },

  // 更新最后修改时间显示
  updateLastUpdated() {
    const settings = AppData.getSettings();
    document.getElementById("last-updated").textContent =
      settings.lastUpdated || new Date().toISOString().split("T")[0];
  },

  // 打开收藏模态框
  openBookmarkModal(bookmark = null) {
    const modal = document.getElementById("bookmark-modal");
    const modalTitle = document.getElementById("bookmark-modal-title");
    const bookmarkId = document.getElementById("bookmark-id");
    const bookmarkName = document.getElementById("bookmark-name");
    const bookmarkUrl = document.getElementById("bookmark-url");
    const bookmarkIcon = document.getElementById("bookmark-icon");
    const iconPreview = document.getElementById("icon-preview");
    const deleteBtn = document.getElementById("delete-bookmark-btn");

    // 重置表单
    document.getElementById("bookmark-form").reset();
    bookmarkId.value = "";
    iconPreview.className = "fa fa-link text-gray-500";

    if (bookmark) {
      // 编辑模式
      modalTitle.textContent = "编辑收藏";
      bookmarkId.value = bookmark.id;
      bookmarkName.value = bookmark.name;
      bookmarkUrl.value = bookmark.url;
      bookmarkIcon.value = bookmark.icon;
      iconPreview.className = `fa ${bookmark.icon} text-gray-500`;
      deleteBtn.classList.remove("hidden");
    } else {
      // 添加模式
      modalTitle.textContent = "添加收藏";
      deleteBtn.classList.add("hidden");
    }

    // 显示模态框
    modal.classList.remove("hidden");
    setTimeout(() => {
      modal
        .querySelector('div[class*="rounded-2xl"]')
        .classList.add("scale-100");
      modal
        .querySelector('div[class*="rounded-2xl"]')
        .classList.remove("scale-95");
    }, 10);

    // 聚焦到名称输入框
    bookmarkName.focus();
  },

  // 关闭收藏模态框
  closeBookmarkModal() {
    const modal = document.getElementById("bookmark-modal");
    const modalContent = modal.querySelector('div[class*="rounded-2xl"]');

    modalContent.classList.remove("scale-100");
    modalContent.classList.add("scale-95");

    setTimeout(() => {
      modal.classList.add("hidden");
    }, 300);
  },

  // 打开背景设置模态框
  openBgModal() {
    const modal = document.getElementById("bg-modal");

    // 显示模态框
    modal.classList.remove("hidden");
    setTimeout(() => {
      modal
        .querySelector('div[class*="rounded-2xl"]')
        .classList.add("scale-100");
      modal
        .querySelector('div[class*="rounded-2xl"]')
        .classList.remove("scale-95");
    }, 10);
  },

  // 关闭背景设置模态框
  closeBgModal() {
    const modal = document.getElementById("bg-modal");
    const modalContent = modal.querySelector('div[class*="rounded-2xl"]');

    modalContent.classList.remove("scale-100");
    modalContent.classList.add("scale-95");

    setTimeout(() => {
      modal.classList.add("hidden");
    }, 300);
  },

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
    const dialogContent = dialog.querySelector(
      'div[class*="rounded-2xl"]'
    );

    dialogContent.classList.remove("scale-100");
    dialogContent.classList.add("scale-95");

    setTimeout(() => {
      dialog.classList.add("hidden");
    }, 300);
  },

  // 显示通知
  showNotification(title, message, type = "success") {
    const notification = document.getElementById("notification");
    const notificationTitle =
      document.getElementById("notification-title");
    const notificationMessage = document.getElementById(
      "notification-message"
    );
    const notificationIcon = document.getElementById("notification-icon");
    const closeBtn = document.getElementById("close-notification");

    // 设置通知内容
    notificationTitle.textContent = title;
    notificationMessage.textContent = message;

    // 设置通知图标和颜色
    notificationIcon.className = "";
    if (type === "success") {
      notificationIcon.className =
        "fa fa-check-circle text-success text-xl";
      notification.classList.remove("bg-danger/10", "bg-warning/10");
      notification.classList.add("bg-success/10");
    } else if (type === "error") {
      notificationIcon.className =
        "fa fa-exclamation-circle text-danger text-xl";
      notification.classList.remove("bg-success/10", "bg-warning/10");
      notification.classList.add("bg-danger/10");
    } else if (type === "warning") {
      notificationIcon.className =
        "fa fa-exclamation-triangle text-warning text-xl";
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

  // 切换批量操作模式
  toggleBatchMode(enable) {
    this.isBatchMode = enable;
    const batchOperations = document.getElementById("batch-operations");
    const bookmarkItems = document.querySelectorAll(".bookmark-item");
    const selectAllBtn = document.getElementById("select-all");
    const deselectAllBtn = document.getElementById("deselect-all");
    const batchDeleteBtn = document.getElementById("batch-delete");
    const exitBatchBtn = document.getElementById("exit-batch");
    const bookmarkBatchActions = document.getElementById(
      "bookmark-batch-actions"
    );

    if (enable) {
      // 进入批量模式
      batchOperations.classList.remove("hidden");
      bookmarkItems.forEach((item) => {
        item.classList.add("cursor-default");
        item.querySelector(".bookmark-select").classList.remove("hidden");

        // 添加点击选择事件
        item.addEventListener("click", this.handleBookmarkSelect);
      });
      bookmarkBatchActions.classList.add("hidden");
    } else {
      // 退出批量模式
      batchOperations.classList.add("hidden");
      bookmarkItems.forEach((item) => {
        item.classList.remove("cursor-default");
        item.querySelector(".bookmark-select").classList.add("hidden");
        item
          .querySelector(".bookmark-select")
          .classList.remove("bg-primary/10", "border-primary");
        item.querySelector(".bookmark-select i").classList.add("hidden");

        // 移除点击选择事件
        item.removeEventListener("click", this.handleBookmarkSelect);
      });
      bookmarkBatchActions.classList.remove("hidden");
    }
  },

  // 处理收藏项选择
  handleBookmarkSelect(e) {
    e.stopPropagation();
    const selectEl = this.querySelector(".bookmark-select");
    const isSelected = selectEl.classList.contains("bg-primary/10");

    if (isSelected) {
      // 取消选择
      selectEl.classList.remove("bg-primary/10", "border-primary");
      selectEl.querySelector("i").classList.add("hidden");
    } else {
      // 选中
      selectEl.classList.add("bg-primary/10", "border-primary");
      selectEl.querySelector("i").classList.remove("hidden");
    }
  },

  // 获取选中的收藏项ID
  getSelectedBookmarkIds() {
    const selectedIds = [];
    document.querySelectorAll(".bookmark-item").forEach((item) => {
      const selectEl = item.querySelector(".bookmark-select");
      if (selectEl.classList.contains("bg-primary/10")) {
        selectedIds.push(item.getAttribute("data-id"));
      }
    });
    return selectedIds;
  },

  // 全选收藏项
  selectAllBookmarks() {
    document.querySelectorAll(".bookmark-item").forEach((item) => {
      const selectEl = item.querySelector(".bookmark-select");
      selectEl.classList.add("bg-primary/10", "border-primary");
      selectEl.querySelector("i").classList.remove("hidden");
    });
  },

  // 取消全选收藏项
  deselectAllBookmarks() {
    document.querySelectorAll(".bookmark-item").forEach((item) => {
      const selectEl = item.querySelector(".bookmark-select");
      selectEl.classList.remove("bg-primary/10", "border-primary");
      selectEl.querySelector("i").classList.add("hidden");
    });
  },

  // 绑定事件
  bindEvents() {
    // 搜索表单提交
    document
      .getElementById("search-form")
      .addEventListener("submit", (e) => {
        e.preventDefault();
        const searchInput = document.getElementById("search-input");
        const query = searchInput.value.trim();

        if (query) {
          // 添加到搜索历史
          AppData.addSearchQuery(query);
          this.renderSearchHistory();

          // 根据选择的搜索引擎进行搜索
          const searchEngine =
            document.getElementById("search-engine").value;
          let searchUrl = "";

          if (searchEngine === "baidu") {
            searchUrl = `https://www.baidu.com/s?wd=${encodeURIComponent(
              query
            )}`;
          } else if (searchEngine === "bing") {
            searchUrl = `https://www.bing.com/search?q=${encodeURIComponent(
              query
            )}`;
          }

          // 打开搜索页面
          window.open(searchUrl, "_blank");

          // 清空搜索框
          searchInput.value = "";
          document
            .getElementById("search-history")
            .classList.add("hidden");
        }
      });

    // 搜索框聚焦显示历史
    document
      .getElementById("search-input")
      .addEventListener("focus", () => {
        const history = AppData.getSearchHistory();
        if (history.length > 0) {
          document
            .getElementById("search-history")
            .classList.remove("hidden");
        }
      });

    // 点击页面其他地方隐藏搜索历史
    document.addEventListener("click", (e) => {
      const searchContainer =
        document.getElementById("search-form").parentElement;
      if (!searchContainer.contains(e.target)) {
        document.getElementById("search-history").classList.add("hidden");
      }
    });

    // 清空搜索历史
    document
      .getElementById("clear-history")
      .addEventListener("click", () => {
        this.openConfirmDialog(
          "确认清空",
          "你确定要清空所有搜索历史吗？",
          () => {
            AppData.clearSearchHistory();
            this.renderSearchHistory();
            this.showNotification(
              "清空成功",
              "搜索历史已清空",
              "success"
            );
          }
        );
      });

    // 搜索引擎切换
    document
      .getElementById("search-engine")
      .addEventListener("change", (e) => {
        AppData.saveSettings({ searchEngine: e.target.value });
      });

    // 添加收藏按钮
    document
      .getElementById("add-bookmark-btn")
      .addEventListener("click", () => {
        this.openBookmarkModal();
      });

    // 关闭收藏模态框
    document
      .getElementById("close-bookmark-modal")
      .addEventListener("click", () => {
        this.closeBookmarkModal();
      });

    // 点击模态框背景关闭
    document
      .getElementById("modal-overlay")
      .addEventListener("click", () => {
        this.closeBookmarkModal();
      });

    // 收藏表单提交
    document
      .getElementById("bookmark-form")
      .addEventListener("submit", (e) => {
        e.preventDefault();
        const bookmarkId = document.getElementById("bookmark-id").value;
        const name = document
          .getElementById("bookmark-name")
          .value.trim();
        let url = document.getElementById("bookmark-url").value.trim();
        const icon = document
          .getElementById("bookmark-icon")
          .value.trim();

        // 确保URL以http://或https://开头
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
          url = `https://${url}`;
        }

        if (bookmarkId) {
          // 更新收藏
          AppData.updateBookmark(bookmarkId, { name, url, icon });
          this.showNotification("更新成功", "收藏已更新", "success");
        } else {
          // 添加新收藏
          AppData.addBookmark({ name, url, icon });
          this.showNotification("添加成功", "已添加新收藏", "success");
        }

        // 关闭模态框并重新渲染
        this.closeBookmarkModal();
        this.renderBookmarks();
      });

    // 删除收藏按钮
    document
      .getElementById("delete-bookmark-btn")
      .addEventListener("click", () => {
        const bookmarkId = document.getElementById("bookmark-id").value;
        const bookmarkName = document
          .getElementById("bookmark-name")
          .value.trim();

        this.openConfirmDialog(
          "确认删除",
          `你确定要删除收藏"${bookmarkName}"吗？`,
          () => {
            AppData.deleteBookmark(bookmarkId);
            this.closeBookmarkModal();
            this.renderBookmarks();
            this.showNotification("删除成功", "收藏已删除", "success");
          }
        );
      });

    // 图标预览实时更新
    document
      .getElementById("bookmark-icon")
      .addEventListener("input", (e) => {
        const iconPreview = document.getElementById("icon-preview");
        const iconClass = e.target.value.trim();

        if (iconClass) {
          iconPreview.className = `fa ${iconClass} text-gray-500`;
        } else {
          iconPreview.className = "fa fa-link text-gray-500";
        }
      });

    // 打开背景设置
    document
      .getElementById("bg-settings-btn")
      .addEventListener("click", () => {
        this.openBgModal();
      });

    // 关闭背景设置
    document
      .getElementById("close-bg-modal")
      .addEventListener("click", () => {
        this.closeBgModal();
      });

    // 点击背景模态框背景关闭
    document
      .getElementById("bg-modal-overlay")
      .addEventListener("click", () => {
        this.closeBgModal();
      });

    // 选择默认背景
    document.querySelectorAll(".bg-option").forEach((option) => {
      option.addEventListener("click", () => {
        const bgUrl = option.getAttribute("data-bg");
        AppData.saveSettings({ background: bgUrl });
        this.renderBackground();
        this.closeBgModal();
        this.showNotification(
          "背景已更新",
          "已应用新的背景图片",
          "success"
        );
      });
    });

    // 上传背景图片
    document
      .getElementById("bg-upload")
      .addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            AppData.saveSettings({ background: event.target.result });
            this.renderBackground();
            this.closeBgModal();
            this.showNotification(
              "背景已更新",
              "已应用上传的背景图片",
              "success"
            );
          };
          reader.readAsDataURL(file);
        }
      });

    // 恢复默认背景
    document.getElementById("reset-bg").addEventListener("click", () => {
      AppData.saveSettings({
        background: "https://picsum.photos/id/1002/1920/1080",
      });
      this.renderBackground();
      this.closeBgModal();
      this.showNotification(
        "背景已重置",
        "已恢复默认背景图片",
        "success"
      );
    });

    // 主题切换
    document
      .getElementById("theme-toggle")
      .addEventListener("click", () => {
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

    // 极简模式切换
    document
      .getElementById("minimal-mode-toggle")
      .addEventListener("click", () => {
        const settings = AppData.getSettings();
        const newMode = !settings.minimalMode;
        AppData.saveSettings({ minimalMode: newMode });
        this.renderMinimalMode();
        this.showNotification(
          "模式已切换",
          `已${newMode ? "开启" : "关闭"}极简模式`,
          "success"
        );
      });

    // 批量操作按钮
    document
      .getElementById("bookmark-batch-actions")
      .addEventListener("click", () => {
        this.toggleBatchMode(true);
      });

    // 退出批量操作
    document
      .getElementById("exit-batch")
      .addEventListener("click", () => {
        this.toggleBatchMode(false);
      });

    // 全选
    document
      .getElementById("select-all")
      .addEventListener("click", () => {
        this.selectAllBookmarks();
      });

    // 取消全选
    document
      .getElementById("deselect-all")
      .addEventListener("click", () => {
        this.deselectAllBookmarks();
      });

    // 批量删除
    document
      .getElementById("batch-delete")
      .addEventListener("click", () => {
        const selectedIds = this.getSelectedBookmarkIds();

        if (selectedIds.length === 0) {
          this.showNotification(
            "操作失败",
            "请先选择要删除的收藏",
            "warning"
          );
          return;
        }

        this.openConfirmDialog(
          "批量删除",
          `你确定要删除选中的${selectedIds.length}个收藏吗？`,
          () => {
            AppData.batchDeleteBookmarks(selectedIds);
            this.toggleBatchMode(false);
            this.renderBookmarks();
            this.showNotification(
              "删除成功",
              `${selectedIds.length}个收藏已删除`,
              "success"
            );
          }
        );
      });
  },
};

// 初始化应用
document.addEventListener("DOMContentLoaded", () => {
  AppData.init();
  ViewController.init();
});