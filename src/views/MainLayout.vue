<template>
  <div class="d-flex min-vh-100">
    <Sidebar
      :menus="menus"
      :admin-type-name="adminTypeName"
      @menu-click="handleMenuClick"
      @logout="handleLogout"
    />
    <div class="flex-grow-1 p-3" style="background-color: #f1f5f9;">
      <TopBar
        :admin-name="displayName"
        :page-title="pageTitle"
        :role-name="adminTypeName"
        @logout="handleLogout"
        @show-user-info="openUserInfoModal"
      />
      <router-view :user-info="userInfo" />
    </div>

    <!-- 个人信息弹窗 -->
    <div class="modal fade" tabindex="-1" ref="userInfoModalRef" data-bs-backdrop="static">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header bg-info text-white">
            <h5 class="modal-title"><i class="bi bi-person-circle"></i> 个人信息</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <UserInfo :user-info="userInfo" />
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
import Sidebar from '../components/Sidebar.vue'
import TopBar from '../components/TopBar.vue'
import UserInfo from '../components/UserInfo.vue'
import { Modal } from 'bootstrap'

export default {
  name: 'MainLayout',
  components: { Sidebar, TopBar, UserInfo },
  data() {
    return {
      userInfo: {},
      menus: [],
      userInfoModal: null
    }
  },
  computed: {
    displayName() {
      return this.userInfo.sName || this.userInfo.username || '用户'
    },
    adminTypeName() {
      if (this.userInfo.userType === 'student') {
        return '学生用户'
      }
      const typeNames = ['证件管理员', '采编管理员', '流通管理员']
      return typeNames[this.userInfo.adminType] || '管理员'
    },
    pageTitle() {
      const currentPath = this.$route.path.split('/').pop()
      const menu = this.menus.find(m => m.path === currentPath)
      return menu ? menu.label : '图书检索'
    }
  },
  methods: {
    handleMenuClick(path) {
      this.$router.push(`/main/${path}`)
    },
    handleLogout() {
      this.$store.dispatch('clearAdminInfo')
      this.$router.push('/')
    },
    openUserInfoModal() {
      console.log('MainLayout: 打开个人信息弹窗')
      if (this.userInfoModal) {
        this.userInfoModal.show()
      } else {
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
          console.log('MainLayout 个人信息弹窗初始化成功')
        } catch (e) {
          console.error('初始化个人信息弹窗失败:', e)
        }
      }
    },
    loadMenus() {
      const allMenus = [
        { id: 'search', path: 'search', icon: 'bi-search', label: '图书检索', types: [0, 1, 2, 'student'] },
        { id: 'borrow', path: 'borrow', icon: 'bi-book', label: '借书操作', types: [2, 'student'] },
        { id: 'return', path: 'return', icon: 'bi-arrow-return-left', label: '还书操作', types: [2, 'student'] },
        { id: 'card', path: 'card', icon: 'bi-credit-card', label: '借书证管理', types: [0] },
        { id: 'book-manage', path: 'book-manage', icon: 'bi-journal', label: '书籍采编', types: [1] },
        { id: 'fine', path: 'fine', icon: 'bi-cash', label: '罚款缴纳', types: [2, 'student'] },
        { id: 'statistics', path: 'statistics', icon: 'bi-graph-up', label: '查询统计', types: [0, 1, 2, 'student'] }
      ]

      let userTypeKey
      if (this.userInfo.userType === 'student') {
        userTypeKey = 'student'
      } else {
        userTypeKey = this.userInfo.adminType
      }

      this.menus = allMenus.filter(m => m.types.includes(userTypeKey))
      console.log('加载菜单:', this.menus)
    }
  },
  mounted() {
    const info = this.$store.getters.adminInfo
    console.log('MainLayout 获取用户信息:', info)

    if (info) {
      this.userInfo = info
      this.loadMenus()
    } else {
      this.$router.push('/')
    }

    this.$nextTick(() => {
      this.initUserInfoModal()
    })
  },
  beforeDestroy() {
    if (this.userInfoModal) {
      this.userInfoModal.dispose()
    }
  },
  watch: {
    '$store.getters.adminInfo': {
      handler(newVal) {
        if (newVal) {
          this.userInfo = newVal
          this.loadMenus()
        }
      },
      deep: true
    }
  }
}
</script>