<template>
  <div class="row g-4">
    <div class="col-md-5">
      <div class="card">
        <div class="card-header bg-info text-white">📊 个人借阅查询</div>
        <div class="card-body">
          <div class="input-group mb-3">
            <input class="form-control" v-model="statSno" placeholder="学号" :readonly="!!userSno">
            <button class="btn btn-primary" @click="queryPersonal" :disabled="loading || (!statSno)">查询</button>
          </div>

          <div v-if="loading" class="text-center py-3">
            <div class="spinner-border text-primary" role="status"></div>
          </div>

          <div v-else-if="personalInfo" class="mt-2">
            <div class="stat-card mb-3">
              <div class="stat-number">{{ personalInfo.totalBorrowed || 0 }}</div>
              <div>总借阅次数</div>
            </div>
            <div class="stat-card warning mb-3">
              <div class="stat-number">{{ personalInfo.currentlyBorrowed || 0 }}</div>
              <div>当前未还</div>
            </div>
            <h6 class="mt-3">📌 未还图书</h6>
            <div class="list-group">
              <div v-for="b in personalInfo.unreturnedBooks" :key="b.barCode" class="list-group-item">
                <div class="fw-bold">{{ b.bookName || '未知图书' }}</div>
                <small>条形码：{{ b.barCode }}</small><br>
                <small>借书日期：{{ b.borDate || '-' }}</small><br>
                <small>应还日期：{{ b.retDate || '-' }}</small>
              </div>
              <div v-if="!personalInfo.unreturnedBooks || personalInfo.unreturnedBooks.length === 0"
                   class="list-group-item text-muted text-center">
                暂无未还图书，是个好学生！
              </div>
            </div>
          </div>

          <div v-if="queryError" class="alert alert-danger mt-3">{{ queryError }}</div>
        </div>
      </div>
    </div>

    <div class="col-md-7">
      <!-- 学生排行榜 -->
      <div class="card mb-4">
        <div class="card-header bg-warning">
          🏆 学生借书排行榜
          <button class="btn btn-sm btn-outline-secondary float-end" @click="loadRankings" :disabled="loading">
            <i class="bi bi-arrow-repeat"></i> 刷新
          </button>
        </div>
        <div class="card-body">
          <table class="table table-hover">
            <thead class="table-light">
              <tr><th>排名</th><th>学号</th><th>姓名</th><th>借书次数</th></tr>
            </thead>
            <tbody>
              <tr v-for="(r, idx) in studentRanking" :key="idx">
                <td class="text-center">{{ idx + 1 }}</td>
                <td>{{ r.sno }}</td>
                <td>{{ r.name || '未知' }}</td>
                <td class="text-center fw-bold">{{ r.borrowCount }}</td>
              </tr>
              <tr v-if="!studentRanking.length">
                <td colspan="4" class="text-center text-muted py-3">暂无数据</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 图书排行榜 -->
      <div class="card">
        <div class="card-header bg-warning">
          🔥 热门图书排行榜
        </div>
        <div class="card-body">
          <table class="table table-hover">
            <thead class="table-light">
              <tr><th>排名</th><th>ISBN</th><th>书名</th><th>借阅次数</th></tr>
            </thead>
            <tbody>
              <tr v-for="(r, idx) in bookRanking" :key="idx">
                <td class="text-center">{{ idx + 1 }}</td>
                <td>{{ r.isbn }}</td>
                <td>{{ r.name || '未知' }}</td>
                <td class="text-center fw-bold">{{ r.borrowCount }}</td>
              </tr>
              <tr v-if="!bookRanking.length">
                <td colspan="4" class="text-center text-muted py-3">暂无数据</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getStudentRanking, getBookRanking, getPersonalInfo } from '../api'

export default {
  name: 'Statistics',
  props: {
    userInfo: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      statSno: '',
      personalInfo: null,
      studentRanking: [],
      bookRanking: [],
      loading: false,
      queryError: ''
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
          this.statSno = val
          this.queryPersonal()
        }
      }
    }
  },
  methods: {
    async loadRankings() {
      this.loading = true
      try {
        const [stuRes, bookRes] = await Promise.all([
          getStudentRanking(),
          getBookRanking()
        ])
        this.studentRanking = stuRes.data || []
        this.bookRanking = bookRes.data || []
        console.log('排行榜加载成功:', { student: this.studentRanking.length, book: this.bookRanking.length })
      } catch (error) {
        console.error('加载排行榜失败:', error)
      } finally {
        this.loading = false
      }
    },
    async queryPersonal() {
      if (!this.statSno) {
        this.queryError = '请输入学号'
        return
      }
      this.loading = true
      this.queryError = ''
      this.personalInfo = null
      try {
        const res = await getPersonalInfo(this.statSno)
        this.personalInfo = res.data
        console.log('个人借阅信息:', this.personalInfo)
      } catch (error) {
        console.error('查询失败:', error)
        this.queryError = error.response?.data || '查询失败，请检查学号是否正确'
      } finally {
        this.loading = false
      }
    }
  },
  mounted() {
    this.loadRankings()
  }
}
</script>

<style scoped>
.stat-card {
  background: linear-gradient(135deg, #2563eb, #4f46e5);
  color: white;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
}
.stat-card.warning {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}
.stat-number {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 5px;
}
</style>