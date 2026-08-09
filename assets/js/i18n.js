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
      'meta.title': 'Sofia Ferraz — Brand & Art Direction Studio',
      'meta.description': 'Sofia Ferraz is an independent brand and art director based in Lisbon, shaping considered visual identities for houses that value elegance, intention, and lasting presence.',

      'lang.label': 'Language',
      'lang.current': 'English',

      'nav.about': 'About',
      'nav.services': 'Services',
      'nav.work': 'Work',
      'nav.words': 'Words',
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

      'marquee.items': ['Strategy', 'Brand identity', 'Packaging', 'Social media design', 'Editorial'],

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

      'services.eyebrow': 'Services',
      'services.title': 'Five ways I help a brand <em>arrive fully formed.</em>',
      'services.1.title': 'Brand Identity',
      'services.1.desc': 'Logotypes, marks, colour, and type systems built as a coherent whole — the foundation every other decision rests upon.',
      'services.1.tags': ['Logo & Mark', 'Type System', 'Guidelines'],
      'services.2.title': 'Art Direction',
      'services.2.desc': 'The look and feel across every touchpoint — photography, styling, and composition directed with a single, unmistakable point of view.',
      'services.2.tags': ['Photography', 'Styling', 'Campaigns'],
      'services.3.title': 'Editorial & Print',
      'services.3.desc': 'Books, magazines, and collateral where paper, grid, and typography carry as much meaning as the words themselves.',
      'services.3.tags': ['Layout', 'Typesetting', 'Production'],
      'services.4.title': 'Digital Experience',
      'services.4.desc': 'Websites and interfaces that extend the identity online — unhurried, tactile, and designed around how people actually read.',
      'services.4.tags': ['Web Design', 'Prototyping', 'Motion'],
      'services.5.title': 'Creative Strategy',
      'services.5.desc': 'Naming, positioning, and verbal identity — the thinking that gives the visuals a reason to exist and a story worth telling.',
      'services.5.tags': ['Naming', 'Positioning', 'Voice'],

      'work.eyebrow': 'Selected work',
      'work.title': 'A few worlds<br />built with care.',
      'work.note': 'Each project is a long conversation about restraint. A small selection of recent identities, chosen for the range they show.',
      'work.viewProject': 'View project',
      'work.loading': 'Loading projects…',
      'work.empty': 'Selected projects are being updated. In the meantime, see the full archive on Behance.',
      'work.viewAll': 'View full archive on Behance',
      'work.sourceNote': 'Synced from Behance',

      'pull.quote': '“Good design should feel <em>inevitable</em> — as if the brand could never have looked any other way.”',

      'words.eyebrow': 'Kind words',
      'words.title': 'Trusted by founders who <em>sweat the small things.</em>',
      'words.1.quote': 'Sofia gave our house a language we didn’t know we were missing. Every detail feels considered, and nothing feels forced.',
      'words.1.name': 'Inês Marques',
      'words.1.role': 'Founder, Maison Léra',
      'words.2.quote': 'Working with Sofia is calm and exacting in equal measure. She protected the idea and elevated it — the response has been remarkable.',
      'words.2.name': 'Tomás Lund',
      'words.2.role': 'Creative Lead, Atelier Nord',
      'words.3.quote': 'The identity still feels fresh three years on. That kind of longevity is exactly what we hoped for and rarely find.',
      'words.3.name': 'Clara Reis',
      'words.3.role': 'Editor-in-Chief, Verão',
      'words.clients': 'Selected clients',

      'contact.eyebrow': 'Contact',
      'contact.title': 'Let’s make something <em>timeless.</em>',
      'contact.lede': 'I take on a small number of projects each season so each one gets my full attention. Tell me a little about yours.',
      'contact.basedIn': 'Based in',
      'contact.basedInValue': 'Lisbon, Portugal',
      'contact.availability': 'Availability',
      'contact.availabilityValue': 'Booking Q1 2026',
      'form.name': 'Your name',
      'form.email': 'Email address',
      'form.company': 'Company',
      'form.optional': '(optional)',
      'form.message': 'Tell me about your project',
      'form.submit': 'Send enquiry',
      'form.error': 'Please add your name, a valid email, and a short note.',
      'form.success': 'Thank you — your note is on its way. I’ll reply within two business days.',

      'footer.tag': 'Brand & art direction for houses that value elegance over noise.',
      'footer.toTop': 'Back to top',
      'footer.rights': 'Sofia Ferraz Studio. All rights reserved.',
      'footer.madeIn': 'Designed & art-directed in Lisbon.',
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
      'meta.title': 'Sofia Ferraz — Estúdio de Marca e Direção de Arte',
      'meta.description': 'Sofia Ferraz é diretora independente de marca e arte, baseada em Lisboa, criando identidades visuais pensadas para casas que valorizam elegância, intenção e presença duradoura.',

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

      'marquee.items': ['Estratégia', 'Identidade de marca', 'Embalagem', 'Design social mídia', 'Editorial'],

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

      'services.eyebrow': 'Serviços',
      'services.title': 'Cinco formas de ajudar uma marca a <em>nascer completa.</em>',
      'services.1.title': 'Identidade de Marca',
      'services.1.desc': 'Logotipos, símbolos, cor e sistemas tipográficos construídos como um todo coerente — a base sobre a qual todas as outras decisões se apoiam.',
      'services.1.tags': ['Logo e Símbolo', 'Sistema Tipográfico', 'Manual'],
      'services.2.title': 'Direção de Arte',
      'services.2.desc': 'A aparência e o clima em cada ponto de contato — fotografia, styling e composição dirigidos com um ponto de vista único e inconfundível.',
      'services.2.tags': ['Fotografia', 'Styling', 'Campanhas'],
      'services.3.title': 'Editorial e Impresso',
      'services.3.desc': 'Livros, revistas e materiais em que papel, grid e tipografia carregam tanto significado quanto as próprias palavras.',
      'services.3.tags': ['Diagramação', 'Composição', 'Produção'],
      'services.4.title': 'Experiência Digital',
      'services.4.desc': 'Sites e interfaces que estendem a identidade ao digital — sem pressa, táteis e desenhados a partir de como as pessoas realmente leem.',
      'services.4.tags': ['Web Design', 'Prototipagem', 'Movimento'],
      'services.5.title': 'Estratégia Criativa',
      'services.5.desc': 'Naming, posicionamento e identidade verbal — o pensamento que dá ao visual uma razão de existir e uma história que vale contar.',
      'services.5.tags': ['Naming', 'Posicionamento', 'Tom de Voz'],

      'work.eyebrow': 'Projetos selecionados',
      'work.title': 'Alguns mundos<br />feitos com cuidado.',
      'work.note': 'Cada projeto é uma longa conversa sobre contenção. Uma pequena seleção de identidades recentes, escolhidas pela amplitude que revelam.',
      'work.viewProject': 'Ver projeto',
      'work.loading': 'Carregando projetos…',
      'work.empty': 'Os projetos selecionados estão sendo atualizados. Por enquanto, veja o arquivo completo no Behance.',
      'work.viewAll': 'Ver arquivo completo no Behance',
      'work.sourceNote': 'Sincronizado do Behance',

      'pull.quote': '“O bom design deve parecer <em>inevitável</em> — como se a marca nunca pudesse ter sido de outra forma.”',

      'words.eyebrow': 'Depoimentos',
      'words.title': 'Escolhida por fundadores que <em>cuidam dos detalhes.</em>',
      'words.1.quote': 'Sofia deu à nossa casa uma linguagem que nem sabíamos que faltava. Cada detalhe parece pensado, e nada parece forçado.',
      'words.1.name': 'Inês Marques',
      'words.1.role': 'Fundadora, Maison Léra',
      'words.2.quote': 'Trabalhar com a Sofia é sereno e rigoroso na mesma medida. Ela protegeu a ideia e a elevou — a resposta foi notável.',
      'words.2.name': 'Tomás Lund',
      'words.2.role': 'Diretor Criativo, Atelier Nord',
      'words.3.quote': 'A identidade continua fresca três anos depois. Essa longevidade é exatamente o que esperávamos e raramente encontramos.',
      'words.3.name': 'Clara Reis',
      'words.3.role': 'Editora-chefe, Verão',
      'words.clients': 'Clientes selecionados',

      'contact.eyebrow': 'Contato',
      'contact.title': 'Vamos criar algo <em>atemporal.</em>',
      'contact.lede': 'Aceito um número reduzido de projetos por temporada para dar atenção total a cada um. Conte-me um pouco sobre o seu.',
      'contact.basedIn': 'Baseada em',
      'contact.basedInValue': 'Lisboa, Portugal',
      'contact.availability': 'Disponibilidade',
      'contact.availabilityValue': 'Agendando 1º tri. 2026',
      'form.name': 'Seu nome',
      'form.email': 'E-mail',
      'form.company': 'Empresa',
      'form.optional': '(opcional)',
      'form.message': 'Conte-me sobre seu projeto',
      'form.submit': 'Enviar mensagem',
      'form.error': 'Informe seu nome, um e-mail válido e uma breve mensagem.',
      'form.success': 'Obrigada — sua mensagem está a caminho. Responderei em até dois dias úteis.',

      'footer.tag': 'Marca e direção de arte para casas que valorizam elegância acima do ruído.',
      'footer.toTop': 'Voltar ao topo',
      'footer.rights': 'Sofia Ferraz Studio. Todos os direitos reservados.',
      'footer.madeIn': 'Projetado e dirigido em Lisboa.',
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
      'meta.title': 'Sofia Ferraz — Estudio de Marca y Dirección de Arte',
      'meta.description': 'Sofia Ferraz es directora independiente de marca y arte, con base en Lisboa, creando identidades visuales cuidadas para casas que valoran la elegancia, la intención y una presencia duradera.',

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

      'marquee.items': ['Estrategia', 'Identidad de marca', 'Packaging', 'Diseño para redes sociales', 'Editorial'],

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

      'services.eyebrow': 'Servicios',
      'services.title': 'Cinco formas de ayudar a una marca a <em>nacer completa.</em>',
      'services.1.title': 'Identidad de Marca',
      'services.1.desc': 'Logotipos, símbolos, color y sistemas tipográficos construidos como un todo coherente — la base sobre la que se apoyan todas las demás decisiones.',
      'services.1.tags': ['Logo y Símbolo', 'Sistema Tipográfico', 'Manual'],
      'services.2.title': 'Dirección de Arte',
      'services.2.desc': 'La estética y el tono en cada punto de contacto — fotografía, estilismo y composición dirigidos con un punto de vista único e inconfundible.',
      'services.2.tags': ['Fotografía', 'Estilismo', 'Campañas'],
      'services.3.title': 'Editorial e Impresión',
      'services.3.desc': 'Libros, revistas y materiales donde el papel, la retícula y la tipografía cargan tanto significado como las propias palabras.',
      'services.3.tags': ['Maquetación', 'Composición', 'Producción'],
      'services.4.title': 'Experiencia Digital',
      'services.4.desc': 'Sitios web e interfaces que extienden la identidad al entorno digital — sin prisa, táctiles y diseñados en torno a cómo la gente lee de verdad.',
      'services.4.tags': ['Diseño Web', 'Prototipado', 'Movimiento'],
      'services.5.title': 'Estrategia Creativa',
      'services.5.desc': 'Naming, posicionamiento e identidad verbal — el pensamiento que da a lo visual una razón de existir y una historia que merece contarse.',
      'services.5.tags': ['Naming', 'Posicionamiento', 'Tono de Voz'],

      'work.eyebrow': 'Proyectos seleccionados',
      'work.title': 'Algunos mundos<br />hechos con cuidado.',
      'work.note': 'Cada proyecto es una larga conversación sobre la contención. Una pequeña selección de identidades recientes, elegidas por el rango que muestran.',
      'work.viewProject': 'Ver proyecto',
      'work.loading': 'Cargando proyectos…',
      'work.empty': 'Los proyectos seleccionados se están actualizando. Mientras tanto, consulta el archivo completo en Behance.',
      'work.viewAll': 'Ver archivo completo en Behance',
      'work.sourceNote': 'Sincronizado desde Behance',

      'pull.quote': '“El buen diseño debe sentirse <em>inevitable</em> — como si la marca nunca hubiera podido ser de otra manera.”',

      'words.eyebrow': 'Testimonios',
      'words.title': 'Elegida por fundadores que <em>cuidan cada detalle.</em>',
      'words.1.quote': 'Sofia dio a nuestra casa un lenguaje que no sabíamos que nos faltaba. Cada detalle se siente pensado, y nada se siente forzado.',
      'words.1.name': 'Inês Marques',
      'words.1.role': 'Fundadora, Maison Léra',
      'words.2.quote': 'Trabajar con Sofia es sereno y riguroso a partes iguales. Protegió la idea y la elevó — la respuesta ha sido notable.',
      'words.2.name': 'Tomás Lund',
      'words.2.role': 'Director Creativo, Atelier Nord',
      'words.3.quote': 'La identidad sigue sintiéndose fresca tres años después. Esa longevidad es exactamente lo que esperábamos y rara vez encontramos.',
      'words.3.name': 'Clara Reis',
      'words.3.role': 'Redactora Jefa, Verão',
      'words.clients': 'Clientes seleccionados',

      'contact.eyebrow': 'Contacto',
      'contact.title': 'Creemos algo <em>atemporal.</em>',
      'contact.lede': 'Acepto un número reducido de proyectos cada temporada para dedicar a cada uno toda mi atención. Cuéntame un poco sobre el tuyo.',
      'contact.basedIn': 'Con base en',
      'contact.basedInValue': 'Lisboa, Portugal',
      'contact.availability': 'Disponibilidad',
      'contact.availabilityValue': 'Agenda 1.er trim. 2026',
      'form.name': 'Tu nombre',
      'form.email': 'Correo electrónico',
      'form.company': 'Empresa',
      'form.optional': '(opcional)',
      'form.message': 'Cuéntame sobre tu proyecto',
      'form.submit': 'Enviar mensaje',
      'form.error': 'Añade tu nombre, un correo válido y una nota breve.',
      'form.success': 'Gracias — tu mensaje está en camino. Responderé en un plazo de dos días laborables.',

      'footer.tag': 'Marca y dirección de arte para casas que valoran la elegancia por encima del ruido.',
      'footer.toTop': 'Volver arriba',
      'footer.rights': 'Sofia Ferraz Studio. Todos los derechos reservados.',
      'footer.madeIn': 'Diseñado y dirigido en Lisboa.',
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
