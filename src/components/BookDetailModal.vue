<template>
  <div class="modal fade" tabindex="-1" ref="modalRef">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header" :class="headerClass">
          <h5 class="modal-title text-white">📘 图书详情</h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body" v-if="book">
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
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Modal } from 'bootstrap'
import { updateBook, borrowBooks } from '../api'

export default {
  name: 'BookDetailModal',
  props: {
    currentUser: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      modalInstance: null,
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
      if (this.modalInstance) this.modalInstance.show()
    },
    hide() {
      if (this.modalInstance) this.modalInstance.hide()
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
  },
  mounted() {
    if (this.$refs.modalRef) {
      this.modalInstance = new Modal(this.$refs.modalRef)
    }
  },
  beforeDestroy() {
    if (this.modalInstance) {
      this.modalInstance.dispose()
    }
  }
}
</script>