import { useState, useEffect, useRef } from 'react';
import dayjs from 'dayjs';
import { Form, Input, InputNumber, Button, Select, Divider, Row, Col, Tag, Space } from 'antd';

import { PlusOutlined, BarcodeOutlined, ThunderboltOutlined } from '@ant-design/icons';

import { DatePicker } from 'antd';

import AutoCompleteAsync from '@/components/AutoCompleteAsync';
import SelectAsync from '@/components/SelectAsync';
import ItemRow from '@/modules/ErpPanelModule/ItemRow';
import MoneyInputFormItem from '@/components/MoneyInputFormItem';
import { selectFinanceSettings } from '@/redux/settings/selectors';
import { useDate } from '@/settings';
import useLanguage from '@/locale/useLanguage';
import calculate from '@/utils/calculate';
import { useSelector } from 'react-redux';
import BarcodeScanModal from '@/components/BarcodeScanner/BarcodeScanModal';

export default function InvoiceForm({ subTotal = 0, current = null }) {
  const { last_invoice_number } = useSelector(selectFinanceSettings);

  if (last_invoice_number === undefined) {
    return <></>;
  }

  return <LoadInvoiceForm subTotal={subTotal} current={current} />;
}

function LoadInvoiceForm({ subTotal = 0, current = null }) {
  const translate = useLanguage();
  const { dateFormat } = useDate();
  const { last_invoice_number } = useSelector(selectFinanceSettings);
  const [total, setTotal] = useState(0);
  const [taxRate, setTaxRate] = useState(0);
  const [taxTotal, setTaxTotal] = useState(0);
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());
  const [lastNumber, setLastNumber] = useState(() => last_invoice_number + 1);
  const [barcodeFabOpen, setBarcodeFabOpen] = useState(false);

  const form = Form.useFormInstance();
  const addField = useRef(false);

  const handelTaxChange = (value = 0) => {
    setTaxRate(Number(value || 0) / 100);
  };

  useEffect(() => {
    if (current) {
      const { taxRate = 0, year, number } = current;
      setTaxRate(taxRate / 100);
      setCurrentYear(year);
      setLastNumber(number);
    }
  }, [current]);

  useEffect(() => {
    const currentTotal = calculate.add(calculate.multiply(subTotal, taxRate), subTotal);
    setTaxTotal(Number.parseFloat(calculate.multiply(subTotal, taxRate)));
    setTotal(Number.parseFloat(currentTotal));
  }, [subTotal, taxRate]);

  useEffect(() => {
    addField.current.click();
  }, []);

  // Üst barkod butonu: yeni satır ekle + barkod doldur
  const handleFabBarcodeSuccess = (productData) => {
    const items = form.getFieldValue('items') || [];
    const newIndex = items.length;
    // Yeni boş satır ekle, sonra dolduracağız
    addField.current.click();
    // Küçük gecikmeyle formu güncelle (DOM yerleşmesi için)
    setTimeout(() => {
      const updatedItems = form.getFieldValue('items') || [];
      updatedItems[newIndex] = {
        itemName: productData.itemName,
        description: productData.description,
        price: productData.price,
        quantity: productData.quantity || 1,
      };
      form.setFieldsValue({ items: updatedItems });
    }, 100);
    setBarcodeFabOpen(false);
  };

  return (
    <>
      {/* ─── FORM HEADER: MÜŞTERİ + SİPARİŞ BİLGİLERİ ─── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #f0f5ff 0%, #e6f0ff 100%)',
          borderRadius: 12,
          padding: '16px 20px 4px',
          marginBottom: 16,
          border: '1px solid #d6e4ff',
        }}
      >
        <Row gutter={[12, 0]}>
          <Col className="gutter-row" span={8}>
            <Form.Item
              name="client"
              label={<span style={{ fontWeight: 600 }}>👤 Müşteri</span>}
              rules={[{ required: true, message: 'Lütfen müşteri seçin' }]}
            >
              <AutoCompleteAsync
                entity={'client'}
                displayLabels={['name']}
                searchFields={'name'}
                redirectLabel={'Yeni Müşteri Ekle'}
                withRedirect
                urlToRedirect={'/customer'}
              />
            </Form.Item>
          </Col>

          <Col className="gutter-row" span={3}>
            <Form.Item
              label={<span style={{ fontWeight: 600 }}>Sipariş No</span>}
              name="number"
              initialValue={lastNumber}
              rules={[{ required: true }]}
            >
              <InputNumber min={1} style={{ width: '100%', borderRadius: 6 }} />
            </Form.Item>
          </Col>

          <Col className="gutter-row" span={3}>
            <Form.Item
              label={<span style={{ fontWeight: 600 }}>Yıl</span>}
              name="year"
              initialValue={currentYear}
              rules={[{ required: true }]}
            >
              <InputNumber style={{ width: '100%', borderRadius: 6 }} />
            </Form.Item>
          </Col>

          <Col className="gutter-row" span={5}>
            <Form.Item
              label={<span style={{ fontWeight: 600 }}>📋 Durum</span>}
              name="status"
              rules={[{ required: false }]}
              initialValue={'draft'}
            >
              <Select
                style={{ borderRadius: 6 }}
                options={[
                  { value: 'draft', label: '📝 Taslak' },
                  { value: 'pending', label: '⏳ Beklemede' },
                  { value: 'sent', label: '✅ Onaylandı' },
                  { value: 'on hold', label: '⏸ Bekletiliyor' },
                  { value: 'cancelled', label: '❌ İptal' },
                ]}
              />
            </Form.Item>
          </Col>

          <Col className="gutter-row" span={8}>
            <Form.Item
              name="date"
              label={<span style={{ fontWeight: 600 }}>📅 Sipariş Tarihi</span>}
              rules={[{ required: true, type: 'object' }]}
              initialValue={dayjs()}
            >
              <DatePicker style={{ width: '100%', borderRadius: 6 }} format={dateFormat} />
            </Form.Item>
          </Col>

          <Col className="gutter-row" span={6}>
            <Form.Item
              name="expiredDate"
              label={<span style={{ fontWeight: 600 }}>⏰ Son Ödeme Tarihi</span>}
              rules={[{ required: true, type: 'object' }]}
              initialValue={dayjs().add(30, 'days')}
            >
              <DatePicker style={{ width: '100%', borderRadius: 6 }} format={dateFormat} />
            </Form.Item>
          </Col>

          <Col className="gutter-row" span={10}>
            <Form.Item
              label={<span style={{ fontWeight: 600 }}>💬 Not / Açıklama</span>}
              name="notes"
            >
              <Input placeholder="Sipariş ile ilgili notlar..." style={{ borderRadius: 6 }} />
            </Form.Item>
          </Col>
        </Row>
      </div>

      {/* ─── ÜRÜN SATIRLARI BAŞLIK ─── */}
      <div
        style={{
          background: 'linear-gradient(90deg, #0050C8 0%, #00B4D8 100%)',
          borderRadius: '10px 10px 0 0',
          padding: '8px 16px',
          marginLeft: 36,
          marginRight: 24,
        }}
      >
        <Row gutter={[8, 0]}>
          <Col span={5}>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>Ürün / Hizmet</span>
          </Col>
          <Col span={7}>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>Açıklama</span>
          </Col>
          <Col span={3}>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>Miktar</span>
          </Col>
          <Col span={4}>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>Birim Fiyat</span>
          </Col>
          <Col span={5}>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>Tutar</span>
          </Col>
        </Row>
      </div>

      {/* ─── ÜRÜN SATIRLARI ─── */}
      <div style={{ paddingLeft: 36, paddingRight: 24, paddingTop: 8 }}>
        <Form.List name="items">
          {(fields, { add, remove }) => (
            <>
              {fields.map((field) => (
                <ItemRow
                  key={field.key}
                  remove={remove}
                  field={field}
                  current={current}
                />
              ))}

              {/* ─── EKLE BUTONLARI ─── */}
              <Form.Item style={{ marginTop: 8 }}>
                <Space wrap>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    icon={<PlusOutlined />}
                    ref={addField}
                    style={{
                      borderRadius: 8,
                      borderColor: '#0050C8',
                      color: '#0050C8',
                      fontWeight: 600,
                      padding: '0 20px',
                    }}
                  >
                    Ürün / Hizmet Ekle
                  </Button>

                  <Button
                    type="primary"
                    icon={<BarcodeOutlined />}
                    onClick={() => setBarcodeFabOpen(true)}
                    style={{
                      borderRadius: 8,
                      background: 'linear-gradient(135deg, #0050C8, #00B4D8)',
                      border: 'none',
                      fontWeight: 600,
                      padding: '0 20px',
                      boxShadow: '0 4px 12px rgba(0,80,200,0.3)',
                    }}
                  >
                    Barkod ile Hızlı Ekle
                  </Button>

                  <Tag
                    icon={<ThunderboltOutlined />}
                    color="blue"
                    style={{ borderRadius: 6, padding: '3px 10px', fontSize: 12 }}
                  >
                    Her satırda da 🔍 barkod okutabilirsiniz
                  </Tag>
                </Space>
              </Form.Item>
            </>
          )}
        </Form.List>
      </div>

      <Divider dashed style={{ borderColor: '#d6e4ff', margin: '12px 0' }} />

      {/* ─── TOPLAMLAR ─── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #f0f5ff 0%, #e6f0ff 100%)',
          borderRadius: 12,
          padding: '16px 20px',
          border: '1px solid #d6e4ff',
        }}
      >
        <Row gutter={[12, -5]}>
          <Col className="gutter-row" span={5}>
            <Button
              type="primary"
              htmlType="submit"
              icon={<PlusOutlined />}
              block
              style={{
                borderRadius: 8,
                background: 'linear-gradient(135deg, #0050C8, #00B4D8)',
                border: 'none',
                fontWeight: 700,
                fontSize: 15,
                height: 40,
                boxShadow: '0 4px 16px rgba(0,80,200,0.35)',
              }}
            >
              💾 Siparişi Kaydet
            </Button>
          </Col>

          <Col className="gutter-row" span={4} offset={10}>
            <p style={{ paddingLeft: '12px', paddingTop: '5px', margin: 0, textAlign: 'right', fontWeight: 600, color: '#555' }}>
              Ara Toplam:
            </p>
          </Col>
          <Col className="gutter-row" span={5}>
            <MoneyInputFormItem readOnly value={subTotal} />
          </Col>
        </Row>

        <Row gutter={[12, -5]} style={{ marginTop: 8 }}>
          <Col className="gutter-row" span={4} offset={15}>
            <Form.Item
              name="taxRate"
              initialValue={0}
              rules={[{ required: true }]}
            >
              <SelectAsync
                onChange={handelTaxChange}
                entity={'taxes'}
                outputValue={'taxValue'}
                displayLabels={['taxName']}
                withRedirect={true}
                urlToRedirect="/taxes"
                redirectLabel={translate('Add New Tax')}
                placeholder={translate('Select Tax Value')}
              />
            </Form.Item>
          </Col>
          <Col className="gutter-row" span={5}>
            <MoneyInputFormItem readOnly value={taxTotal} />
          </Col>
        </Row>

        <Row gutter={[12, -5]}>
          <Col className="gutter-row" span={4} offset={15}>
            <p style={{ paddingLeft: '12px', paddingTop: '5px', margin: 0, textAlign: 'right', fontWeight: 700, color: '#0050C8', fontSize: 15 }}>
              Genel Toplam:
            </p>
          </Col>
          <Col className="gutter-row" span={5}>
            <MoneyInputFormItem readOnly value={total} />
          </Col>
        </Row>
      </div>

      {/* Üst barkod modalı (yeni satır + doldur) */}
      <BarcodeScanModal
        open={barcodeFabOpen}
        onClose={() => setBarcodeFabOpen(false)}
        onSuccess={handleFabBarcodeSuccess}
      />
    </>
  );
}
