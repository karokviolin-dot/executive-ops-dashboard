"use client";

import React, { useState, useMemo } from "react";
import {
  LayoutDashboard,
  KanbanSquare,
  CalendarDays,
  Inbox as InboxIcon,
  Phone,
  Sparkles,
  Clock,
  Flag,
  Star,
  CheckCircle2,
  Circle,
  Mail,
  RefreshCw,
  BellRing,
  Zap,
  Settings2,
  X,
  StickyNote,
  type LucideIcon,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type TaskStatus = "backlog" | "todo" | "in-progress" | "waiting" | "done";
type Priority = "high" | "medium" | "low";
type EmailStatus = "needs-reply" | "flagged" | "handled";
type CallType = "Investor" | "Internal" | "Client" | "Vendor";
type AgendaKind = "meeting" | "focus";
type Tone = "rose" | "amber" | "slate";
type TabKey = "overview" | "agenda" | "tasks" | "inbox" | "calls";

interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  priority: Priority;
  owner: string;
  due: number;
  category: string;
}

interface EmailItem {
  id: string;
  sender: string;
  subject: string;
  snippet: string;
  vip: boolean;
  status: EmailStatus;
}

interface CallItem {
  id: string;
  contact: string;
  day: string;
  time: string;
  type: CallType;
  done: boolean;
}

interface AgendaItem {
  id: string;
  day: string;
  time: string;
  title: string;
  kind: AgendaKind;
}

interface Rules {
  vipFlag: boolean;
  dailyFocus: boolean;
  callReminders: boolean;
  staleFollowup: boolean;
}

interface Suggestion {
  id: string;
  icon: LucideIcon;
  tone: Tone;
  text: string;
  action: string;
  onAction?: () => void;
}

// ---------------------------------------------------------------------------
// Mock data — resets on reload (no persistence, per sandbox constraints)
// ---------------------------------------------------------------------------

const initialTasks: Task[] = [
  { id: "t1", title: "Prepare Board Meeting Agenda", status: "in-progress", priority: "high", owner: "AR", due: 1, category: "Executive Support" },
  { id: "t2", title: "Organize Executive Travel — NYC Trip", status: "todo", priority: "high", owner: "AR", due: 3, category: "Travel" },
  { id: "t3", title: "Review Vendor Contract — Cloud Services", status: "waiting", priority: "medium", owner: "AR", due: 2, category: "Operations" },
  { id: "t4", title: "Draft Q3 All-Hands Presentation", status: "in-progress", priority: "high", owner: "AR", due: 4, category: "Communications" },
  { id: "t5", title: "Reconcile Q2 Expense Reports", status: "todo", priority: "low", owner: "AR", due: 7, category: "Finance" },
  { id: "t6", title: "Coordinate Offsite Venue & Catering", status: "backlog", priority: "medium", owner: "AR", due: 12, category: "Operations" },
  { id: "t7", title: "Update Onboarding Checklist", status: "backlog", priority: "low", owner: "AR", due: 9, category: "HR" },
  { id: "t8", title: "Send Weekly Report to Leadership", status: "done", priority: "medium", owner: "AR", due: -1, category: "Communications" },
  { id: "t9", title: "File Signed NDA with Legal", status: "done", priority: "low", owner: "AR", due: -3, category: "Operations" },
];

const initialEmails: EmailItem[] = [
  { id: "e1", sender: "Marcus Chen — Lead Investor", subject: "Re: Series B — updated terms", snippet: "Reviewed the redline, one open point on the liquidation preference…", vip: true, status: "needs-reply" },
  { id: "e2", sender: "Board Secretary", subject: "Q3 board deck — final review", snippet: "Please confirm the numbers on slide 12 before we circulate…", vip: true, status: "needs-reply" },
  { id: "e3", sender: "Cloud Services — Account Team", subject: "Contract renewal terms", snippet: "Attached is the revised pricing for the annual renewal…", vip: false, status: "flagged" },
  { id: "e4", sender: "Acme Corp — Client", subject: "Kickoff call — confirming agenda", snippet: "Looking forward to Thursday, sending our side's attendee list…", vip: true, status: "needs-reply" },
  { id: "e5", sender: "People Ops", subject: "New hire start date confirmation", snippet: "Confirming the offer accept and the proposed start date…", vip: false, status: "handled" },
  { id: "e6", sender: "Travel Desk", subject: "NYC itinerary — draft for approval", snippet: "Flights hold for 24h, need sign-off to lock the fare…", vip: false, status: "flagged" },
  { id: "e7", sender: "Newsletter — Ops Weekly", subject: "5 automations every EA should steal", snippet: "This week: calendar auto-buffers and inbox triage rules…", vip: false, status: "handled" },
];

