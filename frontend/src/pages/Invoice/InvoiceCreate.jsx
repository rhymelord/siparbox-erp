import CreateInvoiceModule from '@/modules/InvoiceModule/CreateInvoiceModule';

export default function InvoiceCreate() {
  const entity = 'invoice';

  const configPage = {
    entity,
    PANEL_TITLE: 'Sipariş',
    DATATABLE_TITLE: 'Sipariş Listesi',
    ADD_NEW_ENTITY: 'Yeni Sipariş Oluştur',
    ENTITY_NAME: 'Sipariş',
    RECORD_ENTITY: 'Tahsilat Kaydet',
  };

  return <CreateInvoiceModule config={configPage} />;
}
