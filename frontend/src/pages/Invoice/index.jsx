import dayjs from 'dayjs';
import { Tag } from 'antd';
import useLanguage from '@/locale/useLanguage';
import { useMoney, useDate } from '@/settings';
import InvoiceDataTableModule from '@/modules/InvoiceModule/InvoiceDataTableModule';

// Sipariş durumu için Türkçe etiket ve renk
const siparisEtiket = (status) => {
  const map = {
    draft: { label: 'Taslak', color: 'default' },
    pending: { label: 'Beklemede', color: 'orange' },
    sent: { label: 'Gönderildi', color: 'blue' },
    refunded: { label: 'İade Edildi', color: 'purple' },
    cancelled: { label: 'İptal', color: 'red' },
    'on hold': { label: 'Bekletiliyor', color: 'gold' },
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
      width: 90,
      render: (num, record) => `#${num}/${record.year}`,
    },
    {
      title: 'Müşteri',
      dataIndex: ['client', 'name'],
    },
    {
      title: 'Sipariş Tarihi',
      dataIndex: 'date',
      render: (date) => dayjs(date).format(dateFormat),
    },
    {
      title: 'Son Ödeme',
      dataIndex: 'expiredDate',
      render: (date) => {
        const d = dayjs(date);
        const isOverdue = d.isBefore(dayjs(), 'day');
        return (
          <span style={{ color: isOverdue ? '#ff4d4f' : 'inherit', fontWeight: isOverdue ? 600 : 400 }}>
            {d.format(dateFormat)}
            {isOverdue ? ' ⚠' : ''}
          </span>
        );
      },
    },
    {
      title: 'Toplam Tutar',
      dataIndex: 'total',
      align: 'right',
      render: (total, record) =>
        moneyFormatter({ amount: total, currency_code: record.currency }),
    },
    {
      title: 'Tahsilat',
      dataIndex: 'credit',
      align: 'right',
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

  const configPage = {
    entity,
    ...Labels,
  };

  const config = {
    ...configPage,
    dataTableColumns,
    searchConfig,
    deleteModalLabels,
  };

  return <InvoiceDataTableModule config={config} />;
}
