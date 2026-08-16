-- Módulo de nicho: Carros. Serve de modelo para os outros 12 — mesma
-- estrutura (5 aulas + 8 questões) e mesmo tom: prático, com o que dizer e o
-- que não dizer, sem virar manual de vendas agressivas.

INSERT INTO public.courses (slug, category, title, subtitle, description, emoji, position, pass_score)
VALUES (
  'nicho-carros',
  'carro',
  'Nicho: Veículos & SUVs',
  'Libera a vitrine de carros',
  'O que olhar num anúncio de veículo, como conduzir a conversa até o test drive e os erros que fazem o cliente desistir.',
  '🚗',
  1,
  70
);

INSERT INTO public.course_lessons (course_id, position, title, summary, content, duration_min)
SELECT c.id, v.position, v.title, v.summary, v.content, v.duration_min
FROM public.courses c,
(VALUES
(1,
 'Ler um anúncio de veículo',
 'Os dados que realmente importam e o que você precisa conferir antes de indicar.',
 E'## Antes de indicar, leia o anúncio inteiro\n\nIndicar um carro que não atende a pessoa gera visita frustrada — e visita frustrada não vira venda nem comissão.\n\n## O que sempre conferir\n\n**Ano do modelo × ano de fabricação.** São coisas diferentes. Um "2023/2024" é fabricado em 2023, modelo 2024. Isso muda o valor de revenda e é a primeira pergunta de comprador experiente.\n\n**Quilometragem.** Referência de mercado é cerca de 10 a 15 mil km por ano. Muito abaixo pode indicar carro parado por muito tempo (o que traz seus próprios problemas); muito acima exige manutenção mais próxima.\n\n**Versão / motorização.** "Corolla" não diz nada — existe GLi, XEi, Altis, e o preço muda dezenas de milhares. Sempre cite a versão completa.\n\n**Câmbio.** Manual, automático, CVT, automatizado. É critério eliminatório para muita gente, principalmente em cidade grande.\n\n**Único dono / procedência.** Se o anúncio informa, vale mencionar. Se não informa, **não invente** — pergunte à loja.\n\n## O que NÃO afirmar sem confirmação da loja\n\n- Que não tem sinistro ou passagem por leilão\n- Que a garantia de fábrica está ativa\n- Que aceita determinado carro na troca\n- Qualquer número de parcela ou taxa\n\nEsses quatro pontos são exatamente os que geram conflito depois. Todos são da loja.',
 7),

(2,
 'Descobrir o carro certo para a pessoa',
 'Quatro perguntas que evitam indicar o veículo errado.',
 E'## Pergunte antes de mandar link\n\nMandar cinco anúncios de uma vez é o jeito mais rápido de não vender nenhum. Quatro perguntas resolvem:\n\n**1. Uso principal.** Cidade, estrada, trabalho por aplicativo, família grande? Um SUV para quem só roda no centro é gasto desnecessário; um hatch pequeno para família de cinco não serve.\n\n**2. Tem carro na troca?** Muda completamente o cálculo. Se tem, pergunte modelo, ano e km — a loja precisa disso para avaliar.\n\n**3. À vista ou financiado?** Se financiado, tem entrada? Isso define a faixa real de preço, que quase nunca é a que a pessoa fala primeiro.\n\n**4. Prazo.** "Preciso essa semana" e "estou olhando para o ano que vem" pedem condutas opostas. No segundo caso, insistir afasta.\n\n## Traduza para uma indicação só\n\nCom as respostas, mande **um** anúncio — no máximo dois — explicando por que aquele:\n\n> "Pelo que você falou — família, viagem no fim de semana e financiado com entrada —, esse aqui faz sentido: é automático, tem porta-malas grande e está dentro da faixa que você comentou."\n\nIsso é indicação. O resto é sorteio.',
 7),

(3,
 'Conduzindo até o test drive',
 'Como marcar a visita e o que orientar o cliente a levar.',
 E'## O test drive é o momento decisivo\n\nEm carro, quem senta ao volante compra ou descarta ali. Seu papel é fazer esse encontro acontecer **sem atrito**.\n\n## Ao agendar\n\nConfirme com a loja: dia, hora, se o carro estará disponível para rodar e com quem o cliente deve falar. Chegar e o carro não estar pronto é a pior experiência possível — e o cliente associa isso a você.\n\n## Oriente o cliente a levar\n\n- CNH válida (sem ela não há test drive)\n- Documento do carro da troca, se houver\n- Comprovante de renda, se pretende financiar\n\nEssa orientação simples evita a segunda viagem — que muitas vezes não acontece.\n\n## Se você for acompanhar\n\nAcompanhar presencialmente costuma render comissão bem maior. Estando lá:\n\n- Aperte **"Cheguei na Loja"** ao chegar — é o que dispara a confirmação do anunciante\n- Apresente o cliente ao vendedor e **saia da negociação**\n- Não opine sobre preço, nem para ajudar\n\nSua presença serve para dar segurança ao cliente e comprovar sua indicação, não para negociar.\n\n## Depois da visita\n\nUm único contato, no dia seguinte, com pergunta aberta:\n\n> "E aí, o que achou do carro?"\n\nSe a resposta for morna, não empurre. Pergunte o que faltou — essa informação vale ouro para a próxima indicação.',
 7),

(4,
 'Financiamento sem prometer o que não é seu',
 'Como falar de crédito sem criar expectativa falsa.',
 E'## A regra de ouro\n\n> Quem aprova crédito é o banco. Nunca você, nunca a loja.\n\nDizer "seu crédito passa fácil" é a promessa mais perigosa do nicho. Quando não passa, a frustração recai sobre quem prometeu.\n\n## O que você pode explicar\n\n- Como funciona o processo: a loja envia a ficha para bancos parceiros e cada um responde com sua condição\n- Que a entrada influencia a aprovação e a parcela\n- Que a análise leva em conta renda, histórico e restrições\n- Que a resposta costuma sair no mesmo dia ou em até 48h\n\n## O que você NÃO pode\n\n- Garantir aprovação\n- Prometer taxa ou número de parcela\n- Dizer que "não consulta SPC/Serasa" — praticamente todo financiamento consulta\n- Orientar a pessoa a omitir ou alterar informação na ficha (isso é fraude, e responsabiliza você junto)\n\n## Como falar quando perguntam "quanto fica a parcela?"\n\n> "Isso depende da entrada, do prazo e da análise do banco. A loja simula na hora com seus dados e te dá o número exato — quer que eu já agende?"\n\nVocê respondeu com honestidade e ainda avançou para a visita.\n\n## Se a simulação for pela plataforma\n\nA comissão de venda por financiamento é liberada quando o anunciante conclui o contrato. Os dados sensíveis (CPF, renda, nascimento) devem ir **pela plataforma**, nunca pelo seu WhatsApp pessoal.',
 7),

(5,
 'Os erros que queimam a indicação',
 'O que mais faz cliente desistir em veículos.',
 E'## 1. Mandar link demais\n\nSete anúncios geram paralisia, não escolha. Um ou dois, com justificativa.\n\n## 2. Falar de preço antes da loja\n\n"Acho que sai por uns X" cria âncora. Se a loja disser mais, você virou o culpado.\n\n## 3. Esconder informação ruim\n\nSe o carro tem um detalhe conhecido (retorno de sinistro, segundo dono, km alta), é melhor sair de você, com naturalidade, do que ser descoberto na visita. Cliente que se sente enganado não volta — e comenta.\n\n## 4. Insistir depois do silêncio\n\nDois follow-ups, no máximo. Depois, encerre com a porta aberta.\n\n## 5. Prometer test drive que não está confirmado\n\nSempre confirme com a loja antes de dar dia e hora.\n\n## 6. Sumir depois da visita\n\nO oposto do erro 4 também custa caro. Um contato no dia seguinte mostra cuidado — e é nesse contato que muita venda travada destrava.\n\n## Um bom indicador de veículos\n\nFaz poucas indicações, bem escolhidas, e acompanha até o fim. Quem dispara link para todo mundo tem taxa de conversão baixa, reputação ruim e acaba sem acesso aos melhores anúncios.',
 6)
) AS v(position, title, summary, content, duration_min)
WHERE c.slug = 'nicho-carros';

