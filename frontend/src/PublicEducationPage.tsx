import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ArrowRight, BookOpen, CircleHelp, ShieldCheck } from 'lucide-react'

const guides = [
  { slug: 'reserva-de-emergencia', category: 'PLANEJAMENTO', title: 'O que é uma reserva de emergência?', summary: 'Para que serve uma reserva, como estimar uma meta e por que acesso ao dinheiro importa.' },
  { slug: 'selic-cdi-ipca', category: 'INDICADORES', title: 'Selic, CDI e IPCA: qual é a diferença?', summary: 'Um guia introdutório sobre três referências que aparecem com frequência no mercado.' },
  { slug: 'risco-e-prazo', category: 'INVESTIMENTOS', title: 'Como pensar em risco e prazo', summary: 'Entenda oscilação, horizonte de tempo e diversificação antes de comparar opções.' },
  { slug: 'impostos-investimentos', category: 'IMPOSTOS', title: 'Impostos em investimentos: por onde começar', summary: 'Uma visão geral sobre rendimento bruto, líquido e regras que variam por produto.' },
]

const content: Record<string, { title: string; description: string; intro: string; sections: Array<{ heading: string; text: string }> }> = {
  'reserva-de-emergencia': {
    title: 'O que é uma reserva de emergência?',
    description: 'Entenda para que serve uma reserva de emergência, como estimar uma meta pessoal e por que liquidez e segurança merecem atenção.',
    intro: 'Uma reserva de emergência é um valor separado para lidar com despesas inesperadas ou períodos de queda de renda. Ela ajuda a evitar que um imprevisto obrigue você a vender investimentos em um momento ruim ou a recorrer a crédito caro.',
    sections: [
      { heading: 'Como estimar um ponto de partida', text: 'Uma forma simples de começar é somar as despesas essenciais de um mês e multiplicar por alguns meses. O planejamento desta plataforma usa seis meses como referência educativa, mas a meta depende da estabilidade da renda, das responsabilidades e do acesso a outras fontes de apoio.' },
      { heading: 'O que observar ao escolher onde manter', text: 'Para uma reserva, as pessoas costumam avaliar facilidade de resgate, previsibilidade e risco de perda. Confira as regras do produto, o prazo de liquidação, eventuais carências, taxas e a proteção aplicável antes de decidir.' },
      { heading: 'Uma meta pode ser construída aos poucos', text: 'Se ainda não existe uma reserva, uma meta inicial menor pode ajudar a criar o hábito de separar dinheiro. Revise o valor quando suas despesas ou sua situação mudarem.' },
    ],
  },
  'selic-cdi-ipca': {
    title: 'Selic, CDI e IPCA: qual é a diferença?',
    description: 'Veja o significado de Selic, CDI e IPCA e como esses indicadores são usados como referência no mercado brasileiro.',
    intro: 'Selic, CDI e IPCA são indicadores diferentes. Eles aparecem em notícias e na descrição de investimentos, mas cada um mede ou representa algo próprio. Saber a diferença ajuda a ler uma oferta sem confundir taxa, inflação e retorno.',
    sections: [
      { heading: 'Selic', text: 'A Selic é a taxa básica de juros da economia brasileira, definida pelo Comitê de Política Monetária do Banco Central. Ela influencia o custo do crédito e serve de referência para diversas taxas do mercado.' },
      { heading: 'CDI', text: 'O CDI está ligado às operações de empréstimo de curtíssimo prazo entre instituições financeiras. A taxa CDI diária costuma acompanhar de perto a Selic e é usada como referência por produtos de renda fixa.' },
      { heading: 'IPCA', text: 'O IPCA é um índice calculado pelo IBGE para acompanhar a variação de preços de uma cesta de consumo. Ele é uma medida de inflação. Um investimento que menciona IPCA pode combinar a variação do índice com uma taxa adicional, conforme as condições do título.' },
      { heading: 'Confira a fonte e a data', text: 'Indicadores mudam com o tempo. Ao comparar produtos, verifique a taxa vigente, o período de referência, as condições de resgate e se a rentabilidade anunciada é bruta ou líquida.' },
    ],
  },
  'risco-e-prazo': {
    title: 'Como pensar em risco e prazo',
    description: 'Aprenda conceitos de volatilidade, horizonte de investimento e diversificação para comparar opções com mais contexto.',
    intro: 'Risco não significa apenas a possibilidade de perder dinheiro. Também pode envolver oscilação de preço, dificuldade para resgatar, inflação, concentração e incerteza sobre o resultado. O prazo pretendido muda a forma de avaliar esses fatores.',
    sections: [
      { heading: 'Volatilidade e variação de preço', text: 'Ativos negociados no mercado podem mudar de preço ao longo do tempo. Uma queda temporária pode se tornar uma perda realizada se a pessoa precisar vender naquele momento. O histórico de um ativo não garante o que acontecerá no futuro.' },
      { heading: 'Combine o prazo com o objetivo', text: 'Antes de comparar uma aplicação, considere quando o dinheiro poderá ser necessário. Um recurso para uma despesa próxima pode exigir mais previsibilidade e acesso rápido do que um objetivo de longo prazo.' },
      { heading: 'Diversificação não elimina risco', text: 'Distribuir recursos entre diferentes tipos de ativos pode reduzir a dependência de um único investimento, mas não remove a possibilidade de perdas. Entenda o que compõe cada produto e evite investir apenas pelo retorno passado.' },
    ],
  },
  'impostos-investimentos': {
    title: 'Impostos em investimentos: por onde começar',
    description: 'Entenda a diferença entre rendimento bruto e líquido e saiba por que a tributação deve ser verificada para cada produto.',
    intro: 'O valor apresentado como rendimento pode não ser o valor que ficará disponível depois de impostos, taxas e custos. As regras variam conforme o tipo de investimento, o prazo, a operação e a situação da pessoa investidora.',
    sections: [
      { heading: 'Bruto e líquido', text: 'O rendimento bruto é calculado antes dos descontos. O líquido considera os tributos e custos aplicáveis. Ao comparar alternativas, use a mesma base de cálculo e o mesmo prazo para evitar conclusões enganosas.' },
      { heading: 'As regras dependem do produto', text: 'Produtos de renda fixa, fundos, ações e criptoativos podem seguir regras distintas. Algumas aplicações têm condições específicas de isenção ou declaração, que podem mudar com a legislação.' },
      { heading: 'Consulte fontes oficiais', text: 'Antes de declarar ou tomar uma decisão, confira as instruções atuais da Receita Federal e os documentos da instituição onde a aplicação está custodiada. Esta página é introdutória e não substitui orientação contábil ou tributária.' },
    ],
  },
}

