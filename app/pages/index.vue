<template>
  <div class="grid grid-cols-[1fr_3fr_1fr] grid-rows-[auto_1fr] w-full">
    <!-- header -->
    <div class="col-span-3 print:hidden px-4">
      <!-- margin-top from https://stackoverflow.com/questions/34983672/is-there-a-way-to-make-text-characters-flush-to-the-top-of-their-bounding-box-in -->
      <span class="font-mono text-6xl mt-[-0.2em] text-primary">Zirco</span>

      <!-- header -->
    </div>
    <div class="print:hidden m-4 p-2">
      <span class="text-4xl">
        Entries
      </span>
    </div>
    <InvoiceComponent class="h-[80%] place-self-center" />
    <div class="print:hidden m-4 p-2">
      <span class="text-4xl">
        Fields
      </span>
      <span class="flex items-center gap-2 text-xl">
        <UIcon
          name="iconoir:profile-circle"
        />
        Personal Info
      </span>
      <span
        :v-show="printable"
        class="flex items-center gap-2 text-sm italic text-error"
      >
        <UIcon
          name="iconoir:warning-triangle"
        />
        Some fields are missing, please fill them in before printing.
      </span>

      <div class="grid grid-cols-2 gap-4 mb-4">
        <UFormField label="First Name">
          <UInput
            v-model="settings.first_name"
            :placeholder="defaultSettings.first_name"
            variant="soft"
          />
        </UFormField>
        <UFormField label="Last Name">
          <UInput
            v-model="settings.last_name"
            :placeholder="defaultSettings.last_name"
            variant="soft"
          />
        </UFormField>
        <UFormField label="ABN (Australian Business Number)">
          <UInput
            v-model="settings.abn"
            :placeholder="defaultSettings.abn"
            variant="soft"
          />
        </UFormField>
      </div>

      <span class="flex items-center gap-2 text-xl">
        <UIcon
          name="iconoir:industry"
        />
        Recipient Info
      </span>

      <div class="grid grid-cols-2 gap-4 mb-4">
        <UFormField label="Business Name">
          <UInput
            v-model="settings.receiving_business.business_name"
            :placeholder="defaultSettings.receiving_business.business_name"
            variant="soft"
          />
        </UFormField>
        <UFormField label="Address Line 1">
          <UInput
            v-model="settings.receiving_business.address_line_1"
            :placeholder="defaultSettings.receiving_business.address_line_1"
            variant="soft"
          />
        </UFormField>
        <UFormField label="Address Line 2">
          <UInput
            v-model="settings.receiving_business.address_line_2"
            :placeholder="defaultSettings.receiving_business.address_line_2"
            variant="soft"
          />
        </UFormField>
      </div>

      <span class="flex items-center gap-2 text-xl">
        <UIcon
          name="iconoir:coins"
        />
        Payment Info
      </span>

      <div class="grid grid-cols-2 gap-4 mb-4">
        <UFormField label="Business Name">
          <UInput
            v-model="settings.receiving_business.business_name"
            :placeholder="defaultSettings.receiving_business.business_name"
            variant="soft"
          />
        </UFormField>
        <UFormField label="Address Line 1">
          <UInput
            v-model="settings.receiving_business.address_line_1"
            :placeholder="defaultSettings.receiving_business.address_line_1"
            variant="soft"
          />
        </UFormField>
        <UFormField label="Address Line 2">
          <UInput
            v-model="settings.receiving_business.address_line_2"
            :placeholder="defaultSettings.receiving_business.address_line_2"
            variant="soft"
          />
        </UFormField>
      </div>

      <span class="flex items-center gap-2 text-xl">
        <UIcon
          name="iconoir:page-flip"
        />
        Invoice Info
      </span>

      <UFormField
        label="Invoice Type"
        class="my-1.5"
        description="Switch between either being a time based or quantity based invoice"
      >
        <USwitch
          label="Time"
          checked-icon="iconoir:clock"
          unchecked-icon="iconoir:box-iso"
        />
      </UFormField>

      <div class="grid grid-cols-2 gap-4">
        <UFormField
          label="Currency Symbol"
          class="my-1.5"
        >
          <USelect
            :items="currencies"
            class="w-full"
          />
        </UFormField>
      </div>

      <span class="flex items-center gap-2 text-lg">
        <UIcon
          name="iconoir:alarm"
        />
        Timesheet Info
      </span>
      <div class="grid grid-cols-2 gap-4 mb-4">
        <UFormField label="Hourly Rate">
          <UInputNumber
            orientation="vertical"
            variant="soft"
            :min="0"
            :step-snapping="false"
            :format-options="{
              style: 'currency',
              currencyDisplay: 'symbol',
              currencySign: 'accounting',
              currency: 'USD',
            }"
          />
        </UFormField>
        <UFormField label="Superannuation/Pension Rate">
          <UInputNumber
            orientation="vertical"
            variant="soft"
            :min="0"
            :step-snapping="false"
            :step="0.01"
            :format-options="{
              style: 'percent',
            }"
          />
        </UFormField>
        <UFormField
          label="Tax System"
          description="Very limited support"
        >
          <USelectMenu
            :items="tax_systems"
            class="w-full"
            variant="soft"
          />
        </UFormField>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
const settings = useSettings();

const currencies = ['$ Dollar', '€ Euro', '£ Pound', '¥ Yen', '₹ Rupee', '₩ Won'];
const tax_systems = ['AUS'];

const printable = ref(
  // check that all values in settings are filled
  Object.values(settings).every(value => value !== null && value !== ''),
);
</script>

<style>

</style>
