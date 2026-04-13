import "@typespec/http";
import "@typespec/rest";
import "@typespec/openapi3";

using TypeSpec.Http;
using TypeSpec.Rest;

@service(#{
  title: "Coffee Shop API"
})
@server("http://localhost:8080", "Local Server")
namespace CoffeeShopAPI;

// =============================================================
// ALIASES
// =============================================================

alias Date = string;

// =============================================================
// ENUMS
// =============================================================

enum Status {
  ACTIVE,
  INACTIVE,
  SUSPENDED,
}

enum OrderStatus {
  PENDING,
  PROCESSING,
  SHIPPED,
  DELIVERED,
  CANCELLED,
}

enum PaymentMethod {
  CASH,
  VNPAY,
  CREDIT_CARD,
}

// =============================================================
// SHARED / NESTED MODELS
// =============================================================

model ErrorResponse {
  code: string;
  message: string;
}

model RespMessage {
  message: string;
}

model Brand {
  id: int64;
  name: string;
}

model Category {
  id: int64;
  name: string;
  description?: string;
  status: Status;
}

model Image {
  id: int64;
  url: string;
}

model TypeProduct {
  id: int64;
  name: string;
}

// =============================================================
// RESPONSE DTOs
// =============================================================

/** LoginResponse — payload/response/LoginResponse.java */
model LoginResponse {
  accessToken: string;
  expiresIn: int32;
  refreshToken: string;
  refreshExpiresIn: int32;
  tokenType: string;
}

/** ProfileResponse — payload/response/ProfileResponse.java */
model ProfileResponse {
  id: int64;
  email: string;
  role: string;
  phone?: string;
  name?: string;
  profile_img?: string;
  created_at: Date;
  status: string;
}

/** ProductResponse — payload/response/ProductResponse.java */
model ProductResponse {
  id: int64;
  name: string;
  description?: string;
  category: Category;
  brand: Brand;
  status: Status;
  price?: float64;
  images?: Image[];
  rating?: float64;
  totalReview?: int32;
  totalSold?: int32;
  maxPrice?: float64;
  minPrice?: float64;
  netWeight?: string;
  beanType?: string;
  origin?: string;
  roadLevel?: string;
  flavoNotes?: string;
  caffeineContents?: string;
  cafeForm?: string;
  articleTitle?: string;
  article?: string;
  createdAt: Date;
}

/** ProductItemResponse — payload/response/ProductItemResponse.java */
model ProductItemResponse {
  id: int64;
  price: float64;
  stock: int32;
  discount: float64;
  productResponse: ProductResponse;
  type: TypeProduct;
  status: Status;
}

/** OrderItemResponse — payload/response/OrderItemResponse.java */
model OrderItemResponse {
  orderItemId: int64;
  productItemId: int64;
  productId: int64;
  productName: string;
  productType: string;
  productImage: string;
  amount: int32;
  price: float64;
  discount: float64;
  isReviewed: boolean;
}

/** ShippingAddressResponse — payload/response/ShippingAddressResponse.java */
model ShippingAddressResponse {
  id: int64;
  receiverName: string;
  receiverPhone: string;
  location: string;
  status: Status;
  userId: int64;
}

/** OrderResponse — payload/response/OrderResponse.java */
model OrderResponse {
  orderId: int64;
  orderStatus: string;
  orderDate: Date;
  orderItems: OrderItemResponse[];
  total: float64;
  paymentMethod: string;
  shippingAddress: ShippingAddressResponse;
}

/** CartItemResponse — payload/response/CartItemResponse.java */
model CartItemResponse {
  id: int64;
  product_item: ProductItemResponse;
  quantity: int32;
  user_id: int64;
}

/** FavoriteProductResponse — payload/response/FavoriteProductResponse.java */
model FavoriteProductResponse {
  id: int64;
  product: ProductResponse;
  user_id: int64;
}

/** ReviewResponse — payload/response/ReviewResponse.java */
model ReviewResponse {
  id: int64;
  userEmail: string;
  userId: int64;
  Name: string;
  userAvatar: string;
  rating: float64;
  comment?: string;
  createAt: Date;
}

