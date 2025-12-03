import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import RootRouter from "./RootRouter";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import ActivityLog from "./pages/ActivityLog";
import Suppliers from "./pages/Suppliers";
import AddItem from "./pages/AddItem";
import CheckOut from "./pages/CheckOut";
import Notifications from "./pages/Notifications";
import NotificationDetails from "./pages/NotificationDetails";
import EditItem from "./pages/EditItem";
import DeleteItem from "./pages/DeleteItem";
import AddSupplier from "./pages/AddSupplier";
import EditSupplier from "./pages/EditSupplier";
import DeleteSupplier from "./pages/DeleteSupplier";
import GenerateReport from "./pages/GenerateReport";
import { AuthContextProvider } from "./lib/db/db.auth";
import { SearchProvider } from "./contexts/SearchContext";
import { ItemSelectionProvider } from "./contexts/ItemSelectionContext";
import Auth404 from "./pages/Auth404";
import path from "path";
import AccountProfile from "./pages/AccountProfile";
import MemberRequests from "./pages/MemberRequests";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/sign-up",
    element: <SignUp />,
  },
  {
    path: "/vrnqxh6p2dj722u7/login",
    element: <Login />,
  },
  {
    path: "/d5mf7868y97mpwa9/sign-up",
    element: <SignUp />,
  },
  {
    element: <RootRouter />,
    path: "/",
    children: [
      {
        path: "/dashboard",
        element: <Dashboard />,
      },
      {
        path: "/inventory",
        element: <Inventory />,
      },
      {
        path: "/suppliers",
        element: <Suppliers />,
      },
      {
        path: "/activity-log",
        element: <ActivityLog />,
      },
      {
        path: "/add-item",
        element: <AddItem />,
      },
      {
        path: "/check-out",
        element: <CheckOut />,
      },
      {
        path: "/notifications",
        element: <Notifications />,
      },
      {
        path: "/notifications/:id",
        element: <NotificationDetails />,
      },
      {
        path: "/edit-item",
        element: <EditItem />,
      },
      {
        path: "/delete-item",
        element: <DeleteItem />,
      },
      {
        path: "/generate-report",
        element: <GenerateReport />,
      },
      {
        path: "/add-supplier",
        element: <AddSupplier />,
      },
      {
        path: "/edit-supplier",
        element: <EditSupplier />,
      },
      {
        path: "/delete-supplier",
        element: <DeleteSupplier />,
      },
      {
        path: "/accountprofile",
        element: <AccountProfile />,
      },
      {
        path: "/member-requests",
        element: <MemberRequests />,
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthContextProvider>
      <SearchProvider>
        <ItemSelectionProvider>
          <RouterProvider router={router} />
        </ItemSelectionProvider>
      </SearchProvider>
    </AuthContextProvider>
  </StrictMode>
);
