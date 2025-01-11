<template>
  <main>
    <h1>Settings</h1>
    <p>Settings page</p>
    <hr>

    <h2>Personal Details:</h2>
    <div class="boxes">
      <FloatLabel variant="on">
        <InputText id="on_label" v-model="settings.state.firstName" />
        <label for="on_label">First Name</label>
      </FloatLabel>
      <FloatLabel variant="on">
        <InputText id="on_label" v-model="settings.state.lastName" />
        <label for="on_label">Last Name</label>
      </FloatLabel>
      <FloatLabel variant="on">
        <InputText
          id="on_label"
          v-model="settings.state.invoice_details.employment"
        />
        <label for="on_label">Company</label>
      </FloatLabel>
      <FloatLabel variant="on">
        <InputMask
          id="basic"
          v-model="settings.state.abn"
          mask="99 999 999 999"
        />
        <label for="on_label">ABN</label>
      </FloatLabel>

      <!-- Upload custom monogram/icon -->
    </div>

    <hr>

    <h2>Payment Details:</h2>
    <div class="boxes">
      <FloatLabel variant="on">
        <InputMask
          id="basic"
          v-model="settings.state.payDetails.bankDetails.BSB"
          mask="999-999"
        />
        <label for="BSB">BSB</label>
      </FloatLabel>
      <FloatLabel variant="on">
        <InputNumber
          id="basic"
          v-model="settings.state.payDetails.bankDetails.accountNumber"
          :use-grouping="false"
        />
        <label for="accountNumber">Account Number</label>
      </FloatLabel>

      <FloatLabel variant="on">
        <InputText id="on_label" v-model="settings.state.payDetails.payID" />
        <label for="payID">Pay ID</label>
      </FloatLabel>
    </div>

    <h4>Pay Details:</h4>
    <div class="boxes">
      <FloatLabel variant="on">
        <InputNumber
          id="on_label"
          v-model="settings.state.pays.mainRate"
          type="number"
          mode="currency"
          currency="AUD"
        />
        <label for="on_label">Pay Rate</label>
      </FloatLabel>
      <FloatLabel variant="on">
        <InputNumber
          id="on_label"
          v-model="settings.state.pays.superRate"
          :min-fraction-digits="0"
          :max-fraction-digits="2"
          type="number"
          suffix="%"
          :max="100"
          :min="0"
        />
        <label for="on_label">Super Percent Rate</label>
      </FloatLabel>

      <Button label="Normalise" @click="normaliseHours(15, items.entries)" />
    </div>

    <hr>


    <h2>Invoice 'To' Details:</h2>
    <div class="boxes">
      <FloatLabel variant="on">
        <InputText id="on_label" v-model="settings.state.to_details.company_name" />
        <label for="on_label">Company Name</label>
      </FloatLabel>
    </div>

    <h4>Address Details:</h4>
    <div class="boxes">
      <FloatLabel variant="on">
        <InputText id="on_label" v-model="settings.state.to_details.address_line1" />
        <label for="on_label">Address Line 1</label>
      </FloatLabel>
      <FloatLabel variant="on">
        <InputText id="on_label" v-model="settings.state.to_details.address_line2" />
        <label for="on_label">Address Line 2</label>
      </FloatLabel>
    </div>
  </main>
</template>

<script setup lang="ts">
import { InputNumber, InputText } from "primevue";

const items = useEntryData();

useHead({
  title: "Settings",
});

const settings = useSettings();
</script>

<style scoped>
main {
  padding: 1rem;
}

.boxes {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

hr {
  margin: 0.5rem 0;
}

h2,
h4 {
  margin: 1rem 0;
}
</style>
