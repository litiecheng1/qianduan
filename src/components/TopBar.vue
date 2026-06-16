<template>
  <div class="topbar topbar-modern">
    <div class="topbar-left">
      <h4 class="page-title">{{ pageTitle }}</h4>
    </div>
    <div class="topbar-right">
      <div class="user-info">
        <div class="user-avatar">
          <i class="bi bi-person-circle"></i>
        </div>
        <div class="user-details">
          <span class="user-name">欢迎，<strong>{{ adminName }}</strong></span>
          <span class="user-role">{{ roleName }}</span>
        </div>
      </div>
      <button class="btn-icon" @click="handleShowUserInfo" title="个人信息">
        <i class="bi bi-person-gear"></i>
      </button>
      <button class="btn-icon" @click="handleLogout" title="退出登录">
        <i class="bi bi-box-arrow-right"></i>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TopBar',
  props: {
    adminName: {
      type: String,
      default: ''
    },
    pageTitle: {
      type: String,
      default: ''
    },
    roleName: {
      type: String,
      default: ''
    }
  },
  methods: {
    handleShowUserInfo() {
      console.log('TopBar: 点击个人信息按钮')
      this.$emit('show-user-info')
    },
    handleLogout() {
      console.log('TopBar: 点击退出登录按钮')
      this.$emit('logout')
    }
  }
}
</script>

<style scoped>
.topbar {
  padding: 12px 24px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.page-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 16px;
  background: #f8f9fa;
  border-radius: 40px;
}

.user-avatar {
  font-size: 1.8rem;
  color: #667eea;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 0.9rem;
  color: #333;
}

.user-role {
  font-size: 0.7rem;
  color: #999;
}

.btn-icon {
  background: none;
  border: none;
  font-size: 1.3rem;
  padding: 8px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s;
  color: #666;
}

.btn-icon:hover {
  background: #f0f0f0;
  color: #667eea;
  transform: scale(1.05);
}
</style>