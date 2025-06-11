<template>
    <div>
      <el-row>
        <el-col>
          <el-button @click="handleAdd">新增</el-button>
          <el-button :disabled="!editRow" @click="handleSave">保存</el-button>
          <el-button v-if="editRow" @click="handleCancel">取消</el-button>
        </el-col>
      </el-row>
      <el-table
        :data="visibleData"
        border
        style="width: 100%;height: calc(100vh - 100px);"
        row-key="id"
        :span-method="spanMethod"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" :selectable="selectable"></el-table-column>
        <el-table-column type="index" label="序号" width="80" :index="calcIndex"></el-table-column>
        <el-table-column prop="taskName" label="姓名" width="120">
          <template #default="scope">
            <div v-if="scope.row.isTitle">
              <div @click="toggle(scope.row)">
                <el-icon>
                  <component :is="scope.row.expand ? Expand : CaretRight" />
                </el-icon>
                &nbsp;
                <span>{{ scope.row.title }}</span>
              </div>
            </div>
            <div v-else @dblclick="handleEdit(scope.row, 'name')">
              <el-input
                v-if="isEditing(scope.row, 'name')"
                v-model="editCache.name"
                size="small"
                @blur="handleSave(scope.row, 'name')"
                :autofocus="true"
              />
              <span v-else>{{ scope.row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="taskRuntime" label="周期" width="120">
          <template #default="scope">
            <div v-if="!scope.row.isTitle" @dblclick="handleEdit(scope.row, 'taskRuntime')">
              <el-input
                v-if="isEditing(scope.row, 'taskRuntime')"
                v-model="editCache.taskRuntime"
                size="small"
                @blur="handleSave(scope.row, 'taskRuntime')"
              />
              <span v-else>{{ scope.row.taskRuntime }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="taskCommand" label="执行脚本" width="120">
          <template #default="scope">
            <div v-if="!scope.row.isTitle" @dblclick="handleEdit(scope.row, 'taskCommand')">
              <el-input
                v-if="isEditing(scope.row, 'taskCommand')"
                v-model="editCache.taskCommand"
                size="small"
                @blur="handleSave(scope.row, 'taskCommand')"
              />
              <span v-else>{{ scope.row.taskCommand }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="scope">
            <el-button
              v-if="!scope.row.isTitle && !editRow"
              size="small"
              type="danger"
              @click="handleDelete(scope.row)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </template>
  
  <script setup>
  import { Expand, CaretRight } from '@element-plus/icons-vue'
  import { ref, computed, onMounted, reactive } from 'vue'
  
  const flatData = ref([])
  const taskData = ref([])
  const visibleData = computed(() => {
    return flatData.value.filter(item => !item._hidden)
  })
  
  // 编辑状态相关
  const editRowKey = ref(null) // 当前正在编辑的row id
  const editColumnKey = ref('') // 当前正在编辑的列名
  const editCache = reactive({
    id: '',
    parentId: '',
    name: '',
    taskRuntime: '',
    taskCommand: '',
    isTitle: false,
    _hidden: false,
  })
  const isEditing = (row, column) => 
    editRowKey.value === row.id && editColumnKey.value === column
  
  // 展开/收起分组
  const toggle = row => {
    row.expand = !row.expand
    flatData.value.forEach(item => {
      if (item.parentId === row.id) {
        item._hidden = !row.expand
      }
    })
  }
  const selectable = row => !row.isTitle
  const calcIndex = index => {
    let count = 0
    for (let i = 0; i <= index; i++) {
      if (!visibleData.value[i].isTitle) {
        count++
      }
    }
    return count
  }
  const spanMethod = ({row, columnIndex}) => {
    if (row.isTitle) {
      if (columnIndex === 2) {
        return { rowspan: 1, colspan: 10 }
      } else {
        return { rowspan: 0, colspan: 0 }
      }
    }
  }
  
  // 获取初始数据
  const getList = () => {
    flatData.value = []
    taskData.value = []
    const res = Array(9).fill().map((__, i) => {
      return {
        id: '12345' + (i + 1),
        name: `测试账户${i % 2 ? i + 1 : i}`,
        taskRuntime: `0 30 09 L * ?`,
        taskCommand: ``,
      }
    })
    let projectNameArr = []
    for (let i = 0; i < res.length; i++) { 
      if (projectNameArr.indexOf(res[i].name) < 0) {
        projectNameArr.push(res[i].name)
        taskData.value.push({
          title: res[i].name,
          id: res[i].name,
          children: [],
        })
      }
    }
    for (let m = 0; m < res.length; m++ ) {
      for (let n = 0; n < taskData.value.length; n++) {
        if (res[m].name === taskData.value[n].title) {
          taskData.value[n].children.push(res[m])
          break;
        }
      }
    }
    const result = []
    taskData.value.forEach(group => {
      result.push({
        id: group.id,
        title: group.title,
        isTitle: true,
        expand: true
      })
      group.children.forEach(task => {
        result.push({
          ...task,
          parentId: group.id,
          isTitle: false,
          _hidden: false,
        })
      })
    })
    flatData.value = result;
  }
  onMounted(() => { 
    getList()
  })
  
  // 编辑逻辑
  function handleEdit(row, key) {
    editRowKey.value = row.id;
    editColumnKey.value = key;
    Object.assign(editCache, row);
  }
  function handleCancel() {
    editRowKey.value = null;
    editColumnKey.value = null;
  }
  function handleSave(row, key) {
    if (editRowKey.value !== row.id || editColumnKey.value !== key) return;
    row[key] = editCache[key];
    handleCancel();
  }
  function handleAdd() {
    // 默认加在第一个分组下
    const firstGroup = flatData.value.find(item => item.isTitle)
    if (!firstGroup) return
    const newId = `new_${Date.now()}`
    const newRow = {
      id: newId,
      parentId: firstGroup.id,
      name: '',
      taskRuntime: '',
      taskCommand: '',
      isTitle: false,
      _hidden: false,
    }
    // 插入到第一个分组后面
    const insertIndex = flatData.value.findIndex(item => item.id === firstGroup.id) + 1
    flatData.value.splice(insertIndex, 0, newRow)
  }
  function handleDelete(row) {
    const idx = flatData.value.findIndex(item => item.id === row.id)
    if (idx > -1) flatData.value.splice(idx, 1)
  }
  function handleSelectionChange() {}
  </script>
  
  <style lang="scss" scoped>
  </style>
  