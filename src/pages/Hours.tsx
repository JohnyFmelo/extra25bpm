// Importa hooks e componentes do React e outras bibliotecas usadas no código
import { useState, useEffect } from "react"; // Hooks do React
import { useToast } from "@/hooks/use-toast"; // Hook customizado para exibir mensagens de toast
import { Button } from "@/components/ui/button"; // Componente de botão customizado
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Componentes do Select para escolher o mês
import { Separator } from "@/components/ui/separator"; // Componente para separar seções com uma linha
import { Loader2, ArrowLeft } from "lucide-react"; // Ícones para carregar e voltar
import { useNavigate } from "react-router-dom"; // Hook para navegação de páginas no React Router

// Define a estrutura de dados para as horas (tipos das colunas esperadas)
interface HoursData {
  Nome: string; // Nome do usuário
  "Horas 25° BPM": string; // Horas trabalhadas no 25° BPM
  Sinfra: string; // Horas trabalhadas na Sinfra
  Sonora: string; // Horas trabalhadas na Sonora
  "Total 25° BPM": string; // Total de horas do 25° BPM
  "Total Geral": string; // Total geral de horas
}

// Lista de meses para o select
const months = [
  { value: "janeiro", label: "Janeiro" },
  { value: "fevereiro", label: "Fevereiro" },
  { value: "marco", label: "Março" },
  { value: "abril", label: "Abril" },
  { value: "maio", label: "Maio" },
  { value: "junho", label: "Junho" },
  { value: "julho", label: "Julho" },
  { value: "agosto", label: "Agosto" },
  { value: "setembro", label: "Setembro" },
  { value: "outubro", label: "Outubro" },
  { value: "novembro", label: "Novembro" },
  { value: "dezembro", label: "Dezembro" },
];


// Componente principal da página
const Hours = () => {
  // Estado para armazenar o mês selecionado
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  // Estado para controlar o carregamento da requisição
  const [loading, setLoading] = useState(false);
  // Estado para armazenar os dados recebidos da API
  const [data, setData] = useState<HoursData | null>(null);
  // Estado para armazenar dados do usuário
  const [userData, setUserData] = useState<any>(null);
  // Hook para exibir mensagens de toast
  const { toast } = useToast();
  // Hook para navegação de páginas
  const navigate = useNavigate();

    // UseEffect para pegar os dados do usuário no localStorage quando 
    // o componente carregar
    useEffect(() => {
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      setUserData(storedUser); // Armazena os dados do usuário no estado
  
      // Função que será chamada quando o localStorage for alterado
      const handleStorageChange = () => {
        const updatedUser = JSON.parse(localStorage.getItem('user') || '{}');
        setUserData(updatedUser); // Atualiza os dados do usuário no estado
      };
  
      // Adiciona um ouvinte para mudanças no localStorage
      window.addEventListener('storage', handleStorageChange);
  
      // Limpeza do ouvinte quando o componente for desmontado
      return () => {
        window.removeEventListener('storage', handleStorageChange);
      };
    }, []);
  
 // Função para consultar as horas com base no mês selecionado e dados do usuário
 const handleConsult = async () => {
  // Verifica se o usuário tem uma matrícula cadastrada
  if (!userData?.registration) {
    toast({
      variant: "destructive",
      title: "Erro",
      description: "Usuário não autenticado ou sem matrícula cadastrada. Por favor, atualize seu cadastro.",
    });
    return; // Interrompe a execução se o usuário não tiver matrícula
  }

  // Verifica se o mês foi selecionado
  if (!selectedMonth) {
    toast({
      variant: "destructive",
      title: "Erro",
      description: "Selecione um mês",
    });
    return; // Interrompe a execução se o mês não for selecionado
  }

 setLoading(true); // Ativa o estado de carregamento
    try {
      // Define a URL da API que será consultada
      const apiUrl = `https://script.google.com/macros/s/AKfycbxmUSgKPVz_waNPHdKPT1y8x52xPNS9Yzqx_u1mlH83OabndJQ8Ie2ZZJVJnLIMNOb4/exec`;
      // Define os parâmetros que serão passados para a API
      const params = new URLSearchParams({
        mes: selectedMonth,
        matricula: userData.registration
      });

      // Realiza a requisição para a API
      const response = await fetch(`${apiUrl}?${params.toString()}`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Accept': 'application/json',
        },
      });

      // Verifica se a resposta foi bem-sucedida
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json(); // Converte a resposta para JSON
      console.log('Resultado da consulta:', result);

      // Verifica se a resposta contém erro
      if (result.error) {
        throw new Error(result.error);
      }

      // Se não houver dados para a matrícula, exibe um erro
      if (!result.length) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Matrícula não localizada",
        });
        setData(null); // Reseta os dados
        return;
      }

      setData(result[0]); // Armazena os dados da resposta no estado
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao consultar dados. Por favor, tente novamente mais tarde.",
      });
    } finally {
      setLoading(false); // Desativa o estado de carregamento
    }
  };


  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <div className="relative h-12">
        <div className="absolute right-0 top-0">
          <button
            onClick={() => navigate('/')} // Navega para a página inicial ao clicar no botão
            className="p-2 rounded-full hover:bg-white/80 transition-colors text-primary"
            aria-label="Voltar para home"
          >
            <ArrowLeft className="h-6 w-6" /> {/* Ícone de seta para voltar */}
          </button>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="space-y-4">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o mês" /> {/* Exibe o valor selecionado */}
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label} {/* Exibe a lista de meses */}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button 
            onClick={handleConsult} 
            disabled={loading || !userData?.registration} 
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {/* Exibe ícone de carregamento */}
                Consultando...
              </>
            ) : (
              "Consultar" // Texto do botão
            )}
          </Button>

          {!userData?.registration && (
            <p className="text-sm text-red-500">
              Você precisa cadastrar sua matrícula para consultar as horas.
            </p>
          )}

          {data && (
            <div className="mt-6 space-y-4">
              <h2 className="text-center font-bold text-xl">{data.Nome}</h2>
              
              <div>
                <h3 className="font-bold mb-2">Dias trabalhados:</h3>
                {data["Horas 25° BPM"] && (
                  <p>25° BPM: {data["Horas 25° BPM"]}</p>
                )}
                {data.Sonora && <p>Sonora: {data.Sonora}</p>}
                {data.Sinfra && <p>Sinfra: {data.Sinfra}</p>}
              </div>

              <Separator />

              <div>
                <h3 className="font-bold mb-2">Horas:</h3>
                {data["Total 25° BPM"] && (
                  <p>25° BPM: {data["Total 25° BPM"]}</p>
                )}
                {data["Total Geral"] && (
                  <p className="font-bold text-green-600">
                    Total: {data["Total Geral"]}
                  </p>
                )}
              </div>

              <Button 
                variant="destructive" 
                className="w-full mt-4"
                onClick={() => setData(null)} // Reseta os dados ao fechar
              >
                Fechar
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Hours;