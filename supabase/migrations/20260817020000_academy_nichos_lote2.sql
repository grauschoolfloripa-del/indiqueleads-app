-- Módulos de nicho — lote 2: Energia Solar, Saúde, Educação, Seguros.
--
-- Dois deles têm limite legal, e por isso a aula 1 de cada um é sobre o limite,
-- não sobre o produto:
--
--  * Seguros — corretor é profissão regulada e exige registro na SUSEP
--    (Lei 4.594/1964). Cotar, comparar apólice ou orientar cobertura é
--    atividade dele, não do indicador.
--  * Saúde — nenhuma orientação clínica, e dado de saúde é sensível na LGPD.
--    O que o cliente conta sobre a própria doença não circula em WhatsApp.

-- ========================================================= ENERGIA SOLAR ====
INSERT INTO public.courses (slug, category, title, subtitle, description, emoji, position, pass_score)
VALUES (
  'nicho-energia-solar',
  'energia_solar',
  'Nicho: Energia Solar',
  'Libera a vitrine de energia solar',
  'Como funciona a compensação de energia, o que a conta de luz revela e por que prometer conta zero destrói a venda.',
  '☀️',
  6,
  70
);

INSERT INTO public.course_lessons (course_id, position, title, summary, content, duration_min)
SELECT c.id, v.position, v.title, v.summary, v.content, v.duration_min
FROM public.courses c,
(VALUES
(1,
 'O que a energia solar realmente faz',
 'Compensação não é conta zero — e confundir os dois derruba a venda.',
 E'## O sistema não desliga a conta\n\nA maioria das instalações no Brasil é **conectada à rede**. O que o sistema gera durante o dia abate o que a casa consome; o excedente vira crédito na distribuidora e volta nos meses fracos.\n\nMas existe a **taxa mínima de disponibilidade** — o custo de continuar ligado à rede, cobrado mesmo com geração alta. Costuma equivaler a algumas dezenas de quilowatt-hora por mês, variando com o tipo de ligação.\n\n> Traduzindo: a conta cai muito. Ela não zera.\n\n## Por que isso importa mais do que parece\n\nProometer conta zero é o erro que mais gera cancelamento no nicho. A pessoa instala, recebe a primeira fatura com valor, e sente que foi enganada — mesmo tendo economizado 85%.\n\nA frase honesta vende melhor:\n\n> "A conta cai bastante, mas continua vindo uma taxa mínima por estar ligado na rede. A empresa calcula quanto sobra no seu caso."\n\n## Créditos têm validade\n\nO excedente vira crédito com prazo de validade (hoje, 60 meses). Sistema superdimensionado gera crédito que vence sem uso — dinheiro parado no telhado.\n\n## O que você NÃO afirma\n\n- Quanto vai economizar por mês\n- Em quantos anos se paga\n- Que a conta vai zerar\n- Que a regra de compensação não vai mudar\n\nTudo isso depende de projeto, consumo e legislação. É da empresa.',
 8),

(2,
 'A conta de luz diz quase tudo',
 'O documento que transforma conversa em proposta.',
 E'## Peça a conta antes de qualquer coisa\n\nSem ela, ninguém dimensiona nada. E pedir a conta já qualifica o lead: quem manda está interessado de verdade.\n\n## O que olhar\n\n**Consumo em kWh, não o valor em reais.** O valor muda com bandeira tarifária e impostos; o kWh é o que dimensiona o sistema.\n\n**Histórico dos 12 meses.** Está impresso na própria conta. Consumo varia muito com estação — dimensionar por um mês só erra feio.\n\n**Tipo de ligação.** Monofásica, bifásica ou trifásica. Define a taxa mínima e influencia o projeto.\n\n**Titularidade.** O sistema precisa estar no nome de quem tem a conta. Imóvel alugado complica e exige conversa com o proprietário.\n\n**Classe.** Residencial, comercial ou rural — muda tarifa e às vezes o enquadramento.\n\n## Como pedir sem parecer burocracia\n\n> "Me manda uma foto da sua conta de luz? Com ela a empresa calcula exatamente o tamanho do sistema e quanto sobra da sua conta. Sem ela é chute."\n\n## O que NÃO fazer com a conta\n\nÉ um documento com nome, endereço e número de instalação. Encaminhe pelo canal da plataforma, não por grupos ou conversas paralelas.',
 8),

(3,
 'Telhado, sombra e estrutura',
 'O que pode inviabilizar um projeto que parecia fechado.',
 E'## O telhado decide muito\n\n**Orientação.** No Brasil, face voltada ao norte rende mais. Não é eliminatório, mas muda a quantidade de placas.\n\n**Tipo de telha.** Cerâmica, fibrocimento, metálica, laje — cada uma pede uma estrutura diferente, com custo diferente.\n\n**Estado da estrutura.** Telhado velho precisa de reforma antes. Instalar sobre madeira comprometida é problema garantido, e o cliente precisa saber disso antes, não depois.\n\n**Área disponível.** Regra de bolso: cada quilowatt-pico ocupa alguns metros quadrados. Telhado pequeno limita o sistema, independente do consumo.\n\n## Sombreamento é o vilão silencioso\n\nÁrvore, caixa d agua, prédio vizinho, antena. Sombra parcial em uma placa reduz o conjunto inteiro — não só aquela placa.\n\nVale perguntar e, se possível, ver fotos:\n\n> "Tem alguma árvore alta, prédio ou caixa de água que faça sombra no telhado em alguma hora do dia?"\n\n## Solo, se não couber no telhado\n\nExiste instalação em solo, que precisa de área livre e estrutura própria. Custa mais, mas resolve telhado inviável. Mencione como possibilidade, sem orçar.\n\n## O que só a visita técnica define\n\nViabilidade real, quantidade de placas, posição do inversor e custo de adequação. A empresa manda alguém — seu papel é levar até lá.',
 8),

(4,
 'Investimento, financiamento e retorno',
 'Como falar de dinheiro sem prometer número.',
 E'## É investimento, não compra\n\nA lógica da decisão é diferente da de um bem de consumo: a pessoa troca uma conta mensal por um ativo. Isso muda o que ela precisa ouvir.\n\n## O que você pode explicar\n\n- Que existem linhas de financiamento específicas para energia solar, com prazos longos\n- Que em muitos casos a parcela fica próxima do valor que já se pagava de luz\n- Que o sistema costuma valorizar o imóvel\n- Que os equipamentos têm garantias longas — inversor e placas com prazos diferentes\n\n## O que você NÃO pode\n\n- Garantir aprovação de crédito\n- Prometer prazo de retorno ("se paga em X anos")\n- Afirmar percentual de economia\n- Comparar com concorrente pelo preço\n\nRetorno depende de consumo, tarifa da distribuidora, projeto e reajustes futuros. Quem calcula é a empresa, no orçamento.\n\n## A resposta quando perguntam "em quanto tempo se paga?"\n\n> "Depende do seu consumo e da tarifa da sua distribuidora. Com a sua conta de luz em mãos a empresa faz essa conta de verdade — quer que eu encaminhe?"\n\nHonesto, e ainda avança para o orçamento.\n\n## Dados sensíveis do financiamento\n\nCPF, renda e documentos vão pela plataforma. Nunca pelo seu WhatsApp pessoal.',
 8),

(5,
 'Os erros que queimam a indicação',
 'O que mais gera cancelamento em energia solar.',
 E'## 1. Prometer conta zero\n\nO campeão. Gera cancelamento depois da instalação, que é o pior momento possível.\n\n## 2. Estimar economia ou retorno\n\nNúmero dito por você vira promessa. Deixe para o orçamento.\n\n## 3. Indicar sem a conta de luz\n\nSem ela não há projeto. É perder tempo de todo mundo.\n\n## 4. Ignorar sombreamento e estado do telhado\n\nSão as duas causas mais comuns de projeto que trava na visita técnica.\n\n## 5. Esquecer da titularidade\n\nImóvel alugado ou conta no nome de terceiro exige conversa antes, não depois.\n\n## 6. Vender por preço\n\nEnergia solar tem faixa enorme de qualidade em equipamento e instalação. Puxar a conversa para o mais barato desvia do que importa e desqualifica o anunciante.\n\n## Um bom indicador de energia solar\n\nPede a conta de luz na primeira conversa, fala da taxa mínima antes de o cliente descobrir sozinho, e entende que o ciclo é longo — de semanas a meses entre o interesse e a instalação.',
 7)
) AS v(position, title, summary, content, duration_min)
WHERE c.slug = 'nicho-energia-solar';

