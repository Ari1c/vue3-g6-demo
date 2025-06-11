<template>
    <div class="inline-select-group-list">
      <!-- 控制栏 -->
      <div class="control-bar">
        <div class="left-controls">
          <el-button type="text" @click="toggleExpandAll">
            {{ isAllExpanded ? '全部收起' : '全部展开' }}
          </el-button>
          <el-checkbox
            v-model="selectAllChecked"
            :indeterminate="selectAllIndeterminate"
            @change="handleGlobalSelectAll"
          >
            全选（{{ totalSelected }}/{{ totalSelectable }}）
          </el-checkbox>
        </div>
  
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="totalItems"
          :page-sizes="[5, 10, 20]"
          layout="total, sizes, prev, pager, next"
        />
      </div>
  
      <!-- 分组列表 -->
      <el-table
        :data="processedData"
        style="width: 100%;height: 400px"
        row-key="id"
        :tree-props="{ children: 'items', hasChildren: 'isGroup' }"
      >
        <!-- 选择列 -->
        <el-table-column width="60">
          <template #default="{ row }">
            <!-- <template v-if="!row.isGroup">
              <el-checkbox
                v-model="selectedKeys"
                :label="row.id"
                @click.stop="toggleGroupSelection(row)"
              />
            </template> -->
            <el-icon 
              v-if="row.isGroup"
              class="expand-icon"
              @click.stop="toggleGroupExpand(row)"
            >
              <component :is="row.expanded ? Fold : Expand" />
            </el-icon>
          </template>
        </el-table-column>
        <el-table-column type="selection" width="60" :selectable="checkSelectable"></el-table-column>

  
        <!-- 分组标题 -->
        <el-table-column prop="name" label="项目名称">
          <template #default="{ row }">
            <div v-if="row.isGroup" class="group-header">
              <span class="group-title">
                {{ row.name }}（{{ row.items.length }}项）
              </span>
              <!-- <el-checkbox
                v-model="groupAllSelectedMap[row.id]"
                :indeterminate="groupIndeterminateMap[row.id]"
                @click.stop="toggleGroupSelection(row)"
              /> -->
            </div>
            <span v-else class="item-name">{{ row.name }}</span>
          </template>
        </el-table-column>
  
        <el-table-column prop="type" label="类型" />
        <el-table-column prop="size" label="大小" width="120" />
      </el-table>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, watch } from 'vue'
  import { Expand, Fold } from '@element-plus/icons-vue'
  
  // 模拟数据
  const originalData = ref([
    {
      id: 'g1',
      name: '技术文档',
      isGroup: true,
      items: [
        { id: 'd1', name: 'Vue3指南.md', type: '文档', size: '2.3MB' },
        { id: 'd2', name: '架构设计.pdf', type: 'PDF', size: '5.1MB' }
      ]
    },
    {
      id: 'g2',
      name: '设计资源',
      isGroup: true,
      items: [
        { id: 'd3', name: 'UI规范.sketch', type: '设计稿', size: '8.4MB' },
        { id: 'd4', name: '图标库.zip', type: '压缩包', size: '12.2MB' }
      ]
    }
  ]) // 同前文数据结构

  const checkSelectable = row => {
    return !row.isGroup
  }
  
  // 状态管理
  const currentPage = ref(1)
  const pageSize = ref(5)
  const expandedGroups = ref(new Set())
  const selectedKeys = ref(new Set())
  
  // 计算属性
  const totalItems = computed(() => 
    originalData.value.reduce((acc, group) => acc + group.items.length + 1, 0)
  )
  
  // 处理后的分页数据
  const processedData = computed(() => {
    return originalData.value
      .flatMap(group => [
        { 
          ...group, 
          expanded: expandedGroups.value.has(group.id),
          items: group.items.map(item => ({ ...item, parentId: group.id }))
        },
        ...(expandedGroups.value.has(group.id) ? group.items : [])
      ])
      .slice(
        (currentPage.value - 1) * pageSize.value,
        currentPage.value * pageSize.value
      )
  })
  
  // 分组选择状态
  const groupAllSelectedMap = computed(() => {
    const map = {}
    originalData.value.forEach(group => {
      map[group.id] = group.items.every(item => 
        selectedKeys.value.has(item.id)
      )
    })
    return map
  })
  
  const groupIndeterminateMap = computed(() => {
    const map = {}
    originalData.value.forEach(group => {
      const hasSelected = group.items.some(item => 
        selectedKeys.value.has(item.id)
      )
      map[group.id] = hasSelected && !groupAllSelectedMap.value[group.id]
    })
    return map
  })
  
  // 全选状态
  const totalSelectable = computed(() =>
    originalData.value.reduce((acc, group) => acc + group.items.length, 0)
  )
  
  const totalSelected = computed(() => selectedKeys.value.size)
  
  const selectAllChecked = computed({
    get: () => totalSelected.value === totalSelectable.value,
    set: (val) => handleGlobalSelectAll(val)
  })
  
  const selectAllIndeterminate = computed(() =>
    totalSelected.value > 0 && totalSelected.value < totalSelectable.value
  )
  
  // 操作方法
  const toggleGroupExpand = (group) => {
    group.expanded
      ? expandedGroups.value.delete(group.id)
      : expandedGroups.value.add(group.id)
  }
  
  const toggleExpandAll = () => {
    isAllExpanded.value
      ? expandedGroups.value.clear()
      : originalData.value.forEach(g => expandedGroups.value.add(g.id))
  }
  
  const toggleGroupSelection = (group) => {
    const currentState = groupAllSelectedMap.value[group.id]
    group.items.forEach(item => {
      currentState 
        ? selectedKeys.value.delete(item.id)
        : selectedKeys.value.add(item.id)
    })
  }
  
  const handleGlobalSelectAll = (checked) => {
    originalData.value.forEach(group => {
      group.items.forEach(item => {
        checked 
          ? selectedKeys.value.add(item.id)
          : selectedKeys.value.delete(item.id)
      })
    })
  }
  
  // 监听分页变化
  watch(currentPage, () => {
    expandedGroups.value.clear()
  })
  
  // 样式相关计算
  const isAllExpanded = computed(() =>
    originalData.value.every(g => expandedGroups.value.add(g.id))
  )
  </script>
  
  <style scoped>
  .inline-select-group-list {
    border: 1px solid #ebeef5;
    border-radius: 4px;
    padding: 16px;
    background: white;
  }
  
  .control-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding: 8px 0;
  }
  
  .left-controls {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  
  .group-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  
  .expand-icon {
    cursor: pointer;
    margin-right: 8px;
    transition: transform 0.3s;
    &:hover {
      color: #409eff;
    }
  }
  
  .group-title {
    font-weight: 500;
    color: #303133;
  }
  
  .item-name {
    padding-left: 32px;
  }
  
  :deep(.el-table__row) {
    &.is-group-row {
      background: #f8f9fa;
      td {
        background: #f8f9fa;
      }
      .el-checkbox {
        margin-left: 8px;
      }
    }
    
    &:hover {
      td {
        background: #f5f7fa !important;
      }
    }
  }
  
  .el-checkbox {
    vertical-align: middle;
  }
  </style>