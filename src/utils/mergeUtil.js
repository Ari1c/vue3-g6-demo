import { ref } from 'vue'

/**
 * 
 * @param {*} mergeArr 需要合并的项
 * @param {*} idFields 根据传入的字段来合并
 * @returns 
 */
export const useMergeUtils = (mergeArr, idFields = []) => {
    const mergeObj = ref([])

    const getSpanArr = (data) => {
        mergeArr.value.array.forEach(key => {
            let colCount = 0;
            mergeObj.value[key]  = [];
            let preId = '';
            Array.isArray(data) && data.forEach((i, idx) => {
                const currentId = idFields.map((filed) => i[filed].join('-') || i[key]);
                if (idx === 0) {
                    mergeObj.value[key].push(1);
                    preId = currentId;
                } else {
                    if (currentId === preId) {
                        mergeObj.value[key][colCount] += 1;
                        mergeObj.value[key].push(0);
                    } else {
                        colCount = idx;
                        mergeObj.value[key].push(1);
                        preId = currentId;
                    }
                    // if (i[key] === data[idx - 1][key]) {
                    //     mergeObj.value[key][colCount] += 1;
                    //     mergeObj.value[key].push(0);
                    // } else {
                    //     colCount = idx;
                    //     mergeObj.value[key].push(1);
                    // }
                    
                }
            });
        });
    }

    const objectSpanMethod = ({ row, column, rowIndex, columnIndex }) => {
        if (column) {
            if (mergeArr.value.indexOf(column.property) !== -1) {
                if(mergeObj.value[column.property][rowIndex]) {
                    return [mergeObj.value[column.property][rowIndex], 1];
                } else {
                    return [0, 0];
                }
            }
        }
    }

    return { mergeObj, mergeArr, objectSpanMethod }
}


// 用法

{/* <el-table :span-method="objectSpanMethod"></el-table>

import { useMergeUtils } from '@/utils/mergeUtil'

const mergeArr = ref([
    'level',
    'id',
    'name'
])

const idFields = ['id', 'name']

const { mergeObj, mergeArr, objectSpanMethod } = useMergeUtils(mergeArr, idFields)

getSpanArr(list) */}
