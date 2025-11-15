import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function parseMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

type ArrivalEntry = { date: string; scheduled: string; arrived: string };

type Person = { id: string; name: string; arrivals: ArrivalEntry[] };

function computeStats(people: Person[]) {
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
    };
  });
}

function toFriendlyMinutes(mins: number) {
  if (mins < 1) return 'right on time';
  if (mins < 5) return `${Math.round(mins)} min`;
  if (mins < 60) return `${Math.round(mins)} mins`;
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  return m ? `${h}h ${m}m` : `${h}h`;
}

function generateMirrorSummary(stats: ReturnType<typeof computeStats>) {
  if (!stats.length) return 'Mirror sees no faces, only empty spaces.';
  const ranked = [...stats].sort((a, b) => {
    if (b.avgLateMinutes !== a.avgLateMinutes) return b.avgLateMinutes - a.avgLateMinutes;
    if (b.totalLateMinutes !== a.totalLateMinutes) return b.totalLateMinutes - a.totalLateMinutes;
    return b.lateCount - a.lateCount;
  });

  const top = ranked[0];
  const second = ranked[1];

  const opener = `Mirror, mirror, clear and bright ? tardy tales are told tonight.`;
  const verdict = `Crowned the sloth of ticking fate: ${top.personName} shows up, on average, ${toFriendlyMinutes(top.avgLateMinutes)} late.`;
  const runner = second
    ? `In second place trails ${second.personName}, averaging ${toFriendlyMinutes(second.avgLateMinutes)} behind the chime.`
    : `No rivals to contest the throne today.`;

  const spice = top.lateCount > top.occurrences / 2
    ? `${top.personName} is late more often than not ? a habit, not a hiccup.`
    : `${top.personName} has their moments, but hope still springs.`;

  return [opener, '', verdict, runner, '', spice].join('\n');
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const people = (body?.people ?? []) as Person[];
    const stats = computeStats(people);
    const summary = generateMirrorSummary(stats);
    return NextResponse.json({ stats, summary });
  } catch (e) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }
}
