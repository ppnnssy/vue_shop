<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>数据报表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 为echarts准备一个盒子 -->
      <div id="main" style="width: 600px; height: 400px"></div>
    </el-card>
  </div>
</template>

<script>
// 用来合并两个对象
import _ from "lodash";
export default {
  data() {
    return {
      // 需要合并的数据
      options: {
        title: {
          text: "用户来源",
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "cross",
            label: {
              backgroundColor: "#E9EEF3",
            },
          },
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: "3%",
          containLabel: true,
        },
        xAxis: [
          {
            boundaryGap: false,
          },
        ],
        yAxis: [
          {
            type: "value",
          },
        ],
      },
    };
  },

  //  页面加载完成后的生命周期函数，防止盒子还没加载出来echarts就开始渲染导致失败
  async mounted() {
    // 基于准备好的dom，初始化echarts实例
    let myChart = this.$echarts.init(document.getElementById("main"));
    // 发起数据请求
    const { data: res } = await this.$http.get("reports/type/1");
    if (res.meta.status !== 200) {
      this.$message.error("获取数据报表失败！");
    }

    // 准备数据对象.将两个对象合并
    const result = _.merge(res.data, this.options);
    // 使用刚指定的配置项和数据显示图表。
    myChart.setOption(result);
  },
  methods: {},
  computed: {},
};
</script>

<style lang="less" scoped>
</style>