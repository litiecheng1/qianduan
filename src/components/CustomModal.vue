<template>
  <div v-if="visible" class="custom-modal-overlay" @click.self="closeModal">
    <div class="custom-modal">
      <div class="custom-modal-header" :class="headerClass">
        <span class="custom-modal-title">📘 图书详情</span>
        <button class="custom-modal-close" @click="closeModal">&times;</button>
      </div>
      <div class="custom-modal-body" v-if="book">
        <div class="row">
          <div class="col-md-6">
            <p><strong>ISBN：</strong> {{ book.isbn }}</p>
            <p><strong>书名：</strong> {{ book.bName }}</p>
            <p><strong>作者：</strong> {{ book.author }}</p>
            <p><strong>出版社：</strong> {{ book.publisher }}</p>
            <p><strong>出版日期：</strong> {{ book.pubDate }}</p>
          </div>
          <div class="col-md-6" v-if="showEdit && isEditor">
            <div class="card bg-light">
              <div class="card-header">快捷编辑</div>
              <div class="card-body">
                <input class="form-control mb-2" v-model="editForm.bName" placeholder="书名">
                <input class="form-control mb-2" v-model="editForm.author" placeholder="作者">
                <input class="form-control mb-2" v-model="editForm.publisher" placeholder="出版社">
                <input class="form-control mb-2" type="date" v-model="editForm.pubDate" placeholder="出版日期">
                <button class="btn btn-primary btn-sm" @click="doEditBook">保存修改</button>
                <div v-if="editMsg" class="alert mt-2 small">{{ editMsg }}</div>
              </div>
            </div>
          </div>
        </div>
        <hr>
        <h6>📚 馆藏副本 <span class="badge bg-secondary">{{ copies.length }}</span></h6>
        <div class="table-responsive">
          <table class="table table-sm table-hover">
            <thead>
              <tr><th>条形码</th><th>藏书位置</th><th>状态</th><th v-if="canBorrow">操作</th></tr>
            </thead>
            <tbody>
              <tr v-for="copy in copies" :key="copy.barCode">
                <td>{{ copy.barCode }}</td>
                <td>{{ copy.place || '-' }}</td>
                <td>
                  <span class="badge" :class="getStatusClass(copy.status)">
                    {{ copy.status }}
                  </span>
                </td>
                <td v-if="canBorrow">
                  <button v-if="copy.status === '可借'"
                          class="btn btn-sm btn-success"
                          @click="quickBorrow(copy.barCode)">
                    <i class="bi bi-book"></i> 快捷借阅
                  </button>
                  <span v-else class="text-muted">不可借</span>
                </td>
              </tr>
              <tr v-if="copies.length === 0"><td colspan="4" class="text-center">暂无副本</td></tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="custom-modal-footer">
        <button class="btn btn-secondary" @click="closeModal">关闭</button>
      </div>
    </div>
  </div>
</template>

<script>
import { updateBook, borrowBooks } from '../api'

export default {
  name: 'CustomModal',
  props: {
    currentUser: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      visible: false,
      book: null,
      copies: [],
      editForm: {
        bName: '',
        author: '',
        publisher: '',
        pubDate: ''
      },
      editMsg: ''
    }
  },
  computed: {
    headerClass() {
      return this.isEditor ? 'bg-primary' : 'bg-success'
    },
    isEditor() {
      return this.currentUser?.userType === 'admin' && this.currentUser?.adminType === 1
    },
    showEdit() {
      return this.isEditor
    },
    canBorrow() {
      if (this.currentUser?.userType === 'student') return true
      return this.currentUser?.userType === 'admin' && this.currentUser?.adminType === 2
    }
  },
  methods: {
    getStatusClass(status) {
      switch (status) {
        case '可借': return 'bg-success'
        case '借出': return 'bg-warning'
        case '库本': return 'bg-info'
        case '报废': return 'bg-secondary'
        default: return 'bg-secondary'
      }
    },
    show(bookData, copiesData) {
      this.book = bookData
      this.copies = copiesData || []
      this.editForm = {
        bName: bookData.bName,
        author: bookData.author,
        publisher: bookData.publisher,
        pubDate: bookData.pubDate
      }
      this.editMsg = ''
      this.visible = true
      // 禁止页面滚动
      document.body.style.overflow = 'hidden'
    },
    closeModal() {
      this.visible = false
      // 恢复页面滚动
      document.body.style.overflow = ''
    },
    async quickBorrow(barCode) {
      const sno = this.currentUser?.sno
      if (!sno) {
        alert('请先登录')
        return
      }
      if (!confirm(`确认借阅图书「${this.book.bName}」吗？`)) return

      try {
        const res = await borrowBooks(sno, [barCode])
        alert(res.data)
        if (res.data.includes('成功')) {
          this.$emit('refresh')
        }
      } catch (error) {
        alert(error.response?.data || '借阅失败')
      }
    },
    async doEditBook() {
      if (!this.editForm.bName || !this.editForm.author || !this.editForm.publisher) {
        this.editMsg = '请填写完整信息'
        return
      }
      try {
        const updatedBook = {
          ...this.book,
          bName: this.editForm.bName,
          author: this.editForm.author,
          publisher: this.editForm.publisher,
          pubDate: this.editForm.pubDate
        }
        await updateBook(this.book.isbn, updatedBook)
        this.editMsg = '修改成功！'
        this.book = updatedBook
        this.$emit('refresh')
        setTimeout(() => { this.editMsg = '' }, 2000)
      } catch (error) {
        this.editMsg = error.response?.data || '修改失败'
      }
    }
  }
}
</script>

<style scoped>
/* 遮罩层 */
.custom-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* 弹窗主体 */
.custom-modal {
  background: white;
  border-radius: 20px;
  max-width: 800px;
  width: 95%;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* 头部 */
.custom-modal-header {
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.custom-modal-header.bg-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.custom-modal-header.bg-success {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
}

.custom-modal-title {
  font-size: 18px;
  font-weight: 600;
  color: white;
}

.custom-modal-close {
  background: none;
  border: none;
  color: white;
  font-size: 28px;
  cursor: pointer;
  opacity: 0.8;
  transition: opacity 0.2s;
  line-height: 1;
}

.custom-modal-close:hover {
  opacity: 1;
}

/* 内容区 */
.custom-modal-body {
  padding: 24px;
  max-height: calc(90vh - 130px);
  overflow-y: auto;
}

/* 底部 */
.custom-modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: flex-end;
}

/* 滚动条美化 */
.custom-modal-body::-webkit-scrollbar {
  width: 6px;
}

.custom-modal-body::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.custom-modal-body::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 10px;
}

.custom-modal-body::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>