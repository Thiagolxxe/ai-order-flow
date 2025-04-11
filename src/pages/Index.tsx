
import React from 'react';
import { MongoDBStatusChecker } from '@/components/mongodb/MongoDBStatusChecker';

export default function Index() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">DeliverAI</h1>
      <MongoDBStatusChecker />
      
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Status da Aplicação</h2>
        <p className="text-gray-700">
          Bem-vindo ao DeliverAI. Esta página exibe o status da conexão com o MongoDB Atlas.
        </p>
        <p className="text-gray-700 mt-4">
          A aplicação utiliza um cluster MongoDB Atlas para armazenar e gerenciar os dados.
        </p>
      </div>
    </div>
  );
}
