
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { useUser } from "@/context/UserContext";
import { connectToDatabase } from "@/integrations/mongodb/client";
import { useNavigate } from "react-router-dom";

interface OrderProcessingProps {
  checkoutData: any;
  selectedAddress: string | null;
  addresses: any[];
  selectedPayment: string;
  notes: string;
  addressData: {
    street: string;
    complement: string;
    neighborhood: string;
    city: string;
    state: string;
    zipcode: string;
  };
  isAuthenticated: boolean;
}

export const useOrderProcessing = (props?: OrderProcessingProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const { user } = useUser();
  const navigate = useNavigate();

  // Função para processar pedido
  const processOrder = async (orderData?: any) => {
    if (!user) {
      setError("Você precisa estar logado para fazer um pedido");
      toast.error("Você precisa estar logado para fazer um pedido");
      return { success: false };
    }

    setIsLoading(true);
    setError(null);

    try {
      // Se tivermos props do checkout, usamos esses dados
      const finalOrderData = orderData || {
        items: props?.checkoutData?.items || [],
        restaurantId: props?.checkoutData?.restaurantId,
        restaurantName: props?.checkoutData?.restaurantName,
        subtotal: props?.checkoutData?.subtotal,
        deliveryFee: props?.checkoutData?.deliveryFee,
        total: props?.checkoutData?.total,
        paymentMethod: props?.selectedPayment,
        notes: props?.notes,
        address: props?.isAuthenticated 
          ? props?.addresses.find(addr => addr.id === props?.selectedAddress)
          : props?.addressData
      };

      // Add user information to the order
      const orderWithUser = {
        ...finalOrderData,
        userId: user.id,
        userEmail: user.email,
        status: "pending",
        createdAt: new Date().toISOString(),
      };

      // MongoDB insert order
      try {
        const { db } = await connectToDatabase();
        console.log("Conectado ao MongoDB Atlas com sucesso");
        
        const result = await db.collection("orders").insertOne(orderWithUser);
        console.log("Pedido inserido no MongoDB Atlas:", result);

        if (!result) {
          throw new Error("Erro ao processar pedido");
        }

        // Send success notification
        toast.success("Pedido realizado com sucesso!");
        return { 
          success: true, 
          orderId: result.insertedId?.toString()
        };
      } catch (err: any) {
        console.error("Erro de conexão com MongoDB Atlas:", err);
        toast.error("Não foi possível conectar ao MongoDB Atlas. Verifique sua conexão com a internet.");
        throw new Error("Erro ao processar pedido no MongoDB Atlas");
      }
    } catch (err: any) {
      setError(err.message || "Erro ao processar pedido");
      toast.error(err.message || "Erro ao processar pedido");
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  // Função para redirecionar para detalhes do pedido
  const redirectToOrderDetails = useCallback((orderId?: string) => {
    const id = orderId || 'latest';
    navigate(`/orders/${id}`);
  }, [navigate]);

  // Função para solicitar sugestões de IA
  const requestAISuggestions = useCallback(() => {
    if (!props?.checkoutData) return;

    // Simular análise de IA
    console.log("Solicitando sugestões de IA para o pedido...");
    
    setTimeout(() => {
      // Mensagem de boas-vindas da IA
      setAiMessage("Olá! Estou analisando seu pedido para torná-lo perfeito.");
      
      // Gerar sugestões baseadas nos dados do pedido
      const suggestions = [];
      
      // Verificar se há itens no pedido
      if (props.checkoutData.items.length === 1) {
        suggestions.push("Considere adicionar uma bebida ao seu pedido.");
      }
      
      // Verificar forma de pagamento
      if (props.selectedPayment === 'credit') {
        suggestions.push("Pagamentos com PIX têm 5% de desconto em alguns restaurantes.");
      }
      
      // Verificar se há observações
      if (!props.notes) {
        suggestions.push("Adicione instruções especiais para o restaurante se necessário.");
      }
      
      setAiSuggestions(suggestions);
    }, 1500);
  }, [props?.checkoutData, props?.notes, props?.selectedPayment]);

  return {
    processOrder,
    isLoading,
    error,
    // Adicionar props para corrigir erros no Checkout.tsx
    isProcessing: isLoading,
    redirectToOrderDetails,
    aiSuggestions,
    aiMessage,
    requestAISuggestions
  };
};

export default useOrderProcessing;
