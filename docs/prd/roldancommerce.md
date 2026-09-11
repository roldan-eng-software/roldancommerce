# PRD — E-commerce Roldan Marcenaria

> Tipo: PRD inicial · Data: 2026-09-11
> **Status:** Aguardando implementação
>
> <!-- Valores possíveis: "Aguardando implementação" | "Implementada". Atualize para "Implementada" quando todas as specs estiverem concluídas. -->

## 1. Visão geral

E-commerce próprio da Roldan Marcenaria (São Carlos/SP) para vender móveis e itens decorativos de pequeno porte fabricados 100% em MDF revestido (branco, madeirado ou colorido, conforme estoque da oficina). Produtos simples de fabricar e despachar, com foco em pronta-entrega local e expansão nacional via Correios.

## 2. Problema que resolve

A Roldan vende hoje móveis planejados sob encomenda, sem canal digital para giro rápido. Pequenas peças de marcenaria (nichos, prateleiras, suportes, caixas) têm demanda recorrente mas dependem de atendimento manual via WhatsApp/boca-a-boca. Isso limita alcance, dificulta mostrar catálogo, calcular frete e receber pagamento online.

## 3. Público-alvo

- Moradores de São Carlos/SP que querem móveis pequenos baratos com frete grátis e entrega rápida (principal).
- Compradores de todo o Brasil interessados em organização/decoração em MDF (nichos, prateleiras, suportes para Air Fryer/micro-ondas/monitor, porta-bíblia, etc.).
- Não é para: lojistas atacadistas, móveis grandes planejados (guarda-roupas, cozinhas completas).

## 4. Objetivo do recorte atual

Lançar loja funcional com catálogo inicial de ~21 itens, homepage com grid de 12 + ampliação rápida, página de produto com cross-sell, cadastro email/Google + CPF/endereço, carrinho com frete (grátis São Carlos / Correios nacional), prazos 1/5/10 dias e checkout Asaas (cartão + PIX, mais "Pagar na Entrega" em São Carlos).

## 5. Funcionalidades

**Essenciais:**

- Homepage com Hero + grid de até 12 cards + paginação/carregar mais
- Ampliação rápida do produto no centro da tela ao clicar no card
- Página de detalhamento (medidas, cor MDF, manual, disponibilidade)
- Cross-selling "Compre junto com... e economize no frete"
- Cadastro tradicional (email/senha) + login Google, coleta de endereço via CEP + CPF
- Carrinho com cálculo de frete visível abaixo do preço após CEP
- Checkout simplificado: pagamento só na última etapa ao clicar "Comprar"
- Pagamento Asaas: cartão + PIX nacional; "Pagar na Entrega" (cartão/PIX no recebimento) só para São Carlos
- Regras de prazo: pronta-entrega dia seguinte, fabricação até 5 dias, sob medida até 10 dias

**Desejáveis:**

- Busca e filtro por categoria no catálogo
- Avaliação de produto
- Cupons de desconto

## 6. Fora do escopo

- Painel administrativo completo de ERP/estoque (só o mínimo para marcar disponibilidade e sob medida)
- Marketplace, multi-vendedor, afiliados
- App mobile nativo
- Parcelamento customizado, boleto, crediário próprio
- Logística própria com rastreio em tempo real além do prazo Correios
- Chat ao vivo, programa de fidelidade, wishlist avançada

## 7. Regras de negócio

- Regra 1: Endereço em São Carlos/SP = frete grátis sempre; fora = cálculo via API Correios exibido abaixo do preço após CEP.
- Regra 2: Prazo de despacho: pronta-entrega = dia seguinte; padrão indisponível = até 5 dias; sob medida (tampo até 60x90, portas avulsas) = até 10 dias.
- Regra 3: Dados de pagamento só aparecem na última etapa, após confirmação de itens + frete.
- Regra 4: "Pagar na Entrega" aparece exclusivamente para CEP/endereço de São Carlos.
- Regra 5: Usuário só vê seus próprios pedidos, CPF e endereço (isolamento total).
- Regra 6: Homepage exibe no máximo 12 produtos por vez; restante via paginação.
- Regra 7: Todos os produtos são MDF revestido nas cores disponíveis na oficina; cor anunciada deve refletir estoque real.
- Regra 8: Dados sensíveis (CPF, endereço) exigem consentimento LGPD, tráfego seguro e finalidade explícita.

