<template>
  <main>
    <div class="hr">
      <h1>Invoice maker</h1>
      <div class="invoice_grid">
        <div v-for="invoice in invoiceStore.invoices" :key="invoice.id">
          <iframe
            :src="`/sheet?show=${invoice.id}`"
            style="
            width: 6.3cm;
            height: 8.91cm;
              border: none;
              transform-origin: top left;
            "
            sandbox="allow-same-origin allow-scripts"
          />
        </div>
      </div>
    </div>
    <div>
      <h3>Filters:</h3>
      <!-- add a button for each of the statuses to change the filter -->
      <div class="filters">
        <!-- Filter for current month -->

        <Button
          v-for="specFilter in Object.values(Filters)"
          :key="specFilter"
          variant="text"
          severity="secondary"
          :class="{ inactive: specFilter !== selectedStatus }"
          @click="filterTime(specFilter)"
        >
          <Tag :value="specFilter" severity="secondary" />
        </Button>

        <Button
          v-for="status in Object.values(EntryState)"
          :key="status"
          variant="text"
          :severity="getStatusLabel(status)"
          :class="{ inactive: status !== selectedStatus }"
          @click="filterStatus(status)"
        >
          <Tag :value="status" :severity="getStatusLabel(status)" />
        </Button>
        <Button
          variant="text"
          severity="contrast"
          icon="pi pi-filter-slash"
          :class="{ inactive: selectedStatus !== null }"
          @click="
            entries = entryStore.entries;
            selectedStatus = null;
          "
        />
        <div class="to-end">
          <Dialog v-model:visible="confirmDialogVisible" header="Confirm" modal>
            <p>Do you want to include other active entries in the invoice?</p>
            <template #footer>
              <Button
                label="Cancel"
                icon="pi pi-minus"
                class="to-left"
                severity="secondary"
                @click="confirmDialogVisible = false"
              />
              <Button
                label="Yes"
                icon="pi pi-check"
                severity="danger"
                @click="activateEntries(true)"
              />
              <Button
                label="No"
                icon="pi pi-times"
                severity=""
                @click="activateEntries(false)"
              />
            </template>
          </Dialog>

          <Button
            label="Create Invoice"
            :disabled="!entriesSelected?.length"
            @click="printInvoice(true)"
          />
        </div>
      </div>
      <DataTable
        v-model:selection="entriesSelected"
        data-key="id"
        :value="entries"
        show-gridlines
        table-style="min-width: 50rem"
      >
        <Column selection-mode="multiple" :exportable="false" />

        <Column field="item" header="Item" />
        <Column field="date" header="Date">
          <template #body="slotProps">
            {{ slotProps.data.date.toLocaleDateString("en-AU") }}
          </template>
        </Column>
        <Column field="start_time" header="Start Time">
          <template #body="slotProps">
            {{
              slotProps.data.start_time.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            }}
          </template>
        </Column>
        <Column field="end_time" header="End Time">
          <template #body="slotProps">
            {{
              slotProps.data.end_time.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            }}
          </template>
        </Column>
        <Column
          field="status.state"
          header="Status"
          style="min-width: 12rem"
          filter-match-mode="equals"
        >
          <template #body="slotProps">
            <Tag
              :value="slotProps.data.status.state"
              :severity="getStatusLabel(slotProps.data.status.state)"
            />
          </template>
        </Column>
      </DataTable>
    </div>
  </main>
</template>

<script setup lang="ts">
import type { Entry } from "~/stores/entries";

const entryStore = useEntryData();
const router = useRouter();
const entries = ref(entryStore.entries);
const entriesSelected = ref();
const selectedStatus = ref<Filters | EntryState | null>(EntryState.Draft);
const confirmDialogVisible = ref(false);
const invoiceStore = invoices();

if (Object.values(EntryState).includes(selectedStatus.value as EntryState)) {
  filterStatus(selectedStatus.value as EntryState);
}

enum Filters {
  Month = "Month",
  FY = "Financial Year",
}

function getStatusLabel(status: EntryState) {
  switch (status) {
    case EntryState.Draft:
      return "warn";
    case EntryState.Active:
      return "info";
    case EntryState.Sent:
      return "success";
  }
}

function filterStatus(status: EntryState) {
  selectedStatus.value = status;
  entries.value = entryStore.entries.filter(
    (entry) => entry.status.state === status
  );
}

function filterTime(time: Filters) {
  selectedStatus.value = time;
  switch (time) {
    case Filters.Month:
      entries.value = entryStore.entries.filter(
        (entry) => new Date(entry.date).getMonth() === new Date().getMonth()
      );
      break;
    case Filters.FY:
      entries.value = filterEntriesByFinancialYear(
        entryStore.entries,
        new Date()
      );
      break;
  }
}

function activateEntries(removeOld: boolean = false) {
  // Set selected entries to active
  const selectedIds = new Set(
    entriesSelected.value.map((entry: Entry) => entry.id)
  );
  entries.value.forEach((entry) => {
    if (selectedIds.has(entry.id)) {
      entry.status.state = EntryState.Active;
    } else if (removeOld && entry.status.state === EntryState.Active) {
      entry.status.state = EntryState.Draft;
    }
  });

  printInvoice(false);
}

function printInvoice(do_check: boolean = true) {
  // if there is a mismatch between the active and selected entries, show a dialog
  const mismatch = entryStore.activeEntries.some(
    (entry: Entry) => !entriesSelected.value?.includes(entry)
  );

  if (mismatch && do_check) {
    confirmDialogVisible.value = true;
  } else if (do_check) {
    activateEntries(false);
  } else {
    // print the invoice
    console.log("Printing invoice");
    window.open(
      router.resolve({ path: "/sheet", query: { print: "true" } }).href,
      "_blank"
    );
  }
}
</script>

<style scoped>
main {
  height: 100%;
  padding: 1rem;
  display: grid;
  grid-template-columns: 1fr;
}

main div {
  overflow-y: auto;
}

.hr {
  border-bottom: #fff 1px solid;
}

.filters {
  display: flex;
  gap: 1rem;
}

.filters .p-tag {
  cursor: pointer;
  font-size: 1rem;
  font-weight: 800;
}

.inactive {
  opacity: 0.5;
}

.to-end {
  margin-left: auto;
}

.to-left {
  margin-right: auto;
}

.invoice_grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}
</style>
