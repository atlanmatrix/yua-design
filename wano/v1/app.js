/* WANO核电评估平台 · 扩展功能 DEMO 交互逻辑（含分角色视图与完整三栏文档工作台） */
(function () {
  const D = window.DEMO_DATA;

  const TAB_META = {
    leadership: { label: '领导驾驶舱', en: 'Leadership', isNew: true },
    ops: { label: '运维监控', en: 'Ops Monitor', isNew: true },
    tenants: { label: '租户管理', en: 'Tenants', isNew: true },
    permissions: { label: '用户管理', en: 'Users & Roles', isNew: false },
    knowledge: { label: '知识库管理', en: 'Knowledge Base', isNew: true },
    documents: { label: '文档策略', en: 'Doc Policies', isNew: false },
    projects: { label: '项目管理', en: 'Projects', isNew: false },
    'leader-overview': { label: '总览', en: 'Overview', isNew: true },
    'leader-review': { label: '审核工作台', en: 'Review Desk', isNew: true },
    workbench: { label: '文档工作台', en: 'FACTs & Reports', isNew: false },
    'assessor-kb': { label: '知识库', en: 'Knowledge Base', isNew: true },
    'assessor-capture': { label: '数据录入', en: 'Data Capture', isNew: true },
    'wano-insights': { label: 'PR 任务与洞察', en: 'PR Mission & Insights', isNew: true },
    'wano-plan': { label: '同行评审计划', en: 'PR Plan', isNew: true },
    'wano-oe': { label: 'OE 与 SOER', en: 'OE & SOER Hub', isNew: true },
    'wano-epm': { label: 'EPM 与 PPSE', en: 'EPM & PPSE', isNew: true },
    'wano-exchange': { label: '脱敏导入导出', en: 'Sanitized Exchange', isNew: true }
  };

  const state = {
    portal: 'plant', // plant（自评估） | wano（同行评审）
    currentAccountId: D.DEMO_ACCOUNTS[0].id,
    page: D.DEMO_ACCOUNTS[0].defaultPage,
    globalTenant: D.DEMO_ACCOUNTS[0].tenantId,
    analyticsRange: '30d',
    avatarMenuOpen: false,
    orgScope: 'institute', // institute（研究院·仅超管） | wano（WANO·仅WANO角色） | plant（具体电厂·自评估或PR/PSUR）
    // 队长/计划负责人视角状态（总览甘特图 + 审核工作台连续审核）
    leaderProjectId: 'PRJ-2026-QS', // 项目 ID 或 'all'（全部项目汇总）
    leaderReviewProjectId: 'PRJ-2026-QS',
    leaderReviewStatus: 'submitted', // submitted | rejected | accepted | all
    leaderReviewInDoc: false, // false: 队列列表 | true: 文档审核界面（支持连续审核下一条）
    ganttStatusFilter: 'all',
    ganttModeFilter: 'all',
    ganttCollapsedPlans: {},
    // WANO 同行评审视角状态
    wanoUiLang: 'en', // en | zh（仅对 WANO 角色生效）
    wanoScope: 'current_plant', // current_plant | global_fleet
    wanoPrCategory: 'PR', // PR | PSUR
    wanoPlanSelectedDate: '2026-11-19',
    wanoPlanAreaFilter: 'all',
    wanoOeTab: 'soer', // soer | wer
    wanoEpmTab: 'pi', // pi | aoc | ppse
    wanoCurrentPlantId: D.WANO_PLANT_MATRIX[0].id,
    wanoAnonMode: true,
    wanoLiveSync: true,
    wanoSelectedFactIds: [],
    wanoOeEvents: JSON.parse(JSON.stringify(D.WANO_OE_EVENTS)),
    wanoEpmAocs: JSON.parse(JSON.stringify(D.WANO_EPM_AOCS)),
    wanoSanitizeRules: { anonPlant: true, redactPeople: true, maskKks: true, keepPoc: true },
    wanoCommonAfis: JSON.parse(JSON.stringify(D.WANO_COMMON_AFIS)),
    wanoSanitizationLogs: JSON.parse(JSON.stringify(D.WANO_SANITIZATION_LOGS)),
    projectFilters: { standard: '', area: '', year: '', keyword: '' },
    activeProjectId: null,
    activePlanId: null,
    permTab: 'users',
    permSearch: '',
    permUserStatus: 'all',
    permUserRole: 'all',
    kbTab: 'sources',
    kbDocFilters: { source: 'all', usage: 'all', status: 'all', keyword: '' },
    kbQaFilter: 'all',
    kbQaScope: 'all',
    kbTestMessages: [
      {
        role: 'assistant',
        text: '知识库检索测试台已就绪。支持同时检索「OBS 涉及来源（iOA / ECM / 人因管理系统 / 工单系统 / 领导待办 / 状态报告 / 线下）」与「AFI 准则（高：PO&C、IEEE、研究院 / 中：经验 / 低：BDX 公司与电厂程序）」。请点击下方示例问题或直接输入提问。',
        cites: []
      }
    ],
    // 文档工作台状态（默认标题列表视图，点击或创建后进入编辑态）
    wbViewMode: 'list', // list | editor
    wbFilters: { type: 'ALL', status: 'all', time: 'all', keyword: '', taskName: '' },
    wbActiveDocId: D.WORKSPACE_DOCUMENTS[0].id,
    wbFocusedBlockId: null,
    wbLanguage: 'zh', // 仅对 WANO 专家提供语言视图切换；非 WANO 固定中文界面
    wbRightTab: 'collab', // collab | leader_review
    wbReviewMode: false,
    wbFromProjectId: null,
    // 数据实体
    tenants: JSON.parse(JSON.stringify(D.TENANTS)),
    projects: JSON.parse(JSON.stringify(D.PROJECTS)),
    roles: JSON.parse(JSON.stringify(D.ROLES)),
    users: JSON.parse(JSON.stringify(D.USERS)),
    documents: JSON.parse(JSON.stringify(D.DOCUMENT_CONFIGS)),
    kbSources: JSON.parse(JSON.stringify(D.KB_SOURCES)),
    kbDocs: JSON.parse(JSON.stringify(D.KB_DOCUMENTS)),
    kbQas: JSON.parse(JSON.stringify(D.KB_QA_PAIRS)),
    workspaceDocs: JSON.parse(JSON.stringify(D.WORKSPACE_DOCUMENTS)),
    syncingSourceId: null,
    // 评估员专属：知识库查询与多模态数据录入状态
    assessorKbTab: 'docs', // docs | criteria
    assessorKbSource: 'all',
    assessorKbTier: 'all',
    assessorKbKeyword: '',
    assessorKbMessages: [
      {
        role: 'assistant',
        text: '欢迎使用评估员知识库问答助手。支持一键检索 WANO PO&C / IEEE 行业标准、SOER/SER 运行经验、BDX 电厂程序及 ECM/人因/工单历史资料，并可直接引用至 OBS 文档。',
        cites: []
      }
    ],
    captureTypeFilter: 'all', // all | audio | image | video
    captureModeFilter: 'all',
    captureAreaFilter: 'all',
    captureKeyword: '',
    captureRecords: JSON.parse(JSON.stringify(D.ASSESSOR_MULTIMODAL_RECORDS || [])),
    playingAudioId: null
  };

  const appEl = document.getElementById('app');
  const modalRoot = document.getElementById('modal-root');
  const toastRoot = document.getElementById('toast-root');
  let toastTimer = null;

  function currentAccount() {
    return D.DEMO_ACCOUNTS.find((a) => a.id === state.currentAccountId) || D.DEMO_ACCOUNTS[0];
  }

  function esc(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function showToast(msg) {
    toastRoot.innerHTML = `<div class="toast">${esc(msg)}</div>`;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastRoot.innerHTML = '';
    }, 2800);
  }

  function closeModal() {
    modalRoot.innerHTML = '';
  }

  function openModal(html, { drawer = false, wide = false } = {}) {
    modalRoot.innerHTML = `
      <div class="modal-overlay ${drawer ? 'drawer-mode' : ''}" data-close-overlay>
        <div class="modal-dialog ${wide ? 'wide' : ''}" role="dialog" aria-modal="true">
          ${html}
        </div>
      </div>
    `;
    const overlay = modalRoot.querySelector('[data-close-overlay]');
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay || e.target.closest('[data-modal-close]')) closeModal();
    });
  }

  function getTenantName(tenantId) {
    if (!tenantId || tenantId === 'all') return '全部核电基地';
    const found = state.tenants.find((t) => t.id === tenantId);
    return found ? found.name : tenantId;
  }

  function isPlantSelfMode() {
    return state.orgScope === 'plant' && state.portal === 'plant';
  }

  function getScopedProjects() {
    if (isPlantSelfMode() || state.globalTenant !== 'all') {
      return state.projects.filter((p) => p.tenantId === state.globalTenant);
    }
    return state.projects;
  }

  function getScopedWorkspaceDocs() {
    if (!isPlantSelfMode()) return state.workspaceDocs;
    const allowedIds = new Set(getScopedProjects().map((p) => p.id));
    return state.workspaceDocs.filter((d) => allowedIds.has(d.projectId));
  }

  function getTenantFactor(tenantId) {
    const map = { all: 1, 'tn-qinshan': 0.57, 'tn-fuqing': 0.43 };
    return map[tenantId] || 1;
  }

  function statusLabel(s) {
    const map = {
      active: '进行中',
      done: '已完成',
      todo: '未开始',
      pending: '待审查',
      draft: '未提交',
      submitted: '待审核',
      review: '需人工复核',
      cleaning: '清洗中',
      accepted: '已通过',
      rejected: '已驳回',
      online: '已连接',
      disabled: '已停用'
    };
    return map[s] || s;
  }

  function statusClass(s) {
    if (s === 'done' || s === 'accepted' || s === 'online') return 'done';
    if (s === 'active' || s === 'cleaning') return 'active';
    if (s === 'pending' || s === 'review' || s === 'todo' || s === 'submitted') return 'pending';
    if (s === 'rejected') return 'rejected';
    return 'muted';
  }

  function isWanoRole() {
    return currentAccount().portal === 'wano';
  }

  // WANO 队长与副队长权限完全一致
  function isWanoLeaderOrDeputy() {
    const k = currentAccount().roleKey;
    return k === 'wano_leader' || k === 'wano_deputy';
  }

  function isWanoLeadOrAbove() {
    const k = currentAccount().roleKey;
    return k === 'wano_leader' || k === 'wano_deputy' || k === 'wano_lead_assessor';
  }

  function wanoT(enText, zhText) {
    return isWanoRole() && state.wanoUiLang === 'en' ? enText : zhText;
  }

  // 实时双向翻译模拟（用于 WANO 专家写作时的 EN <-> ZH Live Sync）
  function liveTranslateMock(text, targetLang) {
    const raw = String(text || '').trim();
    if (!raw) return '';
    if (targetLang === 'zh') {
      const dict = [
        [/shift turnover/gi, '交接班'],
        [/main control room|MCR/gi, '主控室'],
        [/three-way communication/gi, '三向交流'],
        [/alarm/gi, '报警'],
        [/readback/gi, '复诵'],
        [/operator/gi, '操纵员'],
        [/FME/gi, '防异物（FME）'],
        [/procedure/gi, '程序'],
        [/observation/gi, '现场观察']
      ];
      let mapped = raw;
      dict.forEach(([re, zh]) => { mapped = mapped.replace(re, zh); });
      return `【实时译文 · EN→中】${mapped}`;
    }
    const dictEn = [
      [/交接班/g, 'shift turnover'],
      [/主控室/g, 'MCR'],
      [/三向交流/g, 'three-way communication'],
      [/报警/g, 'alarm'],
      [/复诵/g, 'readback'],
      [/操纵员/g, 'operator'],
      [/防异物/g, 'FME'],
      [/程序/g, 'procedure']
    ];
    let mappedEn = raw;
    dictEn.forEach(([re, en]) => { mappedEn = mappedEn.replace(re, en); });
    return `[Live Sync · ZH→EN] ${mappedEn}`;
  }

  function displayRoleLabel(acc) {
    if (!acc) return '';
    if (acc.roleKey === 'tenant_admin') {
      const plantName =
        state.globalTenant && state.globalTenant !== 'all'
          ? getTenantName(state.globalTenant)
          : getTenantName(acc.tenantId);
      return `${plantName}管理员`;
    }
    if (acc.portal === 'wano') {
      const useEn = state.wanoUiLang === 'en';
      const map = {
        wano_leader: useEn ? 'Team Leader' : 'WANO 队长',
        wano_deputy: useEn ? 'Deputy Team Leader' : 'WANO 副队长',
        wano_lead_assessor: useEn ? 'Lead Assessor' : 'WANO 主评估员',
        wano_assessor: useEn ? 'Assessor' : 'WANO 评估员'
      };
      return map[acc.roleKey] || acc.roleLabel;
    }
    return acc.roleLabel;
  }

  function wanoAreaLabel(area) {
    if (!(isWanoRole() && state.wanoUiLang === 'en')) return area;
    const map = {
      'OP 运行': 'OP Operations',
      'MA 维修': 'MA Maintenance',
      'EN 工程': 'EN Engineering',
      'ER 设备可靠性': 'ER Equipment Reliability',
      'RP 辐射防护': 'RP Radiation Protection',
      'NSC 核安全文化': 'NSC Safety Culture',
      '问题陈述': 'Problem Statement',
      '支持事实': 'Supporting Facts',
      '原因分析': 'Causes & Factors',
      '补充事实': 'Additional Fact'
    };
    return map[area] || area;
  }

  function wanoBlockLabel(label) {
    if (!(isWanoRole() && state.wanoUiLang === 'en')) return label;
    if (label.includes('/')) return label.split('/').slice(1).join('/').trim();
    const m = String(label).match(/^观察项\s*(\d+)$/);
    if (m) return `Observation ${m[1]}`;
    const m2 = String(label).match(/^补充段落\s*(\d+)$/);
    if (m2) return `Additional Section ${m2[1]}`;
    return label;
  }

  function wanoPlantLabel(p) {
    if (!p) return '';
    if (state.wanoAnonMode) return p.anonCode;
    return isWanoRole() && state.wanoUiLang === 'en' ? p.realName.replace(/\s*\([^)]*\)/g, '') : p.realName;
  }

  // ==================== 顶栏渲染（左上角标题式双下拉 + 居中导航 + 右上角纯头像菜单） ====================
  function renderTopbar() {
    const acc = currentAccount();
    const isWano = isWanoRole();
    const useEn = isWano && state.wanoUiLang === 'en';
    const currentModeVal = state.portal === 'plant' ? 'self' : state.wanoPrCategory === 'PSUR' ? 'psur' : 'pr';
    const activeNav =
      state.page === 'project-detail'
        ? 'projects'
        : state.page === 'workbench' && !acc.allowedTabs.includes('workbench')
          ? 'projects'
          : state.page;

    const plantOptionsHtml = `
      <option value="org-institute" ${state.orgScope === 'institute' ? 'selected' : ''}>${useEn ? 'Research Institute' : '研究院'}</option>
      <option value="org-wano" ${state.orgScope === 'wano' ? 'selected' : ''}>WANO</option>
      ${
        isWano && state.orgScope === 'plant'
          ? D.WANO_PLANT_MATRIX.map(
              (p) => `<option value="${p.id}" ${state.orgScope === 'plant' && p.id === state.wanoCurrentPlantId ? 'selected' : ''}>${esc(state.wanoAnonMode ? p.anonCode.split(' ')[0] : wanoPlantLabel(p))}</option>`
            ).join('')
          : state.tenants
              .map((t) => {
                const enPlantMap = { 'tn-qinshan': 'Qinshan NPP', 'tn-fuqing': 'Fuqing NPP' };
                const label = useEn ? enPlantMap[t.id] || t.name : t.name;
                return `<option value="${t.id}" ${state.orgScope === 'plant' && state.globalTenant === t.id ? 'selected' : ''}>${esc(label)}</option>`;
              })
              .join('')
      }
    `;

    return `
      <header class="workspace-topbar">
        <div class="brand-group">
          <button type="button" class="brand-logo-btn" data-nav="${acc.defaultPage}" title="${useEn ? 'Back to Home' : '返回默认首页'}">
            <span class="brand-mark">W</span>
          </button>
          <label class="title-select-wrap" title="${useEn ? 'Switch Organization / Plant' : '切换机构或电厂'}">
            <select id="topbar-plant-select" aria-label="${useEn ? 'Select Organization or Plant' : '选择机构或电厂'}">
              ${plantOptionsHtml}
            </select>
            <span class="title-select-caret">▾</span>
          </label>
          ${
            state.orgScope === 'institute'
              ? ''
              : `
            <span class="title-slash">/</span>
            <label class="title-select-wrap ${isWano ? 'mode-wano' : ''}" title="${useEn ? 'Switch Assessment Mode' : '切换评估模式'}">
              <select id="portal-mode-select" aria-label="${useEn ? 'Assessment Mode' : '选择评估模式'}">
                ${state.orgScope === 'plant' ? `<option value="self" ${currentModeVal === 'self' ? 'selected' : ''}>${useEn ? 'Self-Assessment' : '自评估'}</option>` : ''}
                <option value="pr" ${currentModeVal === 'pr' ? 'selected' : ''}>PR</option>
                <option value="psur" ${currentModeVal === 'psur' ? 'selected' : ''}>PSUR</option>
              </select>
              <span class="title-select-caret">▾</span>
            </label>
          `
          }
        </div>

        <nav class="topbar-nav" aria-label="${useEn ? 'Navigation' : '角色功能导航'}">
          ${acc.allowedTabs
            .map((tabId) => {
              const meta = TAB_META[tabId];
              return `
                <button type="button" class="topbar-nav-item ${activeNav === tabId ? 'active' : ''}" data-nav="${tabId}">
                  <span>${useEn ? meta.en : meta.label}</span>
                </button>
              `;
            })
            .join('')}
        </nav>

        <div class="workspace-account">
          <div class="avatar-menu-anchor">
            <button type="button" class="avatar-only-btn ${state.avatarMenuOpen ? 'open' : ''}" id="btn-avatar-menu" title="${esc(acc.name)} · ${esc(displayRoleLabel(acc))}" aria-expanded="${state.avatarMenuOpen}">
              <span class="avatar">${esc(acc.initials)}</span>
            </button>
            ${
              state.avatarMenuOpen
                ? `
              <div class="avatar-popover-menu" id="avatar-popover-menu">
                <div class="avatar-menu-head">
                  <span class="avatar" style="width:34px;height:34px;">${esc(acc.initials)}</span>
                  <div class="account-copy">
                    <strong>${esc(acc.name)}</strong>
                    <small>${esc(displayRoleLabel(acc))}${acc.roleKey === 'tenant_admin' ? '' : ` · ${esc(acc.portal === 'plant' && state.globalTenant !== 'all' ? getTenantName(state.globalTenant) : useEn ? acc.tenantLabel : acc.portal === 'wano' ? 'WANO 同行评审' : acc.tenantLabel)}`}</small>
                  </div>
                </div>
                <div class="avatar-menu-row">
                  <span>${useEn ? 'Interface Language' : '界面语言'}</span>
                  ${
                    isWano
                      ? `
                    <div class="wano-lang-toggle" role="group" aria-label="UI Language">
                      <button type="button" class="${state.wanoUiLang === 'en' ? 'active' : ''}" data-wano-ui-lang="en">EN</button>
                      <button type="button" class="${state.wanoUiLang === 'zh' ? 'active' : ''}" data-wano-ui-lang="zh">中</button>
                    </div>
                  `
                      : `<span class="workspace-tag">${state.orgScope === 'institute' ? '中文（研究院）' : '中文（电厂自评估）'}</span>`
                  }
                </div>
                <div class="avatar-menu-row" style="padding-top:6px;border-top:1px solid var(--line);font-size:11.5px;color:var(--ink-3);">
                  <span>${useEn ? 'Scope' : '当前视角'}</span>
                  <span class="workspace-tag ${isWano ? 'green' : 'blue'}">${
                    state.orgScope === 'institute'
                      ? '研究院'
                      : state.orgScope === 'wano'
                        ? (useEn ? `WANO ${state.wanoPrCategory}` : `WANO ${state.wanoPrCategory} 同行评审`)
                        : currentModeVal === 'self'
                          ? '自评估（电厂）'
                          : (useEn ? `${state.wanoPrCategory} Peer Review` : `${state.wanoPrCategory} 同行评审`)
                  }</span>
                </div>
              </div>
            `
                : ''
            }
          </div>
        </div>
      </header>
    `;
  }

  function renderFloatingRoleSwitcher() {
    const acc = currentAccount();
    const useEn = isWanoRole() && state.wanoUiLang === 'en';
    const portalAccounts =
      state.orgScope === 'institute'
        ? D.DEMO_ACCOUNTS.filter((a) => a.roleKey === 'super_admin')
        : state.orgScope === 'wano'
          ? D.DEMO_ACCOUNTS.filter((a) => a.portal === 'wano')
          : D.DEMO_ACCOUNTS.filter((a) => a.portal === state.portal && a.roleKey !== 'super_admin');
    return `
      <label class="floating-role-switcher" title="${useEn ? 'Switch Demo Role' : '切换当前视角下的演示角色'}">
        <span class="role-switcher-dot ${acc.roleKey}"></span>
        <span>${useEn ? 'Switch Role' : '切换用户'}</span>
        <select id="role-account-select">
          ${portalAccounts
            .map(
              (item) => `
              <option value="${item.id}" ${item.id === acc.id ? 'selected' : ''}>
                ${esc(displayRoleLabel(item))} · ${esc(item.name)}
              </option>
            `
            )
            .join('')}
        </select>
      </label>
    `;
  }

  // ==================== 通用 SVG 图表组件（面积折线图 / 分组柱状图 / 环形占比图 / 半圆仪表盘 / 能力雷达图） ====================
  function renderAreaTrendSvg(labels, seriesA, seriesB, colorA, colorB, suffixA = '', suffixB = '') {
    const W = 620;
    const H = 205;
    const padL = 44;
    const padR = 18;
    const padT = 18;
    const padB = 28;
    const maxVal = Math.max(...seriesA, ...seriesB, 10) * 1.15;
    const plotW = W - padL - padR;
    const plotH = H - padT - padB;
    const stepX = labels.length > 1 ? plotW / (labels.length - 1) : plotW;
    const baseY = padT + plotH;
    const gid = 'area-' + Math.random().toString(36).slice(2, 7);

    const coords = (arr) =>
      arr.map((v, i) => ({
        x: padL + i * stepX,
        y: padT + plotH - (v / maxVal) * plotH,
        v
      }));
    const ptsA = coords(seriesA);
    const ptsB = coords(seriesB);
    const lineStr = (pts) => pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
    const areaStr = (pts) =>
      `M ${pts[0].x.toFixed(1)},${baseY.toFixed(1)} ` +
      pts.map((p) => `L ${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') +
      ` L ${pts[pts.length - 1].x.toFixed(1)},${baseY.toFixed(1)} Z`;

    const gridLines = [0, 0.25, 0.5, 0.75, 1]
      .map((ratio) => {
        const y = padT + plotH * (1 - ratio);
        const val = Math.round(maxVal * ratio);
        return `
          <line x1="${padL}" y1="${y.toFixed(1)}" x2="${W - padR}" y2="${y.toFixed(1)}" stroke="#eef0f2" stroke-width="1" />
          <text x="${padL - 8}" y="${(y + 4).toFixed(1)}" text-anchor="end" fill="#8a8f98" font-size="10">${val}</text>
        `;
      })
      .join('');

    const dense = labels.length > 10;
    const xLabels = labels
      .map((lbl, i) => `<text x="${(padL + i * stepX).toFixed(1)}" y="${H - 8}" text-anchor="middle" fill="#8a8f98" font-size="${dense ? '9.2' : '10.5'}">${esc(lbl)}</text>`)
      .join('');

    const dots = (pts, color, suffix, seriesIdx) =>
      pts
        .map((p, i) => `<circle class="chart-dot" data-series-idx="${seriesIdx}" data-point-idx="${i}" cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${dense ? '3.0' : '3.6'}" fill="#fff" stroke="${color}" stroke-width="${dense ? '1.9' : '2.1'}"></circle>`)
        .join('');

    const hitStrips = labels
      .map((lbl, i) => {
        const x = padL + i * stepX;
        const w = Math.max(18, stepX);
        const tipBody = `系列 1：${seriesA[i]}${suffixA}  |  系列 2：${seriesB[i]}${suffixB}`;
        return `<rect class="area-hit-col" data-point-idx="${i}" data-x="${x.toFixed(1)}" data-tip-title="采样点：${esc(lbl)}" data-tip-body="${esc(tipBody)}" x="${Math.max(padL, x - w / 2).toFixed(1)}" y="${padT}" width="${w.toFixed(1)}" height="${plotH}" fill="transparent" style="cursor:crosshair;" />`;
      })
      .join('');

    return `
      <svg class="interactive-area-svg" viewBox="0 0 ${W} ${H}" style="width:100%;height:auto;display:block;">
        <defs>
          <linearGradient id="${gid}a" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${colorA}" stop-opacity="0.22" />
            <stop offset="100%" stop-color="${colorA}" stop-opacity="0.01" />
          </linearGradient>
          <linearGradient id="${gid}b" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${colorB}" stop-opacity="0.16" />
            <stop offset="100%" stop-color="${colorB}" stop-opacity="0.01" />
          </linearGradient>
        </defs>
        ${gridLines}
        <line class="area-crosshair" x1="0" y1="${padT}" x2="0" y2="${baseY}" stroke="#8a94a6" stroke-width="1" stroke-dasharray="3 3" style="opacity:0;pointer-events:none;" />
        <g data-chart-series="0">
          <path d="${areaStr(ptsA)}" fill="url(#${gid}a)" />
          <polyline fill="none" stroke="${colorA}" stroke-width="2.4" stroke-linejoin="round" points="${lineStr(ptsA)}" />
          ${dots(ptsA, colorA, suffixA, 0)}
        </g>
        <g data-chart-series="1">
          <path d="${areaStr(ptsB)}" fill="url(#${gid}b)" />
          <polyline fill="none" stroke="${colorB}" stroke-width="2.4" stroke-linejoin="round" points="${lineStr(ptsB)}" />
          ${dots(ptsB, colorB, suffixB, 1)}
        </g>
        ${xLabels}
        ${hitStrips}
      </svg>
    `;
  }

  function renderGroupedBarSvg(labels, seriesA, seriesB, colorA, colorB, nameA, nameB) {
    const W = 560;
    const H = 215;
    const padL = 38;
    const padR = 14;
    const padT = 22;
    const padB = 34;
    const maxVal = Math.max(...seriesA, ...seriesB, 5) * 1.2;
    const plotW = W - padL - padR;
    const plotH = H - padT - padB;
    const groupW = plotW / Math.max(1, labels.length);
    const barW = Math.min(24, groupW * 0.28);

    const gridLines = [0, 0.25, 0.5, 0.75, 1]
      .map((ratio) => {
        const y = padT + plotH * (1 - ratio);
        const val = Math.round(maxVal * ratio);
        return `
          <line x1="${padL}" y1="${y.toFixed(1)}" x2="${W - padR}" y2="${y.toFixed(1)}" stroke="#eef0f2" stroke-width="1" />
          <text x="${padL - 7}" y="${(y + 3.5).toFixed(1)}" text-anchor="end" fill="#8a8f98" font-size="10">${val}</text>
        `;
      })
      .join('');

    const barsA = labels
      .map((lbl, i) => {
        const cx = padL + groupW * (i + 0.5);
        const hA = (seriesA[i] / maxVal) * plotH;
        const yA = padT + plotH - hA;
        const ratio = seriesA[i] ? Math.round((seriesB[i] / seriesA[i]) * 100) : 0;
        return `
          <rect class="chart-bar-rect" data-tip-title="${esc(lbl)} · ${esc(nameA)}" data-tip-body="${esc(nameA)}：${seriesA[i]}  |  ${esc(nameB)}：${seriesB[i]}（比例 ${ratio}%）" x="${(cx - barW - 2).toFixed(1)}" y="${yA.toFixed(1)}" width="${barW.toFixed(1)}" height="${hA.toFixed(1)}" rx="4" fill="${colorA}" />
          <text x="${(cx - barW / 2 - 2).toFixed(1)}" y="${(yA - 4).toFixed(1)}" text-anchor="middle" fill="${colorA}" font-size="9.5" font-weight="600">${seriesA[i]}</text>
        `;
      })
      .join('');

    const barsB = labels
      .map((lbl, i) => {
        const cx = padL + groupW * (i + 0.5);
        const hB = (seriesB[i] / maxVal) * plotH;
        const yB = padT + plotH - hB;
        const ratio = seriesA[i] ? Math.round((seriesB[i] / seriesA[i]) * 100) : 0;
        return `
          <rect class="chart-bar-rect" data-tip-title="${esc(lbl)} · ${esc(nameB)}" data-tip-body="${esc(nameB)}：${seriesB[i]}  |  ${esc(nameA)}：${seriesA[i]}（比例 ${ratio}%）" x="${(cx + 2).toFixed(1)}" y="${yB.toFixed(1)}" width="${barW.toFixed(1)}" height="${hB.toFixed(1)}" rx="4" fill="${colorB}" />
          <text x="${(cx + barW / 2 + 2).toFixed(1)}" y="${(yB - 4).toFixed(1)}" text-anchor="middle" fill="${colorB}" font-size="9.5" font-weight="600">${seriesB[i]}</text>
        `;
      })
      .join('');

    const xTexts = labels
      .map((lbl, i) => `<text x="${(padL + groupW * (i + 0.5)).toFixed(1)}" y="${H - 10}" text-anchor="middle" fill="#525860" font-size="10.5">${esc(lbl)}</text>`)
      .join('');

    return `
      <svg class="interactive-bar-svg" viewBox="0 0 ${W} ${H}" style="width:100%;height:auto;display:block;">
        ${gridLines}
        <g data-chart-series="0">${barsA}</g>
        <g data-chart-series="1">${barsB}</g>
        ${xTexts}
      </svg>
    `;
  }

  function renderDonutSvg(items, centerTop, centerBottom) {
    const size = 176;
    const cx = size / 2;
    const cy = size / 2;
    const r = 62;
    const stroke = 15;
    const C = 2 * Math.PI * r;
    const gapArc = stroke + 7; // 预留圆角端帽与段间距，确保圆角圆环分段拼接无重叠
    const palette = ['#46618a', '#17191b', '#6f5a96', '#3f7a5e', '#c28e3c', '#8a94a6'];
    const totalNum = Number(String(centerTop).replace(/[^0-9.]/g, '')) || 0;
    let offset = 0;

    const segments = items
      .map((item, idx) => {
        const sliceLen = item.share * C;
        const dashLen = Math.max(2, sliceLen - gapArc);
        const startPos = offset + gapArc / 2;
        const color = palette[idx % palette.length];
        const pct = Math.round(item.share * 100);
        const estCount = totalNum ? Math.round(totalNum * item.share) : 0;
        const seg = `<circle class="donut-seg" data-donut-idx="${idx}" data-donut-pct="${pct}%" data-donut-name="${esc(item.name)}" data-tip-title="${esc(item.name)}" data-tip-body="占比 ${pct}%${estCount ? ` · 约 ${estCount} 条证据` : ''}" cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round" stroke-dasharray="${dashLen.toFixed(2)} ${(C - dashLen).toFixed(2)}" stroke-dashoffset="${(-startPos).toFixed(2)}" transform="rotate(-90 ${cx} ${cy})" />`;
        offset += sliceLen;
        return seg;
      })
      .join('');

    return `
      <div class="donut-chart-layout interactive-donut-wrap" data-default-top="${esc(centerTop)}" data-default-bottom="${esc(centerBottom)}">
        <svg viewBox="0 0 ${size} ${size}" style="width:176px;height:176px;display:block;margin:0 auto;">
          <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#f2f4f7" stroke-width="${stroke}" />
          ${segments}
          <text class="donut-center-top" x="${cx}" y="${cy - 2}" text-anchor="middle" fill="#18191b" font-size="18" font-weight="700">${esc(centerTop)}</text>
          <text class="donut-center-bottom" x="${cx}" y="${cy + 15}" text-anchor="middle" fill="#8a8f98" font-size="10.2">${esc(centerBottom)}</text>
        </svg>
        <div class="donut-legend">
          ${items
            .map((item, idx) => {
              const pct = Math.round(item.share * 100);
              const estCount = totalNum ? Math.round(totalNum * item.share) : 0;
              return `
            <div class="donut-legend-item" data-donut-idx="${idx}" data-donut-pct="${pct}%" data-donut-name="${esc(item.name)}" data-tip-title="${esc(item.name)}" data-tip-body="占比 ${pct}%${estCount ? ` · 约 ${estCount} 条证据` : ''}">
              <span class="donut-legend-left"><i class="donut-swatch" style="background:${palette[idx % palette.length]};"></i><span>${esc(item.name)}</span></span>
              <strong>${pct}%</strong>
            </div>
          `;
            })
            .join('')}
        </div>
      </div>
    `;
  }

  function renderGaugeSvg(percent, title, subtitle, color) {
    const clamped = Math.max(0, Math.min(100, percent));
    const r = 46;
    const halfC = Math.PI * r;
    const dash = (clamped / 100) * halfC;
    return `
      <div class="gauge-card">
        <svg viewBox="0 0 120 74" style="width:118px;height:72px;display:block;">
          <path d="M 14 62 A 46 46 0 0 1 106 62" fill="none" stroke="#ebedf0" stroke-width="10" stroke-linecap="round" />
          <path d="M 14 62 A 46 46 0 0 1 106 62" fill="none" stroke="${color}" stroke-width="10" stroke-linecap="round" stroke-dasharray="${dash.toFixed(1)} ${halfC.toFixed(1)}" />
          <text x="60" y="56" text-anchor="middle" fill="#18191b" font-size="17" font-weight="700">${clamped}%</text>
        </svg>
        <strong>${esc(title)}</strong>
        <small>${esc(subtitle)}</small>
      </div>
    `;
  }

  function renderRadarSvg(labels, plantVals, fleetVals, plantName, fleetName) {
    const W = 320;
    const H = 250;
    const cx = 160;
    const cy = 128;
    const maxR = 88;
    const n = labels.length;
    const pointAt = (idx, ratio) => {
      const angle = (Math.PI * 2 * idx) / n - Math.PI / 2;
      return [cx + Math.cos(angle) * maxR * ratio, cy + Math.sin(angle) * maxR * ratio];
    };
    const polyStr = (vals) => vals.map((v, i) => pointAt(i, v / 100).map((c) => c.toFixed(1)).join(',')).join(' ');
    const rings = [0.25, 0.5, 0.75, 1]
      .map((r) => `<polygon points="${labels.map((_, i) => pointAt(i, r).map((c) => c.toFixed(1)).join(',')).join(' ')}" fill="none" stroke="#e6e9ee" stroke-width="1" />`)
      .join('');
    const axes = labels
      .map((lbl, i) => {
        const [x, y] = pointAt(i, 1);
        const [lx, ly] = pointAt(i, 1.22);
        return `
          <line x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="#e6e9ee" stroke-width="1" />
          <text x="${lx.toFixed(1)}" y="${(ly + 4).toFixed(1)}" text-anchor="middle" fill="#525860" font-size="11" font-weight="600">${esc(lbl)}</text>
        `;
      })
      .join('');

    return `
      <div class="radar-wrap">
        <svg viewBox="0 0 ${W} ${H}" style="width:100%;max-width:340px;height:auto;display:block;">
          ${rings}
          ${axes}
          <polygon points="${polyStr(fleetVals)}" fill="rgba(138,143,152,0.14)" stroke="#8a8f98" stroke-width="1.6" stroke-dasharray="4 3" />
          <polygon points="${polyStr(plantVals)}" fill="rgba(63,122,94,0.22)" stroke="#3f7a5e" stroke-width="2.2" />
          ${plantVals
            .map((v, i) => {
              const [x, y] = pointAt(i, v / 100);
              const diff = v - fleetVals[i];
              const diffStr = diff >= 0 ? `+${diff}` : `${diff}`;
              return `<circle class="radar-dot" data-tip-title="${esc(labels[i])} 能力评分" data-tip-body="${esc(plantName)}：${v} 分  |  ${esc(fleetName)}：${fleetVals[i]} 分（${diffStr}）" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4.5" fill="#fff" stroke="#3f7a5e" stroke-width="2.2" style="cursor:pointer;" />`;
            })
            .join('')}
        </svg>
      </div>
    `;
  }

  // ==================== 1A. 领导驾驶舱（一级菜单） ====================
  function renderLeadershipPage() {
    const acc = currentAccount();
    const isSuper = acc.roleKey === 'super_admin';
    const base = D.ANALYTICS_BASE[state.analyticsRange];
    const factor = getTenantFactor(state.globalTenant);
    const scale = (n) => Math.max(1, Math.round(n * factor));

    const obsReports = scale(base.obsReports);
    const afiReports = scale(base.afiReports);
    const projectsTotal = state.globalTenant === 'all' ? base.projectsTotal : Math.max(1, scale(base.projectsTotal));
    const projectsActive = Math.max(1, Math.round(projectsTotal * 0.55));
    const adoptionRate = (base.adoptionRate + (state.globalTenant === 'tn-qinshan' ? 1.8 : state.globalTenant === 'tn-fuqing' ? -1.1 : 0)).toFixed(1);
    const closureRate = (89.6 + (state.globalTenant === 'tn-qinshan' ? 3.2 : state.globalTenant === 'tn-fuqing' ? -1.8 : 0)).toFixed(1);
    const highStdAlign = (94.8 + (state.globalTenant === 'tn-qinshan' ? 1.7 : state.globalTenant === 'tn-fuqing' ? -1.2 : 0)).toFixed(1);
    const commonRisks = state.globalTenant === 'all' ? 7 : Math.max(2, Math.round(7 * factor + 1));
    const activeAssessors = state.globalTenant === 'all' ? '127 / 144' : `${Math.round(48 * factor + 8)} / ${Math.round(52 * factor + 10)}`;

    const tenantShift = state.globalTenant === 'tn-qinshan' ? 1.8 : state.globalTenant === 'tn-fuqing' ? -1.1 : 0;
    const leadTrendLabels = base.qualityTrendLabels || base.trendLabels;
    const leadSeriesClosure = (base.qualityClosureSeries || base.trendLabels.map((_, i) => 82 + i * 2)).map((v) => Number(Math.min(98, Math.max(60, v + tenantShift)).toFixed(1)));
    const leadSeriesAdopt = (base.qualityAdoptSeries || base.trendLabels.map((_, i) => 78 + i * 2)).map((v) => Number(Math.min(96, Math.max(55, v + tenantShift)).toFixed(1)));
    const areaLabels = D.AREA_REPORTS.map((r) => r.area.split(' ')[0]);
    const areaObs = D.AREA_REPORTS.map((r) => scale(r.obs));
    const areaAfi = D.AREA_REPORTS.map((r) => scale(r.afi));

    return `
      <section class="workspace-island scrollable">
        <div class="workspace-page-heading">
          <div>
            <h1>${isSuper ? '领导驾驶舱 · 评估成效与电厂对标' : `${esc(getTenantName(state.globalTenant))} · 领导驾驶舱`}</h1>
            <p class="page-subtitle">当前视图：${esc(getTenantName(state.globalTenant))} · 统计周期：${base.label} · ${isSuper ? '聚焦核电自评估提效、最高标准对齐率与跨基地对标' : '聚焦本厂自评估提效、标准对齐率与问题闭环'}</p>
          </div>
          <div class="heading-actions">
            ${['7d', '30d', 'quarter', 'year']
              .map(
                (r) => `<button type="button" class="perm-tab ${state.analyticsRange === r ? 'active' : ''}" data-range="${r}">${D.ANALYTICS_BASE[r].label}</button>`
              )
              .join('')}
          </div>
        </div>

        <div class="kpi-grid">
          <article class="kpi-card">
            <div class="kpi-head"><span>AI 建议采用率</span><span class="workspace-tag green">提效 52%</span></div>
            <div class="kpi-value">${adoptionRate}%</div>
            <div class="kpi-foot"><span>报告编制 6.5h → 3.1h</span><span class="trend-up">${base.adoptionDelta}</span></div>
          </article>
          <article class="kpi-card">
            <div class="kpi-head"><span>最高标准准则对齐率</span><span class="workspace-tag blue">PO&C / IEEE</span></div>
            <div class="kpi-value">${highStdAlign}%</div>
            <div class="kpi-foot"><span>行业标准条文自动核验</span><span class="trend-up">+2.4%</span></div>
          </article>
          <article class="kpi-card">
            <div class="kpi-head"><span>OBS / AFI 报告产出</span><span class="workspace-tag purple">转化 ${Math.round((afiReports / obsReports) * 100)}%</span></div>
            <div class="kpi-value">${obsReports} <span style="font-size:15px;font-weight:500;color:var(--ink-3);">/ ${afiReports}</span></div>
            <div class="kpi-foot"><span>AFI 按期闭环率</span><span class="trend-up">${closureRate}%</span></div>
          </article>
          <article class="kpi-card">
            <div class="kpi-head"><span>${isSuper ? '跨厂共性 AFI 预警' : '本厂高频重复 AFI 预警'}</span><span class="workspace-tag yellow">重复风险</span></div>
            <div class="kpi-value">${commonRisks} 项</div>
            <div class="kpi-foot"><span>FME / 三向交流 / 报警</span><span class="trend-up">同比 -22%</span></div>
          </article>
          <article class="kpi-card">
            <div class="kpi-head"><span>在评项目与节点按期率</span><span class="workspace-tag">全周期</span></div>
            <div class="kpi-value">${projectsTotal} <span style="font-size:14px;font-weight:500;color:var(--green);">92.4%</span></div>
            <div class="kpi-foot"><span>进行中 ${projectsActive} · 已完成 ${projectsTotal - projectsActive}</span></div>
          </article>
          <article class="kpi-card">
            <div class="kpi-head"><span>评估员 AI 活跃渗透率</span><span class="workspace-tag green">深度使用</span></div>
            <div class="kpi-value">88.5%</div>
            <div class="kpi-foot"><span>活跃 ${activeAssessors} 人</span><span>人均 18.6 次/周</span></div>
          </article>
        </div>

        <div class="dashboard-grid">
          <div class="panel-card">
            <div class="panel-card-head">
              <div>
                <h3>评估质量与 AI 赋能成效趋势</h3>
                <small>跟踪周期内 AFI 整改闭环率与评估员 AI 建议采用率演进</small>
              </div>
              <div class="chart-legend">
                <span><i class="legend-dot" style="background:#3f7a5e;"></i>AFI 整改闭环率 (%)</span>
                <span><i class="legend-dot" style="background:#46618a;"></i>AI 建议采用率 (%)</span>
              </div>
            </div>
            <div class="chart-svg-wrap">
              ${renderAreaTrendSvg(leadTrendLabels, leadSeriesClosure, leadSeriesAdopt, '#3f7a5e', '#46618a', '%', '%')}
            </div>
          </div>

          <div class="panel-card">
            <div class="panel-card-head">
              <div>
                <h3>外部数据源 OBS 证据支撑占比</h3>
                <small>反映 ECM、状态报告、人因系统等外部数据打通后的实际业务利用率</small>
              </div>
            </div>
            ${renderDonutSvg(D.OBS_SOURCE_CONTRIBUTION, `${obsReports}`, 'OBS 证据数')}
          </div>
        </div>

        ${
          isSuper
            ? `
        <div class="panel-card" style="margin-bottom:14px;">
          <div class="panel-card-head">
            <div>
              <h3>${
                state.globalTenant === 'all'
                  ? '不同电厂租户核心评估指标横向对标'
                  : `机群对标参考（当前高亮：${esc(getTenantName(state.globalTenant))}；上方 KPI 与趋势为单基地口径）`
              }</h3>
              <small>对比各核电基地在 OBS/AFI 产出、AI 采用率、一次审核通过率、最高标准对齐率及高频风险领域表现</small>
            </div>
            <span class="workspace-tag blue">WANO 同行评审基准</span>
          </div>
          <div class="table-scroll">
            <table class="data-table">
              <thead>
                <tr>
                  <th>电厂基地租户</th>
                  <th>项目（在评 / 完成）</th>
                  <th>OBS / AFI 报告</th>
                  <th>AI 建议采用率</th>
                  <th>AFI 一次通过率</th>
                  <th>最高标准对齐率</th>
                  <th>AFI 闭环率</th>
                  <th>高频关注领域</th>
                </tr>
              </thead>
              <tbody>
                ${D.PLANT_BENCHMARKS.map((row) => {
                  const highlight = state.globalTenant === row.tenantId;
                  return `
                    <tr style="${highlight ? 'background:#f3f7fc;' : ''}">
                      <td>
                        <button type="button" class="workspace-text-button primary-link" data-open-tenant="${row.tenantId}">${esc(row.name)}</button>
                        <span class="cell-sub">${esc(row.code)} · ${esc(row.units)}</span>
                      </td>
                      <td>${row.projectsActive} / ${row.projectsDone}</td>
                      <td><strong>${row.obsCount}</strong> / <span style="color:var(--purple);font-weight:600;">${row.afiCount}</span></td>
                      <td><span class="workspace-tag ${row.aiAdoption >= 86 ? 'green' : 'blue'}">${row.aiAdoption}%</span></td>
                      <td>${row.firstPassRate}%</td>
                      <td><span class="workspace-tag blue">${row.highStdAlign}%</span></td>
                      <td><span class="workspace-tag ${row.closureRate >= 90 ? 'green' : 'yellow'}">${row.closureRate}%</span></td>
                      <td><span class="workspace-tag">${esc(row.topRiskArea)}</span></td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
        `
            : ''
        }

        <div class="dashboard-grid">
          <div class="panel-card">
            <div class="panel-card-head">
              <div>
                <h3>WANO PO&C 功能领域 OBS / AFI 对比（分组柱状图）</h3>
                <small>按运行、维修、工程、设备可靠性等核心领域对比观察与待改进产出</small>
              </div>
              <div class="chart-legend">
                <span><i class="legend-dot" style="background:#46618a;"></i>OBS 观察</span>
                <span><i class="legend-dot" style="background:#6f5a96;"></i>AFI 报告</span>
              </div>
            </div>
            <div class="chart-svg-wrap">
              ${renderGroupedBarSvg(areaLabels, areaObs, areaAfi, '#46618a', '#6f5a96', 'OBS', 'AFI')}
            </div>
          </div>

          <div class="panel-card">
            <div class="panel-card-head">
              <div>
                <h3>${isSuper ? '跨厂高频共性风险主题 Top 5' : '本厂高频风险主题 Top 5'}</h3>
                <small>${isSuper ? '基于多基地 OBS/AFI 聚类识别机群共性管理短板' : '基于本厂 OBS/AFI 聚类识别高频关注管理短板'}</small>
              </div>
            </div>
            <div class="bar-list">
              ${D.COMMON_RISK_TOPICS.map((item) => {
                const cnt = state.globalTenant === 'all' ? item.count : Math.max(2, Math.round(item.count * factor));
                const pct = Math.min(100, Math.round((item.count / 32) * 100));
                return `
                  <div class="bar-row">
                    <div class="bar-row-meta">
                      <strong>${esc(item.topic)}</strong>
                      <span>${cnt} 起${isSuper ? ` · ${item.plants} 基地` : ''} · 同比 ${item.trend}</span>
                    </div>
                    <div class="bar-track"><div class="bar-fill ${item.tone}" style="width:${pct}%"></div></div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>
      </section>
    `;
  }

  // ==================== 1B. 运维监控（一级菜单） ====================
  function renderOpsPage() {
    const acc = currentAccount();
    const isSuper = acc.roleKey === 'super_admin';
    const base = D.ANALYTICS_BASE[state.analyticsRange];
    const ops = D.OPS_TRENDS[state.analyticsRange];
    const factor = getTenantFactor(state.globalTenant);
    const scale = (n) => Math.max(1, Math.round(n * factor));

    const agentCalls = scale(base.agentCalls);
    const toolCalls = scale(base.toolCalls);
    const opsSeriesGpu = ops.trendGpu;
    const opsSeriesP95Scaled = ops.trendP95.map((v) => Math.round(v * 12));
    const vramPct = Math.round((ops.vramUsed / ops.vramTotal) * 100);

    return `
      <section class="workspace-island scrollable">
        <div class="workspace-page-heading">
          <div>
            <h1>${isSuper ? '运维监控 · 性能、算力与接口健康' : `${esc(getTenantName(state.globalTenant))} · 运维监控`}</h1>
            <p class="page-subtitle">当前视图：${esc(getTenantName(state.globalTenant))} · 统计周期：${base.label} · 面向内网离线部署运维团队的实时观测面板</p>
          </div>
          <div class="heading-actions">
            ${['7d', '30d', 'quarter', 'year']
              .map(
                (r) => `<button type="button" class="perm-tab ${state.analyticsRange === r ? 'active' : ''}" data-range="${r}">${D.ANALYTICS_BASE[r].label}</button>`
              )
              .join('')}
          </div>
        </div>

        <div class="kpi-grid">
          <article class="kpi-card">
            <div class="kpi-head"><span>${isSuper ? '平台可用性（SLA）' : '本厂服务可用性'}</span><span class="workspace-tag green">零 P1 故障</span></div>
            <div class="kpi-value">${ops.sla}</div>
            <div class="kpi-foot"><span>${isSuper ? '当前并发会话 46' : '当前活跃会话 16'}</span><span class="trend-up">运行健康</span></div>
          </article>
          <article class="kpi-card">
            <div class="kpi-head"><span>智能体调用 / 失败率</span><span class="workspace-tag">AI 网关</span></div>
            <div class="kpi-value">${agentCalls.toLocaleString()}</div>
            <div class="kpi-foot"><span>失败率 ${ops.failRate}</span><span class="trend-up">${base.agentDelta}</span></div>
          </article>
          <article class="kpi-card">
            <div class="kpi-head"><span>工具调用 / P95 耗时</span><span class="workspace-tag blue">TTFT ${ops.ttftSec}</span></div>
            <div class="kpi-value">${ops.p95Sec}</div>
            <div class="kpi-foot"><span>共 ${toolCalls.toLocaleString()} 次调用</span><span class="trend-neutral">阈值 ≤5.0s</span></div>
          </article>
          ${
            isSuper
              ? `
            <article class="kpi-card">
              <div class="kpi-head"><span>内网 GPU 算力利用率</span><span class="workspace-tag purple">平台级集群</span></div>
              <div class="kpi-value">${ops.gpuUtil}%</div>
              <div class="kpi-foot"><span>显存 ${ops.vramUsed} / ${ops.vramTotal} GB</span><span>温度正常</span></div>
            </article>
          `
              : `
            <article class="kpi-card">
              <div class="kpi-head"><span>本厂日配额水位</span><span class="workspace-tag blue">本厂额度</span></div>
              <div class="kpi-value">74%</div>
              <div class="kpi-foot"><span>峰值并发 22</span><span class="trend-up">裕量充足</span></div>
            </article>
          `
          }
          <article class="kpi-card">
            <div class="kpi-head"><span>Token 消耗 / 配额状态</span><span class="workspace-tag yellow">无触发限流</span></div>
            <div class="kpi-value">${(ops.tokensM * factor).toFixed(1)}M</div>
            <div class="kpi-foot"><span>${isSuper ? `最高租户水位 ${ops.maxQuotaPct}%` : '本厂月度额度内'}</span><span>安全裕量充足</span></div>
          </article>
          <article class="kpi-card">
            <div class="kpi-head"><span>向量检索与同步通道</span><span class="workspace-tag green">7/7 在线</span></div>
            <div class="kpi-value">${ops.vectorMs}</div>
            <div class="kpi-foot"><span>切片总量 ${ops.vectorChunksW}</span><span>双路召回</span></div>
          </article>
        </div>

        ${
          isSuper
            ? `
          <div class="dashboard-grid">
            <div class="panel-card">
              <div class="panel-card-head">
                <div>
                  <h3>内网推理算力与响应延迟趋势（面积折线图）</h3>
                  <small>平台级视角：监控 GPU 集群负载 (%) 与工具调用 P95 响应延迟变化</small>
                </div>
                <div class="chart-legend">
                  <span><i class="legend-dot" style="background:#6f5a96;"></i>GPU 算力利用率 (%)</span>
                  <span><i class="legend-dot" style="background:#17191b;"></i>P95 延迟指数（秒×12）</span>
                </div>
              </div>
              <div class="chart-svg-wrap">
                ${renderAreaTrendSvg(base.trendLabels, opsSeriesGpu, opsSeriesP95Scaled, '#6f5a96', '#17191b', '%', '')}
              </div>
            </div>

            <div class="panel-card">
              <div class="panel-card-head">
                <div>
                  <h3>平台核心算力与检索水位（半圆仪表盘）</h3>
                  <small>仅超级管理员/平台运维可见的内网 GPU 集群与显存负载</small>
                </div>
              </div>
              <div class="gauge-grid">
                ${renderGaugeSvg(Math.round(ops.gpuUtil), 'GPU 算力集群', 'Qwen-72B + DeepSeek', '#6f5a96')}
                ${renderGaugeSvg(vramPct, '显存占用水位', `${ops.vramUsed} / ${ops.vramTotal} GB`, '#46618a')}
                ${renderGaugeSvg(49, '双路向量检索', `QPS 36 · ${ops.vectorMs}`, '#3f7a5e')}
              </div>
            </div>
          </div>
        `
            : `
          <div style="padding:11px 14px;margin-bottom:14px;border-radius:12px;background:#f5f7fa;border:1px solid var(--line);font-size:12.5px;color:var(--ink-2);">
            <strong>本厂运维观测说明：</strong>当前展示「${esc(getTenantName(state.globalTenant))}」的调用性能、配额水位与本厂外部系统接口同步状态。
          </div>
        `
        }

        <div class="panel-card" style="margin-bottom:14px;">
          <div class="panel-card-head">
            <div>
              <h3>核心工具与模型服务性能明细</h3>
              <small>用于定位长耗时任务（如 AFI 生成、事件报告解析）及异常重试率</small>
            </div>
          </div>
          <div class="table-scroll">
            <table class="data-table">
              <thead>
                <tr>
                  <th>工具服务名称</th>
                  <th>调用次数</th>
                  <th>成功率</th>
                  <th>P50 耗时</th>
                  <th>P95 耗时</th>
                  <th>均耗 Token</th>
                  <th>运行状态</th>
                </tr>
              </thead>
              <tbody>
                ${D.OPS_TOOL_PERF.map((row) => `
                  <tr>
                    <td><strong class="cell-title">${esc(row.name)}</strong></td>
                    <td>${Math.max(1, Math.round(toolCalls * row.share)).toLocaleString()}</td>
                    <td><span class="workspace-tag ${row.state === 'done' ? 'green' : 'yellow'}">${row.success}</span></td>
                    <td>${row.p50}</td>
                    <td><strong>${row.p95}</strong></td>
                    <td>${row.avgTok}</td>
                    <td><span class="proj-flag ${row.state}">${row.state === 'done' ? '健康' : '长耗时关注'}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <div class="dashboard-grid">
          <div class="panel-card">
            <div class="panel-card-head">
              <div>
                <h3>${isSuper ? '各电厂租户 Token 消耗与配额水位' : '本厂 Token 消耗与配额水位'}</h3>
                <small>${isSuper ? '实时预警接近每日调用上限的租户，保障大修评估高峰期稳定' : '实时监测本厂每日调用水位，保障大修评估高峰期稳定'}</small>
              </div>
            </div>
            <div class="bar-list">
              ${D.OPS_TENANT_QUOTA.filter((q) => state.globalTenant === 'all' || q.tenantId === state.globalTenant)
                .map((q) => `
                  <div class="bar-row">
                    <div class="bar-row-meta">
                      <strong>${esc(q.name)}</strong>
                      <span>${q.tokensM}M Tokens · 配额水位 ${q.quotaPct}% · 峰值并发 ${q.peakConcurrency}</span>
                    </div>
                    <div class="bar-track"><div class="bar-fill ${q.quotaPct >= 70 ? 'yellow' : 'blue'}" style="width:${q.quotaPct}%"></div></div>
                  </div>
                `)
                .join('')}
            </div>
          </div>

          <div class="panel-card">
            <div class="panel-card-head">
              <div>
                <h3>外部系统接口同步健康度（7 大通道）</h3>
                <small>监控 iOA、ECM、人因系统、工单、状态报告与 BDX 接口响应延迟</small>
              </div>
            </div>
            <table class="data-table">
              <thead><tr><th>外部系统通道</th><th>平均延迟</th><th>近24h重试</th><th>状态</th></tr></thead>
              <tbody>
                ${D.OPS_SYNC_HEALTH.map((h) => `
                  <tr>
                    <td><strong>${esc(h.name)}</strong></td>
                    <td>${h.latency}</td>
                    <td>${h.retries} 次</td>
                    <td><span class="proj-flag ${h.status}">${h.status === 'done' ? '正常' : '偶发延迟'}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    `;
  }

  // ==================== 2. 项目管理（队长 / 协调员） ====================
  function renderProjectsPage() {
    const acc = currentAccount();
    const isLeader = acc.roleKey === 'leader';
    const isCoordinator = acc.roleKey === 'coordinator';
    const f = state.projectFilters;
    const list = state.projects.filter((p) => {
      if (state.globalTenant !== 'all' && p.tenantId !== state.globalTenant) return false;
      if (f.standard && p.standard !== f.standard) return false;
      if (f.area && !(p.plans || []).some((pl) => (pl.areas || []).some((a) => a.includes(f.area))) && !p.areas.some((a) => a.includes(f.area))) return false;
      if (f.year && p.year !== f.year) return false;
      if (f.keyword && !`${p.name} ${p.id} ${p.description} ${(p.plans || []).map((pl) => `${pl.title} ${pl.lead || ''}`).join(' ')}`.toLowerCase().includes(f.keyword.toLowerCase())) return false;
      return true;
    });

    return `
      <section class="workspace-island">
        <div class="workspace-page-heading">
          <div>
            <h1>年度自评估项目管理</h1>
            <p class="page-subtitle">
              ${
                isLeader
                  ? '计划负责人视角：电厂每年固定建立一个全领域自评估项目，点击进入查看名下评估计划与审核工作台'
                  : '协调员视角：电厂每年固定建立一个全领域年度自评估项目；具体评估活动通过项目下「评估计划」按时间窗与单一/多领域编排（支持快速模式免审批）'
              }
            </p>
          </div>
          <div class="heading-actions">
            <button type="button" class="ghost" id="btn-export-projects">↓ 导出至辅助系统</button>
            ${isCoordinator ? '<button type="button" class="ghost" id="btn-import-projects">↑ 导入辅助系统项目</button>' : ''}
            ${isCoordinator ? '<button type="button" class="primary" id="btn-new-project">＋ 新增年度项目</button>' : ''}
          </div>
        </div>

        <div class="filter-bar">
          <div class="field-group" style="width:170px;">
            <label>标准</label>
            <select id="pf-standard">
              <option value="">全部标准</option>
              <option value="WANO PO&C 2022-1" ${f.standard === 'WANO PO&C 2022-1' ? 'selected' : ''}>WANO PO&C 2022-1</option>
              <option value="WANO PO&C 2019-1" ${f.standard === 'WANO PO&C 2019-1' ? 'selected' : ''}>WANO PO&C 2019-1</option>
              <option value="IEEE Std 603" ${f.standard === 'IEEE Std 603' ? 'selected' : ''}>IEEE Std 603</option>
            </select>
          </div>
          <div class="field-group" style="width:150px;">
            <label>计划涉及领域</label>
            <select id="pf-area">
              <option value="">全部领域</option>
              ${['OP', 'MA', 'EN', 'RP', 'CH', 'ER', 'NSC']
                .map((a) => `<option value="${a}" ${f.area === a ? 'selected' : ''}>${a}</option>`)
                .join('')}
            </select>
          </div>
          <div class="field-group" style="width:120px;">
            <label>年份</label>
            <select id="pf-year">
              <option value="">全部年份</option>
              <option value="2026" ${f.year === '2026' ? 'selected' : ''}>2026</option>
              <option value="2025" ${f.year === '2025' ? 'selected' : ''}>2025</option>
            </select>
          </div>
          <div class="field-group" style="flex:1;min-width:200px;max-width:320px;">
            <label>项目 / 计划查询</label>
            <input id="pf-keyword" type="text" placeholder="项目名称、计划名或计划负责人" value="${esc(f.keyword)}" />
          </div>
          <button type="button" class="ghost" id="btn-pf-reset">重置</button>
        </div>

        <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;font-size:13px;font-weight:500;">
          <span>年度自评估项目</span>
          <span class="workspace-count">${list.length} 个年度项目</span>
        </div>

        <div class="table-scroll">
          <table class="data-table">
            <thead>
              <tr>
                <th style="width:24%;">年度项目名称</th>
                <th style="width:22%;">项目说明</th>
                <th style="width:11%;">适用标准</th>
                <th style="width:12%;">默认覆盖领域</th>
                <th style="width:7%;">年份</th>
                <th style="width:11%;">下挂评估计划</th>
                <th style="width:7%;">状态</th>
                <th style="width:12%;">操作</th>
              </tr>
            </thead>
            <tbody>
              ${
                list.length
                  ? list
                      .map((p) => {
                        const plans = p.plans || [];
                        const quickCount = plans.filter((pl) => pl.quickMode).length;
                        return `
                  <tr>
                    <td>
                      <button type="button" class="workspace-text-button cell-title" style="text-align:left;white-space:normal;" data-open-project="${p.id}">${esc(p.name)}</button>
                      <span class="cell-sub">${esc(p.id)} · ${esc(getTenantName(p.tenantId))}</span>
                    </td>
                    <td><div class="clamp-2">${esc(p.description)}</div></td>
                    <td><span class="workspace-tag">${esc(p.standard)}</span></td>
                    <td>
                      <span class="workspace-tag blue">全领域（${p.areas.length} 大领域）</span>
                      <span class="cell-sub">具体领域按计划勾选</span>
                    </td>
                    <td><strong>${esc(p.year)}</strong></td>
                    <td>
                      <div class="tag-list">
                        <span class="workspace-tag">${plans.length} 个计划</span>
                        ${quickCount ? `<span class="workspace-tag green">⚡ ${quickCount} 快速模式</span>` : ''}
                      </div>
                    </td>
                    <td><span class="proj-flag ${statusClass(p.status)}">${statusLabel(p.status)}</span></td>
                    <td>
                      <div class="action-links">
                        ${isLeader ? `<button type="button" class="workspace-text-button primary-link" data-review-project="${p.id}">审核工作台</button>` : ''}
                        <button type="button" class="workspace-text-button ${isCoordinator ? 'primary-link' : ''}" data-open-project="${p.id}">管理计划</button>
                      </div>
                    </td>
                  </tr>
                `;
                      })
                      .join('')
                  : `<tr><td colspan="8" style="text-align:center;padding:48px;color:var(--ink-3);">暂无匹配项目</td></tr>`
              }
            </tbody>
          </table>
        </div>
        <div class="table-footer">
          <span>共 ${list.length} 条记录</span>
          <span>每厂每年固定 1 个全领域自评估项目</span>
        </div>
      </section>
    `;
  }

  function renderProjectDetailPage() {
    const acc = currentAccount();
    const isLeader = acc.roleKey === 'leader';
    const isCoordinator = acc.roleKey === 'coordinator';
    const project = state.projects.find((p) => p.id === state.activeProjectId) || state.projects[0];
    if (!project) return renderProjectsPage();
    const plans = project.plans || [];
    const activePlan = plans.find((pl) => pl.id === state.activePlanId) || plans[0] || null;

    return `
      <div class="project-context-bar">
        <button type="button" class="ghost sm" data-nav="projects">← 返回年度项目</button>
        <h2>${esc(project.name)}</h2>
        <span class="workspace-tag blue">默认全领域（${project.areas.length} 领域）</span>
        <span class="proj-flag ${statusClass(project.status)}">${statusLabel(project.status)}</span>
        <span class="workspace-tag">${esc(project.standard)}</span>
        <span style="margin-left:auto;font-size:12px;color:var(--ink-3);">${esc(project.period)} · ${esc(getTenantName(project.tenantId))}</span>
        <button type="button" class="ghost sm" id="btn-export-single-project">↓ 导出计划至辅助系统</button>
        <button type="button" class="primary sm" id="btn-open-doc-workbench">${isLeader ? '打开审核工作台' : '打开文档工作台'}</button>
      </div>

      <div class="project-split">
        <aside class="plan-sidebar">
          <div style="display:flex;align-items:center;justify-content:space-between;padding:2px 4px 8px;">
            <strong style="font-size:14px;">评估计划（${plans.length}）</strong>
            ${isCoordinator ? '<button type="button" class="ghost sm" id="btn-new-plan">＋ 新增计划</button>' : ''}
          </div>
          ${
            plans.length
              ? plans
                  .map(
                    (pl) => `
              <button type="button" class="plan-card-item ${activePlan && activePlan.id === pl.id ? 'active' : ''}" data-select-plan="${pl.id}">
                <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;flex-wrap:wrap;">
                  <span class="proj-flag ${statusClass(pl.status)}">${statusLabel(pl.status)}</span>
                  ${pl.quickMode ? '<span class="workspace-tag green" style="padding:1px 6px;font-size:10.5px;">⚡ 快速模式</span>' : '<span class="workspace-tag" style="padding:1px 6px;font-size:10.5px;">标准审批</span>'}
                </div>
                <strong>${esc(pl.title)}</strong>
                <div class="tag-list">
                  ${(pl.areas || []).map((a) => `<span class="workspace-tag blue" style="padding:1px 6px;font-size:10.5px;">${esc(a)}</span>`).join('')}
                </div>
                <small>计划负责人：<strong>${esc(pl.lead || pl.members?.[0] || '未指定')}</strong> · ${pl.tasks.length} 项任务</small>
                <small>${esc(pl.window)}</small>
              </button>
            `
                  )
                  .join('')
              : `<p style="font-size:12px;color:var(--ink-3);text-align:center;padding:24px 0;">该年度项目尚未创建评估计划</p>`
          }
        </aside>

        <section class="workspace-island">
          ${
            activePlan
              ? `
            <div class="workspace-page-heading" style="margin-bottom:12px;">
              <div>
                <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                  <h1 style="font-size:17px;">${esc(activePlan.title)}</h1>
                  ${activePlan.quickMode ? '<span class="workspace-tag green">⚡ 快速模式 · 免审批</span>' : '<span class="workspace-tag">标准审批模式</span>'}
                </div>
                <p class="page-subtitle">
                  计划负责人：<strong>${esc(activePlan.lead || activePlan.members?.[0] || '未指定')}</strong> · 时间窗：${esc(activePlan.window)} · 评估领域：${(activePlan.areas || []).join('、') || '未指定'} · 参与成员：${(activePlan.members || []).join('、')}
                </p>
              </div>
              <div class="heading-actions">
                ${
                  isCoordinator
                    ? `<button type="button" class="ghost sm" id="btn-toggle-plan-quickmode">${activePlan.quickMode ? '切换为标准模式' : '⚡ 开启快速模式'}</button>
                       <button type="button" class="ghost sm" id="btn-mock-add-task">＋ 新增任务</button>`
                    : ''
                }
              </div>
            </div>

            ${
              activePlan.quickMode
                ? `
              <div class="quick-mode-banner">
                <div>
                  <strong>⚡ 快速模式已启用（无需审批流程）</strong>
                  <span>由计划负责人「${esc(activePlan.lead || '负责人')}」独立完成评估任务与报告编写，可直接提交至 ECM 或导出归档。</span>
                </div>
                <div style="display:flex;gap:8px;flex-wrap:wrap;flex-shrink:0;">
                  <button type="button" class="ghost sm" id="btn-quick-write-report">独立编写报告</button>
                  <button type="button" class="ghost sm" id="btn-quick-export-report">↓ 导出报告</button>
                  <button type="button" class="primary sm" id="btn-quick-submit-ecm" ${activePlan.ecmSubmitted ? 'disabled' : ''}>${activePlan.ecmSubmitted ? '✓ 已提交至 ECM' : '↑ 直接提交至 ECM'}</button>
                </div>
              </div>
            `
                : ''
            }

            <div class="table-scroll">
              <table class="data-table">
                <thead>
                  <tr>
                    <th style="width:34%;">评估任务名称</th>
                    <th style="width:14%;">继承领域</th>
                    <th style="width:10%;">产出类型</th>
                    <th style="width:12%;">执行人</th>
                    <th style="width:12%;">任务时间</th>
                    <th style="width:8%;">状态</th>
                    <th style="width:10%;">操作</th>
                  </tr>
                </thead>
                <tbody>
                  ${activePlan.tasks
                    .map(
                      (tk) => `
                    <tr>
                      <td><strong class="cell-title">${esc(tk.name)}</strong><span class="cell-sub">${tk.id} · 已有 ${tk.outputsCount} 条输出</span></td>
                      <td><div class="tag-list">${(activePlan.areas || []).map((a) => `<span class="workspace-tag blue" style="font-size:10.5px;">${esc(a.split(' ')[0])}</span>`).join('')}</div></td>
                      <td><span class="workspace-tag purple">${esc(tk.type)}</span></td>
                      <td>${esc(activePlan.quickMode ? (activePlan.lead || tk.assignee) : tk.assignee)}</td>
                      <td>${esc(tk.time)}</td>
                      <td><span class="proj-flag ${statusClass(tk.status)}">${statusLabel(tk.status)}</span></td>
                      <td>
                        <div class="action-links">
                          <button type="button" class="workspace-text-button primary-link" data-open-task-wb="${tk.id}">${activePlan.quickMode ? '直接编写' : isLeader ? '审核输出' : '查看文档'}</button>
                        </div>
                      </td>
                    </tr>
                  `
                    )
                    .join('')}
                </tbody>
              </table>
            </div>
          `
              : `<div style="margin:auto;text-align:center;color:var(--ink-3);">暂无计划与任务，请先点击左侧「＋ 新增计划」创建评估计划</div>`
          }
        </section>
      </div>
    `;
  }

  function openNewPlanModal(project) {
    const allAreas = D.ALL_PROJECT_AREAS || ['OP 运行', 'MA 维修', 'EN 工程', 'ER 设备可靠性', 'RP 辐射防护', 'CH 化学', 'NSC 核安全文化'];
    openModal(
      `
      <div class="modal-head">
        <div>
          <h2>新增评估计划 · ${esc(project.name)}</h2>
          <span class="cell-sub">计划挂在年度自评估项目下，选择单一或多个评估领域、指定计划负责人，并可开启快速模式</span>
        </div>
        <button type="button" class="modal-close" data-modal-close>×</button>
      </div>
      <div class="modal-body">
        <div class="field-group">
          <label>计划名称 *</label>
          <input id="npl-title" type="text" placeholder="例如：Q4 辐射防护与化学专项自评估计划" />
        </div>
        <div class="form-grid-2">
          <div class="field-group">
            <label>计划时间窗 *</label>
            <input id="npl-window" type="text" value="2026-11-25 ~ 2026-12-20" />
          </div>
          <div class="field-group">
            <label>计划负责人（原队长角色） *</label>
            <select id="npl-lead">
              <option value="周敏">周敏（计划负责人）</option>
              <option value="孙伟">孙伟（计划负责人）</option>
              <option value="林建华">林建华（计划负责人）</option>
              <option value="李雪梅">李雪梅（计划负责人）</option>
            </select>
          </div>
        </div>
        <div class="field-group">
          <label>选择评估领域（支持单一或多领域） *</label>
          <div class="clean-rules-row">
            ${allAreas.map((a, idx) => `<label class="rule-chip"><input type="checkbox" class="npl-area-chk" value="${esc(a)}" ${idx < 2 ? 'checked' : ''} /> ${esc(a)}</label>`).join('')}
          </div>
        </div>
        <div class="quick-mode-toggle-box">
          <label style="display:flex;align-items:flex-start;gap:10px;cursor:pointer;">
            <input type="checkbox" id="npl-quick-mode" style="margin-top:3px;width:16px;height:16px;accent-color:var(--primary);" />
            <div>
              <strong style="display:block;font-size:13px;">⚡ 开启快速模式（免审批独立完成）</strong>
              <span style="font-size:12px;color:var(--ink-2);">开启后，该计划默认由计划负责人独立完成，自行编写报告、直接提交到 ECM 或导出，无需经过审批流程。</span>
            </div>
          </label>
        </div>
      </div>
      <div class="modal-foot">
        <button type="button" class="ghost" data-modal-close>取消</button>
        <button type="button" class="primary" id="btn-npl-save">创建评估计划</button>
      </div>
    `,
      { wide: true }
    );

    modalRoot.querySelector('#btn-npl-save').addEventListener('click', () => {
      const title = modalRoot.querySelector('#npl-title').value.trim();
      if (!title) return showToast('请填写计划名称');
      const areas = Array.from(modalRoot.querySelectorAll('.npl-area-chk:checked')).map((el) => el.value);
      if (!areas.length) return showToast('请至少选择一个评估领域');
      const lead = modalRoot.querySelector('#npl-lead').value;
      const windowStr = modalRoot.querySelector('#npl-window').value.trim() || '2026-11-25 ~ 2026-12-20';
      const quickMode = modalRoot.querySelector('#npl-quick-mode').checked;
      const newPlanId = 'PLN-' + Date.now().toString().slice(-3);
      project.plans.push({
        id: newPlanId,
        title,
        window: windowStr,
        status: 'active',
        areas,
        lead,
        quickMode,
        ecmSubmitted: false,
        members: quickMode ? [lead] : [lead, '李雪梅'],
        tasks: [
          {
            id: 'TSK-' + Date.now().toString().slice(-3),
            name: `${areas.map((a) => a.split(' ')[0]).join('/')} 现场观察与报告编写${quickMode ? '（快速模式独立完成）' : ''}`,
            assignee: lead,
            time: windowStr.replace(/^\d{4}-/g, '').replace(/~\s*\d{4}-/, '~ '),
            status: 'active',
            outputsCount: 0,
            type: 'OBS'
          }
        ]
      });
      state.activePlanId = newPlanId;
      closeModal();
      render();
      showToast(`已创建${quickMode ? '快速模式' : '标准模式'}评估计划「${title}」（负责人：${lead}）`);
    });
  }

  // ==================== 2.2 项目管理辅助系统：年度自评估项目与计划导入/导出 ====================
  function triggerDownload(filename, content, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function openProjectImportModal() {
    const targetTenantId = state.globalTenant === 'all' ? 'tn-qinshan' : state.globalTenant;
    let importMode = 'api';
    let selectedYear = '2027';
    let uploadedFileName = '';
    let parsedRows = null;
    let checkedIds = new Set();

    function buildCandidates(year) {
      const raw = year === '2027'
        ? [
            {
              tempId: 'AUX-2027-01',
              code: 'PMS-2027-SA-001',
              name: '2027 秦山一厂 30 万千瓦机组大修前全范围自评估',
              description: '同步自核电厂“项目管理辅助系统”2027年度自评估总计划，覆盖运行、维修、辐射防护与化学领域。',
              standard: 'WANO PO&C 2022-1',
              areas: ['OP 运行', 'MA 维修', 'RP 辐射防护', 'CH 化学'],
              year: '2027',
              period: '2027-02-15 ~ 2027-05-20',
              plans: [
                {
                  id: 'PLN-2701',
                  title: '第一阶段：桌面资料审查与历史 AFI 复查',
                  window: '2027-02-15 ~ 2027-03-10',
                  status: 'todo',
                  members: ['张明远', '李雪梅', '周敏'],
                  tasks: [
                    { id: 'TSK-2701', name: '核查近两年状态报告与 ECM 遗留自评估项', assignee: '待领取', time: '02-16 ~ 03-05', status: 'todo', outputsCount: 0, type: 'OBS' }
                  ]
                },
                {
                  id: 'PLN-2702',
                  title: '第二阶段：现场观察访谈与 AFI 报告编制',
                  window: '2027-03-15 ~ 2027-05-20',
                  status: 'todo',
                  members: ['李雪梅', '孙伟', '周敏'],
                  tasks: [
                    { id: 'TSK-2702', name: '主控室与关键检修点现场观察记录撰写', assignee: '待领取', time: '03-18 ~ 04-25', status: 'todo', outputsCount: 0, type: 'OBS' },
                    { id: 'TSK-2703', name: '汇总生成 2027 年度 OP/MA 领域 AFI 报告', assignee: '待领取', time: '04-28 ~ 05-15', status: 'todo', outputsCount: 0, type: 'AFI' }
                  ]
                }
              ]
            },
            {
              tempId: 'AUX-2027-02',
              code: 'PMS-2027-SA-004',
              name: '2027 年度设备可靠性（ER）与敏感设备专项自评估',
              description: '来源于项目管理辅助系统年度专项计划，聚焦 SPV 设备清单、工单积压与预防性维修策略。',
              standard: 'WANO PO&C 2022-1',
              areas: ['ER 设备可靠性', 'EN 工程', 'MA 维修'],
              year: '2027',
              period: '2027-04-01 ~ 2027-06-30',
              plans: [
                {
                  id: 'PLN-2711',
                  title: '第一阶段：SPV 台账核验与工单趋势抽查',
                  window: '2027-04-01 ~ 2027-05-15',
                  status: 'todo',
                  members: ['张明远', '孙伟'],
                  tasks: [
                    { id: 'TSK-2711', name: '比对工单系统近 18 个月关键设备故障记录', assignee: '待领取', time: '04-05 ~ 05-10', status: 'todo', outputsCount: 0, type: 'OBS' }
                  ]
                }
              ]
            },
            {
              tempId: 'AUX-2027-03',
              code: 'PMS-2027-SA-007',
              name: '2027 核电安全级仪控与人因工程对标自评估',
              description: '对照 IEEE Std 603 / 1023 开展年度安全级仪控变更与主控室人机界面评估。',
              standard: 'IEEE Std 603',
              areas: ['EN 工程', 'OP 运行'],
              year: '2027',
              period: '2027-07-01 ~ 2027-09-20',
              plans: [
                {
                  id: 'PLN-2721',
                  title: '第一阶段：仪控定期试验与变更闭环核查',
                  window: '2027-07-01 ~ 2027-08-15',
                  status: 'todo',
                  members: ['张明远', '李雪梅'],
                  tasks: [
                    { id: 'TSK-2721', name: '抽查安全级仪控软件变更与验证记录', assignee: '待领取', time: '07-05 ~ 08-10', status: 'todo', outputsCount: 0, type: 'OBS' }
                  ]
                }
              ]
            }
          ]
        : [
            {
              tempId: 'AUX-2026-09',
              code: 'PMS-2026-SA-018',
              name: '2026 秦山二厂 1/2 号机组 WANO 同行评估前自评估',
              description: '与现有项目同名，系统自动识别并跳过重复导入。',
              standard: 'WANO PO&C 2022-1',
              areas: ['OP 运行', 'MA 维修'],
              year: '2026',
              period: '2026-10-08 ~ 2026-12-20',
              plans: []
            },
            {
              tempId: 'AUX-2026-10',
              code: 'PMS-2026-SA-021',
              name: '2026 冬季保电与应急准备（EP）增补自评估',
              description: '来源于项目管理辅助系统 2026 年度增补评估计划，覆盖应急演习与场内通信保障。',
              standard: 'WANO PO&C 2019-1',
              areas: ['OP 运行', 'RP 辐射防护'],
              year: '2026',
              period: '2026-11-25 ~ 2026-12-30',
              plans: [
                {
                  id: 'PLN-2691',
                  title: '第一阶段：应急演习观察与设施抽查',
                  window: '2026-11-25 ~ 2026-12-28',
                  status: 'todo',
                  members: ['张明远', '李雪梅'],
                  tasks: [
                    { id: 'TSK-2691', name: '核查应急指挥中心通信与值班响应演练记录', assignee: '待领取', time: '11-26 ~ 12-20', status: 'todo', outputsCount: 0, type: 'OBS' }
                  ]
                }
              ]
            }
          ];
      return raw.map((item) => ({
        ...item,
        duplicate: state.projects.some((p) => p.name === item.name)
      }));
    }

    function renderModal() {
      const validRows = (parsedRows || []).filter((r) => !r.duplicate);
      openModal(
        `
        <div class="modal-head">
          <div>
            <h2>导入年度自评估项目 & 计划</h2>
            <span class="cell-sub">支持对接核电厂“项目管理辅助系统”年度自评估计划包，导入后自动生成项目、阶段计划与待领取任务</span>
          </div>
          <button type="button" class="modal-close" data-modal-close>×</button>
        </div>
        <div class="modal-body">
          <div class="perm-tabs" style="margin-bottom:2px;padding-bottom:12px;">
            <button type="button" class="perm-tab ${importMode === 'api' ? 'active' : ''}" data-imp-mode="api">项目管理辅助系统接口拉取</button>
            <button type="button" class="perm-tab ${importMode === 'file' ? 'active' : ''}" data-imp-mode="file">上传辅助系统导出文件 (.xlsx / .json)</button>
          </div>

          ${
            importMode === 'api'
              ? `
            <div class="form-grid-2" style="align-items:end;">
              <div class="field-group">
                <label>选择年度自评估计划批次</label>
                <select id="imp-year">
                  <option value="2027" ${selectedYear === '2027' ? 'selected' : ''}>2027 年度自评估总计划（项目管理辅助系统）</option>
                  <option value="2026" ${selectedYear === '2026' ? 'selected' : ''}>2026 年度增补自评估计划（含重名校验样例）</option>
                </select>
              </div>
              <div style="display:flex;gap:8px;justify-content:flex-end;">
                <button type="button" class="primary sm" id="btn-imp-fetch">读取并解析年度计划</button>
              </div>
            </div>
          `
              : `
            <div class="upload-dropzone">
              <strong style="font-size:13px;">上传“项目管理辅助系统”导出的年度项目与计划表</strong>
              <span style="font-size:12px;color:var(--ink-3);">支持 .xlsx / .csv / .json 格式（包含项目编码、标准、领域、阶段计划起止时间与任务清单）</span>
              <div style="display:flex;gap:10px;align-items:center;margin-top:6px;flex-wrap:wrap;justify-content:center;">
                <input type="file" id="imp-file-input" accept=".xlsx,.xls,.csv,.json" style="font-size:12px;" />
                <button type="button" class="ghost sm" id="btn-imp-dl-tpl">↓ 下载标准导入模板 (.csv)</button>
              </div>
              ${uploadedFileName ? `<span class="workspace-tag green" style="margin-top:4px;">已解析文件：${esc(uploadedFileName)}</span>` : ''}
            </div>
          `
          }

          ${
            parsedRows
              ? `
            <div style="display:flex;align-items:center;justify-content:space-between;font-size:12.5px;color:var(--ink-2);">
              <span>解析结果：共 <strong>${parsedRows.length}</strong> 个年度项目，可导入 <strong>${validRows.length}</strong> 个（含阶段计划与初始任务）</span>
              <span class="workspace-tag blue">所属电厂：${esc(getTenantName(targetTenantId))}</span>
            </div>
            <div class="table-scroll" style="max-height:280px;border:1px solid var(--line);border-radius:12px;">
              <table class="data-table">
                <thead>
                  <tr>
                    <th style="width:44px;">选</th>
                    <th>项目名称 / 辅助系统编号</th>
                    <th style="width:15%;">标准 / 领域</th>
                    <th style="width:17%;">周期与阶段计划</th>
                    <th style="width:14%;">校验状态</th>
                  </tr>
                </thead>
                <tbody>
                  ${parsedRows
                    .map(
                      (r) => `
                    <tr style="${r.duplicate ? 'opacity:0.55;' : ''}">
                      <td>
                        <input type="checkbox" data-imp-chk="${r.tempId}" ${checkedIds.has(r.tempId) ? 'checked' : ''} ${r.duplicate ? 'disabled' : ''} style="accent-color:var(--primary);width:15px;height:15px;" />
                      </td>
                      <td>
                        <strong class="cell-title">${esc(r.name)}</strong>
                        <span class="cell-sub">${esc(r.code)} · ${esc(r.description)}</span>
                      </td>
                      <td>
                        <span class="workspace-tag">${esc(r.standard)}</span>
                        <span class="cell-sub">${esc(r.areas.join(' / '))}</span>
                      </td>
                      <td>
                        <div style="font-size:12px;">${esc(r.period)}</div>
                        <span class="cell-sub">${r.plans.length} 个阶段计划 · ${r.plans.reduce((s, pl) => s + pl.tasks.length, 0)} 项任务</span>
                      </td>
                      <td>
                        <span class="proj-flag ${r.duplicate ? 'rejected' : 'done'}">${r.duplicate ? '同名已跳过' : '可导入'}</span>
                      </td>
                    </tr>
                  `
                    )
                    .join('')}
                </tbody>
              </table>
            </div>
          `
              : `<div style="padding:24px;text-align:center;color:var(--ink-3);font-size:12.5px;border:1px dashed var(--line);border-radius:12px;">请点击上方「读取并解析年度计划」或选择本地文件预览候选项目</div>`
          }
        </div>
        <div class="modal-foot">
          <button type="button" class="ghost" data-modal-close>取消</button>
          <button type="button" class="primary" id="btn-imp-confirm" ${checkedIds.size ? '' : 'disabled'}>确认导入所选项目（${checkedIds.size}）</button>
        </div>
      `,
        { wide: true }
      );

      modalRoot.querySelectorAll('[data-imp-mode]').forEach((btn) => {
        btn.addEventListener('click', () => {
          importMode = btn.dataset.impMode;
          renderModal();
        });
      });
      const yearSel = modalRoot.querySelector('#imp-year');
      if (yearSel) yearSel.addEventListener('change', () => { selectedYear = yearSel.value; });

      const fetchBtn = modalRoot.querySelector('#btn-imp-fetch');
      if (fetchBtn) {
        fetchBtn.addEventListener('click', () => {
          parsedRows = buildCandidates(selectedYear);
          checkedIds = new Set(parsedRows.filter((r) => !r.duplicate).map((r) => r.tempId));
          renderModal();
          showToast(`已从“项目管理辅助系统”读取 ${parsedRows.length} 个年度自评估项目`);
        });
      }

      const fileInp = modalRoot.querySelector('#imp-file-input');
      if (fileInp) {
        fileInp.addEventListener('change', (e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          uploadedFileName = f.name;
          parsedRows = buildCandidates('2027');
          checkedIds = new Set(parsedRows.filter((r) => !r.duplicate).map((r) => r.tempId));
          renderModal();
          showToast(`已解析文件「${f.name}」，识别到 ${parsedRows.length} 个项目与计划`);
        });
      }

      const tplBtn = modalRoot.querySelector('#btn-imp-dl-tpl');
      if (tplBtn) {
        tplBtn.addEventListener('click', () => {
          const csv =
            '\ufeff辅助系统项目编号,项目名称,适用标准,所属领域,年份,项目起止周期,阶段计划名称,计划时间窗,初始任务名称\n' +
            'PMS-2027-SA-001,2027 秦山一厂大修前自评估,WANO PO&C 2022-1,OP 运行/MA 维修,2027,2027-02-15 ~ 2027-05-20,第一阶段：桌面资料审查,2027-02-15 ~ 2027-03-10,核查近两年状态报告与ECM自评估项\n';
          triggerDownload('项目管理辅助系统_年度自评估导入模板.csv', csv, 'text/csv;charset=utf-8;');
          showToast('已下载项目管理辅助系统标准导入模板 (.csv)');
        });
      }

      modalRoot.querySelectorAll('[data-imp-chk]').forEach((chk) => {
        chk.addEventListener('change', () => {
          const id = chk.dataset.impChk;
          if (chk.checked) checkedIds.add(id); else checkedIds.delete(id);
          renderModal();
        });
      });

      modalRoot.querySelector('#btn-imp-confirm').addEventListener('click', () => {
        const toAdd = (parsedRows || []).filter((r) => checkedIds.has(r.tempId) && !r.duplicate);
        if (!toAdd.length) return;
        toAdd.forEach((item) => {
          state.projects.unshift({
            id: item.code,
            tenantId: targetTenantId,
            name: item.name,
            description: item.description,
            standard: item.standard,
            areas: item.areas,
            year: item.year,
            owner: currentAccount().name,
            status: 'todo',
            period: item.period,
            plans: JSON.parse(JSON.stringify(item.plans))
          });
        });
        closeModal();
        render();
        showToast(`已成功导入 ${toAdd.length} 个年度自评估项目及其阶段计划`);
      });
    }

    renderModal();
  }

  function openProjectExportModal(singleProject = null) {
    const scopedProjects = singleProject
      ? [singleProject]
      : state.projects.filter((p) => state.globalTenant === 'all' || p.tenantId === state.globalTenant);
    const totalPlans = scopedProjects.reduce((sum, p) => sum + (p.plans?.length || 0), 0);
    const totalTasks = scopedProjects.reduce(
      (sum, p) => sum + (p.plans || []).reduce((s, pl) => s + (pl.tasks?.length || 0), 0),
      0
    );

    openModal(`
      <div class="modal-head">
        <div>
          <h2>导出至核电厂“项目管理辅助系统”</h2>
          <span class="cell-sub">将年度自评估项目、阶段计划与任务排期按标准字段导出，用于回传核电厂项目管理辅助系统</span>
        </div>
        <button type="button" class="modal-close" data-modal-close>×</button>
      </div>
      <div class="modal-body">
        <div style="padding:12px 14px;border-radius:12px;background:#f5f7fa;border:1px solid var(--line);font-size:12.5px;color:var(--ink-2);">
          即将导出：<strong>${scopedProjects.length}</strong> 个自评估项目 · <strong>${totalPlans}</strong> 个阶段计划 · <strong>${totalTasks}</strong> 项任务
          ${singleProject ? `<div style="margin-top:4px;color:var(--ink);font-weight:600;">目标项目：${esc(singleProject.name)}</div>` : ''}
        </div>
        <div class="form-grid-2">
          <div class="field-group">
            <label>导出格式</label>
            <select id="exp-format">
              <option value="csv">项目管理辅助系统标准表 (.csv / Excel 兼容)</option>
              <option value="json">项目管理辅助系统标准交换包 (.json)</option>
            </select>
          </div>
          <div class="field-group">
            <label>所属电厂</label>
            <input type="text" value="${esc(singleProject ? getTenantName(singleProject.tenantId) : getTenantName(state.globalTenant))}" disabled />
          </div>
        </div>
        <div>
          <strong style="display:block;font-size:12px;color:var(--ink-2);margin-bottom:8px;">包含导出内容</strong>
          <div class="clean-rules-row">
            <label class="rule-chip"><input type="checkbox" checked id="exp-inc-plans" /> 阶段计划与时间窗</label>
            <label class="rule-chip"><input type="checkbox" checked id="exp-inc-tasks" /> 计划任务、执行人与产出类型</label>
            <label class="rule-chip"><input type="checkbox" checked id="exp-inc-std" /> WANO / IEEE 适用标准与领域编码</label>
          </div>
        </div>
      </div>
      <div class="modal-foot">
        <button type="button" class="ghost" data-modal-close>取消</button>
        <button type="button" class="primary" id="btn-exp-confirm">确认导出文件</button>
      </div>
    `);

    modalRoot.querySelector('#btn-exp-confirm').addEventListener('click', () => {
      const fmt = modalRoot.querySelector('#exp-format').value;
      const incPlans = modalRoot.querySelector('#exp-inc-plans').checked;
      const incTasks = modalRoot.querySelector('#exp-inc-tasks').checked;
      const baseName = singleProject
        ? `项目管理辅助系统_${singleProject.id}_项目与计划`
        : `项目管理辅助系统_年度自评估项目与计划_${new Date().toISOString().slice(0, 10)}`;

      if (fmt === 'json') {
        const payload = {
          schema: 'NPP-PMS-ANNUAL-ASSESSMENT-V1',
          exportedAt: new Date().toISOString(),
          exportedBy: currentAccount().name,
          projects: scopedProjects.map((p) => ({
            id: p.id,
            name: p.name,
            tenant: getTenantName(p.tenantId),
            standard: p.standard,
            areas: p.areas,
            year: p.year,
            period: p.period,
            owner: p.owner,
            status: statusLabel(p.status),
            plans: incPlans
              ? (p.plans || []).map((pl) => ({
                  id: pl.id,
                  title: pl.title,
                  window: pl.window,
                  status: statusLabel(pl.status),
                  members: pl.members,
                  tasks: incTasks ? pl.tasks : []
                }))
              : []
          }))
        };
        triggerDownload(`${baseName}.json`, JSON.stringify(payload, null, 2), 'application/json;charset=utf-8;');
      } else {
        const lines = ['\ufeff项目编号,项目名称,所属租户,适用标准,所属领域,年份,项目周期,项目状态,阶段计划,计划时间窗,任务名称,执行人,产出类型,任务状态'];
        scopedProjects.forEach((p) => {
          const plans = incPlans && p.plans && p.plans.length ? p.plans : [null];
          plans.forEach((pl) => {
            const tasks = incTasks && pl && pl.tasks && pl.tasks.length ? pl.tasks : [null];
            tasks.forEach((tk) => {
              const row = [
                p.id, p.name, getTenantName(p.tenantId), p.standard, p.areas.join('/'), p.year, p.period, statusLabel(p.status),
                pl ? pl.title : '', pl ? pl.window : '', tk ? tk.name : '', tk ? tk.assignee : '', tk ? tk.type : '', tk ? statusLabel(tk.status) : ''
              ].map((v) => `"${String(v).replace(/"/g, '""')}"`);
              lines.push(row.join(','));
            });
          });
        });
        triggerDownload(`${baseName}.csv`, lines.join('\n'), 'text/csv;charset=utf-8;');
      }
      closeModal();
      showToast(`已导出「${baseName}.${fmt}」，可直接导入核电厂项目管理辅助系统`);
    });
  }

  // ==================== 2.5 文档工作台（评估员任务闭环 + 多维筛选列表 → 沉浸式纸面编辑器 + 协作/审核双 Tab） ====================
  function getAssessorTasks() {
    const out = [];
    state.projects.forEach((p) => {
      if (state.globalTenant !== 'all' && p.tenantId !== state.globalTenant) return;
      (p.plans || []).forEach((pl) => {
        (pl.tasks || []).forEach((tk) => {
          if (tk.status !== 'done') {
            out.push({ ...tk, projectId: p.id, projectName: p.name, planId: pl.id, planTitle: pl.title });
          }
        });
      });
    });
    return out;
  }

  function renderWorkbenchPage() {
    const acc = currentAccount();
    const isWano = isWanoRole();
    const useEn = isWano && state.wanoUiLang === 'en';
    const isLeader = acc.roleKey === 'leader';
    const isAssessor = acc.roleKey === 'assessor';
    const isReview = state.wbReviewMode || isLeader;
    const activeWanoPlant = D.WANO_PLANT_MATRIX.find((p) => p.id === state.wanoCurrentPlantId) || D.WANO_PLANT_MATRIX[0];

    // 视图 A：文档标题列表 + 多维度筛选（类型、状态、时间、任务上下文、标题/内容全文搜索）
    if (state.wbViewMode === 'list') {
      const f = state.wbFilters;
      const kw = f.keyword.trim().toLowerCase();
      const scopedDocs = getScopedWorkspaceDocs();
      const docs = scopedDocs.filter((d) => {
        if (state.wbFromProjectId && d.projectId !== state.wbFromProjectId) return false;
        if (f.taskName && d.taskName !== f.taskName) return false;
        if (f.type !== 'ALL' && d.docType !== f.type) return false;
        if (f.status !== 'all' && d.status !== f.status) return false;
        if (f.time !== 'all') {
          if (f.time === 'today' && d.timeBucket !== 'today') return false;
          if (f.time === '7d' && d.timeBucket !== 'today' && d.timeBucket !== '7d') return false;
        }
        if (kw) {
          const corpus = [
            d.titleZh,
            d.titleEn,
            d.scopeZh,
            d.scopeEn,
            d.taskName,
            ...d.blocks.map((b) => `${b.label} ${b.zh} ${b.en}`)
          ]
            .join(' ')
            .toLowerCase();
          if (!corpus.includes(kw)) return false;
        }
        return true;
      });
      const pendingCount = scopedDocs.filter((d) => d.status === 'submitted').length;
      const assessorTasks = isAssessor ? getAssessorTasks().slice(0, 3) : [];

      return `
        ${
          state.wbFromProjectId
            ? `
          <div class="project-context-bar">
            <button type="button" class="ghost sm" id="btn-wb-back-project">← 返回项目详情</button>
            <h2>${isLeader ? '项目审核文档列表' : '项目文档工作台'}</h2>
            <span class="workspace-tag ${isLeader ? 'yellow' : 'green'}">${isLeader ? `待审 ${pendingCount} 份` : '项目上下文已过滤'}</span>
            ${
              f.taskName
                ? `<span class="workspace-tag blue">当前任务：${esc(f.taskName)}</span>
                   <button type="button" class="workspace-text-button" style="font-size:12px;" id="btn-wb-clear-task">清除任务筛选 ×</button>`
                : ''
            }
          </div>
        `
            : ''
        }
        <section class="workspace-island">
          <div class="workspace-page-heading">
            <div>
              <h1>${useEn ? 'Bilingual Document Workbench' : '文档工作台'}</h1>
              <p class="page-subtitle">${
                useEn
                  ? `Active Mission Plant: ${state.wanoAnonMode ? activeWanoPlant.anonCode : activeWanoPlant.realName} · Filter observations & AFIs by title, content, or time.`
                  : isAssessor
                    ? '先从下方「我的评估任务」认领或选中任务，再针对任务撰写与筛选 OBS / AFI 评估文档'
                    : '支持按标题、正文内容、类型、审核状态与更新时间多维度检索；点击文档标题进入沉浸式编辑/审核界面'
              }</p>
            </div>
            <div class="heading-actions">
              ${isLeader && pendingCount ? `<button type="button" class="ghost" id="btn-wb-open-pending-queue">进入待审队列（${pendingCount}）→</button>` : ''}
              ${
                isWano
                  ? `
                    <button type="button" class="ghost sm" id="btn-wano-import-word">${useEn ? '↑ Import Word FACTs' : '↑ 导入 Word FACTs'}</button>
                    ${isWanoLeadOrAbove() ? `<button type="button" class="ghost sm" id="btn-wano-bundle-afi">${useEn ? '✦ Bundle FACTs → AFI Draft' : '✦ 打包 FACTs 生成 AFI 初稿'}</button>` : ''}
                    ${isWanoLeaderOrDeputy() ? `<button type="button" class="ghost sm" id="btn-wano-gen-exit-ppt">${useEn ? 'Exit Meeting PPT' : '生成出口会议 PPT'}</button>` : ''}
                  `
                  : ''
              }
              ${!isLeader ? `<button type="button" class="primary" id="btn-wb-create-doc">${useEn ? '+ New White Card / FACT' : '＋ 创建文档'}</button>` : ''}
            </div>
          </div>

          ${
            isAssessor && assessorTasks.length
              ? `
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;flex-shrink:0;">
              <strong style="font-size:12.5px;color:var(--ink-2);">我的待办与进行中评估任务（点击卡片筛选对应文档）</strong>
              ${f.taskName ? `<button type="button" class="workspace-text-button primary-link" style="font-size:12px;" id="btn-wb-clear-task-inline">查看全部任务文档</button>` : ''}
            </div>
            <div class="assessor-task-strip">
              ${assessorTasks
                .map((tk) => {
                  const isSel = f.taskName === tk.name;
                  const unclaimed = tk.assignee === '待领取';
                  return `
                  <div class="assessor-task-card ${isSel ? 'active' : ''}">
                    <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;">
                      <span class="workspace-tag purple">${esc(tk.type)}</span>
                      <span class="proj-flag ${statusClass(tk.status)}">${statusLabel(tk.status)}</span>
                    </div>
                    <strong style="cursor:pointer;" data-wb-filter-task="${esc(tk.name)}">${esc(tk.name)}</strong>
                    <span class="cell-sub">${esc(tk.time)} · 执行人：${esc(tk.assignee)}</span>
                    <div class="assessor-task-foot">
                      ${
                        unclaimed
                          ? `<button type="button" class="ghost sm" data-wb-claim-task="${tk.id}">认领任务</button>`
                          : `<button type="button" class="workspace-text-button" style="font-size:11.5px;" data-wb-filter-task="${esc(tk.name)}">${isSel ? '✓ 已按此任务筛选' : '筛选关联文档'}</button>`
                      }
                      <button type="button" class="workspace-text-button primary-link" style="font-size:11.5px;" data-wb-create-for-task="${esc(tk.name)}" data-wb-create-type="${esc(tk.type)}">＋ 写 ${esc(tk.type)}</button>
                    </div>
                  </div>
                `;
                })
                .join('')}
            </div>
          `
              : ''
          }

          <div class="filter-bar">
            <div class="field-group" style="width:130px;">
              <label>${useEn ? 'Doc Type' : '文档类型'}</label>
              <select id="wbf-type">
                <option value="ALL" ${f.type === 'ALL' ? 'selected' : ''}>${useEn ? 'All Types' : '全部类型'}</option>
                <option value="OBS" ${f.type === 'OBS' ? 'selected' : ''}>OBS</option>
                <option value="AFI" ${f.type === 'AFI' ? 'selected' : ''}>AFI</option>
              </select>
            </div>
            <div class="field-group" style="width:140px;">
              <label>${useEn ? 'Status' : '审核状态'}</label>
              <select id="wbf-status">
                <option value="all" ${f.status === 'all' ? 'selected' : ''}>${useEn ? 'All Status' : '全部状态'}</option>
                <option value="draft" ${f.status === 'draft' ? 'selected' : ''}>${useEn ? 'Draft' : '未提交'}</option>
                <option value="submitted" ${f.status === 'submitted' ? 'selected' : ''}>${useEn ? 'Pending Review' : '待审核'}</option>
                <option value="accepted" ${f.status === 'accepted' ? 'selected' : ''}>${useEn ? 'Approved' : '已通过'}</option>
                <option value="rejected" ${f.status === 'rejected' ? 'selected' : ''}>${useEn ? 'Rejected' : '已驳回'}</option>
              </select>
            </div>
            <div class="field-group" style="width:140px;">
              <label>${useEn ? 'Updated Time' : '更新时间'}</label>
              <select id="wbf-time">
                <option value="all" ${f.time === 'all' ? 'selected' : ''}>${useEn ? 'Any Time' : '全部时间'}</option>
                <option value="today" ${f.time === 'today' ? 'selected' : ''}>${useEn ? 'Today' : '今天'}</option>
                <option value="7d" ${f.time === '7d' ? 'selected' : ''}>${useEn ? 'Past 7 Days' : '近 7 天'}</option>
                <option value="30d" ${f.time === '30d' ? 'selected' : ''}>${useEn ? 'Past 30 Days' : '近 30 天'}</option>
              </select>
            </div>
            <div class="field-group" style="flex:1;min-width:220px;max-width:380px;">
              <label>${useEn ? 'Title / Full-Text Content' : '标题与正文内容检索'}</label>
              <input id="wbf-keyword" type="text" placeholder="${useEn ? 'Search title, KKS, observation text...' : '搜索文档标题、正文关键词、KKS 编码或任务名…'}" value="${esc(f.keyword)}" />
            </div>
            <button type="button" class="ghost" id="btn-wbf-reset">${useEn ? 'Reset' : '重置'}</button>
          </div>

          <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;font-size:13px;font-weight:500;">
            <span>${useEn ? 'Document List' : '文档列表'}</span>
            <span class="workspace-count">${docs.length} ${useEn ? 'docs' : '份文档'}</span>
            ${f.taskName ? `<span class="workspace-tag blue">任务过滤：${esc(f.taskName)}</span>` : ''}
          </div>

          <div class="table-scroll">
            <table class="data-table">
              <thead>
                <tr>
                  <th style="width:38%;">${useEn ? 'Document Title & Excerpt' : '文档标题与内容摘要'}</th>
                  <th style="width:10%;">${useEn ? 'Type' : '类型'}</th>
                  <th style="width:18%;">${useEn ? 'Source Task' : '关联任务'}</th>
                  <th style="width:11%;">${useEn ? 'Status / Ver' : '状态 / 版本'}</th>
                  <th style="width:11%;">${useEn ? 'Updated' : '更新时间'}</th>
                  <th style="width:12%;">${useEn ? 'Action' : '操作'}</th>
                </tr>
              </thead>
              <tbody>
                ${
                  docs.length
                    ? docs
                        .map((d) => {
                          const excerpt = useEn
                            ? (d.blocks[0]?.en || d.scopeEn || '')
                            : (d.blocks[0]?.zh || d.scopeZh || '');
                          const matchPlant = isWano && d.plantId === state.wanoCurrentPlantId;
                          return `
                        <tr style="${matchPlant ? 'background:#f4f9f6;' : ''}">
                          <td>
                            <button type="button" class="workspace-text-button cell-title" style="text-align:left;white-space:normal;font-size:13.5px;" data-wb-open-doc="${d.id}">
                              ${esc(useEn ? (d.titleEn || d.titleZh) : d.titleZh)}
                            </button>
                            <div class="clamp-2" style="font-size:12px;margin-top:3px;">${esc(excerpt)}</div>
                          </td>
                          <td>
                            <span class="workspace-tag ${d.docType === 'AFI' ? 'purple' : 'blue'}">${esc(d.docType)}</span>
                            ${d.sanitized ? '<span class="workspace-tag green" style="margin-top:4px;">Sanitized</span>' : ''}
                            ${matchPlant ? '<span class="workspace-tag green" style="margin-top:4px;">Current Plant</span>' : ''}
                          </td>
                          <td>
                            <div style="font-size:12.5px;color:var(--ink-2);">${esc(d.taskName)}</div>
                            <span class="cell-sub">${useEn ? 'Author' : '作者'}：${esc(d.author)}</span>
                          </td>
                          <td>
                            <span class="proj-flag ${statusClass(d.status)}">${useEn ? d.status.toUpperCase() : statusLabel(d.status)}</span>
                            <span class="cell-sub">V${d.version}</span>
                          </td>
                          <td style="font-size:12px;color:var(--ink-2);">${esc(d.updatedAt)}</td>
                          <td>
                            <button type="button" class="workspace-text-button primary-link" data-wb-open-doc="${d.id}">
                              ${isLeader ? '进入审核 →' : (useEn ? 'Open Editor →' : '进入编辑 →')}
                            </button>
                          </td>
                        </tr>
                      `;
                        })
                        .join('')
                    : `<tr><td colspan="6" style="text-align:center;padding:48px;color:var(--ink-3);">${useEn ? 'No matching documents' : '暂无符合筛选条件的文档'}</td></tr>`
                }
              </tbody>
            </table>
          </div>
        </section>
      `;
    }

    // 视图 B：沉浸式纸面文档编辑器 + 右侧「协作评论 | 队长审核（WANO：评审队复核）」Tab
    const activeDoc =
      state.workspaceDocs.find((d) => d.id === state.wbActiveDocId) ||
      state.workspaceDocs[0] ||
      null;
    if (!activeDoc) {
      state.wbViewMode = 'list';
      return renderWorkbenchPage();
    }
    if (!activeDoc.reviewChecklist) activeDoc.reviewChecklist = { poc: false, objective: false, kks: false };
    const editable = !isReview && (isWano || activeDoc.status === 'draft' || activeDoc.status === 'rejected');
    const collabComments = activeDoc.comments.filter((c) => c.kind === 'discussion');
    const reviewComments = activeDoc.comments.filter((c) => c.kind === 'review');
    const effectiveLang = isWano ? state.wbLanguage : 'zh';
    const chk = activeDoc.reviewChecklist;
    const focusedBlock =
      activeDoc.blocks.find((b) => b.id === state.wbFocusedBlockId) || activeDoc.blocks[0] || null;
    const focusedIdx = focusedBlock ? activeDoc.blocks.findIndex((b) => b.id === focusedBlock.id) + 1 : 1;
    const hasManualEn = !isWano && activeDoc.blocks.some((b) => b.showManualEn && b.en);
    const otherPendingDocs = state.workspaceDocs.filter(
      (d) =>
        d.status === 'submitted' &&
        d.id !== activeDoc.id &&
        (state.page === 'leader-review' ? d.projectId === state.leaderReviewProjectId : true)
    );

    // 租户与文档策略联动检查（非 WANO 角色受租户/文档策略约束）
    const tenant = getActiveTenantObj();
    const docPolicy = state.documents.find((d) => d.type === activeDoc.docType);
    const aiWritingAllowed = isWano || (tenant?.agents?.writing?.enabled && (!docPolicy || docPolicy.agents.writing));

    return `
      <div class="doc-editor-shell">
        <section class="doc-editor-main">
          <header class="doc-wb-toolbar">
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
              ${state.page === 'leader-review' ? '' : `<button type="button" class="ghost sm" id="btn-wb-back-list">← ${useEn ? 'Back to List' : '返回文档列表'}</button>`}
              ${state.wbFromProjectId ? `<button type="button" class="ghost sm" id="btn-wb-back-project">← 返回项目详情</button>` : ''}
              <span class="workspace-tag ${activeDoc.docType === 'AFI' ? 'purple' : 'blue'}">${esc(activeDoc.docType)}</span>
              <span class="proj-flag ${statusClass(activeDoc.status)}">${useEn ? activeDoc.status.toUpperCase() : statusLabel(activeDoc.status)}</span>
              <span class="workspace-tag">V${activeDoc.version}</span>
              ${
                isWano
                  ? `<button type="button" class="live-sync-pill ${state.wanoLiveSync ? '' : 'off'}" id="btn-wano-live-sync" title="450ms debounced sync; respects per-block translation lock">
                      <span class="live-sync-dot"></span>
                      ${useEn ? (state.wanoLiveSync ? 'Live EN ↔ ZH Sync: ON' : 'Live Sync: OFF') : (state.wanoLiveSync ? '实时中英互译：开启' : '实时互译：关闭')}
                    </button>`
                  : ''
              }
            </div>
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
              <span style="font-size:11.5px;color:var(--ink-3);">${useEn ? 'Saved' : '已自动保存'} ${esc(activeDoc.updatedAt)}</span>
              ${
                isWano
                  ? `
                <div class="doc-wb-lang-seg" role="group" aria-label="WANO Bilingual View">
                  <button type="button" class="${effectiveLang === 'zh' ? 'active' : ''}" data-wb-lang="zh">${useEn ? 'ZH' : '中'}</button>
                  <button type="button" class="${effectiveLang === 'en' ? 'active' : ''}" data-wb-lang="en">${useEn ? 'EN' : '英'}</button>
                  <button type="button" class="${effectiveLang === 'both' ? 'active' : ''}" data-wb-lang="both">${useEn ? 'Bilingual' : '双语'}</button>
                </div>
              `
                  : ''
              }
              <button type="button" class="ghost sm" id="btn-wb-export">${hasManualEn ? '导出中文 / 英文版' : (useEn ? 'Export DOCX' : '导出 DOCX')}</button>
              ${
                !isReview && !isWano && activeDoc.status === 'submitted'
                  ? `<button type="button" class="ghost sm" id="btn-wb-withdraw">撤回提交</button>`
                  : ''
              }
              ${
                !isReview
                  ? `<button type="button" class="primary sm" id="btn-wb-submit-review" ${!isWano && (activeDoc.status === 'submitted' || activeDoc.status === 'accepted') ? 'disabled' : ''}>
                      ${
                        isWano
                          ? (useEn ? 'Finalize & Queue OE' : '定稿并沉淀经验')
                          : activeDoc.status === 'rejected'
                            ? '重新提交审核'
                            : activeDoc.status === 'submitted'
                              ? '已提交待审'
                              : activeDoc.status === 'accepted'
                                ? '已通过归档'
                                : '提交审核'
                      }
                    </button>`
                  : ''
              }
            </div>
          </header>

          <div class="doc-desk-scroll">
            <article class="doc-paper-sheet">
              <div class="doc-paper-meta-strip">
                <span>${useEn ? 'Author' : '撰写人'}：<strong>${esc(activeDoc.author)}</strong></span>
                <span>·</span>
                <span>${useEn ? 'Task' : '来源任务'}：${esc(activeDoc.taskName)}</span>
                ${!editable && !isReview ? '<span class="workspace-tag yellow" style="margin-left:auto;">当前状态只读（如需修改请先撤回提交）</span>' : ''}
                ${activeDoc.sanitized ? '<span class="workspace-tag green" style="margin-left:auto;">Air-Gapped Sanitized</span>' : ''}
              </div>

              ${
                isWano
                  ? `
                    ${effectiveLang !== 'zh' ? `<input class="doc-paper-title" id="wb-title-en" value="${esc(activeDoc.titleEn)}" ${editable ? '' : 'readonly'} />` : ''}
                    ${effectiveLang !== 'en' ? `<input class="doc-paper-subtitle" id="wb-title-zh" value="${esc(activeDoc.titleZh)}" ${editable ? '' : 'readonly'} />` : ''}
                  `
                  : `<input class="doc-paper-title" id="wb-title-zh" value="${esc(activeDoc.titleZh)}" ${editable ? '' : 'readonly'} />`
              }

              <h2 class="doc-paper-h2">
                <span>${useEn ? (activeDoc.docType === 'AFI' ? '1. Applicable Criteria & Scope' : '1. Observation Scope') : (activeDoc.docType === 'AFI' ? '一、适用准则与评估范围' : '一、现场观察范围')}</span>
                <small>${useEn ? 'Criteria & Context' : '依据最高标准准则'}</small>
              </h2>
              <div class="doc-paper-para">
                ${
                  isWano
                    ? `
                      ${effectiveLang !== 'zh' ? `<textarea class="doc-paper-textarea" id="wb-scope-en" ${editable ? '' : 'readonly'}>${esc(activeDoc.scopeEn)}</textarea>` : ''}
                      ${effectiveLang !== 'en' ? `<textarea class="doc-paper-textarea secondary-lang" id="wb-scope-zh" ${editable ? '' : 'readonly'}>${esc(activeDoc.scopeZh)}</textarea>` : ''}
                    `
                    : `<textarea class="doc-paper-textarea" id="wb-scope-zh" ${editable ? '' : 'readonly'}>${esc(activeDoc.scopeZh)}</textarea>`
                }
              </div>

              <h2 class="doc-paper-h2">
                <span>${useEn ? (activeDoc.docType === 'AFI' ? '2. Findings & Supporting Facts' : '2. Field Observations') : (activeDoc.docType === 'AFI' ? '二、报告正文与支持事实' : '二、现场观察记录')}</span>
                <small>${isWano ? (state.wanoLiveSync ? 'Debounced Live Sync · Lockable per paragraph' : 'Manual Edit') : '点击段落定位 AI 焦点，悬停可润色或手动翻译'}</small>
              </h2>

              ${activeDoc.blocks
                .map((blk, idx) => {
                  const isFocused = focusedBlock && focusedBlock.id === blk.id;
                  return `
                <div class="doc-paper-para ${isFocused ? 'focused' : ''}" data-wb-para-wrap="${blk.id}">
                  <div class="doc-para-header">
                    <span class="doc-para-label">
                      <span>${idx + 1}. ${esc(wanoBlockLabel(blk.label))}</span>
                      <span class="workspace-tag blue">${esc(wanoAreaLabel(blk.area))}</span>
                      ${
                        isWano
                          ? `<button type="button" class="workspace-text-button" style="font-size:11px;color:${blk.syncLocked ? 'var(--yellow)' : 'var(--ink-3)'};" data-wb-toggle-lock="${blk.id}" title="Lock translation to prevent Live Sync overwrite">
                              ${blk.syncLocked ? '🔒 Locked' : '🔓 Live Sync'}
                            </button>`
                          : ''
                      }
                      ${blk.prevZh ? `<button type="button" class="workspace-text-button" style="font-size:11px;color:var(--blue);" data-wb-ai-undo="${blk.id}">↺ 撤销上次 AI 替换</button>` : ''}
                    </span>
                    ${
                      editable && aiWritingAllowed
                        ? `
                      <div class="doc-inline-ai-bar">
                        <button type="button" class="doc-inline-ai-btn accent" data-wb-ai-rewrite="${blk.id}">${isWano ? (useEn ? '✦ Quick Rewrite (3-Part)' : '✦ 快速改写(三段式)') : '✦ 事实润色'}</button>
                        <button type="button" class="doc-inline-ai-btn" data-wb-ai-poc="${blk.id}">${isWano ? (useEn ? 'Classify & PO&C Tags' : '分类改写(PO&C)') : 'PO&C 核查'}</button>
                        <button type="button" class="doc-inline-ai-btn" data-wb-ai-translate="${blk.id}">${isWano ? (useEn ? 'WANO Glossary' : '术语对齐') : '手动翻译（中↔英）'}</button>
                      </div>
                    `
                        : !aiWritingAllowed && editable
                          ? `<span class="workspace-tag yellow">自评估智能体已被管理员停用</span>`
                          : ''
                    }
                  </div>
                  ${
                    isWano
                      ? `
                        ${effectiveLang !== 'zh' ? `<textarea class="doc-paper-textarea" data-wb-block-en="${blk.id}" placeholder="Type English observation (debounced sync to Chinese)..." ${editable ? '' : 'readonly'}>${esc(blk.en)}</textarea>` : ''}
                        ${effectiveLang !== 'en' ? `<textarea class="doc-paper-textarea secondary-lang" data-wb-block-zh="${blk.id}" placeholder="中文实时同步译文…" ${editable ? '' : 'readonly'}>${esc(blk.zh)}</textarea>` : ''}
                      `
                      : `
                        <textarea class="doc-paper-textarea" data-wb-block-zh="${blk.id}" placeholder="输入客观观察事实或支持证据…" ${editable ? '' : 'readonly'}>${esc(blk.zh)}</textarea>
                        ${
                          blk.showManualEn && blk.en
                            ? `
                          <div class="manual-en-box">
                            <div class="manual-en-head">
                              <span>手动翻译英文版（可编辑 · 导出时可一并生成英文报告）</span>
                              <button type="button" class="workspace-text-button" style="font-size:11px;" data-wb-hide-en="${blk.id}">收起译文</button>
                            </div>
                            <textarea class="doc-paper-textarea" style="min-height:48px;font-size:12.5px;color:var(--ink-2);" data-wb-block-en="${blk.id}" ${editable ? '' : 'readonly'}>${esc(blk.en)}</textarea>
                          </div>
                        `
                            : ''
                        }
                      `
                  }
                  ${
                    blk.aiProposal
                      ? `
                    <div class="doc-wb-ai-proposal">
                      <div class="doc-wb-ai-proposal-head">
                        <span>✦ ${esc(blk.aiProposal.kind)}</span>
                        <div style="display:flex;gap:8px;">
                          <button type="button" class="primary sm" data-wb-ai-accept="${blk.id}">${useEn ? 'Apply' : '一键采纳'}</button>
                          <button type="button" class="ghost sm" data-wb-ai-discard="${blk.id}">${useEn ? 'Dismiss' : '放弃'}</button>
                        </div>
                      </div>
                      ${
                        blk.aiProposal.isManualTranslate
                          ? `<div class="ai-diff-new"><strong>英文译文预览：</strong>${esc(blk.aiProposal.en)}</div>`
                          : `
                            <div class="ai-diff-orig">${esc(useEn ? (blk.en || blk.zh) : blk.zh)}</div>
                            <div class="ai-diff-new">${esc(useEn ? (blk.aiProposal.en || blk.aiProposal.zh) : blk.aiProposal.zh)}</div>
                          `
                      }
                    </div>
                  `
                      : ''
                  }
                </div>
              `;
                })
                .join('')}

              ${
                editable
                  ? `<button type="button" class="ghost" style="width:100%;border-style:dashed;margin-top:10px;" id="btn-wb-add-block">${useEn ? '+ Insert New Paragraph / Fact' : '＋ 插入新观察段落 / 支持事实'}</button>`
                  : ''
              }
            </article>
          </div>

          ${
            editable && aiWritingAllowed
              ? `
            <footer class="doc-ai-dock">
              <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;">
                <div class="doc-ai-chips">
                  <button type="button" class="doc-ai-chip" data-wb-ai-chip="${useEn ? 'Check factual objectivity & remove subjective wording' : '去除主观推断措辞，强化客观事实表达'}">✦ ${useEn ? 'Remove subjective wording' : '去除主观推断措辞'}</button>
                  <button type="button" class="doc-ai-chip" data-wb-ai-chip="${useEn ? 'Cite highest-tier WANO PO&C OP.1 / MA.2 criteria' : '自动对照补充最高标准 WANO PO&C 条文'}">✦ ${useEn ? 'Cite WANO PO&C criteria' : '对照补充 WANO PO&C 条文'}</button>
                  <button type="button" class="doc-ai-chip" data-wb-ai-chip="${useEn ? 'Synthesize AFI problem statement from facts' : '基于当前观察事实提炼 AFI 问题陈述'}">✦ ${useEn ? 'Draft AFI Problem Statement' : '提炼 AFI 问题陈述'}</button>
                </div>
                <span class="workspace-tag blue" style="font-size:11px;">${useEn ? `Target: #${focusedIdx} ${focusedBlock?.label || ''}` : `当前作用于：第 ${focusedIdx} 段 · ${focusedBlock?.label || ''}`}</span>
              </div>
              <div style="display:flex;align-items:center;gap:8px;">
                <input type="text" class="doc-wb-ai-input" id="wb-ai-prompt" placeholder="${useEn ? '✦ Ask WANO AI to refine the focused paragraph...' : `✦ 针对「第 ${focusedIdx} 段」输入智能体协同指令…`}" />
                <button type="button" class="primary sm" id="btn-wb-ai-run">${useEn ? 'Ask AI' : '✦ 智能体润色'}</button>
              </div>
            </footer>
          `
              : ''
          }
        </section>

        <!-- 右栏：Tab 样式（协作评论 | 队长审核 / WANO 评审队复核） -->
        <aside class="doc-review-aside">
          <div class="review-tab-bar" role="tablist">
            <button type="button" class="review-tab-btn ${state.wbRightTab === 'collab' ? 'active' : ''}" data-wb-rtab="collab">
              ${useEn ? 'Collaboration' : '协作评论'} <span class="workspace-count">${collabComments.length}</span>
            </button>
            <button type="button" class="review-tab-btn ${state.wbRightTab === 'leader_review' ? 'active' : ''}" data-wb-rtab="leader_review">
              ${isWano ? (useEn ? 'PR Lead Review' : '评审队复核') : '队长审核'} <span class="workspace-count">${reviewComments.length}</span>
            </button>
          </div>

          ${
            state.wbRightTab === 'collab'
              ? `
            <div style="display:flex;flex-direction:column;gap:8px;flex-shrink:0;">
              <textarea id="wb-new-comment" placeholder="${useEn ? 'Write comment in English (auto-translated for plant staff)...' : '输入文档协作讨论，支持 @ 提及成员…'}" style="min-height:68px;padding:8px 10px;border:1px solid #dce2ea;border-radius:10px;background:#fff;font-size:12px;resize:vertical;"></textarea>
              <button type="button" class="ghost sm" id="btn-wb-post-comment">${useEn ? 'Post Bilingual Comment' : '发表协作评论'}</button>
            </div>
            <div class="doc-wb-list">
              ${
                collabComments.length
                  ? collabComments
                      .map(
                        (c) => `
                  <div class="doc-wb-comment-card">
                    <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;">
                      <strong>${esc(c.author)}</strong>
                      <span class="workspace-tag">${c.status === 'resolved' ? (useEn ? 'Resolved' : '已闭环') : `V${c.version}`}</span>
                    </div>
                    <div>${esc(c.text)}</div>
                    ${
                      isWano
                        ? `<div style="padding-top:5px;border-top:1px dashed var(--line);color:var(--blue);font-size:11.5px;">${esc(c.enText || liveTranslateMock(c.text, 'en'))}</div>`
                        : ''
                    }
                    <div style="display:flex;align-items:center;justify-content:space-between;color:var(--ink-3);font-size:11px;">
                      <span>${esc(c.time)}</span>
                      ${
                        c.status !== 'resolved'
                          ? `<button type="button" class="workspace-text-button primary-link" style="font-size:11px;" data-wb-resolve-cmt="${c.id}">${useEn ? 'Resolve' : '确认闭环'}</button>`
                          : ''
                      }
                    </div>
                  </div>
                `
                      )
                      .join('')
                  : `<p style="text-align:center;color:var(--ink-3);font-size:12px;padding:24px 0;">${useEn ? 'No collaboration comments yet' : '暂无协作评论'}</p>`
              }
            </div>
          `
              : `
            <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 12px;border-radius:11px;background:#f5f7fa;border:1px solid var(--line);flex-shrink:0;">
              <span style="font-size:12px;color:var(--ink-2);">${isWano ? (useEn ? 'PR Review State' : '评审复核状态') : '当前审核状态'}</span>
              <span class="proj-flag ${statusClass(activeDoc.status)}">${useEn ? activeDoc.status.toUpperCase() : statusLabel(activeDoc.status)}</span>
            </div>

            <div class="review-checklist">
              <strong style="font-size:12px;color:var(--ink);">${isWano ? (useEn ? 'WANO PR / Counterpart Checklist' : 'WANO 评审队复核清单') : '队长审核核查清单（按当前文档独立保存）'}</strong>
              <label class="review-check-item"><input type="checkbox" data-wb-rchk="poc" ${chk.poc ? 'checked' : ''} ${isLeader || isWanoLeaderOrDeputy() ? '' : 'disabled'} /> ${isWano ? (useEn ? 'Objective facts aligned with WANO PO&C' : '客观事实符合 WANO PO&C 标准') : '已对齐高优先级 PO&C / IEEE 准则条款'}</label>
              <label class="review-check-item"><input type="checkbox" data-wb-rchk="objective" ${chk.objective ? 'checked' : ''} ${isLeader || isWanoLeaderOrDeputy() ? '' : 'disabled'} /> ${isWano ? (useEn ? 'Counterpart factual accuracy confirmed' : '电厂对口人已确认事实准确性') : '观察事实客观准确，无主观推断表述'}</label>
              <label class="review-check-item"><input type="checkbox" data-wb-rchk="kks" ${chk.kks ? 'checked' : ''} ${isLeader || isWanoLeaderOrDeputy() ? '' : 'disabled'} /> ${isWano ? (useEn ? 'Sanitized & ready for OE distillation' : '脱敏完整，可沉淀为全球 OE 经验') : '设备 KKS 编码、工单号与程序编号核验完整'}</label>
            </div>

            ${
              isLeader || isWanoLeaderOrDeputy()
                ? `
              <div style="display:flex;flex-direction:column;gap:8px;flex-shrink:0;">
                <textarea id="wb-review-note" placeholder="${isWano ? (useEn ? 'Enter Team Leader / Deputy TL review note...' : '输入队长/副队长复核意见或修改建议…') : '输入队长审核意见或驳回修改要求…'}" style="min-height:66px;padding:8px 10px;border:1px solid #dce2ea;border-radius:10px;background:#fff;font-size:12px;resize:vertical;"></textarea>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
                  <button type="button" class="ghost sm" id="btn-wb-reject" ${activeDoc.status === 'accepted' ? 'disabled' : ''}>${isWano ? (useEn ? 'Request Edit' : '退回修改') : '驳回修改'}</button>
                  <button type="button" class="primary sm" id="btn-wb-accept" ${activeDoc.status === 'accepted' ? 'disabled' : ''}>${isWano ? (useEn ? 'Finalize PR' : '队长/副队长定稿') : '审核通过'}</button>
                </div>
                ${
                  isLeader && otherPendingDocs.length
                    ? `
                  <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
                    <button type="button" class="ghost sm" id="btn-wb-reject-next" ${activeDoc.status === 'accepted' ? 'disabled' : ''}>驳回并审下一条 →</button>
                    <button type="button" class="primary sm" id="btn-wb-accept-next" ${activeDoc.status === 'accepted' ? 'disabled' : ''}>通过并审下一条 →</button>
                  </div>
                  <div style="font-size:11px;color:var(--ink-3);text-align:center;">队列中还有 ${otherPendingDocs.length} 份待审核报告，无需返回列表</div>
                `
                    : ''
                }
              </div>
            `
                : `<div style="font-size:11.5px;color:var(--ink-3);padding:0 2px;">${isWano ? (useEn ? 'Final sign-off is reserved for Team Leader & Deputy Team Leader.' : '终审定稿由 WANO 队长或副队长（同等权限）在此执行。') : '当前为评估员视角，提交后由队长在此给出审核意见与结论。'}</div>`
            }

            <div class="doc-wb-list">
              ${
                reviewComments.length
                  ? reviewComments
                      .map(
                        (c) => `
                  <div class="doc-wb-comment-card rejection">
                    <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;">
                      <strong>${esc(c.author)}</strong>
                      <span class="workspace-tag">${c.status === 'resolved' ? (useEn ? 'Resolved' : '已闭环') : `V${c.version}`}</span>
                    </div>
                    <div>${esc(c.text)}</div>
                    <div style="display:flex;align-items:center;justify-content:space-between;color:var(--ink-3);font-size:11px;">
                      <span>${esc(c.time)}</span>
                      ${
                        c.status !== 'resolved'
                          ? `<button type="button" class="workspace-text-button primary-link" style="font-size:11px;" data-wb-resolve-cmt="${c.id}">${useEn ? 'Mark Resolved' : '标记已改'}</button>`
                          : ''
                      }
                    </div>
                  </div>
                `
                      )
                      .join('')
                  : `<p style="text-align:center;color:var(--ink-3);font-size:12px;padding:18px 0;">${isWano ? (useEn ? 'No PR review notes yet' : '暂无评审队复核记录') : '暂无队长审核记录'}</p>`
              }
            </div>
          `
          }
        </aside>
      </div>
    `;
  }

  // ==================== 2.6 WANO 专家视角：当前评估电厂（可切换） + 全球电厂双视角 ====================
  function renderWanoInsightsPage() {
    const useEn = state.wanoUiLang === 'en';
    const tr = D.WANO_PR_TREND;
    const distilledCount = state.wanoCommonAfis.filter((a) => a.distilled).length;
    const activePlant = D.WANO_PLANT_MATRIX.find((p) => p.id === state.wanoCurrentPlantId) || D.WANO_PLANT_MATRIX[0];
    const plantDisplayName = state.wanoAnonMode ? activePlant.anonCode : activePlant.realName;
    const radarLabels = useEn ? D.WANO_FLEET_RADAR.labelsEn : D.WANO_FLEET_RADAR.labels;

    const currentPlantHtml = `
      <div class="kpi-grid">
        <article class="kpi-card">
          <div class="kpi-head"><span>${useEn ? 'Mission Cycle' : '当前评审周期'}</span><span class="workspace-tag blue">Active</span></div>
          <div class="kpi-value" style="font-size:20px;">${esc(activePlant.missionType)}</div>
          <div class="kpi-foot"><span>${esc(plantDisplayName)}</span></div>
        </article>
        <article class="kpi-card">
          <div class="kpi-head"><span>${useEn ? 'Current Cycle AFIs' : '本轮识别 AFI'}</span><span class="workspace-tag ${activePlant.afiCount <= activePlant.prevAfiCount ? 'green' : 'red'}">${activePlant.prevAfiCount} → ${activePlant.afiCount}</span></div>
          <div class="kpi-value">${activePlant.afiCount}</div>
          <div class="kpi-foot"><span>${useEn ? 'Fleet Avg: 6.9' : '全球机群均值：6.9'}</span><span class="trend-up">${esc(activePlant.trend)}</span></div>
        </article>
        <article class="kpi-card">
          <div class="kpi-head"><span>${useEn ? 'Recurring AFIs' : '重复出现 AFI'}</span><span class="workspace-tag yellow">Follow-up</span></div>
          <div class="kpi-value">${activePlant.recurringCount}</div>
          <div class="kpi-foot"><span>${useEn ? 'Carried from prev PR' : '较上轮重复项'}</span></div>
        </article>
        <article class="kpi-card">
          <div class="kpi-head"><span>${useEn ? 'Documented Strengths' : '识别电厂强项'}</span><span class="workspace-tag green">Good Practice</span></div>
          <div class="kpi-value">${activePlant.strengths.length}</div>
          <div class="kpi-foot"><span>${useEn ? 'Shareable across fleet' : '可向全球机群推广'}</span></div>
        </article>
        <article class="kpi-card">
          <div class="kpi-head"><span>${useEn ? 'Top PO&C Score' : '最高领域得分'}</span><span class="workspace-tag blue">PO&C</span></div>
          <div class="kpi-value">${Math.max(...activePlant.radarScores)}</div>
          <div class="kpi-foot"><span>${useEn ? 'vs Fleet Avg' : '高于全球机群基准'}</span></div>
        </article>
        <article class="kpi-card">
          <div class="kpi-head"><span>${useEn ? 'Sanitized Readiness' : '脱敏带出就绪'}</span><span class="workspace-tag green">Air-Gapped</span></div>
          <div class="kpi-value">100%</div>
          <div class="kpi-foot"><span>${useEn ? 'Zero PII verified' : '零内网敏感标识'}</span></div>
        </article>
      </div>

      <div class="dashboard-grid">
        <div class="panel-card">
          <div class="panel-card-head">
            <div>
              <h3>${useEn ? '6-Domain PO&C Capability Profile (Radar Chart)' : '当前电厂 PO&C 六维能力画像（雷达图）'}</h3>
              <small>${useEn ? 'Current plant assessment scores vs global fleet benchmark across OP, MA, EN, ER, RP & NSC' : '对比当前受评电厂与全球机群均值在运行、维修、工程、设备、辐射与安全文化六大领域的表现'}</small>
            </div>
            <div class="chart-legend">
              <span><i class="legend-dot" style="background:#3f7a5e;"></i>${esc(useEn ? 'Current Plant' : '当前电厂')}</span>
              <span><i class="legend-dot" style="background:#8a8f98;"></i>${esc(useEn ? 'Global Fleet Avg' : '全球均值')}</span>
            </div>
          </div>
          ${renderRadarSvg(radarLabels, activePlant.radarScores, D.WANO_FLEET_RADAR.fleetAvg, plantDisplayName, 'Global Fleet Avg')}
        </div>

        <div class="panel-card">
          <div class="panel-card-head">
            <div>
              <h3>${useEn ? 'Plant Multi-Cycle Trajectory (Area Chart)' : '该电厂历次 PR 演进趋势（面积折线图）'}</h3>
              <small>${useEn ? 'AFI count vs documented strengths across 2020 – 2026 peer review cycles' : '跟踪该电厂近四轮同行评审中 AFI 数量与强项实践的变化轨迹'}</small>
            </div>
            <div class="chart-legend">
              <span><i class="legend-dot" style="background:#b0544a;"></i>AFIs</span>
              <span><i class="legend-dot" style="background:#3f7a5e;"></i>Strengths</span>
            </div>
          </div>
          <div class="chart-svg-wrap">
            ${renderAreaTrendSvg(tr.cycles, activePlant.cycleAfi, activePlant.cycleStrengths, '#b0544a', '#3f7a5e', ' AFIs', ' Strengths')}
          </div>
        </div>
      </div>

      <div class="dashboard-grid">
        <div class="panel-card">
          <div class="panel-card-head">
            <div>
              <h3>${useEn ? 'Identified Plant Strengths (Good Practices)' : '当前电厂突出强项（良好实践）'}</h3>
              <small>${useEn ? 'Verified practices recommended for cross-plant WANO sharing' : '经现场观察与访谈验证、具备行业示范价值的良好实践'}</small>
            </div>
            <span class="workspace-tag green">${activePlant.strengths.length} items</span>
          </div>
          <div class="sw-list" style="gap:10px;">
            ${activePlant.strengths.map((s) => `<div class="sw-item strength" style="padding:10px 12px;border-radius:10px;background:var(--green-bg);">＋ ${esc(s)}</div>`).join('')}
          </div>
        </div>

        <div class="panel-card">
          <div class="panel-card-head">
            <div>
              <h3>${useEn ? 'Priority Weaknesses & AFI Focus Areas' : '当前电厂主要弱项与 AFI 聚焦项'}</h3>
              <small>${useEn ? 'Key gaps requiring targeted observation follow-up and post-PR report authoring' : '需重点跟进现场证据并在离场后完成正式报告编写的短板'}</small>
            </div>
            <button type="button" class="workspace-text-button primary-link" style="font-size:12px;" data-nav="workbench">${useEn ? 'Open in Workbench →' : '前往工作台编写 →'}</button>
          </div>
          <div class="sw-list" style="gap:10px;">
            ${activePlant.weaknesses.map((w) => `<div class="sw-item weakness" style="padding:10px 12px;border-radius:10px;background:var(--red-bg);">－ ${esc(w)}</div>`).join('')}
          </div>
        </div>
      </div>
    `;

    const globalFleetHtml = `
      <div class="kpi-grid">
        <article class="kpi-card">
          <div class="kpi-head"><span>${useEn ? 'Active PR / PSUR Missions' : '活跃 PR / PSUR 评审'}</span><span class="workspace-tag blue">2026</span></div>
          <div class="kpi-value">4</div>
          <div class="kpi-foot"><span>3 PR · 1 PSUR</span><span class="trend-up">100% On-Track</span></div>
        </article>
        <article class="kpi-card">
          <div class="kpi-head"><span>${useEn ? 'Avg AFIs / Plant' : '场均 AFI 数量'}</span><span class="workspace-tag green">-15.8%</span></div>
          <div class="kpi-value">6.9</div>
          <div class="kpi-foot"><span>2020: 11.4 → 2026: 6.9</span><span class="trend-up">Improving</span></div>
        </article>
        <article class="kpi-card">
          <div class="kpi-head"><span>${useEn ? 'Fleet Recurring AFI Rate' : '共性重复 AFI 占比'}</span><span class="workspace-tag yellow">Watch</span></div>
          <div class="kpi-value">36.0%</div>
          <div class="kpi-foot"><span>9 / 25 AFIs recurring</span><span>OP.1 & MA.2</span></div>
        </article>
        <article class="kpi-card">
          <div class="kpi-head"><span>${useEn ? 'Cross-Plant Strengths' : '识别电厂标杆强项'}</span><span class="workspace-tag green">Benchmark</span></div>
          <div class="kpi-value">10</div>
          <div class="kpi-foot"><span>Avg 8.4 / cycle</span><span class="trend-up">+21.7%</span></div>
        </article>
        <article class="kpi-card">
          <div class="kpi-head"><span>${useEn ? 'OE Distilled Topics' : '已沉淀 OE 主题'}</span><span class="workspace-tag purple">Knowledge</span></div>
          <div class="kpi-value">${distilledCount} / ${state.wanoCommonAfis.length}</div>
          <div class="kpi-foot"><span>Common AFI → OE</span><span>Sanitized</span></div>
        </article>
        <article class="kpi-card">
          <div class="kpi-head"><span>${useEn ? 'Live EN ↔ ZH Sync' : '实时中英互译覆盖'}</span><span class="workspace-tag green">Active</span></div>
          <div class="kpi-value">100%</div>
          <div class="kpi-foot"><span>OBS + Interviews + AFI</span><span>&lt;0.8s latency</span></div>
        </article>
      </div>

      <div class="dashboard-grid">
        <div class="panel-card">
          <div class="panel-card-head">
            <div>
              <h3>${useEn ? 'Global Fleet Multi-Cycle PR / PSUR (Grouped Bar Chart)' : '全球电厂多周期 PR/PSUR 对比（分组柱状图）'}</h3>
              <small>${useEn ? 'Average AFIs per plant declining while documented plant strengths steadily rise' : '跟踪多轮同行评审中场均 AFI 数量下降与电厂强项实践增长趋势'}</small>
            </div>
            <div class="chart-legend">
              <span><i class="legend-dot" style="background:#b0544a;"></i>${useEn ? 'Avg AFIs / Plant' : '场均 AFI 数'}</span>
              <span><i class="legend-dot" style="background:#3f7a5e;"></i>${useEn ? 'Avg Strengths' : '场均强项数'}</span>
            </div>
          </div>
          <div class="chart-svg-wrap">
            ${renderGroupedBarSvg(tr.cycles, tr.avgAfiPerPlant, tr.avgStrengths, '#b0544a', '#3f7a5e', 'Avg AFIs', 'Avg Strengths')}
          </div>
        </div>

        <div class="panel-card">
          <div class="panel-card-head">
            <div>
              <h3>${useEn ? 'Fleet-Wide Common AFIs (Cross-Plant)' : '全球机群共性 AFI 与 OE 经验沉淀'}</h3>
              <small>${useEn ? 'Systemic gaps recurring across ≥2 plants; one-click distill into WANO OE library' : '识别跨电厂高频共性短板，一键沉淀至 WANO 经验反馈库'}</small>
            </div>
          </div>
          <div class="table-scroll">
            <table class="data-table">
              <thead>
                <tr>
                  <th>PO&amp;C</th>
                  <th>${useEn ? 'Common AFI Theme' : '共性 AFI 主题'}</th>
                  <th>${useEn ? 'Plants' : '涉及电厂'}</th>
                  <th>${useEn ? 'Action' : '沉淀'}</th>
                </tr>
              </thead>
              <tbody>
                ${state.wanoCommonAfis
                  .map(
                    (item) => `
                  <tr>
                    <td><span class="workspace-tag blue">${esc(item.poc)}</span></td>
                    <td>
                      <strong class="cell-title" style="font-size:12.5px;">${esc(useEn ? item.title : item.titleZh)}</strong>
                      <span class="cell-sub">${item.instances} instances · YoY ${item.trend}</span>
                    </td>
                    <td>${item.plantsAffected} ${useEn ? 'plants' : '座'}</td>
                    <td>
                      ${
                        item.distilled
                          ? `<span class="workspace-tag green">${useEn ? 'In OE' : '已沉淀'}</span>`
                          : `<button type="button" class="workspace-text-button primary-link" style="font-size:12px;" data-wano-distill="${item.id}">${useEn ? 'Distill to OE' : '沉淀为 OE'}</button>`
                      }
                    </td>
                  </tr>
                `
                  )
                  .join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="panel-card">
        <div class="panel-card-head">
          <div>
            <h3>${useEn ? 'Global Plants Strengths & Weaknesses Matrix' : '全球电厂强项与弱项横向对标矩阵'}</h3>
            <small>${useEn ? 'Click any plant row to drill into its Current Plant 6-domain profile' : '点击任意电厂行可一键切入该电厂的六维能力画像与历次趋势'}</small>
          </div>
          <span class="workspace-tag ${state.wanoAnonMode ? 'green' : 'yellow'}">${state.wanoAnonMode ? (useEn ? 'Anonymized Mode' : '匿名脱敏视图') : (useEn ? 'Named View' : '实名视图')}</span>
        </div>
        <div class="table-scroll">
          <table class="data-table">
            <thead>
              <tr>
                <th style="width:18%;">${useEn ? 'Plant / Mission' : '电厂 / 评审任务'}</th>
                <th style="width:30%;">${useEn ? 'Key Strengths (Good Practices)' : '突出强项（良好实践）'}</th>
                <th style="width:30%;">${useEn ? 'Key Weaknesses (Focus Areas)' : '主要弱项（待改进领域）'}</th>
                <th style="width:12%;">${useEn ? 'AFIs (Prev→Now)' : 'AFI 变化'}</th>
                <th style="width:10%;">${useEn ? 'Trend' : '趋势'}</th>
              </tr>
            </thead>
            <tbody>
              ${D.WANO_PLANT_MATRIX.map((row) => {
                const trendCls = row.trend === 'Improving' ? 'done' : row.trend === 'Watch' ? 'rejected' : 'pending';
                return `
                  <tr>
                    <td>
                      <button type="button" class="workspace-text-button primary-link cell-title" style="text-align:left;white-space:normal;" data-wano-drill-plant="${row.id}">${esc(state.wanoAnonMode ? row.anonCode : row.realName)}</button>
                      <span class="cell-sub">${esc(row.missionType)}</span>
                    </td>
                    <td>
                      <div class="sw-list">
                        ${row.strengths.map((s) => `<span class="sw-item strength">＋ ${esc(s)}</span>`).join('')}
                      </div>
                    </td>
                    <td>
                      <div class="sw-list">
                        ${row.weaknesses.map((w) => `<span class="sw-item weakness">－ ${esc(w)}</span>`).join('')}
                      </div>
                    </td>
                    <td>
                      <strong>${row.prevAfiCount} → ${row.afiCount}</strong>
                      <span class="cell-sub">${row.recurringCount} ${useEn ? 'recurring' : '项重复'}</span>
                    </td>
                    <td><span class="proj-flag ${trendCls}">${esc(row.trend)}</span></td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    return `
      <section class="workspace-island scrollable">
        <div class="workspace-page-heading" style="margin-bottom:14px;">
          <div>
            <h1>${useEn ? 'WANO Peer Review Insights (PR / PSUR)' : 'WANO 同行评审洞察（PR / PSUR）'}</h1>
          </div>
        </div>

        <div class="wano-scope-bar">
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <button type="button" class="perm-tab ${state.wanoScope === 'current_plant' ? 'active' : ''}" data-wano-scope="current_plant">
              ${useEn ? 'Current Evaluated Plant' : '当前评估电厂视角'}
            </button>
            <button type="button" class="perm-tab ${state.wanoScope === 'global_fleet' ? 'active' : ''}" data-wano-scope="global_fleet">
              ${useEn ? 'Global Fleet Overview' : '全球电厂视角'}
            </button>
          </div>
          ${
            state.wanoScope === 'current_plant'
              ? `
            <label class="wano-plant-select">
              <span>${useEn ? 'Switch Plant:' : '切换受评电厂：'}</span>
              <select id="wano-plant-select">
                ${D.WANO_PLANT_MATRIX.map(
                  (p) => `<option value="${p.id}" ${p.id === activePlant.id ? 'selected' : ''}>${esc(state.wanoAnonMode ? p.anonCode : p.realName)}</option>`
                ).join('')}
              </select>
            </label>
          `
              : `<span class="workspace-tag blue">${useEn ? '4 Peer-Reviewed Plants · 2020–2026' : '覆盖 4 座受评核电基地 · 2020–2026'}</span>`
          }
        </div>

        ${state.wanoScope === 'current_plant' ? currentPlantHtml : globalFleetHtml}
      </section>
    `;
  }

  // ==================== 2.6A WANO 同行评审计划（日历阶段链路 + 点击日期日程/输入输出 + 评审队与电厂配合名录） ====================
  function renderWanoPlanPage() {
    const useEn = state.wanoUiLang === 'en';
    const stages = D.WANO_PR_STAGES || [];
    const roster = D.WANO_PR_TEAM_ROSTER || { leaders: [], areaAssignments: [], interpreters: [], observers: [] };
    const todayStr = '2026-11-19';
    const selectedDate = state.wanoPlanSelectedDate || todayStr;
    const activePlant = D.WANO_PLANT_MATRIX.find((p) => p.id === state.wanoCurrentPlantId) || D.WANO_PLANT_MATRIX[0];

    // 构建 2026年11月 日历（2026-11-01 为周日，5 周完整覆盖 11月1日 ~ 11月30日）
    const pad2 = (n) => String(n).padStart(2, '0');
    const weeks = [];
    const startCursor = new Date(2026, 10, 1); // 2026-11-01 (Sunday)
    for (let w = 0; w < 5; w++) {
      const days = [];
      for (let d = 0; d < 7; d++) {
        const dt = new Date(startCursor.getFullYear(), startCursor.getMonth(), startCursor.getDate() + w * 7 + d);
        const iso = `${dt.getFullYear()}-${pad2(dt.getMonth() + 1)}-${pad2(dt.getDate())}`;
        days.push({
          iso,
          dayNum: dt.getDate(),
          inMonth: dt.getMonth() === 10,
          isToday: iso === todayStr,
          isSelected: iso === selectedDate
        });
      }
      weeks.push(days);
    }

    const weekdayHeaders = useEn ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] : ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const weekdayNamesZh = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    const weekdayNamesEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const selParts = selectedDate.split('-').map(Number);
    const selDateObj = new Date(selParts[0], selParts[1] - 1, selParts[2]);
    const selWeekday = useEn ? weekdayNamesEn[selDateObj.getDay()] : weekdayNamesZh[selDateObj.getDay()];

    const matchedStages = stages.filter((st) => selectedDate >= st.startDate && selectedDate <= st.endDate);

    const statusBadgeText = (st) => {
      if (st.status === 'done') return useEn ? 'Completed' : '已完成';
      if (st.status === 'active') return useEn ? 'In Progress' : '进行中';
      return useEn ? 'Upcoming' : '待开展';
    };

    const weekRowsHtml = weeks
      .map((days) => {
        const weekStart = days[0].iso;
        const weekEnd = days[6].iso;
        const todayIdx = days.findIndex((d) => d.isToday);

        // 计算本周相交的阶段条并分配不重叠的轨道（lane）
        const weekSegs = [];
        stages.forEach((st) => {
          if (st.endDate < weekStart || st.startDate > weekEnd) return;
          const colStart = Math.max(0, days.findIndex((d) => d.iso >= st.startDate));
          let colEnd = 6;
          for (let i = 6; i >= 0; i--) {
            if (days[i].iso <= st.endDate) {
              colEnd = i;
              break;
            }
          }
          const startsThisWeek = st.startDate >= weekStart;
          const endsThisWeek = st.endDate <= weekEnd;
          weekSegs.push({ st, colStart, colEnd, startsThisWeek, endsThisWeek });
        });

        const lanes = [];
        weekSegs.forEach((seg) => {
          let placed = -1;
          for (let l = 0; l < lanes.length; l++) {
            if (lanes[l] < seg.colStart) {
              placed = l;
              lanes[l] = seg.colEnd;
              break;
            }
          }
          if (placed === -1) {
            placed = lanes.length;
            lanes.push(seg.colEnd);
          }
          seg.lane = placed;
        });

        const laneCount = Math.max(1, lanes.length);
        const barsHeight = laneCount * 28 + 8;

        const barsHtml = weekSegs
          .map((seg) => {
            const leftPct = (seg.colStart / 7) * 100;
            const widthPct = ((seg.colEnd - seg.colStart + 1) / 7) * 100;
            const topPx = seg.lane * 28 + 4;
            const radiusCls = `${seg.startsThisWeek ? 'round-start' : 'flat-start'} ${seg.endsThisWeek ? 'round-end' : 'flat-end'}`;
            const isSelectedStage = matchedStages.some((m) => m.id === seg.st.id);
            const targetDate = selectedDate >= seg.st.startDate && selectedDate <= seg.st.endDate ? selectedDate : seg.st.startDate;
            return `
              <button
                type="button"
                class="wano-cal-bar ${seg.st.status} ${radiusCls} ${isSelectedStage ? 'selected' : ''}"
                style="left:calc(${leftPct.toFixed(4)}% + 3px);width:calc(${widthPct.toFixed(4)}% - 6px);top:${topPx}px;"
                data-plan-stage-date="${targetDate}"
                title="${esc(seg.st.seq)} ${esc(useEn ? seg.st.name : seg.st.zh)}（${seg.st.startDate} ~ ${seg.st.endDate}）"
              >
                <span class="wano-cal-bar-seq">${esc(seg.st.seq)}</span>
                <span class="wano-cal-bar-name">${esc(useEn ? seg.st.name : seg.st.zh)}</span>
              </button>
            `;
          })
          .join('');

        return `
          <div class="wano-cal-week">
            ${
              todayIdx >= 0
                ? `<div class="wano-cal-today-line" style="left:calc(${((todayIdx + 0.5) / 7) * 100}%);"><span class="wano-cal-today-tag">${useEn ? 'Today' : '今日 11-19'}</span></div>`
                : ''
            }
            <div class="wano-cal-days-row">
              ${days
                .map(
                  (d) => `
                <button type="button" class="wano-cal-day-cell ${d.inMonth ? '' : 'out-month'} ${d.isToday ? 'is-today' : ''} ${d.isSelected ? 'is-selected' : ''}" data-plan-date="${d.iso}">
                  <span class="wano-cal-day-num">${d.dayNum}${!d.inMonth ? (useEn ? ' Dec' : '月') : ''}</span>
                </button>
              `
                )
                .join('')}
            </div>
            <div class="wano-cal-bars-layer" style="min-height:${barsHeight}px;">
              ${barsHtml}
            </div>
          </div>
        `;
      })
      .join('');

    const areaFilter = state.wanoPlanAreaFilter || 'all';
    const filteredAreas = roster.areaAssignments.filter((item) => areaFilter === 'all' || item.area.startsWith(areaFilter));

    return `
      <section class="workspace-island scrollable">
        <div class="workspace-page-heading">
          <div>
            <h1>${useEn ? 'WANO Peer Review Plan & Team Roster' : 'WANO 同行评审计划与团队名录'}</h1>
            <p class="page-subtitle">${esc(state.wanoAnonMode ? activePlant.anonCode : activePlant.realName)} · ${esc(activePlant.missionType)} · ${useEn ? '2026-11-01 ~ 2026-11-30' : '评审周期：2026-11-01 ~ 2026-11-30（点击任意日期查看阶段日程与输入输出文件）'}</p>
          </div>
          <div class="heading-actions">
            <button type="button" class="ghost sm" id="btn-wano-toggle-prcat">${useEn ? `Switch to ${state.wanoPrCategory === 'PR' ? 'PSUR' : 'PR'}` : `切换为 ${state.wanoPrCategory === 'PR' ? 'PSUR（装料前）' : 'PR（商运后）'}`}</button>
            ${isWanoLeaderOrDeputy() ? `<button type="button" class="primary sm" id="btn-wano-gen-exit-ppt">${useEn ? 'Generate Exit Meeting PPT' : '生成出口会议 PPT'}</button>` : ''}
          </div>
        </div>

        <div class="wano-plan-cal-layout">
          <div class="panel-card">
            <div class="panel-card-head">
              <div>
                <h3>${useEn ? 'Peer Review Full-Lifecycle Calendar · Nov 2026' : 'WANO 同行评审全流程阶段日历 · 2026年11月'}</h3>
                <small>${useEn ? 'Click any date or rounded stage bar to inspect daily schedule, description & deliverables' : '各阶段以跨日期圆角长条标注，红色竖线标示当前日期（2026-11-19）；点击日期查看详情'}</small>
              </div>
              <div class="chart-legend">
                <span><i class="legend-dot" style="background:#3f7a5e;"></i>${useEn ? 'Done' : '已完成'}</span>
                <span><i class="legend-dot" style="background:#46618a;"></i>${useEn ? 'Active' : '进行中'}</span>
                <span><i class="legend-dot" style="background:#c28e3c;"></i>${useEn ? 'Upcoming' : '待开展'}</span>
                <span><i class="legend-dot" style="background:#b0544a;"></i>${useEn ? 'Today' : '当前日期'}</span>
              </div>
            </div>

            <div class="wano-cal-board">
              <div class="wano-cal-weekdays">
                ${weekdayHeaders.map((w) => `<div>${w}</div>`).join('')}
              </div>
              <div class="wano-cal-body">
                ${weekRowsHtml}
              </div>
            </div>
          </div>

          <div class="panel-card wano-plan-detail-card">
            <div class="panel-card-head">
              <div>
                <h3>${esc(selectedDate)} · ${esc(selWeekday)}</h3>
                <small>${selectedDate === todayStr ? (useEn ? 'Current Mission Date · Active On-Site Review' : '当前日期 · 现场同行评审进行中') : (useEn ? 'Selected Schedule Detail' : '已选日期阶段日程与文件明细')}</small>
              </div>
              ${selectedDate === todayStr ? `<span class="workspace-tag red">${useEn ? 'Today' : '今日'}</span>` : `<button type="button" class="ghost sm" data-plan-date="${todayStr}">${useEn ? 'Back to Today' : '回到今日'}</button>`}
            </div>

            ${
              matchedStages.length
                ? matchedStages
                    .map(
                      (st) => `
                  <div class="wano-stage-detail-block">
                    <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;">
                      <div style="display:flex;align-items:center;gap:7px;">
                        <span class="workspace-tag ${st.status === 'done' ? 'green' : st.status === 'active' ? 'blue' : 'yellow'}">阶段 ${esc(st.seq)}</span>
                        <strong style="font-size:14px;">${esc(useEn ? st.name : st.zh)}</strong>
                      </div>
                      <span class="proj-flag ${statusClass(st.status)}">${statusBadgeText(st)}</span>
                    </div>
                    <div style="font-size:11.5px;color:var(--ink-3);">
                      ${useEn ? 'Span' : '阶段周期'}：${esc(st.startDate)} ~ ${esc(st.endDate)} · ${useEn ? 'Owner' : '主责'}：${esc(st.owner)}
                    </div>
                    <p class="wano-stage-desc">${esc(useEn ? st.descEn : st.desc)}</p>

                    <div class="wano-detail-subhead">${useEn ? 'Detailed Daily Schedule' : '当日详细日程'}</div>
                    <div class="wano-schedule-list">
                      ${(st.dailySchedules || [])
                        .map(
                          (item) => `
                        <div class="wano-schedule-item">
                          <span class="wano-schedule-time">${esc(item.time)}</span>
                          <div style="min-width:0;flex:1;">
                            <strong>${esc(useEn ? item.titleEn : item.title)}</strong>
                            <small>${esc(item.location)} · ${esc(item.owner)}</small>
                          </div>
                        </div>
                      `
                        )
                        .join('')}
                    </div>

                    <div class="wano-io-grid">
                      <div class="wano-io-box">
                        <div class="wano-detail-subhead" style="margin-top:0;">${useEn ? 'Input Files' : '输入文件'}</div>
                        ${(st.inputs || [])
                          .map(
                            (f) => `
                          <button type="button" class="wano-io-file-btn" data-plan-file="${esc(f.name)}">
                            <span class="workspace-tag">${esc(f.format)}</span>
                            <span class="wano-io-file-name">${esc(f.name)}</span>
                            <small>${esc(f.source)}</small>
                          </button>
                        `
                          )
                          .join('')}
                      </div>
                      <div class="wano-io-box">
                        <div class="wano-detail-subhead" style="margin-top:0;">${useEn ? 'Output Files' : '输出文件'}</div>
                        ${(st.outputs || [])
                          .map(
                            (f) => `
                          <button type="button" class="wano-io-file-btn output" data-plan-file="${esc(f.name)}">
                            <span class="workspace-tag green">${esc(f.format)}</span>
                            <span class="wano-io-file-name">${esc(f.name)}</span>
                            <small>${esc(f.status)}</small>
                          </button>
                        `
                          )
                          .join('')}
                      </div>
                    </div>
                  </div>
                `
                    )
                    .join('')
                : `<div style="padding:36px 16px;text-align:center;color:var(--ink-3);font-size:12.5px;">${useEn ? 'No peer review stage scheduled on this date.' : '该日期暂无安排同行评审阶段，请点击 2026年11月内的日期查看。'}</div>`
            }
          </div>
        </div>

        <div class="panel-card" style="margin-bottom:14px;">
          <div class="panel-card-head">
            <div>
              <h3>${useEn ? 'Review Team Core Contacts (TL / Deputy TL / Assistant)' : '评估队核心联系人（队长 / 副队长 / 助理）'}</h3>
              <small>${useEn ? 'Primary leadership and coordination contacts for the peer review mission' : '负责同行评审全过程统筹、质量终审与电厂日程后勤接口'}</small>
            </div>
            <span class="workspace-tag blue">${roster.leaders.length} ${useEn ? 'Contacts' : '位核心联系人'}</span>
          </div>
          <div class="wano-leaders-grid">
            ${roster.leaders
              .map(
                (ld) => `
              <article class="wano-leader-card">
                <div style="display:flex;align-items:center;gap:11px;">
                  <span class="avatar" style="width:38px;height:38px;font-size:13px;">${esc(ld.initials)}</span>
                  <div style="min-width:0;flex:1;">
                    <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
                      <strong style="font-size:13.5px;">${esc(ld.name)}</strong>
                      <span class="workspace-tag ${ld.badgeCls}">${esc(useEn ? ld.roleEn : ld.role)}</span>
                    </div>
                    <span class="cell-sub">${esc(ld.org)}</span>
                  </div>
                </div>
                <div class="wano-contact-meta">
                  <div><strong>${useEn ? 'Office' : '办公/职责'}：</strong>${esc(ld.office)}</div>
                  <div><strong>${useEn ? 'Phone' : '联系电话'}：</strong>${esc(ld.phone)}</div>
                  <div><strong>${useEn ? 'Email' : '电子邮箱'}：</strong>${esc(ld.email)}</div>
                </div>
              </article>
            `
              )
              .join('')}
          </div>
        </div>

        <div class="panel-card" style="margin-bottom:14px;">
          <div class="panel-card-head">
            <div>
              <h3>${useEn ? 'Functional Area Assessors, Lead Assessors & Plant Counterparts' : '各领域评估员、主评估员与电厂侧配合人员'}</h3>
              <small>${useEn ? 'One-to-one pairing between WANO domain reviewers and station counterparts across PO&C areas' : '按 WANO PO&C 功能领域展示主评估员、领域评估员及对应电厂侧主对口与配合联系人'}</small>
            </div>
            <div style="display:flex;gap:6px;flex-wrap:wrap;">
              ${['all', 'OP', 'MA', 'EN', 'ER', 'RP', 'NSC']
                .map(
                  (a) => `<button type="button" class="perm-tab sm ${areaFilter === a ? 'active' : ''}" data-plan-area-filter="${a}">${a === 'all' ? (useEn ? 'All Areas' : '全部领域') : a}</button>`
                )
                .join('')}
            </div>
          </div>
          <div class="table-scroll">
            <table class="data-table">
              <thead>
                <tr>
                  <th style="width:14%;">${useEn ? 'PO&C Area' : '评估领域'}</th>
                  <th style="width:22%;">${useEn ? 'Lead Assessor' : '主评估员'}</th>
                  <th style="width:32%;">${useEn ? 'Domain Assessors' : '参与评估员'}</th>
                  <th style="width:32%;">${useEn ? 'Plant Counterparts' : '电厂侧配合人员'}</th>
                </tr>
              </thead>
              <tbody>
                ${filteredAreas
                  .map(
                    (row) => `
                  <tr>
                    <td><span class="workspace-tag blue" style="font-weight:600;">${esc(useEn ? row.areaEn : row.area)}</span></td>
                    <td>
                      <strong class="cell-title">${esc(row.leadAssessor.name)}</strong>
                      <span class="cell-sub">${esc(row.leadAssessor.org)}</span>
                      <span class="cell-sub">Tel: ${esc(row.leadAssessor.phone)}</span>
                    </td>
                    <td>
                      <div class="wano-member-stack">
                        ${row.assessors
                          .map(
                            (as) => `
                          <div class="wano-member-pill">
                            <strong>${esc(as.name)}</strong>
                            <span>${esc(as.org)} · ${esc(as.focus)}</span>
                          </div>
                        `
                          )
                          .join('')}
                      </div>
                    </td>
                    <td>
                      <div class="wano-member-stack">
                        ${row.plantCounterparts
                          .map(
                            (cp) => `
                          <div class="wano-member-pill ${cp.isPrimary ? 'primary-cp' : ''}">
                            <div style="display:flex;align-items:center;gap:6px;">
                              <strong>${esc(cp.name)}</strong>
                              ${cp.isPrimary ? `<span class="workspace-tag green" style="padding:1px 6px;font-size:10px;">${useEn ? 'Primary' : '主对口'}</span>` : ''}
                            </div>
                            <span>${esc(cp.title)} · ${esc(cp.dept)} · ${esc(cp.phone)}</span>
                          </div>
                        `
                          )
                          .join('')}
                      </div>
                    </td>
                  </tr>
                `
                  )
                  .join('')}
              </tbody>
            </table>
          </div>
        </div>

        <div class="dashboard-grid">
          <div class="panel-card">
            <div class="panel-card-head">
              <div>
                <h3>${useEn ? 'Interpreters (EN ↔ ZH)' : '评审翻译人员'}</h3>
                <small>${useEn ? 'Simultaneous & consecutive interpreters assigned by domain' : '负责现场观察、访谈同传/交传及双语 FACTs/AFI 术语校对'}</small>
              </div>
              <span class="workspace-tag purple">${roster.interpreters.length} ${useEn ? 'Staff' : '人'}</span>
            </div>
            <div class="wano-support-list">
              ${roster.interpreters
                .map(
                  (it) => `
                <div class="wano-support-item">
                  <span class="avatar" style="width:32px;height:32px;background:#eeebf5;color:var(--purple);">${esc(it.initials)}</span>
                  <div style="min-width:0;flex:1;">
                    <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
                      <strong style="font-size:13px;">${esc(it.name)}</strong>
                      <span class="workspace-tag purple">${esc(it.lang)}</span>
                    </div>
                    <div style="font-size:12px;color:var(--ink-2);margin-top:2px;">${useEn ? 'Assigned:' : '负责领域：'}${esc(it.area)} · ${esc(it.phone)}</div>
                    <span class="cell-sub">${esc(it.note)}</span>
                  </div>
                </div>
              `
                )
                .join('')}
            </div>
          </div>

          <div class="panel-card">
            <div class="panel-card-head">
              <div>
                <h3>${useEn ? 'Mission Observers' : '同行评审观察员'}</h3>
                <small>${useEn ? 'Peer plant and institute observers participating in daily briefings' : '参与全过程观摩与每日碰头会，促进跨基地同行评审能力传递'}</small>
              </div>
              <span class="workspace-tag green">${roster.observers.length} ${useEn ? 'Observers' : '人'}</span>
            </div>
            <div class="wano-support-list">
              ${roster.observers
                .map(
                  (ob) => `
                <div class="wano-support-item">
                  <span class="avatar" style="width:32px;height:32px;background:#e9f3ed;color:var(--green);">${esc(ob.initials)}</span>
                  <div style="min-width:0;flex:1;">
                    <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
                      <strong style="font-size:13px;">${esc(ob.name)}</strong>
                      <span class="workspace-tag green">${esc(ob.role)}</span>
                    </div>
                    <div style="font-size:12px;color:var(--ink-2);margin-top:2px;">${esc(ob.org)} · ${useEn ? 'Focus:' : '关注：'}${esc(ob.area)}</div>
                    <span class="cell-sub">${esc(ob.note)}</span>
                  </div>
                </div>
              `
                )
                .join('')}
            </div>
          </div>
        </div>
      </section>
    `;
  }

  // ==================== 2.6B WANO 同行评审：OE 与 SOER 审查中心（OKR 粉色 OE 主线） ====================
  function renderWanoOePage() {
    const useEn = state.wanoUiLang === 'en';
    const canLead = isWanoLeadOrAbove();

    const soerHtml = `
      <div class="panel-card" style="margin-bottom:14px;">
        <div class="panel-card-head">
          <div>
            <h3>${useEn ? 'SOER Performance-Based Review & Dashboard (263-Item Screening)' : 'SOER 审查与红/黄/绿评价看板（对照 263 条已有 SOER）'}</h3>
            <small>${useEn ? 'Evaluated against How-to-Review bullets; generates G-0-16 summary PPT/report and feeds ARP Focus Areas' : '依据 How to Review 对照 Bullet 进行红/绿/黄评价，自动生成 G-0-16 评审总结 PPT/报告并汇入 ARP'}</small>
          </div>
          <div class="heading-actions">
            ${canLead ? `<button type="button" class="primary sm" id="btn-wano-g016-ppt">${useEn ? 'Export G-0-16 Summary PPT' : '生成 G-0-16 评审总结 PPT'}</button>` : ''}
          </div>
        </div>
        <div class="table-scroll">
          <table class="data-table">
            <thead>
              <tr>
                <th style="width:14%;">SOER ID</th>
                <th style="width:26%;">${useEn ? 'Title' : '主题'}</th>
                <th style="width:12%;">${useEn ? 'Bullets Met' : 'Bullet 达标'}</th>
                <th style="width:12%;">${useEn ? 'PR Rating' : 'PR 评价'}</th>
                <th style="width:10%;">${useEn ? 'Matched Events' : '关联事件'}</th>
                <th style="width:26%;">${useEn ? 'Performance-Based Observation' : 'SOER 现场观察结论'}</th>
              </tr>
            </thead>
            <tbody>
              ${D.WANO_SOER_REVIEWS.map((row) => `
                <tr>
                  <td><strong class="cell-title">${esc(row.id)}</strong></td>
                  <td>${esc(row.title)}</td>
                  <td><strong>${row.bulletsMet} / ${row.bulletsTotal}</strong></td>
                  <td><span class="rag-pill ${row.rating}">${row.rating.toUpperCase()}</span></td>
                  <td>${row.matchedEvents} ${useEn ? 'events' : '起'}</td>
                  <td style="font-size:12px;color:var(--ink-2);">${esc(row.perfNote)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    const werHtml = `
      <div class="panel-card">
        <div class="panel-card-head">
          <div>
            <h3>${useEn ? 'Plant Event Reports & M01 2-Page WER Analysis (2026.9 OE)' : '电厂事件报告与 M01 2页 WER 改写分析（2026.9 OE）'}</h3>
            <small>${useEn ? 'Condenses 15–20p Root Cause into M01 2p WER (S/N/T/O level, Summary, Consequence, Corrective Action, WAC & PO&C primary/secondary tags)' : '将 15–20 页电厂根因报告按 M01 改写成 2 页 WER，自动提取关键词标签、主/次 PO&C 领域、System 与 WAC 码'}</small>
          </div>
          <button type="button" class="primary sm" id="btn-wano-gen-wer">${useEn ? '+ Convert Root Cause → 2p WER' : '＋ 根因报告转 M01 2页 WER'}</button>
        </div>
        <div class="table-scroll">
          <table class="data-table">
            <thead>
              <tr>
                <th style="width:13%;">WER / Level</th>
                <th style="width:30%;">${useEn ? 'Event Description & Source' : '事件描述与来源'}</th>
                <th style="width:15%;">PO&amp;C (Pri / Sec)</th>
                <th style="width:14%;">System / WAC</th>
                <th style="width:18%;">${useEn ? 'OE Keywords' : 'OE 关键词标签'}</th>
                <th style="width:10%;">${useEn ? 'OE Rating' : 'OE 评价'}</th>
              </tr>
            </thead>
            <tbody>
              ${state.wanoOeEvents.map((ev) => `
                <tr>
                  <td>
                    <strong class="cell-title">${esc(ev.id)}</strong>
                    <span class="workspace-tag purple" style="margin-top:4px;">Level ${esc(ev.level)}</span>
                  </td>
                  <td>
                    <strong class="cell-title" style="font-size:12.5px;">${esc(useEn ? ev.title : ev.titleZh)}</strong>
                    <span class="cell-sub">${esc(ev.sourceType)}</span>
                  </td>
                  <td>
                    <span class="workspace-tag blue">${esc(ev.pocPrimary)}</span>
                    <span class="workspace-tag">${esc(ev.pocSecondary)}</span>
                  </td>
                  <td>
                    <div style="font-size:12px;">${esc(ev.system)}</div>
                    <span class="cell-sub">${esc(ev.wacCode)}</span>
                  </td>
                  <td><div class="tag-list">${ev.keywords.map((k) => `<span class="workspace-tag">${esc(k)}</span>`).join('')}</div></td>
                  <td><span class="rag-pill ${ev.rating}">${ev.rating.toUpperCase()}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    return `
      <section class="workspace-island scrollable">
        <div class="workspace-page-heading">
          <div>
            <h1>${useEn ? 'OE & SOER Review Hub' : 'WANO OE 运行经验与 SOER 审查中心'}</h1>
            <p class="page-subtitle">${useEn ? 'Ingests plant A/B/C/D events, root cause reports & self-assessments into M01 WER, SOER Red/Yellow/Green review & ARP Focus Areas' : '汇集电厂事件报告、根因报告与自评估，输出 M01 WER、SOER 红绿黄审查及 OE 评价并驱动 ARP 领域评估计划'}</p>
          </div>
          <div class="heading-actions">
            <button type="button" class="ghost sm" id="btn-wano-oe-rpt">${useEn ? 'Export OE Feedback Report' : '生成经验反馈报告'}</button>
          </div>
        </div>
        <div class="perm-tabs">
          <button type="button" class="perm-tab ${state.wanoOeTab === 'soer' ? 'active' : ''}" data-wano-oetab="soer">${useEn ? 'SOER Review & Dashboard (Red/Yellow/Green)' : 'SOER 审查与红绿黄看板'}</button>
          <button type="button" class="perm-tab ${state.wanoOeTab === 'wer' ? 'active' : ''}" data-wano-oetab="wer">${useEn ? 'WER & OE Event Analysis (2026.9)' : 'WER 改写与 OE 事件分析'}</button>
        </div>
        ${state.wanoOeTab === 'soer' ? soerHtml : werHtml}
      </section>
    `;
  }

  // ==================== 2.6C WANO 同行评审：EPM 监测与 PPSE 报告（OKR 青色 EPM 主线） ====================
  function renderWanoEpmPage() {
    const useEn = state.wanoUiLang === 'en';
    const ppse = D.WANO_PPSE_SUMMARY;

    const piHtml = `
      <div class="epm-pi-grid">
        ${D.WANO_EPM_PIS.map((pi) => `
          <article class="epm-pi-card ${pi.light}">
            <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;">
              <strong style="font-size:12.5px;">${esc(pi.name)}</strong>
              <span class="rag-pill ${pi.light}">${pi.light.toUpperCase()}</span>
            </div>
            <div style="display:flex;align-items:baseline;gap:10px;">
              <span style="font-size:24px;font-weight:700;">${esc(pi.value)}</span>
              <span style="font-size:11.5px;color:var(--ink-3);">Target ${esc(pi.target)} · ${esc(pi.trend)}</span>
            </div>
            <div style="font-size:11.5px;color:var(--ink-2);line-height:1.5;padding-top:6px;border-top:1px dashed var(--line);">
              ${esc(pi.chain)}
            </div>
          </article>
        `).join('')}
      </div>
      <div class="panel-card">
        <div class="panel-card-head">
          <div>
            <h3>${useEn ? '3-Day Area Notes & Field Interview Synthesis' : '现场访谈与 3 天观察 Area Notes 汇总'}</h3>
            <small>${useEn ? 'Captures personnel interviews, field/meeting observations & MIP focus areas to support current performance & future trend assessment' : '记录 3 天现场观察、人员访谈、会议观察与文件审查，自动支撑当前绩效总结与未来趋势分析'}</small>
          </div>
          <button type="button" class="ghost sm" data-nav="workbench">${useEn ? 'Open FACTs Workbench →' : '前往 FACTs 工作台 →'}</button>
        </div>
        <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;">
          <div style="padding:12px;border:1px solid var(--line);border-radius:12px;background:#fafbfc;">
            <span class="workspace-tag blue">${useEn ? '(1) Current Performance' : '（1）当前绩效总结'}</span>
            <p style="font-size:12px;color:var(--ink-2);margin:8px 0 0;line-height:1.6;">${useEn ? 'Overall station safety performance stable; UCF 93.8% exceeds target, while UCL & ISA require causal follow-up.' : '电厂整体核安全绩效保持稳定；UCF 93.8% 优于目标值，UCL 与工业安全指标需结合原因链持续跟踪。'}</p>
          </div>
          <div style="padding:12px;border:1px solid var(--line);border-radius:12px;background:#fafbfc;">
            <span class="workspace-tag green">${useEn ? '(2) Supporting Info & MIP' : '（2）支撑信息与 MIP 关注'}</span>
            <p style="font-size:12px;color:var(--ink-2);margin:8px 0 0;line-height:1.6;">${useEn ? 'Strong simulator fidelity & radiation ALARA; MIP focus remains on OP.1 crew coaching and outage FME oversight.' : '模拟机培训保真度与辐射 ALARA 表现突出；MIP 重点聚焦 OP.1 班组现场指导与大修 FME 监督。'}</p>
          </div>
          <div style="padding:12px;border:1px solid var(--line);border-radius:12px;background:#fafbfc;">
            <span class="workspace-tag purple">${useEn ? '(3) Future Trend Analysis' : '（3）未来趋势分析'}</span>
            <p style="font-size:12px;color:var(--ink-2);margin:8px 0 0;line-height:1.6;"><strong>${useEn ? 'Org Effectiveness:' : '组织有效性：'}</strong> ${esc(ppse.orgEffectiveness)}<br/><strong>${useEn ? 'Workload:' : '工作负荷：'}</strong> ${esc(ppse.workload)}</p>
          </div>
        </div>
      </div>
    `;

    const aocHtml = `
      <div class="panel-card">
        <div class="panel-card-head">
          <div>
            <h3>${useEn ? 'Area of Concern (AOC) Registry — GDAR Rules & Effectiveness Review' : 'AOC 关注领域管理（电厂纠正行动转化 + GDAR 规则开发）'}</h3>
            <small>${useEn ? 'Converts effective plant corrective actions into standard AOCs or authors new AOC problem & impact statements via GDAR rules' : '评估已有电厂纠正行动有效性并转化为标准 AOC，或依据 GDAR 规则自动编写新 AOC 问题描述与影响分析'}</small>
          </div>
          ${isWanoLeadOrAbove() ? `<button type="button" class="primary sm" id="btn-wano-add-aoc">${useEn ? '+ Develop New AOC (GDAR)' : '＋ 按 GDAR 规则新建 AOC'}</button>` : ''}
        </div>
        <div class="table-scroll">
          <table class="data-table">
            <thead>
              <tr>
                <th style="width:13%;">AOC ID</th>
                <th style="width:28%;">${useEn ? 'Problem Statement' : 'AOC 问题描述'}</th>
                <th style="width:25%;">${useEn ? 'GDAR Impact Analysis' : 'GDAR 影响分析'}</th>
                <th style="width:18%;">${useEn ? 'Source' : '来源'}</th>
                <th style="width:16%;">${useEn ? 'Effectiveness' : '有效性评估'}</th>
              </tr>
            </thead>
            <tbody>
              ${state.wanoEpmAocs.map((a) => `
                <tr>
                  <td><strong class="cell-title">${esc(a.id)}</strong><span class="workspace-tag yellow" style="margin-top:4px;">${esc(a.priority)}</span></td>
                  <td><strong class="cell-title" style="font-size:12.5px;">${esc(a.title)}</strong><span class="cell-sub">${esc(a.area)}</span></td>
                  <td style="font-size:12px;color:var(--ink-2);">${esc(a.gdarImpact)}</td>
                  <td><span class="workspace-tag">${esc(a.source)}</span></td>
                  <td><span class="workspace-tag ${a.effectiveness.includes('Action') ? 'red' : 'blue'}">${esc(a.effectiveness)}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    const ppseHtml = `
      <div class="panel-card">
        <div class="panel-card-head">
          <div>
            <h3>${useEn ? 'PPSE Comprehensive Station Performance Report' : 'PPSE 综合绩效评估报告（汇聚 AMI + SOER + OE + PR）'}</h3>
            <small>${useEn ? 'Aggregates AMI, SOER, OE & PR inputs into executive Summary, MIP Support Plan, Top 3 AOCs & Plant Milestones' : '自动抽取 AMI、SOER、OE 与 PR 核心结论，生成 Summary、MIP 支持计划、Top 3 AOC 与电厂里程碑'}</small>
          </div>
          ${isWanoLeaderOrDeputy() ? `<button type="button" class="primary sm" id="btn-wano-export-ppse">${useEn ? 'Export PPSE Report (.docx)' : '导出 PPSE 报告 (.docx)'}</button>` : ''}
        </div>
        <div class="tag-list" style="margin-bottom:4px;">
          <span style="font-size:12px;color:var(--ink-2);">${useEn ? 'Aggregated Inputs:' : '汇聚数据源：'}</span>
          ${ppse.sourcesAggregated.map((s) => `<span class="workspace-tag blue">${esc(s)}</span>`).join('')}
        </div>
        <div class="dashboard-grid">
          <div style="padding:14px;border:1px solid var(--line);border-radius:12px;background:#fafbfc;display:flex;flex-direction:column;gap:8px;">
            <strong style="font-size:13px;">${useEn ? '1. SUMMARY &amp; Organization Trend' : '1. 综合摘要与组织趋势'}</strong>
            <div style="font-size:12.5px;color:var(--ink-2);line-height:1.65;">
              <div><strong>${useEn ? 'Org Effectiveness:' : '组织有效性：'}</strong> ${esc(ppse.orgEffectiveness)}</div>
              <div><strong>${useEn ? 'Personnel Proficiency:' : '人员熟练度：'}</strong> ${esc(ppse.proficiency)}</div>
              <div><strong>${useEn ? 'Station Workload:' : '电厂工作负荷：'}</strong> ${esc(ppse.workload)}</div>
            </div>
            <strong style="font-size:13px;margin-top:6px;">${useEn ? '2. MIP Support Plan' : '2. MIP 支持计划'}</strong>
            <div style="font-size:12.5px;color:var(--ink-2);">${esc(ppse.mipPlan)}</div>
          </div>
          <div style="padding:14px;border:1px solid var(--line);border-radius:12px;background:#fafbfc;display:flex;flex-direction:column;gap:8px;">
            <strong style="font-size:13px;">${useEn ? '3. Top 3 AOCs &amp; 4. Plant Milestones' : '3. Top 3 AOC 与 4. 电厂里程碑'}</strong>
            ${ppse.milestones.map((m) => `<div style="font-size:12.5px;color:var(--ink-2);padding:6px 10px;border-radius:8px;background:#fff;border:1px solid var(--line);">• ${esc(m)}</div>`).join('')}
          </div>
        </div>
      </div>
    `;

    return `
      <section class="workspace-island scrollable">
        <div class="workspace-page-heading">
          <div>
            <h1>${useEn ? 'EPM Performance Monitoring & PPSE' : 'WANO EPM 强化绩效监测与 PPSE'}</h1>
            <p class="page-subtitle">${useEn ? 'PI causal-chain analysis (Red/Yellow/Green), 3-day Area Notes, GDAR AOC development & integrated PPSE reporting' : '覆盖 PI 指标红黄绿灯原因链追踪、现场 3 天观察 Area Notes、GDAR 规则 AOC 开发及 PPSE 综合报告'}</p>
          </div>
        </div>
        <div class="perm-tabs">
          <button type="button" class="perm-tab ${state.wanoEpmTab === 'pi' ? 'active' : ''}" data-wano-epmtab="pi">${useEn ? 'PI Indicators & Area Notes' : 'PI 指标与 Area Notes'}</button>
          <button type="button" class="perm-tab ${state.wanoEpmTab === 'aoc' ? 'active' : ''}" data-wano-epmtab="aoc">${useEn ? 'AOC Registry (GDAR)' : 'AOC 关注领域（GDAR）'}</button>
          <button type="button" class="perm-tab ${state.wanoEpmTab === 'ppse' ? 'active' : ''}" data-wano-epmtab="ppse">${useEn ? 'PPSE Integrated Report' : 'PPSE 综合报告'}</button>
        </div>
        ${state.wanoEpmTab === 'pi' ? piHtml : state.wanoEpmTab === 'aoc' ? aocHtml : ppseHtml}
      </section>
    `;
  }

  // ==================== 2.7 WANO 专家视角：物理隔离脱敏导入导出（PR/PSUR 离场后报告编写与经验沉淀） ====================
  function renderWanoExchangePage() {
    const useEn = state.wanoUiLang === 'en';
    const r = state.wanoSanitizeRules;
    const activePlant = D.WANO_PLANT_MATRIX.find((p) => p.id === state.wanoCurrentPlantId) || D.WANO_PLANT_MATRIX[0];
    const sampleWeakness = activePlant.weaknesses[0] || 'OP.1 MCR shift turnover readback rigor';
    const rawSample =
      `Plant: ${activePlant.realName} (${activePlant.missionType})\n` +
      'Interviewee: Shift Supervisor Zhang Wei (张伟, ID #102938, Tel 138-0011-9921)\n' +
      'Equipment: 1RCP001PO Vibration Trend Alarm & Work Order WO-2026-88412\n' +
      `Observation Conclusion: Field observation & interview confirmed gap in ${sampleWeakness} against WANO PO&C.`;

    const sanitizedSample =
      `Plant: ${r.anonPlant ? `[${activePlant.anonCode.toUpperCase()}]` : activePlant.realName}\n` +
      `Interviewee: ${r.redactPeople ? '[ROLE: Shift Supervisor · PII REDACTED]' : 'Shift Supervisor Zhang Wei (张伟, ID #102938, Tel 138-0011-9921)'}\n` +
      `Equipment: ${r.maskKks ? '[SYSTEM: RCP-PUMP-XX · WO-REDACTED]' : '1RCP001PO Vibration Trend Alarm & Work Order WO-2026-88412'}\n` +
      `Observation Conclusion: Field observation & interview confirmed gap in ${sampleWeakness}${r.keepPoc ? ' [Criteria Preserved: WANO PO&C]' : ''}.`;

    return `
      <section class="workspace-island scrollable">
        <div class="workspace-page-heading">
          <div>
            <h1>${useEn ? 'Air-Gapped Sanitized Import & Export (PR / PSUR)' : '物理隔离脱敏导入导出（PR / PSUR 离场后协作）'}</h1>
            <p class="page-subtitle">${
              useEn
                ? 'Plant intranet OBS/AFI data cannot traverse the public internet. Export sanitized observation & interview conclusions for offline post-PR report authoring and OE distillation.'
                : '电厂内网编写的 OBS/AFI 数据无法接入公网；支持按规则自动脱敏导出，离场后导入本地/WANO 环境继续报告编写与经验沉淀'
            }</p>
          </div>
          <div class="heading-actions">
            <button type="button" class="ghost" id="btn-wano-import-sim">${useEn ? '↑ Import Sanitized Package' : '↑ 导入脱敏包继续编写'}</button>
            <button type="button" class="primary" id="btn-wano-export-pkg">${useEn ? '↓ Export Sanitized PR/PSUR Package' : '↓ 导出脱敏 PR/PSUR 数据包'}</button>
          </div>
        </div>

        <div class="wano-pipeline-strip">
          <div class="wano-step-card">
            <span class="workspace-tag blue">Step 1</span>
            <strong>${useEn ? 'On-Site Plant Intranet' : '电厂内网现场评审'}</strong>
            <small>${useEn ? 'Capture OBS facts, MCR/field interviews & draft AFIs inside isolated intranet.' : '在物理隔离内网中记录现场观察、访谈结论与 AFI 初稿。'}</small>
          </div>
          <div class="wano-step-card">
            <span class="workspace-tag yellow">Step 2</span>
            <strong>${useEn ? 'Automated Sanitization' : '自动脱敏与哈希校验'}</strong>
            <small>${useEn ? 'Strip plant names, employee PII, phone/IDs & internal KKS/WO numbers while keeping PO&C conclusions.' : '自动剥离电厂名、人员姓名工号、精确 KKS/工单号，完整保留结论与 PO&C 条款。'}</small>
          </div>
          <div class="wano-step-card">
            <span class="workspace-tag purple">Step 3</span>
            <strong>${useEn ? 'Offline Media Transfer' : '离线介质安全带出'}</strong>
            <small>${useEn ? 'Export signed .json sanitized bundle approved by plant security review.' : '经电厂保密审查后导出签名脱敏包（.json），不经公网传输。'}</small>
          </div>
          <div class="wano-step-card">
            <span class="workspace-tag green">Step 4</span>
            <strong>${useEn ? 'Post-PR Authoring & OE' : '离场报告编写与 OE 沉淀'}</strong>
            <small>${useEn ? 'Import into WANO Bilingual Workbench to finalize PR/PSUR report & distill fleet OE.' : '导入 WANO 双语工作台继续撰写正式报告并沉淀共性运行经验。'}</small>
          </div>
        </div>

        <div class="panel-card" style="margin-bottom:14px;">
          <div class="panel-card-head">
            <div>
              <h3>${useEn ? 'Sanitization Policy & Live Redaction Preview' : '脱敏规则配置与实时对比预览'}</h3>
              <small>${useEn ? 'Toggle rules below to verify what is stripped before exporting from plant intranet' : '勾选脱敏策略，实时预览导出前后的敏感信息擦除效果'}</small>
            </div>
            <span class="workspace-tag green">${useEn ? 'Zero PII · Zero Intranet Identifiers' : '零个人隐私 · 零内网敏感标识'}</span>
          </div>
          <div class="clean-rules-row">
            <label class="rule-chip"><input type="checkbox" data-wano-rule="anonPlant" ${r.anonPlant ? 'checked' : ''} /> ${useEn ? 'Anonymize Plant / Unit Names (Plant-A)' : '电厂/机组名称匿名化（Plant-A）'}</label>
            <label class="rule-chip"><input type="checkbox" data-wano-rule="redactPeople" ${r.redactPeople ? 'checked' : ''} /> ${useEn ? 'Redact Staff Names, IDs & Phones' : '擦除人员姓名、工号与联系方式'}</label>
            <label class="rule-chip"><input type="checkbox" data-wano-rule="maskKks" ${r.maskKks ? 'checked' : ''} /> ${useEn ? 'Mask Internal KKS & Work Order IDs' : '掩码内部 KKS 编码与工单号'}</label>
            <label class="rule-chip"><input type="checkbox" data-wano-rule="keepPoc" ${r.keepPoc ? 'checked' : ''} /> ${useEn ? 'Preserve PO&C Criteria & Interview Conclusions' : '保留 PO&C 准则与观察访谈结论'}</label>
          </div>
          <div class="clean-compare-grid">
            <div>
              <strong style="display:block;font-size:12px;color:var(--red);margin-bottom:6px;">${useEn ? 'Raw On-Site Intranet OBS / Interview (Restricted)' : '电厂内网原始观察与访谈记录（严禁出网）'}</strong>
              <div class="clean-box">${esc(rawSample)}</div>
            </div>
            <div>
              <strong style="display:block;font-size:12px;color:var(--green);margin-bottom:6px;">${useEn ? 'Sanitized Outbound Payload (Safe for Post-PR Authoring)' : '脱敏后可导出内容（用于离场后报告编写与经验沉淀）'}</strong>
              <div class="clean-box after">${esc(sanitizedSample)}</div>
            </div>
          </div>
        </div>

        <div class="panel-card">
          <div class="panel-card-head">
            <div>
              <h3>${useEn ? 'Sanitized Package Import / Export Audit Log' : '脱敏数据包导入导出审计台账'}</h3>
              <small>${useEn ? 'Full traceability of every offline package exported from plants or imported for post-PR authoring' : '记录每次离场脱敏导出与导入继续编写的脱敏项数量与操作人'}</small>
            </div>
            <input type="file" id="wano-import-file" accept=".json" style="display:none;" />
            <button type="button" class="ghost sm" id="btn-wano-upload-json">${useEn ? 'Upload Local .json Package' : '选择本地 .json 脱敏包'}</button>
          </div>
          <div class="table-scroll">
            <table class="data-table">
              <thead>
                <tr>
                  <th>${useEn ? 'Package ID' : '数据包编号'}</th>
                  <th>${useEn ? 'Direction' : '流转方向'}</th>
                  <th>${useEn ? 'Mission / Scope' : '评审任务与范围'}</th>
                  <th>${useEn ? 'Contents' : '包含内容'}</th>
                  <th>${useEn ? 'Redacted Items' : '脱敏项数'}</th>
                  <th>${useEn ? 'Operator & Time' : '操作人 / 时间'}</th>
                  <th>${useEn ? 'Status' : '状态'}</th>
                </tr>
              </thead>
              <tbody>
                ${state.wanoSanitizationLogs
                  .map(
                    (log) => `
                  <tr>
                    <td><strong class="cell-title">${esc(log.id)}</strong></td>
                    <td><span class="workspace-tag ${log.direction.includes('Import') ? 'purple' : 'blue'}">${esc(log.direction)}</span></td>
                    <td>${esc(log.mission)}</td>
                    <td>${esc(log.docs)}</td>
                    <td><strong>${log.redactedItems}</strong> items</td>
                    <td>${esc(log.operator)}<span class="cell-sub">${esc(log.time)}</span></td>
                    <td><span class="proj-flag done">Verified</span></td>
                  </tr>
                `
                  )
                  .join('')}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    `;
  }

  // ==================== 3. 租户管理（超级管理员） ====================
  function renderTenantsPage() {
    const list = state.tenants.filter((t) => state.globalTenant === 'all' || t.id === state.globalTenant);

    return `
      <section class="workspace-island">
        <div class="workspace-page-heading">
          <div>
            <h1>租户管理</h1>
            <p class="page-subtitle">支持管理员按电厂/基地租户独立配置启用的智能体、模型配额，以及按行业标准、运行经验、电厂程序选择 AFI 准则与程序文件</p>
          </div>
          <div class="heading-actions">
            <button type="button" class="primary" id="btn-new-tenant">＋ 新增租户</button>
          </div>
        </div>

        <div class="table-scroll">
          <table class="data-table">
            <thead>
              <tr>
                <th style="width:18%;">租户名称 / 编码</th>
                <th style="width:18%;">已启用智能体</th>
                <th style="width:26%;">准则 & 程序文件配置（行业标准 / 运行经验 / 电厂程序）</th>
                <th style="width:10%;">项目 / 用户</th>
                <th style="width:10%;">状态</th>
                <th style="width:18%;">操作</th>
              </tr>
            </thead>
            <tbody>
              ${list
                .map((t) => {
                  const enabledAgents = D.AGENT_CATALOG.filter((ag) => t.agents[ag.id]?.enabled);
                  const selectedCriteria = D.CRITERIA_CATALOG.filter((c) => t.criteriaIds.includes(c.id));
                  const highCount = selectedCriteria.filter((c) => c.tier === 'high').length;
                  const midCount = selectedCriteria.filter((c) => c.tier === 'mid').length;
                  const lowCount = selectedCriteria.filter((c) => c.tier === 'low').length;
                  return `
                  <tr>
                    <td>
                      <strong class="cell-title">${esc(t.name)}</strong>
                      <span class="cell-sub">${esc(t.code)} · ${esc(t.region)}</span>
                    </td>
                    <td>
                      <div class="tag-list">
                        <span class="workspace-tag purple">${enabledAgents.length} / ${D.AGENT_CATALOG.length} 已启用</span>
                        ${enabledAgents
                          .slice(0, 2)
                          .map((a) => `<span class="workspace-tag">${esc(a.name.replace('智能体', ''))}</span>`)
                          .join('')}
                      </div>
                    </td>
                    <td>
                      <div class="tag-list">
                        <span class="workspace-tag blue">行业标准 ${highCount}</span>
                        <span class="workspace-tag yellow">运行经验 ${midCount}</span>
                        <span class="workspace-tag green">电厂程序 ${lowCount}</span>
                      </div>
                      <span class="cell-sub">共 ${selectedCriteria.length} 份生效准则与程序文件</span>
                    </td>
                    <td>${t.projectsCount} 项目 · ${t.usersCount} 人</td>
                    <td>
                      <div class="switch-inline">
                        <button type="button" class="perm-switch ${t.status === 'active' ? 'on' : ''}" data-toggle-tenant="${t.id}" aria-label="切换租户状态">
                          <span class="perm-switch-knob"></span>
                        </button>
                        <span>${t.status === 'active' ? '启用' : '停用'}</span>
                      </div>
                    </td>
                    <td>
                      <div class="action-links">
                        <button type="button" class="workspace-text-button primary-link" data-config-tenant="${t.id}" data-config-tab="agents">配置智能体</button>
                        <button type="button" class="workspace-text-button primary-link" data-config-tenant="${t.id}" data-config-tab="criteria">准则 & 程序</button>
                      </div>
                    </td>
                  </tr>
                `;
                })
                .join('')}
            </tbody>
          </table>
        </div>
        <div class="table-footer">
          <span>共 ${list.length} 个租户</span>
          <span>租户级智能体与准则变更保存后即时生效</span>
        </div>
      </section>
    `;
  }

  function openTenantConfigDrawer(tenantId, initialTab = 'agents') {
    const tenant = state.tenants.find((t) => t.id === tenantId);
    if (!tenant) return;
    let activeTab = initialTab;
    const draftAgents = JSON.parse(JSON.stringify(tenant.agents));
    const draftCriteria = new Set(tenant.criteriaIds);

    function renderDrawer() {
      const highList = D.CRITERIA_CATALOG.filter((c) => c.tier === 'high');
      const midList = D.CRITERIA_CATALOG.filter((c) => c.tier === 'mid');
      const lowList = D.CRITERIA_CATALOG.filter((c) => c.tier === 'low');
      const totalClauses = D.CRITERIA_CATALOG.filter((c) => draftCriteria.has(c.id)).reduce((acc, c) => acc + c.clauses, 0);

      const agentsHtml = `
        <p style="margin:0;font-size:12.5px;color:var(--ink-2);">
          配置「${esc(tenant.name)}」可调用的智能体、底层内网推理模型与单日配额。关闭后，该租户下的所有项目与文档工作台将隐藏对应智能体入口。
        </p>
        <div class="tenant-config-grid">
          ${D.AGENT_CATALOG.map((ag) => {
            const cfg = draftAgents[ag.id] || { enabled: false, model: ag.defaultModel, quota: ag.defaultQuota };
            return `
              <div class="agent-config-card ${cfg.enabled ? 'enabled' : ''}">
                <div class="agent-config-head">
                  <div style="display:flex;gap:10px;align-items:flex-start;">
                    <span class="agent-icon-badge">✦</span>
                    <div>
                      <strong style="font-size:13.5px;">${esc(ag.name)}</strong>
                      <span class="cell-sub" style="line-height:1.5;">${esc(ag.desc)}</span>
                    </div>
                  </div>
                  <button type="button" class="perm-switch ${cfg.enabled ? 'on' : ''}" data-draft-agent-toggle="${ag.id}">
                    <span class="perm-switch-knob"></span>
                  </button>
                </div>
                <div class="tag-list">
                  ${ag.tools.map((tool) => `<span class="workspace-tag">${esc(tool)}</span>`).join('')}
                </div>
                <div class="agent-meta-row">
                  <div class="field-group">
                    <label>绑定推理模型</label>
                    <select data-draft-agent-model="${ag.id}" ${cfg.enabled ? '' : 'disabled'}>
                      <option value="Qwen2.5-72B-Instruct（内网版）" ${cfg.model.includes('Qwen') ? 'selected' : ''}>Qwen2.5-72B-Instruct（内网版）</option>
                      <option value="DeepSeek-R1-70B（内网版）" ${cfg.model.includes('DeepSeek') ? 'selected' : ''}>DeepSeek-R1-70B（内网版）</option>
                    </select>
                  </div>
                  <div class="field-group">
                    <label>日调用配额</label>
                    <input type="number" min="100" step="100" value="${cfg.quota}" data-draft-agent-quota="${ag.id}" ${cfg.enabled ? '' : 'disabled'} />
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;

      const renderTierColumn = (title, badgeText, badgeClass, headClass, hint, items) => `
        <div class="priority-tier-card">
          <div class="priority-tier-head ${headClass}">
            <div>
              <strong style="font-size:13px;">${title}</strong>
              <span class="cell-sub">${hint}</span>
            </div>
            <span class="priority-badge ${badgeClass}">${badgeText}</span>
          </div>
          <div class="priority-tier-body">
            ${items
              .map((c) => {
                const checked = draftCriteria.has(c.id);
                return `
                <label class="criteria-check-item ${checked ? 'checked' : ''}">
                  <input type="checkbox" data-draft-criteria="${c.id}" ${checked ? 'checked' : ''} />
                  <div class="criteria-item-copy">
                    <strong>${esc(c.name)}</strong>
                    <div class="tag-list" style="margin-top:4px;">
                      <span class="workspace-tag">${esc(c.category)}</span>
                      <span class="workspace-tag">${esc(c.version)}</span>
                      <span class="workspace-tag">${c.clauses} 条</span>
                    </div>
                    <small>${esc(c.desc)}</small>
                  </div>
                </label>
              `;
              })
              .join('')}
          </div>
        </div>
      `;

      const criteriaHtml = `
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;padding:11px 14px;border-radius:12px;background:#f5f7fa;border:1px solid var(--line);">
          <div style="font-size:12.5px;color:var(--ink-2);">
            <strong>AFI 准则分类配置：</strong>行业标准（IEEE、PO&C、研究院） · 运行经验（SOER/SER、良好实践） · 电厂程序（BDX 同步 → 公司、电厂）
          </div>
          <span class="workspace-tag green">已选 ${draftCriteria.size} 份 · 共 ${totalClauses.toLocaleString()} 条有效条文</span>
        </div>
        <div class="priority-tiers">
          ${renderTierColumn('行业标准', '行业标准', 'high', 'tier-high', 'IEEE · PO&C · 研究院', highList)}
          ${renderTierColumn('运行经验', '运行经验', 'mid', 'tier-mid', 'SOER / SER · 良好实践', midList)}
          ${renderTierColumn('电厂程序', '电厂程序', 'low', 'tier-low', 'BDX 同步 → 公司、电厂', lowList)}
        </div>
      `;

      openModal(
        `
        <div class="modal-head">
          <div>
            <h2>租户配置 · ${esc(tenant.name)}</h2>
            <span class="cell-sub">${esc(tenant.code)} · ${esc(tenant.region)} · 管理员：${esc(tenant.admin)}</span>
          </div>
          <button type="button" class="modal-close" data-modal-close aria-label="关闭">×</button>
        </div>
        <div class="modal-body">
          <div class="perm-tabs" style="margin-bottom:4px;padding-bottom:12px;">
            <button type="button" class="perm-tab ${activeTab === 'agents' ? 'active' : ''}" data-drawer-tab="agents">智能体配置</button>
            <button type="button" class="perm-tab ${activeTab === 'criteria' ? 'active' : ''}" data-drawer-tab="criteria">准则 & 程序文件选择</button>
          </div>
          ${activeTab === 'agents' ? agentsHtml : criteriaHtml}
        </div>
        <div class="modal-foot">
          <button type="button" class="ghost" data-modal-close>取消</button>
          <button type="button" class="primary" id="btn-save-tenant-config">保存租户配置</button>
        </div>
      `,
        { drawer: true }
      );

      modalRoot.querySelectorAll('[data-drawer-tab]').forEach((btn) => {
        btn.addEventListener('click', () => {
          activeTab = btn.dataset.drawerTab;
          renderDrawer();
        });
      });
      modalRoot.querySelectorAll('[data-draft-agent-toggle]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = btn.dataset.draftAgentToggle;
          draftAgents[id] = draftAgents[id] || { enabled: false, model: D.AGENT_CATALOG.find((a) => a.id === id).defaultModel, quota: 1000 };
          draftAgents[id].enabled = !draftAgents[id].enabled;
          renderDrawer();
        });
      });
      modalRoot.querySelectorAll('[data-draft-agent-model]').forEach((sel) => {
        sel.addEventListener('change', () => { draftAgents[sel.dataset.draftAgentModel].model = sel.value; });
      });
      modalRoot.querySelectorAll('[data-draft-agent-quota]').forEach((inp) => {
        inp.addEventListener('change', () => { draftAgents[inp.dataset.draftAgentQuota].quota = Number(inp.value) || 500; });
      });
      modalRoot.querySelectorAll('[data-draft-criteria]').forEach((chk) => {
        chk.addEventListener('change', () => {
          const id = chk.dataset.draftCriteria;
          if (chk.checked) draftCriteria.add(id);
          else draftCriteria.delete(id);
          renderDrawer();
        });
      });
      modalRoot.querySelector('#btn-save-tenant-config').addEventListener('click', () => {
        tenant.agents = draftAgents;
        tenant.criteriaIds = Array.from(draftCriteria);
        tenant.updatedAt = '2026-11-19 18:20';
        closeModal();
        render();
        showToast(`已保存「${tenant.name}」的智能体与准则程序配置`);
      });
    }

    renderDrawer();
  }

  // ==================== 4. 知识库管理（租户管理员） ====================
  function renderKnowledgePage() {
    const pendingCleanCount = state.kbDocs.filter((d) => d.status === 'pending' || d.status === 'review').length;
    const pendingQaCount = state.kbQas.filter((q) => q.status === 'pending').length;

    let bodyHtml = '';

    if (state.kbTab === 'sources') {
      bodyHtml = `
        <div class="kb-topology-banner">
          <div class="topology-box">
            <div class="topology-box-title">
              <span>OBS 涉及来源（7 大接入通道）</span>
              <span class="workspace-tag blue">外部系统 + 线下</span>
            </div>
            <div class="topology-flow">
              <span class="workspace-tag">iOA（会议纪要）</span>
              <span class="workspace-tag">ECM（会议纪要、自评估报告）</span>
              <span class="workspace-tag">人因管理系统（观察指导、SER、SOER、WER）</span>
              <span class="workspace-tag">工单系统</span>
              <span class="workspace-tag">领导待办</span>
              <span class="workspace-tag">状态报告（报告）</span>
              <span class="workspace-tag green">线下（观察、访谈）</span>
            </div>
          </div>
          <div class="topology-box">
            <div class="topology-box-title">
              <span>AFI 准则体系（三类标准来源）</span>
              <span class="workspace-tag purple">行业标准 · 运行经验 · 电厂程序</span>
            </div>
            <div class="topology-flow">
              <span class="workspace-tag blue">行业标准：IEEE、PO&C、研究院</span>
              <span>→</span>
              <span class="workspace-tag yellow">运行经验：SOER / SER / 良好实践</span>
              <span>→</span>
              <span class="workspace-tag green">电厂程序：BDX 标准程序（公司、电厂）</span>
            </div>
          </div>
        </div>

        <div class="kb-source-grid">
          ${state.kbSources
            .map((s) => {
              const isSyncing = state.syncingSourceId === s.id;
              return `
              <article class="kb-source-card ${s.mode === 'offline' ? 'offline-card' : ''}">
                <div class="kb-source-top">
                  <div>
                    <div class="kb-source-name">${esc(s.name)}</div>
                    <span class="cell-sub">${esc(s.usage)}</span>
                  </div>
                  <span class="proj-flag ${isSyncing ? 'active' : 'done'}">${isSyncing ? '同步中…' : s.mode === 'offline' ? '手动导入' : '已连接'}</span>
                </div>
                <div class="tag-list">
                  ${s.dataTypes.map((dt) => `<span class="workspace-tag">${esc(dt)}</span>`).join('')}
                </div>
                <div style="font-size:11.5px;color:var(--ink-2);">${esc(s.schedule)}</div>
                <div class="kb-source-meta">
                  <span>已入库 <strong>${s.docsCount.toLocaleString()}</strong> 份</span>
                  <span>最近：${esc(s.lastSync.slice(5))}</span>
                </div>
                <div style="display:flex;gap:8px;margin-top:2px;">
                  ${
                    s.mode === 'offline'
                      ? `<button type="button" class="primary sm" style="flex:1;" id="btn-kb-offline-upload-card">上传线下文档</button>`
                      : `<button type="button" class="ghost sm" style="flex:1;" data-sync-source="${s.id}" ${isSyncing ? 'disabled' : ''}>${isSyncing ? '正在同步…' : '立即同步'}</button>
                         <button type="button" class="ghost sm" data-config-source="${s.id}">连接配置</button>`
                  }
                </div>
              </article>
            `;
            })
            .join('')}
        </div>
      `;
    } else if (state.kbTab === 'cleaning') {
      const f = state.kbDocFilters;
      const docs = state.kbDocs.filter((d) => {
        if (state.globalTenant !== 'all' && d.tenantId !== 'all' && d.tenantId !== state.globalTenant) return false;
        if (f.source !== 'all' && d.sourceId !== f.source) return false;
        if (f.status !== 'all' && d.status !== f.status) return false;
        if (f.keyword && !`${d.title} ${d.dataType} ${d.sourceName}`.toLowerCase().includes(f.keyword.toLowerCase())) return false;
        return true;
      });

      bodyHtml = `
        <div class="filter-bar">
          <div class="field-group" style="width:180px;">
            <label>数据来源</label>
            <select id="kbd-source">
              <option value="all">全部数据源</option>
              ${state.kbSources.map((s) => `<option value="${s.id}" ${f.source === s.id ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}
            </select>
          </div>
          <div class="field-group" style="width:140px;">
            <label>清洗状态</label>
            <select id="kbd-status">
              <option value="all">全部状态</option>
              <option value="done" ${f.status === 'done' ? 'selected' : ''}>已入库</option>
              <option value="review" ${f.status === 'review' ? 'selected' : ''}>需人工复核</option>
              <option value="cleaning" ${f.status === 'cleaning' ? 'selected' : ''}>清洗中</option>
              <option value="pending" ${f.status === 'pending' ? 'selected' : ''}>待清洗</option>
            </select>
          </div>
          <div class="field-group" style="flex:1;min-width:200px;max-width:320px;">
            <label>文档检索</label>
            <input id="kbd-keyword" type="text" placeholder="搜索文档名称、类型" value="${esc(f.keyword)}" />
          </div>
          <button type="button" class="primary sm" id="btn-batch-clean">一键清洗全部待处理</button>
        </div>

        <div class="table-scroll">
          <table class="data-table">
            <thead>
              <tr>
                <th style="width:28%;">知识文档名称</th>
                <th style="width:15%;">数据源 / 类型</th>
                <th style="width:15%;">归属用途 / 准则分类</th>
                <th style="width:11%;">切片 / QA 数</th>
                <th style="width:11%;">清洗状态</th>
                <th style="width:20%;">操作</th>
              </tr>
            </thead>
            <tbody>
              ${docs
                .map(
                  (d) => `
                <tr>
                  <td>
                    <strong class="cell-title">${esc(d.title)}</strong>
                    <span class="cell-sub">${esc(getTenantName(d.tenantId))} · 更新于 ${esc(d.updatedAt)}</span>
                  </td>
                  <td>
                    <div>${esc(d.sourceName)}</div>
                    <span class="cell-sub">${esc(d.dataType)}</span>
                  </td>
                  <td>
                    <div class="tag-list">
                      <span class="workspace-tag ${d.usage.includes('AFI') ? 'purple' : 'blue'}">${esc(d.usage)}</span>
                      ${d.priority !== '—' ? `<span class="workspace-tag ${d.priority === '行业标准' ? 'blue' : d.priority === '运行经验' ? 'yellow' : 'green'}">${esc(d.priority)}</span>` : ''}
                    </div>
                  </td>
                  <td>${d.chunks} 切片 · ${d.qaCount} QA</td>
                  <td><span class="proj-flag ${statusClass(d.status)}">${d.status === 'done' ? '已入库' : statusLabel(d.status)}</span></td>
                  <td>
                    <div class="action-links">
                      <button type="button" class="workspace-text-button primary-link" data-open-clean="${d.id}">清洗与切片预览</button>
                      ${d.status !== 'done' ? `<button type="button" class="workspace-text-button" data-quick-clean="${d.id}">立即清洗入库</button>` : ''}
                    </div>
                  </td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
        </div>
      `;
    } else {
      const qas = state.kbQas.filter((q) => state.kbQaFilter === 'all' || q.status === state.kbQaFilter);
      bodyHtml = `
        <div class="kb-qa-layout">
          <div style="display:flex;flex-direction:column;min-height:0;">
            <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px;">
              <div style="display:flex;gap:6px;">
                ${[
                  { id: 'all', label: `全部问答 (${state.kbQas.length})` },
                  { id: 'pending', label: `待审核 (${pendingQaCount})` },
                  { id: 'accepted', label: '已采纳' }
                ]
                  .map((t) => `<button type="button" class="perm-tab sm ${state.kbQaFilter === t.id ? 'active' : ''}" data-qa-filter="${t.id}">${t.label}</button>`)
                  .join('')}
              </div>
              <button type="button" class="ghost sm" id="btn-add-qa">＋ 人工新增问答对</button>
            </div>

            <div class="table-scroll" style="border:1px solid var(--line);border-radius:14px;">
              <table class="data-table">
                <thead>
                  <tr>
                    <th style="width:48%;">标准问题与清洗答案</th>
                    <th style="width:20%;">来源与领域</th>
                    <th style="width:14%;">状态</th>
                    <th style="width:18%;">操作</th>
                  </tr>
                </thead>
                <tbody>
                  ${qas
                    .map(
                      (q) => `
                    <tr>
                      <td>
                        <strong class="cell-title">${esc(q.question)}</strong>
                        <div class="clamp-2" style="margin-top:4px;font-size:12px;">${esc(q.answer)}</div>
                      </td>
                      <td>
                        <span class="workspace-tag">${esc(q.sourceSystem)}</span>
                        <span class="cell-sub">${esc(q.area)} · 置信度 ${Math.round(q.confidence * 100)}%</span>
                      </td>
                      <td><span class="proj-flag ${statusClass(q.status)}">${statusLabel(q.status)}</span></td>
                      <td>
                        <div class="action-links">
                          ${
                            q.status !== 'accepted'
                              ? `<button type="button" class="workspace-text-button primary-link" data-accept-qa="${q.id}">采纳</button>`
                              : ''
                          }
                          <button type="button" class="workspace-text-button" data-edit-qa="${q.id}">编辑</button>
                        </div>
                      </td>
                    </tr>
                  `
                    )
                    .join('')}
                </tbody>
              </table>
            </div>
          </div>

          <div class="qa-tester-card">
            <div class="qa-tester-head">
              <div>
                <strong style="font-size:13.5px;">知识库检索与问答测试台</strong>
                <span class="cell-sub">双路召回（KKS/程序编号精确匹配 + 向量重排）</span>
              </div>
              <select id="kb-qa-scope" style="height:30px;padding:0 8px;border:1px solid var(--line);border-radius:8px;font-size:12px;">
                <option value="all" ${state.kbQaScope === 'all' ? 'selected' : ''}>全部知识库</option>
                <option value="obs" ${state.kbQaScope === 'obs' ? 'selected' : ''}>仅 OBS 涉及来源</option>
                <option value="afi" ${state.kbQaScope === 'afi' ? 'selected' : ''}>仅 AFI 准则库</option>
              </select>
            </div>
            <div class="qa-tester-messages" id="qa-messages-box">
              ${state.kbTestMessages
                .map(
                  (m, idx) => `
                <div class="qa-bubble ${m.role}">
                  <div>${esc(m.text)}</div>
                  ${
                    m.cites && m.cites.length
                      ? `
                    <div class="qa-cite-list">
                      ${m.cites
                        .map(
                          (c) => `
                        <div class="qa-cite-item">
                          <span>[${esc(c.source)}] ${esc(c.doc)}</span>
                          <span class="workspace-tag ${c.tier === '高' ? 'blue' : c.tier === '中' ? 'yellow' : 'green'}">${esc(c.tier)} · ${c.score}</span>
                        </div>
                      `
                        )
                        .join('')}
                      <div style="margin-top:4px;display:flex;justify-content:flex-end;">
                        <button type="button" class="workspace-text-button primary-link" style="font-size:11.5px;" data-adopt-msg="${idx}">＋ 采纳为清洗标准问答</button>
                      </div>
                    </div>
                  `
                      : ''
                  }
                </div>
              `
                )
                .join('')}
            </div>
            <div class="qa-tester-input">
              <div class="qa-presets">
                <button type="button" class="qa-preset-btn" data-preset-q="主控室交接班对报警复诵的最高标准是什么？">主控室交接班最高标准</button>
                <button type="button" class="qa-preset-btn" data-preset-q="防异物（FME）管控在 ECM 与工单中有哪些偏差？">ECM/工单防异物偏差</button>
                <button type="button" class="qa-preset-btn" data-preset-q="人因系统 SER/WER 对口头确认代替规程打勾的建议？">人因系统 SER 建议</button>
              </div>
              <form class="qa-input-row" id="qa-test-form">
                <input id="qa-test-input" type="text" placeholder="输入核电评估问题，测试知识库溯源问答…" />
                <button type="submit" class="primary sm">检索提问</button>
              </form>
            </div>
          </div>
        </div>
      `;
    }

    return `
      <section class="workspace-island ${state.kbTab === 'sources' ? 'scrollable' : ''}">
        <div class="workspace-page-heading">
          <div>
            <h1>知识库管理</h1>
            <p class="page-subtitle">统一接入外部系统（iOA、ECM、人因管理系统、工单系统、领导待办、状态报告、BDX）与线下文档，支持自动化数据清洗、切片入库与清洗问答</p>
          </div>
          <div class="heading-actions">
            <button type="button" class="ghost" id="btn-kb-add-source">＋ 新增外部系统</button>
            <button type="button" class="primary" id="btn-kb-offline-upload">↑ 线下上传文档</button>
          </div>
        </div>

        <div class="perm-tabs">
          <button type="button" class="perm-tab ${state.kbTab === 'sources' ? 'active' : ''}" data-kb-tab="sources">
            数据接入管理 <span class="workspace-count">${state.kbSources.length}</span>
          </button>
          <button type="button" class="perm-tab ${state.kbTab === 'cleaning' ? 'active' : ''}" data-kb-tab="cleaning">
            知识文档与清洗 <span class="workspace-count">${pendingCleanCount} 待处理</span>
          </button>
          <button type="button" class="perm-tab ${state.kbTab === 'qa' ? 'active' : ''}" data-kb-tab="qa">
            清洗问答与检索测试 <span class="workspace-count">${state.kbQas.length}</span>
          </button>
        </div>

        ${bodyHtml}
      </section>
    `;
  }

  function openOfflineUploadModal() {
    openModal(`
      <div class="modal-head">
        <h2>线下上传知识文档</h2>
        <button type="button" class="modal-close" data-modal-close>×</button>
      </div>
      <div class="modal-body">
        <div class="form-grid-2">
          <div class="field-group">
            <label>归属用途与数据源分类 *</label>
            <select id="up-usage">
              <option value="OBS 涉及来源|观察、访谈|—">OBS 涉及来源 · 线下（观察、访谈）</option>
              <option value="AFI 准则|IEEE / PO&C / 研究院|行业标准">AFI 准则（行业标准）· IEEE / PO&C / 研究院</option>
              <option value="AFI 准则|运行经验|运行经验">AFI 准则（运行经验）· SOER / SER / 良好实践</option>
              <option value="AFI 准则（电厂程序）|电厂程序|电厂程序">AFI 准则（电厂程序）· 公司、电厂程序</option>
            </select>
          </div>
          <div class="field-group">
            <label>${isPlantSelfMode() ? '所属电厂' : '归属租户范围'}</label>
            <select id="up-tenant" ${isPlantSelfMode() ? 'disabled' : ''}>
              ${
                isPlantSelfMode()
                  ? `<option value="${esc(state.globalTenant)}" selected>${esc(getTenantName(state.globalTenant))}</option>`
                  : `<option value="${state.globalTenant === 'all' ? 'all' : state.globalTenant}">${esc(getTenantName(state.globalTenant))}</option>
                     ${state.tenants.map((t) => `<option value="${t.id}">${esc(t.name)}</option>`).join('')}`
              }
            </select>
          </div>
        </div>
        <div class="field-group">
          <label>文档标题 *</label>
          <input id="up-title" type="text" placeholder="例如：2026年11月秦山二厂主控室现场访谈记录.docx" value="2026年11月大修现场观察与访谈记录汇总.docx" />
        </div>
        <div class="upload-dropzone">
          <strong style="font-size:13px;">点击选择文件或拖拽至此区域</strong>
          <span style="font-size:12px;color:var(--ink-3);">支持 PDF / DOCX / XLSX / TXT（单文件上限 50MB），上传后自动进入数据清洗与 QA 抽取流水线</span>
          <input type="file" id="up-file" style="margin-top:6px;font-size:12px;" />
        </div>
      </div>
      <div class="modal-foot">
        <button type="button" class="ghost" data-modal-close>取消</button>
        <button type="button" class="primary" id="btn-confirm-upload">上传并触发清洗</button>
      </div>
    `);

    modalRoot.querySelector('#up-file').addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (file) modalRoot.querySelector('#up-title').value = file.name;
    });

    modalRoot.querySelector('#btn-confirm-upload').addEventListener('click', () => {
      const title = modalRoot.querySelector('#up-title').value.trim();
      if (!title) return showToast('请填写文档标题');
      const [usage, dataType, priority] = modalRoot.querySelector('#up-usage').value.split('|');
      const tenantId = modalRoot.querySelector('#up-tenant').value;
      state.kbDocs.unshift({
        id: 'KB-DOC-' + (910 + state.kbDocs.length),
        title,
        sourceId: 'src-offline',
        sourceName: '线下上传',
        dataType,
        usage,
        priority,
        tenantId,
        status: 'pending',
        chunks: 0,
        qaCount: 0,
        updatedAt: '刚刚',
        rawSnippet: `【线下上传原文】文件：${title}\n待执行脱敏、去噪、KKS/机组元数据保留与结构化切片……`,
        cleanedSnippet: '点击「立即执行清洗」即可生成结构化清洗文本与推荐问答对。'
      });
      const offlineSrc = state.kbSources.find((s) => s.id === 'src-offline');
      if (offlineSrc) {
        offlineSrc.docsCount += 1;
        offlineSrc.lastSync = '2026-11-19 18:22';
      }
      state.kbTab = 'cleaning';
      closeModal();
      render();
      showToast(`已上传「${title}」，已加入清洗队列`);
    });
  }

  function openSourceConfigModal(sourceId) {
    const src = state.kbSources.find((s) => s.id === sourceId);
    if (!src) return;
    openModal(`
      <div class="modal-head">
        <h2>外部系统接入配置 · ${esc(src.name)}</h2>
        <button type="button" class="modal-close" data-modal-close>×</button>
      </div>
      <div class="modal-body">
        <div class="field-group">
          <label>接口地址（内网 API / 数据库视图）</label>
          <input id="sc-endpoint" type="text" value="${esc(src.endpoint)}" />
        </div>
        <div class="form-grid-2">
          <div class="field-group">
            <label>同步周期</label>
            <select id="sc-schedule">
              ${['每 4 小时增量同步', '每 6 小时增量同步', '每 12 小时增量同步', '每日 02:00 增量同步', '每周日 04:00 全量校核']
                .map((opt) => `<option value="${opt}" ${src.schedule === opt ? 'selected' : ''}>${opt}</option>`)
                .join('')}
            </select>
          </div>
          <div class="field-group">
            <label>归属用途</label>
            <input type="text" value="${esc(src.usage)}" disabled />
          </div>
        </div>
        <div class="field-group">
          <label>拉取数据类型（逗号分隔）</label>
          <input id="sc-types" type="text" value="${esc(src.dataTypes.join('、'))}" />
        </div>
      </div>
      <div class="modal-foot">
        <button type="button" class="ghost" id="btn-test-conn">测试连通性</button>
        <button type="button" class="primary" id="btn-save-conn">保存配置</button>
      </div>
    `);

    modalRoot.querySelector('#btn-test-conn').addEventListener('click', () => {
      showToast(`连接成功：${src.name} 内网接口响应耗时 42ms`);
    });
    modalRoot.querySelector('#btn-save-conn').addEventListener('click', () => {
      src.endpoint = modalRoot.querySelector('#sc-endpoint').value.trim() || src.endpoint;
      src.schedule = modalRoot.querySelector('#sc-schedule').value;
      const types = modalRoot
        .querySelector('#sc-types')
        .value.split(/[、,，]/)
        .map((x) => x.trim())
        .filter(Boolean);
      if (types.length) src.dataTypes = types;
      closeModal();
      render();
      showToast(`已更新「${src.name}」接入配置`);
    });
  }

  function openCleanDrawer(docId) {
    const doc = state.kbDocs.find((d) => d.id === docId);
    if (!doc) return;
    openModal(
      `
      <div class="modal-head">
        <div>
          <h2>数据清洗与切片预览</h2>
          <span class="cell-sub">${esc(doc.title)} · ${esc(doc.sourceName)} (${esc(doc.dataType)})</span>
        </div>
        <button type="button" class="modal-close" data-modal-close>×</button>
      </div>
      <div class="modal-body">
        <div>
          <strong style="display:block;font-size:12.5px;margin-bottom:8px;">清洗流水线规则</strong>
          <div class="clean-rules-row">
            <label class="rule-chip"><input type="checkbox" checked /> 人员姓名/工号/手机号脱敏</label>
            <label class="rule-chip"><input type="checkbox" checked /> 保留机组号与 KKS 设备编码元数据</label>
            <label class="rule-chip"><input type="checkbox" checked /> 剔除页眉页脚与重复噪点</label>
            <label class="rule-chip"><input type="checkbox" checked /> 自动抽取标准问答对（Q&A）</label>
          </div>
        </div>
        <div class="clean-compare-grid">
          <div>
            <strong style="display:block;font-size:12px;color:var(--ink-2);margin-bottom:6px;">清洗前（原始接入片段）</strong>
            <div class="clean-box">${esc(doc.rawSnippet)}</div>
          </div>
          <div>
            <strong style="display:block;font-size:12px;color:var(--green);margin-bottom:6px;">清洗后（结构化切片 · ${doc.chunks || 24} 段）</strong>
            <div class="clean-box after">${esc(doc.cleanedSnippet)}</div>
          </div>
        </div>
      </div>
      <div class="modal-foot">
        <button type="button" class="ghost" data-modal-close>关闭</button>
        <button type="button" class="primary" id="btn-run-clean-now">确认清洗并入库</button>
      </div>
    `,
      { drawer: true }
    );

    modalRoot.querySelector('#btn-run-clean-now').addEventListener('click', () => {
      doc.status = 'done';
      if (!doc.chunks) doc.chunks = 28;
      if (!doc.qaCount) doc.qaCount = 8;
      if (doc.cleanedSnippet.includes('待执行') || doc.cleanedSnippet.includes('点击')) {
        doc.cleanedSnippet = `【元数据】来源：${doc.sourceName} / ${doc.dataType} | 用途：${doc.usage} | 状态：已完成脱敏与双路索引构建\n【清洗正文】已自动剔除页眉页脚及个人隐私信息，完整保留机组号、状态报告号与 KKS 编码，并抽取 ${doc.qaCount} 条候选问答对。`;
      }
      doc.updatedAt = '刚刚';
      closeModal();
      render();
      showToast(`「${doc.title}」已完成清洗并入库向量索引`);
    });
  }

  function simulateKbAnswer(question) {
    const q = question.toLowerCase();
    if (q.includes('交接班') || q.includes('报警') || q.includes('主控室')) {
      return {
        text: '依据「AFI 准则（最高标准）」检索结果：WANO PO&C 2022-1（OP.1-03，高优先级）要求操纵员在交接班与报警响应中严格落实三向交流与保守决策；结合 BDX 同步的电厂标准程序 Q/CNNC-OP-012（低优先级），接班前 30 分钟须完成运行日志、孤立缺陷台账与临时变更清单核对并签字闭环。',
        cites: [
          { source: '线下上传 · PO&C 2022-1', doc: 'OP.1-03 运行基本功准则', tier: '高', score: '0.96' },
          { source: 'BDX 标准导则系统', doc: 'Q/CNNC-OP-012 Rev.14 第5.3.2条', tier: '低', score: '0.91' },
          { source: '人因管理系统', doc: '1号机组主控室观察指导记录', tier: 'OBS来源', score: '0.88' }
        ]
      };
    }
    if (q.includes('防异物') || q.includes('fme') || q.includes('ecm') || q.includes('工单')) {
      return {
        text: '从 ECM 与工单系统联合召回显示：2026 Q3 维修处共执行 A 类防异物（FME）作业 42 项，其中 3 项（含工单 WO-2026-88412）存在未执行二次清点复核的偏差；对照 WANO SOER 防异物经验反馈（中优先级）建议加强防异物区域准入登记与封口前独立验证。',
        cites: [
          { source: 'ECM', doc: '2026-Q3 维修领域自评估报告', tier: 'OBS来源', score: '0.95' },
          { source: '工单系统', doc: 'WO-2026-88412 电动阀检修工单', tier: 'OBS来源', score: '0.90' },
          { source: '人因管理系统', doc: 'WANO SOER 防异物经验反馈汇编', tier: '中', score: '0.87' }
        ]
      };
    }
    return {
      text: `已针对「${question}」在知识库（范围：${state.kbQaScope === 'obs' ? 'OBS 涉及来源' : state.kbQaScope === 'afi' ? 'AFI 准则库' : '全库'}）完成双路召回。人因管理系统历史 SER/WER 与线下访谈记录提示：在低功率及大修窗口期应坚持“一步一勾”独立验证，杜绝口头确认代替规程执行，同时优先对照高优先级 PO&C / IEEE 条文判定整改闭环标准。`,
      cites: [
        { source: '人因管理系统', doc: 'SER/WER 防人因失误工具使用分析', tier: '中', score: '0.93' },
        { source: '线下上传 · 访谈记录', doc: `${getTenantName(state.globalTenant)}运行值长访谈纪要`, tier: 'OBS来源', score: '0.89' },
        { source: '线下上传 · 研究院准则', doc: '同行评估与自评估通用技术准则 V3.4', tier: '高', score: '0.86' }
      ]
    };
  }

  // ==================== 5. 文档策略（租户管理员 · 受超管租户智能体权限约束） ====================
  function getActiveTenantObj() {
    return state.tenants.find((t) => t.id === state.globalTenant) || state.tenants[0];
  }

  function renderDocumentsPage() {
    const tenant = getActiveTenantObj();
    const plantSelf = isPlantSelfMode();
    return `
      <section class="workspace-island">
        <div class="workspace-page-heading">
          <div>
            <h1>文档策略（智能体分配）</h1>
            <p class="page-subtitle">按文档类型分配「${esc(tenant.name)}」已开通的智能体能力，并直接控制文档工作台中的 AI 按钮可见性</p>
          </div>
          <span class="workspace-tag blue">${plantSelf ? '本厂已开通' : '租户已开通'} ${D.AGENT_CATALOG.filter((a) => tenant.agents[a.id]?.enabled).length} / ${D.AGENT_CATALOG.length} 个智能体</span>
        </div>

        <div class="table-scroll">
          <table class="data-table">
            <thead>
              <tr>
                <th style="width:30%;">文档类型</th>
                <th style="width:52%;">${plantSelf ? '生效智能体策略' : '生效智能体策略（受租户开通状态约束）'}</th>
                <th style="width:18%;">操作</th>
              </tr>
            </thead>
            <tbody>
              ${state.documents
                .map((doc) => {
                  const enabledAgents = D.AGENT_CATALOG.filter((ag) => doc.agents[ag.id] && tenant.agents[ag.id]?.enabled);
                  const blockedCount = D.AGENT_CATALOG.filter((ag) => doc.agents[ag.id] && !tenant.agents[ag.id]?.enabled).length;
                  return `
                  <tr>
                    <td><strong class="cell-title">${esc(doc.name)}</strong></td>
                    <td>
                      ${
                        enabledAgents.length
                          ? `<div class="tag-list">${enabledAgents.map((a) => `<span class="workspace-tag purple">${esc(a.name)}</span>`).join('')}${blockedCount ? `<span class="workspace-tag yellow">${blockedCount} 项${plantSelf ? '暂未开通' : '待超管开通'}</span>` : ''}</div>`
                          : '<span style="color:var(--ink-3);">未启用</span>'
                      }
                    </td>
                    <td>
                      <button type="button" class="workspace-text-button primary-link" data-config-doc="${doc.type}">配置文档策略</button>
                    </td>
                  </tr>
                `;
                })
                .join('')}
            </tbody>
          </table>
        </div>
      </section>
    `;
  }

  function openDocumentConfigModal(docType) {
    const doc = state.documents.find((d) => d.type === docType);
    const tenant = getActiveTenantObj();
    const plantSelf = isPlantSelfMode();
    if (!doc) return;
    function renderDocModal() {
      openModal(`
        <div class="modal-head">
          <h2>文档智能体策略 · ${esc(doc.name)}</h2>
          <button type="button" class="modal-close" data-modal-close>×</button>
        </div>
        <div class="modal-body">
          <div style="font-size:12.5px;color:var(--ink-2);">${plantSelf ? `当前电厂：<strong>${esc(tenant.name)}</strong>（按本厂已开通的智能体能力配置）` : `当前租户：<strong>${esc(tenant.name)}</strong>（仅可启用超级管理员在「租户管理」中已开通的智能体）`}</div>
          <ul class="document-agent-list">
            ${D.AGENT_CATALOG.map((ag) => {
              const tenantAllowed = !!tenant.agents[ag.id]?.enabled;
              const on = tenantAllowed && !!doc.agents[ag.id];
              return `
                <li style="${tenantAllowed ? '' : 'opacity:0.55;'}">
                  <div style="display:flex;align-items:center;gap:11px;">
                    <span class="agent-icon-badge">✦</span>
                    <div>
                      <strong style="font-size:13.5px;">${esc(ag.name)} ${tenantAllowed ? '' : `<span class="workspace-tag yellow" style="margin-left:6px;">${plantSelf ? '暂未开通' : '超管未开通'}</span>`}</strong>
                      <span class="cell-sub">${esc(ag.desc)}</span>
                    </div>
                  </div>
                  <div class="switch-inline">
                    <span>${!tenantAllowed ? '不可用' : on ? '已启用' : '已停用'}</span>
                    <button type="button" class="perm-switch ${on ? 'on' : ''}" data-doc-agent-toggle="${ag.id}" ${tenantAllowed ? '' : 'disabled'}>
                      <span class="perm-switch-knob"></span>
                    </button>
                  </div>
                </li>
              `;
            }).join('')}
          </ul>
        </div>
        <div class="modal-foot">
          <button type="button" class="primary" data-modal-close>完成</button>
        </div>
      `);

      modalRoot.querySelectorAll('[data-doc-agent-toggle]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const agId = btn.dataset.docAgentToggle;
          doc.agents[agId] = !doc.agents[agId];
          renderDocModal();
          render();
          showToast(`已${doc.agents[agId] ? '启用' : '停用'}「${D.AGENT_CATALOG.find((a) => a.id === agId).name}」`);
        });
      });
    }
    renderDocModal();
  }

  // ==================== 6. 用户管理（租户管理员：用户 & 角色） ====================
  function getRoleLinkedUsers(roleName) {
    return state.users.filter((u) => {
      if (state.globalTenant !== 'all' && u.tenantId !== state.globalTenant) return false;
      return u.role === roleName;
    });
  }

  function openRoleUsersModal(roleId) {
    const role = state.roles.find((r) => r.id === roleId);
    if (!role) return;
    const list = getRoleLinkedUsers(role.name);

    openModal(
      `
      <div class="modal-head">
        <div>
          <h2>关联用户 · ${esc(role.name)}</h2>
          <span class="cell-sub">${esc(role.desc)} · 本厂共 ${list.length} 位关联用户</span>
        </div>
        <button type="button" class="modal-close" data-modal-close>×</button>
      </div>
      <div class="modal-body">
        ${
          list.length
            ? `
          <div class="table-scroll" style="max-height:360px;border:1px solid var(--line);border-radius:12px;">
            <table class="data-table">
              <thead>
                <tr>
                  <th style="width:24%;">用户姓名</th>
                  <th style="width:16%;">账号</th>
                  <th style="width:22%;">所属电厂</th>
                  <th style="width:24%;">岗位描述</th>
                  <th style="width:14%;">状态</th>
                </tr>
              </thead>
              <tbody>
                ${list
                  .map(
                    (u) => `
                  <tr style="${u.enabled ? '' : 'opacity:0.6;'}">
                    <td>
                      <div style="display:flex;align-items:center;gap:8px;">
                        <span class="avatar" style="width:26px;height:26px;background:#edf0f4;color:#525860;font-size:11px;">${esc(u.initials)}</span>
                        <strong class="cell-title">${esc(u.name)}</strong>
                      </div>
                    </td>
                    <td>${esc(u.account)}</td>
                    <td>${esc(getTenantName(u.tenantId))}</td>
                    <td style="font-size:12px;color:var(--ink-2);">${esc(u.desc)}</td>
                    <td><span class="proj-flag ${u.enabled ? 'done' : 'muted'}">${u.enabled ? '启用' : '已停用'}</span></td>
                  </tr>
                `
                  )
                  .join('')}
              </tbody>
            </table>
          </div>
        `
            : `<div style="padding:36px 20px;text-align:center;color:var(--ink-3);font-size:13px;">该角色下暂未分配用户，可在「用户管理」中新增或分配。</div>`
        }
      </div>
      <div class="modal-foot">
        <button type="button" class="ghost" id="btn-jump-role-users">在用户管理中筛选此角色</button>
        <button type="button" class="primary" data-modal-close>关闭</button>
      </div>
    `,
      { wide: true }
    );

    const jumpBtn = modalRoot.querySelector('#btn-jump-role-users');
    if (jumpBtn) {
      jumpBtn.addEventListener('click', () => {
        state.permTab = 'users';
        state.permUserRole = role.name;
        closeModal();
        render();
      });
    }
  }

  function openRolePermissionModal(roleId) {
    const role = state.roles.find((r) => r.id === roleId);
    if (!role) return;
    const allCodes = D.PERMISSION_GROUPS.flatMap((g) => g.codes.map((c) => c.code));
    const draft = new Set(Array.isArray(role.permissions) ? role.permissions : []);
    const expanded = new Set(D.PERMISSION_GROUPS.map((g) => g.id));

    function renderPermModal() {
      const totalSelected = allCodes.filter((c) => draft.has(c)).length;
      openModal(
        `
        <div class="modal-head">
          <div>
            <h2>编辑角色权限 · ${esc(role.name)}</h2>
            <span class="cell-sub">按原有平台标准权限树配置（${esc(role.roleClass)}）· 分组仅用于展示，不产生隐含父类权限</span>
          </div>
          <button type="button" class="modal-close" data-modal-close>×</button>
        </div>
        <div class="modal-body">
          <div class="perm-tree-box">
            <div class="perm-tree-toolbar">
              <label>
                <input type="checkbox" id="perm-all-chk" ${totalSelected === allCodes.length ? 'checked' : ''} />
                <strong>全选所有权限</strong>
                <span class="workspace-tag blue">已选 ${totalSelected} / ${allCodes.length} 项</span>
              </label>
              <div style="display:flex;gap:12px;">
                <button type="button" class="workspace-text-button primary-link" style="font-size:12px;" id="btn-perm-expand-all">展开全部</button>
                <button type="button" class="workspace-text-button" style="font-size:12px;" id="btn-perm-collapse-all">收起全部</button>
              </div>
            </div>

            ${D.PERMISSION_GROUPS.map((grp) => {
              const gCodes = grp.codes.map((c) => c.code);
              const gCount = gCodes.filter((c) => draft.has(c)).length;
              const isOpen = expanded.has(grp.id);
              return `
                <div class="perm-tree-row">
                  <div class="perm-tree-group">
                    <div style="display:flex;align-items:center;gap:8px;">
                      <button type="button" class="perm-tree-toggle" data-pt-toggle="${grp.id}" aria-expanded="${isOpen}">${isOpen ? '−' : '+'}</button>
                      <label>
                        <input type="checkbox" data-pt-group="${grp.id}" ${gCount === gCodes.length ? 'checked' : ''} />
                        <span>${esc(grp.label)}</span>
                      </label>
                    </div>
                    <span class="workspace-count">${gCount} / ${gCodes.length}</span>
                  </div>
                  ${
                    isOpen
                      ? `
                    <div class="perm-tree-leaves">
                      ${grp.codes
                        .map(
                          (item) => `
                        <label class="perm-tree-leaf">
                          <input type="checkbox" data-pt-code="${item.code}" ${draft.has(item.code) ? 'checked' : ''} />
                          <span>${esc(item.label)}</span>
                          <span class="perm-code-badge">${esc(item.code)}</span>
                        </label>
                      `
                        )
                        .join('')}
                    </div>
                  `
                      : ''
                  }
                </div>
              `;
            }).join('')}
          </div>
        </div>
        <div class="modal-foot">
          <button type="button" class="ghost" data-modal-close>取消</button>
          <button type="button" class="primary" id="btn-save-role-perms">保存权限配置（${totalSelected} 项）</button>
        </div>
      `,
        { wide: true }
      );

      const allChk = modalRoot.querySelector('#perm-all-chk');
      if (allChk) {
        allChk.indeterminate = totalSelected > 0 && totalSelected < allCodes.length;
        allChk.addEventListener('change', () => {
          if (allChk.checked) allCodes.forEach((c) => draft.add(c));
          else draft.clear();
          renderPermModal();
        });
      }
      D.PERMISSION_GROUPS.forEach((grp) => {
        const gCodes = grp.codes.map((c) => c.code);
        const gCount = gCodes.filter((c) => draft.has(c)).length;
        const gChk = modalRoot.querySelector(`[data-pt-group="${grp.id}"]`);
        if (gChk) {
          gChk.indeterminate = gCount > 0 && gCount < gCodes.length;
          gChk.addEventListener('change', () => {
            gCodes.forEach((c) => (gChk.checked ? draft.add(c) : draft.delete(c)));
            renderPermModal();
          });
        }
      });
      modalRoot.querySelectorAll('[data-pt-code]').forEach((chk) => {
        chk.addEventListener('change', () => {
          const code = chk.dataset.ptCode;
          if (chk.checked) draft.add(code);
          else draft.delete(code);
          renderPermModal();
        });
      });
      modalRoot.querySelectorAll('[data-pt-toggle]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = btn.dataset.ptToggle;
          if (expanded.has(id)) expanded.delete(id);
          else expanded.add(id);
          renderPermModal();
        });
      });
      modalRoot.querySelector('#btn-perm-expand-all').addEventListener('click', () => {
        D.PERMISSION_GROUPS.forEach((g) => expanded.add(g.id));
        renderPermModal();
      });
      modalRoot.querySelector('#btn-perm-collapse-all').addEventListener('click', () => {
        expanded.clear();
        renderPermModal();
      });
      modalRoot.querySelector('#btn-save-role-perms').addEventListener('click', () => {
        role.permissions = allCodes.filter((c) => draft.has(c));
        role.permCount = role.permissions.length;
        closeModal();
        render();
        showToast(`已保存角色「${role.name}」的权限配置（共 ${role.permCount} 项）`);
      });
    }

    renderPermModal();
  }

  function renderPermissionsPage() {
    const q = state.permSearch.toLowerCase();
    const roles = state.roles.filter((r) => !q || `${r.name} ${r.desc}`.toLowerCase().includes(q));
    const users = state.users.filter((u) => {
      if (state.globalTenant !== 'all' && u.tenantId !== state.globalTenant) return false;
      if (state.permUserRole !== 'all' && u.role !== state.permUserRole) return false;
      if (state.permUserStatus === 'active' && !u.enabled) return false;
      if (state.permUserStatus === 'disabled' && u.enabled) return false;
      if (q && !`${u.name} ${u.account} ${u.role}`.toLowerCase().includes(q)) return false;
      return true;
    });

    return `
      <section class="workspace-island">
        <div class="workspace-page-heading">
          <div>
            <h1>用户管理（用户 & 角色）</h1>
            <p class="page-subtitle">管理「${esc(getTenantName(state.globalTenant))}」下的业务用户账号、所属角色与平台标准权限树</p>
          </div>
          <div class="heading-actions">
            <button type="button" class="primary" id="btn-perm-create">${state.permTab === 'roles' ? '＋ 新增角色' : '＋ 新增用户'}</button>
          </div>
        </div>

        <div class="perm-tabs">
          <button type="button" class="perm-tab ${state.permTab === 'users' ? 'active' : ''}" data-perm-tab="users">
            用户管理 <span class="workspace-count">${users.length}</span>
          </button>
          <button type="button" class="perm-tab ${state.permTab === 'roles' ? 'active' : ''}" data-perm-tab="roles">
            角色管理 <span class="workspace-count">${state.roles.length}</span>
          </button>
        </div>

        <div class="filter-bar">
          <div class="field-group" style="width:240px;">
            <label>关键字搜索</label>
            <input id="perm-search-input" type="text" placeholder="${state.permTab === 'roles' ? '搜索角色名称' : '搜索姓名或账号'}" value="${esc(state.permSearch)}" />
          </div>
          ${
            state.permTab === 'users'
              ? `
            <div class="field-group" style="width:180px;">
              <label>所属角色</label>
              <select id="perm-user-role">
                <option value="all" ${state.permUserRole === 'all' ? 'selected' : ''}>全部角色</option>
                ${state.roles
                  .map((r) => `<option value="${esc(r.name)}" ${state.permUserRole === r.name ? 'selected' : ''}>${esc(r.name)}</option>`)
                  .join('')}
              </select>
            </div>
            <div class="field-group" style="width:140px;">
              <label>账号状态</label>
              <select id="perm-user-status">
                <option value="all" ${state.permUserStatus === 'all' ? 'selected' : ''}>全部状态</option>
                <option value="active" ${state.permUserStatus === 'active' ? 'selected' : ''}>启用</option>
                <option value="disabled" ${state.permUserStatus === 'disabled' ? 'selected' : ''}>已停用</option>
              </select>
            </div>
          `
              : ''
          }
        </div>

        <div class="table-scroll">
          ${
            state.permTab === 'roles'
              ? `
            <table class="data-table">
              <thead>
                <tr>
                  <th style="width:19%;">角色名称</th>
                  <th style="width:26%;">角色描述</th>
                  <th style="width:10%;">角色类</th>
                  <th style="width:9%;">权限数</th>
                  <th style="width:10%;">关联用户</th>
                  <th style="width:10%;">状态</th>
                  <th style="width:16%;">操作</th>
                </tr>
              </thead>
              <tbody>
                ${roles
                  .map((r) => {
                    const linkedCnt = getRoleLinkedUsers(r.name).length;
                    const permLen = Array.isArray(r.permissions) ? r.permissions.length : r.permCount;
                    return `
                  <tr>
                    <td>
                      <strong class="cell-title">${esc(r.name)}</strong>
                      ${r.builtin ? '<span class="workspace-tag" style="margin-left:6px;">内置</span>' : ''}
                    </td>
                    <td>${esc(r.desc)}</td>
                    <td><span class="workspace-tag blue">${esc(r.roleClass)}</span></td>
                    <td>
                      <button type="button" class="workspace-text-button primary-link" data-edit-role-perms="${r.id}">${permLen} / 15 项</button>
                    </td>
                    <td>
                      <button type="button" class="workspace-text-button primary-link" data-role-users="${r.id}">${linkedCnt} 人</button>
                    </td>
                    <td>
                      <div class="switch-inline">
                        <button type="button" class="perm-switch ${r.enabled ? 'on' : ''}" data-toggle-role="${r.id}">
                          <span class="perm-switch-knob"></span>
                        </button>
                        <span>${r.enabled ? '启用' : '停用'}</span>
                      </div>
                    </td>
                    <td>
                      <div class="action-links">
                        <button type="button" class="workspace-text-button primary-link" data-edit-role-perms="${r.id}">编辑权限</button>
                        <button type="button" class="workspace-text-button" data-role-users="${r.id}">关联用户</button>
                      </div>
                    </td>
                  </tr>
                `;
                  })
                  .join('')}
              </tbody>
            </table>
          `
              : `
            <table class="data-table">
              <thead>
                <tr>
                  <th style="width:18%;">用户名称</th>
                  <th style="width:12%;">账号</th>
                  <th style="width:18%;">所属角色</th>
                  <th style="width:16%;">所属电厂</th>
                  <th style="width:22%;">描述</th>
                  <th style="width:14%;">是否启用</th>
                </tr>
              </thead>
              <tbody>
                ${
                  users.length
                    ? users
                        .map(
                          (u) => `
                  <tr style="${u.enabled ? '' : 'opacity:0.6;'}">
                    <td>
                      <div style="display:flex;align-items:center;gap:9px;">
                        <span class="avatar" style="width:28px;height:28px;background:#edf0f4;color:#525860;font-size:11.5px;">${esc(u.initials)}</span>
                        <strong class="cell-title">${esc(u.name)}</strong>
                      </div>
                    </td>
                    <td>${esc(u.account)}</td>
                    <td><span class="workspace-tag">${esc(u.role)}</span></td>
                    <td>${esc(getTenantName(u.tenantId))}</td>
                    <td>${esc(u.desc)}</td>
                    <td>
                      <div class="switch-inline">
                        <button type="button" class="perm-switch ${u.enabled ? 'on' : ''}" data-toggle-user="${u.id}">
                          <span class="perm-switch-knob"></span>
                        </button>
                        <span>${u.enabled ? '启用' : '已停用'}</span>
                      </div>
                    </td>
                  </tr>
                `
                        )
                        .join('')
                    : `<tr><td colspan="6" style="text-align:center;padding:44px;color:var(--ink-3);">暂无符合筛选条件的用户</td></tr>`
                }
              </tbody>
            </table>
          `
          }
        </div>
      </section>
    `;
  }

  // ==================== 7. 队长专属：总览（甘特图 + 项目切换/归档/全部汇总） & 审核工作台（连续审核队列） ====================
  function parseSpanRange(spanStr, fallbackYear = 2026) {
    const parts = String(spanStr || '').split('~').map((s) => s.trim());
    const parseOne = (s, yr) => {
      if (!s) return new Date(yr, 0, 1).getTime();
      if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(s)) {
        const [y, m, d] = s.split('-').map(Number);
        return new Date(y, m - 1, d).getTime();
      }
      if (/^\d{1,2}-\d{1,2}$/.test(s)) {
        const [m, d] = s.split('-').map(Number);
        return new Date(yr, m - 1, d).getTime();
      }
      return new Date(yr, 0, 1).getTime();
    };
    const start = parseOne(parts[0], fallbackYear);
    let end = parseOne(parts[1] || parts[0], fallbackYear);
    if (end < start) {
      end = parseOne(parts[1], fallbackYear + 1);
    }
    return [start, Math.max(start + 86400000, end)];
  }

  function formatShortDate(ms) {
    const d = new Date(ms);
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${m}-${day}`;
  }

  function getProjectStats(proj) {
    const plans = proj.plans || [];
    const tasks = plans.flatMap((pl) => pl.tasks || []);
    const tasksDone = tasks.filter((t) => t.status === 'done').length;
    const docs = state.workspaceDocs.filter((d) => d.projectId === proj.id);
    const pendingDocs = docs.filter((d) => d.status === 'submitted').length;
    const acceptedDocs = docs.filter((d) => d.status === 'accepted').length;
    const rejectedDocs = docs.filter((d) => d.status === 'rejected').length;
    const pct = tasks.length ? Math.round((tasksDone / tasks.length) * 100) : proj.status === 'done' ? 100 : 0;
    return { plansCount: plans.length, tasksCount: tasks.length, tasksDone, pct, docsCount: docs.length, pendingDocs, acceptedDocs, rejectedDocs };
  }

  function renderLeaderProjectSelect(selectId, selectedVal, includeAll = true) {
    const scoped = getScopedProjects();
    const activeList = scoped.filter((p) => p.status === 'active');
    const todoList = scoped.filter((p) => p.status === 'todo');
    const archivedList = scoped.filter((p) => p.status === 'done');
    return `
      <label class="leader-project-select" title="切换项目视角">
        <span>当前项目</span>
        <select id="${selectId}">
          ${includeAll ? `<option value="all" ${selectedVal === 'all' ? 'selected' : ''}>全部项目（摘要汇总 · ${scoped.length} 个）</option>` : ''}
          ${
            activeList.length
              ? `<optgroup label="激活中项目（进行中）">${activeList
                  .map((p) => `<option value="${p.id}" ${selectedVal === p.id ? 'selected' : ''}>[进行中] ${esc(p.name)}</option>`)
                  .join('')}</optgroup>`
              : ''
          }
          ${
            todoList.length
              ? `<optgroup label="待启动项目">${todoList
                  .map((p) => `<option value="${p.id}" ${selectedVal === p.id ? 'selected' : ''}>[未开始] ${esc(p.name)}</option>`)
                  .join('')}</optgroup>`
              : ''
          }
          ${
            archivedList.length
              ? `<optgroup label="已完成项目归档">${archivedList
                  .map((p) => `<option value="${p.id}" ${selectedVal === p.id ? 'selected' : ''}>[已归档] ${esc(p.name)}</option>`)
                  .join('')}</optgroup>`
              : ''
          }
        </select>
      </label>
    `;
  }

  function renderLeaderOverviewPage() {
    const scopedProjects = getScopedProjects();
    const defaultProj = scopedProjects.find((p) => p.status === 'active') || scopedProjects[0] || null;
    const sel =
      state.leaderProjectId === 'all'
        ? 'all'
        : scopedProjects.some((p) => p.id === state.leaderProjectId)
          ? state.leaderProjectId
          : defaultProj?.id || 'all';

    // 模式 A：全部项目摘要视图
    if (sel === 'all') {
      const totalProjects = scopedProjects.length;
      const activeCount = scopedProjects.filter((p) => p.status === 'active').length;
      const archivedCount = scopedProjects.filter((p) => p.status === 'done').length;
      const allStats = scopedProjects.map((p) => ({ proj: p, st: getProjectStats(p) }));
      const totalTasks = allStats.reduce((s, x) => s + x.st.tasksCount, 0);
      const totalTasksDone = allStats.reduce((s, x) => s + x.st.tasksDone, 0);
      const totalPending = allStats.reduce((s, x) => s + x.st.pendingDocs, 0);
      const totalAccepted = allStats.reduce((s, x) => s + x.st.acceptedDocs, 0);
      const overallPct = totalTasks ? Math.round((totalTasksDone / totalTasks) * 100) : 0;

      return `
        <section class="workspace-island scrollable">
          <div class="workspace-page-heading">
            <div>
              <h1>队长总览 · 全部项目摘要</h1>
              <p class="page-subtitle">汇总本厂全部在评与已归档自评估项目的计划进度、任务闭环与待审核队列，点击项目可切入甘特图明细</p>
            </div>
            <div class="heading-actions">
              ${renderLeaderProjectSelect('leader-project-select', 'all', true)}
              <button type="button" class="primary sm" data-leader-go-review="${defaultProj ? defaultProj.id : ''}" ${defaultProj ? '' : 'disabled'}>前往审核工作台（${totalPending} 待审）→</button>
            </div>
          </div>

          <div class="kpi-grid">
            <article class="kpi-card">
              <div class="kpi-head"><span>全部评估项目</span><span class="workspace-tag blue">全周期</span></div>
              <div class="kpi-value">${totalProjects}</div>
              <div class="kpi-foot"><span>含进行中与历史归档</span></div>
            </article>
            <article class="kpi-card">
              <div class="kpi-head"><span>当前激活项目</span><span class="workspace-tag green">进行中</span></div>
              <div class="kpi-value">${activeCount}</div>
              <div class="kpi-foot"><span>待启动 ${totalProjects - activeCount - archivedCount} 个</span></div>
            </article>
            <article class="kpi-card">
              <div class="kpi-head"><span>已完成项目归档</span><span class="workspace-tag">Archived</span></div>
              <div class="kpi-value">${archivedCount}</div>
              <div class="kpi-foot"><span>可随时回溯甘特图</span></div>
            </article>
            <article class="kpi-card">
              <div class="kpi-head"><span>总体任务完成率</span><span class="workspace-tag blue">执行进度</span></div>
              <div class="kpi-value">${overallPct}%</div>
              <div class="kpi-foot"><span>已完成 ${totalTasksDone} / ${totalTasks} 项</span></div>
            </article>
            <article class="kpi-card">
              <div class="kpi-head"><span>待队长审核报告</span><span class="workspace-tag yellow">需处理</span></div>
              <div class="kpi-value">${totalPending}</div>
              <div class="kpi-foot"><span>支持连续队列审批</span></div>
            </article>
            <article class="kpi-card">
              <div class="kpi-head"><span>已通过归档报告</span><span class="workspace-tag green">已定稿</span></div>
              <div class="kpi-value">${totalAccepted}</div>
              <div class="kpi-foot"><span>OBS / AFI 终审通过</span></div>
            </article>
          </div>

          <div class="panel-card">
            <div class="panel-card-head">
              <div>
                <h3>全部项目执行与审核摘要清单</h3>
                <small>涵盖激活中项目、待启动项目及已完成归档项目</small>
              </div>
              <span class="workspace-count">${totalProjects} 个项目</span>
            </div>
            <div class="table-scroll">
              <table class="data-table">
                <thead>
                  <tr>
                    <th style="width:27%;">项目名称 / 基地</th>
                    <th style="width:12%;">标准 / 周期</th>
                    <th style="width:10%;">状态</th>
                    <th style="width:18%;">计划与任务进度</th>
                    <th style="width:15%;">待审 / 已通过报告</th>
                    <th style="width:18%;">操作</th>
                  </tr>
                </thead>
                <tbody>
                  ${allStats
                    .map(
                      ({ proj, st }) => `
                    <tr>
                      <td>
                        <button type="button" class="workspace-text-button cell-title" style="text-align:left;white-space:normal;" data-leader-drill-gantt="${proj.id}">${esc(proj.name)}</button>
                        <span class="cell-sub">${esc(proj.id)} · ${esc(getTenantName(proj.tenantId))} · 负责人：${esc(proj.owner)}</span>
                      </td>
                      <td>
                        <span class="workspace-tag">${esc(proj.standard)}</span>
                        <span class="cell-sub">${esc(proj.period)}</span>
                      </td>
                      <td><span class="proj-flag ${statusClass(proj.status)}">${proj.status === 'done' ? '已归档' : statusLabel(proj.status)}</span></td>
                      <td>
                        <div style="display:flex;justify-content:space-between;font-size:11.5px;margin-bottom:4px;">
                          <span>${st.plansCount} 阶段 · ${st.tasksDone}/${st.tasksCount} 任务</span>
                          <strong>${st.pct}%</strong>
                        </div>
                        <div class="bar-track"><div class="bar-fill ${proj.status === 'done' ? 'green' : 'blue'}" style="width:${st.pct}%"></div></div>
                      </td>
                      <td>
                        ${st.pendingDocs ? `<span class="workspace-tag yellow">待审 ${st.pendingDocs} 份</span>` : '<span class="workspace-tag">无待审</span>'}
                        <span class="cell-sub">已通过 ${st.acceptedDocs} · 驳回 ${st.rejectedDocs}</span>
                      </td>
                      <td>
                        <div class="action-links">
                          <button type="button" class="workspace-text-button primary-link" data-leader-drill-gantt="${proj.id}">查看甘特图</button>
                          <button type="button" class="workspace-text-button" data-leader-go-review="${proj.id}">审核队列</button>
                        </div>
                      </td>
                    </tr>
                  `
                    )
                    .join('')}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      `;
    }

    // 模式 B：单项目甘特图视图（默认当前电厂激活项目）
    const proj = scopedProjects.find((p) => p.id === sel) || defaultProj;
    if (!proj) {
      return `<section class="workspace-island"><div style="margin:auto;color:var(--ink-3);">当前电厂暂无评估项目</div></section>`;
    }
    const st = getProjectStats(proj);
    const projYear = Number(proj.year) || 2026;
    const [projStart, projEnd] = parseSpanRange(proj.period, projYear);
    let minMs = projStart;
    let maxMs = projEnd;
    (proj.plans || []).forEach((pl) => {
      const [ps, pe] = parseSpanRange(pl.window, projYear);
      minMs = Math.min(minMs, ps);
      maxMs = Math.max(maxMs, pe);
      (pl.tasks || []).forEach((tk) => {
        const [ts, te] = parseSpanRange(tk.time, projYear);
        minMs = Math.min(minMs, ts);
        maxMs = Math.max(maxMs, te);
      });
    });
    const totalMs = Math.max(86400000, maxMs - minMs);
    const ticks = [0, 0.25, 0.5, 0.75, 1].map((r) => formatShortDate(minMs + totalMs * r));
    const todayMs = new Date(2026, 10, 19).getTime(); // DEMO 基准日期 2026-11-19
    const showToday = todayMs >= minMs && todayMs <= maxMs;
    const todayPct = showToday ? ((todayMs - minMs) / totalMs) * 100 : -1;

    const calcBarPos = (spanStr) => {
      const [s, e] = parseSpanRange(spanStr, projYear);
      const left = Math.max(0, Math.min(96, ((s - minMs) / totalMs) * 100));
      const width = Math.max(5, Math.min(100 - left, ((e - s) / totalMs) * 100));
      return { left: left.toFixed(2), width: width.toFixed(2) };
    };

    const statusF = state.ganttStatusFilter || 'all';
    const modeF = state.ganttModeFilter || 'all';
    const filteredPlans = (proj.plans || []).filter((pl) => {
      if (modeF === 'quick' && !pl.quickMode) return false;
      if (modeF === 'standard' && pl.quickMode) return false;
      return true;
    });

    const ganttRowsHtml = filteredPlans.length
      ? filteredPlans
          .map((pl, pIdx) => {
            const pPos = calcBarPos(pl.window);
            const isCollapsed = !!state.ganttCollapsedPlans[pl.id];
            const visTasks = (pl.tasks || []).filter((tk) => statusF === 'all' || tk.status === statusF);
            const planAreasText = (pl.areas || []).join('、') || '全领域';
            const planTipBody = `计划负责人：${pl.lead || pl.members?.[0] || '未指定'}  |  领域：${planAreasText}  |  模式：${pl.quickMode ? '⚡ 快速模式（免审批）' : '标准审批模式'}  |  周期：${pl.window}`;
            const taskRows = isCollapsed
              ? ''
              : visTasks
                  .map((tk) => {
                    const tPos = calcBarPos(tk.time);
                    const tkTipBody = `执行人：${pl.quickMode ? (pl.lead || tk.assignee) : tk.assignee}  |  时间：${tk.time}  |  状态：${statusLabel(tk.status)}  |  输出 ${tk.outputsCount} 份（点击调整排期或打开文档）`;
                    return `
                  <div class="gantt-row task-row">
                    <div class="gantt-row-label">
                      <div class="gantt-row-title">
                        <span class="workspace-tag ${tk.type === 'AFI' ? 'purple' : 'blue'}" style="padding:1px 6px;font-size:10.5px;">${esc(tk.type)}</span>
                        <span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${esc(tk.name)}">${esc(tk.name)}</span>
                      </div>
                      <div class="gantt-row-meta">
                        <span>执行人：${esc(pl.quickMode ? (pl.lead || tk.assignee) : tk.assignee)}</span>
                        <span>·</span>
                        <span>${esc(tk.time)}</span>
                        <span>·</span>
                        <span>输出 ${tk.outputsCount} 份</span>
                      </div>
                    </div>
                    <div class="gantt-track">
                      ${showToday ? `<div class="gantt-today-line" style="left:${todayPct.toFixed(2)}%;"></div>` : ''}
                      <div class="gantt-bar ${tk.status}" style="left:${tPos.left}%;width:${tPos.width}%;" data-gantt-edit-proj="${proj.id}" data-gantt-edit-plan="${pl.id}" data-gantt-edit-task="${tk.id}" data-tip-title="${esc(tk.name)}" data-tip-body="${esc(tkTipBody)}">
                        <span>${statusLabel(tk.status)}</span>
                        <span style="opacity:0.85;">${esc(pl.quickMode ? (pl.lead || tk.assignee) : tk.assignee)}</span>
                      </div>
                    </div>
                  </div>
                `;
                  })
                  .join('');

            return `
              <div class="gantt-row phase-row">
                <div class="gantt-row-label">
                  <div class="gantt-row-title">
                    <button type="button" class="gantt-collapse-btn" data-gantt-toggle-plan="${pl.id}" title="${isCollapsed ? '展开任务' : '收起任务'}">${isCollapsed ? '▸' : '▾'}</button>
                    <span class="proj-flag ${statusClass(pl.status)}" style="padding:1px 7px;font-size:10.5px;">计划 ${pIdx + 1}</span>
                    ${pl.quickMode ? '<span class="workspace-tag green" style="padding:1px 6px;font-size:10px;">⚡快速</span>' : ''}
                    <span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${esc(pl.title)}">${esc(pl.title)}</span>
                  </div>
                  <div class="gantt-row-meta">
                    <span>计划负责人：<strong>${esc(pl.lead || pl.members?.[0] || '未指定')}</strong></span>
                    <span>·</span>
                    <span>${esc((pl.areas || []).map((a) => a.split(' ')[0]).join('/'))}</span>
                    <span>·</span>
                    <span>${visTasks.length}/${pl.tasks.length} 项任务</span>
                  </div>
                </div>
                <div class="gantt-track">
                  ${showToday ? `<div class="gantt-today-line" style="left:${todayPct.toFixed(2)}%;"></div>` : ''}
                  <div class="gantt-bar phase ${pl.status}" style="left:${pPos.left}%;width:${pPos.width}%;" data-gantt-toggle-plan="${pl.id}" data-tip-title="${esc(pl.title)}" data-tip-body="${esc(planTipBody)}">
                    ${pl.quickMode ? '⚡ ' : ''}${esc(pl.window)} · ${statusLabel(pl.status)}
                  </div>
                </div>
              </div>
              ${taskRows}
            `;
          })
          .join('')
      : `<div style="padding:48px 20px;text-align:center;color:var(--ink-3);font-size:13px;">当前筛选条件下暂无评估计划，可重置筛选或切换其他年度项目。</div>`;

    return `
      <section class="workspace-island scrollable">
        <div class="workspace-page-heading">
          <div>
            <h1>计划负责人总览 · ${proj.status === 'done' ? '已归档年度项目甘特图' : '评估计划与任务甘特图'}</h1>
            <p class="page-subtitle">${esc(proj.name)} · 默认全领域（${proj.areas.length} 领域） · ${esc(proj.standard)} · ${esc(getTenantName(proj.tenantId))}</p>
          </div>
          <div class="heading-actions">
            ${renderLeaderProjectSelect('leader-project-select', proj.id, true)}
            <button type="button" class="primary sm" data-leader-go-review="${proj.id}">
              进入审核工作台${st.pendingDocs ? `（${st.pendingDocs} 份待审）` : ''} →
            </button>
          </div>
        </div>

        <div class="kpi-grid" style="grid-template-columns:repeat(4,minmax(0,1fr));">
          <article class="kpi-card">
            <div class="kpi-head"><span>年度项目状态</span><span class="proj-flag ${statusClass(proj.status)}">${proj.status === 'done' ? '已归档' : statusLabel(proj.status)}</span></div>
            <div class="kpi-value" style="font-size:20px;">${esc(proj.period)}</div>
            <div class="kpi-foot"><span>全领域年度项目</span><span>${proj.areas.length} 大领域</span></div>
          </article>
          <article class="kpi-card">
            <div class="kpi-head"><span>下挂评估计划</span><span class="workspace-tag blue">Plan</span></div>
            <div class="kpi-value">${st.plansCount} 个计划</div>
            <div class="kpi-foot"><span>快速模式 ${(proj.plans || []).filter((x) => x.quickMode).length} 个 · 标准 ${(proj.plans || []).filter((x) => !x.quickMode).length} 个</span></div>
          </article>
          <article class="kpi-card">
            <div class="kpi-head"><span>任务完成进度</span><span class="workspace-tag green">${st.pct}%</span></div>
            <div class="kpi-value">${st.tasksDone} / ${st.tasksCount}</div>
            <div class="kpi-foot"><span>点击甘特条可调整状态与排期</span></div>
          </article>
          <article class="kpi-card">
            <div class="kpi-head"><span>项目待审核报告</span><span class="workspace-tag ${st.pendingDocs ? 'yellow' : 'green'}">${st.pendingDocs ? '待计划负责人审核' : '已清零'}</span></div>
            <div class="kpi-value">${st.pendingDocs} 份</div>
            <div class="kpi-foot"><span>已通过 ${st.acceptedDocs} · 已驳回 ${st.rejectedDocs}</span></div>
          </article>
        </div>

        <div class="gantt-filter-bar">
          <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
            <span style="font-size:12px;color:var(--ink-2);font-weight:600;">任务状态：</span>
            ${[
              { id: 'all', label: '全部' },
              { id: 'active', label: '进行中' },
              { id: 'pending', label: '待审查' },
              { id: 'done', label: '已完成' },
              { id: 'todo', label: '未开始' }
            ]
              .map((s) => `<button type="button" class="perm-tab sm ${statusF === s.id ? 'active' : ''}" data-gantt-status="${s.id}">${s.label}</button>`)
              .join('')}
          </div>
          <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
            <span style="font-size:12px;color:var(--ink-2);font-weight:600;">执行模式：</span>
            ${[
              { id: 'all', label: '全部模式' },
              { id: 'quick', label: '⚡ 快速模式' },
              { id: 'standard', label: '标准审批' }
            ]
              .map((m) => `<button type="button" class="perm-tab sm ${modeF === m.id ? 'active' : ''}" data-gantt-mode="${m.id}">${m.label}</button>`)
              .join('')}
          </div>
        </div>

        <div class="gantt-board">
          <div class="gantt-head">
            <div class="gantt-head-left">
              <span>评估计划与任务明细（点击条形交互）</span>
              <div style="display:inline-flex;gap:8px;font-size:11px;font-weight:400;">
                <span><i class="legend-dot" style="background:#3f7a5e;"></i>完成</span>
                <span><i class="legend-dot" style="background:#46618a;"></i>进行中</span>
                <span><i class="legend-dot" style="background:#c28e3c;"></i>待审</span>
                <span><i class="legend-dot" style="background:#dce2ea;"></i>未开始</span>
              </div>
            </div>
            <div class="gantt-scale" style="grid-template-columns:repeat(${ticks.length},minmax(0,1fr));">
              ${ticks.map((t) => `<div class="gantt-scale-tick">${esc(t)}</div>`).join('')}
              ${showToday ? `<span class="gantt-today-badge" style="left:${todayPct.toFixed(2)}%;">今日 11-19</span>` : ''}
            </div>
          </div>
          <div class="gantt-body">
            ${ganttRowsHtml}
          </div>
        </div>
      </section>
    `;
  }

  function openGanttTaskModal(projId, planId, taskId) {
    const proj = state.projects.find((p) => p.id === projId);
    const pl = proj?.plans?.find((x) => x.id === planId);
    const tk = pl?.tasks?.find((t) => t.id === taskId);
    if (!proj || !pl || !tk) return;

    openModal(`
      <div class="modal-head">
        <div>
          <h2>任务排期与状态交互 · ${esc(tk.id)}</h2>
          <span class="cell-sub">${esc(pl.title)} · 计划负责人：${esc(pl.lead || '未指定')}${pl.quickMode ? ' · ⚡ 快速模式（免审批）' : ''}</span>
        </div>
        <button type="button" class="modal-close" data-modal-close>×</button>
      </div>
      <div class="modal-body">
        <div class="field-group">
          <label>任务名称</label>
          <input id="gt-name" type="text" value="${esc(tk.name)}" />
        </div>
        <div class="form-grid-2">
          <div class="field-group">
            <label>当前状态</label>
            <select id="gt-status">
              <option value="todo" ${tk.status === 'todo' ? 'selected' : ''}>未开始</option>
              <option value="active" ${tk.status === 'active' ? 'selected' : ''}>进行中</option>
              <option value="pending" ${tk.status === 'pending' ? 'selected' : ''}>待审查</option>
              <option value="done" ${tk.status === 'done' ? 'selected' : ''}>已完成</option>
            </select>
          </div>
          <div class="field-group">
            <label>执行人</label>
            <input id="gt-assignee" type="text" value="${esc(pl.quickMode ? (pl.lead || tk.assignee) : tk.assignee)}" ${pl.quickMode ? 'readonly' : ''} />
          </div>
        </div>
        <div class="form-grid-2">
          <div class="field-group">
            <label>排期时间窗（MM-DD ~ MM-DD）</label>
            <input id="gt-time" type="text" value="${esc(tk.time)}" />
          </div>
          <div class="field-group">
            <label>所属领域（继承自计划）</label>
            <input type="text" value="${esc((pl.areas || []).join('、'))}" disabled />
          </div>
        </div>
      </div>
      <div class="modal-foot">
        ${
          pl.quickMode
            ? `<button type="button" class="ghost" id="btn-gt-ecm">↑ 直接提交至 ECM</button>`
            : `<button type="button" class="ghost" id="btn-gt-review">打开审核工作台 →</button>`
        }
        <button type="button" class="ghost" data-modal-close>取消</button>
        <button type="button" class="primary" id="btn-gt-save">保存排期与状态</button>
      </div>
    `);

    const ecmBtn = modalRoot.querySelector('#btn-gt-ecm');
    if (ecmBtn) {
      ecmBtn.addEventListener('click', () => {
        pl.ecmSubmitted = true;
        tk.status = 'done';
        closeModal();
        render();
        showToast(`快速模式：已由计划负责人「${pl.lead}」直接提交至 ECM（免审批）`);
      });
    }
    const revBtn = modalRoot.querySelector('#btn-gt-review');
    if (revBtn) {
      revBtn.addEventListener('click', () => {
        closeModal();
        state.leaderReviewProjectId = proj.id;
        state.leaderReviewStatus = 'submitted';
        state.leaderReviewInDoc = false;
        state.page = 'leader-review';
        render();
      });
    }
    modalRoot.querySelector('#btn-gt-save').addEventListener('click', () => {
      tk.name = modalRoot.querySelector('#gt-name').value.trim() || tk.name;
      tk.status = modalRoot.querySelector('#gt-status').value;
      tk.time = modalRoot.querySelector('#gt-time').value.trim() || tk.time;
      if (!pl.quickMode) tk.assignee = modalRoot.querySelector('#gt-assignee').value.trim() || tk.assignee;
      closeModal();
      render();
      showToast(`已更新任务「${tk.name}」的排期与状态`);
    });
  }

  function renderLeaderReviewPage() {
    const scopedProjects = getScopedProjects();
    const activeProj =
      scopedProjects.find((p) => p.id === state.leaderReviewProjectId) ||
      scopedProjects.find((p) => p.status === 'active') ||
      scopedProjects[0] ||
      null;
    if (activeProj) state.leaderReviewProjectId = activeProj.id;
    const projDocs = activeProj ? state.workspaceDocs.filter((d) => d.projectId === activeProj.id) : [];
    const pendingQueue = projDocs.filter((d) => d.status === 'submitted');
    const rejectedDocs = projDocs.filter((d) => d.status === 'rejected');
    const acceptedDocs = projDocs.filter((d) => d.status === 'accepted');

    // 模式 B：文档审核界面（顶部队列进度条 + 直接连续审核下一条）
    if (state.leaderReviewInDoc) {
      const currentDoc = state.workspaceDocs.find((d) => d.id === state.wbActiveDocId) || pendingQueue[0] || projDocs[0];
      if (!currentDoc) {
        state.leaderReviewInDoc = false;
        return renderLeaderReviewPage();
      }
      state.wbActiveDocId = currentDoc.id;
      state.wbViewMode = 'editor';
      state.wbReviewMode = true;

      const navList = pendingQueue.some((d) => d.id === currentDoc.id) ? pendingQueue : projDocs;
      const curIdx = navList.findIndex((d) => d.id === currentDoc.id);
      const isPendingItem = currentDoc.status === 'submitted';

      return `
        <div class="review-queue-bar">
          <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
            <button type="button" class="ghost sm" id="btn-leader-back-queue">← 返回待审核队列</button>
            <span class="workspace-tag blue">${esc(activeProj ? activeProj.name : '')}</span>
            <span class="review-queue-progress">
              ${
                isPendingItem
                  ? `待审队列：<strong>第 ${curIdx + 1} / ${pendingQueue.length} 份</strong>`
                  : `当前文档已处理（项目剩余 <strong>${pendingQueue.length}</strong> 份待审）`
              }
            </span>
          </div>
          <div style="display:flex;align-items:center;gap:8px;">
            <button type="button" class="ghost sm" id="btn-leader-prev-doc" ${curIdx <= 0 ? 'disabled' : ''}>← 上一份</button>
            <button type="button" class="ghost sm" id="btn-leader-next-doc" ${curIdx < 0 || curIdx >= navList.length - 1 ? 'disabled' : ''}>下一份 →</button>
            ${
              !isPendingItem && pendingQueue.length
                ? `<button type="button" class="primary sm" id="btn-leader-jump-pending">跳至下一份待审（${pendingQueue.length}）→</button>`
                : ''
            }
          </div>
        </div>
        ${renderWorkbenchPage()}
      `;
    }

    // 模式 A：审核工作台待审核队列列表
    const filteredDocs = projDocs.filter((d) => {
      if (state.leaderReviewStatus === 'all') return true;
      return d.status === state.leaderReviewStatus;
    });

    return `
      <section class="workspace-island">
        <div class="workspace-page-heading">
          <div>
            <h1>审核工作台 · 待审核队列</h1>
            <p class="page-subtitle">默认展示当前激活项目下的待审核报告；点击审核后进入文档界面，审核完毕可直接连续审核下一条</p>
          </div>
          <div class="heading-actions">
            ${renderLeaderProjectSelect('leader-review-project-select', state.leaderReviewProjectId, false)}
            <button type="button" class="primary" id="btn-leader-start-queue" ${pendingQueue.length ? '' : 'disabled'}>
              ${pendingQueue.length ? `开始连续审核（${pendingQueue.length} 份待审）→` : '当前项目无待审报告'}
            </button>
          </div>
        </div>

        <div class="perm-tabs">
          <button type="button" class="perm-tab ${state.leaderReviewStatus === 'submitted' ? 'active' : ''}" data-leader-rstatus="submitted">
            待审核队列 <span class="workspace-count">${pendingQueue.length}</span>
          </button>
          <button type="button" class="perm-tab ${state.leaderReviewStatus === 'rejected' ? 'active' : ''}" data-leader-rstatus="rejected">
            已驳回 <span class="workspace-count">${rejectedDocs.length}</span>
          </button>
          <button type="button" class="perm-tab ${state.leaderReviewStatus === 'accepted' ? 'active' : ''}" data-leader-rstatus="accepted">
            已通过 <span class="workspace-count">${acceptedDocs.length}</span>
          </button>
          <button type="button" class="perm-tab ${state.leaderReviewStatus === 'all' ? 'active' : ''}" data-leader-rstatus="all">
            全部报告 <span class="workspace-count">${projDocs.length}</span>
          </button>
        </div>

        <div class="table-scroll">
          <table class="data-table">
            <thead>
              <tr>
                <th style="width:40%;">报告标题与摘要</th>
                <th style="width:10%;">类型</th>
                <th style="width:18%;">所属阶段与任务</th>
                <th style="width:10%;">提交人 / 版本</th>
                <th style="width:10%;">状态</th>
                <th style="width:12%;">操作</th>
              </tr>
            </thead>
            <tbody>
              ${
                filteredDocs.length
                  ? filteredDocs
                      .map((d) => {
                        const excerpt = d.blocks?.[0]?.zh || d.scopeZh || '';
                        return `
                      <tr>
                        <td>
                          <button type="button" class="workspace-text-button cell-title" style="text-align:left;white-space:normal;font-size:13.5px;" data-leader-open-doc="${d.id}">${esc(d.titleZh)}</button>
                          <div class="clamp-2" style="font-size:12px;margin-top:3px;">${esc(excerpt)}</div>
                        </td>
                        <td><span class="workspace-tag ${d.docType === 'AFI' ? 'purple' : 'blue'}">${esc(d.docType)}</span></td>
                        <td>
                          <div style="font-size:12px;color:var(--ink-2);">${esc(d.taskName)}</div>
                          <span class="cell-sub">${esc(d.planTitle || '')}</span>
                        </td>
                        <td>
                          <div>${esc(d.author)}</div>
                          <span class="cell-sub">V${d.version} · ${esc(d.updatedAt)}</span>
                        </td>
                        <td><span class="proj-flag ${statusClass(d.status)}">${statusLabel(d.status)}</span></td>
                        <td>
                          <button type="button" class="${d.status === 'submitted' ? 'primary sm' : 'ghost sm'}" data-leader-open-doc="${d.id}">
                            ${d.status === 'submitted' ? '开始审核' : '查看文档'}
                          </button>
                        </td>
                      </tr>
                    `;
                      })
                      .join('')
                  : `<tr><td colspan="6" style="text-align:center;padding:48px;color:var(--ink-3);">当前筛选条件下暂无报告</td></tr>`
              }
            </tbody>
          </table>
        </div>
      </section>
    `;
  }

  // ==================== 8. 评估员专属：知识库查询（只读检索 + AI 问答 + 一键引用） ====================
  function renderAssessorKbPage() {
    const kw = state.assessorKbKeyword.trim().toLowerCase();
    const kbDocs = state.kbDocs.filter((d) => {
      if (state.globalTenant !== 'all' && d.tenantId !== 'all' && d.tenantId !== state.globalTenant) return false;
      if (state.assessorKbSource !== 'all' && d.sourceId !== state.assessorKbSource) return false;
      if (kw && !`${d.title} ${d.sourceName} ${d.dataType} ${d.usage} ${d.cleanedSnippet}`.toLowerCase().includes(kw)) return false;
      return true;
    });

    const criteriaList = D.CRITERIA_CATALOG.filter((c) => {
      if (state.assessorKbTier !== 'all' && c.tier !== state.assessorKbTier) return false;
      if (kw && !`${c.name} ${c.category} ${c.version} ${c.desc}`.toLowerCase().includes(kw)) return false;
      return true;
    });

    const tierLabel = (tier) => (tier === 'high' ? '行业标准' : tier === 'mid' ? '运行经验' : '电厂程序');
    const tierTagCls = (tier) => (tier === 'high' ? 'blue' : tier === 'mid' ? 'yellow' : 'green');

    return `
      <section class="workspace-island">
        <div class="workspace-page-heading">
          <div>
            <h1>知识库查询</h1>
            <p class="page-subtitle">检索 WANO PO&amp;C / IEEE 行业标准、SOER/SER 运行经验、BDX 电厂程序及 ECM / 人因 / 工单历史资料，支持 AI 语义问答与一键引用</p>
          </div>
          <div class="heading-actions">
            <span class="workspace-tag blue">可查资料 ${state.kbDocs.length} 份</span>
            <span class="workspace-tag purple">生效准则 ${D.CRITERIA_CATALOG.length} 部</span>
          </div>
        </div>

        <div class="kb-qa-layout">
          <div style="display:flex;flex-direction:column;min-height:0;">
            <div class="perm-tabs" style="margin-bottom:12px;padding-bottom:10px;">
              <button type="button" class="perm-tab sm ${state.assessorKbTab === 'docs' ? 'active' : ''}" data-akb-tab="docs">
                外部系统与历史资料 <span class="workspace-count">${kbDocs.length}</span>
              </button>
              <button type="button" class="perm-tab sm ${state.assessorKbTab === 'criteria' ? 'active' : ''}" data-akb-tab="criteria">
                评估准则与程序库 <span class="workspace-count">${criteriaList.length}</span>
              </button>
            </div>

            <div class="filter-bar" style="padding-bottom:12px;margin-bottom:12px;">
              ${
                state.assessorKbTab === 'docs'
                  ? `
                <div class="field-group" style="width:168px;">
                  <label>数据来源</label>
                  <select id="akb-source">
                    <option value="all">全部来源</option>
                    ${state.kbSources.map((s) => `<option value="${s.id}" ${state.assessorKbSource === s.id ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}
                  </select>
                </div>
              `
                  : `
                <div class="field-group" style="width:155px;">
                  <label>准则分类</label>
                  <select id="akb-tier">
                    <option value="all" ${state.assessorKbTier === 'all' ? 'selected' : ''}>全部分类</option>
                    <option value="high" ${state.assessorKbTier === 'high' ? 'selected' : ''}>行业标准（高）</option>
                    <option value="mid" ${state.assessorKbTier === 'mid' ? 'selected' : ''}>运行经验（中）</option>
                    <option value="low" ${state.assessorKbTier === 'low' ? 'selected' : ''}>电厂程序（低）</option>
                  </select>
                </div>
              `
              }
              <div class="field-group" style="flex:1;min-width:190px;">
                <label>关键词检索</label>
                <input id="akb-keyword" type="text" placeholder="搜索标准条文、KKS 编码、防异物、交接班、程序号…" value="${esc(state.assessorKbKeyword)}" />
              </div>
              <button type="button" class="ghost sm" id="btn-akb-reset">重置</button>
            </div>

            <div class="table-scroll" style="border:1px solid var(--line);border-radius:14px;">
              ${
                state.assessorKbTab === 'docs'
                  ? `
                <table class="data-table">
                  <thead>
                    <tr>
                      <th style="width:44%;">知识文档名称与摘要</th>
                      <th style="width:18%;">来源 / 类型</th>
                      <th style="width:18%;">归属用途</th>
                      <th style="width:20%;">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${
                      kbDocs.length
                        ? kbDocs
                            .map(
                              (d) => `
                          <tr>
                            <td>
                              <strong class="cell-title">${esc(d.title)}</strong>
                              <div class="clamp-2" style="font-size:11.5px;margin-top:3px;">${esc(d.cleanedSnippet)}</div>
                            </td>
                            <td>
                              <span class="workspace-tag">${esc(d.sourceName)}</span>
                              <span class="cell-sub">${esc(d.dataType)}</span>
                            </td>
                            <td>
                              <span class="workspace-tag ${d.usage.includes('AFI') ? 'purple' : 'blue'}">${esc(d.usage)}</span>
                              <span class="cell-sub">${d.chunks} 切片 · ${esc(d.updatedAt)}</span>
                            </td>
                            <td>
                              <div class="action-links">
                                <button type="button" class="workspace-text-button primary-link" data-akb-view-doc="${d.id}">查看全文</button>
                                <button type="button" class="workspace-text-button" data-akb-cite-doc="${d.id}">引用写 OBS</button>
                              </div>
                            </td>
                          </tr>
                        `
                            )
                            .join('')
                        : `<tr><td colspan="4" style="text-align:center;padding:42px;color:var(--ink-3);">暂无匹配知识文档</td></tr>`
                    }
                  </tbody>
                </table>
              `
                  : `
                <table class="data-table">
                  <thead>
                    <tr>
                      <th style="width:46%;">准则 / 程序名称与说明</th>
                      <th style="width:18%;">分类与版本</th>
                      <th style="width:14%;">条文数</th>
                      <th style="width:22%;">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${
                      criteriaList.length
                        ? criteriaList
                            .map(
                              (c) => `
                          <tr>
                            <td>
                              <strong class="cell-title">${esc(c.name)}</strong>
                              <div class="clamp-2" style="font-size:11.5px;margin-top:3px;">${esc(c.desc)}</div>
                            </td>
                            <td>
                              <span class="workspace-tag ${tierTagCls(c.tier)}">${tierLabel(c.tier)}</span>
                              <span class="cell-sub">${esc(c.category)} · ${esc(c.version)}</span>
                            </td>
                            <td><strong>${c.clauses}</strong> 条</td>
                            <td>
                              <div class="action-links">
                                <button type="button" class="workspace-text-button primary-link" data-akb-ask-criteria="${esc(c.name)}">AI 解读</button>
                                <button type="button" class="workspace-text-button" data-akb-cite-criteria="${c.id}">引用条款</button>
                              </div>
                            </td>
                          </tr>
                        `
                            )
                            .join('')
                        : `<tr><td colspan="4" style="text-align:center;padding:42px;color:var(--ink-3);">暂无匹配准则或程序</td></tr>`
                    }
                  </tbody>
                </table>
              `
              }
            </div>
          </div>

          <div class="qa-tester-card">
            <div class="qa-tester-head">
              <div>
                <strong style="font-size:13.5px;">AI 知识库语义检索问答</strong>
                <span class="cell-sub">自动按行业标准 → 运行经验 → 电厂程序优先级溯源</span>
              </div>
              <span class="workspace-tag green">在线</span>
            </div>
            <div class="qa-tester-messages" id="akb-messages-box">
              ${state.assessorKbMessages
                .map(
                  (m, idx) => `
                <div class="qa-bubble ${m.role}">
                  <div>${esc(m.text)}</div>
                  ${
                    m.cites && m.cites.length
                      ? `
                    <div class="qa-cite-list">
                      ${m.cites
                        .map(
                          (c) => `
                        <div class="qa-cite-item">
                          <span>[${esc(c.source)}] ${esc(c.doc)}</span>
                          <span class="workspace-tag ${c.tier === '高' ? 'blue' : c.tier === '中' ? 'yellow' : 'green'}">${esc(c.tier)} · ${c.score}</span>
                        </div>
                      `
                        )
                        .join('')}
                      <div style="margin-top:4px;display:flex;justify-content:flex-end;gap:10px;">
                        <button type="button" class="workspace-text-button primary-link" style="font-size:11.5px;" data-akb-use-answer="${idx}">＋ 引用至新建 OBS</button>
                      </div>
                    </div>
                  `
                      : ''
                  }
                </div>
              `
                )
                .join('')}
            </div>
            <div class="qa-tester-input">
              <div class="qa-presets">
                <button type="button" class="qa-preset-btn" data-akb-preset="主控室交接班对报警复诵的最高标准是什么？">主控室交接班标准</button>
                <button type="button" class="qa-preset-btn" data-akb-preset="防异物（FME）管控在 ECM 与工单中有哪些偏差？">FME 防异物历史偏差</button>
                <button type="button" class="qa-preset-btn" data-akb-preset="人因系统 SER/WER 对口头确认代替规程打勾的建议？">人因工具使用规范</button>
              </div>
              <form class="qa-input-row" id="akb-qa-form">
                <input id="akb-qa-input" type="text" placeholder="输入评估问题，如 PO&C OP.1 报警响应要求、FME 隔离标准…" />
                <button type="submit" class="primary sm">检索问答</button>
              </form>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  function openAssessorKbDocModal(docId) {
    const doc = state.kbDocs.find((d) => d.id === docId);
    if (!doc) return;
    openModal(
      `
      <div class="modal-head">
        <div>
          <h2>${esc(doc.title)}</h2>
          <span class="cell-sub">来源：${esc(doc.sourceName)} · ${esc(doc.dataType)} · ${esc(doc.usage)} · 共 ${doc.chunks} 个检索切片</span>
        </div>
        <button type="button" class="modal-close" data-modal-close>×</button>
      </div>
      <div class="modal-body">
        <div class="tag-list">
          <span class="workspace-tag blue">${esc(doc.sourceName)}</span>
          <span class="workspace-tag purple">${esc(doc.usage)}</span>
          ${doc.priority && doc.priority !== '—' ? `<span class="workspace-tag green">${esc(doc.priority)}</span>` : ''}
          <span class="workspace-tag">更新于 ${esc(doc.updatedAt)}</span>
        </div>
        <div>
          <strong style="display:block;font-size:12.5px;margin-bottom:6px;">清洗入库正文（结构化片段）</strong>
          <div class="clean-box after">${esc(doc.cleanedSnippet)}</div>
        </div>
        <div>
          <strong style="display:block;font-size:12.5px;margin-bottom:6px;color:var(--ink-2);">原始摘录参考</strong>
          <div class="clean-box">${esc(doc.rawSnippet)}</div>
        </div>
      </div>
      <div class="modal-foot">
        <button type="button" class="ghost" data-modal-close>关闭</button>
        <button type="button" class="primary" id="btn-akb-modal-cite">引用至新建 OBS 草稿</button>
      </div>
    `,
      { wide: true }
    );
    modalRoot.querySelector('#btn-akb-modal-cite').addEventListener('click', () => {
      closeModal();
      createObsFromText(`参考知识库资料：${doc.title}`, `依据「${doc.sourceName} · ${doc.title}」：\n${doc.cleanedSnippet}`, 'OP 运行');
    });
  }

  function createObsFromText(title, bodyText, area = 'OP 运行', taskName = '主控室与关键检修点现场观察记录撰写') {
    const id = 'DOC-OBS-' + Date.now().toString().slice(-4);
    const firstBlkId = 'blk-' + Date.now().toString().slice(-4);
    const activeProj = getScopedProjects().find((p) => p.status === 'active') || state.projects[0];
    state.workspaceDocs.unshift({
      id,
      projectId: activeProj ? activeProj.id : 'PRJ-2026-001',
      plantId: state.wanoCurrentPlantId,
      docType: 'OBS',
      reviewChecklist: { poc: false, objective: false, kks: false },
      titleEn: `Field Observation Draft: ${title}`,
      titleZh: title,
      status: 'draft',
      version: 1,
      author: currentAccount().name,
      collaborators: [currentAccount().initials],
      taskName,
      planTitle: activeProj?.plans?.[0]?.title || '现场观察与访谈阶段',
      updatedAt: '刚刚',
      updatedDate: '2026-11-19',
      timeBucket: 'today',
      scopeEn: 'Generated from assessor knowledge query / multimodal field capture.',
      scopeZh: `基于评估员知识检索与现场多模态采集生成（所属领域：${area}）。`,
      blocks: [
        {
          id: firstBlkId,
          area,
          label: '观察项 1',
          en: '',
          zh: bodyText,
          aiProposal: null
        }
      ],
      comments: []
    });
    state.wbActiveDocId = id;
    state.wbFocusedBlockId = firstBlkId;
    state.wbViewMode = 'editor';
    state.page = 'workbench';
    render();
    showToast('已生成 OBS 草稿并跳转至文档工作台编辑');
  }

  // ==================== 9. 评估员专属：多模态数据录入（录音 / 图片 / 视频 · 上传 + 实时录制/拍摄） ====================
  let activeCaptureCleanup = null;

  function cleanupActiveCapture() {
    if (typeof activeCaptureCleanup === 'function') {
      try { activeCaptureCleanup(); } catch (_) {}
      activeCaptureCleanup = null;
    }
  }

  function renderCaptureThumbSvg(rec) {
    if (rec.mediaUrl && rec.type === 'image') {
      return `<img src="${esc(rec.mediaUrl)}" alt="${esc(rec.title)}" class="capture-real-media" />`;
    }
    if (rec.mediaUrl && rec.type === 'video') {
      return `<video src="${esc(rec.mediaUrl)}" class="capture-real-media" muted playsinline preload="metadata"></video><span class="capture-play-badge">▶ ${esc(rec.duration || '视频')}</span>`;
    }
    if (rec.type === 'audio') {
      const isPlaying = state.playingAudioId === rec.id;
      const bars = [26, 44, 62, 38, 76, 54, 88, 48, 68, 34, 82, 58, 42, 72, 50, 30, 64, 46, 36, 54];
      return `
        <div class="capture-audio-stage ${isPlaying ? 'playing' : ''}">
          <div class="capture-audio-bars">
            ${bars.map((h, i) => `<span style="height:${h}%;animation-delay:${(i * 0.06).toFixed(2)}s;"></span>`).join('')}
          </div>
          <div class="capture-audio-bar-foot">
            <button type="button" class="capture-audio-play-btn" data-cap-play-audio="${rec.id}">${isPlaying ? '❚❚ 暂停试听' : '▶ 试听录音'}</button>
            <span>${esc(rec.duration || '00:30')} · ${esc(rec.format || 'WEBM')}</span>
          </div>
        </div>
      `;
    }
    if (rec.type === 'video') {
      return `
        <div class="capture-mock-visual video-bg">
          <svg viewBox="0 0 320 150" class="capture-mock-svg" aria-hidden="true">
            <rect width="320" height="150" fill="#182230" />
            <rect x="18" y="18" width="170" height="82" rx="6" fill="#233246" stroke="#3e5878" stroke-width="1.2" />
            <polyline points="28,82 54,68 78,74 102,48 128,58 154,36 178,42" fill="none" stroke="#56c297" stroke-width="2.2" />
            <circle cx="240" cy="42" r="10" fill="#c28e3c" opacity="0.85" />
            <circle cx="274" cy="42" r="10" fill="#3f7a5e" opacity="0.85" />
            <rect x="212" y="68" width="86" height="32" rx="5" fill="#26364b" />
            <rect x="222" y="78" width="46" height="5" rx="2.5" fill="#87a5c8" />
            <rect x="222" y="88" width="64" height="4" rx="2" fill="#516a88" />
            <rect x="18" y="114" width="284" height="20" rx="4" fill="rgba(255,255,255,0.08)" />
            <text x="28" y="128" fill="#d7e3f0" font-size="10.5" font-family="monospace">REC · ${esc(rec.kks || 'FIELD-CAM')} · ${esc(rec.sceneTag || '现场录像')}</text>
          </svg>
          <span class="capture-play-badge">▶ ${esc(rec.duration || '01:00')}</span>
        </div>
      `;
    }
    const isChart = (rec.title || '').includes('趋势') || (rec.title || '').includes('振动');
    return `
      <div class="capture-mock-visual photo-bg">
        <svg viewBox="0 0 320 150" class="capture-mock-svg" aria-hidden="true">
          <rect width="320" height="150" fill="${isChart ? '#1c2430' : '#eef2f6'}" />
          ${
            isChart
              ? `
            <line x1="24" y1="34" x2="296" y2="34" stroke="#b0544a" stroke-width="1.2" stroke-dasharray="4 3" />
            <text x="240" y="30" fill="#e88f85" font-size="9.5">预警 35μm</text>
            <polyline points="24,104 60,98 96,95 132,90 168,84 204,76 240,66 286,52" fill="none" stroke="#6fa8dc" stroke-width="2.6" />
            <circle cx="286" cy="52" r="4.5" fill="#e88f85" />
            <text x="24" y="132" fill="#b8c7d9" font-size="10" font-family="monospace">${esc(rec.kks || 'KKS')} · 14日振动监测截图</text>
          `
              : `
            <rect x="22" y="22" width="276" height="86" rx="8" fill="#dde4ec" stroke="#b8c4d4" stroke-width="1.4" />
            <rect x="42" y="38" width="104" height="54" rx="6" fill="#46618a" opacity="0.85" />
            <circle cx="94" cy="65" r="16" fill="#eef2f6" stroke="#2c3e55" stroke-width="3" />
            <rect x="166" y="36" width="112" height="26" rx="5" fill="#f7f0df" stroke="#c28e3c" stroke-width="1.2" />
            <text x="176" y="53" fill="#8a6430" font-size="10.5" font-weight="600">FME 1级隔离区</text>
            <rect x="166" y="70" width="112" height="22" rx="5" fill="#ffffff" stroke="#cfd7e2" />
            <text x="176" y="85" fill="#525860" font-size="9.5">${esc(rec.kks || '现场设备拍摄')}</text>
            <text x="24" y="132" fill="#525860" font-size="10" font-family="monospace">CAM · ${esc(rec.sceneTag || rec.kks || '现场照片')} · ${esc(rec.resolution || '4032×3024')}</text>
          `
          }
        </svg>
      </div>
    `;
  }

  function renderAssessorCapturePage() {
    const all = state.captureRecords;
    const kw = state.captureKeyword.trim().toLowerCase();
    const filtered = all.filter((r) => {
      if (state.captureTypeFilter !== 'all' && r.type !== state.captureTypeFilter) return false;
      if (state.captureModeFilter !== 'all' && r.captureMode !== state.captureModeFilter) return false;
      if (state.captureAreaFilter !== 'all' && !r.area.includes(state.captureAreaFilter)) return false;
      if (kw && !`${r.title} ${r.kks} ${r.area} ${r.taskName} ${r.aiSummary}`.toLowerCase().includes(kw)) return false;
      return true;
    });

    const audioCnt = all.filter((r) => r.type === 'audio').length;
    const imageCnt = all.filter((r) => r.type === 'image').length;
    const videoCnt = all.filter((r) => r.type === 'video').length;
    const linkedCnt = all.filter((r) => r.obsLinked).length;
    const typeLabel = (t) => (t === 'audio' ? '录音' : t === 'image' ? '图片' : '视频');
    const typeTagCls = (t) => (t === 'audio' ? 'purple' : t === 'image' ? 'blue' : 'green');

    return `
      <section class="workspace-island scrollable">
        <div class="workspace-page-heading">
          <div>
            <h1>多模态数据录入</h1>
            <p class="page-subtitle">支持现场录音、实时拍摄照片、现场录像及本地多模态文件上传，自动触发 AI 转写/视觉识别并一键转入 OBS 评估文档</p>
          </div>
          <div class="heading-actions">
            <button type="button" class="ghost sm" id="btn-cap-live-audio">● 实时录音</button>
            <button type="button" class="ghost sm" id="btn-cap-live-photo">◎ 现场拍摄</button>
            <button type="button" class="ghost sm" id="btn-cap-live-video">▶ 实时录像</button>
            <button type="button" class="primary sm" id="btn-cap-upload">↑ 上传多模态文件</button>
          </div>
        </div>

        <div class="capture-action-strip">
          <button type="button" class="capture-quick-tile" data-cap-quick="audio">
            <span class="capture-tile-icon purple">🎙</span>
            <div>
              <strong>实时录音采集</strong>
              <small>主控室访谈、工前会录音，自动 AI 语音转写</small>
            </div>
          </button>
          <button type="button" class="capture-quick-tile" data-cap-quick="photo">
            <span class="capture-tile-icon blue">📷</span>
            <div>
              <strong>现场实时拍摄</strong>
              <small>设备铭牌、FME 隔离区、仪表盘拍照与标注</small>
            </div>
          </button>
          <button type="button" class="capture-quick-tile" data-cap-quick="video">
            <span class="capture-tile-icon green">🎬</span>
            <div>
              <strong>现场实时录像</strong>
              <small>报警响应、操作监护、巡检过程录像取证</small>
            </div>
          </button>
          <button type="button" class="capture-quick-tile" data-cap-quick="upload">
            <span class="capture-tile-icon dark">⬆</span>
            <div>
              <strong>本地批量上传</strong>
              <small>导入 MP3/WAV、JPG/PNG、MP4/MOV 现场素材</small>
            </div>
          </button>
        </div>

        <div class="perm-tabs" style="margin-bottom:14px;padding-bottom:12px;">
          <button type="button" class="perm-tab sm ${state.captureTypeFilter === 'all' ? 'active' : ''}" data-cap-type="all">全部素材 <span class="workspace-count">${all.length}</span></button>
          <button type="button" class="perm-tab sm ${state.captureTypeFilter === 'audio' ? 'active' : ''}" data-cap-type="audio">录音 <span class="workspace-count">${audioCnt}</span></button>
          <button type="button" class="perm-tab sm ${state.captureTypeFilter === 'image' ? 'active' : ''}" data-cap-type="image">图片 <span class="workspace-count">${imageCnt}</span></button>
          <button type="button" class="perm-tab sm ${state.captureTypeFilter === 'video' ? 'active' : ''}" data-cap-type="video">视频 <span class="workspace-count">${videoCnt}</span></button>
          <span style="margin-left:auto;font-size:12px;color:var(--ink-3);align-self:center;">已转入 OBS 草稿：<strong>${linkedCnt}</strong> / ${all.length}</span>
        </div>

        <div class="filter-bar" style="padding-bottom:14px;margin-bottom:16px;">
          <div class="field-group" style="width:140px;">
            <label>采集方式</label>
            <select id="cap-mode-filter">
              <option value="all" ${state.captureModeFilter === 'all' ? 'selected' : ''}>全部方式</option>
              <option value="实时录制" ${state.captureModeFilter === '实时录制' ? 'selected' : ''}>实时录制</option>
              <option value="现场拍摄" ${state.captureModeFilter === '现场拍摄' ? 'selected' : ''}>现场拍摄</option>
              <option value="本地上传" ${state.captureModeFilter === '本地上传' ? 'selected' : ''}>本地上传</option>
            </select>
          </div>
          <div class="field-group" style="width:150px;">
            <label>所属领域</label>
            <select id="cap-area-filter">
              <option value="all" ${state.captureAreaFilter === 'all' ? 'selected' : ''}>全部领域</option>
              ${['OP', 'MA', 'EN', 'ER', 'RP', 'CH', 'NSC'].map((a) => `<option value="${a}" ${state.captureAreaFilter === a ? 'selected' : ''}>${a}</option>`).join('')}
            </select>
          </div>
          <div class="field-group" style="flex:1;min-width:220px;max-width:360px;">
            <label>素材检索</label>
            <input id="cap-keyword" type="text" placeholder="搜索素材标题、KKS 编码、任务名或 AI 摘要…" value="${esc(state.captureKeyword)}" />
          </div>
          <button type="button" class="ghost sm" id="btn-cap-reset">重置</button>
        </div>

        <div class="capture-grid">
          ${
            filtered.length
              ? filtered
                  .map(
                    (rec) => `
                <article class="capture-card">
                  <div class="capture-media-box">
                    ${renderCaptureThumbSvg(rec)}
                  </div>
                  <div class="capture-card-body">
                    <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;flex-wrap:wrap;">
                      <div class="tag-list">
                        <span class="workspace-tag ${typeTagCls(rec.type)}">${typeLabel(rec.type)}</span>
                        <span class="workspace-tag">${esc(rec.captureMode)}</span>
                        <span class="workspace-tag blue">${esc(rec.area)}</span>
                      </div>
                      <span class="proj-flag ${rec.obsLinked ? 'done' : 'pending'}" style="font-size:10.5px;">${rec.obsLinked ? '已关联 OBS' : '待转入'}</span>
                    </div>
                    <strong class="capture-card-title" data-cap-preview="${rec.id}">${esc(rec.title)}</strong>
                    <div class="capture-meta-line">
                      <span>KKS / 工单：${esc(rec.kks || '—')}</span>
                      <span>·</span>
                      <span>${esc(rec.capturedAt)}</span>
                      <span>·</span>
                      <span>${esc(rec.size || '—')}</span>
                    </div>
                    <div class="capture-ai-summary">
                      <strong>✦ AI 解析：</strong>${esc(rec.aiSummary)}
                    </div>
                    <div class="capture-card-foot">
                      <button type="button" class="ghost sm" data-cap-preview="${rec.id}">预览与详情</button>
                      <button type="button" class="primary sm" data-cap-to-obs="${rec.id}">转入 OBS 草稿 →</button>
                    </div>
                  </div>
                </article>
              `
                  )
                  .join('')
              : `<div style="grid-column:1/-1;text-align:center;padding:52px 20px;color:var(--ink-3);font-size:13px;">暂无匹配的多模态采集素材，可点击上方按钮进行实时录制、拍摄或上传</div>`
          }
        </div>
      </section>
    `;
  }

  function openCapturePreviewModal(recId) {
    const rec = state.captureRecords.find((r) => r.id === recId);
    if (!rec) return;
    const mediaHtml =
      rec.mediaUrl && rec.type === 'image'
        ? `<img src="${esc(rec.mediaUrl)}" alt="${esc(rec.title)}" style="width:100%;max-height:320px;object-fit:contain;border-radius:12px;background:#f3f5f8;" />`
        : rec.mediaUrl && rec.type === 'video'
          ? `<video src="${esc(rec.mediaUrl)}" controls style="width:100%;max-height:320px;border-radius:12px;background:#111;"></video>`
          : rec.mediaUrl && rec.type === 'audio'
            ? `<audio src="${esc(rec.mediaUrl)}" controls style="width:100%;"></audio>`
            : `<div style="border-radius:12px;overflow:hidden;border:1px solid var(--line);">${renderCaptureThumbSvg(rec)}</div>`;

    openModal(
      `
      <div class="modal-head">
        <div>
          <h2>${esc(rec.title)}</h2>
          <span class="cell-sub">${esc(rec.id)} · ${esc(rec.captureMode)} · ${esc(rec.area)} · KKS/工单：${esc(rec.kks || '—')} · ${esc(rec.capturedAt)}</span>
        </div>
        <button type="button" class="modal-close" data-modal-close>×</button>
      </div>
      <div class="modal-body">
        ${mediaHtml}
        <div class="capture-ai-summary" style="font-size:12.5px;padding:12px 14px;">
          <strong>✦ AI 多模态解析摘要：</strong>${esc(rec.aiSummary)}
        </div>
        ${
          rec.transcript
            ? `<div><strong style="display:block;font-size:12.5px;margin-bottom:6px;">语音转写文本</strong><div class="clean-box">${esc(rec.transcript)}</div></div>`
            : ''
        }
        <div style="display:flex;gap:14px;flex-wrap:wrap;font-size:12px;color:var(--ink-2);">
          <span>关联任务：<strong>${esc(rec.taskName || '未指定')}</strong></span>
          <span>采集人：<strong>${esc(rec.author)}</strong></span>
          <span>格式/规格：<strong>${esc(rec.format || '—')}${rec.resolution ? ` · ${esc(rec.resolution)}` : ''}${rec.duration ? ` · ${esc(rec.duration)}` : ''}</strong></span>
        </div>
      </div>
      <div class="modal-foot">
        <button type="button" class="ghost" data-modal-close>关闭</button>
        <button type="button" class="primary" id="btn-cap-modal-to-obs">一键转入 OBS 草稿 →</button>
      </div>
    `,
      { wide: true }
    );
    modalRoot.querySelector('#btn-cap-modal-to-obs').addEventListener('click', () => {
      closeModal();
      createObsFromCapture(rec);
    });
  }

  function createObsFromCapture(rec) {
    rec.obsLinked = true;
    const body =
      `【现场多模态证据 · ${rec.captureMode}（${rec.type === 'audio' ? '录音' : rec.type === 'image' ? '照片' : '视频'}）】\n` +
      `设备/工单标识：${rec.kks || '—'} · 采集时间：${rec.capturedAt}\n` +
      `AI 解析要点：${rec.aiSummary}` +
      (rec.transcript ? `\n\n【访谈/录音转写摘录】\n${rec.transcript}` : '');
    createObsFromText(`现场观察：${rec.title}`, body, rec.area, rec.taskName || '主控室与关键检修点现场观察记录撰写');
  }

  function openUploadCaptureModal() {
    cleanupActiveCapture();
    const tasks = getAssessorTasks();
    let pickedFile = null;
    let pickedUrl = '';
    let detectedType = 'image';

    openModal(
      `
      <div class="modal-head">
        <div>
          <h2>上传多模态现场数据</h2>
          <span class="cell-sub">支持上传现场录音（MP3/WAV/M4A/WEBM）、照片（JPG/PNG/WEBP）与视频（MP4/MOV/WEBM）</span>
        </div>
        <button type="button" class="modal-close" data-modal-close>×</button>
      </div>
      <div class="modal-body">
        <div class="upload-dropzone">
          <strong style="font-size:13px;">选择本地录音、图片或视频文件</strong>
          <span style="font-size:12px;color:var(--ink-3);">上传后将自动生成预览并触发 AI 语音转写 / 图像识别</span>
          <input type="file" id="cap-up-file" accept="audio/*,image/*,video/*" style="margin-top:6px;font-size:12px;" />
          <div id="cap-up-preview" style="width:100%;margin-top:8px;"></div>
        </div>
        <div class="form-grid-2">
          <div class="field-group">
            <label>素材标题 *</label>
            <input id="cap-up-title" type="text" placeholder="例如：1号机组主泵检修现场拍照" value="现场多模态巡检记录素材" />
          </div>
          <div class="field-group">
            <label>素材类型</label>
            <select id="cap-up-type">
              <option value="image">图片（照片 / 截图）</option>
              <option value="audio">录音（访谈 / 会议）</option>
              <option value="video">视频（操作 / 巡检）</option>
            </select>
          </div>
        </div>
        <div class="form-grid-2">
          <div class="field-group">
            <label>所属领域</label>
            <select id="cap-up-area">
              ${['OP 运行', 'MA 维修', 'EN 工程', 'ER 设备可靠性', 'RP 辐射防护', 'CH 化学', 'NSC 核安全文化'].map((a) => `<option value="${a}">${a}</option>`).join('')}
            </select>
          </div>
          <div class="field-group">
            <label>KKS 编码 / 工单号</label>
            <input id="cap-up-kks" type="text" placeholder="例如：1RCP001PO / WO-2026-88412" value="1RCP001PO" />
          </div>
        </div>
        <div class="field-group">
          <label>关联评估任务</label>
          <select id="cap-up-task">
            ${(tasks.length ? tasks : [{ name: '主控室与关键检修点现场观察记录撰写' }]).map((t) => `<option value="${esc(t.name)}">${esc(t.name)}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="modal-foot">
        <button type="button" class="ghost" data-modal-close>取消</button>
        <button type="button" class="primary" id="btn-cap-up-save">保存并 AI 解析</button>
      </div>
    `,
      { wide: true }
    );

    const fileInput = modalRoot.querySelector('#cap-up-file');
    const typeSel = modalRoot.querySelector('#cap-up-type');
    const titleInput = modalRoot.querySelector('#cap-up-title');
    const previewBox = modalRoot.querySelector('#cap-up-preview');

    fileInput.addEventListener('change', (e) => {
      const f = e.target.files?.[0];
      if (!f) return;
      pickedFile = f;
      if (pickedUrl) URL.revokeObjectURL(pickedUrl);
      pickedUrl = URL.createObjectURL(f);
      titleInput.value = f.name.replace(/\.[^.]+$/, '');
      if (f.type.startsWith('audio/')) detectedType = 'audio';
      else if (f.type.startsWith('video/')) detectedType = 'video';
      else detectedType = 'image';
      typeSel.value = detectedType;

      if (detectedType === 'image') {
        previewBox.innerHTML = `<img src="${pickedUrl}" style="max-height:170px;border-radius:10px;max-width:100%;" />`;
      } else if (detectedType === 'video') {
        previewBox.innerHTML = `<video src="${pickedUrl}" controls style="max-height:170px;border-radius:10px;max-width:100%;"></video>`;
      } else {
        previewBox.innerHTML = `<audio src="${pickedUrl}" controls style="width:100%;"></audio>`;
      }
    });

    modalRoot.querySelector('#btn-cap-up-save').addEventListener('click', () => {
      const title = titleInput.value.trim();
      if (!title) return showToast('请填写素材标题');
      const type = typeSel.value;
      const area = modalRoot.querySelector('#cap-up-area').value;
      const kks = modalRoot.querySelector('#cap-up-kks').value.trim() || '—';
      const taskName = modalRoot.querySelector('#cap-up-task').value;
      const nowStr = new Date().toISOString().slice(0, 16).replace('T', ' ');
      const sizeStr = pickedFile ? `${(pickedFile.size / 1024 / 1024).toFixed(2)} MB` : (type === 'video' ? '12.4 MB' : type === 'audio' ? '2.6 MB' : '1.8 MB');
      state.captureRecords.unshift({
        id: 'MM-2026-' + String(100 + state.captureRecords.length),
        type,
        title,
        captureMode: '本地上传',
        area,
        kks,
        taskName,
        capturedAt: nowStr,
        duration: type === 'image' ? undefined : '01:12',
        resolution: type === 'audio' ? undefined : '1920 × 1080',
        size: sizeStr,
        format: pickedFile ? (pickedFile.name.split('.').pop() || 'FILE').toUpperCase() : (type === 'audio' ? 'MP3' : type === 'video' ? 'MP4' : 'PNG'),
        author: currentAccount().name,
        tenantId: state.globalTenant,
        obsLinked: false,
        mediaUrl: pickedUrl || '',
        aiSummary:
          type === 'audio'
            ? `AI 语音转写完成：已提取「${title}」中的关键访谈问答与设备号 ${kks}，可一键转入 OBS 草稿。`
            : type === 'video'
              ? `AI 视频关键帧分析完成：已定位操作规程执行与现场监护关键片段（${kks}），支持直接作为 OBS 支撑证据。`
              : `AI 图像识别完成：已自动识别现场图片「${title}」中的设备标识 ${kks} 与安全状态要点。`,
        sceneTag: `${area.split(' ')[0]} 现场上传`
      });
      closeModal();
      render();
      showToast(`已上传多模态素材「${title}」`);
    });
  }

  function openLiveCaptureModal(mode) {
    cleanupActiveCapture();
    const tasks = getAssessorTasks();
    const isAudio = mode === 'audio';
    const isPhoto = mode === 'photo';
    const modeTitle = isAudio ? '实时录音采集' : isPhoto ? '现场实时拍摄（拍照）' : '现场实时录像采集';
    const defaultTitle = isAudio ? '现场访谈实时录音' : isPhoto ? '现场设备实时拍摄照片' : '现场操作实时录像';

    let mediaStream = null;
    let mediaRecorder = null;
    let recordedChunks = [];
    let capturedUrl = '';
    let isRecording = false;
    let simMode = false;
    let elapsedSec = 0;
    let timerId = null;

    const fmtSec = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

    const stopHardware = () => {
      if (timerId) { clearInterval(timerId); timerId = null; }
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        try { mediaRecorder.stop(); } catch (_) {}
      }
      if (mediaStream) {
        mediaStream.getTracks().forEach((tr) => tr.stop());
        mediaStream = null;
      }
    };
    activeCaptureCleanup = stopHardware;

    openModal(
      `
      <div class="modal-head">
        <div>
          <h2>${modeTitle}</h2>
          <span class="cell-sub">优先调用本机麦克风/摄像头；如浏览器未授权或无外设，将自动切换为现场模拟采集模式</span>
        </div>
        <button type="button" class="modal-close" data-modal-close>×</button>
      </div>
      <div class="modal-body">
        <div class="live-capture-stage" id="live-capture-stage">
          <video id="live-video-el" autoplay playsinline muted style="display:none;width:100%;max-height:240px;border-radius:10px;object-fit:cover;background:#111;"></video>
          <canvas id="live-canvas-el" style="display:none;"></canvas>
          <div id="live-sim-view" class="live-sim-view">
            <div class="live-rec-indicator" id="live-rec-indicator"><span class="live-rec-dot"></span><span id="live-status-text">准备就绪</span><strong id="live-timer">00:00</strong></div>
            <div style="font-size:12.5px;color:#cfd7e3;text-align:center;max-width:420px;" id="live-hint-text">
              ${isAudio ? '点击下方「开始录音」即可实时采集现场访谈与语音备忘' : isPhoto ? '点击下方「立即拍摄照片」采集带 KKS 水印的现场照片' : '点击下方「开始录像」实时录制现场操作与巡检视频'}
            </div>
          </div>
          <div id="live-result-preview" style="display:none;width:100%;"></div>
        </div>

        <div style="display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap;">
          ${
            isPhoto
              ? `<button type="button" class="primary" id="btn-live-snap">◎ 立即拍摄照片</button>
                 <button type="button" class="ghost sm" id="btn-live-retake" style="display:none;">重新拍摄</button>`
              : `<button type="button" class="primary" id="btn-live-start">● ${isAudio ? '开始录音' : '开始录像'}</button>
                 <button type="button" class="danger-solid" id="btn-live-stop" style="display:none;">■ 停止录制</button>`
          }
        </div>

        <div class="form-grid-2">
          <div class="field-group">
            <label>素材标题 *</label>
            <input id="live-title" type="text" value="${defaultTitle}_${new Date().toISOString().slice(5, 10)}" />
          </div>
          <div class="field-group">
            <label>所属领域</label>
            <select id="live-area">
              ${['OP 运行', 'MA 维修', 'EN 工程', 'ER 设备可靠性', 'RP 辐射防护', 'CH 化学', 'NSC 核安全文化'].map((a) => `<option value="${a}">${a}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="form-grid-2">
          <div class="field-group">
            <label>KKS 编码 / 工单号</label>
            <input id="live-kks" type="text" value="1RCP001PO" placeholder="设备编码或工单号" />
          </div>
          <div class="field-group">
            <label>关联评估任务</label>
            <select id="live-task">
              ${(tasks.length ? tasks : [{ name: '主控室与关键检修点现场观察记录撰写' }]).map((t) => `<option value="${esc(t.name)}">${esc(t.name)}</option>`).join('')}
            </select>
          </div>
        </div>
      </div>
      <div class="modal-foot">
        <button type="button" class="ghost" data-modal-close>取消</button>
        <button type="button" class="primary" id="btn-live-save" disabled>保存素材至录入库</button>
      </div>
    `,
      { wide: true }
    );

    const overlay = modalRoot.querySelector('[data-close-overlay]');
    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay || e.target.closest('[data-modal-close]')) cleanupActiveCapture();
      });
    }

    const videoEl = modalRoot.querySelector('#live-video-el');
    const canvasEl = modalRoot.querySelector('#live-canvas-el');
    const simView = modalRoot.querySelector('#live-sim-view');
    const statusText = modalRoot.querySelector('#live-status-text');
    const timerEl = modalRoot.querySelector('#live-timer');
    const hintText = modalRoot.querySelector('#live-hint-text');
    const recInd = modalRoot.querySelector('#live-rec-indicator');
    const resultBox = modalRoot.querySelector('#live-result-preview');
    const saveBtn = modalRoot.querySelector('#btn-live-save');

    async function ensureStream() {
      if (mediaStream || simMode) return;
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        simMode = true;
        return;
      }
      try {
        const constraints = isAudio ? { audio: true } : isPhoto ? { video: { facingMode: 'environment' } } : { video: true, audio: true };
        mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        if (!isAudio && videoEl) {
          videoEl.srcObject = mediaStream;
          videoEl.style.display = 'block';
          simView.style.display = 'none';
        }
      } catch (_) {
        simMode = true;
      }
    }

    if (isPhoto) {
      ensureStream();
      const snapBtn = modalRoot.querySelector('#btn-live-snap');
      const retakeBtn = modalRoot.querySelector('#btn-live-retake');
      snapBtn.addEventListener('click', async () => {
        await ensureStream();
        const kks = modalRoot.querySelector('#live-kks').value.trim() || '1RCP001PO';
        const area = modalRoot.querySelector('#live-area').value;
        const ts = new Date().toLocaleString('zh-CN', { hour12: false });
        canvasEl.width = 960;
        canvasEl.height = 540;
        const ctx = canvasEl.getContext('2d');
        if (!simMode && videoEl && videoEl.readyState >= 2) {
          ctx.drawImage(videoEl, 0, 0, canvasEl.width, canvasEl.height);
        } else {
          ctx.fillStyle = '#1b2635';
          ctx.fillRect(0, 0, 960, 540);
          ctx.strokeStyle = '#3f5a7a';
          ctx.lineWidth = 2;
          ctx.strokeRect(44, 44, 872, 400);
          ctx.fillStyle = '#293b52';
          ctx.fillRect(88, 94, 340, 260);
          ctx.fillStyle = '#3f7a5e';
          ctx.beginPath();
          ctx.arc(258, 224, 66, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#eef2f6';
          ctx.font = 'bold 26px sans-serif';
          ctx.fillText('现场拍摄取证快照（模拟）', 468, 172);
          ctx.fillStyle = '#a8bed8';
          ctx.font = '18px monospace';
          ctx.fillText(`KKS: ${kks}`, 468, 222);
          ctx.fillText(`AREA: ${area}`, 468, 258);
          ctx.fillText(`TIME: ${ts}`, 468, 294);
        }
        ctx.fillStyle = 'rgba(15, 20, 28, 0.72)';
        ctx.fillRect(0, 492, 960, 48);
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px monospace';
        ctx.fillText(`WANO 现场拍摄 · ${kks} · ${area} · ${ts}`, 22, 522);

        capturedUrl = canvasEl.toDataURL('image/png');
        videoEl.style.display = 'none';
        simView.style.display = 'none';
        resultBox.style.display = 'block';
        resultBox.innerHTML = `<img src="${capturedUrl}" style="width:100%;max-height:240px;object-fit:contain;border-radius:10px;" />`;
        snapBtn.style.display = 'none';
        retakeBtn.style.display = 'inline-flex';
        saveBtn.disabled = false;
        showToast(simMode ? '已生成模拟现场拍摄照片（无摄像头权限）' : '已拍摄现场照片');
      });
      retakeBtn.addEventListener('click', () => {
        capturedUrl = '';
        resultBox.style.display = 'none';
        if (!simMode && mediaStream) videoEl.style.display = 'block';
        else simView.style.display = 'flex';
        snapBtn.style.display = 'inline-flex';
        retakeBtn.style.display = 'none';
        saveBtn.disabled = true;
      });
    } else {
      const startBtn = modalRoot.querySelector('#btn-live-start');
      const stopBtn = modalRoot.querySelector('#btn-live-stop');
      startBtn.addEventListener('click', async () => {
        await ensureStream();
        isRecording = true;
        elapsedSec = 0;
        recordedChunks = [];
        capturedUrl = '';
        resultBox.style.display = 'none';
        if (isAudio || simMode) simView.style.display = 'flex';
        recInd.classList.add('recording');
        statusText.textContent = simMode ? (isAudio ? '模拟录音中' : '模拟录像中') : (isAudio ? '实时录音中' : '实时录像中');
        hintText.textContent = simMode ? '当前环境未检测到外设权限，已自动启用模拟实时录制' : '正在实时采集现场音视频数据，点击「停止录制」完成采集';
        timerEl.textContent = '00:00';
        startBtn.style.display = 'none';
        stopBtn.style.display = 'inline-flex';
        saveBtn.disabled = true;

        if (!simMode && mediaStream && typeof MediaRecorder !== 'undefined') {
          try {
            mediaRecorder = new MediaRecorder(mediaStream);
            mediaRecorder.ondataavailable = (ev) => { if (ev.data && ev.data.size > 0) recordedChunks.push(ev.data); };
            mediaRecorder.onstop = () => {
              if (recordedChunks.length) {
                const blob = new Blob(recordedChunks, { type: isAudio ? 'audio/webm' : 'video/webm' });
                capturedUrl = URL.createObjectURL(blob);
                resultBox.style.display = 'block';
                resultBox.innerHTML = isAudio
                  ? `<audio src="${capturedUrl}" controls style="width:100%;"></audio>`
                  : `<video src="${capturedUrl}" controls style="width:100%;max-height:220px;border-radius:10px;background:#111;"></video>`;
              }
            };
            mediaRecorder.start();
          } catch (_) {
            simMode = true;
          }
        }

        timerId = setInterval(() => {
          elapsedSec += 1;
          timerEl.textContent = fmtSec(elapsedSec);
        }, 1000);
      });

      stopBtn.addEventListener('click', () => {
        isRecording = false;
        stopHardware();
        recInd.classList.remove('recording');
        statusText.textContent = `已完成录制（${fmtSec(Math.max(1, elapsedSec))}）`;
        hintText.textContent = '采集完成！确认下方元数据后点击「保存素材至录入库」即可入库并触发 AI 解析。';
        startBtn.style.display = 'inline-flex';
        startBtn.textContent = isAudio ? '● 重新录音' : '● 重新录像';
        stopBtn.style.display = 'none';
        saveBtn.disabled = false;
      });
    }

    saveBtn.addEventListener('click', () => {
      if (isRecording) return showToast('请先停止当前录制');
      const title = modalRoot.querySelector('#live-title').value.trim();
      if (!title) return showToast('请填写素材标题');
      const area = modalRoot.querySelector('#live-area').value;
      const kks = modalRoot.querySelector('#live-kks').value.trim() || '—';
      const taskName = modalRoot.querySelector('#live-task').value;
      const nowStr = new Date().toISOString().slice(0, 16).replace('T', ' ');
      const dur = fmtSec(Math.max(1, elapsedSec));
      cleanupActiveCapture();

      state.captureRecords.unshift({
        id: 'MM-2026-' + String(100 + state.captureRecords.length),
        type: isAudio ? 'audio' : isPhoto ? 'image' : 'video',
        title,
        captureMode: isPhoto ? '现场拍摄' : '实时录制',
        area,
        kks,
        taskName,
        capturedAt: nowStr,
        duration: isPhoto ? undefined : dur,
        resolution: isAudio ? undefined : (isPhoto ? '960 × 540' : '1280 × 720'),
        size: isAudio ? '1.4 MB' : isPhoto ? '0.9 MB' : '8.2 MB',
        format: isAudio ? 'WEBM / 48kHz' : isPhoto ? 'PNG' : 'WEBM / 30fps',
        author: currentAccount().name,
        tenantId: state.globalTenant,
        obsLinked: false,
        mediaUrl: capturedUrl || '',
        aiSummary: isAudio
          ? `实时录音转写完成（时长 ${dur}）：已提取现场访谈要点并关联设备 ${kks}，支持一键转入 OBS 文档。`
          : isPhoto
            ? `现场拍摄图像解析完成：已标注设备 ${kks} 现场状态与合规核查要点，可作为 OBS 图像证据。`
            : `实时录像关键帧分析完成（时长 ${dur}）：已识别 ${area} 现场操作行为与规程执行关键帧（${kks}）。`,
        transcript: isAudio ? `【00:02 评估员】正在记录 ${area} 领域 ${kks} 现场观察与访谈要点，相关证据已同步归档。` : undefined,
        sceneTag: `${area.split(' ')[0]} · ${isPhoto ? '现场拍摄' : '实时录制'}`
      });
      closeModal();
      render();
      showToast(`已保存${isPhoto ? '现场拍摄照片' : isAudio ? '实时录音' : '实时录像'}「${title}」`);
    });
  }

  // ==================== 主渲染与事件绑定 ====================
  function render() {
    let mainHtml = '';
    if (state.page === 'leadership') mainHtml = renderLeadershipPage();
    else if (state.page === 'ops') mainHtml = renderOpsPage();
    else if (state.page === 'leader-overview') mainHtml = renderLeaderOverviewPage();
    else if (state.page === 'leader-review') mainHtml = renderLeaderReviewPage();
    else if (state.page === 'projects') mainHtml = renderProjectsPage();
    else if (state.page === 'project-detail') mainHtml = renderProjectDetailPage();
    else if (state.page === 'workbench') mainHtml = renderWorkbenchPage();
    else if (state.page === 'assessor-kb') mainHtml = renderAssessorKbPage();
    else if (state.page === 'assessor-capture') mainHtml = renderAssessorCapturePage();
    else if (state.page === 'wano-insights') mainHtml = renderWanoInsightsPage();
    else if (state.page === 'wano-plan') mainHtml = renderWanoPlanPage();
    else if (state.page === 'wano-oe') mainHtml = renderWanoOePage();
    else if (state.page === 'wano-epm') mainHtml = renderWanoEpmPage();
    else if (state.page === 'wano-exchange') mainHtml = renderWanoExchangePage();
    else if (state.page === 'tenants') mainHtml = renderTenantsPage();
    else if (state.page === 'knowledge') mainHtml = renderKnowledgePage();
    else if (state.page === 'documents') mainHtml = renderDocumentsPage();
    else if (state.page === 'permissions') mainHtml = renderPermissionsPage();

    appEl.innerHTML = `
      ${renderTopbar()}
      <main class="workspace-content">${mainHtml}</main>
      ${renderFloatingRoleSwitcher()}
    `;
    bindEvents();
  }

  let liveSyncTimer = null;

  function bindImeSearch(selector, onUpdate) {
    const el = appEl.querySelector(selector);
    if (!el) return;
    let composing = false;
    el.addEventListener('compositionstart', () => { composing = true; });
    el.addEventListener('compositionend', () => {
      composing = false;
      onUpdate(el.value);
      render();
      const next = appEl.querySelector(selector);
      if (next) { next.focus(); next.setSelectionRange(next.value.length, next.value.length); }
    });
    el.addEventListener('input', () => {
      if (composing) return;
      onUpdate(el.value);
      render();
      const next = appEl.querySelector(selector);
      if (next) { next.focus(); next.setSelectionRange(next.value.length, next.value.length); }
    });
  }

  function fitTitleSelectWidths() {
    appEl.querySelectorAll('.title-select-wrap select').forEach((sel) => {
      const opt = sel.options[sel.selectedIndex];
      if (!opt) return;
      const probe = document.createElement('span');
      const cs = window.getComputedStyle(sel);
      probe.style.cssText = `position:fixed;visibility:hidden;white-space:pre;font:${cs.font};letter-spacing:${cs.letterSpacing};`;
      probe.textContent = opt.textContent;
      document.body.appendChild(probe);
      sel.style.width = `${Math.ceil(probe.getBoundingClientRect().width) + 2}px`;
      probe.remove();
    });
  }

  function bindEvents() {
    fitTitleSelectWidths();
    // 左上角标题式机构/电厂切换下拉（研究院仅超管 / WANO 保持国际化与 WANO 角色 / 具体电厂支持自评估或 PR·PSUR）
    const topPlantSel = appEl.querySelector('#topbar-plant-select');
    if (topPlantSel) {
      topPlantSel.addEventListener('change', () => {
        const val = topPlantSel.value;
        if (val === 'org-institute') {
          state.orgScope = 'institute';
          state.portal = 'plant';
          state.globalTenant = 'all';
          const superAcc = D.DEMO_ACCOUNTS.find((a) => a.roleKey === 'super_admin') || D.DEMO_ACCOUNTS[0];
          state.currentAccountId = superAcc.id;
          state.page = superAcc.defaultPage;
          state.avatarMenuOpen = false;
          render();
          showToast('已切换至「研究院」（超级管理员视角，查看下属各核电厂情况）');
          return;
        }

        if (val === 'org-wano') {
          state.orgScope = 'wano';
          state.portal = 'wano';
          state.globalTenant = 'all';
          if (currentAccount().portal !== 'wano') {
            const wanoTl = D.DEMO_ACCOUNTS.find((a) => a.roleKey === 'wano_leader') || D.DEMO_ACCOUNTS.find((a) => a.portal === 'wano');
            if (wanoTl) {
              state.currentAccountId = wanoTl.id;
              state.page = wanoTl.defaultPage;
            }
          }
          state.wbLanguage = 'both';
          state.wbViewMode = 'list';
          state.avatarMenuOpen = false;
          render();
          showToast(wanoT(`Switched to WANO (${state.wanoPrCategory})`, `已切换至 WANO（${state.wanoPrCategory}）`));
          return;
        }

        state.orgScope = 'plant';
        const tenantToWanoPlant = { 'tn-qinshan': 'pl-a', 'tn-fuqing': 'pl-b' };
        const wanoPlantToTenant = { 'pl-a': 'tn-qinshan', 'pl-b': 'tn-fuqing' };
        if (isWanoRole()) {
          state.wanoCurrentPlantId = tenantToWanoPlant[val] || val;
          state.globalTenant = wanoPlantToTenant[state.wanoCurrentPlantId] || 'tn-qinshan';
          const pl = D.WANO_PLANT_MATRIX.find((p) => p.id === state.wanoCurrentPlantId);
          render();
          showToast(wanoT(`Switched plant: ${wanoPlantLabel(pl)}`, `已切换受评电厂：${pl?.realName || ''}`));
        } else {
          state.globalTenant = val;
          const scopedProjs = state.projects.filter((p) => p.tenantId === state.globalTenant);
          const firstActive = scopedProjs.find((p) => p.status === 'active') || scopedProjs[0];
          if (firstActive) {
            state.leaderProjectId = firstActive.id;
            state.leaderReviewProjectId = firstActive.id;
          }
          if (currentAccount().roleKey === 'super_admin') {
            const tenantAdmin = D.DEMO_ACCOUNTS.find((a) => a.roleKey === 'tenant_admin') || D.DEMO_ACCOUNTS[1];
            state.portal = 'plant';
            state.currentAccountId = tenantAdmin.id;
            state.page = tenantAdmin.defaultPage;
            render();
            showToast(`已切换电厂：${getTenantName(state.globalTenant)}（已自动切换为${displayRoleLabel(tenantAdmin)}）`);
            return;
          }
          render();
          showToast(`已切换电厂：${getTenantName(state.globalTenant)}`);
        }
      });
    }

    // 左上角标题式模式切换（自评估 / PR / PSUR）
    const portalSel = appEl.querySelector('#portal-mode-select');
    if (portalSel) {
      portalSel.addEventListener('change', () => {
        const val = portalSel.value;
        const nextPortal = val === 'self' ? 'plant' : 'wano';
        const prevPortal = state.portal;
        state.portal = nextPortal;
        if (val === 'pr') state.wanoPrCategory = 'PR';
        if (val === 'psur') state.wanoPrCategory = 'PSUR';
        if (nextPortal !== prevPortal) {
          const firstAcc =
            D.DEMO_ACCOUNTS.find((a) => a.portal === nextPortal && a.roleKey !== 'super_admin') ||
            D.DEMO_ACCOUNTS[1];
          state.currentAccountId = firstAcc.id;
          if (nextPortal === 'plant' && state.globalTenant === 'all') {
            state.globalTenant = firstAcc.tenantId;
          }
          state.wbFromProjectId = null;
          state.wbFilters.taskName = '';
          state.wbReviewMode = firstAcc.roleKey === 'leader';
          state.wbViewMode = 'list';
          state.leaderReviewInDoc = false;
          state.wbRightTab = firstAcc.roleKey === 'leader' ? 'leader_review' : 'collab';
          state.wbLanguage = firstAcc.portal === 'wano' ? 'both' : 'zh';
          state.page = firstAcc.defaultPage;
        }
        state.avatarMenuOpen = false;
        render();
        showToast(val === 'self' ? '已切换至自评估（电厂端）' : wanoT(`Switched to WANO ${state.wanoPrCategory} Mode`, `已切换至 WANO ${state.wanoPrCategory} 模式`));
      });
    }

    // 右上角纯头像点击展开/收起菜单
    const avatarBtn = appEl.querySelector('#btn-avatar-menu');
    if (avatarBtn) {
      avatarBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        state.avatarMenuOpen = !state.avatarMenuOpen;
        render();
      });
    }
    const avatarMenu = appEl.querySelector('#avatar-popover-menu');
    if (avatarMenu) {
      avatarMenu.addEventListener('click', (e) => e.stopPropagation());
    }

    // 右下角角色切换下拉
    const roleSel = appEl.querySelector('#role-account-select');
    if (roleSel) {
      roleSel.addEventListener('change', () => {
        const nextAcc = D.DEMO_ACCOUNTS.find((a) => a.id === roleSel.value);
        if (!nextAcc) return;
        state.portal = nextAcc.portal;
        state.currentAccountId = nextAcc.id;
        if (nextAcc.roleKey === 'super_admin') {
          state.globalTenant = 'all';
        } else if (state.globalTenant === 'all' && nextAcc.tenantId !== 'all') {
          state.globalTenant = nextAcc.tenantId;
        }
        state.wbFromProjectId = null;
        state.wbFilters.taskName = '';
        state.wbReviewMode = nextAcc.roleKey === 'leader';
        state.wbViewMode = 'list';
        state.leaderReviewInDoc = false;
        state.wbRightTab = nextAcc.roleKey === 'leader' ? 'leader_review' : 'collab';
        state.wbLanguage = nextAcc.portal === 'wano' ? 'both' : 'zh';
        state.page = nextAcc.defaultPage;
        render();
        showToast(
          nextAcc.portal === 'wano'
            ? `Switched WANO Role: ${nextAcc.roleLabel} · ${nextAcc.name}`
            : `已切换用户：${nextAcc.name}（${displayRoleLabel(nextAcc)}）`
        );
      });
    }

    // WANO 新增 OKR 模块事件（PR/PSUR、Exit PPT、OE/SOER/WER、EPM/AOC/PPSE、FACTs 打包 AFI & 导入 Word）
    const prCatBtn = appEl.querySelector('#btn-wano-toggle-prcat');
    if (prCatBtn) {
      prCatBtn.addEventListener('click', () => {
        state.wanoPrCategory = state.wanoPrCategory === 'PR' ? 'PSUR' : 'PR';
        render();
        showToast(wanoT(`Switched PO&C standard to ${state.wanoPrCategory} mode`, `已切换至 ${state.wanoPrCategory} PO&C 标准模式`));
      });
    }
    const exitPptBtn = appEl.querySelector('#btn-wano-gen-exit-ppt');
    if (exitPptBtn) {
      exitPptBtn.addEventListener('click', () => showToast(wanoT('Generated Exit Meeting PPT & Team Leader Final Report (.pptx/.docx)', '已生成出口会议 PPT 与队长最终评估报告')));
    }
    appEl.querySelectorAll('[data-wano-oetab]').forEach((btn) => {
      btn.addEventListener('click', () => { state.wanoOeTab = btn.dataset.wanoOetab; render(); });
    });
    const g016Btn = appEl.querySelector('#btn-wano-g016-ppt');
    if (g016Btn) g016Btn.addEventListener('click', () => showToast(wanoT('Exported G-0-16 SOER Review Summary PPT & updated SOER Dashboard', '已导出 G-0-16 SOER 评审总结 PPT 并更新看板')));
    const oeRptBtn = appEl.querySelector('#btn-wano-oe-rpt');
    if (oeRptBtn) oeRptBtn.addEventListener('click', () => showToast(wanoT('Generated OE Operating Experience Feedback Report', '已基于 WER/RPT 检索生成经验反馈报告')));
    const genWerBtn = appEl.querySelector('#btn-wano-gen-wer');
    if (genWerBtn) {
      genWerBtn.addEventListener('click', () => {
        const id = 'WER-2026-0' + (42 + state.wanoOeEvents.length);
        state.wanoOeEvents.unshift({
          id,
          plantId: state.wanoCurrentPlantId,
          sourceType: 'Plant Root Cause (16p → M01 2p WER)',
          level: 'N',
          title: 'Generated M01 2-Page WER: EDG Surveillance Test Procedure Deviation',
          titleZh: 'M01 自动改写 2 页 WER：应急柴油机定期试验规程执行偏差',
          pocPrimary: 'OP.1',
          pocSecondary: 'EN.2',
          system: 'LHP / Emergency Diesel',
          wacCode: 'WAC-3310',
          keywords: ['EDG', 'M01 Rewrite', 'Surveillance'],
          rating: 'yellow',
          status: 'done'
        });
        render();
        showToast(wanoT(`Converted Root Cause report into 2-page ${id}`, `已按 M01 规则自动改写生成 2 页 ${id}`));
      });
    }
    appEl.querySelectorAll('[data-wano-epmtab]').forEach((btn) => {
      btn.addEventListener('click', () => { state.wanoEpmTab = btn.dataset.wanoEpmtab; render(); });
    });
    const addAocBtn = appEl.querySelector('#btn-wano-add-aoc');
    if (addAocBtn) {
      addAocBtn.addEventListener('click', () => {
        const id = 'AOC-2026-0' + (state.wanoEpmAocs.length + 1);
        state.wanoEpmAocs.unshift({
          id,
          source: 'Developed via GDAR Rules',
          area: 'HU.1 · Human Performance',
          title: 'Low-Power Procedure Place-Keeping Consistency Across Crews',
          gdarImpact: 'Increases risk of mis-positioning during infrequent low-power evolutions.',
          effectiveness: 'Needs Action',
          priority: 'New AOC'
        });
        render();
        showToast(wanoT(`Developed ${id} using GDAR rules`, `已按 GDAR 规则新建 ${id}`));
      });
    }
    const expPpseBtn = appEl.querySelector('#btn-wano-export-ppse');
    if (expPpseBtn) expPpseBtn.addEventListener('click', () => showToast(wanoT('Exported integrated PPSE Report (AMI + SOER + OE + PR)', '已导出汇聚 AMI/SOER/OE/PR 的 PPSE 综合报告')));
    const impWordBtn = appEl.querySelector('#btn-wano-import-word');
    if (impWordBtn) impWordBtn.addEventListener('click', () => showToast(wanoT('Imported Word FACTs & auto-replaced matching entries in Experience Repo', '已导入含 FACTs 的 Word 文档并自动替换知识库对应条目')));
    const bundleAfiBtn = appEl.querySelector('#btn-wano-bundle-afi');
    if (bundleAfiBtn) {
      bundleAfiBtn.addEventListener('click', () => {
        const id = 'DOC-AFI-BND-' + Date.now().toString().slice(-3);
        const firstBlkId = 'blk-bnd-1';
        state.workspaceDocs.unshift({
          id,
          projectId: 'PRJ-2026-001',
          plantId: state.wanoCurrentPlantId,
          docType: 'AFI',
          reviewChecklist: { poc: true, objective: false, kks: false },
          titleEn: `${state.wanoPrCategory} Bundled AFI Draft: Operational Fundamentals & Alarm Rigor`,
          titleZh: `${state.wanoPrCategory} FACTs 打包生成 AFI 初稿：运行基本功与报警管控严谨性`,
          status: 'draft',
          version: 1,
          author: currentAccount().name,
          collaborators: [currentAccount().initials, 'RM'],
          taskName: 'Bundled from Verified FACTs (4-Part AFI Template)',
          planTitle: `WANO ${state.wanoPrCategory} Field Phase`,
          updatedAt: 'Just now',
          updatedDate: '2026-11-19',
          timeBucket: 'today',
          scopeEn: `Auto-synthesized from verified FACTs under ${state.wanoPrCategory} PO&C OP.1.`,
          scopeZh: `由多条已审核 FACTs 自动归纳打包生成（${state.wanoPrCategory} PO&C OP.1）。`,
          blocks: [
            { id: firstBlkId, area: 'OP.1', label: '1. Problem Statement & Current Status', en: 'Operating crews did not consistently demonstrate three-way readback and alarm rigor during shift turnover.', zh: '运行班组在交接班期间未能持续落实三向交流复诵与报警严谨管控。', aiProposal: null },
            { id: 'blk-bnd-2', area: 'OP.1', label: '2. Causes, Contributing Factors & Supporting Facts', en: 'Insufficient supervisor coaching; supported by 3 MCR shift turnover FACTs and 2 HPMS observations.', zh: '值长现场指导频次不足；支持事实汇聚自 3 条主控室交接班 FACTs 与 2 条人因观察。', aiProposal: null }
          ],
          comments: []
        });
        state.wbActiveDocId = id;
        state.wbFocusedBlockId = firstBlkId;
        state.wbViewMode = 'editor';
        render();
        showToast(wanoT('Bundled FACTs into structured 4-part AFI draft', '已将多条 FACTs 打包归纳为 AFI 初稿并打开编辑'));
      });
    }

    // WANO 专属顶栏语言切换与全局受评电厂切换（仅 WANO 角色可见）
    appEl.querySelectorAll('[data-wano-ui-lang]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.wanoUiLang = btn.dataset.wanoUiLang;
        render();
      });
    });
    const wanoGlobalPlantSel = appEl.querySelector('#wano-global-plant-select');
    if (wanoGlobalPlantSel) {
      wanoGlobalPlantSel.addEventListener('change', () => {
        state.wanoCurrentPlantId = wanoGlobalPlantSel.value;
        render();
        const pl = D.WANO_PLANT_MATRIX.find((p) => p.id === state.wanoCurrentPlantId);
        showToast(wanoT(`Switched active mission plant to ${pl?.anonCode || ''}`, `已切换当前评审电厂：${pl?.realName || ''}`));
      });
    }

    // WANO 视角切换（当前评估电厂 / 全球电厂）与受评电厂切换
    appEl.querySelectorAll('[data-wano-scope]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.wanoScope = btn.dataset.wanoScope;
        render();
      });
    });
    const wanoPlantSel = appEl.querySelector('#wano-plant-select');
    if (wanoPlantSel) {
      wanoPlantSel.addEventListener('change', () => {
        state.wanoCurrentPlantId = wanoPlantSel.value;
        render();
      });
    }
    appEl.querySelectorAll('[data-wano-drill-plant]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.wanoCurrentPlantId = btn.dataset.wanoDrillPlant;
        state.wanoScope = 'current_plant';
        render();
      });
    });

    // WANO 机群洞察事件
    const anonBtn = appEl.querySelector('#btn-wano-toggle-anon');
    if (anonBtn) {
      anonBtn.addEventListener('click', () => {
        state.wanoAnonMode = !state.wanoAnonMode;
        render();
      });
    }
    appEl.querySelectorAll('[data-wano-distill]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const item = state.wanoCommonAfis.find((a) => a.id === btn.dataset.wanoDistill);
        if (item) {
          item.distilled = true;
          render();
          showToast(wanoT(`Distilled ${item.poc} common AFI into WANO OE Library`, `已将 ${item.poc} 共性 AFI 沉淀至 WANO 经验反馈库`));
        }
      });
    });

    // WANO 脱敏导入导出事件
    appEl.querySelectorAll('[data-wano-rule]').forEach((chk) => {
      chk.addEventListener('change', () => {
        state.wanoSanitizeRules[chk.dataset.wanoRule] = chk.checked;
        render();
      });
    });
    const wanoExpBtn = appEl.querySelector('#btn-wano-export-pkg');
    if (wanoExpBtn) {
      wanoExpBtn.addEventListener('click', () => {
        const pkgId = 'PKG-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + String(state.wanoSanitizationLogs.length + 1).padStart(2, '0');
        const payload = {
          schema: 'WANO-PR-PSUR-SANITIZED-V1',
          packageId: pkgId,
          exportedAt: new Date().toISOString(),
          exportedBy: currentAccount().name,
          sanitizationRules: state.wanoSanitizeRules,
          documents: state.workspaceDocs.map((d) => ({
            id: d.id,
            docType: d.docType,
            titleEn: d.titleEn,
            titleZh: d.titleZh,
            scopeEn: d.scopeEn.replace(/Qinshan Phase II Unit 1/gi, '[PLANT-A]'),
            blocks: d.blocks.map((b) => ({
              area: b.area,
              en: b.en.replace(/1RCP001PO|WO-2026-88412/g, '[REDACTED-ID]'),
              zh: b.zh.replace(/1RCP001PO|WO-2026-88412/g, '[已脱敏编码]')
            }))
          }))
        };
        triggerDownload(`WANO_Sanitized_PR_Package_${pkgId}.json`, JSON.stringify(payload, null, 2), 'application/json;charset=utf-8;');
        state.wanoSanitizationLogs.unshift({
          id: pkgId,
          direction: 'Export (Plant → WANO)',
          mission: 'PR 2026 · Plant-A (Sanitized)',
          docs: `${state.workspaceDocs.length} OBS/AFI Docs`,
          redactedItems: 162,
          operator: currentAccount().name,
          time: 'Just now',
          status: 'done'
        });
        render();
        showToast(wanoT(`Exported sanitized package ${pkgId}.json (zero PII/intranet IDs)`, `已导出脱敏包 ${pkgId}.json，可用于离场后报告编写`));
      });
    }
    const importSanitizedPkg = (sourceLabel) => {
      const pkgId = 'PKG-IMP-' + Date.now().toString().slice(-4);
      const newDocId = 'DOC-WANO-' + Date.now().toString().slice(-3);
      state.workspaceDocs.unshift({
        id: newDocId,
        projectId: 'PRJ-2026-001',
        docType: 'AFI',
        sanitized: true,
        titleEn: `Post-PR Sanitized AFI Draft (${sourceLabel})`,
        titleZh: `PR 离场脱敏汇总 AFI 草稿（${sourceLabel}）`,
        status: 'draft',
        version: 1,
        author: currentAccount().name,
        collaborators: ['RM', '周'],
        taskName: 'Post-PR Sanitized Package Authoring & OE Distillation',
        planTitle: 'Offline WANO PR / PSUR Report Finalization',
        updatedAt: 'Just now',
        scopeEn: 'Imported from sanitized air-gapped PR package [PLANT-A]. All staff PII and plant-specific KKS/WO numbers redacted; PO&C OP.1 & MA.2 conclusions preserved.',
        scopeZh: '导入自物理隔离脱敏包 [PLANT-A]。已剥离人员隐私与电厂专属 KKS/工单编号，完整保留现场观察与访谈结论及 PO&C OP.1 / MA.2 条款依据。',
        blocks: [
          {
            id: 'blk-imp-1',
            area: 'OP.1',
            label: 'Imported Observation Conclusion',
            en: 'Across 3 MCR shift turnovers at [PLANT-A], oncoming operators did not consistently repeat alarm setpoints and trend values per WANO PO&C OP.1-03.',
            zh: '在 [PLANT-A] 连续 3 次主控室交接班现场观察中，接班操纵员未能持续按照 WANO PO&C OP.1-03 完整复诵报警定值与趋势。',
            aiProposal: null
          },
          {
            id: 'blk-imp-2',
            area: 'MA.2',
            label: 'Imported Interview Synthesis',
            en: 'Maintenance supervisor interviews confirmed FME secondary tool verification relied on single-person sign-off during peak outage windows.',
            zh: '维修主管访谈结论表明，大修高峰窗口期防异物（FME）二次工具清点仍存在单人签字把关现象。',
            aiProposal: null
          }
        ],
        comments: []
      });
      state.wanoSanitizationLogs.unshift({
        id: pkgId,
        direction: 'Import (Post-PR Authoring)',
        mission: `Imported · ${sourceLabel}`,
        docs: '1 Sanitized AFI Draft (2 Conclusions)',
        redactedItems: 96,
        operator: currentAccount().name,
        time: 'Just now',
        status: 'done'
      });
      state.wbActiveDocId = newDocId;
      state.wbViewMode = 'editor';
      state.wbLanguage = 'both';
      state.page = 'workbench';
      render();
      showToast(wanoT(`Imported sanitized package & opened in Bilingual Workbench`, `已导入脱敏包并在双语工作台中打开，可继续编写报告与沉淀经验`));
    };
    const wanoImpSimBtn = appEl.querySelector('#btn-wano-import-sim');
    if (wanoImpSimBtn) wanoImpSimBtn.addEventListener('click', () => importSanitizedPkg('Plant-A PR 2026'));
    const wanoUpBtn = appEl.querySelector('#btn-wano-upload-json');
    const wanoUpFile = appEl.querySelector('#wano-import-file');
    if (wanoUpBtn && wanoUpFile) {
      wanoUpBtn.addEventListener('click', () => wanoUpFile.click());
      wanoUpFile.addEventListener('change', (e) => {
        const f = e.target.files?.[0];
        if (f) importSanitizedPkg(f.name);
      });
    }

    // 顶栏 Tab 导航
    appEl.querySelectorAll('[data-nav]').forEach((el) => {
      el.addEventListener('click', () => {
        state.wbFromProjectId = null;
        state.wbReviewMode = currentAccount().roleKey === 'leader';
        if (el.dataset.nav === 'workbench') state.wbViewMode = 'list';
        if (el.dataset.nav === 'leader-review') state.leaderReviewInDoc = false;
        state.page = el.dataset.nav;
        render();
      });
    });

    // 队长总览 & 审核工作台事件
    const leaderProjSel = appEl.querySelector('#leader-project-select');
    if (leaderProjSel) {
      leaderProjSel.addEventListener('change', () => {
        state.leaderProjectId = leaderProjSel.value;
        if (state.leaderProjectId !== 'all') state.leaderReviewProjectId = state.leaderProjectId;
        render();
      });
    }
    appEl.querySelectorAll('[data-leader-drill-gantt]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.leaderProjectId = btn.dataset.leaderDrillGantt;
        state.leaderReviewProjectId = state.leaderProjectId;
        render();
      });
    });
    appEl.querySelectorAll('[data-leader-go-review]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.leaderReviewProjectId = btn.dataset.leaderGoReview;
        state.leaderReviewStatus = 'submitted';
        state.leaderReviewInDoc = false;
        state.page = 'leader-review';
        render();
      });
    });
    appEl.querySelectorAll('[data-gantt-task]').forEach((bar) => {
      bar.addEventListener('click', () => {
        state.leaderReviewProjectId = bar.dataset.ganttTask;
        state.leaderReviewStatus = 'submitted';
        state.leaderReviewInDoc = false;
        state.page = 'leader-review';
        render();
        showToast('已跳转至该项目的审核工作台队列');
      });
    });
    const leaderRevProjSel = appEl.querySelector('#leader-review-project-select');
    if (leaderRevProjSel) {
      leaderRevProjSel.addEventListener('change', () => {
        state.leaderReviewProjectId = leaderRevProjSel.value;
        state.leaderReviewInDoc = false;
        render();
      });
    }
    appEl.querySelectorAll('[data-leader-rstatus]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.leaderReviewStatus = btn.dataset.leaderRstatus;
        render();
      });
    });
    const openLeaderDoc = (docId) => {
      const target = state.workspaceDocs.find((d) => d.id === docId);
      if (!target) return;
      state.wbActiveDocId = target.id;
      state.wbFocusedBlockId = target.blocks?.[0]?.id || null;
      state.wbViewMode = 'editor';
      state.wbReviewMode = true;
      state.wbRightTab = 'leader_review';
      state.leaderReviewInDoc = true;
      render();
    };
    const startQueueBtn = appEl.querySelector('#btn-leader-start-queue');
    if (startQueueBtn) {
      startQueueBtn.addEventListener('click', () => {
        const firstPending = state.workspaceDocs.find((d) => d.projectId === state.leaderReviewProjectId && d.status === 'submitted');
        if (firstPending) openLeaderDoc(firstPending.id);
      });
    }
    appEl.querySelectorAll('[data-leader-open-doc]').forEach((btn) => {
      btn.addEventListener('click', () => openLeaderDoc(btn.dataset.leaderOpenDoc));
    });
    const leaderBackQueueBtn = appEl.querySelector('#btn-leader-back-queue');
    if (leaderBackQueueBtn) {
      leaderBackQueueBtn.addEventListener('click', () => {
        state.leaderReviewInDoc = false;
        render();
      });
    }
    const navigateLeaderQueue = (delta) => {
      const projDocs = state.workspaceDocs.filter((d) => d.projectId === state.leaderReviewProjectId);
      const pending = projDocs.filter((d) => d.status === 'submitted');
      const navList = pending.some((d) => d.id === state.wbActiveDocId) ? pending : projDocs;
      const idx = navList.findIndex((d) => d.id === state.wbActiveDocId);
      const next = navList[idx + delta];
      if (next) openLeaderDoc(next.id);
    };
    const leaderPrevBtn = appEl.querySelector('#btn-leader-prev-doc');
    if (leaderPrevBtn) leaderPrevBtn.addEventListener('click', () => navigateLeaderQueue(-1));
    const leaderNextBtn = appEl.querySelector('#btn-leader-next-doc');
    if (leaderNextBtn) leaderNextBtn.addEventListener('click', () => navigateLeaderQueue(1));
    const leaderJumpPendingBtn = appEl.querySelector('#btn-leader-jump-pending');
    if (leaderJumpPendingBtn) {
      leaderJumpPendingBtn.addEventListener('click', () => {
        const nextPending = state.workspaceDocs.find((d) => d.projectId === state.leaderReviewProjectId && d.status === 'submitted');
        if (nextPending) openLeaderDoc(nextPending.id);
      });
    }

    const tenantSel = appEl.querySelector('#global-tenant-select');
    if (tenantSel) {
      tenantSel.addEventListener('change', () => {
        state.globalTenant = tenantSel.value;
        render();
        showToast(`已切换租户视图：${getTenantName(state.globalTenant)}`);
      });
    }

    // 运营统计事件
    appEl.querySelectorAll('[data-analytics-view]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.analyticsView = btn.dataset.analyticsView;
        render();
      });
    });
    appEl.querySelectorAll('[data-range]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.analyticsRange = btn.dataset.range;
        render();
      });
    });
    appEl.querySelectorAll('[data-open-tenant]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.page = 'tenants';
        render();
        openTenantConfigDrawer(btn.dataset.openTenant, 'agents');
      });
    });

    // 项目管理事件
    ['standard', 'area', 'year'].forEach((key) => {
      const el = appEl.querySelector(`#pf-${key}`);
      if (el) {
        el.addEventListener('change', () => {
          state.projectFilters[key] = el.value;
          render();
        });
      }
    });
    bindImeSearch('#pf-keyword', (val) => { state.projectFilters.keyword = val; });
    const pfReset = appEl.querySelector('#btn-pf-reset');
    if (pfReset) {
      pfReset.addEventListener('click', () => {
        state.projectFilters = { standard: '', area: '', year: '', keyword: '' };
        render();
      });
    }
    appEl.querySelectorAll('[data-open-project]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.activeProjectId = btn.dataset.openProject;
        const p = state.projects.find((x) => x.id === state.activeProjectId);
        state.activePlanId = p?.plans?.[0]?.id || null;
        state.page = 'project-detail';
        render();
      });
    });
    appEl.querySelectorAll('[data-review-project]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const pid = btn.dataset.reviewProject;
        state.activeProjectId = pid;
        state.wbFromProjectId = pid;
        state.wbFilters.taskName = '';
        state.wbReviewMode = true;
        state.wbRightTab = 'leader_review';
        const firstPending = state.workspaceDocs.find((d) => d.projectId === pid && d.status === 'submitted') || state.workspaceDocs.find((d) => d.projectId === pid);
        if (firstPending) {
          state.wbActiveDocId = firstPending.id;
          state.wbViewMode = 'editor';
        } else {
          state.wbViewMode = 'list';
        }
        state.page = 'workbench';
        render();
      });
    });
    const importProjBtn = appEl.querySelector('#btn-import-projects');
    if (importProjBtn) importProjBtn.addEventListener('click', openProjectImportModal);
    const exportProjBtn = appEl.querySelector('#btn-export-projects');
    if (exportProjBtn) exportProjBtn.addEventListener('click', () => openProjectExportModal(null));
    const newProjBtn = appEl.querySelector('#btn-new-project');
    if (newProjBtn) {
      newProjBtn.addEventListener('click', () => {
        const allAreas = D.ALL_PROJECT_AREAS || ['OP 运行', 'MA 维修', 'EN 工程', 'ER 设备可靠性', 'RP 辐射防护', 'CH 化学', 'NSC 核安全文化'];
        openModal(`
          <div class="modal-head"><div><h2>新增年度自评估项目</h2><span class="cell-sub">电厂每年固定建立一个全领域年度自评估项目，具体评估计划挂在该项目下</span></div><button type="button" class="modal-close" data-modal-close>×</button></div>
          <div class="modal-body">
            <div class="field-group"><label>年度项目名称 *</label><input id="np-name" placeholder="例如：2027 年度秦山核电基地自评估项目" value="2027 年度${esc(getTenantName(state.globalTenant === 'all' ? 'tn-qinshan' : state.globalTenant))}自评估项目" /></div>
            <div class="form-grid-2">
              <div class="field-group"><label>${isPlantSelfMode() ? '所属电厂' : '所属租户'}</label><select id="np-tenant" ${isPlantSelfMode() ? 'disabled' : ''}>${(isPlantSelfMode() ? state.tenants.filter((t) => t.id === state.globalTenant) : state.tenants).map((t) => `<option value="${t.id}" ${t.id === state.globalTenant ? 'selected' : ''}>${esc(t.name)}</option>`).join('')}</select></div>
              <div class="field-group"><label>评估年份</label><select id="np-year"><option value="2027" selected>2027</option><option value="2026">2026</option><option value="2028">2028</option></select></div>
            </div>
            <div class="form-grid-2">
              <div class="field-group"><label>适用标准</label><select id="np-std"><option>WANO PO&C 2022-1</option><option>WANO PO&C 2019-1</option><option>IEEE Std 603</option></select></div>
              <div class="field-group"><label>覆盖领域（默认全领域）</label><input type="text" value="全领域（${allAreas.length} 大领域，下挂计划按需勾选）" disabled /></div>
            </div>
            <div class="field-group"><label>项目描述</label><textarea id="np-desc" placeholder="年度自评估项目范围与统筹目标">电厂年度固定全领域自评估项目，统筹本年度各时间窗、单一或多领域专项评估计划。</textarea></div>
          </div>
          <div class="modal-foot"><button type="button" class="ghost" data-modal-close>取消</button><button type="button" class="primary" id="btn-np-save">创建年度项目</button></div>
        `);
        modalRoot.querySelector('#btn-np-save').addEventListener('click', () => {
          const name = modalRoot.querySelector('#np-name').value.trim();
          if (!name) return showToast('请填写年度项目名称');
          const yr = modalRoot.querySelector('#np-year').value;
          state.projects.unshift({
            id: `PRJ-${yr}-` + String(10 + state.projects.length),
            tenantId: modalRoot.querySelector('#np-tenant').value,
            name,
            description: modalRoot.querySelector('#np-desc').value.trim() || '年度固定全领域自评估项目。',
            standard: modalRoot.querySelector('#np-std').value,
            areas: [...allAreas],
            isAllAreas: true,
            year: yr,
            owner: currentAccount().name,
            status: 'active',
            period: `${yr}-01-01 ~ ${yr}-12-31`,
            plans: []
          });
          closeModal();
          render();
          showToast(`年度项目「${name}」（默认全领域）创建成功`);
        });
      });
    }

    // 项目详情事件
    appEl.querySelectorAll('[data-select-plan]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.activePlanId = btn.dataset.selectPlan;
        render();
      });
    });
    appEl.querySelectorAll('[data-open-task-wb]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const proj = state.projects.find((x) => x.id === state.activeProjectId);
        const pl = proj?.plans?.find((x) => x.id === state.activePlanId);
        const tk = pl?.tasks?.find((t) => t.id === btn.dataset.openTaskWb);
        state.wbFromProjectId = state.activeProjectId;
        state.wbFilters.taskName = tk ? tk.name : '';
        state.wbViewMode = 'list';
        state.wbReviewMode = currentAccount().roleKey === 'leader';
        state.page = 'workbench';
        render();
      });
    });
    const exportSingleBtn = appEl.querySelector('#btn-export-single-project');
    if (exportSingleBtn) {
      exportSingleBtn.addEventListener('click', () => {
        const p = state.projects.find((x) => x.id === state.activeProjectId);
        if (p) openProjectExportModal(p);
      });
    }
    const openDocWb = appEl.querySelector('#btn-open-doc-workbench');
    if (openDocWb) {
      openDocWb.addEventListener('click', () => {
        state.wbFromProjectId = state.activeProjectId;
        state.wbFilters.taskName = '';
        state.wbViewMode = 'list';
        state.wbReviewMode = currentAccount().roleKey === 'leader';
        state.page = 'workbench';
        render();
      });
    }
    const addTaskBtn = appEl.querySelector('#btn-mock-add-task');
    if (addTaskBtn) {
      addTaskBtn.addEventListener('click', () => {
        const p = state.projects.find((x) => x.id === state.activeProjectId);
        const pl = p?.plans.find((x) => x.id === state.activePlanId);
        if (pl) {
          pl.tasks.push({
            id: 'TSK-' + (300 + pl.tasks.length),
            name: '新增现场核查与证据复核任务',
            assignee: '待领取',
            time: '11-21 ~ 11-28',
            status: 'todo',
            outputsCount: 0,
            type: 'OBS'
          });
          render();
          showToast('已新增任务（待领取）');
        }
      });
    }

    // 文档工作台事件（评估员任务闭环 + IME 安全筛选 + 焦点段落 AI Diff/撤销 + 手动译文闭环 + 防抖锁定 Live Sync + 连续审批）
    const wbBackBtn = appEl.querySelector('#btn-wb-back-project');
    if (wbBackBtn) {
      wbBackBtn.addEventListener('click', () => {
        state.page = 'project-detail';
        render();
      });
    }
    const wbBackListBtn = appEl.querySelector('#btn-wb-back-list');
    if (wbBackListBtn) {
      wbBackListBtn.addEventListener('click', () => {
        state.wbViewMode = 'list';
        render();
      });
    }
    const clearTaskFilter = () => {
      state.wbFilters.taskName = '';
      render();
    };
    const clearTaskBtn1 = appEl.querySelector('#btn-wb-clear-task');
    const clearTaskBtn2 = appEl.querySelector('#btn-wb-clear-task-inline');
    if (clearTaskBtn1) clearTaskBtn1.addEventListener('click', clearTaskFilter);
    if (clearTaskBtn2) clearTaskBtn2.addEventListener('click', clearTaskFilter);

    const openPendingBtn = appEl.querySelector('#btn-wb-open-pending-queue');
    if (openPendingBtn) {
      openPendingBtn.addEventListener('click', () => {
        const nextDoc = state.workspaceDocs.find((d) => d.status === 'submitted');
        if (nextDoc) {
          state.wbActiveDocId = nextDoc.id;
          state.wbViewMode = 'editor';
          state.wbRightTab = 'leader_review';
          render();
        }
      });
    }

    // 评估员任务条事件：认领 / 按任务筛选 / 基于任务新建文档
    appEl.querySelectorAll('[data-wb-claim-task]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const tkId = btn.dataset.wbClaimTask;
        state.projects.forEach((p) =>
          (p.plans || []).forEach((pl) =>
            (pl.tasks || []).forEach((tk) => {
              if (tk.id === tkId) {
                tk.assignee = currentAccount().name;
                tk.status = 'active';
              }
            })
          )
        );
        render();
        showToast('已认领任务，可直接点击「＋ 写文档」开始撰写');
      });
    });
    appEl.querySelectorAll('[data-wb-filter-task]').forEach((el) => {
      el.addEventListener('click', () => {
        const tName = el.dataset.wbFilterTask;
        state.wbFilters.taskName = state.wbFilters.taskName === tName ? '' : tName;
        render();
      });
    });

    const openCreateDocModal = (presetTask = '1 号机组主控室交接班与报警响应现场观察', presetType = 'OBS') => {
      openModal(`
        <div class="modal-head"><h2>${wanoT('Create PR/PSUR Draft', '创建评估文档')}</h2><button type="button" class="modal-close" data-modal-close>×</button></div>
        <div class="modal-body">
          <div class="form-grid-2">
            <div class="field-group"><label>${wanoT('Doc Type', '文档类型')}</label><select id="wb-new-type"><option value="OBS" ${presetType === 'OBS' ? 'selected' : ''}>OBS（观察记录）</option><option value="AFI" ${presetType === 'AFI' ? 'selected' : ''}>AFI（待改进领域报告）</option></select></div>
            <div class="field-group"><label>${wanoT('Linked Task', '关联任务')}</label><input id="wb-new-task" value="${esc(presetTask)}" /></div>
          </div>
          <div class="field-group"><label>${wanoT('Document Title *', '文档标题 *')}</label><input id="wb-new-title" placeholder="${wanoT('Enter draft title', '输入文档标题')}" /></div>
        </div>
        <div class="modal-foot"><button type="button" class="ghost" data-modal-close>${wanoT('Cancel', '取消')}</button><button type="button" class="primary" id="btn-wb-new-save">${wanoT('Create & Edit', '创建并进入编辑')}</button></div>
      `);
      modalRoot.querySelector('#btn-wb-new-save').addEventListener('click', () => {
        const title = modalRoot.querySelector('#wb-new-title').value.trim();
        const docType = modalRoot.querySelector('#wb-new-type').value;
        if (!title) return showToast('请输入文档标题');
        const id = 'DOC-' + docType + '-' + Date.now().toString().slice(-3);
        const firstBlkId = 'blk-' + Date.now();
        state.workspaceDocs.unshift({
          id,
          projectId: state.wbFromProjectId || 'PRJ-2026-001',
          plantId: state.wanoCurrentPlantId,
          docType,
          reviewChecklist: { poc: false, objective: false, kks: false },
          titleZh: title,
          titleEn: isWanoRole() ? title : `Draft ${docType} Report`,
          status: 'draft',
          version: 1,
          author: currentAccount().name,
          collaborators: [currentAccount().initials],
          taskName: modalRoot.querySelector('#wb-new-task').value.trim() || '未关联任务',
          planTitle: '第二阶段：主控室与现场维修观察访谈',
          updatedAt: '2026-11-19 刚刚',
          updatedDate: '2026-11-19',
          timeBucket: 'today',
          scopeZh: '请输入现场观察范围或适用准则说明…',
          scopeEn: 'Enter observation scope or applicable PO&C criteria...',
          blocks: [{ id: firstBlkId, area: 'OP 运行', label: docType === 'AFI' ? '问题陈述 / Problem Statement' : '观察项 1', zh: '', en: '', aiProposal: null }],
          comments: []
        });
        state.wbActiveDocId = id;
        state.wbFocusedBlockId = firstBlkId;
        state.wbViewMode = 'editor';
        closeModal();
        render();
        showToast(`已创建 ${docType} 文档「${title}」，已进入编辑界面`);
      });
    };

    appEl.querySelectorAll('[data-wb-create-for-task]').forEach((btn) => {
      btn.addEventListener('click', () => openCreateDocModal(btn.dataset.wbCreateForTask, btn.dataset.wbCreateType));
    });
    const createWbDocBtn = appEl.querySelector('#btn-wb-create-doc');
    if (createWbDocBtn) createWbDocBtn.addEventListener('click', () => openCreateDocModal(state.wbFilters.taskName || '1 号机组主控室交接班与报警响应现场观察', 'OBS'));

    ['type', 'status', 'time'].forEach((k) => {
      const el = appEl.querySelector(`#wbf-${k}`);
      if (el) el.addEventListener('change', () => { state.wbFilters[k] = el.value; render(); });
    });
    bindImeSearch('#wbf-keyword', (val) => { state.wbFilters.keyword = val; });

    const wbfReset = appEl.querySelector('#btn-wbf-reset');
    if (wbfReset) {
      wbfReset.addEventListener('click', () => {
        state.wbFilters = { type: 'ALL', status: 'all', time: 'all', keyword: '', taskName: '' };
        render();
      });
    }
    appEl.querySelectorAll('[data-wb-open-doc]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.wbActiveDocId = btn.dataset.wbOpenDoc;
        const doc = state.workspaceDocs.find((d) => d.id === state.wbActiveDocId);
        state.wbFocusedBlockId = doc?.blocks?.[0]?.id || null;
        state.wbViewMode = 'editor';
        if (currentAccount().roleKey === 'leader') state.wbRightTab = 'leader_review';
        render();
      });
    });
    appEl.querySelectorAll('[data-wb-lang]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.wbLanguage = btn.dataset.wbLang;
        render();
      });
    });
    appEl.querySelectorAll('[data-wb-rtab]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.wbRightTab = btn.dataset.wbRtab;
        render();
      });
    });

    const liveSyncBtn = appEl.querySelector('#btn-wano-live-sync');
    if (liveSyncBtn) {
      liveSyncBtn.addEventListener('click', () => {
        state.wanoLiveSync = !state.wanoLiveSync;
        render();
        showToast(state.wanoLiveSync ? wanoT('Live EN ↔ ZH Sync enabled (450ms debounce)', '已开启防抖实时中英互译') : wanoT('Live Sync paused', '已关闭实时互译'));
      });
    }

    const activeDoc = state.workspaceDocs.find((d) => d.id === state.wbActiveDocId);
    if (activeDoc && state.wbViewMode === 'editor') {
      if (!activeDoc.reviewChecklist) activeDoc.reviewChecklist = { poc: false, objective: false, kks: false };

      // 段落文本框随内容自动撑高，彻底消除内部滚动条
      const autoResizeTextarea = (ta) => {
        if (!ta) return;
        ta.style.height = 'auto';
        ta.style.height = `${ta.scrollHeight}px`;
      };
      const resizeAllPaperTextareas = () => {
        appEl.querySelectorAll('.doc-paper-textarea').forEach((ta) => autoResizeTextarea(ta));
      };
      resizeAllPaperTextareas();
      requestAnimationFrame(resizeAllPaperTextareas);
      appEl.querySelectorAll('.doc-paper-textarea').forEach((ta) => {
        ta.addEventListener('input', () => autoResizeTextarea(ta));
      });

      // 审核清单按文档独立保存
      appEl.querySelectorAll('[data-wb-rchk]').forEach((chk) => {
        chk.addEventListener('change', () => {
          activeDoc.reviewChecklist[chk.dataset.wbRchk] = chk.checked;
        });
      });

      // 焦点段落跟踪（无闪烁局部更新焦点样式与提示）
      appEl.querySelectorAll('[data-wb-para-wrap]').forEach((wrap) => {
        wrap.addEventListener('focusin', () => {
          const bid = wrap.dataset.wbParaWrap;
          if (state.wbFocusedBlockId !== bid) {
            state.wbFocusedBlockId = bid;
            appEl.querySelectorAll('[data-wb-para-wrap]').forEach((w) => w.classList.toggle('focused', w.dataset.wbParaWrap === bid));
            const idx = activeDoc.blocks.findIndex((b) => b.id === bid) + 1;
            const blk = activeDoc.blocks.find((b) => b.id === bid);
            const badge = appEl.querySelector('.doc-ai-dock .workspace-tag.blue');
            if (badge && blk) badge.textContent = isWanoRole() && state.wanoUiLang === 'en' ? `Target: #${idx} ${blk.label}` : `当前作用于：第 ${idx} 段 · ${blk.label}`;
          }
        });
      });

      // WANO 段落译文锁定开关
      appEl.querySelectorAll('[data-wb-toggle-lock]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const blk = activeDoc.blocks.find((b) => b.id === btn.dataset.wbToggleLock);
          if (blk) {
            blk.syncLocked = !blk.syncLocked;
            render();
            showToast(blk.syncLocked ? wanoT('Paragraph translation locked (safe from Live Sync overwrite)', '已锁定该段译文，防止实时互译覆盖') : wanoT('Paragraph unlocked for Live Sync', '已解除译文锁定'));
          }
        });
      });

      // 非 WANO 手动译文收起
      appEl.querySelectorAll('[data-wb-hide-en]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const blk = activeDoc.blocks.find((b) => b.id === btn.dataset.wbHideEn);
          if (blk) { blk.showManualEn = false; render(); }
        });
      });

      const bindField = (sel, key, pairSel, pairKey, pairLang) => {
        const el = appEl.querySelector(sel);
        if (el) {
          el.addEventListener('input', () => {
            activeDoc[key] = el.value;
            activeDoc.updatedAt = isWanoRole() ? 'Just now' : '刚刚';
            if (isWanoRole() && state.wanoLiveSync && pairSel) {
              clearTimeout(liveSyncTimer);
              liveSyncTimer = setTimeout(() => {
                const translated = liveTranslateMock(el.value, pairLang);
                activeDoc[pairKey] = translated;
                const pairEl = appEl.querySelector(pairSel);
                if (pairEl) {
                  pairEl.value = translated;
                  autoResizeTextarea(pairEl);
                }
              }, 450);
            }
          });
        }
      };
      bindField('#wb-title-zh', 'titleZh', '#wb-title-en', 'titleEn', 'en');
      bindField('#wb-title-en', 'titleEn', '#wb-title-zh', 'titleZh', 'zh');
      bindField('#wb-scope-zh', 'scopeZh', '#wb-scope-en', 'scopeEn', 'en');
      bindField('#wb-scope-en', 'scopeEn', '#wb-scope-zh', 'scopeZh', 'zh');

      appEl.querySelectorAll('[data-wb-block-zh]').forEach((ta) => {
        ta.addEventListener('input', () => {
          const id = ta.dataset.wbBlockZh;
          const blk = activeDoc.blocks.find((b) => b.id === id);
          if (blk) {
            blk.zh = ta.value;
            activeDoc.updatedAt = isWanoRole() ? 'Just now' : '刚刚';
            if (isWanoRole() && state.wanoLiveSync && !blk.syncLocked) {
              clearTimeout(liveSyncTimer);
              liveSyncTimer = setTimeout(() => {
                blk.en = liveTranslateMock(ta.value, 'en');
                const enEl = appEl.querySelector(`[data-wb-block-en="${id}"]`);
                if (enEl) {
                  enEl.value = blk.en;
                  autoResizeTextarea(enEl);
                }
              }, 450);
            }
          }
        });
      });
      appEl.querySelectorAll('[data-wb-block-en]').forEach((ta) => {
        ta.addEventListener('input', () => {
          const id = ta.dataset.wbBlockEn;
          const blk = activeDoc.blocks.find((b) => b.id === id);
          if (blk) {
            blk.en = ta.value;
            activeDoc.updatedAt = isWanoRole() ? 'Just now' : '刚刚';
            if (isWanoRole() && state.wanoLiveSync && !blk.syncLocked) {
              clearTimeout(liveSyncTimer);
              liveSyncTimer = setTimeout(() => {
                blk.zh = liveTranslateMock(ta.value, 'zh');
                const zhEl = appEl.querySelector(`[data-wb-block-zh="${id}"]`);
                if (zhEl) {
                  zhEl.value = blk.zh;
                  autoResizeTextarea(zhEl);
                }
              }, 450);
            }
          }
        });
      });

      appEl.querySelectorAll('[data-wb-ai-rewrite]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const blk = activeDoc.blocks.find((b) => b.id === btn.dataset.wbAiRewrite);
          if (!blk) return;
          blk.aiProposal = {
            kind: wanoT('AI Fact Refinement (Objective Style)', 'AI 事实润色建议（含原文 Diff 对比）'),
            zh: `${blk.zh}（已按 WANO 客观事实表达规范去除主观推断，并补全对应程序与设备 KKS 标识。）`,
            en: blk.en ? `${blk.en} [Refined for objective WANO PR factual wording.]` : ''
          };
          render();
          showToast(wanoT('AI suggestion ready below paragraph', '自评估智能体已生成润色 Diff 建议，可在段落下方确认'));
        });
      });
      appEl.querySelectorAll('[data-wb-ai-poc]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const blk = activeDoc.blocks.find((b) => b.id === btn.dataset.wbAiPoc);
          if (!blk) return;
          blk.aiProposal = {
            kind: wanoT('Highest-Tier PO&C Criteria Check', '最高标准准则核查（PO&C / IEEE）'),
            zh: `${blk.zh}\n【准则对照】触发高优先级准则 WANO PO&C 2022-1（OP.1-03 运行基本功）及电厂程序 Q/CNNC-OP-012 第 5.3.2 条。`,
            en: `${blk.en || blk.zh}\n[PO&C Alignment] Maps to High-Tier WANO PO&C 2022-1 OP.1-03.`
          };
          render();
          showToast(wanoT('PO&C criteria alignment generated', '已完成最高标准准则核查建议'));
        });
      });
      appEl.querySelectorAll('[data-wb-ai-translate]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const blk = activeDoc.blocks.find((b) => b.id === btn.dataset.wbAiTranslate);
          if (!blk) return;
          blk.aiProposal = {
            kind: isWanoRole() ? wanoT('WANO Glossary Alignment', 'WANO 专业术语对齐') : '手动翻译结果（中→英 · 采纳后在段下保留可编辑译文）',
            isManualTranslate: !isWanoRole(),
            zh: blk.zh,
            en: blk.en || liveTranslateMock(blk.zh, 'en')
          };
          render();
          showToast(isWanoRole() ? wanoT('Aligned with WANO glossary', '已完成核电术语对齐') : '已生成该段落英文译文，采纳后将保留在段落下方供审阅和导出');
        });
      });
      appEl.querySelectorAll('[data-wb-ai-accept]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const blk = activeDoc.blocks.find((b) => b.id === btn.dataset.wbAiAccept);
          if (blk && blk.aiProposal) {
            if (blk.aiProposal.isManualTranslate) {
              blk.en = blk.aiProposal.en;
              blk.showManualEn = true;
            } else {
              blk.prevZh = blk.zh;
              blk.zh = blk.aiProposal.zh;
              if (blk.aiProposal.en) blk.en = blk.aiProposal.en;
            }
            blk.aiProposal = null;
            activeDoc.updatedAt = isWanoRole() ? 'Just now' : '刚刚';
            render();
            showToast(blk.showManualEn ? '已采纳英文译文并展开在段落下方，支持编辑与导出英文报告' : wanoT('Applied AI suggestion', '已采纳 AI 建议（支持一键撤销）'));
          }
        });
      });
      appEl.querySelectorAll('[data-wb-ai-undo]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const blk = activeDoc.blocks.find((b) => b.id === btn.dataset.wbAiUndo);
          if (blk && blk.prevZh !== undefined) {
            blk.zh = blk.prevZh;
            delete blk.prevZh;
            render();
            showToast('已撤销上次 AI 替换，恢复原段落内容');
          }
        });
      });
      appEl.querySelectorAll('[data-wb-ai-discard]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const blk = activeDoc.blocks.find((b) => b.id === btn.dataset.wbAiDiscard);
          if (blk) { blk.aiProposal = null; render(); showToast(wanoT('Dismissed suggestion', '已放弃该建议')); }
        });
      });

      const addBlkBtn = appEl.querySelector('#btn-wb-add-block');
      if (addBlkBtn) {
        addBlkBtn.addEventListener('click', () => {
          const newId = 'blk-' + Date.now();
          activeDoc.blocks.push({
            id: newId,
            area: activeDoc.docType === 'AFI' ? '补充事实' : 'OP 运行',
            label: activeDoc.docType === 'AFI' ? `补充段落 ${activeDoc.blocks.length + 1}` : `观察项 ${activeDoc.blocks.length + 1}`,
            zh: '',
            en: '',
            aiProposal: null
          });
          state.wbFocusedBlockId = newId;
          render();
        });
      }

      const runDocAiPrompt = (promptText) => {
        const prompt = String(promptText || '').trim();
        if (!prompt) return showToast('请输入智能体协同指令');
        const targetBlk = activeDoc.blocks.find((b) => b.id === state.wbFocusedBlockId) || activeDoc.blocks[0];
        if (targetBlk) {
          targetBlk.aiProposal = {
            kind: `AI 协同润色「${prompt.slice(0, 22)}」`,
            zh: `${targetBlk.zh}\n【智能体优化】已按指令完成客观性核查与 WANO PO&C 2022-1 最高标准条文对齐。`,
            en: `${targetBlk.en || ''}\n[AI Refined] Aligned with WANO PO&C 2022-1 objective standards.`
          };
        }
        render();
        showToast(wanoT('AI generated an inline revision on focused paragraph', `智能体已针对「${targetBlk?.label || '当前段'}」生成 Diff 建议`));
      };

      appEl.querySelectorAll('[data-wb-ai-chip]').forEach((chip) => {
        chip.addEventListener('click', () => runDocAiPrompt(chip.dataset.wbAiChip));
      });
      const aiRunBtn = appEl.querySelector('#btn-wb-ai-run');
      if (aiRunBtn) {
        aiRunBtn.addEventListener('click', () => {
          const inp = appEl.querySelector('#wb-ai-prompt');
          runDocAiPrompt(inp?.value);
        });
      }

      const withdrawBtn = appEl.querySelector('#btn-wb-withdraw');
      if (withdrawBtn) {
        withdrawBtn.addEventListener('click', () => {
          activeDoc.status = 'draft';
          render();
          showToast('已撤回审核提交，文档已恢复为可编辑状态');
        });
      }

      const submitBtn = appEl.querySelector('#btn-wb-submit-review');
      if (submitBtn) {
        submitBtn.addEventListener('click', () => {
          activeDoc.status = isWanoRole() ? 'accepted' : 'submitted';
          activeDoc.version += 1;
          render();
          showToast(
            isWanoRole()
              ? wanoT(`Finalized "${activeDoc.titleEn}" and queued for OE`, `已定稿「${activeDoc.titleZh}」并加入经验沉淀队列`)
              : `「${activeDoc.titleZh}」已提交审核（V${activeDoc.version}），如需修改可点击「撤回提交」`
          );
        });
      }

      const findNextPendingDoc = () =>
        state.workspaceDocs.find(
          (d) =>
            d.status === 'submitted' &&
            d.id !== activeDoc.id &&
            (state.page === 'leader-review' ? d.projectId === state.leaderReviewProjectId : true)
        );

      const doApproveDoc = (jumpNext = false) => {
        const c = activeDoc.reviewChecklist;
        if (!c.poc || !c.objective || !c.kks) {
          return showToast(wanoT('Please complete all 3 checklist items before finalizing', '请先完成上方 3 项质量核查清单勾选后再审核通过'));
        }
        const note = appEl.querySelector('#wb-review-note')?.value.trim() || '审核通过：事实客观、最高标准准则对齐完整，同意归档。';
        activeDoc.status = 'accepted';
        activeDoc.comments.unshift({
          id: 'cmt-' + Date.now(),
          kind: 'review',
          author: `${currentAccount().name}（${displayRoleLabel(currentAccount())}）`,
          version: activeDoc.version,
          time: '刚刚',
          status: 'resolved',
          text: note
        });
        if (jumpNext) {
          const nextPending = findNextPendingDoc();
          if (nextPending) {
            state.wbActiveDocId = nextPending.id;
            state.wbFocusedBlockId = nextPending.blocks?.[0]?.id || null;
            state.wbRightTab = 'leader_review';
            render();
            showToast(`已审核通过，自动载入下一份待审「${nextPending.titleZh}」`);
            return;
          }
          render();
          showToast('已审核通过！当前项目待审核队列已全部处理完毕');
          return;
        }
        render();
        showToast(`已审核通过「${activeDoc.titleZh}」`);
      };

      const doRejectDoc = (jumpNext = false) => {
        const note = appEl.querySelector('#wb-review-note')?.value.trim() || '驳回意见：请补充具体设备 KKS 编号与对应高优先级 PO&C 条文依据后重新提交。';
        activeDoc.status = 'rejected';
        activeDoc.comments.unshift({
          id: 'cmt-' + Date.now(),
          kind: 'review',
          author: `${currentAccount().name}（${displayRoleLabel(currentAccount())}）`,
          version: activeDoc.version,
          time: '刚刚',
          status: 'open',
          text: note
        });
        state.wbRightTab = 'leader_review';
        if (jumpNext) {
          const nextPending = findNextPendingDoc();
          if (nextPending) {
            state.wbActiveDocId = nextPending.id;
            state.wbFocusedBlockId = nextPending.blocks?.[0]?.id || null;
            render();
            showToast(`已驳回上一份，自动载入下一份待审「${nextPending.titleZh}」`);
            return;
          }
          render();
          showToast('已驳回修改！当前项目待审核队列已全部处理完毕');
          return;
        }
        render();
        showToast('已驳回修改，审核意见已记录在审核页签');
      };

      const acceptBtn = appEl.querySelector('#btn-wb-accept');
      if (acceptBtn) acceptBtn.addEventListener('click', () => doApproveDoc(false));
      const acceptNextBtn = appEl.querySelector('#btn-wb-accept-next');
      if (acceptNextBtn) acceptNextBtn.addEventListener('click', () => doApproveDoc(true));

      const rejectBtn = appEl.querySelector('#btn-wb-reject');
      if (rejectBtn) rejectBtn.addEventListener('click', () => doRejectDoc(false));
      const rejectNextBtn = appEl.querySelector('#btn-wb-reject-next');
      if (rejectNextBtn) rejectNextBtn.addEventListener('click', () => doRejectDoc(true));

      const postCmtBtn = appEl.querySelector('#btn-wb-post-comment');
      if (postCmtBtn) {
        postCmtBtn.addEventListener('click', () => {
          const ta = appEl.querySelector('#wb-new-comment');
          const text = ta?.value.trim();
          if (!text) return showToast('请输入评论内容');
          activeDoc.comments.unshift({
            id: 'cmt-' + Date.now(),
            kind: 'discussion',
            author: `${currentAccount().name}（${displayRoleLabel(currentAccount())}）`,
            version: activeDoc.version,
            time: '刚刚',
            status: 'open',
            text
          });
          render();
          showToast(wanoT('Comment posted', '协作评论已发表'));
        });
      }

      appEl.querySelectorAll('[data-wb-resolve-cmt]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const c = activeDoc.comments.find((x) => x.id === btn.dataset.wbResolveCmt);
          if (c) { c.status = 'resolved'; render(); showToast(wanoT('Marked resolved', '该意见已确认闭环')); }
        });
      });

      const exportBtn = appEl.querySelector('#btn-wb-export');
      if (exportBtn) {
        exportBtn.addEventListener('click', () => {
          const hasEn = activeDoc.blocks.some((b) => b.showManualEn && b.en);
          showToast(hasEn ? `已导出「${activeDoc.titleZh}_V${activeDoc.version}_中英文版.docx」` : `已导出「${activeDoc.titleZh}_V${activeDoc.version}.docx」`);
        });
      }
    }

    // 租户管理事件
    appEl.querySelectorAll('[data-toggle-tenant]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const t = state.tenants.find((x) => x.id === btn.dataset.toggleTenant);
        if (t) {
          t.status = t.status === 'active' ? 'disabled' : 'active';
          render();
          showToast(`已${t.status === 'active' ? '启用' : '停用'}租户「${t.name}」`);
        }
      });
    });
    appEl.querySelectorAll('[data-config-tenant]').forEach((btn) => {
      btn.addEventListener('click', () => openTenantConfigDrawer(btn.dataset.configTenant, btn.dataset.configTab));
    });
    const newTenantBtn = appEl.querySelector('#btn-new-tenant');
    if (newTenantBtn) {
      newTenantBtn.addEventListener('click', () => {
        openModal(`
          <div class="modal-head"><h2>新增租户</h2><button type="button" class="modal-close" data-modal-close>×</button></div>
          <div class="modal-body">
            <div class="form-grid-2">
              <div class="field-group"><label>租户名称 *</label><input id="nt-name" placeholder="例如：田湾核电基地" /></div>
              <div class="field-group"><label>租户编码 *</label><input id="nt-code" placeholder="例如：TWNP-05" /></div>
            </div>
            <div class="form-grid-2">
              <div class="field-group"><label>机组与区域说明</label><input id="nt-region" placeholder="例如：江苏连云港 · 8 台机组" /></div>
              <div class="field-group"><label>租户管理员</label><input id="nt-admin" placeholder="例如：刘洋" /></div>
            </div>
          </div>
          <div class="modal-foot"><button type="button" class="ghost" data-modal-close>取消</button><button type="button" class="primary" id="btn-nt-save">创建租户</button></div>
        `);
        modalRoot.querySelector('#btn-nt-save').addEventListener('click', () => {
          const name = modalRoot.querySelector('#nt-name').value.trim();
          const code = modalRoot.querySelector('#nt-code').value.trim() || 'NPP-NEW';
          if (!name) return showToast('请填写租户名称');
          state.tenants.push({
            id: 'tn-' + Date.now(),
            name,
            code,
            region: modalRoot.querySelector('#nt-region').value.trim() || '核电基地',
            status: 'active',
            admin: modalRoot.querySelector('#nt-admin').value.trim() || '管理员',
            usersCount: 1,
            projectsCount: 0,
            updatedAt: '刚刚',
            agents: {
              writing: { enabled: true, model: 'Qwen2.5-72B-Instruct（内网版）', quota: 2000 },
              afi_gen: { enabled: true, model: 'DeepSeek-R1-70B（内网版）', quota: 800 },
              kb_qa: { enabled: true, model: 'Qwen2.5-72B-Instruct（内网版）', quota: 2500 },
              oe_root: { enabled: false, model: 'DeepSeek-R1-70B（内网版）', quota: 500 },
              compliance: { enabled: false, model: 'Qwen2.5-72B-Instruct（内网版）', quota: 1000 }
            },
            criteriaIds: ['cri-poc-2022', 'cri-bdx-corp']
          });
          closeModal();
          render();
          showToast(`已创建租户「${name}」，可继续配置智能体与准则程序`);
        });
      });
    }

    // 知识库事件
    appEl.querySelectorAll('[data-kb-tab]').forEach((btn) => {
      btn.addEventListener('click', () => { state.kbTab = btn.dataset.kbTab; render(); });
    });
    const upBtn = appEl.querySelector('#btn-kb-offline-upload');
    const upCardBtn = appEl.querySelector('#btn-kb-offline-upload-card');
    if (upBtn) upBtn.addEventListener('click', openOfflineUploadModal);
    if (upCardBtn) upCardBtn.addEventListener('click', openOfflineUploadModal);

    const addSrcBtn = appEl.querySelector('#btn-kb-add-source');
    if (addSrcBtn) {
      addSrcBtn.addEventListener('click', () => {
        openModal(`
          <div class="modal-head"><h2>新增外部系统数据源</h2><button type="button" class="modal-close" data-modal-close>×</button></div>
          <div class="modal-body">
            <div class="form-grid-2">
              <div class="field-group"><label>系统名称 *</label><input id="ns-name" placeholder="例如：设备可靠性平台（ER）" /></div>
              <div class="field-group"><label>归属用途</label><select id="ns-usage"><option>OBS 涉及来源</option><option>AFI 准则（低：公司、电厂）</option><option>AFI 准则（中：经验）</option></select></div>
            </div>
            <div class="field-group"><label>数据类型（顿号分隔）</label><input id="ns-types" placeholder="例如：设备趋势报告、故障台账" /></div>
            <div class="field-group"><label>内网接口地址</label><input id="ns-url" placeholder="https://er.internal.npp/api/v1/sync" /></div>
          </div>
          <div class="modal-foot"><button type="button" class="ghost" data-modal-close>取消</button><button type="button" class="primary" id="btn-ns-save">保存并接入</button></div>
        `);
        modalRoot.querySelector('#btn-ns-save').addEventListener('click', () => {
          const name = modalRoot.querySelector('#ns-name').value.trim();
          if (!name) return showToast('请填写系统名称');
          state.kbSources.splice(state.kbSources.length - 1, 0, {
            id: 'src-' + Date.now(),
            name,
            mode: 'external',
            usage: modalRoot.querySelector('#ns-usage').value,
            dataTypes: modalRoot.querySelector('#ns-types').value.split(/[、,，]/).map((s) => s.trim()).filter(Boolean),
            endpoint: modalRoot.querySelector('#ns-url').value.trim() || 'https://api.internal.npp/sync',
            schedule: '每日 03:00 增量同步',
            status: 'online',
            docsCount: 0,
            lastSync: '刚刚接入',
            tenantScope: getTenantName(state.globalTenant)
          });
          closeModal();
          render();
          showToast(`已新增外部系统「${name}」`);
        });
      });
    }

    appEl.querySelectorAll('[data-sync-source]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.syncSource;
        const src = state.kbSources.find((s) => s.id === id);
        if (!src) return;
        state.syncingSourceId = id;
        render();
        setTimeout(() => {
          const added = Math.floor(Math.random() * 14) + 3;
          src.docsCount += added;
          src.lastSync = '2026-11-19 18:24';
          state.syncingSourceId = null;
          render();
          showToast(`「${src.name}」增量同步完成，新增 ${added} 份文档已入清洗队列`);
        }, 700);
      });
    });
    appEl.querySelectorAll('[data-config-source]').forEach((btn) => {
      btn.addEventListener('click', () => openSourceConfigModal(btn.dataset.configSource));
    });

    const kbdSrc = appEl.querySelector('#kbd-source');
    const kbdSt = appEl.querySelector('#kbd-status');
    if (kbdSrc) kbdSrc.addEventListener('change', () => { state.kbDocFilters.source = kbdSrc.value; render(); });
    if (kbdSt) kbdSt.addEventListener('change', () => { state.kbDocFilters.status = kbdSt.value; render(); });
    bindImeSearch('#kbd-keyword', (val) => { state.kbDocFilters.keyword = val; });
    const batchClean = appEl.querySelector('#btn-batch-clean');
    if (batchClean) {
      batchClean.addEventListener('click', () => {
        let count = 0;
        state.kbDocs.forEach((d) => {
          if (d.status !== 'done') {
            d.status = 'done';
            d.chunks = d.chunks || 32;
            d.qaCount = d.qaCount || 9;
            d.updatedAt = '刚刚';
            count++;
          }
        });
        render();
        showToast(count ? `已完成 ${count} 份文档的批量清洗与向量入库` : '当前没有待清洗文档');
      });
    }
    appEl.querySelectorAll('[data-open-clean]').forEach((btn) => {
      btn.addEventListener('click', () => openCleanDrawer(btn.dataset.openClean));
    });
    appEl.querySelectorAll('[data-quick-clean]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const d = state.kbDocs.find((x) => x.id === btn.dataset.quickClean);
        if (d) {
          d.status = 'done';
          d.chunks = d.chunks || 26;
          d.qaCount = d.qaCount || 7;
          d.updatedAt = '刚刚';
          render();
          showToast(`已完成「${d.title}」清洗并入库`);
        }
      });
    });

    appEl.querySelectorAll('[data-qa-filter]').forEach((btn) => {
      btn.addEventListener('click', () => { state.kbQaFilter = btn.dataset.qaFilter; render(); });
    });
    appEl.querySelectorAll('[data-accept-qa]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const q = state.kbQas.find((x) => x.id === btn.dataset.acceptQa);
        if (q) { q.status = 'accepted'; render(); showToast('已采纳该标准问答对并同步至检索库'); }
      });
    });
    appEl.querySelectorAll('[data-edit-qa]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const q = state.kbQas.find((x) => x.id === btn.dataset.editQa);
        if (!q) return;
        openModal(`
          <div class="modal-head"><h2>编辑清洗问答对</h2><button type="button" class="modal-close" data-modal-close>×</button></div>
          <div class="modal-body">
            <div class="field-group"><label>标准问题</label><input id="eq-q" value="${esc(q.question)}" /></div>
            <div class="field-group"><label>清洗标准答案</label><textarea id="eq-a" style="min-height:110px;">${esc(q.answer)}</textarea></div>
          </div>
          <div class="modal-foot"><button type="button" class="ghost" data-modal-close>取消</button><button type="button" class="primary" id="btn-eq-save">保存并采纳</button></div>
        `);
        modalRoot.querySelector('#btn-eq-save').addEventListener('click', () => {
          q.question = modalRoot.querySelector('#eq-q').value.trim() || q.question;
          q.answer = modalRoot.querySelector('#eq-a').value.trim() || q.answer;
          q.status = 'accepted';
          closeModal();
          render();
          showToast('标准问答对已保存并采纳');
        });
      });
    });
    const addQaBtn = appEl.querySelector('#btn-add-qa');
    if (addQaBtn) {
      addQaBtn.addEventListener('click', () => {
        openModal(`
          <div class="modal-head"><h2>新增标准问答对</h2><button type="button" class="modal-close" data-modal-close>×</button></div>
          <div class="modal-body">
            <div class="field-group"><label>问题 *</label><input id="aq-q" placeholder="输入核电评估标准问题" /></div>
            <div class="field-group"><label>标准答案 *</label><textarea id="aq-a" placeholder="输入经审核的标准回答"></textarea></div>
            <div class="form-grid-2">
              <div class="field-group"><label>来源系统</label><input id="aq-src" value="线下上传 + BDX" /></div>
              <div class="field-group"><label>所属领域</label><input id="aq-area" value="OP 运行" /></div>
            </div>
          </div>
          <div class="modal-foot"><button type="button" class="ghost" data-modal-close>取消</button><button type="button" class="primary" id="btn-aq-save">保存入库</button></div>
        `);
        modalRoot.querySelector('#btn-aq-save').addEventListener('click', () => {
          const question = modalRoot.querySelector('#aq-q').value.trim();
          const answer = modalRoot.querySelector('#aq-a').value.trim();
          if (!question || !answer) return showToast('请填写完整的问题和答案');
          state.kbQas.unshift({
            id: 'QA-' + (110 + state.kbQas.length),
            question,
            answer,
            sourceSystem: modalRoot.querySelector('#aq-src').value.trim() || '人工录入',
            priority: '高',
            area: modalRoot.querySelector('#aq-area').value.trim() || '通用',
            status: 'accepted',
            confidence: 1.0,
            updatedAt: '刚刚'
          });
          closeModal();
          render();
          showToast('已新增标准问答对');
        });
      });
    }

    const qaScope = appEl.querySelector('#kb-qa-scope');
    if (qaScope) qaScope.addEventListener('change', () => { state.kbQaScope = qaScope.value; });

    const submitQaQuestion = (question) => {
      const q = question.trim();
      if (!q) return;
      state.kbTestMessages.push({ role: 'user', text: q });
      const res = simulateKbAnswer(q);
      state.kbTestMessages.push({ role: 'assistant', text: res.text, cites: res.cites, originQuestion: q });
      render();
      const box = appEl.querySelector('#qa-messages-box');
      if (box) box.scrollTop = box.scrollHeight;
    };

    const qaForm = appEl.querySelector('#qa-test-form');
    if (qaForm) {
      qaForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const inp = appEl.querySelector('#qa-test-input');
        submitQaQuestion(inp.value);
      });
    }
    appEl.querySelectorAll('[data-preset-q]').forEach((btn) => {
      btn.addEventListener('click', () => submitQaQuestion(btn.dataset.presetQ));
    });
    appEl.querySelectorAll('[data-adopt-msg]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const msg = state.kbTestMessages[Number(btn.dataset.adoptMsg)];
        if (!msg) return;
        state.kbQas.unshift({
          id: 'QA-' + (110 + state.kbQas.length),
          question: msg.originQuestion || '知识库检索采纳问题',
          answer: msg.text,
          sourceSystem: msg.cites.map((c) => c.source.split('·')[0].trim()).slice(0, 2).join(' + ') || '知识库检索',
          priority: msg.cites[0]?.tier || '高',
          area: '检索采纳',
          status: 'accepted',
          confidence: 0.95,
          updatedAt: '刚刚'
        });
        render();
        showToast('已将本次回答采纳至标准问答清洗库');
      });
    });

    // 文档管理事件
    appEl.querySelectorAll('[data-config-doc]').forEach((btn) => {
      btn.addEventListener('click', () => openDocumentConfigModal(btn.dataset.configDoc));
    });

    // 用户管理事件
    appEl.querySelectorAll('[data-perm-tab]').forEach((btn) => {
      btn.addEventListener('click', () => { state.permTab = btn.dataset.permTab; state.permSearch = ''; render(); });
    });
    bindImeSearch('#perm-search-input', (val) => { state.permSearch = val; });
    const permRoleSel = appEl.querySelector('#perm-user-role');
    if (permRoleSel) permRoleSel.addEventListener('change', () => { state.permUserRole = permRoleSel.value; render(); });
    const permStatus = appEl.querySelector('#perm-user-status');
    if (permStatus) permStatus.addEventListener('change', () => { state.permUserStatus = permStatus.value; render(); });

    appEl.querySelectorAll('[data-edit-role-perms]').forEach((btn) => {
      btn.addEventListener('click', () => openRolePermissionModal(btn.dataset.editRolePerms));
    });
    appEl.querySelectorAll('[data-role-users]').forEach((btn) => {
      btn.addEventListener('click', () => openRoleUsersModal(btn.dataset.roleUsers));
    });
    appEl.querySelectorAll('[data-toggle-role]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const r = state.roles.find((x) => x.id === btn.dataset.toggleRole);
        if (r) { r.enabled = !r.enabled; render(); showToast(`已${r.enabled ? '启用' : '停用'}角色「${r.name}」`); }
      });
    });
    appEl.querySelectorAll('[data-toggle-user]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const u = state.users.find((x) => x.id === btn.dataset.toggleUser);
        if (u) { u.enabled = !u.enabled; render(); showToast(`已${u.enabled ? '启用' : '停用'}用户「${u.name}」`); }
      });
    });
    const permCreate = appEl.querySelector('#btn-perm-create');
    if (permCreate) {
      permCreate.addEventListener('click', () => {
        if (state.permTab === 'roles') {
          openModal(`
            <div class="modal-head"><h2>新增角色</h2><button type="button" class="modal-close" data-modal-close>×</button></div>
            <div class="modal-body">
              <div class="field-group"><label>角色名称 *</label><input id="nr-name" placeholder="例如：高级运行评估员" /></div>
              <div class="field-group"><label>角色类</label><select id="nr-cls"><option>评估类</option><option>协调类</option><option>队长类</option></select></div>
              <div class="field-group"><label>角色描述</label><input id="nr-desc" placeholder="说明该角色职责" /></div>
            </div>
            <div class="modal-foot"><button type="button" class="ghost" data-modal-close>取消</button><button type="button" class="primary" id="btn-nr-save">创建并配置权限</button></div>
          `);
          modalRoot.querySelector('#btn-nr-save').addEventListener('click', () => {
            const name = modalRoot.querySelector('#nr-name').value.trim();
            if (!name) return showToast('请输入角色名称');
            const newRoleId = 'role-' + Date.now();
            const cls = modalRoot.querySelector('#nr-cls').value;
            const defaultPerms =
              cls === '队长类'
                ? ['project:view', 'project:complete', 'plan:manage', 'plan:complete', 'task:arrange', 'document:make', 'review:manage']
                : cls === '协调类'
                  ? ['project:view', 'project:manage', 'project:complete', 'plan:manage', 'plan:complete', 'task:arrange', 'document:make']
                  : ['project:view', 'task:execute', 'document:make'];
            state.roles.push({
              id: newRoleId,
              name,
              desc: modalRoot.querySelector('#nr-desc').value.trim() || '自定义业务角色',
              roleClass: cls,
              permissions: defaultPerms,
              permCount: defaultPerms.length,
              membersCount: 0,
              enabled: true,
              builtin: false
            });
            closeModal();
            render();
            openRolePermissionModal(newRoleId);
            showToast(`已创建角色「${name}」，可继续精细配置权限`);
          });
        } else {
          openModal(`
            <div class="modal-head"><h2>新增用户</h2><button type="button" class="modal-close" data-modal-close>×</button></div>
            <div class="modal-body">
              <div class="form-grid-2">
                <div class="field-group"><label>姓名 *</label><input id="nu-name" placeholder="请输入姓名" /></div>
                <div class="field-group"><label>登录账号 *</label><input id="nu-acc" placeholder="例如：zhangsan" /></div>
              </div>
              <div class="form-grid-2">
                <div class="field-group"><label>所属角色</label><select id="nu-role">${state.roles.map((r) => `<option>${esc(r.name)}</option>`).join('')}</select></div>
                <div class="field-group"><label>${isPlantSelfMode() ? '所属电厂' : '所属租户'}</label><select id="nu-tenant" ${isPlantSelfMode() ? 'disabled' : ''}>${(isPlantSelfMode() ? state.tenants.filter((t) => t.id === state.globalTenant) : state.tenants).map((t) => `<option value="${t.id}" ${t.id === state.globalTenant ? 'selected' : ''}>${esc(t.name)}</option>`).join('')}</select></div>
              </div>
              <div class="field-group"><label>岗位描述</label><input id="nu-desc" placeholder="岗位或领域职责" /></div>
            </div>
            <div class="modal-foot"><button type="button" class="ghost" data-modal-close>取消</button><button type="button" class="primary" id="btn-nu-save">创建用户</button></div>
          `);
          modalRoot.querySelector('#btn-nu-save').addEventListener('click', () => {
            const name = modalRoot.querySelector('#nu-name').value.trim();
            const account = modalRoot.querySelector('#nu-acc').value.trim();
            if (!name || !account) return showToast('请填写姓名和登录账号');
            state.users.unshift({
              id: 'u-' + Date.now(),
              name,
              initials: name.slice(0, 1),
              account,
              role: modalRoot.querySelector('#nu-role').value,
              tenantId: modalRoot.querySelector('#nu-tenant').value,
              desc: modalRoot.querySelector('#nu-desc').value.trim() || '评估成员',
              enabled: true
            });
            closeModal();
            render();
            showToast(`已创建用户「${name}」`);
          });
        }
      });
    }

    // 评估员：知识库查询事件
    appEl.querySelectorAll('[data-akb-tab]').forEach((btn) => {
      btn.addEventListener('click', () => { state.assessorKbTab = btn.dataset.akbTab; render(); });
    });
    const akbSrc = appEl.querySelector('#akb-source');
    if (akbSrc) akbSrc.addEventListener('change', () => { state.assessorKbSource = akbSrc.value; render(); });
    const akbTier = appEl.querySelector('#akb-tier');
    if (akbTier) akbTier.addEventListener('change', () => { state.assessorKbTier = akbTier.value; render(); });
    bindImeSearch('#akb-keyword', (val) => { state.assessorKbKeyword = val; });
    const akbReset = appEl.querySelector('#btn-akb-reset');
    if (akbReset) {
      akbReset.addEventListener('click', () => {
        state.assessorKbSource = 'all';
        state.assessorKbTier = 'all';
        state.assessorKbKeyword = '';
        render();
      });
    }
    appEl.querySelectorAll('[data-akb-view-doc]').forEach((btn) => {
      btn.addEventListener('click', () => openAssessorKbDocModal(btn.dataset.akbViewDoc));
    });
    appEl.querySelectorAll('[data-akb-cite-doc]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const doc = state.kbDocs.find((d) => d.id === btn.dataset.akbCiteDoc);
        if (doc) createObsFromText(`参考知识库资料：${doc.title}`, `依据「${doc.sourceName} · ${doc.title}」：\n${doc.cleanedSnippet}`, 'OP 运行');
      });
    });
    appEl.querySelectorAll('[data-akb-cite-criteria]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const c = D.CRITERIA_CATALOG.find((x) => x.id === btn.dataset.akbCiteCriteria);
        if (c) createObsFromText(`准则对标观察：${c.name}`, `依据 ${c.name}（${c.version}，共 ${c.clauses} 条）：${c.desc}\n\n【现场观察事实补充】`, 'OP 运行');
      });
    });
    const askAssessorKb = (qText) => {
      const q = String(qText || '').trim();
      if (!q) return;
      state.assessorKbMessages.push({ role: 'user', text: q, cites: [] });
      const ans = simulateKbAnswer(q);
      state.assessorKbMessages.push({ role: 'assistant', text: ans.text, cites: ans.cites });
      render();
      const box = appEl.querySelector('#akb-messages-box');
      if (box) box.scrollTop = box.scrollHeight;
    };
    appEl.querySelectorAll('[data-akb-ask-criteria]').forEach((btn) => {
      btn.addEventListener('click', () => askAssessorKb(`请解读「${btn.dataset.akbAskCriteria}」在现场自评估中的关键核查要点？`));
    });
    appEl.querySelectorAll('[data-akb-preset]').forEach((btn) => {
      btn.addEventListener('click', () => askAssessorKb(btn.dataset.akbPreset));
    });
    const akbForm = appEl.querySelector('#akb-qa-form');
    if (akbForm) {
      akbForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const inp = appEl.querySelector('#akb-qa-input');
        if (inp) askAssessorKb(inp.value);
      });
    }
    appEl.querySelectorAll('[data-akb-use-answer]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const m = state.assessorKbMessages[Number(btn.dataset.akbUseAnswer)];
        if (!m) return;
        const citeStr = (m.cites || []).map((c) => `[${c.source}] ${c.doc}`).join('；');
        createObsFromText('基于知识库检索生成的观察草稿', `${m.text}${citeStr ? `\n\n参考依据：${citeStr}` : ''}`, 'OP 运行');
      });
    });

    // 评估员：多模态数据录入事件
    const bindCapTrigger = (selector, handler) => {
      const el = appEl.querySelector(selector);
      if (el) el.addEventListener('click', handler);
    };
    bindCapTrigger('#btn-cap-live-audio', () => openLiveCaptureModal('audio'));
    bindCapTrigger('#btn-cap-live-photo', () => openLiveCaptureModal('photo'));
    bindCapTrigger('#btn-cap-live-video', () => openLiveCaptureModal('video'));
    bindCapTrigger('#btn-cap-upload', () => openUploadCaptureModal());
    appEl.querySelectorAll('[data-cap-quick]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const mode = btn.dataset.capQuick;
        if (mode === 'upload') openUploadCaptureModal();
        else openLiveCaptureModal(mode);
      });
    });
    appEl.querySelectorAll('[data-cap-type]').forEach((btn) => {
      btn.addEventListener('click', () => { state.captureTypeFilter = btn.dataset.capType; render(); });
    });
    const capModeSel = appEl.querySelector('#cap-mode-filter');
    if (capModeSel) capModeSel.addEventListener('change', () => { state.captureModeFilter = capModeSel.value; render(); });
    const capAreaSel = appEl.querySelector('#cap-area-filter');
    if (capAreaSel) capAreaSel.addEventListener('change', () => { state.captureAreaFilter = capAreaSel.value; render(); });
    bindImeSearch('#cap-keyword', (val) => { state.captureKeyword = val; });
    bindCapTrigger('#btn-cap-reset', () => {
      state.captureTypeFilter = 'all';
      state.captureModeFilter = 'all';
      state.captureAreaFilter = 'all';
      state.captureKeyword = '';
      render();
    });
    appEl.querySelectorAll('[data-cap-play-audio]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.capPlayAudio;
        state.playingAudioId = state.playingAudioId === id ? null : id;
        render();
      });
    });
    appEl.querySelectorAll('[data-cap-preview]').forEach((btn) => {
      btn.addEventListener('click', () => openCapturePreviewModal(btn.dataset.capPreview));
    });
    appEl.querySelectorAll('[data-cap-to-obs]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const rec = state.captureRecords.find((r) => r.id === btn.dataset.capToObs);
        if (rec) createObsFromCapture(rec);
      });
    });

    // WANO 同行评审计划：日历日期/阶段条点击、领域筛选、输入输出文件预览
    appEl.querySelectorAll('[data-plan-date]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.wanoPlanSelectedDate = btn.dataset.planDate;
        render();
      });
    });
    appEl.querySelectorAll('[data-plan-stage-date]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.wanoPlanSelectedDate = btn.dataset.planStageDate;
        render();
      });
    });
    appEl.querySelectorAll('[data-plan-area-filter]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.wanoPlanAreaFilter = btn.dataset.planAreaFilter;
        render();
      });
    });
    appEl.querySelectorAll('[data-plan-file]').forEach((btn) => {
      btn.addEventListener('click', () => {
        showToast(wanoT(`Opened file: ${btn.dataset.planFile}`, `已打开文件预览：${btn.dataset.planFile}`));
      });
    });

    // 项目详情：新增计划、切换快速模式、快速模式直传 ECM / 导出 / 独立编写
    const newPlanBtn = appEl.querySelector('#btn-new-plan');
    if (newPlanBtn) {
      newPlanBtn.addEventListener('click', () => {
        const proj = state.projects.find((p) => p.id === state.activeProjectId) || state.projects[0];
        if (proj) openNewPlanModal(proj);
      });
    }
    const toggleQuickBtn = appEl.querySelector('#btn-toggle-plan-quickmode');
    if (toggleQuickBtn) {
      toggleQuickBtn.addEventListener('click', () => {
        const proj = state.projects.find((p) => p.id === state.activeProjectId);
        const pl = proj?.plans?.find((x) => x.id === state.activePlanId) || proj?.plans?.[0];
        if (!pl) return;
        pl.quickMode = !pl.quickMode;
        if (pl.quickMode) pl.members = [pl.lead || '周敏'];
        render();
        showToast(pl.quickMode ? '已切换为快速模式（计划负责人独立完成，免审批）' : '已切换为标准审批模式');
      });
    }
    const quickWriteBtn = appEl.querySelector('#btn-quick-write-report');
    if (quickWriteBtn) {
      quickWriteBtn.addEventListener('click', () => {
        const proj = state.projects.find((p) => p.id === state.activeProjectId);
        const pl = proj?.plans?.find((x) => x.id === state.activePlanId) || proj?.plans?.[0];
        if (pl) createObsFromText(`${pl.title} · 快速评估报告`, `【快速模式 · 免审批独立完成】\n计划负责人：${pl.lead || '负责人'}\n评估领域：${(pl.areas || []).join('、')}\n时间窗：${pl.window}\n\n【报告正文】`, pl.areas?.[0] || 'OP 运行', pl.tasks?.[0]?.name || pl.title);
      });
    }
    const quickExportBtn = appEl.querySelector('#btn-quick-export-report');
    if (quickExportBtn) {
      quickExportBtn.addEventListener('click', () => {
        const proj = state.projects.find((p) => p.id === state.activeProjectId);
        const pl = proj?.plans?.find((x) => x.id === state.activePlanId) || proj?.plans?.[0];
        if (pl) {
          triggerDownload(`${pl.title}_快速评估报告.txt`, `计划：${pl.title}\n计划负责人：${pl.lead}\n领域：${(pl.areas || []).join('、')}\n模式：快速模式（免审批）\n`, 'text/plain;charset=utf-8;');
          showToast(`已导出快速评估报告「${pl.title}」`);
        }
      });
    }
    const quickEcmBtn = appEl.querySelector('#btn-quick-submit-ecm');
    if (quickEcmBtn) {
      quickEcmBtn.addEventListener('click', () => {
        const proj = state.projects.find((p) => p.id === state.activeProjectId);
        const pl = proj?.plans?.find((x) => x.id === state.activePlanId) || proj?.plans?.[0];
        if (pl) {
          pl.ecmSubmitted = true;
          pl.status = 'done';
          render();
          showToast(`快速模式：计划「${pl.title}」报告已直接提交至 ECM（跳过审批流程）`);
        }
      });
    }

    // 甘特图交互：状态/模式筛选、计划折叠/展开、点击任务条弹窗编辑排期
    appEl.querySelectorAll('[data-gantt-status]').forEach((btn) => {
      btn.addEventListener('click', () => { state.ganttStatusFilter = btn.dataset.ganttStatus; render(); });
    });
    appEl.querySelectorAll('[data-gantt-mode]').forEach((btn) => {
      btn.addEventListener('click', () => { state.ganttModeFilter = btn.dataset.ganttMode; render(); });
    });
    appEl.querySelectorAll('[data-gantt-toggle-plan]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const pid = btn.dataset.ganttTogglePlan;
        state.ganttCollapsedPlans[pid] = !state.ganttCollapsedPlans[pid];
        render();
      });
    });
    appEl.querySelectorAll('[data-gantt-edit-task]').forEach((bar) => {
      bar.addEventListener('click', (e) => {
        e.stopPropagation();
        openGanttTaskModal(bar.dataset.ganttEditProj, bar.dataset.ganttEditPlan, bar.dataset.ganttEditTask);
      });
    });

    // 通用图表 & 甘特图动态悬浮提示 + 图例点击显隐 + 环形图联动高亮
    bindChartAndGanttInteractions();
  }

  function bindChartAndGanttInteractions() {
    let tipEl = document.getElementById('demo-hover-tooltip');
    if (!tipEl) {
      tipEl = document.createElement('div');
      tipEl.id = 'demo-hover-tooltip';
      tipEl.className = 'chart-floating-tooltip';
      document.body.appendChild(tipEl);
    }
    const showTip = (e, title, body) => {
      if (!title && !body) return;
      tipEl.innerHTML = `<div class="cft-title">${esc(title)}</div>${body ? `<div class="cft-body">${esc(body)}</div>` : ''}`;
      tipEl.classList.add('visible');
      const pad = 14;
      const rect = tipEl.getBoundingClientRect();
      let x = e.clientX + 14;
      let y = e.clientY - rect.height - 12;
      if (x + rect.width > window.innerWidth - pad) x = e.clientX - rect.width - 14;
      if (y < pad) y = e.clientY + 16;
      tipEl.style.left = `${Math.max(pad, x)}px`;
      tipEl.style.top = `${Math.max(pad, y)}px`;
    };
    const hideTip = () => tipEl.classList.remove('visible');

    // 1. 通用悬浮提示（分组柱状图、雷达图节点、甘特条等）
    appEl.querySelectorAll('[data-tip-title]').forEach((el) => {
      el.addEventListener('mouseenter', (e) => showTip(e, el.dataset.tipTitle, el.dataset.tipBody));
      el.addEventListener('mousemove', (e) => showTip(e, el.dataset.tipTitle, el.dataset.tipBody));
      el.addEventListener('mouseleave', hideTip);
    });

    // 2. 面积折线图：十字准星竖线 + 采样点高亮
    appEl.querySelectorAll('.interactive-area-svg').forEach((svg) => {
      const crosshair = svg.querySelector('.area-crosshair');
      const dots = svg.querySelectorAll('.chart-dot');
      svg.querySelectorAll('.area-hit-col').forEach((col) => {
        col.addEventListener('mouseenter', () => {
          const idx = col.dataset.pointIdx;
          const x = col.dataset.x;
          if (crosshair) { crosshair.setAttribute('x1', x); crosshair.setAttribute('x2', x); crosshair.style.opacity = '1'; }
          dots.forEach((d) => d.classList.toggle('active', d.dataset.pointIdx === idx));
        });
        col.addEventListener('mouseleave', () => {
          if (crosshair) crosshair.style.opacity = '0';
          dots.forEach((d) => d.classList.remove('active'));
        });
      });
    });

    // 3. 面板图例点击切换系列显隐
    appEl.querySelectorAll('.panel-card').forEach((card) => {
      const legendItems = card.querySelectorAll('.chart-legend > span');
      const seriesGroups = card.querySelectorAll('[data-chart-series]');
      if (legendItems.length >= 2 && seriesGroups.length >= 2) {
        legendItems.forEach((span, idx) => {
          span.classList.add('chart-legend-toggle');
          span.title = '点击显示/隐藏该数据系列';
          span.addEventListener('click', () => {
            const isHidden = span.classList.toggle('dimmed');
            seriesGroups.forEach((g) => {
              if (Number(g.dataset.chartSeries) === idx) g.style.opacity = isHidden ? '0.08' : '1';
            });
          });
        });
      }
    });

    // 4. 圆角环形图：弧段与图例双向联动高亮 + 中心数值实时切换 + 点击锁定
    appEl.querySelectorAll('.interactive-donut-wrap').forEach((wrap) => {
      const segs = wrap.querySelectorAll('.donut-seg');
      const rows = wrap.querySelectorAll('.donut-legend-item');
      const topText = wrap.querySelector('.donut-center-top');
      const botText = wrap.querySelector('.donut-center-bottom');
      const defTop = wrap.dataset.defaultTop;
      const defBot = wrap.dataset.defaultBottom;
      let pinnedIdx = null;

      const applyFocus = (idx) => {
        if (idx === null) {
          segs.forEach((s) => { s.classList.remove('active', 'dimmed'); });
          rows.forEach((r) => { r.classList.remove('active'); });
          if (topText) topText.textContent = defTop;
          if (botText) botText.textContent = defBot;
          return;
        }
        const activeSeg = wrap.querySelector(`.donut-seg[data-donut-idx="${idx}"]`);
        segs.forEach((s) => {
          const match = s.dataset.donutIdx === String(idx);
          s.classList.toggle('active', match);
          s.classList.toggle('dimmed', !match);
        });
        rows.forEach((r) => r.classList.toggle('active', r.dataset.donutIdx === String(idx)));
        if (activeSeg && topText && botText) {
          topText.textContent = activeSeg.dataset.donutPct;
          botText.textContent = activeSeg.dataset.donutName.slice(0, 9);
        }
      };

      [...segs, ...rows].forEach((el) => {
        const idx = el.dataset.donutIdx;
        el.addEventListener('mouseenter', () => applyFocus(idx));
        el.addEventListener('mouseleave', () => applyFocus(pinnedIdx));
        el.addEventListener('click', () => {
          pinnedIdx = pinnedIdx === idx ? null : idx;
          applyFocus(pinnedIdx);
          if (pinnedIdx !== null) showToast(`已锁定查看：${el.dataset.donutName}（${el.dataset.donutPct}）`);
        });
      });
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalRoot.innerHTML) { cleanupActiveCapture(); closeModal(); }
    if (e.key === 'Escape' && state.avatarMenuOpen) { state.avatarMenuOpen = false; render(); }
  });
  document.addEventListener('click', () => {
    if (state.avatarMenuOpen) { state.avatarMenuOpen = false; render(); }
  });

  render();
})();
