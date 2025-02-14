// Importa todas as funcionalidades do React
import * as React from "react"

// Importa os componentes de toast do Radix UI
import * as ToastPrimitives from "@radix-ui/react-toast"

// Importa a biblioteca `class-variance-authority` para gerenciar classes variantes
import { cva, type VariantProps } from "class-variance-authority"

// Importa o ícone "X" da biblioteca Lucide React para o botão de fechar o toast
import { X } from "lucide-react"

// Importa a função `cn` para combinar classes CSS dinamicamente
import { cn } from "@/lib/utils"

// Define o ToastProvider como o provider dos toasts do Radix UI
const ToastProvider = ToastPrimitives.Provider

// Define o container onde os toasts serão exibidos na tela
const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
      className
    )}
    {...props}
  />
))
// Define um nome de exibição para facilitar a depuração
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

// Define os estilos variantes dos toasts usando `cva`
const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        default: "border bg-background text-foreground",
        destructive:
          "destructive group border-destructive bg-destructive text-destructive-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

// Define o componente Toast, que representa cada notificação
const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
    VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  )
})
// Define um nome de exibição para facilitar a depuração
Toast.displayName = ToastPrimitives.Root.displayName

// Define o botão de ação dentro do toast (exemplo: "Tentar novamente")
const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive",
      className
    )}
    {...props}
  />
))
// Define um nome de exibição para facilitar a depuração
ToastAction.displayName = ToastPrimitives.Action.displayName

// Define o botão de fechar do toast, usando o ícone "X"
const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600",
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
))
// Define um nome de exibição para facilitar a depuração
ToastClose.displayName = ToastPrimitives.Close.displayName

// Define o título do toast (exemplo: "Erro ao carregar dados")
const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("text-sm font-semibold", className)}
    {...props}
  />
))
// Define um nome de exibição para facilitar a depuração
ToastTitle.displayName = ToastPrimitives.Title.displayName

// Define a descrição do toast (exemplo: "Houve um erro ao tentar buscar os dados")
const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("text-sm opacity-90", className)}
    {...props}
  />
))
// Define um nome de exibição para facilitar a depuração
ToastDescription.displayName = ToastPrimitives.Description.displayName

// Define o tipo ToastProps com base no componente Toast
type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>

// Define o tipo ToastActionElement para o botão de ação dentro do toast
type ToastActionElement = React.ReactElement<typeof ToastAction>

// Exporta todos os componentes e tipos para serem utilizados em outras partes do projeto
export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
}
