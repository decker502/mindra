// 应用数据
const appData = {
  meditationSessions: [
    {
      id: 1,
      title: "晨间正念冥想",
      duration: "10分钟",
      category: "专注",
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop",
      description: "以平静的心态开始新的一天"
    },
    {
      id: 2,
      title: "深度睡眠引导",
      duration: "20分钟",
      category: "睡前",
      image: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=400&fit=crop",
      description: "帮助您进入深度睡眠状态"
    },
    {
      id: 3,
      title: "工作压力缓解",
      duration: "15分钟",
      category: "放松",
      image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=400&fit=crop",
      description: "释放工作中的紧张情绪"
    },
    {
      id: 4,
      title: "自然森林音效",
      duration: "30分钟",
      category: "自然音效",
      image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=400&fit=crop",
      description: "沉浸在大自然的宁静之中"
    },
    {
      id: 5,
      title: "午休放松冥想",
      duration: "12分钟",
      category: "放松",
      image: "https://images.unsplash.com/photo-1540206395-68808572332f?w=400&h=400&fit=crop",
      description: "短暂的午休时光，恢复精力"
    },
    {
      id: 6,
      title: "专注力训练",
      duration: "25分钟",
      category: "专注",
      image: "https://images.unsplash.com/photo-1588453994019-81e4bfb5993e?w=400&h=400&fit=crop",
      description: "提高专注力和工作效率"
    }
  ],
  categories: ["全部", "专注", "睡前", "放松", "自然音效"],
  stats: {
    weeklyMinutes: 125,
    consecutiveDays: 7,
    totalSessions: 23,
    achievements: ["冥想新手", "连续一周", "专注大师"]
  },
  soundEffects: [
    {name: "雨声", icon: "cloud-rain"},
    {name: "海浪", icon: "water"},
    {name: "风铃", icon: "wind"},
    {name: "鸟鸣", icon: "dove"}
  ]
};

// 应用状态
let currentPage = 'home';
let currentSession = null;
let isPlaying = false;
let currentTime = 0;
let totalTime = 600; // 10分钟 = 600秒
let playTimer = null;
let currentCategory = '全部';
let viewMode = 'grid';
let favorites = new Set();
let isRepeating = false;

// 初始化应用
document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
  updateGreeting();
  renderRecommendedSessions();
  renderRecentSessions();
  renderLibraryGrid();
  renderCategoryTabs();
  renderCalendar();
  setupEventListeners();
});

// 初始化应用
function initializeApp() {
  showPage('home');
  updateNavigation();
}

// 更新问候语
function updateGreeting() {
  const hour = new Date().getHours();
  const greetingElement = document.querySelector('.greeting h1');
  let greeting = '';
  
  if (hour < 12) {
    greeting = '早上好！';
  } else if (hour < 18) {
    greeting = '下午好！';
  } else {
    greeting = '晚上好！';
  }
  
  if (greetingElement) {
    greetingElement.textContent = greeting;
  }
}

// 页面导航
function showPage(pageId) {
  // 隐藏所有页面
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });
  
  // 显示目标页面
  const targetPage = document.getElementById(pageId);
  if (targetPage) {
    targetPage.classList.add('active');
    currentPage = pageId;
    updateNavigation();
  }
}

// 更新导航栏
function updateNavigation() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
  });
  
  const activeNavItem = document.querySelector(`.nav-item[onclick="showPage('${currentPage}')"]`);
  if (activeNavItem) {
    activeNavItem.classList.add('active');
  }
}

// 返回上一页
function goBack() {
  if (currentPage === 'player') {
    showPage('home');
  } else {
    showPage('home');
  }
}

// 渲染推荐内容
function renderRecommendedSessions() {
  const container = document.getElementById('recommendedSessions');
  if (!container) return;
  
  const recommendedSessions = appData.meditationSessions.slice(0, 4);
  
  container.innerHTML = recommendedSessions.map(session => `
    <div class="session-card" onclick="playSession(${session.id})">
      <img src="${session.image}" alt="${session.title}">
      <div class="session-info">
        <h3>${session.title}</h3>
        <div class="session-meta">
          <span class="session-category">${session.category}</span>
          <span>${session.duration}</span>
        </div>
      </div>
    </div>
  `).join('');
}

