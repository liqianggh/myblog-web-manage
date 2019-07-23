<template>
  <div class="app-container">
    <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
      <el-form :inline="true">
        <el-form-item>
          <el-select v-model="value" clearable placeholder="状态">
            <el-option
              v-for="item in status"
              :key="item.statusId"
              :label="item.label"
              :value="item.statusId">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-input placeholder="姓名" v-model="searchName"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="doFilter()"><i class="el-icon-search"></i>搜索</el-button>
        </el-form-item>
        <el-form-item>
          <router-link tag="a" to="/blog/edit"><el-button type="primary">新增</el-button></router-link>
        </el-form-item>
      </el-form>
    </el-col>
    <!--列表-->
    <el-table :data="tableList" v-loading="listLoading" border element-loading-text="拼命加载中" style="width: 100%;">
      <el-table-column prop="id" align="center" label="序号" width="65">
      </el-table-column>
      <el-table-column prop="title" label="标题">
      </el-table-column>
      <el-table-column prop="summary" min-width="150px" label="摘要">
      </el-table-column>
      <el-table-column prop="view_count" align="center" label="阅读数" width="65">
      </el-table-column>
      <el-table-column prop="update_time" align="center" label="修改时间" width="160px">
      </el-table-column>
      <el-table-column :formatter="formatCode" align="center" label="状态" width="120">
      </el-table-column>
      <el-table-column prop="operation" label="操作 ">
        <template slot-scope="scope">
          <el-button size="small" type="primary" @click="handleUpdate(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="deleteUpdate(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!--工具条-->
    <el-pagination layout="total, prev, pager, next"
                   background
                   :page-size="pageSize"
                   @size-change="handleSizeChange"
                   :total="total"
                   @current-change="handleCurrentChange"
                   style="text-align:center;">
    </el-pagination>

    <!-- 删除弹框 -->
    <el-dialog
      title="删除"
      :visible.sync="deleteVisible"
      :modal-append-to-body='false'
      width="30%">
      <span>确认删除博客{{this.temp.title}}吗？</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="deleteVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitDelete">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>


<script>
  import axios from 'Axios'
  export default {
    data() {
      return {
        tableList: [],
        listLoading: true,
        isShowEditVisible: false,
        deleteVisible: false,
        deleteBlogTitle: '',
        temp: {
          id: '',
          title: ''
        },
        total: 7,
        page: 1,
        pageSize: 10,
        status: [
          {
            statusId: 1,
            label: '启用'
          }, {
            statusId: 0,
            label: '禁用'
          }
        ],
        codeValue: [
          { id: 0, name: '默认' },
          { id: 1, name: '推荐' },
          { id: 2, name: '置顶' }
        ],
        value: '',
        searchName: '',
        filterTableDataEnd: []
      }
    },
    mounted() {
      this.fetchData()
    },
    filters: {
      statusFilter(status) {
        const statusMap = {
          1: 'success',
          2: 'danger'
        }
        return statusMap[status]
      }
    },
    methods: {
      fetchData() {
        this.listLoading = true
        axios.get('/api/manage/blogs', {
          params: {
            pageNum: this.page,
            pageSize: this.pageSize
          }
        }).then(result => {
          if (result.data.status === 1000) {
            this.tableList = result.data.data.list
            this.total = result.data.data.total
            this.page = result.data.data.page_num
            this.pageSize = result.data.data.page_size
            this.listLoading = false
          } else {
            this.$message.error(JSON.stringify(result.data.msg))
          }
        })
      },
      doFilter() {
        if (this.searchName === '') {
          this.fetchData()
          return
        }
        // 每次手动将数据置空,因为会出现多次点击搜索情况
        this.filterTableDataEnd = []
        this.tableList.forEach((value, index) => {
          if (value.cname) {
            if (value.cname.indexOf(this.searchName) >= 0) {
              this.filterTableDataEnd.push(value)
              console.log(this.filterTableDataEnd)
            }
          }
        })
        // 页面数据改变重新统计数据数量和当前页
        this.page = 1
        this.total = this.filterTableDataEnd.length
        // 渲染表格,根据值
        this.currentChangePage(this.filterTableDataEnd)
      },
      handleUpdate(row) {
        this.$router.push({
          path: '/blog/edit',
          query: {
            id: row.id
          }
        })
      },
      deleteUpdate(row) {
        this.deleteVisible = true
        this.temp = Object.assign({}, row)
      },
      submitDelete() {
        if (this.temp.id) {
          axios.delete('/api/manage/blogs/' + this.temp.id).then(result => {
            if (!result.data.data) {
              this.$notify({
                title: '成功',
                message: '删除成功',
                type: 'error',
                duration: 2000
              })
            } else {
              this.$notify({
                title: '成功',
                message: '删除成功',
                type: 'success',
                duration: 2000
              })
              for (const v of this.tableList) {
                if (v.uid === this.temp.uid) {
                  const index = this.tableList.indexOf(v)
                  this.tableList.splice(index, 1)
                  this.fetchData()
                  break
                }
              }
              this.deleteVisible = false
            }
          })
        }
      },
      handleModifyStatus(row, status) {
        this.$message({
          message: '操作成功',
          type: 'success'
        })
        console.log(row)
        row.status = status
      },
      handleSizeChange(val) {
        this.page = val
        this.fetchData()
      },
      handleCurrentChange(val) {
        this.page = val
        this.fetchData()
      },
      currentChangePage(list) {
        let from = (this.page - 1) * this.pageSize
        const to = this.page * this.pageSize
        this.tableList = []
        for (; from < to; from++) {
          if (list[from]) {
            this.tableList.push(list[from])
          }
        }
      },
      formatCode(row, colum) {
        for (var i = 0; i < this.codeValue.length; i++) {
          if (this.codeValue[i].id === row.code) {
            return this.codeValue[i].name
          }
        }
        return '未知'
      }
    }
  }
</script>
