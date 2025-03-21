
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeftIcon, CreditCard, BanknoteIcon, QrCode as QrCodeIcon, CheckIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useUser } from '@/context/UserContext';
import { useIsMobile } from '@/hooks/use-mobile';

// Exemplo de dados do pedido
const orderSummary = {
  subtotal: 68.70,
  discount: 6.87,
  deliveryFee: 6.90,
  total: 68.73
};

// Exemplo de endereços
const addresses = [
  {
    id: '1',
    label: 'Casa',
    street: 'Av. Paulista, 1578',
    complement: 'Apto 202',
    neighborhood: 'Bela Vista',
    city: 'São Paulo',
    state: 'SP',
    zipcode: '01310-200'
  },
  {
    id: '2',
    label: 'Trabalho',
    street: 'Rua Augusta, 1234',
    complement: 'Sala 45',
    neighborhood: 'Consolação',
    city: 'São Paulo',
    state: 'SP',
    zipcode: '01304-001'
  }
];

const Checkout = () => {
  const [selectedAddress, setSelectedAddress] = useState('1');
  const [selectedPayment, setSelectedPayment] = useState('credit');
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { isAuthenticated } = useUser();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // Processar o pedido
  const processOrder = () => {
    setIsProcessing(true);
    
    // Simulação de processamento de pedido
    setTimeout(() => {
      setIsProcessing(false);
      navigate('/pedido/12345');
      toast.success('Pedido realizado com sucesso!');
    }, 2000);
  };

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
              
              {isAuthenticated ? (
                <RadioGroup 
                  defaultValue={selectedAddress}
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
                        <p className="text-sm text-foreground/70 mt-1">{address.street}, {address.complement}</p>
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
                      <Input id="street" placeholder="Ex: Av. Paulista, 1578" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="complement">Complemento</Label>
                      <Input id="complement" placeholder="Ex: Apto 202" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="neighborhood">Bairro</Label>
                      <Input id="neighborhood" placeholder="Ex: Bela Vista" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="zipcode">CEP</Label>
                      <Input id="zipcode" placeholder="Ex: 01310-200" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="col-span-1 sm:col-span-2 space-y-1">
                      <Label htmlFor="city">Cidade</Label>
                      <Input id="city" placeholder="Ex: São Paulo" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="state">Estado</Label>
                      <Input id="state" placeholder="Ex: SP" />
                    </div>
                  </div>
                </div>
              )}
              
              <Button variant="link" className="mt-3 h-8 p-0">
                {isAuthenticated ? '+ Adicionar novo endereço' : 'Fazer login para usar endereços salvos'}
              </Button>
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
                <div className="flex justify-between mb-2">
                  <span>2x Classic Burger</span>
                  <span>R$ 53,80</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>1x Batata Frita</span>
                  <span>R$ 14,90</span>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              {/* Detalhes do preço */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-foreground/70">Subtotal</span>
                  <span>R$ {orderSummary.subtotal.toFixed(2).replace('.', ',')}</span>
                </div>
                
                <div className="flex justify-between text-green-600">
                  <span>Desconto (10%)</span>
                  <span>- R$ {orderSummary.discount.toFixed(2).replace('.', ',')}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-foreground/70">Taxa de Entrega</span>
                  <span>R$ {orderSummary.deliveryFee.toFixed(2).replace('.', ',')}</span>
                </div>
                
                <Separator className="my-3" />
                
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>R$ {orderSummary.total.toFixed(2).replace('.', ',')}</span>
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
