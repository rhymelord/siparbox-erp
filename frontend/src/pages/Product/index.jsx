import CrudModule from '@/modules/CrudModule/CrudModule';
import DynamicForm from '@/forms/DynamicForm';
import { fields } from './config';
import { Tag } from 'antd';

export default function Product() {
  const entity = 'product';

  const searchConfig = {
    displayLabels: ['ref', 'name'],
    searchFields: 'ref,name',
  };

  const deleteModalLabels = ['ref', 'name'];

  const dataTableColumns = [
    {
      title: 'Barkod / Stok Kodu',
      dataIndex: 'ref',
    },
    {
      title: 'Ürün Adı',
      dataIndex: 'name',
    },
    {
      title: 'Birim Fiyat',
      dataIndex: 'price',
      align: 'right',
    },
    {
      title: 'Durum',
      dataIndex: 'enabled',
      render: (enabled) => (
        <Tag color={enabled === false ? 'red' : 'green'}>
          {enabled === false ? 'Pasif' : 'Aktif'}
        </Tag>
      ),
    },
  ];

  const Labels = {
    PANEL_TITLE: 'Ürün',
    DATATABLE_TITLE: 'Ürün Listesi',
    ADD_NEW_ENTITY: 'Yeni Ürün Ekle',
    ENTITY_NAME: 'Ürün',
  };

  const config = {
    entity,
    ...Labels,
    fields,
    dataTableColumns,
    searchConfig,
    deleteModalLabels,
  };

  return (
    <CrudModule
      createForm={<DynamicForm fields={fields} />}
      updateForm={<DynamicForm fields={fields} isUpdateForm />}
      config={config}
    />
  );
}
