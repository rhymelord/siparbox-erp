export const fields = {
  name: {
    type: 'string',
    required: true,
    label: 'Ad Soyad / Firma Adı',
  },
  customerType: {
    type: 'select',
    label: 'Müşteri Tipi',
    options: [
      { value: 'bireysel', label: 'Bireysel' },
      { value: 'kurumsal', label: 'Kurumsal' },
    ],
  },
  phone: {
    type: 'phone',
    label: 'Telefon',
  },
  email: {
    type: 'email',
    label: 'E-posta',
  },
  city: {
    type: 'string',
    label: 'Şehir',
  },
  address: {
    type: 'string',
    label: 'Adres',
  },
  taxNumber: {
    type: 'string',
    label: 'TC Kimlik No / Vergi No',
  },
  taxOffice: {
    type: 'string',
    label: 'Vergi Dairesi',
  },
  notes: {
    type: 'string',
    label: 'Notlar',
  },
};
