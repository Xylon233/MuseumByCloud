<!--
 * @Descripttion: your project
 * @version: 1.0
 * @Author: Rex Joush
 * @Date: 2021-03-17 15:26:16
 * @LastEditors: zqy
 * @LastEditTime: 2021-05-12 19:38:49
-->
<!--<template>
  <h1>Stateful Sets</h1>
</template>-->
<template>
  <div>
    <!-- 主体部分 -->
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>所有 有状态副本集</span>
      </div>
      <el-row :gutter="20">
        <el-col :span="5">
          <!-- 搜索区域 -->
          <el-select
            v-model="value"
            filterable
            clearable
            size="large"
            style="width: 100%"
            placeholder="请选择命名空间"
            @change="selectChange"
            @clear="clearSelect"
            @focus="initNamespace"
          >
            <el-option
              v-for="item in namespaces"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          <!-- 搜索按钮
            <el-button
              slot="append"
              size="large"
              icon="el-icon-plus"
              @click="getPods"
            ></el-button> -->
        </el-col>
        <!-- 添加按钮 -->
        <!-- <el-col :span="4">
          <el-button
            type="primary"
            size="large"
            icon="el-icon-plus"
            @click="addDialogVisible = true"
          >
            添加 Pod
          </el-button>
        </el-col> -->
      </el-row>
      <el-table
        v-loading="loading"
        :data="statefulSetsInCurrentPage"
        style="width: 100%"
        stripe
        element-loading-text="获取数据中..."
      >
        <el-table-column width="40">
          <template slot-scope="scope">
            <svg-icon :icon-class="scope.row.status === '1' ? 'load-success': 'load-failed'" />
          </template>
        </el-table-column>
        <el-table-column prop="name" label="名称">
          <template slot-scope="scope">
            <router-link
              :to="{
                name: 'Statefulset Details',
                params: {
                  name:
                    scope.row.name +
                    ',' +
                    scope.row.namespace,
                },
              }"
              class="link-type"
              @click.native="goToStatefulSetDetails(scope.row)"
            >
              <span style="color: #409eff; text-decoration: underline">{{
                scope.row.name
              }}</span>
            </router-link>
          </template>
        </el-table-column>
        <el-table-column prop="namespace" label="命名空间" />
        <el-table-column label="Pods">
          <template slot-scope="scope">
            {{ scope.row.runningPods ? scope.row.runningPods : 0 }}/{{ scope.row.replicas }}
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="200">
          <template slot-scope="scope">
            <span>{{
              scope.row.creationTimestamp.replaceAll(/[TZ]/g, " ")
            }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <!-- 日志 -->
            <el-button
              type="info"
              icon="el-icon-document"
              style="margin-bottom: 5px"
              size="small"
              @click="showLogDialog(scope.row.name, scope.row.namespace)"
            >日志</el-button>
            <br>
            <!-- 编辑 -->
            <el-button
              style="margin-bottom: 5px"
              type="primary"
              icon="el-icon-edit"
              size="small"
              @click="showStatefulSetEditDialog(scope.row.name, scope.row.namespace)"
            >编辑</el-button>
            <br>
            <!-- 删除 -->
            <el-button
              style="margin-bottom: 5px"
              type="danger"
              icon="el-icon-delete"
              size="small"
              @click="delStatefulSet(scope.row.name, scope.row.namespace)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        :current-page="currentPage"
        :page-size="pageSize"
        layout=" prev, pager, next, jumper, ->, total, slot"
        :total="statefulSetsAmount"
        @current-change="handleCurrentChange"
      />
    </el-card>

    <!-- 日志 -->
    <el-dialog
      title="日志"
      :visible.sync="logDialogVisible"
      width="70%"
      :append-to-body="true"
      :lock-scroll="true"
      @close="logDialogClose"
    >
      <template>
        <el-select v-model="podName" placeholder="请选择容器组" style="margin-right: 5px" @change="logSelectChange">
          <el-option
            v-for="item in podNames"
            :key="item"
            :label="item"
            :value="item"
            :disabled="item === podName"
          />
        </el-select>
      </template>
      <template>
        <el-select v-model="containerName" placeholder="请选择容器" @change="logSelectChange">
          <el-option
            v-for="item in containerNames"
            :key="item"
            :label="item"
            :value="item"
            :disabled="item === containerName"
          />
        </el-select>
      </template>
      <highlightjs javascript :code="log" />
      <span slot="footer" class="dialog-footer">
        <div class="foot-info">
          <i class="el-icon-warning" /> 请选择要查看日志的 容器组 和 容器组中的容器
        </div>
        <el-button type="primary" @click="logDialogClose">确 定</el-button>
      </span>
    </el-dialog>

    <!-- StatefulSet 编辑框 -->
    <el-dialog
      title="编辑 StatefulSet"
      :visible.sync="editDialogVisible"
      width="70%"
      :append-to-body="true"
      :lock-scroll="true"
      @closed="handleClose"
      @close="editDialogVisible = false"
    >
      <el-tabs value="first" type="card">
        <el-tab-pane label="YAML" name="first">
          <codemirror
            :value="codeYaml"
            :options="cmOptionsYaml"
            @ready="onYamlCmReady"
            @input="onYamlCmCodeChange"
          />
        </el-tab-pane>
        <!-- <el-tab-pane label="JSON" name="second">
          <codemirror
            ref="cmYamlEditor"
            :value="codeJSON"
            :options="cmOptions"
            @ready="onJSONCmReady"
            @input="onJSONCmCodeChange"
          />
        </el-tab-pane> -->
      </el-tabs>

      <!-- <textarea style="width:100%" name="describe" id="pod" cols="30" rows="10">
        {{code}}
      </textarea> -->
      <span slot="footer" class="dialog-footer">
        <div class="foot-info">
          <i class="el-icon-warning" /> 此操作相当于 kubectl apply -f
          &ltspec.yaml>
        </div>
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="commitYamlChange">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
// import language js
import 'codemirror/mode/javascript/javascript.js'
import 'codemirror/mode/yaml/yaml.js'
// import theme style
import 'codemirror/theme/panda-syntax.css'

export default {
  name: 'StatefulSets',

  data() {
    return {
      statefulSetsAmount: 0, // StatefulSets 总数
      currentPage: 1, // 分页绑定当前页
      statefulSetsInCurrentPage: [], // 页面中的 StatefulSets
      pageSize: 6, // 一页显示数量
      namespaces: [],
      statefulSets: [],
      loading: true, // 获取数据中
      editDialogVisible: false, // 编辑详情框
      addDialogVisible: false, // 添加框详情
      // codeJSON: "", // 编辑框的 json 数据
      codeYaml: '', // 编辑框的 yaml 数据
      addYaml: '', // 添加框的 yaml 数据
      value: '',
      /* 日志部分*/
      logs: [],
      log: '',
      podName: '',
      containerName: '',
      logDialogVisible: false,
      cmOptionsLog: {
        // 日志 codemirror 配置项
        tabSize: 4,
        mode: 'log',
        theme: 'panda-syntax',
        lineNumbers: true,
        line: true
      },
      // cmOptions: {
      //   // json codemirror 配置项
      //   tabSize: 4,
      //   mode: {
      //     name: "javascript",
      //     json: true,
      //   },
      //   theme: "panda-syntax",
      //   lineNumbers: true,
      //   line: true,
      // },
      cmOptionsYaml: {
        // yaml codemirror 配置项
        tabSize: 4,
        mode: 'yaml',
        theme: 'panda-syntax',
        lineNumbers: true,
        line: true
      }
    }
  },

  computed: {
    /* 日志部分*/
    podNames() {
      const names = []
      const tmp = Object.keys(this.logs)
      for (const name in tmp) {
        names.push(tmp[name])
      }
      return names
    },
    containerNames() {
      const pod = this.logs[this.podName]
      const names = []
      for (const name in pod) {
        names.push(name)
      }
      return names
    }
  },

  created() {
    this.getStatefulSets()
  },

  methods: {
    // 获取所有 StatefulSets
    getStatefulSets(namespace = '') {
      this.$store
        .dispatch('statefulSets/getAllStatefulSets', namespace)
        .then((res) => {
          // console.log(res.data);
          this.statefulSets = res.data
          this.statefulSetsAmount = this.statefulSets.length
          this.statefulSetsInCurrentPage = this.statefulSets.slice(0, this.pageSize)
        })
        .catch((error) => {
          console.log(error)
          this.statefulSets = []
          this.statefulSetsAmount = 0
          this.statefulSetsInCurrentPage = []
        })
      this.loading = false
    },

    /* 按命名空间查询 */
    // 当选择框聚焦时获取命名空间
    initNamespace() {
      if (this.namespaces.length === 0) {
        this.namespaces = this.$store.state.namespaces.namespaces
      }
    },
    // 选择框变化事件
    selectChange(value) {
      // console.log("selectChange", value, "++++\n\n")
      this.loading = true
      this.getStatefulSets(value)
    },
    // 选择框清空事件
    clearSelect() {
      this.loading = true
      this.getStatefulSets()
    },

    /* 日志部分*/
    showLogDialog(name, namespace) {
      const data = {
        name: name,
        namespace: namespace
      }
      this.$store.dispatch('statefulSets/getStatefulSetLogs', data).then(res => {
        console.log(res)
        this.logs = res.data
        if (Object.keys(this.logs).length !== 0) {
          this.podName = Object.keys(this.logs)[0]
          this.containerName = Object.keys(this.logs[this.podName])[0]
          this.log = this.logs[this.podName][this.containerName]
        }
        this.logDialogVisible = true
      }).catch(error => {
        throw error
      })
    },
    logSelectChange() {
      this.log = this.logs[this.podName][this.containerName]
    },
    logDialogClose() {
      this.logDialogVisible = false
      this.logs = {}
      this.podName = ''
      this.containerName = ''
      this.log = ''
    },

    // 编辑 StatefulSets
    showStatefulSetEditDialog(name, namespace) {
      const statefulSetDetails = {
        name: name,
        namespace: namespace
      }

      // 获取 yaml 格式
      this.$store
        .dispatch(
          'statefulSets/getStatefulSetYamlByNameAndNamespace',
          statefulSetDetails
        )
        .then((res) => {
          this.codeYaml = res.data
          // console.log("edit dialog init", this.codeYaml);
          this.editDialogVisible = true // 打开编辑对话框
        })
        .catch((error) => {
          throw error
        })

      // json 格式
      this.$store
        .dispatch(
          'statefulSets/getStatefulSetByNameAndNamespace',
          statefulSetDetails
        )
        .then((res) => {
          // console.log(res);
          const json = JSON.stringify(res.data.cronJob)
          this.codeJSON = this.beautify(json, {
            indent_size: 4,
            space_in_empty_paren: true
          })
        })
        .catch((error) => {
          throw error
        })

      // this.editForm = res; // 查询结果写入表单
    },

    // 编辑器方法
    /* yaml */
    onYamlCmReady(cm) {
      setTimeout(() => {
        cm.refresh()
      }, 50)
    },
    onYamlCmCodeChange(newCode) {
      this.codeYaml = newCode
    },

    // 点击确认按钮触发此修改 StatefulSet 事件
    commitYamlChange() {
      this.$confirm('确认修改？', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      })
        .then(() => {
          this.$store
            .dispatch('common/changeResourceByYaml', this.codeYaml)
            .then((res) => {
              switch (res.code) {
                case 1200:
                  this.$message.success('修改成功')
                  break
                case 1201:
                  this.$message.error('修改失败，请查看 yaml 文件')
                  break
                case 1202:
                  this.$message.error('您的操作有误')
                  break
                default:
                  this.$message.info('提交成功')
                  break
              }
              this.editDialogVisible = false
            })
            .catch((error) => {
              throw error
            })
        })
        .catch(() => {
          console.log('cancel')
        })
    },

    // 关闭修改框
    handleClose: function() {
      this.addYaml = ''
      setTimeout(() => {
        this.codemorror.refresh()
      }, 1)
    },

    // 删除 CronJob
    delStatefulSet(name, namespace) {
      this.$confirm('确认删除 StatefulSet', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          const nameAndNamespace = {
            name: name,
            namespace: namespace
          }
          this.$store
            .dispatch(
              'statefulSets/deleteStatefulSetByNameAndNamespace',
              nameAndNamespace
            )
            .then((res) => {
              if (res.data) {
                this.$message.success('删除成功')
                this.getStatefulSets()
              } else {
                this.$message.error('删除失败')
              }
              // console.log(res.data);
            })
            .catch((error) => {
              console.log(error)
            })
        })
        .catch(() => {})
    },

    // 分页事件
    handleCurrentChange(currentPage) {
      this.currentPage = currentPage
      this.statefulSetsInCurrentPage = this.statefulSets.slice(
        (this.currentPage - 1) * this.pageSize,
        this.currentPage * this.pageSize
      )
    }
  }
}
</script>

<style lang="scss" scoped>
//el-table中资源表格和查找框的分割线
.el-table {
  margin: 15px 0px;
  border-top: 1px solid #ccc;
}

// 编辑窗底部命令提示信息
.foot-info {
  position: absolute;
  margin-bottom: 5px;
  padding: 5px 5px;
  background-color: #ccc;
  left: 0%;
  color: #606266;
  font-size: 15px;
}
</style>
