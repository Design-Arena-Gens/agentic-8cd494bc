"use client";

import { useMemo, useState } from 'react';
import { TardyTable, Person } from './components/TardyTable';

type DraftRow = { id: string; name: string };

const seedPeople: Person[] = [
  {
    id: 'p1',
    name: 'Alex',
    arrivals: [
      { date: '2025-11-01', scheduled: '09:00', arrived: '09:08' },
      { date: '2025-11-02', scheduled: '09:00', arrived: '09:14' },
      { date: '2025-11-04', scheduled: '09:00', arrived: '08:58' },
    ],
  },
  {
    id: 'p2',
    name: 'Blair',
    arrivals: [
      { date: '2025-11-01', scheduled: '09:00', arrived: '09:02' },
      { date: '2025-11-03', scheduled: '09:00', arrived: '09:25' },
      { date: '2025-11-04', scheduled: '09:00', arrived: '09:07' },
    ],
  },
  {
    id: 'p3',
    name: 'Casey',
    arrivals: [
      { date: '2025-11-01', scheduled: '09:00', arrived: '08:55' },
      { date: '2025-11-02', scheduled: '09:00', arrived: '09:00' },
      { date: '2025-11-04', scheduled: '09:00', arrived: '09:01' },
    ],
  },
];

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export default function Page() {
  const [people, setPeople] = useState<Person[]>(seedPeople);
  const [draftName, setDraftName] = useState('');
  const [scheduled, setScheduled] = useState('09:00');
  const [arrived, setArrived] = useState('09:15');
  const [selectedId, setSelectedId] = useState<string>(seedPeople[0].id);
  const selectedPerson = useMemo(() => people.find(p => p.id === selectedId)!, [people, selectedId]);

  async function fetchMirror() {
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ people }),
      });
      const data = await res.json();
      setMirror(data.summary as string);
    } catch (e) {
      setMirror('Mirror cracked. Try again.');
    }
  }

  const [mirror, setMirror] = useState<string>('Click "Ask the Mirror" for a verdict.');

  return (
    <main className="space-y-6">
      <header className="text-center space-y-2">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">AI Mirror Mirror</h1>
        <p className="text-slate-600">Who's the tardiest around?</p>
      </header>

      <section className="grid md:grid-cols-2 gap-6">
        <div className="card p-5 space-y-4">
          <h2 className="font-semibold">Add Person</h2>
          <div className="flex gap-2">
            <input className="input" placeholder="Name" value={draftName} onChange={e => setDraftName(e.target.value)} />
            <button
              className="btn btn-primary"
              onClick={() => {
                if (!draftName.trim()) return;
                const newPerson: Person = { id: uid(), name: draftName.trim(), arrivals: [] };
                setPeople(p => [...p, newPerson]);
                setDraftName('');
                setSelectedId(newPerson.id);
              }}
            >Add</button>
          </div>

          <h2 className="font-semibold">Log Arrival</h2>
          <div className="space-y-2">
            <select className="input" value={selectedId} onChange={e => setSelectedId(e.target.value)}>
              {people.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <div className="grid grid-cols-3 gap-2">
              <input className="input" type="date" value={new Date().toISOString().slice(0,10)} readOnly />
              <input className="input" type="time" value={scheduled} onChange={e => setScheduled(e.target.value)} />
              <input className="input" type="time" value={arrived} onChange={e => setArrived(e.target.value)} />
            </div>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setPeople(ps => ps.map(p => p.id === selectedId ? {
                  ...p,
                  arrivals: [
                    ...p.arrivals,
                    { date: new Date().toISOString().slice(0,10), scheduled, arrived }
                  ]
                } : p));
              }}
            >Add Entry</button>
          </div>

          <button className="btn btn-primary w-full" onClick={fetchMirror}>Ask the Mirror</button>
          <p className="text-sm text-slate-600">The mirror crafts a playful verdict based on your data.</p>
        </div>

        <div className="card p-5 space-y-3">
          <h2 className="font-semibold">Mirror's Rhyme</h2>
          <div className="rounded-xl border border-cloud-200 bg-white p-4 min-h-[100px] whitespace-pre-wrap">{mirror}</div>
          <TardyTable people={people} />
        </div>
      </section>

      <footer className="text-center text-xs text-slate-500">No external AI used ? all on-device logic for fun.</footer>
    </main>
  );
}