INSERT INTO public.course_questions (course_id, position, question, options, correct_index, explanation)
SELECT c.id, v.position, v.question, v.options, v.correct_index, v.explanation
FROM public.courses c,
(VALUES
(1, 'Um sistema conectado à rede zera a conta de luz?',
 ARRAY['Sim, sempre','Não — permanece a taxa mínima de disponibilidade','Só em casas pequenas','Depende da cor das placas'],
 1, 'A conta cai muito, mas continua a taxa mínima por estar ligado à rede. Prometer zero gera cancelamento.'),

(2, 'Qual informação da conta de luz mais importa para dimensionar?',
 ARRAY['O valor em reais','O consumo em kWh, com histórico de 12 meses','A data de vencimento','O nome do titular'],
 1, 'O valor varia com bandeira e impostos; o kWh é o que dimensiona. E o consumo muda com a estação.'),

(3, 'Por que sombreamento parcial é grave?',
 ARRAY['Só afeta a placa sombreada','Pode reduzir o rendimento do conjunto, não apenas daquela placa','Não afeta nada','Aumenta a geração'],
 1, 'A sombra em uma placa compromete o desempenho do conjunto — por isso a pergunta sobre árvores e caixa de água.'),

(4, 'O cliente pergunta em quantos anos o sistema se paga. Você deve:',
 ARRAY['Dizer que costuma ser 4 anos','Explicar que depende do consumo e da tarifa, e encaminhar para o orçamento','Garantir retorno em 3 anos','Dizer que nunca se paga'],
 1, 'Retorno depende de consumo, tarifa e projeto. Número dito por você vira promessa.'),

(5, 'Créditos de energia excedente:',
 ARRAY['Valem para sempre','Têm prazo de validade, então superdimensionar desperdiça','Podem ser vendidos a vizinhos livremente','Viram dinheiro na conta bancária'],
 1, 'Crédito tem validade; sistema grande demais gera crédito que vence sem uso.'),

(6, 'O imóvel é alugado. O que isso implica?',
 ARRAY['Nada, o inquilino decide sozinho','Exige conversa com o proprietário — titularidade e instalação envolvem o imóvel','Impede qualquer instalação','Só muda o preço'],
 1, 'O sistema é fixado no imóvel e a conta tem titular. Descobrir isso depois trava o projeto.'),

(7, 'Ao receber a conta de luz do cliente, você deve:',
 ARRAY['Encaminhar por grupo de WhatsApp','Enviar pelo canal da plataforma, por ser documento com dados pessoais','Publicar para outros indicadores verem','Guardar no seu computador'],
 1, 'A conta traz nome, endereço e número de instalação — encaminhar por fora expõe dado pessoal.'),

(8, 'O cliente quer o orçamento mais barato do mercado. A melhor conduta é:',
 ARRAY['Prometer o menor preço','Levar a conversa para qualidade de equipamento e instalação, e encaminhar ao anunciante','Comparar com concorrentes','Oferecer desconto por conta própria'],
 1, 'A faixa de qualidade é enorme neste nicho; disputar por preço desqualifica o anunciante e o projeto.')
) AS v(position, question, options, correct_index, explanation)
WHERE c.slug = 'nicho-energia-solar';

