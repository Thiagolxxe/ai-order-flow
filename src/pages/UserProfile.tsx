import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUser } from '@/context/UserContext';
import { apiService } from '@/services/apiService';
import { toast } from 'sonner';
import { 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Lock, 
  CreditCard, 
  BellRing, 
  Settings,
  Loader2
} from 'lucide-react';
import { UserProfile as UserProfileType, Address } from '@/services/api/types';

const UserProfile = () => {
  const { user, updateUserData } = useUser();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [profile, setProfile] = useState<UserProfileType>({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [addresses, setAddresses] = useState<Address[]>([]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoadingData(true);
      try {
        if (user) {
          // Set initial data from current user
          setProfile({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            address: user.address || ''
          });
          
          // Fetch additional user data
          const { data, error } = await apiService.users.getProfile();
          
          if (error) {
            throw new Error(error.message);
          }
          
          if (data) {
            // Safely merge profile data
            const userData = data as Partial<UserProfileType>;
            setProfile(prevProfile => ({
              ...prevProfile,
              ...(userData || {}),
              email: user.email // Keep email from auth
            }));
          }
          
          // Fetch user addresses
          const addressesResponse = await apiService.addresses.getAll();
          if (addressesResponse.data) {
            // Type assertion to Address[]
            setAddresses(addressesResponse.data as Address[]);
          }
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        toast.error('Não foi possível carregar seu perfil');
      } finally {
        setLoadingData(false);
      }
    };

    fetchUserProfile();
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await apiService.users.updateProfile({
        name: profile.name,
        phone: profile.phone,
        address: profile.address
      });

      if (error) {
        throw new Error(error.message);
      } else {
        // If no error, update was successful
        toast.success('Perfil atualizado com sucesso');
        
        // Update user context if the function exists
        if (updateUserData) {
          updateUserData({
            name: profile.name,
            phone: profile.phone,
            address: profile.address
          });
        }
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Falha ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  if (loadingData) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Carregando seu perfil...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row gap-4 items-start">
        <div className="w-full md:w-1/3 mb-4 md:mb-0">
          <Card className="mb-4">
            <CardContent className="pt-6 flex flex-col items-center text-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback>{getInitials(profile.name)}</AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-bold">{profile.name || 'Usuário'}</h2>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
              <Button variant="outline" className="mt-4 w-full">
                Editar foto de perfil
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Menu de navegação</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid gap-1">
                <Button variant="ghost" className="justify-start">
                  <User className="mr-2 h-4 w-4" /> Dados pessoais
                </Button>
                <Button variant="ghost" className="justify-start">
                  <MapPin className="mr-2 h-4 w-4" /> Endereços
                </Button>
                <Button variant="ghost" className="justify-start">
                  <CreditCard className="mr-2 h-4 w-4" /> Métodos de pagamento
                </Button>
                <Button variant="ghost" className="justify-start">
                  <Lock className="mr-2 h-4 w-4" /> Segurança
                </Button>
                <Button variant="ghost" className="justify-start">
                  <BellRing className="mr-2 h-4 w-4" /> Notificações
                </Button>
                <Button variant="ghost" className="justify-start">
                  <Settings className="mr-2 h-4 w-4" /> Configurações
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="w-full md:w-2/3">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="profile">Perfil</TabsTrigger>
              <TabsTrigger value="addresses">Endereços</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Informações Pessoais</CardTitle>
                  <CardDescription>
                    Atualize suas informações de perfil
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit}>
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="name">Nome completo</Label>
                        <Input
                          id="name"
                          name="name"
                          placeholder="Seu nome"
                          value={profile.name}
                          onChange={handleInputChange}
                        />
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="seu.email@exemplo.com"
                          value={profile.email}
                          disabled
                        />
                        <p className="text-sm text-muted-foreground">
                          O email não pode ser alterado
                        </p>
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="phone">Telefone</Label>
                        <div className="flex items-center">
                          <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="phone"
                            name="phone"
                            placeholder="(11) 99999-9999"
                            value={profile.phone}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="address">Endereço principal</Label>
                        <div className="flex items-center">
                          <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="address"
                            name="address"
                            placeholder="Seu endereço"
                            value={profile.address}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                      
                      <Separator className="my-2" />
                      
                      <Button type="submit" disabled={loading}>
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Salvando...
                          </>
                        ) : 'Salvar alterações'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="addresses">
              <Card>
                <CardHeader>
                  <CardTitle>Seus endereços</CardTitle>
                  <CardDescription>
                    Gerencie os endereços de entrega
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {addresses.length === 0 ? (
                    <div className="text-center py-8">
                      <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <h3 className="text-lg font-medium">Nenhum endereço cadastrado</h3>
                      <p className="text-muted-foreground mb-4">
                        Adicione um endereço para facilitar suas compras
                      </p>
                      <Button>
                        <MapPin className="mr-2 h-4 w-4" />
                        Adicionar endereço
                      </Button>
                    </div>
                  ) : (
                    <div className="grid gap-2">
                      {addresses.map((address: Address) => (
                        <Card key={address.id}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-medium">{address.label || 'Endereço'}</p>
                                <p className="text-sm text-muted-foreground">{address.endereco}</p>
                                <p className="text-sm text-muted-foreground">
                                  {address.cidade}, {address.estado} - {address.cep}
                                </p>
                              </div>
                              <Button variant="outline" size="sm">
                                Editar
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      <Button className="mt-2">
                        <MapPin className="mr-2 h-4 w-4" />
                        Adicionar novo endereço
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
