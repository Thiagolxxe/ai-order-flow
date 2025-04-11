
import { useState } from "react";
import { toast } from "sonner";
import { useUser } from "@/context/UserContext";
import { httpClient } from "@/utils/httpClient";
import { connectToDatabase } from "@/integrations/mongodb/client";

export const useOrderProcessing = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();

  const processOrder = async (orderData: any) => {
    if (!user) {
      setError("Você precisa estar logado para fazer um pedido");
      toast.error("Você precisa estar logado para fazer um pedido");
      return { success: false };
    }

    setIsLoading(true);
    setError(null);

    try {
      // Add user information to the order
      const orderWithUser = {
        ...orderData,
        userId: user.id,
        userEmail: user.email,
        status: "pending",
        createdAt: new Date().toISOString(),
      };

      // MongoDB insert order
      try {
        const { db } = await connectToDatabase();
        const result = await db.collection("orders").insertOne(orderWithUser);

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
        console.error("Error with MongoDB:", err);
        throw new Error("Erro ao processar pedido no MongoDB");
      }
    } catch (err: any) {
      setError(err.message || "Erro ao processar pedido");
      toast.error(err.message || "Erro ao processar pedido");
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    processOrder,
    isLoading,
    error,
  };
};

export default useOrderProcessing;
