-- Conteúdo do Módulo 1 — Fundamentos (geral, pré-requisito de todos os nichos).
--
-- O conteúdo mora no banco (e não no código) porque quem vai revisar e evoluir
-- essas aulas é a operação, não o desenvolvimento — e mudar texto de aula não
-- pode exigir deploy.

INSERT INTO public.courses (slug, category, title, subtitle, description, emoji, position, pass_score)
VALUES (
  'fundamentos',
  NULL,
  'Fundamentos do Indicador',
  'Obrigatório • libera a escolha do seu primeiro nicho',
  'Como a plataforma funciona, como abordar um cliente sem ser invasivo e os limites do seu papel. Este módulo é pré-requisito para qualquer nicho.',
  '🎓',
  0,
  70
);

-- ---------------------------------------------------------
-- Aulas
-- ---------------------------------------------------------
INSERT INTO public.course_lessons (course_id, position, title, summary, content, duration_min)
SELECT c.id, v.position, v.title, v.summary, v.content, v.duration_min
FROM public.courses c,
(VALUES
(1,
 'Como você ganha na IndiqueLeads',
 'O modelo de comissão, os dois eventos que pagam e quando o dinheiro cai.',
 E'## Você é uma ponte, não um vendedor\n\nSeu trabalho é conectar alguém que **já tem interesse** a um anunciante que tem o produto. Quem negocia preço, condição e fecha contrato é a loja. Isso não diminui seu papel — é o que o torna possível: você não precisa dominar técnica de venda nem ter estoque.\n\n## Os dois eventos que pagam\n\n**1. Comissão por indicação qualificada**\nPaga quando o cliente que você indicou comparece e o anunciante confirma a visita. Repare: não é quando você manda o link, nem quando o cliente agenda. É quando a visita **acontece de verdade** e o anunciante confirma.\n\n**2. Comissão por venda**\nPaga quando o negócio fecha. Costuma ser bem maior que a de indicação, e as duas somam — o mesmo cliente pode gerar as duas.\n\nHá ainda a venda por **financiamento**: se você conduz uma simulação de crédito com o anunciante e o contrato é assinado, você recebe a comissão de venda daquele produto.\n\n## Por que o anunciante é quem confirma\n\nEm todos os casos, quem aperta o botão que libera dinheiro é o anunciante. Isso protege você também: significa que existe um registro auditável de cada etapa, e ninguém pode dizer depois que a indicação não foi sua.\n\n## Quando o dinheiro cai\n\nA comissão aparece na sua carteira com um status:\n\n- **Pendente** — o evento aconteceu, falta o anunciante confirmar\n- **Liberada** — confirmada, aguardando o repasse\n- **Paga** — o PIX foi feito e registrado\n\nO pagamento é por PIX, na chave que você cadastrou. Confira que ela está correta: chave errada é o motivo mais comum de comissão atrasada.',
 6),

(2,
 'O limite do seu papel',
 'O que você pode dizer, o que precisa deixar para a loja e por que isso te protege.',
 E'## A regra que resume tudo\n\n> Informe o que é público. Encaminhe o que é negociação.\n\n## Você PODE\n\n- Descrever o produto com base no que está no anúncio\n- Falar da sua experiência real, se você tiver uma\n- Explicar como funciona a visita e o que a pessoa precisa levar\n- Tirar dúvidas simples de característica (cor, ano, metragem, localização)\n\n## Você NÃO pode\n\n- **Prometer preço ou desconto.** Só a loja negocia. "Consigo por X" é uma promessa que você não pode cumprir.\n- **Garantir aprovação de crédito.** Quem aprova é o banco. Dizer "seu crédito passa" cria uma expectativa que não é sua para dar.\n- **Inventar característica.** Se não sabe, diga que não sabe e pergunte à loja.\n- **Falar em nome da loja.** Você indica; você não é funcionário dela.\n\n## Por que isso te protege\n\nUma promessa não cumprida vira frustração, e frustração vira negócio perdido — sem venda, sem comissão. Pior: o anunciante deixa de confiar nas suas indicações, e sua reputação na plataforma cai.\n\nDizer "boa pergunta, vou confirmar com a loja e te retorno" **aumenta** sua credibilidade. Ninguém espera que você saiba tudo. Esperam que você seja honesto.',
 6),

(3,
 'Abordagem: como falar sem perturbar',
 'Frequência, horário, canal e o momento de parar.',
 E'## O erro mais caro é insistir\n\nA diferença entre um indicador que fatura e um que é bloqueado quase sempre está aqui. Bem de alto valor tem ciclo longo: quem compra um imóvel ou um carro pensa por semanas. Pressa gera fuga.\n\n## Regras práticas\n\n**Horário.** Das 9h às 20h em dias úteis; sábado até 13h. Nunca domingo ou feriado, a não ser que a pessoa tenha pedido.\n\n**Frequência.** Depois do primeiro contato, no máximo **dois follow-ups**. Se não houver resposta, pare. Não é um "não" para sempre — deixe a porta aberta: *"Fico à disposição. Se mudar de ideia, é só me chamar."*\n\n**Canal.** Use o mesmo canal onde a pessoa te respondeu. Se ela responde no WhatsApp, não ligue.\n\n**Nunca** mande o mesmo texto repetido, nem áudios longos sem ser convidado.\n\n## O que fazer quando o cliente some\n\nSumiço é resposta. Um único follow-up leve depois de alguns dias basta:\n\n> "Oi, [nome]! Passando só para saber se ainda faz sentido. Se não for o momento, sem problema — qualquer coisa estou por aqui."\n\nSe não responder, encerre. Insistir a partir daí destrói mais valor do que qualquer venda que você pudesse ganhar.\n\n## Consentimento\n\nSó indique pessoas que demonstraram interesse. Pegar contato de grupo, lista ou terceiros e sair mandando link é spam — e é motivo de suspensão.',
 7),

(4,
 'A conversa: perguntar antes de oferecer',
 'Escuta ativa, perguntas abertas e linguagem sem pressão.',
 E'## Pergunte primeiro\n\nA maior parte das indicações fracassa porque o indicador começa oferecendo. Antes do link, entenda:\n\n- Para que a pessoa quer (morar? investir? trocar? primeiro da família?)\n- Qual a urgência real\n- Se já está olhando outras opções\n- Se pretende financiar\n\nCom essas quatro respostas você indica **o produto certo** — e indicação certa é o que vira visita, que é o que te paga.\n\n## Perguntas abertas funcionam melhor\n\n| Em vez de | Pergunte |\n|---|---|\n| "Você quer comprar?" | "O que te fez começar a procurar agora?" |\n| "Esse serve?" | "O que seria essencial para você?" |\n| "Fechou?" | "O que ainda precisaria ficar claro para você decidir?" |\n\nA da direita abre conversa. A da esquerda fecha em sim/não.\n\n## Linguagem sem pressão\n\nEvite urgência falsa: *"último dia"*, *"só hoje"*, *"vai acabar"*. Em bem de alto valor isso soa golpe e queima sua credibilidade.\n\nTroque por convite: *"Se quiser, dá para ver pessoalmente sem compromisso."*\n\n## Escuta ativa em uma frase\n\nRepita com suas palavras o que a pessoa disse antes de responder:\n\n> "Então o que pesa mais para você é a localização, mais do que o tamanho — é isso?"\n\nIsso faz a pessoa se sentir ouvida e evita que você indique a coisa errada.',
 7),

(5,
 'Dados do cliente e LGPD',
 'O que você pode coletar, como guardar e o que nunca compartilhar.',
 E'## Você lida com dado pessoal\n\nNome, telefone, e-mail e — em financiamento — CPF, renda e data de nascimento. Isso é dado pessoal protegido pela **LGPD (Lei 13.709/2018)**, e o cuidado é obrigação sua também.\n\n## Regras\n\n**Colete com consentimento.** A pessoa precisa saber que você vai passar os dados dela para a loja. Uma frase resolve: *"Posso encaminhar seu contato para a loja para eles te chamarem?"*\n\n**Colete o mínimo.** Para uma indicação simples, nome e telefone bastam. CPF e renda só quando houver simulação de crédito de fato.\n\n**Guarde na plataforma.** Cadastre o lead no sistema. Não mantenha planilhas paralelas com dados de clientes; é lá que o dado fica protegido e é lá que sua indicação fica registrada.\n\n**Nunca compartilhe** dados de um cliente com outro anunciante, com outro indicador ou em grupo nenhum. Isso é violação de lei, não só de regra interna.\n\n## Documentos\n\nSe precisar de documento para simulação, oriente a pessoa a enviar **direto no chat da plataforma**. Não acumule foto de RG ou CNH no seu celular — se seu aparelho for comprometido, o problema é seu.\n\n## Se a pessoa pedir para apagar\n\nÉ direito dela. Avise a plataforma e o anunciante, e pare o contato imediatamente.',
 6),

(6,
 'Integridade: o que anula sua comissão',
 'Lead fantasma, autoindicação e por que a fraude não compensa.',
 E'## O sistema registra tudo\n\nCada clique, cada lead, cada mudança de status e cada comissão fica gravado com data e origem. O painel administrativo enxerga esse histórico inteiro. Isso existe para proteger o indicador honesto — e detecta quem não é.\n\n## O que é proibido\n\n**Lead fantasma.** Cadastrar nome e telefone inventados para simular indicação. Como a comissão de indicação só é paga quando o anunciante **confirma a visita**, lead falso não gera dinheiro — só gera registro de má-fé no seu histórico.\n\n**Autoindicação.** Indicar você mesmo, cônjuge ou familiar direto para ganhar comissão da própria compra.\n\n**Inflar cliques.** Usar script ou pedir para conhecidos clicarem no link sem interesse real.\n\n**Duplicar cliente.** Cadastrar a mesma pessoa várias vezes para multiplicar comissão. O sistema deduplica por telefone e e-mail.\n\n## Consequências\n\nEm ordem: comissão cancelada → conta suspensa → descredenciamento. Em caso de dano ao anunciante, cabem as medidas legais previstas no contrato de parceria que você assinou.\n\n## O outro lado\n\nQuem indica bem sobe de liga, ganha percentual maior e recebe acesso a mais nichos. O caminho honesto é simplesmente o mais lucrativo aqui — uma única venda de alto ticket paga mais que dezenas de tentativas de burlar o sistema.',
 6),

(7,
 'Usando a plataforma no dia a dia',
 'Link rastreável, funil, chat, "Cheguei na Loja" e carteira.',
 E'## Seu link é sua identidade\n\nCada anúncio gera um link exclusivo seu. É ele que garante que a indicação seja registrada no seu nome — o rastreio dura **60 dias** a partir do clique.\n\nNunca encurte o link com serviços de terceiros: alguns removem o parâmetro de rastreio, e aí a indicação deixa de ser sua.\n\n## Acompanhe pelo funil\n\nO lead caminha por etapas: recebido → contato feito → visita agendada → visita confirmada → proposta → venda. Quem move é o anunciante; você acompanha em tempo real.\n\nSe travar numa etapa por muitos dias, use o chat para perguntar — educadamente. Cobrar o anunciante todo dia tem o mesmo efeito que perturbar o cliente.\n\n## "Cheguei na Loja"\n\nSe você acompanhar o cliente até a loja, aperte esse botão ao chegar. Ele avisa o anunciante, que confirma sua presença. **Essa confirmação é o que libera a comissão de indicação** — e, se você acompanha presencialmente, sua comissão de venda costuma ser bem maior que a de quem só mandou o link.\n\n## Carteira\n\nMostra cada comissão com sua origem e status, e o saldo disponível. Quando o anunciante registra o PIX, o valor aparece como pago com a data e o comprovante.\n\n## Chat\n\nA conversa com o cliente fica registrada na plataforma. Por segurança, o sistema filtra tentativas de trocar contato por fora — isso protege sua comissão de ser contornada.',
 6)
) AS v(position, title, summary, content, duration_min)
WHERE c.slug = 'fundamentos';

