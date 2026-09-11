# **PRD: E-commerce Roldan Marcenaria**

## **1\. Visão Geral do Negócio**

A **Roldan Marcenaria**, localizada na cidade de São Carlos/SP, está expandindo suas operações de móveis planejados para o ambiente digital. O objetivo deste PRD (Product Requirements Document) é definir o plano de negócios e os requisitos de produto para o lançamento de um e-commerce próprio, focado exclusivamente na venda de móveis e itens decorativos de pequeno porte.  
Todos os produtos comercializados na plataforma serão fabricados 100% em MDF revestido (disponíveis nas cores branca, madeirado ou coloridos, de acordo com o estoque da oficina), caracterizando-se por serem simples de fabricar e despachar.

## **2\. Catálogo de Produtos**

O e-commerce iniciará sua operação com as seguintes categorias e itens:

> * Porta celulares  
> * Nicho decorativo de parede  
> * Mesa de cabeceira de cama  
> * Prateleiras de parede  
> * Armários de banheiro com rodízios  
> * Mesa de centro de sala de TV  
> * Porta tablets  
> * Porta bíblias  
> * Caixas para guardar bíblias  
> * Caixas para guardar envelopes de chá  
> * Nicho organizador de chão  
> * Portas avulsas para móveis sob medida  
> * Porta guardanapos de mesa  
> * Suporte de leitura com plano inclinado  
> * Nicho organizador de mesa  
> * Expositor de roupas de parede com tubo cabideiro  
> * Expositor de sapatos e tênis de parede  
> * Prateleira suporte Air Fryer de parede  
> * Prateleira suporte Micro-ondas (até 21L e 20kg)  
> * Tampo MDF multiuso sob medida (até 60 x 90 cm branco)  
> * Suporte para monitor

## **3\. Logística, Frete e Prazos**

A estratégia logística visa privilegiar os clientes locais de São Carlos, ao mesmo tempo que permite escalabilidade nacional integrada aos Correios.

| Localidade do Cliente | Regra de Frete   |
| :---- | :---- |
| São Carlos/SP | **Frete Grátis** |
| Demais Localidades (Brasil) | Cálculo automático via API de CEP dos Correios. *O valor do frete deve ser sugerido de forma clara e visível logo abaixo do valor do produto após o cadastro/consulta de CEP.* |

| Tipo de Produto | Condição de Estoque | Prazo de Envio / Despacho   |
| :---- | :---- | :---- |
| Produto Padrão | Disponível (Pronta-entrega) | Dia seguinte |
| Produto Padrão | Indisponível (Necessita fabricação) | Até 5 dias |
| Produto Sob Medida | N/A | Até 10 dias |

## **4\. Métodos de Pagamento e Checkout**

O processo de finalização de compra (checkout) deve ser simplificado para evitar atritos na conversão.

> * **Momento da Cobrança:** Os dados de pagamento só serão requisitados quando o cliente clicar em "Comprar" na última etapa do carrinho, já com a confirmação de itens e frete final.  
> * **Gateway Integrado:** Asaas.  
> * **Opções Padrão (Todo o Brasil):** Cartão de Crédito e PIX.  
> * **Benefício Exclusivo (São Carlos/SP):** Para endereços cadastrados em São Carlos, o sistema habilitará a opção "Pagar na Entrega" (aceitando Cartão de Crédito ou PIX no ato do recebimento).

## **5\. Cadastro de Clientes, Segurança e LGPD**

> * **Formas de Cadastro:**  
  * Tradicional: E-mail e senha inseridos diretamente na tela.  
  * Autenticação Rápida: Login automático via Google.  
> * **Coleta de Dados Complementares:** Após o login, será requisitado o Endereço de Entrega (integrado via API de CEP) e o CPF do cliente.  
> * **Conformidade e Segurança (LGPD):** Todos os dados pessoais sensíveis exigidos dos usuários deverão estar protegidos por segurança verificada (certificados SSL e infraestrutura validada), obedecendo estritamente aos princípios de transparência e consentimento previstos na LGPD.

## **6\. Experiência de Usuário (UX) e Layout (UI)**

### **6.1. Página Inicial (Homepage)**

