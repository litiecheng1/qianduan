<template>
  <!-- 弹窗直接渲染在 body 下，不受父容器限制 -->
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
      console.log('CustomModal show 被调用:', bookData)
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
      document.body.style.overflow = 'hidden'
      // 将弹窗移动到 body 下
      this.moveToBody()
    },
    closeModal() {
      this.visible = false
      document.body.style.overflow = ''
    },
    moveToBody() {
      // 将当前组件的根元素移动到 body 下
      this.$nextTick(() => {
        const el = this.$el
        if (el && el.parentNode) {
          // 如果已经挂载到 body 则不重复移动
          if (el.parentNode === document.body) return
          // 保存当前父节点引用
          const parent = el.parentNode
          // 移动到 body
          document.body.appendChild(el)
          // 如果原父节点是 card-body，不需要额外操作
        }
      })
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

<style>
/* ============================================
   全局样式 - 无 scoped，直接挂载到 body
   ============================================ */

/* 遮罩层 - 覆盖整个视口 */
.custom-modal-overlay {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  background: rgba(0, 0, 0, 0.55) !important;
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  z-index: 999999 !important;
  animation: modalFadeIn 0.25s ease !important;
  margin: 0 !important;
  padding: 0 !important;
  box-sizing: border-box !important;
}

@keyframes modalFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* 弹窗主体 - 固定大小，不随父容器变化 */
.custom-modal {
  position: relative !important;
  background: #ffffff !important;
  border-radius: 24px !important;
  width: 780px !important;
  max-width: 95vw !important;
  max-height: 88vh !important;
  min-height: 300px !important;
  overflow: hidden !important;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.35) !important;
  animation: modalSlideUp 0.3s ease !important;
  display: flex !important;
  flex-direction: column !important;
  margin: 20px !important;
  box-sizing: border-box !important;
}

@keyframes modalSlideUp {
  from {
    transform: translateY(40px) scale(0.97);
    opacity: 0;
  }
  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

/* 头部 */
.custom-modal-header {
  padding: 18px 28px !important;
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  flex-shrink: 0 !important;
  border-radius: 24px 24px 0 0 !important;
  min-height: 64px !important;
}

.custom-modal-header.bg-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
}

.custom-modal-header.bg-success {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%) !important;
}

.custom-modal-title {
  font-size: 20px !important;
  font-weight: 600 !important;
  color: #ffffff !important;
}

.custom-modal-close {
  background: none !important;
  border: none !important;
  color: #ffffff !important;
  font-size: 30px !important;
  cursor: pointer !important;
  opacity: 0.7 !important;
  transition: opacity 0.2s !important;
  line-height: 1 !important;
  padding: 4px 12px !important;
  border-radius: 8px !important;
}

.custom-modal-close:hover {
  opacity: 1 !important;
  background: rgba(255, 255, 255, 0.15) !important;
}

/* 内容区 - 可滚动 */
.custom-modal-body {
  padding: 28px !important;
  overflow-y: auto !important;
  flex: 1 !important;
  max-height: calc(88vh - 140px) !important;
  min-height: 200px !important;
  background: #ffffff !important;
}

.custom-modal-body p {
  margin-bottom: 10px !important;
  font-size: 15px !important;
  line-height: 1.6 !important;
}

.custom-modal-body hr {
  margin: 18px 0 !important;
  border-color: #e8e8e8 !important;
}

/* 底部 */
.custom-modal-footer {
  padding: 16px 28px !important;
  border-top: 1px solid #f0f0f0 !important;
  display: flex !important;
  justify-content: flex-end !important;
  flex-shrink: 0 !important;
  background: #fafafa !important;
  border-radius: 0 0 24px 24px !important;
  min-height: 60px !important;
}

.custom-modal-footer .btn {
  padding: 8px 28px !important;
  border-radius: 30px !important;
  font-weight: 500 !important;
}

/* 表格样式 */
.custom-modal-body .table {
  font-size: 14px !important;
  margin-bottom: 0 !important;
}

.custom-modal-body .table th {
  background: #f8f9fa !important;
  font-weight: 600 !important;
}

.custom-modal-body .badge {
  font-size: 12px !important;
  padding: 4px 12px !important;
  border-radius: 20px !important;
}

/* 滚动条美化 */
.custom-modal-body::-webkit-scrollbar {
  width: 6px !important;
}

.custom-modal-body::-webkit-scrollbar-track {
  background: #f1f1f1 !important;
  border-radius: 10px !important;
}

.custom-modal-body::-webkit-scrollbar-thumb {
  background: #c1c1c1 !important;
  border-radius: 10px !important;
}

.custom-modal-body::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8 !important;
}

/* ============================================
   响应式适配
   ============================================ */

/* 小屏设备 */
@media (max-width: 820px) {
  .custom-modal {
    width: 96% !important;
    max-height: 92vh !important;
    margin: 10px !important;
    min-height: 200px !important;
  }
  .custom-modal-body {
    padding: 20px !important;
    max-height: calc(92vh - 130px) !important;
  }
  .custom-modal-header {
    padding: 14px 18px !important;
    min-height: 56px !important;
  }
  .custom-modal-footer {
    padding: 12px 18px !important;
    min-height: 52px !important;
  }
}

/* 手机设备 */
@media (max-width: 576px) {
  .custom-modal {
    width: 98% !important;
    max-height: 95vh !important;
    margin: 6px !important;
    border-radius: 16px !important;
    min-height: 150px !important;
  }
  .custom-modal-body {
    padding: 14px !important;
    max-height: calc(95vh - 120px) !important;
    font-size: 14px !important;
  }
  .custom-modal-header {
    padding: 12px 14px !important;
    min-height: 48px !important;
    border-radius: 16px 16px 0 0 !important;
  }
  .custom-modal-title {
    font-size: 16px !important;
  }
  .custom-modal-footer {
    padding: 10px 14px !important;
    min-height: 44px !important;
    border-radius: 0 0 16px 16px !important;
  }
  .custom-modal-body .table {
    font-size: 12px !important;
  }
  .custom-modal-body .table th,
  .custom-modal-body .table td {
    padding: 6px 8px !important;
  }
  .custom-modal-body p {
    font-size: 13px !important;
    margin-bottom: 6px !important;
  }
}

/* 大屏设备 */
@media (min-width: 1200px) {
  .custom-modal {
    width: 820px !important;
  }
}
</style>