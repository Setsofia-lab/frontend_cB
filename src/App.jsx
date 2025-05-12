// App.jsx - Main component that combines all other components
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import Testimonials from './components/Testimonials';
import Demo from './components/Demo';
import CTA from './components/CTA';
import Footer from './components/Footer';
import LoginPage from './components/LoginPage';
import ChatPage from './components/ChatPage';
import InstructorDashboard from './components/InstructorDashboard'; // Import Dashboard
import './App.css';

function App() {
  const location = useLocation();
  const isChatPage = location.pathname === '/chat';
  const isLoginPage = location.pathname === '/login';
  const isInstructorPage = location.pathname.startsWith('/instructor');

  if (isChatPage || isInstructorPage) { // Full screen for chat and instructor dashboard
    return (
      <div className="app">
        <Routes>
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/instructor/*" element={<InstructorDashboard />} /> {/* Nested routes for dashboard later */}
        </Routes>
      </div>
    );
  }

  // Determine if Navbar and Footer should be shown for other pages
  const showNavbar = true; 
  const showFooter = !isLoginPage; 

  return (
    <div className="app">
      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={
          <>
            <Hero />
            <Features />
            <HowItWorks />
            <Demo />
            <Testimonials />
            <CTA />
          </>
        } />
        <Route path="/login" element={<LoginPage />} />
        {/* Fallback or other routes can be added here */}
      </Routes>
      {showFooter && <Footer />}
    </div>
  );
}

export default App;
