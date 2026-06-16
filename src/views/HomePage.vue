<template>
  <div class="home-container">
    <!-- 顶部横幅 - 带装饰 -->
    <div class="hero-section">
      <div class="hero-bg-shapes">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
        <div class="shape shape-4"></div>
      </div>
      <div class="hero-content">
        <div class="hero-icon">
          <i class="bi bi-journal-bookmark-fill"></i>
        </div>
        <h1 class="hero-title">智慧图书馆管理系统</h1>
        <p class="hero-subtitle">智能 · 便捷 · 高效</p>
        <div class="hero-stats">
          <div class="hero-stat">
            <span class="hero-stat-num">{{ totalBooks }}</span>
            <span class="hero-stat-label">馆藏图书</span>
          </div>
          <div class="hero-stat-divider"></div>
          <div class="hero-stat">
            <span class="hero-stat-num">{{ totalStudents }}</span>
            <span class="hero-stat-label">注册读者</span>
          </div>
          <div class="hero-stat-divider"></div>
          <div class="hero-stat">
            <span class="hero-stat-num">{{ todayBorrows }}</span>
            <span class="hero-stat-label">今日借阅</span>
          </div>
        </div>
      </div>
    </div>

    <div class="container-custom">
      <div class="row g-4">
        <!-- 左侧：图书检索 -->
        <div class="col-lg-8">
          <div class="card main-card">
            <div class="card-header main-header">
              <span class="header-title">
                <i class="bi bi-search"></i> 图书检索
              </span>
              <span v-if="loggedInUser" class="header-user">
                <span class="user-dot"></span>
                <i class="bi bi-person-circle"></i>
                {{ loggedInUser.sName || loggedInUser.username }}
                <span class="header-role">{{ userTypeName }}</span>
              </span>
            </div>
            <div class="card-body">
              <BookSearch :user-info="loggedInUser" />
            </div>
          </div>
        </div>

        <!-- 右侧 -->
        <div class="col-lg-4">
          <!-- 登录/用户卡片 -->
          <div class="card side-card user-card-wrapper">
            <!-- 未登录 -->
            <div v-if="!loggedInUser" class="login-box">
              <div class="login-icon-wrapper">
                <div class="login-icon-ring">
                  <i class="bi bi-box-arrow-in-right"></i>
                </div>
              </div>
              <div class="login-title">欢迎使用</div>
              <div class="login-desc">登录后体验完整功能</div>
              <div class="login-buttons">
                <button class="btn-login admin" @click="showLogin = true">
                  <i class="bi bi-shield-lock"></i> 管理员
                </button>
                <button class="btn-login student" @click="showStudentLogin = true">
                  <i class="bi bi-person"></i> 学生
                </button>
              </div>
            </div>

            <!-- 已登录 -->
            <div v-else class="user-box">
              <div class="user-profile">
                <div class="user-avatar" :style="{ background: userGradient }">
                  {{ userInitial }}
                  <span class="user-online"></span>
                </div>
                <div class="user-info">
                  <div class="user-name">{{ loggedInUser.sName || loggedInUser.username }}</div>
                  <div class="user-role">
                    <i class="bi" :class="userTypeIcon"></i>
                    {{ userTypeName }}
                  </div>
                </div>
              </div>
              <div class="user-stats">
                <div class="stat-item">
                  <span class="stat-num">{{ borrowCount }}</span>
                  <span class="stat-label">借阅中</span>
                </div>
                <div class="stat-divider"></div>
                <div class="stat-item">
                  <span class="stat-num">{{ fineCount }}</span>
                  <span class="stat-label">未缴罚款</span>
                </div>
                <div class="stat-divider"></div>
                <div class="stat-item">
                  <span class="stat-num status-badge-sm" :class="cardStatusClass">{{ cardStatusText }}</span>
                  <span class="stat-label">借书证</span>
                </div>
              </div>
              <div class="user-actions">
                <button class="btn-enter" @click="goToMain">
                  <i class="bi bi-grid-3x3-gap-fill"></i> 进入系统
                </button>
                <button class="btn-logout" @click="doLogout">
                  <i class="bi bi-box-arrow-right"></i> 退出
                </button>
              </div>
            </div>
          </div>

          <!-- 排行榜 -->
          <div class="card side-card rank-card mt-4">
            <div class="card-header rank-header">
              <span class="header-title">
                <i class="bi bi-trophy-fill trophy-icon"></i> 借书达人榜
              </span>
              <button class="btn-refresh" @click="loadRankings">
                <i class="bi bi-arrow-repeat"></i>
              </button>
            </div>
            <div class="card-body p-0">
              <div class="rank-list">
                <div v-for="(item, idx) in studentRanking.slice(0, 5)" :key="idx" class="rank-item" :class="{ 'rank-top': idx < 3 }">
                  <div class="rank-left">
                    <span class="rank-num" :class="getRankClass(idx + 1)">{{ idx + 1 }}</span>
                    <span class="rank-name">{{ item.name || item.sno }}</span>
                  </div>
                  <div class="rank-right">
                    <span class="rank-count">{{ item.borrowCount }}</span>
                    <span class="rank-unit">次</span>
                    <span class="rank-medal" v-if="idx === 0">🏆</span>
                    <span class="rank-medal" v-else-if="idx === 1">🥈</span>
                    <span class="rank-medal" v-else-if="idx === 2">🥉</span>
                  </div>
                </div>
                <div v-if="studentRanking.length === 0" class="rank-empty">暂无数据</div>
              </div>
            </div>
          </div>

          <!-- 热门图书 -->
          <div class="card side-card rank-card mt-4">
            <div class="card-header rank-header">
              <span class="header-title">
                <i class="bi bi-star-fill star-icon"></i> 热门图书榜
              </span>
            </div>
            <div class="card-body p-0">
              <div class="rank-list">
                <div v-for="(item, idx) in bookRanking.slice(0, 5)" :key="idx" class="rank-item" :class="{ 'rank-top': idx < 3 }">
                  <div class="rank-left">
                    <span class="rank-num" :class="getRankClass(idx + 1)">{{ idx + 1 }}</span>
                    <span class="rank-name">{{ item.name || item.isbn }}</span>
                  </div>
                  <div class="rank-right">
                    <span class="rank-count" style="color:#f5576c;">{{ item.borrowCount }}</span>
                    <span class="rank-unit">次</span>
                    <span class="rank-medal" v-if="idx === 0">📚</span>
                    <span class="rank-medal" v-else-if="idx === 1">📖</span>
                    <span class="rank-medal" v-else-if="idx === 2">📕</span>
                  </div>
                </div>
                <div v-if="bookRanking.length === 0" class="rank-empty">暂无数据</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <LoginModal :visible.sync="showLogin" @login-success="handleLoginSuccess" />
    <LoginModal :visible.sync="showStudentLogin" @login-success="handleLoginSuccess" />
  </div>
