import CrudModule from '@/modules/CrudModule/CrudModule';
import DynamicForm from '@/forms/DynamicForm';
import { fields } from './config';

export default function Taxes() {
  const entity = 'taxes';

  const searchConfig = {
    displayLabels: ['taxName'],
    searchFields: 'taxName',
  };

  const config = {
    entity,
    PANEL_TITLE: 'Vergi',
    DATATABLE_TITLE: 'Vergi Listesi',
    ADD_NEW_ENTITY: 'Yeni Vergi Ekle',
    ENTITY_NAME: 'Vergi',
    fields,
    searchConfig,
    deleteModalLabels: ['taxName'],
  };

  return (
    <CrudModule
      createForm={<DynamicForm fields={fields} />}
      updateForm={<DynamicForm fields={fields} isUpdateForm />}
      config={config}
    />
  );
}
