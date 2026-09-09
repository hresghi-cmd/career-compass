"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type TalentKey = "spark" | "insight" | "connect" | "care" | "order" | "venture";
type Stage = "cover" | "quiz" | "milestone" | "result";
type Pole = { label: string; detail: string; talent: TalentKey };
type Question = { scene: string; prompt: string; left: Pole; right: Pole };
type RoleRecommendation = { title: string; why: string; firstStep: string };

const STORAGE_KEY = "career-compass-progress-v2";

const talents: Record<TalentKey, {
  short: string; title: string; role: string; symbol: string; color: string;
  description: string; traits: string; advice: string; recommendations: RoleRecommendation[];
  quote: string; bestAt: string; avoid: string;
}> = {
  spark: {
    short: "创意", title: "灵感造物者", role: "把不存在的东西带到现实", symbol: "✦", color: "#c75a43",
    description: "你真正享受的不是照着答案执行，而是从一片空白里找到新的表达。面对模糊任务，你会先捕捉感觉、建立概念，再把零散线索组合成让人眼前一亮的方案。你的优势在于原创、审美与打破惯例。",
    traits: "你对重复和僵化格外敏感，需要一定自主权才能进入最佳状态。别人可能觉得你跳跃，但你的大脑其实在高速连接看似无关的信息。比起被严密管理，你更适合有目标、有反馈、但允许自己选择路径的环境。",
    advice: "别只做“点子很多的人”。为灵感建立稳定的落地节奏：先做最小版本，再用真实反馈迭代。选择岗位时重点观察作品是否可见、表达是否被尊重，以及你能否参与定义问题，而不只是美化已有答案。",
    recommendations: [
      { title: "品牌创意策划", why: "需要从模糊目标中提炼概念，并把想法变成可传播的主题与内容。", firstStep: "找 3 份真实品牌策划案，尝试为一个熟悉产品重写创意简报。" },
      { title: "内容创意与栏目策划", why: "适合持续提出选题、设计表达形式，并通过作品直接观察受众反馈。", firstStep: "围绕一个主题做 3 期小栏目，用完播、收藏或访谈反馈验证。" },
      { title: "交互或体验设计师", why: "把抽象感受转成具体流程与界面，同时保留试验和打磨的空间。", firstStep: "重做一个常用功能的关键流程，并请 3 个人完成可用性测试。" },
    ],
    quote: "你不是缺少耐心，只是很难长期住在别人已经画好的格子里。",
    bestAt: "从零定义概念、创造独特表达、把抽象感觉变成可见作品",
    avoid: "只有机械执行、没有表达空间，长期以重复产量衡量价值的环境",
  },
  insight: {
    short: "洞察", title: "深潜解题者", role: "在复杂里找到真正的关键", symbol: "◎", color: "#6658a6",
    description: "你擅长把热闹的问题拆开，找到藏在表象下面的规律。面对未知，你的第一反应不是马上表态，而是搜集证据、建立假设、验证逻辑。越是复杂、需要独立思考的难题，越容易激发你的专注力。",
    traits: "你重视准确胜过速度，也更愿意用扎实判断换取长期可靠。你不一定是最先发言的人，却常能指出被忽略的变量。需要留意的是，追求完整可能让行动推迟，独自思考太久也会错过他人的现场信息。",
    advice: "给分析设置“足够好”的截止线，并练习把结论翻译成别人能执行的下一步。理想岗位应当允许深入、鼓励质疑，也能让研究结果真正进入决策，而不是长期停留在报告里。",
    recommendations: [
      { title: "用户研究员", why: "通过访谈、观察和证据找到表面需求背后的真实问题。", firstStep: "围绕一个常用产品访谈 3 位用户，整理共同障碍和一条设计建议。" },
      { title: "商业或数据分析师", why: "需要拆解复杂指标、验证假设，并把结论转成可执行决策。", firstStep: "选一份公开数据做一页分析，明确问题、证据、结论和下一步。" },
      { title: "行业研究或策略研究员", why: "长期追踪信息、识别趋势和关键变量，适合深度思考型工作方式。", firstStep: "选择一个行业写 800 字研究备忘录，并让从业者指出遗漏。" },
    ],
    quote: "你并不慢，你只是习惯先找到那个真正值得回答的问题。",
    bestAt: "拆解复杂问题、发现隐藏规律、用证据支持重要判断",
    avoid: "只追求表面速度、不允许质疑，也不使用研究结论的环境",
  },
  connect: {
    short: "影响", title: "共振推动者", role: "让想法被听见，让人愿意行动", symbol: "∞", color: "#ad4e70",
    description: "你对人的情绪、现场气氛和表达效果非常敏锐。你能迅速找到共同语言，把复杂想法讲得有感染力，也愿意站出来推动共识。对你而言，工作不只是完成任务，更是让一群人朝同一个方向动起来。",
    traits: "你的能量往往来自互动、反馈与可见的影响。你善于建立关系，却也可能因为太在意回应而消耗自己。真正成熟的影响力，不是让所有人喜欢，而是在理解分歧后仍能清楚表达立场、促成有质量的决定。",
    advice: "把你的沟通天赋和一项硬能力绑定，例如商业判断、内容、销售或组织协作。选择岗位时观察它是否有真实的决策空间和对外连接，而不只是高频开会。为自己保留独处复盘的时间，影响力会更稳。",
    recommendations: [
      { title: "商务拓展经理", why: "需要快速理解双方诉求、建立信任，并把关系推进成明确合作。", firstStep: "旁听或复盘一次合作沟通，写出双方目标、异议和下一步承诺。" },
      { title: "品牌公关与传播策划", why: "既要把复杂信息讲清楚，也要判断不同人群会如何理解和回应。", firstStep: "为一个真实项目写媒体口径和 3 类受众版本，请朋友判断是否清楚。" },
      { title: "社群增长运营", why: "通过持续互动识别共同需求，再组织内容、活动与成员协作。", firstStep: "为一个 20 人小群策划一次活动，用参与率和复访反馈复盘。" },
    ],
    quote: "你真正擅长的不是说服，而是让不同的人愿意朝同一个方向走。",
    bestAt: "建立信任、翻译复杂观点、聚合资源并推动共识",
    avoid: "高频沟通却没有决策空间，关系消耗大于真实影响的环境",
  },
  care: {
    short: "助人", title: "成长陪伴者", role: "看见人的需要，托住长期改变", symbol: "◡", color: "#347867",
    description: "你很容易注意到别人没说出口的困难，也愿意花时间理解一个人的处境。你带来的价值不是抢走问题，而是让对方重新获得力量。看到他人因为你的支持而变好，会给你很深的职业满足感。",
    traits: "你耐心、可靠、重视关系中的信任，通常擅长倾听与因人而异地调整方法。但共情并不等于无限承担。若边界模糊，你容易把别人的情绪和责任都背在自己身上，久而久之会失去职业能量。",
    advice: "练习把善意变成专业方法和清晰边界：明确服务对象、可交付结果与停止条件。适合你的环境应当尊重人的差异，也重视长期效果。选择能看见反馈的工作，会比抽象的“帮助所有人”更有力量。",
    recommendations: [
      { title: "学习发展顾问或培训师", why: "需要理解学习者差异，把知识设计成能真正发生改变的过程。", firstStep: "为一个熟悉主题做 20 分钟微课，请 3 位学习者反馈哪里最有帮助。" },
      { title: "客户成功经理", why: "通过倾听客户处境、协调资源和持续跟进，帮助对方得到真实结果。", firstStep: "研究一个客户成功案例，模拟写出目标、风险、跟进节奏和成功标准。" },
      { title: "人才发展或员工体验", why: "关注人的成长、组织环境与长期关系，工作成果能被具体观察。", firstStep: "访谈 2 位不同岗位的人，整理他们入职或成长中的关键阻碍。" },
    ],
    quote: "你的温和不是退让，而是一种让改变能够真正发生的力量。",
    bestAt: "倾听真实需要、建立安全感、陪伴他人跨过困难阶段",
    avoid: "把共情当成无限责任、边界模糊且长期情绪透支的环境",
  },
  order: {
    short: "秩序", title: "系统建造者", role: "让混乱变得稳定、清楚、可复用", symbol: "▦", color: "#3d6f8f",
    description: "你天然会留意流程、标准和风险。当别人还在讨论大方向时，你已经开始思考资源怎么排、细节怎么接、结果如何验收。你最大的价值，是把一次性的成功整理成可以持续运转的系统。",
    traits: "你认真、守承诺，面对复杂协作时很有稳定感。你喜欢清楚的边界和可预期的节奏，但并不意味着保守；你更倾向于在理解规则后稳步改进。需要避免因为怕出错而把所有变量都控制得过细。",
    advice: "不要只做团队里默默兜底的人，要把你的流程能力显性化：定义标准、展示改善前后的数据，并推动责任回到正确位置。选择重视运营质量、又允许持续优化的组织，你会越来越不可替代。",
    recommendations: [
      { title: "项目经理", why: "需要澄清目标、安排资源、控制风险，并让多人协作持续向前。", firstStep: "把一个真实小项目整理成目标、里程碑、负责人和风险清单。" },
      { title: "运营流程经理", why: "通过标准、数据和复盘减少重复失误，让一次成功变成稳定系统。", firstStep: "挑一个重复流程画出现状，找出 2 个等待点并设计改进方案。" },
      { title: "质量或合规专员", why: "适合对细节、边界和风险敏感，并愿意把要求转成可执行检查。", firstStep: "找一份公开规范，尝试制作一页检查清单并验证是否易用。" },
    ],
    quote: "你看见的从来不只是一次任务，而是它下一次如何更稳地发生。",
    bestAt: "建立流程与标准、控制风险、让多人协作稳定运转",
    avoid: "责任边界混乱、长期依赖临时救火又拒绝复盘的环境",
  },
  venture: {
    short: "行动", title: "开路实践者", role: "先走进现场，再找到可行路径", symbol: "△", color: "#9b6828",
    description: "你习惯通过行动理解世界。面对机会，你愿意先试一小步，在真实反馈里修正方向，而不是等待所有条件齐备。你对变化、挑战和有明确结果的任务更有感觉，也能在压力下快速调动资源。",
    traits: "你务实、果断，喜欢看得见的进展和直接的责任。现场越复杂，你越容易进入状态；但当速度成为惯性，可能忽略必要的复盘或他人的节奏。真正高水平的行动，是既敢下注，也知道何时停下来校准。",
    advice: "为每次快速尝试设定验证指标，行动后留出复盘，让经验沉淀成判断力。适合你的岗位通常目标明确、离结果近，并能接触客户或一线现场。避免长期困在只有审批、没有决定权的位置。",
    recommendations: [
      { title: "产品运营经理", why: "离用户和结果都近，需要快速试验、处理现场问题并根据反馈调整。", firstStep: "为一个产品设计 7 天小实验，写清目标、动作、指标和停止条件。" },
      { title: "解决方案销售", why: "目标明确、反馈直接，需要在真实客户情境中判断并推动成交。", firstStep: "选择一个产品做 10 分钟需求访谈和方案演示，请对方提出真实异议。" },
      { title: "创业项目或现场运营负责人", why: "需要在资源有限时快速组合人、信息和行动，对结果直接负责。", firstStep: "组织一次小型线下或线上项目，用预算、时限和复盘检验能量变化。" },
    ],
    quote: "你不需要看清整条路，真实迈出的第一步就是你的地图。",
    bestAt: "快速试错、现场决策、把不确定变成看得见的进展",
    avoid: "层层审批、离结果太远，只有讨论却不能亲自行动的环境",
  },
};

