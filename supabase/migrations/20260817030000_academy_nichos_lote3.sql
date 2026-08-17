-- Módulos de nicho — lote 3, o último: Turismo, Franquias, Veículos Pesados
-- e Imóveis Comerciais para locação. Fecha os 13 nichos da plataforma.
--
-- Dois voltam a esbarrar em limite legal, com a mesma lógica de Imóveis e
-- Seguros:
--
--  * Franquias — a Lei 13.966/2019 obriga a entrega da Circular de Oferta de
--    Franquia 10 dias antes de qualquer assinatura ou pagamento. Promessa de
--    faturamento por parte de quem indica contamina a negociação inteira.
--  * Imóveis comerciais para locação — intermediar locação também é atividade
--    privativa de corretor com CRECI. O limite é o mesmo do módulo de Imóveis.

-- =============================================================== TURISMO ====
INSERT INTO public.courses (slug, category, title, subtitle, description, emoji, position, pass_score)
VALUES (
  'nicho-turismo',
  'turismo',
  'Nicho: Turismo & Viagens',
  'Libera a vitrine de turismo',
  'Documentação, o que está e o que não está no pacote, e por que prazo é tudo neste nicho.',
  '✈️',
  10,
  70
);

INSERT INTO public.course_lessons (course_id, position, title, summary, content, duration_min)
SELECT c.id, v.position, v.title, v.summary, v.content, v.duration_min
FROM public.courses c,
(VALUES
(1,
 'O que está dentro do pacote',
 'A pergunta que evita a briga no balcão do aeroporto.',
 E'## Pacote nunca inclui tudo\n\nE a diferença entre o que a pessoa imaginou e o que contratou aparece no pior lugar: no destino.\n\n## O que sempre conferir no anúncio\n\n**Aéreo incluso?** Ida e volta, de qual cidade. Saída de outra base muda o preço bastante.\n\n**Bagagem.** Despachada ou só de mão? Hoje muita tarifa não inclui bagagem, e a surpresa acontece no check-in.\n\n**Regime de hospedagem.** Café da manhã, meia pensão, pensão completa ou all inclusive. São coisas bem diferentes.\n\n**Traslado.** Aeroporto e hotel, ida e volta.\n\n**Passeios.** Quais estão inclusos, quais são opcionais pagos à parte.\n\n**Taxas.** Taxa de embarque e taxa de turismo local (cobrada no destino, em alguns lugares) costumam ficar de fora.\n\n**Seguro viagem.** Incluso ou à parte? Obrigatório em alguns destinos.\n\n## A pergunta que resolve\n\n> "Esse valor inclui aéreo, bagagem despachada e traslado? E as refeições, quais entram?"\n\nFeita à agência antes de indicar, evita a maior parte dos conflitos do nicho.\n\n## O que você NÃO afirma\n\nO que não está escrito no anúncio. Peça à agência e repasse a resposta dela.',
 8),

(2,
 'Documentação e prazos',
 'O que impede o embarque — e não tem jeito depois.',
 E'## Documento é eliminatório\n\nNão adianta ter comprado: sem documento, não embarca.\n\n**Voo doméstico.** Documento oficial com foto, dentro da validade.\n\n**Internacional.** Passaporte válido — e muitos países exigem **validade mínima de 6 meses** a partir da entrada. Passaporte que vence em 4 meses barra a viagem.\n\n**Visto.** Depende do destino e da nacionalidade. Prazo de emissão varia de dias a meses.\n\n**Vacinação.** Alguns destinos exigem certificado internacional, com prazo mínimo antes da viagem.\n\n**Menores de idade.** Viajando sem os pais ou com apenas um, existe exigência de autorização. É a causa mais comum de embarque negado com criança.\n\n## As perguntas de triagem\n\n1. Todo mundo do grupo tem passaporte válido? Vence quando?\n2. Vai alguma criança? Viajando com quem?\n3. Já sabe se o destino exige visto ou vacina?\n\nTrês perguntas que evitam vender uma viagem que não vai acontecer.\n\n## O que você NÃO afirma\n\n- Que determinado destino dispensa visto\n- Que a vacina não é exigida\n- Que a autorização de menor não é necessária\n\nRegra de entrada muda, e quem responde é a agência ou o consulado. Encaminhe.',
 8),

(3,
 'Entender a viagem que a pessoa quer',
 'Cinco perguntas antes de mandar qualquer pacote.',
 E'## Pacote errado é dinheiro e férias perdidos\n\n**1. Quantas pessoas e quem são?** Casal, família com criança pequena, grupo de amigos, terceira idade. Muda destino, hotel e ritmo.\n\n**2. Que período?** Datas fixas ou flexíveis? Flexibilidade costuma valer desconto grande.\n\n**3. Alta ou baixa temporada?** Férias escolares, feriado prolongado e Carnaval mudam preço e lotação. Quem pode viajar fora disso deve saber que economiza.\n\n**4. Que tipo de viagem?** Descanso, roteiro cultural, aventura, compras, comemoração. Um resort all inclusive e um roteiro de cidades atendem a desejos opostos.\n\n**5. Já tem orçamento em mente?** Não para limitar — para não indicar o que está fora da realidade e frustrar.\n\n## Indique um roteiro, não um catálogo\n\n> "Pelo que você falou — casal, sem criança, dez dias em setembro e querendo descansar —, esse resort faz sentido: é all inclusive e setembro é baixa temporada lá."\n\n## Antecedência importa\n\nViagem se planeja. Quem procura com seis meses tem preço melhor e mais opção; quem procura com duas semanas paga caro e escolhe pouco. Vale dizer, sem desanimar.',
 7),

(4,
 'Pagamento, alterações e cancelamento',
 'A parte chata que evita processo.',
 E'## O que você pode explicar\n\n- Que a agência costuma parcelar\n- Que existem condições diferentes conforme a antecedência\n- Que pacote tem regras de alteração e cancelamento, definidas em contrato\n\n## O que você NÃO pode\n\n- Prometer reembolso integral em caso de desistência\n- Garantir que a data pode ser trocada sem custo\n- Afirmar que o preço fica congelado\n- Estimar multa de cancelamento\n\n**Regra de cancelamento é a maior fonte de conflito do nicho.** Tarifa aérea promocional costuma ser a mais restritiva, e o cliente raramente sabe disso.\n\n## Diga antes, não depois\n\n> "Vale perguntar para a agência como funciona se precisar remarcar — cada tarifa tem uma regra, e é melhor saber agora do que descobrir depois."\n\nQuem avisa evita a discussão que destrói a relação.\n\n## Câmbio, em viagem internacional\n\nO preço pode estar atrelado ao dólar. Variação até o pagamento é assunto da agência — não estime nem tranquilize.\n\n## Dados pessoais\n\nPassaporte, CPF e data de nascimento de todo o grupo vão pela plataforma. Foto de passaporte em grupo de WhatsApp é exposição desnecessária.',
 7),

(5,
 'Os erros que queimam a indicação',
 'O que mais gera reclamação em turismo.',
 E'## 1. Não conferir o que está incluso\n\nCampeão absoluto. Bagagem e refeição são as descobertas mais comuns no aeroporto.\n\n## 2. Ignorar documentação\n\nPassaporte perto de vencer e autorização de menor barram embarque, e não há recurso na hora.\n\n## 3. Prometer cancelamento sem custo\n\nMaior fonte de conflito. As regras são do contrato.\n\n## 4. Indicar sem perguntar o perfil\n\nResort de festa para quem queria sossego é férias arruinadas.\n\n## 5. Afirmar que o destino não exige visto ou vacina\n\nRegra muda. Encaminhe para a agência.\n\n## 6. Deixar para a última hora\n\nAntecedência é preço e opção. Vale dizer desde o começo.\n\n## 7. Circular documento por WhatsApp\n\nPassaporte é documento completo de identidade. Use a plataforma.\n\n## Um bom indicador de turismo\n\nPergunta sobre documento antes de falar de preço, confere o que está incluso com a agência, e avisa das regras de cancelamento antes de o cliente perguntar — porque em viagem a frustração custa as férias de alguém.',
 7)
) AS v(position, title, summary, content, duration_min)
WHERE c.slug = 'nicho-turismo';

