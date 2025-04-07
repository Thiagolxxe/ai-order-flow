import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon, Sparkles } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { useCheckoutData } from '@/hooks/useCheckoutData';
import { useOrderProcessing } from '@/hooks/useOrderProcessing';
import { PaymentMethod } from '@/components/checkout/types';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Components
import DeliverySection from '@/components/checkout/DeliverySection';
import PaymentSection from '@/components/checkout/PaymentSection';
import NotesSection from '@/components/checkout/NotesSection';
import OrderSummary from '@/components/checkout/OrderSummary';
import CheckoutSkeleton from '@/components/checkout/CheckoutSkeleton';
import EmptyCheckout from '@/components/checkout/EmptyCheckout';
import AIAddressHelper from '@/components/checkout/AIAddressHelper';

const Checkout = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useUser();
  const { checkoutData, addresses, selectedAddress, setSelectedAddress, loading } = useCheckoutData(id);
  
  // Estado para formulário de endereço (usuários não autenticados)
  const [street, setStreet] = useState('');
  const [complement, setComplement] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipcode, setZipcode] = useState('');
  
  // Estado para pagamento e observações
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('credit');
  const [notes, setNotes] = useState('');
  
  const isMobile = useIsMobile();
  
  // Processamento do pedido com IA
  const { 
    isProcessing, 
    processOrder, 
    redirectToOrderDetails,
    aiSuggestions,
    aiMessage,
    requestAISuggestions
  } = useOrderProcessing({
    checkoutData,
    selectedAddress,
    addresses,
    selectedPayment,
    notes,
    addressData: { street, complement, neighborhood, city, state, zipcode },
    isAuthenticated
  });

  // Solicitar sugestões de IA quando os dados do checkout estiverem carregados
  useEffect(() => {
    if (checkoutData && !aiMessage) {
      requestAISuggestions();
    }
  }, [checkoutData, aiMessage, requestAISuggestions]);

  // Função para preencher o formulário de endereço
  const handleAddressSelect = (address: any) => {
    setStreet(address.street);
    setComplement(address.complement);
    setNeighborhood(address.neighborhood);
    setCity(address.city);
    setState(address.state);
    setZipcode(address.zipcode);
  };

  const handleConfirmOrder = async () => {
    const success = await processOrder();
    if (success) {
      redirectToOrderDetails();
    }
  };

  if (loading) {
    return <CheckoutSkeleton />;
  }

  if (!checkoutData) {
    return <EmptyCheckout />;
  }

  return (
    <div className="container px-4 py-6 pb-20">
      {/* Cabeçalho */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/carrinho">
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold">Finalizar Pedido</h1>
      </div>
      
      {/* AI Message */}
      {aiMessage && (
        <Alert className="mb-6 border-primary/20 bg-primary/5">
          <Sparkles className="h-4 w-4 text-primary" />
          <AlertTitle className="text-primary">Assistente DelivGo</AlertTitle>
          <AlertDescription>
            {aiMessage}
          </AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conteúdo principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Endereço de entrega */}
          <DeliverySection 
            isAuthenticated={isAuthenticated}
            addresses={addresses}
            selectedAddress={selectedAddress}
            setSelectedAddress={setSelectedAddress}
            street={street}
            setStreet={setStreet}
            complement={complement}
            setComplement={setComplement}
            neighborhood={neighborhood}
            setNeighborhood={setNeighborhood}
            city={city}
            setCity={setCity}
            state={state}
            setState={setState}
            zipcode={zipcode}
            setZipcode={setZipcode}
          />
          
          {/* AI Address Helper */}
          {!isAuthenticated && (
            <AIAddressHelper onAddressSelect={handleAddressSelect} />
          )}
          
          {/* Forma de pagamento */}
          <PaymentSection 
            selectedPayment={selectedPayment}
            setSelectedPayment={setSelectedPayment}
          />
          
          {/* Observações */}
          <NotesSection 
            notes={notes}
            setNotes={setNotes}
            orderItems={checkoutData.items}
          />
        </div>
        
        {/* Resumo do pedido */}
        <div>
          <OrderSummary 
            checkoutData={checkoutData}
            isProcessing={isProcessing}
            onConfirmOrder={handleConfirmOrder}
          />
          
          {/* AI Suggestions */}
          {aiSuggestions.length > 0 && (
            <div className="mt-4 bg-muted p-4 rounded-md">
              <div className="flex items-center mb-2">
                <Sparkles className="h-4 w-4 text-primary mr-2" />
                <h3 className="font-medium text-sm">Sugestões para seu pedido:</h3>
              </div>
              <ul className="space-y-2 text-sm">
                {aiSuggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Checkout;
