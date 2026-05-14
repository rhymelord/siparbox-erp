import { useEffect, useState } from 'react';
import useResponsive from '@/hooks/useResponsive';
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  FilePdfOutlined,
  RedoOutlined,
  PlusOutlined,
  EllipsisOutlined,
  ArrowRightOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import { Dropdown, Table, Button, Select } from 'antd';
import { PageHeader } from '@ant-design/pro-layout';

import AutoCompleteAsync from '@/components/AutoCompleteAsync';
import { useSelector, useDispatch } from 'react-redux';
import useLanguage from '@/locale/useLanguage';
import { erp } from '@/redux/erp/actions';
import { selectListItems } from '@/redux/erp/selectors';
import { useErpContext } from '@/context/erp';
import { useNavigate } from 'react-router-dom';

import { DOWNLOAD_BASE_URL } from '@/config/serverApiConfig';

function AddNewItem({ config }) {
  const navigate = useNavigate();
  const { ADD_NEW_ENTITY, entity } = config;

  const handleClick = () => {
    navigate(`/${entity.toLowerCase()}/create`);
  };

  return (
    <Button onClick={handleClick} type="primary" icon={<PlusOutlined />}>
      {ADD_NEW_ENTITY}
    </Button>
  );
}

export default function DataTable({ config, extra = [] }) {
  const translate = useLanguage();
  let { entity, dataTableColumns, disableAdd = false, searchConfig } = config;

  const { DATATABLE_TITLE } = config;
  const { isMobile } = useResponsive();

  const { result: listResult, isLoading: listIsLoading } = useSelector(selectListItems);

  const { pagination, items: dataSource } = listResult;

  const { erpContextAction } = useErpContext();
  const { modal } = erpContextAction;

  const items = [
    {
      label: 'Görüntüle',
      key: 'read',
      icon: <EyeOutlined />,
    },
    {
      label: 'Düzenle',
      key: 'edit',
      icon: <EditOutlined />,
    },
    {
      label: 'İndir',
      key: 'download',
      icon: <FilePdfOutlined />,
    },
    ...extra,
    {
      type: 'divider',
    },

    {
      label: 'Sil',
      key: 'delete',
      icon: <DeleteOutlined />,
    },
  ];

  const navigate = useNavigate();

  const handleRead = (record) => {
    dispatch(erp.currentItem({ data: record }));
    navigate(`/${entity}/read/${record._id}`);
  };
  const handleEdit = (record) => {
    const data = { ...record };
    dispatch(erp.currentAction({ actionType: 'update', data }));
    navigate(`/${entity}/update/${record._id}`);
  };
  const handleDownload = (record) => {
    window.open(`${DOWNLOAD_BASE_URL}${entity}/${entity}-${record._id}.pdf`, '_blank');
  };

  const handleDelete = (record) => {
    dispatch(erp.currentAction({ actionType: 'delete', data: record }));
    modal.open();
  };

  const handleRecordPayment = (record) => {
    dispatch(erp.currentItem({ data: record }));
    navigate(`/invoice/pay/${record._id}`);
  };

  dataTableColumns = [
    ...dataTableColumns,
    {
      title: '',
      key: 'action',
      fixed: 'right',
      render: (_, record) => (
        <Dropdown
          menu={{
            items,
            onClick: ({ key }) => {
              switch (key) {
                case 'read':
                  handleRead(record);
                  break;
                case 'edit':
                  handleEdit(record);
                  break;
                case 'download':
                  handleDownload(record);
                  break;
                case 'delete':
                  handleDelete(record);
                  break;
                case 'recordPayment':
                  handleRecordPayment(record);
                  break;
                default:
                  break;
              }
              // else if (key === '2')handleCloseTask
            },
          }}
          trigger={['click']}
        >
          <EllipsisOutlined
            style={{ cursor: 'pointer', fontSize: '24px' }}
            onClick={(e) => e.preventDefault()}
          />
        </Dropdown>
      ),
    },
  ];

  const dispatch = useDispatch();

  const [tableOptions, setTableOptions] = useState({
    page: 1,
    items: 10,
  });

  const dispatcher = (newOptions = {}) => {
    const mergedOptions = { ...tableOptions, ...newOptions };
    
    // Temizleme (undefined olanları silme)
    Object.keys(mergedOptions).forEach(key => {
      if (mergedOptions[key] === undefined) {
        delete mergedOptions[key];
      }
    });

    setTableOptions(mergedOptions);
    dispatch(erp.list({ entity, options: mergedOptions }));
  };

  const handelDataTableLoad = (pagination, filters, sorter) => {
    const newOptions = {
      page: pagination.current || 1,
      items: pagination.pageSize || 10,
    };
    
    if (sorter && sorter.field) {
      newOptions.sortBy = sorter.field;
      newOptions.sortValue = sorter.order === 'ascend' ? 1 : -1;
    } else {
      newOptions.sortBy = undefined;
      newOptions.sortValue = undefined;
    }
    
    dispatcher(newOptions);
  };

  useEffect(() => {
    const controller = new AbortController();
    dispatcher();
    return () => {
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filterTable = (value) => {
    if (value) {
      dispatcher({ equal: value, filter: searchConfig?.entity, page: 1 });
    } else {
      // Search temizlendi, tüm filtreleri sıfırla
      const fresh = { page: 1, items: 10 };
      setTableOptions(fresh);
      dispatch(erp.list({ entity, options: fresh }));
    }
  };

  const handleRefresh = () => {
    const fresh = { page: 1, items: 10 };
    setTableOptions(fresh);
    dispatch(erp.list({ entity, options: fresh }));
  };

  const filterByStatus = (value) => {
    if (!value || value === 'all') {
      dispatcher({ equal: undefined, filter: undefined, page: 1 });
    } else {
      dispatcher({ equal: value, filter: 'status', page: 1 });
    }
  };

  return (
    <>
      <PageHeader
        title={DATATABLE_TITLE}
        ghost={true}
        extra={[
          <AutoCompleteAsync
            key="search-auto-complete"
            entity={searchConfig?.entity}
            displayLabels={['name']}
            searchFields={'name'}
            onChange={filterTable}
            // redirectLabel={'Add New Client'}
            // withRedirect
            // urlToRedirect={'/customer'}
          />,
          config.statusOptions && (
            <Select
              key="status-filter"
              style={{ width: 160 }}
              placeholder="Durum"
              onChange={filterByStatus}
              options={[{ value: 'all', label: 'Tümü' }, ...config.statusOptions]}
              allowClear
              onClear={() => dispatch(erp.list({ entity }))}
            />
          ),
          <Button onClick={handleRefresh} key="refresh-button" icon={<RedoOutlined />}>
            Yenile
          </Button>,

          !disableAdd && <AddNewItem config={config} key="add-new-item" />,
        ]}
        style={{
          padding: '20px 0px',
        }}
      ></PageHeader>

      <Table
        columns={dataTableColumns}
        rowKey={(item) => item._id}
        dataSource={dataSource}
        pagination={pagination}
        loading={listIsLoading}
        onChange={handelDataTableLoad}
        scroll={{ x: isMobile ? 600 : true }}
        size={isMobile ? 'small' : 'middle'}
      />
    </>
  );
}