INSERT INTO public.course_questions (course_id, position, question, options, correct_index, explanation)
SELECT c.id, v.position, v.question, v.options, v.correct_index, v.explanation
FROM public.courses c,
(VALUES
(1, 'Qual descoberta mais gera conflito no aeroporto?',
 ARRAY['A cor do hotel','Que a tarifa não incluía bagagem despachada','O nome da companhia','O horário do café'],
 1, 'Muita tarifa não inclui bagagem, e a surpresa acontece no check-in.'),

(2, 'Muitos países exigem passaporte com validade mínima de:',
 ARRAY['1 mês','6 meses a partir da entrada','2 anos','Não há exigência'],
 1, 'Passaporte que vence em poucos meses barra a viagem, mesmo estando válido.'),

(3, 'Criança viajando com apenas um dos pais:',
 ARRAY['Não tem exigência','Pode precisar de autorização — é causa comum de embarque negado','Só precisa de certidão','É proibido'],
 1, 'É a causa mais comum de embarque negado envolvendo menores.'),

(4, 'O cliente pergunta se consegue cancelar e receber tudo de volta. Você:',
 ARRAY['Garante o reembolso integral','Explica que a regra é do contrato e orienta perguntar à agência antes de fechar','Diz que nunca há reembolso','Estima uma multa de 20%'],
 1, 'Regra de cancelamento é a maior fonte de conflito; tarifa promocional costuma ser a mais restritiva.'),

(5, 'Qual pergunta melhor orienta a indicação de um pacote?',
 ARRAY['Quanto você quer gastar?','Que tipo de viagem você quer — descanso, roteiro, aventura?','Prefere avião ou ônibus?','Qual sua cor favorita?'],
 1, 'Resort all inclusive e roteiro cultural atendem desejos opostos; o tipo define tudo.'),

(6, 'Sobre exigência de visto para um destino, você deve:',
 ARRAY['Afirmar com base no que ouviu','Encaminhar à agência ou consulado, porque a regra muda','Dizer que nunca precisa','Consultar um fórum e responder'],
 1, 'Regras de entrada mudam por país e nacionalidade; errar aqui inviabiliza a viagem.'),

(7, 'Viajar fora de alta temporada normalmente:',
 ARRAY['Custa mais caro','Sai mais barato e com menos lotação','Não muda nada','É proibido em alguns destinos'],
 1, 'Férias escolares e feriados elevam preço e lotação; quem tem flexibilidade economiza.'),

(8, 'Os documentos do grupo (passaporte, CPF) devem ser enviados:',
 ARRAY['Por grupo de WhatsApp, é mais rápido','Pelo canal da plataforma','Por e-mail pessoal do indicador','Impressos, entregues em mãos'],
 1, 'Passaporte é documento completo de identidade; circular por fora é exposição desnecessária.')
) AS v(position, question, options, correct_index, explanation)
WHERE c.slug = 'nicho-turismo';