INSERT INTO public.course_questions (course_id, position, question, options, correct_index, explanation)
SELECT c.id, v.position, v.question, v.options, v.correct_index, v.explanation
FROM public.courses c,
(VALUES
(1, 'Um anúncio diz "2023/2024". O que isso significa?',
 ARRAY['Foi vendido em 2023 e emplacado em 2024','Fabricado em 2023, modelo 2024','Tem dois anos de uso','Teve dois donos'],
 1, 'O primeiro número é o ano de fabricação e o segundo o do modelo — isso afeta o valor de revenda.'),

(2, 'O cliente pergunta se o carro tem passagem por leilão e o anúncio não informa. O correto é:',
 ARRAY['Dizer que não tem, já que o anúncio não menciona','Confirmar com a loja antes de responder','Dizer que isso não importa','Afirmar que todo carro de loja é procedente'],
 1, 'Procedência é informação que só a loja pode confirmar. Afirmar sem base gera conflito na visita.'),

(3, 'Qual pergunta é mais útil logo no início da conversa?',
 ARRAY['Quanto você quer gastar?','Qual vai ser o uso principal do carro?','Você fecha hoje?','Prefere preto ou branco?'],
 1, 'O uso principal define a categoria certa. Preço declarado no início quase nunca é a faixa real.'),

(4, 'O cliente vai fazer test drive. O que orientá-lo a levar?',
 ARRAY['Apenas o cartão de crédito','CNH válida e, se for o caso, documento da troca e comprovante de renda','Nada, a loja resolve tudo','Somente CPF'],
 1, 'Sem CNH não há test drive; os demais documentos evitam uma segunda viagem.'),

(5, 'Quantos anúncios convém enviar após entender a necessidade?',
 ARRAY['Quantos mais, melhor','Um ou dois, explicando o porquê','No mínimo cinco, para dar opção','Todos os da categoria'],
 1, 'Excesso de opção gera paralisia. Indicação boa é curada, não volume.'),

(6, 'O cliente pergunta o valor da parcela. A melhor resposta é:',
 ARRAY['Estimar um valor aproximado para adiantar','Explicar que depende da entrada, do prazo e da análise do banco, e oferecer agendar a simulação','Garantir que cabe no orçamento dele','Afirmar que a taxa é a menor do mercado'],
 1, 'Parcela depende de entrada, prazo e análise do banco. Estimar cria expectativa que pode não se confirmar.'),

(7, 'Ao acompanhar o cliente na loja, você deve:',
 ARRAY['Negociar o preço junto com ele','Apresentar o cliente, apertar "Cheguei na Loja" e sair da negociação','Sugerir o desconto que acha justo','Falar em nome da loja'],
 1, 'Sua presença comprova a indicação e dá segurança ao cliente; negociação é da loja.'),

(8, 'O carro tem quilometragem alta e o cliente ainda não perguntou. O ideal é:',
 ARRAY['Não mencionar para não atrapalhar','Informar com naturalidade antes da visita','Mencionar só se ele perguntar','Dizer que km alta não importa'],
 1, 'Informação ruim descoberta na visita gera sensação de engano; vinda de você, gera confiança.')
) AS v(position, question, options, correct_index, explanation)
WHERE c.slug = 'nicho-carros';
