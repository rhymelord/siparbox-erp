import RecordPaymentModule from '@/modules/InvoiceModule/RecordPaymentModule';

export default function InvoiceRecord() {
  const entity = 'invoice';

  const configPage = {
    entity,
    PANEL_TITLE: 'Sipariş',
    DATATABLE_TITLE: 'Sipariş Listesi',
    ADD_NEW_ENTITY: 'Yeni Sipariş Oluştur',
    ENTITY_NAME: 'Sipariş',
    RECORD_ENTITY: 'Tahsilat Kaydet',
  };

  return <RecordPaymentModule config={configPage} />;
}
