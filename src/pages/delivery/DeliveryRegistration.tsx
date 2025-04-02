
import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import UserAccountForm from '@/components/delivery-signup/UserAccountForm';
import AddressForm from '@/components/delivery-signup/AddressForm';
import DeliveryInfoForm from '@/components/delivery-signup/DeliveryInfoForm';
import CompletedSignup from '@/components/delivery-signup/CompletedSignup';
import { toast } from 'sonner';

const deliveryFormSchema = z.object({
  nome: z.string().min(3, 'Nome é obrigatório'),
  sobrenome: z.string().min(1, 'Sobrenome é obrigatório'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  cpf: z.string().min(11, 'CPF inválido'),
  cnh: z.string().min(1, 'CNH é obrigatória'),
  telefone: z.string().min(10, 'Telefone inválido'),
  endereco: z.string().min(1, 'Endereço é obrigatório'),
  complemento: z.string().optional(),
  cidade: z.string().min(1, 'Cidade é obrigatória'),
  estado: z.string().min(1, 'Estado é obrigatório'),
  cep: z.string().min(8, 'CEP inválido'),
  tipo_veiculo: z.string(),
  placa: z.string().min(1, 'Placa do veículo é obrigatória')
});

export type DeliveryFormValues = z.infer<typeof deliveryFormSchema>;

const DeliveryRegistration = () => {
  const [step, setStep] = React.useState(1);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isCompleted, setIsCompleted] = React.useState(false);
  
  const form = useForm<DeliveryFormValues>({
    resolver: zodResolver(deliveryFormSchema),
    defaultValues: {
      nome: '',
      sobrenome: '',
      email: '',
      password: '',
      cpf: '',
      cnh: '',
      telefone: '',
      endereco: '',
      complemento: '',
      cidade: '',
      estado: '',
      cep: '',
      tipo_veiculo: 'moto',
      placa: ''
    }
  });

  const onSubmit = async (data: DeliveryFormValues) => {
    if (step < 3) {
      setStep(step + 1);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Handle registration logic here
      console.log(data);
      
      // Show success message
      toast.success("Cadastro realizado com sucesso!");
      setIsCompleted(true);
    } catch (error) {
      console.error("Erro no cadastro:", error);
      toast.error("Erro ao realizar cadastro. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const goBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };
  
  if (isCompleted) {
    return <CompletedSignup />;
  }

  return (
    <div className="container py-8 px-4 max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Cadastro de Entregador</CardTitle>
          <CardDescription>
            Passo {step} de 3 - {
              step === 1 ? 'Dados pessoais' : 
              step === 2 ? 'Endereço' : 
              'Informações do veículo'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {step === 1 && <UserAccountForm control={form.control} isDeliveryPerson={true} />}
              {step === 2 && <AddressForm control={form.control} />}
              {step === 3 && <DeliveryInfoForm control={form.control} />}
              
              <div className="flex justify-between mt-6">
                {step > 1 ? (
                  <Button type="button" variant="outline" onClick={goBack}>
                    Voltar
                  </Button>
                ) : (
                  <div></div>
                )}
                
                <Button type="submit" disabled={isSubmitting}>
                  {step < 3 ? 'Próximo' : (isSubmitting ? 'Enviando...' : 'Concluir cadastro')}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeliveryRegistration;