-- ================================================================= SAÚDE ====
INSERT INTO public.courses (slug, category, title, subtitle, description, emoji, position, pass_score)
VALUES (
  'nicho-saude',
  'saude',
  'Nicho: Saúde & Estética',
  'Libera a vitrine de saúde',
  'O limite entre indicar e orientar tratamento, o cuidado com dado de saúde e como conduzir alguém até uma avaliação sem prometer resultado.',
  '❤️',
  7,
  70
);

INSERT INTO public.course_lessons (course_id, position, title, summary, content, duration_min)
SELECT c.id, v.position, v.title, v.summary, v.content, v.duration_min
FROM public.courses c,
(VALUES
(1,
 'A linha que não se cruza',
 'Você indica um serviço. Você não opina sobre saúde.',
 E'## Nenhuma orientação clínica. Nunca.\n\nDizer se um procedimento serve para alguém, se um sintoma é grave, se vale trocar de tratamento ou se um profissional é melhor que outro — nada disso é seu papel, e nada disso é legal para quem não tem formação.\n\nNão é excesso de zelo. Palpite em saúde pode atrasar diagnóstico e machucar gente de verdade.\n\n## O que você PODE\n\n- Apresentar a clínica e o serviço anunciado\n- Explicar o que está publicado: estrutura, especialidades, formas de atendimento\n- Agendar a avaliação\n- Acompanhar, se fizer sentido\n\n## O que você NÃO pode\n\n- Dizer se o tratamento serve para o caso da pessoa\n- Opinar sobre sintoma, diagnóstico ou medicamento\n- Garantir resultado — em estética, inclusive\n- Comparar profissionais por qualidade\n- Divulgar antes e depois por conta própria\n\n## A frase que resolve tudo\n\n> "Isso quem avalia é o profissional. Consigo te agendar uma avaliação — é lá que a pessoa certa vai olhar seu caso."\n\nDevolver ao profissional não é fraqueza: é o que separa um indicador sério de alguém que dá palpite sobre a saúde dos outros.\n\n## Publicidade em saúde tem regra própria\n\nOs conselhos profissionais limitam o que pode ser divulgado — promessa de resultado e antes e depois têm restrição. Divulgue o que o anunciante publica, do jeito que publicou. Não crie peça por conta própria.',
 8),

(2,
 'Dado de saúde é dado sensível',
 'O que a pessoa te conta não pode circular.',
 E'## A LGPD trata saúde de forma especial\n\nInformação sobre saúde é **dado pessoal sensível**, com proteção maior que nome ou telefone. E aqui não é abstrato: as pessoas contam coisas íntimas quando procuram tratamento.\n\n## Na prática, para você\n\n**Não repasse o que ouviu.** Nem para outro indicador, nem em grupo, nem como exemplo. O caso da pessoa é dela.\n\n**Não peça detalhes que você não precisa.** Para agendar uma avaliação basta nome, contato e o serviço de interesse. Histórico clínico é assunto entre a pessoa e o profissional.\n\n**Não guarde exames, laudos ou fotos.** Se a pessoa te mandar, oriente a levar direto ao profissional.\n\n**Use o canal da plataforma.** Conversa registrada protege os dois lados.\n\n## Como pedir menos, sem parecer desinteressado\n\n> "Não precisa me contar detalhes do seu caso — isso é com o profissional. Me diz só qual procedimento te interessou que eu agendo a avaliação."\n\nIsso passa profissionalismo, não distância.\n\n## Se a pessoa insistir em contar\n\nOuça com respeito, não registre e não repasse. Encaminhe para quem pode ajudar de verdade.',
 8),

(3,
 'Conduzindo até a avaliação',
 'O agendamento é o objetivo — não o fechamento.',
 E'## Em saúde, a venda é a avaliação\n\nQuase nenhum procedimento sério é fechado sem uma consulta antes. Seu trabalho termina em levar a pessoa até essa porta.\n\n## Ao agendar\n\nConfirme com a clínica: dia, hora, profissional, se a avaliação tem custo e se é abatido do procedimento. **Custo da avaliação é a informação que mais gera atrito quando aparece de surpresa.**\n\n## Oriente a pessoa a levar\n\n- Documento com foto\n- Exames recentes relacionados, se tiver\n- Lista dos medicamentos que usa\n\nNote que você orienta a **levar**, não a te mandar.\n\n## Sobre convênio\n\nSe o cliente perguntar se atende o plano dele, confirme com a clínica antes de responder. Rede credenciada muda, e errar aqui gera viagem perdida.\n\n## Se você acompanhar\n\n- Aperte **"Cheguei na Loja"** ao chegar\n- Apresente e saia — sala de avaliação não é lugar para acompanhante que não foi convidado\n- Respeite a privacidade: não pergunte o que foi conversado\n\n## Depois\n\nUm contato simples, sem entrar no mérito:\n\n> "Foi tudo bem no atendimento?"\n\nSem perguntar diagnóstico, sem perguntar se vai fazer.',
 8),

(4,
 'Preço, pacote e financiamento',
 'Como falar de valor sem entrar no que não é seu.',
 E'## O que você pode dizer\n\n- O que está publicado no anúncio\n- Que a clínica trabalha com parcelamento ou financiamento, se for o caso\n- Que existe avaliação antes, e se ela tem custo\n\n## O que você NÃO pode\n\n- Estimar o valor de um procedimento não publicado\n- Prometer desconto\n- Dizer quantas sessões a pessoa vai precisar\n- Garantir aprovação de crédito\n\n**Número de sessões é decisão clínica.** Dizer "com três sessões resolve" é, ao mesmo tempo, promessa de resultado e opinião técnica — os dois erros de uma vez.\n\n## A resposta quando perguntam o preço total\n\n> "O valor fechado sai depois da avaliação, porque depende do que o profissional indicar para o seu caso. O que posso te dizer é que a clínica parcela — quer que eu agende?"\n\n## Financiamento em saúde\n\nExiste e é comum em procedimentos de ticket alto. As regras são as mesmas dos outros nichos: quem aprova é o banco, você não promete nada, e os dados sensíveis vão pela plataforma.\n\n## Cuidado com a vulnerabilidade\n\nQuem procura tratamento às vezes está fragilizado. Pressa e pressão, que já são ruins em qualquer nicho, aqui são inaceitáveis.',
 7),

(5,
 'Os erros que queimam a indicação',
 'O que mais dá errado — e o que tem consequência séria.',
 E'## 1. Opinar sobre o caso da pessoa\n\nO erro mais grave do nicho, e o único que pode causar dano real.\n\n## 2. Prometer resultado\n\nEm estética, é a origem de quase toda frustração. Corpo responde diferente em cada pessoa.\n\n## 3. Repassar o que ouviu\n\nDado de saúde é sensível. Comentar o caso de alguém, mesmo sem nome, é quebra de confiança e problema legal.\n\n## 4. Criar peça de divulgação por conta própria\n\nPublicidade em saúde tem regra dos conselhos. Divulgue o que o anunciante publicou.\n\n## 5. Não confirmar custo da avaliação\n\nA surpresa mais comum na recepção.\n\n## 6. Pressionar\n\nQuem procura tratamento pode estar fragilizado. Insistência aqui é abuso, não técnica de venda.\n\n## 7. Dizer que atende o convênio sem confirmar\n\nRede credenciada muda. Confirme sempre.\n\n## Um bom indicador de saúde\n\nSabe que sua função é abrir uma porta, não avaliar ninguém. Pergunta pouco, guarda menos ainda, e devolve toda questão clínica a quem tem formação para responder.',
 7)
) AS v(position, title, summary, content, duration_min)
WHERE c.slug = 'nicho-saude';

