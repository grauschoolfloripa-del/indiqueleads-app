-- Módulos de nicho — lote 1: Imóveis, Motos, Barcos, Jet Ski.
--
-- Mesma estrutura de `nicho-carros`: 5 aulas + 8 questões, tom prático, com o
-- que dizer e o que não dizer. Nada de manual de venda agressiva — o indicador
-- não é vendedor, é quem apresenta.
--
-- Imóveis abre o lote de propósito: é onde existe produto ativo hoje, e é o
-- nicho com restrição legal de verdade (CRECI). Um indicador que negocia
-- imóvel está exercendo atividade privativa de corretor, e isso respinga na
-- plataforma inteira — por isso a aula 1 é inteira sobre esse limite.

-- =============================================================== IMÓVEIS ====
INSERT INTO public.courses (slug, category, title, subtitle, description, emoji, position, pass_score)
VALUES (
  'nicho-imoveis',
  'imovel',
  'Nicho: Imóveis',
  'Libera a vitrine de imóveis',
  'O limite legal entre indicar e corretar, o que olhar num anúncio e como conduzir até a visita sem prometer o que não é seu.',
  '🏠',
  2,
  70
);

INSERT INTO public.course_lessons (course_id, position, title, summary, content, duration_min)
SELECT c.id, v.position, v.title, v.summary, v.content, v.duration_min
FROM public.courses c,
(VALUES
(1,
 'Onde termina indicar e começa corretar',
 'A linha que você não pode cruzar — e por quê.',
 E'## A regra que sustenta este nicho\n\nNo Brasil, **intermediar a compra e venda de imóvel é atividade privativa de corretor com CRECI** (Lei 6.530/1978). Você não é corretor. E não precisa ser: indicar é outra coisa.\n\n## O que você PODE fazer\n\n- Apresentar um imóvel anunciado a alguém que possa se interessar\n- Explicar o que está publicado no anúncio\n- Agendar a visita com a imobiliária ou o corretor responsável\n- Acompanhar o cliente na visita\n- Receber sua comissão de indicação, paga pelo anunciante\n\n## O que você NÃO pode\n\n- **Negociar preço, prazo ou condições.** Isso é intermediação.\n- **Discutir cláusulas de contrato**, entrada, financiamento ou permuta\n- **Se apresentar como corretor**, ou deixar a pessoa acreditar que você é\n- **Redigir ou opinar sobre proposta**\n- **Receber valores** do comprador, a qualquer título\n\n## Por que isso importa para você\n\nNão é formalidade. Exercer atividade privativa sem registro é infração, o corretor responsável responde junto, e o negócio pode ser anulado. Na prática, o que acontece antes disso é mais simples: a imobiliária corta a parceria e você perde o acesso à vitrine.\n\n## A frase que resolve\n\nQuando o cliente puxar negociação, devolva sem rodeio:\n\n> "Essa parte é com o corretor responsável. Eu apresento o imóvel e marco a visita — quem negocia é ele, e é melhor assim: ele responde pelo que promete."\n\nIsso protege você e passa profissionalismo, não fraqueza.',
 8),

(2,
 'Ler um anúncio de imóvel',
 'Os números que mudam a decisão e o que confirmar antes.',
 E'## Metragem: sempre pergunte qual\n\nExistem três e elas não são a mesma coisa:\n\n- **Área privativa** — o que é seu de fato, dentro das paredes\n- **Área comum** — a parte proporcional de hall, piscina, salão\n- **Área total** (ou construída) — a soma\n\nAnúncio que diz "120m²" sem especificar costuma estar somando. Um apartamento de 120m² totais pode ter 85m² privativos. A pessoa que visita esperando 120 fica frustrada na porta.\n\n## O que sempre conferir\n\n**Condomínio e IPTU.** Entram no orçamento mensal. Um condomínio de R$ 1.800 muda a conta mais do que R$ 30 mil no preço.\n\n**Vaga de garagem.** É escriturada? Coberta? Quantas? Em cidade grande, isso vale dezenas de milhares.\n\n**Andar e posição solar.** Nascente ou poente muda o conforto e o preço.\n\n**Situação da documentação.** Escritura registrada, financiado, inventário em andamento? Isso define se o negócio anda em 30 dias ou em 8 meses.\n\n## O que NÃO afirmar sem confirmação\n\n- Que aceita financiamento ou FGTS\n- Que a documentação está livre\n- Que aceita permuta\n- Que o valor tem desconto\n\nOs quatro são da imobiliária. Afirmar e depois voltar atrás queima você com o cliente e com a loja.',
 8),

(3,
 'Entender o que a pessoa procura',
 'Cinco perguntas que evitam a visita errada.',
 E'## Imóvel errado custa caro para todo mundo\n\nUma visita frustrada gasta a manhã do cliente, a agenda do corretor e a sua reputação. Cinco perguntas resolvem.\n\n**1. Para morar ou investir?** Muda tudo. Investidor olha rentabilidade e liquidez; quem vai morar olha escola, trabalho, sol da sala.\n\n**2. Quantas pessoas moram?** Define quartos e banheiros de verdade, não o que a pessoa imagina.\n\n**3. Região — quais bairros servem?** E, mais útil: **de onde ela não abre mão de estar perto?** Trabalho, escola, família.\n\n**4. À vista, financiado ou com FGTS?** Se financiado, já tem aprovação? Isso define a faixa real, que quase nunca é a primeira que a pessoa fala.\n\n**5. Prazo.** Precisa mudar em 60 dias ou está pesquisando para o ano que vem? Conduta oposta nos dois casos.\n\n## Indique um, no máximo dois\n\nE explique o porquê:\n\n> "Pelo que você falou — dois filhos em idade escolar, trabalho no centro e financiado —, esse aqui faz sentido: três quartos, duas quadras da escola que você citou, e a imobiliária trabalha com financiamento."\n\nMandar sete links não é atendimento, é sorteio.',
 7),

(4,
 'Conduzindo até a visita',
 'Como agendar e o que orientar — sem entrar na negociação.',
 E'## Confirme antes de dar a data\n\nCom a imobiliária: dia, hora, se as chaves estarão disponíveis, e com qual corretor o cliente falará. Imóvel ocupado por inquilino precisa de aviso prévio — isso costuma travar visita de última hora.\n\n## Oriente o cliente a levar\n\n- Documento com foto (muitos prédios exigem para liberar a entrada)\n- Se pretende financiar: comprovante de renda e a simulação, se já tiver\n\n## Na visita\n\nSe você acompanhar — o que costuma render comissão maior:\n\n- Aperte **"Cheguei na Loja"** ao chegar; é o que dispara a confirmação do anunciante\n- Apresente o cliente ao corretor e **saia da conversa comercial**\n- Deixe o cliente ver sozinho; gente decide olhando, não ouvindo\n- Não opine sobre preço, nem para ajudar\n\n## O que observar e relatar depois\n\nPreste atenção no que a pessoa comenta em voz alta: "a cozinha é escura", "adorei a varanda". Isso vale mais que qualquer ficha — é o que orienta sua próxima indicação, e é informação útil para a imobiliária.\n\n## Depois da visita\n\nUm contato, no dia seguinte, com pergunta aberta:\n\n> "E aí, o que achou?"\n\nSe a resposta for morna, pergunte o que faltou. Não empurre.',
 7),

(5,
 'Os erros que queimam a indicação',
 'O que mais faz cliente e imobiliária desistirem de você.',
 E'## 1. Entrar na negociação\n\nO erro número um do nicho, e o único que tem consequência legal. Não negocie, não opine sobre proposta, não fale de desconto.\n\n## 2. Prometer financiamento\n\n"Seu crédito passa" é promessa que não é sua. Quem aprova é o banco, e imóvel tem análise mais rigorosa que veículo — entra avaliação do bem, além do comprador.\n\n## 3. Inventar metragem ou detalhe\n\nSe o anúncio não diz, pergunte. "Acho que tem uns 100m²" vira reclamação na visita.\n\n## 4. Marcar visita sem confirmar chaves\n\nCliente que vai até o local e não consegue entrar não volta.\n\n## 5. Esconder o que pesa\n\nCondomínio alto, andar sem elevador, imóvel em inventário. Vindo de você, com naturalidade, é transparência. Descoberto na visita, é sensação de engano.\n\n## 6. Se apresentar como corretor\n\nMesmo sem querer. "Sou o responsável pelo imóvel" já cruza a linha. Você é quem indicou.\n\n## Um bom indicador de imóveis\n\nEntende que o ciclo é longo — imóvel não se decide em uma tarde. Faz poucas indicações, bem escolhidas, acompanha sem pressionar, e sabe exatamente onde sua parte termina.',
 7)
) AS v(position, title, summary, content, duration_min)
WHERE c.slug = 'nicho-imoveis';

