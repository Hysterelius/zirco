<script setup lang="ts">
import { useTitle } from "@vueuse/core";
import { ref, watch } from "vue";
import type { Entry } from "../stores/entries";
import { useRoute } from "vue-router";
import { InvoiceStatus } from "../stores/invoices";
const entriesStore = useEntryData();
const invoiceStore = invoices();
const settings = useSettings();
const showAside = useSessionStorage("showAside", false);

// if some settings are missing, use default values
for (const key in settings.state) {
	if (settings.state[key] === undefined) {
		settings.state[key] = defaultSettings[key];	
	}
}

declare global {
	interface Number {
		toBSB(): string;
	}
}

watch(
	() => invoiceStore.nextId,
	(newId) => {
		useTitle(
			`Invoice #${newId} - ${settings.state?.firstName[0]}${settings.state?.lastName[0]}`
		);
	},
	{ immediate: true }
);

const route = useRoute();
const print = Object.prototype.hasOwnProperty.call(route.query, "print");
const show: number = Number(route.query.show ?? 0);
const inline = show > 0;

const id = computed(() => {
	return show > 0 ? show : invoiceStore.nextId;
});

let pays_settings: PaySettings;
const hide = ref(false);

let items: Entry[];
if (inline) {
	// if invoice doesn't exist show nothing
	if (!invoiceStore.invoices.find((invoice) => invoice.id === show)) {
		console.log("not found");
		hide.value = true;
	}

	console.log("showing");
	// add css to root html element
	document.documentElement.classList.add("print-esque");

	items =
		invoiceStore.invoices.find((invoice) => invoice.id === show)?.entries ?? [];

	// run do calculations on all active entries
	items.forEach((entry: Entry) => {
		entry.date = new Date(entry.date);
		entry.start_time = new Date(entry.start_time);
		entry.end_time = new Date(entry.end_time);

		if (entry.breaks) {
			entry.breaks.forEach((b) => {
				b.start_time = new Date(b.start_time);
				b.end_time = new Date(b.end_time);
			});
		}
	});

	// sort entries by date
	items.sort((a, b) => {
		const aDate = new Date(a.date);
		const bDate = new Date(b.date);

		// if either date is invalid, return error
		if (isNaN(aDate.getTime()) || isNaN(bDate.getTime())) {
			throw new Error("Invalid date");
		}

		if (aDate < bDate) return -1;
		if (aDate > bDate) return 1;
		return 0;
	});

	pays_settings = invoiceStore.invoices.find((invoice) => invoice.id === show)
		?.settings ?? {
		mainRate: 0,
		superRate: 0,
	};
} else {
	items = entriesStore.activeEntries;
	// run do calculations on all active entries
	items.forEach((item: Entry) => {
		item.calcs = doCalculations(item);
	});

	pays_settings = settings.state.pays;
}

const lastDate = computed(() => {
	const lastItem = items.findLast((item: Entry) => item.date !== undefined);
	return lastItem ? new Date(lastItem.date) : new Date();
});

const firstDate = computed(() => {
	const firstItem = items.find((item: Entry) => item.date !== undefined);

	return firstItem ? new Date(firstItem.date) : new Date();
});

const dateIssued = computed(() => {
	const date = new Date().toLocaleDateString("en-GB", {
		day: "numeric",
		month: "short",
		year: "numeric",
	});
	const match = date.match(/(\d{1,2}) (.*)/);
	if (match) {
		const [_, day, month_year] = match;

		const dayNumber = Number(day);
		const suffixes = ["th", "st", "nd", "rd"];
		const value = dayNumber % 100;
		const ordinal =
			suffixes[(value - 20) % 10] || suffixes[value] || suffixes[0];

		return [day, ordinal, month_year];
	}
	return [];
});
const daysIn = ref(
	// if first date and last date are the same, return the days in the month
	// otherwise, the difference between the two dates

	firstDate.value.getMonth() === lastDate.value.getMonth() &&
		firstDate.value.getFullYear() === lastDate.value.getFullYear()
		? daysInMonth(lastDate.value.getMonth(), lastDate.value.getFullYear())
		: daysDifference(firstDate.value, lastDate.value)
);

