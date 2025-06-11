<template>
    <div id="app">
      <h1>El-Table 高级功能示例 (Vue 3 Script Setup)</h1>
  
      <div class="actions">
        <el-button type="primary" @click="addNewRow">新增数据</el-button>
        <el-button type="success" @click="saveAll">保存所有修改</el-button>
        <el-button @click="logSelected">打印选中行</el-button>
      </div>
  
      <el-table
        :data="tableData"
        style="width: 100%"
        row-key="id"
        border
        :span-method="arraySpanMethod"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
  
        <el-table-column prop="group" label="区域" width="120">
          <template #default="{ row }">
            <span>{{ row.group }}</span>
          </template>
        </el-table-column>
  
        <el-table-column prop="name" label="姓名" width="180">
          <template #default="{ row, $index }">
            <div v-if="row.isEditing">
              <el-input v-model="row.name" @blur="handleSaveRowEdit(row, 'name', $index)" />
            </div>
            <div v-else @dblclick="toggleEdit(row, 'name')">
              <span>{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>
  
        <el-table-column prop="status" label="状态" width="150">
          <template #default="{ row, $index }">
            <div v-if="row.isEditing">
              <el-select
                v-model="row.status"
                placeholder="选择状态"
                @change="handleSaveRowEdit(row, 'status', $index)"
                @blur="row.isEditing = false"
              >
                <el-option label="活跃" value="active" />
                <el-option label="暂停" value="paused" />
                <el-option label="已删除" value="deleted" />
              </el-select>
            </div>
            <div v-else @dblclick="toggleEdit(row, 'status')">
              <span>{{ getStatusLabel(row.status) }}</span>
            </div>
          </template>
        </el-table-column>
  
        <el-table-column prop="city" label="城市" />
  
        <el-table-column label="操作" width="150">
          <template #default="{ row, $index }">
            <el-button size="small" type="danger" @click="deleteRow(row, $index)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </template>
  
  <script setup>
  import { ref, reactive, computed } from 'vue';
  import { ElMessage, ElMessageBox } from 'element-plus';
  import { v4 as uuidv4 } from 'uuid'; // 用于生成唯一ID，请安装：npm install uuid
  
  // 示例数据
  const initialData = [
    { id: uuidv4(), group: '华北', name: '张三', status: 'active', city: '北京', isEditing: false, isNew: false, isModified: false },
    { id: uuidv4(), group: '华北', name: '李四', status: 'paused', city: '天津', isEditing: false, isNew: false, isModified: false },
    { id: uuidv4(), group: '华东', name: '王五', status: 'active', city: '上海', isEditing: false, isNew: false, isModified: false },
    { id: uuidv4(), group: '华东', name: '赵六', status: 'active', city: '杭州', isEditing: false, isNew: false, isModified: false },
    { id: uuidv4(), group: '华南', name: '钱七', status: 'deleted', city: '广州', isEditing: false, isNew: false, isModified: false },
  ];
  
  // 使用 reactive 包装数据，使其具备响应性
  const tableData = reactive([...initialData]);
  const multipleSelection = ref([]); // 存储选中行的数据
  
  // --- 行选择功能 ---
  const handleSelectionChange = (val) => {
    // 当选中项发生变化时触发
    multipleSelection.value = val;
  };
  
  const logSelected = () => {
    // 打印当前选中的行
    console.log('Selected Rows:', multipleSelection.value);
    ElMessage.info(`选中了 ${multipleSelection.value.length} 条数据`);
  };
  
  // --- 行分组 (通过 span-method 模拟单元格合并) ---
  const arraySpanMethod = ({ row, column, rowIndex, columnIndex }) => {
    // 仅对 'group' 列 (columnIndex 为 1) 应用合并逻辑
    if (columnIndex === 1) {
      // 如果是第一行，或者当前行的 'group' 与上一行不同，则计算合并的行数
      if (rowIndex === 0 || row.group !== tableData[rowIndex - 1].group) {
        let rowSpan = 1;
        // 遍历后续行，计算相同 'group' 的连续行数
        for (let i = rowIndex + 1; i < tableData.length; i++) {
          if (tableData[i].group === row.group) {
            rowSpan++;
          } else {
            break; // 遇到不同组时停止
          }
        }
        return {
          rowspan: rowSpan, // 合并的行数
          colspan: 1,       // 合并的列数 (当前列不跨列)
        };
      } else {
        // 如果当前行的 'group' 与上一行相同，则隐藏当前单元格 (被上一个合并的单元格覆盖)
        return {
          rowspan: 0, // 隐藏
          colspan: 0, // 隐藏
        };
      }
    }
  };
  
  // --- 行内编辑功能 ---
  const toggleEdit = (row, field) => {
    // 在进入编辑模式前，确保其他行的编辑模式被关闭
    tableData.forEach(item => {
      if (item.id !== row.id) {
        item.isEditing = false;
      }
    });
    // 将当前行的 isEditing 状态设置为 true，进入编辑模式
    row.isEditing = true;
  };
  
  const handleSaveRowEdit = (row, field, index) => {
    // 实际应用中，这里会发送 API 请求到后端保存特定字段或整行数据
    console.log(`保存行 ${row.id}, 字段 ${field}: ${row[field]}`);
    ElMessage.success(`行数据 ${row.id} 的 ${field} 已更新为: ${row[field]}`);
    row.isEditing = false; // 保存后退出编辑模式
  
    // 如果不是新增行，则标记为已修改，以便后续批量保存
    if (!row.isNew) {
      row.isModified = true;
    }
  };
  
  // 获取状态的中文标签
  const getStatusLabel = (statusValue) => {
    const statusMap = {
      'active': '活跃',
      'paused': '暂停',
      'deleted': '已删除',
    };
    return statusMap[statusValue] || statusValue;
  };
  
  // --- 新增数据功能 ---
  const addNewRow = () => {
    const newRow = {
      id: uuidv4(),      // 为新行生成唯一ID
      group: '待分组',    // 新行的默认分组
      name: '新用户',     // 新行的默认姓名
      status: 'active',  // 新行的默认状态
      city: '待定',      // 新行的默认城市
      isEditing: true,   // 新行默认进入编辑模式，方便用户直接输入
      isNew: true,       // 标记为新增行
      isModified: false, // 新增行不需要额外标记为 modified
    };
    tableData.unshift(newRow); // 将新数据添加到数组的开头，使其显示在表格顶部
    ElMessage.success('已新增一条数据');
  };
  
  // --- 删除行功能 ---
  const deleteRow = (row, index) => {
    ElMessageBox.confirm(`确定要删除用户 "${row.name}" 吗？`, '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
      .then(() => {
        tableData.splice(index, 1); // 从数据数组中移除该行
        // 实际应用中，这里会发送 API 请求到后端删除数据
        ElMessage.success('删除成功！');
      })
      .catch(() => {
        ElMessage.info('已取消删除');
      });
  };
  
  // --- 保存所有修改的数据 (占位符) ---
  const saveAll = () => {
    // 过滤出所有新增或已修改的行
    const modifiedRows = tableData.filter(row => row.isModified || row.isNew);
  
    if (modifiedRows.length === 0) {
      ElMessage.info('没有检测到任何修改。');
      return;
    }
  
    console.log('保存所有修改/新增的行:', modifiedRows);
    // 实际应用中，你会将这个 'modifiedRows' 数组发送到你的后端 API
    // 例如: axios.post('/api/save-data', modifiedRows)
    // 成功保存后，你可能需要重置 isNew/isModified 标志
    modifiedRows.forEach(row => {
      row.isNew = false;
      row.isModified = false;
    });
  
    ElMessage.success(`成功保存 ${modifiedRows.length} 条数据！`);
  };
  </script>
  
  <style>
  #app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 60px;
    padding: 20px;
  }
  
  .actions {
    margin-bottom: 20px;
    display: flex;
    gap: 10px;
    justify-content: center;
  }
  
  /* 确保输入框和选择框在表格单元格内有合适的宽度 */
  .el-table .cell .el-input,
  .el-table .cell .el-select {
    width: 100%;
  }
  </style>