## 8. Fluxos principais

### Fluxo 1 — Descoberta e compra rápida (visitante)

1. Visitante abre homepage, vê Hero + grid de 12 cards
2. Informa CEP (opcional) para ver frete abaixo do preço
3. Clica num card → ampliação central com resumo → clica "ver detalhes" → página completa
4. Vê sugestão "Compre junto com..." e adiciona correlatos
5. Vai ao carrinho, confirma itens + frete, clica "Comprar"
6. Faz login/cadastro (email ou Google), completa endereço + CPF
7. Escolhe pagamento (cartão/PIX ou Pagar na Entrega se São Carlos) e finaliza

### Fluxo 2 — Cadastro

1. Usuário escolhe email/senha ou Google
2. Após auth, sistema pede endereço (autopreenchimento via CEP) + CPF
3. Aceita termo LGPD e salva; segue para checkout ou navegação

### Fluxo 3 — Cálculo de frete

1. Usuário digita CEP no card/home, produto ou carrinho
2. Se São Carlos → mostra "Frete Grátis"
3. Se outro → chama API Correios, mostra valor + prazo abaixo do preço
4. Valor persiste no carrinho até conclusão

## 9. Critérios de aceite

- O usuário consegue ver 12 produtos na home, paginar e ampliar um card no centro sem trocar de página
- O usuário consegue ver detalhe completo e sugestão "Compre junto com... e economize no frete"
- O sistema deve mostrar frete grátis para São Carlos e valor calculado para demais CEPs logo abaixo do preço
- O sistema deve aplicar prazos corretos: 1 dia / 5 dias / 10 dias conforme disponibilidade/tipo
- O sistema só pede pagamento após confirmação de itens + frete
- O sistema oferece cartão + PIX para todo Brasil e "Pagar na Entrega" apenas para São Carlos
- O usuário consegue cadastrar via email/senha ou Google e completar endereço + CPF
- O sistema não deve permitir que um usuário veja pedidos/dados de outro
- Quando CEP inválido ou API de frete falha, o sistema informa erro claro e permite tentar de novo sem perder carrinho

## 10. Stack

Next.js (App Router) + TypeScript + Tailwind em Vercel; Supabase (PostgreSQL + Auth Google/email) com RLS; PrismaORM na persistência; Shadcn UI para base visual; Framer Motion para ampliação/modal; Asaas para PIX/cartão; APIs gratuitas de CEP/frete (ViaCEP/Correios).

## 11. Justificativa da stack

Next.js + Vercel dá SEO (Server Components no catálogo) e performance (Edge Caching, image optimization vital para marcenaria). Supabase entrega auth + banco prontos com RLS para LGPD sem backend separado. Prisma dá tipagem e migrações seguras. Shadcn + Framer Motion resolvem UI acessível e animação de ampliação exigida sem peso. Asaas centraliza PIX/cartão exigido.

## 12. Fases de construção

### Fase 1 — Vitrine

Objetivo: homepage que vende — Hero, grid 12, paginação, ampliação rápida.
Specs:

- Spec 01 — Homepage Hero + grid + paginação
- Spec 02 — Ampliação rápida do card

### Fase 2 — Produto e venda assistida

Objetivo: detalhe que converte + ticket médio via cross-sell.
Specs:

- Spec 03 — Página de detalhamento do produto
- Spec 04 — Cross-selling "Compre junto"

### Fase 3 — Identidade e dados

Objetivo: cadastro sem atrito e conforme LGPD.
Specs:

- Spec 05 — Cadastro, login e dados complementares

