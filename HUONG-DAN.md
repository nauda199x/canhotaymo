# canhotaymo.com — hướng dẫn sau khi sửa landing page

## 1. Việc bắt buộc phải làm trước khi chạy quảng cáo

### a) Điền mã Google Ads để đo chuyển đổi

Mở `assets/site.js`, sửa khối `ADS` ở đầu file:

```js
var ADS = {
  id: 'AW-XXXXXXXXX',   // Mục tiêu → Chuyển đổi → Hành động chuyển đổi
  labels: {
    form: '...',        // nhãn của hành động "Gửi form thành công"
    call: '...',        // nhãn của hành động "Bấm nút gọi"
    zalo: ''            // nhãn của hành động "Bấm nút Zalo" (phụ, có thể để trống)
  }
};
```

Khi `id` còn rỗng, trang **không** tải thẻ Google và **không** bắn chuyển đổi — site vẫn
chạy bình thường, không lỗi console. Chỉ cần điền vào là mọi trang tự động có thẻ.

Ba hành động chuyển đổi cần tạo trong Google Ads:

| Hành động | Cách đo | Đặt là |
|---|---|---|
| Gửi form thành công | Pageview `/cam-on/` | Chính |
| Bấm nút gọi | Click `tel:` | Chính |
| Bấm nút Zalo | Click `zalo.me` | Phụ |

Kiểm tra lại bằng Google Tag Assistant sau khi điền.

### b) Kiểm chứng số liệu

Các con số dưới đây đang lấy theo nội dung có sẵn trên trang cũ, **cần đối chiếu lại
với quỹ căn thực tế** trước khi chạy quảng cáo:

- Khoảng giá Studio ~6–8 / 1PN ~7–10 / 2PN ~9–12 / 3PN từ ~12 triệu
  (xuất hiện ở cả 4 trang đích, tìm chuỗi `triệu` trong file HTML).
- Con số "200+ căn trong quỹ" ở dải tin cậy.
- Các mốc thời gian di chuyển trong mục vị trí.

Trong file HTML đã đặt sẵn chú thích `⚠️ CHỦ WEBSITE KIỂM CHỨNG` ngay tại chỗ cần sửa.

### c) Danh sách tòa — chưa bật

`thue-can-ho-smart-city/index.html` có sẵn khối "Các tòa đang có căn trong quỹ"
nhưng **đang để trong dấu chú thích HTML**, vì không được phép đăng tên tòa chưa
kiểm chứng. Điền tên tòa thật rồi bỏ cặp `<!-- -->` để hiển thị.

> Chỉ liệt kê tòa **thực sự có căn trong quỹ**. Liệt kê tòa không có căn là quảng cáo
> sai sự thật, vi phạm chính sách Google Ads (Misrepresentation).

## 2. Cấu trúc file

| Đường dẫn | Vai trò |
|---|---|
| `/` | Trang tổng, hub dẫn sang 3 trang khu vực |
| `/thue-can-ho-smart-city/` | Nhóm từ khóa smart city, studio smart city |
| `/thue-can-ho-tay-mo/` | Nhóm từ khóa thuê chung cư / căn hộ tây mỗ |
| `/thue-can-ho-dai-mo-nam-tu-liem/` | Nhóm từ khóa đại mỗ, nam từ liêm |
| `/cam-on/` | Trang cảm ơn, có `noindex`, dùng để đo chuyển đổi |
| `/dieu-khoan-dich-vu/` | Điều khoản dịch vụ |
| `assets/site.css` | Toàn bộ giao diện của 4 trang đích + 2 trang phụ |
| `assets/site.js` | Form, ghi nhận gclid/utm, theo dõi chuyển đổi, thanh CTA |

Sửa `assets/site.css` hoặc `assets/site.js` một lần là áp dụng cho tất cả các trang.
Ba trang `gioi-thieu`, `lien-he`, `chinh-sach-quyen-rieng-tu` vẫn dùng CSS riêng của
chúng như trước, chỉ được bổ sung khối miễn trừ trách nhiệm và điều hướng.

## 3. Ràng buộc thương hiệu đang được giữ

- Không có logo, màu nhận diện hay hình ảnh của bất kỳ chủ đầu tư nào.
- Không có từ: chính thức / ủy quyền / đại lý / chủ đầu tư / phân phối / đối tác /
  trực thuộc — **trừ** trong đúng câu phủ nhận ở khối miễn trừ trách nhiệm.
- `Vinhomes` xuất hiện đúng **1 lần/trang**, nằm trong khối miễn trừ trách nhiệm,
  không có trong `<title>` và `<h1>`.
- Khối miễn trừ trách nhiệm hiển thị ở footer **mọi trang**, không giấu trong accordion.

Giữ nguyên các ràng buộc này khi thêm nội dung mới.

## 4. Ảnh

Hiện chỉ có 6 ảnh căn hộ thật. Mỗi trang dùng 3 ảnh cho khối hero và 3 ảnh khác cho
thư viện, nên **không trang nào lặp ảnh trong chính nó** — nhưng các trang vẫn dùng
chung bộ 6 ảnh đó. Khi có thêm ảnh thật, thêm vào `img/` rồi bổ sung vào thư viện.

Ảnh mới nên có cả bản 480px (đặt tên `<tên>-480.webp`) để dùng cho `srcset`.

## 5. Việc còn lại trên Google Ads (ngoài phạm vi code)

1. Thêm từ khóa phủ định: khách sạn, homestay, theo ngày, theo giờ, nghỉ dưỡng,
   booking, agoda, airbnb, qua đêm, du lịch.
2. Nâng trần CPC từ ~9.000đ lên khoảng 15.000đ.
3. Tách 1 nhóm quảng cáo thành 3, mỗi nhóm trỏ về trang đích tương ứng ở mục 2.
4. Chuyển các từ khóa Khớp chính xác sang Khớp cụm từ.
5. Cập nhật đường dẫn hiển thị: `canhotaymo.com/thue-can-ho/smart-city`.
6. Kiểm tra double serving giữa `canhotaymo.com` và `timthuesmartcity.com`.
