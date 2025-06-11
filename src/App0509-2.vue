<template>
  <div>
    <el-table
      :data="displayData"
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55"></el-table-column>

      <el-table-column prop="name" label="姓名" width="120">
        <template #default="{ row }">
          <span v-if="row.type === 'group'">
            <el-button type="text" @click="toggleGroup(row.group)" icon="el-icon-arrow-down">
              {{ row.group }} (点击展开/折叠)
            </el-button>
          </span>
          <span v-else>{{ row.name }}</span>
        </template>
      </el-table-column>

      <el-table-column prop="chinese" label="语文" width="120"></el-table-column>
      <el-table-column prop="math" label="数学" width="120"></el-table-column>
      <el-table-column prop="english" label="英语" width="120"></el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

// 原始数据
const rawData = [
  { id: 1, name: '张杰', chinese: 45, math: 56, english: 98, group: '1组' },
  { id: 2, name: '张三', chinese: 45, math: 82, english: 91, group: '1组' },
  { id: 3, name: '李四', chinese: 89, math: 68, english: 98, group: '1组' },
  { id: 4, name: '王五', chinese: 59, math: 85, english: 100, group: '1组' },
  { id: 5, name: '侯六', chinese: 85, math: 71, english: 89, group: '1组' },
  { id: 6, name: '李喆', chinese: 85, math: 71, english: 59, group: '1组' },
  { id: 7, name: '韩梅', chinese: 99, math: 52, english: 97, group: '2组' },
  { id: 8, name: '莉莉', chinese: 96, math: 61, english: 86, group: '2组' },
  { id: 9, name: '鲁西', chinese: 100, math: 63, english: 45, group: '2组' }
]

const groupState = ref({}) // 存储折叠/展开状态

// 初始化组状态
rawData.forEach(item => {
  if (!groupState.value[item.group]) {
    groupState.value[item.group] = true // 默认为展开状态
  }
})

// 根据折叠状态计算显示数据
const displayData = computed(() => {
  const result = []
  const groupedData = {}

  // 按组分类
  rawData.forEach(item => {
    if (!groupedData[item.group]) {
      groupedData[item.group] = []
    }
    groupedData[item.group].push(item)
  })

  // 创建显示数据
  for (const group in groupedData) {
    result.push({
      type: 'group',
      group: group
    })

    if (groupState.value[group]) {
      result.push(...groupedData[group])
    }
  }

  return result
})

const toggleGroup = group => {
  groupState.value[group] = !groupState.value[group]
}

const handleSelectionChange = selection => {
  console.log('Selected Rows:', selection)
  ElMessage.info(`Selected ${selection.length} rows`)
}
</script>