### Fase 4 — Compra e logística

Objetivo: carrinho → frete → prazo → pagamento funcionando.
Specs:

- Spec 06 — Carrinho e cálculo de frete
- Spec 07 — Checkout e pagamentos Asaas
- Spec 08 — Prazos de envio por disponibilidade

## 13. Specs funcionais detalhadas

### Spec 01 — Homepage Hero + grid + paginação

- **Fase:** Fase 1 — Vitrine
- **Objetivo (o quê):** Exibir Hero + grade com até 12 produtos e paginação para o restante.
- **Intenção (por quê):** Primeira impressão vende; limite de 12 evita sobrecarga e mantém performance mobile.
- **Contexto:** Nada existe; é a porta de entrada. Base para Spec 02/03/06.
- **Atores:** Visitante (logado ou não).
- **Descrição do comportamento:** Topo tem Hero com destaque. Abaixo, grid de cards pequenos (imagem, nome, preço, frete após CEP). No máximo 12 visíveis. Rodapé do grid tem paginação numérica ou botão carregar +12.
- **Entradas e saídas:** Entrada: página do catálogo, CEP opcional. Saída: grade renderizada, estado de página atual.
- **Dados/entidades envolvidos (conceitual):** produto: nome, imagem, preço, disponibilidade, tipo (padrão/sob medida).
- **Estados e transições:** vazio (sem produtos) → mostra mensagem; parcial (<12) → sem paginação; cheio → paginação ativa.
- **Regras de negócio:** Máximo 12 por vez; ordem prioriza pronta-entrega/destaques.
- **Validações:** Não se aplica além de catálogo publicado.
- **Fluxo do usuário (passo a passo):**
  1. Abre homepage, vê Hero
  2. Rola e vê até 12 cards
  3. Clica paginação/carregar mais para próximos 12
- **Casos de borda e erros:** Catálogo vazio → mensagem amigável; falha de imagem → placeholder; mobile: grid vira lista/carrossel sem quebra.
- **Impacto no existente:** Nenhum (base nova).
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado catálogo com 20 itens Quando abro a home Então vejo no máximo 12 cards + controle de paginação
  - Dado que estou no mobile Quando vejo o grid Então layout não quebra e continua navegável
  - Dado catálogo vazio Quando abro a home Então vejo mensagem de indisponibilidade, não erro
- **Definição de pronto:** Grid 12 + paginação funcionando desktop e mobile, com Hero.
- **Dependências:** Nenhuma
- **Fora do escopo desta spec:** Modal de ampliação (Spec 02), detalhe completo (Spec 03), frete detalhado (Spec 06).

### Spec 02 — Ampliação rápida do card

- **Fase:** Fase 1 — Vitrine
- **Objetivo (o quê):** Ao clicar num card, ampliar o produto no centro da tela com resumo e ações.
- **Intenção (por quê):** Visualização rápida sem sair da vitrine aumenta conversão.
- **Contexto:** Depende do grid da Spec 01. Precede página de detalhe.
- **Atores:** Visitante.
- **Descrição do comportamento:** Clique no card abre sobreposição central com imagem maior, nome, preço, frete (se CEP), disponibilidade/prazo resumido, botões "Adicionar ao carrinho" e "Ver detalhes". Fechar retorna ao grid na mesma posição/página. Animação fluida.
- **Entradas e saídas:** Entrada: clique no card. Saída: modal com resumo + ações.
- **Dados/entidades envolvidos (conceitual):** produto resumido: imagem, nome, preço, disponibilidade, prazo resumido.
- **Estados e transições:** Fechado → aberto → fechado; fundo bloqueado enquanto aberto.
- **Regras de negócio:** Não substitui página de detalhe; deve facilitar decisão rápida.
- **Validações:** Não se aplica.
- **Fluxo do usuário (passo a passo):**
  1. Clica no card
  2. Vê ampliação central
  3. Adiciona ao carrinho ou vai ao detalhe ou fecha
