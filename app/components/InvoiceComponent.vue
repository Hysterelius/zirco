<template>
  <div class="bg-white text-black a4 px-10 py-14">
    <div class="grid grid-cols-2">
      <div>
        <h1
          class="text-4xl font-medium"
          :class="{
            'opacity-25': !settings?.first_name,
          }"
        >
          {{ settings?.first_name || defaultSettings.first_name }}
        </h1>
        <h2
          class="text-4xl font-semibold"
          :class="{
            'opacity-25': !settings?.last_name,
          }"
        >
          {{ settings?.last_name || defaultSettings.last_name }}
        </h2>
        <div class="grid grid-cols-[auto_1fr] gap-4">
          <span class="font-bold">ABN:</span>
          <span
            :class="{
              'opacity-25': !settings?.abn,
            }"
          >{{ settings?.abn || defaultSettings.abn }}</span>
          <span class="font-bold">To:</span>
          <div>
            <p
              :class="{
                'opacity-25': !settings?.business_name,
              }"
            >
              {{ settings?.business_name || defaultSettings.business_name }}
            </p>
            <p
              :class="{
                'opacity-25': !settings?.address_line_1,
              }"
            >
              {{ settings?.address_line_1 || defaultSettings.address_line_1 }}
            </p>
            <p
              :class="{
                'opacity-25': !settings?.address_line_2,
              }"
            >
              {{ settings?.address_line_2 || defaultSettings.address_line_2 }}
            </p>
          </div>
        </div>
      </div>
      <div>
        <h2 class="text-4xl">
          Invoice #5
        </h2>
        <span>
          Date Issued: {{ formadivate(new Date()) }}
        </span>
      </div>
    </div>
    <!-- Actual invoice data -->
    <div class="text-sm text-left">
      <div class="w-full grid grid-cols-[3fr_1fr_1fr_1fr] mt-4 gap-y--2">
        <div class="contents *:border-b-2 *:border-black">
          <div>
            Description
          </div>
          <div>
            Rate
          </div>
          <div class="text-right">
            Hours
          </div>
          <div class="text-right">
            Amount
          </div>
        </div>
        <div class="contents tabular-nums">
          <div class="font-bold">
            Hourly Contract Work
          </div>
          <div>
            $100.00
          </div>
          <div class="text-right">
            10
          </div>
          <div class="text-right mb-6">
            $1,000.00
          </div>
        </div>
        <div class="contents tabular-nums">
          <div />
          <div class="border-y-1 border-gray-300 py-1">
            Subtotal
          </div>
          <div class="text-right border-y-1 border-gray-300 py-1">
            10
          </div>
          <div class="text-right border-y-1 border-gray-300 py-1">
            $1,000.00
          </div>
        </div>
        <div class="contents tabular-nums">
          <div />
          <div class="py-1 font-black">
            Total
          </div>
          <div />
          <div class="text-right py-1 font-black">
            $1,000.00
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps<{
  settings?: Settings;
}>();

function formadivate(date: Date): string {
  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
  return date.toLocaleDateString('en-GB', options); // 'en-GB' gives day-mondiv-year order and full mondiv name
}

const settings = ref(props.settings || useSettings());
</script>

<style>
.a4 {
  /* should maintain a4 ratio but doesn't need to be a4 in particular, priorise */
  aspect-ratio: 1 / sqrt(2);
  /* same font size */

  display: block;
}

@page {
  size: A4;
  margin: 0;
}
@media print {
  .a4 {
    width: 210mm;
    height: 297mm;
  }

  :root {
    background-color: white;
  }
}
</style>