export function PublicEducationPage() {
  const location = useLocation()
  const slug = location.pathname.split('/').filter(Boolean)[1]
  const guide = slug ? content[slug] : undefined
  const pageTitle = guide ? `${guide.title} — Finanças` : 'Educação financeira: guias simples para começar — Finanças'
  const description = guide?.description ?? 'Aprenda conceitos de planejamento financeiro, indicadores econômicos, risco e investimentos com guias claros e educativos.'

  useEffect(() => {
    document.title = pageTitle
    document.querySelector('meta[name="description"]')?.setAttribute('content', description)
    if (slug && !guide) {
      let robots = document.querySelector('meta[name="robots"]')
      if (!robots) { robots = document.createElement('meta'); robots.setAttribute('name', 'robots'); document.head.appendChild(robots) }
      robots.setAttribute('content', 'noindex, nofollow')
    } else {
      document.querySelector('meta[name="robots"]')?.remove()
    }
    let schema = document.querySelector<HTMLScriptElement>('script[data-page-schema]')
    if (!schema) {
      schema = document.createElement('script')
      schema.type = 'application/ld+json'
      schema.dataset.pageSchema = 'true'
      document.head.appendChild(schema)
    }
    schema.textContent = JSON.stringify(guide ? { '@context': 'https://schema.org', '@type': 'Article', headline: guide.title, description: guide.description, inLanguage: 'pt-BR', mainEntityOfPage: window.location.href } : { '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'Educação financeira', description, inLanguage: 'pt-BR' })
  }, [description, guide, pageTitle, slug])

  if (slug && !guide) return <main className="education-page"><EducationHeader /><div className="education-not-found"><CircleHelp size={26} /><h1>Não encontramos esse guia.</h1><Link to="/aprender">Voltar à biblioteca</Link></div></main>

  return <main className="education-page"><EducationHeader /><section className="education-hero"><span className="eyebrow"><BookOpen size={14} /> CONTEÚDO EDUCATIVO</span><h1>{guide?.title ?? <>Educação financeira,<br /><em>em linguagem simples.</em></>}</h1><p>{guide?.intro ?? 'Guias objetivos para organizar suas finanças e entender os conceitos que aparecem ao falar de investimentos.'}</p>{guide && <div className="education-meta">Leitura educativa <span>·</span> Revise conceitos e fontes antes de tomar decisões</div>}</section>
    {guide ? <article className="education-article"><div className="article-breadcrumb"><Link to="/aprender">Guias</Link><span>/</span><span>{guide.title}</span></div>{guide.sections.map((section, index) => <section key={section.heading}><span className="article-step">0{index + 1}</span><div><h2>{section.heading}</h2><p>{section.text}</p></div></section>)}<aside className="education-callout"><ShieldCheck size={18} /><p>Conteúdo informativo e educacional. Rentabilidade passada não garante rentabilidade futura. Não é recomendação de investimento.</p></aside><div className="related-guides"><h2>Continue aprendendo</h2><Link to="/aprender">Ver todos os guias <ArrowRight size={15} /></Link></div></article> : <section className="education-guides">{guides.map((item, index) => <Link className="education-guide-card" to={`/aprender/${item.slug}`} key={item.slug}><span className="education-guide-number">0{index + 1}</span><div><span className="guide-category">{item.category}</span><h2>{item.title}</h2><p>{item.summary}</p><span className="guide-read">Ler guia <ArrowRight size={14} /></span></div></Link>)}</section>}
    <footer className="education-footer"><EducationBrand /><p>Conteúdo informativo e educacional. Não é recomendação de investimento.</p><Link to="/cadastro">Criar conta <ArrowRight size={14} /></Link></footer></main>
}

function EducationHeader() {
  return <header className="education-header"><EducationBrand /><nav><Link to="/aprender">Guias</Link><Link to="/login">Entrar</Link><Link to="/cadastro" className="button button-dark button-small">Criar conta <ArrowRight size={14} /></Link></nav></header>
}

function EducationBrand() {
  return <Link to="/" className="brand"><span className="brand-mark"><BookOpen size={17} /></span><span>finanças<span className="brand-period">.</span></span></Link>
}