-- ============================================================= FRANQUIAS ====
INSERT INTO public.courses (slug, category, title, subtitle, description, emoji, position, pass_score)
VALUES (
  'nicho-franquias',
  'franquias',
  'Nicho: Franquias',
  'Libera a vitrine de franquias',
  'A Circular de Oferta de Franquia, o investimento total que ninguém mostra no anúncio e por que promessa de faturamento anula negócio.',
  '🏪',
  11,
  70
);

INSERT INTO public.course_lessons (course_id, position, title, summary, content, duration_min)
SELECT c.id, v.position, v.title, v.summary, v.content, v.duration_min
FROM public.courses c,
(VALUES
(1,
 'A Circular de Oferta de Franquia',
 'O documento que a lei obriga, e o prazo que protege o comprador.',
 E'## A COF e os 10 dias\n\nA Lei 13.966/2019 obriga o franqueador a entregar a **Circular de Oferta de Franquia** ao candidato **pelo menos 10 dias antes** de qualquer assinatura ou pagamento — inclusive sinal ou reserva de território.\n\nSe esse prazo não é cumprido, o candidato pode pedir anulação e devolução de tudo que pagou, corrigido.\n\n## O que a COF traz\n\n- Histórico da franqueadora e dos sócios\n- Pendências judiciais\n- Investimento total estimado\n- Taxas: franquia, royalties, fundo de propaganda\n- Perfil do franqueado desejado\n- Situação em relação a marcas registradas\n- Relação de franqueados atuais e dos que saíram nos últimos 24 meses\n\n**Essa última lista é ouro** e quase ninguém usa: são pessoas que viveram a operação e podem ser contatadas.\n\n## O que isso significa para você\n\nSeu papel inclui **lembrar do direito**, não apressar contra ele:\n\n> "Antes de assinar qualquer coisa, você tem direito de receber a COF e ficar 10 dias com ela. Vale ler com calma, e até conversar com franqueados da lista."\n\nIsso não atrapalha a venda. Passa seriedade — e evita anulação depois.\n\n## O que você NÃO faz\n\nApressar assinatura, sugerir pagar sinal para garantir território, ou minimizar o prazo.',
 8),

(2,
 'O investimento que o anúncio não mostra',
 'Taxa de franquia é só a entrada.',
 E'## O número do anúncio engana\n\n"Franquia a partir de R$ 90 mil" normalmente é a **taxa de franquia** — o direito de usar a marca. O investimento total costuma ser bem maior.\n\n## O que compõe o investimento total\n\n**Taxa de franquia.** Pagamento inicial pela marca e pelo modelo.\n\n**Obra e instalação.** Reforma do ponto no padrão da rede. Costuma ser o maior item, e varia muito com o imóvel.\n\n**Equipamentos e estoque inicial.**\n\n**Capital de giro.** O dinheiro para operar nos primeiros meses, antes de a operação se pagar. É o item mais esquecido e o que mais quebra franqueado.\n\n## Custos recorrentes\n\n**Royalties.** Percentual do faturamento, mensal.\n**Fundo de propaganda.** Outro percentual, para marketing da rede.\n**Aluguel do ponto**, folha, tributos.\n\n## Como conversar sobre isso\n\n> "O valor do anúncio costuma ser a taxa de franquia. Vale pedir para eles o investimento total e o capital de giro recomendado — é isso que mostra se cabe no seu bolso."\n\n## O que você NÃO faz\n\nEstimar investimento total, prazo de retorno ou faturamento. Nada disso é seu, e tudo isso está na COF.',
 8),

(3,
 'Entender o candidato',
 'Franquia não serve para qualquer perfil.',
 E'## As perguntas que importam\n\n**1. Vai operar ou ser investidor?** Muita rede exige o franqueado à frente do negócio. Quem quer renda passiva precisa saber disso antes.\n\n**2. Tem experiência no setor?** Não é eliminatório — muita franquia treina do zero. Mas muda a conversa.\n\n**3. Qual capital disponível?** Não só para investir: também para se manter enquanto o negócio não paga.\n\n**4. Já tem ponto ou região em mente?** Território é o ativo mais disputado em franquia.\n\n**5. Qual o horizonte?** Franquia é negócio de anos. Quem espera retorno em meses vai se frustrar.\n\n## A conversa honesta sobre risco\n\nFranquia reduz risco em relação a abrir um negócio do zero, mas **não elimina**. Franqueado quebra. Vale dizer:\n\n> "Franquia dá um modelo pronto e uma marca, o que ajuda muito. Mas continua sendo um negócio, com risco. Quem te mostra os números reais é a franqueadora, na COF."\n\n## O melhor uso da lista de franqueados\n\nIncentive o contato com quem já opera — inclusive com quem saiu. Nenhuma apresentação comercial vale o que uma conversa dessas.',
 7),

(4,
 'Conduzindo até a franqueadora',
 'Como fazer a ponte sem virar consultor.',
 E'## O caminho típico\n\nInteresse, reunião de apresentação, envio da COF, prazo de análise, validação de ponto, assinatura. É longo — de semanas a meses.\n\n## Ao agendar\n\nConfirme: quem apresenta, se é presencial ou remoto, e o que o candidato deve levar. Algumas redes pedem um formulário de perfil antes.\n\n## Durante\n\nVocê apresenta e sai. Não responda pergunta sobre número, contrato ou território — mesmo que saiba.\n\n## O que você pode reforçar, e deve\n\n- O direito aos 10 dias com a COF\n- A importância de ler o contrato com um advogado\n- O valor de conversar com franqueados atuais e antigos\n\nParece que atrapalha a venda. Faz o contrário: candidato que decide informado não desiste no meio nem processa depois.\n\n## Depois\n\n> "Conseguiu conversar com eles? Recebeu a circular?"\n\nAcompanhe sem pressionar. Neste nicho, pressa é sinal de alerta para qualquer candidato atento — e usar pressa contra alguém que vai investir a poupança da vida não é aceitável.',
 7),

(5,
 'Os erros que queimam a indicação',
 'O que dá errado, e o que pode anular o negócio.',
 E'## 1. Prometer faturamento ou lucro\n\nO erro mais grave. Além de desonesto, promessa de resultado feita por quem indica contamina a negociação e alimenta pedido de anulação.\n\n## 2. Apressar a assinatura\n\nO prazo de 10 dias com a COF é direito. Atropelar pode derrubar o contrato inteiro depois.\n\n## 3. Falar só da taxa de franquia\n\nO candidato monta o orçamento errado e descobre o investimento real tarde demais.\n\n## 4. Esquecer o capital de giro\n\nÉ o que mais quebra franqueado, e o que menos aparece na conversa.\n\n## 5. Estimar retorno\n\n"Se paga em dois anos" é chute com aparência de dado.\n\n## 6. Desestimular a conversa com franqueados\n\nQuem faz isso está escondendo algo. Você nunca deve ser essa pessoa.\n\n## 7. Opinar sobre cláusula de contrato\n\nContrato de franquia é longo e técnico. Advogado, sempre.\n\n## Um bom indicador de franquias\n\nEntende que está diante de alguém prestes a investir a reserva de uma vida. Lembra do direito à COF antes que perguntem, fala do investimento total e não da taxa, e não tem pressa nenhuma — porque aqui a pressa é do lado errado da mesa.',
 7)
) AS v(position, title, summary, content, duration_min)
WHERE c.slug = 'nicho-franquias';