-- ---------------------------------------------------------
-- Avaliação — 10 questões, 70% para passar
-- ---------------------------------------------------------
INSERT INTO public.course_questions (course_id, position, question, options, correct_index, explanation)
SELECT c.id, v.position, v.question, v.options, v.correct_index, v.explanation
FROM public.courses c,
(VALUES
(1, 'Quando a comissão por indicação qualificada é paga?',
 ARRAY['Assim que você compartilha o link','Quando o cliente agenda a visita','Quando a visita acontece e o anunciante confirma','Quando o cliente clica no link'],
 2, 'Só a visita confirmada pelo anunciante libera a comissão — agendar não basta.'),

(2, 'Um cliente pergunta se você consegue R$ 5.000 de desconto. O que fazer?',
 ARRAY['Prometer que consegue, para garantir a visita','Dizer que negociação é com a loja e encaminhar','Oferecer um desconto menor por conta própria','Afirmar que o preço nunca tem desconto'],
 1, 'Preço é negociação da loja. Prometer o que não é seu para prometer gera frustração e destrói sua credibilidade.'),

(3, 'O cliente não responde após o primeiro contato. Qual conduta é correta?',
 ARRAY['Mandar mensagem todo dia até responder','Ligar em horários diferentes até conseguir','No máximo dois follow-ups e depois parar, deixando a porta aberta','Procurar a pessoa por outro canal e por conhecidos'],
 2, 'Sumiço é resposta. Insistir queima o contato e pode gerar denúncia por perturbação.'),

(4, 'Qual pergunta abre melhor a conversa?',
 ARRAY['Você vai comprar hoje?','O que te fez começar a procurar agora?','Esse aqui serve para você?','Posso fechar para você?'],
 1, 'Perguntas abertas revelam a real necessidade; perguntas de sim/não encerram a conversa.'),

(5, 'Sobre dados do cliente, é correto afirmar:',
 ARRAY['Guardar fotos de documentos no celular é aceitável','Coletar o mínimo necessário e registrar na plataforma','Compartilhar o contato com outros anunciantes amplia a chance de venda','Pedir CPF logo no primeiro contato agiliza o processo'],
 1, 'A LGPD exige mínimo necessário e finalidade. Documento deve ir pelo chat da plataforma, não pelo seu aparelho.'),

(6, 'Cadastrar clientes fictícios que "agendam visita" é:',
 ARRAY['Aceitável para aquecer o funil','Proibido, e não gera comissão porque a visita nunca é confirmada','Tolerado se for pouco','Uma forma válida de testar o sistema'],
 1, 'Lead fantasma não gera receita e fica registrado como má-fé, levando a suspensão.'),

(7, 'Por quanto tempo seu link mantém o rastreio da indicação?',
 ARRAY['24 horas','7 dias','60 dias','Para sempre'],
 2, 'O cookie de indicação dura 60 dias a partir do clique.'),

(8, 'Para que serve o botão "Cheguei na Loja"?',
 ARRAY['Confirmar sozinho que a visita aconteceu','Sinalizar sua chegada para que o anunciante confirme sua presença','Marcar a venda como concluída','Solicitar o pagamento da comissão'],
 1, 'Você sinaliza; quem confirma é sempre o anunciante. Ninguém valida a própria comissão.'),

(9, 'Qual abordagem é adequada em bens de alto valor?',
 ARRAY['Criar urgência com "só hoje" para acelerar','Convidar para conhecer sem compromisso','Enviar o link para o máximo de pessoas possível','Insistir até obter uma resposta'],
 1, 'Urgência artificial soa golpe em ticket alto. Convite sem pressão converte mais.'),

(10, 'O cliente pergunta algo técnico que você não sabe. O melhor é:',
 ARRAY['Dar um palpite para não parecer despreparado','Dizer que vai confirmar com a loja e retornar','Mudar de assunto','Afirmar que o detalhe não é importante'],
 1, 'Admitir que vai confirmar aumenta a confiança; inventar informação gera frustração na visita.')
) AS v(position, question, options, correct_index, explanation)
WHERE c.slug = 'fundamentos';