</template>

<script>
import LoginModal from '../components/LoginModal.vue'
import BookSearch from '../components/BookSearch.vue'
import { getStudentRanking, getBookRanking, getPersonalInfo, getFines } from '../api'

export default {
  name: 'HomePage',
  components: {
    LoginModal,
    BookSearch
  },
  data() {
    return {
      showLogin: false,
      showStudentLogin: false,
      loggedInUser: null,
      studentRanking: [],
      bookRanking: [],
      borrowCount: 0,
      fineCount: 0,
      totalBooks: 0,
      totalStudents: 0,
      todayBorrows: 0
    }
  },
  computed: {
    userTypeName() {
      if (!this.loggedInUser) return ''
      if (this.loggedInUser.userType === 'student') {
        return this.loggedInUser.type || '本科生'
      }
      const names = ['证件管理员', '采编管理员', '流通管理员']
      return names[this.loggedInUser.adminType] || '管理员'
    },
    userTypeIcon() {
      if (!this.loggedInUser) return 'bi-person'
      return this.loggedInUser.userType === 'student' ? 'bi-mortarboard' : 'bi-briefcase'
    },
    userInitial() {
      const name = this.loggedInUser?.sName || this.loggedInUser?.username || 'U'
      return name.charAt(0).toUpperCase()
    },
    userGradient() {
      const gradients = [
        'linear-gradient(135deg, #667eea, #764ba2)',
        'linear-gradient(135deg, #f093fb, #f5576c)',
        'linear-gradient(135deg, #4facfe, #00f2fe)',
        'linear-gradient(135deg, #43e97b, #38f9d7)',
        'linear-gradient(135deg, #fa709a, #fee140)'
      ]
      const hash = this.userInitial.charCodeAt(0) || 0
      return gradients[hash % gradients.length]
    },
    cardStatusText() {
      return this.loggedInUser?.cardStatus || '正常'
    },
    cardStatusClass() {
      const s = this.cardStatusText
      if (s === '正常') return 'status-ok'
      if (s === '挂失') return 'status-warn'
      return 'status-err'
    }
  },
  methods: {
    getRankClass(rank) {
      if (rank === 1) return 'rank-gold'
      if (rank === 2) return 'rank-silver'
      if (rank === 3) return 'rank-bronze'
      return ''
    },
    async loadRankings() {
      try {
        const [stu, book] = await Promise.all([getStudentRanking(), getBookRanking()])
        this.studentRanking = stu.data || []
        this.bookRanking = book.data || []
      } catch (e) {
        console.error('加载排行榜失败:', e)
      }
    },
    async loadUserStats() {
      if (!this.loggedInUser) return
      const sno = this.loggedInUser.sno
      if (!sno) return
      try {
        const [info, fine] = await Promise.all([
          getPersonalInfo(sno),
          getFines(sno)
        ])
        this.borrowCount = info.data?.currentlyBorrowed || 0
        if (fine.data) {
          this.fineCount = fine.data.filter(f => f.status === '未缴纳').length
        }
      } catch (e) {
        console.error('加载用户统计失败:', e)
      }
    },
    handleLoginSuccess(userInfo) {
      this.loggedInUser = userInfo
      this.$store.dispatch('setAdminInfo', userInfo)
      this.loadUserStats()
    },
    goToMain() {
      this.$router.push('/main')
    },
    doLogout() {
      this.loggedInUser = null
      this.borrowCount = 0
      this.fineCount = 0
      this.$store.dispatch('clearAdminInfo')
    }
  },
  mounted() {
    this.loadRankings()
    const stored = this.$store.getters.adminInfo
    if (stored) {
      this.loggedInUser = stored
      this.loadUserStats()
    }
  }
}
</script>

