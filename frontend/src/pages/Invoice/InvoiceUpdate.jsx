import UpdateInvoiceModule from '@/modules/InvoiceModule/UpdateInvoiceModule';

export default function InvoiceUpdate() {
  const entity = 'invoice';

  const configPage = {
    entity,
    PANEL_TITLE: 'Sipariş',
    DATATABLE_TITLE: 'Sipariş Listesi',
    ADD_NEW_ENTITY: 'Yeni Sipariş Oluştur',
    ENTITY_NAME: 'Sipariş',
    RECORD_ENTITY: 'Tahsilat Kaydet',
  };

  return <UpdateInvoiceModule config={configPage} />;
}
