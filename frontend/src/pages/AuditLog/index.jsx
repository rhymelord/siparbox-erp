import React, { useEffect, useState } from 'react';
import { Table, Tag, Button, Modal, Drawer, Space } from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import { request } from '@/request';
import useLanguage from '@/locale/useLanguage';
import { EyeOutlined, SyncOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

export default function AuditLog() {
  const translate = useLanguage();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [openDrawer, setOpenDrawer] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchLogs = async (page = 1, limit = 10) => {
    setLoading(true);
    const result = await request.list({
      entity: 'auditlog',
      options: { page, items: limit, sortBy: 'createdAt', sortValue: '-1' },
    });
    if (result.success) {
      setData(result.result);
      setPagination({
        current: result.pagination.page,
        pageSize: limit,
        total: result.pagination.count,
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleTableChange = (newPagination) => {
    fetchLogs(newPagination.current, newPagination.pageSize);
  };

  const showDrawer = (record) => {
    setSelectedLog(record);
    setOpenDrawer(true);
  };

  const closeDrawer = () => {
    setOpenDrawer(false);
    setSelectedLog(null);
  };

  const columns = [
    {
      title: 'Tarih',
      dataIndex: 'createdAt',
      render: (date) => dayjs(date).format('DD.MM.YYYY HH:mm:ss'),
    },
    {
      title: 'Kullanıcı',
      dataIndex: 'user',
      render: (user) => (user ? `${user.name} ${user.surname}` : 'Sistem'),
    },
    {
      title: 'İşlem',
      dataIndex: 'action',
      render: (action) => {
        const colors = {
          LOGIN: 'blue',
          LOGOUT: 'default',
          CREATE: 'green',
          UPDATE: 'orange',
          DELETE: 'red',
        };
        return <Tag color={colors[action]}>{action}</Tag>;
      },
    },
    {
      title: 'Modül (Tablo)',
      dataIndex: 'entity',
    },
    {
      title: 'IP Adresi',
      dataIndex: 'ipAddress',
    },
    {
      title: 'Detay',
      key: 'detail',
      render: (_, record) => (
        <Button type="link" icon={<EyeOutlined />} onClick={() => showDrawer(record)}>
          İncele
        </Button>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="İşlem Geçmişi (Audit Logs)"
        ghost={false}
        extra={[
          <Button key="refresh" icon={<SyncOutlined />} onClick={() => fetchLogs(pagination.current, pagination.pageSize)}>
            Yenile
          </Button>,
        ]}
        style={{
          padding: '20px 0px',
        }}
      />
      <Table
        columns={columns}
        rowKey={(item) => item._id}
        dataSource={data}
        pagination={pagination}
        loading={loading}
        onChange={handleTableChange}
        scroll={{ x: true }}
      />

      <Drawer
        title="Log Detayı"
        width={500}
        onClose={closeDrawer}
        open={openDrawer}
      >
        {selectedLog && (
          <div>
            <p><strong>İşlem ID:</strong> {selectedLog._id}</p>
            <p><strong>Tarih:</strong> {dayjs(selectedLog.createdAt).format('DD.MM.YYYY HH:mm:ss')}</p>
            <p><strong>İşlemi Yapan:</strong> {selectedLog.user ? `${selectedLog.user.name} ${selectedLog.user.surname} (${selectedLog.user.email})` : 'Sistem'}</p>
            <p><strong>İşlem Tipi:</strong> <Tag>{selectedLog.action}</Tag></p>
            <p><strong>Modül:</strong> {selectedLog.entity}</p>
            <p><strong>Kayıt ID:</strong> {selectedLog.documentId || '-'}</p>
            
            {selectedLog.changes && (
              <div style={{ marginTop: 20 }}>
                <h3>Değişiklikler (JSON)</h3>
                <pre style={{ background: '#f5f5f5', padding: 10, borderRadius: 5, overflowX: 'auto' }}>
                  {JSON.stringify(selectedLog.changes, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </Drawer>
    </>
  );
}
