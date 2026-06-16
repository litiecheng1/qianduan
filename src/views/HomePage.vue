<template>
  <div class="home-container">
    <div class="hero-section">
      <div class="hero-content">
        <div class="hero-icon">
          <i class="bi bi-journal-bookmark-fill"></i>
        </div>
        <h1 class="hero-title">智慧图书馆管理系统</h1>
        <p class="hero-subtitle">智能 · 便捷 · 高效</p>
      </div>
    </div>

    <div class="container-custom">
      <div class="row g-4">
        <!-- 图书检索区 -->
        <div class="col-lg-8">
          <div class="card-modern">
            <div class="card-header-modern">
              <i class="bi bi-search"></i> 图书检索
            </div>
            <div class="card-body-modern">
              <BookSearch :user-info="loggedInUser" />
            </div>
          </div>
        </div>

        <!-- 右侧区域 -->
        <div class="col-lg-4">
          <!-- 登录卡片 -->
          <div class="card-modern" v-if="!loggedInUser">
            <div class="card-header-modern login-header">
              <i class="bi bi-box-arrow-in-right"></i> 登录系统
            </div>
            <div class="card-body-modern text-center">
              <p class="welcome-text">登录后可使用借书、还书、罚款缴纳等功能</p>
              <div class="btn-group-login">
                <button class="btn-login-card admin" @click="showLogin = true">
                  <i class="bi bi-shield-lock"></i> 管理员登录
                </button>
                <button class="btn-login-card student" @click="showStudentLogin = true">
                  <i class="bi bi-person"></i> 学生登录
                </button>
              </div>
            </div>
          </div>

          <!-- 用户信息卡片 -->
          <div class="card-modern user-card" v-else>
            <div class="user-card-header">
              <div class="user-avatar-large">
                <i class="bi bi-person-circle"></i>
              </div>
              <h3>{{ loggedInUser.sName || loggedInUser.username }}</h3>
              <span class="user-badge" :class="loggedInUser.userType === 'student' ? 'student-badge' : 'admin-badge'">
                {{ userTypeName }}
              </span>
            </div>
            <div class="user-card-body">
              <div class="user-info-item">
                <i class="bi bi-card-list"></i>
                <span>借书证状态：</span>
                <span class="status-badge" :class="loggedInUser.cardStatus === '正常' ? 'status-normal' : 'status-abnormal'">
                  {{ loggedInUser.cardStatus || '正常' }}
                </span>
              </div>
              <div class="user-actions">
                <button class="btn-action" @click="goToMain">
                  <i class="bi bi-grid-3x3-gap-fill"></i> 进入系统
                </button>
                <button class="btn-action" @click="openUserInfoModal">
                  <i class="bi bi-person-gear"></i> 个人信息
                </button>
                <button class="btn-action logout" @click="doLogout">
                  <i class="bi bi-box-arrow-right"></i> 退出
                </button>
              </div>
            </div>
          </div>

          <!-- 排行榜卡片 -->
          <div class="card-modern">
            <div class="card-header-modern">
              <i class="bi bi-trophy-fill"></i> 学生借书排行榜
              <button class="btn-refresh" @click="loadRankings">
                <i class="bi bi-arrow-repeat"></i>
              </button>
            </div>
            <div class="card-body-modern p-0">
              <div class="ranking-list">
                <div v-for="(item, idx) in studentRanking.slice(0, 5)" :key="idx" class="ranking-item">
                  <div class="ranking-number" :class="getRankClass(idx + 1)">{{ idx + 1 }}</div>
                  <div class="ranking-name">{{ item.name || item.sno }}</div>
                  <div class="ranking-count">{{ item.borrowCount }} 次</div>
                </div>
                <div v-if="studentRanking.length === 0" class="empty-ranking">
                  暂无数据
                </div>
              </div>
            </div>
          </div>

          <div class="card-modern mt-4">
            <div class="card-header-modern">
              <i class="bi bi-star-fill"></i> 热门图书排行榜
            </div>
            <div class="card-body-modern p-0">
              <div class="ranking-list">
                <div v-for="(item, idx) in bookRanking.slice(0, 5)" :key="idx" class="ranking-item">
                  <div class="ranking-number" :class="getRankClass(idx + 1)">{{ idx + 1 }}</div>
                  <div class="ranking-name">{{ item.name || item.isbn }}</div>
                  <div class="ranking-count">{{ item.borrowCount }} 次</div>
                </div>
                <div v-if="bookRanking.length === 0" class="empty-ranking">
                  暂无数据
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <LoginModal :visible.sync="showLogin" @login-success="handleLoginSuccess" />
    <LoginModal :visible.sync="showStudentLogin" @login-success="handleLoginSuccess" />

    <!-- 个人信息弹窗 -->
    <div class="modal fade" tabindex="-1" ref="userInfoModalRef" data-bs-backdrop="static">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header bg-info text-white">
            <h5 class="modal-title"><i class="bi bi-person-circle"></i> 个人信息</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <UserInfo :user-info="loggedInUser" v-if="loggedInUser" />
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">关闭</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import LoginModal from '../components/LoginModal.vue'
import BookSearch from '../components/BookSearch.vue'
import UserInfo from '../components/UserInfo.vue'
import { getStudentRanking, getBookRanking } from '../api'
import { Modal } from 'bootstrap'