/** ChatMessageResponse — payload/response/ChatMessageResponse.java */
model ChatMessageResponse {
  id: int64;
  senderId: int64;
  senderName: string;
  content: string;
}

// =============================================================
// REQUEST DTOs
// =============================================================

/** LoginRequest — payload/request/LoginRequest.java */
model LoginRequest {
  email: string;
  password: string;
}

/** RegisterRequest — payload/request/RegisterRequest.java */
model RegisterRequest {
  email: string;
  password?: string;
}

/** ProductRequest — payload/request/ProductRequest.java */
model ProductRequest {
  Name: string;
  Description?: string;
  CategoryId: int64;
  BrandId: int64;
  NetWeight?: string;
  BeanType?: string;
  Origin?: string;
  RoadLevel?: string;
  FlavoNotes?: string;
  CaffeineContents?: string;
  CafeForm?: string;
  ArticleTitle?: string;
  Article?: string;
}

/** OrderItemRequest — payload/request/OrderItemRequest.java */
model OrderItemRequest {
  ProductItemId: int64;
  Amount: int32;
  Price: float64;
  Discount: float64;
}

/** OrderRequest — payload/request/OrderRequest.java */
model OrderRequest {
  OrderItems: OrderItemRequest[];
  ShippingAddressId: int64;
  PaymentMethod: PaymentMethod;
}

/** CartItemRequest — payload/request/CartItemRequest.java */
model CartItemRequest {
  Quantity: int32;
  ProductItemId: int64;
  UserId: int64;
}

/** ShippingAddressRequest — payload/request/ShippingAddressRequest.java */
model ShippingAddressRequest {
  id: int64;
  receiver_name: string;
  receiver_phone: string;
  location: string;
  status: Status;
  user_id: int64;
}

/** ReviewRequest — payload/request/ReviewRequet.java */
model ReviewRequest {
  Rating: float64;
  Comment?: string;
  OrderItemId: int64;
}

/** ChatMessageRequest — payload/request/ChatMessageRequest.java */
model ChatMessageRequest {
  senderId: int64;
  content: string;
  conversationId: int64;
}

// =============================================================
// INTERFACES
// =============================================================

// --- Authentication ---

@tag("Authentication")
@route("/api/v1/auth")
interface AuthOperations {
  @summary("Register a new user")
  @post
  @route("/register")
  register(@body request: RegisterRequest):
    | {
        @statusCode _: 201;
        @body user: ProfileResponse;
      }
    | {
        @statusCode _: 400;
        @body error: ErrorResponse;
      };

  @summary("Login and authenticate")
  @post
  @route("/login")
  login(@body request: LoginRequest):
    | {
        @statusCode _: 200;
        @body response: LoginResponse;
      }
    | {
        @statusCode _: 401;
        @body error: ErrorResponse;
      };
}

// --- Product ---

@tag("Product")
@route("/api/v1/products")
interface ProductOperations {
  @summary("Get a list of all products")
  @get
  list(): {
    @statusCode _: 200;
    @body products: ProductResponse[];
  };

  @summary("Get product details by ID")
  @get
  @route("/{productId}")
  get(@path productId: int64):
    | {
        @statusCode _: 200;
        @body product: ProductResponse;
      }
    | {
        @statusCode _: 404;
        @body error: ErrorResponse;
      };

  @summary("Create a new product (Admin)")
  @post
  create(@body product: ProductRequest): {
    @statusCode _: 201;
    @body createdProduct: ProductResponse;
  };

  @summary("Update a product by ID (Admin)")
  @put
  @route("/{productId}")
  update(@path productId: int64, @body product: ProductRequest):
    | {
        @statusCode _: 200;
        @body updatedProduct: ProductResponse;
      }
    | {
        @statusCode _: 404;
        @body error: ErrorResponse;
      };

  @summary("Delete a product by ID (Admin)")
  @delete
  @route("/{productId}")
  delete(@path productId: int64):
    | {
        @statusCode _: 204;
      }
    | {
        @statusCode _: 404;
        @body error: ErrorResponse;
      };
}

// --- Category ---

@tag("Category")
@route("/api/v1/categories")
interface CategoryOperations {
  @summary("List categories")
  @get
  list(): {
    @statusCode _: 200;
    @body categories: Category[];
  };

