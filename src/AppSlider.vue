<template>
    <div style="width: 800px;display: flex;gap: 20px;">
        <el-slider v-model="timeRange" range :step="step" :min="minTimeStep" :max="maxTimeStep" :format-tooltip="formatTooltip" @change="handleSlider" :marks="sliderMarks" :always="true"></el-slider>
        <div style="width: 200px">
            <el-select v-model="timeRangeValue" @change="setTimeRange()">
                <el-option v-for="item in timeRangeOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
        </div>
    </div>
</template>

<script setup>
import dayjs from 'dayjs';
import { debounce } from 'lodash';
import { ref, watch, nextTick, onMounted, reactive } from 'vue'

const formatted = "YYYY-MM-DD HH:mm:ss";
const step = ref(1*60*1000)
const selectedTimeRange = ref([
    dayjs(new Date()).subtract(1, 'hour').format(formatted),
    dayjs(new Date()).format(formatted),
])
const timeRange = ref([
    dayjs(selectedTimeRange.value[0]).valueOf(),
    dayjs(selectedTimeRange.value[1]).valueOf(),
])
const minTimeStep = ref(timeRange.value[0])
const maxTimeStep = ref(timeRange.value[1])

const timeRangeValue = ref("60")
const timeRangeOptions = ref([
    {
        label: '最近5分钟',
        value: "5"
    },
    {
        label: '最近15分钟',
        value: "15"
    },
    {
        label: '最近30分钟',
        value: "30"
    },
    {
        label: '最近1小时',
        value: "60"
    },
    {
        label: '最近3小时',
        value: "180"
    },  
])
const sliderMarks = ref({})
const formatTooltip = val => {const formatted = "HH:mm:ss"; return dayjs(val).format(formatted)}

const alarmLevelColor = reactive({
    '0': '#5ec277',
    '1': '#ff655c',
    '2': '#ffcc33',
    '3': '#5ca2ff',
})
watch(() => [minTimeStep.value, maxTimeStep.value], val => {
    nextTick(() => {
        sliderColorDynMod();
        sliderMarksBynMod();
    })
}, { immediate: true })

// 处理滑块变化事件，更新 selectedTimeRange
const handleSlider = debounce(val => {
    selectedTimeRange.value = [dayjs(val[0]).format(formatted), dayjs(val[1]).format(formatted)]

}, 500)
// 根据下拉选择的时间范围设置时间范围
const setTimeRange = (minutes) => {
    minutes = timeRangeValue.value;
    if (minutes == null || minutes == undefined || minutes.trim() == "") {
        selectedTimeRange.value = [dayjs(new Date()).subtract(1, 'hours').format(formatted), dayjs(new Date()).format(formatted)]
        timeRange.value = [
            dayjs(selectedTimeRange.value[0]).valueOf(),
            dayjs(selectedTimeRange.value[1]).valueOf(),
        ]
        minTimeStep.value = timeRange.value[0]
        maxTimeStep.value = timeRange.value[1]
        return
    }
    step.value = 1 * 60 * 1000;
    const now = new Date();
    const start = new Date(now)
    start.setMinutes(start.getMinutes() - minutes)
    selectedTimeRange.value = [dayjs(start).format(formatted), dayjs(now).format(formatted)]
    timeRange.value = [
        dayjs(selectedTimeRange.value[0]).valueOf(),
        dayjs(selectedTimeRange.value[1]).valueOf(),
    ]
    minTimeStep.value = timeRange.value[0]
    maxTimeStep.value = timeRange.value[1]
}

