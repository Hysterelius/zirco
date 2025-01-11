import type { PaySettings } from "./settings";
import { defineStore } from "pinia";
import { computed } from "vue";
import type { Entry } from "./entries";

interface Invoice {
  id: number;
  entries: Entry[];
  issuingDetails: IssuingDetails;
  monetaryDetails: MonetaryDetails;
  status: InvoiceStatus;
  settings: PaySettings;
}

interface IssuingDetails {
  date: string;
}

interface MonetaryDetails {
  total: number;
}

export enum InvoiceStatus {
  Draft,
  Sent,
}

export default defineStore("invoiceData", () => {
  const invoices = useLocalStorage("invoices", [] as Invoice[]);

  function addInvoice(invoice: Invoice) {
    invoices.value.push(invoice);
  }

  const nextId = computed(() => {
    return invoices.value.length + 1;
  });

  return {
    invoices,
    addInvoice,
    nextId,
  };
});
