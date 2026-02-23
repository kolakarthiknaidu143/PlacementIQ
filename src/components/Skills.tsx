import React, { useState, useEffect } from "react";
import { Plus, Trash2, Code2, Star } from "lucide-react";

type Skill = {
  id: number;
  name: string;
  level: string;
};

export function Skills() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [name, setName] = useState("");
  const [level, setLevel] = useState("Beginner");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    const res = await fetch("/api/skills");
    const data = await res.json();
    setSkills(data);
    setLoading(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    const res = await fetch("/api/skills", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, level }),
    });
    if (res.ok) {
      setName("");
      fetchSkills();
    }
  };

  const handleDelete = async (id: number) => {
    await fetch(`/api/skills/${id}`, { method: "DELETE" });
    fetchSkills();
  };

  const getLevelColor = (l: string) => {
    switch (l) {
      case "Advanced": return "bg-indigo-100 text-indigo-700";
      case "Intermediate": return "bg-emerald-100 text-emerald-700";
      default: return "bg-stone-100 text-stone-700";
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-stone-800">Skills Module</h1>
        <p className="text-stone-500">Add your technical and soft skills to boost your score.</p>
      </header>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
        <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Skill name (e.g. React, Python, Communication)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-stone-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            />
          </div>
          <div className="w-full md:w-48">
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full px-4 py-2 border border-stone-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            >
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
          </div>
          <button
            type="submit"
            className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
          >
            <Plus size={20} />
            Add Skill
          </button>
        </form>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-stone-100 animate-pulse rounded-2xl"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {skills.map((skill) => (
            <div
              key={skill.id}
              className="bg-white p-4 rounded-2xl border border-stone-100 shadow-sm flex items-center justify-between group hover:shadow-md hover:border-indigo-100 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-stone-50 rounded-xl text-stone-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">
                  <Code2 size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-stone-800">{skill.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getLevelColor(skill.level)}`}>
                    {skill.level}
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleDelete(skill.id)}
                className="text-stone-300 hover:text-red-500 transition-colors p-2"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
          {skills.length === 0 && (
            <div className="col-span-full text-center py-12 bg-stone-50 rounded-3xl border-2 border-dashed border-stone-200">
              <Star className="mx-auto text-stone-300 mb-4" size={48} />
              <p className="text-stone-700 font-medium">No skills added yet.</p>
              <p className="text-stone-500 text-sm mt-1">Add skills to improve your readiness score.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
