import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { Link } from "react-router-dom";
import ProtectedRoute from "./auth/ProtectedRoute";
import Login from "./pages/Login";
import Notes from "./pages/Notes";
import Register from "./pages/Register";
import Profile from "./pages/Profile";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>

        
          <Route path="/login" element={<Login />} />

          <Route path="/register" element={<Register />} />

          <Route
            path="/notes"
            element={
              <ProtectedRoute>
                <Notes />
              </ProtectedRoute>
            }
          />

          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />


          <Route 
            path="*"
            element={<Login/>} />
          
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}