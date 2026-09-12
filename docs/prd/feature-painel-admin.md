# PRD — Feature: Painel Administrativo

> Tipo: PRD de feature · Data: 2026-09-12
> **Status:** Aguardando implementação
>
> <!-- Valores possíveis: "Aguardando implementação" | "Implementada". Atualize para "Implementada" quando todas as specs estiverem concluídas. -->

## 1. Visão geral

Painel administrativo dentro do próprio e-commerce (rota `/admin`) para o dono da Roldan Marcenaria gerenciar produtos, pedidos, financeiro, fretes/entregas e visualizar estatísticas de vendas. O painel usa o mesmo login Supabase existente, com verificação de perfil admin antes de liberar acesso.

## 2. Problema que resolve

Hoje os 21 produtos estão hardcoded em TypeScript, o checkout não grava pedidos no banco, e não existe visão consolidada de vendas, estoque ou entregas. O dono precisa de um painel centralizado para: cadastrar/editar/remover produtos com imagens e preços, acompanhar pedidos e pagamentos, saber o faturamento, controlar envios e estoque mínimo — tudo sem depender de ferramentas externas ou acesso direto ao Supabase Dashboard.

## 3. Público-alvo

- O dono da Roldan Marcenaria (único administrador). Não é para múltiplos usuários nem para clientes.

## 4. Objetivo do recorte atual

Criar o painel admin completo com: gerenciamento de produtos (CRUD + imagens + categorias + sob medida), controle de pedidos e financeiro (dashboard, lista, detalhe, exportação CSV/PDF), estatísticas de vendas (por período, top produtos, clientes recorrentes), e gestão de fretes/entregas (status de envio, prazos, cálculo admin, registro de rastreio). Tudo protegido por role admin no Supabase Auth.

## 5. Funcionalidades

**Essenciais:**

- Proteção de acesso: verificar role admin antes de renderizar qualquer página do painel
- Migrar produtos do array hardcoded para tabelas no Supabase (banco de dados)
- CRUD completo de produtos (criar, editar, remover, listar com busca/filtro)
- Upload e gerenciamento de imagens de produtos via Supabase Storage
- Gerenciamento dinâmico de categorias (criar, editar, remover, ordenar)
- Definir tipo de disponibilidade por produto (pronta-entrega, fabricação, sob medida)
- Controle de estoque com quantidade numérica e alerta de estoque mínimo
- Dashboard financeiro com faturamento diário/semanal/mensal e ticket médio
- Lista de todos os pedidos com filtros por status, período e cliente
- Detalhe completo de cada pedido (itens, valores, frete, pagamento, status)
- Exportação de relatórios financeiros em CSV e PDF
- Estatísticas: vendas por período (gráfico), produtos mais vendidos (ranking), clientes recorrentes
- Controle de envios: marcar pedido como enviado com código de rastreio (registro manual)
- Visualização de prazos de entrega por pedido
- Cálculo de frete pelo painel (simulação para auxiliar cliente)

**Desejáveis:**

- Alerta visual no dashboard quando estoque de um produto atinge o mínimo
- Busca e filtro por categoria na listagem de produtos

## 6. Fora do escopo

- Integração automática com API dos Correios (etiquetas, rastreio automático)
- Sistema de múltiplos administradores ou perfis de acesso
- Integração com gateway de pagamento Asaas no painel (já existe no checkout do client)
- App mobile dedicado para o admin
- Gestão de cupons de desconto (feature separada)
- Notificações push ou por email ao admin
- Relatórios financeiros com gráficos avançados (PIE, funnel)
- Nota fiscal automática

## 7. Regras de negócio

- Regra 1: Apenas usuários com role `admin` no Supabase podem acessar `/admin`. Usuários sem essa role são redirecionados para a home.
- Regra 2: Produtos hardcoded no arquivo `src/data/products.ts` devem ser migrados para o banco; a aplicação passa a consultar o Supabase para exibir produtos no catálogo público.
- Regra 3: Todo produto obrigatoriamente pertence a uma categoria. Uma categoria pode conter vários produtos.
- Regra 4: Produtos com disponibilidade "sob-medida" não possuem estoque numérico fixo — o campo estoque se aplica apenas a "pronta-entrega" e "fabricação".
- Regra 5: Alerta de estoque mínimo é acionado quando a quantidade em estoque de um produto atinge ou fica abaixo do limite configurável (padrão: 3 unidades).
- Regra 6: Um pedido só pode ter seu status de envio alterado uma vez (de "pendente" para "enviado"), e o código de rastreio é opcional mas recomendado.
- Regra 7: A exclusão de um produto só é permitida se não houver pedidos associados a ele. Se houver, o sistema deve inativar ao invés de excluir.
- Regra 8: O frete calculado pelo admin usa a mesma lógica do carrinho público (grátis São Carlos, fórmula peso×4.5 para demais), servindo como referência — não altera o frete do pedido já feito.
- Regra 9: Dados financeiros exibidos no dashboard consideram apenas pedidos com pagamento confirmado (PIX aprovado, cartão processado, ou entrega concluída).
- Regra 10: Pedidos com pagamento pendente há mais de 24h devem ser destacados como "atrasados" na lista.

## 8. Fluxos principais

### Fluxo 1 — Acesso ao painel

1. Usuário faz login na loja (email/senha ou Google)
2. Tenta acessar `/admin`
3. Sistema verifica no Supabase se o user tem role `admin`
4. Se sim → renderiza o painel com sidebar de navegação
5. Se não → redireciona para `/` com mensagem de acesso negado

### Fluxo 2 — Gerenciar produto

1. Admin clica "Produtos" na sidebar
2. Vê listagem com busca, filtro por categoria e por disponibilidade
3. Clica "Novo produto" → formulário com: nome, preço, descrição, resumo rápido, medidas, cor MDF, disponibilidade (pronta-entrega/fabricação/sob medida), categoria, peso, estoque (se aplicável), produto destaque (sim/não), manual URL, produtos relacionados
4. Faz upload de imagens (múltiplas, com preview)
5. Salva → produto aparece no catálogo público
6. Para editar: clica no produto → abre formulário preenchido → altera → salva
7. Para remover: clica "Excluir" → confirmação → se sem pedidos exclui, se com pedidos inativa

### Fluxo 3 — Gerenciar categorias

1. Admin clica "Categorias" na sidebar
2. Vê lista de categorias com quantidade de produtos em cada
3. Cria nova categoria (nome + descrição opcional)
4. Edita nome de categoria existente
5. Remove categoria (só se vazia — sem produtos vinculados)

### Fluxo 4 — Acompanhar pedido

1. Admin clica "Pedidos" na sidebar
2. Vê lista com: número, cliente, data, valor total, status pagamento, status envio
3. Filtra por status, período ou busca por nome/CPF do cliente
4. Clica num pedido → vê detalhe completo: itens, endereço, frete, pagamento, histórico
5. Marca como "Enviado" e informa código de rastreio (opcional)