// 渲染最近播放
function renderRecentSessions() {
  const container = document.getElementById('recentSessions');
  if (!container) return;
  
  const recentSessions = appData.meditationSessions.slice(0, 3);
  
  container.innerHTML = recentSessions.map(session => `
    <div class="session-list-item" onclick="playSession(${session.id})">
      <img src="${session.image}" alt="${session.title}">
      <div class="session-list-info">
        <h4>${session.title}</h4>
        <div class="meta">${session.category} • ${session.duration}</div>
      </div>
    </div>
  `).join('');
}

// 渲染分类标签
function renderCategoryTabs() {
  const container = document.getElementById('categoryTabs');
  if (!container) return;
  
  container.innerHTML = appData.categories.map(category => `
    <button class="category-tab ${category === currentCategory ? 'active' : ''}" 
            onclick="filterByCategory('${category}')">
      ${category}
    </button>
  `).join('');
}

// 按分类筛选
function filterByCategory(category) {
  currentCategory = category;
  renderCategoryTabs();
  renderLibraryGrid();
}

// 渲染素材库
function renderLibraryGrid() {
  const container = document.getElementById('libraryGrid');
  if (!container) return;
  
  let sessions = appData.meditationSessions;
  
  // 按分类筛选
  if (currentCategory !== '全部') {
    sessions = sessions.filter(session => session.category === currentCategory);
  }
  
  // 搜索筛选
  const searchInput = document.getElementById('searchInput');
  if (searchInput && searchInput.value.trim()) {
    const searchTerm = searchInput.value.trim().toLowerCase();
    sessions = sessions.filter(session => 
      session.title.toLowerCase().includes(searchTerm) ||
      session.description.toLowerCase().includes(searchTerm)
    );
  }
  
  if (viewMode === 'grid') {
    container.className = 'session-grid';
    container.innerHTML = sessions.map(session => `
      <div class="session-card" onclick="playSession(${session.id})">
        <img src="${session.image}" alt="${session.title}">
        <div class="session-info">
          <h3>${session.title}</h3>
          <div class="session-meta">
            <span class="session-category">${session.category}</span>
            <span>${session.duration}</span>
          </div>
        </div>
      </div>
    `).join('');
  } else {
    container.className = 'session-list';
    container.innerHTML = sessions.map(session => `
      <div class="session-list-item" onclick="playSession(${session.id})">
        <img src="${session.image}" alt="${session.title}">
        <div class="session-list-info">
          <h4>${session.title}</h4>
          <div class="meta">${session.category} • ${session.duration}</div>
          <p style="font-size: 12px; color: var(--color-text-secondary); margin-top: 4px;">
            ${session.description}
          </p>
        </div>
      </div>
    `).join('');
  }
}

// 切换视图模式
function toggleView(mode) {
  viewMode = mode;
  
  // 更新按钮状态
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  event.target.classList.add('active');
  
  // 重新渲染
  renderLibraryGrid();
}

// 播放冥想
function playSession(sessionId) {
  const session = appData.meditationSessions.find(s => s.id === sessionId);
  if (!session) return;
  
  currentSession = session;
  
  // 更新播放页面信息
  document.getElementById('currentImage').src = session.image;
  document.getElementById('currentTitle').textContent = session.title;
  document.getElementById('currentCategory').textContent = session.category;
  
  // 重置播放状态
  currentTime = 0;
  totalTime = parseInt(session.duration) * 60; // 转换为秒
  isPlaying = false;
  
  updatePlayerUI();
  showPage('player');
}

// 开始冥想（快速开始）
function startMeditation() {
  if (appData.meditationSessions.length > 0) {
    playSession(appData.meditationSessions[0].id);
  }
}

// 播放/暂停控制
function togglePlayPause() {
  isPlaying = !isPlaying;
  
  if (isPlaying) {
    startPlayTimer();
  } else {
    stopPlayTimer();
  }
  
  updatePlayerUI();
}

