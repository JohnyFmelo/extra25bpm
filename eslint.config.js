// Importa a configuração principal do ESLint para JavaScript e TypeScript
import js from "@eslint/js"; 

// Importa o objeto `globals` do pacote 'globals', que define variáveis
// globais para diferentes ambientes.
import globals from "globals"; 

// Importa o plugin ESLint para hooks do React
import reactHooks from "eslint-plugin-react-hooks"; 

// Importa o plugin ESLint para suporte ao React Fast Refresh
// (recarregamento rápido em desenvolvimento)
import reactRefresh from "eslint-plugin-react-refresh"; 

// Importa a configuração ESLint específica para TypeScript, 
// usando o pacote @typescript-eslint/eslint-plugin
import tseslint from "typescript-eslint"; 

// Configura o ESLint com a configuração de TypeScript, passando 
// as opções de ignorar o diretório "dist" e outras configurações.
export default tseslint.config(
  { ignores: ["dist"] }, // Ignora a pasta "dist" para linting 
  // (geralmente contém arquivos de build que não devem ser analisados)
  
  {
    // Estende as configurações recomendadas do ESLint para JavaScript 
    // e as do TypeScript
    extends: [js.configs.recommended, ...tseslint.configs.recommended],

    // Aplica o linting apenas a arquivos com extensões .ts e 
    // .tsx (arquivos TypeScript e React com TypeScript)
    files: ["**/*.{ts,tsx}"],

    languageOptions: {
      // Define a versão ECMAScript para 2020, que habilita os recursos 
      // modernos da linguagem
      ecmaVersion: 2020,

      // Define que o ambiente do código é o navegador, permitindo o uso 
      // de variáveis globais como `window`, `document`, etc.
      globals: globals.browser,
    },

    plugins: {
      // Adiciona os plugins do React Hooks e React Refresh para 
      // verificar regras específicas desses plugins
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },

    // Define regras específicas para o projeto
    rules: {
      // Aplica as regras recomendadas do ESLint para React Hooks
      ...reactHooks.configs.recommended.rules,

      // Personaliza a regra do plugin React Refresh para dar um aviso
      //  quando componentes não forem exportados corretamente
      "react-refresh/only-export-components": [
        "warn", // Nível de severidade para a regra (aviso)
        { allowConstantExport: true }, // Permite exportações constantes 
        // (variáveis constantes)
      ],

      // Desabilita a regra do ESLint para não permitir variáveis 
      // não usadas no TypeScript
      "@typescript-eslint/no-unused-vars": "off", // Desativa a verificação de 
      // variáveis não utilizadas
    },
  }
);
