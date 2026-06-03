import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Navbar from "./components/ui/Navbar";
import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Footer from "./components/ui/Footer";
import Profile from "./pages/Profile";
import Products from "./pages/Products";
import Cart from "./pages/Cart";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminLogin from "./pages/AdminLogin";
import ProtectedRoute from "./components/ProtectedRoute";
import api from "./lib/api";
import { setUser } from "./redux/userSlice";
import { setCart } from "./redux/productsSlice";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <>
        <Navbar />
        <Home />
        <Footer />
      </>
    ),
  },

  {
    path: "/signup",
    element: (
      <>
        <Signup />
      </>
    ),
  },

  {
    path: "/login",
    element: (
      <>
        <Login />
      </>
    ),
  },
  {
    path: "/profile/:userId",
    element: (
      <>
        <Navbar />
        <Profile />
      </>
    ),
  },
  {
    path: "/products",
    element: (
      <>
        <Navbar />
        <Products />
      </>
    ),
  },
  {
    path: "/cart",
    element: (
      <>
        <Navbar />
        <Cart />
      </>
    ),
  },
  {
    path: "/admin-login",
    element: <AdminLogin />,
  },
  {
    element: (
      <ProtectedRoute allowedRoles={["admin"]} redirectTo="/admin-login" />
    ),
    children: [
      {
        path: "/admin",
        element: <AdminDashboardPage />,
      },
      {
        path: "/admin/:section",
        element: <AdminDashboardPage />,
      },
    ],
  },
]);

const App = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((store) => store.user);
  const [sessionRestored, setSessionRestored] = React.useState(false);

  React.useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setSessionRestored(true);
        return;
      }

      // Skip if user is already loaded
      if (user) {
        setSessionRestored(true);
        return;
      }

      try {
        const res = await api.get("/user/me");
        if (res.data?.success && res.data?.user) {
          dispatch(setUser(res.data.user));
          
          // Load cart after user is restored
          try {
            const cartRes = await api.get("/cart");
            if (cartRes.data?.success) {
              dispatch(setCart(cartRes.data.cart));
            }
          } catch {
            dispatch(setCart(null));
          }
        }
      } catch (error) {
        // Only clear token if it's actually invalid (not network errors)
        if (error?.response?.status === 401) {
          localStorage.removeItem("token");
          dispatch(setUser(null));
          dispatch(setCart(null));
        }
      } finally {
        setSessionRestored(true);
      }
    };

    restoreSession();
  }, [dispatch]); // Remove 'user' from dependencies to avoid re-runs

  // Load cart when user changes (login/logout)
  React.useEffect(() => {
    if (!sessionRestored) return; // Wait for initial session restoration

    const loadCart = async () => {
      const token = localStorage.getItem("token");
      if (!token || !user) {
        dispatch(setCart(null));
        return;
      }

      try {
        const res = await api.get("/cart");
        if (res.data?.success) {
          dispatch(setCart(res.data.cart));
        }
      } catch (error) {
        if (error?.response?.status === 401) {
          dispatch(setCart(null));
        }
      }
    };

    loadCart();
  }, [dispatch, user?._id, sessionRestored]);

  return (
    <>
      <RouterProvider router={router} />
    </>
  );
};

export default App;
