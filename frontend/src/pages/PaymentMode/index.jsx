import CrudModule from '@/modules/CrudModule/CrudModule';
import DynamicForm from '@/forms/DynamicForm';
import { fields } from './config';

export default function PaymentMode() {
  const entity = 'paymentMode';

  const searchConfig = {
    displayLabels: ['name'],
    searchFields: 'name',
  };

  const config = {
    entity,
    PANEL_TITLE: 'Ödeme Modu',
    DATATABLE_TITLE: 'Ödeme Modları',
    ADD_NEW_ENTITY: 'Yeni Ödeme Modu Ekle',
    ENTITY_NAME: 'Ödeme Modu',
    fields,
    searchConfig,
    deleteModalLabels: ['name'],
  };

  return (
    <CrudModule
      createForm={<DynamicForm fields={fields} />}
      updateForm={<DynamicForm fields={fields} isUpdateForm />}
      config={config}
    />
  );
}
