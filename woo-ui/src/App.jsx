import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import CustomersPage from "./pages/CustomersPage";
import CouponsPage from "./pages/CouponsPage";

import ListOrdersPage from "./pages/orders/ListOrdersPage";
import CreateOrderPage from "./pages/orders/CreateOrderPage";
import UpdateOrderPage from "./pages/orders/UpdateOrderPage";
import DuplicateOrderPage from "./pages/orders/DuplicateOrderPage";
import FetchOrderPage from "./pages/orders/FetchOrderPage";

import ListProductsPage from "./pages/products/ListProductsPage";
import CreateSimpleProductPage from "./pages/products/CreateSimpleProductPage";
import CreateVariableProductPage from "./pages/products/CreateVariableProductPage";
import DuplicateProductPage from "./pages/products/DuplicateProductPage";
import DeleteProductPage from "./pages/products/DeleteProductPage";
import FetchProductPage from "./pages/products/FetchProductPage";

import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";
import { ActivityProvider } from "./context/ActivityContext";
import { SavedStoresProvider } from "./context/SavedStoresContext";

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <ActivityProvider>
          <SavedStoresProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Dashboard />} />

                <Route path="/orders" element={<ListOrdersPage />} />
                <Route path="/orders/create" element={<CreateOrderPage />} />
                <Route path="/orders/update" element={<UpdateOrderPage />} />
                <Route
                  path="/orders/duplicate"
                  element={<DuplicateOrderPage />}
                />
                <Route path="/orders/fetch" element={<FetchOrderPage />} />

                <Route path="/products" element={<ListProductsPage />} />
                <Route
                  path="/products/create-simple"
                  element={<CreateSimpleProductPage />}
                />
                <Route
                  path="/products/create-variable"
                  element={<CreateVariableProductPage />}
                />
                <Route
                  path="/products/duplicate"
                  element={<DuplicateProductPage />}
                />
                <Route
                  path="/products/delete"
                  element={<DeleteProductPage />}
                />
                <Route path="/products/fetch" element={<FetchProductPage />} />

                <Route path="/customers" element={<CustomersPage />} />
                <Route path="/coupons" element={<CouponsPage />} />
                <Route path="/settings" element={<Settings />} />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </SavedStoresProvider>
        </ActivityProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
