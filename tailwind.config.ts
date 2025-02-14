import type { Config } from "tailwindcss";

// Exporta a configuração do Tailwind CSS
export default {
  /* Define o modo escuro baseado em uma classe (ao invés de preferências do sistema) */
  darkMode: ["class"],

  /* Define os caminhos dos arquivos que serão analisados pelo Tailwind 
  para gerar as classes CSS necessárias */
  content: [
    "./pages/**/*.{ts,tsx}",      // Arquivos dentro de "pages" com extensão .ts e .tsx
    "./components/**/*.{ts,tsx}", // Arquivos dentro de "components" com extensão .ts e .tsx
    "./app/**/*.{ts,tsx}",        // Arquivos dentro de "app" com extensão .ts e .tsx
    "./src/**/*.{ts,tsx}",        // Arquivos dentro de "src" com extensão .ts e .tsx
  ],

  /* Define o prefixo para as classes geradas. Está vazio, portanto, não há prefixo. */
  prefix: "",

  theme: {
    /* Configura o container centralizado com padding e largura específica para telas grandes */
    container: {
      center: true,               // Centraliza o container
      padding: '2rem',            // Adiciona 2rem de padding ao redor do container
      screens: {
        '2xl': '1400px'            // Para telas '2xl', define o limite máximo de largura como 1400px
      }
    },

    /* Extende a configuração padrão do tema, adicionando cores personalizadas, bordas e animações */
    extend: {
      colors: {
        /* Definição de cores usando variáveis CSS (com a possibilidade de modificá-las em tempo de execução) */
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',

        /* Definições de cores principais (primary), secundárias (secondary), de destaque (highlight), etc. */
        primary: {
          DEFAULT: '#13293D',
          light: '#247BA0',
          dark: '#006494',
          foreground: '#E8F1F2'
        },
        secondary: {
          DEFAULT: '#006494',
          foreground: '#E8F1F2'
        },
        accent: {
          DEFAULT: '#247BA0',
          foreground: '#E8F1F2'
        },
        highlight: {
          DEFAULT: '#1B98E0',
          foreground: '#E8F1F2'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        popover: {
          DEFAULT: '#E8F1F2',
          foreground: '#13293D'
        },
        card: {
          DEFAULT: '#E8F1F2',
          foreground: '#13293D'
        }
      },

      /* Define os tamanhos de borda personalizados com base nas variáveis CSS */
      borderRadius: {
        lg: 'var(--radius)',           // Usando a variável '--radius' para bordas grandes
        md: 'calc(var(--radius) - 2px)',// Calcula um valor ligeiramente menor para bordas médias
        sm: 'calc(var(--radius) - 4px)' // Calcula um valor ainda menor para bordas pequenas
      },

      /* Define animações e keyframes personalizados para elementos como o accordion */
      keyframes: {
        'accordion-down': {
          from: { height: '0' },                           // Início da animação com altura 0
          to: { height: 'var(--radix-accordion-content-height)' } // Fim da animação com altura definida pela variável
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' }, // Início com altura máxima
          to: { height: '0' }                                // Fim com altura 0
        }
      },

      /* Define as animações associadas aos keyframes */
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out', // Aplica a animação de "descer" com duração de 0.2s e easing 'ease-out'
        'accordion-up': 'accordion-up 0.2s ease-out'      // Aplica a animação de "subir" com duração de 0.2s e easing 'ease-out'
      }
    }
  },

  /* Carrega o plugin tailwindcss-animate, para facilitar animações no Tailwind */
  plugins: [require("tailwindcss-animate")],
} satisfies Config; // Garante que a configuração está de acordo com a interface Config do Tailwind
