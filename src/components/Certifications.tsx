import React, { useState, useEffect } from "react";
import { Plus, Trash2, Award, ExternalLink } from "lucide-react";

type Certification = {
  id: number;
  name: string;
  platform: string;
  date: string;
};

export function Certifications() {
  const [certs, setCerts] = useState<Certification[]>([]);
  const [name, setName] = useState("");
  const [platform, setPlatform] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCerts();
  }, []);

  const fetchCerts = async () => {
    const res = await fetch("/api/certifications");
    const data = await res.json();
    setCerts(data);
    setLoading(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !platform) return;
    const res = await fetch("/api/certifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, platform, date }),
    });
    if (res.ok) {
      setName("");
      setPlatform("");
      fetchCerts();
    }
  };

  const handleDelete = async (id: number) => {
    await fetch(`/api/certifications/${id}`, { method: "DELETE" });
    fetchCerts();
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-stone-800">Certifications</h1>
        <p className="text-stone-500">Add your professional certifications and achievements.</p>
      </header>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-1">
            <input
              type="text"
              placeholder="Certification Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-stone-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            />
          </div>
          <div>
            <input
              type="text"
              placeholder="Platform (e.g. Coursera, Udemy)"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="w-full px-4 py-2 border border-stone-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            />
          </div>
          <div>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2 border border-stone-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            />
          </div>
          <button
            type="submit"
            className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
          >
            <Plus size={20} />
            Add Certificate
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {certs.map((cert) => (
          <div
            key={cert.id}
            className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm flex items-start justify-between group hover:shadow-md hover:border-indigo-100 transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="p-4 bg-amber-50 rounded-2xl text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                <Award size={32} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-stone-800">{cert.name}</h3>
                <p className="text-stone-500 font-medium">{cert.platform}</p>
                <p className="text-stone-400 text-sm mt-2">Completed on {new Date(cert.date).toLocaleDateString()}</p>
                <div className="mt-3">
                  <span className="text-[10px] px-2 py-1 bg-stone-100 text-stone-500 rounded-full font-bold uppercase tracking-wider">
                    Status: Self-Declared
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => handleDelete(cert.id)}
              className="text-stone-300 hover:text-red-500 transition-colors p-2"
            >
              <Trash2 size={20} />
            </button>
          </div>
        ))}
        {certs.length === 0 && !loading && (
          <div className="col-span-full text-center py-12 bg-stone-50 rounded-3xl border-2 border-dashed border-stone-200">
            <ExternalLink className="mx-auto text-stone-300 mb-4" size={48} />
            <p className="text-stone-700 font-medium">No certifications added yet.</p>
            <p className="text-stone-500 text-sm mt-1">Earn a certification to validate your skills and improve your readiness score!</p>
          </div>
        )}
      </div>
    </div>
  );
}
