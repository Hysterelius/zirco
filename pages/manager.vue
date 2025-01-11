<!-- eslint-disable @typescript-eslint/no-unused-vars -->
<template>
  <main>
    <Toast />
    <Toolbar class="spacing_bar sticky_top">
      <template #start>
        <Button label="New" icon="pi pi-plus" class="mr-2" @click="openNew" />
        <Button
          label="Delete"
          icon="pi pi-trash"
          severity="danger"
          outlined
          :disabled="!entriesSelected || !entriesSelected.length"
          @click="confirmDeleteSelected"
        />
      </template>

      <!-- <template #end>
        <FileUpload
          mode="basic"
          accept="image/*"
          :max-file-size="1000000"
          label="Import"
          custom-upload
          choose-label="Import"
          class="mr-2"
          auto
          :choose-button-props="{ severity: 'secondary' }"
        />
        <Button
          label="Export"
          icon="pi pi-upload"
          severity="secondary"
          @click="exportCSV($event)"
        />
      </template> -->
    </Toolbar>

    <div class="card">
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
            {{ new Date(slotProps.data.date).toLocaleDateString("en-AU") }}
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
        <Column v-if="areBreaks" field="breaks" header="Breaks">
          <template #body="slotProps">
            <span v-if="slotProps.data.calcs.totalBreakTime"
              >{{ slotProps.data.calcs.totalBreakTime.toFixed(2) }} hrs</span
            >
          </template>
        </Column>
        <Column :exportable="false" class="space_buttons">
          <template #body="slotProps">
            <Button
              icon="pi pi-pencil"
              class="mr-2"
              outlined
              rounded
              severity="contrast"
              @click="editEntry(slotProps.data)"
            />
            <Button
              icon="pi pi-trash"
              class="mr-2"
              outlined
              rounded
              severity="danger"
              @click="deleteProduct(slotProps.data)"
            />
          </template>
        </Column>
      </DataTable>

      <Dialog v-model:visible="entryDialog" header="Add Invoice">
        <div class="spread-out">
          <div>
            <label for="item">Item</label>
            <InputText
              id="item"
              v-model.trim="selectedEntry.item"
              required="true"
              autofocus
              :invalid="!selectedEntry.item"
              fluid
            />
          </div>
          <div>
            <label for="date">Date</label>
            <DatePicker
              id="date"
              v-model.trim="selectedEntry.date"
              date-format="dd/mm/yy"
              required="true"
              :invalid="!selectedEntry.date"
              fluid
              show-icon
              :max-date="new Date()"
              :min-date="new Date(2000, 0, 1)"
              icon-display="input"
            />
          </div>
          <div>
            <label for="start_time">Start Time</label>
            <DatePicker
              v-model="selectedEntry.start_time"
              required="true"
              time-only
              fluid
              hour-format="24"
              :invalid="selectedEntry.start_time >= selectedEntry.end_time"
            />
          </div>
          <div>
            <label for="end_time">End Time</label>
            <DatePicker
              v-model="selectedEntry.end_time"
              required="true"
              time-only
              fluid
              hour-format="24"
              :invalid="selectedEntry.start_time >= selectedEntry.end_time"
            />
          </div>

          <!-- break controls -->
          <div>
            <Checkbox
              v-model="selectedEntry.calcs.breaks"
              input-id="breaks"
              name="Breaks"
              binary
            />
            <label for="breaks"> Breaks </label>
          </div>

          <!-- break management -->

          <div v-if="selectedEntry.calcs.breaks">
            <div
              v-for="(breakItem, index) in selectedEntry.breaks"
              :key="index"
              class="break"
            >
              <div>
                <label for="break.start_time">Start Time</label>
                <DatePicker
                  v-model="breakItem.start_time"
                  required="true"
                  size="small"
                  time-only
                  fluid
                  hour-format="24"
                  :invalid="breakItem.start_time >= breakItem.end_time"
                />
              </div>
              <div>
                <label for="break.end_time">End Time</label>
                <DatePicker
                  v-model="breakItem.end_time"
                  required="true"
                  size="small"
                  time-only
                  fluid
                  hour-format="24"
                  :invalid="breakItem.start_time >= breakItem.end_time"
                />
              </div>

              <div>
                <label for="break.category">Category</label>
                <Select
                  v-model="breakItem.category"
                  :options="Object.values(BreakCategory)"
                  required="true"
                  size="small"
                  :invalid="!breakItem.category"
                  fluid
                >
                  <template #value="slotProps">
                    <div class="align_center">
                      <Icon :name="breakIcons(slotProps.value)" />
                      <div>{{ slotProps.value }}</div>
                    </div>
                  </template>
                  <template #option="slotProps">
                    <div class="align_center">
                      <Icon :name="breakIcons(slotProps.option)" />
                      <div>{{ slotProps.option }}</div>
                    </div>
                  </template>
                </Select>
              </div>
              <div>
                <Button
                  variant="text"
                  icon="pi pi-trash"
                  severity="danger"
                  @click="
                    undoStackModal.push(selectedEntry) &&
                      (redoStackModal = []) &&
                      selectedEntry.breaks?.splice(index, 1)
                  "
                />
              </div>
            </div>

            <div>
              <Button
                variant="text"
                size="small"
                label="Add Break"
                icon="pi pi-plus"
                @click="addBreak"
              />
            </div>
          </div>

          <div class="end_buttons">
            <Button
              type="button"
              label="Cancel"
              severity="secondary"
              @click="entryDialog = false"
            />
            <Button
              type="button"
              label="Save"
              :disabled="
                !selectedEntry.item ||
                !selectedEntry.date ||
                !selectedEntry.start_time ||
                !selectedEntry.end_time ||
                selectedEntry.start_time >= selectedEntry.end_time
              "
              @click="saveEntry"
            />
          </div>
        </div>
      </Dialog>

      <Dialog
        v-model:visible="deleteMultipleEntries"
        header="Confirm"
        :modal="true"
      >
        <div class="display_delete">
          <i class="pi pi-exclamation-triangle" style="font-size: 2rem" />
          <span v-if="entriesSelected && entriesSelected.length"
            >Are you sure you want to delete the selected invoices?</span
          >
        </div>
        <template #footer>
          <Button
            label="No"
            icon="pi pi-times"
            text
            @click="deleteMultipleEntries = false"
          />
          <Button
            label="Yes"
            icon="pi pi-check"
            text
            @click="deleteSelectedEntries"
          />
        </template>
      </Dialog>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { doCalculations, EntryState, type Entry } from "~/stores/entries";
