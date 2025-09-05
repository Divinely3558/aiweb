import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// 粒子背景组件
const ParticleBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [particles, setParticles] = useState<any[]>([]);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // 设置canvas尺寸
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    
    // 创建粒子
    const createParticles = () => {
      const particleArray: any[] = [];
      const particleCount = Math.min(Math.floor(window.innerWidth / 15), 80);
      
      for (let i = 0; i < particleCount; i++) {
        const size = Math.random() * 3 + 1;
        particleArray.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size,
          speedX: (Math.random() - 0.5) * 0.5,
          speedY: (Math.random() - 0.5) * 0.5,
          color: `rgba(100, 200, 255, ${Math.random() * 0.5 + 0.2})`,
          connections: []
        });
      }
      setParticles(particleArray);
    };
    
    createParticles();
    
    // 动画循环
    let animationFrameId: number;
    
    const animate = () => {
      if (!ctx) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // 更新粒子位置
      const updatedParticles = particles.map(particle => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        // 边界检测
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;
        
        return particle;
      });
      
      setParticles(updatedParticles);
      
      // 绘制连接线
      for (let a = 0; a < updatedParticles.length; a++) {
        for (let b = a; b < updatedParticles.length; b++) {
          const dx = updatedParticles[a].x - updatedParticles[b].x;
          const dy = updatedParticles[a].y - updatedParticles[b].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            ctx.beginPath();
            ctx.strokeStyle = updatedParticles[a].color;
            ctx.lineWidth = 0.2;
            ctx.moveTo(updatedParticles[a].x, updatedParticles[a].y);
            ctx.lineTo(updatedParticles[b].x, updatedParticles[b].y);
            ctx.stroke();
          }
        }
      }
      
      // 绘制粒子
      updatedParticles.forEach(particle => {
        ctx.beginPath();
        ctx.fillStyle = particle.color;
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      });
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [particles]);
  
  return (
    <canvas 
      ref={canvasRef} 
      className="fixed top-0 left-0 w-full h-full -z-10"
      aria-hidden="true"
    />
  );
};

// 网络设备图标组件
const NetworkDeviceIcon = ({ name, icon, color }: { name: string, icon: string, color: string }) => {
  return (
    <motion.div 
      className="flex flex-col items-center p-3 rounded-xl bg-white/10 backdrop-blur-sm"
      whileHover={{ scale: 1.05, y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <div className="w-12 h-12 rounded-full flex items-center justify-center mb-2" style={{ backgroundColor: color }}>
        <i className={`fa-solid ${icon} text-white text-xl`}></i>
      </div>
      <span className="text-white text-sm font-medium">{name}</span>
    </motion.div>
  );
};

export default function Home() {
  const [timeOfDay, setTimeOfDay] = useState('');
  
  // 根据时间设置问候语
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setTimeOfDay('早上好');
    } else if (hour < 18) {
      setTimeOfDay('下午好');
    } else {
      setTimeOfDay('晚上好');
    }
  }, []);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 text-white overflow-hidden">
      {/* 粒子背景效果 */}
      <ParticleBackground />
      
      {/* 主内容 */}
      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* 欢迎信息 */}
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="text-4xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500"
          >
            {timeOfDay}！欢迎回家
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
            className="text-xl md:text-2xl text-slate-300 mb-8 max-w-md"
          >
            您已成功连接到家庭网络
          </motion.p>
          
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: 'backOut', delay: 0.4 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl px-8 py-6 mb-12 border border-white/20 shadow-lg"
          >
            <p className="text-2xl md:text-3xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-blue-400">
              家庭网络中心
            </p>
          </motion.div>
          
          {/* 网络设备状态 */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.6 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-md"
          >
            <NetworkDeviceIcon name="路由器" icon="fa-wifi" color="#3b82f6" />
            <NetworkDeviceIcon name="智能电视" icon="fa-tv" color="#10b981" />
            <NetworkDeviceIcon name="安防系统" icon="fa-shield" color="#f59e0b" />
            <NetworkDeviceIcon name="智能家居" icon="fa-home" color="#8b5cf6" />
          </motion.div>
        </div>
        
        {/* 页脚信息 */}
        <motion.footer 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.8 }}
          className="text-center text-slate-400 text-sm py-6"
        >
          <p>家庭网络系统 © {new Date().getFullYear()}</p>
          <p className="mt-1">最后更新: {new Date().toLocaleDateString()}</p>
        </motion.footer>
      </div>
    </div>
  );
}