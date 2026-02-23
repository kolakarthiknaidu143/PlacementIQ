import { useState, useEffect } from "react";
import { Auth } from "./components/Auth";
import { Layout } from "./components/Layout";
import { Dashboard } from "./components/Dashboard";
import { Skills } from "./components/Skills";
import { Projects } from "./components/Projects";
import { MockTests } from "./components/MockTests";
import { Certifications } from "./components/Certifications";

export type User = {
  id: number;
  name: string;
  email: string;
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setUser(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Auth onLogin={setUser} />;
  }

  return (
    <Layout user={user} activeTab={activeTab} onTabChange={setActiveTab} onLogout={() => setUser(null)}>
      {activeTab === "dashboard" && <Dashboard />}
      {activeTab === "skills" && <Skills />}
      {activeTab === "projects" && <Projects />}
      {activeTab === "mock-tests" && <MockTests />}
      {activeTab === "certifications" && <Certifications />}
    </Layout>
  );
}
