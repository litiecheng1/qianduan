<template>
  <div class="sidebar sidebar-modern">
    <div class="sidebar-header">
      <div class="logo-icon">
        <i class="bi bi-journal-bookmark-fill"></i>
      </div>
      <h3>智慧图书馆</h3>
      <p class="user-type-badge">{{ adminTypeName }}</p>
    </div>
    <div class="sidebar-menu">
      <div
        v-for="menu in menus"
        :key="menu.id"
        class="menu-item"
        :class="{ active: activeMenu === menu.id }"
        @click="$emit('menu-click', menu.path)"
      >
        <i :class="menu.icon"></i>
        <span>{{ menu.label }}</span>
        <div class="menu-indicator" v-if="activeMenu === menu.id"></div>
      </div>
    </div>
    <div class="sidebar-footer">
      <div class="menu-item logout" @click="$emit('logout')">
        <i class="bi bi-box-arrow-right"></i>
        <span>退出登录</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Sidebar',
  props: {
    menus: {
      type: Array,
      default: () => []
    },
    adminTypeName: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      activeMenu: 'search'
    }
  },
  watch: {
    '$route.path': {
      handler(newPath) {
        const segment = newPath.split('/').pop()
        this.activeMenu = segment
      },
      immediate: true
    }
  }
}
</script>

<style scoped>
.sidebar {
  width: 280px;
  min-height: 100vh;
  color: white;
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
}

.sidebar-header {
  padding: 30px 20px;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo-icon {
  font-size: 48px;
  margin-bottom: 15px;
  color: #667eea;
}

.sidebar-header h3 {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 8px;
  letter-spacing: 1px;
}

.user-type-badge {
  background: rgba(102, 126, 234, 0.3);
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  margin-top: 8px;
}

.sidebar-menu {
  flex: 1;
  padding: 20px 0;
}

.menu-item {
  padding: 14px 24px;
  display: flex;
  align-items: center;
  gap: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  margin: 4px 12px;
  border-radius: 12px;
}

.menu-item i {
  font-size: 1.3rem;
  width: 24px;
}

.menu-item:hover {
  background: rgba(102, 126, 234, 0.2);
  transform: translateX(5px);
}

.menu-item.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.menu-indicator {
  position: absolute;
  right: 10px;
  width: 6px;
  height: 6px;
  background: white;
  border-radius: 50%;
}

.sidebar-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 20px 0;
}

.logout {
  color: #ff6b6b;
}

.logout:hover {
  background: rgba(255, 107, 107, 0.2);
}
</style>