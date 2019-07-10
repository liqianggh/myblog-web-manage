<template>
  <div class="app-container">
    <el-form :model="blog" :rules="rules" ref="blog" label-width="100px" class="demo-blog">
      <el-form-item label="标题" prop="title">
        <el-input v-model="blog.title"></el-input>
      </el-form-item>
      <el-form-item label="分类" prop="categoryId">
        <el-select v-model="blog.category_id" placeholder="请选择文章分类">
          <el-option v-for="item in categories" :label="item.v" :value="item.k"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item v-if="tags != null" label="标签" prop="tags">
        <el-checkbox-group v-model="blog.tags">
          <el-checkbox v-for="item in tags" :label="item.k">{{item.v}}</el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item label="立即发布" prop="code">
        <el-switch v-model="blog.code"></el-switch>
      </el-form-item>
      <el-form-item label="概要" prop="summary">
        <el-input type="textarea" v-model="blog.summary"></el-input>
      </el-form-item>
      <el-form-item>
        <div id="main">
          <mavon-editor ref="md"  v-model="blog.content"   @imgAdd="handleImgAdd"  :ishljs = "true" @htmlCode="handleHtml" @change="handleHtml" />
        </div>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitForm()">立即创建</el-button>
        <el-button @click="resetForm('blog')">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
  import axios from 'Axios'
  // import config from '/config/qiniu.config.js'
  export default {
    name: 'editor',
    data() {
      return {
        id: null,
        htmlContent: '',
        uploadDomain: 'http://upload-z1.qiniup.com',
        qiniuAddr: 'puf3iyxzq.bkt.clouddn.com',
        blog: {
          title: '',
          category_id: null,
          code: true,
          tags: [],
          summary: '',
          author: 'Jann',
          status: 1
        },
        tags: [],
        categories: [],
        rules: {
          title: [
            { required: true, message: '请输入标题', trigger: 'blur' },
            { min: 1, max: 20, message: '长度在 1 到 20 个字符', trigger: 'blur' }
          ],
          categoryId: [
            { required: true, message: '请选择分类', trigger: 'change' }
          ],
          date1: [
            { type: 'date', required: true, message: '请选择日期', trigger: 'change' }
          ],
          date2: [
            { type: 'date', required: true, message: '请选择时间', trigger: 'change' }
          ],
          tags: [
            { type: 'array', required: true, message: '请至少选择一个标签', trigger: 'change' }
          ],
          resource: [
            { required: true, message: '123', trigger: 'change' }
          ],
          summary: [
            { required: true, message: '请填写文章摘要', trigger: 'blur' }
          ]
        },
        content: '',
        editorOption: {
          placeholder: 'Hello World'
        }
      }
    },
    components: {
    },
    created() {
      this.getParams()
    },
    mounted() {
      this.initData(this.id)
      this.getAllTags()
      this.getAllCategories()
    },
    methods: {
      initData(id) {
        if (id) {
          axios.get('/api/manage/blogs/' + id).then(result => {
            if (result.data.status === 1000) {
              this.blog = result.data.data
            } else {
              this.$message.error(JSON.stringify(result.data.msg))
            }
          })
        }
      },
      getAllTags() {
        axios.get('/api/common/all/tags').then(result => {
          if (result.data.status === 1000) {
            this.tags = result.data.data
          } else {
            this.$message.error(JSON.stringify(result.data.msg))
          }
        })
      },
      getAllCategories() {
        axios.get('/api/common/all/categories').then(result => {
          if (result.data.status === 1000) {
            this.categories = result.data.data
          } else {
            this.$message.error(JSON.stringify(result.data.msg))
          }
        })
      },
      getParams() {
        // 取到路由带过来的参数
        const routerParams = this.$route.query.id
        // 将数据放在当前组件的数据内
        this.id = routerParams
        this.keyupMallName()
      },
      onEditorChange({ editor, html, text }) {
        this.content = html
      },
      submitForm() {
        this.blog.code = this.blog.code === true ? 0 : 1
        if (this.id === null || this.id === undefined) {
          axios.post('api/manage/blogs', this.blog).then(result => {
            if (result.data.status === 1000) {
              this.$message.success('提交成功！')
            } else {
              this.$message.error(JSON.stringify(result.data.msg))
            }
          })
        } else {
          axios.put('api/manage/blogs/' + this.id, this.blog).then(result => {
            if (result.data.status === 1000) {
              this.$message.success('提交成功！')
            } else {
              this.$message.error(JSON.stringify(result.data.msg))
            }
          })
        }
      },
      handleHtml(mdText, htmlText) {
        this.blog.html_content = htmlText
      },
      handleImgAdd(pos, uploadFile) {
        // this.mavonEditor.$img2Url(pos, url)
        console.log('handleImgAdd:', uploadFile)
        this.beforeUpload(uploadFile)
        this.uploadFileToQiniu(uploadFile)
      },
      // 上传文件到七牛云
      uploadFileToQiniu(file) {
        const config = {
          headers: { 'Content-Type': 'multipart/form-data' }
        }
        let fileType = ''
        if (file.type === 'image/png') {
          fileType = 'png'
        } else {
          fileType = 'jpg'
        }
        // 重命名要上传的文件
        const newFileName = 'lytton' + new Date() + Math.floor(Math.random() * 100) + '.' + fileType
        // 从后端获取上传凭证token
        var token = this.getToken()
        const formData = new FormData()
        formData.append('file', file)
        formData.append('token', token)
        formData.append('key', newFileName)
        alert(123)
        // 获取到凭证之后再将文件上传到七牛云空间
        axios.post(this.uploadDomain, formData, config).then(res => {
          alert(res)
          console.log(res)
          this.imageUrl = 'http://' + this.qiniuAddr + '/' + res.data.key
          console.log(this.imageUrl)
          alert(this.imageUrl)
        })
      },
      // 验证文件合法性
      beforeUpload(file) {
        const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
        const isLt2M = file.size / 1024 / 1024 < 2
        if (!isJPG) {
          this.$message.error('上传头像图片只能是 JPG 格式!')
        }
        if (!isLt2M) {
          this.$message.error('上传头像图片大小不能超过 2MB!')
        }
        return isJPG && isLt2M
      },
      getToken() {
        axios.get('/api/upload/token').then(res => {
          if (res.data.status === 1000) {
            alert(res.data.data)
            return res.data.data
          } else {
            this.$message.error(JSON.stringify(res.data.msg))
            return
          }
        })
        return '123'
      }
    }
  }
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
  .editor-btn {
    margin-top: 20px;
  }

  .crumbs, .plugins-tips {
    margin-bottom: 20px
  }

  .container {
    padding: 30px;
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 5px
  }

  .markdown-body {
    height: 440px;
  }
</style>