INSERT INTO public.course_questions (course_id, position, question, options, correct_index, explanation)
SELECT c.id, v.position, v.question, v.options, v.correct_index, v.explanation
FROM public.courses c,
(VALUES
(1, 'O cliente descreve um sintoma e pergunta se o procedimento anunciado resolve. Você:',
 ARRAY['Dá sua opinião com base no que já viu','Explica que quem avalia é o profissional e oferece agendar','Diz que resolve, para não perder o lead','Pesquisa na internet e responde'],
 1, 'Opinar sobre caso clínico pode atrasar diagnóstico e causar dano real. Não é seu papel nem é legal.'),

(2, 'Informação sobre a saúde de uma pessoa é, na LGPD:',
 ARRAY['Dado comum, como nome e telefone','Dado pessoal sensível, com proteção maior','Informação pública','Irrelevante se não tiver o nome junto'],
 1, 'Saúde é dado sensível. Repassar, mesmo sem nome, é quebra de confiança e problema legal.'),

(3, 'Para agendar uma avaliação, o que basta pedir?',
 ARRAY['Histórico clínico completo','Nome, contato e o serviço de interesse','Exames e laudos','Lista de medicamentos'],
 1, 'Histórico é assunto entre a pessoa e o profissional. Pedir menos protege os dois lados.'),

(4, 'Qual informação, se aparecer de surpresa, mais gera atrito na recepção?',
 ARRAY['O nome do profissional','O custo da avaliação','O endereço da clínica','O horário de funcionamento'],
 1, 'Descobrir na hora que a avaliação é paga é a principal fonte de conflito no nicho.'),

(5, 'O cliente pergunta quantas sessões vai precisar. Você deve:',
 ARRAY['Estimar com base em outros casos','Explicar que isso o profissional define na avaliação','Dizer que três costumam bastar','Garantir que uma resolve'],
 1, 'Número de sessões é decisão clínica — responder junta promessa de resultado com opinião técnica.'),

(6, 'Sobre divulgar o serviço nas suas redes:',
 ARRAY['Pode criar antes e depois por conta própria','Deve usar o que o anunciante publicou, porque publicidade em saúde tem regra dos conselhos','Pode prometer resultado se for verdade','Pode citar casos de outros clientes'],
 1, 'Os conselhos profissionais restringem promessa de resultado e antes e depois. Não crie peça própria.'),

(7, 'O cliente pergunta se a clínica atende o plano de saúde dele. Você:',
 ARRAY['Diz que sim, quase todas atendem','Confirma com a clínica antes de responder','Diz que plano nunca cobre','Manda ele descobrir sozinho'],
 1, 'Rede credenciada muda com frequência; errar aqui gera viagem perdida.'),

(8, 'O cliente parece fragilizado e indeciso. A conduta correta é:',
 ARRAY['Aumentar a insistência, porque ele precisa de um empurrão','Respeitar o tempo dele e deixar a porta aberta','Criar urgência com prazo falso','Falar com um familiar sem avisar'],
 1, 'Quem procura tratamento pode estar vulnerável. Pressão aqui é abuso, não técnica de venda.')
) AS v(position, question, options, correct_index, explanation)
WHERE c.slug = 'nicho-saude';

