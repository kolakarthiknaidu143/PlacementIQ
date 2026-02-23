import React, { useState, useEffect } from "react";
import { Plus, Trash2, FileCheck, Trophy } from "lucide-react";

type MockTest = {
  id: number;
  test_name: string;
  score: number;
  max_score: number;
  date: string;
};

export function MockTests() {
  const [tests, setTests] = useState<MockTest[]>([]);
  const [name, setName] = useState("");
  const [score, setScore] = useState("");
  const [maxScore, setMaxScore] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    const res = await fetch("/api/mock-tests");
    const data = await res.json();
    setTests(data);
    setLoading(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !score || !maxScore) return;
    const res = await fetch("/api/mock-tests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        test_name: name, 
        score: parseInt(score), 
        max_score: parseInt(maxScore), 
        date 
      }),
    });
    if (res.ok) {
      setName("");
      setScore("");
      setMaxScore("");
      fetchTests();
    }
  };

  const handleDelete = async (id: number) => {
    await fetch(`/api/mock-tests/${id}`, { method: "DELETE" });
    fetchTests();
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-stone-800">Mock Tests</h1>
        <p className="text-stone-500">Record your performance in aptitude and technical tests.</p>
      </header>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2">
            <input
              type="text"
              placeholder="Test Name (e.g. TCS NQT, Java Quiz)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-stone-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            />
          </div>
          <div>
            <input
              type="number"
              placeholder="Score"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              className="w-full px-4 py-2 border border-stone-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            />
          </div>
          <div>
            <input
              type="number"
              placeholder="Max Score"
              value={maxScore}
              onChange={(e) => setMaxScore(e.target.value)}
              className="w-full px-4 py-2 border border-stone-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            />
          </div>
          <button
            type="submit"
            className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
          >
            <Plus size={20} />
            Add Test
          </button>
        </form>
      </div>

      <div className="bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
        <table className="w-full text-left">
          <thead className="bg-stone-50 text-stone-500 text-sm uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4 font-semibold">Test Name</th>
              <th className="px-6 py-4 font-semibold">Score</th>
              <th className="px-6 py-4 font-semibold">Percentage</th>
              <th className="px-6 py-4 font-semibold">Date</th>
              <th className="px-6 py-4 font-semibold"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {tests.map((test) => {
              const percentage = Math.round((test.score / test.max_score) * 100);
              return (
                <tr key={test.id} className="hover:bg-indigo-50/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <FileCheck className="text-indigo-500 group-hover:scale-110 transition-transform" size={20} />
                      <span className="font-medium text-stone-800">{test.test_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-stone-600">
                    {test.score} / {test.max_score}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-stone-100 rounded-full w-24 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${percentage >= 75 ? 'bg-emerald-500' : percentage >= 41 ? 'bg-amber-500' : 'bg-rose-500'}`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-bold text-stone-700">{percentage}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-stone-500 text-sm">
                    {new Date(test.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(test.id)}
                      className="text-stone-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              );
            })}
            {tests.length === 0 && !loading && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <Trophy className="mx-auto text-stone-200 mb-4" size={48} />
                  <p className="text-stone-700 font-medium">No mock tests recorded yet.</p>
                  <p className="text-stone-500 text-sm mt-1">Take more mock tests to track your performance and improve your score.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
