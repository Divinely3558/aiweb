// 封装DOM元素获取
const DOM = {
  greeting: document.getElementById("greeting"),
  currentYear: document.getElementById("current-year"),
  lastUpdate: document.getElementById("last-update"),
  goToBookwebBtn: document.getElementById("goToBookwebBtn"),
  canvas: document.getElementById("particle-canvas"),
};

// 页面初始化
document.addEventListener("DOMContentLoaded", () => {
  initDateInfo();
  initGreeting();
  initParticles();
  initBookwebButton();
});

// 初始化日期信息
function initDateInfo() {
  const now = new Date();
  DOM.currentYear.textContent = now.getFullYear();
  DOM.lastUpdate.textContent = `最后更新: ${now.toLocaleDateString()}`;
}

// 初始化问候语
function initGreeting() {
  const hour = new Date().getHours();
  let greetingText = "欢迎回家";

  if (hour < 12) {
    greetingText = "早上好！";
  } else if (hour < 18) {
    greetingText = "下午好！";
  } else {
    greetingText = "晚上好！";
  }

  DOM.greeting.textContent = greetingText;
}

// 初始化Bookweb按钮
function initBookwebButton() {
  // 点击按钮跳转到Bookweb
  DOM.goToBookwebBtn.addEventListener("click", redirectToBookweb);
}

// 跳转到Bookweb
function redirectToBookweb() {
  window.location.href = "/BookWEB/index.html";
}

// 粒子背景
function initParticles() {
  if (!DOM.canvas) return;

  const ctx = DOM.canvas.getContext("2d");
  let particlesArray = [];
  let mouse = {
    x: null,
    y: null,
    radius: 100 // 鼠标影响范围半径
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
        `rgba(245, 158, 11, ${Math.random() * 0.4 + 0.2})`  // 黄色
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
    const particleCount = Math.min(
      Math.floor(window.innerWidth / 15),
      80
    );

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
          ctx.fillStyle = `rgba(255, 255, 255, ${(mouse.radius - distance) / (mouse.radius * 5)})`;
          ctx.arc(particlesArray[i].x, particlesArray[i].y, particlesArray[i].size * 1.5, 0, Math.PI * 2);
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