import React, { useState, useEffect } from "react";
import { Plus, Trash2, Briefcase, ExternalLink } from "lucide-react";

type Project = {
  id: number;
  title: string;
  technologies: string;
  status: string;
};

export function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [title, setTitle] = useState("");
  const [tech, setTech] = useState("");
  const [status, setStatus] = useState("Completed");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    const res = await fetch("/api/projects");
    const data = await res.json();
    setProjects(data);
    setLoading(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, technologies: tech, status }),
    });
    if (res.ok) {
      setTitle("");
      setTech("");
      fetchProjects();
    }
  };

  const handleDelete = async (id: number) => {
    await fetch(`/api/projects/${id}`, { method: "DELETE" });
    fetchProjects();
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-stone-800">Projects Module</h1>
        <p className="text-stone-500">Showcase your academic and personal projects.</p>
      </header>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Project Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-stone-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            />
            <input
              type="text"
              placeholder="Technologies used (e.g. React, Node, SQLite)"
              value={tech}
              onChange={(e) => setTech(e.target.value)}
              className="w-full px-4 py-2 border border-stone-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            />
          </div>
          <div className="flex flex-col md:flex-row gap-4">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full md:w-48 px-4 py-2 border border-stone-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            >
              <option>Completed</option>
              <option>In Progress</option>
            </select>
            <button
              type="submit"
              className="flex-1 bg-indigo-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
            >
              <Plus size={20} />
              Add Project
            </button>
          </div>
        </form>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-32 bg-stone-100 animate-pulse rounded-2xl"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-md hover:border-indigo-100 transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <Briefcase size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-stone-800">{project.title}</h3>
                  <p className="text-stone-500 text-sm mt-1">{project.technologies}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      project.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDelete(project.id)}
                  className="p-2 text-stone-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
          {projects.length === 0 && (
            <div className="text-center py-12 bg-stone-50 rounded-3xl border-2 border-dashed border-stone-200">
              <ExternalLink className="mx-auto text-stone-300 mb-4" size={48} />
              <p className="text-stone-700 font-medium">No projects listed.</p>
              <p className="text-stone-500 text-sm mt-1">Add your work to showcase your skills and improve your score!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
