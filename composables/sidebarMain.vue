<template>
  <aside>
    <MainLogo />
    <NuxtLink to="/" aria-label="Home">
      <Button
        v-tooltip="'Home page'"
        icon="pi pi-home"
        :severity="activePage === '/' ? '' : 'contrast'"
      />
    </NuxtLink>
    <NuxtLink to="/manager" aria-label="Timesheets">
      <Button
      v-tooltip="'Entry Manager'"
      icon="pi pi-table"
      :severity="activePage === '/manager' ? '' : 'contrast'"
      variant="text"
      rounded
      />
    </NuxtLink>
    <NuxtLink to="/maker" aria-label="Invoice Manager">
      <Button
      v-tooltip="'Invoice Manager'"
      icon="pi pi-print"
      :severity="activePage === '/maker' ? '' : 'contrast'"
      variant="text"
      rounded
      />
    </NuxtLink>
    <NuxtLink to="/sheet" aria-label="Sheet">
      <Button
      v-tooltip="'Sheet'"
      icon="pi pi-file"
      :severity="activePage === '/sheet' ? '' : 'contrast'"
      variant="text"
      rounded
      />
    </NuxtLink>

    <NuxtLink to="/settings" aria-label="Settings">
      <Button
      v-tooltip="'Invoice Page'"
      icon="pi pi-cog"
      :severity="activePage === '/settings' ? '' : 'contrast'"
      variant="text"
      rounded
      />
    </NuxtLink>

    <div class="push-end">
      <div v-if="status == states.stopped">
        <div v-if="undo">
          <Button
            icon="pi pi-undo"
            aria-label="Start"
            severity="contrast"
            rounded
            @click="undoStop"
          />
        </div>
        <div v-else>
          <Button
            icon="pi pi-play"
            aria-label="Start"
            severity="contrast"
            rounded
            :disabled="disabled"
            @click="activeState.start()"
          />
        </div>
      </div>
      <div v-if="status == states.active" class="stack">
        <span class="mono">{{ time }}</span>
        <Button
          icon="pi pi-stop"
          aria-label="Stop"
          severity="danger"
          rounded
          @click="stop"
        />
        <Button
          icon="pi pi-pause"
          aria-label="Pause"
          severity="contrast"
          rounded
          @click="activeState.pause()"
        />
      </div>
      <div v-if="status == states.paused" class="stack">
        <span class="mono">{{ time }}</span>

        <Button
          v-for="(breakCategory, index) in Object.values(BreakCategory)"
          :key="index"
          :aria-label="breakCategory"
          class="p-button-icon-only"
          :severity="
            activeState.latestBreak.category == breakCategory ? '' : 'contrast'
          "
          variant="text"
          rounded
          @click="activeState.pauseStatus(breakCategory)"
        >
          <Icon :name="breakIcons(breakCategory)" />
        </Button>

        <Button
          icon="pi pi-play"
          aria-label="Resume"
          severity="contrast"
          rounded
          @click="activeState.unpause()"
        />
      </div>
    </div>
    <Avatar
      :label="
        settings.state.firstName || settings.state.lastName
          ? settings.state.firstName.charAt(0) +
            settings.state.lastName.charAt(0)
          : '?'
      "
      class="mr-2"
      size="normal"
      style="
        background-color: var(--p-button-success-active-border-color);
        color: var(--p-button-contrast-color);
      "
    />
  </aside>
</template>

<script setup lang="ts">
// import { ref } from 'vue';
import { states } from "~/stores/active";
import { BreakCategory } from "~/stores/entries";
import { ref, computed, watch } from "vue";

const activeState = useActiveStore();
const status = computed(() => activeState.state.status);

const settings = useSettings();
const route = useRoute();

const undo = ref(false);
const disabled = ref(false);
const start_time_local = ref();
const pause_time = ref();
const time = ref("00:00");

let undo_timeout: NodeJS.Timeout;
let disabled_timeout: NodeJS.Timeout;
let active_timeout: NodeJS.Timeout;

const activePage = computed(() => {
  return route.path;
});

function stop() {
  console.log("stop pressed");
  activeState.stop();
  undo.value = true;
  disabled.value = true;

  undo_timeout = setTimeout(() => {
    undo.value = false;
  }, 5000); // 5 seconds

  disabled_timeout = setTimeout(() => {
    disabled.value = false;
  }, 60000); // 1 minute
}

function undoStop() {
  activeState.undoStop();
  undo.value = false;
}

function dealWithState(value: states) {
  if (value === states.active) {
    clearTimeouts();
    if (!start_time_local.value) start_time_local.value = new Date();
    updateTime();

    active_timeout = setInterval(updateTime, 1000);
  } else if (value === states.paused) {
    clearTimeouts();
    pause_time.value = new Date();
    updateTime();

    active_timeout = setInterval(updateTime, 1000);
  } else {
    clearTimeouts();
  }
}

function updateTime() {
  const diff =
    new Date().getTime() -
    (status.value === states.paused
      ? pause_time.value
      : start_time_local.value
    ).getTime();
  changeTime(diff);
}

function changeTime(diff: number) {
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  const paddedMinutes = String(minutes).padStart(2, "0");

  if (hours > 0) {
    const paddedHours = String(hours).padStart(2, "0");
    time.value = `${paddedHours}:${paddedMinutes}`;
  } else {
    const paddedSeconds = String(seconds).padStart(2, "0");
    time.value = `${paddedMinutes}:${paddedSeconds}`;
  }
}

function clearTimeouts() {
  if (undo_timeout) clearTimeout(undo_timeout);
  if (disabled_timeout) clearTimeout(disabled_timeout);
  if (active_timeout) clearInterval(active_timeout);
}

watch(
  () => activeState.state.start_time,
  (value) => {
    console.log("date:", value);
    start_time_local.value = new Date(value);
  }
);

watch(
  () => activeState.state.status,
  (value) => {
    dealWithState(value);
  }
);

if (activeState.state.start_time)
  start_time_local.value = new Date(activeState.state.start_time);
dealWithState(activeState.state.status);

// when status changes to
</script>

<style scoped>
aside {
  display: flex;
  flex-direction: column;
  background-color: var(--p-form-field-disabled-background);
  color: var(--p-text-muted-color);

  align-items: center;
  width: 4rem;
  height: 100dvh;
  padding: 1rem;
  gap: 1rem;
}

.stack {
  background-color: var(--p-content-hover-background);
  border-radius: calc(2.5rem / 2);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.title {
  font-size: 2rem;
  text-align: center;
  margin: 1rem 0;
  font-weight: 900;
  font-family: "Archivo", sans-serif;
  /* change variable witdth to 125 */
  font-variation-settings: "GRAD" 125;
}

.push-end {
  margin-top: auto;
}

.mono {
  margin-top: 0.5rem;
  font-family: "Roboto Mono", monospace;
  font-size: 0.8rem;
}

h1 {
  margin: 0;
}
</style>
