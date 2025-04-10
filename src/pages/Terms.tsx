
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const Terms = () => {
  return (
    <div className="container mx-auto px-4 py-20 max-w-4xl">
      <Button 
        variant="ghost" 
        className="mb-4 pl-0 flex items-center" 
        asChild
      >
        <Link to="/">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para a página inicial
        </Link>
      </Button>
      
      <h1 className="text-3xl font-bold mb-6">Termos e Condições</h1>
      
      <div className="prose dark:prose-invert max-w-none">
        <p className="text-lg">
          Última atualização: 10 de Abril de 2025
        </p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">1. Aceitação dos Termos</h2>
        <p>
          Ao acessar e usar o aplicativo DelivGo, você concorda em cumprir e ficar vinculado por estes Termos e Condições. 
          Se não concordar com qualquer parte destes termos, não deverá usar nosso serviço.
        </p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">2. Uso do Serviço</h2>
        <p>
          O DelivGo fornece uma plataforma para conectar usuários a restaurantes e entregadores. 
          Nosso serviço permite que os usuários naveguem por restaurantes, façam pedidos e organizem entregas.
        </p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">3. Cadastro</h2>
        <p>
          Para usar certos recursos do nosso serviço, você precisa se registrar fornecendo informações precisas, 
          completas e atualizadas. Você é responsável por manter a confidencialidade de sua conta.
        </p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">4. Pedidos e Pagamentos</h2>
        <p>
          Ao fazer um pedido através do DelivGo, você concorda em pagar todos os valores aplicáveis. 
          Os preços dos itens podem ser diferentes dos preços oferecidos nos restaurantes físicos.
        </p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">5. Política de Privacidade</h2>
        <p>
          Nosso uso de suas informações pessoais é regido por nossa Política de Privacidade, 
          que está incorporada a estes Termos por referência.
        </p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">6. Limitação de Responsabilidade</h2>
        <p>
          O DelivGo não será responsável por quaisquer danos indiretos, incidentais, especiais, consequenciais ou punitivos 
          resultantes do seu uso ou incapacidade de usar o serviço.
        </p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">7. Alterações nos Termos</h2>
        <p>
          Podemos modificar estes Termos a qualquer momento. As alterações entrarão em vigor imediatamente após 
          a publicação dos Termos atualizados. O uso continuado do serviço após tais alterações constitui sua aceitação dos novos Termos.
        </p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">8. Contato</h2>
        <p>
          Se tiver dúvidas sobre estes Termos, entre em contato conosco pelo e-mail: suporte@delivgo.com
        </p>
      </div>
    </div>
  );
};

export default Terms;