### Fluxo 5 — Dashboard financeiro

1. Admin clica "Financeiro" na sidebar
2. Vê cards: faturamento do mês, ticket médio, pedidos pendentes, pedidos enviados
3. Gráfico de barras: vendas dos últimos 30 dias (ou período selecionado)
4. Tabela de pedidos recentes com valores
5. Botão "Exportar CSV" e "Exportar PDF" para gerar relatório

### Fluxo 6 — Estatísticas

1. Admin clica "Estatísticas" na sidebar
2. Vê: vendas por período (gráfico de linha), top 10 produtos mais vendidos (tabela ranqueada), clientes que compraram mais de uma vez (lista com contagem)
3. Pode filtrar por período

### Fluxo 7 — Gestão de fretes e entregas

1. Admin clica "Entregas" na sidebar
2. Vê lista de pedidos pendentes de envio, com CEP destino, prazo estimado e valor do frete
3. Pode calcular frete manualmente (digita CEP + seleciona itens) para orientar cliente
4. Registra envio: marca como enviado, informa transportadora (texto livre) e código de rastreio

## 9. Critérios de aceite

- O sistema deve impedir que usuário sem role admin acesse qualquer rota `/admin`
- O sistema deve exibir produtos do banco de dados no catálogo público (migrados do hardcoded)
- O admin consegue criar, editar e remover produtos com upload de imagens
- O admin consegue criar, editar e remover categorias dinamicamente
- O sistema deve alertar visualmente quando estoque de um produto atinge o mínimo configurável
- O admin consegue ver faturamento, ticket médio e pedidos pendentes no dashboard
- O admin consegue exportar relatórios em CSV e PDF
- O admin consegue marcar pedido como enviado com código de rastreio
- O admin consegue calcular frete por CEP pelo painel
- Quando produto tem pedidos associados, o sistema impede exclusão e sugere inativação
- O sistema não deve permitir que um pedido com pagamento pendente há mais de 24h passe despercebido (destaque visual)

## 10. Stack

Mesma stack existente do projeto: Next.js 16 (App Router) + TypeScript + Tailwind v4 + shadcn/ui + Supabase (PostgreSQL + Auth + Storage) + Framer Motion. Não são necessárias novas dependências de stack — apenas bibliotecas auxiliares leves para geração de CSV e PDF (ex.: `jspdf` + `jspdf-autotable` para PDF, nativo para CSV).

## 11. Justificativa da stack

Reutilizar a stack existente evita fragmentação técnica. O Supabase já provê auth (com suporte a roles via user metadata ou tabela de perfis), banco PostgreSQL (para products, orders, categories), e storage (para imagens). Next.js App Router permite proteger rotas via Server Components que verificam role antes de renderizar. shadcn/ui fornece os componentes de tabela, formulário, dialog e cards necessários sem dependência externa pesada.

## 12. Fases de construção

### Fase 0 — Migração de dados e infraestrutura admin

Objetivo: mover produtos hardcoded para o Supabase, criar schema do banco (tabelas products, categories, orders, order_items), e proteger a rota admin com verificação de role.

Specs:

- Spec 01 — Schema do banco de dados e migração de produtos
- Spec 02 — Proteção de acesso admin (role verification)

### Fase 1 — Gerenciamento de produtos e categorias

Objetivo: CRUD completo de produtos com imagens, categorias dinâmicas e controle de estoque.

Specs:

- Spec 03 — Gerenciamento de categorias
- Spec 04 — CRUD de produtos (criar, listar, editar, remover)
- Spec 05 — Upload e gerenciamento de imagens de produtos
- Spec 06 — Controle de estoque com alerta mínimo

### Fase 2 — Pedidos e financeiro

Objetivo: visualizar e gerenciar pedidos, dashboard financeiro e exportação de relatórios.

Specs:

- Spec 07 — Persistência de pedidos no banco de dados
- Spec 08 — Lista e detalhe de pedidos no admin
- Spec 09 — Dashboard financeiro e exportação CSV/PDF

### Fase 3 — Estatísticas

Objetivo: métricas de vendas para tomada de decisão.

Specs:

- Spec 10 — Estatísticas de vendas (por período, top produtos, clientes recorrentes)

### Fase 4 — Fretes e entregas

Objetivo: gestão de envios, cálculo de frete pelo admin e registro de rastreio.

Specs:

- Spec 11 — Gestão de fretes e entregas no admin

## 13. Specs funcionais detalhadas

### Spec 01 — Schema do banco de dados e migração de produtos

- **Fase:** Fase 0 — Migração de dados e infraestrutura admin
- **Objetivo (o quê):** Criar as tabelas necessárias no Supabase (products, categories, orders, order_items) e migrar os 21 produtos hardcoded para o banco, atualizando a aplicação para consultar o Supabase ao invés do array estático.
- **Intenção (por quê):** Sem dados no banco, nenhum dos recursos do painel admin funciona. Produtos hardcoded impedem CRUD, pedidos não são persistidos, e não há como gerar estatísticas ou relatórios. Esta spec é a base de tudo.
- **Contexto:** Hoje existem 21 produtos em `src/data/products.ts` com interface `Product` definida. A tabela `profiles` já existe no Supabase. A aplicação usa Supabase client browser e server. Não existe Prisma no projeto.
- **Atores:** Desenvolvedor (implementação); Dono (uso posterior).
- **Descrição do comportamento:** Criar tabelas `categories`, `products` (com foreign key para categories), `orders` e `order_items` no Supabase via migrations. Fazer seed dos 21 produtos existentes com suas categorias derivadas (ex.: "Porta Celulares" → categoria "Suportes"). Atualizar as funções de busca de produtos (atualmente `get-products.ts` e `get-product.ts`) para consultar o banco ao invés do array hardcoded. Manter a interface `Product` existente como tipo de referência para não quebrar componentes do frontend.
- **Entradas e saídas:** Entrada: array `PRODUCTS` existente, interface `Product`. Saída: tabelas populadas no Supabase + funções de busca atualizadas + frontend funcionando com dados do banco.
- **Dados/entidades envolvidos (conceitual):**
  - **Categoria:** id, nome, slug, descrição, ordem de exibição
  - **Produto:** id, nome, slug, preço, descrição, resumo rápido, medidas, cor MDF, disponibilidade (pronta-entrega/fabricação/sob medida), peso, estoque, destaque (sim/não), manual URL, ativo (sim/não), categoria_id, imagem_url (inicialmente uma, expandida na Spec 05)
  - **Pedido:** id, usuario_id, data, valor subtotal, valor frete, frete CEP destino, frete prazo estimado, meio pagamento (pix/card/entrega), status pagamento (pendente/pago/expirado/cancelado), status envio (pendente/enviado/entregue), código rastreio, transportadora, notas
  - **Item do pedido:** id, pedido_id, produto_id, quantidade, preço_unitário no momento da compra