INSERT INTO public.course_questions (course_id, position, question, options, correct_index, explanation)
SELECT c.id, v.position, v.question, v.options, v.correct_index, v.explanation
FROM public.courses c,
(VALUES
(1, 'O cliente pede para você conseguir um desconto no valor do imóvel. O correto é:',
 ARRAY['Negociar com a imobiliária para fechar mais rápido','Explicar que quem negocia é o corretor responsável e encaminhar','Sugerir um valor que você acha justo','Dizer que o preço não tem desconto'],
 1, 'Negociar valor é intermediação — atividade privativa de corretor com CRECI. Encaminhar protege você e o negócio.'),

(2, 'Um anúncio informa "120m²" sem especificar. O que isso pode significar?',
 ARRAY['Sempre área privativa','Pode ser área total, somando a parte comum — é preciso confirmar','Sempre área do terreno','Que o imóvel tem 120m² de sala'],
 1, 'Área privativa, comum e total são diferentes. Anúncio genérico costuma somar, e o cliente descobre a diferença na visita.'),

(3, 'Qual pergunta é mais útil no início da conversa?',
 ARRAY['Quanto você pode pagar?','É para morar ou investir?','Você fecha essa semana?','Prefere prédio novo ou antigo?'],
 1, 'Morar e investir levam a imóveis completamente diferentes. Valor declarado no início quase nunca é a faixa real.'),

(4, 'Você pode se apresentar ao cliente como:',
 ARRAY['Corretor responsável pelo imóvel','Quem indicou o imóvel e vai acompanhar a visita','Representante da imobiliária','Consultor imobiliário credenciado'],
 1, 'Você indica e acompanha. Qualquer título que sugira corretagem cruza uma linha legal.'),

(5, 'Além do preço, o que mais pesa no orçamento mensal do comprador?',
 ARRAY['A cor da fachada','Condomínio e IPTU','O andar do apartamento','A idade do prédio'],
 1, 'Um condomínio alto muda a conta mais do que uma diferença de dezenas de milhares no preço.'),

(6, 'A imobiliária não confirmou se as chaves estarão disponíveis. Você deve:',
 ARRAY['Marcar assim mesmo, para não perder o cliente','Confirmar antes de passar dia e hora','Pedir para o cliente ir e tentar','Marcar e avisar que pode não entrar'],
 1, 'Cliente que vai até o local e não consegue entrar dificilmente marca uma segunda visita.'),

(7, 'O imóvel está em inventário e o cliente não perguntou. O ideal é:',
 ARRAY['Não mencionar, para não atrapalhar','Informar com naturalidade antes da visita','Falar só se ele perguntar','Dizer que não interfere em nada'],
 1, 'Inventário muda o prazo do negócio. Vindo de você, é transparência; descoberto depois, é sensação de engano.'),

(8, 'Durante a visita que você acompanha, o cliente pergunta se vale a pena o preço. Você:',
 ARRAY['Dá sua opinião sincera sobre o valor','Devolve a pergunta ao corretor, que responde pelo que promete','Diz que está caro para ajudá-lo a negociar','Compara com outro imóvel que você conhece'],
 1, 'Opinar sobre valor é entrar na negociação. O corretor é quem responde por isso.')
) AS v(position, question, options, correct_index, explanation)
WHERE c.slug = 'nicho-imoveis';

