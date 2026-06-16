<template>
  <div class="modal fade" tabindex="-1" ref="modalRef" data-bs-backdrop="static">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content login-modal">
        <div class="modal-header" :class="loginType === 'admin' ? 'admin-header' : 'student-header'">
          <div class="header-icon">
            <i :class="loginType === 'admin' ? 'bi bi-shield-lock-fill' : 'bi bi-person-badge-fill'"></i>
          </div>
          <h5 class="modal-title">
            {{ loginType === 'admin' ? '管理员登录' : '学生登录' }}
          </h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <div class="login-tabs">
            <button
              type="button"
              class="tab-btn"
              :class="{ active: loginType === 'admin' }"
              @click="loginType = 'admin'">
              <i class="bi bi-shield-lock"></i> 管理员
            </button>
            <button
              type="button"
              class="tab-btn"
              :class="{ active: loginType === 'student' }"
              @click="loginType = 'student'">
              <i class="bi bi-person"></i> 学生
            </button>
          </div>

          <div class="input-group-modern">
            <i class="bi bi-person input-icon"></i>
            <input
              type="text"
              class="input-modern"
              v-model="username"
              :placeholder="loginType === 'admin' ? '用户名' : '学号'"
              @keyup.enter="doLogin">
          </div>

          <div class="input-group-modern">
            <i class="bi bi-lock input-icon"></i>
            <input
              type="password"
              class="input-modern"
              v-model="password"
              placeholder="密码"
              @keyup.enter="doLogin">
          </div>

          <div class="alert alert-modern" v-if="errorMsg">
            <i class="bi bi-exclamation-triangle-fill"></i>
            {{ errorMsg }}
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-login" :class="loginType === 'admin' ? 'btn-admin' : 'btn-student'" @click="doLogin">
            <i class="bi bi-box-arrow-in-right"></i> 登录
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Modal } from 'bootstrap'
import { adminLogin, studentLogin } from '../api'

export default {
  name: 'LoginModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      loginType: 'admin',
      username: '',
      password: '',
      errorMsg: '',
      modalInstance: null
    }
  },
  watch: {
    visible(val) {
      if (val && this.modalInstance) {
        this.modalInstance.show()
      } else if (this.modalInstance && !val) {
        this.modalInstance.hide()
      }
    }
  },
  methods: {
    async doLogin() {
      if (!this.username || !this.password) {
        this.errorMsg = '请输入用户名/学号和密码'
        return
      }
      this.errorMsg = ''
      try {
        let res
        if (this.loginType === 'admin') {
          res = await adminLogin({
            username: this.username,
            password: this.password
          })
          if (res.data && res.data.id) {
            res.data.userType = 'admin'
            this.$emit('login-success', res.data)
            this.resetForm()
            this.modalInstance.hide()
          } else {
            this.errorMsg = '登录失败'
          }
        } else {
          res = await studentLogin({
            username: this.username,
            password: this.password
          })
          if (res.data && res.data.sno) {
            res.data.userType = 'student'
            this.$emit('login-success', res.data)
            this.resetForm()
            this.modalInstance.hide()
          } else {
            this.errorMsg = '登录失败'
          }
        }
      } catch (err) {
        this.errorMsg = err.response?.data || '登录失败'
      }
    },
    resetForm() {
      this.username = ''
      this.password = ''
      this.loginType = 'admin'
    }
  },
  mounted() {
    if (this.$refs.modalRef) {
      this.modalInstance = new Modal(this.$refs.modalRef)
      this.$refs.modalRef.addEventListener('hidden.bs.modal', () => {
        this.$emit('update:visible', false)
        this.resetForm()
      })
    }
  },
  beforeDestroy() {
    if (this.modalInstance) {
      this.modalInstance.dispose()
    }
  }
}
</script>

<style scoped>
.login-modal {
  border-radius: 24px;
  overflow: hidden;
  background: white;
  border: none;
}

.modal-header {
  padding: 24px;
  text-align: center;
  display: flex;
  flex-direction: column;
  border: none;
}

.admin-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.student-header {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
}

.header-icon {
  font-size: 48px;
  margin-bottom: 12px;
  color: white;
}

.modal-header .modal-title {
  font-size: 24px;
  color: white;
  margin: 0;
}

.login-tabs {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  background: #f5f5f5;
  padding: 6px;
  border-radius: 60px;
}

.tab-btn {
  flex: 1;
  padding: 10px;
  border: none;
  background: transparent;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 500;
}

.tab-btn.active {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  color: #667eea;
}

.input-group-modern {
  position: relative;
  margin-bottom: 20px;
}

.input-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
  font-size: 1.2rem;
}

.input-group-modern .input-modern {
  width: 100%;
  padding: 14px 16px 14px 48px;
  border: 2px solid #e8e8e8;
  border-radius: 16px;
  font-size: 14px;
  transition: all 0.3s;
}

.input-group-modern .input-modern:focus {
  border-color: #667eea;
  outline: none;
}

.alert-modern {
  border-radius: 12px;
  padding: 12px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.modal-footer {
  padding: 20px 24px 30px;
  border: none;
}

.btn-login {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 40px;
  font-size: 16px;
  font-weight: 600;
  color: white;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-admin {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.btn-student {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
}

.btn-login:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
}
</style>