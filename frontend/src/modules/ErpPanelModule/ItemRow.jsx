import { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Row, Col, Button, Tooltip } from 'antd';
import { DeleteOutlined, BarcodeOutlined } from '@ant-design/icons';
import { useMoney } from '@/settings';
import calculate from '@/utils/calculate';
import BarcodeScanModal from '@/components/BarcodeScanner/BarcodeScanModal';
import useResponsive from '@/hooks/useResponsive';

export default function ItemRow({ field, remove, current = null }) {
  const [totalState, setTotal] = useState(undefined);
  const [price, setPrice] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [barcodeOpen, setBarcodeOpen] = useState(false);
  const { isMobile } = useResponsive();

  const money = useMoney();
  const form = Form.useFormInstance();

  const updateQt = (value) => { setQuantity(value); };
  const updatePrice = (value) => { setPrice(value); };

  useEffect(() => {
    if (current) {
      const { items, invoice } = current;
      if (invoice) {
        const item = invoice[field.fieldKey];
        if (item) { setQuantity(item.quantity); setPrice(item.price); }
      } else {
        const item = items[field.fieldKey];
        if (item) { setQuantity(item.quantity); setPrice(item.price); }
      }
    }
  }, [current]);

  useEffect(() => {
    setTotal(calculate.multiply(price, quantity));
  }, [price, quantity]);

  const handleBarcodeSuccess = (productData) => {
    const items = form.getFieldValue('items') || [];
    items[field.name] = {
      ...items[field.name],
      itemName: productData.itemName,
      description: productData.description,
      price: productData.price,
      quantity: productData.quantity || 1,
    };
    form.setFieldsValue({ items });
    setPrice(productData.price);
    setQuantity(productData.quantity || 1);
    setBarcodeOpen(false);
  };

  return (
    <>
      <Row
        gutter={[8, 8]}
        style={{
          position: 'relative',
          background: 'linear-gradient(135deg, #f8faff 0%, #eef3ff 100%)',
          border: '1px solid #d6e4ff',
          borderRadius: 10,
          padding: isMobile ? '10px 10px 4px 10px' : '10px 28px 4px 10px',
          marginBottom: 10,
          marginLeft: isMobile ? 0 : undefined,
          transition: 'box-shadow 0.2s',
        }}
      >
        {/* 🔍 Barkod Butonu — satırın solunda (sadece masaüstünde) */}
        {!isMobile && (
          <div style={{ position: 'absolute', left: -38, top: 8 }}>
            <Tooltip title="Barkod okutarak bu satırı doldur" placement="left">
              <Button
                size="small"
                icon={<BarcodeOutlined />}
                onClick={() => setBarcodeOpen(true)}
                style={{
                  background: 'linear-gradient(135deg, #0050C8, #00B4D8)',
                  border: 'none',
                  color: '#fff',
                  borderRadius: 6,
                  boxShadow: '0 2px 8px rgba(0,80,200,0.3)',
                }}
              />
            </Tooltip>
          </div>
        )}

        <Col xs={24} sm={24} md={5}>
          <Form.Item
            name={[field.name, 'itemName']}
            rules={[
              { required: true, message: 'Ürün adı zorunludur' },
              { pattern: /^(?!\s*$)[\s\S]+$/, message: 'Geçerli bir ürün adı girin' },
            ]}
          >
            <Input placeholder="Ürün / Hizmet Adı" style={{ borderRadius: 6 }} />
          </Form.Item>
        </Col>

        <Col xs={24} sm={24} md={7}>
          <Form.Item name={[field.name, 'description']}>
            <Input placeholder="Açıklama (opsiyonel)" style={{ borderRadius: 6 }} />
          </Form.Item>
        </Col>

        <Col xs={8} sm={8} md={3}>
          <Form.Item name={[field.name, 'quantity']} rules={[{ required: true }]} initialValue={1}>
            <InputNumber
              style={{ width: '100%', borderRadius: 6 }}
              min={0}
              onChange={updateQt}
              placeholder="Adet"
            />
          </Form.Item>
        </Col>

        <Col xs={8} sm={8} md={4}>
          <Form.Item name={[field.name, 'price']} rules={[{ required: true }]}>
            <InputNumber
              className="moneyInput"
              onChange={updatePrice}
              min={0}
              controls={false}
              style={{ borderRadius: 6 }}
              addonAfter={money.currency_position === 'after' ? money.currency_symbol : undefined}
              addonBefore={money.currency_position === 'before' ? money.currency_symbol : undefined}
              placeholder="0.00"
            />
          </Form.Item>
        </Col>

        <Col xs={8} sm={8} md={5}>
          <Form.Item name={[field.name, 'total']} hidden>
             <Input />
          </Form.Item>
          <Form.Item>
            <Input
              readOnly
              className="moneyInput"
              value={money.amountFormatter({ amount: totalState, currency_code: money.currency_code })}
              style={{ borderRadius: 6, background: '#f0f5ff', fontWeight: 600, color: '#333', textAlign: 'right' }}
              addonAfter={money.currency_position === 'after' ? money.currency_symbol : undefined}
              addonBefore={money.currency_position === 'before' ? money.currency_symbol : undefined}
            />
          </Form.Item>
        </Col>

        {/* 🗑 Satır Silme + Mobil Barkod */}
        <div style={{
          position: isMobile ? 'relative' : 'absolute',
          right: isMobile ? 'auto' : -26,
          top: isMobile ? 'auto' : 10,
          display: isMobile ? 'flex' : 'block',
          gap: isMobile ? 12 : 0,
          marginBottom: isMobile ? 8 : 0,
          marginLeft: isMobile ? 4 : 0,
        }}>
          {isMobile && (
            <Tooltip title="Barkod okut">
              <Button
                size="small"
                icon={<BarcodeOutlined />}
                onClick={() => setBarcodeOpen(true)}
                style={{
                  background: 'linear-gradient(135deg, #0050C8, #00B4D8)',
                  border: 'none',
                  color: '#fff',
                  borderRadius: 6,
                }}
              />
            </Tooltip>
          )}
          <Tooltip title="Bu satırı sil" placement="right">
            <DeleteOutlined
              onClick={() => remove(field.name)}
              style={{ color: '#ff4d4f', fontSize: 16, cursor: 'pointer', transition: 'transform 0.2s' }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.3)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            />
          </Tooltip>
        </div>
      </Row>

      <BarcodeScanModal
        open={barcodeOpen}
        onClose={() => setBarcodeOpen(false)}
        onSuccess={handleBarcodeSuccess}
      />
    </>
  );
}