-- ================================================================= MOTOS ====
INSERT INTO public.courses (slug, category, title, subtitle, description, emoji, position, pass_score)
VALUES (
  'nicho-motos',
  'moto',
  'Nicho: Motos',
  'Libera a vitrine de motos',
  'Cilindrada, habilitação e uso real. O que confirmar num anúncio e como não indicar moto que a pessoa nem pode pilotar.',
  '🏍️',
  3,
  70
);

INSERT INTO public.course_lessons (course_id, position, title, summary, content, duration_min)
SELECT c.id, v.position, v.title, v.summary, v.content, v.duration_min
FROM public.courses c,
(VALUES
(1,
 'Habilitação: a primeira pergunta',
 'Sem isso, a indicação morre antes de começar.',
 E'## Categoria A, sempre\n\nQualquer moto acima de 50cc exige **CNH categoria A**. Não existe meio-termo: quem tem só categoria B não pode pilotar, e a loja não entrega.\n\nPergunte logo no início, com naturalidade:\n\n> "Você já tem a categoria A ou está tirando agora?"\n\n## Quem está tirando ainda\n\nNão descarte — acompanhe. A habilitação leva algumas semanas, e quem está no processo já está decidido a comprar. É um dos melhores leads do nicho, só que com prazo.\n\nO que muda é a conduta: nada de pressa, e vale combinar de retomar quando sair a CNH.\n\n## Cuidado com a compra para terceiro\n\nÀs vezes a pessoa compra para o filho, o irmão, o funcionário. Tudo bem — mas confirme quem vai pilotar e se essa pessoa tem habilitação. Moto entregue para quem não pode pilotar vira problema rápido.\n\n## O que você não decide\n\nSe a loja aceita ou não vender para quem ainda não tem CNH, isso é política dela. Não prometa.',
 6),

(2,
 'Cilindrada e uso real',
 'Indicar a moto certa para o que a pessoa vai fazer.',
 E'## A pergunta que organiza tudo\n\n> "Para que você vai usar a moto no dia a dia?"\n\nAs respostas costumam cair em quatro grupos, e cada um pede uma coisa diferente.\n\n**Deslocamento urbano curto.** 125cc a 160cc resolve, gasta pouco e é fácil de manobrar. Moto grande no trânsito parado é peso e calor.\n\n**Trabalho — entrega, aplicativo.** Prioridade é consumo, manutenção barata e peça fácil. Aqui o custo por quilômetro importa mais que desempenho.\n\n**Estrada e viagem.** A partir de 300cc, com carenagem e posição de pilotagem confortável. Moto pequena em rodovia é desgastante e inseguro.\n\n**Lazer e prazer de pilotar.** Aqui entra gosto pessoal — esportiva, custom, trail. Ouça mais do que sugira.\n\n## Primeira moto\n\nSe for a primeira, cilindrada alta é risco real, não conservadorismo. Vale dizer, sem ser paternalista:\n\n> "Muita gente começa numa 160 e troca depois. Não é limitação — é ganhar traquejo com uma moto que perdoa erro."\n\n## O que confirmar no anúncio\n\nAno, quilometragem, se tem manual e chave reserva, e se as revisões foram feitas na concessionária. Em moto, histórico de manutenção pesa mais que em carro.',
 7),

(3,
 'O que olhar antes de indicar',
 'Detalhes que mudam o valor e a segurança.',
 E'## Quilometragem tem outro peso\n\nMoto roda menos que carro. Uma moto com 60 mil km já viveu bastante — em carro, isso é pouco. Referência urbana comum: 8 a 12 mil km por ano.\n\n## Itens que valorizam ou desvalorizam\n\n**Escapamento original.** Trocado por esportivo pode ser irregular e barulhento — e reprova em vistoria.\n\n**Pneus.** Item de segurança e de custo. Pneu no fim significa gasto imediato relevante.\n\n**Corrente e relação.** Desgastadas, é manutenção próxima.\n\n**Queda.** Risco em ponteira de guidão, tampa de motor e carenagem. Se o anúncio não menciona, pergunte à loja — não afirme.\n\n## O que NÃO afirmar\n\n- Que nunca caiu\n- Que a revisão está em dia\n- Que aceita a moto usada na troca\n- Qualquer valor de parcela ou seguro\n\n## Seguro: fale, mas não estime\n\nSeguro de moto costuma pesar mais proporcionalmente que o de carro, e varia muito por modelo, idade do piloto e região. Mencione que existe, sugira cotar — nunca dê número.',
 7),

(4,
 'Conduzindo até a loja',
 'Agendamento e o que orientar.',
 E'## Ao agendar\n\nConfirme com a loja: dia, hora, se a moto está disponível para ver e com quem falar. Test ride é menos comum que test drive — muitas lojas não permitem, por risco. **Não prometa test ride sem confirmar.**\n\n## Oriente o cliente a levar\n\n- CNH categoria A, se for pilotar\n- Documento da moto usada, se houver troca\n- Comprovante de renda, se pretende financiar\n- Capacete, se houver chance de test ride\n\n## Se você acompanhar\n\n- Aperte **"Cheguei na Loja"** ao chegar\n- Apresente o cliente ao vendedor e saia da negociação\n- Deixe a pessoa sentar na moto — em moto, ergonomia decide. Altura do banco e alcance do pé no chão eliminam modelos que pareciam perfeitos na foto\n\n## Depois\n\nUm contato no dia seguinte. Em moto, a objeção mais comum não é preço — é "não me senti confortável nela". Essa informação vale ouro para a próxima indicação.',
 6),

(5,
 'Os erros que queimam a indicação',
 'O que mais dá errado neste nicho.',
 E'## 1. Não perguntar sobre habilitação\n\nIndicar moto para quem não pode pilotar é perder o lead e o tempo de todo mundo.\n\n## 2. Indicar cilindrada alta para iniciante sem comentar\n\nNão é sobre proibir — é sobre a pessoa saber no que está entrando.\n\n## 3. Prometer test ride\n\nMuitas lojas não fazem. Prometer e não ter é decepção na porta.\n\n## 4. Estimar valor de seguro\n\nVaria demais. Sugira cotar.\n\n## 5. Ignorar o uso real\n\nIndicar esportiva para quem vai entregar comida é errar por não perguntar.\n\n## 6. Afirmar que nunca caiu\n\nSó a loja pode dizer. E queda mal reparada é problema que aparece depois.\n\n## Um bom indicador de motos\n\nPergunta antes de indicar, entende que ergonomia decide tanto quanto potência, e sabe que o cliente que está tirando a CNH agora é uma venda com data marcada — não um lead perdido.',
 6)
) AS v(position, title, summary, content, duration_min)
WHERE c.slug = 'nicho-motos';

