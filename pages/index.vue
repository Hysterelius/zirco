<script setup lang="ts">
import { ref } from "vue";
const invoiceStore = useEntryData();

const entries = invoiceStore.entriesFY(new Date());

console.log("FY entries", entries);

const hoursWorked = ref(
  entries.reduce((total, entry) => total + (entry.calcs?.netHours ?? 0), 0)
);

const settings = useSettings();

// financial year function if before 1st July, return last year - current year else return current year - next year
function financialYear() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  return month < 6 ? `${year - 1}-${year}` : `${year}-${year + 1}`;
}
</script>

<template>
  <div class="layout">
    <main>
      <h1 class="extra-bold alt-style">
        <span class="coloured extra-bold alt-style"
          >{{ settings.state.firstName
          }}{{
            settings.state.firstName.slice(-1).toLowerCase() == "s"
              ? "'"
              : "'s"
          }}</span
        >
        Dashboard
      </h1>

      <br>
      <h4 class="bold italic">This financial year ({{ financialYear() }})</h4>
      <div class="main-grid">
        <div>
          <MainPageCounter title="Hours Worked" :count="hoursWorked" />
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
@import url("/assets/css/type.css");

main {
  padding: 1rem;
  width: min(100ch, 100%);
}

h1 {
  font-size: 3rem;
}

.layout {
  display: grid;
  /* align items to horizontal centre */
  place-items: center;
}

.coloured {
  color: var(--p-primary-color);
}
</style>