-- ============================================================== EDUCAÇÃO ====
INSERT INTO public.courses (slug, category, title, subtitle, description, emoji, position, pass_score)
VALUES (
  'nicho-educacao',
  'educacao',
  'Nicho: Educação',
  'Libera a vitrine de cursos e faculdades',
  'Reconhecimento do MEC, modalidade e carga horária — e por que prometer emprego é o erro que derruba a indicação.',
  '🎓',
  8,
  70
);

INSERT INTO public.course_lessons (course_id, position, title, summary, content, duration_min)
SELECT c.id, v.position, v.title, v.summary, v.content, v.duration_min
FROM public.courses c,
(VALUES
(1,
 'Reconhecimento e o que ele significa',
 'A pergunta que define se o diploma vale.',
 E'## Autorizado, reconhecido, credenciado\n\nSão coisas diferentes e o aluno costuma não saber:\n\n- **Instituição credenciada** pelo MEC — pode ofertar ensino superior\n- **Curso autorizado** — pode começar a funcionar\n- **Curso reconhecido** — passou por avaliação depois das primeiras turmas; é o que garante a validade do diploma\n\nUm curso novo pode estar autorizado e ainda não reconhecido. Isso é normal e legal, mas o aluno precisa saber, porque o reconhecimento costuma sair antes da formatura da primeira turma.\n\n## Cursos livres não têm reconhecimento\n\nCurso livre, técnico e graduação são categorias distintas. Curso livre é legítimo, gera certificado, mas **não é diploma** e não dá acesso a concurso que exija formação superior. Confundir os dois é o erro mais caro do nicho.\n\n## O que você NÃO afirma\n\n- Que o curso é reconhecido, se o anúncio não diz\n- Que o diploma vale para determinado concurso\n- Que equivale a uma graduação\n- Que o registro em conselho profissional está garantido\n\nTodos são da instituição. E a informação oficial é pública — a instituição sabe onde consultar.\n\n## A frase honesta\n\n> "Essa parte do reconhecimento a instituição confirma com documento. Quer que eu peça para eles te enviarem?"',
 8),

(2,
 'Modalidade, carga horária e rotina',
 'O que faz o aluno desistir no terceiro mês.',
 E'## Modalidade muda tudo\n\n**Presencial** — aulas no campus, horário fixo.\n**EaD** — a distância, com encontros presenciais obrigatórios em alguns cursos (estágio, prática, prova).\n**Semipresencial** — combinação dos dois.\n\nO detalhe que mais surpreende: **muito curso EaD tem obrigatoriedade presencial** para prova ou prática. Quem mora longe do polo descobre tarde e desiste.\n\nPergunte sempre:\n\n> "Você tem polo perto? Alguns cursos a distância pedem presença para prova ou estágio."\n\n## Carga horária e duração\n\nDefine o ritmo. Um curso de mesma duração com carga maior exige mais horas por semana — e é aí que quem trabalha em turno desiste.\n\n## Estágio obrigatório\n\nMuitos cursos exigem. Quem já trabalha em área diferente precisa saber disso antes de assinar.\n\n## As perguntas que evitam desistência\n\n1. Você trabalha? Em que horário?\n2. Consegue estudar quantas horas por semana?\n3. Tem polo ou campus perto de você?\n4. Já sabe se o curso tem estágio obrigatório?\n\nAluno que desiste no terceiro mês é ruim para todo mundo — inclusive para sua reputação com a instituição.',
 8),

(3,
 'Entender o objetivo real',
 'Por que a pessoa está buscando estudar.',
 E'## O motivo muda a indicação\n\n**Promoção no trabalho atual.** Às vezes basta uma pós ou um técnico. Indicar graduação de quatro anos é errar por não perguntar.\n\n**Mudança de carreira.** Aqui o reconhecimento pesa mais, e o prazo importa.\n\n**Concurso público.** Exigência específica de formação. Esse caso pede confirmação documental da instituição, sem exceção.\n\n**Registro em conselho.** Algumas profissões exigem curso reconhecido e registro. Não afirme nada — encaminhe.\n\n**Conhecimento pessoal.** Curso livre resolve, e é mais barato e rápido.\n\n## A pergunta que abre tudo\n\n> "O que você quer conseguir com esse curso?"\n\nA resposta define modalidade, duração e até se o curso anunciado serve.\n\n## Quando o curso não serve\n\nSe a pessoa quer prestar concurso que exige bacharelado e o anúncio é de curso livre, dizer isso é o certo — mesmo perdendo a indicação. O oposto gera matrícula cancelada, aluno revoltado e sua reputação queimada com a instituição.\n\nIndicação boa é a que a pessoa não se arrepende.',
 7),

(4,
 'Bolsa, financiamento e o que nunca prometer',
 'Dinheiro e a promessa proibida.',
 E'## O que existe\n\n- Bolsas próprias da instituição, com critérios próprios\n- Programas de financiamento estudantil, com regras próprias e prazos\n- Descontos por pontualidade, por convênio, para ex-alunos\n\n## O que você pode dizer\n\nQue existem, e que a instituição avalia. Nada além.\n\n## O que você NÃO pode\n\n- Garantir bolsa ou percentual de desconto\n- Prometer aprovação em financiamento\n- Afirmar que a mensalidade não reajusta\n- **Prometer emprego ou salário depois de formado**\n\n## A promessa proibida\n\nPrometer colocação profissional é o erro mais grave do nicho. Não é só desonesto — é o tipo de afirmação que gera cancelamento com pedido de devolução, e a instituição responde por isso.\n\nSe o cliente perguntar sobre mercado de trabalho:\n\n> "A instituição consegue te falar sobre o que os egressos têm feito. O que eu não posso é prometer emprego — isso ninguém pode."\n\n## Mensalidade\n\nDiga o que está publicado. Reajuste, multa e política de trancamento estão no contrato, e o contrato é da instituição.',
 7),

(5,
 'Os erros que queimam a indicação',
 'O que mais gera cancelamento em educação.',
 E'## 1. Prometer emprego\n\nO mais grave. Gera cancelamento com devolução e responsabiliza a instituição.\n\n## 2. Confundir curso livre com graduação\n\nO mais caro. A pessoa descobre quando tenta usar o certificado.\n\n## 3. Afirmar reconhecimento sem confirmar\n\nInformação documental — peça à instituição.\n\n## 4. Ignorar a rotina do aluno\n\nQuem trabalha em turno e recebe indicação de curso com carga pesada desiste no terceiro mês.\n\n## 5. Esquecer da obrigatoriedade presencial no EaD\n\nA surpresa mais comum, e quem mora longe do polo tranca.\n\n## 6. Garantir bolsa\n\nCritério é da instituição, e quase sempre envolve análise.\n\n## 7. Insistir quando o curso não serve\n\nMatrícula que não deveria existir vira cancelamento, e queima você com a instituição.\n\n## Um bom indicador de educação\n\nPergunta o objetivo antes de indicar qualquer curso, sabe a diferença entre livre, técnico e graduação, e prefere perder uma indicação a colocar alguém num curso que não resolve o problema dele.',
 7)
) AS v(position, title, summary, content, duration_min)
WHERE c.slug = 'nicho-educacao';

