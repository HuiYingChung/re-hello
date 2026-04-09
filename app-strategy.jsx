import { useState } from "react";

const sections = ["受眾全景", "5 種使用情境", "Persona 深潛", "定位 & MVP 對齊"];

const segments = [
  {
    id: "forgetful",
    icon: "🧠",
    label: "記憶流失者",
    oneLiner: "參加聚會後容易忘記細節的人",
    color: "#f59e0b",
    size: "最大",
    urgency: "高",
    problem: "活動結束 48 小時內，80% 的對話細節就消失了。名片堆在抽屜裡，LinkedIn 連結變成一串無意義的名字。",
    trigger: "剛結束一場活動、翻到舊名片想不起是誰",
    currentHack: "在手機備忘錄亂寫、拍名片照片但從不整理、在 LinkedIn 邀請裡加一句「nice meeting you」然後再也沒聯繫",
    whatWeGive: "活動結束後的引導式記錄：3 個問題幫你在記憶最鮮明時把細節存下來。不是填表格，是在對話中回想。",
    keyFeature: "引導式記錄 + 語音備忘",
    quote: "「我記得我們聊得很開心，但我完全忘了聊什麼。」"
  },
  {
    id: "awkward-followup",
    icon: "🌱",
    label: "延續困難者",
    oneLiner: "想維持新關係，但不知如何自然延續的人",
    color: "#2dd4bf",
    size: "大",
    urgency: "高",
    problem: "認識了一個很聊得來的人，但之後不知道怎麼開口。太快聯繫怕尷尬，太慢又生疏。每次都卡在「要傳什麼」。",
    trigger: "想聯繫某人但打開訊息欄遲遲打不出字",
    currentHack: "在社群媒體默默按讚但不敢私訊、等對方先聯繫、告訴自己「下次遇到再說」然後再也沒遇到",
    whatWeGive: "回顧卡 + 自然的 follow-up 時機建議。因為你記下了上次聊的內容，所以有具體的理由聯繫：「你上次提到那本書，我看完了！」",
    keyFeature: "回顧卡 + 破冰建議 + 時機提醒",
    quote: "「我不是不想聯繫，我是不知道要說什麼才不會很突兀。」"
  },
  {
    id: "drained",
    icon: "🔋",
    label: "社交耗能者",
    oneLiner: "容易社交疲勞的人",
    color: "#818cf8",
    size: "中大",
    urgency: "中",
    problem: "社交不是不行，但很消耗能量。一場活動下來需要一整天恢復。因此更需要每次社交都「值得」——用最少的能量得到最有意義的連結。",
    trigger: "活動前感到焦慮、活動後筋疲力盡",
    currentHack: "限制自己只去「一定要去」的活動、提早離開、在角落找一個人深聊以避免 small talk",
    whatWeGive: "活動前的心態準備模式：設定小目標（今天認識 2 個人就好）、提前看看誰會在場、準備好 1-2 個話題。讓社交有目標感，減少「漫無目的消耗」。",
    keyFeature: "活動前準備 + 社交能量管理",
    quote: "「我不討厭人，我只是電量有限。」"
  },
  {
    id: "high-volume",
    icon: "🎪",
    label: "大量接觸者",
    oneLiner: "求職、networking、校園活動中認識很多新人的學生或年輕專業人士",
    color: "#f472b6",
    size: "大",
    urgency: "非常高",
    problem: "Career fair 一天認識 20 個人，networking event 每週都有。名片和 LinkedIn 連結堆積如山，但真正能叫出名字的不到 5 個。",
    trigger: "Career fair / orientation / networking season 開始",
    currentHack: "Excel 表格追蹤、在名片背面寫字、LinkedIn 連結後再也沒看過",
    whatWeGive: "批量記錄模式 + 優先級標記：快速記下每個人的 1-2 個亮點，標記值得 follow-up 的人。活動隔天推送提醒：「昨天標記了 3 個想聯繫的人，要現在寫嗎？」",
    keyFeature: "快速記錄 + 優先級 + 隔天提醒",
    quote: "「我認識了很多人，但我誰都不認識。」"
  },
  {
    id: "genuine",
    icon: "💛",
    label: "真誠連結者",
    oneLiner: "想表現得更貼心，但不想用很商業化 CRM 的人",
    color: "#a3e635",
    size: "中",
    urgency: "中",
    problem: "想記住別人的生日、孩子的名字、上次聊到的煩惱——不是為了「經營人脈」，而是因為真心在乎。但 CRM 的介面和術語（leads, pipeline, conversion）讓人感覺在做生意，不是在交朋友。",
    trigger: "用過 CRM 但覺得「把朋友當客戶管理」很不舒服",
    currentHack: "靠記憶力硬撐、偶爾在通訊軟體裡翻聊天記錄回想",
    whatWeGive: "沒有 pipeline、沒有 leads、沒有 conversion rate。只有人、故事、和下次見面時能讓對方微笑的細節。介面語言用「記一下」不用「新增聯絡人」，用「下次聊什麼」不用「follow-up action」。",
    keyFeature: "溫暖的語言設計 + 去商業化 UX",
    quote: "「我只是想當一個記得你的人，不是在管理你。」"
  },
];

