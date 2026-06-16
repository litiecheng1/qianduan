<template>
  <div class="card">
    <div class="card-header">
      <i class="bi bi-search"></i> 图书检索
    </div>
    <div class="card-body">
      <div class="row g-3 mb-3">
        <div class="col-md-4">
          <input type="text" class="form-control" v-model="keyword" placeholder="关键词" @keyup.enter="doSearch">
        </div>
        <div class="col-md-3">
          <select class="form-select" v-model="searchType">
            <option value="bName">按书名</option>
            <option value="author">按作者</option>
            <option value="publisher">按出版社</option>
            <option value="isbn">按ISBN</option>
          </select>
        </div>
        <div class="col-md-2">
          <button class="btn btn-primary w-100" @click="doSearch">
            <i class="bi bi-search"></i> 搜索
          </button>
        </div>
        <div class="col-md-3">
          <button class="btn btn-outline-success w-100" @click="listAllBooks">
            <i class="bi bi-grid-3x3-gap-fill"></i> 一键查询全部
          </button>
        </div>
      </div>

      <div v-if="loading" class="text-center py-4">
        <div class="spinner-border text-primary" role="status"></div>
      </div>

      <div v-else class="table-responsive">
        <table class="table table-hover">
          <thead>
            <tr>
              <th>ISBN</th><th>书名</th><th>作者</th><th>出版社</th><th>出版日期</th><th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="book in results" :key="book.isbn" class="book-row">
              <td>{{ book.isbn }}</td>
              <td>{{ book.bName }}</td>
              <td>{{ book.author }}</td>
              <td>{{ book.publisher }}</td>
              <td>{{ book.pubDate || '-' }}</td>
              <td>
                <button class="btn btn-sm btn-outline-primary" @click="showDetail(book)">
                  <i class="bi bi-info-circle"></i> 详情
                </button>
               </td>
             </tr>
            <tr v-if="results.length === 0 && !loading">
              <td colspan="6" class="text-center text-muted">暂无数据，请输入关键词搜索或点击"一键查询全部"</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <BookDetailModal ref="detailModalRef" :current-user="userInfo" @refresh="doRefresh" />
  </div>
</template>

<script>
import BookDetailModal from './BookDetailModal.vue'
import { searchBooks, getBookCopies, getAllBooks } from '../api'

export default {
  name: 'BookSearch',
  components: { BookDetailModal },
  props: {
    userInfo: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      keyword: '',
      searchType: 'bName',
      results: [],
      loading: false
    }
  },
  methods: {
    async doSearch() {
      if (!this.keyword.trim()) {
        this.listAllBooks()
        return
      }
      this.loading = true
      try {
        const res = await searchBooks(this.keyword, this.searchType)
        this.results = res.data
        console.log('搜索结果:', this.results)
      } catch (error) {
        console.error('搜索失败:', error)
        alert('搜索失败')
      } finally {
        this.loading = false
      }
    },
    async listAllBooks() {
      this.loading = true
      try {
        const res = await getAllBooks()
        this.results = res.data
        console.log('全部图书:', this.results)
      } catch (error) {
        console.error('获取全部图书失败:', error)
        alert('获取全部图书失败')
      } finally {
        this.loading = false
      }
    },
    async showDetail(book) {
      this.loading = true
      try {
        const res = await getBookCopies(book.isbn)
        this.$refs.detailModalRef.show(book, res.data)
      } catch (error) {
        console.error('获取详情失败:', error)
        alert('获取详情失败')
      } finally {
        this.loading = false
      }
    },
    doRefresh() {
      if (this.keyword.trim()) {
        this.doSearch()
      } else {
        this.listAllBooks()
      }
    }
  },
  mounted() {
    this.listAllBooks()
  }
}
</script>

<style scoped>
.book-row {
  cursor: pointer;
}
.book-row:hover {
  background-color: #f8fafc;
}
</style>