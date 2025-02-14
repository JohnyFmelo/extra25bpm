// Importa o componente StrictMode do React, usado para ativar 
// verificações adicionais durante o desenvolvimento.
import { StrictMode } from 'react'

// Importa a função createRoot de react-dom/client para 
// criar e gerenciar a raiz da aplicação React.
import { createRoot } from 'react-dom/client'

// Importa o componente App do arquivo App.tsx, 
// que é o principal componente da aplicação.
import App from './App.tsx'

// Importa o arquivo CSS index.css, que contém os estilos globais para a aplicação.
import './index.css'

// Cria a raiz da aplicação React, associando ao elemento DOM com id "root", 
// e renderiza o componente App dentro do StrictMode.
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
