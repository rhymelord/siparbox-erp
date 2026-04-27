import { Layout, Typography } from 'antd';
import BarcodeScanner from '@/components/BarcodeScanner/BarcodeScanner';

const { Content } = Layout;
const { Title, Text } = Typography;

export default function BarcodeScannerPage() {
  const handleProductScanned = (barcode) => {
    console.log('Barkod okundu:', barcode);
    // İleride bu barkodu invoice form'a otomatik ekleyebiliriz
  };

  return (
    <Content style={{ padding: '24px', minHeight: '100vh', background: '#f5f7fb' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0, color: '#0050C8' }}>
          🔍 Barkod Okuyucu
        </Title>
        <Text type="secondary">
          Telefon kameranızı kullanarak ürün barkodlarını okutun ve sisteme girin
        </Text>
      </div>
      <BarcodeScanner onProductScanned={handleProductScanned} />
    </Content>
  );
}
