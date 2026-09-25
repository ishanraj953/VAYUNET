import React, { useState, useEffect, useRef } from 'react';
import { 
  AlertTriangle, 
  Search, 
  Filter, 
  ShieldAlert, 
  Radio, 
  Flame, 
  BellRing, 
  RotateCcw, 
  Download, 
  Volume2, 
  VolumeX, 
  Send, 
  CheckCircle2, 
  Building2, 
  HeartPulse, 
  Wind, 
  Thermometer, 
  Droplets, 
  Activity, 
  Sparkles, 
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Megaphone,
  X
} from 'lucide-react';
import api from '../../api/axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function LiveEarlyWarningCommandPage() {
  const [streamData, setStreamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [streaming, setStreaming] = useState(true);
  const [lastUpdated, setLastUpdated] = useState('');
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState('All');
  const [selectedSeverity, setSelectedSeverity] = useState('All');
  const [selectedGrap, setSelectedGrap] = useState('All');

  // Interactive Broadcast Modal
  const [activeBroadcastModal, setActiveBroadcastModal] = useState(null);
  const [broadcastSubmitting, setBroadcastSubmitting] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState(null);

  // Audio Siren state
  const [audioSirenEnabled, setAudioSirenEnabled] = useState(false);

  const fetchLiveStream = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await api.get('/live-alerts/stream', {
        params: {
          state: selectedState,
          severity: selectedSeverity
        }
      });
      setStreamData(res.data);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Failed to fetch live alerts stream:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveStream();
  }, [selectedState, selectedSeverity]);

  // Real-time live polling every 4 seconds
  useEffect(() => {
    let timer = null;
    if (streaming) {
      timer = setInterval(() => {
        fetchLiveStream(true);
      }, 4000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [streaming, selectedState, selectedSeverity]);

  const handleBroadcastDispatch = async (alertItem) => {
    setBroadcastSubmitting(true);
    try {
      const res = await api.post('/live-alerts/broadcast', {
        alert_id: alertItem.id,
        location: `${alertItem.city}, ${alertItem.state}`,
        severity: alertItem.severity,
        channels: ["State Disaster Management Authority (SDMA)", "Chief Medical Officers (ICU Dispatch)", "Emergency SMS Public Gateway"]
      });
      setBroadcastResult(res.data);
    } catch (err) {
      console.error('Failed to dispatch emergency broadcast:', err);
    } finally {
      setBroadcastSubmitting(false);
    }
  };

  // Export PDF Emergency Alert Bulletin
  const exportAlertBulletinPdf = () => {
    if (!streamData) return;
    const doc = new jsPDF('p', 'pt', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();

    // Red Emergency Header Banner
    doc.setFillColor(153, 27, 27); // Dark Red (#991B1B)
    doc.rect(0, 0, pageWidth, 85, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('NATIONAL CLEAN AIR EMERGENCY COMMAND BULLETIN', 40, 36);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(254, 202, 202);
    doc.text('Real-Time Statutory Alert Broadcast & GRAP Stage IV Mitigation Directive', 40, 52);

    doc.setFontSize(9);
    doc.setTextColor(253, 230, 138);
    doc.text(`Issued: ${new Date().toLocaleString()} | Classification: High-Priority Emergency`, 40, 68);

    // Summary Section
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('1. NATIONAL AMBIENT SURVEILLANCE STATUS', 40, 110);

    autoTable(doc, {
      startY: 120,
      head: [['Surveillance Metric', 'Active Count', 'Statutory Response Action']],
      body: [
        ['Critical Emergency Sirens (AQI >= 300)', `${streamData.critical_emergency_sirens || 0} Hotspots`, 'Mandatory GRAP-IV Protocol Activation'],
        ['Severe Alert Nodes (AQI 200-299)', `${streamData.severe_warning_nodes || 0} Stations`, 'Enforce Mechanized Sweeping & Misting'],
        ['Moderate Watch Nodes (AQI 100-199)', `${streamData.moderate_watch_nodes || 0} Stations`, 'Fugitive Dust & Traffic Interventions'],
        ['Total Monitored Stations Reporting', `${streamData.total_reporting_nodes || 0} CAAQMS Nodes`, '100% Real-Time Response Rate']
      ],
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 5 },
      headStyles: { fillColor: [153, 27, 27], textColor: 255 }
    });

    // Alert Nodes Table
    const currY = doc.lastAutoTable.finalY + 15;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('2. ACTIVE CRITICAL & SEVERE ALERT STATIONS', 40, currY);

    const alertRows = (streamData.alerts || []).slice(0, 15).map(a => [
      `${a.station_name} (${a.city})`,
      `${a.aqi} AQI`,
      `PM2.5: ${a.pm25} | PM10: ${a.pm10}`,
      a.action_code,
      a.hospital_surge,
      a.severity
    ]);

    autoTable(doc, {
      startY: currY + 10,
      head: [['Station / City', 'Live AQI', 'Key Pollutants', 'GRAP Stage', 'Hospital Surge', 'Alert Status']],
      body: alertRows,
      theme: 'striped',
      styles: { fontSize: 8.5, cellPadding: 4 },
      headStyles: { fillColor: [30, 41, 59], textColor: 255 }
    });

    const finalY = doc.lastAutoTable.finalY + 20;
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'italic');
    doc.text(
      'Issued by VayuNet India Real-Time Atmospheric Surveillance & Public Health Emergency Command.',
      40,
      finalY > 780 ? 780 : finalY
    );

    doc.save(`Air_Quality_Emergency_Alert_Bulletin_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const alerts = streamData?.alerts || [];
  const filteredAlerts = alerts.filter(a => {
    const matchSearch = a.station_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        a.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        a.state.toLowerCase().includes(searchTerm.toLowerCase());
    const matchGrap = selectedGrap === 'All' || a.action_code === selectedGrap;
    return matchSearch && matchGrap;
  });

  return (
    <div className="space-y-6">
      {/* Command Center Header */}
      <div className="card-white rounded-2xl p-6 border border-[#EBE3D5] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-3.5 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl text-white shadow-md shadow-red-200 animate-pulse">
            <Radio className="w-7 h-7 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-stone-900 uppercase tracking-tight">
                Live Early Warning & Emergency Alert Command Center
              </h2>
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-red-100 text-red-800 border border-red-300">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
                Live Telemetry Stream
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              High-frequency real-time anomaly sirens, GRAP emergency triggers, hospital surge alerts, and automated public broadcast dispatch.
            </p>
          </div>
        </div>

        {/* Command Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setAudioSirenEnabled(!audioSirenEnabled)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition border cursor-pointer ${
              audioSirenEnabled 
                ? 'bg-red-50 text-red-800 border-red-300' 
                : 'bg-stone-100 text-stone-600 border-stone-300'
            }`}
            title="Toggle Audio Siren Alert"
          >
            {audioSirenEnabled ? <Volume2 className="w-3.5 h-3.5 text-red-600" /> : <VolumeX className="w-3.5 h-3.5" />}
            {audioSirenEnabled ? 'Audio Siren ON' : 'Audio Siren Muted'}
          </button>

          <button
            onClick={() => setStreaming(!streaming)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition border cursor-pointer ${
              streaming 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                : 'bg-stone-100 text-stone-600 border-stone-300'
            }`}
          >
            <Activity className={`w-3.5 h-3.5 ${streaming ? 'text-emerald-600 animate-spin' : ''}`} />
            {streaming ? 'Live Stream Active (4s)' : 'Stream Paused'}
          </button>

          <button
            onClick={() => fetchLiveStream(false)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-stone-700 bg-[#FFFDF5] hover:bg-amber-50 border border-[#E0D5BE] transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Sync
          </button>

          <button
            onClick={exportAlertBulletinPdf}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-sm transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Download Emergency Bulletin (PDF)
          </button>
        </div>
      </div>

      {/* KPI Alert Status Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Critical Emergency Hotspots */}
        <div className="card-white rounded-2xl p-5 border border-red-200 bg-red-50/30 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-red-800 uppercase tracking-wider">Critical Emergency Sirens</span>
            <div className="p-2 rounded-xl bg-red-100 text-red-700 animate-pulse">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-red-700 font-mono">
              {streamData?.critical_emergency_sirens || 0}
            </span>
            <span className="text-xs font-bold text-red-600">AQI 300+ Hazardous</span>
          </div>
          <p className="text-[11px] text-red-700 font-medium">Mandatory GRAP-IV Protocol Triggered</p>
        </div>

        {/* Severe Warning Nodes */}
        <div className="card-white rounded-2xl p-5 border border-orange-200 bg-orange-50/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-orange-800 uppercase tracking-wider">Severe Alert Nodes</span>
            <div className="p-2 rounded-xl bg-orange-100 text-orange-700">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-orange-700 font-mono">
              {streamData?.severe_warning_nodes || 0}
            </span>
            <span className="text-xs font-bold text-orange-600">AQI 200–299</span>
          </div>
          <p className="text-[11px] text-orange-700 font-medium">Elevated ICU & Pediatric Pre-Alerts</p>
        </div>

        {/* Moderate Watch Nodes */}
        <div className="card-white rounded-2xl p-5 border border-amber-200 bg-amber-50/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-amber-800 uppercase tracking-wider">Moderate Watch Nodes</span>
            <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-700 font-mono">
              {streamData?.moderate_watch_nodes || 0}
            </span>
            <span className="text-xs font-bold text-amber-600">AQI 100–199</span>
          </div>
          <p className="text-[11px] text-amber-700 font-medium">Dust Suppression & Monitoring</p>
        </div>

        {/* Live Grid Health */}
        <div className="card-white rounded-2xl p-5 border border-emerald-200 bg-emerald-50/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-emerald-800 uppercase tracking-wider">Telemetry Stream Health</span>
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
              <BellRing className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-700 font-mono">
              {streamData?.total_reporting_nodes || 0} Nodes
            </span>
            <span className="text-xs font-bold text-emerald-600">Active</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-800 font-bold">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>100% Ingest Sync • Last: {lastUpdated || 'Live'}</span>
          </div>
        </div>
      </div>

      {/* Filter & Live Search Bar */}
      <div className="card-white rounded-2xl p-4 border border-[#EBE3D5] flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search station, city, or hospital..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-[#FFFDF5] border border-[#E0D5BE] rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-500 w-60"
            />
          </div>

          {/* State Filter */}
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="px-3 py-1.5 bg-[#FFFDF5] border border-[#E0D5BE] rounded-xl text-xs font-bold text-stone-800 focus:outline-none"
          >
            <option value="All">All 36 States & UTs</option>
            <option value="Delhi">Delhi NCR</option>
            <option value="Uttar Pradesh">Uttar Pradesh</option>
            <option value="Maharashtra">Maharashtra</option>
            <option value="Karnataka">Karnataka</option>
            <option value="West Bengal">West Bengal</option>
            <option value="Bihar">Bihar</option>
            <option value="Tamil Nadu">Tamil Nadu</option>
            <option value="Gujarat">Gujarat</option>
            <option value="Rajasthan">Rajasthan</option>
            <option value="Punjab">Punjab</option>
            <option value="Haryana">Haryana</option>
            <option value="Telangana">Telangana</option>
            <option value="Madhya Pradesh">Madhya Pradesh</option>
            <option value="Kerala">Kerala</option>
          </select>

          {/* Severity Filter */}
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="px-3 py-1.5 bg-[#FFFDF5] border border-[#E0D5BE] rounded-xl text-xs font-bold text-stone-800 focus:outline-none"
          >
            <option value="All">All Severity Levels</option>
            <option value="Emergency">Critical Emergency (AQI 300+)</option>
            <option value="Severe">Severe Alert (AQI 200-299)</option>
            <option value="Moderate">Moderate Watch (AQI 100-199)</option>
            <option value="Normal">Normal Safe (AQI &lt; 100)</option>
          </select>

          {/* GRAP Filter */}
          <select
            value={selectedGrap}
            onChange={(e) => setSelectedGrap(e.target.value)}
            className="px-3 py-1.5 bg-[#FFFDF5] border border-[#E0D5BE] rounded-xl text-xs font-bold text-stone-800 focus:outline-none"
          >
            <option value="All">All GRAP Action Stages</option>
            <option value="GRAP-IV">Stage IV (Severe+ Emergency)</option>
            <option value="GRAP-II">Stage II (Very Poor)</option>
            <option value="GRAP-I">Stage I (Poor)</option>
            <option value="SAFE">Stage 0 (Safe / Normal)</option>
          </select>
        </div>

        <span className="text-xs font-bold text-stone-500">
          Showing <strong className="text-stone-900 font-mono">{filteredAlerts.length}</strong> active monitoring records
        </span>
      </div>

      {/* Live Alert Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-16 flex flex-col items-center justify-center space-y-3">
            <div className="w-10 h-10 border-4 border-red-300 border-t-red-600 rounded-full animate-spin"></div>
            <p className="text-xs font-bold text-stone-600">Syncing Live Early Warning Sirens across India...</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isCrit = alert.aqi >= 300;
            const isSev = alert.aqi >= 200 && alert.aqi < 300;

            return (
              <div 
                key={alert.id}
                className={`card-white rounded-2xl p-5 border transition-all hover:shadow-lg space-y-4 relative ${
                  isCrit ? 'border-red-300 bg-red-50/20' : (isSev ? 'border-orange-200' : 'border-[#EBE3D5]')
                }`}
              >
                {/* Card Top: Location & Severity Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${isCrit ? 'bg-red-600 animate-ping' : (isSev ? 'bg-orange-500' : 'bg-emerald-500')}`}></span>
                      <h3 className="text-sm font-black text-stone-900 leading-tight">
                        {alert.station_name}
                      </h3>
                    </div>
                    <p className="text-xs text-stone-500 mt-0.5">
                      {alert.city}, {alert.state} • <span className="text-stone-400 font-mono">{alert.zone}</span>
                    </p>
                  </div>

                  <span 
                    className="px-2.5 py-1 rounded-lg text-xs font-black text-white shrink-0 shadow-xs font-mono"
                    style={{ backgroundColor: alert.badge_color }}
                  >
                    AQI {alert.aqi}
                  </span>
                </div>

                {/* Pollutant Micro-Sensors */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-xl bg-stone-50 border border-stone-200">
                    <span className="text-[10px] text-stone-400 font-bold block">PM2.5</span>
                    <strong className="text-stone-900 font-mono text-sm">{alert.pm25}</strong>
                    <span className="text-[9px] text-stone-400 block">µg/m³</span>
                  </div>
                  <div className="p-2 rounded-xl bg-stone-50 border border-stone-200">
                    <span className="text-[10px] text-stone-400 font-bold block">PM10</span>
                    <strong className="text-stone-900 font-mono text-sm">{alert.pm10}</strong>
                    <span className="text-[9px] text-stone-400 block">µg/m³</span>
                  </div>
                  <div className="p-2 rounded-xl bg-stone-50 border border-stone-200">
                    <span className="text-[10px] text-stone-400 font-bold block">NO2</span>
                    <strong className="text-stone-900 font-mono text-sm">{alert.no2}</strong>
                    <span className="text-[9px] text-stone-400 block">µg/m³</span>
                  </div>
                </div>

                {/* GRAP Directive & Public Health Protocol */}
                <div className="p-3 rounded-xl bg-[#FFFDF5] border border-[#F2E8D5] space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-900 flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                      Statutory Directive:
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                      {alert.action_code}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-700 leading-relaxed font-medium">
                    {alert.protocol}
                  </p>
                </div>

                {/* Hospital Pre-Alert & Public Advisory */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-stone-600 text-[11px]">
                    <span className="flex items-center gap-1">
                      <HeartPulse className="w-3.5 h-3.5 text-red-500" /> Hospital Surge Pre-Alert:
                    </span>
                    <strong className="text-red-700 font-bold">{alert.hospital_surge}</strong>
                  </div>
                  <div className="text-[11px] text-stone-500">
                    Nearby Facilities: <span className="font-medium text-stone-800">{alert.hospitals_nearby?.slice(0, 2).join(', ')}</span>
                  </div>
                </div>

                {/* Card Actions: Broadcast Dispatcher Button */}
                <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono text-stone-400">
                    Trajectory: <strong className="text-red-600">{alert.trend}</strong>
                  </span>

                  <button
                    onClick={() => {
                      setActiveBroadcastModal(alert);
                      setBroadcastResult(null);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
                  >
                    <Send className="w-3 h-3" />
                    Dispatch Advisory
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Emergency Broadcast Dispatch Modal */}
      {activeBroadcastModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#EAE0CA] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-red-600 text-white shadow-sm">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-stone-900">
                    Emergency Alert Broadcast Dispatcher
                  </h3>
                  <p className="text-xs text-stone-500">
                    Target: {activeBroadcastModal.city}, {activeBroadcastModal.state} ({activeBroadcastModal.station_name})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveBroadcastModal(null)}
                className="p-1 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            {broadcastResult ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3 animate-in fade-in-50">
                <div className="flex items-center gap-2 text-emerald-900 font-black text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  Emergency Broadcast Dispatched Successfully!
                </div>
                <div className="text-xs text-emerald-800 space-y-1">
                  <p><strong>Broadcast ID:</strong> <span className="font-mono">{broadcastResult.broadcast_id}</span></p>
                  <p><strong>Dispatch Timestamp:</strong> <span className="font-mono">{broadcastResult.dispatched_at}</span></p>
                  <p><strong>Chief Medical Officers:</strong> {broadcastResult.recipients?.chief_medical_officers}</p>
                  <p><strong>Municipal Commissioners:</strong> {broadcastResult.recipients?.municipal_commissioners}</p>
                  <p><strong>Estimated Citizen Reach:</strong> {broadcastResult.recipients?.citizens_reached_est}</p>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-emerald-200 text-[11px] text-stone-700 italic">
                  "{broadcastResult.message}"
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl space-y-1 text-red-900">
                  <div className="flex justify-between items-center font-bold">
                    <span>Active Threshold Breach: AQI {activeBroadcastModal.aqi}</span>
                    <span className="font-black uppercase">{activeBroadcastModal.severity}</span>
                  </div>
                  <p className="text-[11px] text-red-800">
                    Triggering this broadcast will dispatch emergency health advisories to regional hospitals, schools, and municipal disaster authorities.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="font-bold text-stone-800 block">Dispatch Channels:</label>
                  <div className="space-y-1.5 text-stone-700">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded text-red-600 focus:ring-red-500" />
                      <span>District Disaster Management Cell & SDMA SMS Gateway</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded text-red-600 focus:ring-red-500" />
                      <span>Chief Medical Officer (CMO) Emergency ICU Bed Pre-Alert</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded text-red-600 focus:ring-red-500" />
                      <span>District Education Officer (School Shift / Closure Advisory)</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Footer */}
            <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
              <button
                onClick={() => setActiveBroadcastModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-100 cursor-pointer"
              >
                Close
              </button>

              {!broadcastResult && (
                <button
                  onClick={() => handleBroadcastDispatch(activeBroadcastModal)}
                  disabled={broadcastSubmitting}
                  className="flex items-center gap-1.5 px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer disabled:opacity-50"
                >
                  {broadcastSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Dispatching...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Confirm Emergency Dispatch
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
