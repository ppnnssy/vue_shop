<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <!-- 搜索区域 -->
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>

      <el-table :data="orderList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column
          width="200px"
          label="订单编号"
          prop="order_number"
        ></el-table-column>
        <el-table-column
          width="60px"
          label="订单价格"
          prop="order_price"
        ></el-table-column>
        <el-table-column width="100px" label="是否付款" prop="pay_status">
          <template scope="scope">
            <el-tag v-if="scope.row.pay_status === '1'">已付款</el-tag>
            <el-tag type="danger" v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          width="60px"
          label="是否发货"
          prop="is_send"
        ></el-table-column>
        <el-table-column width="200px" label="下单时间">
          <template scope="scope">
            {{ scope.row.create_time | dataFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template>
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-edit"
              @click="showBox"
            ></el-button>
            <el-button
              size="mini"
              type="success"
              icon="el-icon-location"
              @click="showProgressBox"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[10, 20, 30, 40]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>

    <!-- 修改地址对话框 -->
    <el-dialog title="修改地址" :visible.sync="addressVisible" width="50%">
      <el-form :model="addressForm" :rules="addressFormRules" ref="addressForm">
        <el-form-item label="省市区/县" prop="address1">
          <!-- 级联选择框 -->
          <el-cascader
            clearable
            v-model="addressForm.address1"
            :props="orderProps"
            :options="cityData"
            @change="handleChange"
          ></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addressForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addressVisible = false">取 消</el-button>
        <el-button type="primary" @click="addressVisible = false"
          >确 定</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
import cityData from "./citydata.js";
export default {
  data() {
    return {
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 10,
      },
      // 订单总数
      total: 0,
      orderList: [],

      // 修改地址对话框可见性
      addressVisible: false,
      // 地址数据对象
      addressForm: {
        address1: [],
        address2: "",
      },
      // 表单验证规则
      addressFormRules: {
        address1: [
          { required: true, message: "请选择省市区/县！", trigger: "blur" },
        ],
        address2: [
          { required: true, message: "请填写详细地址", trigger: "blur" },
        ],
      },
      // 城市数据
      cityData: cityData,
      // 级联选择框的配置对象
      orderProps: {
        expandTrigger: "hover",
      },
    };
  },
  created() {
    this.getOrderList();
  },
  methods: {
    // 获取订单列表
    async getOrderList() {
      const { data: res } = await this.$http.get("orders", {
        params: this.queryInfo,
      });

      if (res.meta.status !== 200) {
        return this.$message.error("获取订单列表失败！");
      }
      console.log("订单列表：", res);
      this.total = res.data.total;
      this.orderList = res.data.goods;
    },

    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getOrderList();
    },
    handleCurrentChange(newNum) {
      this.queryInfo.pagenum = newNum;
      this.getOrderList();
    },
    // 展示修改地址的对话框
    showBox() {
      this.addressVisible = true;
    },

    handleChange() {
      console.log(this.addressForm);
    },

    showProgressBox() {},
  },
  computed: {},
};
</script>

<style>
</style>