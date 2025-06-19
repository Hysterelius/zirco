type Settings = {
  first_name?: string;
  last_name?: string;
  abn?: string;
  bsb?: string;
  account_number?: string;
  rate?: string;

  business_name?: string;
  address_line_1?: string;
  address_line_2?: string;

};

export const defaultSettings: Settings = {
  first_name: 'Joe',
  last_name: 'Bloggs',
  abn: '123456789',
  bsb: '987654',
  account_number: '12345678',
  rate: '100',
  business_name: 'Acme Corp',
  address_line_1: '123 Main St',
  address_line_2: 'Suite 100',
};

export type { Settings };

export const useSettings = () => useState<Settings>('settings', () => ({}));
