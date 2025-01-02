<template>
  <div class="link-topology-container">
      <div class="topology-container">
          <div :class="['link-topology', isFullscreen ? 'fullScreen' : '']" id="link-topology-parent" v-loading="loading">
              <div v-show="hasData" id="link-topology">
              </div>
              <el-empty v-show="!hasData" class="no-data" description="暂无数据"></el-empty>
          </div>
      </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick, watch } from 'vue';
import G6 from '@antv/g6';
import _ from 'lodash';

import cloudImg from "./assets/vue.svg"

const isFullscreen = ref(false);
const loading = ref(false);
let linkGraph;
const hasData = ref(false);

const initGraph = (data) => {
  customRegisterFn()
  nextTick(() => {
      const container = document.getElementById('link-topology-parent');
      if (container) {
          const width = container.scrollWidth;
          const height = container.scrollHeight - 20 || window.innerHeight - 200;
          linkGraph = new G6.Graph({
              container: 'link-topology',
              width,
              height,
              enabledStack: true,
              // fitView: true,
              fitCenter: true,
              linkCenter: true,
              // fitViewPadding: 20,
              modes: {
                  default: ['drag-canvas', 'zoom-canvas']
              },
              defaultNode: {
                  type: 'default-img',
                  anchorPoints: [[0.5, 0.5]],
                  size: [50, 50],
                  labelCfg: {
                      position: 'bottom',
                      offset: 12,
                  }
              },
              defaultEdge: {
                  type: 'cubic-horizontal',
                  style: {
                      endArrow: true,
                      lineWidth: 1,
                      stroke: '#CED4D9'
                  }
              },
              defaultCombo: {
                  type: 'rect',
                  padding: [40, 90, 30, 90],
                  labelCfg: {
                      style: {
                          position: 'top',
                          fontSize: 18,
                          fill: '#111',

                      }
                  },
              },
          })
          linkGraph?.data(data);
          linkGraph?.render();
          linkGraph?.fitView();

          eventListeners();

          if (typeof window !== 'undefined') {
              window.onresize = () => {
                  if (!linkGraph || linkGraph.get('destroyed')) return;
                  if (!container.scrollWidth || !container.scrollHeight || !container.scrollWidth) return;
                  linkGraph.changeSize(container.scrollWidth, container.scrollHeight - 20 || window.innerHeight - 20);
              };
          }
      }
  })
}

const eventListeners = () => {
  linkGraph?.on('afterrender', () => {
      loading.value = false
  })
  linkGraph?.on('node:click', (e) => {
      console.log(e)
  })
}

const customRegisterFn = () => {
  G6.registerNode('default-img', {
      draw(cfg, group) {
          const { x, y } = cfg;
          const keyShape = group.addShape('image', {
              attrs: {
                  x:  -20,
                  y: -20,
                  width: 40,
                  height: 40,
                  img: cloudImg
              }
          })
          group?.addShape('text', {
              attrs: {
                  text: cfg.id,
                  x: 0,
                  y: 30,
                  fill: '#000',
                  fontSize: 12,
                  textAlign: 'center',
                  textBaseline: 'middle'
              },
              name: 'text-shape'
          })
          return keyShape
      }
  }, 'image-shape')
}

const getData = () => {
  hasData.value = false
  loading.value = true
  const linkData = [{
      distInstance: {
          id: '0691/dcsp-chaos-bu02/dcsp-unvs-pymt',
          instances: [],
          name: 'dcsp-unvs-pymt',
          sysId: '0691',
          unit: 'dcsp-chaos-bu02'
      },
      srcInstance: {
          id: '0691/dcsp-chaos-bu01/dcsp-ocp-callservicebu',
          instances: [],
          name: 'dcsp-ocp-callservicebu',
          sysId: '0691',
          unit: 'dcsp-chaos-bu01'
      }
  }]
  let graphData = hackData(linkData)
  if (graphData.nodes.length > 0) {
      initGraph(graphData)
      hasData.value = true
      loading.value = false
  } else {
      hasData.value = false
      loading.value = false
  }
}

