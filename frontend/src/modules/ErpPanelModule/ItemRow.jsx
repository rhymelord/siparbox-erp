import { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Row, Col, Button, Tooltip } from 'antd';
import { DeleteOutlined, BarcodeOutlined } from '@ant-design/icons';
import { useMoney } from '@/settings';
import calculate from '@/utils/calculate';
import BarcodeScanModal from '@/components/BarcodeScanner/BarcodeScanModal';

export default function ItemRow({ field, remove, current = null }) {
  const [totalState, setTotal] = useState(undefined);
  const [price, setPrice] = useState(0);
  const [quantity, setQuantity] = useState(0);
  const [barcodeOpen, setBarcodeOpen] = useState(false);

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
          padding: '10px 28px 4px 10px',
          marginBottom: 10,
          transition: 'box-shadow 0.2s',
        }}
      >
        {/* 🔍 Barkod Butonu — satırın solunda */}
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

        <Col span={5}>
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

        <Col span={7}>
          <Form.Item name={[field.name, 'description']}>
            <Input placeholder="Açıklama (opsiyonel)" style={{ borderRadius: 6 }} />
          </Form.Item>
        </Col>

        <Col span={3}>
          <Form.Item name={[field.name, 'quantity']} rules={[{ required: true }]}>
            <InputNumber
              style={{ width: '100%', borderRadius: 6 }}
              min={0}
              onChange={updateQt}
              placeholder="Adet"
            />
          </Form.Item>
        </Col>

        <Col span={4}>
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

        <Col span={5}>
          <Form.Item name={[field.name, 'total']}>
            <Form.Item>
              <InputNumber
                readOnly
                className="moneyInput"
                value={totalState}
                min={0}
                controls={false}
                style={{ borderRadius: 6, background: '#f0f5ff', fontWeight: 600 }}
                addonAfter={money.currency_position === 'after' ? money.currency_symbol : undefined}
                addonBefore={money.currency_position === 'before' ? money.currency_symbol : undefined}
                formatter={(value) =>
                  money.amountFormatter({ amount: value, currency_code: money.currency_code })
                }
              />
            </Form.Item>
          </Form.Item>
        </Col>

        {/* 🗑 Satır Silme */}
        <div style={{ position: 'absolute', right: -26, top: 10 }}>
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