INSERT INTO public.course_questions (course_id, position, question, options, correct_index, explanation)
SELECT c.id, v.position, v.question, v.options, v.correct_index, v.explanation
FROM public.courses c,
(VALUES
(1, 'Qual habilitação é exigida para pilotar qualquer moto acima de 50cc?',
 ARRAY['Categoria B','Categoria A','Categoria AB obrigatoriamente','Nenhuma até 160cc'],
 1, 'Acima de 50cc exige categoria A. Quem tem só a B não pode pilotar e a loja não entrega.'),

(2, 'O cliente ainda está tirando a categoria A. O melhor a fazer é:',
 ARRAY['Descartar o lead','Acompanhar sem pressa e retomar quando sair a CNH','Indicar mesmo assim e deixar a loja resolver','Sugerir que ele pilote sem habilitação por enquanto'],
 1, 'Quem está tirando a CNH já decidiu comprar. É uma venda com prazo, não um lead perdido.'),

(3, 'Para uso em entregas por aplicativo, o que mais importa?',
 ARRAY['Potência máxima','Consumo, manutenção barata e peça fácil','Design esportivo','Cor da moto'],
 1, 'Em trabalho, o custo por quilômetro decide — não o desempenho.'),

(4, 'Uma moto com 60 mil km deve ser entendida como:',
 ARRAY['Praticamente nova','Já rodou bastante para o padrão de motos','Km irrelevante em motos','Impossível de vender'],
 1, 'Moto roda menos que carro; a referência urbana comum é 8 a 12 mil km por ano.'),

(5, 'O cliente pergunta quanto ficaria o seguro. Você deve:',
 ARRAY['Estimar com base em outra moto parecida','Explicar que varia por modelo, idade e região, e sugerir cotar','Dizer que é barato','Afirmar que moto não precisa de seguro'],
 1, 'Seguro de moto varia muito. Estimar cria expectativa que a cotação real costuma desmentir.'),

(6, 'Sobre test ride, o correto é:',
 ARRAY['Prometer sempre, é padrão do mercado','Confirmar com a loja antes, porque muitas não permitem','Dizer que depende do humor do vendedor','Garantir que basta ter CNH'],
 1, 'Test ride é menos comum que test drive, por risco. Prometer sem confirmar gera decepção na porta.'),

(7, 'O anúncio não menciona se a moto sofreu queda. O correto é:',
 ARRAY['Afirmar que não sofreu','Perguntar à loja antes de responder','Dizer que toda moto já caiu','Ignorar o assunto'],
 1, 'Só a loja pode confirmar. Queda mal reparada gera problema que aparece depois da venda.'),

(8, 'Na loja, por que vale deixar o cliente sentar na moto?',
 ARRAY['Para tirar foto','Porque ergonomia decide: altura do banco e alcance do pé no chão eliminam modelos','Para testar o motor','Para conferir a cor'],
 1, 'Em moto, ergonomia elimina modelos que pareciam perfeitos na foto.')
) AS v(position, question, options, correct_index, explanation)
WHERE c.slug = 'nicho-motos';

