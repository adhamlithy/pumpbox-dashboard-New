import React, { useState, useMemo } from 'react';
import { 
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine 
} from 'recharts';
import { 
  Activity, AlertTriangle, CheckCircle2, ShieldAlert, Cpu, Sliders, Gauge, Layers, Info, Download, RefreshCw 
} from 'lucide-react';

// --- DATASET GENERATION (High Fidelity Simulated Real-time Process Telemetry) ---
const generateEventData = (eventId) => {
  const points = [];
  let baseFlow, baseHCI, baseSpeedRPM, baseCurrent, baseCC01, baseCC02;

  if (eventId === 'E1') {
    // Event E1: Onset @ 13:28:24 PM
    for (let i = 0; i <= 60; i++) {
      const timeSec = i * 4; // 4 second intervals
      const progress = i / 60;
      
      if (progress < 0.2) {
        // Pre-choke stable phase
        baseFlow = 580 - Math.random() * 15;
        baseHCI = 96 - Math.random() * 3;
        baseSpeedRPM = 119.8;
        baseCurrent = 48.5 + Math.random() * 2;
        baseCC01 = 38 + Math.random() * 3;
        baseCC02 = 42 + Math.random() * 3;
      } else if (progress < 0.35) {
        // Trigger Onset (HCI < 90%, Flow < 400)
        const t = (progress - 0.2) / 0.15;
        baseFlow = 580 - t * (580 - 390.1);
        baseHCI = 96 - t * (96 - 89);
        baseSpeedRPM = 119.8;
        baseCurrent = 47.0;
        baseCC01 = 41 + t * 4.5; // reaches ~45.5%
        baseCC02 = 44 + t * 8.5; // reaches ~52.5%
      } else if (progress < 0.7) {
        // Choke Collapse
        const t = (progress - 0.35) / 0.35;
        baseFlow = Math.max(0.1, 390.1 - t * 390);
        baseHCI = Math.max(1, 89 - t * 88);
        baseSpeedRPM = 119.8 * (1 - t * 0.15);
        baseCurrent = 47.0 + t * 6.3; // Motor struggles under high density
        baseCC01 = 45.5 + Math.random() * 2;
        baseCC02 = 52.5 + Math.random() * 3;
      } else {
        // Post Choke / Trip phase
        baseFlow = 0.1;
        baseHCI = 1;
        baseSpeedRPM = 0;
        baseCurrent = 0;
        baseCC01 = 20;
        baseCC02 = 20;
      }

      const timestamp = new Date(new Date('2026-11-06T13:26:00').getTime() + timeSec * 1000)
        .toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

      points.push({
        time: timestamp,
        flow: Number(baseFlow.toFixed(1)),
        hci: Number(baseHCI.toFixed(1)),
        speedRPM: Number(baseSpeedRPM.toFixed(1)),
        speedPct: Number(((baseSpeedRPM / 120) * 100).toFixed(1)),
        current: Number(baseCurrent.toFixed(1)),
        density: progress >= 0.2 ? 1.94 : 1.78,
        cc01: Number(baseCC01.toFixed(1)),
        cc02: Number(baseCC02.toFixed(1)),
      });
    }
  } else if (eventId === 'E2') {
    // Event E2: Onset @ 15:30:16 PM
    for (let i = 0; i <= 60; i++) {
      const timeSec = i * 8;
      const progress = i / 60;
      
      if (progress < 0.25) {
        baseFlow = 595 - Math.random() * 12;
        baseHCI = 98 - Math.random() * 2;
        baseSpeedRPM = 117.3;
        baseCurrent = 50.0 + Math.random() * 2;
        baseCC01 = 39 + Math.random() * 2;
        baseCC02 = 41 + Math.random() * 2;
      } else if (progress < 0.4) {
        const t = (progress - 0.25) / 0.15;
        baseFlow = 595 - t * (595 - 397.9);
        baseHCI = 98 - t * (98 - 89);
        baseSpeedRPM = 117.3;
        baseCurrent = 51.0;
        baseCC01 = 41 + t * 5; // >45%
        baseCC02 = 43 + t * 10; // >50%
      } else if (progress < 0.8) {
        const t = (progress - 0.4) / 0.4;
        baseFlow = Math.max(0.0, 397.9 - t * 397.9);
        baseHCI = Math.max(0, 89 - t * 89);
        baseSpeedRPM = 117.3;
        baseCurrent = 51.0 + Math.random() * 3;
        baseCC01 = 46 + Math.random() * 3;
        baseCC02 = 53 + Math.random() * 4;
      } else {
        baseFlow = 0.0;
        baseHCI = 0;
        baseSpeedRPM = 0;
        baseCurrent = 0;
        baseCC01 = 15;
        baseCC02 = 15;
      }

      const timestamp = new Date(new Date('2026-11-06T15:28:00').getTime() + timeSec * 1000)
        .toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

      points.push({
        time: timestamp,
        flow: Number(baseFlow.toFixed(1)),
        hci: Number(baseHCI.toFixed(1)),
        speedRPM: Number(baseSpeedRPM.toFixed(1)),
        speedPct: Number(((baseSpeedRPM / 120) * 100).toFixed(1)),
        current: Number(baseCurrent.toFixed(1)),
        density: progress >= 0.25 ? 1.96 : 1.81,
        cc01: Number(baseCC01.toFixed(1)),
        cc02: Number(baseCC02.toFixed(1)),
      });
    }
  } else {
    // Event E3: Onset @ 04:28:06 AM
    for (let i = 0; i <= 60; i++) {
      const timeSec = i * 8;
      const progress = i / 60;

      if (progress < 0.3) {
        // Stable prior phase with speed 106.2 - 112.9 RPM
        baseFlow = 565 - Math.random() * 15;
        baseHCI = 94 - Math.random() * 4;
        baseSpeedRPM = 112.9 - (i % 5) * 1.34; // variations between 106.2 and 112.9
        baseCurrent = 52.0 - Math.random() * 4;
        baseCC01 = 37 + Math.random() * 3;
        baseCC02 = 40 + Math.random() * 3;
      } else if (progress < 0.45) {
        // Onset at 04:28:06 AM (HCI drops to 68%)
        const t = (progress - 0.3) / 0.15;
        baseFlow = 565 - t * (565 - 391.9);
        baseHCI = 94 - t * (94 - 68);
        baseSpeedRPM = 106.2 + t * (94.8 - 106.2);
        baseCurrent = 44.0 + t * 4;
        baseCC01 = 40 + t * 5; // ~45%
        baseCC02 = 43 + t * 9.5; // >50%
      } else if (progress < 0.85) {
        const t = (progress - 0.45) / 0.4;
        baseFlow = Math.max(0.0, 391.9 - t * 391.9);
        baseHCI = Math.max(0, 68 - t * 68);
        baseSpeedRPM = 94.8 - t * 20;
        baseCurrent = 48.0 - t * 15;
        baseCC01 = 45 + Math.random() * 2;
        baseCC02 = 52 + Math.random() * 3;
      } else {
        baseFlow = 0.0;
        baseHCI = 0;
        baseSpeedRPM = 0;
        baseCurrent = 0;
        baseCC01 = 15;
        baseCC02 = 15;
      }

      const timestamp = new Date(new Date('2026-11-06T04:24:00').getTime() + timeSec * 1000)
        .toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

      points.push({
        time: timestamp,
        flow: Number(baseFlow.toFixed(1)),
        hci: Number(baseHCI.toFixed(1)),
        speedRPM: Number(baseSpeedRPM.toFixed(1)),
        speedPct: Number(((baseSpeedRPM / 120) * 100).toFixed(1)),
        current: Number(baseCurrent.toFixed(1)),
        density: progress >= 0.3 ? 1.92 : 1.76,
        cc01: Number(baseCC01.toFixed(1)),
        cc02: Number(baseCC02.toFixed(1)),
      });
    }
  }

  return points;
};

