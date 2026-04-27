import UpdatePaymentModule from '@/modules/PaymentModule/UpdatePaymentModule';

export default function PaymentUpdate() {
  const entity = 'payment';

  const configPage = {
    entity,
    PANEL_TITLE: 'Tahsilat',
    DATATABLE_TITLE: 'Tahsilat Durumları',
    ADD_NEW_ENTITY: 'Yeni Tahsilat',
    ENTITY_NAME: 'Tahsilat',
  };

  return <UpdatePaymentModule config={configPage} />;
}
