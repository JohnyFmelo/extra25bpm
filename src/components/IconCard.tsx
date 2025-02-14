// Importa o tipo LucideIcon da biblioteca lucide-react
import { LucideIcon } from "lucide-react";
// Importa o hook useNavigate do react-router-dom para navegação programática
import { useNavigate } from "react-router-dom";

// Define a interface IconCardProps para tipar as propriedades do componente
interface IconCardProps {
  icon: LucideIcon; // Ícone a ser exibido
  label: string; // Texto do botão
  onClick?: () => void; // Função opcional a ser executada ao clicar
  badge?: number; // Número opcional para exibição de uma notificação
}

// Declara o componente funcional IconCard e desestrutura as propriedades passadas
const IconCard = ({ icon: Icon, label, onClick, badge }: IconCardProps) => {
  // Obtém a função navigate para navegação programática
  const navigate = useNavigate();

  // Define a função handleClick que será chamada quando o botão for clicado
  const handleClick = () => {
    if (onClick) {
      // Se uma função onClick foi passada, executa ela
      onClick();
    } else if (label === "Horas") {
      // Se não houver onClick e o label for "Horas", navega para "/hours"
      navigate("/hours");
    }
  };

  return (
    // Botão que dispara a função handleClick ao ser clicado
    <button
      onClick={handleClick}
      className="relative flex flex-col items-center justify-center p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all space-y-3 group hover:bg-primary hover:text-primary-foreground"
    >
      {/* Se badge for definido e maior que 0, exibe um indicador no canto superior direito */}
      {badge !== undefined && badge > 0 && (
        <span className="absolute top-2 right-2 flex items-center justify-center w-6 h-6 bg-green-500 text-white text-xs font-bold rounded-full">
          {badge}
        </span>
      )}
      
      {/* Renderiza o ícone passado como propriedade */}
      <Icon className="h-10 w-10 text-primary group-hover:text-primary-foreground transition-colors" />
      
      {/* Exibe o texto do botão */}
      <span className="text-base font-medium">{label}</span>
    </button>
  );
};

// Exporta o componente IconCard para ser utilizado em outros arquivos
export default IconCard;
