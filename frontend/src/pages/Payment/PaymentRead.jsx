import ReadPaymentModule from '@/modules/PaymentModule/ReadPaymentModule';

export default function PaymentRead() {
  const entity = 'payment';

  const configPage = {
    entity,
    PANEL_TITLE: 'Tahsilat',
    DATATABLE_TITLE: 'Tahsilat Durumları',
    ADD_NEW_ENTITY: 'Yeni Tahsilat',
    ENTITY_NAME: 'Tahsilat',
  };

  return <ReadPaymentModule config={configPage} />;
}
