<template>
  <el-container class="home-container">
    <!-- 头部区域 -->
    <el-header>
      <div>
        <img src="../assets/heima.png" alt="" />
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>

    <!-- 主体区域 -->
    <el-container>
      <!-- 侧边栏 -->

      <el-aside :width="isCollapse ? '64px' : '200px'">
        <div class="toggle-button" @click="toggle">|||</div>
        <!-- 侧边栏菜单,router为侧边栏开启路由模式 -->
        <el-menu
          :router="true"
          :collapse-transition="false"
          :collapse="isCollapse"
          :unique-opened="true"
          background-color="#333744"
          text-color="#fff"
          active-text-color="#409fff"
          :default-active="activePath"
        >
          <!-- 一级菜单 -->
          <!-- index只接受字符串，此处使用index防止所有菜单一起展开-->
          <el-submenu
            :index="item.id + ''"
            v-for="item in menulist"
            :key="item.id"
          >
            <!-- 一级菜单模板 -->
            <template slot="title" class="muban">
              <!-- 图标 -->
              <i :class="iconsObj[item.id]"></i>
              <!-- 文本 -->
              <span>{{ item.authName }}</span>
            </template>

            <!-- 二级菜单 -->
            <!-- index在导航栏开启vue-router模式后表示跳转地址  -->
            <el-menu-item
              :index="'/' + subItem.path"
              v-for="subItem in item.children"
              :key="subItem.id"
              @click="saveNavState('/' + subItem.path)"
            >
              <template slot="title">
                <!-- 图标 -->
                <i class="el-icon-menu"></i>
                <span>{{ subItem.authName }}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 右侧主体 -->
      <el-main>
        <!-- 路由占位符,显示Users组件 -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      // 左侧菜单数据，默认是空,通过请求后台数据赋值
      menulist: [],
      iconsObj: {
        125: "iconfont icon-user",
        103: "iconfont icon-tijikongjian",
        101: "iconfont icon-shangpin",
        102: "iconfont icon-danju",
        145: "iconfont icon-baobiao",
      },
      isCollapse: false,
      // 被激活的链接地址
      activePath: "",
    };
  },
  created() {
    // 获取所有左侧菜单
    this.getMenuList();

    //把已激活的链接地址赋值给activePath，使该链接高亮
    this.activePath = window.sessionStorage.getItem("activePath");
  },
  methods: {
    logout() {
      // 清空token
      window.sessionStorage.clear("token");
      // 通过编程式导航跳转到登录页
      this.$router.push("/login");
    },

    // 保存链接的激活状态
    saveNavState(activePath) {
      // 把点击的（点击就是已激活）链接地址保存到本地
      window.sessionStorage.setItem("activePath", activePath);
      // 赋值给本地数据，暂时性保存
      this.activePath = activePath;
    },

    // 从后台获取所有菜单数据
    async getMenuList() {
      // 通过后台接口获取所有菜单数据，通过解构赋值到res上
      const { data: res } = await this.$http.get("menus");
      // 如果获取失败，返回错误信息
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
      // 如果获取成功，进行赋值
      this.menulist = res.data;
    },
    toggle() {
      this.isCollapse = !this.isCollapse;
    },
  },
};
</script>

<style scoped lang='less'>
.el-header {
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  padding-left: 0px;
  align-items: center;
  color: white;
  font-size: 20px;

  div {
    display: flex;
    align-items: center;
    span {
      margin-left: 15px;
    }
  }
}
.el-aside {
  background-color: #333744;
  .toggle-button {
    width: 100%;
    color: white;
    text-align: center;
  }
  .el-menu {
    border-right: none;
  }
}
.el-main {
  background-color: #eaedf1;
}
.home-container {
  height: 100%;
}
</style>