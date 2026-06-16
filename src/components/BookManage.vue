<template>
  <div class="row g-4">
    <!-- 新书入库 -->
    <div class="col-md-6">
      <div class="card-modern">
        <div class="card-header-modern bg-primary">
          <i class="bi bi-journal-plus"></i> 新书入库
        </div>
        <div class="card-body-modern">
          <div class="form-group">
            <label class="form-label">ISBN <span class="text-danger">*</span></label>
            <input class="form-control" v-model="newBook.isbn" placeholder="例如：978001">
          </div>
          <div class="form-group">
            <label class="form-label">书名 <span class="text-danger">*</span></label>
            <input class="form-control" v-model="newBook.bName" placeholder="例如：红楼梦">
          </div>
          <div class="form-group">
            <label class="form-label">作者 <span class="text-danger">*</span></label>
            <input class="form-control" v-model="newBook.author" placeholder="例如：[清]曹雪芹">
          </div>
          <div class="form-group">
            <label class="form-label">出版社 <span class="text-danger">*</span></label>
            <input class="form-control" v-model="newBook.publisher" placeholder="例如：人民文学出版社">
          </div>
          <div class="form-group">
            <label class="form-label">出版日期</label>
            <input class="form-control" type="date" v-model="newBook.pubDate">
          </div>
          <button class="btn btn-primary w-100 mt-3" @click="doAddBook" :disabled="loading">
            <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
            <i class="bi bi-save"></i> 添加新书
          </button>
          <div v-if="addBookMsg" class="alert mt-3" :class="addBookMsg.includes('成功') ? 'alert-success' : 'alert-danger'">
            <i :class="addBookMsg.includes('成功') ? 'bi bi-check-circle' : 'bi bi-exclamation-triangle'"></i>
            {{ addBookMsg }}
          </div>
        </div>
      </div>
    </div>

    <!-- 添加图书副本 -->
    <div class="col-md-6">
      <div class="card-modern">
        <div class="card-header-modern bg-success">
          <i class="bi bi-files"></i> 添加图书副本
        </div>
        <div class="card-body-modern">
          <div class="form-group">
            <label class="form-label">图书ISBN <span class="text-danger">*</span></label>
            <input class="form-control" v-model="newCopy.isbn" placeholder="例如：978006">
            <small class="text-muted">必须是已存在的图书ISBN</small>
          </div>
          <div class="form-group">
            <label class="form-label">条形码 <span class="text-danger">*</span></label>
            <input class="form-control" v-model="newCopy.barCode" placeholder="例如：97800601（8位）">
            <small class="text-muted">8位数字，必须唯一</small>
          </div>
          <div class="form-group">
            <label class="form-label">藏书位置</label>
            <input class="form-control" v-model="newCopy.place" placeholder="例如：文学类A区04柜">
          </div>
          <div class="form-group">
            <label class="form-label">初始状态</label>
            <select class="form-select" v-model="newCopy.status">
              <option value="可借">可借</option>
              <option value="库本">库本</option>
            </select>
          </div>
          <button class="btn btn-success w-100 mt-3" @click="doAddCopy" :disabled="loading">
            <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
            <i class="bi bi-plus-circle"></i> 添加副本
          </button>
          <div v-if="addCopyMsg" class="alert mt-3" :class="addCopyMsg.includes('成功') ? 'alert-success' : 'alert-danger'">
            <i :class="addCopyMsg.includes('成功') ? 'bi bi-check-circle' : 'bi bi-exclamation-triangle'"></i>
            {{ addCopyMsg }}
          </div>
        </div>
      </div>
    </div>

    <!-- 旧书报废 -->
    <div class="col-md-6">
      <div class="card-modern">
        <div class="card-header-modern bg-warning">
          <i class="bi bi-trash"></i> 旧书报废
        </div>
        <div class="card-body-modern">
          <div class="form-group">
            <label class="form-label">条形码</label>
            <input class="form-control" v-model="scrapBarcode" placeholder="请输入要报废的图书条形码">
          </div>
          <button class="btn btn-warning w-100 mt-3" @click="doScrap" :disabled="loading">
            <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
            <i class="bi bi-exclamation-triangle"></i> 报废
          </button>
          <div v-if="scrapMsg" class="alert mt-3" :class="scrapMsg.includes('成功') ? 'alert-success' : 'alert-danger'">
            <i :class="scrapMsg.includes('成功') ? 'bi bi-check-circle' : 'bi bi-exclamation-triangle'"></i>
            {{ scrapMsg }}
          </div>
        </div>
      </div>
    </div>

    <!-- 图书下架 -->
    <div class="col-md-6">
      <div class="card-modern">
        <div class="card-header-modern bg-danger">
          <i class="bi bi-arrow-down-circle"></i> 图书下架
        </div>
        <div class="card-body-modern">
          <div class="form-group">
            <label class="form-label">ISBN</label>
            <input class="form-control" v-model="takedownIsbn" placeholder="请输入要下架的图书ISBN">
            <small class="text-muted">下架后将删除该图书的所有副本</small>
          </div>
          <button class="btn btn-danger w-100 mt-3" @click="doTakeDown" :disabled="loading">
            <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
            <i class="bi bi-arrow-down"></i> 下架
          </button>
          <div v-if="takedownMsg" class="alert mt-3" :class="takedownMsg.includes('成功') ? 'alert-success' : 'alert-danger'">
            <i :class="takedownMsg.includes('成功') ? 'bi bi-check-circle' : 'bi bi-exclamation-triangle'"></i>
            {{ takedownMsg }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { addBook, addBookCopy, scrapCopy, takeDownBook } from '../api'

export default {
  name: 'BookManage',
  inject: ['setLoading'],
  data() {
    return {
      loading: false,
      newBook: { isbn: '', bName: '', author: '', publisher: '', pubDate: '' },
      addBookMsg: '',
      newCopy: { isbn: '', barCode: '', place: '', status: '可借' },
      addCopyMsg: '',
      scrapBarcode: '',
      scrapMsg: '',
      takedownIsbn: '',
      takedownMsg: ''
    }
  },
  methods: {
    async doAddBook() {
      const b = this.newBook
      if (!b.isbn || !b.bName || !b.author || !b.publisher) {
        this.addBookMsg = '请填写完整信息（ISBN、书名、作者、出版社为必填）'
        return
      }
      this.setLoading(true)
      this.loading = true
      try {
        const res = await addBook(b)
        this.addBookMsg = res.data
        if (res.data.includes('成功')) {
          this.newBook = { isbn: '', bName: '', author: '', publisher: '', pubDate: '' }
        }
      } catch (err) {
        this.addBookMsg = err.response?.data || '添加失败，请检查网络连接'
      } finally {
        this.setLoading(false)
        this.loading = false
      }
    },
    async doAddCopy() {
      const c = this.newCopy
      if (!c.isbn) {
        this.addCopyMsg = '请填写图书ISBN'
        return
      }
      if (!c.barCode) {
        this.addCopyMsg = '请填写条形码'
        return
      }
      if (c.barCode.length !== 8) {
        this.addCopyMsg = '条形码必须是8位数字'
        return
      }

      this.setLoading(true)
      this.loading = true
      try {
        // 🔑 关键修复：使用 bookISBN 字段名匹配后端
        const copyData = {
          barCode: c.barCode,
          bookISBN: c.isbn,   // ← 这里改为 bookISBN
          place: c.place || '待分配',
          status: c.status || '可借'
        }
        console.log('添加副本请求数据:', copyData)
        const res = await addBookCopy(copyData)
        this.addCopyMsg = res.data
        if (res.data.includes('成功')) {
          this.newCopy = { isbn: '', barCode: '', place: '', status: '可借' }
        }
      } catch (err) {
        console.error('添加副本错误:', err)
        const errorMsg = err.response?.data || err.message || '添加失败'
        this.addCopyMsg = errorMsg
      } finally {
        this.setLoading(false)
        this.loading = false
      }
    },
    async doScrap() {
      if (!this.scrapBarcode) {
        this.scrapMsg = '请输入条形码'
        return
      }
      this.setLoading(true)
      this.loading = true
      try {
        const res = await scrapCopy(this.scrapBarcode)
        this.scrapMsg = res.data
        if (res.data.includes('成功')) this.scrapBarcode = ''
      } catch (err) {
        this.scrapMsg = err.response?.data || '报废失败'
      } finally {
        this.setLoading(false)
        this.loading = false
      }
    },
    async doTakeDown() {
      if (!this.takedownIsbn) {
        this.takedownMsg = '请输入ISBN'
        return
      }
      this.setLoading(true)
      this.loading = true
      try {
        const res = await takeDownBook(this.takedownIsbn)
        this.takedownMsg = res.data
        if (res.data.includes('成功')) this.takedownIsbn = ''
      } catch (err) {
        this.takedownMsg = err.response?.data || '下架失败'
      } finally {
        this.setLoading(false)
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.card-modern {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  height: 100%;
}

.card-header-modern {
  padding: 16px 20px;
  font-size: 1rem;
  font-weight: 600;
  color: white;
}

.card-header-modern.bg-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.card-header-modern.bg-success {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
}

.card-header-modern.bg-warning {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.card-header-modern.bg-danger {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.card-body-modern {
  padding: 20px;
}

.form-group {
  margin-bottom: 16px;
}

.form-label {
  font-weight: 500;
  margin-bottom: 6px;
  display: block;
  font-size: 0.9rem;
  color: #333;
}

.form-control, .form-select {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.3s;
}

.form-control:focus, .form-select:focus {
  border-color: #667eea;
  outline: none;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.text-muted {
  font-size: 12px;
  color: #999;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 10px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-success {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  color: white;
}

.btn-warning {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.btn-danger {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  color: white;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.alert {
  padding: 12px;
  border-radius: 10px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.alert-success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.alert-danger {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}
</style>