> * **Seção Hero:** Destaques e apelo visual no topo da página.  
> * **Grid de Produtos:** Abaixo da seção Hero, a vitrine inicial apresentará os produtos acomodados em pequenos "cards". O limite de exibição é de no máximo **12 produtos visíveis simultaneamente na tela**.  
> * **Paginação:** No rodapé da grade de produtos, haverá um controle de paginação numérico ou botão para carregar novos catálogos (próximos 12 itens).  
> * **Interação com Produtos (Ampliação):** Ao clicar em um pequeno card na página inicial, o produto deve ser ampliado automaticamente no centro da tela, exibindo as descrições maiores e facilitando a visualização rápida pelo usuário.

### **6.2. Navegação e Interatividade de Vendas**

> * **Detalhamento Estendido:** Quando o usuário clicar definitivamente na imagem ou título para avançar para a página do produto, o sistema o conduzirá para uma seção com informações minuciosas do item (medidas, cor do MDF, manual, etc).  
> * **Cross-Selling ("Compre junto com..."):** Na mesma seção de leitura do detalhamento, a interface deve imperativamente apresentar uma área de sugestões inteligentes, incentivando o cliente a adicionar mais produtos correlatos ao carrinho, utilizando o forte apelo da frase: **"Compre junto com... e economize no frete"**.

## **7\. Stack Tecnológica e Arquitetura**

A aplicação será desenvolvida utilizando uma arquitetura moderna e escalável, focada em alta performance de front-end, segurança e tipagem estática rigorosa usando TypeScript. As escolhas tecnológicas buscam alinhar máxima performance visual com processos enxutos de banco de dados.

### **7.1. Framework e Hospedagem (Front-end)**

> * **Next.js (App Router):** Atuará como framework principal para todo o fluxo da aplicação. A adoção do App Router permitirá utilizar uma mescla estratégica entre *Server Components* (potencializando o SEO de todo o catálogo de móveis e leitura rápida do HTML) e *Client Components* nas áreas interativas (como o carrinho e a modulação de produtos).  
> * **Vercel & React Best Practices:** O projeto será hospedado na Vercel e adotará padrões otimizados do React. Isso garante a utilização nativa de Edge Caching para o catálogo público, otimização nativa de imagens (vital para o portfólio de marcenaria) e pre-fetching de rotas.

### **7.2. Banco de Dados, Backend e ORM**

> * **Supabase (PostgreSQL):** Será o motor do banco de dados e gestão de identidade (provendo autenticação nativa com Google e senha). Toda a estrutura de permissões seguirá o padrão *supabase-postgres-best-practices*. A implementação de RLS (Row Level Security) limitará rigidamente a visualização, impedindo que um usuário acesse pedidos e os dados (CPF, endereço) de terceiros, estando totalmente alinhado com a LGPD.  
> * **PrismaORM:** Operará na camada de persistência entre a aplicação e o PostgreSQL no Supabase. Facilitará as migrações (como novas tabelas e relacionamentos entre usuários e faturas), entregando segurança contra injeções SQL e aproveitando ao máximo a inferência de tipos.

### **7.3. Interface de Usuário (UI) e Experiência Visual**

> * **Design Responsivo:** Desenvolvido com mentalidade *Mobile First*, garantindo que o sistema de grid de no máximo 12 itens se comporte como lista, carrosel horizontal no celular e expansão simétrica no Desktop, acomodando-se aos dispositivos sem quebras de layout.  
> * **Shadcn UI:** Framework utilitário de componentes base, utilizado para garantir consistência visual limpa e focada (botões de CTA, inputs de formulário, select de carrinho), enquanto provê acessibilidade robusta.  
> * **Framer Motion (Animator):** A biblioteca será a espinha dorsal das animações. O comportamento da página inicial exigido, onde "ao clicar o card pequeno será ampliado no centro da página", será orquestrado nativamente pelo Framer Motion (através do recurso *layoutId* ou animações de modal) garantindo fluidez sem peso excessivo para o navegador.

### **7.4. Pagamentos e Integrações (APIs Externas)**

> * **Asaas Pay:** O SDK ou chamadas diretas à API do Asaas cuidarão do split de recebimentos via PIX ou Cartão de Crédito de forma fluida. Este fluxo acontecerá por meio de chamadas back-end seguras no momento exato em que o usuário fechar o carrinho.  
> * **APIs Externas Gratuitas:** O aplicativo chamará de forma cliente-servidor APIs logísticas abertas (como a API dos Correios, ViaCEP ou equivalentes gratuitos) na inserção do endereço para calcular em tempo real e exibir, sob o valor dos móveis, o custo final e prazo (1 dia, 5 dias ou 10 dias).