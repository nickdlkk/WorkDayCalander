<template>
  <div class="calendar">
    <!-- 添加日期选择器 -->
    <div class="date-picker">
      <label for="start-date">开始日期：</label>
      <input type="date" id="start-date" v-model="startDate" />
      <button @click="exportCalendar">导出日历</button>
    </div>

    <div v-for="(month, index) in months" :key="index">
      <h2>{{ month.year }}年 {{ month.month }}月</h2>
      <table>
        <thead>
          <tr>
            <th v-for="day in weekDays" :key="day">{{ day }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(week, weekIndex) in month.weeks" :key="weekIndex">
            <td v-for="(day, dayIndex) in week" :key="dayIndex">
              <div
                :class="['day-box', { 'workday': day.isWorkDay && day.date && day.current >= start, 'non-workday': !day.isWorkDay && day.date && day.current >= start }]">
                <span>{{ day.date }}</span>
                <span v-if="day.isWorkDay && day.date && day.current >= start" class="count">{{ day.daysFromNow }}</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { getWorkdaysBetween, isWorkday } from 'workday-cn';
import html2canvas from 'html2canvas';

// 格式化日期为 YYYY-MM-DD
const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 定义一周的日期
const weekDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
// 当前日期
const currentDate = ref(new Date());
// 开始日期
const startDate = ref(formatDate(new Date()));
// 月份数组
const months = ref([]);
// 开始日期对象
const start = ref(new Date(startDate.value));

// 生成日历数据
const generateCalendar = (startDate, numMonths) => {
  const result = [];
  start.value = new Date(startDate); // 更新 start 的值
  for (let i = 0; i < numMonths; i++) {
    const date = new Date(start.value.getFullYear(), start.value.getMonth() + i, 1);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const firstDay = new Date(year, month - 1, 1).getDay();
    const lastDay = new Date(year, month, 0).getDate();
    const weeks = [];
    let week = [];

    // 填充本月第一天之前的空白
    for (let j = 0; j < (firstDay === 0 ? 6 : firstDay - 1); j++) {
      week.push({ date: '', daysFromNow: '' });
    }

    // 填充本月的日期
    for (let day = 1; day <= lastDay; day++) {
      const current = new Date(year, month - 1, day);
      const isWorkDay = isWorkday(current);
      const workdays = getWorkdaysBetween(start.value, current); // 使用 start.value 作为基准日期
      const daysFromNow = isWorkDay && current >= start.value ? workdays.length : ''; // 只显示选择日期之后的工作日数量
      week.push({ date: day, daysFromNow, isWorkDay, current });
      if (week.length === 7) {
        weeks.push(week);
        week = [];
      }
    }

    // 填充本月最后一天之后的空白
    if (week.length > 0) {
      while (week.length < 7) {
        week.push({ date: '', daysFromNow: '' });
      }
      weeks.push(week);
    }

    result.push({ year, month, weeks });
  }
  return result;
};

// 计算日历数据
const calculateCalendar = () => {
  months.value = generateCalendar(new Date(startDate.value), 3); // 使用 startDate 作为基准日期
};

// 监听开始日期变化
watch(startDate, () => {
  calculateCalendar();
});

// 组件挂载后计算日历数据
onMounted(() => {
  calculateCalendar();
});

// 导出日历为图片
const exportCalendar = () => {
  const calendarElement = document.querySelector('.calendar');
  html2canvas(calendarElement).then(canvas => {
    const link = document.createElement('a');
    link.download = 'calendar.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  });
};
</script>

<style scoped>
/* 添加日期选择器样式 */
.date-picker {
  margin-bottom: 20px;
}

.date-picker label {
  margin-right: 10px;
  font-weight: bold;
}

.date-picker input {
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.calendar {
  display: flex;
  flex-direction: column;
  gap: 25px;
  padding: 20px;
}

table {
  border-collapse: collapse;
  width: 100%;
  table-layout: fixed;
}

th,
td {
  border: 1px solid #ccc;
  padding: 12px;
  text-align: center;
  height: 60px;
  /* 增加单元格高度 */
  vertical-align: top;
  /* 内容顶部对齐 */
}

.day-box {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.workday {
  background-color: #e6f3ff;
  /* 工作日背景色 */
}

.non-workday {
  background-color: #ffe6e6;
  /* 非工作日背景色 */
}

.count {
  position: absolute;
  bottom: 4px;
  right: 4px;
  font-size: 12px;
  color: #666;
  background-color: rgba(255, 255, 255, 0.7);
  padding: 2px 4px;
  border-radius: 3px;
}

h2 {
  margin: 0 0 15px 0;
  font-size: 1.2em;
  color: #333;
}

/* 添加按钮样式 */
button {
  margin-left: 10px;
  padding: 5px 10px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #45a049;
}
</style>