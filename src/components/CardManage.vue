<template>
  <div class="row g-4">
    <div class="col-md-6">
      <div class="card">
        <div class="card-header bg-primary text-white">新办借书证</div>
        <div class="card-body">
          <input class="form-control mb-2" v-model="createSno" placeholder="学号">
          <button class="btn btn-primary" @click="doCreate">新办</button>
          <div v-if="createMsg" class="alert mt-2 small" :class="createMsg.includes('成功') ? 'alert-success' : 'alert-danger'">
            {{ createMsg }}
          </div>
        </div>
      </div>
    </div>
    <div class="col-md-6">
      <div class="card">
        <div class="card-header bg-warning text-white">挂失借书证</div>
        <div class="card-body">
          <input class="form-control mb-2" v-model="loseSno" placeholder="学号">
          <button class="btn btn-warning" @click="doLose">挂失</button>
          <div v-if="loseMsg" class="alert mt-2 small" :class="loseMsg.includes('成功') ? 'alert-success' : 'alert-danger'">
            {{ loseMsg }}
          </div>
        </div>
      </div>
    </div>
    <div class="col-md-6">
      <div class="card">
        <div class="card-header bg-success text-white">补办借书证</div>
        <div class="card-body">
          <input class="form-control mb-2" v-model="reissueSno" placeholder="学号">
          <button class="btn btn-success" @click="doReissue">补办</button>
          <div v-if="reissueMsg" class="alert mt-2 small" :class="reissueMsg.includes('成功') ? 'alert-success' : 'alert-danger'">
            {{ reissueMsg }}
          </div>
        </div>
      </div>
    </div>
    <div class="col-md-6">
      <div class="card">
        <div class="card-header bg-danger text-white">注销借书证</div>
        <div class="card-body">
          <input class="form-control mb-2" v-model="cancelSno" placeholder="学号">
          <button class="btn btn-danger" @click="doCancel">注销</button>
          <div v-if="cancelMsg" class="alert mt-2 small" :class="cancelMsg.includes('成功') ? 'alert-success' : 'alert-danger'">
            {{ cancelMsg }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { createCard, loseCard, reissueCard, cancelCard } from '../api'

export default {
  name: 'CardManage',
  inject: ['setLoading'],
  data() {
    return {
      createSno: '', createMsg: '',
      loseSno: '', loseMsg: '',
      reissueSno: '', reissueMsg: '',
      cancelSno: '', cancelMsg: ''
    }
  },
  methods: {
    async doCreate() {
      if (!this.createSno) return
      this.setLoading(true)
      try {
        const res = await createCard(this.createSno)
        this.createMsg = res.data
        if (res.data.includes('成功')) this.createSno = ''
      } catch (err) {
        this.createMsg = err.response?.data || '操作失败'
      } finally {
        this.setLoading(false)
      }
    },
    async doLose() {
      if (!this.loseSno) return
      this.setLoading(true)
      try {
        const res = await loseCard(this.loseSno)
        this.loseMsg = res.data
        if (res.data.includes('成功')) this.loseSno = ''
      } catch (err) {
        this.loseMsg = err.response?.data || '操作失败'
      } finally {
        this.setLoading(false)
      }
    },
    async doReissue() {
      if (!this.reissueSno) return
      this.setLoading(true)
      try {
        const res = await reissueCard(this.reissueSno)
        this.reissueMsg = res.data
        if (res.data.includes('成功')) this.reissueSno = ''
      } catch (err) {
        this.reissueMsg = err.response?.data || '操作失败'
      } finally {
        this.setLoading(false)
      }
    },
    async doCancel() {
      if (!this.cancelSno) return
      this.setLoading(true)
      try {
        const res = await cancelCard(this.cancelSno)
        this.cancelMsg = res.data
        if (res.data.includes('成功')) this.cancelSno = ''
      } catch (err) {
        this.cancelMsg = err.response?.data || '操作失败'
      } finally {
        this.setLoading(false)
      }
    }
  }
}
</script>