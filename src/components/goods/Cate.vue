<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 添加分类按钮 -->
      <el-row class="addButton">
        <el-col>
          <el-button type="primary" @click="showAddCateDialog"
            >添加分类</el-button
          >
        </el-col>
      </el-row>

      <!-- 主体表格区域 -->
      <tree-table
        show-index
        index-text=""
        :border="true"
        :expand-type="false"
        :data="cateList"
        :selection-type="false"
        :columns="columns"
      >
        <!-- 是否有效 -->
        <template slot="isok" slot-scope="scope">
          <i
            class="el-icon-success"
            v-if="scope.row.cat_deleted"
            style="color: lightgreen"
          ></i>
          <i
            class="el-icon-error"
            v-if="!scope.row.cat_deleted"
            style="color: red"
          ></i>
        </template>

        <!-- 排序 -->
        <template slot="order" scope="scope">
          <el-tag v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag type="success" v-else-if="scope.row.cat_level === 1"
            >二级</el-tag
          >
          <el-tag type="warning" v-else>三级</el-tag>
        </template>

        <!-- 操作 -->
        <template slot="operation">
          <el-button size="mini" type="primary" icon="el-icon-edit"
            >编辑</el-button
          >
          <el-button size="mini" type="danger" icon="el-icon-delete"
            >删除</el-button
          >
        </template>
      </tree-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>

    <!-- 添加分类的对话框 -->
    <el-dialog
      @close="addCateDialogClosed"
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
    >
      <!-- 添加分类的表单 -->
      <el-form
        :model="addCateForm"
        ref="addCateFormRef"
        label-width="100px"
        :rules="addCateFormRules"
        class="demo-ruleForm"
      >
        <el-form-item label="活动名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <!-- 级联选择器 -->
          <div class="block">
            <el-cascader
              clearable
              v-model="selectedKeys"
              :options="parentCateList"
              :props="cascaderProps"
              @change="parentCateChange"
            ></el-cascader>
          </div>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 商品分类的数据列表，通过请求数据赋值
      cateList: [],

      // 查询商品列表的参数
      queryInfo: {
        // 查询级别
        type: 3,
        // 分页参数
        pagenum: 1,
        pagesize: 5,
      },

      // 商品总数
      total: 0,

      //   为table指定列的定义
      columns: [
        {
          label: "分类名称",
          prop: "cat_name",
        },
        {
          label: "是否有效",
          //   将当前列定义为模板列
          type: "template",
          //   表示当前这一列使用的模板名称
          template: "isok",
        },
        {
          label: "排序",
          type: "template",
          template: "order",
        },
        {
          label: "操作",
          type: "template",
          template: "operation",
        },
      ],

      // 控制添加分类的对话框出现
      addCateDialogVisible: false,
      // 添加分类的表单数据对象
      addCateForm: {
        // 将要添加的分类名称
        cat_name: "",
        // 父类id
        cat_pid: 0,
        // 分类等级，默认添加的是1级分类
        cat_level: 0,
      },
      // 添加分类的表单验证规则
      addCateFormRules: {
        cat_name: [
          {
            required: true,
            message: "请输入分类名称！",
            trigger: "blur",
          },
        ],
      },

      // 父级分类的列表数组
      parentCateList: [],

      // 指定级联选择器的配置对象
      cascaderProps: {
        // 允许选中任意节点，而不是只能选叶子结点
        checkStrictly: true,
        // 展开方式为鼠标放上就展开
        expandTrigger: "hover",
        // 值
        value: "cat_id",
        label: "cat_name",
        children: "children",
      },
      // 选择好的父级对象的值
      selectedKeys: [],
    };
  },
  created() {
    // 获取商品分类列表
    this.getCateList();
  },
  methods: {
    // 获取商品分类列表的函数
    async getCateList() {
      // 发起请求
      const { data: res } = await this.$http.get("categories", {
        params: this.queryInfo,
      });
      if (res.meta.status !== 200)
        return this.$message.error("查询商品列表失败！");
      console.log(res);

      // 请求获得的数据保存到本地数据
      this.cateList = res.data.result;
      this.total = res.data.total;
      console.log(this.total);
    },

    // 监听pagesize改变的事件
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getCateList();
    },
    // 监听pageNum的改变
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getCateList();
    },
    // 控制添加分类的表单
    showAddCateDialog() {
      // 获取父级分类列表
      this.getParentCateList();
      this.addCateDialogVisible = true;
    },
    // 获取父级分类的数据列表
    async getParentCateList() {
      // 请求前两级的分类
      const { data: res } = await this.$http.get("categories", {
        params: { type: 2 },
      });

      if (res.meta.status !== 200) {
        return this.$message.error("获取父级分类的数据列表失败！");
      }

      console.log(res.data);
      this.parentCateList = res.data;
    },

    // 父级分类选择改变
    parentCateChange() {
      console.log(this.selectedKeys);

      // 每当父级分类选择器发生变化， addCateForm的值要做相应的修改
      // 如果选了值
      if (this.selectedKeys.length > 0) {
        // 父级分类id是parentCateList的最后一项
        this.addCateForm.cat_pid =
          this.selectedKeys[this.selectedKeys.length - 1];
        // 等级刚好是长度
        this.addCateForm.cat_level = this.selectedKeys.length;
      } else {
        // 如果没有选值
        this.addCateForm.cat_pid = 0;
        this.addCateForm.cat_level = 0;
      }
    },

    // 点击按钮添加新的分类
    addCate() {
      console.log(this.addCateForm);
      // 表单数据预校验。内置函数不用理解
      this.$refs.addCateFormRef.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.$http.post(
          "categories",
          this.addCateForm
        );
        console.log(res);
        if (res.meta.status !== 201) {
          return this.$message.error("添加分类失败！");
        }

        this.$message.success("添加分类成功！");
        this.getCateList();
        this.addCateDialogVisible = false;
      });
    },

    // 添加分类对话框关闭事件
    addCateDialogClosed() {
      // 重置表单
      this.$refs.addCateFormRef.resetFields();
      // 级联选择器中的数据要单独清空一次
      this.selectedKeys = [];
      // 重置已选择未确定的数据
      this.addCateForm = {
        // 将要添加的分类名称
        cat_name: "",
        // 父类id
        cat_pid: 0,
        // 分类等级，默认添加的是1级分类
        cat_level: 0,
      };
    },
  },
};
</script>

<style lang="less" scoped>
.el-cascader {
  width: 100%;
}
.addButton {
  margin-bottom: 10px;
}
</style>