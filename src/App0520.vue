<template>
    <div class="ultimate-group-list">
      <!-- 模式切换 & 控制栏 -->
      <div class="control-bar">
        <div class="left-controls">
          <el-radio-group v-model="selectionMode" @change="clearSelection">
            <el-radio-button label="single">单选模式</el-radio-button>
            <el-radio-button label="multiple">多选模式</el-radio-button>
          </el-radio-group>
          
          <el-button
            v-if="selectionMode === 'multiple'"
            type="text"
            @click="toggleExpandAll"
          >
            {{ isAllExpanded ? '收起全部' : '展开全部' }}
          </el-button>
        </div>
  
        <div class="right-controls">
          <el-checkbox
            v-if="selectionMode === 'multiple'"
            v-model="selectPageAll"
            :indeterminate="isPageIndeterminate"
            @change="handlePageSelectAll"
          >
            全选本页
          </el-checkbox>
          <span class="selected-count">
            已选 {{ selectionSummary }}
          </span>
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="totalItems"
            :page-sizes="[5, 10, 20]"
            layout="total, sizes, prev, pager, next"
          />
        </div>
      </div>
  
      <!-- 列表主体 -->
      <el-table
        :data="processedData"
        row-key="id"
        :tree-props="{ children: 'items', hasChildren: 'isGroup' }"
        @select="handleSelection"
        @select-all="handleSelectAll"
        @row-click="handleRowClick"
      >
        <!-- 选择控制列 -->
        <el-table-column 
          :type="selectionColumnType"
          width="60"
          :selectable="checkSelectable"
        >
          <template #header>
            <el-checkbox
              v-if="selectionMode === 'multiple'"
              :model-value="isAllSelected"
              :indeterminate="isAnySelected"
              @change="handleGlobalSelectAll"
            />
          </template>
  
          <template #default="{ row }">
            <el-radio 
              v-if="selectionMode === 'single' && !row.isGroup"
              :model-value="selectedId"
              :label="row.id"
              @click.stop="handleSingleSelect(row)"
            />
          </template>
        </el-table-column>
  
        <!-- 分组标题列 -->
        <el-table-column prop="name" label="项目名称" width="300">
          <template #default="{ row }">
            <div v-if="row.isGroup" class="group-header">
              <el-icon 
                class="expand-icon"
                :size="16"
                @click.stop="toggleGroupExpand(row)"
              >
                <component :is="row.expanded ? Fold : Expand" />
              </el-icon>
              <span class="group-title">
                {{ row.name }} ({{ row.items.length }}项)
              </span>
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
  ])
  
  // 状态管理
  const selectionMode = ref('single') // 选择模式
  const currentPage = ref(1)         // 当前页码
  const pageSize = ref(5)            // 每页数量
  const expandedGroups = ref(new Set()) // 展开的分组
  const selectedId = ref(null)       // 单选选中ID
  const selectedKeys = ref(new Set()) // 多选选中ID集合
  
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
  
  // 当前页所有可选项ID（排除分组行）
  const currentPageIds = computed(() => 
    processedData.value
      .filter(item => !item.isGroup)
      .map(item => item.id)
  )
  
  // 选择状态计算
  const isAllSelected = computed(() =>
    originalData.value.every(group =>
      group.items.every(item => selectedKeys.value.has(item.id))
  ))
  
  const isAnySelected = computed(() => selectedKeys.value.size > 0)
  const selectionSummary = computed(() =>
    selectionMode.value === 'single' 
      ? selectedId.value ? 1 : 0 
      : selectedKeys.value.size
  )
  
  // 选择控制方法
  const handleSingleSelect = (row) => {
    selectedId.value = selectedId.value === row.id ? null : row.id
  }
  
  const handleSelection = (selection, row) => {
    if (row.isGroup) return
    selection.includes(row) 
      ? selectedKeys.value.add(row.id)
      : selectedKeys.value.delete(row.id)
    updatePageSelectionState()
  }
  
  const handleGlobalSelectAll = (checked) => {
    originalData.value.forEach(group => {
      group.items.forEach(item => {
        checked ? selectedKeys.value.add(item.id) 
                : selectedKeys.value.delete(item.id)
      })
    })
  }
  
  const handlePageSelectAll = (checked) => {
    currentPageIds.value.forEach(id => 
      checked ? selectedKeys.value.add(id) : selectedKeys.value.delete(id)
    )
    updatePageSelectionState()
  }
  
  // 分组展开控制
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
  
  // 辅助方法
  const updatePageSelectionState = () => {
    const selectedInPage = currentPageIds.value.filter(id => 
      selectedKeys.value.has(id)
    )
    selectPageAll.value = selectedInPage.length === currentPageIds.value.length
    isPageIndeterminate.value = selectedInPage.length > 0 && 
                               selectedInPage.length < currentPageIds.value.length
  }
  
  const clearSelection = () => {
    selectedId.value = null
    selectedKeys.value.clear()
  }
  
  const checkSelectable = (row) => !row.isGroup
  
  // 监听器
  watch(currentPage, () => {
    selectPageAll.value = false
    isPageIndeterminate.value = false
    
    if (selectionMode.value === 'single' && 
        !currentPageIds.value.includes(selectedId.value)) {
      selectedId.value = null
    }
  })
  
  // 样式相关计算
  const selectionColumnType = computed(() => 
    selectionMode.value === 'multiple' ? 'selection' : 'default'
  )
  
  const isAllExpanded = computed(() =>
    originalData.value.every(g => expandedGroups.value.has(g.id))
)
  </script>
  
  <style scoped>
  .ultimate-group-list {
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
  
  .right-controls {
    display: flex;
    align-items: center;
    gap: 24px;
  }
  
  .group-header {
    display: flex;
    align-items: center;
    cursor: pointer;
    user-select: none;
  }
  
  .expand-icon {
    margin-right: 8px;
    transition: transform 0.3s;
    cursor: pointer;
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
  
  .selected-count {
    color: #606266;
    font-size: 14px;
  }
  
  :deep(.el-table__row) {
    &.is-group-row {
      background: #f8f9fa;
      td {
        background: #f8f9fa;
      }
    }
    
    &:hover {
      td {
        background: #f5f7fa !important;
      }
    }
  }
  
  .el-pagination {
    padding: 0;
  }
  </style>