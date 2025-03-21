export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      avaliacoes: {
        Row: {
          atualizado_em: string
          cliente_id: string
          comentario: string | null
          criado_em: string
          id: string
          nota: number
          pedido_id: string | null
          restaurante_id: string
          verificado: boolean | null
        }
        Insert: {
          atualizado_em?: string
          cliente_id: string
          comentario?: string | null
          criado_em?: string
          id?: string
          nota: number
          pedido_id?: string | null
          restaurante_id: string
          verificado?: boolean | null
        }
        Update: {
          atualizado_em?: string
          cliente_id?: string
          comentario?: string | null
          criado_em?: string
          id?: string
          nota?: number
          pedido_id?: string | null
          restaurante_id?: string
          verificado?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "avaliacoes_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacoes_restaurante_id_fkey"
            columns: ["restaurante_id"]
            isOneToOne: false
            referencedRelation: "restaurantes"
            referencedColumns: ["id"]
          },
        ]
      }
      categorias: {
        Row: {
          criado_em: string
          descricao: string | null
          id: string
          nome: string
          ordem_exibicao: number | null
          restaurante_id: string
        }
        Insert: {
          criado_em?: string
          descricao?: string | null
          id?: string
          nome: string
          ordem_exibicao?: number | null
          restaurante_id: string
        }
        Update: {
          criado_em?: string
          descricao?: string | null
          id?: string
          nome?: string
          ordem_exibicao?: number | null
          restaurante_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "categorias_restaurante_id_fkey"
            columns: ["restaurante_id"]
            isOneToOne: false
            referencedRelation: "restaurantes"
            referencedColumns: ["id"]
          },
        ]
      }
      chats: {
        Row: {
          criado_em: string
          id: string
          pedido_id: string | null
        }
        Insert: {
          criado_em?: string
          id?: string
          pedido_id?: string | null
        }
        Update: {
          criado_em?: string
          id?: string
          pedido_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chats_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
        ]
      }
      entregadores: {
        Row: {
          ativo: boolean | null
          criado_em: string
          id: string
          latitude_atual: number | null
          longitude_atual: number | null
          placa: string | null
          tipo_veiculo: string | null
          ultima_atualizacao_localizacao: string | null
        }
        Insert: {
          ativo?: boolean | null
          criado_em?: string
          id: string
          latitude_atual?: number | null
          longitude_atual?: number | null
          placa?: string | null
          tipo_veiculo?: string | null
          ultima_atualizacao_localizacao?: string | null
        }
        Update: {
          ativo?: boolean | null
          criado_em?: string
          id?: string
          latitude_atual?: number | null
          longitude_atual?: number | null
          placa?: string | null
          tipo_veiculo?: string | null
          ultima_atualizacao_localizacao?: string | null
        }
        Relationships: []
      }
      escolhas_item_pedido: {
        Row: {
          ajuste_preco: number | null
          criado_em: string
          id: string
          item_pedido_id: string
          nome_escolha: string
          nome_opcao: string
        }
        Insert: {
          ajuste_preco?: number | null
          criado_em?: string
          id?: string
          item_pedido_id: string
          nome_escolha: string
          nome_opcao: string
        }
        Update: {
          ajuste_preco?: number | null
          criado_em?: string
          id?: string
          item_pedido_id?: string
          nome_escolha?: string
          nome_opcao?: string
        }
        Relationships: [
          {
            foreignKeyName: "escolhas_item_pedido_item_pedido_id_fkey"
            columns: ["item_pedido_id"]
            isOneToOne: false
            referencedRelation: "itens_pedido"
            referencedColumns: ["id"]
          },
        ]
      }
      escolhas_opcao: {
        Row: {
          ajuste_preco: number | null
          criado_em: string
          id: string
          nome: string
          opcao_id: string
        }
        Insert: {
          ajuste_preco?: number | null
          criado_em?: string
          id?: string
          nome: string
          opcao_id: string
        }
        Update: {
          ajuste_preco?: number | null
          criado_em?: string
          id?: string
          nome?: string
          opcao_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "escolhas_opcao_opcao_id_fkey"
            columns: ["opcao_id"]
            isOneToOne: false
            referencedRelation: "opcoes_item_cardapio"
            referencedColumns: ["id"]
          },
        ]
      }
      favoritos: {
        Row: {
          criado_em: string
          id: string
          restaurante_id: string
          usuario_id: string
        }
        Insert: {
          criado_em?: string
          id?: string
          restaurante_id: string
          usuario_id: string
        }
        Update: {
          criado_em?: string
          id?: string
          restaurante_id?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favoritos_restaurante_id_fkey"
            columns: ["restaurante_id"]
            isOneToOne: false
            referencedRelation: "restaurantes"
            referencedColumns: ["id"]
          },
        ]
      }
      funcoes_usuario: {
        Row: {
          criado_em: string
          funcao: Database["public"]["Enums"]["tipo_funcao_usuario"]
          id: string
          usuario_id: string
        }
        Insert: {
          criado_em?: string
          funcao: Database["public"]["Enums"]["tipo_funcao_usuario"]
          id?: string
          usuario_id: string
        }
        Update: {
          criado_em?: string
          funcao?: Database["public"]["Enums"]["tipo_funcao_usuario"]
          id?: string
          usuario_id?: string
        }
        Relationships: []
      }
      historico_status_pedido: {
        Row: {
          criado_em: string
          criado_por: string | null
          id: string
          observacoes: string | null
          pedido_id: string
          status: string
        }
        Insert: {
          criado_em?: string
          criado_por?: string | null
          id?: string
          observacoes?: string | null
          pedido_id: string
          status: string
        }
        Update: {
          criado_em?: string
          criado_por?: string | null
          id?: string
          observacoes?: string | null
          pedido_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "historico_status_pedido_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
        ]
      }
      itens_cardapio: {
        Row: {
          atualizado_em: string
          categoria_id: string | null
          criado_em: string
          descricao: string | null
          destaque: boolean | null
          disponivel: boolean | null
          id: string
          imagem_url: string | null
          nome: string
          preco: number
          restaurante_id: string
        }
        Insert: {
          atualizado_em?: string
          categoria_id?: string | null
          criado_em?: string
          descricao?: string | null
          destaque?: boolean | null
          disponivel?: boolean | null
          id?: string
          imagem_url?: string | null
          nome: string
          preco: number
          restaurante_id: string
        }
        Update: {
          atualizado_em?: string
          categoria_id?: string | null
          criado_em?: string
          descricao?: string | null
          destaque?: boolean | null
          disponivel?: boolean | null
          id?: string
          imagem_url?: string | null
          nome?: string
          preco?: number
          restaurante_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "itens_cardapio_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itens_cardapio_restaurante_id_fkey"
            columns: ["restaurante_id"]
            isOneToOne: false
            referencedRelation: "restaurantes"
            referencedColumns: ["id"]
          },
        ]
      }
      itens_pedido: {
        Row: {
          criado_em: string
          id: string
          instrucoes_especiais: string | null
          item_cardapio_id: string | null
          nome_item_cardapio: string
          pedido_id: string
          preco_total: number
          preco_unitario: number
          quantidade: number
        }
        Insert: {
          criado_em?: string
          id?: string
          instrucoes_especiais?: string | null
          item_cardapio_id?: string | null
          nome_item_cardapio: string
          pedido_id: string
          preco_total: number
          preco_unitario: number
          quantidade: number
        }
        Update: {
          criado_em?: string
          id?: string
          instrucoes_especiais?: string | null
          item_cardapio_id?: string | null
          nome_item_cardapio?: string
          pedido_id?: string
          preco_total?: number
          preco_unitario?: number
          quantidade?: number
        }
        Relationships: [
          {
            foreignKeyName: "itens_pedido_item_cardapio_id_fkey"
            columns: ["item_cardapio_id"]
            isOneToOne: false
            referencedRelation: "itens_cardapio"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itens_pedido_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
        ]
      }
      mensagens_chat: {
        Row: {
          chat_id: string
          criado_em: string
          id: string
          lida: boolean | null
          mensagem: string
          remetente_id: string | null
        }
        Insert: {
          chat_id: string
          criado_em?: string
          id?: string
          lida?: boolean | null
          mensagem: string
          remetente_id?: string | null
        }
        Update: {
          chat_id?: string
          criado_em?: string
          id?: string
          lida?: boolean | null
          mensagem?: string
          remetente_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mensagens_chat_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
        ]
      }
      notificacoes: {
        Row: {
          criado_em: string
          id: string
          id_relacionado: string | null
          lida: boolean | null
          mensagem: string
          tipo: string
          titulo: string
          usuario_id: string
        }
        Insert: {
          criado_em?: string
          id?: string
          id_relacionado?: string | null
          lida?: boolean | null
          mensagem: string
          tipo: string
          titulo: string
          usuario_id: string
        }
        Update: {
          criado_em?: string
          id?: string
          id_relacionado?: string | null
          lida?: boolean | null
          mensagem?: string
          tipo?: string
          titulo?: string
          usuario_id?: string
        }
        Relationships: []
      }
      opcoes_item_cardapio: {
        Row: {
          criado_em: string
          descricao: string | null
          id: string
          item_cardapio_id: string
          max_selecao: number | null
          min_selecao: number | null
          nome: string
          obrigatorio: boolean | null
        }
        Insert: {
          criado_em?: string
          descricao?: string | null
          id?: string
          item_cardapio_id: string
          max_selecao?: number | null
          min_selecao?: number | null
          nome: string
          obrigatorio?: boolean | null
        }
        Update: {
          criado_em?: string
          descricao?: string | null
          id?: string
          item_cardapio_id?: string
          max_selecao?: number | null
          min_selecao?: number | null
          nome?: string
          obrigatorio?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "opcoes_item_cardapio_item_cardapio_id_fkey"
            columns: ["item_cardapio_id"]
            isOneToOne: false
            referencedRelation: "itens_cardapio"
            referencedColumns: ["id"]
          },
        ]
      }
      participantes_chat: {
        Row: {
          chat_id: string
          criado_em: string
          funcao: string
          id: string
          usuario_id: string
        }
        Insert: {
          chat_id: string
          criado_em?: string
          funcao: string
          id?: string
          usuario_id: string
        }
        Update: {
          chat_id?: string
          criado_em?: string
          funcao?: string
          id?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "participantes_chat_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
        ]
      }
      pedidos: {
        Row: {
          atualizado_em: string
          cep_entrega: string
          cidade_entrega: string
          cliente_id: string | null
          criado_em: string
          endereco_entrega: string
          entregador_id: string | null
          estado_entrega: string
          gorjeta: number | null
          id: string
          imposto: number
          instrucoes_entrega: string | null
          metodo_pagamento: string | null
          numero_pedido: string
          restaurante_id: string
          status: string
          status_pagamento: string
          subtotal: number
          taxa_entrega: number
          taxa_servico: number
          tempo_entrega_estimado: string | null
          total: number
        }
        Insert: {
          atualizado_em?: string
          cep_entrega: string
          cidade_entrega: string
          cliente_id?: string | null
          criado_em?: string
          endereco_entrega: string
          entregador_id?: string | null
          estado_entrega: string
          gorjeta?: number | null
          id?: string
          imposto: number
          instrucoes_entrega?: string | null
          metodo_pagamento?: string | null
          numero_pedido: string
          restaurante_id: string
          status?: string
          status_pagamento?: string
          subtotal: number
          taxa_entrega: number
          taxa_servico: number
          tempo_entrega_estimado?: string | null
          total: number
        }
        Update: {
          atualizado_em?: string
          cep_entrega?: string
          cidade_entrega?: string
          cliente_id?: string | null
          criado_em?: string
          endereco_entrega?: string
          entregador_id?: string | null
          estado_entrega?: string
          gorjeta?: number | null
          id?: string
          imposto?: number
          instrucoes_entrega?: string | null
          metodo_pagamento?: string | null
          numero_pedido?: string
          restaurante_id?: string
          status?: string
          status_pagamento?: string
          subtotal?: number
          taxa_entrega?: number
          taxa_servico?: number
          tempo_entrega_estimado?: string | null
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "pedidos_restaurante_id_fkey"
            columns: ["restaurante_id"]
            isOneToOne: false
            referencedRelation: "restaurantes"
            referencedColumns: ["id"]
          },
        ]
      }
      perfis: {
        Row: {
          criado_em: string
          endereco: string | null
          foto_url: string | null
          id: string
          nome: string | null
          sobrenome: string | null
          telefone: string | null
        }
        Insert: {
          criado_em?: string
          endereco?: string | null
          foto_url?: string | null
          id: string
          nome?: string | null
          sobrenome?: string | null
          telefone?: string | null
        }
        Update: {
          criado_em?: string
          endereco?: string | null
          foto_url?: string | null
          id?: string
          nome?: string | null
          sobrenome?: string | null
          telefone?: string | null
        }
        Relationships: []
      }
      promocoes: {
        Row: {
          ativo: boolean | null
          atualizado_em: string
          codigo: string | null
          criado_em: string
          data_fim: string
          data_inicio: string
          descricao: string | null
          id: string
          limite_uso: number | null
          restaurante_id: string | null
          tipo: string
          uso_atual: number | null
          valor: number
          valor_desconto_maximo: number | null
          valor_pedido_minimo: number | null
        }
        Insert: {
          ativo?: boolean | null
          atualizado_em?: string
          codigo?: string | null
          criado_em?: string
          data_fim: string
          data_inicio: string
          descricao?: string | null
          id?: string
          limite_uso?: number | null
          restaurante_id?: string | null
          tipo: string
          uso_atual?: number | null
          valor: number
          valor_desconto_maximo?: number | null
          valor_pedido_minimo?: number | null
        }
        Update: {
          ativo?: boolean | null
          atualizado_em?: string
          codigo?: string | null
          criado_em?: string
          data_fim?: string
          data_inicio?: string
          descricao?: string | null
          id?: string
          limite_uso?: number | null
          restaurante_id?: string | null
          tipo?: string
          uso_atual?: number | null
          valor?: number
          valor_desconto_maximo?: number | null
          valor_pedido_minimo?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "promocoes_restaurante_id_fkey"
            columns: ["restaurante_id"]
            isOneToOne: false
            referencedRelation: "restaurantes"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurantes: {
        Row: {
          ativo: boolean | null
          atualizado_em: string
          banner_url: string | null
          cep: string
          cidade: string
          criado_em: string
          descricao: string | null
          email: string | null
          endereco: string
          estado: string
          faixa_preco: number
          id: string
          logo_url: string | null
          nome: string
          proprietario_id: string
          taxa_entrega: number | null
          telefone: string | null
          tempo_entrega_estimado: number | null
          tipo_cozinha: string
          valor_pedido_minimo: number | null
        }
        Insert: {
          ativo?: boolean | null
          atualizado_em?: string
          banner_url?: string | null
          cep: string
          cidade: string
          criado_em?: string
          descricao?: string | null
          email?: string | null
          endereco: string
          estado: string
          faixa_preco: number
          id?: string
          logo_url?: string | null
          nome: string
          proprietario_id: string
          taxa_entrega?: number | null
          telefone?: string | null
          tempo_entrega_estimado?: number | null
          tipo_cozinha: string
          valor_pedido_minimo?: number | null
        }
        Update: {
          ativo?: boolean | null
          atualizado_em?: string
          banner_url?: string | null
          cep?: string
          cidade?: string
          criado_em?: string
          descricao?: string | null
          email?: string | null
          endereco?: string
          estado?: string
          faixa_preco?: number
          id?: string
          logo_url?: string | null
          nome?: string
          proprietario_id?: string
          taxa_entrega?: number | null
          telefone?: string | null
          tempo_entrega_estimado?: number | null
          tipo_cozinha?: string
          valor_pedido_minimo?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      tem_funcao: {
        Args: {
          funcao: Database["public"]["Enums"]["tipo_funcao_usuario"]
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "superadmin" | "admin" | "regulador"
      tipo_funcao_usuario: "cliente" | "restaurante" | "entregador" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
