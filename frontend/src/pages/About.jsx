import { Button, Result, Typography, Space, Divider } from 'antd';
import { GlobalOutlined, MailOutlined, AppstoreOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;

const About = () => {
  return (
    <div style={{ maxWidth: 600, margin: '60px auto', padding: '0 24px' }}>
      <Result
        status="success"
        icon={
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'linear-gradient(135deg, #0050C8, #00B4D8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto', fontSize: 36, color: '#fff'
          }}>
            📦
          </div>
        }
        title={<Title level={2} style={{ margin: 0 }}>SiparBox</Title>}
        subTitle={
          <Text type="secondary" style={{ fontSize: 15 }}>
            SiparBox Gözlük · ERP &amp; CRM Yönetim Sistemi
          </Text>
        }
        extra={
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Divider />
            <Space>
              <GlobalOutlined style={{ color: '#0050C8' }} />
              <a href="https://siparbox.com" target="_blank" rel="noreferrer">
                www.siparbox.com
              </a>
            </Space>
            <Space>
              <MailOutlined style={{ color: '#0050C8' }} />
              <a href="mailto:info@siparbox.com">info@siparbox.com</a>
            </Space>
            <Divider />
            <Button
              type="primary"
              icon={<AppstoreOutlined />}
              size="large"
              style={{ background: 'linear-gradient(135deg, #0050C8, #00B4D8)', border: 'none' }}
              onClick={() => window.open('https://siparbox.com')}
            >
              SiparBox Hakkında
            </Button>
          </Space>
        }
      />
    </div>
  );
};

export default About;
