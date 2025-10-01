<script setup lang="ts">
import {
  ref,
  useTemplateRef,
  onMounted,
  onUnmounted,
  computed,
  watch,
} from "vue";
import { getRange } from "./utils";
import { Chart } from "./libs/chart";
import type { DataType } from "./types";
import { ClimateDataRepository } from "./entities/climate-data";

const chartElement = useTemplateRef("chart-box");

let chart: Chart | null = null;

let isLoading = ref(false);
let currentRequestId = 0;

const climateDataRepository = new ClimateDataRepository();
const activeDataType = ref<DataType>("temperature");

const years = getRange();
const from = ref(years[0]!);
const to = ref(years.at(-1)!);

const fromAvailableYears = computed(() =>
  years.slice(0, years.findIndex((item) => item === to.value) + 1)
);

const toAvailableYears = computed(() =>
  years.slice(years.findIndex((item) => item === from.value))
);

watch(
  [from, to, activeDataType],
  ([from, to, type]) => {
    const fromStr = from.toString();
    const toStr = (to + 1).toString();

    updateChartData(fromStr, toStr, type);
  },
  { immediate: true }
);

onMounted(async () => {
  if (chartElement.value) {
    chart = new Chart(chartElement.value, 800, 600);
  }
});

onUnmounted(() => {
  chart?.destroy();
  chart = null;
});

async function updateChartData(from: string, to: string, type: DataType) {
  const requestId = ++currentRequestId;
  isLoading.value = true;

  const data = await climateDataRepository.getByRange(type, from, to);
  const isLastRequest = requestId === currentRequestId;

  if (!isLastRequest) return;

  chart?.updateData(data);
  isLoading.value = false;
}

function setActiveDataType(type: DataType) {
  activeDataType.value = type;
}

function buttonClasses(type: DataType) {
  return { button: true, "button--active": activeDataType.value === type };
}
</script>

<template>
  <div class="content">
    <div class="sidebar">
      <button
        :class="buttonClasses('temperature')"
        @click="setActiveDataType('temperature')"
      >
        Температура
      </button>
      <button
        :class="buttonClasses('precipitation')"
        @click="setActiveDataType('precipitation')"
      >
        Осадки
      </button>
    </div>
    <div class="chart-container">
      <div class="chart-controls">
        <select v-model.number="from" id="from-year" class="select">
          <option
            v-for="(year, i) in fromAvailableYears"
            :key="i"
            :value="year"
          >
            {{ year }}
          </option>
        </select>
        <select v-model.number="to" id="to-year" class="select">
          <option v-for="(year, i) in toAvailableYears" :key="i" :value="year">
            {{ year }}
          </option>
        </select>
      </div>
      <div class="chart" ref="chart-box">
        <div class="chart-loader" v-if="isLoading">
          {{ `Loading ${activeDataType}...` }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.content {
  display: flex;
  width: max-content;
  margin: auto;
  padding: 16px;
}

.sidebar {
  display: flex;
  flex-direction: column;
  margin-right: 12px;
}

.chart {
  border: 1px solid;
  display: flex;
  width: max-content;
  position: relative;
}

.chart-controls {
  display: flex;
  margin-bottom: 12px;
}

.chart-loader {
  position: absolute;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.1);
  text-align: center;
}

.select {
  width: 150px;
  height: 32px;
  border: 1px solid #000000;
}

.select:hover {
  background: rgba(0, 0, 0, 0.1);
}

.select:not(:last-of-type) {
  margin-right: 12px;
}

.button {
  height: 32px;
  background: transparent;
  border: 1px solid #000000;
}

.button--active {
  background: rgba(0, 0, 0, 0.3);
}

.button:hover {
  background: rgba(0, 0, 0, 0.1);
}

.button:not(:last-of-type) {
  margin-bottom: 12px;
}
</style>
