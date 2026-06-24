import Link from "next/link";
import { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  MapPin, Star, Zap, Coins, Trophy, Flame, CheckCircle2,
  ArrowRight, Shield, AlertTriangle, XCircle, RotateCcw,
  Mountain, Waves, Camera, Leaf, Users, BookOpen,
} from "lucide-react";

export const metadata: Metadata = {
  title: "How It Works — TravelDiary",
  description: "Learn how to contribute places, earn XP and coins, unlock badges, level up, and redeem rewards on TravelDiary.",
};

// ─── Data ─────────────────────────────────────────────────────────────────────

const EARN_ROWS = [
  // [action, xp, coins, note]
  ["Place approved by admin",      "+100 XP", "+100 🪙", ""],
  ["First ever contribution",       "+50 XP",  "+50 🪙", "bonus"],
  ["Place selected as Featured",    "+50 XP",  "+50 🪙", ""],
  ["Place marked as Hidden Gem 💎", "+100 XP", "+100 🪙", ""],
  ["Review approved",               "+20 XP",  "+20 🪙",  ""],
  ["Daily login — Day 1",           "—",        "+5 🪙",  ""],
  ["Daily login streak — 7 days",   "—",        "+25 🪙", "🔥"],
  ["Daily login streak — 30 days",  "—",        "+100 🪙","🔥🔥"],
];

