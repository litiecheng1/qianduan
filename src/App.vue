<template>
  <div>
    <div v-if="globalLoading" class="global-loading">
      <div class="loading-spinner">
        <div class="spinner-border text-light" style="width: 4rem; height: 4rem;" role="status">
          <span class="visually-hidden">加载中...</span>
        </div>
        <p class="text-light mt-3">加载中...</p>
      </div>
    </div>
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      globalLoading: false
    }
  },
  provide() {
    return {
      setLoading: (loading) => {
        this.globalLoading = loading
      }
    }
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', 'PingFang SC', Roboto, 'Helvetica Neue', sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  background-attachment: fixed;
}

/* 滚动条美化 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 卡片样式 */
.card-modern {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: none;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card-modern:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
}

/* 按钮样式 */
.btn-modern {
  border-radius: 12px;
  padding: 10px 24px;
  font-weight: 500;
  transition: all 0.3s ease;
  border: none;
}

.btn-modern-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-modern-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.btn-modern-success {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  color: white;
}

.btn-modern-warning {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.btn-modern-danger {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  color: white;
}

/* 输入框样式 */
.input-modern {
  border-radius: 12px;
  border: 2px solid #e0e0e0;
  padding: 12px 16px;
  transition: all 0.3s ease;
  font-size: 14px;
}

.input-modern:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  outline: none;
}

/* 表格样式 */
.table-modern {
  border-radius: 16px;
  overflow: hidden;
}

.table-modern thead th {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 500;
  padding: 12px 16px;
  border: none;
}

.table-modern tbody tr {
  transition: background 0.2s ease;
}

.table-modern tbody tr:hover {
  background: rgba(102, 126, 234, 0.05);
}

.table-modern td {
  padding: 12px 16px;
  vertical-align: middle;
  border-bottom: 1px solid #f0f0f0;
}

/* 全局加载动画 */
.global-loading {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.loading-spinner {
  text-align: center;
}

/* 统计卡片 */
.stat-card-modern {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  padding: 24px;
  color: white;
  text-align: center;
  transition: transform 0.3s ease;
}

.stat-card-modern:hover {
  transform: scale(1.02);
}

.stat-number-modern {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 8px;
}

.stat-label-modern {
  font-size: 0.9rem;
  opacity: 0.9;
}

/* 徽章样式 */
.badge-modern {
  padding: 6px 12px;
  border-radius: 20px;
  font-weight: 500;
  font-size: 12px;
}

.badge-success {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
}

.badge-warning {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.badge-info {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.badge-secondary {
  background: linear-gradient(135deg, #757f9a 0%, #d7dde8 100%);
}

/* 侧边栏样式 */
.sidebar-modern {
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
  box-shadow: 2px 0 20px rgba(0, 0, 0, 0.1);
}

/* 顶部栏样式 */
.topbar-modern {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}
</style>