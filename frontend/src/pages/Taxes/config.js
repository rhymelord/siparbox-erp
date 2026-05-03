export const fields = {
  taxName: {
    type: 'string',
    required: true,
    label: 'Vergi Adı',
  },
  taxValue: {
    type: 'number',
    required: true,
    label: 'Vergi Oranı (%)',
  },
  isDefault: {
    type: 'boolean',
    label: 'Varsayılan',
    defaultValue: false,
  },
  enabled: {
    type: 'boolean',
    label: 'Aktif',
    defaultValue: true,
  },
};
