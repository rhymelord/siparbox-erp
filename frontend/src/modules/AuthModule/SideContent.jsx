import { Layout, Typography } from 'antd';
import logo from '@/style/images/siparbox-logo.svg';

const { Content } = Layout;
const { Title, Text } = Typography;

export default function SideContent() {
  return (
    <Content
      style={{
        padding: '150px 30px 30px',
        width: '100%',
        maxWidth: '450px',
        margin: '0 auto',
      }}
      className="sideContent"
    >
      <div style={{ width: '100%' }}>
        <img
          src={logo}
          alt="SiparBox Gözlük"
          style={{ margin: '0 0 40px', display: 'block', borderRadius: '12px' }}
          height={100}
          width={100}
        />

        <Title level={1} style={{ fontSize: 28 }}>
          SiparBox Gözlük ERP / CRM
        </Title>
        <Text style={{ fontSize: 16 }}>
          Ön Muhasebe ve İş Yönetim Sistemi <b /> <br/><br/>
          <i style={{ opacity: 0.7 }}>Powered by Siparbox</i>
        </Text>

        <div className="space20"></div>
      </div>
    </Content>
  );
}