<style scoped>
/* ===== 全局背景 ===== */
.home-container {
  min-height: 100vh;
  background:
    radial-gradient(ellipse at 10% 20%, rgba(102, 126, 234, 0.06) 0%, transparent 50%),
    radial-gradient(ellipse at 90% 80%, rgba(118, 75, 162, 0.06) 0%, transparent 50%),
    radial-gradient(ellipse at 50% 50%, rgba(245, 87, 108, 0.04) 0%, transparent 70%),
    #f5f7fb;
}

/* ===== 顶部横幅 ===== */
.hero-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  padding: 44px 20px 36px;
  text-align: center;
  color: #fff;
  position: relative;
  overflow: hidden;
}

.hero-bg-shapes {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
}

.shape {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.06);
}

.shape-1 {
  width: 300px;
  height: 300px;
  top: -100px;
  right: -60px;
  background: rgba(255, 255, 255, 0.05);
}

.shape-2 {
  width: 200px;
  height: 200px;
  bottom: -80px;
  left: -40px;
  background: rgba(255, 255, 255, 0.04);
}

.shape-3 {
  width: 120px;
  height: 120px;
  top: 10px;
  left: 20%;
  background: rgba(255, 255, 255, 0.03);
}

.shape-4 {
  width: 80px;
  height: 80px;
  bottom: 20px;
  right: 25%;
  background: rgba(255, 255, 255, 0.05);
}

.hero-content {
  position: relative;
  z-index: 1;
}

