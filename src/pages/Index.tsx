// Importa ícones da biblioteca lucide-react
import { Clock, Calendar, Pencil, FileText, ArrowLeft, Settings, Users, Bell, MessageSquare, MapPinned } from "lucide-react";

// Importa componentes personalizados do projeto
import IconCard from "@/components/IconCard";
import WeeklyCalendar from "@/components/WeeklyCalendar";
import TimeSlotsList from "@/components/TimeSlotsList";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UsersList from "@/components/UsersList";
import ProfileUpdateDialog from "@/components/ProfileUpdateDialog";
import PasswordChangeDialog from "@/components/PasswordChangeDialog";
import InformationDialog from "@/components/InformationDialog";
import ScheduleList from "@/components/ScheduleList";
import Messages from "@/components/Messages";
import NotificationsList, { useNotifications } from "@/components/NotificationsList";
import { TravelManagement } from "@/components/TravelManagement";
import { useToast } from "@/hooks/use-toast";

// Define o componente principal
const Index = () => {
  // Define o estado da aba ativa
  const [activeTab, setActiveTab] = useState("main");
  // Define o estado do bloqueio do calendário
  const [isLocked, setIsLocked] = useState(false);
  // Define o estado da data atual
  const [currentDate, setCurrentDate] = useState(new Date());
  // Define estados para exibir diálogos modais
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showInformationDialog, setShowInformationDialog] = useState(false);
  // Obtém a função de notificação
  const { toast } = useToast();
  // Obtém os dados do usuário armazenados no localStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  // Obtém a contagem de notificações não lidas
  const unreadCount = useNotifications();

  // Funções para alternar entre as abas
  const handleEditorClick = () => setActiveTab("editor");
  const handleExtraClick = () => setActiveTab("extra");
  const handleUsersClick = () => setActiveTab("users");
  const handleBackClick = () => setActiveTab("main");
  const handleSettingsClick = () => setActiveTab("settings");
  const handleScheduleClick = () => setActiveTab("schedule");
  const handleMessageClick = () => setActiveTab("messages");
  const handleNotificationsClick = () => setActiveTab("notifications");
  const handleTravelClick = () => setActiveTab("travel");

  return (
    // Define o layout da página
    <div className="relative min-h-screen bg-[#E8F1F2]">
      <div className="pt-8 px-6 pb-16 max-w-7xl mx-auto">
        {/* Componente de abas */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          {/* Lista de abas escondida (útil para navegação programática) */}
          <TabsList className="hidden">
            <TabsTrigger value="main">Main</TabsTrigger>
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="extra">Extra</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="travel">Travel</TabsTrigger>
          </TabsList>

          {/* Conteúdo de cada aba */}
          <TabsContent value="main">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <IconCard icon={Clock} label="Horas" />
              <IconCard icon={Calendar} label="Extra" onClick={handleExtraClick} />
              <IconCard icon={Bell} label="Notificações" onClick={handleNotificationsClick} badge={unreadCount > 0 ? unreadCount : undefined} />
              {user.userType === "admin" && (
                <>
                  <IconCard icon={Pencil} label="Editor" onClick={handleEditorClick} />
                  <IconCard icon={Users} label="Usuários" onClick={handleUsersClick} />
                  <IconCard icon={MessageSquare} label="Recados" onClick={handleMessageClick} />
                </>
              )}
              <IconCard icon={FileText} label="Escala" onClick={handleScheduleClick} />
              <IconCard icon={Settings} label="Configurações" onClick={handleSettingsClick} />
              <IconCard icon={MapPinned} label="Viagens" onClick={handleTravelClick} />
            </div>
          </TabsContent>

          {/* Aba de configurações */}
          <TabsContent value="settings">
            <div className="relative">
              <div className="absolute right-0 -top-12 mb-4">
                <button onClick={handleBackClick} className="p-2 rounded-full hover:bg-white/80 transition-colors text-primary" aria-label="Voltar para home">
                  <ArrowLeft className="h-6 w-6" />
                </button>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
                <h2 className="text-2xl font-semibold mb-6">Configurações</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button onClick={() => setShowProfileDialog(true)} className="p-4 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                    <h3 className="font-medium">Alterar Cadastro</h3>
                    <p className="text-sm text-gray-600">Atualize suas informações pessoais</p>
                  </button>
                  <button onClick={() => setShowPasswordDialog(true)} className="p-4 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                    <h3 className="font-medium">Alterar Senha</h3>
                    <p className="text-sm text-gray-600">Modifique sua senha de acesso</p>
                  </button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Exporta o componente
export default Index;
