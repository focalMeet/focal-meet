export type Locale = 'en' | 'zh';

export type Messages = {
  nav: {
    home: string;
    about: string;
    features: string;
    blog: string;
    pricing: string;
    signIn: string;
    switch: string; // label for language switch button
  };
  footer: {
    tagline: string;
    columns: {
      exploreTitle: string;
      supportTitle: string;
      othersTitle: string;
      utilityTitle: string;
      explore: { home: string; about: string; features: string; pricing: string };
      support: { contact: string; faq: string; help: string; docs: string };
      others: { styleGuide: string; blog: string; instructions: string; changelog: string };
      utility: { password: string; license: string; privacy: string; terms: string };
    };
    bottom: { privacy: string; terms: string; cookies: string };
  };
  home: {
    hero: {
      badge: string;
      title1: string;
      title2: string;
      subtitle: string;
      getStarted: string;
      learnMore: string;
    };
    features: {
      sectionTitle: string;
      sectionSubtitle: string;
      core: {
        transcript: { title: string; desc: string };
        summary: { title: string; desc: string };
        notes: { title: string; desc: string };
      };
      extras: {
        transcript: { languages: string; diarization: string; realtimeBatch: string };
        summary: { clarity: string; timeSpent: string };
        notes: { contextLinking: string; semanticSearch: string; traceability: string };
      };
    };
    innovations: {
      title: string;
      subtitle: string;
      items: Array<{ title: string; desc: string }>;
    };
  };
  featuresPage: {
    title: string;
    subtitle: string;
    core: {
      transcript: { title: string; desc: string };
      summary: { title: string; desc: string };
      notes: { title: string; desc: string };
    };
    extended: {
      templates: { title: string; desc: string };
      chat: { title: string; desc: string };
      knowledge: { title: string; desc: string };
      comingSoon: string;
    };
    capabilities: {
      title: string;
      subtitle: string;
      items: Array<{ title: string; desc: string; tags: string[] }>;
    };
  };
  blog: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    featuredImagePlaceholder: string;
    featuredBadge: string;
    readFull: string;
    readMore: string;
    loadMore: string;
    newsletterTitle: string;
    newsletterSubtitle: string;
    newsletterEmailPlaceholder: string;
    newsletterSubscribe: string;
  };
  blogDetail: {
    notFoundTitle: string;
    backToBlog: string;
    breadcrumbBlog: string;
    tocTitle: string;
    relatedTitle: string;
    sidebarNewsletterTitle: string;
    sidebarNewsletterDesc: string;
    sidebarNewsletterEmailPlaceholder: string;
    sidebarNewsletterSubscribe: string;
    commentsTitle: string;
    commentsSubtitle: string;
    commentForm: { name: string; email: string; message: string; submit: string };
  };
  pricing: {
    heroSubtitle: string;
    billingMonthly: string;
    billingAnnual: string;
    savePercent: string; // e.g., Save 20%
    plans: Array<{ name: string; desc: string; monthly: string; annual: string; features: string[]; cta: string; primary?: boolean }>;
    pricePerMonth: string; // /month
    mostPopular: string;
    faqTitle: string;
    faqSubtitle: string;
    faqs: Array<{ q: string; a: string }>;
    ctaTitle: string;
    ctaSubtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
  about: {
    title: string;
    subtitle: string;
    teamTitle: string;
    teamSubtitle: string;
    journeyTitle: string;
    journeySubtitle: string;
    team: Array<{ badge: string; name: string; role: string; bio: string }>;
    journey: Array<{ year: string; title: string; desc: string }>;
  };
  common: {
    comingSoon: string;
  };
};