  @summary("Create a category")
  @post
  create(@body category: Category): {
    @statusCode _: 201;
    @body createdCategory: Category;
  };

  @summary("Update a category")
  @put
  @route("/{categoryId}")
  update(@path categoryId: int64, @body category: Category): {
    @statusCode _: 200;
    @body updatedCategory: Category;
  };

  @summary("Delete a category")
  @delete
  @route("/{categoryId}")
  delete(@path categoryId: int64): {
    @statusCode _: 204;
  };
}

// --- Brand ---

@tag("Brand")
@route("/api/v1/brands")
interface BrandOperations {
  @summary("List brands")
  @get
  list(): {
    @statusCode _: 200;
    @body brands: Brand[];
  };

  @summary("Create a brand")
  @post
  create(@body brand: Brand): {
    @statusCode _: 201;
    @body createdBrand: Brand;
  };

  @summary("Update a brand")
  @put
  @route("/{brandId}")
  update(@path brandId: int64, @body brand: Brand): {
    @statusCode _: 200;
    @body updatedBrand: Brand;
  };

  @summary("Delete a brand")
  @delete
  @route("/{brandId}")
  delete(@path brandId: int64): {
    @statusCode _: 204;
  };
}

// --- Order ---

@tag("Order")
@route("/api/v1/orders")
interface OrderOperations {
  @summary("Get user orders")
  @get
  listByUser(@query userId: int64): {
    @statusCode _: 200;
    @body orders: OrderResponse[];
  };

  @summary("Create a new order")
  @post
  create(@body orderRequest: OrderRequest):
    | {
        @statusCode _: 201;
        @body createdOrder: OrderResponse;
      }
    | {
        @statusCode _: 400;
        @body error: ErrorResponse;
      };

  @summary("Get order by ID")
  @get
  @route("/{orderId}")
  get(@path orderId: int64):
    | {
        @statusCode _: 200;
        @body order: OrderResponse;
      }
    | {
        @statusCode _: 404;
        @body error: ErrorResponse;
      };

  @summary("Cancel/Delete order by ID")
  @delete
  @route("/{orderId}")
  delete(@path orderId: int64):
    | {
        @statusCode _: 204;
      }
    | {
        @statusCode _: 404;
        @body error: ErrorResponse;
      };
}

// --- Payment ---

@tag("Payment")
@route("/api/v1/payments")
interface PaymentOperations {
  @summary("Initiate online payment (e.g. VNPay)")
  @post
  @route("/initiate")
  initiatePayment(
    @body paymentRequest: {
      orderId: int64;
      amount: float64;
      returnUrl: string;
    }
  ):
    | {
        @statusCode _: 200;
        @body response: {
          paymentUrl: string;
          transactionId: int64;
        };
      }
    | {
        @statusCode _: 400;
        @body error: ErrorResponse;
      };

  @summary("Handle payment callback")
  @get
  @route("/callback")
  paymentCallback(@query transactionId: int64, @query status: string): {
    @statusCode _: 200;
    @body response: {
      success: boolean;
      message: string;
    };
  };
}

// --- User ---

@tag("User")
@route("/api/v1/users")
interface UserOperations {
  @summary("List all users (Admin)")
  @get
  list(): {
    @statusCode _: 200;
    @body users: ProfileResponse[];
  };

  @summary("Get current user profile")
  @get
  @route("/profile")
  getProfile(): {
    @statusCode _: 200;
    @body profile: ProfileResponse;
  };

  @summary("Update user profile")
  @put
  @route("/profile")
  updateProfile(@body profile: ProfileResponse): {
    @statusCode _: 200;
    @body updatedProfile: ProfileResponse;
  };
}

// --- Shipping Address ---

@tag("Shipping Address")
@route("/api/v1/shipping-addresses")
interface ShippingAddressOperations {
  @summary("Get user shipping addresses")
  @get
  list(): {
    @statusCode _: 200;
    @body addresses: ShippingAddressResponse[];
  };

  @summary("Add a new shipping address")
  @post
  create(@body address: ShippingAddressRequest): {
    @statusCode _: 201;
    @body createdAddress: ShippingAddressResponse;
  };

