import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";
import Login from "./pages/Login";
import Notes from "./pages/Notes";
import Register from "./pages/register";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>

          <Route path="/register" element={<Register />} />

          <Route path="/login" element={<Login />} />

          <Route
            path="/notes"
            element={
              <ProtectedRoute>
                <Notes />
              </ProtectedRoute>
            }
          />

          <Route 
            path="*"
            element={<Login/>} />
          
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}