INSERT INTO public.course_questions (course_id, position, question, options, correct_index, explanation)
SELECT c.id, v.position, v.question, v.options, v.correct_index, v.explanation
FROM public.courses c,
(VALUES
(1, 'Qual situação garante a validade do diploma de graduação?',
 ARRAY['Curso autorizado','Curso reconhecido pelo MEC','Instituição com muitos alunos','Curso com nome conhecido'],
 1, 'Autorizado permite funcionar; reconhecido é o que valida o diploma, após avaliação.'),

(2, 'Curso livre e graduação são a mesma coisa?',
 ARRAY['Sim, mudam só o nome','Não — curso livre gera certificado, não diploma, e não atende exigência de formação superior','Sim, se tiver mais de 400 horas','Depende da instituição'],
 1, 'Confundir os dois é o erro mais caro do nicho: a pessoa descobre ao tentar usar o certificado.'),

(3, 'Qual surpresa mais faz aluno de EaD trancar o curso?',
 ARRAY['A cor da plataforma','A obrigatoriedade de presença para prova ou estágio','O nome do professor','A duração das aulas'],
 1, 'Muito curso a distância exige presença; quem mora longe do polo descobre tarde.'),

(4, 'O cliente quer prestar um concurso que exige bacharelado, e o anúncio é de curso livre. Você deve:',
 ARRAY['Indicar assim mesmo','Dizer que o curso não atende esse objetivo, mesmo perdendo a indicação','Afirmar que provavelmente serve','Sugerir que ele tente e veja'],
 1, 'Matrícula que não deveria existir vira cancelamento e queima sua reputação com a instituição.'),

(5, 'Sobre emprego após a formatura, você pode:',
 ARRAY['Prometer colocação, se a instituição tiver bons números','Não prometer nada — nem você nem ninguém pode garantir emprego','Garantir salário inicial','Assegurar estágio remunerado'],
 1, 'Promessa de colocação gera cancelamento com devolução e responsabiliza a instituição.'),

(6, 'Qual pergunta melhor orienta a indicação de um curso?',
 ARRAY['Quanto você pode pagar por mês?','O que você quer conseguir com esse curso?','Prefere aula de manhã ou à noite?','Você gosta de estudar?'],
 1, 'O objetivo define modalidade, duração e até se o curso anunciado serve.'),

(7, 'O cliente pergunta se consegue bolsa. Você:',
 ARRAY['Garante 50%','Explica que existem bolsas com critérios da instituição e encaminha','Diz que não existe bolsa','Promete o maior desconto'],
 1, 'Critério e percentual são da instituição, quase sempre com análise.'),

(8, 'O cliente trabalha em turno e tem pouco tempo. Isso deve:',
 ARRAY['Ser ignorado, o importante é matricular','Orientar a indicação, porque carga horária incompatível gera desistência','Ser motivo para desistir do lead','Ser resolvido depois pela instituição'],
 1, 'Aluno que desiste no terceiro mês é ruim para todos, inclusive para sua reputação.')
) AS v(position, question, options, correct_index, explanation)
WHERE c.slug = 'nicho-educacao';