- **Estados e transições:** Não se aplica (schema setup).
- **Regras de negócio:** Produtos sem estoque definido devem ter estoque = 0 por padrão. Cada produto deve ter exatamente uma categoria. O slug do produto deve ser único.
- **Validações:** Preço deve ser positivo. Estoque deve ser ≥ 0 (quando aplicável). Disponibilidade deve ser um dos três valores válidos.
- **Fluxo do usuário (passo a passo):**
  1. Desenvolvedor roda migration criando as 4 tabelas
  2. Desenvolvedor roda seed inserindo 21 produtos com categorias
  3. Desenvolvedor atualiza `get-products.ts` e `get-product.ts` para usar Supabase client
  4. Verifica que homepage, página de detalhe e carrinho funcionam com dados do banco
- **Casos de borda e erros:** Se o Supabase estiver indisponível, a aplicação deve mostrar mensagem de erro amigável ao invés de quebrar. Seeds devem ser idempotentes (não duplicar se rodados duas vezes).
- **Impacto no existente:** Muda a fonte de dados de produtos — todas as páginas que consomem `PRODUCTS` hardcoded passam a usar o Supabase. A interface `Product` pode precisar de ajustes leves para incluir `categoria_id` e `ativo`.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado as 4 tabelas criadas Quando faço seed dos 21 produtos Então todos aparecem na homepage com dados corretos
  - Dado um produto no banco Quando acesso `/produto/[id]` Então vejo detalhe completo com preço, medidas, disponibilidade
  - Dado que produtos estão no banco Quando acesso a homepage Então não há mais referência ao array hardcoded
  - Dado Supabase indisponível When acesso a homepage Then vejo mensagem de erro amigável
- **Definição de pronto:** Tabelas criadas, produtos migrados, frontend consultando banco, array hardcoded removido ou abandonado.
- **Dependências:** Nenhuma (base de tudo).
- **Fora do escopo desta spec:** Upload de imagens (Spec 05), pedidos no admin (Spec 07/08), schema de pedidos detalhado com items (é incluído aqui mas sem lógica de negócio de pedidos).

### Spec 02 — Proteção de acesso admin (role verification)

- **Fase:** Fase 0 — Migração de dados e infraestrutura admin
- **Objetivo (o quê):** Garantir que apenas usuários com role `admin` consigam acessar rotas sob `/admin`. Usuários sem essa role são redirecionados para a home.
- **Intenção (por quê):** O painel contém dados sensíveis (pedidos, CPF de clientes, faturamento). Mesmo sendo uso individual, a proteção garante que um link acidental não exponha dados e prepara para futuro multi-admin.
- **Contexto:** O projeto já usa Supabase Auth com middleware de sessão. A autenticação é feita via email/senha ou Google OAuth. A tabela `profiles` já existe. A decisão de onde armazenar a role (user metadata ou campo na tabela profiles) fica para o implementador decidir — a spec define comportamento, não schema técnico.
- **Atores:** Dono (admin), usuários comuns (não-admin).
- **Descrição do comportamento:** Ao acessar qualquer rota iniciada com `/admin`, o sistema verifica se o usuário autenticado possui role `admin`. Se tiver, renderiza a página normalmente. Se não tiver, redireciona para `/` com toast/mensagem informando "Acesso não autorizado". A verificação deve acontecer no nível do Server Component (antes de renderizar) para não expor conteúdo do client component. O layout de admin deve ter sidebar de navegação com links para: Dashboard, Produtos, Categorias, Pedidos, Financeiro, Estatísticas, Entregas.
- **Entradas e saídas:** Entrada: usuário logado tenta acessar `/admin/*`. Saída: admin → renderiza painel; não-admin → redireciona para home.
- **Dados/entidades envolvidos (conceitual):** usuário: role (admin ou user); sessão: autenticada ou não.
- **Estados e transições:** Não autenticado → redireciona para login; autenticado sem admin → redireciona para home; autenticado com admin → renderiza admin.
- **Regras de negócio:** A role deve ser verificada no server side, não apenas no client. A verificação deve usar a sessão do Supabase (cookies), não tokens do client.
- **Validações:** Se não há sessão ativa, redireciona para login. Se há sessão mas sem role admin, redireciona para home.
- **Fluxo do usuário (passo a passo):**
  1. Admin faz login na loja
  2. Navega para `/admin`
  3. Sistema verifica role → tem admin → renderiza painel
  4. Usuário comum faz login
  5. Tenta acessar `/admin`
  6. Sistema verifica role → não tem admin → redireciona para home com mensagem
- **Casos de borda e erros:** Sessão expirada → redireciona para login. Role não definida → trata como não-admin. Erro ao consultar role → redireciona para home (não expõe admin).
- **Impacto no existente:** Nenhum componente existente é alterado. Cria nova rota `/admin` e layout protegido.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado usuário admin logado Quando acessa `/admin` Então vê o painel com sidebar
  - Dado usuário comum logado Quando acessa `/admin` Então é redirecionado para home com mensagem
  - Dado usuário não logado Quando acessa `/admin` Então é redirecionado para login
- **Definição de pronto:** Rota `/admin` protegida, sidebar funcional, redirecionamento correto para os 3 cenários.
- **Dependências:** Spec 01 — precisa de tabela profiles ou user metadata para armazenar role.
- **Fora do escopo desta spec:** Gerenciamento de roles pelo painel (não será possível criar novos admins pelo painel). Multi-admin.

### Spec 03 — Gerenciamento de categorias

- **Fase:** Fase 1 — Gerenciamento de produtos e categorias
- **Objetivo (o quê):** Permitir ao admin criar, editar, remover e reordenar categorias de produtos pelo painel.
- **Intenção (por quê):** Categorias organizam o catálogo e habilitam filtros no storefront. Serem dinâmicas permite ao dono adaptar o catálogo sem depender de desenvolvedor.
- **Contexto:** A tabela `categories` foi criada na Spec 01. Hoje os produtos não têm categorias explícitas no código — elas serão derivadas na migração. Após isso, o admin gerencia.
- **Atores:** Admin (dono da loja).
- **Descrição do comportamento:** Tela listagem com tabela mostrando: nome da categoria, quantidade de produtos vinculados, ordem de exibição. Botão "Nova categoria" abre formulário com nome (obrigatório) e descrição (opcional). Editar abre formulário preenchido. Excluir pede confirmação — só é permitido se a categoria não tiver produtos vinculados (senão, mostra aviso "Remova ou mova os X produtos antes"). Reordenar via drag-and-drop ou setas cima/baixo.
- **Entradas e saídas:** Entrada: dados da categoria (nome, descrição). Saída: categorias salvas no banco, listagem atualizada.
- **Dados/entidades envolvidos (conceitual):** categoria: nome, descrição, ordem, contagem de produtos.
- **Estados e transições:** Ativa (visível no storefront) → inativa (oculta mas mantém vínculo).
- **Regras de negócio:** Nome da categoria deve ser único. Não pode excluir categoria com produtos. Produtos devem ter sempre ao menos uma categoria disponível.
- **Validações:** Nome obrigatório, mínimo 2 caracteres. Descrição opcional, máximo 200 caracteres.
- **Fluxo do usuário (passo a passo):**
  1. Admin clica "Categorias" na sidebar
  2. Vê lista de categorias
  3. Clica "Nova categoria" → preenche nome → salva
  4. Para editar: clica na linha → altera nome → salva
  5. Para excluir: clica "Excluir" → confirmação → se vazia exclui, se com produtos avisa