// 开始播放计时器
function startPlayTimer() {
  if (playTimer) {
    clearInterval(playTimer);
  }
  
  playTimer = setInterval(() => {
    currentTime += 1;
    
    if (currentTime >= totalTime) {
      currentTime = totalTime;
      isPlaying = false;
      
      if (isRepeating) {
        currentTime = 0;
        isPlaying = true;
      } else {
        stopPlayTimer();
      }
    }
    
    updatePlayerUI();
  }, 1000);
}

// 停止播放计时器
function stopPlayTimer() {
  if (playTimer) {
    clearInterval(playTimer);
    playTimer = null;
  }
}

// 更新播放器UI
function updatePlayerUI() {
  // 更新播放按钮
  const playIcon = document.getElementById('playIcon');
  if (playIcon) {
    playIcon.className = isPlaying ? 'fas fa-pause' : 'fas fa-play';
  }
  
  // 更新进度条
  const progress = (currentTime / totalTime) * 100;
  const progressFill = document.getElementById('progressFill');
  const progressHandle = document.getElementById('progressHandle');
  
  if (progressFill) {
    progressFill.style.width = progress + '%';
  }
  
  if (progressHandle) {
    progressHandle.style.left = progress + '%';
  }
  
  // 更新时间显示
  const currentTimeElement = document.getElementById('currentTime');
  const totalTimeElement = document.getElementById('totalTime');
  
  if (currentTimeElement) {
    currentTimeElement.textContent = formatTime(currentTime);
  }
  
  if (totalTimeElement) {
    totalTimeElement.textContent = formatTime(totalTime);
  }
  
  // 更新重复按钮
  const repeatIcon = document.getElementById('repeatIcon');
  if (repeatIcon) {
    repeatIcon.className = isRepeating ? 'fas fa-redo' : 'fas fa-redo';
    repeatIcon.parentElement.classList.toggle('active', isRepeating);
  }
}

// 格式化时间
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// 上一首
function previousTrack() {
  if (!currentSession) return;
  
  const currentIndex = appData.meditationSessions.findIndex(s => s.id === currentSession.id);
  let prevIndex = currentIndex - 1;
  
  if (prevIndex < 0) {
    prevIndex = appData.meditationSessions.length - 1;
  }
  
  playSession(appData.meditationSessions[prevIndex].id);
}

// 下一首
function nextTrack() {
  if (!currentSession) return;
  
  const currentIndex = appData.meditationSessions.findIndex(s => s.id === currentSession.id);
  let nextIndex = currentIndex + 1;
  
  if (nextIndex >= appData.meditationSessions.length) {
    nextIndex = 0;
  }
  
  playSession(appData.meditationSessions[nextIndex].id);
}

// 切换重复播放
function toggleRepeat() {
  isRepeating = !isRepeating;
  updatePlayerUI();
}

// 切换收藏
function toggleFavorite() {
  if (!currentSession) return;
  
  const favoriteBtn = document.querySelector('.favorite-btn');
  if (favorites.has(currentSession.id)) {
    favorites.delete(currentSession.id);
    favoriteBtn.innerHTML = '<i class="far fa-heart"></i>';
    favoriteBtn.classList.remove('active');
  } else {
    favorites.add(currentSession.id);
    favoriteBtn.innerHTML = '<i class="fas fa-heart"></i>';
    favoriteBtn.classList.add('active');
  }
}

// 渲染日历
function renderCalendar() {
  const container = document.getElementById('calendarGrid');
  if (!container) return;
  
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  // 获取当月第一天和最后一天
  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  
  // 获取当月第一天是星期几
  const startDay = firstDay.getDay();
  
  // 生成日历
  let calendarHTML = '';
  
  // 星期标题
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
  weekdays.forEach(day => {
    calendarHTML += `<div class="calendar-day" style="font-weight: bold; color: var(--color-text-secondary);">${day}</div>`;
  });
  
  // 空白天数
  for (let i = 0; i < startDay; i++) {
    calendarHTML += '<div class="calendar-day"></div>';
  }
  
  // 当月天数
  for (let day = 1; day <= lastDay.getDate(); day++) {
    const isToday = day === today.getDate();
    const hasSession = Math.random() > 0.7; // 随机生成一些有冥想记录的日子
    
    let classes = 'calendar-day';
    if (isToday) classes += ' today';
    if (hasSession) classes += ' has-session';
    
    calendarHTML += `<div class="${classes}">${day}</div>`;
  }
  
  container.innerHTML = calendarHTML;
}

