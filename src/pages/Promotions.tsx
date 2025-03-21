
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  BagIcon, 
  ArrowRightIcon, 
  SuccessIcon,
  AlertIcon
} from '@/assets/icons';
import { useToast } from '@/hooks/use-toast';

// Componente para um item de promoção
const PromotionCard = ({ promotion }: { promotion: any }) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(promotion.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    
    toast({
      title: "Código copiado!",
      description: `O código ${promotion.code} foi copiado para a área de transferência`
    });
  };

  // Verificar se a promoção está expirada
  const isExpired = new Date(promotion.validUntil) < new Date();

  return (
    <Card className={isExpired ? 'opacity-70' : ''}>
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
          {/* Seção de imagem/ícone */}
          <div className={`flex-shrink-0 w-16 h-16 rounded-xl flex items-center justify-center ${
            isExpired 
              ? 'bg-gray-100 dark:bg-gray-800' 
              : 'bg-primary/10 text-primary'
          }`}>
            {promotion.icon || (
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            )}
          </div>
          
          {/* Detalhes da promoção */}
          <div className="flex-grow">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-3">
              <div>
                <h3 className="text-lg font-semibold mb-1">{promotion.title}</h3>
                <p className="text-sm text-muted-foreground">{promotion.restaurant}</p>
              </div>
              
              {isExpired ? (
                <span className="text-sm text-red-500 font-medium mt-2 lg:mt-0">
                  Expirado
                </span>
              ) : (
                <span className="text-sm text-muted-foreground mt-2 lg:mt-0">
                  Válido até {new Date(promotion.validUntil).toLocaleDateString()}
                </span>
              )}
            </div>
            
            <p className="text-sm text-foreground/80 mb-4">{promotion.description}</p>
            
            {/* Código do cupom */}
            <div className="flex items-center gap-2">
              <div className="flex-grow flex items-center border rounded-md bg-muted/50">
                <div className="flex-grow px-3 py-2 text-sm font-mono font-semibold">
                  {promotion.code}
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-full rounded-none rounded-r-md"
                  onClick={copyCode}
                  disabled={isExpired}
                >
                  {copied ? 'Copiado!' : 'Copiar'}
                </Button>
              </div>
              
              <Button 
                variant="outline" 
                size="sm"
                disabled={isExpired}
                asChild
              >
                <a href={promotion.restaurantLink || `/restaurante/${promotion.restaurantId}`}>
                  Usar
                </a>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Página principal de promoções
const Promotions = () => {
  const { toast } = useToast();
  const [couponCode, setCouponCode] = useState('');
  const [promotions, setPromotions] = useState([
    {
      id: '1',
      title: '20% OFF no primeiro pedido',
      description: 'Desconto de 20% válido para o seu primeiro pedido no app.',
      code: 'NOVO20',
      validUntil: '2023-12-31',
      minimumValue: 30,
      restaurant: 'Todos os restaurantes',
      restaurantId: null
    },
    {
      id: '2',
      title: '2 por 1 em hambúrgueres',
      description: 'Na compra de um hambúrguer, ganhe outro igual ou de menor valor.',
      code: 'BURGER2X1',
      validUntil: '2023-10-15',
      minimumValue: 0,
      restaurant: 'Urban Burger Bistro',
      restaurantId: '1'
    },
    {
      id: '3',
      title: 'Frete Grátis',
      description: 'Entrega gratuita, sem valor mínimo de pedido.',
      code: 'FRETEFREE',
      validUntil: '2023-09-30', // Data passada para demonstrar uma promoção expirada
      minimumValue: 0,
      restaurant: 'Todos os restaurantes',
      restaurantId: null
    }
  ]);

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      toast({
        title: "Código vazio",
        description: "Por favor, insira um código de cupom",
        variant: "destructive"
      });
      return;
    }
    
    // Verificar se o cupom já existe na lista
    if (promotions.some(p => p.code === couponCode)) {
      toast({
        title: "Cupom já adicionado",
        description: "Este cupom já está na sua lista",
        variant: "destructive"
      });
      return;
    }
    
    // Simular verificação de cupom (em um app real, isso seria uma chamada API)
    if (couponCode === 'TESTE10') {
      const newPromotion = {
        id: Math.random().toString(),
        title: '10% de desconto em qualquer pedido',
        description: 'Cupom de 10% em qualquer pedido, valor mínimo de R$ 40,00.',
        code: 'TESTE10',
        validUntil: '2023-12-31',
        minimumValue: 40,
        restaurant: 'Todos os restaurantes',
        restaurantId: null
      };
      
      setPromotions([newPromotion, ...promotions]);
      setCouponCode('');
      
      toast({
        title: "Cupom adicionado",
        description: "Cupom TESTE10 adicionado com sucesso!"
      });
    } else {
      toast({
        title: "Cupom inválido",
        description: "O código de cupom informado não é válido",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">Promoções e Cupons</h1>
      
      {/* Seção para adicionar novo cupom */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Adicionar Cupom</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="Digite o código do cupom"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              className="flex-grow"
            />
            <Button onClick={handleApplyCoupon}>
              Aplicar Cupom
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Dica: Tente o código "TESTE10" para ver a demonstração
          </p>
        </CardContent>
      </Card>
      
      {/* Lista de promoções */}
      <div className="space-y-4">
        {promotions.length > 0 ? (
          promotions.map(promotion => (
            <PromotionCard key={promotion.id} promotion={promotion} />
          ))
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="48" 
                height="48" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className="mx-auto mb-4 text-muted-foreground"
              >
                <path d="M11 14h2a2 2 0 0 0 0-4h-3v9" />
                <circle cx="12" cy="12" r="10" />
              </svg>
              <h3 className="text-xl font-semibold mb-2">Sem cupons disponíveis</h3>
              <p className="text-muted-foreground mb-6">
                Você não possui nenhum cupom de desconto no momento
              </p>
              <Button asChild>
                <a href="/restaurantes">Explorar Restaurantes</a>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Promotions;