- **Casos de borda e erros:** Nome duplicado → erro de validação claro. Tentar excluir com produtos → mensagem explicativa. Tentar criar sem nome → erro de validação.
- **Impacto no existente:** Nenhum componente existente é alterado. Adiciona novas rotas e componentes no admin.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado admin logado Quando clica "Categorias" Then vê lista com nome e contagem
  - Dado nome único Quando cria categoria Then categoria aparece na listagem
  - Dado categoria vazia Quando exclui Then é removida com sucesso
  - Dado categoria com 3 produtos When tenta excluir Then vê aviso e não exclui
- **Definição de pronto:** CRUD de categorias funcional com validações, reordenamento e proteção contra exclusão com vínculos.
- **Dependências:** Spec 01 — tabela categories criada.
- **Fora do escopo desta spec:** Imagens de categorias. Categorias com hierarquia (subcategorias).

### Spec 04 — CRUD de produtos (criar, listar, editar, remover)

- **Fase:** Fase 1 — Gerenciamento de produtos e categorias
- **Objetivo (o quê):** Tela completa para criar, listar, editar e remover produtos, com todos os campos necessários e filtros de busca.
- **Intenção (por quê):** Controle total do catálogo é essencial para o dono atualizar preços, adicionar novos produtos e manter o estoque preciso.
- **Contexto:** Tabela `products` criada na Spec 01, categorias gerenciadas na Spec 03. A interface `Product` existente serve como referência dos campos. A listagem pública (homepage) já consome do banco após Spec 01.
- **Atores:** Admin (dono da loja).
- **Descrição do comportamento:**
  - **Listagem:** Tabela com busca por nome, filtro por categoria (dropdown), filtro por disponibilidade (pronta-entrega/fabricação/sob medida), filtro por status (ativo/inativo). Colunas: imagem miniatura, nome, preço, categoria, disponibilidade, estoque, status (ativo/inativo). Ordenação por nome, preço ou data de criação. Paginação.
  - **Criar:** Botão "Novo produto" → formulário com: nome (obrigatório), slug (gerado automaticamente do nome, editável), preço (obrigatório, numérico), descrição (obrigatória), resumo rápido (opcional), medidas (opcional), cor MDF (opcional), disponibilidade (select: pronta-entrega/fabricação/sob medida), categoria (select obrigatório das categorias existentes), peso em kg (opcional, usado para cálculo de frete), estoque (numérico, visível apenas para pronta-entrega e fabricação), destaque (toggle sim/não), manual URL (opcional), produtos relacionados (multi-select dos outros produtos), ativo (toggle sim/não, padrão sim).
  - **Editar:** Mesmo formulário preenchido com dados atuais. Slug editável mas com aviso de que URL pública pode mudar.
  - **Remover:** Botão "Excluir" → diálogo de confirmação → se sem pedidos associados, exclui permanentemente. Se com pedidos, opção de inativar ao invés de excluir.
- **Entradas e saídas:** Entrada: dados do produto. Saída: produto salvo no banco, listagem pública atualizada.
- **Dados/entidades envolvidos (conceitual):** produto: todos os campos listados acima.
- **Estados e transições:** Ativo (visível no storefront) → Inativo (oculto do storefront mas mantém dados).
- **Regras de negócio:** Preço deve ser positivo. Estoque ≥ 0 quando aplicável. Slug único. Produto com pedidos não pode ser excluído permanentemente — apenas inativado. Produto inativo não aparece no storefront.
- **Validações:** Nome: obrigatório, 3-100 caracteres. Preço: obrigatório, positivo. Descrição: obrigatória, 10-500 caracteres. Estoque: obrigatório e ≥ 0 para pronta-entrega e fabricação; ignorado para sob medida. Slug: único, apenas letras/números/hífens.
- **Fluxo do usuário (passo a passo):**
  1. Admin clica "Produtos" na sidebar
  2. Vê listagem com busca e filtros
  3. Clica "Novo produto" → preenche formulário → seleciona categoria → define preço/estoque/disponibilidade → salva
  4. Para editar: clica no produto → altera campos → salva
  5. Para remover: clica "Excluir" → confirma → exclui ou inativa
- **Casos de borda e erros:** Preço zero → validação impede. Estoque negativo → validação impede. Slug duplicado → erro com sugestão de slug alternativo. Produto sem imagem → mostra placeholder na listagem. Tentar excluir produto com pedidos → aviso + opção de inativar.
- **Impacto no existente:** Nenhum componente público é alterado diretamente, mas produtos criados/editados pelo admin passam a aparecer no catálogo público imediatamente.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado admin logado Quando clica "Produtos" Then vê tabela com busca e filtros
  - Dado dados válidos When cria produto Then produto aparece na listagem do admin e no catálogo público
  - Dado produto existente When edita preço Then novo preço reflete imediatamente no storefront
  - Dado produto com 2 pedidos When tenta excluir Then vê aviso e opção de inativar
  - Dado produto inativo When visitante acessa homepage Then não vê o produto
- **Definição de pronto:** CRUD completo com listagem filtrável, formulário validado, exclusão protegida, inativação, e sincronização com storefront.
- **Dependências:** Spec 01 — tabela products; Spec 03 — categorias existentes para o select.
- **Fora do escopo desta spec:** Upload de imagens (Spec 05), preços promocionais/descontos.

### Spec 05 — Upload e gerenciamento de imagens de produtos