- **Casos de borda e erros:** Clique rápido duplo não abre dois modais; ESC/fundo fecha; mobile ocupa quase tela toda sem vazar.
- **Impacto no existente:** Estende Spec 01, sem quebrar grid.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado grid visível Quando clico num card Então vejo ampliação central com descrição maior
  - Dado modal aberto Quando clico "Ver detalhes" Então vou à página do produto
  - Dado modal aberto Quando fecho Então volto ao mesmo ponto do grid
- **Definição de pronto:** Modal fluido desktop/mobile com adicionar e ver detalhes.
- **Dependências:** Spec 01 — precisa do grid e dados do produto.
- **Fora do escopo desta spec:** Detalhe minucioso (Spec 03), cross-sell completo (Spec 04).

### Spec 03 — Página de detalhamento do produto

- **Fase:** Fase 2 — Produto e venda assistida
- **Objetivo (o quê):** Página com informações minuciosas para decisão segura.
- **Intenção (por quê):** Móvel exige medida, cor, peso/suporte (ex. micro-ondas 20kg/21L) para evitar devolução.
- **Contexto:** Acessada via "Ver detalhes" da home/modal. Base para cross-sell e carrinho.
- **Atores:** Visitante.
- **Descrição do comportamento:** Exibe galeria, nome, preço, frete após CEP, disponibilidade e prazo (1/5/10 dias), medidas, cor MDF, capacidade/suporte quando aplicável, manual/instruções, quantidade e adicionar ao carrinho.
- **Entradas e saídas:** Entrada: produto selecionado + CEP opcional. Saída: decisão de compra.
- **Dados/entidades envolvidos (conceitual):** produto detalhado: medidas, cor MDF, manual, capacidade, disponibilidade, prazo, preço.
- **Estados e transições:** Disponível / necessita fabricação / sob medida → cada um mostra prazo distinto.
- **Regras de negócio:** Prazo exibido conforme estoque/tipo; cor anunciada = estoque oficina.
- **Validações:** Quantidade mínima 1; CEP se informado deve ser válido.
- **Fluxo do usuário (passo a passo):**
  1. Chega do card/modal
  2. Lê medidas, cor, prazo, frete
  3. Escolhe quantidade e adiciona
- **Casos de borda e erros:** Produto inexistente → página não encontrada amigável; sem imagem secundária → mostra principal; sob medida sem medida padrão → indica personalização.
- **Impacto no existente:** Nenhum destrutivo; aprofunda Spec 01/02.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado produto padrão disponível Quando abro detalhe Então vejo prazo "envio dia seguinte" + medidas + cor
  - Dado suporte micro-ondas Quando abro detalhe Então vejo limite 21L/20kg explícito
  - Dado produto inexistente Quando acesso URL Então vejo mensagem amigável, não erro bruto
- **Definição de pronto:** Detalhe completo para os 21 itens iniciais, responsivo.
- **Dependências:** Spec 01 — catálogo base.
- **Fora do escopo desta spec:** Sugestões correlatas (Spec 04), pagamento (Spec 07).

### Spec 04 — Cross-selling "Compre junto"

- **Fase:** Fase 2 — Produto e venda assistida
- **Objetivo (o quê):** Sugerir correlatos com apelo "Compre junto com... e economize no frete".
- **Intenção (por quê):** Aumentar ticket médio diluindo frete, lógica forte para peças pequenas.
- **Contexto:** Dentro da página de detalhe (Spec 03), antes/depois da descrição. Usa carrinho da Spec 06.
- **Atores:** Visitante.
- **Descrição do comportamento:** Área com produtos correlatos (ex. nicho + prateleira, porta-bíblia + caixa bíblia), cada um com adicionar rápido + opção adicionar conjunto. Frase exata de apelo visível. Não bloqueia compra principal.
- **Entradas e saídas:** Entrada: produto atual. Saída: itens extras no carrinho.
- **Dados/entidades envolvidos (conceitual):** relação produto ↔ sugestões; conjunto com soma de preços.
- **Estados e transições:** Com sugestões → exibe; sem correlatos → oculta sem quebrar layout.
- **Regras de negócio:** Sugestão deve ser correlata, não aleatória; frase de apelo obrigatória.
- **Validações:** Não adicionar item indisponível sem aviso de prazo.
- **Fluxo do usuário (passo a passo):**
  1. Lê detalhe
  2. Vê "Compre junto com... e economize no frete"
  3. Adiciona um ou o conjunto ao carrinho
