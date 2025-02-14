// Importa todas as funcionalidades do React
import * as React from "react"

// Define o breakpoint para dispositivos móveis (768 pixels de largura)
const MOBILE_BREAKPOINT = 768

// Hook personalizado que verifica se a tela está no modo mobile
export function useIsMobile() {
  // Define o estado `isMobile`, que indica se a tela é menor que o breakpoint
  // Inicialmente, é `undefined` para evitar comportamentos inconsistentes no SSR (Server-Side Rendering)
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  // useEffect para adicionar e remover um listener de mudanças no tamanho da tela
  React.useEffect(() => {
    // Cria um objeto `MediaQueryList` para verificar se a largura da tela é menor que o breakpoint
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)

    // Função que atualiza o estado `isMobile` quando a largura da tela muda
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }

    // Adiciona um event listener que detecta mudanças no tamanho da tela
    mql.addEventListener("change", onChange)

    // Define `isMobile` na montagem do componente para garantir que o estado inicial seja correto
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)

    // Retorna uma função de limpeza que remove o event listener quando o componente é desmontado
    return () => mql.removeEventListener("change", onChange)
  }, []) // O array de dependências vazio garante que este efeito só rode na montagem e desmontagem

  // Retorna `true` ou `false` para indicar se a tela está no modo mobile
  return !!isMobile
}