// 设置事件监听器
function setupEventListeners() {
  // 搜索输入
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', debounce(() => {
      renderLibraryGrid();
    }, 300));
  }
  
  // 进度条点击
  const progressBar = document.querySelector('.progress-bar');
  if (progressBar) {
    progressBar.addEventListener('click', (e) => {
      const rect = progressBar.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percentage = clickX / rect.width;
      currentTime = Math.floor(percentage * totalTime);
      updatePlayerUI();
    });
  }
  
  // 模态框点击外部关闭
  const modal = document.getElementById('modal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
  }
}

// 防抖函数
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// 模态框功能
function showModal(title, content) {
  const modal = document.getElementById('modal');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');
  
  modalTitle.textContent = title;
  modalBody.innerHTML = content;
  modal.classList.add('active');
}

function closeModal() {
  const modal = document.getElementById('modal');
  modal.classList.remove('active');
}

// 显示添加素材模态框
function showAddModal() {
  const content = `
    <div class="form-group">
      <label class="form-label">添加方式</label>
      <div style="display: flex; gap: 12px; margin-bottom: 16px;">
        <button class="btn btn--primary" onclick="addFromLocal()">
          <i class="fas fa-upload"></i> 本地导入
        </button>
        <button class="btn btn--outline" onclick="addFromUrl()">
          <i class="fas fa-link"></i> 网络链接
        </button>
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">标题</label>
      <input type="text" class="form-control" placeholder="请输入冥想标题" id="newTitle">
    </div>
    <div class="form-group">
      <label class="form-label">时长</label>
      <input type="text" class="form-control" placeholder="例如：10分钟" id="newDuration">
    </div>
    <div class="form-group">
      <label class="form-label">分类</label>
      <select class="form-control" id="newCategory">
        <option value="专注">专注</option>
        <option value="睡前">睡前</option>
        <option value="放松">放松</option>
        <option value="自然音效">自然音效</option>
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">描述</label>
      <textarea class="form-control" rows="3" placeholder="请输入描述" id="newDescription"></textarea>
    </div>
    <div style="display: flex; gap: 12px; margin-top: 20px;">
      <button class="btn btn--primary" onclick="saveNewSession()">保存</button>
      <button class="btn btn--outline" onclick="closeModal()">取消</button>
    </div>
  `;
  
  showModal('添加冥想素材', content);
}

// 从本地添加
function addFromLocal() {
  alert('本地导入功能：在实际应用中，这里会打开文件选择器');
}

// 从网络添加
function addFromUrl() {
  const urlInput = `
    <div class="form-group">
      <label class="form-label">网络链接</label>
      <input type="url" class="form-control" placeholder="请输入音频链接" id="audioUrl">
    </div>
  `;
  
  const modalBody = document.getElementById('modalBody');
  modalBody.insertAdjacentHTML('afterbegin', urlInput);
}

// 保存新会话
function saveNewSession() {
  const title = document.getElementById('newTitle').value;
  const duration = document.getElementById('newDuration').value;
  const category = document.getElementById('newCategory').value;
  const description = document.getElementById('newDescription').value;
  
  if (!title || !duration) {
    alert('请填写标题和时长');
    return;
  }
  
  const newSession = {
    id: Date.now(),
    title,
    duration,
    category,
    description,
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop'
  };
  
  appData.meditationSessions.push(newSession);
  renderLibraryGrid();
  closeModal();
  
  alert('素材添加成功！');
}