- **Fase:** Fase 1 — Gerenciamento de produtos e categorias
- **Objetivo (o quê):** Permitir upload de múltiplas imagens por produto via Supabase Storage, com preview, reordenação e remoção.
- **Intenção (por quê):** Imagens de qualidade são decisivas para venda de móveis. O admin precisa trocar fotos sem depender de desenvolvedor.
- **Contexto:** Bucket `product-images` já existe no Supabase Storage (usado pelo componente `ProductImage`). Atualmente as imagens são referenciadas por URL fixa. A Spec 04 cria o campo no banco mas sem lógica de upload — esta spec adiciona.
- **Atores:** Admin (dono da loja).
- **Descrição do comportamento:** No formulário de produto (Spec 04), há seção de imagens. Botão "Adicionar imagem" abre seletor de arquivo (aceita jpg, png, webp; máx 5MB por arquivo). Ao selecionar, faz upload para o Supabase Storage no bucket `product-images` dentro de pasta `products/{produto_id}/`. Mostra preview da imagem com opção de reordenar (arrastar) e remover. A primeira imagem da lista é a imagem principal (capa). Limitar a no máximo 6 imagens por produto. Edição: imagens existentes são exibidas com opção de reordenar/remover; novas podem ser adicionadas.
- **Entradas e saídas:** Entrada: arquivos de imagem. Saída: URLs das imagens salvas no Supabase Storage, referenciadas no banco de dados do produto.
- **Dados/entidades envolvidos (conceitual):** imagem do produto: URL, ordem, é_principal (boolean).
- **Estados e transições:** Uploading (com progresso) → Salva → Removida (soft delete do Storage).
- **Regras de negócio:** Máximo 6 imagens por produto. Máximo 5MB por arquivo. Formatos aceitos: jpg, png, webp. Imagem removida do banco mas mantida no Storage (limpeza periódica opcional). A primeira imagem é sempre a capa.
- **Validações:** Tamanho do arquivo ≤ 5MB. Formato aceito. Máximo 6 imagens por produto. Pelo menos 1 imagem para produto ativo (warning, não bloqueia).
- **Fluxo do usuário (passo a passo):**
  1. Admin está no formulário de produto
  2. Clica "Adicionar imagem"
  3. Seleciona arquivo(s) do computador
  4. Vê preview com barra de progresso durante upload
  5. Pode arrastar para reordenar ou clicar "X" para remover
  6. Salva produto → imagens vinculadas
- **Casos de borda e erros:** Arquivo > 5MB → erro "Arquivo muito grande". Formato inválido → erro "Formato não aceito". Upload falhou → opção de tentar novamente. Imagem corrompida → placeholder + mensagem. Tentar adicionar 7ª imagem → botão desabilitado.
- **Impacto no existente:** O componente `ProductImage` existente já suporta URLs do Supabase Storage — não precisa de alteração significativa. O formulário de produto (Spec 04) ganha a seção de imagens.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado admin When seleciona imagem Then vê preview com progresso
  - Dado upload concluído When salva produto Then imagem aparece no catálogo público
  - Dado 6 imagens When tenta adicionar mais Then botão está desabilitado
  - Dado imagem > 5MB When tenta upload Then vê erro de tamanho
- **Definição de pronto:** Upload funcional com preview, reordenação, remoção, limites de tamanho/formato/quantidade, e imagens visíveis no storefront.
- **Dependências:** Spec 04 — formulário de produto; bucket `product-images` existente no Supabase.
- **Fora do escopo desta spec:** Crop/edição de imagens no browser. Watermark. Imagens de categorias.

### Spec 06 — Controle de estoque com alerta mínimo

- **Fase:** Fase 1 — Gerenciamento de produtos e categorias
- **Objetivo (o quê):** Permitir ao admin definir quantidade de estoque por produto e configurar limite mínimo para alerta visual.
- **Intenção (por quê):** Saber o estoque evita vender o que não tem. Alerta visual permite repor antes de esgotar. Essencial para marcenaria que fabrica sob demanda.
- **Contexto:** O campo estoque já é definido no formulário de produto (Spec 04) para produtos "pronta-entrega" e "fabricação". Esta spec adiciona: decremento automático ao vender, alerta visual no painel, e configuração do limite mínimo.
- **Atores:** Admin (dono da loja), sistema (decremento automático).
- **Descrição do comportamento:** O campo estoque é numérico e aparece no formulário de produto apenas para disponibilidade "pronta-entrega" e "fabricação" (não para "sob medida"). O admin define um "estoque mínimo" por produto (padrão: 3). Quando o estoque de um produto atinge ou fica abaixo do mínimo: (a) exibe badge/alerta vermelho na listagem de produtos; (b) exibe card de alerta no dashboard do admin; (c) no storefront, quando estoque = 0, o produto aparece como "Esgotado" e o botão "Adicionar ao carrinho" fica desabilitado. Quando um pedido é confirmado com pagamento, o sistema decrementa o estoque automaticamente. Se pagamento é cancelado/expirado, estoque é devolvido.
- **Entradas e saídas:** Entrada: estoque definido pelo admin, pedidos confirmados. Saída: estoque atualizado, alertas visuais, status "esgotado" no storefront.
- **Dados/entidades envolvidos (conceitual):** produto: estoque (quantidade), estoque_mínimo (limite de alerta).
- **Estados e transições:** Estoque alto (> mínimo) → Estoque baixo (≤ mínimo, alerta) → Esgotado (= 0, bloqueio de venda) → Reposto (admin aumenta estoque).
- **Regras de negócio:** Estoque só se aplica a pronta-entrega e fabricação. Sob medida não tem controle de estoque. Estoque não pode ser negativo. Decremento automático ao confirmar pagamento (não ao criar pedido). Devolução de estoque se pagamento cancelado. Alerta visual quando ≤ mínimo configurável.
- **Validações:** Estoque: ≥ 0, aceita decimais? Não — apenas números inteiros. Estoque mínimo: ≥ 0, padrão 3.
- **Fluxo do usuário (passo a passo):**
  1. Admin configura estoque e estoque mínimo no formulário de produto
  2. Vê badge vermelho na listagem quando estoque ≤ mínimo
  3. Dashboard mostra card "Produtos com estoque baixo" com lista
  4. Quando cliente compra e paga, estoque decrementa automaticamente
  5. Se estoque = 0, storefront mostra "Esgotado"
  6. Admin repõe estoque via formulário de edição
- **Casos de borda e erros:** Estoque = 0 + tentativa de compra → botão desabilitado no storefront. Estoque insuficiente (2 itens restantes, cliente compra 5) → sistema permite mas avisa que estoque ficará negativo (ou bloqueia — decidir na implementação). Dois pedidos simultâneos para o último item → controle de concorrência via transação no banco.
- **Impacto no existente:** Componente `AddToCartButton` precisa verificar estoque antes de permitir adição. `ProductCard` pode mostrar badge "Esgotado". Contexto do carrinho pode precisar validar estoque antes do checkout.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado estoque = 2 e mínimo = 3 When admin visualiza listagem Then vê alerta vermelho no produto
  - Dado estoque = 0 When visitante vê produto Then vê "Esgotado" e botão desabilitado
  - Dado pedido confirmado com pagamento When sistema processa Then estoque decrementa
  - Dado pagamento cancelado When sistema processa Then estoque é devolvido
- **Definição de pronto:** Estoque configurável, alerta visual funcionando, decremento automático em vendas, bloqueio quando esgotado.
- **Dependências:** Spec 04 — produto com campo estoque; Spec 07 (parcial) — lógica de confirmação de pagamento para decremento.
- **Fora do escopo desta spec:** Histórico de movimentação de estoque. Previsão de reposição. Notificações automáticas por email.

### Spec 07 — Persistência de pedidos no banco de dados

