# Thông số kỹ thuật (Specifications)

Thư mục này chứa toàn bộ các file đặc tả (`.spec.yaml`) cho hệ thống Coffee Shop.
Theo nguyên tắc **Spec-Driven First**:
- KHÔNG BAO GIỜ bắt đầu viết code nếu chưa hoàn thiện và thống nhất file spec tại đây.
- Bất kỳ thay đổi nào trong logic nghiệp vụ đều phải cập nhật file spec tương ứng trước, sau đó mới cập nhật code.

## Cấu trúc đề xuất
- `auth.spec.yaml`: Đặc tả hệ thống đăng nhập, phân quyền (JWT).
- `product.spec.yaml`: Đặc tả cho quản lý sản phẩm.
- `order.spec.yaml`: Đặc tả cho giỏ hàng và đơn hàng.
- `payment.spec.yaml`: Đặc tả cho tích hợp thanh toán (VD: VNPay).
