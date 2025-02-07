import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card } from "./ui/card";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  DocumentData,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { differenceInDays } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, Archive, Plus, Lock, LockOpen } from "lucide-react";

// Definição da interface para as viagens
interface Travel {
  id: string;
  startDate: string;
  endDate: string;
  slots: number;
  destination: string;
  dailyAllowance?: number | null;
  dailyRate?: number | null;
  halfLastDay: boolean;
  volunteers: string[];
  archived: boolean;
  isLocked?: boolean;
}

export const TravelManagement = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [slots, setSlots] = useState("");
  const [destination, setDestination] = useState("");
  const [dailyAllowance, setDailyAllowance] = useState("");
  const [dailyRate, setDailyRate] = useState("");
  const [halfLastDay, setHalfLastDay] = useState(false);
  const [isEditingAllowance, setIsEditingAllowance] = useState(false);
  const [travels, setTravels] = useState<Travel[]>([]);
  const [volunteerCounts, setVolunteerCounts] = useState<{ [key: string]: number }>({});
  const [editingTravel, setEditingTravel] = useState<any>(null);
  const [expandedTravels, setExpandedTravels] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lockedTravels, setLockedTravels] = useState<string[]>([]);
  const { toast } = useToast();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // Define a classe de posicionamento do badge de status conforme o tipo de usuário
  const badgePositionClass = user.userType === "admin" ? "right-12" : "right-2";

  // Atualiza a contagem de viagens dos voluntários em tempo real
  useEffect(() => {
    const travelsRef = collection(db, "travels");
    const q = query(travelsRef);
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const counts: { [key: string]: number } = {};
      const today = new Date();

      snapshot.docs.forEach((doc) => {
        const travel = doc.data() as DocumentData;
        const travelStart = new Date(travel.startDate + "T00:00:00");
        if (today >= travelStart && travel.volunteers) {
          travel.volunteers.forEach((volunteer: string) => {
            counts[volunteer] = (counts[volunteer] || 0) + 1;
          });
        }
      });

      setVolunteerCounts(counts);
    });

    return () => unsubscribe();
  }, []);

  // Atualiza a lista de viagens em tempo real
  useEffect(() => {
    const q = query(collection(db, "travels"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const travelsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Travel[];
      setTravels(travelsData);

      // Atualiza os IDs dos travels bloqueados
      const lockedTravelIds = travelsData
        .filter((travel) => travel.isLocked)
        .map((travel) => travel.id);
      setLockedTravels(lockedTravelIds);
    });

    return () => unsubscribe();
  }, []);

  // Calcula o total (valor em R$) com base nas datas, no valor da diária e se o último dia vale meia
  useEffect(() => {
    if (startDate && endDate && dailyRate) {
      const start = new Date(startDate + "T00:00:00");
      const end = new Date(endDate + "T00:00:00");
      const numDays = differenceInDays(end, start) + 1;
      const count = halfLastDay ? numDays - 0.5 : numDays;
      const totalCost = count * Number(dailyRate);
      setDailyAllowance(String(totalCost));
    } else {
      setDailyAllowance("");
    }
  }, [startDate, endDate, dailyRate, halfLastDay]);

  const handleCreateTravel = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingTravel) {
        const travelRef = doc(db, "travels", editingTravel.id);
        await updateDoc(travelRef, {
          startDate,
          endDate,
          slots: Number(slots),
          destination,
          dailyAllowance: dailyAllowance ? Number(dailyAllowance) : null,
          dailyRate: dailyRate ? Number(dailyRate) : null,
          halfLastDay,
          updatedAt: new Date(),
          archived: editingTravel.archived || false,
        });

        toast({
          title: "Sucesso",
          description: "Viagem atualizada com sucesso!",
        });
        setEditingTravel(null);
      } else {
        await addDoc(collection(db, "travels"), {
          startDate,
          endDate,
          slots: Number(slots),
          destination,
          dailyAllowance: dailyAllowance ? Number(dailyAllowance) : null,
          dailyRate: dailyRate ? Number(dailyRate) : null,
          halfLastDay,
          createdAt: new Date(),
          volunteers: [],
          archived: false,
          isLocked: false,
        });

        toast({
          title: "Sucesso",
          description: "Viagem criada com sucesso!",
        });
      }

      setStartDate("");
      setEndDate("");
      setSlots("");
      setDestination("");
      setDailyAllowance("");
      setDailyRate("");
      setHalfLastDay(false);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error creating/updating travel:", error);
      toast({
        title: "Erro",
        description: "Erro ao salvar viagem.",
        variant: "destructive",
      });
    }
  };

  const handleEditTravel = (travel: Travel) => {
    setEditingTravel(travel);
    setStartDate(travel.startDate);
    setEndDate(travel.endDate);
    setSlots(String(travel.slots));
    setDestination(travel.destination);
    setDailyAllowance(String(travel.dailyAllowance));
    setDailyRate(String(travel.dailyRate));
    setHalfLastDay(travel.halfLastDay || false);
    setIsModalOpen(true);
  };

  const handleDeleteTravel = async (travelId: string) => {
    try {
      await deleteDoc(doc(db, "travels", travelId));
      toast({
        title: "Sucesso",
        description: "Viagem excluída com sucesso!",
      });
    } catch (error) {
      console.error("Error deleting travel:", error);
      toast({
        title: "Erro",
        description: "Erro ao excluir viagem.",
        variant: "destructive",
      });
    }
  };

  const handleArchive = async (travelId: string, archived: boolean) => {
    try {
      const travelRef = doc(db, "travels", travelId);
      await updateDoc(travelRef, { archived });
      toast({
        title: "Sucesso",
        description: archived
          ? "Viagem arquivada com sucesso!"
          : "Viagem desarquivada com sucesso!",
      });
    } catch (error) {
      console.error("Error archiving travel:", error);
      toast({
        title: "Erro",
        description: "Erro ao arquivar a viagem.",
        variant: "destructive",
      });
    }
  };

  const handleVolunteer = async (travelId: string) => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const volunteerInfo = `${user.rank} ${user.warName}`;

      if (!volunteerInfo) {
        toast({
          title: "Erro",
          description: "Usuário não encontrado. Por favor, faça login novamente.",
          variant: "destructive",
        });
        return;
      }

      const travelRef = doc(db, "travels", travelId);
      const travelSnap = await getDoc(travelRef);

      if (!travelSnap.exists()) {
        throw new Error("Viagem não encontrada");
      }

      const travelData = travelSnap.data();
      const currentVolunteers: string[] = Array.isArray(travelData.volunteers)
        ? travelData.volunteers
        : [];

      if (currentVolunteers.includes(volunteerInfo)) {
        const updatedVolunteers = currentVolunteers.filter((v) => v !== volunteerInfo);
        await updateDoc(travelRef, { volunteers: updatedVolunteers });
        toast({
          title: "Sucesso",
          description: "Você desistiu da viagem com sucesso.",
        });
        return;
      }

      const updatedVolunteers = [...currentVolunteers, volunteerInfo];
      await updateDoc(travelRef, { volunteers: updatedVolunteers });
      toast({
        title: "Sucesso",
        description: "Você se candidatou com sucesso!",
      });
    } catch (error) {
      console.error("Error volunteering:", error);
      toast({
        title: "Erro",
        description: "Erro ao se candidatar.",
        variant: "destructive",
      });
    }
  };

  const handleToggleLock = async (travelId: string) => {
    try {
      const travelRef = doc(db, "travels", travelId);
      const travelSnap = await getDoc(travelRef);

      if (travelSnap.exists()) {
        const isCurrentlyLocked = travelSnap.data().isLocked || false;
        await updateDoc(travelRef, { isLocked: !isCurrentlyLocked });
        toast({
          title: "Sucesso",
          description: !isCurrentlyLocked
            ? "Viagem bloqueada com sucesso!"
            : "Viagem desbloqueada com sucesso!",
        });
      }
    } catch (error) {
      console.error("Error toggling lock:", error);
      toast({
        title: "Erro",
        description: "Erro ao alterar o status da viagem.",
        variant: "destructive",
      });
    }
  };

  const getMilitaryRankWeight = (rank: string): number => {
    const rankWeights: { [key: string]: number } = {
      "Cel PM": 12,
      "Ten Cel PM": 11,
      "Maj PM": 10,
      "Cap PM": 9,
      "1° Ten PM": 8,
      "2° Ten PM": 7,
      "Sub Ten PM": 6,
      "1° Sgt PM": 5,
      "2° Sgt PM": 4,
      "3° Sgt PM": 3,
      "Cb PM": 2,
      "Sd PM": 1,
      "Estágio": 0,
    };
    return rankWeights[rank] || 0;
  };

  const sortVolunteers = (volunteers: string[], slots: number) => {
    if (!volunteers?.length) return [];
    const processedVolunteers = volunteers.map((volunteer) => {
      const [rank, ...nameParts] = volunteer.split(" ");
      return {
        fullName: volunteer,
        rank,
        count: volunteerCounts[volunteer] || 0,
        rankWeight: getMilitaryRankWeight(rank),
      };
    });

    const sortedVolunteers = processedVolunteers.sort((a, b) => {
      if (a.count !== b.count) {
        return a.count - b.count;
      }
      return b.rankWeight - a.rankWeight;
    });

    return sortedVolunteers.map((volunteer, index) => ({
      ...volunteer,
      selected: index < slots,
    }));
  };

  const toggleExpansion = (travelId: string) => {
    setExpandedTravels((prev) =>
      prev.includes(travelId) ? prev.filter((id) => id !== travelId) : [...prev, travelId]
    );
  };

  const formattedTravelCount = (count: number) => {
    return count === 1 ? "1 viagem" : `${count} viagens`;
  };

  return (
    <div className="p-6 space-y-8 relative">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {travels
          .sort(
            (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
          )
          .map((travel) => {
            const travelStart = new Date(travel.startDate + "T00:00:00");
            const travelEnd = new Date(travel.endDate + "T00:00:00");
            const today = new Date();
            const isLocked = travel.isLocked;
            const status =
              today < travelStart
                ? "Em aberto"
                : today >= travelStart && today <= travelEnd
                ? "Em transito"
                : "Encerrada";

            let cardBg = "bg-white";
            let statusBadge = null;

            if (status === "Em aberto") {
              statusBadge = isLocked ? (
                <div
                  className={`absolute top-2 ${badgePositionClass} bg-orange-500 text-white px-2 py-1 text-xs rounded`}
                >
                  Processando diária
                </div>
              ) : (
                <div
                  className={`absolute top-2 ${badgePositionClass} bg-[#3B82F6] text-white px-2 py-1 text-xs rounded`}
                >
                  Em aberto
                </div>
              );
            } else if (status === "Em transito") {
              cardBg = "bg-green-100";
              statusBadge = (
                <div
                  className={`absolute top-2 ${badgePositionClass} bg-green-500 text-white px-2 py-1 text-xs rounded`}
                >
                  Em transito
                </div>
              );
            } else if (status === "Encerrada") {
              cardBg = "bg-gray-100";
              statusBadge = (
                <div
                  className={`absolute top-2 ${badgePositionClass} bg-gray-300 text-gray-700 px-2 py-1 text-xs rounded`}
                >
                  Encerrada
                </div>
              );
            }

            const minimalContent = (
              <div className="cursor-default">
                <h3 className="text-xl font-semibold">{travel.destination}</h3>
                <p>
                  Data Inicial:{" "}
                  {new Date(travel.startDate + "T00:00:00").toLocaleDateString()}
                </p>
                <p>{`Diárias: ${differenceInDays(travelEnd, travelStart) + 1 + (travel.halfLastDay ? -0.5 : 0)}`}</p>
              </div>
            );

            const fullContent = (
              <div className="cursor-default">
                <h3 className="text-xl font-semibold text-primary">
                  {travel.destination}
                </h3>
                <div className="mt-2 space-y-1 text-sm text-gray-600">
                  <p>
                    Data Inicial:{" "}
                    {new Date(travel.startDate + "T00:00:00").toLocaleDateString()}
                  </p>
                  <p>
                    Data Final:{" "}
                    {new Date(travel.endDate + "T00:00:00").toLocaleDateString()}
                  </p>
                  <p>Vagas: {travel.slots}</p>
                  <p>
                    {travel.dailyRate
                      ? `Diárias: ${
                          differenceInDays(travelEnd, travelStart) + 1 + (travel.halfLastDay ? -0.5 : 0)
                        } (${(
                          (differenceInDays(travelEnd, travelStart) + 1 + (travel.halfLastDay ? -0.5 : 0)) *
                          Number(travel.dailyRate)
                        ).toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })})`
                      : `Diárias: ${
                          differenceInDays(travelEnd, travelStart) + 1 + (travel.halfLastDay ? -0.5 : 0)
                        }`}
                  </p>
                  {travel.volunteers && travel.volunteers.length > 0 && (
                    <div className="pt-4 border-t border-gray-100">
                      <h4 className="font-medium text-sm text-gray-700 mb-2">
                        Voluntário:
                      </h4>
                      <ul className="space-y-1">
                        {sortVolunteers(travel.volunteers, travel.slots)
                          .filter((volunteer) => !isLocked || volunteer.selected)
                          .map((volunteer) => (
                            <li
                              key={volunteer.fullName}
                              className={`text-sm p-2 rounded flex justify-between items-center ${
                                volunteer.selected
                                  ? "bg-green-100 border border-green-200"
                                  : "bg-gray-50 border border-gray-100"
                              }`}
                            >
                              <div className="flex items-center space-x-2">
                                {volunteer.selected && (
                                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                )}
                                <span className={volunteer.selected ? "font-medium" : ""}>
                                  {volunteer.fullName}
                                </span>
                              </div>
                              <span
                                className={`text-xs ${
                                  volunteer.selected ? "text-green-700" : "text-gray-500"
                                }`}
                              >
                                {formattedTravelCount(volunteer.count)}
                              </span>
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            );

            return (
              <Card
                key={travel.id}
                className={`p-6 hover:shadow-xl transition-shadow relative ${cardBg} ${
                  travel.archived ? "cursor-pointer" : ""
                }`}
                {...(status === "Encerrada" ? { onDoubleClick: () => toggleExpansion(travel.id) } : {})}
              >
                {statusBadge}
                {user.userType === "admin" && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="absolute top-2 right-2 h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {status === "Em aberto" && (
                        <>
                          <DropdownMenuItem onClick={() => handleEditTravel(travel)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleArchive(travel.id, true)}>
                            <Archive className="mr-2 h-4 w-4" />
                            Arquivar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleLock(travel.id)}>
                            {isLocked ? (
                              <>
                                <LockOpen className="mr-2 h-4 w-4" />
                                Reabrir vagas
                              </>
                            ) : (
                              <>
                                <Lock className="mr-2 h-4 w-4" />
                                Processar diária
                              </>
                            )}
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => handleDeleteTravel(travel.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
                <div className="space-y-4">
                  {status === "Encerrada" && !expandedTravels.includes(travel.id)
                    ? minimalContent
                    : fullContent}
                </div>
              </Card>
            );
          })}
      </div>

      {/* Modal para criar/editar viagem */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <Card className="p-6 bg-white shadow-lg max-w-lg w-full relative">
            <button
              onClick={() => {
                setIsModalOpen(false);
                setEditingTravel(null);
                setStartDate("");
                setEndDate("");
                setSlots("");
                setDestination("");
                setDailyAllowance("");
                setDailyRate("");
                setHalfLastDay(false);
              }}
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 text-xl"
            >
              &times;
            </button>
            <form onSubmit={handleCreateTravel} className="space-y-6">
              <h2 className="text-2xl font-semibold text-primary">
                {editingTravel ? "Editar Viagem" : "Criar Nova Viagem"}
              </h2>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="destination">Destino</Label>
                  <Input
                    id="destination"
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    required
                    placeholder="Digite o destino"
                    className="w-full"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Data Inicial</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">Data Final</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                      className="w-full"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="slots">Número de Vagas</Label>
                    <Input
                      id="slots"
                      type="number"
                      value={slots}
                      onChange={(e) => setSlots(e.target.value)}
                      required
                      min="1"
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dailyRate">Valor da Diária</Label>
                    <Input
                      id="dailyRate"
                      type="number"
                      value={dailyRate}
                      onChange={(e) => setDailyRate(e.target.value)}
                      placeholder="Opcional"
                      className="w-full"
                    />
                  </div>
                </div>
                <div className="flex items-center">
                  <Label htmlFor="halfLastDay" className="mr-2 text-sm">
                    Último dia meia diária
                  </Label>
                  <Button
                    id="halfLastDay"
                    variant={halfLastDay ? "primary" : "outline"}
                    onClick={() => setHalfLastDay(!halfLastDay)}
                    className="transition-colors"
                  >
                    {halfLastDay ? "Ativo" : "Inativo"}
                  </Button>
                </div>
              </div>
              <div className="flex gap-4 mt-4">
                <Button type="submit" className="w-full md:w-auto">
                  {editingTravel ? "Salvar Alterações" : "Criar Viagem"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingTravel(null);
                    setStartDate("");
                    setEndDate("");
                    setSlots("");
                    setDestination("");
                    setDailyAllowance("");
                    setDailyRate("");
                    setHalfLastDay(false);
                  }}
                  className="w-full md:w-auto"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Botão flutuante para administradores */}
      {user.userType === "admin" && (
        <Button
          onClick={() => setIsModalOpen(true)}
          className="fixed bottom-4 right-4 rounded-full p-4 bg-[#3B82F6] hover:bg-[#2563eb] text-white shadow-lg"
        >
          <Plus className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
};
