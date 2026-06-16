<template>
  <div class="card">
    <div class="card-header bg-success text-white">↩️ 还书操作</div>
    <div class="card-body">
      <div class="row g-3">
        <div class="col-md-6">
          <label class="form-label">图书条形码</label>
          <input class="form-control" v-model="barcode" placeholder="例如：97800102">
        </div>
        <div class="col-md-2 d-flex align-items-end">
          <button class="btn btn-success w-100" @click="doReturn" :disabled="loading">
            <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
            确认还书
          </button>
        </div>
      </div>
      <div v-if="message" class="alert mt-3" :class="messageClass">{{ message }}</div>
    </div>
  </div>
</template>

<script>
import { returnBook } from '../api'

export default {
  name: 'ReturnBooks',
  data() {
    return {
      barcode: '',
      message: '',
      messageClass: '',
      loading: false
    }
  },
  methods: {
    async doReturn() {
      if (!this.barcode.trim()) {
        this.message = '请输入图书条形码'
        this.messageClass = 'alert-warning'
        return
      }
      this.loading = true
      try {
        const res = await returnBook(this.barcode)
        this.message = res.data
        this.messageClass = res.data.includes('成功') ? 'alert-success' : 'alert-danger'
        if (res.data.includes('成功')) this.barcode = ''
      } catch (error) {
        console.error('还书失败:', error)
        this.message = error.response?.data || '还书失败'
        this.messageClass = 'alert-danger'
      } finally {
        this.loading = false
      }
    }
  }
}
</script>