<template>
  <div class="card">
    <div class="card-header bg-primary text-white">📖 借书操作</div>
    <div class="card-body">
      <div class="row g-3">
        <div class="col-md-4">
          <label class="form-label">学号</label>
          <input class="form-control" v-model="form.sno" placeholder="例如：S0001" :readonly="!!userSno">
        </div>
        <div class="col-md-6">
          <label class="form-label">条形码（多个用逗号分隔）</label>
          <input class="form-control" v-model="form.barcodes" placeholder="例如：97800101,97800201">
        </div>
        <div class="col-md-2 d-flex align-items-end">
          <button class="btn btn-primary w-100" @click="doBorrow" :disabled="loading">
            <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
            确认借书
          </button>
        </div>
      </div>
      <div v-if="message" class="alert mt-3" :class="messageClass">{{ message }}</div>
    </div>
  </div>
</template>

<script>
import { borrowBooks } from '../api'

export default {
  name: 'BorrowBooks',
  props: {
    userInfo: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      form: { sno: '', barcodes: '' },
      message: '',
      messageClass: '',
      loading: false
    }
  },
  computed: {
    userSno() {
      return this.userInfo?.userType === 'student' ? this.userInfo.sno : ''
    }
  },
  watch: {
    userSno: {
      immediate: true,
      handler(val) {
        if (val) {
          this.form.sno = val
        }
      }
    }
  },
  methods: {
    async doBorrow() {
      if (!this.form.sno || !this.form.barcodes) {
        this.message = '请填写完整信息'
        this.messageClass = 'alert-warning'
        return
      }
      const barcodes = this.form.barcodes.split(',').map(s => s.trim()).filter(s => s)
      if (barcodes.length === 0) {
        this.message = '请输入有效的图书条形码'
        this.messageClass = 'alert-warning'
        return
      }
      this.loading = true
      try {
        const res = await borrowBooks(this.form.sno, barcodes)
        this.message = res.data
        this.messageClass = res.data.includes('成功') ? 'alert-success' : 'alert-danger'
        if (res.data.includes('成功')) this.form.barcodes = ''
      } catch (error) {
        console.error('借书失败:', error)
        this.message = error.response?.data || '借书失败'
        this.messageClass = 'alert-danger'
      } finally {
        this.loading = false
      }
    }
  }
}
</script>