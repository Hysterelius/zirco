import { BreakCategory } from "./entries";
import { useLocalStorage } from "@vueuse/core";
import { defineStore } from "pinia";

export enum states {
  active,
  paused,
  stopped,
}

interface Active {
  status: states;
  start_time: string;
  end_time: string;
  breaks?: Array<{
    start_time: string;
    end_time: string;
    category: BreakCategory;
  }>;
}

export const useActiveStore = defineStore("activeData", () => {
  const state = useLocalStorage("activeData", {
    status: states.stopped,
    start_time: "",
    end_time: "",
    breaks: [] as Array<{
      start_time: string;
      end_time: string;
      category: BreakCategory;
    }>,
  });

  const latestBreak = computed(() => {
    return state.value.breaks[state.value.breaks.length - 1];
  });

  function updateActive(active: Active) {
    state.value.status = active.status;
    state.value.start_time = active.start_time;
    state.value.end_time = active.end_time;
    state.value.breaks = active.breaks || [];
  }

  function start() {
    state.value.status = states.active;
    state.value.start_time = new Date().toISOString();
  }

  function pause() {
    state.value.status = states.paused;
    state.value.breaks.push({
      start_time: new Date().toISOString(),
      end_time: "",
      category: BreakCategory.Other,
    });
  }

  function unpause() {
    state.value.status = states.active;
    latestBreak.value.end_time = new Date().toISOString();
  }

  function pauseStatus(ps: BreakCategory) {
    if (state.value.status === states.paused) {
      latestBreak.value.category = ps;
    } else {
      console.error("Cannot set pause status when not paused");
    }
  }

  function stop() {
    console.log("Stopping");
    state.value.status = states.stopped;
    state.value.end_time = new Date().toISOString();

    // save to the invoice.ts
    const invoice = useEntryData();
    const date = new Date().toISOString().split("T")[0];
    invoice.addEntry({
      item: "Work Done",
      date: date,
      start_time: state.value.start_time,
      end_time: state.value.end_time,
      breaks: state.value.breaks,
    });
  }

  function undoStop() {
    state.value.status = states.active;
    state.value.end_time = "";
  }

  function clean() {
    // clean all breaks shorter than 1 minute
    state.value.breaks = state.value.breaks.filter((b) => {
      const start = new Date(b.start_time);
      const end = new Date(b.end_time);
      return end.getTime() - start.getTime() > 60000;
    });

    // remove milliseconds from all dates
    state.value.start_time = state.value.start_time.split(".")[0];
    state.value.end_time = state.value.end_time.split(".")[0];
    state.value.breaks = state.value.breaks.map((b) => {
      b.start_time = b.start_time.split(".")[0];
      b.end_time = b.end_time.split(".")[0];
      return b;
    });
  }

  return {
    state,
    latestBreak,
    updateActive,
    start,
    pause,
    unpause,
    pauseStatus,
    stop,
    undoStop,
    clean,
  };
});
