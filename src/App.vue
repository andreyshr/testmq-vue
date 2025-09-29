<script setup lang="ts">
import { ref, onMounted, useTemplateRef, computed, watch } from "vue";
import { getData, getRange } from "./utils";
import type { ItemData } from "./types";
import { Chart } from "./libs/chart";
import { useClimateDB } from "./libs/db";

type DataType = "temperature" | "precipitation";

const chartElement = useTemplateRef("chart-box");

let chart: Chart | null = null;
let isLoading = ref(false);
let currentRequestId = 0;

const activeDataType = ref<DataType>("temperature");
const years = getRange();

const fromAvailableVals = computed(() =>
  years.slice(0, years.findIndex((item) => item === to.value) + 1)
);

const toAvailableVals = computed(() =>
  years.slice(years.findIndex((item) => item === from.value))
);

const from = ref<number>(years[0]!);
const to = ref<number>(years.at(-1)!);

watch(
  [from, to, activeDataType],
  ([from, to, type]) => {
    const fromStr = from.toString();
    const toStr = (to + 1).toString();

    updateChart(fromStr, toStr, type);
  },
  { immediate: true }
);

onMounted(async () => {
  if (chartElement.value) {
    chart = new Chart(chartElement.value, 800, 600);
  }
});

async function updateChart(from: string, to: string, type: DataType) {
  const requestId = ++currentRequestId;

  isLoading.value = true;

  const db = await useClimateDB();
  let range = await db.getByRange(type, from, to);
  if (requestId !== currentRequestId) return;

  if (!range.length) {
    const data = await getData<ItemData>(`../data/${type}.json`);
    await db.addData(type, data);
    range = await db.getByRange(type, from, to);
  }

  if (requestId === currentRequestId) {
    chart?.updateData(range);
  }

  isLoading.value = false;
}
</script>

<template>
  <div class="content">
    <div class="sidebar">
      <button
        class="button"
        :class="{ 'button--active': activeDataType === 'temperature' }"
        @click="activeDataType = 'temperature'"
      >
        Температура
      </button>
      <button
        class="button"
        :class="{ 'button--active': activeDataType === 'precipitation' }"
        @click="activeDataType = 'precipitation'"
      >
        Осадки
      </button>
    </div>
    <div class="chart-container">
      <div class="chart-controls">
        <select v-model.number="from" id="from-year" class="select">
          <option v-for="(year, i) in fromAvailableVals" :key="i" :value="year">
            {{ year }}
          </option>
        </select>
        <select v-model.number="to" id="to-year" class="select">
          <option v-for="(year, i) in toAvailableVals" :key="i" :value="year">
            {{ year }}
          </option>
        </select>
      </div>
      <div class="chart" ref="chart-box">
        <div class="loader" v-if="isLoading">
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

.loader {
  position: absolute;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.1);
  text-align: center;
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
