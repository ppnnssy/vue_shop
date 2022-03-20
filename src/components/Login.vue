<template>
  <div class="login_container">
    <div class="login_box">
      <!-- 图像区域 -->
      <div class="avatar_box">
        <img src="../assets/logo.png" />
      </div>

      <!-- 登录表单区域 -->
      <!-- 添加ref属性获取表单实例 添加:model绑定数据 :rules绑定验证规则 -->
      <el-form
        ref="loginFormRef"
        :rules="rules"
        :model="loginForm"
        label-width="0px"
        class="login_form"
      >
        <!-- 用户名 -->
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            prefix-icon="iconfont icon-user"
          ></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            prefix-icon="iconfont icon-3702mima"
            type="password"
          ></el-input>
        </el-form-item>
        <!-- 按钮 -->
        <el-form-item class="btns">
          <el-button @click="resetLoginForm">重置</el-button>
          <el-button type="primary" @click="login">登录</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      loginForm: { username: '', password: '' },
      // 添加数据验证规则
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 1, max: 8, message: '长度在 3 到 5 个字符', trigger: 'blur' },
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 16, message: '长度在6到16个字符', trigger: 'blur' },
        ],
      },
    };
  },
  methods: {
    // 点击按钮重置表单
    resetLoginForm() {
      // 使用ref内置的函数重置表单
      this.$refs.loginFormRef.resetFields();
      console.log(this);
    },
    // 点击登录
    login() {
      // 使用ref内设的表单预验证函数进行表单数据验证
      // 函数接收一个回调函数。验证数据成功返回true
      // 后面的await只能修饰async方法，所以修饰一下箭头函数
      this.$refs.loginFormRef.validate(async (valid) => {
        // 验证失败，结束处理
        if (!valid) return;
        // 验证成功,发送登录请求。携带loginForm的参数。返回值是一个promise对象。
        // 使用await简化promise,简化后只剩下结果的对象，重点关注里面的data值
        // 使用结构化赋值，把data赋值给res
        const { data: res } = await this.$http.post('login', this.loginForm);
        console.log('登录结果是:', res);
        if (res.meta.status !== 200) return this.$message.error('登录失败');
        this.$message.success('登录成功');

        // 登录成功后的处理
        // 1.将登陆成功后的token保存到客户端的sessionStorage中.token携带在res中
        console.log(res);
        window.sessionStorage.setItem('token', res.data.token);
        // 2.通过编程式导航对象跳转到登录成功页面，路由地址是/home
        this.$router.push('/home');
      });
    },
  },
};
</script>

<style lang="less" scoped>
.login_container {
  background-color: #2b4b6b;
  height: 100%;
}
.login_box {
  // 定位到屏幕中央
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 450px;
  height: 300px;
  background-color: #fff;
  border-radius: 3px;

  .avatar_box {
    position: relative;
    left: 50%;
    transform: translate(-50%, -50%);
    height: 130px;
    width: 130px;
    border: 1px solid #eee;
    border-radius: 50%;
    padding: 10px;
    box-shadow: 0 0 10px #ddd;
    background-color: #fff;
    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background-color: #eee;
    }
  }
}

.btns {
  display: flex;
  justify-content: flex-end;
}
.login_form {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
}
</style>
