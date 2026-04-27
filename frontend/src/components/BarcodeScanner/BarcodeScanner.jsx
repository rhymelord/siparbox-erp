import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import {
  Button,
  Card,
  Input,
  Select,
  Space,
  Spin,
  Tag,
  Typography,
  Alert,
  Divider,
  List,
  Avatar,
  InputNumber,
  Form,
  message,
} from 'antd';
import {
  CameraOutlined,
  StopOutlined,
  BarcodeOutlined,
  DeleteOutlined,
  ShoppingCartOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

const SCANNER_ID = 'barcode-scanner-region';

export default function BarcodeScanner({ onProductScanned }) {
  const [scanning, setScanning] = useState(false);
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [lastCode, setLastCode] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scannedItems, setScannedItems] = useState([]);
  const [manualCode, setManualCode] = useState('');
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [scanCount, setScanCount] = useState(0);
  const scannerRef = useRef(null);
  const [form] = Form.useForm();

  // Kameraları listele
  useEffect(() => {
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length) {
          setCameras(devices);
          // Arka kamerayı varsayılan yap (mobil için)
          const backCam = devices.find(
            (d) =>
              d.label.toLowerCase().includes('back') ||
              d.label.toLowerCase().includes('arka') ||
              d.label.toLowerCase().includes('environment')
          );
          setSelectedCamera(backCam ? backCam.id : devices[0].id);
        }
      })
      .catch(() => {
        setError('Kamera erişimi sağlanamadı. Lütfen tarayıcı izinlerini kontrol edin.');
      });

    return () => {
      stopScanner();
    };
  }, []);

  const startScanner = async () => {
    setError(null);
    setLoading(true);
    try {
      const html5QrCode = new Html5Qrcode(SCANNER_ID);
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        selectedCamera || { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 150 },
          aspectRatio: 1.5,
        },
        (decodedText) => {
          handleScannedCode(decodedText);
        },
        () => {} // scan failure - sessiz geç
      );

      setScanning(true);
    } catch (err) {
      setError('Kamera başlatılamadı: ' + (err?.message || 'Bilinmeyen hata'));
    } finally {
      setLoading(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (_) {}
      scannerRef.current = null;
    }
    setScanning(false);
  };

  const handleScannedCode = (code) => {
    if (code === lastCode) return; // aynı kodu tekrar okuma
    setLastCode(code);
    setScanCount((c) => c + 1);

    // Titreşim (mobil)
    if (navigator.vibrate) navigator.vibrate(100);

    // Bip sesi
    playBeep();

    message.success({ content: `Barkod okundu: ${code}`, duration: 2 });

    if (onProductScanned) {
      onProductScanned(code);
    }

    // Ürün listesine ekle
    form.setFieldsValue({ barcode: code });
    setManualCode(code);

    // 3 saniye sonra son kodu sıfırla (aynı ürünü tekrar okuyabilmek için)
    setTimeout(() => setLastCode(null), 3000);
  };

  const playBeep = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      oscillator.frequency.value = 880;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.2);
    } catch (_) {}
  };

  const handleManualAdd = () => {
    const values = form.getFieldsValue();
    if (!values.barcode) {
      message.error('Barkod numarası giriniz!');
      return;
    }

    const newItem = {
      id: Date.now(),
      barcode: values.barcode,
      name: values.name || `Ürün (${values.barcode})`,
      price: parseFloat(values.price) || 0,
      quantity: values.quantity || 1,
    };

    setScannedItems((prev) => {
      const existing = prev.find((i) => i.barcode === newItem.barcode);
      if (existing) {
        return prev.map((i) =>
          i.barcode === newItem.barcode ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, newItem];
    });

    form.resetFields();
    setManualCode('');
    message.success('Ürün listeye eklendi!');
  };

  const removeItem = (id) => {
    setScannedItems((prev) => prev.filter((i) => i.id !== id));
  };

  const totalAmount = scannedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      {/* Başlık */}
      <Card
        style={{
          marginBottom: 16,
          background: 'linear-gradient(135deg, #0050C8 0%, #00B4D8 100%)',
          border: 'none',
          borderRadius: 12,
        }}
      >
        <Space>
          <BarcodeOutlined style={{ fontSize: 32, color: '#fff' }} />
          <div>
            <Title level={4} style={{ color: '#fff', margin: 0 }}>
              Barkod Okuyucu
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.85)' }}>
              Telefon kameranızla ürün barkodunu okutun
            </Text>
          </div>
        </Space>
        {scanCount > 0 && (
          <Tag
            color="green"
            style={{ float: 'right', marginTop: 8, fontSize: 13 }}
            icon={<CheckCircleOutlined />}
          >
            {scanCount} barkod okundu
          </Tag>
        )}
      </Card>

      {/* Kamera Seçimi ve Kontroller */}
      <Card style={{ marginBottom: 16, borderRadius: 12 }}>
        <Space wrap style={{ width: '100%', marginBottom: 12 }}>
          {cameras.length > 1 && (
            <Select
              value={selectedCamera}
              onChange={setSelectedCamera}
              style={{ minWidth: 200 }}
              disabled={scanning}
              placeholder="Kamera seç"
            >
              {cameras.map((cam) => (
                <Option key={cam.id} value={cam.id}>
                  📷 {cam.label || `Kamera ${cam.id.slice(0, 6)}`}
                </Option>
              ))}
            </Select>
          )}

          {!scanning ? (
            <Button
              type="primary"
              icon={loading ? <Spin size="small" /> : <CameraOutlined />}
              onClick={startScanner}
              disabled={loading}
              size="large"
              style={{ background: '#0050C8' }}
            >
              {loading ? 'Başlatılıyor...' : 'Kamerayı Aç'}
            </Button>
          ) : (
            <Button
              danger
              icon={<StopOutlined />}
              onClick={stopScanner}
              size="large"
            >
              Kamerayı Kapat
            </Button>
          )}

          {scanning && (
            <Tag color="green" style={{ padding: '4px 12px', fontSize: 13 }}>
              🟢 Kamera Aktif - Barkodu Göster
            </Tag>
          )}
        </Space>

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            style={{ marginBottom: 12 }}
            action={
              <Button size="small" icon={<ReloadOutlined />} onClick={() => setError(null)}>
                Tekrar Dene
              </Button>
            }
          />
        )}

        {/* Kamera Görüntüsü */}
        <div
          id={SCANNER_ID}
          style={{
            width: '100%',
            maxWidth: 500,
            margin: '0 auto',
            borderRadius: 12,
            overflow: 'hidden',
            background: '#000',
            minHeight: scanning ? 300 : 0,
          }}
        />

        {scanning && (
          <div style={{ textAlign: 'center', marginTop: 8 }}>
            <Text type="secondary">
              📱 Barkodu kamera çerçevesine hizalayın
            </Text>
          </div>
        )}
      </Card>

      {/* Manuel Giriş + Ürün Formu */}
      <Card title="✏️ Ürün Bilgileri" style={{ marginBottom: 16, borderRadius: 12 }}>
        <Form form={form} layout="vertical">
          <Space wrap style={{ width: '100%' }}>
            <Form.Item name="barcode" label="Barkod No" style={{ marginBottom: 8 }}>
              <Input
                prefix={<BarcodeOutlined />}
                placeholder="Barkod numarası..."
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                style={{ width: 200 }}
                allowClear
              />
            </Form.Item>
            <Form.Item name="name" label="Ürün Adı" style={{ marginBottom: 8 }}>
              <Input
                placeholder="Ürün adı..."
                style={{ width: 200 }}
                allowClear
              />
            </Form.Item>
            <Form.Item name="price" label="Birim Fiyat (₺)" style={{ marginBottom: 8 }}>
              <InputNumber
                placeholder="0.00"
                min={0}
                step={0.01}
                style={{ width: 140 }}
                formatter={(v) => `₺ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(v) => v.replace(/₺\s?|(,*)/g, '')}
              />
            </Form.Item>
            <Form.Item name="quantity" label="Adet" initialValue={1} style={{ marginBottom: 8 }}>
              <InputNumber min={1} max={9999} style={{ width: 80 }} />
            </Form.Item>
          </Space>
          <Button
            type="primary"
            icon={<ShoppingCartOutlined />}
            onClick={handleManualAdd}
            style={{ background: 'linear-gradient(135deg, #0050C8, #00B4D8)', border: 'none' }}
          >
            Listeye Ekle
          </Button>
        </Form>
      </Card>

      {/* Taranan Ürünler Listesi */}
      {scannedItems.length > 0 && (
        <Card
          title={
            <Space>
              <ShoppingCartOutlined style={{ color: '#0050C8' }} />
              <span>Taranan Ürünler ({scannedItems.length} kalem)</span>
            </Space>
          }
          extra={
            <Tag color="blue" style={{ fontSize: 14 }}>
              Toplam: ₺{totalAmount.toFixed(2)}
            </Tag>
          }
          style={{ borderRadius: 12 }}
        >
          <List
            dataSource={scannedItems}
            renderItem={(item) => (
              <List.Item
                key={item.id}
                actions={[
                  <Button
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => removeItem(item.id)}
                  >
                    Kaldır
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar
                      style={{ background: 'linear-gradient(135deg, #0050C8, #00B4D8)' }}
                      icon={<BarcodeOutlined />}
                    />
                  }
                  title={item.name}
                  description={
                    <Space>
                      <Tag color="blue">{item.barcode}</Tag>
                      <Tag color="green">x{item.quantity}</Tag>
                      {item.price > 0 && (
                        <Tag color="gold">₺{(item.price * item.quantity).toFixed(2)}</Tag>
                      )}
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
          <Divider />
          <div style={{ textAlign: 'right' }}>
            <Text strong style={{ fontSize: 16 }}>
              Toplam:{' '}
              <span style={{ color: '#0050C8', fontSize: 20 }}>
                ₺{totalAmount.toFixed(2)}
              </span>
            </Text>
          </div>
        </Card>
      )}
    </div>
  );
}
