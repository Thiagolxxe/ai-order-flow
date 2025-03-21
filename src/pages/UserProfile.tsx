
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeftIcon, User, MapPin, CreditCard, Edit2Icon, PlusIcon, LogOutIcon, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import { useUser } from '@/context/UserContext';
import { useIsMobile } from '@/hooks/use-mobile';

// Dados de exemplo do usuário
const mockUserData = {
  name: 'João Silva',
  email: 'joao.silva@exemplo.com',
  phone: '(11) 98765-4321',
  addresses: [
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
  ],
  paymentMethods: [
    {
      id: '1',
      type: 'credit',
      brand: 'Visa',
      lastDigits: '1234',
      expirationDate: '12/25'
    },
    {
      id: '2',
      type: 'credit',
      brand: 'Mastercard',
      lastDigits: '5678',
      expirationDate: '08/24'
    }
  ]
};

const UserProfile = () => {
  const [userData, setUserData] = useState(mockUserData);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: userData.name,
    email: userData.email,
    phone: userData.phone
  });
  const navigate = useNavigate();
  const { logout } = useUser();
  const isMobile = useIsMobile();
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSaveProfile = () => {
    setUserData(prev => ({ ...prev, ...formData }));
    setIsEditing(false);
    toast.success('Perfil atualizado com sucesso!');
  };
  
  const handleLogout = async () => {
    try {
      const { error } = await logout();
      
      if (error) {
        throw error;
      }
      
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao fazer logout. Por favor, tente novamente.');
    }
  };

  return (
    <div className="container px-4 py-6 pb-20">
      {/* Cabeçalho */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/">
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold">Meu Perfil</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Menu lateral em telas grandes */}
        <div className="hidden lg:block">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center space-y-4 mb-6">
                <div className="w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <User className="h-10 w-10" />
                </div>
                <div className="text-center">
                  <h2 className="font-semibold text-lg">{userData.name}</h2>
                  <p className="text-foreground/70">{userData.email}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/perfil">
                    <User className="mr-2 h-4 w-4" />
                    Informações Pessoais
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/perfil/enderecos">
                    <MapPin className="mr-2 h-4 w-4" />
                    Endereços
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/perfil/pagamentos">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Métodos de Pagamento
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/pedidos">
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Meus Pedidos
                  </Link>
                </Button>
              </div>
              
              <div className="mt-6">
                <Button 
                  variant="destructive" 
                  className="w-full" 
                  onClick={handleLogout}
                >
                  <LogOutIcon className="mr-2 h-4 w-4" />
                  Sair
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Conteúdo principal */}
        <div className="lg:col-span-2">
          {/* Abas (visíveis em telas pequenas) */}
          <Tabs defaultValue="personal" className="lg:hidden mb-6">
            <TabsList className="w-full grid grid-cols-4">
              <TabsTrigger value="personal">
                <User className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="addresses">
                <MapPin className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="payments">
                <CreditCard className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="orders" asChild>
                <Link to="/pedidos">
                  <ShoppingBag className="h-4 w-4" />
                </Link>
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          {/* Conteúdo da aba de informações pessoais */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Informações Pessoais</CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? 'Cancelar' : 'Editar'}
                {!isEditing && <Edit2Icon className="ml-2 h-4 w-4" />}
              </Button>
            </CardHeader>
            <CardContent className="p-6">
              {isEditing ? (
                <form className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome Completo</Label>
                      <Input 
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">E-mail</Label>
                      <Input 
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone</Label>
                      <Input 
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full sm:w-auto"
                    onClick={handleSaveProfile}
                  >
                    Salvar Alterações
                  </Button>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-foreground/70">Nome Completo</Label>
                      <p className="font-medium">{userData.name}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-foreground/70">E-mail</Label>
                      <p className="font-medium">{userData.email}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-foreground/70">Telefone</Label>
                      <p className="font-medium">{userData.phone}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Endereços */}
          <Card className="mt-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Endereços</CardTitle>
              <Button 
                variant="outline" 
                size="sm"
              >
                <PlusIcon className="mr-2 h-4 w-4" />
                Adicionar
              </Button>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {userData.addresses.map((address) => (
                  <div key={address.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{address.label}</h3>
                      <Button variant="ghost" size="icon">
                        <Edit2Icon className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-foreground/70">{address.street}, {address.complement}</p>
                    <p className="text-sm text-foreground/70">{address.neighborhood}, {address.city} - {address.state}</p>
                    <p className="text-sm text-foreground/70">CEP: {address.zipcode}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Métodos de Pagamento */}
          <Card className="mt-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Métodos de Pagamento</CardTitle>
              <Button 
                variant="outline" 
                size="sm"
              >
                <PlusIcon className="mr-2 h-4 w-4" />
                Adicionar
              </Button>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {userData.paymentMethods.map((method) => (
                  <div key={method.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{method.brand}</h3>
                      <Button variant="ghost" size="icon">
                        <Edit2Icon className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-foreground/70">**** **** **** {method.lastDigits}</p>
                    <p className="text-sm text-foreground/70">Expira em: {method.expirationDate}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Botão de logout (visível em telas pequenas) */}
          <div className="mt-6 lg:hidden">
            <Button 
              variant="destructive" 
              className="w-full" 
              onClick={handleLogout}
            >
              <LogOutIcon className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