const initialCalls: CallItem[] = [
  { id: "c1", contact: "Marcus Chen (Investor)", day: "Today", time: "2:00 PM", type: "Investor", done: false },
  { id: "c2", contact: "Head of Product — 1:1", day: "Today", time: "3:00 PM", type: "Internal", done: false },
  { id: "c3", contact: "Acme Corp — Kickoff", day: "Thu", time: "11:00 AM", type: "Client", done: false },
  { id: "c4", contact: "Cloud Services — Renewal", day: "Fri", time: "1:00 PM", type: "Vendor", done: false },
  { id: "c5", contact: "Weekly Leadership Sync", day: "Mon", time: "10:00 AM", type: "Internal", done: true },
];

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri"];

const initialAgenda: AgendaItem[] = [
  { id: "a1", day: "Mon", time: "9:00", title: "Leadership Sync", kind: "meeting" },
  { id: "a2", day: "Mon", time: "10:00", title: "Deep Work", kind: "focus" },
  { id: "a3", day: "Tue", time: "9:00", title: "Investor Call", kind: "meeting" },
  { id: "a4", day: "Wed", time: "9:00", title: "Deep Work", kind: "focus" },
  { id: "a5", day: "Wed", time: "13:00", title: "1:1 — Product", kind: "meeting" },
  { id: "a6", day: "Thu", time: "11:00", title: "Client Kickoff", kind: "meeting" },
  { id: "a7", day: "Fri", time: "13:00", title: "Vendor Renewal", kind: "meeting" },
];

const timeSlots = ["9:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00"];

const statusColumns: { key: TaskStatus; label: string }[] = [
  { key: "backlog", label: "Backlog" },
  { key: "todo", label: "To Do" },
  { key: "in-progress", label: "In Progress" },
  { key: "waiting", label: "Waiting Review" },
  { key: "done", label: "Completed" },
];

