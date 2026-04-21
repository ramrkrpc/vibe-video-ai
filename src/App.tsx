import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedLayout from "@/components/ProtectedLayout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Avatars from "./pages/Avatars";
import CreateVideo from "./pages/CreateVideo";
import Templates from "./pages/Templates";
import MyVideos from "./pages/MyVideos";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route element={<ProtectedLayout />}>
              <Route path="/" element={<Index />} />
              <Route path="/avatars" element={<Avatars />} />
              <Route path="/create" element={<CreateVideo />} />
              <Route path="/templates" element={<Templates />} />
              <Route path="/videos" element={<MyVideos />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