// 显示定时器模态框
function showTimerModal() {
  const content = `
    <div class="form-group">
      <label class="form-label">定时时长</label>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
        <button class="btn btn--outline" onclick="setTimer(5)">5分钟</button>
        <button class="btn btn--outline" onclick="setTimer(10)">10分钟</button>
        <button class="btn btn--outline" onclick="setTimer(15)">15分钟</button>
        <button class="btn btn--outline" onclick="setTimer(20)">20分钟</button>
        <button class="btn btn--outline" onclick="setTimer(30)">30分钟</button>
        <button class="btn btn--outline" onclick="setTimer(60)">60分钟</button>
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">自定义时长（分钟）</label>
      <input type="number" class="form-control" placeholder="请输入分钟数" id="customTimer" min="1" max="120">
    </div>
    <div style="display: flex; gap: 12px; margin-top: 20px;">
      <button class="btn btn--primary" onclick="startCustomTimer()">开始定时冥想</button>
      <button class="btn btn--outline" onclick="closeModal()">取消</button>
    </div>
  `;
  
  showModal('定时冥想', content);
}

// 设置定时器
function setTimer(minutes) {
  totalTime = minutes * 60;
  document.getElementById('customTimer').value = minutes;
}

// 开始自定义定时冥想
function startCustomTimer() {
  const customMinutes = document.getElementById('customTimer').value;
  if (customMinutes && customMinutes > 0) {
    totalTime = customMinutes * 60;
    currentTime = 0;
    
    // 创建一个简单的定时冥想会话
    const timerSession = {
      id: 'timer',
      title: `定时冥想 ${customMinutes}分钟`,
      duration: `${customMinutes}分钟`,
      category: '定时',
      description: '专注呼吸，享受宁静时光',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop'
    };
    
    currentSession = timerSession;
    
    // 更新播放页面
    document.getElementById('currentImage').src = timerSession.image;
    document.getElementById('currentTitle').textContent = timerSession.title;
    document.getElementById('currentCategory').textContent = timerSession.category;
    
    updatePlayerUI();
    closeModal();
    showPage('player');
  }
}

// 显示音效面板
function showSoundEffects() {
  const content = `
    <div class="form-group">
      <label class="form-label">背景音效</label>
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
        ${appData.soundEffects.map(effect => `
          <button class="btn btn--outline" onclick="toggleSoundEffect('${effect.name}')">
            <i class="fas fa-${effect.icon}"></i>
            ${effect.name}
          </button>
        `).join('')}
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">音量控制</label>
      <input type="range" class="form-control" min="0" max="100" value="50" id="volumeControl">
    </div>
    <div style="display: flex; gap: 12px; margin-top: 20px;">
      <button class="btn btn--primary" onclick="closeModal()">确定</button>
    </div>
  `;
  
  showModal('音效设置', content);
}

// 切换音效
function toggleSoundEffect(effectName) {
  const button = event.target;
  button.classList.toggle('btn--primary');
  button.classList.toggle('btn--outline');
  
  // 在实际应用中，这里会控制音效的播放
  console.log(`切换音效: ${effectName}`);
}

// 显示主题设置
function showThemeModal() {
  const content = `
    <div class="form-group">
      <label class="form-label">主题选择</label>
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <button class="btn btn--outline" onclick="setTheme('light')">
          <i class="fas fa-sun"></i> 浅色主题
        </button>
        <button class="btn btn--outline" onclick="setTheme('dark')">
          <i class="fas fa-moon"></i> 深色主题
        </button>
        <button class="btn btn--outline" onclick="setTheme('auto')">
          <i class="fas fa-adjust"></i> 跟随系统
        </button>
      </div>
    </div>
    <div style="display: flex; gap: 12px; margin-top: 20px;">
      <button class="btn btn--primary" onclick="closeModal()">确定</button>
    </div>
  `;
  
  showModal('主题设置', content);
}

// 设置主题
function setTheme(theme) {
  // 在实际应用中，这里会保存主题设置
  console.log(`设置主题: ${theme}`);
  alert(`主题已设置为: ${theme === 'light' ? '浅色' : theme === 'dark' ? '深色' : '跟随系统'}`);
}

// 显示目标设置
function showGoalModal() {
  const content = `
    <div class="form-group">
      <label class="form-label">每日目标</label>
      <select class="form-control" id="dailyGoal">
        <option value="10">10分钟</option>
        <option value="15">15分钟</option>
        <option value="20" selected>20分钟</option>
        <option value="30">30分钟</option>
        <option value="60">60分钟</option>
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">每周目标</label>
      <select class="form-control" id="weeklyGoal">
        <option value="3">3次</option>
        <option value="5">5次</option>
        <option value="7" selected>7次</option>
        <option value="10">10次</option>
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">提醒时间</label>
      <input type="time" class="form-control" id="reminderTime" value="09:00">
    </div>
    <div style="display: flex; gap: 12px; margin-top: 20px;">
      <button class="btn btn--primary" onclick="saveGoalSettings()">保存</button>
      <button class="btn btn--outline" onclick="closeModal()">取消</button>
    </div>
  `;
  
  showModal('目标设置', content);
}

