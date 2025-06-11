<template>
    <div>
      <el-table
        :data="displayData"
        style="width: 100%"
        @selection-change="handleSelectionChange">
        
        <el-table-column
          type="selection"
          width="55"
          v-if="allowRowSelection"
        />
        
        <el-table-column
          prop="name"
          label="姓名"
        />
        <el-table-column
          prop="language"
          label="语文"
        />
        <el-table-column
          prop="math"
          label="数学"
        />
        <el-table-column
          prop="english"
          label="英语"
        />
  
        <el-table-column
          label="操作"
          width="120">
          <template #default="scope">
            <el-button v-if="scope.row.type === 'group'" @click="toggleGroup(scope.row.groupName)">
              {{ scope.row.expanded ? '折叠' : '展开' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue';
  
  // Sample data structured with groups
  const data = ref([
    { type: 'group', groupName: '1组' },
    { type: 'data', name: '王五', language: 85, math: 100, english: 95, groupName: '1组' },
    { type: 'data', name: '侯六', language: 79, math: 88, english: 90, groupName: '1组' },
    { type: 'data', name: '李磊', language: 85, math: 71, english: 59, groupName: '1组' },
    { type: 'group', groupName: '2组' },
    { type: 'data', name: '苹梅', language: 99, math: 52, english: 97, groupName: '2组' },
    { type: 'data', name: '莉莉', language: 98, math: 91, english: 89, groupName: '2组' },
    { type: 'data', name: '鲁西', language: 100, math: 100, english: 100, groupName: '2组' },
  ]);
  
  const expandedGroups = ref({
    '1组': true,
    '2组': true,
  });
  
  const displayData = computed(() => {
    const result = [];
    data.value.forEach(item => {
      if (item.type === 'group') {
        item.expanded = expandedGroups.value[item.groupName];
        result.push(item);
      } else if (expandedGroups.value[item.groupName]) {
        result.push(item);
      }
    });
    return result;
  });
  
  const toggleGroup = (groupName) => {
    expandedGroups.value[groupName] = !expandedGroups.value[groupName];
  };
  
  const handleSelectionChange = (selection) => {
    console.log('Selected rows:', selection);
  };
  
  const allowRowSelection = computed(() => displayData.value.some(row => row.type === 'data'));
  
  </script>
  
  <style scoped>
  .el-table .el-button {
    margin: 0;
  }
  </style>
  