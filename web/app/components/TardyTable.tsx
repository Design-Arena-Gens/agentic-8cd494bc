"use client";

import { useMemo } from 'react';
import { clsx } from 'clsx';

export type ArrivalEntry = {
  date: string; // ISO date without time (YYYY-MM-DD)
  scheduled: string; // HH:MM 24h
  arrived: string;   // HH:MM 24h
};

export type Person = {
  id: string;
  name: string;
  arrivals: ArrivalEntry[];
};

export type TardyStats = {
  personId: string;
  personName: string;
  totalLateMinutes: number;
  avgLateMinutes: number;
  lateCount: number;
  occurrences: number;
};

function parseMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function computeStats(people: Person[]): TardyStats[] {
  return people.map((p) => {
    let total = 0;
    let lateCount = 0;
    for (const a of p.arrivals) {
      const scheduled = parseMinutes(a.scheduled);
      const arrived = parseMinutes(a.arrived);
      const delta = Math.max(0, arrived - scheduled);
      if (delta > 0) lateCount += 1;
      total += delta;
    }
    const occurrences = p.arrivals.length || 1;
    return {
      personId: p.id,
      personName: p.name,
      totalLateMinutes: total,
      avgLateMinutes: total / occurrences,
      lateCount,
      occurrences,
    } satisfies TardyStats;
  });
}

export function rankByTardiness(stats: TardyStats[]): TardyStats[] {
  return [...stats].sort((a, b) => {
    if (b.avgLateMinutes !== a.avgLateMinutes) return b.avgLateMinutes - a.avgLateMinutes;
    if (b.totalLateMinutes !== a.totalLateMinutes) return b.totalLateMinutes - a.totalLateMinutes;
    return b.lateCount - a.lateCount;
  });
}

export function TardyTable({ people }: { people: Person[] }) {
  const stats = useMemo(() => computeStats(people), [people]);
  const ranked = useMemo(() => rankByTardiness(stats), [stats]);

  return (
    <div className="card p-4 md:p-6">
      <div className="flex items-center justify-between gap-4 mb-4">
        <h2 className="text-lg md:text-xl font-semibold">Tardiness Leaderboard</h2>
        {ranked[0] && (
          <span className="badge">Mirror says: {ranked[0].personName} is tardiest</span>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm md:text-base">
          <thead>
            <tr className="text-left text-slate-600">
              <th className="px-2 py-2">Name</th>
              <th className="px-2 py-2">Avg Late</th>
              <th className="px-2 py-2">Total Late</th>
              <th className="px-2 py-2">Late Days</th>
              <th className="px-2 py-2">Entries</th>
            </tr>
          </thead>
          <tbody>
            {ranked.map((s, idx) => (
              <tr key={s.personId} className={clsx(idx === 0 && 'bg-cloud-50/60 font-medium')}>
                <td className="px-2 py-2">{s.personName}</td>
                <td className="px-2 py-2">{Math.round(s.avgLateMinutes)} min</td>
                <td className="px-2 py-2">{s.totalLateMinutes} min</td>
                <td className="px-2 py-2">{s.lateCount}</td>
                <td className="px-2 py-2">{s.occurrences}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
