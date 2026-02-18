import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Home from './pages/Home/Home';
import VideoPlayer from './pages/VideoPlayer/VideoPlayer';
import Reels from './pages/Reels/Reels';
import Profile from './pages/Profile/Profile';
import AdminDashboard from './pages/Admin/AdminDashboard';
import Discussions from './pages/Discussions/Discussions';
import Pricing from './pages/Pricing/Pricing';
import PaymentSuccess from './pages/Payment/PaymentSuccess';
import PaymentCancel from './pages/Payment/PaymentCancel';
import Navbar from './components/Layout/Navbar';
import PrivateRoute from './components/Layout/PrivateRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route path="/" element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            } />
            
            <Route path="/video/:id" element={
              <PrivateRoute>
                <VideoPlayer />
              </PrivateRoute>
            } />
            
            <Route path="/reels" element={
              <PrivateRoute>
                <Reels />
              </PrivateRoute>
            } />
            
            <Route path="/discussions" element={
              <PrivateRoute>
                <Discussions />
              </PrivateRoute>
            } />
            
            <Route path="/profile" element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            } />
            
            <Route path="/admin" element={
              <PrivateRoute adminOnly>
                <AdminDashboard />
              </PrivateRoute>
            } />
            
            <Route path="/pricing" element={
              <PrivateRoute>
                <Pricing />
              </PrivateRoute>
            } />
            
            <Route path="/payment-success" element={
              <PrivateRoute>
                <PaymentSuccess />
              </PrivateRoute>
            } />
            
            <Route path="/payment-cancel" element={
              <PrivateRoute>
                <PaymentCancel />
              </PrivateRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;