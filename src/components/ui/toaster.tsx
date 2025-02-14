// Importa o hook useToast, que gerencia o estado e as funções dos toasts (notificações).
import { useToast } from "@/hooks/use-toast"

// Importa os componentes necessários para a estrutura dos toasts (notificações).
import {
  Toast, // Componente principal do toast.
  ToastClose, // Botão para fechar o toast manualmente.
  ToastDescription, // Componente que exibe a descrição da notificação.
  ToastProvider, // Provedor que gerencia o contexto dos toasts na aplicação.
  ToastTitle, // Componente que exibe o título do toast.
  ToastViewport, // Área onde os toasts serão exibidos na tela.
} from "@/components/ui/toast"

// Define e exporta o componente Toaster, responsável por exibir as notificações.
export function Toaster() {
  // Obtém a lista de toasts ativos através do hook useToast.
  const { toasts } = useToast()

  return (
    // Provedor que gerencia os toasts e garante que eles sejam renderizados corretamente.
    <ToastProvider>
      {/* Mapeia a lista de toasts e renderiza cada um */}
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          // Renderiza um componente Toast para cada notificação na lista.
          <Toast key={id} {...props}>
            {/* Div que organiza os elementos do toast em um layout de grid com espaçamento */}
            <div className="grid gap-1">
              {/* Renderiza o título do toast se ele existir */}
              {title && <ToastTitle>{title}</ToastTitle>}
              {/* Renderiza a descrição do toast se ela existir */}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {/* Renderiza a ação do toast (ex: botão de ação), se existir */}
            {action}
            {/* Botão para fechar a notificação manualmente */}
            <ToastClose />
          </Toast>
        )
      })}
      {/* Define a área onde os toasts aparecerão na tela */}
      <ToastViewport />
    </ToastProvider>
  )
}