// 保存目标设置
function saveGoalSettings() {
  const dailyGoal = document.getElementById('dailyGoal').value;
  const weeklyGoal = document.getElementById('weeklyGoal').value;
  const reminderTime = document.getElementById('reminderTime').value;
  
  // 在实际应用中，这里会保存设置
  console.log('保存目标设置:', { dailyGoal, weeklyGoal, reminderTime });
  alert('目标设置已保存！');
  closeModal();
}

// 其他模态框函数
function showLanguageModal() {
  const content = `
    <div class="form-group">
      <label class="form-label">语言选择</label>
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <button class="btn btn--primary">中文简体</button>
        <button class="btn btn--outline">English</button>
        <button class="btn btn--outline">日本語</button>
      </div>
    </div>
  `;
  showModal('语言设置', content);
}

function showNotificationModal() {
  const content = `
    <div class="form-group">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <span>冥想提醒</span>
        <input type="checkbox" checked>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <span>成就通知</span>
        <input type="checkbox" checked>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <span>目标提醒</span>
        <input type="checkbox" checked>
      </div>
    </div>
  `;
  showModal('通知设置', content);
}

function showPrivacyModal() {
  const content = `
    <div style="font-size: 14px; line-height: 1.6;">
      <p>我们重视您的隐私，承诺：</p>
      <ul style="margin-left: 20px;">
        <li>不会收集您的个人敏感信息</li>
        <li>冥想数据仅存储在本地设备</li>
        <li>不会向第三方分享您的数据</li>
        <li>您可以随时删除所有数据</li>
      </ul>
    </div>
  `;
  showModal('隐私设置', content);
}

function showStorageModal() {
  const content = `
    <div class="form-group">
      <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
        <span>已使用存储</span>
        <span>12.5 MB</span>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
        <span>缓存数据</span>
        <span>8.2 MB</span>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
        <span>用户数据</span>
        <span>4.3 MB</span>
      </div>
    </div>
    <div style="display: flex; gap: 12px; margin-top: 20px;">
      <button class="btn btn--outline" onclick="clearCache()">清除缓存</button>
      <button class="btn btn--outline" onclick="clearAllData()">清除所有数据</button>
    </div>
  `;
  showModal('存储管理', content);
}

function clearCache() {
  alert('缓存已清除');
  closeModal();
}

function clearAllData() {
  if (confirm('确定要清除所有数据吗？此操作不可恢复。')) {
    alert('所有数据已清除');
    closeModal();
  }
}

function showHelpModal() {
  const content = `
    <div style="font-size: 14px; line-height: 1.6;">
      <h4>常见问题</h4>
      <div style="margin-bottom: 16px;">
        <strong>Q: 如何开始冥想？</strong><br>
        A: 点击首页的"开始冥想"按钮，或从素材库选择您喜欢的冥想内容。
      </div>
      <div style="margin-bottom: 16px;">
        <strong>Q: 如何设置定时冥想？</strong><br>
        A: 在首页点击"定时冥想"按钮，选择或自定义冥想时长。
      </div>
      <div style="margin-bottom: 16px;">
        <strong>Q: 如何添加自己的音频？</strong><br>
        A: 在素材库页面点击"+"按钮，可以从本地导入或添加网络链接。
      </div>
    </div>
  `;
  showModal('帮助中心', content);
}

function showFeedbackModal() {
  const content = `
    <div class="form-group">
      <label class="form-label">反馈类型</label>
      <select class="form-control" id="feedbackType">
        <option value="bug">Bug报告</option>
        <option value="feature">功能建议</option>
        <option value="other">其他</option>
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">反馈内容</label>
      <textarea class="form-control" rows="4" placeholder="请详细描述您的反馈" id="feedbackContent"></textarea>
    </div>
    <div style="display: flex; gap: 12px; margin-top: 20px;">
      <button class="btn btn--primary" onclick="submitFeedback()">提交反馈</button>
      <button class="btn btn--outline" onclick="closeModal()">取消</button>
    </div>
  `;
  showModal('意见反馈', content);
}

