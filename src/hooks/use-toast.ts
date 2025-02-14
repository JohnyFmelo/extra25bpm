// Importa todas as funcionalidades do React
import * as React from "react"

// Importa os tipos necessários do componente de toast
import type {
  ToastActionElement, // Tipo para elementos de ação no toast
  ToastProps, // Tipo para as propriedades do toast
} from "@/components/ui/toast"

// Define o limite máximo de toasts que podem ser exibidos ao mesmo tempo
const TOAST_LIMIT = 1

// Define o tempo antes de remover um toast (atualmente muito longo: 1000000ms)
const TOAST_REMOVE_DELAY = 1000000

// Define o tipo do toast, incluindo suas propriedades
type ToasterToast = ToastProps & {
  id: string // Identificador único do toast
  title?: React.ReactNode // Título opcional do toast
  description?: React.ReactNode // Descrição opcional do toast
  action?: ToastActionElement // Elemento opcional de ação no toast
}

// Define os tipos de ações disponíveis para manipulação dos toasts
const actionTypes = {
  ADD_TOAST: "ADD_TOAST", // Adicionar um novo toast
  UPDATE_TOAST: "UPDATE_TOAST", // Atualizar um toast existente
  DISMISS_TOAST: "DISMISS_TOAST", // Marcar um toast como fechado
  REMOVE_TOAST: "REMOVE_TOAST", // Remover um toast da lista
} as const

// Variável global para contar e gerar IDs únicos para os toasts
let count = 0

// Função para gerar um ID único para cada toast
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER // Incrementa o contador sem ultrapassar o limite seguro de números
  return count.toString() // Retorna o ID como string
}

// Define o tipo de ação usando os valores de actionTypes
type ActionType = typeof actionTypes

// Define o tipo das ações que podem ser enviadas para o reducer
type Action =
  | {
      type: ActionType["ADD_TOAST"]
      toast: ToasterToast
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<ToasterToast>
    }
  | {
      type: ActionType["DISMISS_TOAST"]
      toastId?: ToasterToast["id"]
    }
  | {
      type: ActionType["REMOVE_TOAST"]
      toastId?: ToasterToast["id"]
    }

// Define a estrutura do estado que contém a lista de toasts
interface State {
  toasts: ToasterToast[]
}

// Cria um mapa para armazenar os timeouts de remoção dos toasts
const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

// Função que adiciona um toast à fila de remoção após um tempo definido
const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return // Se o toast já está na fila, não faz nada
  }

  // Cria um timeout para remover o toast após o tempo definido
  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId) // Remove o ID do mapa de timeouts
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId, // Remove o toast do estado global
    })
  }, TOAST_REMOVE_DELAY)

  // Adiciona o timeout ao mapa de timeouts
  toastTimeouts.set(toastId, timeout)
}

// Função reducer que gerencia o estado dos toasts com base nas ações recebidas
export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        // Adiciona um novo toast no início da lista, garantindo que o número de toasts não ultrapasse o limite
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case "UPDATE_TOAST":
      return {
        ...state,
        // Atualiza um toast específico com as novas informações
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case "DISMISS_TOAST": {
      const { toastId } = action

      // Adiciona o toast à fila de remoção
      if (toastId) {
        addToRemoveQueue(toastId)
      } else {
        // Se nenhum ID for especificado, remove todos os toasts
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id)
        })
      }

      return {
        ...state,
        // Marca os toasts como fechados para que sejam removidos depois
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      }
    }

    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        // Remove o toast com o ID correspondente
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
  }
}

// Lista de funções que serão chamadas quando o estado for atualizado
const listeners: Array<(state: State) => void> = []

// Estado em memória que armazena os toasts
let memoryState: State = { toasts: [] }

// Função que despacha uma ação e notifica todos os listeners
function dispatch(action: Action) {
  memoryState = reducer(memoryState, action) // Atualiza o estado usando o reducer
  listeners.forEach((listener) => {
    listener(memoryState) // Notifica todos os ouvintes do novo estado
  })
}

// Define o tipo básico de um toast, excluindo o ID
type Toast = Omit<ToasterToast, "id">

// Função que cria um novo toast e o adiciona ao estado
function toast({ ...props }: Toast) {
  const id = genId() // Gera um ID único para o toast

  // Função para atualizar o toast posteriormente
  const update = (props: ToasterToast) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    })

  // Função para fechar o toast
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

  // Adiciona o toast ao estado global
  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss() // Fecha o toast quando necessário
      },
    },
  })

  return {
    id: id,
    dismiss,
    update,
  }
}

// Hook personalizado para gerenciar os toasts no React
function useToast() {
  // Estado local que espelha o estado global dos toasts
  const [state, setState] = React.useState<State>(memoryState)

  // Efeito que adiciona/remova o componente da lista de listeners quando necessário
  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state])

  return {
    ...state, // Retorna o estado atual dos toasts
    toast, // Função para criar um novo toast
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }), // Função para fechar um toast
  }
}

// Exporta o hook useToast e a função toast para uso em outros componentes
export { useToast, toast }