- **Fase:** Fase 2 — Pedidos e financeiro
- **Objetivo (o quê):** Quando o cliente finaliza o checkout, o pedido é salvo no banco de dados com todos os detalhes (itens, valores, frete, pagamento, status), ao invés de apenas limpar o carrinho.
- **Intenção (por quê):** Sem persistir pedidos, não existe controle financeiro, nem gestão de entregas, nem estatísticas. Esta spec conecta o checkout existente ao banco de dados.
- **Contexto:** O checkout atual (Spec 07 do PRD original) limpa o carrinho e mostra confirmação mas não grava nada. As tabelas `orders` e `order_items` foram criadas na Spec 01. A autenticação já funciona (Spec 05 do PRD original). O cliente precisa estar logado para finalizar.
- **Atores:** Cliente (finaliza compra), sistema (persiste pedido).
- **Descrição do comportamento:** Ao clicar "Confirmar pedido" no checkout, o sistema: (1) valida que o usuário está autenticado e tem perfil completo (endereço + CPF); (2) calcula frete com base no CEP informado; (3) cria registro na tabela `orders` com: usuario_id, data_atual, subtotal, frete_valor, frete_cep, frete_prazo, meio_pagamento, status_pagamento (pendente para todos inicialmente); (4) cria registros em `order_items` para cada item do carrinho, com produto_id, quantidade e preço_unitário; (5) decrementa estoque dos produtos (se aplicável); (6) retorna ID do pedido para tela de confirmação. Para PIX: gera payload do Asaas (placeholder por enquanto). Para cartão: processa via Asaas (placeholder). Para "Pagar na Entrega": status_pagamento = "a-receber".
- **Entradas e saídas:** Entrada: carrinho + CEP + meio pagamento + sessão do usuário. Saída: pedido criado no banco com status correto, estoque decrementado.
- **Dados/entidades envolvidos (conceitual):** pedido: usuario_id, data, subtotal, frete_valor, frete_cep, frete_prazo, meio_pagamento, status_pagamento, status_envio, total. item_pedido: pedido_id, produto_id, quantidade, preço_unitário.
- **Estados e transições:** Criado (status_pagamento = pendente) → Pago (pagamento confirmado) ou A Receber (entrega) ou Cancelado (pagamento expirado/recusado). Estoque é decrementado ao confirmar pagamento.
- **Regras de negócio:** Preço unitário no pedido é o preço no momento da compra (não o preço atual do produto). Pedido sem pagamento confirmado em 24h é marcado como "atrasado" no admin. Estoque é decrementado apenas ao confirmar pagamento, não ao criar pedido.
- **Validações:** Usuário autenticado com perfil completo. Carrinho não vazio. CEP válido. Meio pagamento válido. Valores consistentes com carrinho + frete.
- **Fluxo do usuário (passo a passo):**
  1. Cliente no checkout clica "Confirmar pedido"
  2. Sistema valida dados + autenticação
  3. Sistema cria pedido + itens no banco
  4. Sistema decrementa estoque (se pagamento confirmado)
  5. Tela mostra confirmação com número do pedido
- **Casos de borda e erros:** Estoque insuficiente durante criação → impede pedido com mensagem. Usuário não logado → redireciona para login antes de confirmar. Perfil incompleto → redireciona para `/perfil`. Erro no Asaas → pedido fica pendente, cliente pode tentar novamente. Carrinho vazio → redireciona para home.
- **Impacto no existente:** Modifica `checkout-content.tsx` para criar pedido no banco ao invés de apenas limpar carrinho. Adiciona Server Action para criar pedido. Mantém tela de confirmação existente mas com dados do pedido real.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado cliente logado com carrinho When clica "Confirmar pedido" Then pedido aparece no banco com dados corretos
  - Dado pedido criado When查看 admin Then vê o pedido na listagem
  - Dado pagamento PIX When pedido é criado Then status = "pendente"
  - Dado "Pagar na Entrega" When pedido é criado Then status = "a-receber"
  - Dado estoque = 3 e cliente compra 2 When pedido é confirmado Then estoque = 1
- **Definição de pronto:** Checkout persiste pedidos no banco, estoque é gerenciado, tela de confirmação mostra dados reais do pedido.
- **Dependências:** Spec 01 — tabelas orders/order_items; Spec 06 (parcial) — lógica de estoque.
- **Fora do escopo desta spec:** Integração real com Asaas (já existente no PRD original, não é re-implementada aqui). Dashboard admin (Spec 09). Gestão de entregas (Spec 11).

### Spec 08 — Lista e detalhe de pedidos no admin

