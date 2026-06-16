<template>
  <div class="card">
    <div class="card-header bg-warning text-white">💰 罚款缴纳</div>
    <div class="card-body">
      <div class="row g-3 mb-3">
        <div class="col-md-4">
          <input class="form-control" v-model="sno" placeholder="学号" :readonly="!!userSno">
        </div>
        <div class="col-md-2">
          <button class="btn btn-primary" @click="doQuery" :disabled="loading || (!sno)">查询</button>
        </div>
        <div class="col-md-3" v-if="!userSno">
          <button class="btn btn-warning" @click="doGenerate" :disabled="loading">手动生成罚款</button>
        </div>
      </div>

      <div v-if="loading" class="text-center py-3">
        <div class="spinner-border text-primary" role="status"></div>
      </div>

      <div v-else-if="fines.length" class="table-responsive">
        <table class="table table-hover">
          <thead class="table-light">
            <tr>
              <th>书名</th><th>借书日期</th><th>应还日期</th><th>实际归还日期</th>
              <th>超期天数</th><th>罚款金额</th><th>状态</th><th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="f in fines" :key="f.id">
              <td>{{ f.bookName || '未知图书' }}</td>
              <td>{{ f.borDate || '' }}</td>
              <td>{{ f.retDate || '' }}</td>
              <td>{{ f.realRetDate || '未归还' }}</td>
              <td>{{ f.overdueDays || 0 }} 天</td>
              <td class="text-danger fw-bold">¥{{ (f.fineAmount || 0).toFixed(2) }}</td>
              <td>
                <span class="badge" :class="f.status === '未缴纳' ? 'bg-warning' : 'bg-success'">
                  {{ f.status || '未缴纳' }}
                </span>
              </td>
              <td>
                <button class="btn btn-sm btn-success" @click="paySingle(f.id)" :disabled="f.status !== '未缴纳' || loading">
                  缴纳
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="alert alert-info d-flex justify-content-between align-items-center mt-3">
          <span class="fw-bold">未缴总额：¥{{ totalUnpaid.toFixed(2) }}</span>
          <button class="btn btn-success" @click="payAll" :disabled="loading || totalUnpaid === 0">缴纳所有未缴罚款</button>
        </div>
      </div>

      <div v-else-if="queried" class="alert alert-secondary text-center">
        ✨ 暂无未缴罚款
      </div>

      <div v-if="errorMsg" class="alert alert-danger mt-3">{{ errorMsg }}</div>
    </div>
  </div>
</template>

<script>
import { getFines, payAllFines, paySingleFine, generateFines } from '../api'

export default {
  name: 'FineManage',
  props: {
    userInfo: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      sno: '',
      fines: [],
      totalUnpaid: 0,
      queried: false,
      loading: false,
      errorMsg: ''
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
          this.sno = val
          this.doQuery()
        }
      }
    }
  },
  methods: {
    async doQuery() {
      if (!this.sno) {
        this.errorMsg = '请输入学号'
        return
      }
      this.loading = true
      this.queried = false
      this.errorMsg = ''
      try {
        const res = await getFines(this.sno)
        console.log('罚款查询结果:', res.data)
        this.fines = res.data || []
        let total = 0
        this.fines.forEach(f => {
          if (f.status === '未缴纳') total += (f.fineAmount || 0)
        })
        this.totalUnpaid = total
        this.queried = true
      } catch (error) {
        console.error('查询失败:', error)
        this.errorMsg = error.response?.data || '查询失败'
      } finally {
        this.loading = false
      }
    },
    async paySingle(fineId) {
      this.loading = true
      try {
        const res = await paySingleFine(fineId)
        alert(res.data?.message || '缴纳成功')
        await this.doQuery()
      } catch (error) {
        console.error('缴纳失败:', error)
        alert(error.response?.data || '缴纳失败')
      } finally {
        this.loading = false
      }
    },
    async payAll() {
      if (!this.sno) {
        this.errorMsg = '请先查询学号'
        return
      }
      if (!confirm('确认缴纳该学生的所有未缴罚款吗？')) return

      this.loading = true
      try {
        const res = await payAllFines(this.sno)
        console.log('缴纳结果:', res.data)
        alert(res.data.message || '缴纳成功')
        await this.doQuery()
      } catch (error) {
        console.error('缴纳失败:', error)
        alert(error.response?.data || '缴纳失败')
      } finally {
        this.loading = false
      }
    },
    async doGenerate() {
      if (!this.sno) {
        this.errorMsg = '请输入学号'
        return
      }
      if (!confirm('确认手动为该学生生成罚款记录吗？')) return

      this.loading = true
      try {
        const res = await generateFines(this.sno)
        console.log('生成结果:', res.data)
        alert(res.data.message || '生成成功')
        await this.doQuery()
      } catch (error) {
        console.error('生成失败:', error)
        alert(error.response?.data || '生成失败')
      } finally {
        this.loading = false
      }
    }
  }
}
</script>