const personas = [
  {
    emoji: "🎓", name: "Mei", age: 24,
    title: "ASU 國際碩士生 · 求職季",
    segments: ["forgetful", "high-volume", "drained"],
    story: "Mei 下週有 career fair。她打開 app，先看上學期在 info session 認識的 3 個 recruiter 的回顧卡——Google 的 Amy 聊過 UX research 的趨勢，Amazon 的 Jake 建議她看一本書。她設定今天的目標：認識 4 個新的人，跟 Amy 重新打招呼。\n\n活動結束後，Mei 在車上用語音記了 4 段備忘，每段 30 秒。回到家，app 已經把語音整理成 4 張人物卡片。她標記其中 2 個為「想 follow up」。\n\n隔天早上，app 提醒她：「昨天標記了 2 個人，要現在寫 follow-up 嗎？」並附上破冰建議。Mei 花了 5 分鐘發了 2 封自然的訊息。",
    week: [
      { day: "週一", action: "看回顧卡，準備週三的 career fair" },
      { day: "週三", action: "Career fair 後錄語音備忘 ×4" },
      { day: "週四", action: "App 提醒 follow-up，發 2 封訊息" },
      { day: "週六", action: "社交電量低，app 不打擾" },
    ]
  },
  {
    emoji: "💻", name: "Kevin", age: 29,
    title: "Software Engineer · 想轉 PM",
    segments: ["awkward-followup", "drained", "genuine"],
    story: "Kevin 上個月在公司 happy hour 認識了 PM 團隊的 Sarah。他們聊了 product thinking 和一本書。Kevin 想繼續聯繫，但之後一直不知道要說什麼。\n\n兩週後，app 推了一個溫和的提醒：「你跟 Sarah 上次聊到《Inspired》，可以問她看完了沒。」Kevin 覺得這個理由很自然，不會顯得刻意。他在 Slack 上傳了一則訊息，Sarah 馬上回了，還邀他參加 PM 讀書會。\n\nKevin 在 app 裡更新了 Sarah 的卡片：「加入了她的 PM 讀書會，每月第一個週四。」",
    week: [
      { day: "週二", action: "收到 Sarah 的 follow-up 提醒" },
      { day: "週二", action: "用破冰建議發 Slack 訊息" },
      { day: "週四", action: "參加 PM 讀書會，記下新認識的人" },
      { day: "週五", action: "更新 Sarah 的卡片 + 新增 2 人" },
    ]
  },
  {
    emoji: "🌏", name: "Lily", age: 28,
    title: "翻譯 · 在美 5 年 · 中英雙語社交",
    segments: ["forgetful", "awkward-followup", "genuine"],
    story: "Lily 週末參加了 local book club。她用中文記下了跟美國朋友 Rachel 的對話：「Rachel 最近在學做台灣料理，問我推薦食材。」App 自動標記這是一個很好的 follow-up 機會。\n\n下週見面前，Lily 看了回顧卡，帶了一包花椒給 Rachel。Rachel 驚喜地說：「你居然記得！」\n\nLily 在 app 裡寫下：「Rachel 收到花椒很開心，說下次要做麻婆豆腐請我吃。」這些小細節讓她跨文化的友誼不再停留在 small talk。",
    week: [
      { day: "週六", action: "Book club 後用中文記錄 3 個人" },
      { day: "週二", action: "看回顧卡，決定帶花椒給 Rachel" },
      { day: "週六", action: "更新 Rachel 的故事" },
    ]
  },
];