const hackData = data => {
  let nodeList = []
  let edgeList = [] 
  let newCombos = []

  const row = 5;
  const col = 1;

  const xInterval = 200;
  const yInterval = 120;
  let topPadding = 80,rightPadding = 180,bottomPadding = 60,leftPadding = 180;
  let leftCombosX = 0,rightCombosX = 0,intervalCombosX = 1500;
  const layerAttr = {
      padding: [topPadding, rightPadding, bottomPadding, leftPadding],
      style: {
          fill: '#e9f3fb',
          stroke: "#d2d9e7",
          opacity: 0.6
      }
  }

  const leftCombosArr = []
  const rightCombosArr = []

  let CombosY = 0
  const comBoYinterval = 260;

  data && data.forEach(({ distInstance, srcInstance }) => {
      let nodes = [
          {...distInstance},
          {...srcInstance},
      ]
      nodes.forEach((node) => {
          if (node.id) {
              let exist = nodeList.find(item => item.id === node.id)
              if (!exist) {
                  nodeList.push({
                      label: node.name,
                      ...node,
                      type: 'default-img'
                  })
              }
          }
      })
      edgeList.push({
          id: + new Date(),
          source: srcInstance.id,
          target: distInstance.id
      })
  })

  function returnUnitItem(unitName) {
      return {
          unit: unitName,
          total: 1,
          originNodes: [],
          derivedNodes: [],
          cacheNodes: [],
          databaseNodes: [],
          mqNodes: []
      
      }
  }
  nodeList.forEach((node) => {
      if (node.unit.endsWith('su')) {
          let flag = false;
          if (rightCombosArr.findIndex((item) => item.unit === node.unit) > -1) {
              flag = true;
          }
          if (!flag) {
              const item = returnUnitItem(node.unit);
              rightCombosArr.push({ ...node, ...item });
          } else {
              rightCombosArr.forEach((item) => {
                  if (item.unit === node.unit) {
                      item.total += 1;
                  }
              })
          }
      } else {
          let flag = false;
          if (leftCombosArr.findIndex((item) => item.unit === node.unit) > -1) {
              flag = true;
          }
          if (!flag) {
              const item = returnUnitItem(node.unit);
              leftCombosArr.push({ ...node, ...item });
          } else {
              leftCombosArr.forEach((item) => {
                  if (item.unit === node.unit) {
                      item.total += 1;
                  }
              })
          }
      }
  })
  const reproduceCombo = (combosArr, x, y) => {
      const lastComboRow = []
      combosArr.forEach((item, index) => {
          lastComboRow[index] = Math.ceil(item.total / row)
          if (index > 0) {
              if (lastComboRow[index] > col) {
                  y = y + comBoYinterval + (lastComboRow[index] - col) * yInterval * 0.9
              } else if (lastComboRow[index -1] > col) {
                  y = y - comBoYinterval - (lastComboRow[index -1] - col) * yInterval * 0.9
              } else {
                  y += comBoYinterval
              }
          } else {
              y += comBoYinterval
          }
          const newCombo = {
              id:item.unit,
              label: `单元 ${item.unit}`,
              ...layerAttr,
              x,
              y
          }
          newCombos.push(newCombo)
      })
  }

  const oneLeftCombosMaxLength = 8;
  let leftCombosChildArrNum = Math.ceil(leftCombosArr.length / oneLeftCombosMaxLength)
  let leftCombosChildX = 0
  for (let i = 0; i < leftCombosArr.length; i++) {
      let leftCombosChildArr = []
      leftCombosChildArr = leftCombosArr.slice(i * oneLeftCombosMaxLength, (i + 1) * oneLeftCombosMaxLength)
      leftCombosChildX = i * intervalCombosX
      reproduceCombo(leftCombosChildArr, leftCombosChildX, CombosY)
  }
  rightCombosX = leftCombosChildX + intervalCombosX
  reproduceCombo(rightCombosArr, rightCombosX, CombosY)

  function classifyNode(node, item) {
      const id = node.id;
      const comboId = item.unit;
      const isOriginNode = false;
      const newNode = {
          ...node,
          comboId,
          isOriginNode,
      }
      if (id.includes('DataBase')) {
          item.databaseNodes.push(newNode)
      } else if (id.includes('Cache')) {
          item.cacheNodes.push(newNode)
      } else if (id.includes('MQ')) {
          item.mqNodes.push(newNode)
      } else {
          item.derivedNodes.push(newNode)
      }
  }

  nodeList.forEach(node => {
      if (node.unit.endsWith('su') || node.unit.endsWith('cu') || node.unit.endsWith('ru')) {
          for (let i = 0; i < rightCombosArr.length; i++) {
              const item = rightCombosArr[i]
              if (node.unit === item.unit) {
                  classifyNode(node, item)
                  break;
              }
          }
      } else {
          for (let i = 0; i < leftCombosArr.length; i++) {
              const item = leftCombosArr[i]
              if (node.unit === item.unit) {
                  classifyNode(node, item)
                  break;
              }
          }
      }
  })

  const newNodes = []
  function coordinate(leftCombosArr, rightX) {
      let rowNum = 0
      leftCombosArr.forEach(group => {
          let groupNum = 0;
          group.originNodes.forEach(node => {
              let x,y;
              y = yInterval * Math.floor(groupNum / row) + 100 + rowNum * 200;
              x = xInterval * (groupNum % row) + 100 + rightX;
              groupNum++;
              const newNode = {
                  ...node,
                  x,
                  y
              }
              newNodes.push(newNode)
          })
          group.derivedNodes.forEach(node => {
              let x,y;
              y = yInterval * Math.floor(groupNum / row) + 100 + rowNum * 200;
              x = xInterval * (groupNum % row) + 100 + rightX;
              groupNum++;
              const newNode = {
                  ...node,
                  x,
                  y
              }
              newNodes.push(newNode)
          })
          group.cacheNodes.forEach(node => {
              let x,y;
              y = yInterval * Math.floor(groupNum / row) + 100 + rowNum * 200;
              x = xInterval * (groupNum % row) + 100 + rightX;
              groupNum++;
              const newNode = {
                  ...node,
                  x,
                  y
              }
              newNodes.push(newNode)
          })
          group.databaseNodes.forEach(node => {
              let x,y;
              y = yInterval * Math.floor(groupNum / row) + 100 + rowNum * 200;
              x = xInterval * (groupNum % row) + 100 + rightX;
              groupNum++;
              const newNode = {
                  ...node,
                  x,
                  y
              }
              newNodes.push(newNode)
          })
          group.mqNodes.forEach(node => {
              let x,y;
              y = yInterval * Math.floor(groupNum / row) + 100 + rowNum * 200;
              x = xInterval * (groupNum % row) + 100 + rightX;
              groupNum++;
              const newNode = {
                  ...node,
                  x,
                  y
              }
              newNodes.push(newNode)
          })
          groupNum--
          const rowAdd = Math.floor(groupNum / row) + 1;
          rowNum += rowAdd;
      })
  }

  coordinate(leftCombosArr, leftCombosX)
  coordinate(rightCombosArr, rightCombosX)
  newNodes.forEach(item => {
      item.comboId = item.unit
  })

  return { edges: edgeList, combos: newCombos, nodes: newNodes }
}

getData()


</script>

<style scoped>

.link-topology-container {
  width: 500px;
}

.topology-container {
  overflow: hidden;
  margin-bottom: 8px;
}

#link-topology {
  height: 500px;
  width: 100%;
  background-color: rgb(245, 245, 245);
}

</style>