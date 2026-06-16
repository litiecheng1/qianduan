<!-- components/UserInfo.vue -->
<template>
  <div class="row">
    <div class="col-md-6">
      <table class="table table-bordered">
        <tbody>
          <tr v-if="userInfo.sno">
            <th style="width: 100px">学号</th>
            <td>{{ userInfo.sno }}</td>
          </tr>
          <tr v-if="userInfo.id">
            <th>工号</th>
            <td>{{ userInfo.id }}</td>
          </tr>
          <tr>
            <th>姓名</th>
            <td>{{ userInfo.sName || userInfo.username }}</td>
          </tr>
          <tr>
            <th>类型</th>
            <td>
              <span v-if="userInfo.userType === 'student'">
                {{ userInfo.type || '学生' }}
              </span>
              <span v-else>
                {{ adminTypeName }}
              </span>
            </td>
          </tr>
          <tr v-if="userInfo.college">
            <th>学院</th>
            <td>{{ userInfo.college }}</td>
          </tr>
          <tr v-if="userInfo.major">
            <th>专业</th>
            <td>{{ userInfo.major }}</td>
          </tr>
          <tr v-if="userInfo.sDorm">
            <th>宿舍</th>
            <td>{{ userInfo.sDorm }}</td>
          </tr>
          <tr v-if="userInfo.sAge">
            <th>年龄</th>
            <td>{{ userInfo.sAge }}</td>
          </tr>
          <tr v-if="userInfo.originPlace">
            <th>籍贯</th>
            <td>{{ userInfo.originPlace }}</td>
          </tr>
          <tr v-if="userInfo.cardNo">
            <th>借书证号</th>
            <td>{{ userInfo.cardNo }}</td>
          </tr>
          <tr v-if="userInfo.cardStatus">
            <th>借书证状态</th>
            <td>
              <span class="badge" :class="userInfo.cardStatus === '正常' ? 'bg-success' : 'bg-danger'">
                {{ userInfo.cardStatus }}
              </span>
            </td>
          </tr>
          <tr>
            <th>邮箱</th>
            <td>{{ userInfo.email || '未设置' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="col-md-6" v-if="userInfo.userType === 'student'">
      <div class="card">
        <div class="card-header bg-warning">
          <i class="bi bi-key"></i> 修改密码
        </div>
        <div class="card-body">
          <div class="mb-3">
            <label class="form-label">原密码</label>
            <input type="password" class="form-control" v-model="passwordForm.oldPassword" placeholder="请输入原密码">
          </div>
          <div class="mb-3">
            <label class="form-label">新密码</label>
            <input type="password" class="form-control" v-model="passwordForm.newPassword" placeholder="请输入新密码（至少6位）">
          </div>
          <div class="mb-3">
            <label class="form-label">确认新密码</label>
            <input type="password" class="form-control" v-model="passwordForm.confirmPassword" placeholder="请再次输入新密码">
          </div>
          <button class="btn btn-warning w-100" @click="doChangePassword" :disabled="loading">
            <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
            确认修改
          </button>
          <div v-if="passwordMsg" class="alert mt-3 small" :class="passwordMsgClass">
            {{ passwordMsg }}
          </div>
        </div>
      </div>
    </div>
    <div class="col-md-6" v-else>
      <div class="card">
        <div class="card-header bg-secondary text-white">
          <i class="bi bi-info-circle"></i> 提示
        </div>
        <div class="card-body text-center">
          <p class="text-muted mb-0">管理员密码修改请联系系统管理员</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { changePassword } from '../api'

export default {
  name: 'UserInfo',
  props: {
    userInfo: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      passwordForm: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      passwordMsg: '',
      passwordMsgClass: '',
      loading: false
    }
  },
  computed: {
    adminTypeName() {
      const typeNames = ['证件管理员', '采编管理员', '流通管理员']
      return typeNames[this.userInfo.adminType] || ''
    }
  },
  methods: {
    async doChangePassword() {
      // 验证表单
      if (!this.passwordForm.oldPassword) {
        this.passwordMsg = '请输入原密码'
        this.passwordMsgClass = 'alert-warning'
        return
      }
      if (!this.passwordForm.newPassword) {
        this.passwordMsg = '请输入新密码'
        this.passwordMsgClass = 'alert-warning'
        return
      }
      if (this.passwordForm.newPassword.length < 6) {
        this.passwordMsg = '新密码长度至少6位'
        this.passwordMsgClass = 'alert-warning'
        return
      }
      if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
        this.passwordMsg = '两次输入的新密码不一致'
        this.passwordMsgClass = 'alert-warning'
        return
      }

      this.loading = true
      this.passwordMsg = ''

      try {
        const sno = this.userInfo.sno
        await changePassword(sno, {
          oldPassword: this.passwordForm.oldPassword,
          newPassword: this.passwordForm.newPassword
        })
        this.passwordMsg = '✓ 密码修改成功！请使用新密码重新登录'
        this.passwordMsgClass = 'alert-success'
        // 清空表单
        this.passwordForm = {
          oldPassword: '',
          newPassword: '',
          confirmPassword: ''
        }
        // 3秒后自动退出登录，强制用户使用新密码登录
        setTimeout(() => {
          alert('密码已修改，请重新登录')
          this.$store.dispatch('clearAdminInfo')
          this.$router.push('/')
        }, 2000)
      } catch (error) {
        console.error('修改密码失败:', error)
        this.passwordMsg = error.response?.data || '密码修改失败，请检查原密码是否正确'
        this.passwordMsgClass = 'alert-danger'
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.table-bordered th,
.table-bordered td {
  padding: 10px;
  vertical-align: middle;
}

.table-bordered th {
  background-color: #f8f9fa;
  width: 100px;
}
</style>