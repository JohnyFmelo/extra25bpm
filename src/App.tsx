// Importa o React e o hook useState para usar o estado dentro de componentes funcionais.
import React, { useState } from "react";

// Importa o componente Toaster, usado para exibir notificações ou alertas.
import { Toaster } from "@/components/ui/toaster";

// Importa o componente Toaster (com outro nome) do pacote Sonner, 
// também usado para exibir notificações.
import { Toaster as Sonner } from "@/components/ui/sonner";

// Importa o TooltipProvider, que provavelmente gerencia os tooltips 
// (caixas de dica) dentro da aplicação.
import { TooltipProvider } from "@/components/ui/tooltip";

// Importa os componentes necessários para usar o React Query, 
// que gerencia o cache de dados e chamadas de API.
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Importa os componentes do React Router para gerenciar rotas dentro da aplicação.
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Importa as páginas ou componentes que representam as diferentes rotas da aplicação.
import Index from "./pages/Index";
import Login from "./pages/Login";
import Hours from "./pages/Hours";

// Importa o componente de barra superior (TopBar).
import TopBar from "./components/TopBar";

// Componente de rota protegida que verifica se o usuário está autenticado.
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  // Verifica se o usuário está no localStorage.
  const user = localStorage.getItem('user');
  
  // Se não houver usuário, redireciona para a página de login.
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Caso contrário, renderiza os filhos (páginas protegidas).
  return <>{children}</>;
};

// Componente de layout principal da aplicação.
const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    // Layout de página com um sistema de flexbox para distribuir o conteúdo.
    <div className="flex min-h-screen w-full">
      <div className="flex-1 flex flex-col">
        {/* Exibe a barra superior */}
        <TopBar />
        {/* Exibe o conteúdo principal da página */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
};

// Componente principal da aplicação.
const App = () => {
  // Inicializa o cliente do React Query com configurações padrão.
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // Define que as queries são consideradas desatualizadas após 5 minutos.
        retry: 1, // Tenta uma vez antes de falhar em caso de erro de requisição.
      },
    },
  }));

  return (
    // Provedor do React Query que fornece o cliente a toda a aplicação.
    <QueryClientProvider client={queryClient}>
      {/* Configura o React Router para navegação entre páginas */}
      <BrowserRouter>
        {/* Provedor de tooltips para fornecer funcionalidade de tooltip à aplicação */}
        <TooltipProvider>
          {/* Exibe o componente de notificações Toaster */}
          <Toaster />
          {/* Exibe o componente de notificações Sonner */}
          <Sonner />
          {/* Definição das rotas da aplicação */}
          <Routes>
            {/* Rota para a página de login */}
            <Route path="/login" element={<Login />} />
            {/* Rota principal, protegida por autenticação */}
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  {/* Layout envolvido com conteúdo principal (Index) */}
                  <Layout>
                    <Index />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            {/* Rota para a página de horas, também protegida */}
            <Route 
              path="/hours" 
              element={
                <ProtectedRoute>
                  {/* Layout envolvido com conteúdo (Hours) */}
                  <Layout>
                    <Hours />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            {/* Qualquer outra rota desconhecida é redirecionada para a página de login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </TooltipProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

// Exporta o componente App para ser usado no ponto de entrada da aplicação.
export default App;