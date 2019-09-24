<template>
  <div class="app-container">
    <el-form :model="blog" :rules="rules" ref="blog" label-width="100px" class="demo-blog">
      <el-form-item label="标题" prop="title">
        <el-input v-model="blog.title"></el-input>
      </el-form-item>
      <el-form-item label="分类" prop="category_id">
        <el-select v-model="blog.category_id" placeholder="请选择文章分类">
          <el-option v-for="item in categories" :label="item.v" :value="item.k" v-if=""></el-option>
        </el-select>
      </el-form-item>
      <el-form-item v-if="tags != null" label="标签" prop="tags">
        <el-checkbox-group v-model="blog.tags">
          <el-checkbox v-for="item in tags" :label="item.k">{{item.v}}</el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item label="状态">
        <el-radio-group v-model="blog.code">
          <el-radio :label="0">默认</el-radio>
          <el-radio :label="1">推荐</el-radio>
          <el-radio :label="2">置顶</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="概要" prop="summary">
        <el-input type="textarea" v-model="blog.summary"></el-input>
      </el-form-item>
      <el-form-item label="封面图片" placeholder="用于列表展示的图片，只需域名后面的部分即可....">
        <el-input v-model="blog.img_url"></el-input>
      </el-form-item>
      <el-form-item>
        <div id="main">
          <mavon-editor ref="md" v-model="blog.content" @imgAdd="handleImgAdd" :ishljs="true" @htmlCode="handleHtml"
                        @change="handleHtml"/>
        </div>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitForm()">提交</el-button>
        <el-button @click="resetForm('blog')">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
  import axios from 'Axios'

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
          code: 0,
          tags: [],
          content: '',
          summary: '',
          img_url: '',
          author: 'Jann',
          blog_catalog: '',
          status: 1
        },
        tags: [],
        categories: [],
        rules: {
          title: [
            { required: true, message: '请输入标题', trigger: 'blur' },
            { min: 1, max: 20, message: '长度在 1 到 20 个字符', trigger: 'blur' }
          ],
          category_id: [
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
    components: {},
    created() {
      this.getParams()
    },
    mounted() {
      this.initData(this.id)
      this.getAllTags()
      this.getAllCategories()
      this.intervalBegin()
    },
    beforeCreate() {
      window.intervalObj = ''
    },
    destroyed() {
      this.intervalEnd()
    },
    methods: {
      intervalBegin() {
        window.intervalObj = setInterval(this.autoSaveBlog, 60000)
      },
      intervalEnd() {
        clearInterval(window.intervalObj)
      },
      autoSaveBlog() {
        if (!this.isEmpty(this.blog.title) && !this.isEmpty(this.blog.content)) {
          this.submitData(false)
        }
      },
      isEmpty(obj) {
        if (typeof obj === 'undefined' || obj == null || obj === '') {
          return true
        } else {
          return false
        }
      },
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
        // this.keyupMallName()
      },
      onEditorChange({ editor, html, text }) {
        this.content = html
      },
      submitForm() {
        this.$refs['blog'].validate((valid) => {
          if (valid) {
            this.submitData(true)
          } else {
            return false
          }
        })
      },
      /**
       *  提交数据
       *  @param isJumpTo 是否跳转&自动提交，当false时候表示自动提交
        */
      submitData(isJumpTo) {
        if (!isJumpTo) {
          this.blog.blog_status = -1
        }
        this.createCatalog(this.blog.html_content)
        if (this.id === null || this.id === undefined) {
          axios.post('/api/manage/blogs', this.blog).then(result => {
            this.noticeMessage(result.data.status, result.data.msg, isJumpTo)
          })
        } else {
          axios.put('/api/manage/blogs/' + this.id, this.blog).then(result => {
            this.noticeMessage(result.data.status, result.data.msg, isJumpTo)
          })
        }
      },
      noticeMessage(code, msg, isJumTo) {
        if (!this.isEmpty(code) && code === 1000) {
          if (isJumTo) {
            this.$message.success('提交成功！')
            this.$router.push({ path: '/blog/list' })
          } else {
            this.$message.success('内容已保存至草稿箱')
          }
        } else {
          this.$message.error(msg)
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
        // 获取到凭证之后再将文件上传到七牛云空间
        axios.post(this.uploadDomain, formData, config).then(res => {
          console.log(res)
          this.imageUrl = 'http://' + this.qiniuAddr + '/' + res.data.key
          console.log(this.imageUrl)
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
            return res.data.data
          } else {
            this.$message.error(JSON.stringify(res.data.msg))
            return
          }
        })
        return '123'
      },
      // 生成目录
      createCatalog(htmlContent) {
        const tree = []
        const title = { H1: 1, H2: 1, H3: 1, H4: 1, H5: 1 }
        traverseNode(this.parseToDOM(htmlContent))
        function traverseNode(node) {
          var tag = node.tagName
          var children = node.children
          if (title[tag]) {
            // const id = tag + '-' + title[tag]
            const id = node.getElementsByTagName('A')[0].getAttribute('id')
            tree.push({
              lev: parseInt(tag.slice(1)),
              text: node.innerText,
              id: id
            })
            node.setAttribute('id', id)
            title[tag]++
          }
          for (let i = 0, len = children.length; i < len; i++) {
            traverseNode(children[i])
          }
        }
        this.blog.blog_catalog = JSON.stringify(tree)
      },
      // 将html文本转换成dom
      parseToDOM(str) {
        var div = document.createElement('div')
        if (typeof str === 'string') {
          div.innerHTML = str
        }
        return div
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