-- ================================================================ BARCOS ====
INSERT INTO public.courses (slug, category, title, subtitle, description, emoji, position, pass_score)
VALUES (
  'nicho-barcos',
  'barco',
  'Nicho: Barcos & Lanchas',
  'Libera a vitrine de embarcações',
  'Habilitação náutica, custo de manutenção e vaga em marina — os três assuntos que decidem a compra e quase nunca estão no anúncio.',
  '⛵',
  4,
  70
);

INSERT INTO public.course_lessons (course_id, position, title, summary, content, duration_min)
SELECT c.id, v.position, v.title, v.summary, v.content, v.duration_min
FROM public.courses c,
(VALUES
(1,
 'Habilitação náutica e documentação',
 'O que a pessoa precisa ter antes de navegar.',
 E'## Quem conduz precisa ser habilitado\n\nA Marinha do Brasil exige habilitação para conduzir embarcação de lazer. As categorias mais comuns:\n\n- **Arrais-amador** — navegação interior (rios, lagos, baías) e, com limites, o mar próximo da costa\n- **Mestre-amador** — amplia a área de navegação\n- **Capitão-amador** — navegação em alto-mar\n\nA maioria dos compradores de lancha de lazer precisa do **Arrais**, que se obtém com curso e prova.\n\n## Pergunte no início\n\n> "Você já tem Arrais ou está tirando?"\n\nQuem não tem não fica de fora: muita gente compra e tira em paralelo, e algumas embarcações são usadas com marinheiro contratado. Só não dá para presumir.\n\n## Documentação da embarcação\n\nToda embarcação precisa de registro na Marinha (TIE — Título de Inscrição de Embarcação) e seguro obrigatório DPEM quando aplicável. Se o anúncio não informa a situação, **pergunte à loja**. Documentação náutica irregular é caro e demorado de resolver.\n\n## O que você não afirma\n\nSituação de documentação, débitos, ou se a transferência é simples. Tudo isso é do anunciante.',
 8),

(2,
 'O custo que ninguém conta',
 'Por que o preço do barco é só o começo da conversa.',
 E'## O barco é a menor parte\n\nEm embarcação, o custo de manter costuma surpreender quem está comprando o primeiro. Falar disso com honestidade não perde venda — evita cliente arrependido e devolução.\n\n## Os custos recorrentes\n\n**Vaga em marina.** O maior deles. Varia por região e tamanho da embarcação, e em alguns lugares há fila de espera. Sem vaga, o barco fica em casa sobre carreta — o que muda completamente o uso.\n\n**Manutenção do motor.** Motor de popa e motor de centro têm rotinas e custos diferentes. Água salgada exige mais cuidado que água doce.\n\n**Combustível.** Consumo de lancha é alto e sensível ao peso e ao mar.\n\n**Limpeza de casco.** Incrustação reduz desempenho e aumenta consumo. Em água salgada, é rotina.\n\n**Seguro.** Existe e vale a pena, mas varia muito.\n\n## Como falar disso\n\nSem assustar e sem esconder:\n\n> "Vale já pensar na vaga de marina antes de fechar — em algumas regiões tem fila. A loja consegue te orientar sobre isso."\n\nQuem compra informado volta a comprar. Quem descobre depois some.',
 8),

(3,
 'Ler um anúncio de embarcação',
 'Os dados que realmente importam.',
 E'## O básico que muda o valor\n\n**Ano da embarcação × ano do motor.** São coisas diferentes e frequentemente distantes. Motor repotenciado é comum, e é informação relevante.\n\n**Horas de motor.** É o equivalente à quilometragem. Motor de popa com muitas horas pede atenção.\n\n**Água doce ou salgada.** Embarcação que só navegou em água doce costuma estar mais preservada.\n\n**Tamanho em pés.** Define vaga, carreta, e o tipo de navegação possível.\n\n**Carreta (reboque) inclusa?** Faz diferença grande no uso e no preço.\n\n## Itens que costumam pesar\n\nGPS, sonda, toldo, gerador, ar-condicionado, plataforma de popa. Em embarcação, opcional pesa mais que em carro.\n\n## O que NÃO afirmar\n\n- Que o motor foi revisado\n- Que a documentação está regular\n- Que existe vaga disponível em marina\n- Que a carreta está inclusa, se o anúncio não diz\n\n## Fotos importam mais aqui\n\nCasco, motor aberto e interior. Anúncio com foto só de longe geralmente esconde algo — vale pedir mais imagens à loja antes de indicar.',
 7),

(4,
 'Conduzindo até a visita',
 'Como marcar e o que esperar.',
 E'## Onde a embarcação está\n\nPode estar na marina, no galpão da loja ou na água. Isso muda tudo: ver na água permite avaliar de verdade, ver em galpão permite olhar o casco. Confirme antes e explique ao cliente o que ele vai conseguir ver.\n\n## Test drive náutico\n\nExiste, chama-se **sea trial**, e costuma ser agendado com antecedência — envolve combustível, condição do mar e disponibilidade da tripulação. Não prometa sem confirmar.\n\n## Oriente o cliente a levar\n\n- Documento com foto (marina costuma controlar acesso)\n- Habilitação náutica, se pretende conduzir no sea trial\n- Calçado adequado — sola clara, para não marcar o convés\n\n## Se você acompanhar\n\n- Aperte **"Cheguei na Loja"** ao chegar\n- Apresente ao vendedor e saia da negociação\n- Não opine sobre estado do motor ou do casco; você não é o avaliador\n\n## Vistoria independente\n\nEm embarcação usada de valor alto, é comum e recomendável contratar um vistoriador. Mencionar isso mostra que você conhece o nicho:\n\n> "Em barco usado, muita gente contrata uma vistoria independente antes de fechar. A loja costuma estar acostumada com isso."',
 7),

(5,
 'Os erros que queimam a indicação',
 'O que mais dá errado com embarcações.',
 E'## 1. Não falar dos custos de manutenção\n\nÉ o erro que mais gera arrependimento. Vaga, manutenção e combustível decidem se a pessoa vai usar o barco ou deixá-lo parado.\n\n## 2. Presumir habilitação\n\nPergunte. E lembre que existe a opção de marinheiro contratado.\n\n## 3. Prometer sea trial na hora\n\nEnvolve mar, combustível e agenda. Sempre confirmar.\n\n## 4. Confundir ano do barco com ano do motor\n\nSão informações separadas, e o motor pesa mais no valor.\n\n## 5. Afirmar que existe vaga em marina\n\nVocê não controla isso. Em algumas regiões há fila.\n\n## 6. Opinar sobre o estado do casco\n\nDeixe para o vistoriador. Opinião errada aqui custa caro.\n\n## Um bom indicador de embarcações\n\nSabe que o ciclo é longo e o ticket alto, fala dos custos reais sem medo, e entende que a pergunta sobre vaga de marina costuma ser mais decisiva que a de preço.',
 7)
) AS v(position, title, summary, content, duration_min)
WHERE c.slug = 'nicho-barcos';

