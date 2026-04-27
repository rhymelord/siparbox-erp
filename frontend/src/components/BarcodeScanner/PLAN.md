# Barkod → Sipariş Entegrasyonu Planı

## Hedef
Yeni sipariş oluştururken, ürün satırına barkod ikonu eklenecek. Tıklandığında modal kamera açılacak, barkod okunacak, ürün adı + fiyat + açıklama otomatik dolacak.

## Mimari

### Ürün Verisi Nereden Gelecek?
Barkod okunduktan sonra backend'e `/api/product?barcode=XXX` isteği atılacak.
Ürün bulunamazsa kullanıcı manuel bilgi girebilecek.

### Değiştirilecek Dosyalar

1. **`ItemRow.jsx`** (ErpPanelModule)
   - Her satıra `BarcodeOutlined` butonu ekle
   - Tıklayınca `BarcodeScanModal` açılır
   - Barkod okunca form alanları otomatik dolar

2. **`BarcodeScanModal.jsx`** (YENİ - components/BarcodeScanner)
   - Modal içinde kamera okuyucu
   - Okuma başarılı → callback ile ürün bilgilerini döndür

3. **`InvoiceForm.jsx`**
   - "Barkod ile Hızlı Ekle" butonu: tek tıkla ürün ekle + barkod oku

## Veri Akışı
```
Kullanıcı [Barkod İkonu] tıklar
    → BarcodeScanModal açılır
    → Kamera aktif olur
    → Barkod okunur
    → Backend'e GET /api/product?barcode=XXX
    → Ürün bulunursa: itemName, description, price dolar
    → Ürün bulunamazsa: sadece barkod no description'a girer, kullanıcı tamamlar
    → Modal kapanır, form satırı dolu
```
