export const fields = {
  ref: {
    type: 'string',
    required: true,
    label: 'Barkod / Stok Kodu',
  },
  name: {
    type: 'string',
    required: true,
    label: 'Ürün Adı',
  },
  description: {
    type: 'textarea',
    label: 'Açıklama',
  },
  price: {
    type: 'number',
    required: true,
    label: 'Birim Fiyat',
  },
  enabled: {
    type: 'boolean',
    label: 'Aktif',
    defaultValue: true,
  },
};
