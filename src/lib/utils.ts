// Importa a função `clsx`, que ajuda a combinar classes CSS condicionalmente
import { clsx, type ClassValue } from "clsx"

// Importa a função `twMerge`, que mescla classes do Tailwind CSS e resolve conflitos
import { twMerge } from "tailwind-merge"

// Define uma função utilitária chamada `cn` que recebe múltiplas classes CSS como argumento
export function cn(...inputs: ClassValue[]) {
  // Usa `clsx` para processar as classes e `twMerge` para mesclar corretamente as classes do Tailwind
  return twMerge(clsx(inputs))
}
