// Importa a função defineConfig do Vite para definir configurações do projeto
import { defineConfig } from "vite";
// Importa o plugin React para Vite com suporte ao SWC (uma alternativa mais rápida ao Babel)
import react from "@vitejs/plugin-react-swc";
// Importa o módulo "path" para manipular caminhos de diretórios
import path from "path";
// Importa o plugin "componentTagger" da biblioteca "lovable-tagger"
import { componentTagger } from "lovable-tagger";

// Exporta a configuração do Vite
export default defineConfig(({ mode }) => ({
  // Configura o servidor de desenvolvimento
  server: {
    // Define o host para aceitar conexões externas (IPv6 :: representa todas as interfaces disponíveis)
    host: "::",
    // Define a porta do servidor para 8080
    port: 8080,
  },
  
  // Define os plugins que serão usados no projeto
  plugins: [
    // Adiciona suporte ao React com SWC
    react(),
    // Se estiver no modo de desenvolvimento, adiciona o plugin "componentTagger"
    mode === 'development' && componentTagger(),
  ].filter(Boolean), // Remove valores "false" da lista de plugins

  // Configura a resolução de módulos
  resolve: {
    alias: {
      // Cria um alias "@" para referenciar a pasta "src" de forma mais simples nas importações
      "@": path.resolve(__dirname, "./src"),
    },
  },
  
  // Define o diretório onde as variáveis de ambiente serão lidas
  envDir: ".",
}));