const featureMap = [
  { feature: "引導式記錄", segments: ["forgetful", "genuine"], tier: "MVP" },
  { feature: "語音備忘 → AI 整理", segments: ["forgetful", "high-volume"], tier: "MVP" },
  { feature: "回顧卡（見面前一鍵回顧）", segments: ["awkward-followup", "forgetful", "genuine"], tier: "MVP" },
  { feature: "破冰/follow-up 建議", segments: ["awkward-followup", "drained"], tier: "MVP" },
  { feature: "活動前準備模式", segments: ["drained", "high-volume"], tier: "MVP" },
  { feature: "小目標設定", segments: ["drained", "high-volume"], tier: "MVP" },
  { feature: "快速記錄模式（批量）", segments: ["high-volume"], tier: "MVP" },
  { feature: "優先級標記 + 隔天提醒", segments: ["high-volume", "awkward-followup"], tier: "MVP" },
  { feature: "溫暖語言 / 去商業化 UX", segments: ["genuine"], tier: "MVP" },
  { feature: "搜尋（場合/標籤/關鍵字）", segments: ["forgetful", "high-volume"], tier: "MVP" },
  { feature: "社交能量追蹤", segments: ["drained"], tier: "V2" },
  { feature: "話題庫（依對方興趣推薦）", segments: ["awkward-followup", "drained"], tier: "V2" },
  { feature: "互動時間軸", segments: ["genuine", "forgetful"], tier: "V2" },
  { feature: "跨文化社交指南", segments: ["genuine"], tier: "V3" },
  { feature: "活動整合（Eventbrite/Meetup）", segments: ["high-volume", "drained"], tier: "V3" },
];

const segColors = { forgetful: "#f59e0b", "awkward-followup": "#2dd4bf", drained: "#818cf8", "high-volume": "#f472b6", genuine: "#a3e635" };
const segLabels = { forgetful: "記憶流失", "awkward-followup": "延續困難", drained: "社交耗能", "high-volume": "大量接觸", genuine: "真誠連結" };