// 根据报警数据动态修改滑块的颜色
const sliderColorDynMod = () => {
    const element = document.getElementsByClassName('el-slider__runway')[0]
    if (element) {
        // ajax
        let backClr = 'linear-gradient(to right, '
        let alarmData = res.value
        if (alarmData.length > 0) {
            alarmData.sort((a, b) => {
                return dayjs(a.faultBeginTime).valueOf() - dayjs(b.faultBeginTime).valueOf()
            })

            const beginTime = minTimeStep.value;
            const endTime = maxTimeStep.value;
            const allTime = endTime - beginTime;
            alarmData.forEach((item, index, array) => {
                item.faultBeginTime = dayjs(item.faultBeginTime).valueOf();
                item.faultEndTime = dayjs(item.faultEndTime).valueOf();
                // 修复时间段为0的情况（开始结束的时间相等情况）
                item.faultEndTime = item.faultBeginTime == item.faultEndTime ? item.faultBeginTime + 2 : item.faultEndTime;
                // 第一个告警起始时间在选择时间外
                if( index == 0 && item.faultBeginTime < beginTime) {
                    item.faultBeginTime = beginTime;
                }
                // 最后一个告警结束时间在选择时间外
                if (index == array.length - 1 && item.faultEndTime > endTime) {
                    item.faultEndTime = endTime;
                }
                // 计算告警时间段占比
                item.segProp = (item.faultEndTime - item.faultBeginTime) / allTime;
                // 告警时间段占比小于0.3，则设置为0.3
                item.segProp = item.segProp < 0.3 ? 0.3 : item.segProp;

                // 计算中点
                let median = Math.round((((item.faultEndTime + item.faultBeginTime) / 2 - beginTime) / allTime * 100) * 100) / 100;
                // 计算开始点
                let begPoint = Math.round((median - item.segProp / 2) * 100) / 100;
                item.begPoint = item.faultBeginTime == beginTime || begPoint < 0 ? "0%" : begPoint + '%';
                let endPoint = Math.round((median + item.segProp / 2) * 100) / 100;
                item.endPoint = item.faultEndTime == endTime || endPoint > 100 ? "100%" : endPoint + '%';
            })
            const colorArr = [];
            alarmData.forEach((item, index, array) => {
                const currentColor = alarmLevelColor[item.faultLevel];
                if (index == 0 && item.faultBeginTime > beginTime) {
                    colorArr.push({
                        begPoint: '0%',
                        endPoint: item.begPoint,
                        color: alarmLevelColor['0']
                    })
                }

                colorArr.push({
                    begPoint: item.begPoint,
                    endPoint: item.endPoint,
                    color: currentColor
                })

                if (index < array.length - 1) {
                    colorArr.push({
                        begPoint: item.endPoint,
                        endPoint: array[index + 1].begPoint,
                        color: alarmLevelColor['0']
                    })
                }

                if (index == array.length - 1 && item.faultEndTime < endTime) {
                    colorArr.push({
                        begPoint: item.endPoint,
                        endPoint: '100%',
                        color: alarmLevelColor['0']
                    })
                }
                
            })
            colorArr.forEach((item, index, array) => {
                if (index != array.length - 1) {
                    backClr +=  `${item.color} ${item.begPoint}, ${item.color} ${item.endPoint}, `
                    return
                }
                backClr +=  `${item.color} ${item.begPoint}, ${item.color} ${item.endPoint})`
            })
        } else {
            backClr +=  `${alarmLevelColor['0']} 0%, ${alarmLevelColor['0']} 100%)`
        }

        element.style.background = backClr; // "linear-gradient(to right, #5ec277 0%, #5ec277 54.7%, #ffcc33 54.7%, #ffcc33 55.6%, #5ec277 55.6%, #5ec277 65.64%, #ff655c 65.64%, #ff655c 66.32%, #5ec277 66.32%, #5ec277 69.84%, #ffcc33 69.84%, #ffcc33 100%)";
        console.log("backClr: ===", backClr)
    }

}

// 根据时间范围设置滑块的标记点
const sliderMarksBynMod = () => {
    const formatted = 'HH:mm';
    let marks = {};
    let range = maxTimeStep.value - minTimeStep.value;
    marks[minTimeStep.value] = dayjs(minTimeStep.value).format(formatted);
    let range25 = minTimeStep.value + Math.round(range * 0.25);
    marks[range25] = dayjs(range25).format(formatted);
    let range50 = minTimeStep.value + Math.round(range * 0.50);
    marks[range50] = dayjs(range50).format(formatted);
    let range75 = minTimeStep.value + Math.round(range * 0.75);
    marks[range75] = dayjs(range75).format(formatted);
    marks[maxTimeStep.value] = dayjs(maxTimeStep.value).format(formatted);
    console.log('marks ====', marks)
    sliderMarks.value = marks;
}

const res = ref([])
onMounted(() => {
    res.value = Array(3).fill().map((__, i) => {
        return {
            faultBeginTime: dayjs(+ new Date() + (i + 1)*100000).subtract(1, 'hour').format(formatted),
            faultEndTime: dayjs(+ new Date() +  (i + 10)*100000).subtract(1, 'hour').format(formatted),
            faultLevel: i+1
        }
    })
})
</script>

<style lang="scss">
.el-slider {
    .el-slider__runway {
        height: 12px;
        background: #5ec277;
    }
    .el-slider__bar {
        opacity: 0;
    }

    .el-slider__button-wrapper {
        top: -13px;
        .el-slider__button {
            width: 12px;
            height: 23px;
            border-radius: 4px;
            background-color: #409eff;
            border: none;
            opacity: 0.75;
        }
    }

    .el-slider__stop {
        opacity: 0;
    }

    .el-slider__marks-text {
        top: 2px;
        font-size: 12px;
        color: #000;
    }
}
</style>