- **Casos de borda e erros:** Sem correlatos → seção oculta; item sugerido esgotado → mostra prazo ou omite.
- **Impacto no existente:** Adiciona seção à Spec 03.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado detalhe de nicho Quando rolo a página Então vejo seção "Compre junto com... e economize no frete" com correlatos
  - Dado que adiciono conjunto Quando vou ao carrinho Então ambos os itens estão lá
- **Definição de pronto:** Sugestões funcionais com frase exata e adição ao carrinho.
- **Dependências:** Spec 03 — página de detalhe; Spec 06 — carrinho (pode mockar antes).
- **Fora do escopo desta spec:** Recomendação por IA/histórico; desconto automático por combo.

### Spec 05 — Cadastro, login e dados complementares

- **Fase:** Fase 3 — Identidade e dados
- **Objetivo (o quê):** Entrar via email/senha ou Google e completar endereço + CPF com consentimento LGPD.
- **Intenção (por quê):** Entrada sem atrito, mas com dados necessários para frete, nota e entrega.
- **Contexto:** Acionado no checkout ou via conta. Fornece endereço para frete São Carlos/Correios.
- **Atores:** Cliente.
- **Descrição do comportamento:** Tela com email/senha + botão Google. Após auth, pede endereço (CEP com autopreenchimento, rua, número, complemento, cidade/UF) + CPF + aceite LGPD. Valida e salva. Sessão mantida.
- **Entradas e saídas:** Entrada: credenciais, CEP, endereço, CPF, consentimento. Saída: conta ativa apta a comprar.
- **Dados/entidades envolvidos (conceitual):** usuário: email, nome; endereço entrega: CEP, logradouro, cidade/UF; documento: CPF; consentimento LGPD.
- **Estados e transições:** Não cadastrado → autenticado → completo (apto a comprar).
- **Regras de negócio:** CPF e endereço obrigatórios para finalizar; um usuário nunca vê dados de outro; tráfego protegido + finalidade explícita.
- **Validações:** Email válido, senha mínima, CPF válido, CEP válido, aceite LGPD obrigatório.
- **Fluxo do usuário (passo a passo):**
  1. Escolhe email/senha ou Google
  2. Preenche endereço (CEP autopreenche) + CPF
  3. Aceita termos e salva
- **Casos de borda e erros:** Email já usado → orienta login; Google cancela → volta sem erro; CPF inválido → erro claro; CEP não encontrado → permite manual.
- **Impacto no existente:** Nenhum; habilita Spec 06/07.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado novo visitante Quando cadastra com email ou Google e completa endereço+CPF Então consegue ir ao pagamento
  - Dado CPF inválido Quando tenta salvar Então sistema impede com mensagem clara
  - Dado usuário A logado Quando tenta acessar pedido de B Então acesso negado
- **Definição de pronto:** Login duplo + coleta validada + isolamento por usuário.
- **Dependências:** Nenhuma (mas é pré-requisito para Spec 07).
- **Fora do escopo desta spec:** Edição avançada de perfil, múltiplos endereços, exclusão de conta automatizada.

### Spec 06 — Carrinho e cálculo de frete

