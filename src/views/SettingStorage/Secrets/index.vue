<!--
 * @Descripttion: your project
 * @version: 1.0
 * @Author: Anna667
 * @Date: 
 * @LastEditors: Anna
 * @LastEditTime: 2021-04-26 15:20:27
-->
<template>
  <div>
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>所有 密钥</span>
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
            @change="selectChange"
            @clear="clearSelect"
            @focus="initNamespace"
            placeholder="请选择命名空间"
          >
            <el-option
              v-for="item in namespaces"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
          <!-- 搜索按钮
            <el-button
              slot="append"
              size="large"
              icon="el-icon-plus"
              @click="getPods"
            ></el-button> -->
        </el-col>
      </el-row>
      <el-table 
      :data="currentSecrets" 
      style="width: 100%" 
      stripe
      v-loading="loading"
      element-loading-text="获取数据中..."
      >
        <!-- <el-table-column width="40">
          <template slot-scope="scope">
            <svg-icon :icon-class="scope.row.status.conditions[3].status == 'True'? 'load-success': scope.row.status.conditions[3].status == 'Unknown'?'load-doubt':'load-failed'"/>
          </template>
        </el-table-column> -->
        <el-table-column prop="metadata.name" label="名称">
          <template slot-scope="scope">
            <router-link 
            :to="'/SettingStorage/secrets/'+scope.row.metadata.name" 
            @click.native="
              goToSecretsDetails(
                scope.row.metadata.name,
                scope.row.metadata.namespace
                )
              " 
              class="link-type"
            >
              <span style="color:#409EFF;text-decoration:underline">{{ 
                scope.row.metadata.name 
              }}</span>
            </router-link>
          </template>
        </el-table-column>
        <el-table-column prop="metadata.namespace" label="命名空间"> </el-table-column>
        <!-- <el-table-column label="标签">
          <template slot-scope="scope">
            <span>k8s-app: {{scope.row.metadata.labels['k8s-app']}}</span>
            <br>
            <span>pod-template-hash: {{scope.row.metadata.labels['pod-template-hash']}}</span>
          </template>
        </el-table-column> -->
        <!-- <el-table-column prop="apiVersion" label="apiVersion"> </el-table-column> -->
        <!-- <el-table-column prop="kind" label="kind"> </el-table-column> -->
        <!-- <el-table-column prop="metadata.uid" label="uid"> </el-table-column> -->
        <!-- <el-table-column prop="spec.nodeName" width="140" label="所属节点"> </el-table-column>
        <el-table-column prop="status.podIP" width="140" label="主机ip地址"> </el-table-column> -->
        <el-table-column label="创建时间" width="200">
          <template slot-scope="scope">
            <span>{{scope.row.metadata.creationTimestamp.replaceAll(/[TZ]/g,' ')}}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <!-- 修改 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              style="margin-bottom:5px"
              size="small"
              @click="showSecretEditDialog(
                scope.row.metadata.name,
                scope.row.metadata.namespace
                )
              "
              >编辑</el-button
            >
            <br>
            <!-- 删除 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="small"
              @click="
              delSecret(
                scope.row.metadata.name,
                scope.row.metadata.namespace
                )
              "
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        background
        @current-change="handleSecretCurrentChange"
        :current-page="1"
        :page-size="6"
        layout="total, prev, pager, next, jumper"
        :total="totalSecret"
      >
      </el-pagination>
    </el-card>

    <!-- 编辑框 -->
    <el-dialog
      title="编辑 密钥"
      :visible.sync="editDialogVisible"
      width="70%"
      @closed="handleClose"
      @close="editDialogVisible = false"
      :append-to-body="true"
      :lock-scroll="true"
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
        <el-tab-pane label="JSON" name="second">
          <codemirror
            ref="cmYamlEditor"
            :value="codeJSON"
            :options="cmOptions"
            @ready="onJSONCmReady"
            @input="onJSONCmCodeChange"
          />
        </el-tab-pane>
      </el-tabs>

      <!-- <textarea style="width:100%" name="describe" id="pod" cols="30" rows="10">
        {{code}}
      </textarea> -->
      <span slot="footer" class="dialog-footer">
        <div class="foot-info">
          <i class="el-icon-warning"></i> 此操作相当于 kubectl apply -f
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
import "codemirror/mode/javascript/javascript.js";
import "codemirror/mode/yaml/yaml.js";
// import theme style
import "codemirror/theme/panda-syntax.css";

