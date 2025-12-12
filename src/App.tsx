import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Index from "./pages/Index";
import Quiz from "./pages/Quiz";
import Results from "./pages/Results";
import Checkout from "./pages/Checkout";
import ThankYou from "./pages/ThankYou";
import EnterEmail from "./pages/EnterEmail";

// NEW imports
import Transition from "./pages/Transition";
import Offer from "./pages/Offer";
import PreQuiz from "./pages/PreQuiz";  // ← NEW

import AdminLogin from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminOverview from "./pages/admin/Overview";
import QuizManager from "./pages/admin/QuizManager";
import ComponentsManager from "./pages/admin/Components";
import PDFModules from "./pages/admin/PDFModules";
import EmailSettings from "./pages/admin/EmailSettings";
import Submissions from "./pages/admin/Submissions";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/enter-email" element={<EnterEmail />} />

          {/* NEW ROUTES */}
          <Route path="/pre-quiz" element={<PreQuiz />} />   {/* ← NEW */}
          <Route path="/results" element={<Results />} />
          <Route path="/transition" element={<Transition />} />
          <Route path="/offer" element={<Offer />} />

          <Route path="/checkout" element={<Checkout />} />
          <Route path="/thank-you" element={<ThankYou />} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />}>
            <Route index element={<AdminOverview />} />
            <Route path="quiz" element={<QuizManager />} />
            <Route path="components" element={<ComponentsManager />} />
            <Route path="pdfs" element={<PDFModules />} />
            <Route path="email" element={<EmailSettings />} />
            <Route path="submissions" element={<Submissions />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