- **Fase:** Fase 2 — Pedidos e financeiro
- **Objetivo (o quê):** Tela de listagem de todos os pedidos com filtros e tela de detalhe completo de cada pedido.
- **Intenção (por quê):** O admin precisa ver todos os pedidos, filtrar por status/periodo, e acessar o detalhe para tomar ações (marcar como enviado, ver pagamento).
- **Contexto:** Pedidos são persistidos no banco pela Spec 07. A tabela `orders` contém dados do pedido; `order_items` contém os itens. O admin já tem acesso protegido (Spec 02).
- **Atores:** Admin (dono da loja).
- **Descrição do comportamento:**
  - **Listagem:** Tabela com: número do pedido (#), data, nome do cliente (via profiles), valor total, status pagamento (badge: pendente/amarelo, pago/verde, expirado/vermelho, a-receber/azul), status envio (badge: pendente/cinza, enviado/azul, entregue/verde). Filtros: período (date range), status pagamento, status envio. Busca por nome ou CPF do cliente. Ordenação por data (mais recente primeiro) ou valor.
  - **Detalhe:** Ao clicar no pedido, exibe: dados do cliente (nome, email, CPF, endereço completo), lista de itens (nome produto, quantidade, preço unitário, subtotal), resumo de valores (subtotal, frete, total), meio de pagamento e status, dados de frete (CEP, valor, prazo estimado), status de envio com botão para alterar (ver Spec 11), código de rastreio (se informado), timeline/histórico de mudanças de status.
- **Entradas e saídas:** Entrada: filtros de busca. Saída: listagem paginada de pedidos, detalhe completo.
- **Dados/entidades envolvidos (conceitual):** pedido completo: dados do pedido + itens + dados do cliente + status + histórico.
- **Estados e transições:** Pedidos passam por status de pagamento e envio conforme ações do cliente e admin.
- **Regras de negócio:** Pedido com pagamento pendente há mais de 24h deve ter badge diferenciado "Atrasado". Admin pode cancelar pedido com pagamento pendente. Apenas pedido com pagamento confirmado pode ser marcado como enviado.
- **Validações:** Filtro de período: data início ≤ data fim. Busca: aceitaCPF formatado ou não.
- **Fluxo do usuário (passo a passo):**
  1. Admin clica "Pedidos" na sidebar
  2. Vê listagem com filtros
  3. Filtra por período e status
  4. Clica num pedido → vê detalhe completo
  5. Pode cancelar (se pendente) ou marcar como enviado (se pago)
- **Casos de borda e erros:** Nenhum pedido no período → mensagem "Nenhum pedido encontrado". Pedido com erro de dados → exibe o que tem com aviso. Busca sem resultado → mensagem amigável.
- **Impacto no existente:** Nenhum componente público é alterado. Adiciona rotas no admin.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado admin logado When clica "Pedidos" Then vê listagem com todos os pedidos
  - Dado filtro período When seleciona "Últimos 7 dias" Then vê apenas pedidos dos últimos 7 dias
  - Dado pedido pendente há 25h When vê listagem Then vê badge "Atrasado"
  - Dado pedido pago When clica Then vê detalhe com itens, valores, endereço
- **Definição de pronto:** Listagem com filtros funcionando, detalhe completo, badges de status, timeline de histórico.
- **Dependências:** Spec 07 — pedidos persistidos no banco.
- **Fora do escopo desta spec:** Exportação (Spec 09), gestão de envios (Spec 11).

### Spec 09 — Dashboard financeiro e exportação CSV/PDF

- **Fase:** Fase 2 — Pedidos e financeiro
- **Objetivo (o quê):** Dashboard com métricas financeiras e botões de exportação de relatórios em CSV e PDF.
- **Intenção (por quê):** O dono precisa de uma visão rápida do faturamento e pedidos para tomar decisões. Exportar permite análise externa ou envio para contador.
- **Contexto:** Pedidos são persistidos (Spec 07). A tabela `orders` tem todos os dados necessários. O admin tem acesso protegido (Spec 02).
- **Atores:** Admin (dono da loja).
- **Descrição do comportamento:**
  - **Dashboard:** Cards no topo: faturamento do mês corrente, ticket médio (faturamento ÷ pedidos pagos), pedidos pendentes de pagamento, pedidos pendentes de envio. Abaixo: gráfico de barras mostrando faturamento diário dos últimos 30 dias (ou período selecionável). Tabela de "Últimos 5 pedidos" com resumo rápido.
  - **Exportação:** Botão "Exportar CSV" gera arquivo com todos os pedidos do período filtrado (colunas: número, data, cliente, CPF, itens, subtotal, frete, total, pagamento, status). Botão "Exportar PDF" gera relatório formatado com cabeçalho Roldan Marcenaria, período, resumo de totais, e tabela de pedidos.
- **Entradas e saídas:** Entrada: período selecionado (padrão: mês corrente). Saída: métricas calculadas, gráfico, arquivo CSV/PDF para download.
- **Dados/entidades envolvidos (conceitual):** faturamento: soma de totais de pedidos pagos no período. ticket médio: faturamento ÷ quantidade de pedidos pagos. pedidos: contagem por status.
- **Estados e transições:** Não se aplica (visualização).
- **Regras de negócio:** Apenas pedidos com status pagamento "pago" ou "a-receber concluído" contam para faturamento. Pedidos "pendente" ou "expirado" não entram no cálculo. Ticket médio = faturamento ÷ pedidos pagos. Período padrão: primeiro dia do mês até hoje.
- **Validações:** Período: data início ≤ data fim. Máximo 365 dias de período para exportação.
- **Fluxo do usuário (passo a passo):**
  1. Admin clica "Financeiro" na sidebar
  2. Vê cards com métricas do mês
  3. Interage com gráfico (muda período se desejar)
  4. Clica "Exportar CSV" → arquivo baixa
  5. Clica "Exportar PDF" → arquivo PDF é gerado e baixa
- **Casos de borda e erros:** Nenhum pedido no período → métricas zeradas, gráfico vazio, mensagem "Nenhum pedido no período". Exportação com muitos dados (>1000 pedidos) → aviso de que pode demorar. PDF com muitas páginas → gera todas (não trunca).
- **Impacto no existente:** Nenhum componente público é alterado. Adiciona página no admin.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado admin logado When acessa financeiro Then vê cards com faturamento, ticket médio, pedidos pendentes
  - Dado pedidos pagos no mês When vê gráfico Then barras refletem faturamento diário
  - Dado período selecionado When clica "Exportar CSV" Then arquivo CSV baixa com dados corretos
  - Dado período selecionado When clica "Exportar PDF" Then PDF formatado baixa com cabeçalho e tabela
- **Definição de pronto:** Dashboard com métricas e gráfico funcionando, exportação CSV e PDF gerando arquivos corretos.
- **Dependências:** Spec 07 — pedidos persistidos no banco.
- **Fora do escopo desta spec:** Gráficos avançados (PIE charts, funil). Exportação agendada (automática por email). Comparativos entre períodos.

### Spec 10 — Estatísticas de vendas (por período, top produtos, clientes recorrentes)

- **Fase:** Fase 3 — Estatísticas
- **Objetivo (o quê):** Página de estatísticas com três visões: vendas por período (gráfico de linha), produtos mais vendidos (tabela ranqueada), e clientes recorrentes (lista com contagem de compras).
- **Intenção (por quê):** Estatísticas ajudam o dono a entender tendências, quais produtos giram mais e a fidelidade dos clientes. Informações que orientam decisões de estoque, marketing e precificação.
- **Contexto:** Pedidos persistidos com itens (Spec 07). A tabela `orders` tem data, usuario_id, total; `order_items` tem produto_id, quantidade. Perfil do cliente está na tabela `profiles`.
- **Atores:** Admin (dono da loja).
- **Descrição do comportamento:**
  - **Vendas por período:** Gráfico de linha mostrando faturamento diário/semanal (conforme zoom) ao longo do tempo. Período selecionável (últimos 7/30/90 dias ou intervalo customizado). Hover nos pontos mostra valor exato.
  - **Top produtos:** Tabela ranqueada com: posição (#), nome do produto, quantidade total vendida, faturamento total gerado. Top 10 por padrão, com opção de ver todos. Filtrável por período.
  - **Clientes recorrentes:** Lista de clientes que compraram mais de uma vez, com: nome, email, quantidade de pedidos, valor total gasto, data da última compra. Ordenado por quantidade de pedidos (decrescente).
- **Entradas e saídas:** Entrada: período selecionado. Saída: gráfico de linha, tabela ranqueada, lista de clientes.
- **Dados/entidades envolvidos (conceitual):** vendas: data, valor. produto: quantidade_vendida, faturamento_gerado. cliente: pedidos_count, valor_total, última_compra.
- **Estados e transições:** Não se aplica (visualização).
- **Regras de negócio:** Apenas pedidos pagos entram nas estatísticas. Período padrão: últimos 30 dias. Clientes recorrentes: mínimo 2 pedidos.
- **Validações:** Período: data início ≤ data fim. Sem limite de dados (usa aggregate queries no banco).
- **Fluxo do usuário (passo a passo):**
  1. Admin clica "Estatísticas" na sidebar
  2. Vê gráfico de vendas dos últimos 30 dias
  3. Muda período para "Últimos 90 dias" → gráfico atualiza
  4. Rola para baixo → vê top 10 produtos
  5. Clica "Ver todos" → tabela expande
  6. Rola mais → vê lista de clientes recorrentes
- **Casos de borda e erros:** Nenhum pedido no período → gráfico vazio, tabelas com mensagem "Sem dados". Apenas 1 pedido → gráfico com ponto único. Apenas 1 cliente sem recorrência → lista "Nenhum cliente recorrente ainda".
- **Impacto no existente:** Nenhum componente público é alterado. Adiciona página no admin.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado admin logado When acessa estatísticas Then vê gráfico de vendas por período
  - Dado top 10 When vê tabela Then produtos estão ranqueados por quantidade vendida
  - Dado cliente com 3 pedidos When vê lista recorrentes Then aparece com contagem 3
  - Dado período "Últimos 7 dias" When seleciona Then gráfico e tabelas refletem apenas esse período
- **Definição de pronto:** Três visões de estatísticas funcionando com dados reais, período selecionável, gráficos interativos.
- **Dependências:** Spec 07 — pedidos com itens no banco.
- **Fora do escopo desta spec:** Exportação de estatísticas. Comparativos entre períodos. Estatísticas de conversão (visitantes vs compradores — precisa de analytics externo).

### Spec 11 — Gestão de fretes e entregas no admin

- **Fase:** Fase 4 — Fretes e entregas
- **Objetivo (o quê):** Tela para o admin gerenciar envios de pedidos, registrar código de rastreio, visualizar prazos, e calcular frete por CEP pelo painel.
- **Intenção (por quê):** Controle de entregas é essencial para marcenaria: saber o que precisa enviar, prazos, e atualizar o cliente com rastreio. Cálculo pelo admin permite simular frete para orientar cliente por WhatsApp.
- **Contexto:** Pedidos persistidos (Spec 07) com status_envio e dados de frete. A lista de pedidos (Spec 08) já mostra status de envio.
- **Atores:** Admin (dono da loja).
- **Descrição do comportamento:**
  - **Lista de envios:** Tabela filtrável com: pedido #, cliente, CEP destino, valor frete, prazo estimado, status envio (pendente/enviado/entregue). Filtro "Pendentes de envio" como default. Pedidos atrasados (prazo expirado) destacados.
  - **Marcar como enviado:** Ao clicar "Enviar" no pedido, abre formulário: transportadora (input texto livre), código de rastreio (input, opcional), data de envio (date picker, padrão hoje), observações (textarea opcional). Ao salvar: status_envio = enviado, data_envio registrada. O cliente poderia receber notificação (fora do escopo agora).
  - **Marcar como entregue:** Botão "Confirmar entrega" (apenas para pedidos já enviados). Atualiza status_envio = entregue com data.
  - **Calculadora de frete admin:** Formulário separado: input CEP destino, seleção de múltiplos produtos (com quantidades), botão "Calcular". Exibe: valor do frete e prazo estimado (usando mesma lógica do carrinho público). Histórico das últimas 10 simulações (localStorage do admin).
- **Entradas e saídas:** Entrada: CEP, transportadora, rastreio, data. Saída: pedido atualizado, frete calculado.
- **Dados/entidades envolvidos (conceitual):** envio: transportadora, código_rastreio, data_envio, data_entrega, observações.
- **Estados e transições:** Pendente → Enviado (com dados de envio) → Entregue (confirmação). Transição inversa não permitida.
- **Regras de negócio:** Apenas pedidos com pagamento confirmado (pago ou a-receber) podem ser marcados como enviados. Rastreio é opcional mas recomendado. Transportadora é texto livre (sem integração). Não pode marcar como entregue sem antes ter marcado como enviado. Cálculo de frete admin usa mesma lógica do carrinho público.
- **Validações:** Transportadora: obrigatória ao marcar como enviado. Código rastreio: opcional, aceita qualquer formato. Data envio: não pode ser futura.
- **Fluxo do usuário (passo a passo):**
  1. Admin clica "Entregas" na sidebar
  2. Vê lista de pedidos pendentes de envio
  3. Clica "Enviar" → preenche transportadora + rastreio → confirma
  4. Pedido sai da lista de pendentes
  5. Para calcular frete: clica "Calculadora" → informa CEP + seleciona produtos → vê resultado
- **Casos de borda e erros:** Tentar enviar pedido com pagamento pendente → botão desabilitado com tooltip "Aguardando pagamento". CEP inválido na calculadora → erro claro. Transportadora em branco ao enviar → validação impede. Dois admins ao mesmo tempo (futuro) → controle de concorrência via optimistic locking (não crítico agora).
- **Impacto no existente:** Não altera componentes públicos. Adiciona página no admin e Server Actions para atualizar status de envio.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado admin logado When clica "Entregas" Then vê lista de pedidos pendentes
  - Dado pedido pago When clica "Enviar" Then preenche dados e status muda para enviado
  - Dado pedido enviado When clica "Confirmar entrega" Then status muda para entregue
  - Dado CEP + produtos When usa calculadora Then vê valor e prazo do frete
  - Dado pedido com pagamento pendente When vê botão enviar Then botão está desabilitado
- **Definição de pronto:** Gestão de envios funcional com status, rastreio, e calculadora de frete integrada.
- **Dependências:** Spec 07 — pedidos no banco; Spec 08 — visualização de pedidos; Spec 01 — lógica de frete existente.
- **Fora do escopo desta spec:** Integração com API dos Correios para etiquetas. Notificação ao cliente por email/SMS. Rastreio automático de encomendas. Múltiplas transportadoras com cotação.

## 14. Ordem recomendada de implementação

1. Spec 01 — Schema do banco e migração de produtos (base de tudo)
2. Spec 02 — Proteção de acesso admin (segurança antes de funcionalidade)
3. Spec 03 — Gerenciamento de categorias (dependência para produtos)
4. Spec 04 — CRUD de produtos (feature central do admin)
5. Spec 05 — Upload de imagens (extensão do CRUD)
6. Spec 06 — Controle de estoque (complemento do CRUD)
7. Spec 07 — Persistência de pedidos (habilita financeiro e entregas)
8. Spec 08 — Lista e detalhe de pedidos (visualização dos dados)
9. Spec 09 — Dashboard financeiro e exportação (métricas e relatórios)
10. Spec 10 — Estatísticas (insights de vendas)
11. Spec 11 — Gestão de fretes e entregas (operação diária)

Seguir a ordem evita criar funcionalidades que dependem de dados inexistentes. A Spec 01 é dependente de todas as outras. As Specs 03-06 podem ser implementadas em paralelo após Spec 01-02, mas a ordem acima prioriza o que gera mais valor primeiro. Specs 07-11 dependem de Spec 01 mas são independentes entre si (podem ser reordenadas conforme prioridade do dono).