const questions: Question[] = [
  { scene: "面对未知", prompt: "收到一个方向模糊的新任务时，我通常会……", left: { label: "先看清问题", detail: "收集信息，找到关键", talent: "insight" }, right: { label: "先动手试试", detail: "做出雏形，再找方向", talent: "venture" } },
  { scene: "提出方案", prompt: "要交出一份方案时，我更看重……", left: { label: "新鲜独特", detail: "有自己的表达", talent: "spark" }, right: { label: "稳妥清楚", detail: "步骤完整，可执行", talent: "order" } },
  { scene: "思考方式", prompt: "遇到难题，我更容易在什么状态下找到答案？", left: { label: "独自深想", detail: "安静梳理线索", talent: "insight" }, right: { label: "边聊边想", detail: "在交流中碰出答案", talent: "connect" } },
  { scene: "帮助朋友", prompt: "朋友陷入纠结时，我更自然的反应是……", left: { label: "帮他分析", detail: "理清原因和选择", talent: "insight" }, right: { label: "先听他讲", detail: "理解他的真实感受", talent: "care" } },
  { scene: "推进项目", prompt: "时间紧、任务多时，我更依赖……", left: { label: "排好节奏", detail: "守住流程和节点", talent: "order" }, right: { label: "快速突破", detail: "先解决最急的问题", talent: "venture" } },
  { scene: "表达成果", prompt: "让别人理解一个想法时，我更擅长……", left: { label: "创造画面", detail: "用新鲜方式讲出来", talent: "spark" }, right: { label: "带动认同", detail: "让人愿意相信和行动", talent: "connect" } },
  { scene: "获得满足", prompt: "哪一种成果更容易让我感到“这件事值得”？", left: { label: "做出新东西", detail: "想法变成作品", talent: "spark" }, right: { label: "看见人成长", detail: "我的支持带来改变", talent: "care" } },
  { scene: "突发状况", prompt: "现场突然出问题时，我会优先……", left: { label: "照顾人的状态", detail: "先稳住情绪和关系", talent: "care" }, right: { label: "处理眼前问题", detail: "边行动边调整", talent: "venture" } },
  { scene: "工作环境", prompt: "什么样的环境更能让我发挥？", left: { label: "自由开放", detail: "可以探索不同可能", talent: "spark" }, right: { label: "清晰稳定", detail: "目标、职责都有边界", talent: "order" } },
  { scene: "学习新工具", prompt: "刚接触一个陌生工具时，我习惯……", left: { label: "先懂原理", detail: "弄清逻辑和边界", talent: "insight" }, right: { label: "直接上手", detail: "遇到问题再查", talent: "venture" } },
  { scene: "处理分歧", prompt: "团队意见不一致时，我更关注……", left: { label: "每个人的感受", detail: "让大家被理解", talent: "care" }, right: { label: "形成共同方向", detail: "推动大家往前走", talent: "connect" } },
  { scene: "改进旧方法", prompt: "一套旧做法不好用了，我更想……", left: { label: "重新设计", detail: "换个框架解决", talent: "spark" }, right: { label: "逐步优化", detail: "把流程一点点磨好", talent: "order" } },
  { scene: "资源有限", prompt: "在陌生环境完成紧急任务，我更依赖……", left: { label: "找到关键的人", detail: "迅速连接资源", talent: "connect" }, right: { label: "抓住机会行动", detail: "在现场随机应变", talent: "venture" } },
  { scene: "团队贡献", prompt: "在合作中，我更常提供的价值是……", left: { label: "守住细节", detail: "让事情稳定落地", talent: "order" }, right: { label: "带动大家", detail: "让团队形成合力", talent: "connect" } },
  { scene: "长期投入", prompt: "面对一个值得做很久的方向，我更享受……", left: { label: "持续钻研", detail: "越做越深、越做越懂", talent: "insight" }, right: { label: "不断实践", detail: "在真实反馈里前进", talent: "venture" } },
  { scene: "选择工作", prompt: "如果只能保留一种职业满足感，我更想要……", left: { label: "表达创造力", detail: "留下独特的作品", talent: "spark" }, right: { label: "对别人有帮助", detail: "让人的处境变好", talent: "care" } },
  { scene: "推动改变", prompt: "要说服大家改变现状，我更相信……", left: { label: "证据与逻辑", detail: "把真正原因讲清楚", talent: "insight" }, right: { label: "沟通与共识", detail: "让关键的人愿意加入", talent: "connect" } },
  { scene: "压力之下", prompt: "事情变得混乱时，我最先注意到的是……", left: { label: "秩序是否失控", detail: "职责、流程和风险", talent: "order" }, right: { label: "人是否撑得住", detail: "感受、负荷和需要", talent: "care" } },
];

