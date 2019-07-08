<template>
  <div class="app-container">
    <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
      <el-form :inline="true">
        <!--<el-form-item>-->
          <!--<el-select v-model="value" clearable placeholder="状态">-->
            <!--<el-option-->
              <!--v-for="item in status"-->
              <!--:key="item.statusId"-->
              <!--:label="item.label"-->
              <!--:value="item.statusId">-->
            <!--</el-option>-->
          <!--</el-select>-->
        <!--</el-form-item>-->
        <!--<el-form-item>-->
          <!--<el-input placeholder="姓名" v-model="searchName"></el-input>-->
        <!--</el-form-item>-->
        <!--<el-form-item>-->
          <!--<el-button type="primary" @click="doFilter()"><i class="el-icon-search"></i>搜索</el-button>-->
        <!--</el-form-item>-->
        <el-form-item>
          <el-button type="primary" @click="handleAdd()">新增</el-button>
        </el-form-item>
      </el-form>
    </el-col>
    <!--列表-->
    <el-table :data="tableList" v-loading="listLoading" border element-loading-text="拼命加载中" style="width: 100%;">
      <el-table-column prop="id" label="序号" width="65">
      </el-table-column>
      <el-table-column prop="tag_name" label="标题">
      </el-table-column>
      <el-table-column prop="tag_desc" label="说明">
      </el-table-column>
      <el-table-column prop="tag_type" :formatter="formatType" label="类型">
      </el-table-column>
      <el-table-column prop="create_time" label="创建时间" width="65">
      </el-table-column>
      <el-table-column prop="update_time" label="更新时间" width="110px">
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
                   :page-size="this.pageSize"
                   @size-change="handleSizeChange"
                   :total="total"
                   @current-change="handleCurrentChange"
                   style="text-align:center;">
    </el-pagination>


    <!-- 编辑标签 -->
    <el-dialog title="编辑" :visible.sync="isShowEditVisible">
      <el-form label-width="80px" :model="tagFormData" ref="dataForm">
        <el-form-item label="标题" prop="tagName">
          <el-input v-model="tagFormData.tag_name"></el-input>
        </el-form-item>
        <el-form-item label="详情" prop="tagDesc">
          <el-input v-model="tagFormData.tag_desc"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="isShowEditVisible = false">取消</el-button>
        <el-button type="primary" :loading="listLoading" @click="submitUpdateData" class="title1">确定</el-button>
      </div>
    </el-dialog>
    <!-- 新增标签 -->
    <el-dialog title="添加" :visible.sync="isShowAddVisible">
      <el-form label-width="80px" :model="tagFormData" ref="dataForm">
        <el-form-item label="标题" prop="tagName">
          <el-input v-model="tagFormData.tag_name"></el-input>
        </el-form-item>
        <el-form-item label="分类" prop="type">
          <el-select v-model="tagFormData.tag_type" placeholder="请选择类型分类/标签">
            <el-option label="标签" value="1"></el-option>
            <el-option label="分类" value="2"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="详情" prop="tagDesc">
          <el-input v-model="tagFormData.tag_desc"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="isShowAddVisible = false">取消</el-button>
        <el-button type="primary" :loading="listLoading" @click="addData" class="title1">确定</el-button>
      </div>
    </el-dialog>

    <!-- 删除弹框 -->
    <el-dialog
      title="删除"
      :visible.sync="isShowDeleteVisible"
      width="30%">
      <span>确认删除吗</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="isShowDeleteVisible = false">取 消</el-button>
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
        isShowAddVisible: false,
        isShowDeleteVisible: false,
        tagFormData: {
          id: 0,
          tag_type: 1,
          tag_name: '',
          tag_desc: ''
        },
        total: 0,
        pageNum: 1,
        pageSize: 10,
        tageType: null,
        status: [
          {
            statusId: 1,
            label: '启用'
          }, {
            statusId: 0,
            label: '禁用'
          }
        ],
        value: '',
        searchName: '',
        filterTableDataEnd: []
      }
    },
    created() {
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
        axios.get('api/manage/tags', {
          params: {
            pageSize: this.pageSize,
            pageNum: this.pageNum,
            tagType: this.tageType
          }
        }).then(result => {
          if (result.data.status === 1000) {
            this.tableList = result.data.data.list
            this.total = result.data.data.total
            this.page = result.data.data.pageNum
            this.pageSize = result.data.data.pageSize
            this.listLoading = false
          } else {
            this.$message.error(JSON.stringify(result.data.msg))
          }
        })
      },
      doFilter() {
        if (this.searchName === '') {
          this.fetchData()
          // this.$message.warning('查询条件不能为空！')
          return
        }
        console.log(this.searchName)
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
      clickfun(e) {
        console.log(e.target.innerText)
      },
      handleAdd() {
        this.isShowAddVisible = true
      },
      handleUpdate(row) {
        this.isShowEditVisible = true
        this.tagFormData = Object.assign({}, row)
      },
      deleteUpdate(row) {
        this.isShowDeleteVisible = true
        this.temp = Object.assign({}, row)
        // console.log(row)
      },
      submitDelete() {
        var id = this.temp.id
        var type = this.temp.type
        axios.delete('api/manage/tags/' + id + '?type=' + type).then((result) => {
          if (result.data.status === 1000) {
            this.$notify({
              title: '成功',
              message: '删除成功',
              type: 'success',
              duration: 2000
            })
            this.fetchData()
          } else {
            this.$message.error(JSON.stringify(result.data.msg))
          }
        })
        this.isShowDeleteVisible = false

      },
      handleModifyStatus(row, status) {
        this.$message({
          message: '操作成功',
          type: 'success'
        })
        console.log(row)
        row.status = status
      },
      addData() {
        axios.post('api/manage/tags', this.tagFormData).then((result) => {
          if (result.data.status === 1000) {
            this.isShowAddVisible = false
            this.fetchData()
            this.$notify({
              title: '成功',
              message: '添加成功',
              type: 'success',
              duration: 2000
            })
          } else {
            this.$message.error(JSON.stringify(result.data.msg))
          }
        })
      },
      submitUpdateData() {
        if (this.tagFormData.id === null) {
          this.$message.error(JSON.stringify('修改参数异常'))
          return
        }
        axios.put('api/manage/tags/' + this.tagFormData.id, this.tagFormData).then((result) => {
          if (result.data.status === 1000) {
            this.isShowEditVisible = false
            this.fetchData()
          } else {
            this.$message.error(JSON.stringify(result.data.msg))
          }
        })
      },
      handleSizeChange(val) {
        this.page = val
        console.log(this.page)
        this.fetchData()
      },
      handleCurrentChange(val) {
        this.page = val
        console.log(this.page)
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
      formatType: function(row, colum) {
        return row.tag_type === 1 ? '分类' : row.tag_type === 2 ? '标签' : '未知'
      }
    }
  }
</script>