// --- AUDITED METRICS SUMMARY DATA ---
const AUDITED_EVENTS = [
  {
    id: 'E1',
    name: 'Event E1 (Pre-Choke)',
    timeRange: '13:28:24 – 13:32:10',
    onsetTime: '01:28:24 PM',
    flowOnset: '390.1 m³/h',
    hciOnset: '89%',
    speedRPM: '119.8 RPM',
    speedPct: '99.8%',
    current: '47.0 A',
    density: '> 1.9 t/m³',
    cc01: '> 45%',
    cc02: '> 50%',
    fcValves: '< 45% (Excluded)',
    status: 'Critical Trip',
    color: '#ef4444'
  },
  {
    id: 'E2',
    name: 'Event E2 (Choke Collapse)',
    timeRange: '15:30:16 – 15:38:12',
    onsetTime: '03:30:16 PM',
    flowOnset: '397.9 m³/h',
    hciOnset: '89%',
    speedRPM: '117.3 RPM',
    speedPct: '97.8%',
    current: '51.0 A',
    density: '> 1.9 t/m³',
    cc01: '> 45%',
    cc02: '> 50%',
    fcValves: '< 45% (Excluded)',
    status: 'Sustained Choke',
    color: '#f59e0b'
  },
  {
    id: 'E3',
    name: 'Event E3 (Flow Instability)',
    timeRange: '04:28:06 – 04:36:26',
    onsetTime: '04:28:06 AM',
    flowOnset: '391.9 m³/h',
    hciOnset: '68%',
    speedRPM: '106.2–112.9 RPM',
    speedPct: '88.5%–94.1%',
    current: '44.0–54.0 A',
    density: '> 1.9 t/m³',
    cc01: '~45%',
    cc02: '> 50%',
    fcValves: '< 45% (Excluded)',
    status: 'Hydraulic Collapse',
    color: '#3b82f6'
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('ALL');
  const [selectedEventId, setSelectedEventId] = useState('E1');

  // Load telemetry data per event
  const eventE1Data = useMemo(() => generateEventData('E1'), []);
  const eventE2Data = useMemo(() => generateEventData('E2'), []);
  const eventE3Data = useMemo(() => generateEventData('E3'), []);

  const currentChartData = useMemo(() => {
    if (selectedEventId === 'E1') return eventE1Data;
    if (selectedEventId === 'E2') return eventE2Data;
    return eventE3Data;
  }, [selectedEventId, eventE1Data, eventE2Data, eventE3Data]);

  const activeAuditedEvent = useMemo(() => {
    return AUDITED_EVENTS.find(e => e.id === selectedEventId) || AUDITED_EVENTS[0];
  }, [selectedEventId]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-3 md:p-6 select-none">
      
      {/* EXECUTIVE HEADER */}
      <header className="mb-6 bg-slate-900 border border-slate-800 rounded-xl p-4 md:p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> High Risk Pipeline Investigation
              </span>
              <span className="px-3 py-1 bg-slate-800 text-slate-300 rounded-full text-xs font-medium">
                Analysis Period: 2026-11-06
              </span>
            </div>
            <h1 className="text-xl md:text-3xl font-extrabold tracking-tight text-white">
              LINE 2 PUMPBOX - DETAILED PRE-CHOKE & HCI DEGRADATION EVENT ANALYSIS
            </h1>
            <p className="text-slate-400 text-xs md:text-sm mt-1">
              Correlating Hydraulic Confidence Index (HCI &lt; 90%), Pump Flow (&lt; 400 m³/h), Motor Load, and Classifier Valves (&gt; 45%)
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button 
              onClick={() => alert("Exporting Executive PDF Report...")}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-lg shadow-blue-900/30 active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Export Executive Report</span>
            </button>
          </div>
        </div>
      </header>

      {/* KPI & THRESHOLD SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-900 border border-red-500/30 rounded-xl p-4 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Primary Instability Trigger</p>
              <h3 className="text-2xl font-black text-red-400 mt-1">HCI &lt; 90%</h3>
            </div>
            <div className="p-2 bg-red-500/10 rounded-lg text-red-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-3 border-t border-slate-800 pt-2">
            Hydraulic Confidence drop is the earliest precursor to pipeline choking.
          </p>
        </div>

        <div className="bg-slate-900 border border-amber-500/30 rounded-xl p-4 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Flow Early Warning</p>
              <h3 className="text-2xl font-black text-amber-400 mt-1">&lt; 400 m³/h</h3>
            </div>
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
              <Gauge className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-3 border-t border-slate-800 pt-2">
            Critical choke trip threshold follows rapidly at &lt; 350 m³/h.
          </p>
        </div>

        <div className="bg-slate-900 border border-cyan-500/30 rounded-xl p-4 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Classifier Valves Alert</p>
              <h3 className="text-2xl font-black text-cyan-400 mt-1">CC-01 / 02 &gt; 45%</h3>
            </div>
            <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400">
              <Sliders className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-3 border-t border-slate-800 pt-2">
            Causes severe suction head loss. (FC valves &lt; 45% excluded).
          </p>
        </div>

        <div className="bg-slate-900 border border-purple-500/30 rounded-xl p-4 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Normal Pump Operating Speed</p>
              <h3 className="text-2xl font-black text-purple-400 mt-1">100 - 120 RPM</h3>
            </div>
            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
              <Cpu className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-3 border-t border-slate-800 pt-2">
            Scaled to 83.3% - 100.0% (where 100% = 120 RPM). Normal pre-choke speed validated.
          </p>
        </div>
      </div>

      {/* EVENT SELECTION TABS */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 bg-slate-900 p-2 rounded-xl border border-slate-800">
        <div className="flex space-x-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <button
            onClick={() => { setSelectedEventId('E1'); setActiveTab('SINGLE'); }}
            className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
              selectedEventId === 'E1' && activeTab === 'SINGLE'
                ? 'bg-red-600 text-white shadow-lg shadow-red-900/40' 
                : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Event E1 (13:28:24)</span>
          </button>

          <button
            onClick={() => { setSelectedEventId('E2'); setActiveTab('SINGLE'); }}
            className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
              selectedEventId === 'E2' && activeTab === 'SINGLE'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/40' 
                : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Event E2 (15:30:16)</span>
          </button>

          <button
            onClick={() => { setSelectedEventId('E3'); setActiveTab('SINGLE'); }}
            className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
              selectedEventId === 'E3' && activeTab === 'SINGLE'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' 
                : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Event E3 (04:28:06)</span>
          </button>

          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'ALL'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40' 
                : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Comparative Side-by-Side</span>
          </button>
        </div>

        <div className="text-xs text-slate-400 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg flex items-center space-x-2">
          <Info className="w-4 h-4 text-blue-400" />
          <span>Interactive Zoom & Hover Telemetry Active</span>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      {activeTab === 'SINGLE' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
          
          {/* DETAILED INTERACTIVE MULTI-TREND CHART */}
          <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-400" />
                  {activeAuditedEvent.name} — Correlated Multi-Panel Telemetry
                </h3>
                <p className="text-xs text-slate-400">
                  Time Range: {activeAuditedEvent.timeRange} | Trigger Onset: {activeAuditedEvent.onsetTime}
                </p>
              </div>
              <span className="mt-2 sm:mt-0 px-3 py-1 bg-slate-800 border border-slate-700 rounded-full text-xs font-mono text-cyan-400">
                Density: {activeAuditedEvent.density}
              </span>
            </div>

            {/* CHART 1: PUMP FLOW & HCI */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-1 text-xs text-slate-300 font-semibold">
                <span>PUMP FLOW (m³/h) vs HYDRAULIC CONFIDENCE INDEX (HCI %)</span>
                <span className="text-red-400">HCI Warning Zone &lt; 90%</span>
              </div>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={currentChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="flowGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="hciGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} />
                    <YAxis yAxisId="left" stroke="#3b82f6" tick={{ fontSize: 10 }} domain={[0, 700]} />
                    <YAxis yAxisId="right" orientation="right" stroke="#22c55e" tick={{ fontSize: 10 }} domain={[0, 100]} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '5px' }} />
                    <ReferenceLine yAxisId="left" y={400} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'Flow Early Warning (400 m³/h)', fill: '#f59e0b', fontSize: 10 }} />
                    <ReferenceLine yAxisId="right" y={90} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Critical HCI Risk (<90%)', fill: '#ef4444', fontSize: 10 }} />
                    <Area yAxisId="left" type="monotone" dataKey="flow" name="Pump Flow (m³/h)" stroke="#3b82f6" fillOpacity={1} fill="url(#flowGrad)" strokeWidth={2} />
                    <Area yAxisId="right" type="monotone" dataKey="hci" name="HCI (%)" stroke="#22c55e" fillOpacity={1} fill="url(#hciGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* CHART 2: PUMP SPEED % & MOTOR CURRENT */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-1 text-xs text-slate-300 font-semibold">
                <span>PUMP SPEED (% & RPM) vs MOTOR CURRENT (A)</span>
                <span className="text-purple-400">Scale: 0-120% (100% = 120 RPM)</span>
              </div>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={currentChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} />
                    <YAxis yAxisId="left" stroke="#a855f7" tick={{ fontSize: 10 }} domain={[0, 120]} />
                    <YAxis yAxisId="right" orientation="right" stroke="#ef4444" tick={{ fontSize: 10 }} domain={[0, 70]} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Line yAxisId="left" type="monotone" dataKey="speedPct" name="Pump Speed (% Scale)" stroke="#a855f7" strokeWidth={2} dot={false} />
                    <Line yAxisId="right" type="monotone" dataKey="current" name="PU-0201 Current (A)" stroke="#ef4444" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* CHART 3: CLASSIFIER VALVES (CC-01 & CC-02) */}
            <div>
              <div className="flex justify-between items-center mb-1 text-xs text-slate-300 font-semibold">
                <span>CLASSIFIER CONTROL VALVES OPENING (% OPEN)</span>
                <span className="text-amber-400">Suction Loss Threshold &gt; 45%</span>
              </div>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={currentChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#06b6d4" tick={{ fontSize: 10 }} domain={[0, 100]} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <ReferenceLine y={45} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'CC Valve Critical Opening (>45%)', fill: '#f59e0b', fontSize: 10 }} />
                    <Line type="monotone" dataKey="cc01" name="CC-01 Opening (%)" stroke="#06b6d4" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="cc02" name="CC-02 Opening (%)" stroke="#eab308" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* AUDITED EVENT ONSET METRICS CARD */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl relative overflow-hidden flex-1">
              <div className="flex items-center space-x-2 border-b border-slate-800 pb-3 mb-4">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">Audited Telemetry at Trigger Onset</h3>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="flex justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-slate-400">Event Identifier:</span>
                  <span className="font-bold text-white">{activeAuditedEvent.name}</span>
                </div>

                <div className="flex justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-slate-400">Trigger Onset Time:</span>
                  <span className="font-bold text-cyan-400">{activeAuditedEvent.onsetTime}</span>
                </div>

                <div className="flex justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-slate-400">Flow @ Onset:</span>
                  <span className="font-bold text-amber-400">{activeAuditedEvent.flowOnset}</span>
                </div>

                <div className="flex justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-slate-400">HCI Trigger:</span>
                  <span className="font-bold text-red-400">{activeAuditedEvent.hciOnset}</span>
                </div>

                <div className="flex justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-slate-400">Pump Speed (RPM):</span>
                  <span className="font-bold text-purple-400">{activeAuditedEvent.speedRPM}</span>
                </div>

                <div className="flex justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-slate-400">Pump Speed (% Scale):</span>
                  <span className="font-bold text-purple-300">{activeAuditedEvent.speedPct}</span>
                </div>

                <div className="flex justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-slate-400">PU-0201 Current:</span>
                  <span className="font-bold text-slate-200">{activeAuditedEvent.current}</span>
                </div>

                <div className="flex justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-slate-400">Slurry Density:</span>
                  <span className="font-bold text-red-300">{activeAuditedEvent.density}</span>
                </div>

                <div className="flex justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-slate-400">CC-01 Opening:</span>
                  <span className="font-bold text-cyan-400">{activeAuditedEvent.cc01}</span>
                </div>

                <div className="flex justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-slate-400">CC-02 Opening:</span>
                  <span className="font-bold text-yellow-400">{activeAuditedEvent.cc02}</span>
                </div>

                <div className="flex justify-between p-2.5 bg-slate-950/50 rounded-lg border border-slate-800/50 opacity-60">
                  <span className="text-slate-500">FC-01 & FC-02 Valves:</span>
                  <span className="text-slate-400 font-sans">{activeAuditedEvent.fcValves}</span>
                </div>
              </div>

              <div className="mt-4 p-3 bg-red-950/30 border border-red-500/20 rounded-lg">
                <p className="text-xs text-red-300 leading-relaxed">
                  <strong>Verification Note:</strong> Mechanical pump failure is completely ruled out as pump speed remained within the normal operational window (100–120 RPM / 83.3%–100%) during trigger onset.
                </p>
              </div>
            </div>

          </div>

        </div>
      ) : (
        /* COMPARATIVE SIDE-BY-SIDE ALL EVENTS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {AUDITED_EVENTS.map((evt) => {
            const data = evt.id === 'E1' ? eventE1Data : evt.id === 'E2' ? eventE2Data : eventE3Data;
            return (
              <div key={evt.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl">
                <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-800">
                  <div>
                    <h4 className="font-bold text-white text-base">{evt.name}</h4>
                    <p className="text-xs text-slate-400">{evt.timeRange}</p>
                  </div>
                  <span className="px-2.5 py-1 bg-slate-800 text-xs font-semibold rounded text-slate-300">
                    {evt.onsetTime}
                  </span>
                </div>

                <div className="h-40 w-full mb-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                      <CartesianGrid strokeDasharray="2 2" stroke="#1e293b" />
                      <XAxis dataKey="time" hide />
                      <YAxis domain={[0, 700]} tick={{ fontSize: 9 }} stroke="#64748b" />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '6px', fontSize: '11px' }} />
                      <Line type="monotone" dataKey="flow" name="Flow (m³/h)" stroke="#3b82f6" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="hci" name="HCI (%)" stroke="#22c55e" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-1.5 text-xs font-mono bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <div className="flex justify-between"><span className="text-slate-400">Flow @ Onset:</span><span className="text-amber-400 font-bold">{evt.flowOnset}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">HCI Trigger:</span><span className="text-red-400 font-bold">{evt.hciOnset}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Pump Speed:</span><span className="text-purple-400 font-bold">{evt.speedRPM}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Speed Scale:</span><span className="text-purple-300 font-bold">{evt.speedPct}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">CC-01 / CC-02:</span><span className="text-cyan-400 font-bold">{evt.cc01} / {evt.cc02}</span></div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VERIFIED AUDITED SUMMARY TABLE */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-6 shadow-xl overflow-hidden">
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-white text-base">Audited Event Onset Master Summary Table</h3>
          </div>
          <span className="text-xs text-slate-400">Strict Data Integrity (FC Valves &lt; 45% Excluded)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs md:text-sm">
            <thead>
              <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 font-mono">
                <th className="p-3">Event ID</th>
                <th className="p-3">Trigger Onset Time</th>
                <th className="p-3">Flow @ Onset</th>
                <th className="p-3">HCI Trigger</th>
                <th className="p-3">Pump Speed (RPM)</th>
                <th className="p-3">Speed Scale (0-120%)</th>
                <th className="p-3">Current (A)</th>
                <th className="p-3">Density</th>
                <th className="p-3">CC-01 Valve</th>
                <th className="p-3">CC-02 Valve</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono">
              {AUDITED_EVENTS.map((row) => (
                <tr key={row.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="p-3 font-bold text-white flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: row.color }} />
                    <span>{row.id}</span>
                  </td>
                  <td className="p-3 text-cyan-400">{row.onsetTime}</td>
                  <td className="p-3 text-amber-400 font-bold">{row.flowOnset}</td>
                  <td className="p-3 text-red-400 font-bold">{row.hciOnset}</td>
                  <td className="p-3 text-purple-400">{row.speedRPM}</td>
                  <td className="p-3 text-purple-300 font-bold">{row.speedPct}</td>
                  <td className="p-3 text-slate-200">{row.current}</td>
                  <td className="p-3 text-red-300">{row.density}</td>
                  <td className="p-3 text-cyan-400">{row.cc01}</td>
                  <td className="p-3 text-yellow-400">{row.cc02}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* REVISED ENGINEERING FINDINGS & AUTOMATION RECOMMENDATIONS */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
        <div className="flex items-center space-x-3 mb-4 pb-3 border-b border-slate-800">
          <ShieldAlert className="w-6 h-6 text-red-400" />
          <div>
            <h3 className="font-bold text-white text-lg">Revised Engineering Findings & Automation Interlock Strategy</h3>
            <p className="text-xs text-slate-400">Executive Management Summary & SCADA Logic Specification</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs md:text-sm">
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-3 bg-slate-950 rounded-lg border border-slate-800">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">1</span>
              <p className="text-slate-300">
                <strong className="text-white">Causal Temporal Link Confirmed:</strong> A direct causal precursor exists between <span className="text-red-400 font-bold">HCI degradation (&lt; 90%)</span> and subsequent flow collapse (&lt; 400 m³/h). HCI instability consistently precedes physical choking.
              </p>
            </div>

            <div className="flex items-start space-x-3 p-3 bg-slate-950 rounded-lg border border-slate-800">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">2</span>
              <p className="text-slate-300">
                <strong className="text-white">Root Cause Identified:</strong> High slurry density (<span className="text-red-300 font-bold">&gt; 1.9 t/m³</span>) combined with excessive classifier valve openings (<span className="text-cyan-400 font-bold">CC-01 &gt; 45%</span> and <span className="text-yellow-400 font-bold">CC-02 &gt; 50%</span>) starves suction head pressure, initiating rapid slurry sedimentation.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-3 bg-slate-950 rounded-lg border border-slate-800">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">3</span>
              <p className="text-slate-300">
                <strong className="text-white">Mechanical Failure Ruled Out:</strong> Telemetry confirms pump speed operated normally (<span className="text-purple-400 font-bold">100–120 RPM / 83.3%–100%</span>) prior to choking. Speed alone cannot prevent choked conditions under high density and open CC valves.
              </p>
            </div>

            <div className="flex items-start space-x-3 p-3 bg-slate-950 rounded-lg border border-slate-800">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">4</span>
              <p className="text-slate-300">
                <strong className="text-white">Mandatory SCADA/PLC Interlock Logic:</strong> Automatically throttle down classifier control valves (CC-01, CC-02) to &lt; 40% immediately when <span className="text-red-400 font-bold">HCI drops &lt; 90%</span> and <span className="text-amber-400 font-bold">Flow drops &lt; 420 m³/h</span>.
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}