.hero-icon {
  font-size: 48px;
  margin-bottom: 12px;
  display: inline-block;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-8px) scale(1.05); }
}

.hero-title {
  font-size: 28px;
  font-weight: 700;
  letter-spacing: 1px;
  margin: 0 0 4px;
  text-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
}

.hero-subtitle {
  font-size: 14px;
  opacity: 0.85;
  letter-spacing: 8px;
  margin: 0 0 20px;
}

.hero-stats {
  display: inline-flex;
  align-items: center;
  gap: 24px;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(10px);
  padding: 12px 32px;
  border-radius: 50px;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.hero-stat {
  text-align: center;
}

.hero-stat-num {
  display: block;
  font-size: 22px;
  font-weight: 700;
  color: #fff;
}

.hero-stat-label {
  font-size: 11px;
  opacity: 0.7;
}

.hero-stat-divider {
  width: 1px;
  height: 30px;
  background: rgba(255, 255, 255, 0.2);
}

/* ===== 内容容器 ===== */
.container-custom {
  max-width: 1400px;
  margin: -20px auto 0;
  padding: 0 24px 40px;
  position: relative;
  z-index: 1;
}

/* ===== 卡片 ===== */
.card {
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(12px);
  border: none;
  border-radius: 20px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  transition: all 0.3s ease;
}

.card:hover {
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.06);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 24px;
  background: transparent;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
}

.header-title {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a2e;
}

.header-title i {
  margin-right: 8px;
}

.main-header {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.06), rgba(118, 75, 162, 0.04));
}

/* ===== 卡片头部用户 ===== */
.header-user {
  font-size: 13px;
  font-weight: 400;
  color: #888;
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #2ecc71;
  display: inline-block;
  animation: pulse-dot 2s infinite;
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.8); }
}

.header-user i {
  color: #667eea;
  font-size: 16px;
}

.header-role {
  background: rgba(102, 126, 234, 0.1);
  padding: 2px 12px;
  border-radius: 12px;
  font-size: 11px;
  color: #667eea;
}

/* ===== 登录卡片 ===== */
.side-card {
  border-radius: 20px;
}

.login-box {
  padding: 32px 20px 28px;
  text-align: center;
}

.login-icon-wrapper {
  margin-bottom: 16px;
}

.login-icon-ring {
  width: 68px;
  height: 68px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.12), rgba(118, 75, 162, 0.08));
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  color: #667eea;
  border: 2px solid rgba(102, 126, 234, 0.1);
}

.login-title {
  font-size: 20px;
  font-weight: 600;
  color: #1a1a2e;
  margin-bottom: 4px;
}

.login-desc {
  font-size: 13px;
  color: #aaa;
  margin-bottom: 20px;
}

.login-buttons {
  display: flex;
  gap: 10px;
}

.btn-login {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: #fff;
}

