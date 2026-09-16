/* ============================================================
   Sofia Ferraz — internationalisation
   Locales: en-US (source), pt-BR, es-ES
   ------------------------------------------------------------
   Usage in markup:
     data-i18n="key"            → sets textContent (safe default)
     data-i18n-html="key"       → sets innerHTML (curated strings only,
                                  e.g. those containing <em>)
     data-i18n-attr="aria-label:key, placeholder:key"
                                → sets attributes
   ============================================================ */
(function (global) {
  'use strict';

  const DICT = {
    /* ───────────────────────────  ENGLISH (US)  ─────────────────────────── */
    'en-US': {
      'meta.title': 'Sofia Ferraz — Brand Identity & Strategic Design Studio',
      'meta.description': 'Sofia Ferraz is a brand identity designer based in Porto. Strategic positioning and visual identity for brands that want to be perceived as luxury in their market.',

      'lang.label': 'Language',
      'lang.current': 'English',

      'nav.about': 'About',
      'nav.services': 'Services',
      'nav.work': 'Work',
      'nav.words': 'Testimonials',
      'nav.contact': 'Contact',
      'nav.cta': 'Get in touch',
      'nav.discoveryCall': 'Book a call',
      'nav.menuOpen': 'Open menu',
      'nav.menuClose': 'Close menu',
      'nav.home': 'Sofia Ferraz — home',
      'nav.skip': 'Skip to content',

      'hero.titleSerif': 'Strategic design',
      'hero.titleSans': 'for <strong>memorable</strong> brands.',
      'hero.lede': 'Strategic positioning and visual identity for brands that want to be perceived as luxury in their market.',
      'hero.cta1': 'I want an authentic brand',
      'hero.imageAlt': 'Hands sketching a brand mark on the studio desk',

      'marquee.items': ['Strategy', 'Brand identity', 'Packaging', 'Social media design'],

      'about.title': 'About',
      'about.p1': 'Hi! I’m Sofia Ferraz, a designer specialised in Branding and Visual Identity.',
      'about.p2': 'I believe a strong brand goes beyond a beautiful aesthetic: it has to communicate its essence, convey value, and build a genuine connection with its audience. That’s why I develop strategic, original visual identities for brands that want to position themselves in a more sophisticated, authentic, and memorable way.',
      'about.p3': 'My process brings together strategy, creativity, and close attention to detail to turn stories, values, and goals into unique visual systems — from symbols and typography to every element that builds a consistent brand presence.',
      'about.p4': 'Along the way I’ve developed projects for brands in Brazil, the United States, Portugal, and Sweden, helping businesses strengthen their image and be perceived as more valuable by their audience.',
      'about.stat1': 'Years in practice',
      'about.stat2': 'Brands created',
      'about.stat3': 'Countries served',
      'about.badgeEst': 'Since',
      'about.imageAlt': 'Sofia Ferraz working on her laptop in the studio',

      'services.title': 'Services',
      'services.branding.title': 'Branding &amp;<br />Visual Identity',
      'services.branding.desc': 'Have a brand recognised for its authenticity. With a strategic branding and visual identity process, your brand communicates its values clearly, strengthens its positioning and builds lasting connections with your audience.',
      'services.branding.cta': 'I want an authentic brand',
      'services.branding.imageAlt': 'Label design for the Flor de Lórien scented candle',
      'services.social.title': 'Social media design',
      'services.social.desc': 'Social media is one of the main touchpoints of your brand. I create designs aligned with your visual identity to communicate your message clearly, strengthen your positioning and generate more recognition.',
      'services.social.cta': 'I want post designs',

      'work.eyebrow': 'Selected work',
      'work.title': 'Projects',
      'work.subtitle': 'Some brands that were born here',
      'work.note': 'Each project is a long conversation about restraint. A small selection of recent identities, chosen for the range they show.',
      'work.viewProject': 'View project',
      'work.loading': 'Loading projects…',
      'work.empty': 'Selected projects are being updated. In the meantime, see the full archive on Behance.',
      'work.viewAll': 'View full archive on Behance',
      'work.sourceNote': 'Synced from Behance',

      'pull.quote': '“Brands of value don’t need to ask for <em>attention</em>. They are <em>perceived</em>.”',

      'words.eyebrow': 'Testimonials',
      'words.1.quote': '“Gostaria de expressar meu mais profundo apreço pela Sofia. Sua capacidade de superar expectativas é notável, criando uma arte de identidade visual que está exatamente dentro do que foi proposto e ainda assim excedeu nossas expectativas. Demonstrou empatia, compreensão e uma dedicação excepcional, sempre prestativa e criativa. Suas formas de trabalho inovadoras beneficiaram enormemente nossa equipe. Recomendo fortemente para qualquer projeto futuro.”',
      'words.1.name': 'Gabriel',
      'words.1.role': 'Prime Lights',
      'words.2.quote': '“O trabalho de branding ficou excelente! Sofia é uma profissional dedicada, atenciosa e extremamente educada, sempre preocupada em entregar o melhor resultado. Demonstrou grande conhecimento técnico, criatividade e cuidado em cada detalhe do projeto. A comunicação foi clara e eficiente do início ao fim, o que tornou todo o processo muito tranquilo. Sem dúvidas, recomendo e trabalharia novamente com ela.”',
      'words.2.name': 'Isabela',
      'words.2.role': 'Rigueras',
      'words.3.quote': '“Fiquei 5 anos sem uma identidade visual definida para a minha marca. Foi algo feito sem muito planejamento na época, não refletia minha identidade e valores. Esse ano, com a marca crescendo cada dia mais, senti que já era hora de modernizar e amadurecer, e foi assim que iniciei o processo com a Sofia. Ela me orientou em todas as etapas e juntas criamos toda identidade visual da marca, traduzindo a essência do meu trabalho e de tudo que eu gostaria de transmitir. Ficou tudo perfeito, não tenho palavras para agradecer toda a dedicação da Sofia nesse projeto.”',
      'words.3.name': 'Bruna',
      'words.3.role': 'Veterinária',

      'contact.eyebrow': 'Contact',
      'contact.title': 'Let’s make something <em>timeless.</em>',
      'contact.lede': 'I take on a small number of projects each season so each one gets my full attention. Tell me a little about yours.',
      'contact.basedIn': 'Based in',
      'contact.basedInValue': 'Porto, Portugal',
      'form.name': 'Your name',
      'form.email': 'Email address',
      'form.company': 'Company',
      'form.optional': '(optional)',
      'form.message': 'Tell me about your project',
      'form.submit': 'Send enquiry',
      'form.error': 'Please add your name, a valid email, and a short note.',
      'form.success': 'Thank you — your note is on its way. I’ll reply within two business days.',

      'footer.toTop': 'Back to top',
      'footer.rights': 'Sofia Ferraz Studio. All rights reserved.',
      'footer.backHome': 'Sofia Ferraz — back to top',

      'project.back': 'All work',
      'project.year': 'Year',
      'project.client': 'Client',
      'project.role': 'Role',
      'project.services': 'Services',
      'project.viewOnBehance': 'View on Behance',
      'project.next': 'Next project',
      'project.prev': 'Previous project',
      'project.notFound': 'That project could not be found.',
      'project.notFoundCta': 'Back to all work',
      'project.gallery': 'Project gallery',
      'project.cta': 'Have something similar in mind?',
      'project.ctaLink': 'Start a project'
    },

    /* ─────────────────────────  PORTUGUÊS (BRASIL)  ───────────────────────── */
    'pt-BR': {
      'meta.title': 'Sofia Ferraz — Branding e Identidade Visual | Design Estratégico',
      'meta.description': 'Sofia Ferraz é designer de branding e identidade visual no Porto. Posicionamento estratégico e identidades visuais para marcas que querem ser percebidas como luxo no seu mercado.',

      'lang.label': 'Idioma',
      'lang.current': 'Português',

      'nav.about': 'Sobre',
      'nav.services': 'Serviços',
      'nav.work': 'Projetos',
      'nav.words': 'Depoimentos',
      'nav.contact': 'Contato',
      'nav.cta': 'Fale comigo',
      'nav.discoveryCall': 'Agendar call',
      'nav.menuOpen': 'Abrir menu',
      'nav.menuClose': 'Fechar menu',
      'nav.home': 'Sofia Ferraz — início',
      'nav.skip': 'Ir para o conteúdo',

      'hero.titleSerif': 'Design estratégico',
      'hero.titleSans': 'para marcas <strong>memoráveis.</strong>',
      'hero.lede': 'Posicionamento estratégico e identidade visual para marcas que querem ser percebidas como luxo no mercado.',
      'hero.cta1': 'Quero uma marca autêntica',
      'hero.imageAlt': 'Mãos desenhando um esboço de marca sobre a mesa do estúdio',

      'marquee.items': ['Estratégia', 'Identidade de marca', 'Embalagem', 'Design social mídia'],

      'about.title': 'Sobre',
      'about.p1': 'Olá! Sou Sofia Ferraz, designer especializada em Branding e Identidade Visual.',
      'about.p2': 'Acredito que uma marca forte vai além de uma estética bonita: ela precisa comunicar sua essência, transmitir valor e criar uma conexão verdadeira com o público. Por isso, desenvolvo identidades visuais estratégicas e autorais para marcas que desejam se posicionar de forma mais sofisticada, autêntica e memorável no mercado.',
      'about.p3': 'Meu processo une estratégia, criatividade e um olhar atento aos detalhes para transformar histórias, valores e objetivos em sistemas visuais únicos, desde símbolos e tipografias até todos os elementos que constroem uma presença de marca consistente.',
      'about.p4': 'Ao longo da minha trajetória, desenvolvi projetos para marcas do Brasil, Estados Unidos, Portugal e Suécia, ajudando negócios a fortalecerem sua imagem e a serem percebidos com mais valor pelo público.',
      'about.stat1': 'Anos de atuação',
      'about.stat2': 'Marcas criadas',
      'about.stat3': 'Países atendidos',
      'about.badgeEst': 'Desde',
      'about.imageAlt': 'Sofia Ferraz trabalhando no notebook em seu estúdio',

      'services.title': 'Serviços',
      'services.branding.title': 'Branding e<br />Identidade Visual',
      'services.branding.desc': 'Tenha uma marca reconhecida pela sua autenticidade. Com um processo estratégico de branding e identidade visual, sua marca comunica seus valores com clareza, fortalece seu posicionamento e cria conexões duradouras com o público.',
      'services.branding.cta': 'Quero uma marca autêntica',
      'services.branding.imageAlt': 'Rótulo da vela aromática Flor de Lórien',
      'services.social.title': 'Design para rede social',
      'services.social.desc': 'As redes sociais são um dos principais pontos de contato da sua marca. Crio designs alinhados à sua identidade visual para comunicar sua mensagem com clareza, fortalecer seu posicionamento e gerar mais reconhecimento.',
      'services.social.cta': 'Quero designs de posts',

      'work.eyebrow': 'Projetos selecionados',
      'work.title': 'Projetos',
      'work.subtitle': 'Algumas marcas que nasceram aqui',
      'work.note': 'Cada projeto é uma longa conversa sobre contenção. Uma pequena seleção de identidades recentes, escolhidas pela amplitude que revelam.',
      'work.viewProject': 'Ver projeto',
      'work.loading': 'Carregando projetos…',
      'work.empty': 'Os projetos selecionados estão sendo atualizados. Por enquanto, veja o arquivo completo no Behance.',
      'work.viewAll': 'Ver arquivo completo no Behance',
      'work.sourceNote': 'Sincronizado do Behance',

      'pull.quote': '“Marcas de valor não precisam pedir <em>atenção</em>. Elas são <em>percebidas</em>.”',

      'words.eyebrow': 'Depoimentos',
      'words.1.quote': '“Gostaria de expressar meu mais profundo apreço pela Sofia. Sua capacidade de superar expectativas é notável, criando uma arte de identidade visual que está exatamente dentro do que foi proposto e ainda assim excedeu nossas expectativas. Demonstrou empatia, compreensão e uma dedicação excepcional, sempre prestativa e criativa. Suas formas de trabalho inovadoras beneficiaram enormemente nossa equipe. Recomendo fortemente para qualquer projeto futuro.”',
      'words.1.name': 'Gabriel',
      'words.1.role': 'Prime Lights',
      'words.2.quote': '“O trabalho de branding ficou excelente! Sofia é uma profissional dedicada, atenciosa e extremamente educada, sempre preocupada em entregar o melhor resultado. Demonstrou grande conhecimento técnico, criatividade e cuidado em cada detalhe do projeto. A comunicação foi clara e eficiente do início ao fim, o que tornou todo o processo muito tranquilo. Sem dúvidas, recomendo e trabalharia novamente com ela.”',
      'words.2.name': 'Isabela',
      'words.2.role': 'Rigueras',
      'words.3.quote': '“Fiquei 5 anos sem uma identidade visual definida para a minha marca. Foi algo feito sem muito planejamento na época, não refletia minha identidade e valores. Esse ano, com a marca crescendo cada dia mais, senti que já era hora de modernizar e amadurecer, e foi assim que iniciei o processo com a Sofia. Ela me orientou em todas as etapas e juntas criamos toda identidade visual da marca, traduzindo a essência do meu trabalho e de tudo que eu gostaria de transmitir. Ficou tudo perfeito, não tenho palavras para agradecer toda a dedicação da Sofia nesse projeto.”',
      'words.3.name': 'Bruna',
      'words.3.role': 'Veterinária',

      'contact.eyebrow': 'Contato',
      'contact.title': 'Vamos criar algo <em>atemporal.</em>',
      'contact.lede': 'Aceito um número reduzido de projetos por temporada para dar atenção total a cada um. Conte-me um pouco sobre o seu.',
      'contact.basedIn': 'Baseada em',
      'contact.basedInValue': 'Porto, Portugal',
      'form.name': 'Seu nome',
      'form.email': 'E-mail',
      'form.company': 'Empresa',
      'form.optional': '(opcional)',
      'form.message': 'Conte-me sobre seu projeto',
      'form.submit': 'Enviar mensagem',
      'form.error': 'Informe seu nome, um e-mail válido e uma breve mensagem.',
      'form.success': 'Obrigada — sua mensagem está a caminho. Responderei em até dois dias úteis.',

      'footer.toTop': 'Voltar ao topo',
      'footer.rights': 'Sofia Ferraz Studio. Todos os direitos reservados.',
      'footer.backHome': 'Sofia Ferraz — voltar ao topo',

      'project.back': 'Todos os projetos',
      'project.year': 'Ano',
      'project.client': 'Cliente',
      'project.role': 'Atuação',
      'project.services': 'Serviços',
      'project.viewOnBehance': 'Ver no Behance',
      'project.next': 'Próximo projeto',
      'project.prev': 'Projeto anterior',
      'project.notFound': 'Não foi possível encontrar esse projeto.',
      'project.notFoundCta': 'Voltar para os projetos',
      'project.gallery': 'Galeria do projeto',
      'project.cta': 'Tem algo parecido em mente?',
      'project.ctaLink': 'Iniciar um projeto'
    },

    /* ────────────────────────────  ESPAÑOL (ES)  ──────────────────────────── */
    'es-ES': {
      'meta.title': 'Sofia Ferraz — Branding e Identidad Visual | Diseño Estratégico',
      'meta.description': 'Sofia Ferraz es diseñadora de branding e identidad visual en Oporto. Posicionamiento estratégico e identidad visual para marcas que quieren ser percibidas como lujo en su mercado.',

      'lang.label': 'Idioma',
      'lang.current': 'Español',

      'nav.about': 'Sobre mí',
      'nav.services': 'Servicios',
      'nav.work': 'Proyectos',
      'nav.words': 'Testimonios',
      'nav.contact': 'Contacto',
      'nav.cta': 'Hablemos',
      'nav.discoveryCall': 'Reservar llamada',
      'nav.menuOpen': 'Abrir menú',
      'nav.menuClose': 'Cerrar menú',
      'nav.home': 'Sofia Ferraz — inicio',
      'nav.skip': 'Ir al contenido',

      'hero.titleSerif': 'Diseño estratégico',
      'hero.titleSans': 'para marcas <strong>memorables.</strong>',
      'hero.lede': 'Posicionamiento estratégico e identidad visual para marcas que quieren ser percibidas como lujo en su mercado.',
      'hero.cta1': 'Quiero una marca auténtica',
      'hero.imageAlt': 'Manos dibujando un boceto de marca sobre la mesa del estudio',

      'marquee.items': ['Estrategia', 'Identidad de marca', 'Packaging', 'Diseño para redes sociales'],

      'about.title': 'Sobre mí',
      'about.p1': '¡Hola! Soy Sofia Ferraz, diseñadora especializada en Branding e Identidad Visual.',
      'about.p2': 'Creo que una marca fuerte va más allá de una estética bonita: necesita comunicar su esencia, transmitir valor y crear una conexión verdadera con el público. Por eso desarrollo identidades visuales estratégicas y de autor para marcas que desean posicionarse de forma más sofisticada, auténtica y memorable en el mercado.',
      'about.p3': 'Mi proceso une estrategia, creatividad y una mirada atenta al detalle para transformar historias, valores y objetivos en sistemas visuales únicos, desde símbolos y tipografías hasta todos los elementos que construyen una presencia de marca consistente.',
      'about.p4': 'A lo largo de mi trayectoria he desarrollado proyectos para marcas de Brasil, Estados Unidos, Portugal y Suecia, ayudando a los negocios a fortalecer su imagen y a ser percibidos con más valor por su público.',
      'about.stat1': 'Años de práctica',
      'about.stat2': 'Marcas creadas',
      'about.stat3': 'Países atendidos',
      'about.badgeEst': 'Desde',
      'about.imageAlt': 'Sofia Ferraz trabajando en su portátil en el estudio',

      'services.title': 'Servicios',
      'services.branding.title': 'Branding e<br />Identidad Visual',
      'services.branding.desc': 'Ten una marca reconocida por su autenticidad. Con un proceso estratégico de branding e identidad visual, tu marca comunica sus valores con claridad, fortalece su posicionamiento y crea conexiones duraderas con el público.',
      'services.branding.cta': 'Quiero una marca auténtica',
      'services.branding.imageAlt': 'Etiqueta de la vela aromática Flor de Lórien',
      'services.social.title': 'Diseño para redes sociales',
      'services.social.desc': 'Las redes sociales son uno de los principales puntos de contacto de tu marca. Creo diseños alineados con tu identidad visual para comunicar tu mensaje con claridad, fortalecer tu posicionamiento y generar más reconocimiento.',
      'services.social.cta': 'Quiero diseños de posts',

      'work.eyebrow': 'Proyectos seleccionados',
      'work.title': 'Proyectos',
      'work.subtitle': 'Algunas marcas que nacieron aquí',
      'work.note': 'Cada proyecto es una larga conversación sobre la contención. Una pequeña selección de identidades recientes, elegidas por el rango que muestran.',
      'work.viewProject': 'Ver proyecto',
      'work.loading': 'Cargando proyectos…',
      'work.empty': 'Los proyectos seleccionados se están actualizando. Mientras tanto, consulta el archivo completo en Behance.',
      'work.viewAll': 'Ver archivo completo en Behance',
      'work.sourceNote': 'Sincronizado desde Behance',

      'pull.quote': '“Las marcas de valor no necesitan pedir <em>atención</em>. Son <em>percibidas</em>.”',

      'words.eyebrow': 'Testimonios',
      'words.1.quote': '“Gostaria de expressar meu mais profundo apreço pela Sofia. Sua capacidade de superar expectativas é notável, criando uma arte de identidade visual que está exatamente dentro do que foi proposto e ainda assim excedeu nossas expectativas. Demonstrou empatia, compreensão e uma dedicação excepcional, sempre prestativa e criativa. Suas formas de trabalho inovadoras beneficiaram enormemente nossa equipe. Recomendo fortemente para qualquer projeto futuro.”',
      'words.1.name': 'Gabriel',
      'words.1.role': 'Prime Lights',
      'words.2.quote': '“O trabalho de branding ficou excelente! Sofia é uma profissional dedicada, atenciosa e extremamente educada, sempre preocupada em entregar o melhor resultado. Demonstrou grande conhecimento técnico, criatividade e cuidado em cada detalhe do projeto. A comunicação foi clara e eficiente do início ao fim, o que tornou todo o processo muito tranquilo. Sem dúvidas, recomendo e trabalharia novamente com ela.”',
      'words.2.name': 'Isabela',
      'words.2.role': 'Rigueras',
      'words.3.quote': '“Fiquei 5 anos sem uma identidade visual definida para a minha marca. Foi algo feito sem muito planejamento na época, não refletia minha identidade e valores. Esse ano, com a marca crescendo cada dia mais, senti que já era hora de modernizar e amadurecer, e foi assim que iniciei o processo com a Sofia. Ela me orientou em todas as etapas e juntas criamos toda identidade visual da marca, traduzindo a essência do meu trabalho e de tudo que eu gostaria de transmitir. Ficou tudo perfeito, não tenho palavras para agradecer toda a dedicação da Sofia nesse projeto.”',
      'words.3.name': 'Bruna',
      'words.3.role': 'Veterinária',

      'contact.eyebrow': 'Contacto',
      'contact.title': 'Creemos algo <em>atemporal.</em>',
      'contact.lede': 'Acepto un número reducido de proyectos cada temporada para dedicar a cada uno toda mi atención. Cuéntame un poco sobre el tuyo.',
      'contact.basedIn': 'Con base en',
      'contact.basedInValue': 'Porto, Portugal',
      'form.name': 'Tu nombre',
      'form.email': 'Correo electrónico',
      'form.company': 'Empresa',
      'form.optional': '(opcional)',
      'form.message': 'Cuéntame sobre tu proyecto',
      'form.submit': 'Enviar mensaje',
      'form.error': 'Añade tu nombre, un correo válido y una nota breve.',
      'form.success': 'Gracias — tu mensaje está en camino. Responderé en un plazo de dos días laborables.',

      'footer.toTop': 'Volver arriba',
      'footer.rights': 'Sofia Ferraz Studio. Todos los derechos reservados.',
      'footer.backHome': 'Sofia Ferraz — volver arriba',

      'project.back': 'Todos los proyectos',
      'project.year': 'Año',
      'project.client': 'Cliente',
      'project.role': 'Rol',
      'project.services': 'Servicios',
      'project.viewOnBehance': 'Ver en Behance',
      'project.next': 'Siguiente proyecto',
      'project.prev': 'Proyecto anterior',
      'project.notFound': 'No se ha encontrado ese proyecto.',
      'project.notFoundCta': 'Volver a los proyectos',
      'project.gallery': 'Galería del proyecto',
      'project.cta': '¿Tienes algo parecido en mente?',
      'project.ctaLink': 'Iniciar un proyecto'
    }
  };

  const LOCALES = [
    { code: 'en-US', short: 'EN', label: 'English' },
    { code: 'pt-BR', short: 'PT', label: 'Português' },
    { code: 'es-ES', short: 'ES', label: 'Español' }
  ];

  const FALLBACK = 'en-US';
  const STORAGE_KEY = 'sf-locale';

  let current = FALLBACK;
  const listeners = [];

  function detect() {
    // 1. explicit ?lang= override  2. stored choice  3. browser  4. fallback
    try {
      const param = new URLSearchParams(global.location.search).get('lang');
      if (param && DICT[normalise(param)]) return normalise(param);
    } catch (e) { /* ignore */ }

    try {
      const stored = global.localStorage.getItem(STORAGE_KEY);
      if (stored && DICT[stored]) return stored;
    } catch (e) { /* storage may be blocked */ }

    const langs = (global.navigator.languages || [global.navigator.language || '']);
    for (const l of langs) {
      const n = normalise(l);
      if (DICT[n]) return n;
    }
    return FALLBACK;
  }

  function normalise(code) {
    if (!code) return FALLBACK;
    const c = String(code).replace('_', '-');
    if (DICT[c]) return c;
    const base = c.split('-')[0].toLowerCase();
    if (base === 'pt') return 'pt-BR';
    if (base === 'es') return 'es-ES';
    if (base === 'en') return 'en-US';
    return FALLBACK;
  }

  function t(key, locale) {
    const loc = locale || current;
    const table = DICT[loc] || DICT[FALLBACK];
    const val = table[key];
    if (val !== undefined) return val;
    const fb = DICT[FALLBACK][key];
    return fb !== undefined ? fb : key;
  }

  /* Apply translations to any subtree */
  function apply(root) {
    const scope = root || document;

    scope.querySelectorAll('[data-i18n]').forEach((el) => {
      const val = t(el.getAttribute('data-i18n'));
      if (typeof val === 'string') el.textContent = val;
    });

    scope.querySelectorAll('[data-i18n-html]').forEach((el) => {
      const val = t(el.getAttribute('data-i18n-html'));
      if (typeof val === 'string') el.innerHTML = val;
    });

    scope.querySelectorAll('[data-i18n-attr]').forEach((el) => {
      el.getAttribute('data-i18n-attr').split(',').forEach((pair) => {
        const idx = pair.indexOf(':');
        if (idx < 0) return;
        const attr = pair.slice(0, idx).trim();
        const key = pair.slice(idx + 1).trim();
        const val = t(key);
        if (typeof val === 'string') el.setAttribute(attr, val);
      });
    });

    // document-level bits
    if (scope === document) {
      document.documentElement.setAttribute('lang', current);
      const title = t('meta.title');
      if (typeof title === 'string') document.title = title;
      const desc = document.querySelector('meta[name="description"]');
      if (desc) desc.setAttribute('content', t('meta.description'));
      const ogT = document.querySelector('meta[property="og:title"]');
      if (ogT) ogT.setAttribute('content', t('meta.title'));
      const ogD = document.querySelector('meta[property="og:description"]');
      if (ogD) ogD.setAttribute('content', t('meta.description'));
      const ogL = document.querySelector('meta[property="og:locale"]');
      if (ogL) ogL.setAttribute('content', current.replace('-', '_'));
      const twT = document.querySelector('meta[name="twitter:title"]');
      if (twT) twT.setAttribute('content', t('meta.title'));
      const twD = document.querySelector('meta[name="twitter:description"]');
      if (twD) twD.setAttribute('content', t('meta.description'));
    }
  }

  function set(locale, opts) {
    const next = normalise(locale);
    const changed = next !== current;
    current = next;
    try { global.localStorage.setItem(STORAGE_KEY, current); } catch (e) { /* ignore */ }
    apply(document);
    if (changed || (opts && opts.force)) {
      listeners.forEach((fn) => { try { fn(current); } catch (e) { /* keep going */ } });
    }
  }

  function onChange(fn) { if (typeof fn === 'function') listeners.push(fn); }

  global.I18N = {
    dict: DICT,
    locales: LOCALES,
    fallback: FALLBACK,
    get current() { return current; },
    detect: detect,
    normalise: normalise,
    t: t,
    apply: apply,
    set: set,
    onChange: onChange,
    init: function () { current = detect(); apply(document); return current; }
  };
})(window);
