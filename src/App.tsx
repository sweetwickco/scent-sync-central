import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Settings from "./pages/Settings";
import AddListing from "./pages/AddListing";
import NotFound from "./pages/NotFound";
import Docs from "./pages/Docs";
import DocEditor from "./pages/DocEditor";
import EtsyCallback from "./pages/EtsyCallback";
import { OptimizeListing } from "@/components/OptimizeListing";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/add-listing" element={<ProtectedRoute><AddListing /></ProtectedRoute>} />
              <Route path="/optimize-listing" element={<ProtectedRoute><OptimizeListing /></ProtectedRoute>} />
              <Route path="/optimize-listing/:optimizationId" element={<ProtectedRoute><OptimizeListing /></ProtectedRoute>} />
              <Route path="/etsy-callback" element={<EtsyCallback />} />
              <Route path="/docs" element={<ProtectedRoute><Docs /></ProtectedRoute>} />
              <Route path="/docs/:docId" element={<ProtectedRoute><DocEditor /></ProtectedRoute>} />
              <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
            <Sonner />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