.btn-login.admin {
  background: linear-gradient(135deg, #667eea, #764ba2);
}
.btn-login.admin:hover { transform: translateY(-2px); box-shadow: 0 6px 24px rgba(102, 126, 234, 0.35); }

.btn-login.student {
  background: linear-gradient(135deg, #11998e, #38ef7d);
}
.btn-login.student:hover { transform: translateY(-2px); box-shadow: 0 6px 24px rgba(17, 153, 142, 0.35); }

/* ===== 用户卡片 ===== */
.user-box {
  padding: 20px 24px 24px;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 18px;
}

.user-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  color: #fff;
  font-size: 22px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.user-online {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #2ecc71;
  border: 2px solid #fff;
  animation: pulse-dot 2s infinite;
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a2e;
}

.user-role {
  font-size: 12px;
  color: #aaa;
  display: flex;
  align-items: center;
  gap: 4px;
}

.user-stats {
  display: flex;
  padding: 14px 0;
  border-top: 1px solid rgba(0, 0, 0, 0.04);
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
  margin-bottom: 18px;
}

.stat-item {
  flex: 1;
  text-align: center;
}

.stat-num {
  display: block;
  font-size: 22px;
  font-weight: 700;
  color: #1a1a2e;
}

.stat-label {
  font-size: 11px;
  color: #bbb;
  margin-top: 2px;
}

.stat-divider {
  width: 1px;
  background: rgba(0, 0, 0, 0.06);
}

.status-badge-sm {
  font-size: 16px !important;
  padding: 0 4px !important;
}

.status-ok { color: #27ae60; }
.status-warn { color: #f39c12; }
.status-err { color: #e74c3c; }

.user-actions {
  display: flex;
  gap: 10px;
}

.user-actions button {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.btn-enter {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
}
.btn-enter:hover { transform: translateY(-2px); box-shadow: 0 6px 24px rgba(102, 126, 234, 0.3); }

.btn-logout {
  background: #f5f5f5;
  color: #666;
}
.btn-logout:hover { background: #fee; color: #e74c3c; transform: translateY(-2px); }

/* ===== 排行榜 ===== */
.rank-header {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.04), rgba(118, 75, 162, 0.02));
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
}

.trophy-icon { color: #f39c12; }
.star-icon { color: #f5576c; }

.btn-refresh {
  background: none;
  border: none;
  font-size: 14px;
  color: #ccc;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 8px;
  transition: all 0.3s ease;
}
.btn-refresh:hover { color: #667eea; background: rgba(102, 126, 234, 0.08); }

.rank-list {
  padding: 4px 0;
}

.rank-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.03);
  transition: background 0.3s ease;
}
.rank-item:last-child { border-bottom: none; }
.rank-item:hover { background: rgba(102, 126, 234, 0.04); }
.rank-item.rank-top { background: rgba(102, 126, 234, 0.03); }

.rank-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.rank-right {
  display: flex;
  align-items: center;
  gap: 4px;
}

.rank-num {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #f0f2f5;
  color: #aaa;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.rank-num.rank-gold {
  background: linear-gradient(135deg, #ffd700, #f9a825);
  color: #fff;
  box-shadow: 0 2px 8px rgba(255, 215, 0, 0.3);
}
.rank-num.rank-silver {
  background: linear-gradient(135deg, #bdc3c7, #95a5a6);
  color: #fff;
  box-shadow: 0 2px 8px rgba(189, 195, 199, 0.3);
}
.rank-num.rank-bronze {
  background: linear-gradient(135deg, #e8a87c, #cd7f32);
  color: #fff;
  box-shadow: 0 2px 8px rgba(205, 127, 50, 0.3);
}

.rank-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.rank-count {
  font-size: 15px;
  font-weight: 700;
  color: #667eea;
}

.rank-unit {
  font-size: 12px;
  color: #bbb;
  margin-right: 4px;
}

.rank-medal {
  font-size: 16px;
  margin-left: 4px;
}

.rank-empty {
  text-align: center;
  padding: 28px;
  color: #ccc;
  font-size: 13px;
}

/* ===== 响应式 ===== */
@media (max-width: 992px) {
  .container-custom { padding: 0 16px 30px; }
}

@media (max-width: 768px) {
  .hero-section { padding: 30px 16px 24px; }
  .hero-title { font-size: 20px; }
  .hero-icon { font-size: 36px; }
  .hero-stats { padding: 8px 20px; gap: 14px; }
  .hero-stat-num { font-size: 16px; }
  .login-buttons { flex-direction: column; }
  .user-actions { flex-direction: column; }
  .user-stats { flex-wrap: wrap; }
  .stat-divider { display: none; }
  .stat-item { flex: 1 1 33%; }
}

@media (max-width: 576px) {
  .container-custom { padding: 0 10px 20px; margin-top: -14px; }
  .card-header { padding: 10px 14px; font-size: 13px; flex-wrap: wrap; gap: 6px; }
  .header-role { display: none; }
  .rank-item { padding: 8px 14px; font-size: 13px; flex-wrap: wrap; }
  .rank-medal { display: none; }
  .login-box { padding: 20px 14px 18px; }
  .user-box { padding: 14px 14px 16px; }
  .hero-stat-divider { display: none; }
  .hero-stats { flex-wrap: wrap; justify-content: center; gap: 8px 20px; }
}
</style>