const talentOrder = Object.keys(talents) as TalentKey[];
const questionAccent = "#3157c8";
const intensityLabels = ["非常偏向左侧", "比较偏向左侧", "稍微偏向左侧", "两边都符合", "稍微偏向右侧", "比较偏向右侧", "非常偏向右侧"];
const milestoneCopy = {
  6: { step: "第一段坐标已定位", title: "你处理未知的方式，开始显形。", body: "接下来别考虑哪种答案更理想，只留意：哪一个动作最像没有人要求时，你也会自然去做的事。", mark: "Ⅰ" },
  12: { step: "第二段坐标已定位", title: "你的优势，不只是一项技能。", body: "它更像一种稳定的工作姿态。最后 6 个场景会观察你在选择、压力与长期成长中的真实偏好。", mark: "Ⅱ" },
};

function calculateScores(answers: number[]) {
  const raw = Object.fromEntries(Object.keys(talents).map((key) => [key, 0])) as Record<TalentKey, number>;
  answers.forEach((position, questionIndex) => {
    const question = questions[questionIndex];
    if (!question || position < 0 || position > 6) return;
    raw[question.left.talent] += 6 - position;
    raw[question.right.talent] += position;
  });
  const max = Math.max(...Object.values(raw), 1);
  const ranked = (Object.keys(raw) as TalentKey[])
    .map((key) => ({ key, raw: raw[key], percent: Math.round((raw[key] / max) * 100) }))
    .sort((a, b) => b.raw - a.raw);
  return { raw, ranked };
}