INSERT INTO public.course_questions (course_id, position, question, options, correct_index, explanation)
SELECT c.id, v.position, v.question, v.options, v.correct_index, v.explanation
FROM public.courses c,
(VALUES
(1, 'Qual habilitação a maioria dos compradores de lancha de lazer precisa?',
 ARRAY['Categoria A','Arrais-amador','Capitão-amador obrigatoriamente','Nenhuma, para embarcações de lazer'],
 1, 'Arrais-amador cobre navegação interior e, com limites, o mar próximo da costa — o uso mais comum.'),

(2, 'Qual costuma ser o maior custo recorrente de manter uma embarcação?',
 ARRAY['Combustível','Vaga em marina','Limpeza de casco','Seguro'],
 1, 'A vaga é o maior custo fixo, e em algumas regiões há até fila de espera.'),

(3, 'Num anúncio de embarcação, o que equivale à quilometragem de um carro?',
 ARRAY['Tamanho em pés','Horas de motor','Ano do casco','Número de passageiros'],
 1, 'Horas de motor indicam o uso real do conjunto mecânico.'),

(4, 'O cliente quer saber se pode fazer um test drive no mar hoje. Você:',
 ARRAY['Garante que sim, é padrão','Explica que o sea trial precisa ser agendado e confirma com a loja','Diz que não existe test drive em barcos','Sugere que ele pilote sozinho'],
 1, 'Sea trial envolve combustível, condição do mar e tripulação — sempre agendado.'),

(5, 'Uma embarcação que navegou só em água doce tende a estar:',
 ARRAY['Mais desgastada','Mais preservada que uma de água salgada','Sem diferença','Irregular na documentação'],
 1, 'Água salgada é mais agressiva ao casco e ao motor; água doce preserva melhor.'),

(6, 'O anúncio não informa se a carreta está inclusa. Você deve:',
 ARRAY['Afirmar que está, é comum','Perguntar à loja antes de responder','Dizer que carreta nunca vem junto','Ignorar, é detalhe menor'],
 1, 'Carreta muda o uso e o preço. Afirmar sem base gera conflito no fechamento.'),

(7, 'Ao falar dos custos de manutenção com o cliente, o melhor é:',
 ARRAY['Evitar o assunto para não assustar','Tratar com honestidade, porque cliente informado não se arrepende','Minimizar dizendo que é barato','Deixar a loja explicar depois da compra'],
 1, 'Descobrir os custos depois é a maior fonte de arrependimento no nicho.'),

(8, 'Sobre vistoria independente em embarcação usada de valor alto:',
 ARRAY['É desnecessária, a loja já garante','É comum e recomendável mencionar','Só o comprador deve saber disso','Ofende o anunciante'],
 1, 'É prática comum no mercado náutico; mencionar mostra domínio do nicho.')
) AS v(position, question, options, correct_index, explanation)
WHERE c.slug = 'nicho-barcos';

