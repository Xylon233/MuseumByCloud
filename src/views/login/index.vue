<!--
 * @Descripttion: your project
 * @version: 1.0
 * @Author: Rex Joush
 * @Date: 2021-03-10 15:03:17
 * @LastEditors: Rex Joush
 * @LastEditTime: 2021-03-22 17:27:37
-->
<template>
  <div class="login-container">
    <img class="img-top" src="../../assets/logo2.png" alt />
    <el-form
      ref="loginForm"
      :model="loginForm"
      :rules="loginRules"
      class="login-form"
      auto-complete="on"
      label-position="left"
    >
      <!-- <div class="title-container">
        <h3 class="title">Login Form</h3>
      </div> -->

      <div class="login-fram">
        <el-form-item prop="username">
          <span class="svg-container">
            <svg-icon icon-class="user" />
          </span>
          <el-input
            ref="username"
            v-model="loginForm.username"
            placeholder="Username"
            name="username"
            type="text"
            tabindex="1"
            auto-complete="on"
          >
          </el-input>
        </el-form-item>

        <el-form-item prop="password">
          <span class="svg-container">
            <svg-icon icon-class="password" />
          </span>
          <el-input
            :key="passwordType"
            ref="password"
            v-model="loginForm.password"
            :type="passwordType"
            placeholder="Password"
            name="password"
            tabindex="2"
            auto-complete="on"
            @keyup.enter.native="handleLogin"
          />
          <span class="show-pwd" @click="showPwd">
            <svg-icon
              :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'"
            />
          </span>
        </el-form-item>

        <el-button
          :loading="loading"
          type="primary"
          style="width: 100%; margin-bottom: 30px"
          @click.native.prevent="handleLogin"
          >登录</el-button
        >
      </div>

      <!-- <div class="tips">
        <span style="margin-right:20px;">username: admin</span>
        <span> password: any</span>
      </div> -->
    </el-form>
    <img class="img-bottom" src="../../assets/word.png" alt />
  </div>
</template>

<script>
import { validUsername } from "@/utils/validate";

export default {
  name: "Login",
  data() {
    return {
      loginForm: {
        username: "admin",
        password: "111111",
      },
      loginRules: {
        username: [
          { required: true, trigger: "blur", min: 5, max: 12 },
        ],
        password: [
          { required: true, trigger: "blur", min: 5, max: 12 },
        ],
      },
      loading: false,
      passwordType: "password",
      redirect: undefined,
    };
  },
  watch: {
    $route: {
      handler: function (route) {
        this.redirect = route.query && route.query.redirect;
      },
      immediate: true,
    },
  },
  methods: {
    showPwd() {
      if (this.passwordType === "password") {
        this.passwordType = "";
      } else {
        this.passwordType = "password";
      }
      this.$nextTick(() => {
        this.$refs.password.focus();
      });
    },

    handleLogin() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true
          this.$store.dispatch('user/login', this.loginForm)
            .then((res) => {
              console.log("Aaaa");
              console.log(res);
              this.$router.push({ path: this.redirect || '/' })
              // window.sessionStorage.setItem('Token', res.data.token);
              //     this.$message({
              //       duration: 1500,
              //       message: res.data.responseMessage,
              //       type: "success"
              //       });
              //     this.$router.push({ path: this.redirect || '/' })
              //     this.loading = false
            })
            .catch((err) => {
              throw err;
              console.log("Bbbb");
              this.loading = false
            })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },

    // handleLogin() {
    //   this.$refs.loginForm.validate((valid) => {
    //     if (valid) {
    //       this.loading = true;
    //       this.$store
    //         .dispatch("user/login", this.loginForm)
    //         .then(() => {
    //           this.$api.login(this.loginForm).then((res) => {
    //             // console.log(res.data.responseCode === 1200);
    //             if (res.data.responseCode === 1200) {
    //               // 存储 token
    //               window.sessionStorage.setItem('Token', res.data.token);
    //               this.$message({
    //                 duration: 1500,
    //                 message: res.data.responseMessage,
    //                 type: "success"
    //                 });
    //               this.$router.push({ path: this.redirect || '/' })
    //               this.loading = false
    //             } else {
    //               this.$message({
    //                 duration: 1500,
    //                 message: res.data.responseMessage,
    //                 type: "error"
    //                 });
    //               this.loading = false
    //             }

    //           });
    //         })
    //         .catch(() => {
    //           this.loading = false;
    //         });
    //     } else {
    //       console.log("error submit!!");
    //       return false;
    //     }
    //   });
    // },
  },
};
</script>

<style lang="scss">
/* 修复input 背景不协调 和光标变色 */
/* Detail see https://github.com/PanJiaChen/vue-element-admin/pull/927 */

$bg: #283443;
$light_gray: #fff;
$cursor: #fff;

@supports (-webkit-mask: none) and (not (cater-color: $cursor)) {
  .login-container .el-input input {
    color: $cursor;
  }
}

/* reset element-ui css */
.login-container {
  justify-content: center;
  display: flex;
  .img-top {
    top: 2%;
    position: absolute;
    opacity: 0.8;
  }
  .img-bottom {
    top: 55%;
    position: absolute;
    opacity: 0.8;
  }

  .el-input {
    display: inline-block;
    height: 47px;
    width: 85%;

    input {
      background: transparent;
      border: 0px;
      -webkit-appearance: none;
      border-radius: 0px;
      padding: 12px 5px 12px 15px;
      color: $light_gray;
      height: 47px;
      caret-color: $cursor;

      &:-webkit-autofill {
        box-shadow: 0 0 0px 1000px $bg inset !important;
        -webkit-text-fill-color: $cursor !important;
      }
    }
  }

  .el-form-item {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    color: #454545;
  }
}
</style>

<style lang="scss" scoped>
$bg: #2d3a4b;
$dark_gray: #889aa4;
$light_gray: #eee;

.login-container {
  min-height: 100%;
  width: 100%;
  background-color: $bg;
  overflow: hidden;
  .login-fram {
    position: relative;
    top: 5%;
  }
  .login-form {
    position: relative;
    width: 520px;
    max-width: 100%;
    padding: 160px 35px 0;
    margin: 0 auto;
    overflow: hidden;
  }

  .tips {
    font-size: 14px;
    color: #fff;
    margin-bottom: 10px;

    span {
      &:first-of-type {
        margin-right: 16px;
      }
    }
  }

  .svg-container {
    padding: 6px 5px 6px 15px;
    color: $dark_gray;
    vertical-align: middle;
    width: 30px;
    display: inline-block;
  }

  .title-container {
    position: relative;

    .title {
      font-size: 26px;
      color: $light_gray;
      margin: 0px auto 40px auto;
      text-align: center;
      font-weight: bold;
    }
  }

  .show-pwd {
    position: absolute;
    right: 10px;
    top: 7px;
    font-size: 16px;
    color: $dark_gray;
    cursor: pointer;
    user-select: none;
  }
}
</style>