import { useEffect, useMemo, useState } from "react";

const API = "http://localhost:5000/api";

function App() {
  const [token, setToken] = useState(localStorage.getItem("habitToken") || "");
  const [student, setStudent] = useState(JSON.parse(localStorage.getItem("habitStudent") || "null"));
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({ name: "", email: "", password: "" });
  const [habits, setHabits] = useState([]);
  const [logs, setLogs] = useState([]);
  const [progress, setProgress] = useState({ totalHabits: 0, completedToday: 0, pendingToday: 0, completionPercentage: 0, habits: [] });
  const [form, setForm] = useState({ habitName: "", category: "Education", description: "", frequency: "Daily" });
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState(localDate());
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  function localDate() {
    const d = new Date();
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  }

  async function request(path, options = {}) {
    const response = await fetch(`${API}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {})
      }
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || "Something went wrong.");
    return data;
  }

  async function loadData() {
    try {
      const [habitData, logData, progressData] = await Promise.all([
        request("/habits"),
        request(`/habit-logs?date=${selectedDate}`),
        request("/habit-logs/progress")
      ]);
      setHabits(habitData);
      setLogs(logData);
      setProgress(progressData);
    } catch (error) {
      setMessage(error.message);
    }
  }

  useEffect(() => {
    if (token) loadData();
  }, [token, selectedDate]);

  async function handleAuth(e) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const data = await request(`/auth/${authMode === "register" ? "register" : "login"}`, {
        method: "POST",
        body: JSON.stringify(authForm)
      });
      localStorage.setItem("habitToken", data.token);
      localStorage.setItem("habitStudent", JSON.stringify(data.student));
      setToken(data.token);
      setStudent(data.student);
      setAuthForm({ name: "", email: "", password: "" });
      setMessage("Welcome! Your account is ready.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  function logout() {
    localStorage.removeItem("habitToken");
    localStorage.removeItem("habitStudent");
    setToken("");
    setStudent(null);
    setHabits([]);
    setLogs([]);
    setMessage("");
  }

  async function saveHabit(e) {
    e.preventDefault();
    setMessage("");
    try {
      await request(editingId ? `/habits/${editingId}` : "/habits", {
        method: editingId ? "PUT" : "POST",
        body: JSON.stringify(form)
      });
      setForm({ habitName: "", category: "Education", description: "", frequency: "Daily" });
      setEditingId(null);
      await loadData();
      setMessage(editingId ? "Habit updated successfully." : "Habit added successfully.");
    } catch (error) {
      setMessage(error.message);
    }
  }

  function startEdit(habit) {
    setEditingId(habit._id);
    setForm({
      habitName: habit.habitName,
      category: habit.category,
      description: habit.description || "",
      frequency: habit.frequency || "Daily"
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deleteHabit(id) {
    if (!window.confirm("Are you sure you want to delete this habit?")) return;
    try {
      await request(`/habits/${id}`, { method: "DELETE" });
      await loadData();
      setMessage("Habit deleted successfully.");
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function toggleHabit(habitId, checked) {
    try {
      await request("/habit-logs/toggle", {
        method: "POST",
        body: JSON.stringify({ habitId, date: selectedDate, status: checked })
      });
      await loadData();
    } catch (error) {
      setMessage(error.message);
    }
  }

  const filteredHabits = useMemo(
    () => habits.filter((habit) =>
      `${habit.habitName} ${habit.category}`.toLowerCase().includes(search.toLowerCase())
    ),
    [habits, search]
  );

  const completedForDate = (id) => logs.some((log) => log.habitId === id && log.status);

  if (!token) {
    return (
      <main className="auth-page">
        <section className="auth-card">
          <div className="brand-mark">H</div>
          <p className="eyebrow">BUILD BETTER DAYS</p>
          <h1>Student Habit Tracker</h1>
          <p className="muted">Small habits. Consistent progress. A better you.</p>
          <div className="auth-tabs">
            <button className={authMode === "login" ? "active" : ""} onClick={() => setAuthMode("login")}>Login</button>
            <button className={authMode === "register" ? "active" : ""} onClick={() => setAuthMode("register")}>Register</button>
          </div>
          <form onSubmit={handleAuth} className="stack-form">
            {authMode === "register" && (
              <label>Full name<input value={authForm.name} onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })} placeholder="Enter your name" required /></label>
            )}
            <label>Email address<input type="email" value={authForm.email} onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })} placeholder="student@example.com" required /></label>
            <label>Password<input type="password" minLength="6" value={authForm.password} onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })} placeholder="At least 6 characters" required /></label>
            <button className="primary-btn full" disabled={busy}>{busy ? "Please wait..." : authMode === "register" ? "Create account" : "Login to dashboard"}</button>
          </form>
          {message && <p className="notice">{message}</p>}
          <p className="auth-foot">Your habits are private to your account.</p>
        </section>
      </main>
    );
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark small">H</span><span>HabitFlow</span></div>
        <div className="side-label">WORKSPACE</div>
        <div className="side-link selected">▦ <span>My dashboard</span></div>
        <div className="side-label tips-label">DAILY FOCUS</div>
        <div className="side-tip">✦<p>Consistency beats perfection. Complete one small action at a time.</p></div>
        <div className="sidebar-bottom">
          <div className="avatar">{(student?.name || "S").charAt(0).toUpperCase()}</div>
          <div className="student-info"><strong>{student?.name || "Student"}</strong><span>{student?.email}</span></div>
          <button className="logout" onClick={logout} title="Logout">↗</button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div><p className="eyebrow">YOUR PERSONAL SPACE</p><h1>Good day, {student?.name?.split(" ")[0] || "Student"} <span>✦</span></h1><p className="muted">A little progress each day adds up to big results.</p></div>
          <div className="date-pill">▣ <input aria-label="Select date" type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} /></div>
        </header>

        {message && <div className="notice app-notice"><span>{message}</span><button onClick={() => setMessage("")}>×</button></div>}

        <section className="stats-grid">
          <article className="stat-card"><div className="stat-icon lavender">▦</div><p>Total habits</p><strong>{progress.totalHabits}</strong><span>Habits in your routine</span></article>
          <article className="stat-card"><div className="stat-icon mint">✓</div><p>Completed today</p><strong>{progress.completedToday}</strong><span>Keep up the momentum</span></article>
          <article className="stat-card"><div className="stat-icon peach">◷</div><p>Still to do</p><strong>{progress.pendingToday}</strong><span>One step at a time</span></article>
          <article className="stat-card"><div className="stat-icon blue">↗</div><p>Daily progress</p><strong>{progress.completionPercentage}%</strong><span>Today's completion rate</span></article>
        </section>

        <section className="content-grid">
          <div className="panel habit-panel">
            <div className="panel-heading"><div><p className="eyebrow">YOUR ROUTINE</p><h2>{editingId ? "Update habit" : "Create a habit"}</h2></div><span className="soft-tag">✦ Stay consistent</span></div>
            <form className="habit-form" onSubmit={saveHabit}>
              <label>Habit name<input value={form.habitName} onChange={(e) => setForm({ ...form, habitName: e.target.value })} placeholder="e.g. Read for 30 minutes" required /></label>
              <div className="form-row">
                <label>Category<select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}><option>Education</option><option>Fitness</option><option>Health</option><option>Personal</option><option>Productivity</option></select></label>
                <label>Frequency<select value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })}><option>Daily</option><option>Weekly</option></select></label>
              </div>
              <label>Description<input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Add a small note (optional)" /></label>
              <div className="form-actions"><button className="primary-btn">{editingId ? "Save changes" : "+ Add habit"}</button>{editingId && <button type="button" className="secondary-btn" onClick={() => { setEditingId(null); setForm({ habitName: "", category: "Education", description: "", frequency: "Daily" }); }}>Cancel</button>}</div>
            </form>
          </div>

          <div className="panel progress-panel">
            <div className="panel-heading"><div><p className="eyebrow">YOUR MOMENTUM</p><h2>Daily progress</h2></div><span className="progress-spark">✦</span></div>
            <div className="progress-ring" style={{ "--progress": `${progress.completionPercentage}%` }}><div><strong>{progress.completionPercentage}%</strong><span>completed</span></div></div>
            <p className="progress-caption">{progress.completedToday} of {progress.totalHabits} habits completed for the selected date.</p>
            <div className="progress-legend"><span><i className="dot done"></i> Completed</span><span><i className="dot todo"></i> Remaining</span></div>
          </div>
        </section>

        <section className="panel list-panel">
          <div className="panel-heading list-heading"><div><p className="eyebrow">MAKE IT HAPPEN</p><h2>Your daily habits <span className="count">{habits.length}</span></h2></div><input className="search-input" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="⌕  Search habits..." /></div>
          {filteredHabits.length === 0 ? (
            <div className="empty-state"><div>✧</div><h3>{habits.length ? "No matching habits" : "Your routine starts here"}</h3><p>{habits.length ? "Try another search term." : "Add your first habit above and start building a better routine."}</p></div>
          ) : (
            <div className="habit-list">
              {filteredHabits.map((habit) => {
                const done = completedForDate(habit._id);
                const streak = progress.habits?.find((item) => item.habitId === habit._id)?.streak || 0;
                return (
                  <article className={`habit-item ${done ? "is-done" : ""}`} key={habit._id}>
                    <button className={`check-button ${done ? "checked" : ""}`} onClick={() => toggleHabit(habit._id, !done)} aria-label={done ? "Mark as not completed" : "Mark as completed"}>{done ? "✓" : ""}</button>
                    <div className="habit-details"><h3>{habit.habitName}</h3><p>{habit.description || "A small step toward your goals."}</p></div>
                    <span className="category-tag">{habit.category}</span>
                    <span className="streak">🔥 {streak} day streak</span>
                    <div className="item-actions"><button onClick={() => startEdit(habit)} title="Edit">✎</button><button onClick={() => deleteHabit(habit._id)} title="Delete">⌫</button></div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
        <footer>Made for students · Build habits, shape your future <span>✦</span></footer>
      </main>
    </div>
  );
}

export default App;