-- =============================================================== JET SKI ====
INSERT INTO public.courses (slug, category, title, subtitle, description, emoji, position, pass_score)
VALUES (
  'nicho-jetski',
  'jetski',
  'Nicho: Jet Ski',
  'Libera a vitrine de jet skis',
  'Habilitação, reboque e horas de uso. Ticket menor que o de lancha, decisão mais rápida — e um conjunto próprio de armadilhas.',
  '🌊',
  5,
  70
);

INSERT INTO public.course_lessons (course_id, position, title, summary, content, duration_min)
SELECT c.id, v.position, v.title, v.summary, v.content, v.duration_min
FROM public.courses c,
(VALUES
(1,
 'Habilitação e regras de uso',
 'O que muita gente descobre tarde demais.',
 E'## Também exige habilitação\n\nJet ski é embarcação para a Marinha, e conduzir exige habilitação — normalmente **Arrais-amador**, a mesma da lancha de lazer. Muita gente compra achando que "é só um brinquedo" e descobre depois.\n\nPergunte cedo:\n\n> "Você já tem Arrais? É a mesma habilitação de lancha."\n\n## Idade mínima\n\nHá idade mínima para obter a habilitação. Se a compra é para um adolescente, isso precisa estar claro antes, não depois.\n\n## Onde pode navegar\n\nExistem áreas restritas, distância mínima da praia e regras locais — que variam por município e por corpo d''água. Você não precisa dominar cada regra, mas precisa não afirmar o que não sabe.\n\nSe o cliente perguntar onde pode andar, o correto é:\n\n> "Isso varia por local e tem regra da Marinha e da prefeitura. Vale confirmar na marina da região onde você vai usar."\n\n## Documentação\n\nRegistro na Marinha, como qualquer embarcação. Situação documental é assunto da loja.',
 6),

(2,
 'Horas de uso e manutenção',
 'O número que mais diz sobre um jet ski usado.',
 E'## Horas, não anos\n\nO indicador mais honesto do estado de um jet ski é a **hora de motor**. Um equipamento de 5 anos com 40 horas está muito melhor conservado que um de 2 anos com 200.\n\nReferência útil: uso recreativo típico fica entre 20 e 50 horas por ano.\n\n## Água salgada cobra mais\n\nJet ski usado em mar exige lavagem do sistema com água doce após cada uso. Quando isso não é feito, o motor sofre. Se o anúncio não diz onde foi usado, **pergunte**.\n\n## Revisões\n\nJet ski tem plano de revisão por horas, não por quilometragem. Revisão em dia é o que separa um usado tranquilo de uma dor de cabeça.\n\n## Itens que acompanham\n\n**Carreta (reboque).** Quase sempre necessária — poucos deixam jet ski na água permanentemente. Confirme se está inclusa.\n\n**Capa, coletes, cabo de segurança.** Itens pequenos, mas que a pessoa vai precisar comprar se não vierem.\n\n## O que NÃO afirmar\n\n- Que as revisões estão em dia\n- Que sempre foi usado em água doce\n- Que a carreta está inclusa\n- Quanto custa a manutenção anual',
 7),

(3,
 'Entender o uso pretendido',
 'Três perfis, três equipamentos diferentes.',
 E'## Pergunte para que vai usar\n\n**Lazer em família.** Prioridade é estabilidade e capacidade — modelos de 3 lugares, com plataforma. Potência extrema atrapalha mais que ajuda.\n\n**Esporte e velocidade.** Aqui entra alta performance, e o cliente costuma saber exatamente o que quer. Ouça.\n\n**Pesca e passeio longo.** Existem modelos com suporte e maior autonomia. Nicho menor, mas específico.\n\n## Onde vai guardar\n\nPergunta que evita frustração:\n\n> "Você já pensou onde vai guardar? Cabe na garagem com a carreta?"\n\nJet ski com carreta ocupa mais espaço do que a maioria imagina. E rebocar exige veículo com engate e capacidade adequada — outro detalhe que costuma passar batido.\n\n## Onde vai usar\n\nSe a pessoa mora longe do mar ou de represa, o uso real será menor do que ela imagina, e isso muda a decisão. Não é sua função desestimular — é sua função perguntar.',
 6),

(4,
 'Conduzindo até a loja',
 'Agendamento e expectativas.',
 E'## Ao agendar\n\nConfirme: dia, hora, se o equipamento pode ser ligado e com quem falar. Teste na água é raro em jet ski usado, e depende de estar próximo de rampa ou marina. **Não prometa.**\n\n## Oriente o cliente a levar\n\n- Documento com foto\n- Habilitação náutica, se houver chance de teste\n- Documento do veículo de reboque, se for levar na hora\n\n## Se você acompanhar\n\n- Aperte **"Cheguei na Loja"** ao chegar\n- Apresente ao vendedor e saia da negociação\n- Deixe o cliente sentar e manobrar parado; ergonomia e peso importam\n\n## O detalhe do transporte\n\nSe a pessoa pretende levar na hora, o carro dela precisa de engate e capacidade. Vale perguntar antes — evita o constrangimento de fechar negócio e não conseguir levar.\n\n## Depois\n\nUm contato no dia seguinte. Em jet ski, a objeção mais comum é logística: onde guardar e como transportar. Se for isso, a loja frequentemente tem solução — vale reencaminhar em vez de desistir.',
 6),

(5,
 'Os erros que queimam a indicação',
 'O que mais dá errado neste nicho.',
 E'## 1. Tratar como brinquedo\n\nExige habilitação, tem regra de navegação e manutenção séria. Quem compra achando o contrário se frustra.\n\n## 2. Ignorar horas de motor\n\nÉ o dado que mais diz sobre o estado. Ano isolado engana.\n\n## 3. Não perguntar sobre guarda e transporte\n\nA logística derruba mais negócios de jet ski do que o preço.\n\n## 4. Afirmar onde pode navegar\n\nRegra varia por local. Encaminhe para a marina da região.\n\n## 5. Prometer teste na água\n\nRaro em usado, depende de rampa e condições.\n\n## 6. Presumir que a carreta vem junto\n\nConfirme sempre. Sem carreta, o custo do cliente sobe de imediato.\n\n## Um bom indicador de jet ski\n\nPergunta sobre habilitação, horas e logística antes de mandar qualquer link — e sabe que o cliente que trava por não ter onde guardar não está perdido, só precisa da solução que a loja costuma ter.',
 6)
) AS v(position, title, summary, content, duration_min)
WHERE c.slug = 'nicho-jetski';