-- =============================================================== SEGUROS ====
INSERT INTO public.courses (slug, category, title, subtitle, description, emoji, position, pass_score)
VALUES (
  'nicho-seguros',
  'seguros',
  'Nicho: Seguros',
  'Libera a vitrine de seguros',
  'Corretor de seguros é profissão regulada pela SUSEP. Este módulo é sobre onde termina indicar e começa corretar — e sobre nunca opinar em cobertura.',
  '🛡️',
  9,
  70
);

INSERT INTO public.course_lessons (course_id, position, title, summary, content, duration_min)
SELECT c.id, v.position, v.title, v.summary, v.content, v.duration_min
FROM public.courses c,
(VALUES
(1,
 'Corretor de seguros é profissão regulada',
 'O limite legal deste nicho, e por que ele é rígido.',
 E'## Existe registro obrigatório\n\nIntermediar seguro é atividade de **corretor habilitado e registrado na SUSEP** (Lei 4.594/1964). Não é formalidade de mercado: é exigência legal, com fiscalização.\n\nVocê não é corretor. E, como nos outros nichos, não precisa ser — indicar é outra coisa.\n\n## O que você PODE\n\n- Apresentar o serviço anunciado\n- Explicar, em linhas gerais, o que está publicado\n- Encaminhar a pessoa para o corretor\n- Agendar a conversa\n- Receber sua comissão de indicação, paga pelo anunciante\n\n## O que você NÃO pode\n\n- **Cotar** ou passar valor de prêmio\n- **Comparar apólices** ou dizer qual é melhor\n- **Orientar cobertura** — o que contratar, quanto de franquia, qual capital segurado\n- Preencher proposta ou coletar declaração de risco\n- Se apresentar como corretor ou representante da seguradora\n\n## Por que a regra é dura aqui\n\nSeguro se resolve no pior dia da vida da pessoa. Uma orientação errada de cobertura só aparece na hora do sinistro — quando não dá mais para consertar. Por isso a lei reserva isso a quem responde profissionalmente.\n\n## A frase que devolve\n\n> "Cobertura e valor quem monta é o corretor, que responde por isso. Eu te apresento e ele te explica direitinho."',
 8),

(2,
 'O vocabulário mínimo',
 'Entender o que se fala, sem opinar sobre o que se contrata.',
 E'## Você precisa entender para conversar\n\nNão para aconselhar — para não se perder na conversa e saber quando encaminhar.\n\n**Prêmio.** O que o segurado paga. Não é o valor da indenização, e essa confusão é comum.\n\n**Apólice.** O contrato. Define o que está coberto e o que não está.\n\n**Franquia.** A parte que o segurado paga no sinistro. Franquia menor costuma significar prêmio maior.\n\n**Capital segurado.** O teto da indenização.\n\n**Carência.** Prazo até a cobertura valer, comum em vida e saúde.\n\n**Sinistro.** O evento coberto acontecendo.\n\n**Vigência.** O período em que a apólice vale.\n\n## O que está sempre fora\n\nToda apólice tem exclusões. Dizer "isso é coberto" sem ler o contrato é o tipo de afirmação que aparece no pior momento.\n\n## Como usar esse vocabulário\n\nPara entender o que a pessoa quer e levar ao corretor com clareza:\n\n> "Ele tem um carro e quer saber sobre cobertura para terceiros" — útil.\n> "Ele deveria contratar cobertura de terceiros com franquia reduzida" — proibido.\n\nA diferença entre as duas frases é a diferença entre indicar e corretar.',
 8),

(3,
 'Entender o que a pessoa quer proteger',
 'Perguntas que ajudam sem invadir o trabalho do corretor.',
 E'## O que dá para perguntar\n\n**Que tipo de seguro te interessa?** Auto, residencial, vida, empresarial, viagem.\n\n**É renovação ou primeira contratação?** Quem renova costuma ter apólice em mãos e decide mais rápido.\n\n**Já tem seguro hoje?** Se sim, quando vence. Prazo de renovação é o melhor momento.\n\n**Tem urgência?** Financiamento de veículo e contrato de aluguel às vezes exigem seguro com prazo.\n\n## O que NÃO perguntar\n\nDeclaração de risco — perfil de condutor, quem usa o carro, histórico de sinistro, estado de saúde. Isso é coleta de dados para cotação, é trabalho do corretor, e informação errada aí pode **anular a apólice**.\n\nSe a pessoa começar a contar espontaneamente, ouça sem registrar e encaminhe.\n\n## Cuidado com o dado sensível\n\nSeguro de vida e saúde envolve informação de saúde — dado sensível na LGPD, com o mesmo cuidado do nicho de saúde. Não guarde, não repasse.\n\n## O bom encaminhamento\n\n> "Ela quer seguro residencial, primeira contratação, sem pressa. Passei seu contato."\n\nCurto, útil, e sem invadir o que não é seu.',
 7),

(4,
 'Conduzindo até o corretor',
 'Como fazer a ponte e onde sua parte termina.',
 E'## Marque a conversa, não a venda\n\nO objetivo é colocar as duas pessoas em contato. A cotação, a explicação e o fechamento são do corretor.\n\n## Ao agendar\n\nConfirme com o anunciante: quem vai atender, por qual canal e o que a pessoa deve ter em mãos. Para auto, costuma ser documento do veículo e CNH; para residencial, dados do imóvel. **Confirme, não presuma** — cada corretora pede o seu.\n\n## Durante o contato\n\nSe você acompanhar, seu papel é apresentação. Saia da conversa técnica. E resista à tentação de "ajudar a explicar" — é exatamente aí que se cruza a linha.\n\n## Renovação é o melhor gancho\n\nSeguro vence todo ano. Quem tem apólice vencendo em 30 ou 60 dias é o lead mais quente do nicho, e ninguém precisa ser convencido de nada — só lembrado.\n\n## Depois\n\nUm contato leve:\n\n> "Conseguiu falar com o corretor?"\n\nSem perguntar valores, sem perguntar o que ele decidiu contratar.\n\n## Sinistro não é com você\n\nSe a pessoa te procurar depois de um sinistro, encaminhe imediatamente ao corretor ou à seguradora. Orientar em sinistro pode custar a indenização dela.',
 7),

(5,
 'Os erros que queimam a indicação',
 'O que mais dá errado, e o que tem consequência legal.',
 E'## 1. Cotar ou dar valor\n\nAtividade privativa de corretor. Além de irregular, valor dito por você vira expectativa que a cotação real desmente.\n\n## 2. Opinar sobre cobertura\n\nO erro que só aparece no sinistro — quando não dá mais para corrigir.\n\n## 3. Dizer que algo é coberto\n\nToda apólice tem exclusões. Só o contrato responde.\n\n## 4. Coletar declaração de risco\n\nInformação errada na declaração pode anular a apólice. Deixe com quem responde por isso.\n\n## 5. Se apresentar como corretor\n\nMesmo sem querer, mesmo por simpatia.\n\n## 6. Guardar dado de saúde\n\nSeguro de vida e saúde envolve dado sensível. Não registre, não repasse.\n\n## 7. Orientar em sinistro\n\nPode custar a indenização da pessoa. Encaminhe na hora.\n\n## Um bom indicador de seguros\n\nEntende o vocabulário para conversar, não para aconselhar. Sabe que renovação é o melhor gancho do nicho. E devolve toda pergunta técnica ao corretor sem hesitar — porque aqui o preço de errar é pago pelo cliente, no pior dia dele.',
 7)
) AS v(position, title, summary, content, duration_min)
WHERE c.slug = 'nicho-seguros';