INSERT INTO public.course_questions (course_id, position, question, options, correct_index, explanation)
SELECT c.id, v.position, v.question, v.options, v.correct_index, v.explanation
FROM public.courses c,
(VALUES
(1, 'A Circular de Oferta de Franquia deve ser entregue:',
 ARRAY['No dia da assinatura','Pelo menos 10 dias antes de qualquer assinatura ou pagamento','Depois do pagamento do sinal','Somente se o candidato pedir'],
 1, 'É exigência da Lei 13.966/2019; descumprir permite anulação e devolução dos valores.'),

(2, 'O valor anunciado "franquia a partir de R$ 90 mil" costuma ser:',
 ARRAY['O investimento total','A taxa de franquia, apenas','O faturamento mensal','O lucro anual'],
 1, 'O total inclui obra, equipamentos, estoque e capital de giro — bem acima da taxa.'),

(3, 'Qual item mais esquecido é também o que mais quebra franqueado?',
 ARRAY['O letreiro da loja','O capital de giro','O uniforme','O treinamento'],
 1, 'É o dinheiro para operar antes de a operação se pagar; sem ele o negócio morre cedo.'),

(4, 'A lista de franqueados atuais e dos que saíram serve para:',
 ARRAY['Nada, é burocracia','Conversar com quem viveu a operação — vale mais que qualquer apresentação','Comparar preços','Recrutar funcionários'],
 1, 'É informação obrigatória na COF e a fonte mais honesta sobre a rede.'),

(5, 'O candidato pergunta em quanto tempo recupera o investimento. Você:',
 ARRAY['Estima dois anos','Explica que os números estão na COF e são da franqueadora','Garante retorno rápido','Diz que depende da sorte'],
 1, 'Estimar retorno é chute com aparência de dado, e promessa de resultado contamina a negociação.'),

(6, 'O candidato quer pagar um sinal hoje para garantir o território. A conduta correta é:',
 ARRAY['Incentivar, território é disputado','Lembrar do direito aos 10 dias com a COF antes de qualquer pagamento','Sugerir pagar metade','Dizer que sinal não existe'],
 1, 'Pagamento antes do prazo legal pode derrubar o contrato depois — inclusive sinal.'),

(7, 'Sobre o contrato de franquia, você deve:',
 ARRAY['Explicar as cláusulas que conhece','Recomendar leitura com advogado','Dizer que é padrão e não precisa ler','Resumir os pontos principais'],
 1, 'Contrato de franquia é longo e técnico; opinar sobre cláusula não é seu papel.'),

(8, 'Franquia comparada a abrir um negócio do zero:',
 ARRAY['Elimina o risco','Reduz o risco, mas não elimina — franqueado também quebra','Garante lucro','Tem o mesmo risco'],
 1, 'Modelo pronto e marca ajudam, mas continua sendo negócio com risco.')
) AS v(position, question, options, correct_index, explanation)
WHERE c.slug = 'nicho-franquias';

