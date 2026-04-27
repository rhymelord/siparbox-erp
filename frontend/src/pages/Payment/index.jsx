import dayjs from 'dayjs';
import { Tag } from 'antd';
import PaymentDataTableModule from '@/modules/PaymentModule/PaymentDataTableModule';
import { useMoney, useDate } from '@/settings';

export default function Payment() {
  const { dateFormat } = useDate();
  const { moneyFormatter } = useMoney();

  const searchConfig = {
    entity: 'client',
    displayLabels: ['number'],
    searchFields: 'number',
    outputValue: '_id',
  };

  const deleteModalLabels = ['number'];

  const dataTableColumns = [
    {
      title: 'Tahsilat No',
      dataIndex: 'number',
      width: 100,
      render: (num) => `#${num}`,
    },
    {
      title: 'Müşteri',
      dataIndex: ['client', 'name'],
    },
    {
      title: 'Sipariş No',
      dataIndex: ['invoice', 'number'],
      render: (num, record) => {
        if (!num) return '-';
        const year = record?.invoice?.year || '';
        return `#${num}/${year}`;
      },
    },
    {
      title: 'Tahsilat Tutarı',
      dataIndex: 'amount',
      align: 'right',
      render: (amount, record) =>
        moneyFormatter({ amount: amount, currency_code: record.currency }),
    },
    {
      title: 'Kalan Borç',
      dataIndex: ['invoice', 'total'],
      align: 'right',
      render: (invoiceTotal, record) => {
        const paid = record?.invoice?.credit ?? 0;
        const remaining = (invoiceTotal ?? 0) - paid;
        const color = remaining <= 0 ? '#52c41a' : remaining < (invoiceTotal ?? 0) ? '#fa8c16' : '#ff4d4f';
        return (
          <span style={{ color, fontWeight: 600 }}>
            {moneyFormatter({ amount: remaining < 0 ? 0 : remaining, currency_code: record.currency })}
          </span>
        );
      },
    },
    {
      title: 'Ödeme Durumu',
      dataIndex: ['invoice', 'paymentStatus'],
      render: (status) => {
        const map = {
          unpaid: { label: 'Ödenmedi', color: 'red' },
          paid: { label: 'Ödendi', color: 'green' },
          partially: { label: 'Kısmi', color: 'orange' },
        };
        const s = map[status] || { label: status || '-', color: 'default' };
        return <Tag color={s.color}>{s.label}</Tag>;
      },
    },
    {
      title: 'Tarih',
      dataIndex: 'date',
      render: (date) => dayjs(date).format(dateFormat),
    },
    {
      title: 'Ödeme Yöntemi',
      dataIndex: ['paymentMode', 'name'],
      render: (name) => name || '-',
    },
    {
      title: 'Açıklama',
      dataIndex: 'ref',
      render: (ref) => ref || '-',
    },
  ];

  const entity = 'payment';

  const Labels = {
    PANEL_TITLE: 'Tahsilat',
    DATATABLE_TITLE: 'Tahsilat Durumları',
    ADD_NEW_ENTITY: 'Yeni Tahsilat',
    ENTITY_NAME: 'Tahsilat',
  };

  const configPage = {
    entity,
    ...Labels,
  };

  const config = {
    ...configPage,
    disableAdd: true,
    dataTableColumns,
    searchConfig,
    deleteModalLabels,
  };

  return <PaymentDataTableModule config={config} />;
}