const LEVELS = [
  { level: 1, name: "Newcomer",    xp: "0",      emoji: "🌱", color: "text-gray-500",   bg: "bg-gray-100 dark:bg-gray-800",     border: "border-gray-300" },
  { level: 2, name: "Explorer",    xp: "500",    emoji: "🧭", color: "text-green-600",  bg: "bg-green-50 dark:bg-green-950",    border: "border-green-300" },
  { level: 3, name: "Adventurer",  xp: "1,500",  emoji: "⛺", color: "text-blue-600",   bg: "bg-blue-50 dark:bg-blue-950",      border: "border-blue-300" },
  { level: 4, name: "Trailblazer", xp: "3,000",  emoji: "🗺️", color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-950",  border: "border-purple-300" },
  { level: 5, name: "Pioneer",     xp: "6,000",  emoji: "🏔️", color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-950",  border: "border-orange-300" },
  { level: 6, name: "Legend",      xp: "10,000", emoji: "👑", color: "text-yellow-600", bg: "bg-yellow-50 dark:bg-yellow-950",  border: "border-yellow-300" },
];

const EXPLORER_BADGES = [
  { icon: "⛰️", name: "Mountain Explorer",     rarity: "Rare",      condition: "10 approved mountain destinations" },
  { icon: "🛕", name: "Temple Hunter",          rarity: "Rare",      condition: "15 approved religious places" },
  { icon: "🏖️", name: "Beach Lover",            rarity: "Common",    condition: "10 beach destinations" },
  { icon: "💧", name: "Waterfall Seeker",        rarity: "Rare",      condition: "10 waterfall destinations" },
  { icon: "🧗", name: "Adventure Master",        rarity: "Epic",      condition: "20 adventure destinations" },
  { icon: "💎", name: "Hidden Gem Discoverer",   rarity: "Epic",      condition: "5 places marked as Hidden Gems" },
  { icon: "🗺️", name: "Weekend Traveler",        rarity: "Rare",      condition: "25 approved places" },
  { icon: "🌿", name: "Nature Enthusiast",       rarity: "Epic",      condition: "30 nature destinations" },
  { icon: "🚗", name: "Road Trip Expert",        rarity: "Rare",      condition: "20 road-trip destinations" },
];

const COMMUNITY_BADGES = [
  { icon: "🌟", name: "First Contribution",   rarity: "Common",    condition: "Your first approved place" },
  { icon: "⭐", name: "Rising Star",           rarity: "Rare",      condition: "Receive 100 likes on reviews" },
  { icon: "✍️", name: "Review Expert",         rarity: "Epic",      condition: "100 approved reviews written" },
  { icon: "📸", name: "Photo Master",          rarity: "Epic",      condition: "100 approved photos uploaded" },
  { icon: "🏆", name: "Top Contributor",       rarity: "Legendary", condition: "100 approved places" },
  { icon: "🦸", name: "Community Hero",        rarity: "Legendary", condition: "500 total contributions" },
  { icon: "✅", name: "Trusted Contributor",   rarity: "Legendary", condition: "Maintain 95%+ approval rate" },
];

const RARITY_STYLE: Record<string, string> = {
  Common:    "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  Rare:      "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  Epic:      "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  Legendary: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
};

const STEPS = [
  { title: "Create an account", body: "Sign up with email or Google. Your account tracks all your XP, coins, badges, and contributions.", icon: Users },
  { title: 'Click "Add Place"', body: "From the navbar or dashboard, fill in the title, description, location, category, and photos.", icon: MapPin },
  { title: "Wait for review",   body: "Your submission shows as Pending in your dashboard while our admin team reviews quality. Usually 24–48 hrs.", icon: BookOpen },
  { title: "Get approved — earn rewards", body: "Once approved you automatically receive +100 XP and +100 Coins. First contribution gives a +50 XP bonus.", icon: Zap },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function GuidePage() {
  return (
    <div className="min-h-screen">

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative bg-[#0f2d2d] text-white overflow-hidden">
        {/* Topographic accent rings */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute right-0 top-0 w-[600px] h-[600px] opacity-[0.07]"
            style={{
              background: "radial-gradient(ellipse 80% 60% at 80% 40%, transparent 30%, #1e5f5f 31%, transparent 32%), radial-gradient(ellipse 65% 50% at 78% 38%, transparent 40%, #1e5f5f 41%, transparent 42%), radial-gradient(ellipse 50% 38% at 76% 36%, transparent 50%, #1e5f5f 51%, transparent 52%)",
            }}
          />
        </div>

        <div className="container mx-auto px-4 py-20 max-w-3xl relative">
          <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase text-amber-400 border border-amber-400/40 px-3 py-1 rounded-sm mb-6">
            Platform Guide
          </span>
          <h1 className="text-4xl md:text-5xl font-serif font-normal leading-[1.2] mb-5 tracking-tight">
            Explore India.<br />
            <em className="text-amber-400 not-italic">Share your finds.</em><br />
            Earn real rewards.
          </h1>
          <p className="text-lg text-white/65 max-w-xl mb-8 leading-relaxed">
            TravelDiary is a community-driven platform where your contributions unlock XP, coins, badges, and physical rewards.
            This guide explains everything.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild className="bg-amber-400 text-[#0f2d2d] hover:bg-amber-300 font-semibold">
              <Link href="/places/new">Add Your First Place <ArrowRight className="h-4 w-4 ml-1" /></Link>
            </Button>
            <Button asChild variant="outline" className="border-white/25 text-white hover:bg-white/10 hover:text-white bg-transparent">
              <Link href="/explore">Browse Places</Link>
            </Button>
          </div>
        </div>

        {/* Wave bottom */}
        <div className="h-10 bg-background" style={{ clipPath: "ellipse(55% 100% at 50% 100%)" }} />
      </section>

      {/* ── THE CORE LOOP ─────────────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-background">
        <div className="container mx-auto max-w-3xl">
          <p className="text-xs font-bold tracking-[0.18em] uppercase text-amber-600 mb-2">The Core Loop</p>
          <h2 className="text-3xl font-serif font-normal mb-3">Discover → Share → Earn</h2>
          <p className="text-muted-foreground mb-8 max-w-xl">Three things happen every time you contribute a quality destination.</p>

          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { icon: "🔍", title: "Discover a place", body: "Found a hidden waterfall, a beautiful temple, or a stunning beach? That belongs here." },
              { icon: "📝", title: "Share it with detail", body: "Add photos, travel tips, entry fees, opening hours. Quality submissions get approved faster." },
              { icon: "⚡", title: "Earn XP & Coins", body: "Approved places give you +100 XP and +100 Coins. Level up, unlock badges, redeem rewards." },
            ].map((c, i) => (
              <div key={i} className="relative border rounded-xl p-5 bg-card">
                <span className="absolute top-3 right-4 font-serif text-4xl text-border select-none">{i + 1}</span>
                <div className="text-3xl mb-3">{c.icon}</div>
                <h3 className="font-semibold mb-1.5 text-sm">{c.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Separator />

      {/* ── HOW TO CONTRIBUTE ─────────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-3xl">
          <p className="text-xs font-bold tracking-[0.18em] uppercase text-amber-600 mb-2">Step by Step</p>
          <h2 className="text-3xl font-serif font-normal mb-3">How to add a place</h2>
          <p className="text-muted-foreground mb-8 max-w-xl">From signup to your first reward in four simple steps.</p>

          <div className="space-y-3">
            {STEPS.map((s, i) => (
              <div key={i} className="flex gap-4 items-start bg-card border rounded-xl p-4">
                <div className="h-9 w-9 rounded-full bg-[#0f2d2d] text-amber-400 flex items-center justify-center shrink-0 font-serif font-bold text-sm mt-0.5">
                  {i + 1}
                </div>
                <div>
                  <p className="font-semibold text-sm mb-1">{s.title}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
                  {i === 3 && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 px-2 py-0.5 rounded mt-2">
                      <Zap className="h-3 w-3" /> +100 XP earned on approval
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── EARNING TABLE ─────────────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-background" id="earn">
        <div className="container mx-auto max-w-3xl">
          <p className="text-xs font-bold tracking-[0.18em] uppercase text-amber-600 mb-2">Reward System</p>
          <h2 className="text-3xl font-serif font-normal mb-3">Every way to earn</h2>
          <p className="text-muted-foreground mb-8 max-w-xl">
            Rewards are only given after admin approval — quality matters, not quantity.
          </p>

          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">Action</th>
                  <th className="text-center px-4 py-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">XP</th>
                  <th className="text-center px-4 py-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">Coins</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-[#0f2d2d]">
                  <td colSpan={3} className="px-4 py-2 text-[0.65rem] font-bold uppercase tracking-[0.15em] text-white/50">Place Contributions</td>
                </tr>
                {EARN_ROWS.slice(0, 4).map(([action, xp, coins, note]) => (
                  <tr key={action} className="border-b hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-colors">
                    <td className="px-4 py-3">
                      {action}
                      {note === "bonus" && <span className="ml-2 text-xs font-semibold text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300 px-1.5 py-0.5 rounded">bonus</span>}
                      {note && note !== "bonus" && <span className="ml-2">{note}</span>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {xp !== "—" ? <span className="inline-flex items-center gap-1 text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 px-2 py-0.5 rounded font-mono">{xp}</span> : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center gap-1 text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300 px-2 py-0.5 rounded font-mono">{coins}</span>
                    </td>
                  </tr>
                ))}
                <tr className="bg-[#0f2d2d]">
                  <td colSpan={3} className="px-4 py-2 text-[0.65rem] font-bold uppercase tracking-[0.15em] text-white/50">Reviews</td>
                </tr>
                {EARN_ROWS.slice(4, 5).map(([action, xp, coins]) => (
                  <tr key={action} className="border-b hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-colors">
                    <td className="px-4 py-3">{action}</td>
                    <td className="px-4 py-3 text-center"><span className="inline-flex items-center gap-1 text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 px-2 py-0.5 rounded font-mono">{xp}</span></td>
                    <td className="px-4 py-3 text-center"><span className="inline-flex items-center gap-1 text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300 px-2 py-0.5 rounded font-mono">{coins}</span></td>
                  </tr>
                ))}
                <tr className="bg-[#0f2d2d]">
                  <td colSpan={3} className="px-4 py-2 text-[0.65rem] font-bold uppercase tracking-[0.15em] text-white/50">Daily Login Streak</td>
                </tr>
                {EARN_ROWS.slice(5).map(([action, xp, coins, note]) => (
                  <tr key={action} className="border-b last:border-0 hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-colors">
                    <td className="px-4 py-3">{action} {note && <span>{note}</span>}</td>
                    <td className="px-4 py-3 text-center text-muted-foreground">—</td>
                    <td className="px-4 py-3 text-center"><span className="inline-flex items-center gap-1 text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300 px-2 py-0.5 rounded font-mono">{coins}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            ⚠️ Max 5 rewarded place approvals per day per user. Deleted places lose their earned rewards.
          </p>
        </div>
      </section>

      {/* ── LEVELS ─────────────────────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-muted/30" id="levels">
        <div className="container mx-auto max-w-3xl">
          <p className="text-xs font-bold tracking-[0.18em] uppercase text-amber-600 mb-2">Level System</p>
          <h2 className="text-3xl font-serif font-normal mb-3">Six levels to climb</h2>
          <p className="text-muted-foreground mb-6 max-w-xl">XP accumulates over time. Your level and title show on your public profile.</p>

          {/* demo progress bar */}
          <div className="bg-[#0f2d2d] rounded-xl p-5 mb-6">
            <div className="flex items-center justify-between mb-2 text-sm">
              <span className="text-white font-serif">⛺ Level 3 — Adventurer</span>
              <span className="text-white/55 font-mono text-xs">1,800 / 3,000 XP</span>
            </div>
            <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-blue-400 rounded-full" style={{ width: "60%" }} />
            </div>
            <div className="flex justify-between text-xs text-white/35 mt-1.5">
              <span>Adventurer (1,500 XP)</span>
              <span>Trailblazer (3,000 XP) →</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {LEVELS.map((l) => (
              <div key={l.level} className={`rounded-xl border-2 ${l.bg} ${l.border} p-4 text-center`}>
                <div className="text-2xl mb-1">{l.emoji}</div>
                <p className={`font-bold text-xs ${l.color}`}>{l.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5 font-mono">{l.xp} XP</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BADGES ─────────────────────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-[#0f2d2d] text-white" id="badges">
        <div className="container mx-auto max-w-3xl">
          <p className="text-xs font-bold tracking-[0.18em] uppercase text-amber-400 mb-2">Badge System</p>
          <h2 className="text-3xl font-serif font-normal mb-3 text-white">16 badges to unlock</h2>
          <p className="text-white/55 mb-8 max-w-xl">
            Badges reward specific contribution patterns. They appear on your public profile and never expire.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Explorer */}
            <div>
              <p className="text-xs font-bold tracking-[0.16em] uppercase text-amber-400 mb-3 pb-2 border-b border-white/10">🧭 Explorer Badges</p>
              <div className="space-y-2">
                {EXPLORER_BADGES.map((b) => (
                  <div key={b.name} className="flex items-start gap-3 bg-white/5 border border-white/8 rounded-lg p-3">
                    <span className="text-xl shrink-0 mt-0.5">{b.icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-white leading-tight">
                        {b.name}
                        <span className={`ml-2 text-[0.6rem] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded ${RARITY_STYLE[b.rarity]}`}>
                          {b.rarity}
                        </span>
                      </p>
                      <p className="text-xs text-white/50 mt-0.5">{b.condition}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Community */}
            <div>
              <p className="text-xs font-bold tracking-[0.16em] uppercase text-amber-400 mb-3 pb-2 border-b border-white/10">🤝 Community Badges</p>
              <div className="space-y-2">
                {COMMUNITY_BADGES.map((b) => (
                  <div key={b.name} className="flex items-start gap-3 bg-white/5 border border-white/8 rounded-lg p-3">
                    <span className="text-xl shrink-0 mt-0.5">{b.icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-white leading-tight">
                        {b.name}
                        <span className={`ml-2 text-[0.6rem] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded ${RARITY_STYLE[b.rarity]}`}>
                          {b.rarity}
                        </span>
                      </p>
                      <p className="text-xs text-white/50 mt-0.5">{b.condition}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STREAK ─────────────────────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-amber-50 dark:bg-amber-950/20">
        <div className="container mx-auto max-w-3xl">
          <p className="text-xs font-bold tracking-[0.18em] uppercase text-amber-600 mb-2">Daily Streak</p>
          <h2 className="text-3xl font-serif font-normal mb-3">Log in every day, earn more coins</h2>
          <p className="text-muted-foreground mb-6 max-w-xl">Your streak resets if you miss a day. Come back daily to keep building it.</p>
          <div className="grid grid-cols-3 gap-4">
            {[
              { days: "Day 1", coins: "+5 🪙", label: "Every login" },
              { days: "Day 7", coins: "+25 🪙", label: "7-day streak 🔥" },
              { days: "Day 30", coins: "+100 🪙", label: "30-day streak 🔥🔥" },
            ].map((s) => (
              <Card key={s.days} className="text-center">
                <CardContent className="py-5">
                  <p className="font-serif text-2xl font-bold text-[#0f2d2d] dark:text-white">{s.days}</p>
                  <p className="font-bold text-amber-600 mt-1 text-sm">{s.coins}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── REWARD ─────────────────────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-background" id="rewards">
        <div className="container mx-auto max-w-3xl">
          <p className="text-xs font-bold tracking-[0.18em] uppercase text-amber-600 mb-2">Reward Redemption</p>
          <h2 className="text-3xl font-serif font-normal mb-3">Turn coins into a real plant</h2>
          <p className="text-muted-foreground mb-6 max-w-xl">Reach 2,000 coins and redeem them for a physical reward shipped to your door — completely free.</p>

          <div className="bg-gradient-to-br from-[#0f2d2d] to-[#1e5f5f] rounded-2xl p-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center mb-6">
            <div className="h-20 w-20 rounded-full bg-white/10 border-2 border-amber-400/40 flex items-center justify-center text-4xl shrink-0">
              🌱
            </div>
            <div>
              <h3 className="text-white text-xl font-serif mb-2">Green Traveler Plant</h3>
              <p className="text-white/60 text-sm leading-relaxed mb-3">
                A living token of appreciation for helping travelers across India discover new destinations.
              </p>
              <span className="inline-flex items-center gap-2 bg-amber-400 text-[#0f2d2d] font-bold text-sm px-4 py-1.5 rounded-lg">
                🪙 2,000 Coins → One Plant
              </span>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            {[
              { icon: "📦", title: "You provide", body: "Name, phone, full delivery address, and 2,000 coins" },
              { icon: "⏳", title: "Admin reviews", body: "Team verifies your request and approves for dispatch" },
              { icon: "🚚", title: "We ship it", body: "Tracking number shared in your dashboard once shipped" },
            ].map((s) => (
              <div key={s.title} className="border rounded-xl p-4 bg-card">
                <div className="text-xl mb-2">{s.icon}</div>
                <p className="font-semibold text-sm mb-1">{s.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── RULES ──────────────────────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-3xl">
          <p className="text-xs font-bold tracking-[0.18em] uppercase text-amber-600 mb-2">Important Rules</p>
          <h2 className="text-3xl font-serif font-normal mb-3">What you should know</h2>
          <p className="text-muted-foreground mb-6 max-w-xl">To keep the community fair, a few rules apply to the reward system.</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { icon: CheckCircle2, color: "text-green-600",  borderColor: "border-l-green-500", title: "Only approved content earns",  body: "Rewards are given only after admin approval. Pending or rejected places earn nothing." },
              { icon: AlertTriangle, color: "text-amber-600", borderColor: "border-l-amber-500", title: "Max 5 rewards per day",           body: "You can earn place-approval rewards for up to 5 places per day." },
              { icon: XCircle,      color: "text-red-500",    borderColor: "border-l-red-500",   title: "Deleted places lose rewards",    body: "Deleting an approved place deducts the XP and coins that were earned for it." },
              { icon: RotateCcw,    color: "text-amber-600",  borderColor: "border-l-amber-500", title: "No repeat editing rewards",      body: "Editing the same place repeatedly does not earn extra rewards." },
              { icon: XCircle,      color: "text-red-500",    borderColor: "border-l-red-500",   title: "No duplicate places",           body: "Duplicate submissions are rejected and earn no rewards." },
              { icon: Star,         color: "text-green-600",  borderColor: "border-l-green-500", title: "Approval rate matters",         body: "Maintaining a 95%+ approval rate unlocks the Trusted Contributor badge." },
            ].map((r) => (
              <div key={r.title} className={`bg-card border border-l-4 ${r.borderColor} rounded-r-xl p-4`}>
                <r.icon className={`h-4 w-4 ${r.color} mb-2`} />
                <p className="font-semibold text-sm mb-1">{r.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{r.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-[#0f2d2d] text-center">
        <div className="container mx-auto max-w-md">
          <div className="text-4xl mb-4">🗺️</div>
          <h2 className="text-3xl font-serif text-white mb-3">Ready to explore?</h2>
          <p className="text-white/55 mb-8 leading-relaxed">
            Join the community, add your first place, and start your journey toward Level 6 Legend.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Button asChild className="bg-amber-400 text-[#0f2d2d] hover:bg-amber-300 font-bold px-6">
              <Link href="/register">Create account</Link>
            </Button>
            <Button asChild variant="outline" className="border-white/25 text-white hover:bg-white/10 hover:text-white bg-transparent">
              <Link href="/explore">Browse places</Link>
            </Button>
            <Button asChild variant="outline" className="border-white/25 text-white hover:bg-white/10 hover:text-white bg-transparent">
              <Link href="/leaderboard">Leaderboard</Link>
            </Button>
          </div>
        </div>
      </section>

    </div>
  );
}