const priorityStyle: Record<Priority, { dot: string; text: string; bg: string; label: string }> = {
  high: { dot: "bg-rose-500", text: "text-rose-700", bg: "bg-rose-50", label: "High" },
  medium: { dot: "bg-amber-500", text: "text-amber-700", bg: "bg-amber-50", label: "Medium" },
  low: { dot: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50", label: "Low" },
};

function priorityScore(task: Task): number {
  const base = task.priority === "high" ? 3 : task.priority === "medium" ? 2 : 1;
  const soon = task.due <= 2 ? 1 : 0;
  return base + soon;
}

// ---------------------------------------------------------------------------

export default function ExecutiveOpsDashboard() {
  const [tab, setTab] = useState<TabKey>("overview");
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [emails, setEmails] = useState<EmailItem[]>(initialEmails);
  const [calls, setCalls] = useState<CallItem[]>(initialCalls);
  const [agenda, setAgenda] = useState<AgendaItem[]>(initialAgenda);
  const [rules, setRules] = useState<Rules>({
    vipFlag: true,
    dailyFocus: true,
    callReminders: true,
    staleFollowup: false,
  });
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [emailFilter, setEmailFilter] = useState<"all" | EmailStatus>("all");
  const [dragTaskId, setDragTaskId] = useState<string | null>(null);

  // ---- derived state ------------------------------------------------------

  const openTasks = tasks.filter((t) => t.status !== "done").length;
  const meetingsToday = calls.filter((c) => c.day === "Today").length;
  const emailsNeedingReply = emails.filter((e) => e.status === "needs-reply").length;
  const callsThisWeek = calls.length;

  const suggestions = useMemo<Suggestion[]>(() => {
    const list: Suggestion[] = [];

    if (rules.vipFlag) {
      const vipUnreplied = emails.filter((e) => e.vip && e.status === "needs-reply");
      vipUnreplied.forEach((e) =>
        list.push({
          id: `vip-${e.id}`,
          icon: Star,
          tone: "rose",
          text: `${e.sender} is waiting on a reply — flagged VIP`,
          action: "Mark handled",
          onAction: () => markEmail(e.id, "handled"),
        }),
      );
    }

    if (rules.dailyFocus) {
      const daysWithoutFocus = weekDays.filter(
        (d) => !agenda.some((a) => a.day === d && a.kind === "focus"),
      );
      daysWithoutFocus.forEach((d) =>
        list.push({
          id: `focus-${d}`,
          icon: Clock,
          tone: "amber",
          text: `No deep-work block scheduled on ${d} yet`,
          action: `Block 2h on ${d}`,
          onAction: () => addFocusBlock(d),
        }),
      );
    }

    if (rules.callReminders) {
      calls
        .filter((c) => !c.done && (c.day === "Today" || c.day === "Thu"))
        .forEach((c) =>
          list.push({
            id: `call-${c.id}`,
            icon: BellRing,
            tone: "slate",
            text: `Prep reminder — ${c.contact} at ${c.time} (${c.day})`,
            action: "Mark prepped",
            onAction: () => markCall(c.id),
          }),
        );
    }

    if (rules.staleFollowup) {
      tasks
        .filter((t) => t.status !== "done" && t.due <= 2)
        .forEach((t) =>
          list.push({
            id: `stale-${t.id}`,
            icon: RefreshCw,
            tone: "amber",
            text: `"${t.title}" is due in ${t.due <= 0 ? "less than a day" : t.due + "d"} — still ${statusColumns.find((s) => s.key === t.status)?.label}`,
            action: "Move to In Progress",
            onAction: () => moveTask(t.id, "in-progress"),
          }),
        );
    }

    return list.filter((s) => !dismissed.includes(s.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rules, emails, agenda, calls, tasks, dismissed]);

  // ---- actions --------------------------------------------------------------

  function moveTask(id: string, status: TaskStatus) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
  }

  function markEmail(id: string, status: EmailStatus) {
    setEmails((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e)));
  }

  function markCall(id: string) {
    setDismissed((prev) => [...prev, `call-${id}`]);
  }

  function addFocusBlock(day: string) {
    const usedSlots = new Set(agenda.filter((a) => a.day === day).map((a) => a.time));
    const nextSlot = timeSlots.find((s) => !usedSlots.has(s)) ?? "9:00";
    setAgenda((prev) => [
      ...prev,
      { id: `focus-${day}-${Date.now()}`, day, time: nextSlot, title: "Deep Work", kind: "focus" },
    ]);
    setDismissed((prev) => [...prev, `focus-${day}`]);
  }

  function dismissSuggestion(id: string, onAction?: () => void) {
    onAction?.();
    setDismissed((prev) => [...prev, id]);
  }

  function toggleRule(key: keyof Rules) {
    setRules((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  const filteredEmails = emails.filter((e) => emailFilter === "all" || e.status === emailFilter);

  const tabs: { key: TabKey; label: string; icon: LucideIcon }[] = [
    { key: "overview", label: "Overview", icon: LayoutDashboard },
    { key: "agenda", label: "Agenda", icon: CalendarDays },
    { key: "tasks", label: "Tasks", icon: KanbanSquare },
    { key: "inbox", label: "Inbox", icon: InboxIcon },
    { key: "calls", label: "Calls", icon: Phone },
  ];

  return (
    <div className="min-h-screen w-full bg-slate-50 font-sans text-slate-900">
      {/* Top bar */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-amber-400">
                  <Zap className="h-4 w-4" />
                </span>
                <h1 className="text-lg font-semibold tracking-tight">Executive Ops Board</h1>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                Agenda, tasks, inbox and calls in one place — with automation rules doing the triage.
              </p>
            </div>
            <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800">
              Demo data · nothing connected to real accounts
            </span>
          </div>

          {/* nav tabs */}
          <div className="mt-5 flex gap-1 overflow-x-auto border-b border-slate-200 pb-px">
            {tabs.map((t) => {
              const Icon = t.icon;
              const active = tab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? "border-slate-900 text-slate-900"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* KPI row — always visible */}
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Kpi label="Open Tasks" value={openTasks} icon={KanbanSquare} />
          <Kpi label="Calls Today" value={meetingsToday} icon={Phone} />
          <Kpi label="Emails Needing Reply" value={emailsNeedingReply} icon={Mail} />
          <Kpi label="Calls This Week" value={callsThisWeek} icon={CalendarDays} />
        </div>

        {tab === "overview" && (
          <Overview
            suggestions={suggestions}
            onDismiss={dismissSuggestion}
            rules={rules}
            onToggleRule={toggleRule}
          />
        )}

        {tab === "agenda" && <Agenda agenda={agenda} />}

        {tab === "tasks" && (
          <Tasks
            tasks={tasks}
            dragTaskId={dragTaskId}
            setDragTaskId={setDragTaskId}
            moveTask={moveTask}
          />
        )}

        {tab === "inbox" && (
          <Inbox
            emails={filteredEmails}
            filter={emailFilter}
            setFilter={setEmailFilter}
            markEmail={markEmail}
          />
        )}

        {tab === "calls" && <Calls calls={calls} setCalls={setCalls} />}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pieces
// ---------------------------------------------------------------------------

function Kpi({ label, value, icon: Icon }: { label: string; value: number; icon: LucideIcon }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-2xl font-semibold tabular-nums">{value}</span>
        <Icon className="h-4 w-4 text-slate-400" />
      </div>
      <p className="mt-1 text-xs text-slate-500">{label}</p>
    </div>
  );
}

const toneClasses: Record<Tone, string> = {
  rose: "bg-rose-50 text-rose-600 border-rose-100",
  amber: "bg-amber-50 text-amber-700 border-amber-100",
  slate: "bg-slate-100 text-slate-600 border-slate-200",
};

function Overview({
  suggestions,
  onDismiss,
  rules,
  onToggleRule,
}: {
  suggestions: Suggestion[];
  onDismiss: (id: string, onAction?: () => void) => void;
  rules: Rules;
  onToggleRule: (key: keyof Rules) => void;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-amber-500" />
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Smart Suggestions
          </h2>
        </div>

        {suggestions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
            Nothing needs your attention right now. Turn on a rule to see it generate suggestions.
          </div>
        ) : (
          <div className="space-y-2.5">
            {suggestions.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.id}
                  className={`flex items-center justify-between gap-4 rounded-xl border p-4 ${toneClasses[s.tone]}`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 shrink-0" />
                    <p className="text-sm font-medium">{s.text}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      onClick={() => onDismiss(s.id, s.onAction)}
                      className="whitespace-nowrap rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
                    >
                      {s.action}
                    </button>
                    <button
                      onClick={() => onDismiss(s.id)}
                      aria-label="Dismiss"
                      className="rounded-full p-1 text-slate-400 hover:bg-white/60 hover:text-slate-600"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <div className="mb-3 flex items-center gap-2">
          <Settings2 className="h-4 w-4 text-slate-400" />
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Automation Rules
          </h2>
        </div>
        <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-2">
          <RuleToggle
            label="Auto-flag VIP emails needing reply"
            checked={rules.vipFlag}
            onChange={() => onToggleRule("vipFlag")}
          />
          <RuleToggle
            label="Suggest a daily deep-work block"
            checked={rules.dailyFocus}
            onChange={() => onToggleRule("dailyFocus")}
          />
          <RuleToggle
            label="Remind me to prep before calls"
            checked={rules.callReminders}
            onChange={() => onToggleRule("callReminders")}
          />
          <RuleToggle
            label="Flag tasks stalling near their due date"
            checked={rules.staleFollowup}
            onChange={() => onToggleRule("staleFollowup")}
          />
        </div>
        <p className="mt-3 text-xs leading-relaxed text-slate-400">
          Toggle a rule and watch the Smart Suggestions feed update — this is how the board
          &quot;automates&quot; triage: the logic runs the checks a real EA would run every morning, so
          nothing has to be remembered.
        </p>
      </div>
    </div>
  );
}

function RuleToggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      onClick={onChange}
      className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-slate-50"
    >
      <span className="text-sm text-slate-700">{label}</span>
      <span
        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
          checked ? "bg-slate-900" : "bg-slate-200"
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-4" : "translate-x-0.5"
          }`}
        />
      </span>
    </button>
  );
}

function Agenda({ agenda }: { agenda: AgendaItem[] }) {
  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <CalendarDays className="h-4 w-4 text-slate-400" />
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">This Week</h2>
      </div>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <div className="grid min-w-[640px] grid-cols-5 divide-x divide-slate-200">
          {weekDays.map((day) => (
            <div key={day}>
              <div className="border-b border-slate-200 bg-slate-50 px-3 py-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                {day}
              </div>
              <div className="space-y-2 p-2">
                {timeSlots.map((slot) => {
                  const item = agenda.find((a) => a.day === day && a.time === slot);
                  return (
                    <div key={slot} className="flex items-center gap-2">
                      <span className="w-10 shrink-0 font-mono text-[10px] text-slate-400">
                        {slot}
                      </span>
                      {item ? (
                        <div
                          className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium ${
                            item.kind === "focus"
                              ? "bg-slate-900 text-amber-300"
                              : "bg-amber-50 text-amber-800 border border-amber-100"
                          }`}
                        >
                          {item.title}
                        </div>
                      ) : (
                        <div className="h-6 flex-1 rounded-md border border-dashed border-slate-100" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
      <p className="mt-3 text-xs text-slate-400">
        Gold blocks are meetings, dark blocks are protected deep-work time. Enable &quot;Suggest a daily
        deep-work block&quot; in Overview to auto-fill empty days.
      </p>
    </div>
  );
}

function Tasks({
  tasks,
  dragTaskId,
  setDragTaskId,
  moveTask,
}: {
  tasks: Task[];
  dragTaskId: string | null;
  setDragTaskId: (id: string | null) => void;
  moveTask: (id: string, status: TaskStatus) => void;
}) {
  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <KanbanSquare className="h-4 w-4 text-slate-400" />
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Task Board — drag a card between columns
        </h2>
      </div>
      <div className="grid gap-3 overflow-x-auto sm:grid-cols-3 lg:grid-cols-5">
        {statusColumns.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.key);
          return (
            <div
              key={col.key}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragTaskId) moveTask(dragTaskId, col.key);
                setDragTaskId(null);
              }}
              className="min-h-[200px] rounded-xl border border-slate-200 bg-white p-2"
            >
              <div className="flex items-center justify-between px-1.5 py-1.5">
                <span className="text-xs font-semibold text-slate-600">{col.label}</span>
                <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
                  {colTasks.length}
                </span>
              </div>
              <div className="space-y-2">
                {colTasks.map((task) => {
                  const style = priorityStyle[task.priority];
                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={() => setDragTaskId(task.id)}
                      className="cursor-grab rounded-lg border border-slate-200 bg-white p-2.5 shadow-sm active:cursor-grabbing"
                    >
                      <div className="flex items-start gap-2">
                        <span className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${style.dot}`} />
                        <p className="text-xs font-medium leading-snug text-slate-800">
                          {task.title}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${style.bg} ${style.text}`}>
                          {style.label}
                        </span>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                          <Flag className="h-3 w-3" />
                          {priorityScore(task)}
                          <span className="text-slate-300">·</span>
                          {task.due < 0 ? "done" : `${task.due}d`}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {colTasks.length === 0 && (
                  <div className="rounded-lg border border-dashed border-slate-200 p-4 text-center text-[11px] text-slate-300">
                    Drop here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Inbox({
  emails,
  filter,
  setFilter,
  markEmail,
}: {
  emails: EmailItem[];
  filter: "all" | EmailStatus;
  setFilter: (f: "all" | EmailStatus) => void;
  markEmail: (id: string, status: EmailStatus) => void;
}) {
  const filters: { key: "all" | EmailStatus; label: string }[] = [
    { key: "all", label: "All" },
    { key: "needs-reply", label: "Needs Reply" },
    { key: "flagged", label: "Flagged" },
    { key: "handled", label: "Handled" },
  ];

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <InboxIcon className="h-4 w-4 text-slate-400" />
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Inbox Triage</h2>
        </div>
        <div className="flex gap-1 rounded-full border border-slate-200 bg-white p-1">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                filter === f.key ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {emails.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
            Nothing in this view.
          </div>
        )}
        {emails.map((e) => (
          <div
            key={e.id}
            className="flex items-start justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4"
          >
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                <Mail className="h-3.5 w-3.5" />
              </span>
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-semibold text-slate-800">{e.sender}</p>
                  {e.vip && <Star className="h-3 w-3 fill-amber-400 text-amber-400" />}
                </div>
                <p className="text-sm text-slate-700">{e.subject}</p>
                <p className="mt-0.5 text-xs text-slate-400">{e.snippet}</p>
              </div>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-2">
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                  e.status === "needs-reply"
                    ? "bg-rose-50 text-rose-600"
                    : e.status === "flagged"
                      ? "bg-amber-50 text-amber-700"
                      : "bg-emerald-50 text-emerald-700"
                }`}
              >
                {e.status.replace("-", " ")}
              </span>
              {e.status !== "handled" && (
                <button
                  onClick={() => markEmail(e.id, "handled")}
                  className="whitespace-nowrap rounded-full border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-50"
                >
                  Mark handled
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Calls({
  calls,
  setCalls,
}: {
  calls: CallItem[];
  setCalls: React.Dispatch<React.SetStateAction<CallItem[]>>;
}) {
  function toggleDone(id: string) {
    setCalls((prev) => prev.map((c) => (c.id === id ? { ...c, done: !c.done } : c)));
  }

  function reschedule(id: string) {
    const order = ["Today", "Tue", "Wed", "Thu", "Fri", "Mon"];
    setCalls((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const idx = order.indexOf(c.day);
        const nextDay = order[(idx + 1) % order.length];
        return { ...c, day: nextDay };
      }),
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <Phone className="h-4 w-4 text-slate-400" />
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Calls & Meetings
        </h2>
      </div>
      <div className="space-y-2">
        {calls.map((c) => (
          <div
            key={c.id}
            className={`flex items-center justify-between gap-4 rounded-xl border p-4 ${
              c.done ? "border-slate-100 bg-slate-50" : "border-slate-200 bg-white"
            }`}
          >
            <div className="flex items-center gap-3">
              <button
                onClick={() => toggleDone(c.id)}
                aria-label={c.done ? "Mark not done" : "Mark done"}
                className="text-slate-400 hover:text-slate-700"
              >
                {c.done ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                ) : (
                  <Circle className="h-5 w-5" />
                )}
              </button>
              <div>
                <p className={`text-sm font-medium ${c.done ? "text-slate-400 line-through" : "text-slate-800"}`}>
                  {c.contact}
                </p>
                <p className="text-xs text-slate-400">
                  {c.day} · {c.time} · {c.type}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                onClick={() => reschedule(c.id)}
                className="flex items-center gap-1 whitespace-nowrap rounded-full border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-50"
              >
                <RefreshCw className="h-3 w-3" />
                Push +1 day
              </button>
              <button className="flex items-center gap-1 whitespace-nowrap rounded-full border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-50">
                <StickyNote className="h-3 w-3" />
                Notes
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