const basic_entry: Entry = {
  id: "",
  item: "",
  date: new Date(),
  start_time: new Date(),
  end_time: new Date(),
  status: { state: EntryState.Draft },
  calcs: {
    totalBreakTime: 0,
    totalHours: 0,
    netHours: 0,
    breaks: false,
  },
};

const entryStore = useEntryData();
const entries = entryStore.entries;
// const toast = useToast();
const entriesSelected = ref<Entry[] | undefined>();
const deleteMultipleEntries = ref<boolean>(false);
const entryDialog = ref<boolean>(false);
const selectedEntry = ref<Entry>(basic_entry);
const areBreaks = computed(() =>
  entries.some((item: Entry) => item.calcs.breaks)
);

const undoStackMain = ref<Entry[][]>([]);
const redoStackMain = ref<Entry[][]>([]);

const undoStackModal = ref<Entry[]>([]);
const redoStackModal = ref<Entry[]>([]);

function openNew() {
  selectedEntry.value = basic_entry;
  selectedEntry.value.id = "";
  console.log("New entry:", selectedEntry.value, basic_entry);
  entryDialog.value = true;
}

function saveEntry() {
  const entry = JSON.parse(JSON.stringify(selectedEntry.value));

  entry.date = new Date(entry.date);
  entry.start_time = new Date(entry.start_time);
  entry.end_time = new Date(entry.end_time);

  if (entry.breaks) {
    entry.breaks = entry.breaks.map((b: Break) => ({
      ...b,
      start_time: new Date(b.start_time),
      end_time: new Date(b.end_time),
    }));
  }

  entry.calcs = doCalculations(entry);

  if (entry.id != "") {
    entryStore.editEntry(entry);
  } else {
    entry.id = crypto.randomUUID();
    entry.status.state = EntryState.Draft;
    entryStore.addEntry(entry);
  }

  entryDialog.value = false;
}

function addBreak() {
  if (!selectedEntry.value.breaks) {
    selectedEntry.value.breaks = [];
  }

  selectedEntry.value.breaks?.push({
    start_time: new Date(),
    end_time: new Date(),
    category: BreakCategory.Other,
  });
}

function editEntry(entry: Entry) {
  console.log("Incoming edit:", entry);

  selectedEntry.value = entry;
  entryDialog.value = true;
}

function deleteProduct(product: Entry) {
  console.log("Deleting entry:", product);
  undoStackMain.value.push(entries);
  entryStore.removeEntry(product);
}

function confirmDeleteSelected() {
  deleteMultipleEntries.value = true;
}

function deleteSelectedEntries() {
  if (entriesSelected.value) {
    entryStore.removeEntries(entriesSelected.value);
    entriesSelected.value = undefined;
    deleteMultipleEntries.value = false;
  }
}

function undoMain() {
  if (undoStackMain.value.length) {
    redoStackMain.value.push(entries);
    entryStore.updateEntries(undoStackMain.value.pop() || []);
    undoStackMain.value = [];
  }
}

function redoMain() {
  if (redoStackMain.value.length) {
    undoStackMain.value.push(entries);
    entryStore.updateEntries(redoStackMain.value.pop() || []);
    redoStackMain.value = [];
  }
}

function undoModal() {
  if (undoStackModal.value.length) {
    redoStackModal.value.push(selectedEntry.value);
    selectedEntry.value = undoStackModal.value.pop() || basic_entry;
    undoStackModal.value = [];
  }
}

function redoModal() {
  if (redoStackModal.value.length) {
    undoStackModal.value.push(selectedEntry.value);
    selectedEntry.value = redoStackModal.value.pop() || basic_entry;
    redoStackModal.value = [];
  }
}

function undo() {
  if (entryDialog.value) {
    undoModal();
  } else {
    undoMain();
  }
}

function redo() {
  if (entryDialog.value) {
    redoModal();
  } else {
    redoMain();
  }
}

useEventListener("keydown", (e) => {
  if (e.ctrlKey && e.key === "z") {
    undo();
  } else if (e.ctrlKey && e.key === "y") {
    redo();
  }
});
</script>

<style scoped>
main {
  padding: 2rem;
}

.spread-out {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.spacing_bar :deep(div) {
  display: flex;
  gap: 0.5rem;
}

.end_buttons {
  display: flex;
  justify-content: end;
  gap: 0.5rem;
}

:deep(.space_buttons) button:not(:first-child) {
  margin-left: 0.5rem;
}

.display_delete {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.break {
  display: grid;
  grid-template-columns: 5fr 5fr 3fr auto;
  gap: 0.25rem;
  width: 100%;
  align-items: end;
}

.align_center {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.sticky_top {
  position: sticky;
  top: 0;
  z-index: 1;
}
</style>