INSERT INTO public.course_questions (course_id, position, question, options, correct_index, explanation)
SELECT c.id, v.position, v.question, v.options, v.correct_index, v.explanation
FROM public.courses c,
(VALUES
(1, 'Conduzir um jet ski exige habilitação?',
 ARRAY['Não, é equipamento de lazer','Sim, normalmente Arrais-amador, a mesma da lancha','Só acima de determinada potência','Apenas em mar aberto'],
 1, 'Jet ski é embarcação para a Marinha e exige habilitação, normalmente o Arrais-amador.'),

(2, 'Qual dado diz mais sobre o estado de um jet ski usado?',
 ARRAY['O ano de fabricação','As horas de motor','A cor','O número de lugares'],
 1, 'Um equipamento de 5 anos com 40 horas está mais preservado que um de 2 anos com 200.'),

(3, 'Jet ski usado em água salgada exige:',
 ARRAY['Nenhum cuidado adicional','Lavagem do sistema com água doce após cada uso','Troca de motor anual','Uso apenas no verão'],
 1, 'Sem essa lavagem, o motor sofre. Por isso vale perguntar onde o equipamento foi usado.'),

(4, 'Para lazer em família, o mais adequado costuma ser:',
 ARRAY['O modelo mais potente disponível','Um modelo estável, de 3 lugares, com plataforma','O menor possível','Qualquer um, não faz diferença'],
 1, 'Estabilidade e capacidade importam mais que potência quando o uso é familiar.'),

(5, 'Que pergunta de logística evita frustração na compra?',
 ARRAY['Qual sua cor preferida?','Onde vai guardar e como vai transportar?','Prefere motor novo ou usado?','Vai usar de manhã ou à tarde?'],
 1, 'Guarda e transporte derrubam mais negócios de jet ski do que o preço.'),

(6, 'O cliente pergunta em quais praias pode navegar. O correto é:',
 ARRAY['Listar as praias que você conhece','Explicar que a regra varia por local e encaminhar à marina da região','Dizer que pode em qualquer lugar','Afirmar que só em represas'],
 1, 'Há regras da Marinha e municipais que variam por local. Afirmar sem saber expõe o cliente.'),

(7, 'Sobre a carreta de reboque, você deve:',
 ARRAY['Presumir que está inclusa','Confirmar com a loja, porque muda o custo imediato do cliente','Dizer que nunca acompanha','Ignorar, é acessório'],
 1, 'Sem carreta, o cliente tem um gasto imediato relevante — e quase ninguém deixa jet ski na água.'),

(8, 'O cliente desiste porque não tem onde guardar. A melhor conduta é:',
 ARRAY['Encerrar o atendimento','Levar a objeção à loja, que costuma ter solução de guarda','Sugerir que ele deixe na rua','Insistir na compra assim mesmo'],
 1, 'Logística é objeção resolvível: muitas lojas e marinas oferecem guarda.')
) AS v(position, question, options, correct_index, explanation)
WHERE c.slug = 'nicho-jetski';
