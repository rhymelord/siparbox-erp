import CrudModule from '@/modules/CrudModule/CrudModule';
import DynamicForm from '@/forms/DynamicForm';
import { fields } from './config';
import { Tag } from 'antd';

export default function Customer() {
  const entity = 'client';

  const searchConfig = {
    displayLabels: ['name'],
    searchFields: 'name',
  };

  const deleteModalLabels = ['name'];

  const dataTableColumns = [
    {
      title: 'Ad Soyad / Firma',
      dataIndex: 'name',
    },
    {
      title: 'Müşteri Tipi',
      dataIndex: 'customerType',
      render: (type) => {
        if (!type) return <Tag color="default">Bireysel</Tag>;
        return (
          <Tag color={type === 'kurumsal' ? 'blue' : 'green'}>
            {type === 'kurumsal' ? 'Kurumsal' : 'Bireysel'}
          </Tag>
        );
      },
    },
    {
      title: 'Telefon',
      dataIndex: 'phone',
    },
    {
      title: 'Şehir',
      dataIndex: 'city',
    },
    {
      title: 'E-posta',
      dataIndex: 'email',
    },
    {
      title: 'Vergi No',
      dataIndex: 'taxNumber',
    },
  ];

  const Labels = {
    PANEL_TITLE: 'Müşteri',
    DATATABLE_TITLE: 'Müşteri Listesi',
    ADD_NEW_ENTITY: 'Yeni Müşteri Ekle',
    ENTITY_NAME: 'Müşteri',
  };

  const configPage = {
    entity,
    ...Labels,
  };

  const config = {
    ...configPage,
    fields,
    dataTableColumns,
    searchConfig,
    deleteModalLabels,
  };

  return (
    <CrudModule
      createForm={<DynamicForm fields={fields} />}
      updateForm={<DynamicForm fields={fields} />}
      config={config}
    />
  );
}