export default {
  name: "Secrets",

  data() {
    return {
      secrets: [],
      namespaces: [], // 命名空间选择框
      value: "", // 选择框的值
      loading: true, // 获取数据中
      editDialogVisible: false, // 编辑详情框
      codeJSON: "", // 编辑框的 json 数据
      codeYaml: "", // 编辑框的 yaml 数据

      currentSecrets: [],
      totalSecret: 0,

      cmOptions: {
        // json codemirror 配置项
        tabSize: 4,
        mode: {
          name: "javascript",
          json: true,
        },
        theme: "panda-syntax",
        lineNumbers: true,
        line: true,
      },
      cmOptionsYaml: {
        // yaml codemirror 配置项
        tabSize: 4,
        mode: "yaml",
        theme: "panda-syntax",
        lineNumbers: true,
        line: true,
      },
    };
  },

  mounted() {
    this.getSecrets();
  },

  methods: {
    // 处理命名空间分页
    handleSecretCurrentChange(page) {
      this.currentSecrets = this.secrets.slice((page - 1) * 6, page * 6);
    },

    // 编辑器方法
    /* yaml */
    onYamlCmReady(cm) {
      setTimeout(() => {
        cm.refresh();
      }, 50);
    },

    onYamlCmCodeChange(newCode) {
      this.codeYaml = newCode;
    },

    // 前往 secret 详情页
    goToSecretsDetails: function (secretName, secretNamespace) {
      // console.log("secrets index namespace", secretNamespace);
      let secretsDetails = {
        secretName: secretName,
        secretNamespace: secretNamespace
      }
      this.$store
        .dispatch("secrets/toDetails", secretsDetails);
    },

    // 获取所有 secrets
    getSecrets(namespace) { 
      this.$store
        .dispatch("secrets/getAllSecrets", namespace)
        .then((res) => {
          console.log(res);
          this.secrets = res.data;
          this.totalSecret = res.data.length;
          this.currentSecrets = res.data.slice(0, 6);
          this.loading = false;
        })
        .catch((error) => {
          console.log(error);
        });
    },

    /* 编辑部分 */
    showSecretEditDialog(name, namespace) {
      let secretsDetails = {
        secretName: name,
        secretNamespace: namespace,
      };

      // 获取 yaml 格式
      this.$store
        .dispatch(
          "secrets/getSecretYamlByNameAndNamespace",
          secretsDetails
        )
        .then((res) => {
          // console.log(res);
          // let json = JSON.stringify(res.data);
          // this.codeJSON = this.beautify(json, {
          //   indent_size: 4,
          //   space_in_empty_paren: true,
          // });
          this.codeYaml = res.data;
          this.editDialogVisible = true; // 打开编辑对话框
        })
        .catch((error) => {
          throw error;
        });
    },

    // 提交修改
    commitYamlChange() {
      this.$confirm("确认修改？", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "info",
      })
        .then(() => {
          this.$store
            .dispatch("common/changeResourceByYaml", this.codeYaml)
            .then((res) => {
              switch (res.code) {
                case 1200:
                  this.$message.success("修改成功");
                  break;
                case 1201:
                  this.$message.error("修改失败，请查看 yaml 文件格式");
                  break;
                case 1202:
                  this.$message.error("创建失败，请查看云平台相关错误信息");
                  break;
                default:
                  this.$message.info("提交成功");
                  break;
              }
              this.editDialogVisible = false;
            })
            .catch((error) => {
              throw error;
            });
        })
        .catch(() => {
          console.log("cancel");
        });
    },

    // 关闭修改框
    handleClose: function () {
      this.addYaml = "";
      setTimeout(() => {
        this.codemorror.refresh();
      }, 1);
    },

    /* 删除 Secret */
    delSecret: function (name, namespace) {
      this.$confirm("确认删除 密钥", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          let secretsDetails = {
            secretName: name,
            secretNamespace: namespace,
          };
          this.$store
            .dispatch(
              "secrets/delSecretByNameAndNamespace",
              secretsDetails
            )
            .then((res) => {
              if (res.code == 1200) {
                this.$message.success("删除成功");
                this.getSecrets();
              } else {
                this.$message.error("删除失败");
              }
            })
            .catch((error) => {
              throw error;
            });
        })
        .catch(() => {});
    },

    /* 按命名空间查询 */

    // 当选择框聚焦时获取命名空间
    initNamespace() {
      if (this.namespaces.length == 0) {
        this.namespaces = this.$store.state.namespaces.namespaces;
      }
    },
    // 选择框变化事件
    selectChange(value) {
      this.loading = true;
      this.getSecrets(value);
    },
    // 选择框清空事件
    clearSelect() {
      this.loading = true;
      this.getSecrets();
    },
  },
};
</script>


<style lang="scss" scoped>
// 底部命令提示信息
.foot-info {
  position: absolute;
  margin-bottom: 5px;
  padding: 5px 5px;
  background-color: #ccc;
  left: 0%;
  color: #606266;
  font-size: 15px;
}

.el-table {
  margin: 15px 0px;
  border-top: 1px solid #ccc;
}
</style>