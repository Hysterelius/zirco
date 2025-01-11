import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core";
import { watch } from "vue";

export interface Settings {
  [key: string]: unknown;
  firstName: string;
  lastName: string;
  pays: PaySettings;
  payDetails: PayDetails;
  invoice_details: InvoiceDetails;
  payHistory?: Record<string, PaySettings>;
  abn?: string;
  to_details: ToDetails;
}

export interface PaySettings {
  mainRate: number;
  superRate: number;
}

interface PayDetails {
  payID?: string;
  bankDetails: BankDetails;
}

interface BankDetails {
  BSB: string;
  accountNumber: number;
}

interface InvoiceDetails {
  employment: string;
}

interface ToDetails {
  company_name: string;
  address_line1: string;
  address_line2: string;
}

export const defaultSettings: Settings = {
  firstName: "",
  lastName: "",
  pays: {
    mainRate: 15,
    superRate: 0.11,
  },
  payDetails: {
    bankDetails: {
      BSB: "",
      accountNumber: 123456,
    },
  },
  invoice_details: {
    employment: "Acme Inc.",
  },
  to_details: {
    company_name: "Widget Corp",
    address_line1: "123 Main St",
    address_line2: "Woop Woop, TAS 7123",
  },
};


interface SheetSettings {
  showPay: boolean;
}

const defaultSheetSettings: SheetSettings = {
  showPay: true,
};

export const useSettings = defineStore("settings", () => {
  const state = useLocalStorage("settings", defaultSettings);

  const sheet = useLocalStorage("sheet", defaultSheetSettings);

  function updateSettings(settings: Settings) {
    Object.assign(state.value, settings);
  }

  watch(() => state.value.pays, (paySettings) => {
    if (!state.value.payHistory) {
      state.value.payHistory = {};
    }

    const date = new Date().toLocaleDateString("en-AU");

    state.value.payHistory[date] = paySettings;
  });


  return {
    state,
    sheet,
    updateSettings,
  };
});