- **Fase:** Fase 4 — Compra e logística
- **Objetivo (o quê):** Carrinho com frete visível abaixo do preço após CEP, grátis São Carlos.
- **Intenção (por quê):** Transparência de frete é decisiva; local precisa ver benefício imediato.
- **Contexto:** Recebe itens de Spec 02/03/04. Alimenta checkout Spec 07 e prazos Spec 08.
- **Atores:** Visitante/Cliente.
- **Descrição do comportamento:** Lista itens (imagem, nome, qtd, preço, prazo resumido), permite alterar/remover. Campo CEP calcula: São Carlos = "Frete Grátis"; demais = valor + prazo Correios exibido abaixo do valor do produto e totalizado. Persiste entre páginas.
- **Entradas e saídas:** Entrada: itens + CEP. Saída: total com frete + prazo estimado.
- **Dados/entidades envolvidos (conceitual):** carrinho: itens, quantidades; frete: origem, destino CEP, valor, prazo.
- **Estados e transições:** Vazio → com itens → com frete calculado → pronto para comprar.
- **Regras de negócio:** Frete grátis restrito a São Carlos; valor exibido de forma clara abaixo do preço.
- **Validações:** Quantidade ≥1; CEP válido antes de calcular.
- **Fluxo do usuário (passo a passo):**
  1. Adiciona itens
  2. Abre carrinho, digita CEP
  3. Vê frete/prazo e clica "Comprar"
- **Casos de borda e erros:** CEP inválido → erro sem limpar carrinho; API frete fora → mensagem + tentar de novo; carrinho vazio → CTA voltar à loja.
- **Impacto no existente:** Nenhum destrutivo.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado CEP São Carlos Quando calculo frete Então vejo "Frete Grátis"
  - Dado CEP outro estado Quando calculo Então vejo valor + prazo abaixo do preço
  - Dado API falha Quando calculo Então vejo erro amigável e carrinho preservado
- **Definição de pronto:** Cálculo correto nos dois casos + persistência + total certo.
- **Dependências:** Spec 01 — produtos; Spec 05 — endereço (para pré-preencher, opcional).
- **Fora do escopo desta spec:** Pagamento em si (Spec 07), prazo de fabricação detalhado (Spec 08).

### Spec 07 — Checkout e pagamentos Asaas

- **Fase:** Fase 4 — Compra e logística
- **Objetivo (o quê):** Cobrar via Asaas com cartão/PIX nacional + "Pagar na Entrega" só São Carlos, pagamento pedido só no clique final.
- **Intenção (por quê):** Checkout tardio reduz abandono; opção local aumenta conversão.
- **Contexto:** Última etapa após Spec 06 com itens + frete confirmados e usuário Spec 05 identificado.
- **Atores:** Cliente.
- **Descrição do comportamento:** Tela resumo (itens, endereço, frete, prazo). Só aqui exibe pagamento. Opções: cartão, PIX (via Asaas); se endereço São Carlos, mostra também "Pagar na Entrega" (cartão/PIX no recebimento). Confirmação gera pedido com status pagamento. PIX gera QR/copia-e-cola; cartão valida e processa; entrega marca como a receber.
- **Entradas e saídas:** Entrada: carrinho fechado, endereço, meio pagamento. Saída: pedido criado + comprovante/QR ou marca "a receber".
- **Dados/entidades envolvidos (conceitual):** pedido: itens, valores, frete, endereço, meio pagamento, status pagamento.
- **Estados e transições:** Aguardando pagamento → pago/aprovado (cartão/PIX) ou a receber (entrega) → prepara despacho.
- **Regras de negócio:** Pagamento só na etapa final; "Pagar na Entrega" só São Carlos; falha não cria pedido pago.
- **Validações:** Itens + frete + endereço + CPF presentes; cartão válido; valor confere com carrinho.
- **Fluxo do usuário (passo a passo):**
  1. Confere resumo
  2. Escolhe cartão/PIX ou Pagar na Entrega (se local)
  3. Conclui e vê confirmação