export const marketingMessages: Record<Locale, Messages> = {
  en: {
    nav: {
      home: 'Home',
      about: 'About',
      features: 'Features',
      blog: 'Blog',
      pricing: 'Pricing',
      signIn: 'Sign In',
      switch: '中文',
    },
    footer: {
      tagline: 'Unlock the Future Meeting knowledge with Focal Meet powered by AI',
      columns: {
        exploreTitle: 'Explore',
        supportTitle: 'Support',
        othersTitle: 'Others',
        utilityTitle: 'Utility',
        explore: { home: 'Home', about: 'About', features: 'Features', pricing: 'Pricing' },
        support: { contact: 'Contact', faq: 'FAQ', help: 'Help Center', docs: 'Documentation' },
        others: { styleGuide: 'Style Guide', blog: 'Blog', instructions: 'Instructions', changelog: 'Changelog' },
        utility: { password: 'Password', license: 'License', privacy: 'Privacy Policy', terms: 'Terms of Service' },
      },
      bottom: { privacy: 'Privacy Policy', terms: 'Terms of Service', cookies: 'Cookie Policy' },
    },
    home: {
      hero: {
        badge: '🚀 Introducing Next-Gen AI',
        title1: 'Unlock the Future Meeting',
        title2: 'with Focal Meet  AI',
        subtitle:
          'Transform your business meetings with cutting-edge AI technology. Experience seamless collaboration, intelligent insights, and revolutionary communication.',
        getStarted: 'Get Started',
        learnMore: 'Learn More',
      },
      features: {
        sectionTitle: 'Transform Your Business with Advanced AI Features',
        sectionSubtitle:
          'Discover powerful AI-driven solutions that revolutionize how you connect, collaborate, and communicate.',
        core: {
          transcript: {
            title: 'AI-powered Transcript',
            desc:
              'Accurate speech-to-text with speaker diarization, multi-language support, and both real-time and post-meeting transcription.',
          },
          summary: {
            title: 'AI-powered Summary',
            desc:
              'Generate structured minutes with agenda, decisions, action items, risks and dependencies—ready to share instantly.',
          },
          notes: {
            title: 'AI-powered Enriched Notes',
            desc:
              'Enhance key points with context, links, and references; make your notes searchable and actionable across meetings.',
          },
        },
        extras: {
          transcript: { languages: '40+ Languages', diarization: 'Speaker Diarization', realtimeBatch: 'Real-time & Batch' },
          summary: { clarity: 'Clarity', timeSpent: 'Time Spent' },
          notes: { contextLinking: 'Context Linking', semanticSearch: 'Semantic Search', traceability: 'Traceability' },
        },
      },
      innovations: {
        title: 'Ignite Your Potential with AI-Driven Innovations',
        subtitle: 'Discover cutting-edge AI technologies that transform the way you work, collaborate, and achieve breakthrough results in your business.',
        items: [
          { title: 'Adaptive Learning Models', desc: 'Our AI continuously learns from your meeting patterns and preferences, automatically optimizing settings and suggestions to enhance your productivity over time.' },
          { title: 'Real-Time Language Processing', desc: 'Advanced natural language processing enables instant translation, sentiment analysis, and intelligent meeting summaries across multiple languages.' },
          { title: 'Predictive Analytics Engine', desc: 'Leverage machine learning algorithms to predict meeting outcomes, identify potential conflicts, and suggest optimal scheduling strategies.' },
          { title: 'Intelligent Automation Suite', desc: 'Automate repetitive tasks with smart workflows that adapt to your business needs, from calendar management to follow-up reminders and action item tracking.' },
        ],
      },
    },
    featuresPage: {
      title: 'AI Meeting Knowledge Suite',
      subtitle:
        'Turn every meeting into structured, actionable knowledge with AI-powered transcripts, summaries, and enriched notes.',
      core: {
        transcript: {
          title: 'AI-powered Transcript',
          desc:
            'Accurate speech-to-text with speaker diarization, multi-language support, and both real-time and post-meeting transcription.',
        },
        summary: {
          title: 'AI-powered Summary',
          desc:
            'Generate structured minutes with agenda, decisions, action items, risks and dependencies—ready to share instantly.',
        },
        notes: {
          title: 'AI-powered Enriched Notes',
          desc:
            'Enhance key points with context, links, and references; make your notes searchable and actionable across meetings.',
        },
      },
      extended: {
        templates: {
          title: 'Smart Templates',
          desc:
            'Scenario-tailored structures and prompt libraries for reviews, standups, retros, and 1:1s—standardize quality and speed.',
        },
        chat: {
          title: 'Chat with Your Notes',
          desc:
            'Have a conversation with your meeting notes and context. Ask follow-ups, clarify details, and track action items effortlessly.',
        },
        knowledge: {
          title: 'AI-powered Personal Knowledge',
          desc:
            'Build a personal and team knowledge graph across meetings. Get recommendations, trace sources, and retain organizational memory.',
        },
        comingSoon: 'Coming Soon',
      },
      capabilities: {
        title: 'Advanced Capabilities',
        subtitle: 'Unlock the full potential of AI-powered collaboration with our premium enterprise features.',
        items: [
          { title: 'SecureAI Shield', desc: 'Enterprise-grade security with end-to-end encryption, compliance monitoring, and advanced threat detection powered by machine learning algorithms.', tags: ['End-to-End Encryption','SOC 2 Compliant','GDPR Ready'] },
          { title: 'Collaborative Whiteboard', desc: 'AI-enhanced digital whiteboard with intelligent shape recognition, automatic organization, and real-time collaborative editing for unlimited creativity.', tags: ['Shape Recognition','Real-time Sync','Infinite Canvas'] },
          { title: 'Developer API', desc: 'Comprehensive REST API and SDKs for seamless integration with your existing tools, custom workflows, and enterprise applications.', tags: ['REST API','WebHooks','Custom SDKs'] },
        ],
      },
    },
    about: {
      title: 'About Focal Meet',
      subtitle:
        'Focal Meet is an AI-powered meeting and knowledge tool that automatically generates structured summaries and enhances your key points. We turn every meeting into actionable insights, so you never miss what matters.',
      teamTitle: 'Meet the Team',
      teamSubtitle:
        'Brilliant minds from diverse backgrounds, united by a shared passion for innovation and excellence.',
      journeyTitle: 'Our Journey',
      journeySubtitle: 'From a bold idea to transforming how the world communicates.',
      team: [
        { badge: 'JW', name: 'Zhu Jianwei (Daniel)', role: 'Product Lead', bio: 'Product strategist. Focus on AI meeting workflows and actionable knowledge.' },
        { badge: 'GX', name: 'Gao Xiangdong', role: 'Engineering Lead', bio: 'Full‑stack engineer. Owns platform architecture and delivery.' },
        { badge: 'LP', name: 'Lu Peng', role: 'Frontend', bio: 'Frontend engineer. Marketing site and app UX implementation.' },
        { badge: 'ZX', name: 'Zheng Xiaomin', role: 'Backend', bio: 'Backend engineer. API, data, reliability.' },
        { badge: 'XZ', name: 'Xie Zhuoxuan (Tilda)', role: 'Design', bio: 'Product designer. Experience and visual system.' },
        { badge: 'CH', name: 'Chen Hongzhang (Tommy)', role: 'AI/NLP', bio: 'LLM & speech. Summaries, prompts, and retrieval.' },
        { badge: 'CC', name: 'Chu Chu', role: 'Growth', bio: 'Go‑to‑market, content, and operations.' },
        { badge: 'FH', name: 'Fu Hanhao', role: 'Infra', bio: 'Infrastructure and CI/CD.' },
        { badge: 'ZM', name: 'Zhou Mo', role: 'Engineer', bio: 'Core feature delivery.' },
        { badge: 'JM', name: 'James', role: 'Advisor/PM', bio: 'Product counsel and roadmap.' },
      ],
      journey: [
        { year: '2024-07-31', title: 'Ideation', desc: 'Defined problem space, user personas, and core value proposition. Drafted initial roadmap and success metrics; competitive scan and product naming (Focal Meet); listed key risks and validation plan.' },
        { year: '2024-08-04', title: 'Team Formation', desc: 'Assembled cross-functional team (PM, Design, Frontend, Backend, AI/NLP, Growth). Set up ways of working (sprint cadence, kanban, docs, meeting rhythm), tech stack, and advisor process; aligned goals and acceptance criteria.' },
        { year: '2024-08-05', title: 'Project Kick-off', desc: 'Locked V1 scope and must-have use cases; breakdown and schedule; set DoD and KPIs. Created repo and CI/CD, code quality rules, environments and secrets. Established data privacy/compliance and observability plan.' },
        { year: '2024-08-09', title: 'Website Online', desc: 'Launched marketing site with slogan, value props, features, timeline and team. Added analytics, lead capture, SEO/OG/Twitter cards, and automated deploys. Published initial blog/docs content.' },
        { year: '2024-08-23', title: 'V1 Product Release', desc: 'Shipped V1 with AI transcript, AI summary, and AI-enriched notes (basic search). Introduced Smart Templates and Chat with Notes (beta), and a nascent personal knowledge base.' },
      ],
    },
    blog: {
      title: 'Latest Insights & Updates',
      subtitle: "Stay updated with the latest developments in AI technology, product updates, and industry insights from the Focal Meet team.",
      searchPlaceholder: 'Search articles...',
      featuredImagePlaceholder: 'Featured Article',
      featuredBadge: 'Featured',
      readFull: 'Read Full Article →',
      readMore: 'Read More',
      loadMore: 'Load More Articles',
      newsletterTitle: 'Stay in the Loop',
      newsletterSubtitle: 'Get the latest updates, insights, and product announcements delivered directly to your inbox.',
      newsletterEmailPlaceholder: 'Enter your email address',
      newsletterSubscribe: 'Subscribe',
    },
    blogDetail: {
      notFoundTitle: 'Article Not Found',
      backToBlog: 'Back to Blog',
      breadcrumbBlog: 'Blog',
      tocTitle: 'Table of Contents',
      relatedTitle: 'Related Articles',
      sidebarNewsletterTitle: 'Stay Updated',
      sidebarNewsletterDesc: "Get the latest AI insights delivered to your inbox.",
      sidebarNewsletterEmailPlaceholder: 'Your email address',
      sidebarNewsletterSubscribe: 'Subscribe',
      commentsTitle: 'Join the Discussion',
      commentsSubtitle: "Share your thoughts on the future of AI-powered communication",
      commentForm: { name: 'Name', email: 'Email', message: 'Your Comment', submit: 'Post Comment' },
    },
    pricing: {
      heroSubtitle: "Choose from our flexible pricing plans designed to scale with your team's needs. Start free and upgrade as you grow.",
      billingMonthly: 'Monthly',
      billingAnnual: 'Annual',
      savePercent: 'Save 20%',
      plans: [
        { name: 'Basic', desc: 'Perfect for small teams getting started', monthly: 'Free', annual: 'Free', features: ['40-minute meeting limit','Basic AI transcription','1GB cloud storage','Email support'], cta: 'Get Started Free' },
        { name: 'Pro', desc: 'Ideal for growing teams and businesses', monthly: '$17.99', annual: '$14.99', features: ['3 hours meeting duration','Advanced AI analytics & insights','Multi-language transcription','10GB cloud storage','Priority support'], cta: 'Start Pro Trial', primary: true },
        { name: 'Enterprise', desc: 'For large organizations with advanced needs', monthly: '$99', annual: '$79', features: ['Unlimited meeting duration','Custom AI model training','Unlimited cloud storage','Dedicated account manager','24/7 phone & chat support'], cta: 'Contact Sales' },
      ],
      pricePerMonth: '/month',
      mostPopular: 'Most Popular',
      faqTitle: 'Frequently Asked Questions',
      faqSubtitle: 'Everything you need to know about our pricing and features',
      faqs: [
        { q: 'Can I switch between plans anytime?', a: 'Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle, and we\'ll prorate any differences.' },
        { q: 'Is there a free trial for paid plans?', a: 'Yes! We offer a 14-day free trial for both Pro and Enterprise plans. No credit card required to start your trial.' },
        { q: 'What payment methods do you accept?', a: 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for Enterprise plans.' },
        { q: 'How does the AI transcription work?', a: 'Our AI transcription uses advanced neural networks to convert speech to text in real-time with 95%+ accuracy. It supports 40+ languages and can identify different speakers.' },
        { q: 'Is my data secure and private?', a: 'Absolutely. We use end-to-end encryption, comply with GDPR and SOC 2 standards, and never use your data to train our AI models without explicit consent.' },
        { q: 'Can I integrate Focal Meet with other tools?', a: 'Yes! We offer integrations with popular tools like Slack, Microsoft Teams, Google Calendar, Zoom, and many more. Enterprise plans include API access for custom integrations.' },
      ],
      ctaTitle: 'Ready to Transform Your Meetings?',
      ctaSubtitle: 'Join thousands of teams already using Focal Meet to enhance their communication',
      ctaPrimary: 'Start Free Trial',
      ctaSecondary: 'Schedule Demo',
    },
    common: {
      comingSoon: 'Coming Soon',
    },
  },
  zh: {
    nav: {
      home: '首页',
      about: '关于',
      features: '功能',
      blog: '博客',
      pricing: '定价',
      signIn: '登录',
      switch: 'EN',
    },
    footer: {
      tagline: '解锁未来会议知识，由 Focal Meet AI 驱动',
      columns: {
        exploreTitle: '探索',
        supportTitle: '支持',
        othersTitle: '其他',
        utilityTitle: '工具',
        explore: { home: '首页', about: '关于', features: '功能', pricing: '定价' },
        support: { contact: '联系', faq: 'FAQ', help: '帮助中心', docs: '文档' },
        others: { styleGuide: '样式指南', blog: '博客', instructions: '说明', changelog: '更新日志' },
        utility: { password: '密码', license: '许可', privacy: '隐私政策', terms: '服务条款' },
      },
      bottom: { privacy: '隐私政策', terms: '服务条款', cookies: 'Cookie 政策' },
    },
    home: {
      hero: {
        badge: '🚀 下一代 AI 上线',
        title1: '开启未来会议',
        title2: '由 Focal Meet AI 驱动',
        subtitle:
          '用 AI 技术重塑你的会议体验：无缝协作、智能洞察与高效沟通。',
        getStarted: '立即开始',
        learnMore: '了解更多',
      },
      features: {
        sectionTitle: '用先进 AI 功能为业务赋能',
        sectionSubtitle: '探索改变联结、协作与沟通方式的 AI 解决方案。',
        core: {
          transcript: {
            title: 'AI 转录',
            desc: '高准确率语音转文字，区分发言人，支持多语言，覆盖实时与会后转录。',
          },
          summary: {
            title: 'AI 摘要',
            desc: '自动生成结构化纪要：议程、结论、行动项、风险与依赖，随时分享。',
          },
          notes: {
            title: 'AI 增强笔记',
            desc: '为要点补充上下文、链接与参考，使笔记可检索、可行动，并跨会议留痕。',
          },
        },
        extras: {
          transcript: { languages: '40+ 语言', diarization: '区分发言人', realtimeBatch: '实时与会后' },
          summary: { clarity: '清晰度', timeSpent: '省时' },
          notes: { contextLinking: '上下文关联', semanticSearch: '语义检索', traceability: '可追溯' },
        },
      },
      innovations: {
        title: 'AI 创新能力点亮工作潜能',
        subtitle: '探索改变工作、协作与业务成果的前沿 AI 技术。',
        items: [
          { title: '自适应学习模型', desc: 'AI 持续学习你的会议习惯与偏好，自动优化设置与建议，随着时间推移提升效率。' },
          { title: '实时语言处理', desc: '多语言即时翻译、情感分析与智能摘要，让跨语言协作更顺畅。' },
          { title: '预测分析引擎', desc: '基于历史数据预测会议结果、识别潜在冲突，并给出最佳排期建议。' },
          { title: '智能自动化套件', desc: '用可自适应的智能流程自动化重复性工作，从日程管理到跟进提醒与行动追踪。' },
        ],
      },
    },
    featuresPage: {
      title: 'AI 会议知识套件',
      subtitle: '用 AI 转录、AI 摘要与 AI 增强笔记，将每次会议沉淀为结构化、可执行的知识。',
      core: {
        transcript: {
          title: 'AI 转录',
          desc: '高准确率语音转文字，区分发言人，支持多语言，覆盖实时与会后转录。',
        },
        summary: {
          title: 'AI 摘要',
          desc: '自动生成结构化纪要：议程、结论、行动项、风险与依赖，随时分享。',
        },
        notes: {
          title: 'AI 增强笔记',
          desc: '为要点补充上下文、链接与参考，使笔记可检索、可行动，并跨会议留痕。',
        },
      },
      extended: {
        templates: {
          title: '智能模板',
          desc: '针对评审、站会、复盘与 1:1 的场景化结构与提示库，标准化输出与效率。',
        },
        chat: {
          title: '与笔记对话',
          desc: '以对话方式检索会议与上下文，追问细节、澄清要点，并跟踪行动项。',
        },
        knowledge: {
          title: 'AI 个人知识库',
          desc: '跨会议构建个人/团队知识图谱，推荐关联与来源可溯，沉淀组织记忆。',
        },
        comingSoon: '即将推出',
      },
      capabilities: {
        title: '高级能力',
        subtitle: '用企业级增强能力释放 AI 协作潜能。',
        items: [
          { title: 'SecureAI Shield', desc: '企业级安全：端到端加密、合规监控与机器学习驱动的威胁检测。', tags: ['端到端加密','SOC 2','GDPR'] },
          { title: '协作白板', desc: 'AI 增强数字白板：智能形状识别、自动整理与多人实时协作。', tags: ['形状识别','实时同步','无限画布'] },
          { title: '开发者 API', desc: '完备的 REST API 与 SDK，轻松接入现有工具与企业工作流。', tags: ['REST API','WebHooks','自定义 SDK'] },
        ],
      },
    },
    about: {
      title: '关于 Focal Meet',
      subtitle:
        'Focal Meet 由 AI 驱动，自动生成结构化纪要并增强关键要点，让每次会议都化为可执行洞察，不再错过重要内容。',
      teamTitle: '我们的团队',
      teamSubtitle: '多元背景的优秀伙伴，因同一份创新与卓越的热情凝聚在一起。',
      journeyTitle: '我们的旅程',
      journeySubtitle: '从一个大胆的想法，走向改变世界沟通方式的实践。',
      team: [
        { badge: 'JW', name: 'Zhu Jianwei (Daniel)', role: '产品负责人', bio: '产品策略，专注 AI 会议流程与可执行知识沉淀。' },
        { badge: 'GX', name: 'Gao Xiangdong', role: '工程负责人', bio: '全栈工程，平台架构与交付。' },
        { badge: 'LP', name: 'Lu Peng', role: '前端工程师', bio: '前端开发，营销站与应用体验实现。' },
        { badge: 'ZX', name: 'Zheng Xiaomin', role: '后端工程师', bio: '后端开发，API、数据与可靠性。' },
        { badge: 'XZ', name: 'Xie Zhuoxuan (Tilda)', role: '产品设计', bio: '产品设计，体验与视觉系统。' },
        { badge: 'CH', name: 'Chen Hongzhang (Tommy)', role: 'AI/NLP', bio: 'LLM 与语音，摘要、提示词与检索。' },
        { badge: 'CC', name: 'Chu Chu', role: '增长', bio: '市场、内容与运营。' },
        { badge: 'FH', name: 'Fu Hanhao', role: '基础设施', bio: '基础设施与 CI/CD。' },
        { badge: 'ZM', name: 'Zhou Mo', role: '工程师', bio: '核心功能交付。' },
        { badge: 'JM', name: 'James', role: '顾问/产品', bio: '产品顾问与路线图。' },
      ],
      journey: [
        { year: '2024-07-31', title: 'Ideation（想法萌发）', desc: '明确问题与用户画像，定义核心价值主张与愿景；初步路线图与成功指标；竞品扫描与命名；关键风险与验证计划。' },
        { year: '2024-08-04', title: 'Team Formation（团队组建）', desc: '组建跨职能团队（产品、设计、前端、后端、AI/NLP、增长）；建立协作机制与技术栈；顾问机制与目标对齐。' },
        { year: '2024-08-05', title: 'Project Kick-off（项目启动）', desc: '确定 V1 范围与关键用例；拆分与排期，设定 DoD 与 KPI；建立代码仓库、CI/CD、规范与密钥管理；数据合规与可观测性方案。' },
        { year: '2024-08-09', title: 'Website Online（官网上线）', desc: '上线 Slogan、价值主张、功能、时间线与团队；加埋点、线索收集、SEO/OG/Twitter；自动化部署与首批内容。' },
        { year: '2024-08-23', title: 'V1 Product Release（V1 发布）', desc: '交付 V1：AI 转录、AI 摘要、AI 增强笔记（基础检索）；上线智能模板与“与笔记对话”（Beta），个人知识库雏形。' },
      ],
    },
    blog: {
      title: '最新洞察与动态',
      subtitle: '关注 Focal Meet 团队关于 AI 技术与产品的最新进展与行业观察。',
      searchPlaceholder: '搜索文章…',
      featuredImagePlaceholder: '精选文章',
      featuredBadge: '精选',
      readFull: '阅读全文 →',
      readMore: '阅读更多',
      loadMore: '加载更多文章',
      newsletterTitle: '订阅更新',
      newsletterSubtitle: '将最新洞察、产品更新与行业观点直接发送到你的邮箱。',
      newsletterEmailPlaceholder: '输入你的邮箱地址',
      newsletterSubscribe: '订阅',
    },
    blogDetail: {
      notFoundTitle: '未找到文章',
      backToBlog: '返回博客',
      breadcrumbBlog: '博客',
      tocTitle: '目录',
      relatedTitle: '相关文章',
      sidebarNewsletterTitle: '订阅更新',
      sidebarNewsletterDesc: '获取最新 AI 洞察，直达你的邮箱。',
      sidebarNewsletterEmailPlaceholder: '你的邮箱地址',
      sidebarNewsletterSubscribe: '订阅',
      commentsTitle: '加入讨论',
      commentsSubtitle: '分享你对 AI 会议沟通未来的看法',
      commentForm: { name: '姓名', email: '邮箱', message: '你的评论', submit: '发表评论' },
    },
    pricing: {
      heroSubtitle: '灵活的定价方案随团队成长而扩展。免费起步，按需升级。',
      billingMonthly: '按月',
      billingAnnual: '按年',
      savePercent: '立省 20%',
      plans: [
        { name: '基础', desc: '适合小团队起步', monthly: 'Free', annual: 'Free', features: ['40 分钟会议时长','基础 AI 转录','1GB 云存储','邮件支持'], cta: '免费开始' },
        { name: '进阶', desc: '适合成长型团队与企业', monthly: '$17.99', annual: '$14.99', features: ['3 小时会议时长','高级 AI 分析与洞察','多语言转录','10GB 云存储','优先支持'], cta: '开始 Pro 试用', primary: true },
        { name: '企业', desc: '满足大型组织的高级需求', monthly: '$99', annual: '$79', features: ['不限会议时长','自定义 AI 模型训练','不限云存储','专属客户成功','7x24 电话与聊天支持'], cta: '联系销售' },
      ],
      pricePerMonth: '/月',
      mostPopular: '最受欢迎',
      faqTitle: '常见问题',
      faqSubtitle: '关于定价与功能的常见问题汇总',
      faqs: [
        { q: '可以随时切换套餐吗？', a: '可以，你可以在任意时间升级或降级套餐。变更会在下一个计费周期生效，我们会按比例结算差额。' },
        { q: '付费套餐有试用吗？', a: '有！我们为 Pro 与 Enterprise 套餐提供 14 天免费试用，开始试用无需信用卡。' },
        { q: '支持哪些支付方式？', a: '支持主流信用卡（Visa、MasterCard、American Express）、PayPal；企业版支持银行转账。' },
        { q: 'AI 转录如何实现？', a: '我们使用先进的神经网络实现 95%+ 准确率的实时语音转文字，支持 40+ 语言并可区分发言人。' },
        { q: '我的数据是否安全？', a: '当然。我们采用端到端加密，符合 GDPR 与 SOC 2 标准，且未经明确同意不会使用你的数据训练模型。' },
        { q: '可以与其他工具集成吗？', a: '可以！支持 Slack、Microsoft Teams、Google Calendar、Zoom 等常用工具；企业版支持 API 定制集成。' },
      ],
      ctaTitle: '准备好升级你的会议了吗？',
      ctaSubtitle: '加入数千支正在使用 Focal Meet 提升沟通效率的团队',
      ctaPrimary: '免费试用',
      ctaSecondary: '预约演示',
    },
    common: {
      comingSoon: '即将推出',
    },
  },
};


