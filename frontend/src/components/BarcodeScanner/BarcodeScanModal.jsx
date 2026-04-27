import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import {
  Modal,
  Button,
  Select,
  Space,
  Spin,
  Tag,
  Alert,
  Typography,
  Input,
  Form,
  InputNumber,
  Divider,
  message,
} from 'antd';
import {
  CameraOutlined,
  StopOutlined,
  BarcodeOutlined,
  CheckCircleOutlined,
  ReloadOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { request } from '@/request';

const { Text } = Typography;
const { Option } = Select;
const SCANNER_ID = 'invoice-barcode-scanner';

/**
 * Barkod tarama modalı — sipariş formundaki her satır için kullanılır.
 * onSuccess(productData) → { itemName, description, price, quantity:1 }
 */
export default function BarcodeScanModal({ open, onClose, onSuccess }) {
  const [scanning, setScanning] = useState(false);
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [lastCode, setLastCode] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [foundProduct, setFoundProduct] = useState(null);
  const [manualBarcode, setManualBarcode] = useState('');
  const scannerRef = useRef(null);
  const [form] = Form.useForm();

  // Modal açılınca kameraları listele
  useEffect(() => {
    if (!open) return;
    setFoundProduct(null);
    setLastCode(null);
    setError(null);
    form.resetFields();

    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length) {
          setCameras(devices);
          const backCam = devices.find(
            (d) =>
              d.label.toLowerCase().includes('back') ||
              d.label.toLowerCase().includes('arka') ||
              d.label.toLowerCase().includes('environment')
          );
          setSelectedCamera(backCam ? backCam.id : devices[0].id);
        }
      })
      .catch(() =>
        setError('Kamera erişimi sağlanamadı. Tarayıcı izinlerini kontrol edin.')
      );
  }, [open]);

  // Modal kapanınca kamerayı durdur
  useEffect(() => {
    if (!open) {
      stopScanner();
    }
  }, [open]);

  const startScanner = async () => {
    setError(null);
    setLoading(true);
    try {
      const html5QrCode = new Html5Qrcode(SCANNER_ID);
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        selectedCamera || { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 260, height: 120 }, aspectRatio: 2.0 },
        (decodedText) => handleScannedCode(decodedText),
        () => {}
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
    if (code === lastCode) return;
    setLastCode(code);
    playBeep();
    if (navigator.vibrate) navigator.vibrate(100);
    stopScanner();
    lookupBarcode(code);
  };

  const playBeep = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 1050;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.25);
    } catch (_) {}
  };

  // Backend'de barkodu ara
  const lookupBarcode = async (barcode) => {
    setSearching(true);
    setFoundProduct(null);
    try {
      // Barkod numarasına göre ürün ara
      const response = await request.list({
        entity: 'product',
        options: { filter: { ref: barcode }, limit: 1 },
      });

      if (response?.result && response.result.length > 0) {
        const product = response.result[0];
        const productData = {
          itemName: product.name || product.title || barcode,
          description: `Barkod: ${barcode}${product.description ? ' | ' + product.description : ''}`,
          price: product.price || product.unitPrice || 0,
          quantity: 1,
        };
        setFoundProduct(productData);
        form.setFieldsValue(productData);
        message.success('Ürün bulundu! Bilgileri düzenleyip onaylayın.');
      } else {
        // Ürün bulunamadı — barkod numarasını açıklamaya yaz, kullanıcı tamamlar
        const emptyData = {
          itemName: '',
          description: `Barkod: ${barcode}`,
          price: 0,
          quantity: 1,
        };
        setFoundProduct(emptyData);
        form.setFieldsValue(emptyData);
        message.warning('Ürün sistemde bulunamadı. Bilgileri manuel girin.');
      }
    } catch {
      // API hatası — yine de barkod numarasını ekle
      const fallback = {
        itemName: '',
        description: `Barkod: ${barcode}`,
        price: 0,
        quantity: 1,
      };
      setFoundProduct(fallback);
      form.setFieldsValue(fallback);
    } finally {
      setSearching(false);
    }
  };

  const handleManualSearch = () => {
    if (!manualBarcode.trim()) {
      message.error('Barkod numarası girin');
      return;
    }
    lookupBarcode(manualBarcode.trim());
  };

  const handleConfirm = () => {
    const values = form.getFieldsValue();
    if (!values.itemName) {
      message.error('Ürün adı zorunludur!');
      return;
    }
    onSuccess(values);
    handleClose();
  };

  const handleClose = () => {
    stopScanner();
    setFoundProduct(null);
    setLastCode(null);
    setManualBarcode('');
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title={
        <Space>
          <BarcodeOutlined style={{ color: '#0050C8', fontSize: 20 }} />
          <span style={{ color: '#0050C8', fontWeight: 700 }}>Barkod ile Ürün Ekle</span>
        </Space>
      }
      open={open}
      onCancel={handleClose}
      footer={null}
      width={560}
      destroyOnClose
    >
      {/* ─── KAMERA BÖLÜMÜ ─── */}
      <div style={{ marginBottom: 16 }}>
        <Space wrap style={{ marginBottom: 10 }}>
          {cameras.length > 1 && (
            <Select
              value={selectedCamera}
              onChange={setSelectedCamera}
              disabled={scanning}
              style={{ minWidth: 180 }}
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
              disabled={loading || searching}
              style={{ background: '#0050C8' }}
            >
              {loading ? 'Başlatılıyor...' : 'Kamerayı Aç'}
            </Button>
          ) : (
            <Button danger icon={<StopOutlined />} onClick={stopScanner}>
              Durdur
            </Button>
          )}

          {scanning && (
            <Tag color="green" style={{ padding: '3px 10px' }}>
              🟢 Barkodu çerçeveye göster
            </Tag>
          )}
        </Space>

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            style={{ marginBottom: 10 }}
            action={
              <Button size="small" icon={<ReloadOutlined />} onClick={() => setError(null)}>
                Tekrar Dene
              </Button>
            }
          />
        )}

        {/* Kamera görüntüsü */}
        <div
          id={SCANNER_ID}
          style={{
            width: '100%',
            borderRadius: 10,
            overflow: 'hidden',
            background: scanning ? '#000' : 'transparent',
            minHeight: scanning ? 200 : 0,
            transition: 'min-height 0.3s',
          }}
        />
      </div>

      {/* ─── MANUEL BARKOD ─── */}
      <div style={{ marginBottom: 16 }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          veya barkod numarasını manuel girin:
        </Text>
        <Space style={{ marginTop: 6, width: '100%' }}>
          <Input
            prefix={<BarcodeOutlined />}
            placeholder="Barkod no..."
            value={manualBarcode}
            onChange={(e) => setManualBarcode(e.target.value)}
            onPressEnter={handleManualSearch}
            style={{ width: 260 }}
            allowClear
          />
          <Button
            icon={searching ? <Spin size="small" /> : <SearchOutlined />}
            onClick={handleManualSearch}
            disabled={searching}
          >
            Ara
          </Button>
        </Space>
      </div>

      {/* ─── ÜRÜN BİLGİLERİ FORMU ─── */}
      {foundProduct !== null && (
        <>
          <Divider style={{ margin: '12px 0' }}>
            {lastCode ? (
              <Tag color="blue" icon={<CheckCircleOutlined />}>
                Barkod: {lastCode}
              </Tag>
            ) : (
              <Tag color="blue">Ürün Bilgileri</Tag>
            )}
          </Divider>

          {searching ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <Spin size="large" tip="Ürün aranıyor..." />
            </div>
          ) : (
            <Form form={form} layout="vertical" size="small">
              <Form.Item
                name="itemName"
                label="Ürün Adı"
                rules={[{ required: true, message: 'Ürün adı zorunludur' }]}
              >
                <Input placeholder="Ürün adını girin..." allowClear />
              </Form.Item>
              <Form.Item name="description" label="Açıklama">
                <Input placeholder="Açıklama (opsiyonel)..." allowClear />
              </Form.Item>
              <Space>
                <Form.Item name="quantity" label="Adet" initialValue={1}>
                  <InputNumber min={1} max={9999} style={{ width: 100 }} />
                </Form.Item>
                <Form.Item name="price" label="Birim Fiyat (₺)" initialValue={0}>
                  <InputNumber
                    min={0}
                    step={0.01}
                    style={{ width: 160 }}
                    formatter={(v) => `₺ ${v}`}
                    parser={(v) => v.replace(/₺\s?/g, '')}
                  />
                </Form.Item>
              </Space>

              <div style={{ textAlign: 'right', marginTop: 8 }}>
                <Space>
                  <Button onClick={handleClose}>İptal</Button>
                  <Button
                    type="primary"
                    icon={<CheckCircleOutlined />}
                    onClick={handleConfirm}
                    style={{
                      background: 'linear-gradient(135deg, #0050C8, #00B4D8)',
                      border: 'none',
                    }}
                  >
                    Satıra Ekle
                  </Button>
                </Space>
              </div>
            </Form>
          )}
        </>
      )}
    </Modal>
  );
}
