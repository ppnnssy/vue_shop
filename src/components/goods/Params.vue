<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 头部警告区域 -->
      <el-alert
        title="注意：只允许第三级分类设置相关参数"
        type="warning"
        show-icon
        :closable="false"
      >
      </el-alert>
      <!-- 选择商品分类区域 -->
      <el-row>
        <el-col>
          <span>选择商品分类：</span>
          <!-- 选择商品分类的级联选择框 -->
          <el-cascader
            clearable
            v-model="selectedCateKeys"
            :props="cateProps"
            :options="catelist"
            @change="handleChange"
          ></el-cascader>
        </el-col>
      </el-row>

      <!-- tab页签区域 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- 添加动态参数面板 -->
        <el-tab-pane label="动态参数" name="many">
          <el-button
            @click="addDialogVisible = true"
            type="primary"
            :disabled="isBtnDisabled"
            >添加参数</el-button
          >
          <!-- 动态参数表格 -->
          <el-table :data="manyTableData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template scope="scope">
                <!-- 循环渲染tag标签 -->
                <el-tag
                  closable
                  v-for="(item, i) in scope.row.attr_vals"
                  :key="i"
                  @close="handleClose(i, scope.row)"
                  >{{ item }}</el-tag
                >

                <!-- 点击输入新标签的按钮 -->
                <!-- @keyup.enter.native指按下enter事件 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button v-else size="small" @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"> </el-table-column>
            <el-table-column label="参数名称" prop="attr_name">
            </el-table-column>
            <el-table-column label="操作">
              <template scope="scope">
                <el-button type="primary" icon="el-icon-edit">编辑</el-button>
                <el-button
                  type="primary"
                  icon="el-icon-delete"
                  @click="removeParamsById(scope.row.attr_id)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 添加静态属性面板 -->
        <el-tab-pane label="静态属性" name="only">
          <el-button
            @click="addDialogVisible = true"
            type="primary"
            :disabled="isBtnDisabled"
            >添加属性</el-button
          >
          <!-- 静态参数表格 -->
          <el-table :data="onlyTableData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template scope="scope">
                <!-- 循环渲染tag标签 -->
                <el-tag
                  closable
                  v-for="(item, i) in scope.row.attr_vals"
                  :key="i"
                  @close="handleClose(i, scope.row)"
                  >{{ item }}</el-tag
                >

                <!-- 点击输入新标签的按钮 -->
                <!-- @keyup.enter.native指按下enter事件 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button v-else size="small" @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"> </el-table-column>
            <el-table-column label="属性名称" prop="attr_name">
            </el-table-column>
            <el-table-column label="操作">
              <template scope="scope">
                <el-button type="primary" icon="el-icon-edit">编辑</el-button>
                <el-button
                  type="primary"
                  icon="el-icon-delete"
                  @click="removeParamsById(scope.row.attr_id)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加参数和属性的共用对话框 -->
    <el-dialog
      :title="'添加' + titleText"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <!-- 验证表单 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 商品分类列表
      catelist: [],
      // 级联选择框的配置对象
      cateProps: {
        expandTrigger: "hover",
        value: "cat_id",
        label: "cat_name",
        children: "children",
      },
      // 级联选择框双向绑定的数组
      selectedCateKeys: [1, 3, 6],

      // 被激活的页签的名称,默认first。激活别的标签时会自动改变
      activeName: "many",

      // 动态参数数据
      manyTableData: [],
      // 静态属性的数据
      onlyTableData: [],
      // 控制添加对话框的显示和隐藏
      addDialogVisible: false,

      // 定义表单校验规则
      addForm: {
        attr_name: "",
      },
      addFormRules: {
        attr_name: [
          {
            required: true,
            message: `名称不能为空！`,
            trigger: "blur",
          },
        ],
      },
    };
  },
  created() {
    this.getCateList();
    this.getParamsData();
  },
  methods: {
    // 获取所有的商品分类列表
    async getCateList() {
      // 不用携带参数默认获取有所级别的分类且不分页
      const { data: res } = await this.$http.get("categories");

      this.catelist = res.data;
    },

    // 获取参数的列表数据
    async getParamsData() {
      // 如果选中的不是三级分类，直接清空数据并返回
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = [];
        this.manyTableData = [];
        this.onlyTableData = [];
        return;
      }
      // 根据所选分类的id，和当前所处的面板，获取对应的参数
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        {
          params: { sel: this.activeName },
        }
      );
      if (res.meta.status !== 200)
        return this.$message.error("请求分类参数失败！");
      // 如果是动态参数，就挂载到动态表格上

      // 返回值中的attr_vals是字符串，用空格分割。变成数组方便渲染页面

      res.data.forEach((item) => {
        // 判断字符串是否为空，如果是空，就返回空数组。否则分割
        // 这是因为直接分割，空字符串会分割成[""]，而不是[]
        item.attr_vals = item.attr_vals ? item.attr_vals.split(" ") : [];

        // 给每个item添加属性，为后面的+ New Tag标签提供自己的布尔值控制显示
        // 不能公用一个布尔值，否则会互相绑定
        item.inputVisible = false;
        item.inputValue = "";
      });
      // 再把attr_vals已经变成数组的数据保存下来
      if (this.activeName === "many") {
        this.manyTableData = res.data;
        console.log(this.manyTableData);
      } else {
        this.onlyTableData = res.data;
      }
    },

    // 级联选择框选中值变化会触发该函数
    handleChange() {
      this.getParamsData();
    },

    // 页签点击事件
    handleTabClick(tab, event) {
      // console.log(tab, event);
      // console.log(this.activeName);
      this.getParamsData();
    },
    // 监听对话框关闭事件
    addDialogClosed() {
      // 关闭时清空表单数据
      this.$refs.addFormRef.resetFields();
    },
    // 点击确定按钮发起添加属性请求
    addParams() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) {
          return;
        } else {
          const { data: res } = await this.$http.post(
            `categories/${this.cateId}/attributes`,
            {
              attr_name: this.addForm.attr_name,
              attr_sel: this.activeName,
            }
          );

          if (res.meta.status !== 201) {
            return this.$message.error("添加属性请求失败！");
          }
          this.$message.success("添加属性请求成功！");
          // 重新获取参数列表
          this.getParamsData();
          // 隐藏对话框
          this.addDialogVisible = false;
        }
      });
    },

    // 删除参数功能。这里后端查询语句出了问题，删除不了
    async removeParamsById(id) {
      // 弹框提示用户是否删除数据。使用的是element-ui自定的函数
      const confirmResult = await this.$confirm("是否删除该参数？", "提示", {
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
        `categories/${this.cateId}/attributes/${id}`
      );
      if (res.meta.status !== 200) {
        console.log(res);
        return this.$message.error("删除用户失败");
      }

      // 重新获取数据
      this.getParamsData();

      this.$message.success("删除用户成功");
    },
    // 文本框失去焦点和按下enter事件
    async handleInputConfirm(row) {
      // 如果没有数据，或数据不合法，直接清空数据
      // “trim() 方法用于删除字符串的头尾空白符,
      // 空白符包括:空格、制表符 tab、换行符等其他空白符等。”
      console.log(row.inputValue);
      if (row.inputValue.trim().length === 0) {
        row.inputValue = "";
        row.inputVisible = false;
        return;
      }
      // 如果文本框中有数据，发起添加属性请求
      row.attr_vals.push(row.inputValue.trim());

      const { data: res } = await this.$http.put(
        `categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: this.activeName,
          attr_vals: row.attr_vals.join(" "),
        }
      );

      console.log(res);
      if (res.meta.status !== 200) {
        return this.$message.error("修改参数项失败！");
      }
      this.$message.success("修改参数项成功！");
      row.inputValue = "";
      row.inputVisible = false;
    },

    // 点击按钮展示文本输入框
    showInput(row) {
      row.inputVisible = true;
      // 让文本框自动获得焦点
      // $nextTick当页面上元素被重新渲染之后才会执行回调函数中的代码
      // 防止渲染好之前就开始获得焦点导致报错
      this.$nextTick((_) => {
        // 后一个$refs是elementui封装的，用于获得原生input的
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },

    // 点击标签删除按钮事件
    async handleClose(i, row) {
      // splice(index,howmany,[item1...itemx...])方法，从数组index处开始，删除howmany个元素,将[item1...itemx...]添加到index位置
      // 从数据上先删除选定标签的内容
      row.attr_vals.splice(i, 1);
      // 用处理好的数据发起请求
      const { data: res } = await this.$http.put(
        `categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: this.activeName,
          attr_vals: row.attr_vals.join(" "),
        }
      );

      console.log(res);
      if (res.meta.status !== 200) {
        return this.$message.error("删除参数项失败！");
      }
      this.$message.success("删除参数项成功！");
    },
  },
  computed: {
    // 如果按钮需要被禁用，则返回true
    isBtnDisabled() {
      if (this.selectedCateKeys.length !== 3) {
        return true;
      }
      return false;
    },
    // 当前选中的三级分类的id
    cateId() {
      if (this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[2];
      }

      return null;
    },

    // 对话框标题
    titleText() {
      if (this.activeName === "many") return "动态参数";
      return "静态属性";
    },
  },
};
</script>

<style lang="less" scoped>
.el-alert {
  width: 50%;
  margin-bottom: 10px;
}
.el-tag {
  margin: 10px;
}
.input-new-tag {
  width: 150px;
}
</style>