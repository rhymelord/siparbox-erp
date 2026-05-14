import dayjs from 'dayjs';
import { Tag } from 'antd';
import useLanguage from '@/locale/useLanguage';
import { useMoney, useDate } from '@/settings';
import InvoiceDataTableModule from '@/modules/InvoiceModule/InvoiceDataTableModule';

// Sipariş durumu için Türkçe etiket ve renk
const siparisEtiket = (status) => {
  const map = {
    pending_approval: { label: 'Onay Bekliyor', color: 'orange' },
    preparing: { label: 'Hazırlanıyor', color: 'blue' },
    awaiting_shipping: { label: 'Kargo Bekliyor', color: 'cyan' },
    cancelled: { label: 'İptaller', color: 'red' },
    delivered: { label: 'Teslim Edildi', color: 'green' },
    paid: { label: 'Ödendi', color: 'lime' },
  };
  return map[status] || { label: status, color: 'default' };
};

// Ödeme durumu için Türkçe etiket ve renk
const odemeEtiket = (status) => {
  const map = {
    unpaid: { label: '⚠ Ödenmedi', color: 'red' },
    paid: { label: '✓ Ödendi', color: 'green' },
    partially: { label: '◑ Kısmi Ödeme', color: 'orange' },
  };
  return map[status] || { label: status, color: 'default' };
};

export default function Invoice() {
  const translate = useLanguage();
  const { dateFormat } = useDate();
  const { moneyFormatter } = useMoney();
  const entity = 'invoice';

  const searchConfig = {
    entity: 'client',
    displayLabels: ['name'],
    searchFields: 'name',
  };

  const deleteModalLabels = ['number', 'client.name'];

  const dataTableColumns = [
    {
      title: 'Sipariş No',
      dataIndex: 'number',
      width: 100,
      render: (num, record) => `#${num}/${record.year}`,
    },
    {
      title: 'Müşteri',
      dataIndex: ['client', 'name'],
    },
    {
      title: 'Sipariş Tarihi',
      dataIndex: 'date',
      width: 140,
      responsive: ['md'],
      render: (date) => dayjs(date).format(dateFormat),
    },
    {
      title: 'Toplam Tutar',
      dataIndex: 'total',
      width: 140,
      align: 'right',
      sorter: true,
      sortDirections: ['ascend', 'descend', 'ascend'],
      render: (total, record) =>
        moneyFormatter({ amount: total, currency_code: record.currency }),
    },
    {
      title: 'Tahsilat',
      dataIndex: 'credit',
      width: 130,
      align: 'right',
      responsive: ['lg'],
      render: (credit, record) =>
        moneyFormatter({ amount: credit, currency_code: record.currency }),
    },
    {
      title: 'Sipariş Durumu',
      dataIndex: 'status',
      render: (status) => {
        const { label, color } = siparisEtiket(status);
        return <Tag color={color}>{label}</Tag>;
      },
    },
    {
      title: 'Ödeme Durumu',
      dataIndex: 'paymentStatus',
      render: (status) => {
        const { label, color } = odemeEtiket(status);
        return <Tag color={color}>{label}</Tag>;
      },
    },
  ];

  const Labels = {
    PANEL_TITLE: 'Sipariş',
    DATATABLE_TITLE: 'Sipariş Listesi',
    ADD_NEW_ENTITY: 'Yeni Sipariş Oluştur',
    ENTITY_NAME: 'Sipariş',
    RECORD_ENTITY: 'Tahsilat Kaydet',
  };

  const statusOptions = [
    { value: 'pending_approval', label: 'Onay Bekliyor' },
    { value: 'preparing', label: 'Hazırlanıyor' },
    { value: 'awaiting_shipping', label: 'Kargo Bekliyor' },
    { value: 'cancelled', label: 'İptaller' },
    { value: 'delivered', label: 'Teslim Edildi' },
    { value: 'paid', label: 'Ödendi' },
  ];

  const configPage = {
    entity,
    ...Labels,
  };

  const config = {
    ...configPage,
    dataTableColumns,
    searchConfig,
    deleteModalLabels,
    statusOptions,
  };

  return <InvoiceDataTableModule config={config} />;
}
