<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片式图区域 -->
    <el-card>
      <!-- 搜索与添加区域，放到栅格系统中 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <!-- 搜索框 -->
          <el-input
            clearable
            placeholder="请输入内容"
            v-model="queryInfo.query"
            @clear="getUserList"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getUserList"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true"
            >添加用户</el-button
          >
        </el-col>
      </el-row>

      <!-- 用户列表区域 -->
      <el-table border stripe :data="userlist" style="width: 100%">
        <!-- 第一行是索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column
          prop="username"
          label="姓名"
          width="100"
        ></el-table-column>
        <el-table-column
          prop="email"
          label="邮箱"
          width="180"
        ></el-table-column>
        <el-table-column
          prop="mobile"
          label="电话"
          width="120"
        ></el-table-column>
        <el-table-column
          prop="role_name"
          label="角色"
          width="120"
        ></el-table-column>
        <el-table-column prop="mg_state" label="状态" width="180">
          <!-- 此处是Element ui封装好的作用域插槽。
          通过插槽传递过来的数据是上层el-table中的:data="userlist"
          .row是封装好的方法 -->
          <template scope="scope">
            <el-switch
              v-model="scope.row.mg_state"
              @change="userStateChanged(scope.row)"
            >
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="230">
          <template scope="scope">
            <!-- 修改按钮 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              @click="showEditDialog(scope.row.id)"
            ></el-button>
            <!-- 删除按钮 -->
            <el-button
              type="danger"
              @click="removeUserById(scope.row.id)"
              icon="el-icon-delete"
            ></el-button>
            <!-- 分配权限按钮,放到el-tooltip添加提醒文字 -->
            <el-tooltip
              class="item"
              effect="dark"
              content="分配角色"
              placement="top"
              :enterable="false"
            >
              <el-button
                @click="setRole(scope.row)"
                type="warning"
                icon="el-icon-setting"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>

    <!-- 添加用户的对话框 -->
    <el-dialog
      title="添加用户"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <!-- 内容主体区域 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="70px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>

      <!-- 底部按钮区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改用户对话框 -->
    <el-dialog
      title="修改用户"
      @close="editDialogClosed"
      :visible.sync="editDialogVisible"
      width="50%"
    >
      <!-- 内容主体区域 -->
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
        label-width="70px"
      >
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>

      <!-- 底部按钮区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配角色对话框 -->
    <el-dialog
      @close="setRoleDialogClosed"
      title="分配角色"
      :visible.sync="setRoleDialogVisible"
      width="50%"
    >
      <div>
        <p>当前用户:{{ userInfo.username }}</p>
        <p>当前角色:{{ userInfo.role_name }}</p>
        <p>
          分配新角色:
          <el-select v-model="selectedRoleId" placeholder="请选择">
            <el-option
              v-for="item in rolesList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id"
            >
            </el-option>
          </el-select>
        </p>
      </div>

      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    // 定义校验规则函数
    // 校验邮箱
    var checkEmail = (rule, value, callback) => {
      const regEmail =
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      if (regEmail.test(value)) {
        // 合法的邮箱
        return callback();
      }

      callback(new Error("请输入合法的邮箱！"));
    };
    // 校验手机号
    var checkMobile = (rule, value, callback) => {
      const regMobile =
        /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/;

      if (regMobile.test(value)) {
        // 合法的手机号
        return callback();
      }

      callback(new Error("请输入合法的手机号"));
    };

    return {
      // 先定义数据请求需要的参数
      queryInfo: {
        // 查询参数，可为空
        query: "",
        // 当前页码
        pagenum: 1,
        // 每页显示条目
        pagesize: 2,
      },
      // 控制添加用户时弹出对话框
      addDialogVisible: false,
      // 控制修改用户信息的对话框
      editDialogVisible: false,

      // 获取数据成功后，数据保存在此处
      // 用户列表
      userlist: [],
      // 总数据条数
      total: 0,
      // 添加用户的表单数据
      addForm: { username: "", password: "", email: "", mobile: "" },
      // 添加表单的验证规则对象
      addFormRules: {
        // 用户名的验证
        username: [
          {
            required: true,
            message: "请输入用户名",
            trigger: "blur",
          },
          {
            min: 3,
            max: 16,
            message: "用户名的长度在3~10个字符之间！",
            trigger: "blur",
          },
        ],
        // 密码校验规则
        password: [
          {
            required: true,
            message: "请输入密码",
            trigger: "blur",
          },
          {
            min: 6,
            max: 16,
            message: "密码的长度在3~10个字符之间！",
            trigger: "blur",
          },
        ],
        // 邮箱校验规则
        email: [
          {
            // 看看邮箱是否输入了
            required: true,
            message: "请输入邮箱",
            trigger: "blur",
          },
          {
            // 指定邮箱是否合法的校验规则
            validator: checkEmail,
            trigger: "blur",
          },
        ],
        // 手机校验规则
        mobile: [
          {
            required: true,
            message: "请输入手机号码",
            trigger: "blur",
          },
          {
            // 指定手机号是否合法的校验规则
            validator: checkMobile,
            trigger: "blur",
          },
        ],
      },

      // 查询到的用户信息对象,由网络请求的返回结果赋值
      editForm: {},

      editFormRules: {
        email: [
          {
            // 看看邮箱是否输入了
            required: true,
            message: "请输入邮箱",
            trigger: "blur",
          },
          {
            // 指定邮箱是否合法的校验规则
            validator: checkEmail,
            trigger: "blur",
          },
        ],
        // 手机校验规则
        mobile: [
          {
            required: true,
            message: "请输入手机号码",
            trigger: "blur",
          },
          {
            // 指定手机号是否合法的校验规则
            validator: checkMobile,
            trigger: "blur",
          },
        ],
      },

      // 控制分配角色对话框的显示和隐藏
      setRoleDialogVisible: false,

      // 个人数据，用于分配角色时向对话框传值
      userInfo: {},
      // 角色列表
      rolesList: [],

      // 已选中的角色id值。通过v-model绑定选择框
      selectedRoleId: "",
    };
  },

  created() {
    // 发起组件的数据请求
    this.getUserList();
  },

  methods: {
    async getUserList() {
      const { data: res } = await this.$http.get("users", {
        params: this.queryInfo,
      });

      // 如果数据获取失败
      if (res.meta.status !== 200)
        return this.$message.error("获取用户列表失败");
      console.log(res);

      // 注意此处每次数据改变时会重新渲染页面
      this.userlist = res.data.users;
      this.total = res.data.total;
    },

    // 监听pagesize改变的事件
    handleSizeChange(newSize) {
      // console.log(`每页 ${newSize} 条`);
      this.queryInfo.pagesize = newSize;

      // 重新发起请求
      this.getUserList();
    },
    // 监听翻页事件
    handleCurrentChange(newPage) {
      // console.log(`当前页: ${newPage}`);
      this.queryInfo.pagenum = newPage;
      // 重新发起请求
      this.getUserList();
    },
    // 监听用户状态的改变
    async userStateChanged(userInfo) {
      console.log(userInfo);
      const { data: res } = await this.$http.put(
        `users/${userInfo.id}/state/${userInfo.mg_state}`
      );
      console.log(res);
      if (res.meta.status !== 200) {
        userInfo.mg_state != userInfo.mg_state;
        return this.$message.error("更新用户状态失败！");
      }
      this.$message.success("更新用户状态成功！");
    },

    // 对话框关闭之后清空所有输入框中的内容
    addDialogClosed() {
      // console.log(this.$refs.addFormRef);
      // element-ui中为这个元素自带了一个清除内容函数，直接用就行了
      this.$refs.addFormRef.resetFields();
    },

    // 添加用户的 确定 按钮绑定函数
    addUser() {
      // validate是一个自带的校验函数，参数是一个回调函数。
      // 回调函数的参数是一个布尔值，通过为true
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return;
        // 后面开始发起网络请求添加用户
        // 把addForm作为参数直接发过去。因为是用v-model绑定的表单数据
        const { data: res } = await this.$http.post("users", this.addForm);
        // 添加失败
        console.log(res);
        if (res.meta.status !== 201) {
          this.$message.error("添加用户失败");
        }
        this.$message.success("添加用户成功");
        // 隐藏掉对话框
        this.addDialogVisible = false;
        // 重新获取用户列表
        this.getUserList();
      });
    },
    // 展示编辑用户的对话框
    async showEditDialog(id) {
      console.log(id);
      // 根据id发起请求，获取用户数据
      const { data: res } = await this.$http.get(`users/${id}`);
      // console.log(res);
      if (res.meta.status !== 200) {
        return this.$message.error("请求数据失败");
      }

      // 将查询出来的数据保存到editForm私有数据中
      this.editForm = res.data;

      this.editDialogVisible = true;
    },

    // 监听修改用户对话框的关闭事件
    editDialogClosed() {
      this.$refs.editFormRef.resetFields();
    },

    // 修改用户信息并提交
    editUserInfo() {
      // 先对表单信息进行预验证,valid布尔值是验证结果
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return;

        // 发起网络请求请求
        const { data: res } = await this.$http.put(
          `users/${this.editForm.id}`,
          {
            email: this.editForm.email,
            mobile: this.editForm.mobile,
          }
        );

        if (res.meta.status !== 200) {
          return this.$message.error("更新信息失败");
        }

        // 关闭对话框
        this.editDialogVisible = false;
        // 刷新数据列表
        this.getUserList();
        // 提示修改成功
        this.$message.success("更新用户信息成功");
      });
    },

    // 删除用户
    async removeUserById(id) {
      console.log(id);
      // 弹框提示用户是否删除数据。使用的是element-ui自定的函数
      const confirmResult = await this.$confirm("是否删除该用户？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).catch((err) => err);

      // console.log(confirmResult);
      // 用户点确定，返回字符串confirm。点取消需要跟catch函数处理,返回值为字符串cancel

      // 如果用户取消了删除
      if (confirmResult !== "confirm") {
        return this.$message.info("已取消删除操作");
      }

      // 点了确定之后开始删除操作
      const { data: res } = await this.$http.delete("users/" + id);
      if (res.meta.status !== 200) {
        return this.$message.error("删除用户失败");
      }

      // 重新获取数据
      this.getUserList();

      this.$message.success("删除用户成功");
    },

    //给用户分配角色，参数是用户信息
    async setRole(userInfo) {
      //  先把值保存到私有数据中
      this.userInfo = userInfo;

      // 获取角色列表
      const { data: res } = await this.$http.get("roles");
      if (res.meta.status !== 200) {
        return this.$message.error("获取角色列表失败！");
      }
      // 保存到私有数据中
      this.rolesList = res.data;

      // 弹出对话框
      this.setRoleDialogVisible = true;
    },

    // 点击确定按钮分配角色
    async saveRoleInfo() {
      if (!this.selectedRoleId) return this.$message.error("请选择一个角色！");
      const { data: res } = await this.$http.put(
        `users/${this.userInfo.id}/role`,
        { rid: this.selectedRoleId }
      );

      if (res.meta.status !== 200) return this.$message.error("分配角色错误！");

      this.$message.success("分配角色成功！");
      // 更新页面
      this.getUserList();
      // 隐藏对话框
      this.setRoleDialogVisible = false;
    },
    // 监听关闭分配角色对话框事件
    setRoleDialogClosed() {
      this.userInfo = {};
      this.selectedRoleId = "";
    },
  },
};
</script>

<style scoped lang="less">
</style>