
import React from 'react';
import { Control } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { DeliveryFormValues } from '@/pages/delivery/DeliveryRegistration';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UserAccountFormProps {
  control: Control<DeliveryFormValues>;
  isDeliveryPerson?: boolean;
}

const UserAccountForm = ({ control, isDeliveryPerson = false }: UserAccountFormProps) => {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Dados pessoais</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name="nome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input placeholder="Seu nome" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={control}
          name="sobrenome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sobrenome</FormLabel>
              <FormControl>
                <Input placeholder="Sobrenome" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <FormField
        control={control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input type="email" placeholder="exemplo@email.com" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={control}
        name="password"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Senha</FormLabel>
            <div className="relative">
              <FormControl>
                <Input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Crie uma senha segura" 
                  {...field} 
                />
              </FormControl>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOffIcon className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <EyeIcon className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={control}
        name="cpf"
        render={({ field }) => (
          <FormItem>
            <FormLabel>CPF</FormLabel>
            <FormControl>
              <Input placeholder="000.000.000-00" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {isDeliveryPerson && (
        <FormField
          control={control}
          name="cnh"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CNH</FormLabel>
              <FormControl>
                <Input placeholder="Número da sua CNH" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
      
      <FormField
        control={control}
        name="telefone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Telefone</FormLabel>
            <FormControl>
              <Input placeholder="(00) 00000-0000" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default UserAccountForm;