function daysDifference(date1: Date, date2: Date) {
	return (
		Math.ceil(
			Math.abs(date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24)
		) + 1
	);
}

const superR =
	pays_settings.superRate > 1
		? pays_settings.superRate / 100
		: pays_settings.superRate;

const pays = {
	mainRate: pays_settings.mainRate,
	superRate: superR * pays_settings.mainRate,
};

function accFormat(str: string) {
	if (str.length % 2 === 0) {
		const half = str.length / 2;
		return str.slice(0, half) + " " + str.slice(half);
	}
	return str;
}

function daysInMonth(month: number, year: number) {
	return new Date(year, month + 1, 0).getDate();
}

// Get date in format: 09/2024
function getFormattedDate() {
	return lastDate.value.toLocaleDateString("en-AU", {
		month: "2-digit",
		year: "numeric",
	});
}

const areBreaks = items.some((item: Entry) => item.calcs.breaks);

const total = items.reduce((acc: number, item: Entry) => {
	return acc + item.calcs.netHours;
}, 0);

function HourFormat(hours: number) {
	return hours.toFixed(2);
}

function MoneyFormat(amount: number) {
	return "$" + amount.toFixed(2);
}

useEventListener("load", () => {
	if (print) {
		window.print();
		// close page
		window.close();
	}
});

useEventListener("afterprint", () => {
	if (inline || toBlur.value) {
		return;
	}

	console.log("after print");
	// add to the invoices store
	invoiceStore.addInvoice({
		id: invoiceStore.nextId,
		entries: items,
		issuingDetails: {
			date: new Date().toISOString(),
		},
		monetaryDetails: {
			total: total * pays.mainRate + total * pays.superRate,
		},
		status: InvoiceStatus.Sent,
		settings: {
			mainRate: pays.mainRate,
			superRate: pays.superRate,
		},
	});

	// assumes that print was successful, changes status of all printed items to sent
	items.forEach((item: Entry) => {
		if (item.status?.state === EntryState.Active) {
			item.status.state = EntryState.Sent;
		}
	});
});

// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Main calculations
// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

const gross_pay = Math.round(total * pays.mainRate * 100) / 100;
const super_pay = Math.round(total * pays.superRate * 100) / 100;
const net_pay = gross_pay + super_pay;

// const tax = calculateTax(total * pays.mainRate, 0);

Number.prototype.toBSB = function () {
	return this.toString().replace(/(\d{3})(\d{3})/, "$1-$2");
};

const toBlur = ref(
	!settings.state.payDetails.bankDetails.BSB ||
		!settings.state.firstName ||
		!settings.state.payDetails.bankDetails.accountNumber
);

watch(
	() => (
		settings.state.payDetails.bankDetails.BSB,
		settings.state.firstName,
		settings.state.payDetails.bankDetails.accountNumber
	),
	() => {
		if (
			(!settings.state.payDetails.bankDetails.BSB ||
				!settings.state.firstName ||
				!settings.state.payDetails.bankDetails.accountNumber) &&
			!inline
		) {
			// add new css to webpage
			toBlur.value = true;
		} else {
			toBlur.value = false;
		}
	}
);

// check focus for warning inputs
const bsbInput = ref<HTMLInputElement | null>(null);
const bsbFocus = useFocus(bsbInput).focused;

const firstNameInput = ref<HTMLInputElement | null>(null);
const firstNameFocus = useFocus(firstNameInput).focused;

const accountNumberInput = ref<HTMLInputElement | null>(null);
const accountNumberFocus = useFocus(accountNumberInput).focused;


