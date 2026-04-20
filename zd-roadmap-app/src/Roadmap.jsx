import { useState } from "react";

/* ───────────────────────────────────────────────────────────────
   ZIFF DAVIS TRAVEL — ROADMAP v1.6
   Three progressive-disclosure views over one data model:
     • Overview     — summary (original 2-lane phases & milestones)
     • Workstream   — detailed (7 workstream lanes, activities as bars)
     • Phase Matrix — structural (phases × workstreams, activities as cells)
   ─────────────────────────────────────────────────────────────── */

// ── Timeline bounds: Jul 2026 → Aug 2028 (26 months) ─────────────
const START_YEAR = 2026;
const START_MONTH = 7;
const TOTAL_MONTHS = 26;

const monthIndex = (ym) => {
  const [y, m] = ym.split("-").map(Number);
  return (y - START_YEAR) * 12 + (m - START_MONTH);
};

const monthName = (ym) => {
  const [y, mm] = ym.split("-").map(Number);
  const names = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${names[mm - 1]} ${y}`;
};

const MONTH_LABELS = (() => {
  const names = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const out = [];
  for (let i = 0; i < TOTAL_MONTHS; i++) {
    const y = START_YEAR + Math.floor((START_MONTH - 1 + i) / 12);
    const m = (START_MONTH - 1 + i) % 12;
    out.push({ short: names[m], year: y, isYearStart: m === 0 || i === 0 });
  }
  return out;
})();

// ── Workstreams / lanes ──────────────────────────────────────────
// Overview view uses the original 2 lanes.
// Workstream view uses the 7 detailed lanes.

const OVERVIEW_LANES = [
  { id: "vendor", label: "Vendor & Platform Readiness", color: "#6C63FF" },
  { id: "pilot",  label: "Pilot Execution",              color: "#FF6B35" },
];

const WORKSTREAM_LANES = [
  { id: "ae",   label: "Audience & Editorial",              color: "#2EC4B6", short: "A&E" },
  { id: "csa",  label: "Commercial Strategy & Analytics",   color: "#6C63FF", short: "CSA" },
  { id: "lc",   label: "Legal & Compliance",                color: "#E84393", short: "L&C" },
  { id: "tech", label: "Technology",                        color: "#3c82c8", short: "TECH" },
  { id: "pmpd", label: "Program Management & Pilot Design", color: "#F7B731", short: "PMPD" },
  { id: "exec", label: "Executive",                         color: "#9B59B6", short: "EXEC" },
];

// ── Phase windows (from source document) ─────────────────────────
const PHASE_WINDOWS = [
  { id: "phase1", label: "Pre Down-Select",                      start: "2026-07", end: "2026-08" },
  { id: "phase2", label: "Down-Select / Final Selection",        start: "2026-09", end: "2026-11" },
  { id: "phase3", label: "LOI + Contract Complete",              start: "2026-12", end: "2027-04" },
  { id: "phase4", label: "Parallel Platform Setup",              start: "2027-01", end: "2027-09" },
  { id: "phase5", label: "Pilot Execution & Learning",           start: "2027-10", end: "2028-06" },
  { id: "phase6", label: "Travel Platform Live Decision Point",  start: "2028-07", end: "2028-08" },
];

// ── Overview phases & milestones (carried over from v1.5) ────────
const OVERVIEW_PHASES = [
  // Vendor & Platform Readiness
  { laneId:"vendor", id:"rfi",              label:"Vendor RFI",             start:"2026-07", end:"2026-08", color:"#6C63FF", kind:"phase" },
  { laneId:"vendor", id:"downselect",       label:"Down-Select",            start:"2026-08", end:"2026-08", color:"#F7B731", kind:"milestone" },
  { laneId:"vendor", id:"rfp",              label:"Vendor RFP",             start:"2026-09", end:"2026-10", color:"#6C63FF", kind:"phase" },
  { laneId:"vendor", id:"selection",        label:"Final Selection",        start:"2026-11", end:"2026-11", color:"#F7B731", kind:"milestone" },
  { laneId:"vendor", id:"loi",              label:"Letter of Intent",       start:"2026-12", end:"2026-12", color:"#F7B731", kind:"milestone" },
  { laneId:"vendor", id:"contract",         label:"Contract Negotiation",   start:"2026-11", end:"2027-04", color:"#3c82c8", kind:"phase" },
  { laneId:"vendor", id:"contractComplete", label:"Contract Complete",      start:"2027-04", end:"2027-04", color:"#F7B731", kind:"milestone" },
  { laneId:"vendor", id:"setup",            label:"Platform Setup",         start:"2027-01", end:"2027-09", color:"#2EC4B6", kind:"phase" },
  // Pilot Execution
  { laneId:"pilot",  id:"p1",               label:"Pilot 1 — RetailMeNot",                          start:"2027-10", end:"2027-12", color:"#FF6B35", kind:"phase" },
  { laneId:"pilot",  id:"p2prep",           label:"P1 Retro / P2 Prep",                             start:"2028-01", end:"2028-01", color:"#8a8499", kind:"prep" },
  { laneId:"pilot",  id:"p2",               label:"Pilot 2 — Tech Flagships (ZDNet, PCMag, CNET)",  start:"2028-02", end:"2028-04", color:"#FF4081", kind:"phase" },
  { laneId:"pilot",  id:"p3prep",           label:"P2 Retro / P3 Prep",                             start:"2028-05", end:"2028-05", color:"#8a8499", kind:"prep" },
  { laneId:"pilot",  id:"p3",               label:"Pilot 3 — Mashable, Spiceworks, Lifehacker",     start:"2028-06", end:"2028-08", color:"#9B59B6", kind:"phase" },
  { laneId:"pilot",  id:"platformLive",     label:"Travel Platform Live",                           start:"2028-08", end:"2028-08", color:"#F7B731", kind:"milestone" },
];

// ── Activities (new data from 04/17/26 update) ───────────────────
// Each activity: laneId = workstream, phaseId = phase window it falls in.
// Time window is derived from the phase window (activities render as
// duration bars within their phase).
const ACTIVITIES = [
  // Phase 1: Pre Down-Select (Jul–Aug 2026)
  { laneId:"ae",   phaseId:"phase1", label:"Validate & prioritize target travel audience segments and personas" },
  { laneId:"ae",   phaseId:"phase1", label:"Define editorial value proposition and content differentiation for travel" },
  { laneId:"csa",  phaseId:"phase1", label:"Establish initial revenue hypotheses and success models" },
  { laneId:"csa",  phaseId:"phase1", label:"Define success metrics, pilot KPIs, and analytical ownership" },
  { laneId:"lc",   phaseId:"phase1", label:"Early legal, data-rights and privacy alignment for vendor screening" },

  // Phase 2: Down-Select / Final Selection (Sep–Nov 2026)
  { laneId:"ae",   phaseId:"phase2", label:"Map personas to pilot content and platform use cases" },
  { laneId:"ae",   phaseId:"phase2", label:"Confirm content sourcing model and editorial governance" },
  { laneId:"csa",  phaseId:"phase2", label:"Establish analytics baselines, benchmarks, and reporting logic" },
  { laneId:"tech", phaseId:"phase2", label:"Define preliminary platform architecture and integration sequencing" },
  { laneId:"csa",  phaseId:"phase2", label:"Assess revenue feasibility and partner alignment with shortlisted vendors" },

  // Phase 3: LOI + Contract Complete (Dec 2026 – Apr 2027)
  { laneId:"pmpd", phaseId:"phase3", label:"Design pilot structure, hypotheses and success criteria" },
  { laneId:"lc",   phaseId:"phase3", label:"Embed compliance, privacy and brand risk requirements into contracting" },
  { laneId:"csa",  phaseId:"phase3", label:"Finalize monetization tests and revenue success thresholds" },
  { laneId:"tech", phaseId:"phase3", label:"Plan identity resolution, data ingestion and reporting pipelines" },
  { laneId:"csa",  phaseId:"phase3", label:"Prepare internal sales enablement and operating readiness" },

  // Phase 4: Parallel Platform Setup (Jan – Sep 2027)
  { laneId:"tech", phaseId:"phase4", label:"Execute platform integration and data ingestion" },
  { laneId:"ae",   phaseId:"phase4", label:"Run editorial production pilots and workflow testing" },
  { laneId:"csa",  phaseId:"phase4", label:"Implement analytics instrumentation, QA and dashboards" },
  { laneId:"tech", phaseId:"phase4", label:"Complete security, privacy and performance testing", joint:["lc"] },
  { laneId:"pmpd", phaseId:"phase4", label:"Conduct soft launch and internal beta validation" },

  // Phase 5: Pilot Execution & Learning (Oct 2027 – Jun 2028)
  { laneId:"pmpd", phaseId:"phase5", label:"Launch phased pilots across prioritized ZD properties" },
  { laneId:"csa",  phaseId:"phase5", label:"Test audience engagement, monetization performance and conversion" },
  { laneId:"csa",  phaseId:"phase5", label:"Ongoing performance readouts, insight synthesis and optimization loops" },
  { laneId:"pmpd", phaseId:"phase5", label:"Coordinate cross-functional iteration across editorial, commercial and technical components" },
  { laneId:"exec", phaseId:"phase5", label:"Formal go / no-go / iterate decision checkpoints", joint:["csa"] },

  // Phase 6: Travel Platform Live Decision Point (Jul–Aug 2028)
  { laneId:"csa",  phaseId:"phase6", label:"Close out pilots and consolidate cross-phase learnings" },
  { laneId:"exec", phaseId:"phase6", label:"Assess scale readiness and expansion implications" },
  { laneId:"exec", phaseId:"phase6", label:"Confirm go-forward operating and monetization strategy", joint:["csa"] },
  { laneId:"exec", phaseId:"phase6", label:"Update roadmap for post-pilot expansion or iteration", joint:["pmpd"] },
];

// ── Shared milestones (appear across all views) ──────────────────
const SHARED_MILESTONES = [
  { id:"downselect",       label:"Down-Select",        date:"2026-08", code:"M1", lane:"vendor" },
  { id:"selection",        label:"Final Selection",    date:"2026-11", code:"M2", lane:"vendor" },
  { id:"loi",              label:"Letter of Intent",   date:"2026-12", code:"M3", lane:"vendor" },
  { id:"contractComplete", label:"Contract Complete",  date:"2027-04", code:"M4", lane:"vendor" },
  { id:"platformLive",     label:"Travel Platform Live", date:"2028-08", code:"P1", lane:"pilot" },
];

// ── Layout constants ─────────────────────────────────────────────
const LANE_LABEL_WIDTH = 210;
const MONTH_WIDTH = 44;
const CHART_WIDTH = LANE_LABEL_WIDTH + MONTH_WIDTH * TOTAL_MONTHS;
const HEADER_HEIGHT = 60;
const ROW_GAP = 16;
const PHASE_HEIGHT = 26;
const ACTIVITY_HEIGHT = 18;
const ROW_HEIGHT = 44;
const ACTIVITY_ROW_HEIGHT = 28;
const LANE_PAD = 14;

// ── Theme tokens (light mode only for this version) ──────────────
const t = {
  bg: "#ffffff",
  bgSoft: "#f6f5f2",
  text: "#2a2433",
  textMuted: "#6b6478",
  textDim: "#9b94a8",
  label: "#5a4fd9",
  border: "#dedbe8",
  borderSoft: "#ecebf1",
  gridline: "#ecebf1",
  yearTint: "rgba(108,99,255,0.04)",
  phaseTint: "rgba(108,99,255,0.05)",
  phaseBoundary: "rgba(108,99,255,0.25)",
  phaseText: "#fff",
  phaseShadow: "rgba(0,0,0,0.12)",
  accent: "#5a4fd9",
  laneBg: "rgba(108,99,255,0.02)",
};

// ═════════════════════════════════════════════════════════════════
// OVERVIEW VIEW — 2 lanes, phases + milestones (original v1.5)
// ═════════════════════════════════════════════════════════════════
function OverviewTimeline() {
  const lanePhases = OVERVIEW_LANES.map(lane => {
    const allItems = OVERVIEW_PHASES.filter(p => p.laneId === lane.id)
      .map(p => ({ ...p, startIdx: monthIndex(p.start), endIdx: monthIndex(p.end) }))
      .sort((a, b) => a.startIdx - b.startIdx || a.endIdx - b.endIdx);

    const milestones = allItems.filter(p => p.kind === "milestone");
    const phases = allItems.filter(p => p.kind !== "milestone");
    const hasMilestoneRow = milestones.length > 0;
    milestones.forEach((m, i) => { m.row = 0; m.code = `M${i + 1}`; });

    const rowLastEnd = [];
    const firstPhaseRow = hasMilestoneRow ? 1 : 0;
    phases.forEach(p => {
      let row = firstPhaseRow;
      while (rowLastEnd[row] !== undefined && rowLastEnd[row] > p.startIdx) row++;
      p.row = row;
      rowLastEnd[row] = p.endIdx;
    });

    const mergedItems = [...milestones, ...phases];
    const numRows = Math.max(1, ...mergedItems.map(p => p.row + 1));
    return { lane, phases: mergedItems, numRows };
  });

  const laneTops = [];
  let cursor = HEADER_HEIGHT;
  lanePhases.forEach(({ numRows }, i) => {
    laneTops[i] = cursor;
    const h = LANE_PAD * 2 + numRows * ROW_HEIGHT;
    cursor += h + (i < lanePhases.length - 1 ? ROW_GAP : 0);
  });
  const totalHeight = cursor + 10;

  return (
    <ChartSvg width={CHART_WIDTH} height={totalHeight}>
      <TimelineHeader />
      {lanePhases.map(({ lane, phases, numRows }, laneIdx) => {
        const laneTop = laneTops[laneIdx];
        const laneHeight = LANE_PAD * 2 + numRows * ROW_HEIGHT;
        return (
          <LaneShell key={lane.id} lane={lane} laneTop={laneTop} laneHeight={laneHeight}
            laneIdx={laneIdx} itemCount={phases.length}>
            {phases.map(p => (
              <PhaseOrMilestone key={p.id} p={p} laneTop={laneTop}
                rowHeight={ROW_HEIGHT} itemHeight={PHASE_HEIGHT} />
            ))}
          </LaneShell>
        );
      })}
    </ChartSvg>
  );
}

// ═════════════════════════════════════════════════════════════════
// WORKSTREAM VIEW — 7 lanes, activities + shared milestones
// Each lane expands/collapses independently via expanded[laneId] state
// ═════════════════════════════════════════════════════════════════
const ACTIVITY_H_COMPACT = 22;
const ACTIVITY_ROW_H_COMPACT = 28;
const ACTIVITY_H_EXPANDED = 56;
const ACTIVITY_ROW_H_EXPANDED = 62;

function WorkstreamTimeline({ expanded, onToggleLane, onExpandAll, onCollapseAll,
                              selectedActivity, onSelectActivity }) {
  // Group activities by lane, and within each lane compute phase windows for bars
  const laneData = WORKSTREAM_LANES.map(lane => {
    const acts = ACTIVITIES.filter(a => a.laneId === lane.id).map((a, idx) => {
      const phase = PHASE_WINDOWS.find(p => p.id === a.phaseId);
      return {
        ...a,
        // Stable unique id per activity (lane + phase + index within lane)
        uid: `${a.laneId}-${a.phaseId}-${idx}`,
        startIdx: monthIndex(phase.start),
        endIdx: monthIndex(phase.end),
        phaseLabel: phase.label,
      };
    });

    acts.sort((a, b) => a.startIdx - b.startIdx);
    const rowLastEnd = [];
    acts.forEach(a => {
      let row = 0;
      while (rowLastEnd[row] !== undefined && rowLastEnd[row] > a.startIdx) row++;
      a.row = row;
      rowLastEnd[row] = a.endIdx;
    });
    const numRows = Math.max(1, ...acts.map(a => a.row + 1));

    const isExpanded = !!expanded[lane.id];
    const rowHeight = isExpanded ? ACTIVITY_ROW_H_EXPANDED : ACTIVITY_ROW_H_COMPACT;
    const itemHeight = isExpanded ? ACTIVITY_H_EXPANDED : ACTIVITY_H_COMPACT;

    return { lane, acts, numRows, isExpanded, rowHeight, itemHeight };
  });

  const laneTops = [];
  let cursor = HEADER_HEIGHT;
  laneData.forEach(({ numRows, rowHeight }, i) => {
    laneTops[i] = cursor;
    const h = LANE_PAD * 2 + numRows * rowHeight;
    cursor += h + (i < laneData.length - 1 ? ROW_GAP : 0);
  });
  const totalHeight = cursor + 10;

  const anyExpanded = laneData.some(l => l.isExpanded);

  return (
    <>
      {/* Mini toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px",
        marginBottom: "10px", fontSize: "11px", flexWrap: "wrap" }}>
        <span style={{ color: t.textMuted, fontFamily: "'Courier New',monospace",
          letterSpacing: "1px", textTransform: "uppercase" }}>
          Lanes:
        </span>
        <button onClick={onExpandAll} style={toolbarBtnStyle(anyExpanded && laneData.every(l => l.isExpanded))}>
          Expand all
        </button>
        <button onClick={onCollapseAll} style={toolbarBtnStyle(!anyExpanded)}>
          Collapse all
        </button>
        <span style={{ color: t.textDim, fontSize: "11.5px", marginLeft: "10px",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" }}>
          Click a lane label to toggle it · click any activity to see full description
        </span>
      </div>

      <ChartSvg width={CHART_WIDTH} height={totalHeight}>
        {/* Phase window backgrounds (vertical tinted bands) */}
        {PHASE_WINDOWS.map((pw, i) => {
          const xStart = LANE_LABEL_WIDTH + monthIndex(pw.start) * MONTH_WIDTH;
          const xEnd = LANE_LABEL_WIDTH + (monthIndex(pw.end) + 1) * MONTH_WIDTH;
          const tint = i % 2 === 0 ? "rgba(108,99,255,0.025)" : "rgba(108,99,255,0.06)";
          return (
            <g key={pw.id}>
              <rect x={xStart} y={HEADER_HEIGHT} width={xEnd - xStart} height={totalHeight - HEADER_HEIGHT}
                fill={tint} />
              {i > 0 && (
                <line x1={xStart} x2={xStart} y1={HEADER_HEIGHT} y2={totalHeight}
                  stroke={t.phaseBoundary} strokeWidth="1" strokeDasharray="3 3" />
              )}
            </g>
          );
        })}

        <TimelineHeader />

        {/* Phase window labels in a band above the header */}
        {PHASE_WINDOWS.map((pw, i) => {
          const xStart = LANE_LABEL_WIDTH + monthIndex(pw.start) * MONTH_WIDTH;
          const xEnd = LANE_LABEL_WIDTH + (monthIndex(pw.end) + 1) * MONTH_WIDTH;
          const cx = (xStart + xEnd) / 2;
          return (
            <text key={pw.id} x={cx} y={14} fontSize="9"
              fontFamily="'Courier New',monospace" fill={t.label}
              textAnchor="middle" letterSpacing="0.8" fontWeight="600">
              PHASE {i + 1}
            </text>
          );
        })}

        {/* Lanes */}
        {laneData.map(({ lane, acts, numRows, isExpanded, rowHeight, itemHeight }, laneIdx) => {
          const laneTop = laneTops[laneIdx];
          const laneHeight = LANE_PAD * 2 + numRows * rowHeight;
          return (
            <LaneShell key={lane.id} lane={lane} laneTop={laneTop} laneHeight={laneHeight}
              laneIdx={laneIdx} isExpanded={isExpanded}
              onToggle={() => onToggleLane(lane.id)}
              hideCount>
              {acts.map((a) => (
                <ActivityBar key={a.uid} activity={a}
                  laneTop={laneTop} laneColor={lane.color}
                  rowHeight={rowHeight} itemHeight={itemHeight}
                  isExpanded={isExpanded}
                  isSelected={selectedActivity?.uid === a.uid}
                  onSelect={() => onSelectActivity(a)} />
              ))}
            </LaneShell>
          );
        })}

        {/* Shared milestones — render as vertical dashed lines across all lanes */}
        {SHARED_MILESTONES.map(m => {
          const idx = monthIndex(m.date);
          const x = LANE_LABEL_WIDTH + idx * MONTH_WIDTH + MONTH_WIDTH / 2;
          return (
            <g key={m.id}>
              <line x1={x} x2={x} y1={HEADER_HEIGHT} y2={totalHeight}
                stroke="#F7B731" strokeWidth="1" strokeDasharray="4 3" opacity="0.8" />
              <polygon
                points={`${x},${HEADER_HEIGHT - 12} ${x + 9},${HEADER_HEIGHT - 3} ${x},${HEADER_HEIGHT + 6} ${x - 9},${HEADER_HEIGHT - 3}`}
                fill="#F7B731" stroke="#fff" strokeWidth="1" />
              <text x={x} y={HEADER_HEIGHT - 1} fontSize="9"
                fontFamily="'Courier New',monospace" fill="#fff"
                textAnchor="middle" fontWeight="700">{m.code}</text>
            </g>
          );
        })}
      </ChartSvg>
    </>
  );
}

function toolbarBtnStyle(active) {
  return {
    background: active ? t.accent : t.bg,
    border: `1px solid ${active ? t.accent : t.border}`,
    color: active ? "#fff" : t.text,
    borderRadius: "4px", padding: "5px 12px",
    fontSize: "12px", cursor: "pointer",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    letterSpacing: "0.2px",
    fontWeight: 500,
  };
}

// ═════════════════════════════════════════════════════════════════
// PHASE MATRIX VIEW — Phases × workstreams, activities as cells
// ═════════════════════════════════════════════════════════════════
function PhaseMatrix() {
  const COL_MIN = 210;
  const ROW_MIN = 72;
  const HEADER_H = 90;
  const LEFT_W = 190;
  const CARD_PAD = 16; // padding + borders per card
  const CARD_GAP = 8;
  const CARD_LINE_H = 15; // approx line height at fontSize 11 / lineHeight 1.3
  const CARD_JOINT_EXTRA = 14; // height of "w/ LANES" tag line

  // Use a wider content area so text wraps less aggressively
  const CONTENT_MAX = 1600;
  const colWidth = Math.max(COL_MIN,
    Math.floor((CONTENT_MAX - LEFT_W) / PHASE_WINDOWS.length));
  const matrixWidth = LEFT_W + colWidth * PHASE_WINDOWS.length;

  // For each (lane, phase) cell, collect activities
  const cells = {};
  WORKSTREAM_LANES.forEach(lane => {
    cells[lane.id] = {};
    PHASE_WINDOWS.forEach(pw => {
      cells[lane.id][pw.id] = ACTIVITIES.filter(a => a.laneId === lane.id && a.phaseId === pw.id);
    });
  });

  // Estimate text lines per card based on label char count and inner card width
  const innerCardWidth = colWidth - 16 /*cell outer pad*/ - 14 /*card inner pad*/ - 3 /*border-left*/;
  const charsPerLine = Math.max(20, Math.floor(innerCardWidth / 5.5));

  const cardHeight = (act) => {
    const lines = Math.max(1, Math.ceil(act.label.length / charsPerLine));
    return CARD_PAD + lines * CARD_LINE_H + (act.joint ? CARD_JOINT_EXTRA : 0);
  };

  // Row height = max total card stack height across phases in that row
  const rowHeights = WORKSTREAM_LANES.map(lane => {
    const colHeights = PHASE_WINDOWS.map(pw => {
      const acts = cells[lane.id][pw.id];
      if (acts.length === 0) return 0;
      return acts.reduce((sum, a) => sum + cardHeight(a), 0) + (acts.length - 1) * CARD_GAP;
    });
    const maxH = Math.max(0, ...colHeights);
    return Math.max(ROW_MIN, maxH + 16); // +16 for cell vertical padding
  });
  const totalHeight = HEADER_H + rowHeights.reduce((a, b) => a + b, 0) + 10;

  const rowTops = [];
  let cursor = HEADER_H;
  rowHeights.forEach((h, i) => { rowTops[i] = cursor; cursor += h; });

  return (
    <div style={{ overflowX: "auto", background: t.bg, borderRadius: "12px", border: `1px solid ${t.border}` }}>
      <svg width={matrixWidth} height={totalHeight}
        viewBox={`0 0 ${matrixWidth} ${totalHeight}`}
        style={{ display: "block", fontFamily: "'Georgia','Times New Roman',serif" }}>

        {/* Column headers */}
        <rect x={0} y={0} width={matrixWidth} height={HEADER_H} fill={t.bgSoft} />
        <line x1={0} x2={matrixWidth} y1={HEADER_H} y2={HEADER_H} stroke={t.border} />

        {PHASE_WINDOWS.map((pw, i) => {
          const x = LEFT_W + i * colWidth;
          return (
            <g key={pw.id}>
              <text x={x + 12} y={22} fontSize="9" fontFamily="'Courier New',monospace"
                fill={t.label} fontWeight="600" letterSpacing="1.5">
                PHASE {i + 1}
              </text>
              <foreignObject x={x + 12} y={30} width={colWidth - 24} height={36}>
                <div style={{ fontFamily: "'Georgia',serif", fontSize: "12px",
                  color: t.text, fontWeight: "500", lineHeight: 1.25 }}>
                  {pw.label}
                </div>
              </foreignObject>
              <text x={x + 12} y={78} fontSize="9" fontFamily="'Courier New',monospace"
                fill={t.textMuted} letterSpacing="0.3">
                {monthName(pw.start)} – {monthName(pw.end)}
              </text>
              {i > 0 && (
                <line x1={x} x2={x} y1={0} y2={totalHeight} stroke={t.border} />
              )}
            </g>
          );
        })}

        {/* Lane label column */}
        <rect x={0} y={HEADER_H} width={LEFT_W} height={totalHeight - HEADER_H} fill={t.bgSoft} />
        <line x1={LEFT_W} x2={LEFT_W} y1={0} y2={totalHeight} stroke={t.border} />

        {/* Rows */}
        {WORKSTREAM_LANES.map((lane, laneIdx) => {
          const rowTop = rowTops[laneIdx];
          const rowH = rowHeights[laneIdx];
          return (
            <g key={lane.id}>
              <line x1={0} x2={matrixWidth} y1={rowTop + rowH} y2={rowTop + rowH} stroke={t.borderSoft} />
              <rect x={0} y={rowTop} width={4} height={rowH} fill={lane.color} />
              <text x={18} y={rowTop + 22} fontSize="9" fontFamily="'Courier New',monospace"
                fill={t.label} fontWeight="600" letterSpacing="1">{lane.short}</text>
              <foreignObject x={18} y={rowTop + 28} width={LEFT_W - 24} height={rowH - 32}>
                <div style={{ fontFamily: "'Georgia',serif", fontSize: "12.5px",
                  color: t.text, fontWeight: "500", lineHeight: 1.3 }}>
                  {lane.label}
                </div>
              </foreignObject>

              {/* Cells */}
              {PHASE_WINDOWS.map((pw, phIdx) => {
                const x = LEFT_W + phIdx * colWidth;
                const acts = cells[lane.id][pw.id];
                return (
                  <g key={pw.id}>
                    {acts.length === 0 ? (
                      <text x={x + colWidth / 2} y={rowTop + rowH / 2 + 4}
                        fontSize="16" fill={t.textDim} textAnchor="middle">·</text>
                    ) : (
                      <foreignObject x={x + 8} y={rowTop + 8} width={colWidth - 16} height={rowH - 16}>
                        <div style={{ display: "flex", flexDirection: "column", gap: `${CARD_GAP}px` }}>
                          {acts.map((a, i) => (
                            <div key={i} style={{
                              background: `${lane.color}18`,
                              border: `1px solid ${lane.color}50`,
                              borderLeft: `3px solid ${lane.color}`,
                              borderRadius: "4px",
                              padding: "6px 8px",
                              fontFamily: "'Georgia',serif",
                              fontSize: "11px",
                              color: t.text,
                              lineHeight: 1.3,
                              wordBreak: "break-word",
                            }}>
                              {a.label}
                              {a.joint && a.joint.length > 0 && (
                                <div style={{ marginTop: "4px", fontSize: "9px",
                                  color: t.textMuted, fontFamily: "'Courier New',monospace",
                                  letterSpacing: "0.4px" }}>
                                  w/ {a.joint.map(j => WORKSTREAM_LANES.find(l => l.id === j)?.short).join(", ")}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </foreignObject>
                    )}
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════
// SHARED PRIMITIVES
// ═════════════════════════════════════════════════════════════════

function ChartSvg({ width, height, children }) {
  return (
    <div style={{ overflowX: "auto", background: t.bg, borderRadius: "12px", border: `1px solid ${t.border}` }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}
        style={{ display: "block", fontFamily: "'Georgia','Times New Roman',serif" }}>
        {/* Year tint (alternate years, subtle) */}
        {MONTH_LABELS.map((m, i) => {
          if (!m.isYearStart) return null;
          const nextYear = MONTH_LABELS.findIndex((mm, j) => j > i && mm.isYearStart);
          const endI = nextYear === -1 ? TOTAL_MONTHS : nextYear;
          const w = (endI - i) * MONTH_WIDTH;
          return (
            <rect key={`yr-${i}`} x={LANE_LABEL_WIDTH + i * MONTH_WIDTH} y={0}
              width={w} height={height} fill={i % 2 === 0 ? "transparent" : t.yearTint} />
          );
        })}
        {/* Gridlines */}
        {MONTH_LABELS.map((m, i) => {
          const x = LANE_LABEL_WIDTH + i * MONTH_WIDTH;
          return <line key={`gl-${i}`} x1={x} x2={x} y1={0} y2={height}
            stroke={m.isYearStart ? t.border : t.gridline}
            strokeWidth={m.isYearStart ? 1 : 0.5} />;
        })}
        <line x1={LANE_LABEL_WIDTH + TOTAL_MONTHS * MONTH_WIDTH}
          x2={LANE_LABEL_WIDTH + TOTAL_MONTHS * MONTH_WIDTH}
          y1={0} y2={height} stroke={t.border} />
        {children}
      </svg>
    </div>
  );
}

function TimelineHeader() {
  return (
    <g>
      <rect x={0} y={0} width={CHART_WIDTH} height={HEADER_HEIGHT} fill={t.bgSoft} />
      <line x1={0} x2={CHART_WIDTH} y1={HEADER_HEIGHT} y2={HEADER_HEIGHT} stroke={t.border} />
      {MONTH_LABELS.map((m, i) => {
        if (!m.isYearStart) return null;
        return (
          <text key={`yl-${i}`} x={LANE_LABEL_WIDTH + i * MONTH_WIDTH + 6} y={28}
            fontSize="11" fontFamily="'Courier New',monospace"
            fill={t.label} fontWeight="600" letterSpacing="1.5">
            {m.year}
          </text>
        );
      })}
      {MONTH_LABELS.map((m, i) => (
        <text key={`ml-${i}`} x={LANE_LABEL_WIDTH + i * MONTH_WIDTH + MONTH_WIDTH / 2}
          y={48} fontSize="10" fontFamily="'Courier New',monospace"
          fill={t.textMuted} textAnchor="middle">
          {m.short}
        </text>
      ))}
    </g>
  );
}

function LaneShell({ lane, laneTop, laneHeight, laneIdx, itemCount, itemLabel = "items",
                    isExpanded, onToggle, hideCount, children }) {
  const laneBottom = laneTop + laneHeight;
  const clickable = !!onToggle;
  return (
    <g style={clickable ? { cursor: "pointer" } : undefined}
       onClick={clickable ? onToggle : undefined}>
      <rect x={0} y={laneTop} width={CHART_WIDTH} height={laneHeight} fill={t.laneBg} />
      <line x1={0} x2={CHART_WIDTH} y1={laneBottom} y2={laneBottom} stroke={t.borderSoft} />
      <rect x={0} y={laneTop} width={LANE_LABEL_WIDTH} height={laneHeight} fill={t.bgSoft} />
      <rect x={0} y={laneTop} width={4} height={laneHeight} fill={lane.color} />
      <line x1={LANE_LABEL_WIDTH} x2={LANE_LABEL_WIDTH} y1={laneTop} y2={laneBottom} stroke={t.border} />

      {/* Lane header row: code on left, expand chevron on right */}
      <text x={18} y={laneTop + 22} fontSize="9" fontFamily="'Courier New',monospace"
        fill={t.label} fontWeight="600" letterSpacing="1.5">
        {lane.short || `LANE ${String(laneIdx + 1).padStart(2, "0")}`}
      </text>

      {clickable && (
        <g>
          <rect x={LANE_LABEL_WIDTH - 30} y={laneTop + 10} width={20} height={18}
            rx={3} ry={3} fill={isExpanded ? `${lane.color}22` : "transparent"}
            stroke={`${lane.color}55`} strokeWidth="1" />
          <text x={LANE_LABEL_WIDTH - 20} y={laneTop + 23} fontSize="11"
            fontFamily="'Courier New',monospace" fill={lane.color}
            textAnchor="middle" fontWeight="700">
            {isExpanded ? "−" : "+"}
          </text>
        </g>
      )}

      <foreignObject x={18} y={laneTop + 28} width={LANE_LABEL_WIDTH - 28}
        height={laneHeight - 32 - (hideCount ? 0 : 20)}>
        <div style={{ fontFamily: "'Georgia',serif", fontSize: "12.5px",
          color: t.text, fontWeight: "500", lineHeight: 1.25 }}>
          {lane.label}
        </div>
      </foreignObject>

      {!hideCount && (
        <text x={18} y={laneTop + laneHeight - 10} fontSize="9"
          fontFamily="'Courier New',monospace" fill={t.textMuted} letterSpacing="0.3">
          {itemCount} {itemLabel}
        </text>
      )}
      {children}
    </g>
  );
}

function PhaseOrMilestone({ p, laneTop, rowHeight, itemHeight }) {
  const x = LANE_LABEL_WIDTH + p.startIdx * MONTH_WIDTH + 2;
  const w = (p.endIdx - p.startIdx + 1) * MONTH_WIDTH - 4;
  const y = laneTop + LANE_PAD + p.row * rowHeight + (rowHeight - itemHeight) / 2;

  if (p.kind === "milestone") {
    const cx = x + w / 2;
    const cy = y + itemHeight / 2;
    const size = 13;
    return (
      <g>
        <polygon
          points={`${cx},${cy - size} ${cx + size},${cy} ${cx},${cy + size} ${cx - size},${cy}`}
          fill={p.color} stroke="rgba(0,0,0,0.15)" strokeWidth="1" />
        <text x={cx} y={cy + 3.5} fontSize="10" fontFamily="'Courier New',monospace"
          fill="#fff" textAnchor="middle" fontWeight="700" letterSpacing="0.3">
          {p.code}
        </text>
      </g>
    );
  }

  const opacity = p.kind === "prep" ? 0.55 : 0.92;
  const labelFits = w > 80;
  return (
    <g>
      <rect x={x} y={y} width={w} height={itemHeight} rx={4} ry={4}
        fill={p.color} opacity={opacity}
        stroke="rgba(0,0,0,0.08)" strokeWidth="0.5" />
      {labelFits ? (
        <text x={x + 10} y={y + itemHeight / 2 + 4} fontSize="11"
          fill="#fff" fontWeight="500">{p.label}</text>
      ) : (
        <text x={x + w + 6} y={y + itemHeight / 2 + 4} fontSize="10.5"
          fill={p.color} fontWeight="500">{p.label}</text>
      )}
    </g>
  );
}

function ActivityBar({ activity, laneTop, laneColor, rowHeight, itemHeight,
                       isExpanded, isSelected, onSelect }) {
  const x = LANE_LABEL_WIDTH + activity.startIdx * MONTH_WIDTH + 3;
  const w = (activity.endIdx - activity.startIdx + 1) * MONTH_WIDTH - 6;
  const y = laneTop + LANE_PAD + activity.row * rowHeight + (rowHeight - itemHeight) / 2;

  const joint = activity.joint && activity.joint.length > 0;
  const jointCodes = joint
    ? activity.joint.map(j => WORKSTREAM_LANES.find(l => l.id === j)?.short).join(", ")
    : null;

  // Click handler stops propagation so clicking an activity doesn't also toggle the lane
  const handleClick = (e) => {
    e.stopPropagation();
    onSelect && onSelect();
  };

  const strokeW = isSelected ? 2 : 0.8;
  const fillA = isSelected ? "55" : "33";
  const strokeOpA = isSelected ? 1 : 0.6;

  if (isExpanded) {
    return (
      <g style={{ cursor: "pointer" }} onClick={handleClick}>
        <title>{activity.label}{joint ? ` (w/ ${jointCodes})` : ""}</title>
        <rect x={x} y={y} width={w} height={itemHeight} rx={4} ry={4}
          fill={`${laneColor}${isSelected ? "40" : "26"}`}
          stroke={laneColor} strokeWidth={strokeW}
          strokeOpacity={isSelected ? 1 : 0.7} />
        <foreignObject x={x + 8} y={y + 4} width={w - 16} height={itemHeight - 8}>
          <div style={{
            fontFamily: "'Georgia',serif",
            fontSize: "10.5px",
            color: t.text,
            lineHeight: 1.3,
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
          }}>
            {activity.label}
            {joint && (
              <span style={{
                display: "inline-block",
                marginLeft: "6px",
                fontSize: "9px",
                fontFamily: "'Courier New',monospace",
                color: laneColor,
                fontWeight: 600,
                letterSpacing: "0.3px",
              }}>
                · w/ {jointCodes}
              </span>
            )}
          </div>
        </foreignObject>
      </g>
    );
  }

  // Compact mode
  const maxChars = Math.floor((w - 16) / 5.6);
  const truncated = activity.label.length > maxChars && maxChars > 8
    ? activity.label.slice(0, maxChars - 1) + "…"
    : activity.label;

  return (
    <g style={{ cursor: "pointer" }} onClick={handleClick}>
      <title>{activity.label}{joint ? ` (w/ ${jointCodes})` : ""}</title>
      <rect x={x} y={y} width={w} height={itemHeight} rx={3} ry={3}
        fill={`${laneColor}${fillA}`}
        stroke={laneColor} strokeWidth={strokeW}
        strokeOpacity={strokeOpA} />
      {w > 60 && (
        <text x={x + 8} y={y + itemHeight / 2 + 3.5}
          fontSize="10.5" fill={t.text} fontWeight="400">
          {truncated}
        </text>
      )}
      {joint && w > 100 && (
        <circle cx={x + w - 8} cy={y + itemHeight / 2} r="3"
          fill={laneColor} opacity="0.8" />
      )}
    </g>
  );
}

// ═════════════════════════════════════════════════════════════════
// ROOT
// ═════════════════════════════════════════════════════════════════
export default function RoadmapV16() {
  const [view, setView] = useState("overview");
  const [expandedLanes, setExpandedLanes] = useState({});
  const [selectedActivity, setSelectedActivity] = useState(null);

  const toggleLane = (id) => setExpandedLanes(prev => ({ ...prev, [id]: !prev[id] }));
  const expandAll = () => setExpandedLanes(
    Object.fromEntries(WORKSTREAM_LANES.map(l => [l.id, true]))
  );
  const collapseAll = () => setExpandedLanes({});

  // Clear any selected activity when switching views
  const changeView = (v) => { setView(v); setSelectedActivity(null); };

  const views = {
    overview:   { label: "Overview",     sub: "Phases & milestones — 2 lanes" },
    workstream: { label: "Workstream",   sub: "7 workstreams, 29 activities" },
    matrix:     { label: "Phase Matrix", sub: "Workstreams × phases grid" },
    notes:      { label: "Notes",        sub: "Draft notes & open questions" },
  };

  return (
    <div style={{
      fontFamily: "'Georgia','Times New Roman',serif",
      background: t.bg, minHeight: "100vh", color: t.text,
    }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg,#ffffff 0%,#f6f5f2 50%,#ffffff 100%)",
        borderBottom: `1px solid ${t.border}`,
        padding: "36px 40px 24px", position: "relative", overflow: "hidden"
      }}>
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
            <div style={{ fontSize: "10px", letterSpacing: "4px", textTransform: "uppercase",
              color: t.accent, fontFamily: "'Courier New',monospace" }}>
              Project Pathways — Ziff Davis Travel
            </div>
            <div style={{ background: "rgba(108,99,255,0.12)",
              color: t.label, border: `1px solid ${t.label}40`,
              padding: "2px 10px", borderRadius: "3px", fontSize: "10px",
              fontFamily: "'Courier New',monospace", letterSpacing: "2px" }}>
              v1.6.3 DRAFT
            </div>
          </div>
          <h1 style={{ fontSize: "clamp(22px,3.5vw,36px)", fontWeight: "300",
            letterSpacing: "-0.5px", margin: "0 0 10px", lineHeight: 1.1 }}>
            Roadmap — Integrated Workstreams
          </h1>
          <p style={{ color: t.textMuted, fontSize: "13px", margin: 0,
            maxWidth: "700px", lineHeight: 1.6 }}>
            26-month plan with 7 workstreams and 29 activities mapped to 6 phase windows.
          </p>
        </div>
      </div>

      {/* View selector */}
      <div style={{ padding: "18px 40px 16px", borderBottom: `1px solid ${t.borderSoft}`,
        background: t.bgSoft }}>
        <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontSize: "11px", letterSpacing: "1.5px",
            textTransform: "uppercase", color: t.label,
            fontFamily: "'Courier New',monospace", marginRight: "6px" }}>
            View:
          </span>
          {Object.entries(views).map(([k, v]) => (
            <button key={k} onClick={() => changeView(k)} style={{
              background: view === k ? t.accent : t.bg,
              border: `1px solid ${view === k ? t.accent : t.border}`,
              color: view === k ? "#fff" : t.text,
              borderRadius: "6px", padding: "8px 14px",
              cursor: "pointer", transition: "all 0.15s",
              fontFamily: "'Georgia',serif" }}>
              <div style={{ fontSize: "13px", fontWeight: "500" }}>{v.label}</div>
              <div style={{ fontSize: "10px",
                color: view === k ? "rgba(255,255,255,0.8)" : t.textMuted,
                fontFamily: "'Courier New',monospace", marginTop: "2px" }}>
                {v.sub}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chart area */}
      <div style={{ padding: "24px 40px 20px" }}>
        {/* Activity detail panel — shown above the chart so it's visible on click */}
        {view === "workstream" && selectedActivity && (
          <ActivityDetail activity={selectedActivity}
            onClose={() => setSelectedActivity(null)} />
        )}

        {view === "overview"   && <OverviewTimeline />}
        {view === "workstream" && (
          <WorkstreamTimeline
            expanded={expandedLanes}
            onToggleLane={toggleLane}
            onExpandAll={expandAll}
            onCollapseAll={collapseAll}
            selectedActivity={selectedActivity}
            onSelectActivity={setSelectedActivity}
          />
        )}
        {view === "matrix"     && <PhaseMatrix />}
        {view === "notes"      && <NotesPanel />}
      </div>

      {/* Per-view legend/supplement */}
      {view === "overview" && <OverviewLegend />}
      {view === "workstream" && <WorkstreamLegend />}
    </div>
  );
}

// ─── Activity detail panel: full description for the selected activity ───
function ActivityDetail({ activity, onClose }) {
  const lane = WORKSTREAM_LANES.find(l => l.id === activity.laneId);
  const phase = PHASE_WINDOWS.find(p => p.id === activity.phaseId);
  const joint = activity.joint && activity.joint.length > 0
    ? activity.joint.map(j => WORKSTREAM_LANES.find(l => l.id === j)).filter(Boolean)
    : [];

  return (
    <div style={{ marginBottom: "16px" }}>
      <div style={{
        background: t.bg,
        border: `1px solid ${lane.color}`,
        borderLeft: `4px solid ${lane.color}`,
        borderRadius: "8px",
        padding: "16px 20px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        display: "grid",
        gridTemplateColumns: "1fr auto",
        gap: "20px",
        alignItems: "start",
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px",
            fontSize: "10px", fontFamily: "'Courier New',monospace", letterSpacing: "1.5px",
            textTransform: "uppercase", color: t.textMuted, flexWrap: "wrap" }}>
            <span style={{ color: lane.color, fontWeight: 600 }}>{lane.short}</span>
            <span>·</span>
            <span>{phase.label}</span>
            <span>·</span>
            <span>{monthName(phase.start)} – {monthName(phase.end)}</span>
          </div>
          <div style={{ fontSize: "15px", color: t.text, lineHeight: 1.5, fontWeight: 500 }}>
            {activity.label}
          </div>
          {joint.length > 0 && (
            <div style={{ marginTop: "10px", display: "flex", alignItems: "center",
              gap: "8px", fontSize: "12px", color: t.textMuted, flexWrap: "wrap" }}>
              <span style={{ fontFamily: "'Courier New',monospace", letterSpacing: "1px",
                textTransform: "uppercase", fontSize: "10px", color: t.label, fontWeight: 600 }}>
                Joint with:
              </span>
              {joint.map(j => (
                <span key={j.id} style={{
                  background: `${j.color}20`,
                  border: `1px solid ${j.color}60`,
                  color: j.color,
                  padding: "2px 8px",
                  borderRadius: "3px",
                  fontSize: "11px",
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                  fontWeight: 500,
                }}>
                  {j.label}
                </span>
              ))}
            </div>
          )}
        </div>
        <button onClick={onClose} style={{
          background: "transparent",
          border: `1px solid ${t.border}`,
          color: t.textMuted,
          borderRadius: "4px",
          padding: "4px 10px",
          cursor: "pointer",
          fontSize: "16px",
          lineHeight: 1,
          fontFamily: "-apple-system, sans-serif",
        }} title="Close">×</button>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════
// Supplementary blocks (per view)
// ═════════════════════════════════════════════════════════════════

function OverviewLegend() {
  const vendorMilestones = SHARED_MILESTONES.filter(m => m.lane === "vendor");
  const pilotMilestones  = SHARED_MILESTONES.filter(m => m.lane === "pilot");

  const renderGroup = (label, items) => (
    <div>
      <div style={{ fontSize: "10px", letterSpacing: "1.5px", textTransform: "uppercase",
        color: t.textMuted, fontFamily: "'Courier New',monospace", marginBottom: "10px" }}>
        {label}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {items.map(m => (
          <div key={m.id} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <MilestoneBadge code={m.code} color="#F7B731" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: t.text, fontWeight: "500", fontSize: "12px" }}>{m.label}</div>
              <div style={{ color: t.textMuted, fontSize: "10.5px",
                fontFamily: "'Courier New',monospace", letterSpacing: "0.5px", marginTop: "2px" }}>
                {monthName(m.date)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ padding: "0 40px 40px" }}>
      <div style={{ background: t.bgSoft, border: `1px solid ${t.border}`,
        borderRadius: "10px", padding: "18px 22px" }}>
        <div style={{ fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase",
          color: t.label, fontWeight: "500", marginBottom: "14px",
          fontFamily: "'Courier New',monospace" }}>
          Milestones
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(340px,1fr))", gap: "20px" }}>
          {renderGroup("Vendor & Platform Readiness", vendorMilestones)}
          {renderGroup("Pilot Execution", pilotMilestones)}
        </div>
      </div>
    </div>
  );
}

function MilestoneBadge({ code, color }) {
  const size = 28;
  const r = 13;
  const cx = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
      <polygon
        points={`${cx},${cx - r} ${cx + r},${cx} ${cx},${cx + r} ${cx - r},${cx}`}
        fill={color} stroke="rgba(0,0,0,0.15)" strokeWidth="1" />
      <text x={cx} y={cx + 3.5} fontSize="10"
        fontFamily="'Courier New',monospace"
        fill="#ffffff" textAnchor="middle"
        fontWeight="700" letterSpacing="0.3">
        {code}
      </text>
    </svg>
  );
}

function WorkstreamLegend() {
  return (
    <div style={{ padding: "0 40px 40px" }}>
      <div style={{ background: t.bgSoft, border: `1px solid ${t.border}`,
        borderRadius: "10px", padding: "18px 22px" }}>
        <div style={{ fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase",
          color: t.label, fontWeight: "500", marginBottom: "12px",
          fontFamily: "'Courier New',monospace" }}>
          Workstreams
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "12px" }}>
          {WORKSTREAM_LANES.map(lane => (
            <div key={lane.id} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "18px", height: "18px", borderRadius: "3px",
                background: `${lane.color}30`, border: `2px solid ${lane.color}`,
                flexShrink: 0 }} />
              <div style={{ flex: 1, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ color: t.text, fontWeight: "500" }}>{lane.label}</span>
                <span style={{ fontSize: "10.5px", color: t.textMuted,
                  fontFamily: "'Courier New',monospace" }}>
                  {lane.short}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function NotesPanel() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(400px,1fr))", gap: "20px" }}>
      <div style={{ background: "rgba(247,183,49,0.07)",
        border: "1px solid rgba(247,183,49,0.4)",
        borderRadius: "10px", padding: "18px 22px" }}>
        <div style={{ fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase",
          color: "#c89926", fontWeight: "500", marginBottom: "12px",
          fontFamily: "'Courier New',monospace" }}>
          Draft notes
        </div>
        <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "13px",
          color: t.textMuted, lineHeight: 1.7 }}>
          <li><strong style={{ color: t.text }}>Three views, one dataset:</strong> Overview is the summary for sponsor decks; Workstream is the detailed working view; Phase Matrix is the ownership grid.</li>
          <li><strong style={{ color: t.text }}>Activities as duration bars:</strong> rendered inside their phase window and visually lighter than top-level phases, so eye hierarchy flows phase → milestone → activity.</li>
          <li><strong style={{ color: t.text }}>Shared milestones (M1–M4, P1):</strong> on the Workstream view they render as gold vertical dashed lines across all lanes so dependencies on decision points are visible.</li>
          <li><strong style={{ color: t.text }}>Expandable lanes:</strong> click any workstream label (or the +/− button) in the Workstream view to expand and read full activity descriptions. Use the Expand all / Collapse all buttons above the chart for bulk control.</li>
          <li><strong style={{ color: t.text }}>Timeline may compress:</strong> per Tim's note, dates may shorten; unlikely to lengthen. Data model supports easy date edits — all phase windows live in PHASE_WINDOWS at the top of the file.</li>
        </ul>
      </div>

      <div style={{ background: "rgba(108,99,255,0.05)",
        border: "1px solid rgba(108,99,255,0.25)",
        borderRadius: "10px", padding: "18px 22px" }}>
        <div style={{ fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase",
          color: t.label, fontWeight: "500", marginBottom: "12px",
          fontFamily: "'Courier New',monospace" }}>
          Open questions
        </div>
        <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "13px",
          color: t.textMuted, lineHeight: 1.7 }}>
          <li><strong style={{ color: t.text }}>Phase 5 / Pilot 3 overlap:</strong> source document has Pilot Execution &amp; Learning running Oct 2027–Jun 2028, but the detailed milestone plan has Pilots 2 &amp; 3 continuing to Aug 2028. Does Phase 5 extend to Aug 2028, or do the later pilots compress earlier? Worth reconciling.</li>
          <li><strong style={{ color: t.text }}>Joint ownership:</strong> three activities flagged as joint (Security/privacy testing = TECH+L&amp;C; Go/no-go checkpoints = EXEC+CSA; post-pilot roadmap update = EXEC+PMPD). Confirm these match intended ownership.</li>
          <li><strong style={{ color: t.text }}>Scope:</strong> US-only through all three pilots per source. UK expansion not yet on the roadmap.</li>
          <li><strong style={{ color: t.text }}>Timeline compression:</strong> if dates shorten, adjust PHASE_WINDOWS — activities rebase automatically; milestones need individual date updates.</li>
        </ul>
      </div>
    </div>
  );
}
