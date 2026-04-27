import ReadInvoiceModule from '@/modules/InvoiceModule/ReadInvoiceModule';

export default function InvoiceRead() {
  const entity = 'invoice';

  const configPage = {
    entity,
    PANEL_TITLE: 'Sipariş',
    DATATABLE_TITLE: 'Sipariş Listesi',
    ADD_NEW_ENTITY: 'Yeni Sipariş Oluştur',
    ENTITY_NAME: 'Sipariş',
    RECORD_ENTITY: 'Tahsilat Kaydet',
  };

  return <ReadInvoiceModule config={configPage} />;
}
