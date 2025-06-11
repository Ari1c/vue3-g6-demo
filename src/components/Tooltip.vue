<!-- /**
 * desc: 文本超出显示省略号，并且显示tooltip
 * feat：支持自定义多行显示省略
 * usage：
 *  1、<myToolTip>显示文本</myToolTip>
 *  2、<myToolTip text="显示文本"></myToolTip>
 *  3、<myToolTip content="显示文本">显示文本</myToolTip>
 *  4、<myToolTip :lineNumber="3">显示文本</myToolTip>
 */ -->
<template>
  <el-tooltip
    popper-class="popper-box"
    v-bind="$attrs"
    :disabled="showTooltip"
    :placement="placement"
    :show-arrow="true"
  >
    <template #content>
        <div>
            <el-buton @click="handleFull(text)">全屏</el-buton>
        </div>
      <span v-if="content || text">{{ content || text }}</span>
      <span v-else><slot></slot></span>
    </template>
    <div
      class="text-ellipsis-multiple"
      :style="styleObj"
      @mouseenter.stop="onMouseEnter"
      :id="!showTooltip ? 'text' : ''"
    >
    <div>
        
        <slot>{{ text }}</slot>
    </div>
    </div>
  </el-tooltip>
  <el-dialog width="100%" v-model="dialogVisible" title="全屏展示" @close="handleColse">
    <pre style="overflow: auto;height: calc(100vh - 100px)">{{_text}}</pre>
  </el-dialog>
</template>
<script setup>
import { ref, defineProps, computed } from "vue";
const props = defineProps({
  text: String,
  placement: {
    type: String,
    default: "top",
  },
  content: String,
//默认超出一行省略
  lineNumber: {
    type: Number,
    default: 1,
  },
});
const _text = ref("")
const dialogVisible = ref(false);
const handleFull = val => {
    dialogVisible.value = true;
    _text.value = val
}
const handleColse = () => {
    dialogVisible.value = false;
    _text.value = ""
}

let styleObj = computed(() => {
  return { "-webkit-line-clamp": props.lineNumber };
});

let showTooltip = ref(true);

function onMouseEnter(e) {
  const dom = e.target;
  showTooltip.value = !(
    dom.offsetWidth < dom.scrollWidth || dom.offsetHeight < dom.scrollHeight
  );
}
</script>
<style>
.popper-box {
    max-width: 800px;
    max-height: 400px;
    min-width: 100px;
    min-height: 50px;
    overflow: visible;
}
</style>
<style scoped>

.text-ellipsis-multiple {
  font-size: 12px;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-all;
}
#text:hover {
  cursor: pointer;
}
</style>