-- ====================================================== VEÍCULOS PESADOS ====
INSERT INTO public.courses (slug, category, title, subtitle, description, emoji, position, pass_score)
VALUES (
  'nicho-veiculos-pesados',
  'veiculos_pesados',
  'Nicho: Veículos Pesados',
  'Libera a vitrine de caminhões e máquinas',
  'Habilitação, configuração de eixos e documentação de transportador. Ticket alto, comprador técnico e decisão por planilha.',
  '🚛',
  12,
  70
);

INSERT INTO public.course_lessons (course_id, position, title, summary, content, duration_min)
SELECT c.id, v.position, v.title, v.summary, v.content, v.duration_min
FROM public.courses c,
(VALUES
(1,
 'Habilitação e quem é o comprador',
 'Aqui o cliente entende mais do produto que você.',
 E'## As categorias\n\n- **C** — veículos de carga acima de 3,5 toneladas\n- **D** — transporte de passageiros acima de 8 lugares\n- **E** — combinações com unidade acoplada acima de 6 toneladas, o caso de carreta e bitrem\n\nQuem vai dirigir precisa da categoria certa. E há exigência de tempo prévio de habilitação para subir de categoria.\n\n## O comprador deste nicho\n\nÉ diferente de todos os outros: normalmente é **caminhoneiro autônomo ou transportadora**, e o veículo é **ferramenta de trabalho**, não bem de consumo.\n\nIsso muda tudo. Ele decide por planilha: custo por quilômetro, consumo, valor de revenda, disponibilidade de peça na estrada. E ele conhece o produto melhor que você — provavelmente muito melhor.\n\n## A postura certa\n\nNão tente parecer especialista. Funciona melhor assim:\n\n> "Você entende mais de caminhão do que eu. Me diz o que você precisa que eu te ligo com quem tem."\n\nHonestidade aqui gera respeito. Fingir conhecimento técnico é a maneira mais rápida de perder o lead.\n\n## Documentação de transportador\n\nQuem transporta carga para terceiros precisa de registro próprio na ANTT. Se o cliente perguntar, encaminhe — não afirme prazos nem exigências.',
 8),

(2,
 'Configuração: o que os números significam',
 'Toco, truck, traçado, bitrem — e por que isso define o negócio.',
 E'## A nomenclatura de eixos\n\nA configuração aparece como 4x2, 6x2, 6x4, 8x2. O primeiro número é o total de rodas; o segundo, quantas são tracionadas.\n\n- **Toco (4x2)** — dois eixos. Urbano, carga menor.\n- **Truck (6x2)** — três eixos, um trativo. Mais carga, uso rodoviário.\n- **Traçado (6x4)** — três eixos, dois trativos. Terreno ruim, obra, fora de estrada.\n- **Cavalo mecânico** — puxa semirreboque. Aqui entram carreta, bitrem, rodotrem.\n\n## Por que importa\n\nDefine capacidade legal de carga, consumo e onde o veículo pode rodar. Indicar um toco para quem transporta 25 toneladas é erro grosseiro — e o cliente percebe na primeira frase.\n\n## O que sempre conferir no anúncio\n\n**Quilometragem.** Em pesados, a escala é outra: 500 mil km pode ser um veículo com vida longa pela frente.\n\n**Motorização e ano.** Norma de emissão muda por período e afeta manutenção e revenda.\n\n**Implemento incluso?** Baú, graneleiro, tanque, prancha. Muda muito o valor.\n\n**Histórico de manutenção.** Em pesado, vale mais que em qualquer outro veículo.\n\n**Pneus.** Jogo completo de pesado é investimento relevante por si só.\n\n## O que NÃO afirmar\n\nCapacidade legal de carga, situação de documentação, ou que o implemento acompanha se o anúncio não diz.',
 8),

(3,
 'Entender a operação',
 'Perguntas que fazem sentido para quem vive do veículo.',
 E'## Pergunte sobre o trabalho, não sobre o gosto\n\n**1. Que tipo de carga?** Granel, frigorificada, líquida, container, indivisível. Define implemento e configuração.\n\n**2. Que rota?** Urbana, regional, longa distância. Serra e estrada ruim mudam a exigência de potência e tração.\n\n**3. Autônomo ou frota?** Frota compra diferente — padroniza marca por causa de peça e manutenção.\n\n**4. Tem veículo na troca?** Comum e relevante. Modelo, ano e quilometragem.\n\n**5. Vai financiar?** Existem linhas específicas para veículo pesado, com regras próprias, e o comprador costuma conhecê-las.\n\n## O que pesa na decisão\n\nCusto por quilômetro rodado, e não preço de etiqueta. Rede de assistência na rota dele. Disponibilidade de peça. Valor de revenda em três, cinco anos.\n\nSe você entender isso, já conversa melhor que a maioria.\n\n## Prazo é dinheiro parado\n\nCaminhão parado não fatura. Quem está trocando de veículo tem pressa real, e agilidade no agendamento vale mais que desconto.',
 7),

(4,
 'Conduzindo até a loja',
 'O que confirmar antes e como se comportar.',
 E'## Ao agendar\n\nConfirme: dia, hora, se o veículo está no pátio e disponível para ligar, e com quem falar. Pesado às vezes está em outra filial ou em preparação — deslocamento perdido aqui é longo e caro.\n\n## Oriente o cliente a levar\n\n- CNH na categoria correspondente\n- Documento do veículo da troca, se houver\n- Documentação da empresa, se for compra em nome de PJ\n- Documentos para financiamento, se for o caso\n\n## Test drive\n\nExiste, mas depende de habilitação compatível e de política da loja. Confirme antes; não prometa.\n\n## Se você acompanhar\n\n- Aperte **"Cheguei na Loja"** ao chegar\n- Apresente e saia da negociação\n- Deixe o cliente examinar. Ele vai olhar motor, chassi, quinta roda, pneu, cabine — e sabe o que procura\n\n## Vistoria e laudo\n\nEm pesado usado é comum contratar avaliação independente. Mencionar mostra que você entende o mercado:\n\n> "Muita gente pede uma avaliação por fora antes de fechar. A loja costuma estar acostumada."\n\n## Depois\n\nUm contato objetivo. Este comprador não gosta de rodeio.',
 7),

(5,
 'Os erros que queimam a indicação',
 'O que mais dá errado com comprador técnico.',
 E'## 1. Fingir conhecimento técnico\n\nO erro fatal do nicho. Ele percebe na primeira frase, e a partir daí não confia em mais nada que você disser.\n\n## 2. Indicar configuração errada\n\nToco para quem carrega 25 toneladas mostra que você não perguntou nada.\n\n## 3. Afirmar capacidade de carga\n\nÉ legal e depende de configuração, eixos e documentação. Loja responde.\n\n## 4. Ignorar a rota\n\nServa e estrada de terra mudam a exigência de tração. Perguntar é o básico.\n\n## 5. Presumir que o implemento acompanha\n\nBaú e prancha valem muito. Confirme sempre.\n\n## 6. Tratar quilometragem com régua de carro\n\n500 mil km em pesado não é o que 500 mil km seria num automóvel.\n\n## 7. Demorar no agendamento\n\nCaminhão parado não fatura. Agilidade vale mais que desconto.\n\n## Um bom indicador de veículos pesados\n\nAdmite que o cliente entende mais do produto, pergunta sobre a operação em vez de sobre gosto, e resolve rápido — porque o comprador aqui está com dinheiro parado enquanto decide.',
 7)
) AS v(position, title, summary, content, duration_min)
WHERE c.slug = 'nicho-veiculos-pesados';