export default function Home() {
  const [stage, setStage] = useState<Stage>("cover");
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [soundOn, setSoundOn] = useState(true);
  const audioContextRef = useRef<AudioContext | null>(null);

  /* Browser progress is intentionally restored once after hydration. */
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      setSoundOn(localStorage.getItem(`${STORAGE_KEY}-sound`) !== "off");
      if (saved) {
        const parsed = JSON.parse(saved) as { answers?: number[]; current?: number };
        if (Array.isArray(parsed.answers) && parsed.answers.length > 0) {
          setAnswers(parsed.answers.slice(0, questions.length));
          setCurrent(Math.min(parsed.current ?? parsed.answers.length, questions.length - 1));
          setStage(parsed.answers.length === questions.length ? "result" : "quiz");
        }
      }
    } catch { localStorage.removeItem(STORAGE_KEY); }
    finally { setLoaded(true); }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!loaded || stage === "cover") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ answers, current }));
  }, [answers, current, stage, loaded]);

  const results = useMemo(() => calculateScores(answers), [answers]);
  const winner = results.ranked[0]?.key ?? "spark";
  const winnerInfo = talents[winner];
  const secondary = results.ranked[1]?.key ?? "insight";

  const playFeedback = (kind: "select" | "complete", force = false, position = 3) => {
    if (!soundOn && !force) return;
    try {
      const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const context = audioContextRef.current ?? new AudioContextClass();
      audioContextRef.current = context;
      const renderFeedback = () => {
        const master = context.createGain();
        const compressor = context.createDynamicsCompressor();
        master.gain.setValueAtTime(.88, context.currentTime);
        compressor.threshold.setValueAtTime(-18, context.currentTime);
        compressor.knee.setValueAtTime(12, context.currentTime);
        compressor.ratio.setValueAtTime(5, context.currentTime);
        master.connect(compressor);
        compressor.connect(context.destination);

        const voice = (frequency: number, delay: number, duration: number, volume: number, type: OscillatorType, pan = 0) => {
          const oscillator = context.createOscillator();
          const gain = context.createGain();
          const filter = context.createBiquadFilter();
          const startAt = context.currentTime + delay;
          oscillator.type = type;
          oscillator.frequency.setValueAtTime(frequency, startAt);
          filter.type = "lowpass";
          filter.frequency.setValueAtTime(3600, startAt);
          gain.gain.setValueAtTime(.0001, startAt);
          gain.gain.exponentialRampToValueAtTime(volume, startAt + .012);
          gain.gain.exponentialRampToValueAtTime(.0001, startAt + duration);
          oscillator.connect(filter);
          filter.connect(gain);
          if (typeof context.createStereoPanner === "function") {
            const panner = context.createStereoPanner();
            panner.pan.setValueAtTime(pan, startAt);
            gain.connect(panner);
            panner.connect(master);
          } else gain.connect(master);
          oscillator.start(startAt);
          oscillator.stop(startAt + duration + .02);
        };

        if (kind === "complete") {
          [523.25, 659.25, 783.99, 1046.5].forEach((frequency, index) => {
            voice(frequency, index * .065, .32, index === 3 ? .075 : .055, index % 2 ? "sine" : "triangle", (index - 1.5) * .1);
          });
        } else {
          const pitch = 560 + position * 46;
          const pan = (position - 3) / 4;
          voice(pitch, 0, .13, .068, "triangle", pan);
          voice(pitch * 1.5, .018, .17, .034, "sine", pan * .55);
          voice(1280 + position * 28, 0, .052, .018, "sine", pan * .35);
        }
      };

      if (context.state === "suspended") void context.resume().then(renderFeedback);
      else renderFeedback();
    } catch { /* Sound is an enhancement; the visual feedback still works. */ }
  };

  useEffect(() => () => {
    if (audioContextRef.current) void audioContextRef.current.close();
  }, []);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    localStorage.setItem(`${STORAGE_KEY}-sound`, next ? "on" : "off");
    if (next) playFeedback("select", true);
  };

  const start = () => {
    playFeedback("select");
    if (answers.length === questions.length) setStage("result");
    else { setCurrent(Math.min(answers.length, questions.length - 1)); setStage("quiz"); }
  };

  const choose = (position: number) => {
    if (transitioning) return;
    setTransitioning(true);
    setSelectedChoice(position);
    playFeedback("select", false, position);
    if ("vibrate" in navigator) navigator.vibrate(position === 0 || position === 6 ? [9, 18, 10] : 10);
    const next = answers.slice(); next[current] = position; next.splice(current + 1); setAnswers(next);
    window.setTimeout(() => {
      if (current === questions.length - 1) {
        setStage("result");
        playFeedback("complete");
        if ("vibrate" in navigator) navigator.vibrate([14, 24, 26]);
      }
      else if (current === 5 || current === 11) { setCurrent((value) => value + 1); setStage("milestone"); }
      else setCurrent((value) => value + 1);
      setSelectedChoice(null);
      setTransitioning(false);
    }, 430);
  };

  const goBack = () => {
    setSelectedChoice(null);
    if (stage === "result") {
      setAnswers((value) => value.slice(0, questions.length - 1));
      setCurrent(questions.length - 1);
      setStage("quiz");
      return;
    }
    if (stage === "milestone") {
      setAnswers((value) => value.slice(0, Math.max(0, current - 1)));
      setCurrent((value) => Math.max(0, value - 1));
      setStage("quiz");
      return;
    }
    if (current === 0) setStage("cover");
    else setCurrent((value) => value - 1);
  };
  const reset = () => { localStorage.removeItem(STORAGE_KEY); setAnswers([]); setCurrent(0); setStage("cover"); setCopied(false); setSelectedChoice(null); };
  const shareText = `我的职业天赋主型是「${winnerInfo.title}」，第二天赋是「${talents[secondary].short}」。原来适合我的，不是某一个标准答案，而是一种能发挥天赋的工作方式。来测测你的职业天赋坐标吧！`;

  const copyShare = async () => {
    try { await navigator.clipboard.writeText(shareText); }
    catch {
      const area = document.createElement("textarea"); area.value = shareText; document.body.appendChild(area); area.select(); document.execCommand("copy"); area.remove();
    }
    setCopied(true); window.setTimeout(() => setCopied(false), 1800);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (stage !== "quiz" || transitioning) return;
      if (event.key === "Backspace") { event.preventDefault(); goBack(); }
      if (event.key.toLowerCase() === "m") toggleSound();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  if (!loaded) return <main className="app-shell" aria-busy="true" />;

  return (
    <main className={`app-shell stage-${stage}`}>
      <div className="ambient ambient-one" aria-hidden="true" />
      <div className="ambient ambient-two" aria-hidden="true" />
      <div className="ambient ambient-three" aria-hidden="true" />
      {stage === "cover" && (
        <section className="cover page-enter" aria-labelledby="site-title">
          <nav className="brand-row" aria-label="网站信息"><span className="brand-mark">C</span><span>职业天赋坐标</span><button className="sound-toggle" onClick={toggleSound} aria-pressed={soundOn} aria-label={soundOn ? "关闭答题音效" : "开启答题音效"}><span aria-hidden="true">{soundOn ? "♪" : "×"}</span>{soundOn ? "声效开启" : "声效关闭"}</button></nav>
          <div className="cover-copy">
            <div className="eyebrow"><span /> 一场关于工作方式的自我勘探</div>
            <h1 id="site-title">你的职业天赋<br /><em>藏在哪个坐标？</em></h1>
            <p className="lead">18 道轻量选择题，不用比较复杂答案。跟着第一感觉，在两种工作方式之间选出更像你的程度。</p>
          </div>
          <div className="compass-wrap">
            <div className="compass-card" aria-hidden="true"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="needle"><span /></div><div className="axis axis-n">N</div><div className="axis axis-e">E</div><div className="axis axis-s">S</div><div className="axis axis-w">W</div></div>
            <div className="talent-legend" aria-label="六类职业天赋">{talentOrder.map((key) => <span key={key} style={{ "--legend-color": talents[key].color } as React.CSSProperties}><i>{talents[key].symbol}</i>{talents[key].short}</span>)}</div>
          </div>
          <div className="cover-action">
            <button className="primary-button" onClick={start}>{answers.length > 0 ? "继续上次测试" : "开始探索"}<span>→</span></button>
            <div className="test-meta"><span>18 题</span><span>约 2 分钟</span><span>7 级倾向</span></div>
            {answers.length > 0 && <button className="text-button" onClick={reset}>清除进度，重新开始</button>}
          </div>
          <p className="disclaimer">这是一份职业倾向探索工具，不用于招聘筛选或临床诊断。</p>
        </section>
      )}

      {stage === "quiz" && (
        <section className={`quiz page-enter ${transitioning ? "is-leaving" : ""}`} aria-labelledby="question-title">
          <header className="quiz-header">
            <button className="icon-button" onClick={goBack} aria-label={current === 0 ? "返回首页" : "返回上一题"} title={current === 0 ? "返回首页" : "返回上一题"}>←</button>
            <div className="progress-wrap"><div className="progress-copy"><span>探索进度</span><strong>{String(current + 1).padStart(2, "0")} / {questions.length}</strong></div><div className="progress-track" role="progressbar" aria-valuemin={1} aria-valuemax={questions.length} aria-valuenow={current + 1}><span style={{ width: `${((current + 1) / questions.length) * 100}%` }} /></div></div>
            <button className="sound-toggle compact" onClick={toggleSound} aria-pressed={soundOn} aria-label={soundOn ? "关闭答题音效" : "开启答题音效"}><span aria-hidden="true">{soundOn ? "♪" : "×"}</span></button>
          </header>
          <div className="talent-ribbon" aria-hidden="true">{talentOrder.map((key, index) => <span key={key} className={current >= index * 3 ? "lit" : ""} style={{ "--dot-color": talents[key].color } as React.CSSProperties}><i>{talents[key].symbol}</i><b>{talents[key].short}</b></span>)}</div>
          <div className="question-block" key={current} style={{ "--question-accent": questionAccent } as React.CSSProperties}>
            <div className="question-card-top"><div className="question-number">第 {String(current + 1).padStart(2, "0")} 题</div><span>{questions[current].scene}</span></div>
            <h2 id="question-title">{questions[current].prompt}</h2>
          </div>
          <div key={`scale-${current}`} className={`scale-card ${selectedChoice !== null ? "has-selection" : ""}`} style={{ "--left-color": talents[questions[current].left.talent].color, "--right-color": talents[questions[current].right.talent].color } as React.CSSProperties}>
            <div className="scale-poles">
              <div className="pole pole-left"><span><i>{talents[questions[current].left.talent].symbol}</i>{talents[questions[current].left.talent].short}</span><strong>{questions[current].left.label}</strong><p>{questions[current].left.detail}</p></div>
              <div className="pole pole-right"><span>{talents[questions[current].right.talent].short}<i>{talents[questions[current].right.talent].symbol}</i></span><strong>{questions[current].right.label}</strong><p>{questions[current].right.detail}</p></div>
            </div>
            <div className="scale-options" role="radiogroup" aria-label="请选择你在两种倾向之间的位置">
              {intensityLabels.map((label, index) => {
                const isSelected = selectedChoice === index || (!transitioning && answers[current] === index);
                return <button key={label} type="button" style={{ "--choice-index": index } as React.CSSProperties} className={`scale-option level-${Math.abs(3 - index)} ${isSelected ? "selected" : ""} ${transitioning && selectedChoice !== index ? "deemphasized" : ""}`} role="radio" aria-checked={isSelected} aria-label={`${label}：${index < 3 ? questions[current].left.label : index > 3 ? questions[current].right.label : "两边都符合"}`} onClick={() => choose(index)} disabled={transitioning}><span className="scale-dot"><span>{isSelected ? "✓" : ""}</span></span><small>{index === 0 || index === 6 ? "非常符合" : index === 3 ? "都符合" : ""}</small></button>;
              })}
            </div>
            <div className="scale-readout" aria-live="polite"><span>{selectedChoice === null ? "选择最接近你的程度" : intensityLabels[selectedChoice]}</span></div>
            <p className="scale-help">越靠近一端，代表越符合。没有标准答案，凭第一感觉即可。</p>
          </div>
          <div className="quiz-footer"><button className="back-button" onClick={goBack}>← {current === 0 ? "返回首页" : "返回上一题"}</button><p className="quiz-tip">选择后将自动进入下一题</p><button className="reset-mini" onClick={reset}>清除进度</button></div>
        </section>
      )}

      {stage === "milestone" && (
        <section className="milestone page-enter" aria-labelledby="milestone-title">
          <div className="milestone-grid" aria-hidden="true">{talentOrder.map((key) => <span key={key} style={{ backgroundColor: talents[key].color }}>{talents[key].symbol}</span>)}</div>
          <div className="milestone-copy">
            <span className="milestone-mark">{milestoneCopy[current as 6 | 12].mark}</span>
            <p>{milestoneCopy[current as 6 | 12].step}<span>{current} / {questions.length}</span></p>
            <h2 id="milestone-title">{milestoneCopy[current as 6 | 12].title}</h2>
            <div className="milestone-line" />
            <p className="milestone-body">{milestoneCopy[current as 6 | 12].body}</p>
            <div className="milestone-actions"><button className="primary-button" onClick={() => { playFeedback("select"); setStage("quiz"); }}>继续探索<span>→</span></button><button className="back-button" onClick={goBack}>← 返回上一题修改</button></div>
          </div>
        </section>
      )}

      {stage === "result" && (
        <section className="result page-enter" aria-labelledby="result-title" style={{ "--talent-color": winnerInfo.color } as React.CSSProperties}>
          <header className="result-topbar"><span className="brand-mark small">C</span><span>你的职业天赋报告</span><button className="sound-toggle compact" onClick={toggleSound} aria-pressed={soundOn} aria-label={soundOn ? "关闭答题音效" : "开启答题音效"}><span aria-hidden="true">{soundOn ? "♪" : "×"}</span></button><button className="result-back-button" onClick={goBack}>← 修改最后一题</button><button className="text-button" onClick={reset}>重新测试</button></header>
          <div className="result-hero">
            <div className="identity-card">
              <div className="id-top"><span>职业天赋坐标</span><span>完成 18 个场景</span></div>
              <div className="result-symbol">{winnerInfo.symbol}</div>
              <div className="result-kicker">你的主天赋 <span>{winnerInfo.short}</span></div>
              <h1 id="result-title">{winnerInfo.title}</h1>
              <p className="result-role">{winnerInfo.role}</p>
              <blockquote>“{winnerInfo.quote}”</blockquote>
              <div className="result-tags">{winnerInfo.recommendations.map(({ title }) => <span key={title}>{title}</span>)}</div>
              <div className="id-bottom"><span>主天赋 {winnerInfo.short}</span><span>第二天赋 {talents[secondary].short}</span></div>
            </div>
            <aside className="combination-card"><span>你的独特组合</span><h2>{winnerInfo.short} × {talents[secondary].short}</h2><p>你以<strong>{winnerInfo.role}</strong>作为主要驱动力，同时带着“{talents[secondary].role}”的第二视角。这不是两个标签的相加，而是你处理复杂工作时最有辨识度的组合。</p><div><em>最能发挥</em><b>{winnerInfo.bestAt}</b></div><div><em>容易消耗</em><b>{winnerInfo.avoid}</b></div></aside>
          </div>
          <div className="result-grid">
            <article className="panel score-panel"><div className="panel-heading"><h2>天赋光谱</h2><p>最高倾向作为 100% 参照</p></div><div className="bars">{results.ranked.map(({ key, percent }, index) => <div className="bar-row" key={key} style={{ "--bar-color": talents[key].color, "--score-width": `${percent}%`, "--rank-delay": `${index * 90}ms` } as React.CSSProperties}><div className="bar-label"><span>{String(index + 1).padStart(2, "0")}</span><strong>{talents[key].short}</strong><em>{percent}%</em></div><div className="bar-line"><span /></div></div>)}</div><p className="secondary-note">第二天赋是 <strong>{talents[secondary].title}</strong>。它让你的主型表现得更有个人辨识度。</p></article>
            <article className="panel analysis-panel"><div className="panel-heading"><h2>你的工作底色</h2></div><div className="analysis-copy"><section><h3>结果解读</h3><p>{winnerInfo.description}</p></section><section><h3>性格与能量</h3><p>{winnerInfo.traits}</p></section><section><h3>具体建议</h3><p>{winnerInfo.advice}</p></section></div></article>
            <article className="panel path-panel"><div className="panel-heading"><h2>优先探索的具体岗位</h2><p>先把它们当作访谈和体验清单，再结合你的技能、经历与现实机会判断。</p></div><div className="path-list">{winnerInfo.recommendations.map((item, index) => <div key={item.title} style={{ "--path-delay": `${index * 70}ms` } as React.CSSProperties}><span>{String(index + 1).padStart(2, "0")}</span><section><strong>{item.title}</strong><p>{item.why}</p><small><b>先试一步</b>{item.firstStep}</small></section></div>)}</div></article>
            <article className="panel action-panel"><span className="action-mark" aria-hidden="true">7</span><div className="panel-heading"><h2>7 天微行动</h2></div><p>从上面的方向中挑一个，不急着决定转行。找一位真实从业者，问清楚他一周里最常做的三件事；再用 90 分钟做一个最小体验。你在行动后的能量变化，比任何标签都更接近答案。</p></article>
          </div>
          <div className="share-card"><div><span>分享你的坐标</span><h2>把这份发现发给同行的人</h2><p>{shareText}</p></div><button className="primary-button" onClick={copyShare}>{copied ? "已复制 ✓" : "复制分享文案"}</button></div>
          <details className="method"><summary>计分规则与使用说明 <span>＋</span></summary><p>每题比较两种职业倾向：越靠近某一端，该项天赋获得的权重越高；选择中间则两边获得相同权重。18 题让六类天赋都得到同等次数的比较，累计得分后排序。图表以本次最高分为 100% 显示相对强度；它反映的是你的偏好，不代表能力上限，也不等于唯一职业答案。</p></details>
          <footer>职业天赋坐标<br /><span>认识自己，是选择的起点</span></footer>
        </section>
      )}
    </main>
  );
}
