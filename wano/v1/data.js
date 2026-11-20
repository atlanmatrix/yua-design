/* WANO核电评估平台 · 扩展功能 DEMO 模拟数据 */
window.DEMO_DATA = (function () {
  const AGENT_CATALOG = [
    {
      id: 'writing',
      name: '自评估智能体',
      code: 'AG-WRITE',
      desc: '支持 OBS 事实改写、双语翻译、文档上下文对话与任务输出生成。',
      defaultModel: 'Qwen2.5-72B-Instruct（内网版）',
      defaultQuota: 2000,
      tools: ['事实改写', '事实翻译', '智能问答', '事实检索']
    },
    {
      id: 'afi_gen',
      name: 'AFI 报告生成智能体',
      code: 'AG-AFI',
      desc: '基于已审核 OBS 事实自动归组分类，对照最高标准准则生成双语 AFI 报告。',
      defaultModel: 'DeepSeek-R1-70B（内网版）',
      defaultQuota: 800,
      tools: ['AFI 报告生成', '事实检索', '事实评审']
    },
    {
      id: 'kb_qa',
      name: '知识库清洗与问答智能体',
      code: 'AG-KBQA',
      desc: '面向外部系统接入与线下文档进行脱敏清洗、QA 抽取及多路召回问答。',
      defaultModel: 'Qwen2.5-72B-Instruct（内网版）',
      defaultQuota: 3000,
      tools: ['智能问答', '文档要点提取', '事实检索']
    },
    {
      id: 'oe_root',
      name: 'OE 经验反馈与根因分析智能体',
      code: 'AG-OE',
      desc: '解析 SER/SOER/WER 及状态报告，开展关键词抽取与根因分析检索。',
      defaultModel: 'DeepSeek-R1-70B（内网版）',
      defaultQuota: 600,
      tools: ['事件报告解析', 'OE 关键词解析', 'OE 分析报告生成', '根因分析报告检索']
    },
    {
      id: 'compliance',
      name: '合规对标与程序核查智能体',
      code: 'AG-COMP',
      desc: '按行业标准、运行经验与电厂程序核查现场观察事实与 PO&C、IEEE、电厂程序偏差。',
      defaultModel: 'Qwen2.5-72B-Instruct（内网版）',
      defaultQuota: 1200,
      tools: ['事实评审', '清单差异比对', '智能问答']
    }
  ];

  // AFI 准则分类：行业标准 / 运行经验 / 电厂程序
  const CRITERIA_CATALOG = [
    {
      id: 'cri-poc-2019',
      tier: 'high',
      category: 'PO&C',
      name: 'WANO PO&C 2019-1（绩效目标与准则）',
      version: '2019-1 Rev.2',
      clauses: 312,
      source: '线下导入 · 国际标准',
      desc: '覆盖 OP、MA、EN、RP、CH、TR、EP 等功能领域及跨功能领域准则。'
    },
    {
      id: 'cri-poc-2022',
      tier: 'high',
      category: 'PO&C',
      name: 'INPO/WANO PO&C 2022-1 修订版',
      version: '2022-1',
      clauses: 328,
      source: '线下导入 · 国际标准',
      desc: '强化核安全文化、设备可靠性与运行聚焦（OP）核心目标条文。'
    },
    {
      id: 'cri-ieee-603',
      tier: 'high',
      category: 'IEEE',
      name: 'IEEE Std 603 / 384 核电安全级电气与仪控准则',
      version: '2018 / 2023',
      clauses: 146,
      source: '线下导入 · 国际标准',
      desc: '安全级仪控系统独立性、单一故障准则及设备鉴定评估基准。'
    },
    {
      id: 'cri-ieee-1023',
      tier: 'high',
      category: 'IEEE',
      name: 'IEEE Std 1023 核电厂人因工程应用导则',
      version: '2020',
      clauses: 84,
      source: '线下导入 · 国际标准',
      desc: '主控室人机界面、规程可用性与人因防错设计评价标准。'
    },
    {
      id: 'cri-inst-01',
      tier: 'high',
      category: '研究院',
      name: '核电运行研究院 · 同行评估与自评估通用技术准则',
      version: 'V3.4',
      clauses: 195,
      source: '线下导入 · 研究院标准',
      desc: '结合国内压水堆/重水堆机群特点制定的评估分级与 AFI 判定导则。'
    },
    {
      id: 'cri-exp-soer',
      tier: 'mid',
      category: '经验',
      name: 'WANO SOER / SER 重大运行经验反馈汇编',
      version: '2026 Q3',
      clauses: 240,
      source: '人因管理系统 / 线下导入',
      desc: '包含防异物、误操作、电源丧失及大修期间共因故障等关键经验条款。'
    },
    {
      id: 'cri-exp-good',
      tier: 'mid',
      category: '经验',
      name: '行业同行评估良好实践与共性 AFI 案例库',
      version: '2026.10',
      clauses: 168,
      source: 'ECM / 线下导入',
      desc: '近五年国内各核电基地同行评估提炼的共性短板与标杆实践。'
    },
    {
      id: 'cri-bdx-corp',
      tier: 'low',
      category: '公司',
      name: '集团公司核安全与生产管理标准程序（Q/CNNC）',
      version: '2026.08',
      clauses: 412,
      source: 'BDX（标准导则管理系统）',
      desc: '通过 BDX 自动同步的集团级运行、维修、辐射防护与状态报告管理程序。'
    },
    {
      id: 'cri-bdx-plant-op',
      tier: 'low',
      category: '电厂',
      name: '电厂运行管理程序汇编（交接班 / 隔离 / 巡检）',
      version: 'Rev.14',
      clauses: 276,
      source: 'BDX（标准导则管理系统）',
      desc: '覆盖主控室监盘、防人因失误工具使用及运行技术规格书执行程序。'
    },
    {
      id: 'cri-bdx-plant-ma',
      tier: 'low',
      category: '电厂',
      name: '电厂维修与工单控制标准程序（FME / 检修质量）',
      version: 'Rev.11',
      clauses: 230,
      source: 'BDX（标准导则管理系统）',
      desc: '涵盖防异物（FME）、维修工前会、备件验收及大修关键路径控制程序。'
    }
  ];

  const TENANTS = [
    {
      id: 'tn-qinshan',
      name: '秦山核电基地',
      code: 'QNPC-01',
      region: '浙江海盐 · 9 台机组',
      status: 'active',
      admin: '陈志强',
      usersCount: 48,
      projectsCount: 6,
      updatedAt: '2026-11-18 16:40',
      agents: {
        writing: { enabled: true, model: 'Qwen2.5-72B-Instruct（内网版）', quota: 2500 },
        afi_gen: { enabled: true, model: 'DeepSeek-R1-70B（内网版）', quota: 1000 },
        kb_qa: { enabled: true, model: 'Qwen2.5-72B-Instruct（内网版）', quota: 3500 },
        oe_root: { enabled: true, model: 'DeepSeek-R1-70B（内网版）', quota: 800 },
        compliance: { enabled: true, model: 'Qwen2.5-72B-Instruct（内网版）', quota: 1500 }
      },
      criteriaIds: [
        'cri-poc-2019',
        'cri-poc-2022',
        'cri-ieee-603',
        'cri-inst-01',
        'cri-exp-soer',
        'cri-exp-good',
        'cri-bdx-corp',
        'cri-bdx-plant-op',
        'cri-bdx-plant-ma'
      ]
    },
    {
      id: 'tn-fuqing',
      name: '福清核电基地',
      code: 'FQNP-02',
      region: '福建福清 · 6 台机组',
      status: 'active',
      admin: '林建华',
      usersCount: 36,
      projectsCount: 5,
      updatedAt: '2026-11-17 11:20',
      agents: {
        writing: { enabled: true, model: 'Qwen2.5-72B-Instruct（内网版）', quota: 2000 },
        afi_gen: { enabled: true, model: 'DeepSeek-R1-70B（内网版）', quota: 800 },
        kb_qa: { enabled: true, model: 'Qwen2.5-72B-Instruct（内网版）', quota: 2500 },
        oe_root: { enabled: true, model: 'DeepSeek-R1-70B（内网版）', quota: 500 },
        compliance: { enabled: false, model: 'Qwen2.5-72B-Instruct（内网版）', quota: 1000 }
      },
      criteriaIds: [
        'cri-poc-2019',
        'cri-ieee-603',
        'cri-ieee-1023',
        'cri-exp-soer',
        'cri-bdx-corp',
        'cri-bdx-plant-op'
      ]
    }
  ];

  const ALL_PROJECT_AREAS = ['OP 运行', 'MA 维修', 'EN 工程', 'ER 设备可靠性', 'RP 辐射防护', 'CH 化学', 'NSC 核安全文化'];

  const PROJECTS = [
    {
      id: 'PRJ-2026-QS',
      tenantId: 'tn-qinshan',
      name: '2026 年度秦山核电基地自评估项目',
      description: '电厂年度固定自评估项目（默认覆盖全领域），统筹年度内各时间段、单一或多领域专项评估计划与快速模式评估活动。',
      standard: 'WANO PO&C 2022-1',
      areas: ALL_PROJECT_AREAS,
      isAllAreas: true,
      year: '2026',
      owner: '张明远',
      status: 'active',
      period: '2026-01-01 ~ 2026-12-31',
      plans: [
        {
          id: 'PLN-01',
          title: 'Q3 运行与工程桌面基线评估计划',
          window: '2026-10-08 ~ 2026-10-28',
          status: 'done',
          areas: ['OP 运行', 'EN 工程'],
          lead: '周敏',
          quickMode: false,
          members: ['周敏', '李雪梅', '赵海涛'],
          tasks: [
            {
              id: 'TSK-101',
              name: '调取近 12 个月 ECM 自评估报告与状态报告基线',
              assignee: '李雪梅',
              time: '10-10 ~ 10-18',
              status: 'done',
              outputsCount: 3,
              type: 'OBS'
            },
            {
              id: 'TSK-102',
              name: '梳理人因管理系统 SER/SOER 遗留行动项清单',
              assignee: '赵海涛',
              time: '10-15 ~ 10-26',
              status: 'done',
              outputsCount: 2,
              type: 'OBS'
            }
          ]
        },
        {
          id: 'PLN-02',
          title: '1/2 号机组运行与维修现场专项评估计划',
          window: '2026-11-01 ~ 2026-11-30',
          status: 'active',
          areas: ['OP 运行', 'MA 维修'],
          lead: '周敏',
          quickMode: false,
          members: ['周敏', '李雪梅', '赵海涛', '孙伟'],
          tasks: [
            {
              id: 'TSK-201',
              name: '1 号机组主控室交接班与报警响应现场观察',
              assignee: '李雪梅',
              time: '11-04 ~ 11-19',
              status: 'active',
              outputsCount: 4,
              type: 'OBS'
            },
            {
              id: 'TSK-202',
              name: '常规岛电动阀大修工前会与防异物（FME）抽查',
              assignee: '孙伟',
              time: '11-08 ~ 11-22',
              status: 'pending',
              outputsCount: 2,
              type: 'OBS'
            },
            {
              id: 'TSK-203',
              name: '运行领域 AFI 候选事实归组与初稿生成',
              assignee: '待领取',
              time: '11-20 ~ 11-29',
              status: 'todo',
              outputsCount: 0,
              type: 'AFI'
            }
          ]
        },
        {
          id: 'PLN-03',
          title: '三厂重水堆大修防异物与化学快速自评估计划',
          window: '2026-11-15 ~ 2026-12-15',
          status: 'active',
          areas: ['CH 化学', 'MA 维修'],
          lead: '孙伟',
          quickMode: true,
          ecmSubmitted: false,
          members: ['孙伟'],
          tasks: [
            {
              id: 'TSK-301',
              name: '大修窗口 FME 隔离区与一二回路水质快评报告（快速模式独立完成）',
              assignee: '孙伟',
              time: '11-16 ~ 12-10',
              status: 'active',
              outputsCount: 2,
              type: 'AFI'
            }
          ]
        }
      ]
    },
    {
      id: 'PRJ-2026-FQ',
      tenantId: 'tn-fuqing',
      name: '2026 年度福清核电基地自评估项目',
      description: '电厂年度固定自评估项目（默认覆盖全领域），围绕华龙一号机组开展多领域专项自评估与快速模式独立评估。',
      standard: 'WANO PO&C 2022-1',
      areas: ALL_PROJECT_AREAS,
      isAllAreas: true,
      year: '2026',
      owner: '林建华',
      status: 'active',
      period: '2026-01-01 ~ 2026-12-31',
      plans: [
        {
          id: 'PLN-11',
          title: '5/6 号机组核安全文化与运行专项评估计划',
          window: '2026-09-15 ~ 2026-10-30',
          status: 'done',
          areas: ['NSC 核安全文化', 'OP 运行'],
          lead: '林建华',
          quickMode: false,
          members: ['林建华', '黄晓东'],
          tasks: [
            {
              id: 'TSK-401',
              name: '运行与维修班组深度访谈纪要整理（18 场）',
              assignee: '黄晓东',
              time: '09-20 ~ 10-25',
              status: 'done',
              outputsCount: 5,
              type: 'OBS'
            }
          ]
        },
        {
          id: 'PLN-12',
          title: 'SPV 敏感设备可靠性快速自评估计划',
          window: '2026-11-10 ~ 2026-11-28',
          status: 'active',
          areas: ['ER 设备可靠性'],
          lead: '林建华',
          quickMode: true,
          ecmSubmitted: true,
          members: ['林建华'],
          tasks: [
            {
              id: 'TSK-402',
              name: '敏感设备台账与状态监测趋势快速评估（免审批直传 ECM）',
              assignee: '林建华',
              time: '11-12 ~ 11-26',
              status: 'done',
              outputsCount: 3,
              type: 'OBS'
            }
          ]
        }
      ]
    }
  ];

  // 严格对应原有平台 src/components/RolePermissionTree.jsx 与 src/i18n/zh.json 的 5 大分组 15 项权限码
  const PERMISSION_GROUPS = [
    {
      id: 'project',
      label: '项目',
      codes: [
        { code: 'project:view', label: '查看项目' },
        { code: 'project:manage', label: '管理项目' },
        { code: 'project:complete', label: '完成项目' },
        { code: 'project:delete', label: '删除项目' }
      ]
    },
    {
      id: 'planTask',
      label: '计划与任务',
      codes: [
        { code: 'plan:manage', label: '计划管理' },
        { code: 'plan:complete', label: '完成计划' },
        { code: 'plan:delete', label: '删除计划' },
        { code: 'task:arrange', label: '任务编排' },
        { code: 'task:execute', label: '任务执行' },
        { code: 'task:delete', label: '任务删除' }
      ]
    },
    {
      id: 'document',
      label: '文档',
      codes: [{ code: 'document:make', label: '文档制作' }]
    },
    {
      id: 'review',
      label: '审核',
      codes: [{ code: 'review:manage', label: '审核管理' }]
    },
    {
      id: 'admin',
      label: '后台',
      codes: [
        { code: 'user:manage', label: '用户管理' },
        { code: 'role:manage', label: '角色管理' },
        { code: 'document:configure', label: '文档配置' }
      ]
    }
  ];

  const ROLES = [
    {
      id: 'role-coord',
      name: '评估协调员',
      desc: '负责项目立项、计划编排、下发文件与成员协调',
      roleClass: '协调类',
      permissions: ['project:view', 'project:manage', 'project:complete', 'plan:manage', 'plan:complete', 'plan:delete', 'task:arrange', 'task:delete', 'document:make'],
      permCount: 9,
      membersCount: 12,
      enabled: true,
      builtin: true
    },
    {
      id: 'role-assessor',
      name: '现场评估员',
      desc: '认领计划任务、开展现场观察、使用智能体撰写 OBS/AFI',
      roleClass: '评估类',
      permissions: ['project:view', 'task:execute', 'document:make'],
      permCount: 3,
      membersCount: 86,
      enabled: true,
      builtin: true
    },
    {
      id: 'role-leader',
      name: '评估队长',
      desc: '负责全项目 OBS 事实与 AFI 报告审核、退回与最终裁决',
      roleClass: '队长类',
      permissions: ['project:view', 'project:complete', 'plan:manage', 'plan:complete', 'task:arrange', 'document:make', 'review:manage'],
      permCount: 7,
      membersCount: 18,
      enabled: true,
      builtin: true
    },
    {
      id: 'role-kb-admin',
      name: '知识库与系统管理员',
      desc: '维护外部系统数据接入、清洗问答规则及本厂评估准则配置',
      roleClass: '协调类',
      permissions: ['project:view', 'project:manage', 'project:complete', 'project:delete', 'plan:manage', 'plan:complete', 'plan:delete', 'task:arrange', 'task:execute', 'task:delete', 'document:make', 'review:manage', 'user:manage', 'role:manage', 'document:configure'],
      permCount: 15,
      membersCount: 8,
      enabled: true,
      builtin: false
    }
  ];

  const USERS = [
    { id: 'u1', name: '陈志强', initials: '陈', account: 'chenzq', role: '评估协调员', tenantId: 'tn-qinshan', desc: '秦山基地同行评估总协调', enabled: true },
    { id: 'u2', name: '李雪梅', initials: '李', account: 'lixm', role: '现场评估员', tenantId: 'tn-qinshan', desc: '运行领域（OP）高级评估员', enabled: true },
    { id: 'u3', name: '周敏', initials: '周', account: 'zhoum', role: '评估队长', tenantId: 'tn-qinshan', desc: '秦山自评估运行组队长', enabled: true },
    { id: 'u7', name: '孙伟', initials: '孙', account: 'sunw', role: '现场评估员', tenantId: 'tn-qinshan', desc: '维修领域（MA）防异物评估员', enabled: true },
    { id: 'u8', name: '张明远', initials: '张', account: 'zhangmy', role: '评估协调员', tenantId: 'tn-qinshan', desc: '秦山年度自评估计划协调员', enabled: true },
    { id: 'u4', name: '林建华', initials: '林', account: 'linjh', role: '知识库与系统管理员', tenantId: 'tn-fuqing', desc: '福清基地系统与知识库负责人', enabled: true }
  ];

  const DOCUMENT_CONFIGS = [
    { type: 'OBS', name: 'OBS（观察记录）', agents: { writing: true, afi_gen: false, kb_qa: true, compliance: true } },
    { type: 'AFI', name: 'AFI（待改进领域报告）', agents: { writing: true, afi_gen: true, kb_qa: true, compliance: true } },
    { type: 'NSC', name: '核安全文化评估报告（NSC）', agents: { writing: true, afi_gen: false, kb_qa: true, compliance: false } },
    { type: 'CC', name: '原因分析报告（C&C）', agents: { writing: true, afi_gen: false, kb_qa: true, oe_root: true } },
    { type: 'WER', name: 'WER（WANO 事件报告）', agents: { writing: true, oe_root: true, kb_qa: true } },
    { type: 'SOER', name: 'SOER（重大运行经验报告）', agents: { writing: false, oe_root: true, kb_qa: true } },
    { type: 'OE', name: 'OE 分析报告', agents: { writing: true, oe_root: true, kb_qa: true } },
    { type: 'DAILY', name: '队长日报', agents: { writing: true, kb_qa: false } },
    { type: 'GENERAL', name: '通用报告', agents: { writing: true, kb_qa: true } }
  ];

  // 严格按两张截图构建知识库数据源
  const KB_SOURCES = [
    {
      id: 'src-ioa',
      name: 'iOA',
      mode: 'external',
      usage: 'OBS 涉及来源',
      dataTypes: ['会议纪要'],
      endpoint: 'https://ioa.internal.npp/api/v2/minutes/sync',
      schedule: '每日 02:00 增量同步',
      status: 'online',
      docsCount: 1420,
      lastSync: '2026-11-19 02:04',
      tenantScope: '全基地'
    },
    {
      id: 'src-ecm',
      name: 'ECM',
      mode: 'external',
      usage: 'OBS 涉及来源',
      dataTypes: ['会议纪要', '自评估报告'],
      endpoint: 'https://ecm.internal.npp/rest/docs/assessment',
      schedule: '每 6 小时增量同步',
      status: 'online',
      docsCount: 3860,
      lastSync: '2026-11-19 14:00',
      tenantScope: '全基地'
    },
    {
      id: 'src-hpms',
      name: '人因管理系统',
      mode: 'external',
      usage: 'OBS 涉及来源',
      dataTypes: ['观察指导', 'SER', 'SOER', 'WER'],
      endpoint: 'https://hpms.internal.npp/api/v1/observations',
      schedule: '每日 01:30 增量同步',
      status: 'online',
      docsCount: 2915,
      lastSync: '2026-11-19 01:38',
      tenantScope: '全基地'
    },
    {
      id: 'src-wo',
      name: '工单系统',
      mode: 'external',
      usage: 'OBS 涉及来源',
      dataTypes: ['维修工单', '缺陷处理单'],
      endpoint: 'https://eam-wo.internal.npp/api/workorders',
      schedule: '每日 03:00 增量同步',
      status: 'online',
      docsCount: 8420,
      lastSync: '2026-11-19 03:12',
      tenantScope: '秦山 / 福清'
    },
    {
      id: 'src-leader',
      name: '领导待办',
      mode: 'external',
      usage: 'OBS 涉及来源',
      dataTypes: ['领导批示', '督办行动项'],
      endpoint: 'https://portal.internal.npp/api/leader-todos',
      schedule: '每 12 小时增量同步',
      status: 'online',
      docsCount: 645,
      lastSync: '2026-11-19 12:00',
      tenantScope: '全基地'
    },
    {
      id: 'src-cr',
      name: '状态报告',
      mode: 'external',
      usage: 'OBS 涉及来源',
      dataTypes: ['状态报告（CR/SR）'],
      endpoint: 'https://cr.internal.npp/api/v1/reports',
      schedule: '每 4 小时增量同步',
      status: 'online',
      docsCount: 5180,
      lastSync: '2026-11-19 16:00',
      tenantScope: '全基地'
    },
    {
      id: 'src-bdx',
      name: 'BDX（标准导则管理系统）',
      mode: 'external',
      usage: 'AFI 准则（低：公司、电厂）',
      dataTypes: ['标准程序', '公司程序', '电厂程序'],
      endpoint: 'https://bdx.internal.npp/api/standards/procedures',
      schedule: '每周日 04:00 全量校核',
      status: 'online',
      docsCount: 2310,
      lastSync: '2026-11-16 04:22',
      tenantScope: '按租户隔离'
    },
    {
      id: 'src-offline',
      name: '线下上传',
      mode: 'offline',
      usage: 'OBS 观察访谈 / AFI 高中准则',
      dataTypes: ['观察、访谈', 'IEEE / PO&C / 研究院', '行业经验'],
      endpoint: '本地文件上传（PDF / DOCX / XLSX / TXT）',
      schedule: '按需手动上传触发清洗',
      status: 'online',
      docsCount: 942,
      lastSync: '2026-11-19 17:45',
      tenantScope: '支持租户级/全局'
    }
  ];

  const KB_DOCUMENTS = [
    {
      id: 'KB-DOC-901',
      title: '2026年10月秦山二厂1号机组主控室观察指导记录汇总.docx',
      sourceId: 'src-hpms',
      sourceName: '人因管理系统',
      dataType: '观察指导',
      usage: 'OBS 涉及来源',
      priority: '—',
      tenantId: 'tn-qinshan',
      status: 'done',
      chunks: 46,
      qaCount: 14,
      updatedAt: '2026-11-19 15:20',
      rawSnippet:
        '【内部机密-严禁外传】记录人：张**（工号 102938）电话 138****9921。\n时间：2026.10.18 08:15 1号机组主控室（1KBA10AA001 附近巡检）。\n现象：交接班期间，值长宣读孤立缺陷清单时，操纵员未对 1RCP001PO 振动趋势报警进行三向交流复诵……\n页眉：秦山核电内部表单 V2.1  第 1 页 共 12 页',
      cleanedSnippet:
        '【元数据】来源：人因管理系统 / 观察指导 | 机组：1号机组 | KKS编码：1KBA10AA001, 1RCP001PO | 领域：OP 运行\n【清洗正文】2026-10-18 08:15，1号机组主控室交接班期间，值长宣读缺陷清单时，操纵员未对 1RCP001PO 振动趋势报警执行三向交流复诵（人员姓名及联系方式已脱敏，页眉页脚与噪点已剔除）。'
    },
    {
      id: 'KB-DOC-902',
      title: 'ECM-2026-Q3 秦山核电维修领域自评估报告（定稿）.pdf',
      sourceId: 'src-ecm',
      sourceName: 'ECM',
      dataType: '自评估报告',
      usage: 'OBS 涉及来源',
      priority: '—',
      tenantId: 'tn-qinshan',
      status: 'review',
      chunks: 128,
      qaCount: 22,
      updatedAt: '2026-11-19 14:05',
      rawSnippet:
        '目录...........1\n1.概述 维修处在2026年第三季度共执行A类防异物作业42项，其中3项未按程序要求进行二次清点复核。\n附件表格（扫描件OCR）：工单号 WO-2026-88412 | 负责人：李** | 偏差等级：一般。',
      cleanedSnippet:
        '【元数据】来源：ECM / 自评估报告 | 领域：MA 维修 | 关联工单：WO-2026-88412\n【清洗正文】2026年Q3维修处执行A类防异物（FME）作业42项，其中3项（含工单 WO-2026-88412）未完成二次清点复核，已结构化提取为可检索事实片段。'
    },
    {
      id: 'KB-DOC-903',
      title: 'WANO PO&C 2022-1 运行领域（OP）绩效目标与准则.pdf',
      sourceId: 'src-offline',
      sourceName: '线下上传',
      dataType: 'IEEE / PO&C / 研究院',
      usage: 'AFI 准则（行业标准）',
      priority: '行业标准',
      tenantId: 'all',
      status: 'done',
      chunks: 214,
      qaCount: 38,
      updatedAt: '2026-11-18 11:30',
      rawSnippet:
        'OP.1 Operations Fundamentals: Operators consistently demonstrate strong operational fundamentals including monitoring, control, and conservative decision-making...',
      cleanedSnippet:
        '【元数据】来源：线下上传 / PO&C 2022-1 | 准则分类：行业标准 | 领域：OP 运行 | 双语对齐：已启用\n【条文切片 OP.1-03】操纵员在交接班与报警响应中应持续落实三向交流、监盘确认与保守决策基本功。'
    },
    {
      id: 'KB-DOC-904',
      title: 'BDX 同步 · Q/CNNC-OP-012 主控室运行管理标准程序 Rev.14.docx',
      sourceId: 'src-bdx',
      sourceName: 'BDX（标准导则管理系统）',
      dataType: '标准程序',
      usage: 'AFI 准则（电厂程序）',
      priority: '电厂程序',
      tenantId: 'tn-qinshan',
      status: 'cleaning',
      chunks: 92,
      qaCount: 9,
      updatedAt: '2026-11-19 16:40',
      rawSnippet:
        '第5.3.2条 主控室交接班前30分钟，接班操纵员须核对主控室日志、孤立缺陷台账及临时变更清单，并由值长签字确认。',
      cleanedSnippet:
        '【元数据】来源：BDX / 电厂标准程序 | 准则分类：电厂程序 | 程序编号：Q/CNNC-OP-012 Rev.14\n【条文切片 5.3.2】交接班前30分钟接班操纵员须完成运行日志、孤立缺陷台账与临时变更清单核对，值长签字闭环。'
    },
    {
      id: 'KB-DOC-905',
      title: 'iOA 2026年11月安全生产例会会议纪要（第44期）.docx',
      sourceId: 'src-ioa',
      sourceName: 'iOA',
      dataType: '会议纪要',
      usage: 'OBS 涉及来源',
      priority: '—',
      tenantId: 'tn-fuqing',
      status: 'pending',
      chunks: 0,
      qaCount: 0,
      updatedAt: '2026-11-19 02:05',
      rawSnippet:
        '会议时间：2026年11月16日 参会领导：***、***。\n议题二：针对近期 5 号机组状态报告 CR-2026-1142 反映的定期试验延期问题，要求工程处本周五前提交根因排查报告。',
      cleanedSnippet: '待执行清洗任务（点击“立即清洗”可实时预览脱敏与切片结果）。'
    },
    {
      id: 'KB-DOC-906',
      title: '线下访谈记录 · 福清 5 号机组运行倒班值长访谈纪要.xlsx',
      sourceId: 'src-offline',
      sourceName: '线下上传',
      dataType: '观察、访谈',
      usage: 'OBS 涉及来源',
      priority: '—',
      tenantId: 'tn-fuqing',
      status: 'done',
      chunks: 34,
      qaCount: 11,
      updatedAt: '2026-11-19 17:45',
      rawSnippet:
        '受访岗位：运行值长 | 访谈主题：低功率运行期间报警屏蔽管理与规程执行阻力。',
      cleanedSnippet:
        '【元数据】来源：线下上传 / 观察、访谈 | 机组：福清5号机组 | 领域：OP 运行\n【清洗正文】访谈反映低功率工况下部分次要报警频发，个别班组存在口头确认代替规程打勾的习惯性偏差风险。'
    },
    {
      id: 'KB-DOC-907',
      title: '状态报告 CR-2026-1189 · 辅助给水系统止回阀内漏缺陷报告.pdf',
      sourceId: 'src-cr',
      sourceName: '状态报告',
      dataType: '状态报告（CR/SR）',
      usage: 'OBS 涉及来源',
      priority: '—',
      tenantId: 'tn-fuqing',
      status: 'done',
      chunks: 18,
      qaCount: 6,
      updatedAt: '2026-11-19 16:02',
      rawSnippet:
        '报告编号：CR-2026-1189 | 设备KKS：2ASG012VV | 发现时间：2026-11-14。',
      cleanedSnippet:
        '【元数据】来源：状态报告 | KKS编码：2ASG012VV | 领域：ER 设备可靠性\n【清洗正文】定期试验中发现 2ASG012VV 止回阀微漏，已转入工单系统 WO-2026-90124 跟踪处理。'
    }
  ];

  const KB_QA_PAIRS = [
    {
      id: 'QA-101',
      question: '在 WANO PO&C 与电厂程序中，主控室交接班期间对报警及孤立缺陷核对有何最高标准要求？',
      answer:
        '依据高优先级准则 WANO PO&C 2022-1（OP.1-03）及低优先级电厂程序 Q/CNNC-OP-012（5.3.2），接班操纵员须在交接前 30 分钟核对运行日志、孤立缺陷台账与临时变更清单，且对关键设备报警（如主泵振动趋势）必须严格执行三向交流复诵并由值长签字确认。',
      sourceSystem: '线下上传（PO&C） + BDX',
      priority: '高 → 低',
      area: 'OP 运行',
      status: 'accepted',
      confidence: 0.96,
      updatedAt: '2026-11-19 15:30'
    },
    {
      id: 'QA-102',
      question: '近期本厂维修领域在防异物（FME）管控方面有哪些典型的自评估与工单偏差？',
      answer:
        '根据 ECM 2026 Q3 维修领域自评估报告与工单系统关联记录，第三季度共执行 A 类防异物作业 42 项，其中 3 项（如工单 WO-2026-88412）未按程序要求完成二次清点复核，属于防异物屏障执行不严的共性观察项。',
      sourceSystem: 'ECM + 工单系统',
      priority: 'OBS 涉及来源',
      area: 'MA 维修',
      status: 'pending',
      confidence: 0.92,
      updatedAt: '2026-11-19 14:18'
    },
    {
      id: 'QA-103',
      question: '当 AFI 判定中电厂内部程序与 WANO PO&C 或 IEEE 准则存在要求松紧差异时，应以哪一级为准？',
      answer:
        '遵循平台“AFI 准则（最高标准）”三级优先级机制：优先采用高优先级准则（IEEE、PO&C、研究院），其次参考中优先级行业经验（SOER/SER/良好实践），最后对照低优先级公司及电厂标准程序（BDX 同步），始终以最高标准作为 AFI 判定基准。',
      sourceSystem: '线下上传（研究院准则）',
      priority: '高',
      area: '跨功能准则',
      status: 'accepted',
      confidence: 0.98,
      updatedAt: '2026-11-18 17:05'
    },
    {
      id: 'QA-104',
      question: '人因管理系统中关于“口头确认代替规程打勾”的 SER/WER 经验反馈给出了哪些防人因建议？',
      answer:
        '人因管理系统历史 SER/WER 建议：在低功率及大修工况下强化工前会风险预控，明确关键步骤“一步一勾”独立验证要求，并通过管理层现场观察指导（Observation & Coaching）及时纠正习惯性简化行为。',
      sourceSystem: '人因管理系统 + 线下访谈',
      priority: '中',
      area: 'HU 人因防错',
      status: 'pending',
      confidence: 0.89,
      updatedAt: '2026-11-19 10:12'
    }
  ];

  const ANALYTICS_BASE = {
    '7d': {
      label: '近 7 天',
      agentCalls: 1482,
      agentDelta: '+18.4%',
      toolCalls: 3640,
      toolDelta: '+22.1%',
      adoptionRate: 84.6,
      adoptionDelta: '+3.2%',
      obsReports: 128,
      afiReports: 24,
      projectsTotal: 17,
      projectsActive: 9,
      tasksTotal: 342,
      tasksDone: 268,
      trendLabels: ['11-13', '11-14', '11-15', '11-16', '11-17', '11-18', '11-19'],
      trendAgents: [165, 198, 174, 220, 238, 242, 245],
      trendTools: [410, 495, 430, 540, 585, 570, 610],
      qualityTrendLabels: ['13日早', '13日晚', '14日早', '14日晚', '15日早', '15日晚', '16日早', '16日晚', '17日早', '17日晚', '18日早', '18日晚', '19日早', '19日晚'],
      qualityClosureSeries: [84.2, 84.8, 85.1, 86.0, 85.7, 86.4, 87.2, 87.8, 88.1, 88.9, 89.2, 89.5, 90.1, 90.6],
      qualityAdoptSeries: [79.5, 80.2, 81.0, 81.4, 80.9, 82.1, 82.8, 83.4, 83.9, 84.2, 84.5, 84.9, 85.3, 85.8]
    },
    '30d': {
      label: '近 30 天',
      agentCalls: 6240,
      agentDelta: '+26.8%',
      toolCalls: 15480,
      toolDelta: '+31.5%',
      adoptionRate: 86.2,
      adoptionDelta: '+4.5%',
      obsReports: 512,
      afiReports: 96,
      projectsTotal: 17,
      projectsActive: 9,
      tasksTotal: 1284,
      tasksDone: 1036,
      trendLabels: ['第1周', '第2周', '第3周', '第4周', '本周'],
      trendAgents: [1080, 1190, 1260, 1320, 1390],
      trendTools: [2640, 2910, 3150, 3320, 3460],
      qualityTrendLabels: ['10-22', '10-24', '10-26', '10-28', '10-30', '11-01', '11-03', '11-05', '11-07', '11-09', '11-11', '11-13', '11-15', '11-17', '11-19'],
      qualityClosureSeries: [81.4, 82.0, 82.8, 83.5, 83.2, 84.4, 85.1, 85.8, 86.5, 87.1, 87.6, 88.2, 88.9, 89.4, 90.2],
      qualityAdoptSeries: [76.8, 77.5, 78.2, 79.1, 79.6, 80.4, 81.2, 81.9, 82.6, 83.5, 84.1, 84.8, 85.4, 85.9, 86.5]
    },
    quarter: {
      label: '本季度',
      agentCalls: 18420,
      agentDelta: '+34.2%',
      toolCalls: 46190,
      toolDelta: '+39.0%',
      adoptionRate: 85.4,
      adoptionDelta: '+5.1%',
      obsReports: 1468,
      afiReports: 264,
      projectsTotal: 17,
      projectsActive: 9,
      tasksTotal: 3620,
      tasksDone: 3115,
      trendLabels: ['9月', '10月', '11月(至今)'],
      trendAgents: [5420, 6760, 6240],
      trendTools: [13400, 17310, 15480],
      qualityTrendLabels: ['09-01', '09-08', '09-15', '09-22', '09-29', '10-06', '10-13', '10-20', '10-27', '11-03', '11-10', '11-17', '11-19'],
      qualityClosureSeries: [78.5, 79.4, 80.2, 81.1, 81.9, 82.6, 83.8, 84.7, 85.6, 86.8, 87.9, 89.1, 89.8],
      qualityAdoptSeries: [73.2, 74.5, 75.8, 76.6, 77.9, 78.8, 80.1, 81.4, 82.5, 83.7, 84.6, 85.5, 86.2]
    },
    year: {
      label: '本年度',
      agentCalls: 64850,
      agentDelta: '+62.0%',
      toolCalls: 162400,
      toolDelta: '+71.3%',
      adoptionRate: 83.9,
      adoptionDelta: '+7.8%',
      obsReports: 4920,
      afiReports: 842,
      projectsTotal: 29,
      projectsActive: 9,
      tasksTotal: 11840,
      tasksDone: 10690,
      trendLabels: ['Q1', 'Q2', 'Q3', 'Q4(至今)'],
      trendAgents: [11200, 15400, 19830, 18420],
      trendTools: [28100, 38900, 49210, 46190],
      qualityTrendLabels: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月(估)'],
      qualityClosureSeries: [74.2, 75.8, 77.1, 78.6, 80.2, 81.5, 82.9, 84.3, 85.8, 87.4, 89.6, 91.2],
      qualityAdoptSeries: [66.5, 68.4, 70.8, 72.9, 75.1, 77.2, 79.0, 80.8, 82.4, 84.1, 86.2, 87.5]
    }
  };

  const TOOL_BREAKDOWN = [
    { name: '事实改写（factRewrite）', share: 0.29, adoption: 89.2, avgSec: '4.2s', tone: '' },
    { name: '智能问答（knowledgeQa）', share: 0.24, adoption: 85.4, avgSec: '3.1s', tone: 'blue' },
    { name: 'AFI 报告生成（afiReport）', share: 0.16, adoption: 81.8, avgSec: '18.6s', tone: 'green' },
    { name: '事实翻译（translate）', share: 0.12, adoption: 92.5, avgSec: '2.8s', tone: 'purple' },
    { name: '事实检索（factSearch）', share: 0.1, adoption: 83.0, avgSec: '1.4s', tone: 'blue' },
    { name: '事件报告解析 / OE 根因分析', share: 0.09, adoption: 78.6, avgSec: '9.4s', tone: 'yellow' }
  ];

  const AGENT_BREAKDOWN = [
    { name: '自评估智能体', share: 0.38, adoption: 88.4, tone: '' },
    { name: '知识库清洗与问答智能体', share: 0.26, adoption: 85.9, tone: 'blue' },
    { name: 'AFI 报告生成智能体', share: 0.17, adoption: 82.1, tone: 'green' },
    { name: '合规对标与程序核查智能体', share: 0.11, adoption: 84.0, tone: 'purple' },
    { name: 'OE 经验反馈与根因分析智能体', share: 0.08, adoption: 79.3, tone: 'yellow' }
  ];

  const AREA_REPORTS = [
    { area: 'OP 运行', obs: 162, afi: 31 },
    { area: 'MA 维修', obs: 134, afi: 26 },
    { area: 'EN 工程', obs: 86, afi: 16 },
    { area: 'ER 设备可靠性', obs: 68, afi: 13 },
    { area: 'RP / CH / NSC', obs: 62, afi: 10 }
  ];

  // 电厂端（5角色）与 WANO 端（4角色：队长、副队长[权限与队长一致]、主评估员、评估员）拆分
  const DEMO_ACCOUNTS = [
    {
      id: 'acc-super',
      portal: 'plant',
      name: '陈志强',
      initials: '陈',
      roleKey: 'super_admin',
      roleLabel: '超级管理员',
      tenantId: 'all',
      tenantLabel: '平台全局',
      allowedTabs: ['leadership', 'ops', 'tenants'],
      defaultPage: 'leadership'
    },
    {
      id: 'acc-tenant-admin',
      portal: 'plant',
      name: '林建华',
      initials: '林',
      roleKey: 'tenant_admin',
      roleLabel: '租户管理员',
      tenantId: 'tn-qinshan',
      tenantLabel: '秦山核电基地',
      allowedTabs: ['leadership', 'ops', 'permissions', 'knowledge', 'documents'],
      defaultPage: 'leadership'
    },
    {
      id: 'acc-leader',
      portal: 'plant',
      name: '周敏',
      initials: '周',
      roleKey: 'leader',
      roleLabel: '队长',
      tenantId: 'tn-qinshan',
      tenantLabel: '秦山核电基地',
      allowedTabs: ['leader-overview', 'leader-review'],
      defaultPage: 'leader-overview'
    },
    {
      id: 'acc-assessor',
      portal: 'plant',
      name: '李雪梅',
      initials: '李',
      roleKey: 'assessor',
      roleLabel: '评估员',
      tenantId: 'tn-qinshan',
      tenantLabel: '秦山核电基地',
      allowedTabs: ['workbench', 'assessor-kb', 'assessor-capture'],
      defaultPage: 'workbench'
    },
    {
      id: 'acc-coordinator',
      portal: 'plant',
      name: '张明远',
      initials: '张',
      roleKey: 'coordinator',
      roleLabel: '协调员',
      tenantId: 'tn-qinshan',
      tenantLabel: '秦山核电基地',
      allowedTabs: ['projects'],
      defaultPage: 'projects'
    },
    {
      id: 'acc-wano-tl',
      portal: 'wano',
      name: 'Dr. Robert Miller',
      initials: 'RM',
      roleKey: 'wano_leader',
      roleLabel: 'Team Leader (队长)',
      tenantId: 'all',
      tenantLabel: 'WANO PR / EPM',
      allowedTabs: ['wano-insights', 'wano-plan', 'wano-oe', 'workbench', 'wano-epm', 'wano-exchange'],
      defaultPage: 'wano-insights'
    },
    {
      id: 'acc-wano-dtl',
      portal: 'wano',
      name: 'Elena Vance',
      initials: 'EV',
      roleKey: 'wano_deputy',
      roleLabel: 'Deputy Team Leader (副队长)',
      tenantId: 'all',
      tenantLabel: 'WANO PR / EPM',
      allowedTabs: ['wano-insights', 'wano-plan', 'wano-oe', 'workbench', 'wano-epm', 'wano-exchange'],
      defaultPage: 'wano-insights'
    },
    {
      id: 'acc-wano-lead',
      portal: 'wano',
      name: 'Marcus Chen',
      initials: 'MC',
      roleKey: 'wano_lead_assessor',
      roleLabel: 'Lead Assessor (主评估员)',
      tenantId: 'all',
      tenantLabel: 'WANO OP/MA Lead',
      allowedTabs: ['wano-insights', 'wano-plan', 'wano-oe', 'workbench', 'wano-epm', 'wano-exchange'],
      defaultPage: 'workbench'
    },
    {
      id: 'acc-wano-assessor',
      portal: 'wano',
      name: 'Sarah Jenkins',
      initials: 'SJ',
      roleKey: 'wano_assessor',
      roleLabel: 'Assessor (评估员)',
      tenantId: 'all',
      tenantLabel: 'WANO Field Reviewer',
      allowedTabs: ['wano-plan', 'workbench', 'wano-epm', 'wano-exchange'],
      defaultPage: 'workbench'
    }
  ];

  // 原项目文档工作台演示文档（OBS / AFI / GENERAL）
  const WORKSPACE_DOCUMENTS = [
    {
      id: 'DOC-OBS-001',
      projectId: 'PRJ-2026-QS',
      plantId: 'pl-a',
      docType: 'OBS',
      reviewChecklist: { poc: true, objective: true, kks: false },
      titleZh: '1号机组主控室交接班与报警响应现场观察记录',
      titleEn: 'Unit 1 Main Control Room Shift Turnover and Alarm Response Observation',
      status: 'draft',
      version: 2,
      author: '李雪梅',
      collaborators: ['李', '周', '陈'],
      taskName: '1 号机组主控室交接班与报警响应现场观察',
      planTitle: '第二阶段：主控室与现场维修观察访谈',
      updatedAt: '2026-11-19 18:10',
      updatedDate: '2026-11-19',
      timeBucket: 'today',
      scopeZh: '2026年11月4日至11月18日，对秦山二厂1号机组主控室白班/夜班交接班、孤立缺陷台账核对及主泵振动报警响应进行了3次连续现场观察，并访谈当班值长与反应堆操纵员。',
      scopeEn: 'From Nov 4 to Nov 18, 2026, three consecutive observations were conducted in Qinshan Phase II Unit 1 MCR covering shift turnover, isolated defect ledger checks, and RCP vibration alarm response.',
      blocks: [
        {
          id: 'blk-obs-1',
          area: 'OP 运行',
          label: '观察项 1',
          zh: '11月12日08:15交接班期间，接班操纵员在核对 1RCP001PO 振动趋势报警时，仅口头回应“已了解”，未按程序 Q/CNNC-OP-012 要求完整复诵报警定值与当前趋势值。',
          en: 'During shift turnover at 08:15 on Nov 12, when reviewing the 1RCP001PO vibration trend alarm, the oncoming operator only responded verbally "acknowledged" without repeating the alarm setpoint and trend value per Q/CNNC-OP-012.',
          aiProposal: null
        },
        {
          id: 'blk-obs-2',
          area: 'OP 运行',
          label: '观察项 2',
          zh: '11月16日早班巡盘过程中，发现2条超过30天未关闭的次要报警未纳入交接班重点关注清单，值长未在班前会上说明临时补偿监控措施。',
          en: 'During morning board walkdown on Nov 16, two minor alarms open for more than 30 days were not included in the turnover focus list, and the shift supervisor did not brief compensatory monitoring actions.',
          aiProposal: null
        }
      ],
      comments: [
        {
          id: 'cmt-1',
          kind: 'discussion',
          author: '周敏（队长）',
          version: 1,
          time: '11-18 14:20',
          status: 'open',
          text: '建议在观察项 1 中补充具体对应的 WANO PO&C OP.1 条文引用，便于后续归组生成 AFI。'
        }
      ]
    },
    {
      id: 'DOC-AFI-001',
      projectId: 'PRJ-2026-QS',
      plantId: 'pl-a',
      docType: 'AFI',
      reviewChecklist: { poc: true, objective: true, kks: false },
      titleZh: 'OP.1-AFI-01 主控室交接班标准执行与报警管理严谨性不足',
      titleEn: 'OP.1-AFI-01 Rigor in Main Control Room Shift Turnover and Alarm Management',
      status: 'submitted',
      version: 3,
      author: '李雪梅',
      collaborators: ['李', '周'],
      taskName: '运行领域 AFI 候选事实归组与初稿生成',
      planTitle: '第二阶段：主控室与现场维修观察访谈',
      updatedAt: '2026-11-19 17:35',
      updatedDate: '2026-11-19',
      timeBucket: 'today',
      scopeZh: '适用准则：WANO PO&C 2022-1 OP.1（高优先级） · 参考电厂程序 Q/CNNC-OP-012（低优先级）',
      scopeEn: 'Applicable Criteria: WANO PO&C 2022-1 OP.1 (High) · Plant Procedure Q/CNNC-OP-012 (Low)',
      blocks: [
        {
          id: 'blk-afi-1',
          area: '问题陈述',
          label: '问题陈述 / Problem Statement',
          zh: '1号机组主控室部分运行班组在交接班与报警响应中未能持续保持高标准运行基本功，存在三向交流复诵不完整及长期存在报警未纳入重点管控的现象，降低了运行人员对异常工况的早期识别能力。',
          en: 'Some Unit 1 MCR operating crews did not consistently maintain high operational fundamentals during shift turnover and alarm response, resulting in incomplete three-way communication and long-standing alarms omitted from focus lists.',
          aiProposal: null
        },
        {
          id: 'blk-afi-2',
          area: '支持事实',
          label: '支持事实 / Examples include',
          zh: '1. 11月12日交接班期间，操纵员对 1RCP001PO 振动报警未完整复诵定值与趋势（来源：DOC-OBS-001 V2）。\n2. 11月16日发现2条超30天次要报警未列入班前重点管控清单（来源：DOC-OBS-001 V2）。\n3. 近3个月人因管理系统记录同类口头确认简化行为3起（来源：人因管理系统）。',
          en: '1. On Nov 12, operator omitted alarm setpoint and trend during 1RCP001PO turnover readback.\n2. On Nov 16, two minor alarms open >30 days were missing from shift briefing focus list.\n3. HPMS recorded 3 similar verbal-confirmation shortcuts in the past 3 months.',
          aiProposal: null
        },
        {
          id: 'blk-afi-3',
          area: '原因分析',
          label: '原因与贡献因素 / Causes & Contributing Factors',
          zh: '值长现场观察指导（Observation & Coaching）频次不足，对习惯性口头简化的纠偏力度不够；报警分级与超期升级提醒机制尚未与交接班日志联动。',
          en: 'Insufficient frequency of shift supervisor coaching on communication rigor; overdue alarm escalation is not integrated with shift turnover logs.',
          aiProposal: null
        }
      ],
      comments: [
        {
          id: 'cmt-2',
          kind: 'review',
          author: '周敏（队长）',
          version: 2,
          time: '11-19 10:15',
          status: 'open',
          text: '支持事实第 3 条建议标注具体的 SER/观察指导编号，审核通过前请确认双语术语与词表一致。'
        }
      ]
    },
    {
      id: 'DOC-OBS-002',
      projectId: 'PRJ-2026-QS',
      plantId: 'pl-b',
      docType: 'OBS',
      reviewChecklist: { poc: true, objective: false, kks: false },
      titleZh: '常规岛电动阀大修工前会与防异物（FME）抽查记录',
      titleEn: 'Conventional Island MOV Overhaul Pre-job Briefing and FME Inspection',
      status: 'rejected',
      version: 1,
      author: '孙伟',
      collaborators: ['孙', '周'],
      taskName: '常规岛电动阀大修工前会与防异物（FME）抽查',
      planTitle: '第二阶段：主控室与现场维修观察访谈',
      updatedAt: '2026-11-16 16:40',
      updatedDate: '2026-11-16',
      timeBucket: '7d',
      scopeZh: '抽查常规岛电动阀（WO-2026-88412）解体检修现场，核查防异物隔离区设置、工具清单清点及工前会风险交底落实情况。',
      scopeEn: 'Inspected MOV overhaul work order WO-2026-88412 for FME zone setup, tool accountability logs, and pre-job briefing quality.',
      blocks: [
        {
          id: 'blk-obs-3',
          area: 'MA 维修',
          label: '观察项 1',
          zh: '检修班组在完成阀盖回装前，仅由作业负责人单人清点工具清单，未按电厂 FME 程序要求执行独立二次清点签字。',
          en: 'Prior to valve bonnet reassembly, tool accountability was checked only by the work lead without independent second-party verification required by the plant FME procedure.',
          aiProposal: null
        }
      ],
      comments: [
        {
          id: 'cmt-3',
          kind: 'review',
          author: '周敏（队长）',
          version: 1,
          time: '2026-11-16 18:05',
          status: 'open',
          text: '驳回意见：请补充具体阀门 KKS 编码及现场核查时间，修改后重新提交审核。'
        }
      ]
    },
    {
      id: 'DOC-AFI-002',
      projectId: 'PRJ-2026-QS',
      plantId: 'pl-b',
      docType: 'AFI',
      reviewChecklist: { poc: true, objective: true, kks: true },
      titleZh: 'ER.1-AFI-02 关键敏感设备（SPV）预防性维修延期管控不足',
      titleEn: 'ER.1-AFI-02 Preventive Maintenance Deferral Control for Single Point Vulnerabilities',
      status: 'accepted',
      version: 4,
      author: '赵海涛',
      collaborators: ['赵', '周'],
      taskName: '调取近 12 个月 ECM 自评估报告与状态报告基线',
      planTitle: '第一阶段：桌面资料审查与外部数据对齐',
      updatedAt: '2026-10-26 11:20',
      updatedDate: '2026-10-26',
      timeBucket: '30d',
      scopeZh: '适用准则：WANO PO&C 2022-1 ER.1（高优先级） · 参考工单系统历史缺陷台账与状态报告 CR-2026-1189。',
      scopeEn: 'Applicable Criteria: WANO PO&C 2022-1 ER.1 (High) · Referenced Work Order Backlog and CR-2026-1189.',
      blocks: [
        {
          id: 'blk-afi-2-1',
          area: '问题陈述',
          label: '问题陈述 / Problem Statement',
          zh: '工程与维修部门对部分关键敏感设备（SPV）的预防性维修（PM）延期审批缺乏跨专业风险联合评估，导致个别辅助给水系统止回阀缺陷未能提前发现。',
          en: 'Preventive maintenance deferrals for selected Single Point Vulnerability (SPV) components lacked formal cross-functional risk reviews, delaying early detection of auxiliary feedwater check valve leakage.',
          aiProposal: null
        }
      ],
      comments: [
        {
          id: 'cmt-4',
          kind: 'review',
          author: '周敏（队长）',
          version: 4,
          time: '2026-10-26 15:00',
          status: 'resolved',
          text: '审核通过：证据链完整，已准确引用 PO&C ER.1 条款与工单台账编号。'
        }
      ]
    },
    {
      id: 'DOC-OBS-003',
      projectId: 'PRJ-2026-QS',
      plantId: 'pl-a',
      docType: 'OBS',
      reviewChecklist: { poc: true, objective: true, kks: true },
      titleZh: '2号机组常规岛主给水泵检修工前会风险交底观察记录',
      titleEn: 'Unit 2 Main Feedwater Pump Maintenance Pre-Job Briefing Observation',
      status: 'submitted',
      version: 2,
      author: '孙伟',
      collaborators: ['孙', '周'],
      taskName: '常规岛电动阀大修工前会与防异物（FME）抽查',
      planTitle: '第二阶段：主控室与现场维修观察访谈',
      updatedAt: '2026-11-19 16:25',
      updatedDate: '2026-11-19',
      timeBucket: 'today',
      scopeZh: '2026年11月18日现场旁听 2APA001PO 主给水泵解体检修工前会，重点核查隔离边界确认、防异物（FME）分级管控及应急退守条件交底情况。',
      scopeEn: 'Observed pre-job briefing for 2APA001PO main feedwater pump overhaul on Nov 18, verifying isolation boundaries, FME controls, and contingency criteria.',
      blocks: [
        {
          id: 'blk-obs-003-1',
          area: 'MA 维修',
          label: '观察项 1',
          zh: '11月18日08:40，2APA001PO 工前会期间，工作负责人未逐项核对工单 WO-2026-89105 中的 A 类防异物封堵清单，仅口头提示“注意防异物”，缺少具体封堵点位与二次清点责任人指定。',
          en: 'At 08:40 on Nov 18, during the 2APA001PO pre-job briefing, the work lead did not review individual Class-A FME exclusion points in WO-2026-89105 and did not assign a second-party verifier.',
          aiProposal: null
        },
        {
          id: 'blk-obs-003-2',
          area: 'MA 维修',
          label: '观察项 2',
          zh: '现场抽查发现 1 名新入厂外委人员未在工前会签到单上确认工业安全风险告知栏，班组长未在开工前完成补签核验。',
          en: 'One newly onboarded contractor had not signed the industrial safety risk acknowledgement prior to work start.',
          aiProposal: null
        }
      ],
      comments: []
    },
    {
      id: 'DOC-AFI-003',
      projectId: 'PRJ-2026-QS',
      plantId: 'pl-a',
      docType: 'AFI',
      reviewChecklist: { poc: true, objective: true, kks: true },
      titleZh: 'MA.2-AFI-03 大修期间防异物（FME）隔离区二次清点执行不严',
      titleEn: 'MA.2-AFI-03 Weak Secondary Tool Accountability in Class-A FME Zones During Outage',
      status: 'submitted',
      version: 2,
      author: '赵海涛',
      collaborators: ['赵', '孙', '周'],
      taskName: '常规岛电动阀大修工前会与防异物（FME）抽查',
      planTitle: '第二阶段：主控室与现场维修观察访谈',
      updatedAt: '2026-11-19 15:10',
      updatedDate: '2026-11-19',
      timeBucket: 'today',
      scopeZh: '适用准则：WANO PO&C 2022-1 MA.2（高优先级） · 参考 WANO SOER 防异物经验反馈（中优先级）与电厂维修 FME 程序 Rev.11。',
      scopeEn: 'Applicable Criteria: WANO PO&C 2022-1 MA.2 (High) · WANO SOER FME OE (Mid) & Plant FME Procedure Rev.11.',
      blocks: [
        {
          id: 'blk-afi-003-1',
          area: '问题陈述',
          label: '问题陈述 / Problem Statement',
          zh: '大修与日常高风险维修作业期间，部分维修班组与外委单位未能严格执行 A 类防异物（FME）区域工具独立二次清点及封堵点位核验要求，增加了异物进入一二回路关键设备的风险。',
          en: 'During outage and high-risk maintenance, selected maintenance crews and contractors did not consistently enforce independent secondary tool accountability in Class-A FME zones.',
          aiProposal: null
        },
        {
          id: 'blk-afi-003-2',
          area: '支持事实',
          label: '支持事实 / Examples include',
          zh: '1. 工单 WO-2026-88412 电动阀回装前仅单人清点工具，缺少独立二次验证签字。\n2. 11月18日 2APA001PO 工前会未逐项落实 A 类 FME 封堵点位与清点责任人（来源：DOC-OBS-003）。\n3. ECM 2026 Q3 维修自评估报告记录 42 项 A 类 FME 作业中 3 项存在清点偏差。',
          en: '1. WO-2026-88412 MOV reassembly relied on single-person tool check.\n2. Nov 18 2APA001PO briefing omitted Class-A FME verifier assignment.\n3. ECM Q3 self-assessment logged 3 accountability gaps out of 42 Class-A FME jobs.',
          aiProposal: null
        }
      ],
      comments: []
    },
    {
      id: 'DOC-OBS-004',
      projectId: 'PRJ-2026-FQ',
      plantId: 'pl-b',
      docType: 'OBS',
      reviewChecklist: { poc: true, objective: true, kks: true },
      titleZh: '福清 5 号机组运行班组核安全文化深度访谈观察记录',
      titleEn: 'Fuqing Unit 5 Operations Crew Nuclear Safety Culture Interview Observation',
      status: 'submitted',
      version: 1,
      author: '黄晓东',
      collaborators: ['黄', '周'],
      taskName: '运行与维修班组深度访谈纪要整理（18 场）',
      planTitle: '问卷访谈与安全文化观察事实采集',
      updatedAt: '2026-11-18 17:40',
      updatedDate: '2026-11-18',
      timeBucket: '7d',
      scopeZh: '汇总 5 号机组 18 场运行与维修班组访谈纪要，对照 WANO PO&C NSC 准则评估低功率运行期间的规程遵从文化。',
      scopeEn: 'Synthesized 18 crew interviews at Fuqing Unit 5 against WANO PO&C NSC criteria.',
      blocks: [
        {
          id: 'blk-obs-004-1',
          area: 'NSC 核安全文化',
          label: '观察项 1',
          zh: '访谈反馈在低功率及多任务并行窗口期，个别班组存在对次要报警先口头确认、后补录规程打勾的习惯性简化倾向。',
          en: 'Interviewees noted occasional verbal-first shortcuts on minor alarms during multi-task low-power windows.',
          aiProposal: null
        }
      ],
      comments: []
    }
  ];

  // 领导驾驶舱：各电厂/基地租户横向对标指标
  const PLANT_BENCHMARKS = [
    {
      tenantId: 'tn-qinshan',
      name: '秦山核电基地',
      code: 'QNPC-01',
      units: '9 台机组',
      projectsActive: 4,
      projectsDone: 2,
      obsCount: 186,
      afiCount: 34,
      aiAdoption: 88.4,
      firstPassRate: 91.2,
      highStdAlign: 96.5,
      closureRate: 92.8,
      topRiskArea: 'OP 运行 · 交接班三向交流'
    },
    {
      tenantId: 'tn-fuqing',
      name: '福清核电基地',
      code: 'FQNP-02',
      units: '6 台机组',
      projectsActive: 3,
      projectsDone: 2,
      obsCount: 142,
      afiCount: 27,
      aiAdoption: 86.1,
      firstPassRate: 88.9,
      highStdAlign: 94.8,
      closureRate: 89.4,
      topRiskArea: 'NSC 核安全文化 · 规程执行'
    }
  ];

  // 领导驾驶舱：跨电厂高频共性风险主题 Top 5
  const COMMON_RISK_TOPICS = [
    { topic: '防异物（FME）二次清点与隔离区管控', area: 'MA 维修', plants: 3, count: 29, trend: '-14%', tone: 'yellow' },
    { topic: '主控室交接班三向交流与报警复诵严谨性', area: 'OP 运行', plants: 4, count: 24, trend: '-18%', tone: 'blue' },
    { topic: '超期次要报警未纳入班前重点管控清单', area: 'OP 运行', plants: 3, count: 19, trend: '+6%', tone: 'red' },
    { topic: '关键敏感设备（SPV）工单积压与预防性维修延期', area: 'ER 设备可靠性', plants: 3, count: 16, trend: '-9%', tone: 'green' },
    { topic: '低功率及大修窗口期“一步一勾”规程执行简化', area: 'HU 人因防错', plants: 2, count: 13, trend: '-21%', tone: 'purple' }
  ];

  // 领导驾驶舱：知识库外部系统对 OBS 事实证据支撑贡献度（对应截图 1）
  const OBS_SOURCE_CONTRIBUTION = [
    { name: 'ECM（自评估报告 / 会议纪要）', share: 0.27, tone: 'blue' },
    { name: '状态报告（CR / SR）', share: 0.22, tone: '' },
    { name: '人因管理系统（观察指导 / SER / SOER / WER）', share: 0.19, tone: 'purple' },
    { name: '线下上传（现场观察、访谈纪要）', share: 0.14, tone: 'green' },
    { name: '工单系统（维修工单 / 缺陷单）', share: 0.1, tone: 'yellow' },
    { name: 'iOA 会议纪要 & 领导待办', share: 0.08, tone: '' }
  ];

  // 运维视角：性能趋势、计算资源、工具 SLA、外部同步健康度
  const OPS_TRENDS = {
    '7d': {
      sla: '99.96%',
      failRate: '0.48%',
      p95Sec: '3.4s',
      ttftSec: '0.88s',
      gpuUtil: 64.2,
      vramUsed: 205,
      vramTotal: 320,
      tokensM: 34.8,
      maxQuotaPct: 68,
      vectorChunksW: '284.6 万',
      vectorMs: '142ms',
      trendP95: [3.2, 3.5, 3.1, 3.6, 3.9, 3.5, 3.4],
      trendGpu: [58, 63, 56, 67, 71, 66, 64]
    },
    '30d': {
      sla: '99.94%',
      failRate: '0.62%',
      p95Sec: '3.8s',
      ttftSec: '0.92s',
      gpuUtil: 68.4,
      vramUsed: 218,
      vramTotal: 320,
      tokensM: 142.6,
      maxQuotaPct: 74,
      vectorChunksW: '284.6 万',
      vectorMs: '148ms',
      trendP95: [3.3, 3.6, 3.9, 4.1, 3.8],
      trendGpu: [61, 65, 69, 73, 68]
    },
    quarter: {
      sla: '99.91%',
      failRate: '0.74%',
      p95Sec: '4.1s',
      ttftSec: '0.96s',
      gpuUtil: 71.8,
      vramUsed: 230,
      vramTotal: 320,
      tokensM: 418.2,
      maxQuotaPct: 81,
      vectorChunksW: '284.6 万',
      vectorMs: '154ms',
      trendP95: [4.4, 4.1, 3.8],
      trendGpu: [74, 72, 68]
    },
    year: {
      sla: '99.89%',
      failRate: '0.81%',
      p95Sec: '4.3s',
      ttftSec: '1.02s',
      gpuUtil: 69.5,
      vramUsed: 222,
      vramTotal: 320,
      tokensM: 1460.0,
      maxQuotaPct: 86,
      vectorChunksW: '284.6 万',
      vectorMs: '158ms',
      trendP95: [5.1, 4.6, 4.2, 3.8],
      trendGpu: [58, 66, 73, 69]
    }
  };

  const OPS_TOOL_PERF = [
    { name: '事实改写（factRewrite）', share: 0.29, success: '99.4%', p50: '1.8s', p95: '3.4s', avgTok: '2.1K', state: 'done' },
    { name: '智能问答（knowledgeQa · 双路召回）', share: 0.24, success: '99.1%', p50: '1.4s', p95: '2.9s', avgTok: '3.4K', state: 'done' },
    { name: 'AFI 报告生成（afiReport）', share: 0.16, success: '97.2%', p50: '12.4s', p95: '21.8s', avgTok: '14.6K', state: 'pending' },
    { name: '事实翻译（translate · 术语词表）', share: 0.12, success: '99.6%', p50: '1.2s', p95: '2.3s', avgTok: '1.6K', state: 'done' },
    { name: '事实检索（factSearch · KKS+向量）', share: 0.1, success: '99.8%', p50: '0.15s', p95: '0.38s', avgTok: '0.4K', state: 'done' },
    { name: '事件报告解析 / OE 根因分析', share: 0.09, success: '96.8%', p50: '6.2s', p95: '11.5s', avgTok: '8.9K', state: 'pending' }
  ];

  const OPS_RESOURCES = [
    { name: 'Qwen2.5-72B-Instruct（内网推理集群 ×2）', util: 72, detail: '显存 116 / 160 GB · 并发 28', tone: 'blue' },
    { name: 'DeepSeek-R1-70B（AFI/根因专用节点 ×2）', util: 64, detail: '显存 102 / 160 GB · 并发 18', tone: 'purple' },
    { name: '双路检索向量引擎（CPU 内网无 GPU 版）', util: 49, detail: '内存 42 / 96 GB · QPS 36', tone: 'green' },
    { name: '文档 OCR 与知识清洗异步队列', util: 31, detail: '排队 4 份 · 均耗 6.2s/份', tone: '' }
  ];

  const OPS_TENANT_QUOTA = [
    { tenantId: 'tn-qinshan', name: '秦山核电基地', tokensM: 52.4, quotaPct: 74, peakConcurrency: 22 },
    { tenantId: 'tn-fuqing', name: '福清核电基地', tokensM: 38.8, quotaPct: 62, peakConcurrency: 15 }
  ];

  const OPS_SYNC_HEALTH = [
    { name: 'ECM（自评估报告 / 纪要）', latency: '48ms', retries: 0, status: 'done' },
    { name: '状态报告（CR / SR）', latency: '62ms', retries: 0, status: 'done' },
    { name: '人因管理系统（SER/SOER/WER）', latency: '54ms', retries: 0, status: 'done' },
    { name: 'BDX（标准导则管理系统）', latency: '86ms', retries: 1, status: 'done' },
    { name: '工单系统（EAM-WO）', latency: '115ms', retries: 2, status: 'pending' },
    { name: 'iOA & 领导待办接口', latency: '41ms', retries: 0, status: 'done' }
  ];

  // ==================== WANO 全球专家视角数据（PR / PSUR 趋势、强弱项、共性 AFI、脱敏交换） ====================
  const WANO_PR_TREND = {
    cycles: ['2020 PR', '2022 PR', '2024 PR', '2026 PR/PSUR'],
    avgAfiPerPlant: [11.4, 9.8, 8.2, 6.9],
    avgStrengths: [4.2, 5.6, 6.9, 8.4]
  };

  const WANO_FLEET_RADAR = {
    labels: ['OP 运行', 'MA 维修', 'EN 工程', 'ER 设备', 'RP 辐射', 'NSC 文化'],
    labelsEn: ['OP', 'MA', 'EN', 'ER', 'RP', 'NSC'],
    fleetAvg: [83, 80, 85, 82, 88, 84]
  };

  const WANO_PLANT_MATRIX = [
    {
      id: 'pl-a',
      realName: 'Qinshan NPP (秦山基地)',
      anonCode: 'Plant-A (East China · 9 Units)',
      missionType: 'PR · 2026 Q4',
      strengths: ['Outage critical-path scheduling', 'Digital work-order tracking', 'Radiation dose ALARA control'],
      weaknesses: ['OP.1 MCR shift turnover readback rigor', 'MA.2 FME secondary verification'],
      afiCount: 6,
      prevAfiCount: 8,
      trend: 'Improving',
      recurringCount: 2,
      radarScores: [81, 79, 88, 86, 94, 87],
      cycleAfi: [12, 10, 8, 6],
      cycleStrengths: [4, 6, 7, 9]
    },
    {
      id: 'pl-b',
      realName: 'Fuqing NPP (福清基地)',
      anonCode: 'Plant-B (HPR1000 · 6 Units)',
      missionType: 'PSUR / PR · 2026 Q3',
      strengths: ['HPR1000 simulator training fidelity', 'Engineering change design review'],
      weaknesses: ['NSC verbal confirmation shortcuts', 'Alarm shelving prioritization'],
      afiCount: 7,
      prevAfiCount: 7,
      trend: 'Stable',
      recurringCount: 3,
      radarScores: [80, 82, 91, 83, 86, 76],
      cycleAfi: [10, 9, 7, 7],
      cycleStrengths: [3, 5, 6, 7]
    }
  ];

  const WANO_COMMON_AFIS = [
    {
      id: 'WANO-CAFI-01',
      poc: 'OP.1',
      title: 'Inconsistent Three-Way Communication & Alarm Readback During Shift Turnover',
      titleZh: '主控室交接班期间三向交流与报警复诵执行不一致',
      plantsAffected: 4,
      instances: 19,
      trend: '-16%',
      distilled: true
    },
    {
      id: 'WANO-CAFI-02',
      poc: 'MA.2',
      title: 'Foreign Material Exclusion (FME) Secondary Tool Accountability Gaps',
      titleZh: '维修防异物（FME）二次清点与隔离区核验缺口',
      plantsAffected: 3,
      instances: 15,
      trend: '-11%',
      distilled: true
    },
    {
      id: 'WANO-CAFI-03',
      poc: 'ER.1',
      title: 'Single Point Vulnerability (SPV) PM Deferral & Work Order Backlog',
      titleZh: '关键敏感设备（SPV）预防性维修延期与工单积压',
      plantsAffected: 3,
      instances: 12,
      trend: '-8%',
      distilled: false
    },
    {
      id: 'WANO-CAFI-04',
      poc: 'HU.1',
      title: 'Procedure Place-Keeping Shortcuts Under Low-Power & Outage Windows',
      titleZh: '低功率及大修窗口期规程“一步一勾”执行简化',
      plantsAffected: 2,
      instances: 10,
      trend: '+5%',
      distilled: false
    }
  ];

  const WANO_SANITIZATION_LOGS = [
    {
      id: 'PKG-2026-1119-01',
      direction: 'Export (Plant → WANO)',
      mission: 'PR 2026 · Plant-A (Sanitized)',
      docs: '14 OBS · 3 AFI · 6 Interviews',
      redactedItems: 184,
      operator: 'Dr. Robert Miller',
      time: '2026-11-19 17:20',
      status: 'done'
    },
    {
      id: 'PKG-2026-1028-02',
      direction: 'Import (Post-PR Authoring)',
      mission: 'PSUR 2026 · Plant-B (Sanitized)',
      docs: '18 OBS · 4 AFI',
      redactedItems: 229,
      operator: 'Dr. Robert Miller',
      time: '2026-10-28 14:05',
      status: 'done'
    },
    {
      id: 'PKG-2026-0915-03',
      direction: 'Export (Plant → WANO)',
      mission: 'PR 2026 · Plant-C (Sanitized)',
      docs: '11 OBS · 2 AFI',
      redactedItems: 142,
      operator: 'Dr. Robert Miller',
      time: '2026-09-15 16:50',
      status: 'done'
    }
  ];

  // ==================== OKR 规划：PR 任务阶段链路（含日历日程/输入输出） / 评审队与电厂配合名录 / OE & SOER / EPM & PPSE 模拟数据 ====================
  const WANO_PR_STAGES = [
    {
      id: 'st-basic',
      seq: '01',
      name: 'Basic Plan',
      zh: '基础计划',
      status: 'done',
      owner: 'Team Leader',
      startDate: '2026-11-01',
      endDate: '2026-11-03',
      desc: '明确本次 PR/PSUR 评审目标、时间窗、覆盖 PO&C 功能领域及电厂基础边界条件，确立评审主计划里程碑。',
      descEn: 'Establish PR/PSUR mission scope, schedule milestones, covered PO&C functional areas, and station boundary conditions.',
      inputs: [
        { name: '电厂年度运行与大修总排期.xlsx', format: 'XLSX', source: '受评电厂' },
        { name: 'WANO PR 2026 评审大纲与周期基准.pdf', format: 'PDF', source: 'WANO 中心' }
      ],
      outputs: [
        { name: '2026 PR/PSUR 基础评审主计划 (Basic Plan).docx', format: 'DOCX', status: '已签发' },
        { name: '评审里程碑与接口责任矩阵.xlsx', format: 'XLSX', status: '已归档' }
      ],
      dailySchedules: [
        { time: '09:00 - 10:30', title: '评审范围与适用 PO&C 标准版本确认会', titleEn: 'Mission Scope & PO&C Standard Alignment', location: 'WANO 线上会议室 A', owner: 'Dr. Robert Miller' },
        { time: '14:00 - 16:00', title: '核定电厂机组工况窗口与主计划关键节点', titleEn: 'Plant Operating Window & Milestone Confirmation', location: '电厂接口协调会', owner: 'Elena Vance' }
      ]
    },
    {
      id: 'st-team',
      seq: '02',
      name: 'Team Setup',
      zh: '组队',
      status: 'done',
      owner: 'TL / Deputy TL',
      startDate: '2026-11-04',
      endDate: '2026-11-06',
      desc: '完成队长、副队长、各领域主评估员及评估员选派，落实电厂侧各领域对口联系人、翻译与观察员名单。',
      descEn: 'Finalize Team Leader, Deputy TL, Lead Assessors, field assessors, plant counterparts, interpreters, and observers.',
      inputs: [
        { name: 'WANO 全球评估员资质库与可用档期.xlsx', format: 'XLSX', source: 'WANO 中心' },
        { name: '受评电厂各领域对口人推荐表.docx', format: 'DOCX', source: '受评电厂' }
      ],
      outputs: [
        { name: '评审队完整名录与分工表 (Team Roster).xlsx', format: 'XLSX', status: '已确认' },
        { name: '保密协议与内网脱敏合规承诺书.pdf', format: 'PDF', status: '全员签署' }
      ],
      dailySchedules: [
        { time: '09:30 - 11:30', title: '跨中心评估员资质审核与领域分组确认', titleEn: 'Cross-Center Assessor Qualification & Area Pairing', location: 'WANO 评审中心', owner: 'Elena Vance' },
        { time: '15:00 - 17:00', title: '评估队与电厂对口人、翻译首次线上见面会', titleEn: 'Kick-Off Intro with Counterparts & Interpreters', location: '电厂视频会议室 201', owner: '林思远' }
      ]
    },
    {
      id: 'st-aip',
      seq: '03',
      name: 'AIP Package',
      zh: '工作包 (AIP)',
      status: 'done',
      owner: 'Lead Assessor',
      startDate: '2026-11-07',
      endDate: '2026-11-10',
      desc: '汇总受评电厂近 24 个月运行事件、PI 指标、SOER 落实情况、历次 PR 遗留 AFI 及自评估报告，形成预评估信息包（AIP）。',
      descEn: 'Compile 24-month plant OE events, PI trends, SOER status, prior PR AFIs, and self-assessments into the Advance Information Package (AIP).',
      inputs: [
        { name: '电厂近 24 个月 A/B/C/D 事件与根因报告集.zip', format: 'ZIP', source: '电厂 OE 部门' },
        { name: '2024-2026 PI 指标趋势与上轮 PR 遗留项台账.xlsx', format: 'XLSX', source: 'WANO 数据库' }
      ],
      outputs: [
        { name: '预评估工作包 (AIP Package Rev.2).pdf', format: 'PDF', status: '已分发全队' },
        { name: 'SOER 263项初筛清单与风险提示.xlsx', format: 'XLSX', status: '已分发' }
      ],
      dailySchedules: [
        { time: '09:00 - 12:00', title: '各领域主评估员审阅 AIP 数据包与历史 AFI', titleEn: 'Lead Assessors Review AIP & Prior AFIs', location: '各领域桌面审查', owner: 'Marcus Chen' },
        { time: '14:30 - 16:30', title: 'AIP 数据缺口核查与电厂补充资料清单反馈', titleEn: 'AIP Gap Check & Supplemental Data Request', location: '线上对口协调', owner: '林思远' }
      ]
    },
    {
      id: 'st-previsit',
      seq: '04',
      name: 'Pre-Visit',
      zh: '预访问',
      status: 'done',
      owner: 'TL / Deputy TL',
      startDate: '2026-11-11',
      endDate: '2026-11-13',
      desc: '队长与副队长赴现场开展预访问，对接电厂厂长与高管层，确认现场观察动线、辐射准入培训、办公与内网物理隔离环境。',
      descEn: 'TL and Deputy TL conduct on-site Pre-Visit to align with station leadership, verify access badges, logistics, and air-gapped workspace.',
      inputs: [
        { name: '预访问议程与现场后勤检查表.docx', format: 'DOCX', source: '评审队助理' },
        { name: '电厂现场安全准入与保密管理规定.pdf', format: 'PDF', source: '电厂保卫与安全处' }
      ],
      outputs: [
        { name: '预访问纪要与高层访谈安排表.docx', format: 'DOCX', status: '已签认' },
        { name: '现场评审办公与内网脱敏环境验收单.pdf', format: 'PDF', status: '验收通过' }
      ],
      dailySchedules: [
        { time: '09:00 - 11:00', title: '与电厂厂长、总工程师预访问高层对接会', titleEn: 'Pre-Visit Alignment with Station Director & Chief Eng', location: '行政楼 302 会议室', owner: 'Dr. Robert Miller' },
        { time: '13:30 - 16:00', title: '主控室、维修现场与评估队工作区动线踏勘', titleEn: 'MCR, Maintenance & Team Workspace Walkdown', location: '1/2 号机组现场', owner: 'Elena Vance' }
      ]
    },
    {
      id: 'st-arp',
      seq: '05',
      name: 'ARP (Focus Areas)',
      zh: '领域评估计划 (ARP)',
      status: 'done',
      owner: 'Lead Assessor',
      startDate: '2026-11-14',
      endDate: '2026-11-16',
      desc: '结合 AIP 风险分析与 SOER/OE 审查结论，制定各功能领域重点关注清单（Focus Areas）、现场观察计划与关键岗位访谈表。',
      descEn: 'Develop Area Review Plans (ARP) defining Focus Areas, field observation targets, and structured interview schedules per functional area.',
      inputs: [
        { name: 'AIP 风险聚类分析与 SOER 红黄灯项.pdf', format: 'PDF', source: 'OE / SOER 组' },
        { name: '评审周期内电厂日工作计划 (Daily Schedule).xlsx', format: 'XLSX', source: '电厂计划处' }
      ],
      outputs: [
        { name: '6大功能领域评估计划 (ARP Package).docx', format: 'DOCX', status: '队长批准' },
        { name: '现场观察与人员访谈总日程表.xlsx', format: 'XLSX', status: '已同步对口人' }
      ],
      dailySchedules: [
        { time: '08:30 - 11:30', title: '各领域 ARP 重点关注领域（Focus Areas）评审', titleEn: 'ARP Focus Areas Cross-Review', location: '评估队主会议室', owner: 'Marcus Chen' },
        { time: '14:00 - 17:00', title: '锁定现场关键作业观察窗口与对口人陪同安排', titleEn: 'Lock Field Observation Windows & Escorts', location: '各领域分组会议室', owner: 'Sarah Jenkins' }
      ]
    },
    {
      id: 'st-facts',
      seq: '06',
      name: 'White Cards & FACTs',
      zh: '白卡与 FACTs',
      status: 'active',
      owner: 'Assessors',
      startDate: '2026-11-17',
      endDate: '2026-11-22',
      desc: '全面开展主控室、现场检修、工前会、模拟机观察及人员访谈；实时撰写白卡（White Cards）与客观事实（FACTs），并与电厂对口人逐日核实准确性。',
      descEn: 'Execute MCR, field maintenance, pre-job briefing, and simulator observations; author White Cards & FACTs and validate factual accuracy daily with counterparts.',
      inputs: [
        { name: '领域评估计划 (ARP) 与现场观察检查单.docx', format: 'DOCX', source: '各领域主评估员' },
        { name: '现场多模态观察笔记、规程与工单抽查记录.zip', format: 'ZIP', source: '现场采集' }
      ],
      outputs: [
        { name: '已核实双语 FACTs 事实库（持续更新中）.docx', format: 'DOCX', status: '进行中（已核 28 条）' },
        { name: '每日团队碰头会纪要与潜在问题线索清单.pdf', format: 'PDF', status: '每日更新' }
      ],
      dailySchedules: [
        { time: '07:45 - 09:30', title: '1号机组主控室交接班观察与报警响应核查', titleEn: 'Unit 1 MCR Shift Turnover & Alarm Response Obs', location: '1号机组主控室', owner: 'Sarah Jenkins' },
        { time: '10:00 - 12:00', title: '电动阀大修 FME 隔离区与工前会现场观察', titleEn: 'MOV Outage FME Zone & Pre-Job Briefing Obs', location: '常规岛/核岛检修现场', owner: 'Marcus Chen' },
        { time: '14:00 - 16:00', title: '与电厂对口人核对当日白卡与 FACTs 客观事实', titleEn: 'Daily Factual Accuracy Verification with Counterparts', location: '评估队 A/B 室', owner: '各领域评估员' },
        { time: '16:30 - 18:00', title: '评审队每日例会（跨领域线索汇聚与风险识别）', titleEn: 'Daily Team Debrief & Cross-Area Roll-up', location: '主会议室', owner: 'Dr. Robert Miller' }
      ]
    },
    {
      id: 'st-afi',
      seq: '07',
      name: 'AFI / Strengths / C&C',
      zh: 'AFI / 强项 / C&C',
      status: 'active',
      owner: 'Lead / TL',
      startDate: '2026-11-19',
      endDate: '2026-11-26',
      desc: '将多条已验证 FACTs 归组聚类为正式 AFI（待改进领域）、电厂强项（Strengths）及原因与促成因素（C&C），经队长/副队长逐条审核并与电厂管理层校准。',
      descEn: 'Bundle verified FACTs into structured AFIs, Plant Strengths, and Causes & Contributors (C&C); review with TL/Deputy TL and calibrate with station management.',
      inputs: [
        { name: '已核实 FACTs 事实集合与 PO&C 条款映射表.docx', format: 'DOCX', source: '文档工作台' },
        { name: 'WANO 全球机群共性 AFI 与强项标杆库.pdf', format: 'PDF', source: 'WANO OE 中心' }
      ],
      outputs: [
        { name: 'AFI 正式草稿（四段式双语版）与强项清单.docx', format: 'DOCX', status: '编写审核中' },
        { name: '跨领域 C&C 原因链汇总矩阵.xlsx', format: 'XLSX', status: '待定稿' }
      ],
      dailySchedules: [
        { time: '09:00 - 11:30', title: 'FACTs 打包聚类研讨与 AFI 问题陈述定调会', titleEn: 'FACTs Clustering & AFI Problem Statement Workshop', location: '主会议室', owner: 'Marcus Chen' },
        { time: '14:00 - 16:30', title: '队长/副队长逐条复核 AFI 与电厂强项措辞', titleEn: 'TL / Deputy TL Review of Draft AFIs & Strengths', location: '审核工作台', owner: 'Dr. Robert Miller / Elena Vance' },
        { time: '17:00 - 18:00', title: '与电厂高层预沟通关键 AFI 结论与事实依据', titleEn: 'Pre-Alignment with Station Management on Key AFIs', location: '行政楼 302 会议室', owner: 'Dr. Robert Miller' }
      ]
    },
    {
      id: 'st-exit',
      seq: '08',
      name: 'Exit Meeting PPT',
      zh: '队长报告与出口 PPT',
      status: 'todo',
      owner: 'TL / Deputy TL',
      startDate: '2026-11-27',
      endDate: '2026-11-30',
      desc: '定稿队长最终评估报告、生成中英双语出口会议 PPT，召开出口总结会向电厂全体管理层反馈评审结论，并完成内网脱敏数据安全带出与 OE 沉淀。',
      descEn: 'Finalize Team Leader report and bilingual Exit Meeting PPT, deliver formal Exit Briefing to station leadership, and complete air-gapped sanitized export.',
      inputs: [
        { name: '终审通过的 AFI / Strengths / SOER 评价定稿.docx', format: 'DOCX', source: '评审队终审' },
        { name: '电厂保密审查批准单与脱敏校验清单.pdf', format: 'PDF', source: '电厂保密办' }
      ],
      outputs: [
        { name: 'WANO 出口会议双语汇报材料 (Exit Meeting PPT).pptx', format: 'PPTX', status: '待生成' },
        { name: '队长最终评审报告与脱敏带出包 (.docx / .json)', format: 'DOCX/JSON', status: '待定稿' }
      ],
      dailySchedules: [
        { time: '09:00 - 11:30', title: '出口会议双语 PPT 终稿合练与数据口径校验', titleEn: 'Exit Meeting Bilingual PPT Dry-Run & Final QA', location: '主会议室', owner: 'Elena Vance' },
        { time: '14:00 - 16:00', title: 'WANO 同行评审正式出口会议（Exit Meeting）', titleEn: 'Formal WANO Peer Review Exit Meeting', location: '电厂大礼堂报告厅', owner: 'Dr. Robert Miller' },
        { time: '16:30 - 17:30', title: '内网数据脱敏导出校验与离场交接', titleEn: 'Sanitized Package Export & Site Closeout', location: '评估队工作区', owner: '林思远' }
      ]
    }
  ];

  const WANO_PR_TEAM_ROSTER = {
    leaders: [
      {
        role: '队长',
        roleEn: 'Team Leader',
        name: 'Dr. Robert Miller',
        initials: 'RM',
        org: 'WANO Paris / Tokyo Centre',
        phone: '+86 139-0112-8801',
        email: 'r.miller@wano-demo.org',
        office: '评估楼 201 室 · 总负责',
        badgeCls: 'blue'
      },
      {
        role: '副队长',
        roleEn: 'Deputy Team Leader',
        name: 'Elena Vance',
        initials: 'EV',
        org: 'WANO London Centre',
        phone: '+86 139-0112-8802',
        email: 'e.vance@wano-demo.org',
        office: '评估楼 202 室 · 质量与进度统筹',
        badgeCls: 'purple'
      },
      {
        role: '评审队助理',
        roleEn: 'Team Assistant / Coordinator',
        name: '林思远 (Lin Siyuan)',
        initials: '林',
        org: 'WANO 上海办公室 · 评审协调',
        phone: '+86 138-1654-3319',
        email: 's.lin@wano-demo.org',
        office: '评估楼 205 室 · 日程/资料/后勤接口',
        badgeCls: 'green'
      }
    ],
    areaAssignments: [
      {
        area: 'OP 运行',
        areaEn: 'OP Operations',
        leadAssessor: { name: 'Marcus Chen', org: 'WANO Tokyo Centre', phone: '139-0112-8811' },
        assessors: [
          { name: 'Sarah Jenkins', org: 'EDF Energy (UK)', focus: '主控室交接班与报警管控' },
          { name: 'Kenji Sato', org: 'Kansai Electric (JP)', focus: '低功率运行与模拟机观察' }
        ],
        plantCounterparts: [
          { name: '王建国', title: '运行处副处长（主对口）', dept: '运行一处', phone: '136-5581-2011', isPrimary: true },
          { name: '赵明辉', title: '1号机组值长', dept: '运行一处', phone: '136-5581-2018', isPrimary: false }
        ]
      },
      {
        area: 'MA 维修',
        areaEn: 'MA Maintenance',
        leadAssessor: { name: 'Jean-Luc Moreau', org: 'EDF France', phone: '139-0112-8815' },
        assessors: [
          { name: 'David Kowalski', org: 'Exelon / Constellation', focus: 'FME 防异物与大修工前会' },
          { name: '孙伟', org: '行业特邀专家', focus: '电动阀检修与工单闭环' }
        ],
        plantCounterparts: [
          { name: '刘志强', title: '机械维修处总工（主对口）', dept: '维修处', phone: '136-5581-2104', isPrimary: true },
          { name: '陈涛', title: 'FME 专责工程师', dept: '维修处', phone: '136-5581-2119', isPrimary: false }
        ]
      },
      {
        area: 'EN 工程',
        areaEn: 'EN Engineering',
        leadAssessor: { name: 'Dr. Hans Weber', org: 'PreussenElektra', phone: '139-0112-8820' },
        assessors: [
          { name: 'Priya Nair', org: 'OPG Canada', focus: '设计变更与仪控定期试验' }
        ],
        plantCounterparts: [
          { name: '周文博', title: '工程改造处处长（主对口）', dept: '工程处', phone: '136-5581-2205', isPrimary: true },
          { name: '吴晓燕', title: '系统主管工程师', dept: '工程处', phone: '136-5581-2212', isPrimary: false }
        ]
      },
      {
        area: 'ER 设备可靠性',
        areaEn: 'ER Equipment Reliability',
        leadAssessor: { name: 'Thomas Lindqvist', org: 'Vattenfall (SE)', phone: '139-0112-8824' },
        assessors: [
          { name: '张海峰', org: 'WANO 借调专家', focus: 'SPV 敏感设备与状态监测' }
        ],
        plantCounterparts: [
          { name: '郑凯', title: '设备管理部副主任（主对口）', dept: '设备管理部', phone: '136-5581-2308', isPrimary: true },
          { name: '钱程', title: '振动监测专工', dept: '设备管理部', phone: '136-5581-2315', isPrimary: false }
        ]
      },
      {
        area: 'RP 辐射防护',
        areaEn: 'RP Radiation Protection',
        leadAssessor: { name: 'Claire Dubois', org: 'WANO Paris Centre', phone: '139-0112-8829' },
        assessors: [
          { name: 'Michael O’Connor', org: 'Southern Nuclear', focus: '控制区出入与 ALARA 实践' }
        ],
        plantCounterparts: [
          { name: '徐丽华', title: '保健物理处副处长（主对口）', dept: '辐射防护处', phone: '136-5581-2402', isPrimary: true }
        ]
      },
      {
        area: 'NSC 核安全文化',
        areaEn: 'NSC Safety Culture',
        leadAssessor: { name: 'Elena Vance', org: 'WANO London Centre', phone: '139-0112-8802' },
        assessors: [
          { name: 'Dr. Anna Lind', org: 'WANO Behavioural Specialist', focus: '质疑态度与领导力访谈' }
        ],
        plantCounterparts: [
          { name: '何志远', title: '安全质保部经理（主对口）', dept: '安全质保部', phone: '136-5581-2501', isPrimary: true }
        ]
      }
    ],
    interpreters: [
      { name: '沈佳宁', initials: '沈', lang: 'EN ↔ ZH（同传/交传）', area: '团队总控 · OP 运行 / NSC', phone: '138-0573-6102', note: '核电运行术语资深译员' },
      { name: '顾宇航', initials: '顾', lang: 'EN ↔ ZH（交传/现场陪同）', area: 'MA 维修 / ER 设备可靠性', phone: '138-0573-6109', note: '大修现场与防异物专项翻译' },
      { name: '许诺', initials: '许', lang: 'EN ↔ ZH（交传/笔译校审）', area: 'EN 工程 / RP 辐射防护', phone: '138-0573-6115', note: '负责 FACTs/AFI 双语校对' }
    ],
    observers: [
      { name: '黄伟民', initials: '黄', org: '中核运行研究院 · 同行评审观察员', area: '全领域（重点关注 OP / MA）', role: '电厂同行观察员', note: '参与每日例会，观摩 WANO AFI 归纳方法' },
      { name: '李俊杰', initials: '李', org: '福清核电基地 · 预备评估员', area: 'ER 设备可靠性 / EN 工程', role: '机群见习观察员', note: '为 2027 年兄弟电厂 PR 提前储备经验' }
    ]
  };

  const WANO_OE_EVENTS = [
    {
      id: 'WER-2026-041',
      plantId: 'pl-a',
      sourceType: 'Plant Root Cause (18p → M01 2p WER)',
      level: 'S',
      title: 'Unit 1 Main Feedwater Pump Auto-Trip During Surveillance Transfer',
      titleZh: '1号机组定期试验切换期间主给水泵自动跳闸事件',
      pocPrimary: 'OP.2',
      pocSecondary: 'MA.1',
      system: 'APA / Feedwater',
      wacCode: 'WAC-3120',
      keywords: ['Feedwater', 'Surveillance', 'Three-Way Comm'],
      rating: 'yellow',
      status: 'done'
    },
    {
      id: 'WER-2026-038',
      plantId: 'pl-b',
      sourceType: 'Plant Level-B Event Report',
      level: 'N',
      title: 'FME Barrier Breach During MOV Bonnet Reassembly in Outage',
      titleZh: '大修电动阀阀盖回装期间防异物屏障失效事件',
      pocPrimary: 'MA.2',
      pocSecondary: 'HU.1',
      system: 'RRI / Component Cooling',
      wacCode: 'WAC-2415',
      keywords: ['FME', 'Tool Accountability', 'Outage'],
      rating: 'red',
      status: 'review'
    },
    {
      id: 'WER-2026-029',
      plantId: 'pl-b',
      sourceType: 'Self-Assessment & Trend Report',
      level: 'T',
      title: 'Auxiliary Feedwater Check Valve Minor Internal Leakage Trend',
      titleZh: '辅助给水系统止回阀轻微内漏趋势分析',
      pocPrimary: 'ER.1',
      pocSecondary: 'EN.2',
      system: 'ASG / Aux Feedwater',
      wacCode: 'WAC-4108',
      keywords: ['SPV', 'Check Valve', 'PM Deferral'],
      rating: 'green',
      status: 'done'
    }
  ];

  const WANO_SOER_REVIEWS = [
    {
      id: 'SOER 2015-2',
      title: 'Risk Management & Operational Decision-Making',
      bulletsTotal: 14,
      bulletsMet: 12,
      rating: 'yellow',
      matchedEvents: 3,
      perfNote: 'Strong formal risk matrix; MCR shift turnover alarm readback still inconsistent.',
      g016Ready: true
    },
    {
      id: 'SOER 2013-2',
      title: 'Post-Fukushima Emergency Preparedness & FLEX Equipment',
      bulletsTotal: 11,
      bulletsMet: 11,
      rating: 'green',
      matchedEvents: 0,
      perfNote: 'All 11 bullets verified on-site via walkthrough & drills.',
      g016Ready: true
    },
    {
      id: 'SOER 2007-1',
      title: 'Reactivity Management & Core Alterations',
      bulletsTotal: 16,
      bulletsMet: 11,
      rating: 'red',
      matchedEvents: 4,
      perfNote: 'Low-power procedure place-keeping shortcuts observed across 2 crews.',
      g016Ready: false
    }
  ];

  const WANO_EPM_PIS = [
    { id: 'PI-UCF', name: 'Unit Capability Factor (UCF)', value: '93.8%', target: '≥92.0%', light: 'green', trend: '+1.2%', chain: 'Outage critical path shortened by 3.5 days; zero unplanned scrams.' },
    { id: 'PI-UCL', name: 'Unplanned Capability Loss (UCL)', value: '1.9%', target: '≤1.5%', light: 'yellow', trend: '+0.4%', chain: 'Root cause chain: SPV PM deferral → ASG check valve leakage → unplanned derate.' },
    { id: 'PI-ISA', name: 'Industrial Safety Accident Rate', value: '0.18', target: '≤0.10', light: 'red', trend: '+0.08', chain: 'Root cause chain: Contractor FME/scaffolding oversight gap during peak outage.' },
    { id: 'PI-FRI', name: 'Fuel Reliability Indicator (FRI)', value: '0.00', target: '0.00', light: 'green', trend: 'Stable', chain: 'Zero fuel defects across all operating units; chemistry control strong.' }
  ];

  const WANO_EPM_AOCS = [
    {
      id: 'AOC-2026-01',
      source: 'Converted from Plant Corrective Action',
      area: 'OP.1 · Operations Fundamentals',
      title: 'Inconsistent MCR Alarm Readback & Long-Standing Alarm Management',
      gdarImpact: 'Degrades abnormal event early detection under transient conditions.',
      effectiveness: 'Partially Effective',
      priority: 'Top 1 AOC'
    },
    {
      id: 'AOC-2026-02',
      source: 'Developed via GDAR Rules',
      area: 'MA.2 · Foreign Material Exclusion',
      title: 'Single-Person Tool Verification in Class-A FME Zones During Outage',
      gdarImpact: 'Direct risk of foreign material intrusion into primary/secondary circuits.',
      effectiveness: 'Needs Action',
      priority: 'Top 2 AOC'
    },
    {
      id: 'AOC-2026-03',
      source: 'Converted from Plant Corrective Action',
      area: 'ER.1 · Equipment Reliability',
      title: 'SPV Preventive Maintenance Deferrals Lacking Cross-Functional Risk Sign-Off',
      gdarImpact: 'Elevates single-point vulnerability failure probability.',
      effectiveness: 'In Progress',
      priority: 'Top 3 AOC'
    }
  ];

  const WANO_PPSE_SUMMARY = {
    orgEffectiveness: 'Improving (84/100)',
    proficiency: 'High in simulator & outage; moderate in low-power HU rigor',
    workload: 'Elevated during 9-unit staggered outage overlap (Q4)',
    mipPlan: '12-month WANO Member Support Mission (MSM) on OP.1 Coaching & MA.2 FME Oversight',
    milestones: [
      '2026-12: Exit Meeting PPT & Team Leader Final Report Sign-off',
      '2027-02: SOER 2007-1 / 2015-2 Bullet Closure Verification',
      '2027-06: Follow-up PR & EPM Mid-Cycle PPSE Review'
    ],
    sourcesAggregated: ['AMI Report (2026 Q3)', 'SOER Dashboard (263-item check)', 'OE WER/RPT Trends', '2026 PR FACTs & AFIs']
  };

  return {
    DEMO_ACCOUNTS,
    WANO_PR_STAGES,
    WANO_PR_TEAM_ROSTER,
    WANO_OE_EVENTS,
    WANO_SOER_REVIEWS,
    WANO_EPM_PIS,
    WANO_EPM_AOCS,
    WANO_PPSE_SUMMARY,
    WANO_PR_TREND,
    WANO_FLEET_RADAR,
    WANO_PLANT_MATRIX,
    WANO_COMMON_AFIS,
    WANO_SANITIZATION_LOGS,
    WORKSPACE_DOCUMENTS,
    AGENT_CATALOG,
    CRITERIA_CATALOG,
    TENANTS,
    ALL_PROJECT_AREAS,
    PROJECTS,
    PERMISSION_GROUPS,
    ROLES,
    USERS,
    DOCUMENT_CONFIGS,
    KB_SOURCES,
    KB_DOCUMENTS,
    KB_QA_PAIRS,
    ANALYTICS_BASE,
    TOOL_BREAKDOWN,
    AGENT_BREAKDOWN,
    AREA_REPORTS,
    PLANT_BENCHMARKS,
    COMMON_RISK_TOPICS,
    OBS_SOURCE_CONTRIBUTION,
    OPS_TRENDS,
    OPS_TOOL_PERF,
    OPS_RESOURCES,
    OPS_TENANT_QUOTA,
    OPS_SYNC_HEALTH,
    ASSESSOR_MULTIMODAL_RECORDS: [
      {
        id: 'MM-2026-001',
        type: 'audio',
        title: '1号机组主控室交接班值长访谈录音',
        captureMode: '实时录制',
        area: 'OP 运行',
        kks: '1RCP001PO',
        taskName: '主控室与关键检修点现场观察记录撰写',
        capturedAt: '2026-11-19 08:45',
        duration: '04:32',
        size: '4.1 MB',
        format: 'WEBM / 48kHz',
        author: '李雪梅',
        tenantId: 'tn-qinshan',
        obsLinked: true,
        aiSummary: '语音转写识别：值长提及在交接班高峰时段，部分非关键报警存在口头确认未同步在运行日志复核的情况，建议对照 WANO PO&C OP.1-03 核查三向交流闭环。',
        transcript: '【00:18 评估员】请问近期低功率运行交接班时，孤立报警台账如何确认？\n【00:34 运行值长】常规主报警都会逐条核对并签字，但遇到大修配合窗口报警集中时，个别辅助系统瞬时报警有时先口头交接，班后再补录。\n【02:15 评估员】补录时间是否有明确时限要求？\n【02:26 运行值长】一般要求 2 小时内，但规程里没有强制二次复诵签字栏。'
      },
      {
        id: 'MM-2026-002',
        type: 'image',
        title: '1号机组电动阀检修区 FME 防异物隔离现场照片',
        captureMode: '现场拍摄',
        area: 'MA 维修',
        kks: '1RIS023VP',
        taskName: '电动阀大修防异物（FME）现场观察',
        capturedAt: '2026-11-19 10:15',
        resolution: '4032 × 3024',
        size: '3.4 MB',
        format: 'JPG',
        author: '李雪梅',
        tenantId: 'tn-qinshan',
        obsLinked: true,
        aiSummary: '图像识别结果：检测到 1 级 FME 隔离围栏完整、入口登记板清晰可见；右侧工作台存在 2 件未挂系留绳的小型套筒扳手，建议补充工单 WO-2026-88412 二次清点核验记录。',
        sceneTag: 'FME 隔离区 · 电动阀检修点'
      },
      {
        id: 'MM-2026-003',
        type: 'video',
        title: '主控室报警响应与三向交流实操录像',
        captureMode: '实时录制',
        area: 'OP 运行',
        kks: '1MCR-PANEL-04',
        taskName: '主控室与关键检修点现场观察记录撰写',
        capturedAt: '2026-11-18 15:20',
        duration: '01:48',
        resolution: '1920 × 1080',
        size: '28.6 MB',
        format: 'MP4 / 30fps',
        author: '李雪梅',
        tenantId: 'tn-qinshan',
        obsLinked: false,
        aiSummary: '视频关键帧分析：00:22 主操发出指令，00:26 副操复诵完整；01:05 出现二次报警时，监护人未第一时间指认规程条目，可作为 OP.1 现场观察支撑证据。',
        sceneTag: '主控室 4 号盘台 · 报警响应'
      },
      {
        id: 'MM-2026-004',
        type: 'image',
        title: 'SPV 敏感设备 1RCP001PO 振动趋势监控屏截图',
        captureMode: '本地上传',
        area: 'ER 设备可靠性',
        kks: '1RCP001PO',
        taskName: 'SPV 设备台账核验与状态监测抽查',
        capturedAt: '2026-11-18 11:05',
        resolution: '1920 × 1080',
        size: '1.2 MB',
        format: 'PNG',
        author: '李雪梅',
        tenantId: 'tn-qinshan',
        obsLinked: false,
        aiSummary: '图表 OCR 识别：1RCP001PO 轴承 X 向振动幅值近 14 天由 22μm 缓慢爬升至 31μm（预警阈值 35μm），尚未触发工单预防性排查，建议关联设备可靠性分析。',
        sceneTag: '振动趋势曲线 · 1RCP001PO'
      },
      {
        id: 'MM-2026-005',
        type: 'audio',
        title: '维修处工前会防人因工具使用现场录音',
        captureMode: '本地上传',
        area: 'MA 维修',
        kks: 'WO-2026-88412',
        taskName: '维修工前会与防人因工具落实观察',
        capturedAt: '2026-11-17 09:10',
        duration: '06:15',
        size: '5.8 MB',
        format: 'M4A / 44.1kHz',
        author: '李雪梅',
        tenantId: 'tn-qinshan',
        obsLinked: false,
        aiSummary: '语音转写识别：工作负责人完整宣读了高风险点与隔离边界，但未组织班组成员逐一复述应急中止条件与独立验证（IV）节点。',
        transcript: '【00:45 工作负责人】今天主要拆检 1RIS023VP 电动头，注意 FME 管控和电气隔离，大家把工单签一下。\n【03:12 班组成员】隔离牌昨天已经挂好了，直接开工就行吧？\n【03:20 工作负责人】现场再核对一下挂牌号，注意安全。'
      },
      {
        id: 'MM-2026-006',
        type: 'video',
        title: '辐射控制区入口人员污染监测仪实操巡检视频',
        captureMode: '实时录制',
        area: 'RP 辐射防护',
        kks: '1KRT012MA',
        taskName: '辐射控制区出入管控与 ALARA 现场观察',
        capturedAt: '2026-11-16 14:30',
        duration: '00:56',
        resolution: '1920 × 1080',
        size: '15.4 MB',
        format: 'MP4 / 30fps',
        author: '李雪梅',
        tenantId: 'tn-qinshan',
        obsLinked: true,
        aiSummary: '视频关键帧分析：3 名大修外委人员依次通过全身污染监测仪，其中 1 名在手部监测倒计时剩余 2 秒时提前抽离，现场 RP 监督员及时提醒并要求重新测量，属于良好实践/纠偏案例。',
        sceneTag: '控制区入口 · 1KRT012MA'
      }
    ]
  };
})();