INSERT INTO public.course_questions (course_id, position, question, options, correct_index, explanation)
SELECT c.id, v.position, v.question, v.options, v.correct_index, v.explanation
FROM public.courses c,
(VALUES
(1, 'Para conduzir uma carreta, a categoria exigida é:',
 ARRAY['B','C','E','D'],
 2, 'A categoria E cobre combinações com unidade acoplada acima de 6 toneladas.'),

(2, 'Numa configuração 6x4, o segundo número indica:',
 ARRAY['A quantidade de portas','Quantas rodas são tracionadas','O ano do modelo','A capacidade em toneladas'],
 1, 'O primeiro é o total de rodas, o segundo as tracionadas — 6x4 é o traçado.'),

(3, 'Qual postura funciona melhor com este comprador?',
 ARRAY['Demonstrar domínio técnico do produto','Admitir que ele entende mais e focar em conectá-lo com quem tem o veículo','Falar de design e conforto','Insistir no desconto'],
 1, 'Fingir conhecimento técnico é o erro fatal: ele percebe na primeira frase.'),

(4, 'Como interpretar 500 mil km num caminhão?',
 ARRAY['Veículo no fim da vida','Pode ter vida longa pela frente — a escala é outra em pesados','Igual a 500 mil km num carro','Impossível de financiar'],
 1, 'Pesados são projetados para quilometragens muito maiores que automóveis.'),

(5, 'O que mais pesa na decisão deste comprador?',
 ARRAY['A cor da cabine','O custo por quilômetro rodado e a rede de assistência na rota','O som interno','A marca ser famosa'],
 1, 'O veículo é ferramenta de trabalho; a decisão sai de planilha, não de gosto.'),

(6, 'O anúncio não diz se o baú acompanha. Você deve:',
 ARRAY['Presumir que sim','Confirmar com a loja antes de responder','Dizer que implemento nunca vem junto','Ignorar, é detalhe'],
 1, 'Implemento muda muito o valor; presumir gera conflito no fechamento.'),

(7, 'Por que agilidade no agendamento importa tanto aqui?',
 ARRAY['Porque a loja fecha cedo','Porque caminhão parado não fatura, e o comprador tem pressa real','Porque o preço muda toda hora','Porque o vendedor tem meta'],
 1, 'Quem está trocando de veículo está com o negócio parado enquanto decide.'),

(8, 'O cliente pergunta a capacidade legal de carga do veículo. Você:',
 ARRAY['Calcula pelo número de eixos','Encaminha à loja, porque depende de configuração e documentação','Diz que é o dobro do peso do veículo','Afirma que não há limite'],
 1, 'Capacidade legal envolve configuração, eixos e documentação — quem responde é a loja.')
) AS v(position, question, options, correct_index, explanation)
WHERE c.slug = 'nicho-veiculos-pesados';

