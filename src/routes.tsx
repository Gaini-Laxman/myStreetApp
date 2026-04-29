
import { createBrowserRouter } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import HomePage from "./pages/HomePage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderConfirmationPage from "./pages/OrderConfirmationPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminProductsPage from "./pages/AdminProductsPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminRoute } from "./components/AdminRoute";
import ErrorPage from "./pages/ErrorPage";
import AdminProductFormPage from "./pages/AdminProductFormPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    errorElement: <ErrorPage />, // ✅ HERE (correct place)
    children: [
      { index: true, element: <HomePage /> },
      { path: "products/:id", element: <ProductDetailPage /> },
      { path: "cart", element: <CartPage /> },
      {
        path: "checkout",
        element: (
          <ProtectedRoute>
            <CheckoutPage />
          </ProtectedRoute>
        )
      },
      {
        path: "orders/:id",
        element: (
          <ProtectedRoute>
            <OrderConfirmationPage />
          </ProtectedRoute>
        )
      },
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
      {
        path: "admin/products",
        element: (
          <AdminRoute>
            <AdminProductsPage />
          </AdminRoute>
        )
      },
      {
  path: "admin/products/new",
  element: (
    <AdminRoute>
      <AdminProductFormPage />
    </AdminRoute>
  )
},
{
  path: "admin/products/:id/edit",
  element: (
    <AdminRoute>
      <AdminProductFormPage />
    </AdminRoute>
  )
}
    ]
  }
]);