  @summary("Update shipping address")
  @put
  @route("/{id}")
  update(@path id: int64, @body address: ShippingAddressRequest): {
    @statusCode _: 200;
    @body updatedAddress: ShippingAddressResponse;
  };

  @summary("Delete shipping address")
  @delete
  @route("/{id}")
  delete(@path id: int64): {
    @statusCode _: 204;
  };
}

// --- Favorite Product ---

@tag("Favorite Product")
@route("/api/v1/favorites")
interface FavoriteProductOperations {
  @summary("List favorite products")
  @get
  list(): {
    @statusCode _: 200;
    @body favorites: FavoriteProductResponse[];
  };

  @summary("Add to favorites")
  @post
  add(@body request: { productId: int64 }): {
    @statusCode _: 201;
    @body favorite: FavoriteProductResponse;
  };

  @summary("Remove from favorites")
  @delete
  @route("/{productId}")
  remove(@path productId: int64): {
    @statusCode _: 204;
  };
}

// --- Cart ---

@tag("Cart")
@route("/api/v1/cart")
interface CartOperations {
  @summary("Get current user's cart")
  @get
  getCart():
    | {
        @statusCode _: 200;
        @body items: CartItemResponse[];
      }
    | {
        @statusCode _: 404;
        @body error: ErrorResponse;
      };

  @summary("Add item to cart")
  @post
  @route("/items")
  addItem(@body item: CartItemRequest): {
    @statusCode _: 201;
    @body updatedCart: CartItemResponse[];
  };

  @summary("Update item quantity in cart")
  @put
  @route("/items/{itemId}")
  updateItem(@path itemId: int64, @body request: { Quantity: int32 }): {
    @statusCode _: 200;
    @body updatedCart: CartItemResponse[];
  };

  @summary("Remove item from cart")
  @delete
  @route("/items/{itemId}")
  removeItem(@path itemId: int64): {
    @statusCode _: 200;
    @body updatedCart: CartItemResponse[];
  };

  @summary("Clear cart")
  @delete
  clearCart(): {
    @statusCode _: 204;
  };
}

// --- Review ---

@tag("Review")
@route("/api/v1/reviews")
interface ReviewOperations {
  @summary("Get reviews for a product")
  @get
  getByProduct(@query productId: int64): {
    @statusCode _: 200;
    @body reviews: ReviewResponse[];
  };

  @summary("Add a review")
  @post
  create(@body review: ReviewRequest): {
    @statusCode _: 201;
    @body createdReview: ReviewResponse;
  };

  @summary("Update a review")
  @put
  @route("/{reviewId}")
  update(@path reviewId: int64, @body review: ReviewRequest): {
    @statusCode _: 200;
    @body updatedReview: ReviewResponse;
  };

  @summary("Delete a review")
  @delete
  @route("/{reviewId}")
  delete(@path reviewId: int64): {
    @statusCode _: 204;
  };
}

// --- Chat ---

@tag("Chat")
@route("/api/v1/chat")
interface ChatOperations {
  @summary("Send a message")
  @post
  sendMessage(@body message: ChatMessageRequest): {
    @statusCode _: 201;
    @body sentMessage: ChatMessageResponse;
  };

  @summary("Get conversation history")
  @get
  @route("/history/{userId}")
  getHistory(@path userId: int64): {
    @statusCode _: 200;
    @body messages: ChatMessageResponse[];
  };

  @summary("Mark messages as read")
  @put
  @route("/read/{userId}")
  markAsRead(@path userId: int64): {
    @statusCode _: 200;
  };
}

// --- Statistic ---

@tag("Statistic")
@route("/api/v1/statistics")
interface StatisticOperations {
  @summary("Get overall statistics")
  @get
  getOverallStats(): {
    @statusCode _: 200;
    @body stats: {
      totalRevenue: float64;
      totalOrders: int32;
      totalUsers: int32;
      totalProducts: int32;
    };
  };

  @summary("Get revenue over time")
  @get
  @route("/revenue")
  getRevenueStats(@query startDate: Date, @query endDate: Date): {
    @statusCode _: 200;
    @body revenueData: {
      date: Date;
      revenue: float64;
    }[];
  };
}