function submitFeedback() {
  const type = document.getElementById('feedbackType').value;
  const content = document.getElementById('feedbackContent').value;
  
  if (!content.trim()) {
    alert('请输入反馈内容');
    return;
  }
  
  // 在实际应用中，这里会提交反馈到服务器
  console.log('提交反馈:', { type, content });
  alert('反馈已提交，感谢您的建议！');
  closeModal();
}

function showAboutModal() {
  const content = `
    <div style="text-align: center; font-size: 14px; line-height: 1.6;">
      <h3 style="color: var(--app-primary); margin-bottom: 16px;">Mindra</h3>
      <p>版本: 1.0.0</p>
      <p style="margin: 16px 0;">一款专注于冥想和正念的应用，帮助您找到内心的平静与专注。</p>
      <div style="margin-top: 20px;">
        <p style="color: var(--color-text-secondary);">© 2024 Mindra Team</p>
      </div>
    </div>
  `;
  showModal('关于应用', content);
}

// 显示播放器菜单
function showPlayerMenu() {
  const content = `
    <div style="display: flex; flex-direction: column; gap: 12px;">
      <button class="btn btn--outline" onclick="shareSession()">
        <i class="fas fa-share"></i> 分享
      </button>
      <button class="btn btn--outline" onclick="downloadSession()">
        <i class="fas fa-download"></i> 下载
      </button>
      <button class="btn btn--outline" onclick="addToPlaylist()">
        <i class="fas fa-list"></i> 添加到播放列表
      </button>
      <button class="btn btn--outline" onclick="reportSession()">
        <i class="fas fa-flag"></i> 举报
      </button>
    </div>
  `;
  showModal('更多选项', content);
}

function shareSession() {
  alert('分享功能：在实际应用中，这里会打开分享菜单');
  closeModal();
}

function downloadSession() {
  alert('下载功能：在实际应用中，这里会开始下载音频');
  closeModal();
}

function addToPlaylist() {
  alert('添加到播放列表：在实际应用中，这里会显示播放列表选择');
  closeModal();
}

function reportSession() {
  alert('举报功能：在实际应用中，这里会打开举报表单');
  closeModal();
}

// 显示定时器设置
function showTimerSetting() {
  const content = `
    <div class="form-group">
      <label class="form-label">定时结束</label>
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
        <button class="btn btn--outline" onclick="setEndTimer(10)">10分钟后</button>
        <button class="btn btn--outline" onclick="setEndTimer(20)">20分钟后</button>
        <button class="btn btn--outline" onclick="setEndTimer(30)">30分钟后</button>
        <button class="btn btn--outline" onclick="setEndTimer(60)">60分钟后</button>
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">结束后操作</label>
      <select class="form-control" id="endAction">
        <option value="stop">停止播放</option>
        <option value="fadeOut">淡出结束</option>
        <option value="nextTrack">播放下一首</option>
      </select>
    </div>
    <div style="display: flex; gap: 12px; margin-top: 20px;">
      <button class="btn btn--primary" onclick="confirmTimerSetting()">确定</button>
      <button class="btn btn--outline" onclick="closeModal()">取消</button>
    </div>
  `;
  showModal('定时设置', content);
}

function setEndTimer(minutes) {
  // 在实际应用中，这里会设置定时器
  console.log(`设置定时结束: ${minutes}分钟`);
}

function confirmTimerSetting() {
  const endAction = document.getElementById('endAction').value;
  console.log(`确认定时设置，结束动作: ${endAction}`);
  alert('定时设置已保存');
  closeModal();
}

// 页面加载完成后的初始化
window.addEventListener('load', function() {
  console.log('Mindra冥想应用已加载完成');
});

// 防止页面刷新时丢失播放状态
window.addEventListener('beforeunload', function() {
  if (playTimer) {
    clearInterval(playTimer);
  }
});