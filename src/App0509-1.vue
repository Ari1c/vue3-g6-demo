<template>
    <div>
      <!-- 自动刷新勾选框 -->
      <el-checkbox v-model="isAutoRefresh">自动刷新</el-checkbox>
  
      <!-- 手动输入刷新间隔时间 -->
      <el-input
        v-model.number="refreshInterval"
        type="number"
        placeholder="请输入刷新间隔（毫秒）"
        style="width: 200px; margin-left: 20px;"
      >
        <template #append>毫秒</template>
      </el-input>
  
      <!-- 表格 -->
      <el-table :data="tableData" v-loading="loading" style="margin-top: 20px;">
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column prop="name" label="姓名"></el-table-column>
        <el-table-column prop="age" label="年龄"></el-table-column>
      </el-table>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, onBeforeUnmount, watch } from "vue";
  
  const loading = ref(false);
  const isAutoRefresh = ref(false); // 是否启用自动刷新
  const refreshInterval = ref(1000); // 刷新的时间间隔（默认为 30 秒）
  const tableData = ref([]); // 表格数据
  let refreshTimer = null; // 保存定时器的引用
  
  // 模拟获取表格数据的函数
  const fetchTableData = () => {
    loading.value = true;
    console.log("fetchTableData");
    // 模拟的网络请求数据
    tableData.value = [
      { id: 1, name: "张三", age: 25 },
      { id: 2, name: "李四", age: 30 },
      { id: 3, name: "王五", age: 28 },
    ];
    loading.value = false;
  };
  
  // 设置定时器进行数据刷新
  const startAutoRefresh = () => {
    stopAutoRefresh(); // 确保没有其他定时器运行
    if (isAutoRefresh.value) {
      refreshTimer = setInterval(() => {
        fetchTableData(); // 刷新数据
      }, refreshInterval.value);
    }
  };
  
  // 清除定时器
  const stopAutoRefresh = () => {
    if (refreshTimer) {
      clearInterval(refreshTimer);
      refreshTimer = null;
    }
  };
  
  // 当 isAutoRefresh 或 refreshInterval 变化时，重新启动定时器
  watch([isAutoRefresh, refreshInterval], () => {
    startAutoRefresh();
  });
  
  // 初始化组件时加载数据
  onMounted(() => {
    fetchTableData(); // 初始加载数据
    startAutoRefresh(); // 如果需要自动刷新，则启动定时器
  });
  
  // 销毁组件时清除定时器
  onBeforeUnmount(() => {
    stopAutoRefresh();
  });
  </script>
  
  <style>
  /* 示例样式 */
  </style>
  