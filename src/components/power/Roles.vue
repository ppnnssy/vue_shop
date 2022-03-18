<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 使用栅格系统布局,添加角色按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary">添加角色</el-button>
        </el-col>
      </el-row>

      <!-- 角色列表区域 -->
      <el-table :data="rolelist" border stripe>
        <!-- 添加展开列 -->
        <el-table-column type="expand">
          <!-- 在展开列中使用作用域插槽 -->
          <template scope="scope">
            <el-row
              v-for="(item1, i1) in scope.row.children"
              :class="['bdbottom', i1 === 0 ? 'bdtop' : '', 'vcenter']"
              :key="item1.id"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="6">
                <el-tag @close="removeRightById(scope.row, item1.id)" closable>
                  {{ item1.authName }}</el-tag
                >
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="18">
                <!-- 通过for循环嵌套渲染二级权限 -->
                <el-row
                  :class="[i2 === 0 ? '' : 'bdtop', 'vcenter']"
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="6"
                    ><el-tag
                      type="success"
                      @close="removeRightById(scope.row, item2.id)"
                      closable
                    >
                      {{ item2.authName }}</el-tag
                    >
                    <i class="el-icon-caret-right"></i
                  ></el-col>

                  <!-- 渲染三级权限 -->
                  <el-col :span="18">
                    <el-tag
                      @close="removeRightById(scope.row, item3.id)"
                      closable
                      type="warning"
                      v-for="item3 in item2.children"
                      :key="item3.id"
                    >
                      {{ item3.authName }}</el-tag
                    >
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 添加索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              @click="editRoles(scope.row)"
              size="mini"
              >编辑</el-button
            >
            <el-button type="danger" size="mini" icon="el-icon-delete"
              >删除</el-button
            >
            <el-button
              size="mini"
              type="warning"
              icon="el-icon-setting"
              @click="showSetRightDialog(scope.row)"
              >分配权限</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 分配权限的对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="50%"
      @close="setRightDialogClosed"
    >
      <!-- 树形控件 -->
      <el-tree
        ref="treeRef"
        show-checkbox
        node-key="id"
        :data="rightList"
        default-expand-all
        :default-checked-keys="defaultCheckedKeys"
        :props="treeProps"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改角色对话框 -->
    <el-dialog
      title="编辑角色"
      @close="editDialogClosed"
      :visible.sync="editRoleDialogVisible"
      width="50%"
    >
      <!-- 内容主体区域 -->
      <el-form :model="editForm" ref="editFormRef" label-width="70px">
        <el-form-item label="角色名">
          <el-input v-model="editForm.roleName"></el-input>
        </el-form-item>

        <el-form-item label="角色描述" prop="email">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>

      <!-- 底部按钮区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRole">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 所有角色列表数据
      rolelist: [],

      // 控制对话框的显示和隐藏
      setRightDialogVisible: false,

      // 所有权限的数据
      rightList: [],

      //   用于树形控件的属性绑定对象
      treeProps: {
        children: "children",
        label: "authName",
      },

      // 默认选中的节点id值
      defaultCheckedKeys: [],

      //   保存用户id
      roleId: "",

      // 控制编辑角色对话框显示和隐藏
      editRoleDialogVisible: false,

      // 用于存储待编辑的角色信息
      role: {},
      // 获取表单输入值
      // roleName: "", roleDesc: ""
      editForm: {},
    };
  },
  created() {
    this.getRolesList();
  },
  methods: {
    // 获取所有角色的列表
    async getRolesList() {
      const { data: res } = await this.$http.get("roles");
      if (res.meta.status !== 200) {
        return this.$message.error("获取角色列表失败！");
      }
      // 保存到私有数据
      this.rolelist = res.data;
      //   console.log(this.rolelist);
    },

    //删除角色的某个权限，参数1角色信息，参数2权限id
    async removeRightById(role, id) {
      // 弹框提示用户是否删除

      // 弹框提示用户是否删除数据。使用的是element-ui自定的函数
      const confirmResult = await this.$confirm("是否删除该权限？", "提示", {
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
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${id}`
      );
      if (res.meta.status !== 200) {
        return this.$message.error("删除权限失败");
      }

      // 不要重新获取数据，会导致整个页面重新渲染
      // this.getRolesList();

      // 直接把返回的新的权限列表赋值给role，局部渲染
      role.children = res.data;

      this.$message.success("删除权限成功");
    },

    // 展示分配权限的对话框
    async showSetRightDialog(role) {
      // 先把role.id保存到私有数据中，别的函数要用，与本函数功能无关
      this.roleId = role.id;

      //   发起请求
      const { data: res } = await this.$http.get("rights/tree");
      if (res.meta.status !== 200) {
        return this.$message.error("获取权限失败");
      }
      //   把获取到的权限数据保存到私有数据中
      this.rightList = res.data;
      console.log(this.rightList);

      // 调用递归函数获取所有三级节点id，保存到defaultCheckedKeys
      this.getLeafKeys(role, this.defaultCheckedKeys);

      // 弹出对话框
      this.setRightDialogVisible = true;
    },

    // 定义一个递归函数获取所有三级节点的id，并保存到defaultCheckedKeys中
    getLeafKeys(node, arr) {
      // 如果当前节点不包含children属性，说明是三级节点
      if (!node.children) {
        return arr.push(node.id);
      }

      node.children.forEach((item) => {
        this.getLeafKeys(item, arr);
      });
    },

    // 监听分配权限对话框关闭事件
    setRightDialogClosed() {
      this.defaultCheckedKeys = [];
    },

    // 点击确定后为角色分配权限
    async allotRights() {
      // 保存所有被选中的节点的id值
      // 调用的函数是element-ui自带的，获取所有tree中的选中和半选中的节点
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys(),
      ];

      //   console.log(keys);
      // 根据后端接口参数要求，使用,拼接字符串
      const idStr = keys.join(",");
      //   console.log(idStr);

      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        { rids: idStr }
      );

      if (res.meta.status !== 200) {
        return this.$message.error("授权失败！");
      }
      this.$message.success("授权成功！");
      //   刷新数据列表
      this.getRolesList();

      this.setRightDialogVisible = false;
    },

    // 点击编辑角色信息
    editRoles(rolesInfo) {
      console.log(rolesInfo);
      this.role = rolesInfo;
      this.editForm = rolesInfo;
      this.editRoleDialogVisible = true;
    },

    // 监听修改角色对话框关闭事件
    editDialogClosed() {
      // 清空表单信息
      this.$refs.editFormRef.resetFields();
    },

    // 点击确定修改角色信息
    async saveRole() {
      const { data: res } = await this.$http.put(`roles/${this.role.id}`, {
        roleName: this.editForm.roleName,
        roleDesc: this.editForm.roleDesc,
      });

      console.log(res);
      if (res.meta.status !== 200) {
        return this.$message.error("修改角色信息失败！");
      }
      this.$message.success("修改角色信息成功！");

      this.getRolesList();
      this.editRoleDialogVisible = false;
    },
  },
};
</script>

<style lang="less" scoped>
* {
  margin: 0;
  padding: 0;
}
.el-tag {
  margin: 7px;
}

.bdbottom {
  border-bottom: 1px solid #eee;
}
.bdtop {
  border-top: 1px solid #eee;
}
// 用于纵向上居中对齐
.vcenter {
  display: flex;
  align-items: center;
}
</style>