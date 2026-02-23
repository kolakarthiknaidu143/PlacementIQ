import { useState, useEffect } from "react";
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from "recharts";
import { TrendingUp, CheckCircle2, Clock, AlertCircle, Info, Lightbulb } from "lucide-react";

type Stats = {
  totalScore: number;
  breakdown: {
    skills: number;
    projects: number;
    mockTests: number;
    certifications: number;
  };
  counts: {
    skills: number;
    projects: number;
    mockTests: number;
    certifications: number;
  };
};

export function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      });
  }, []);

  if (loading || !stats) {
    return <div className="animate-pulse space-y-8">
      <div className="h-48 bg-stone-200 rounded-2xl w-full"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="h-64 bg-stone-200 rounded-2xl"></div>
        <div className="h-64 bg-stone-200 rounded-2xl"></div>
      </div>
    </div>;
  }

  const pieData = [
    { name: "Skills", value: stats.breakdown.skills, color: "#4f46e5" },
    { name: "Projects", value: stats.breakdown.projects, color: "#10b981" },
    { name: "Mock Tests", value: stats.breakdown.mockTests, color: "#f59e0b" },
    { name: "Certifications", value: stats.breakdown.certifications, color: "#ec4899" },
  ];

  const getStatus = (score: number) => {
    if (score >= 75) return { label: "High", color: "text-emerald-600", bg: "bg-emerald-50", icon: CheckCircle2 };
    if (score >= 41) return { label: "Medium", color: "text-amber-600", bg: "bg-amber-50", icon: Clock };
    return { label: "Low", color: "text-rose-600", bg: "bg-rose-50", icon: AlertCircle };
  };

  const status = getStatus(stats.totalScore);

  const getSuggestions = () => {
    const suggestions = [];
    if (stats.counts.skills < 3) suggestions.push("Add at least 3 technical skills to showcase your expertise.");
    if (stats.counts.projects < 1) suggestions.push("Complete at least 1 project to demonstrate practical application.");
    if (stats.counts.mockTests < 2) suggestions.push("Take more mock tests to improve your aptitude and technical speed.");
    if (stats.counts.certifications < 1) suggestions.push("Earn a certification to validate your skills to employers.");
    
    if (suggestions.length === 0) {
      suggestions.push("Great job! Keep refining your skills and projects to stay competitive.");
    }
    return suggestions;
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-stone-800">Placement Readiness</h1>
        <p className="text-stone-500">Track your progress and prepare for your career.</p>
      </header>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-stone-100 flex flex-col md:flex-row items-center gap-8 hover:shadow-md transition-shadow">
          <div className="relative w-48 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[{ value: stats.totalScore }, { value: 100 - stats.totalScore }]}
                  innerRadius={60}
                  outerRadius={80}
                  startAngle={90}
                  endAngle={450}
                  dataKey="value"
                >
                  <Cell fill={stats.totalScore >= 75 ? "#10b981" : stats.totalScore >= 41 ? "#f59e0b" : "#f43f5e"} />
                  <Cell fill="#f1f5f9" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold text-stone-800">{stats.totalScore}%</span>
              <span className="text-xs text-stone-400 uppercase tracking-wider">Readiness</span>
            </div>
          </div>
          
          <div className="flex-1 space-y-4 text-center md:text-left">
            <div className="relative">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <h2 className="text-2xl font-bold text-stone-800">Overall Score</h2>
                <button 
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                  onClick={() => setShowTooltip(!showTooltip)}
                  className="text-stone-400 hover:text-indigo-600 transition-colors"
                >
                  <Info size={18} />
                </button>
              </div>
              
              {showTooltip && (
                <div className="absolute z-10 mt-2 p-4 bg-stone-800 text-white text-xs rounded-xl shadow-xl w-64 left-1/2 md:left-0 -translate-x-1/2 md:translate-x-0">
                  <p className="font-bold mb-2">Score Calculation:</p>
                  <ul className="space-y-1 opacity-90">
                    <li>• Skills: 30%</li>
                    <li>• Projects: 25%</li>
                    <li>• Mock Tests: 25%</li>
                    <li>• Certifications: 20%</li>
                  </ul>
                </div>
              )}
              
              <p className="text-stone-500 mt-1">Your readiness is currently <span className={`font-semibold ${status.color}`}>{status.label}</span>.</p>
            </div>
            
            <div className="flex flex-col gap-4">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${status.bg} ${status.color} w-fit mx-auto md:mx-0`}>
                <status.icon size={18} />
                <span className="font-medium">{status.label} Readiness Status</span>
              </div>
              
              {/* Legend */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-[10px] uppercase tracking-widest font-bold text-stone-400">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                  <span>0-40% Low</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                  <span>41-70% Med</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span>71-100% High</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-indigo-600 p-8 rounded-3xl text-white shadow-lg shadow-indigo-200 flex flex-col justify-between hover:scale-[1.02] transition-transform">
          <div>
            <TrendingUp size={32} className="mb-4 opacity-80" />
            <h3 className="text-xl font-semibold">Quick Summary</h3>
          </div>
          <div className="space-y-3 mt-6">
            <div className="flex justify-between text-sm">
              <span className="opacity-80">Skills Added</span>
              <span className="font-bold">{stats.counts.skills}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="opacity-80">Projects Completed</span>
              <span className="font-bold">{stats.counts.projects}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="opacity-80">Mock Tests Taken</span>
              <span className="font-bold">{stats.counts.mockTests}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="opacity-80">Certifications</span>
              <span className="font-bold">{stats.counts.certifications}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Suggestions Section */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-100 hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
            <Lightbulb size={24} />
          </div>
          <h3 className="text-xl font-bold text-stone-800">Suggestions to Improve Readiness</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {getSuggestions().map((suggestion, index) => (
            <div key={index} className="flex items-start gap-3 p-4 bg-stone-50 rounded-2xl border border-stone-100">
              <div className="mt-1 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0"></div>
              <p className="text-sm text-stone-600 leading-relaxed">{suggestion}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-100 hover:shadow-md transition-shadow">
          <h3 className="text-xl font-bold text-stone-800 mb-6">Score Breakdown</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pieData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-100 hover:shadow-md transition-shadow">
          <h3 className="text-xl font-bold text-stone-800 mb-6">Weightage Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