INSERT INTO public.course_questions (course_id, position, question, options, correct_index, explanation)
SELECT c.id, v.position, v.question, v.options, v.correct_index, v.explanation
FROM public.courses c,
(VALUES
(1, 'Intermediar seguro no Brasil exige:',
 ARRAY['Apenas experiência de mercado','Ser corretor habilitado e registrado na SUSEP','Registro no CRECI','Nenhum registro'],
 1, 'É profissão regulada pela Lei 4.594/1964, com fiscalização — não é formalidade de mercado.'),

(2, 'O que significa "prêmio" em seguros?',
 ARRAY['O valor da indenização','O valor que o segurado paga pelo seguro','Um bônus por não usar','O desconto na renovação'],
 1, 'Prêmio é o que se paga. Confundir com indenização é um dos erros mais comuns de vocabulário.'),

(3, 'O cliente pergunta quanto ficaria o seguro do carro dele. Você:',
 ARRAY['Estima com base em outro cliente','Explica que a cotação é do corretor e encaminha','Dá uma faixa aproximada','Consulta um site e informa'],
 1, 'Cotar é atividade privativa de corretor, e valor dito por você vira expectativa que a cotação desmente.'),

(4, 'Coletar a declaração de risco do cliente é problema porque:',
 ARRAY['Dá trabalho','Informação errada pode anular a apólice, e a responsabilidade é do corretor','Demora muito','O cliente não gosta'],
 1, 'A declaração sustenta o contrato; erro ali pode custar a indenização no sinistro.'),

(5, 'Qual é o lead mais quente deste nicho?',
 ARRAY['Quem nunca teve seguro','Quem tem apólice vencendo em 30 a 60 dias','Quem acabou de contratar','Quem não tem carro'],
 1, 'Seguro vence todo ano; quem está em renovação não precisa ser convencido, só lembrado.'),

(6, 'O cliente pergunta se determinado dano é coberto. O correto é:',
 ARRAY['Dizer que sim, é padrão do mercado','Encaminhar ao corretor, porque só a apólice responde','Dizer que não é coberto','Consultar outro indicador'],
 1, 'Toda apólice tem exclusões. Afirmar cobertura sem o contrato aparece no pior momento.'),

(7, 'A pessoa te procura logo após sofrer um sinistro. Você deve:',
 ARRAY['Orientar o passo a passo que conhece','Encaminhar imediatamente ao corretor ou à seguradora','Dizer para esperar alguns dias','Pedir fotos e avaliar'],
 1, 'Orientação errada em sinistro pode custar a indenização da pessoa.'),

(8, 'Encaminhar ao corretor dizendo "ele quer seguro residencial, primeira contratação" é:',
 ARRAY['Invasão do trabalho do corretor','Um bom encaminhamento — informa sem aconselhar','Informação insuficiente','Proibido pela SUSEP'],
 1, 'Descrever o interesse ajuda; recomendar cobertura é que cruzaria a linha.')
) AS v(position, question, options, correct_index, explanation)
WHERE c.slug = 'nicho-seguros';