-- ============================================ IMÓVEIS COMERCIAIS (LOCAÇÃO) ==
INSERT INTO public.courses (slug, category, title, subtitle, description, emoji, position, pass_score)
VALUES (
  'nicho-imoveis-comerciais',
  'imoveis_comerciais_locacao',
  'Nicho: Imóveis Comerciais',
  'Libera a vitrine de locação comercial',
  'Locação comercial tem lei própria, ponto vale dinheiro e o inquilino precisa saber o custo real de ocupação antes de assinar.',
  '🏢',
  13,
  70
);

INSERT INTO public.course_lessons (course_id, position, title, summary, content, duration_min)
SELECT c.id, v.position, v.title, v.summary, v.content, v.duration_min
FROM public.courses c,
(VALUES
(1,
 'O mesmo limite de sempre: CRECI',
 'Intermediar locação também é atividade privativa de corretor.',
 E'## Locação é intermediação\n\nVale aqui exatamente o que vale no módulo de Imóveis: **intermediar locação é atividade privativa de corretor com CRECI** (Lei 6.530/1978). Não muda por ser comercial em vez de residencial.\n\n## O que você PODE\n\n- Apresentar o imóvel anunciado\n- Explicar o que está publicado\n- Agendar a visita com a imobiliária\n- Acompanhar\n- Receber sua comissão de indicação\n\n## O que você NÃO pode\n\n- Negociar valor de aluguel, carência ou prazo\n- Discutir cláusula, garantia ou reajuste\n- Redigir ou opinar sobre proposta\n- Se apresentar como corretor\n- Receber valores do interessado\n\n## Por que a tentação é maior aqui\n\nEm locação comercial quase tudo é negociável: carência para obra, desconto escalonado nos primeiros meses, participação do proprietário na reforma. O cliente vai puxar essa conversa — e é justamente onde você não entra.\n\n> "Carência e condição quem trata é o corretor responsável. Eu marco a visita e ele conduz essa parte."\n\n## A lei do inquilinato tem regras próprias para comercial\n\nA locação não residencial tem particularidades, inclusive quanto à renovação do contrato para quem tem ponto estabelecido. É assunto da imobiliária e de advogado — nunca seu.',
 8),

(2,
 'O custo real de ocupar',
 'Aluguel é só uma parte da conta.',
 E'## O que compõe o custo mensal\n\n**Aluguel.**\n\n**Condomínio.** Em shopping e centro comercial pode ser alto, com rateio de despesas variáveis.\n\n**IPTU.** Em comercial, quase sempre por conta do locatário.\n\n**Fundo de promoção.** Em shopping, é adicional e obrigatório.\n\n**Aluguel percentual.** Em shopping é comum pagar o maior valor entre o mínimo e um percentual do faturamento.\n\n**Energia e água.** Em ponto comercial com equipamento pesado, pode ser expressivo.\n\n## A conta que muda a decisão\n\nSomando tudo, o custo de ocupação costuma superar bem o valor anunciado. Quem monta o orçamento só pelo aluguel descobre tarde.\n\n> "O valor do anúncio é o aluguel. Vale pedir para a imobiliária o custo total com condomínio e IPTU — é isso que entra na sua conta todo mês."\n\n## Garantia da locação\n\nComercial costuma exigir garantia: fiador, caução, seguro-fiança ou carta de fiança bancária. Cada uma tem custo e exigência diferente, e é comum travar negócio.\n\nPergunte cedo — sem entrar no mérito:\n\n> "Você já pensou em qual garantia pretende usar? A imobiliária explica as opções que aceita."',
 8),

(3,
 'Entender a operação do inquilino',
 'O ponto certo depende do negócio, não do metro quadrado.',
 E'## As perguntas que importam\n\n**1. Que tipo de negócio?** Loja de rua, escritório, restaurante, clínica, galpão. Cada um tem exigência própria.\n\n**2. Precisa de que estrutura?** Restaurante precisa de exaustão, gordura, ponto de gás. Clínica precisa de adequação sanitária. Galpão precisa de pé-direito e acesso de caminhão. Descobrir depois inviabiliza.\n\n**3. Quanto de fluxo precisa?** Loja de rua vive de passagem; escritório não se importa.\n\n**4. Quantos funcionários e vagas?**\n\n**5. Qual prazo pretende ficar?** Quem vai investir em obra precisa de contrato longo para diluir.\n\n## Alvará e uso permitido\n\nO ponto crítico do nicho: **nem todo imóvel aceita qualquer atividade.** Zoneamento e regras do condomínio limitam. Restaurante, som ao vivo e serviço de saúde são os que mais esbarram.\n\nO que você faz:\n\n> "Vale confirmar com a imobiliária se o imóvel aceita a sua atividade e se a região permite. Melhor descobrir agora."\n\nO que você não faz: afirmar que vai conseguir alvará.\n\n## Reforma e carência\n\nQuem vai reformar costuma negociar meses de carência. Assunto do corretor — você só sabe que existe, para encaminhar.',
 8),

(4,
 'Conduzindo até a visita',
 'Como marcar e o que observar.',
 E'## Ao agendar\n\nConfirme: dia, hora, se há chaves disponíveis, e se o imóvel está ocupado. Ponto comercial em funcionamento exige combinação com o inquilino atual, e visita fora de hora atrapalha a operação dele.\n\n## Oriente o cliente a levar\n\n- Documento com foto\n- Se possível, medidas ou layout que pretende instalar\n- Dados da empresa, se já quiser adiantar análise cadastral\n\n## O que vale observar junto\n\nSem opinar, mas prestando atenção — vira informação útil:\n\n- Fluxo de pessoas no horário do negócio dele\n- Carga e descarga: onde para o caminhão\n- Vizinhança e concorrência na quadra\n- Estado da instalação elétrica, se o negócio exige carga\n\n## Se você acompanhar\n\n- Aperte **"Cheguei na Loja"** ao chegar\n- Apresente ao corretor e saia da negociação\n- Não estime custo de reforma\n\n## Depois\n\n> "O ponto atendeu o que você precisava?"\n\nA resposta costuma ser específica — falta de estrutura, fluxo baixo, custo total alto — e cada uma delas orienta sua próxima indicação.',
 7),

(5,
 'Os erros que queimam a indicação',
 'O que mais dá errado em locação comercial.',
 E'## 1. Entrar na negociação\n\nO mesmo erro do módulo de Imóveis, com a mesma consequência legal. E aqui a tentação é maior, porque tudo é negociável.\n\n## 2. Afirmar que o imóvel aceita a atividade\n\nZoneamento e regra de condomínio limitam. É a causa número um de contrato desfeito no nicho.\n\n## 3. Falar só do aluguel\n\nCondomínio, IPTU e fundo de promoção mudam completamente a conta.\n\n## 4. Ignorar a estrutura necessária\n\nRestaurante sem exaustão, clínica sem adequação, galpão sem acesso — inviabilidades que aparecem tarde.\n\n## 5. Prometer carência ou desconto\n\nExiste, é comum, e é do corretor.\n\n## 6. Marcar visita sem combinar com o inquilino atual\n\nAtrapalha a operação de alguém e queima a imobiliária.\n\n## 7. Estimar custo de reforma\n\nNão é sua área e o erro é caro.\n\n## Um bom indicador de imóveis comerciais\n\nPergunta primeiro qual é o negócio, depois qual é o imóvel. Levanta a questão do alvará antes de todo mundo. Fala do custo total, não do aluguel. E devolve toda negociação ao corretor — porque a linha aqui é a mesma dos imóveis residenciais, e ela é de lei.',
 7)
) AS v(position, title, summary, content, duration_min)
WHERE c.slug = 'nicho-imoveis-comerciais';