export default {
  name: 'HomePage',
  components: {
    LoginModal,
    BookSearch,
    UserInfo
  },
  data() {
    return {
      showLogin: false,
      showStudentLogin: false,
      loggedInUser: null,
      studentRanking: [],
      bookRanking: [],
      userInfoModal: null
    }
  },
  computed: {
    userTypeName() {
      if (!this.loggedInUser) return ''
      if (this.loggedInUser.userType === 'student') {
        return `学生 · ${this.loggedInUser.type || '本科生'}`
      }
      const typeNames = ['证件管理员', '采编管理员', '流通管理员']
      return typeNames[this.loggedInUser.adminType] || '管理员'
    }
  },
  methods: {
    getRankClass(rank) {
      if (rank === 1) return 'rank-1'
      if (rank === 2) return 'rank-2'
      if (rank === 3) return 'rank-3'
      return ''
    },
    async loadRankings() {
      try {
        const [stuRes, bookRes] = await Promise.all([
          getStudentRanking(),
          getBookRanking()
        ])
        this.studentRanking = stuRes.data || []
        this.bookRanking = bookRes.data || []
      } catch (error) {
        console.error('加载排行榜失败:', error)
      }
    },
    handleLoginSuccess(userInfo) {
      this.loggedInUser = userInfo
      this.$store.dispatch('setAdminInfo', userInfo)
    },
    goToMain() {
      this.$router.push('/main')
    },
    doLogout() {
      this.loggedInUser = null
      this.$store.dispatch('clearAdminInfo')
    },
    openUserInfoModal() {
      console.log('首页: 打开个人信息弹窗')
      if (this.userInfoModal) {
        this.userInfoModal.show()
      } else {
        // 尝试重新初始化
        this.initUserInfoModal()
        setTimeout(() => {
          if (this.userInfoModal) {
            this.userInfoModal.show()
          } else {
            alert('个人信息功能加载失败，请刷新页面重试')
          }
        }, 100)
      }
    },
    initUserInfoModal() {
      if (this.$refs.userInfoModalRef) {
        try {
          if (this.userInfoModal) {
            this.userInfoModal.dispose()
          }
          this.userInfoModal = new Modal(this.$refs.userInfoModalRef, {
            backdrop: 'static'
          })
          console.log('首页个人信息弹窗初始化成功')
        } catch (e) {
          console.error('初始化首页个人信息弹窗失败:', e)
        }
      } else {
        console.warn('未找到首页个人信息弹窗元素')
      }
    }
  },
  mounted() {
    this.loadRankings()
    const storedUser = this.$store.getters.adminInfo
    if (storedUser) {
      this.loggedInUser = storedUser
    }
    // 等待 DOM 渲染完成后初始化 Modal
    this.$nextTick(() => {
      this.initUserInfoModal()
    })
  },
  beforeDestroy() {
    if (this.userInfoModal) {
      this.userInfoModal.dispose()
    }
  }
}
</script>

<style scoped>
.home-container {
  min-height: 100vh;
}

.hero-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 60px 20px;
  text-align: center;
  color: white;
}

.hero-icon {
  font-size: 64px;
  margin-bottom: 20px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.hero-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 12px;
  letter-spacing: 2px;
}

.hero-subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
}

.container-custom {
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 20px;
}

.card-modern {
  background: white;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
}

.card-header-modern {
  padding: 20px 24px;
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-body-modern {
  padding: 24px;
}

.login-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
}

.welcome-text {
  color: #666;
  margin-bottom: 20px;
}

.btn-group-login {
  display: flex;
  gap: 12px;
}

.btn-login-card {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-login-card.admin {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-login-card.student {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  color: white;
}

.btn-login-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.user-card-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 30px;
  text-align: center;
  color: white;
}

.user-avatar-large {
  font-size: 60px;
  margin-bottom: 12px;
}

.user-card-header h3 {
  font-size: 1.3rem;
  margin-bottom: 8px;
}

.user-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  background: rgba(255, 255, 255, 0.2);
}

.user-card-body {
  padding: 20px;
}

.user-info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}

.status-badge {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-normal {
  background: #d4edda;
  color: #155724;
}

.status-abnormal {
  background: #f8d7da;
  color: #721c24;
}

.user-actions {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.btn-action {
  flex: 1;
  padding: 10px;
  border: 1px solid #e0e0e0;
  background: white;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 14px;
}

.btn-action:hover {
  background: #f5f5f5;
  border-color: #667eea;
}

.btn-action.logout:hover {
  background: #fee;
  border-color: #ff6b6b;
  color: #ff6b6b;
}

.btn-refresh {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  color: #999;
  transition: color 0.3s;
}

.btn-refresh:hover {
  color: #667eea;
}

.ranking-list {
  padding: 8px 0;
}

.ranking-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  gap: 12px;
  border-bottom: 1px solid #f5f5f5;
  transition: background 0.2s;
}

.ranking-item:hover {
  background: #f8f9ff;
}

.ranking-number {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-weight: 600;
  font-size: 14px;
  background: #f0f0f0;
  color: #666;
}

.ranking-number.rank-1 {
  background: linear-gradient(135deg, #ffd700, #ffed4e);
  color: #8b6914;
}

.ranking-number.rank-2 {
  background: linear-gradient(135deg, #c0c0c0, #e8e8e8);
  color: #666;
}

.ranking-number.rank-3 {
  background: linear-gradient(135deg, #cd7f32, #e8a87c);
  color: #fff;
}

.ranking-name {
  flex: 1;
  font-weight: 500;
  color: #333;
}

.ranking-count {
  color: #667eea;
  font-weight: 600;
  font-size: 14px;
}

.empty-ranking {
  text-align: center;
  padding: 40px;
  color: #999;
}
</style>