const customise_warn = (content: string, _name: string, prefix: string, _provider: string) => {
	console.log("Customise", content, prefix, prefix !== 'tabler', content.replace(/stroke="[^"]*"/g, `stroke="#1c1b22"`).replace(/fill="[^"]*"/g, `fill="#fb923c"`));

  return content
    .replace(/fill="[^"]*"/g, `fill="#fb923c" stroke="#1c1b22" stroke-width="0.05rem"`) // Change fill color to red
}
</script>

<template>
	<main v-if="!hide">
		<article>
			<dialog v-if="toBlur" class="blurDialog" open>
				<h1>Cannot print payslip with insufficient details</h1>
				<hr >
				<h3>Missing details:</h3>
				<ul>
					<li v-if="!settings.state.payDetails.bankDetails.BSB">
						<p>BSB</p>
					</li>
					<li v-if="!settings.state.firstName">
						<p>First Name</p>
					</li>
					<li v-if="!settings.state.payDetails.bankDetails.accountNumber">
						<p>Account Number</p>
					</li>
				</ul>
			</dialog>

			<div class="title_block">
				<div class="name fancy_g">
					<h2 class="medium">{{ settings.state.firstName }}</h2>
					<h1 class="semi-bold">{{ settings.state.lastName }}</h1>
					<p v-if="settings.state.abn">
						<span class="medium">ABN:&nbsp;</span>
						<span class="disambiguate">{{ settings.state.abn }}</span>
					</p>
					<br >
					<div>
						<p class="medium">
							To:
							<span class="bold">
								{{ settings.state.to_details.company_name }}
							</span>
						</p>
						<p class="disambiguate">
							{{ settings.state.to_details.address_line1 }}
						</p>
						<p class="disambiguate">
							{{ settings.state.to_details.address_line2 }}
						</p>
					</div>
				</div>
				<div class="extra">
					<h1 class="name fancy_g medium" :class="{ blurred: toBlur }">
						Invoice #{{ id }}
					</h1>
					<p class="discard_space">
						<span class="medium">Date Issued:</span>
						{{ dateIssued[0] }}
						<!---->
						<sup>{{ dateIssued[1] }}</sup>
						{{ dateIssued[2] }}
					</p>
					<p>
						<span class="medium">Period Days:</span>
						{{ daysIn }}
					</p>
				</div>
			</div>

			<div class="title_block bank">
				<div class="bank_details">
					<h3>Payment details:</h3>
					<div class="disambiguate">
						<div v-if="settings.state.payDetails.payID" class="border_bottom">
							<p>PayID: {{ settings.state.payDetails.payID }}</p>
						</div>
						<div>
							<p>BSB: {{ settings.state.payDetails.bankDetails.BSB }}</p>
							<p>
								Account number:
								{{
									accFormat(
										settings.state.payDetails.bankDetails.accountNumber.toString()
									)
								}}
							</p>
						</div>
					</div>
				</div>
			</div>

			<!-- Invoice data -->
			<div class="invoice">
				<h1 class="extra-bold">{{ getFormattedDate() }}</h1>
				<div class="disambiguate contents">
					<table class="invoice-table main-table" :class="{ blurred: toBlur }">
						<thead>
							<tr>
								<th>Item</th>
								<th>Date</th>
								<th>Start time</th>
								<th>End time</th>
								<th v-if="areBreaks">Gross Hours</th>
								<th v-if="areBreaks">Breaks</th>
								<th>Net hours</th>
							</tr>
						</thead>
						<tbody class="banding">
							<tr v-for="item in items" :key="item.id">
								<td>{{ item.item }}</td>
								<td>
									{{ item.date.toLocaleDateString("en-AU") }}
								</td>
								<td>
									{{
										item.start_time
											.toLocaleTimeString([], {
												hour: "2-digit",
												minute: "2-digit",
												hour12: true,
											})
											.replace(/ (am|pm)$/, "")
									}}
									<span class="am-pm">
										{{ item.start_time.getHours() >= 12 ? "PM" : "AM" }}
									</span>
								</td>
								<td>
									{{
										item.end_time
											.toLocaleTimeString([], {
												hour: "2-digit",
												minute: "2-digit",
												hour12: true,
											})
											.replace(/ (am|pm)$/, "")
									}}
									<span class="am-pm">
										{{ item.end_time.getHours() >= 12 ? "PM" : "AM" }}
									</span>
								</td>
								<td v-if="areBreaks">
									{{ HourFormat(item.calcs.totalHours) }}
								</td>
								<td v-if="areBreaks">
									{{ HourFormat(item.calcs.totalBreakTime) }}
								</td>
								<td>
									{{ HourFormat(item.calcs.netHours) }}
								</td>
							</tr>
						</tbody>
					</table>

					<div class="align-end">
						<h3 class="bold">Totals:</h3>
						<table
							class="invoice-table total-table"
							:class="{ blurred: toBlur }"
						>
							<thead class="total">
								<tr>
									<th>Item</th>
									<th>Hours</th>
									<th>Rate</th>
									<th>Amount</th>
								</tr>
							</thead>

							<tbody>
								<tr>
									<td>Gross Pay</td>
									<td>{{ HourFormat(total) }}</td>
									<td>{{ MoneyFormat(pays.mainRate) }}</td>
									<td>{{ MoneyFormat(gross_pay) }}</td>
								</tr>
								<!--
              <tr class="italic tax">
                <td>Inclusive: Tax</td>
                <td />
                <td />
                <td>{{ MoneyFormat(tax) }}</td>
              </tr>
              -->
								<tr v-if="pays.superRate > 0">
									<td>Superannuation</td>
									<td />
									<td>${{ pays.superRate }}</td>
									<td>{{ MoneyFormat(super_pay) }}</td>
								</tr>
							</tbody>

							<tfoot>
								<tr>
									<td class="medium">Net Pay</td>
									<td />
									<td />
									<td class="semi-bold">
										{{ MoneyFormat(net_pay) }}
									</td>
								</tr>
							</tfoot>
						</table>
					</div>
				</div>
			</div>
		</article>

		<aside>
			<!--Sidebar Styling--> 
			<div v-if="!showAside" class="extend-contain">
				<Icon
					name="tabler:layout-sidebar-right-expand"
					class="aside_icon"
					@click="showAside = !showAside"
				/>
				<Icon
				v-if="toBlur"
				name="tabler:alert-octagon-filled"
				class="warn-icon-outside"
				:customize="customise_warn"
				/>
			</div>

			<div v-if="showAside" class="full-aside">
				<Icon
					name="tabler:layout-sidebar-right-collapse"
					class="aside_icon"
					@click="showAside = !showAside"
				/>
				<div v-if="toBlur || bsbFocus || firstNameFocus || accountNumberFocus" class="warningBlock">
					<div class="warn-icon-container">
						<i class="pi pi-exclamation-triangle warn-icon" />
					</div>
					<span class="missing-fields">
						Warnings
						<div>
							<h4>Missing data</h4>

							<div
								v-if="!settings.state.payDetails.bankDetails.BSB || bsbFocus"
							>
								<FloatLabel variant="on">
									<InputMask
										id="basic"
										ref="bsbInput"
										v-model="settings.state.payDetails.bankDetails.BSB"
										mask="999-999"
									/>
									<label for="BSB">BSB</label>
								</FloatLabel>
							</div>

							<div v-if="!settings.state.firstName || firstNameFocus">
								<FloatLabel variant="on">
									<InputText
										ref="firstNameInput"
										v-model="settings.state.firstName"
										placeholder="First Name"
									/>
									<label for="firstName">First Name</label>
								</FloatLabel>
							</div>

							<div
								v-if="
									!settings.state.payDetails.bankDetails.accountNumber ||
									accountNumberFocus
								"
							>
								<FloatLabel variant="on">
									<InputNumber
										id="basic"
										v-model="
											settings.state.payDetails.bankDetails.accountNumber
										"
										:use-grouping="false"
									/>
									<label for="accountNumber">Account Number</label>
								</FloatLabel>
							</div>
						</div>
					</span>
				</div>

				<div class="settings-sheet">
					<h4>Settings</h4>

					<ToggleButton
						v-model="settings.sheet.showPay"
						aria-label="Show Pay"
						on-label="Pay & Hours"
						off-label="Only Hours"
					/>
				</div>
			</div>
		</aside>
	</main>
</template>

<style scoped>
@import url("/assets/css/type.css");

/* make the page a4 size */
@page {
	size: A4;
	margin: 0;
	background-color: #fff;
}

@media print {
	article {	
		height: 100%;
		width: 100%;
		margin: 0;
	}

	main {
		height: 100%;
		margin: 0;
	}

	.blurred {
		filter: blur(5px);
	}

	.blurDialog {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		background-color: white;
		border-radius: 1rem;
		border: red 2px solid;
	}

	aside {
		display: none;
	}
}

article {
	padding: 1cm;
	display: flex;
	flex-direction: column;
	color: #000;
	margin-left: auto;
	margin-right: auto;
}
/* Not media print */

@media screen {
	article {
		width: 21cm;
		height: 29.7cm;
		border: 1px solid #000;
		background-color: #fff;

	}

	.blurDialog {
		display: none;
	}
}

main {
	display: flex;
	font-family: "Inter", sans-serif;
}

aside {
	padding: 0.5cm;
}

.aside_icon {
	width: 2rem;
	height: 2rem;

	cursor: pointer;
}

.warn-icon-container {
	display: flex;
	flex-direction: column;
	gap: 0.25rem;
}

.warn-icon {
	padding-left: 0.2rem;
	color: var(--p-button-warn-border-color);
	font-size: 1.2rem;
}

.warn-bar {
	flex: 1;
	width: 2px;
	border-radius: 2px;
	background-color: var(--p-button-warn-border-color);

}

.warningBlock {
	border: 1px solid var(--p-button-danger-border-color);
	border-radius: 0.5rem;
	padding: 0.5rem;
	background-color: var(--p-button-danger-color);

	display: flex;
	gap: 0.25rem;
}

.extend-contain {
	position: relative;
}

.warn-icon-outside {
	position: absolute;
	bottom: 0;
	right: 0;
	pointer-events: none;

}

.full-aside {
	display: flex;
	flex-direction: column;
	gap: 0.25rem;
}

.show main {
	height: 100%;
}

.show .blurred {
	filter: blur(5px);
}

.show .blurDialog {
	position: fixed;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	background-color: white;
	border-radius: 1rem;
	border: red 2px solid;
}

.print-esque main {
	scale: 0.3;
	transform-origin: top left;
	font-size: 1.4rem;
	/* stop user from selecting text */
	user-select: none;
}

.icon svg {
	width: 1cm;
	height: auto;
}

.title_block {
	display: flex;
	justify-content: space-between;
}

.name h1,
.name h2 {
	margin: 0;
	font-size: 1cm;
	line-height: 1;
}

.title_block .extra * {
	text-align: right;
}

.extra {
	font-size: 0.5cm;
	line-height: 1.5;
}

.table {
	display: inline grid;
	grid-template-columns: 1fr 1fr;
	gap: 0.5cm;
}

.disambiguate {
	font-feature-settings: "tnum", "case", "ss04";
}

.border_bottom {
	border-bottom: 1px solid #000;
}

.bank_details {
	margin-top: 1cm;
	display: inline-block;
	line-height: 1.5;
}

.invoice {
	margin: 1cm 1cm;
	padding: 0.25cm;
	background-color: #f0f0f0;
	flex: 1;

	display: flex;
	flex-direction: column;
}

.invoice h1 {
	margin: 0;
	font-size: 1.5cm;
	line-height: 1;
	opacity: 0.1;
}

.invoice-table {
	width: 100%;
	border-collapse: collapse;
	padding: 0.25cm;
}

.invoice-table thead th {
	text-align: left;
	border-bottom: 1px solid #000;
}

.invoice-table th,
.invoice-table td {
	/* make all text aligned to top of box */
	vertical-align: top;
	text-align: left;
}

.invoice-table tbody {
	font-size: 0.8rem;
}

.am {
	color: #3d2b1f;
}

.pm {
	color: #36454f;
}

.am-pm {
	font-size: 0.8em;
	opacity: 0.8;
}

.tax {
	color: #36454f;
	font-size: 0.95em;
}

/* do table banding for every odd row, not including header one */
.invoice-table .banding tr:nth-child(even) {
	background-color: #dfdfdf;
}

.total tr {
	min-height: 2cm;
}

.spacer {
	height: calc();
}

.total-table {
	display: inline;
	padding: 0;
}

.total-table th:not(:last-child) {
	padding-right: 0.9cm;
}

.total-table tbody {
	border-bottom: #000 1px dashed;
}

.align-end {
	margin-top: auto;
}

.contents {
	display: contents;
}

.fancy_g * {
	font-feature-settings: "cv10", "cv06", "cv11";
}

.invoice .m {
	font-size: 0.65em;
	opacity: 0.9;
	font-weight: 600;
}

</style>