INSERT INTO public.course_questions (course_id, position, question, options, correct_index, explanation)
SELECT c.id, v.position, v.question, v.options, v.correct_index, v.explanation
FROM public.courses c,
(VALUES
(1, 'Intermediar locação comercial exige CRECI?',
 ARRAY['Não, só compra e venda exige','Sim — locação também é intermediação privativa de corretor','Só em shopping','Só acima de determinado valor'],
 1, 'A regra é a mesma da compra e venda; não muda por ser locação nem por ser comercial.'),

(2, 'Além do aluguel, o que costuma compor o custo mensal em ponto comercial?',
 ARRAY['Apenas a energia','Condomínio, IPTU e, em shopping, fundo de promoção','Somente o IPTU','Nada além do aluguel'],
 1, 'O custo de ocupação supera bem o valor anunciado; quem orça só pelo aluguel descobre tarde.'),

(3, 'Qual é a causa número um de contrato desfeito neste nicho?',
 ARRAY['O preço do aluguel','O imóvel não aceitar a atividade pretendida, por zoneamento ou condomínio','A cor da fachada','O tamanho da vitrine'],
 1, 'Restaurante, som ao vivo e serviços de saúde são os que mais esbarram em alvará e uso permitido.'),

(4, 'O cliente pede carência de três meses para fazer a obra. Você:',
 ARRAY['Negocia com a imobiliária','Explica que condição é com o corretor responsável e encaminha','Promete dois meses','Diz que carência não existe'],
 1, 'Carência é condição contratual — negociar é intermediação, atividade privativa de corretor.'),

(5, 'Qual pergunta deve vir antes de mostrar qualquer imóvel?',
 ARRAY['Quanto você pode pagar?','Que tipo de negócio você vai instalar e que estrutura ele precisa?','Prefere andar alto ou baixo?','Você gosta da região?'],
 1, 'Exaustão, adequação sanitária e acesso de caminhão inviabilizam pontos que pareciam perfeitos.'),

(6, 'Sobre garantia da locação comercial:',
 ARRAY['Nunca é exigida','Costuma ser exigida — fiador, caução, seguro-fiança ou carta bancária','É sempre caução de um mês','O indicador escolhe qual usar'],
 1, 'Cada modalidade tem custo e exigência própria, e é comum travar o fechamento.'),

(7, 'O imóvel está ocupado por outro inquilino. Ao agendar, você deve:',
 ARRAY['Marcar em qualquer horário','Combinar com a imobiliária, porque a visita afeta a operação de quem está lá','Ir sem avisar','Pedir para o cliente entrar sozinho'],
 1, 'Visita fora de hora atrapalha o negócio de alguém e queima a imobiliária.'),

(8, 'O cliente pergunta quanto custaria a reforma para adaptar o ponto. Você:',
 ARRAY['Estima com base em outra obra','Explica que não é sua área e sugere orçamento com profissional','Garante que sai barato','Sugere fazer sem projeto'],
 1, 'Estimar obra não é sua área, e o erro nessa conta é caro para quem vai investir.')
) AS v(position, question, options, correct_index, explanation)
WHERE c.slug = 'nicho-imoveis-comerciais';
