import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import InventoryPage from "./pages/InventoryPage"
import AddDeviceForm from "./components/AddDeviceForm";
import EditDeviceForm from "./components/EditDeviceForm";

import { getDevices } from "./api/device";

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [allDevices, setAllDevices] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if(storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  },[]);

  useEffect(() => {
    if(currentUser) {
      getDevices()
        .then((res) => setAllDevices(res.data))
        .catch((err) => console.error(err));
    }
  },[currentUser]);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
  };

  return (
    <>
      <Toaster position="top-right" />
      <Router>
        <Routes>
          <Route
            path="/login"
            element={
              currentUser ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <LoginPage setCurrentUser={setCurrentUser} />
              )
            }
          />

          <Route
            path="/dashboard"
            element={
              currentUser ? (
                <Dashboard currentUser={currentUser} allDevices={allDevices} handleLogout={handleLogout} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/inventory"
            element={
              currentUser ? (
                <InventoryPage currentUser={currentUser} allDevices={allDevices} setAllDevices={setAllDevices} auditLogs={auditLogs} setAuditLogs={setAuditLogs} handleLogout={handleLogout} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/add-device"
            element={
              currentUser && ["admin", "network-admin"].includes(currentUser.role) ? (
                <AddDeviceForm currentUser={currentUser} allDevices={allDevices} setAllDevices={setAllDevices} handleLogout={handleLogout} />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />

          <Route
            path="/edit-device/:id"
            element={
              currentUser && ["admin", "network-admin"].includes(currentUser.role) ? (
                <EditDeviceForm currentUser={currentUser} allDevices={allDevices} setAllDevices={setAllDevices} />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />

          <Route path="*" element={<Navigate to={currentUser ? "/dashboard" : "/login"} />} />
        </Routes>
      </Router>
    </>
  );
};

export default App;