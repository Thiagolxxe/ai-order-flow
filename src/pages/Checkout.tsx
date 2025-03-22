
import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeftIcon, CreditCard, BanknoteIcon, QrCode as QrCodeIcon, CheckIcon } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useUser } from '@/context/UserContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';

interface CheckoutData {
  restaurantId: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  discountValue: number;
  deliveryFee: number;
  total: number;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface Address {
  id: string;
  label: string;
  street: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipcode: string;
}

const Checkout = () => {
  const { id } = useParams<{ id: string }>();
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedPayment, setSelectedPayment] = useState('credit');
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Formulário de endereço para usuários não autenticados
  const [street, setStreet] = useState('');
  const [complement, setComplement] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipcode, setZipcode] = useState('');
  
  const { user, isAuthenticated } = useUser();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // Carregar dados do checkout e endereços do usuário
  useEffect(() => {
    const loadCheckoutData = async () => {
      try {
        setLoading(true);
        
        // Obter dados do checkout
        let savedCheckoutData = null;
        
        if (id) {
          // Se temos um ID, tentamos buscar dados específicos para este restaurante
          const restaurantCartData = localStorage.getItem(`cart_${id}`);
          if (restaurantCartData) {
            savedCheckoutData = JSON.parse(restaurantCartData);
          }
        }
        
        // Se não encontrou por ID, tenta o checkout genérico
        if (!savedCheckoutData) {
          const genericCheckoutData = localStorage.getItem('checkout_data');
          if (genericCheckoutData) {
            savedCheckoutData = JSON.parse(genericCheckoutData);
          }
        }
        
        if (!savedCheckoutData) {
          toast({
            title: "Erro",
            description: "Dados do pedido não encontrados",
            variant: "destructive"
          });
          navigate('/carrinho');
          return;
        }
        
        // Initialize empty items array if not present to prevent 'map' errors
        if (!savedCheckoutData.items) {
          savedCheckoutData.items = [];
        }
        
        setCheckoutData(savedCheckoutData);
        
        // Buscar endereços do usuário se autenticado
        if (isAuthenticated && user) {
          const { data, error } = await supabase
            .from('enderecos')
            .select('*')
            .eq('usuario_id', user.id)
            .order('criado_em', { ascending: false });
          
          if (error) throw error;
          
          if (data && data.length > 0) {
            const formattedAddresses = data.map(addr => ({
              id: addr.id,
              label: addr.label || 'Endereço',
              street: addr.endereco,
              complement: addr.complemento,
              neighborhood: addr.bairro,
              city: addr.cidade,
              state: addr.estado,
              zipcode: addr.cep
            }));
            
            setAddresses(formattedAddresses);
            setSelectedAddress(formattedAddresses[0].id);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar dados do checkout:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados do pedido",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadCheckoutData();
  }, [isAuthenticated, user, navigate, id]);
  
  // Processar o pedido
  const processOrder = async () => {
    if (!checkoutData) {
      toast({
        title: "Erro",
        description: "Dados do pedido não encontrados",
        variant: "destructive"
      });
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Validar endereço
      let enderecoEntrega, cidadeEntrega, estadoEntrega, cepEntrega;
      
      if (isAuthenticated && selectedAddress) {
        const address = addresses.find(addr => addr.id === selectedAddress);
        if (!address) {
          toast({
            title: "Atenção",
            description: "Selecione um endereço válido",
            variant: "destructive"
          });
          setIsProcessing(false);
          return;
        }
        
        enderecoEntrega = `${address.street}, ${address.complement || ''} - ${address.neighborhood}`;
        cidadeEntrega = address.city;
        estadoEntrega = address.state;
        cepEntrega = address.zipcode;
      } else {
        // Validar campos de endereço para usuários não autenticados
        if (!street || !neighborhood || !city || !state || !zipcode) {
          toast({
            title: "Atenção",
            description: "Preencha o endereço completo para entrega",
            variant: "destructive"
          });
          setIsProcessing(false);
          return;
        }
        
        enderecoEntrega = `${street}, ${complement || ''} - ${neighborhood}`;
        cidadeEntrega = city;
        estadoEntrega = state;
        cepEntrega = zipcode;
      }
      
      // Gerar número de pedido
      const orderNumber = Math.floor(Math.random() * 9000) + 1000;
      
      // Criar o pedido no banco de dados
      const { data: orderData, error: orderError } = await supabase
        .from('pedidos')
        .insert({
          restaurante_id: checkoutData.restaurantId,
          cliente_id: user?.id,
          subtotal: checkoutData.subtotal,
          taxa_entrega: checkoutData.deliveryFee,
          taxa_servico: 0,
          imposto: 0,
          gorjeta: 0,
          total: checkoutData.total,
          metodo_pagamento: selectedPayment,
          numero_pedido: orderNumber.toString(),
          status_pagamento: selectedPayment === 'pix' ? 'pendente' : 'aprovado',
          status: 'pendente',
          endereco_entrega: enderecoEntrega,
          cidade_entrega: cidadeEntrega,
          estado_entrega: estadoEntrega,
          cep_entrega: cepEntrega,
          instrucoes_entrega: notes
        })
        .select()
        .single();
      
      if (orderError) throw orderError;
      
      // Criar os itens do pedido
      // Ensure we have items before attempting to map
      const orderItems = (checkoutData.items || []).map(item => ({
        pedido_id: orderData.id,
        item_cardapio_id: item.id,
        nome_item_cardapio: item.name,
        quantidade: item.quantity,
        preco_unitario: item.price,
        preco_total: item.price * item.quantity
      }));
      
      const { error: itemsError } = await supabase
        .from('itens_pedido')
        .insert(orderItems);
      
      if (itemsError) throw itemsError;
      
      // Adicionar entrada ao histórico de status
      const { error: historyError } = await supabase
        .from('historico_status_pedido')
        .insert({
          pedido_id: orderData.id,
          status: 'pendente',
          observacoes: 'Pedido recebido'
        });
      
      if (historyError) throw historyError;
      
      // Limpar dados do carrinho
      localStorage.removeItem('checkout_data');
      localStorage.removeItem(`cart_${checkoutData.restaurantId}`);
      
      // Redirecionar para a página de detalhes do pedido
      toast({
        title: "Sucesso",
        description: "Pedido realizado com sucesso!",
        variant: "default",
      });
      navigate(`/pedido/${orderData.id}`);
    } catch (error) {
      console.error('Erro ao processar pedido:', error);
      toast({
        title: "Erro",
        description: "Não foi possível processar o pedido",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="container px-4 py-8">
        <div className="h-8 bg-muted animate-pulse rounded mb-6 w-1/3"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-60 bg-muted animate-pulse rounded"></div>
            <div className="h-60 bg-muted animate-pulse rounded"></div>
          </div>
          <div>
            <div className="h-80 bg-muted animate-pulse rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!checkoutData) {
    return (
      <div className="container px-4 py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Dados do pedido não encontrados</h2>
        <p className="mb-6">Volte para o carrinho e tente novamente.</p>
        <Button asChild>
          <Link to="/carrinho">Voltar para o carrinho</Link>
        </Button>
      </div>
    );
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
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conteúdo principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Endereço de entrega */}
          <Card>
            <CardContent className="p-6">
              <h2 className="font-medium mb-4 text-lg">Endereço de Entrega</h2>
              
              {isAuthenticated && addresses.length > 0 ? (
                <RadioGroup 
                  value={selectedAddress}
                  onValueChange={setSelectedAddress}
                  className="space-y-3"
                >
                  {addresses.map(address => (
                    <div key={address.id} className="flex items-start space-x-3">
                      <RadioGroupItem value={address.id} id={`address-${address.id}`} />
                      <div className="flex-1 border rounded-lg p-3">
                        <Label 
                          htmlFor={`address-${address.id}`}
                          className="flex justify-between cursor-pointer"
                        >
                          <span className="font-medium">{address.label}</span>
                          {selectedAddress === address.id && (
                            <CheckIcon className="h-4 w-4 text-primary" />
                          )}
                        </Label>
                        <p className="text-sm text-foreground/70 mt-1">{address.street}, {address.complement || ''}</p>
                        <p className="text-sm text-foreground/70">{address.neighborhood}, {address.city} - {address.state}</p>
                        <p className="text-sm text-foreground/70">CEP: {address.zipcode}</p>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="street">Rua/Avenida</Label>
                      <Input 
                        id="street" 
                        placeholder="Ex: Av. Paulista, 1578" 
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="complement">Complemento</Label>
                      <Input 
                        id="complement" 
                        placeholder="Ex: Apto 202" 
                        value={complement}
                        onChange={(e) => setComplement(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="neighborhood">Bairro</Label>
                      <Input 
                        id="neighborhood" 
                        placeholder="Ex: Bela Vista" 
                        value={neighborhood}
                        onChange={(e) => setNeighborhood(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="zipcode">CEP</Label>
                      <Input 
                        id="zipcode" 
                        placeholder="Ex: 01310-200" 
                        value={zipcode}
                        onChange={(e) => setZipcode(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="col-span-1 sm:col-span-2 space-y-1">
                      <Label htmlFor="city">Cidade</Label>
                      <Input 
                        id="city" 
                        placeholder="Ex: São Paulo" 
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="state">Estado</Label>
                      <Input 
                        id="state" 
                        placeholder="Ex: SP" 
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {isAuthenticated ? (
                <Button variant="link" className="mt-3 h-8 p-0">
                  + Adicionar novo endereço
                </Button>
              ) : (
                <Button variant="link" className="mt-3 h-8 p-0" asChild>
                  <Link to="/login?redirect=/finalizar">
                    Fazer login para usar endereços salvos
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
          
          {/* Forma de pagamento */}
          <Card>
            <CardContent className="p-6">
              <h2 className="font-medium mb-4 text-lg">Forma de Pagamento</h2>
              
              <Tabs 
                defaultValue="credit" 
                value={selectedPayment}
                onValueChange={setSelectedPayment}
              >
                <TabsList className="w-full mb-4">
                  <TabsTrigger value="credit" className="flex-1">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Cartão
                  </TabsTrigger>
                  <TabsTrigger value="money" className="flex-1">
                    <BanknoteIcon className="h-4 w-4 mr-2" />
                    Dinheiro
                  </TabsTrigger>
                  <TabsTrigger value="pix" className="flex-1">
                    <QrCodeIcon className="h-4 w-4 mr-2" />
                    Pix
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="credit" className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="card-number">Número do Cartão</Label>
                      <Input id="card-number" placeholder="0000 0000 0000 0000" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="card-name">Nome no Cartão</Label>
                      <Input id="card-name" placeholder="Seu nome como está no cartão" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="card-expiry">Validade</Label>
                      <Input id="card-expiry" placeholder="MM/AA" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="card-cvv">CVV</Label>
                      <Input id="card-cvv" placeholder="123" />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="money" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="change">Troco para</Label>
                    <Input id="change" placeholder="Opcional: Valor para troco" />
                    <p className="text-sm text-foreground/70">Deixe em branco se não precisar de troco</p>
                  </div>
                </TabsContent>
                
                <TabsContent value="pix" className="text-center py-4">
                  <div className="bg-muted p-6 rounded-lg inline-block mb-3">
                    <QrCodeIcon className="h-32 w-32 mx-auto" />
                  </div>
                  <p className="text-foreground/70 text-sm">
                    O QR Code será gerado após a confirmação do pedido
                  </p>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          
          {/* Observações */}
          <Card>
            <CardContent className="p-6">
              <h2 className="font-medium mb-4 text-lg">Observações para Entrega</h2>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Observações (opcional)</Label>
                <Textarea 
                  id="notes" 
                  placeholder="Ex: Apartamento sem campainha, ligar quando chegar." 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Resumo do pedido */}
        <div>
          <Card className="sticky top-20">
            <CardContent className="p-6">
              <h2 className="font-medium mb-4 text-lg">Resumo do Pedido</h2>
              
              {/* Itens do pedido */}
              <div className="mb-4">
                {/* Add null check before mapping over items */}
                {checkoutData.items && checkoutData.items.length > 0 ? (
                  checkoutData.items.map(item => (
                    <div key={item.id} className="flex justify-between mb-2">
                      <span>{item.quantity}x {item.name}</span>
                      <span>R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-foreground/70">Nenhum item no carrinho</p>
                )}
              </div>
              
              <Separator className="my-4" />
              
              {/* Detalhes do preço */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-foreground/70">Subtotal</span>
                  <span>R$ {checkoutData.subtotal.toFixed(2).replace('.', ',')}</span>
                </div>
                
                {checkoutData.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Desconto ({checkoutData.discount}%)</span>
                    <span>- R$ {checkoutData.discountValue.toFixed(2).replace('.', ',')}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-foreground/70">Taxa de Entrega</span>
                  <span>R$ {checkoutData.deliveryFee.toFixed(2).replace('.', ',')}</span>
                </div>
                
                <Separator className="my-3" />
                
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>R$ {checkoutData.total.toFixed(2).replace('.', ',')}</span>
                </div>
              </div>
              
              {/* Botão de finalizar pedido */}
              <Button 
                className="w-full mt-6" 
                size="lg"
                onClick={processOrder}
                disabled={isProcessing}
              >
                {isProcessing ? 'Processando...' : 'Confirmar Pedido'}
              </Button>
              
              <Button 
                variant="link" 
                className="w-full mt-2" 
                asChild
              >
                <Link to="/carrinho">Voltar ao Carrinho</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