- **Casos de borda e erros:** Cartão recusado → erro + mantém pedido pendente; PIX expirado → permite gerar novo; troca de endereço tirou São Carlos → esconde Pagar na Entrega.
- **Impacto no existente:** Consome carrinho e cadastro, sem alterá-los.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado carrinho confirmado Quando chego ao checkout Então só agora vejo campos de pagamento
  - Dado endereço fora São Carlos Quando vejo opções Então NÃO vejo "Pagar na Entrega"
  - Dado endereço São Carlos Quando vejo opções Então vejo cartão + PIX + "Pagar na Entrega"
  - Dado pagamento PIX aprovado Quando concluo Então pedido fica pago e mostra confirmação
- **Definição de pronto:** Os três meios funcionando com Asaas + regra São Carlos + confirmação clara.
- **Dependências:** Spec 05 — usuário/endereço; Spec 06 — carrinho + frete.
- **Fora do escopo desta spec:** Parcelamento avançado, reembolso automático, nota fiscal.

### Spec 08 — Prazos de envio por disponibilidade

- **Fase:** Fase 4 — Compra e logística
- **Objetivo (o quê):** Exibir e cumprir prazos: dia seguinte, até 5 dias, até 10 dias sob medida.
- **Intenção (por quê):** Alinhar expectativa evita reclamação; marcenaria precisa de margem para fabricar.
- **Contexto:** Transversal a card, detalhe, carrinho e confirmação. Depende de disponibilidade cadastrada.
- **Atores:** Cliente + lojista (que marca disponibilidade).
- **Descrição do comportamento:** Cada produto tem condição: pronta-entrega, necessita fabricação, sob medida. Sistema exibe prazo correspondente em todos os pontos e soma corretamente quando carrinho misto (mostra maior prazo + indica qual item demora).
- **Entradas e saídas:** Entrada: disponibilidade do item. Saída: texto de prazo + data estimada de despacho.
- **Dados/entidades envolvidos (conceitual):** disponibilidade: pronta-entrega / fabricar / sob medida; prazo despacho.
- **Estados e transições:** Disponível → dia seguinte; indisponível → até 5 dias; sob medida → até 10 dias.
- **Regras de negócio:** Tabela oficial: padrão disponível = dia seguinte; padrão indisponível = até 5 dias; sob medida = até 10 dias.
- **Validações:** Produto sem disponibilidade definida não pode ser vendido como pronta-entrega.
- **Fluxo do usuário (passo a passo):**
  1. Vê prazo no card/modal/detalhe
  2. Confirma no carrinho/checkout
  3. Recebe confirmação com prazo final
- **Casos de borda e erros:** Carrinho misto → exibe maior prazo com destaque; mudança de estoque entre adição e compra → avisa novo prazo antes de pagar.
- **Impacto no existente:** Enriquece Spec 01/03/06/07 sem quebrar.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado item pronta-entrega Quando vejo produto/carrinho Então vejo "envio no dia seguinte"
  - Dado item que precisa fabricar Quando vejo Então vejo "até 5 dias"
  - Dado tampo sob medida Quando vejo Então vejo "até 10 dias"
- **Definição de pronto:** Prazos corretos em vitrine, carrinho e confirmação, incluindo carrinho misto.
- **Dependências:** Spec 01 — listagem; Spec 06 — carrinho.
- **Fora do escopo desta spec:** Rastreio Correios em tempo real, cálculo de data com feriados.

## 14. Ordem recomendada de implementação

1. Spec 01 — Homepage Hero + grid + paginação (base de tudo)
2. Spec 02 — Ampliação rápida do card (conversão na vitrine)
3. Spec 03 — Página de detalhamento do produto (confiança)
4. Spec 04 — Cross-selling "Compre junto" (ticket médio)
5. Spec 05 — Cadastro, login e dados complementares (pré-requisito checkout)
6. Spec 06 — Carrinho e cálculo de frete (fecha valor)
7. Spec 08 — Prazos de envio por disponibilidade (prazo precisa aparecer junto do frete)
8. Spec 07 — Checkout e pagamentos Asaas (finaliza dinheiro)

Seguir a ordem evita implementar checkout sem usuário/frete e evita cross-sell sem detalhe. Cada spec só faz sentido com as anteriores prontas.
