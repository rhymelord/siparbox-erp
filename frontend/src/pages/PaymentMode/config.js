export const fields = {
  name: {
    type: 'string',
    required: true,
    label: 'Ödeme Modu',
  },
  description: {
    type: 'textarea',
    label: 'Açıklama',
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