export default function Strategy() {
  const [tab, setTab] = useState(0);
  const [openSeg, setOpenSeg] = useState(null);
  const [openPersona, setOpenPersona] = useState(0);

  return (
    <div style={{ fontFamily: "'Noto Sans TC', 'Noto Sans', system-ui, sans-serif", background: "#0a0d15", color: "#e2e8f0", minHeight: "100vh", padding: "24px 14px" }}>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@300;400;500;700;900&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
      <div style={{ maxWidth: 860, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 28, paddingBottom: 20, borderBottom: "1px solid #1a1f2e" }}>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#2dd4bf", letterSpacing: 3, marginBottom: 8 }}>STRATEGY v3 · AUDIENCE-FIRST</div>
          <h1 style={{ fontSize: 24, fontWeight: 900, margin: 0, lineHeight: 1.3 }}>
            五種人，一個核心需求：<span style={{ color: "#2dd4bf" }}>記住人，而不是管理人</span>
          </h1>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 24, flexWrap: "wrap" }}>
          {sections.map((s, i) => (
            <button key={i} onClick={() => setTab(i)} style={{
              padding: "7px 14px", borderRadius: 6, border: "none", cursor: "pointer",
              fontSize: 12, fontWeight: tab === i ? 700 : 400, fontFamily: "inherit",
              background: tab === i ? "#2dd4bf" : "#141825",
              color: tab === i ? "#0a0d15" : "#64748b",
            }}>{s}</button>
          ))}
        </div>

        {/* ===== TAB 0: Overview ===== */}
        {tab === 0 && (
          <div>
            <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.7, marginBottom: 24 }}>
              我們的用戶不是一種「人格類型」，而是處於五種<strong style={{ color: "#e2e8f0" }}>行為情境</strong>中的人。同一個人可能同時符合 2-3 個情境。這意味著我們的功能要覆蓋這些情境的交集。
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 8, marginBottom: 28 }}>
              {segments.map((s) => (
                <div key={s.id} style={{ background: "#141825", borderRadius: 10, padding: 14, borderTop: `3px solid ${s.color}`, textAlign: "center" }}>
                  <div style={{ fontSize: 28, marginBottom: 6 }}>{s.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontSize: 11, color: "#64748b", lineHeight: 1.5 }}>{s.oneLiner}</div>
                  <div style={{ marginTop: 8, display: "flex", justifyContent: "center", gap: 8, fontSize: 10 }}>
                    <span style={{ color: s.color }}>市場：{s.size}</span>
                    <span style={{ color: "#475569" }}>|</span>
                    <span style={{ color: "#94a3b8" }}>急迫：{s.urgency}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Overlap viz */}
            <div style={{ background: "#141825", borderRadius: 10, padding: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 10 }}>情境重疊：同一個人可能是誰？</div>
              <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.8 }}>
                <span style={{ color: "#f59e0b" }}>🧠 記憶流失</span> + <span style={{ color: "#f472b6" }}>🎪 大量接觸</span> → 求職季的學生（最大族群）<br/>
                <span style={{ color: "#2dd4bf" }}>🌱 延續困難</span> + <span style={{ color: "#a3e635" }}>💛 真誠連結</span> → 想要深度關係但不知怎麼開口的人<br/>
                <span style={{ color: "#818cf8" }}>🔋 社交耗能</span> + <span style={{ color: "#f59e0b" }}>🧠 記憶流失</span> → 內向專業人士（活動後太累懶得記）<br/>
                <span style={{ color: "#a3e635" }}>💛 真誠連結</span> + <span style={{ color: "#818cf8" }}>🔋 社交耗能</span> → 選擇性社交者（少但要精）
              </div>
            </div>
          </div>
        )}

        {/* ===== TAB 1: 5 Segments Deep Dive ===== */}
        {tab === 1 && (
          <div>
            {segments.map((s, i) => (
              <div key={s.id} style={{ marginBottom: 8 }}>
                <button onClick={() => setOpenSeg(openSeg === i ? -1 : i)} style={{
                  width: "100%", textAlign: "left", background: openSeg === i ? "#141825" : "#0f1219",
                  border: openSeg === i ? `1px solid ${s.color}33` : "1px solid #141825",
                  borderRadius: openSeg === i ? "10px 10px 0 0" : 10,
                  padding: "14px 16px", cursor: "pointer", fontFamily: "inherit", color: "#e2e8f0",
                  display: "flex", alignItems: "center", gap: 12,
                }}>
                  <span style={{ fontSize: 22 }}>{s.icon}</span>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontWeight: 700, fontSize: 14, marginRight: 8 }}>{s.label}</span>
                    <span style={{ fontSize: 12, color: "#64748b" }}>{s.oneLiner}</span>
                  </div>
                  <span style={{ color: "#475569", transform: openSeg === i ? "rotate(90deg)" : "none", transition: "transform 0.15s" }}>›</span>
                </button>

                {openSeg === i && (
                  <div style={{ background: "#141825", borderRadius: "0 0 10px 10px", padding: "0 16px 16px", borderLeft: `3px solid ${s.color}`, marginTop: -1 }}>
                    {/* Quote */}
                    <div style={{ padding: "14px 0 10px", borderBottom: "1px solid #1a1f2e" }}>
                      <div style={{ fontSize: 14, color: s.color, fontStyle: "italic" }}>{s.quote}</div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, paddingTop: 14, fontSize: 12 }}>
                      <div>
                        <div style={{ fontWeight: 600, color: "#f87171", marginBottom: 4, fontSize: 11 }}>問題</div>
                        <div style={{ color: "#cbd5e1", lineHeight: 1.6 }}>{s.problem}</div>
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: "#f59e0b", marginBottom: 4, fontSize: 11 }}>觸發時刻</div>
                        <div style={{ color: "#cbd5e1", lineHeight: 1.6 }}>{s.trigger}</div>
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: "#64748b", marginBottom: 4, fontSize: 11 }}>現在怎麼湊合</div>
                        <div style={{ color: "#94a3b8", lineHeight: 1.6 }}>{s.currentHack}</div>
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: s.color, marginBottom: 4, fontSize: 11 }}>我們給什麼</div>
                        <div style={{ color: "#cbd5e1", lineHeight: 1.6 }}>{s.whatWeGive}</div>
                      </div>
                    </div>

                    <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 10, fontWeight: 600, color: "#475569" }}>KEY FEATURE:</span>
                      <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: `${s.color}22`, color: s.color, fontWeight: 600 }}>{s.keyFeature}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ===== TAB 2: Personas ===== */}
        {tab === 2 && (
          <div>
            <p style={{ fontSize: 12, color: "#64748b", marginBottom: 20 }}>每個 Persona 橫跨多個情境，展示真實的一週使用場景。</p>

            {personas.map((p, pi) => (
              <div key={pi} style={{ marginBottom: 12 }}>
                <button onClick={() => setOpenPersona(openPersona === pi ? -1 : pi)} style={{
                  width: "100%", textAlign: "left", background: "#141825", border: openPersona === pi ? "1px solid #2dd4bf33" : "1px solid transparent",
                  borderRadius: openPersona === pi ? "10px 10px 0 0" : 10,
                  padding: "14px 16px", cursor: "pointer", fontFamily: "inherit", color: "#e2e8f0",
                  display: "flex", alignItems: "center", gap: 12,
                }}>
                  <span style={{ fontSize: 28 }}>{p.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{p.name}，{p.age}歲</div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>{p.title}</div>
                  </div>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    {p.segments.map(sid => (
                      <span key={sid} style={{ fontSize: 9, padding: "2px 7px", borderRadius: 10, background: `${segColors[sid]}22`, color: segColors[sid], fontWeight: 600 }}>{segLabels[sid]}</span>
                    ))}
                  </div>
                </button>

                {openPersona === pi && (
                  <div style={{ background: "#141825", borderRadius: "0 0 10px 10px", padding: "16px", borderTop: "1px solid #1a1f2e" }}>
                    {/* Story */}
                    <div style={{ fontSize: 12, color: "#cbd5e1", lineHeight: 1.8, whiteSpace: "pre-line", marginBottom: 16, padding: "12px 14px", background: "#0f1219", borderRadius: 8, borderLeft: "3px solid #2dd4bf44" }}>
                      {p.story}
                    </div>

                    {/* Weekly usage */}
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", marginBottom: 8 }}>📅 一週使用節奏</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      {p.week.map((w, wi) => (
                        <div key={wi} style={{ display: "flex", gap: 10, fontSize: 12, alignItems: "baseline" }}>
                          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#2dd4bf", minWidth: 40 }}>{w.day}</span>
                          <span style={{ color: "#94a3b8" }}>{w.action}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ===== TAB 3: Feature-Segment Alignment ===== */}
        {tab === 3 && (
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>功能 × 情境 對齊表</h2>
            <p style={{ fontSize: 12, color: "#64748b", marginBottom: 20 }}>每個功能都必須服務至少一個具體情境，否則不做。</p>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #1a1f2e" }}>
                    <th style={{ padding: "8px 6px", textAlign: "left", color: "#64748b", fontWeight: 600 }}>功能</th>
                    <th style={{ padding: "8px 4px", textAlign: "center", color: "#64748b", fontWeight: 600, fontSize: 10 }}>階段</th>
                    {Object.entries(segLabels).map(([id, label]) => (
                      <th key={id} style={{ padding: "8px 4px", textAlign: "center", color: segColors[id], fontWeight: 600, fontSize: 10 }}>{label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {featureMap.map((f, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #0f1219" }}>
                      <td style={{ padding: "6px", color: "#cbd5e1", fontSize: 12 }}>{f.feature}</td>
                      <td style={{ textAlign: "center" }}>
                        <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 8, fontWeight: 600,
                          background: f.tier === "MVP" ? "#2dd4bf22" : f.tier === "V2" ? "#818cf822" : "#f472b622",
                          color: f.tier === "MVP" ? "#2dd4bf" : f.tier === "V2" ? "#818cf8" : "#f472b6"
                        }}>{f.tier}</span>
                      </td>
                      {Object.keys(segLabels).map(sid => (
                        <td key={sid} style={{ textAlign: "center", padding: "6px 4px" }}>
                          {f.segments.includes(sid)
                            ? <span style={{ color: segColors[sid], fontWeight: 700 }}>●</span>
                            : <span style={{ color: "#1a1f2e" }}>·</span>
                          }
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Positioning */}
            <div style={{ background: "linear-gradient(135deg, #141825, #0a0d15)", border: "1px solid #2dd4bf22", borderRadius: 12, padding: 24, marginTop: 28 }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#2dd4bf", letterSpacing: 2, marginBottom: 10 }}>REFINED POSITIONING</div>
              <p style={{ fontSize: 16, fontWeight: 300, lineHeight: 1.7, margin: 0, color: "#f8fafc" }}>
                For people who <span style={{ color: "#f59e0b", fontWeight: 600 }}>meet more people than they can remember</span>,<br/>
                who <span style={{ color: "#2dd4bf", fontWeight: 600 }}>want to stay connected but don't know how</span>,<br/>
                and who <span style={{ color: "#818cf8", fontWeight: 600 }}>care enough to want every interaction to matter</span>—<br/>
                <span style={{ color: "#f472b6", fontWeight: 700 }}>[App Name]</span> is your social memory.<br/>
                <span style={{ fontSize: 13, color: "#64748b" }}>Prepare before. Connect during. Reflect after.</span>
              </p>
            </div>

            {/* GTM */}
            <div style={{ background: "#141825", borderRadius: 10, padding: 20, marginTop: 16, borderLeft: "3px solid #2dd4bf" }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>🎯 GTM 優先級</div>
              <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.8 }}>
                <strong style={{ color: "#f59e0b" }}>Week 1-4：</strong>鎖定「記憶流失 + 大量接觸」的交集——求職季學生。在 ASU 找 5-8 人做用戶訪談，驗證引導式記錄和回顧卡是否解決問題。<br/>
                <strong style={{ color: "#2dd4bf" }}>Month 2-3：</strong>擴展到「延續困難 + 真誠連結」——年輕專業人士。透過 UX/tech meetup 推廣。<br/>
                <strong style={{ color: "#818cf8" }}>Month 4+：</strong>加入社交能量管理功能，吸引「社交耗能」族群。<br/><br/>
                <span style={{ color: "#64748b" }}>每個階段都產出 case study 素材：用戶訪談 → 設計決策 → 測試結果 → 迭代。</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
