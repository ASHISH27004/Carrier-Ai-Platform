import { useState } from "react";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";

const call = async (system, user) => {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system,
      messages: [{ role: "user", content: user }]
    })
  });
  const data = await res.json();
  return data.content[0].text;
};

const T = {
  bg: "#070c18", card: "#0e1624", surface: "#131f30", border: "#1d2e45",
  teal: "#14b8a6", tealD: "#0d9488", amber: "#f59e0b", amberD: "#d97706",
  text: "#e2e8f0", muted: "#64748b", mutedL: "#94a3b8",
  success: "#22c55e", danger: "#ef4444", purple: "#8b5cf6"
};

const s = {
  app: { minHeight: "100vh", background: T.bg, color: T.text, fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif", display: "flex", flexDirection: "column" },
  header: { borderBottom: `1px solid ${T.border}`, background: T.card, padding: "0 2rem", display: "flex", alignItems: "center", gap: "2rem", height: 60, flexShrink: 0 },
  logo: { fontWeight: 700, fontSize: 18, color: T.teal, letterSpacing: "-0.5px", display: "flex", alignItems: "center", gap: 8 },
  nav: { display: "flex", gap: "0.25rem", flex: 1 },
  navBtn: (active) => ({ padding: "6px 16px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500, transition: "all .15s", background: active ? T.teal : "transparent", color: active ? "#fff" : T.mutedL }),
  main: { flex: 1, padding: "2rem", maxWidth: 960, margin: "0 auto", width: "100%", boxSizing: "border-box" },
  card: { background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: "1.5rem" },
  h1: { fontSize: 28, fontWeight: 700, margin: "0 0 0.5rem", letterSpacing: "-0.5px" },
  h2: { fontSize: 20, fontWeight: 600, margin: "0 0 1rem", color: T.text },
  h3: { fontSize: 15, fontWeight: 600, margin: "0 0 0.5rem", color: T.mutedL },
  label: { fontSize: 12, fontWeight: 600, color: T.muted, textTransform: "uppercase", letterSpacing: 1 },
  textarea: { width: "100%", background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, color: T.text, fontSize: 14, padding: "1rem", resize: "vertical", fontFamily: "inherit", boxSizing: "border-box", outline: "none", lineHeight: 1.6 },
  input: { background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, fontSize: 14, padding: "10px 14px", fontFamily: "inherit", outline: "none", width: "100%", boxSizing: "border-box" },
  btn: (color = T.teal) => ({ background: color, border: "none", borderRadius: 10, color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 600, padding: "10px 22px", transition: "opacity .15s", display: "inline-flex", alignItems: "center", gap: 8 }),
  btnGhost: { background: "transparent", border: `1px solid ${T.border}`, borderRadius: 10, color: T.mutedL, cursor: "pointer", fontSize: 14, fontWeight: 500, padding: "10px 22px", transition: "all .15s" },
  chip: (c = T.teal) => ({ display: "inline-block", background: c + "22", color: c, border: `1px solid ${c}44`, borderRadius: 20, fontSize: 12, fontWeight: 600, padding: "3px 10px" }),
  stat: { background: T.surface, borderRadius: 12, padding: "1rem 1.25rem", border: `1px solid ${T.border}` },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" },
  grid3: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" },
  grid4: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" },
  flex: { display: "flex", alignItems: "center" },
  gap8: { gap: 8 },
  gap12: { gap: 12 },
  mt1: { marginTop: "1rem" },
  mt2: { marginTop: "1.5rem" },
  progressBar: (pct, color) => ({ height: 8, borderRadius: 4, background: T.border, position: "relative", overflow: "hidden", marginTop: 6, marginBottom: 4 }),
};

const Spinner = () => (
  <div style={{ textAlign: "center", padding: "3rem" }}>
    <div style={{ width: 40, height: 40, border: `3px solid ${T.border}`, borderTopColor: T.teal, borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 1rem" }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    <p style={{ color: T.muted, margin: 0 }}>AI is thinking...</p>
  </div>
);

const Tag = ({ children, color }) => <span style={s.chip(color)}>{children}</span>;

const ProgressBar = ({ value, color = T.teal }) => (
  <div style={s.progressBar(value, color)}>
    <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${value}%`, background: color, borderRadius: 4, transition: "width 1s ease" }} />
  </div>
);

// ── HOME PAGE ───────────────────────────────────────────────────────────────
const HomePage = ({ setPage, resumeData }) => {
  const features = [
    { icon: "📄", title: "Resume Analyzer", desc: "Paste your resume. AI extracts skills, scores domains using NLP, and gives detailed feedback.", page: "resume", color: T.teal },
    { icon: "🧠", title: "Skill Assessment", desc: "Take AI-generated quizzes per domain. Get instant feedback and improvement tips.", page: "skills", color: T.amber },
    { icon: "💼", title: "Job Recommendations", desc: "Get ranked job roles matched to your profile using ML similarity scoring.", page: "jobs", color: T.purple },
    { icon: "🚀", title: "Learning Path", desc: "Personalized courses, certs, and tutorials based on your skill gaps.", page: "learning", color: T.success },
  ];
  return (
    <div>
      <div style={{ textAlign: "center", padding: "3rem 0 2rem" }}>
        <div style={{ display: "inline-block", background: T.teal + "22", border: `1px solid ${T.teal}44`, borderRadius: 20, padding: "4px 16px", fontSize: 12, fontWeight: 600, color: T.teal, marginBottom: "1rem" }}>Sem 6 Project · AI/ML + Full Stack</div>
        <h1 style={{ ...s.h1, fontSize: 38, marginBottom: "0.75rem" }}>AI-Driven Career Intelligence<br /><span style={{ color: T.teal }}>Platform</span></h1>
        <p style={{ color: T.mutedL, fontSize: 16, maxWidth: 520, margin: "0 auto 2rem", lineHeight: 1.7 }}>Analyze your resume, assess your skills, discover matching jobs, and get a personalized growth roadmap — all powered by AI.</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <button style={s.btn(T.teal)} onClick={() => setPage("resume")}>🔍 Analyze My Resume</button>
          <button style={s.btn(T.amber)} onClick={() => setPage("skills")}>🧠 Take Skill Test</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "2rem" }}>
        {features.map(f => (
          <div key={f.page} onClick={() => setPage(f.page)} style={{ ...s.card, cursor: "pointer", transition: "border-color .2s", borderColor: T.border }}
            onMouseEnter={e => e.currentTarget.style.borderColor = f.color}
            onMouseLeave={e => e.currentTarget.style.borderColor = T.border}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>{f.icon}</div>
            <h3 style={{ ...s.h2, fontSize: 17, color: f.color, margin: "0 0 0.5rem" }}>{f.title}</h3>
            <p style={{ color: T.mutedL, margin: 0, fontSize: 14, lineHeight: 1.6 }}>{f.desc}</p>
          </div>
        ))}
      </div>

      {resumeData && (
        <div style={{ ...s.card, marginTop: "1.5rem", borderColor: T.teal + "44" }}>
          <div style={{ ...s.flex, ...s.gap12, marginBottom: "1rem" }}>
            <span style={{ fontSize: 20 }}>✅</span>
            <h3 style={{ ...s.h2, margin: 0, color: T.teal }}>Resume Analyzed: {resumeData.name}</h3>
          </div>
          <div style={s.grid4}>
            {Object.entries(resumeData.scores).slice(0, 4).map(([k, v]) => (
              <div key={k} style={s.stat}>
                <div style={s.label}>{k.split(" ")[0]}</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: T.teal }}>{v}</div>
                <ProgressBar value={v} />
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ ...s.card, marginTop: "1.5rem", background: T.surface }}>
        <h3 style={{ ...s.h3, color: T.amber, marginBottom: "1rem" }}>🗺️ Project Roadmap</h3>
        <div style={{ display: "flex", gap: 0, overflowX: "auto" }}>
          {["Requirement & Design", "Resume Parser + NLP", "Skill Tests + Eval", "Recommendation Engine", "Frontend & Dashboard", "Deployment + Cloud", "Testing & Docs", "Demo & Portfolio"].map((step, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center" }}>
              <div style={{ textAlign: "center", minWidth: 90 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: i < 4 ? T.teal : T.border, color: i < 4 ? "#fff" : T.muted, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, margin: "0 auto 6px" }}>{i + 1}</div>
                <div style={{ fontSize: 10, color: i < 4 ? T.mutedL : T.muted, lineHeight: 1.3 }}>{step}</div>
              </div>
              {i < 7 && <div style={{ width: 20, height: 2, background: i < 3 ? T.teal : T.border, flexShrink: 0, marginBottom: 18 }} />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── RESUME ANALYZER ─────────────────────────────────────────────────────────
const ResumeAnalyzer = ({ resumeData, setResumeData }) => {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const SYSTEM = `You are an expert resume analyzer and career coach. Analyze the given resume text and return ONLY valid JSON (no markdown, no explanation) in exactly this format:
{
  "name": "candidate name or Candidate",
  "experience": "X years or fresher",
  "education": "degree and/or institution",
  "skills": ["skill1","skill2","skill3","skill4","skill5","skill6","skill7","skill8"],
  "scores": {
    "Web Development": <0-100>,
    "Machine Learning": <0-100>,
    "Data Science": <0-100>,
    "Mobile Dev": <0-100>,
    "Cloud/DevOps": <0-100>,
    "Databases": <0-100>,
    "System Design": <0-100>
  },
  "topStrength": "one domain name",
  "summary": "2-3 sentence professional summary",
  "suggestions": ["suggestion1","suggestion2","suggestion3"]
}`;

  const analyze = async () => {
    if (!text.trim()) return;
    setLoading(true); setError("");
    try {
      const raw = await callClaude(SYSTEM, text);
      const clean = raw.replace(/```json|```/g, "").trim();
      const data = JSON.parse(clean);
      setResumeData(data);
    } catch (e) {
      setError("Analysis failed. Make sure you pasted valid resume text.");
    }
    setLoading(false);
  };

  const domains = resumeData ? Object.entries(resumeData.scores).map(([domain, score]) => ({ domain, score })) : [];

  return (
    <div>
      <h1 style={s.h1}>📄 Resume Analyzer</h1>
      <p style={{ color: T.mutedL, margin: "0 0 1.5rem" }}>Paste your resume text below. AI will extract skills, score each domain, and provide personalized feedback.</p>

      <div style={s.card}>
        <div style={s.label}>Your Resume Text</div>
        <textarea style={{ ...s.textarea, minHeight: 200, marginTop: 8 }} placeholder="Paste your full resume here — education, experience, skills, projects..." value={text} onChange={e => setText(e.target.value)} />
        {error && <p style={{ color: T.danger, fontSize: 13, margin: "8px 0 0" }}>⚠️ {error}</p>}
        <div style={{ ...s.flex, gap: 12, marginTop: "1rem" }}>
          <button style={s.btn(T.teal)} onClick={analyze} disabled={loading || !text.trim()}>
            {loading ? "Analyzing..." : "🔍 Analyze Resume"}
          </button>
          {!text && (
            <button style={s.btnGhost} onClick={() => setText(`John Doe\njohn@email.com | +91-9876543210 | linkedin.com/in/johndoe\n\nEDUCATION\nB.Tech Computer Science, Delhi Technological University, 2025 (CGPA: 8.4)\n\nSKILLS\nLanguages: Python, JavaScript, Java, SQL\nFrameworks: React, Node.js, Express, Flask, TensorFlow\nDatabases: MongoDB, PostgreSQL, MySQL\nTools: Git, Docker, AWS, Postman\nML: Scikit-learn, Pandas, NumPy, NLP (SpaCy)\n\nEXPERIENCE\nSoftware Intern - TechCorp India (May 2024 - Aug 2024)\n- Built REST APIs with Node.js serving 10K+ daily requests\n- Developed ML model for sentiment analysis (92% accuracy)\n- Deployed app on AWS EC2 with CI/CD pipeline\n\nPROJECTS\n1. E-commerce Platform (React + Node + MongoDB) - Full-stack with payment integration\n2. Resume Parser NLP (Python + SpaCy) - Extracts entities with 90% precision\n3. Stock Price Predictor (LSTM) - 85% directional accuracy\n\nACHIEVEMENTS\n- Winner, Smart India Hackathon 2024\n- 3-star rating on HackerRank (Problem Solving)\n- Published paper on NLP for resume parsing`)}>
              Load Sample Resume
            </button>
          )}
        </div>
      </div>

      {loading && <Spinner />}

      {resumeData && !loading && (
        <div style={{ marginTop: "1.5rem" }}>
          <div style={{ ...s.card, borderColor: T.teal + "44", marginBottom: "1rem" }}>
            <div style={{ ...s.flex, gap: 16 }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: T.teal + "22", border: `2px solid ${T.teal}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>👤</div>
              <div style={{ flex: 1 }}>
                <h2 style={{ ...s.h2, margin: "0 0 2px" }}>{resumeData.name}</h2>
                <div style={{ ...s.flex, gap: 8 }}>
                  <Tag color={T.teal}>{resumeData.experience}</Tag>
                  <Tag color={T.amber}>{resumeData.education}</Tag>
                  <Tag color={T.purple}>Top: {resumeData.topStrength}</Tag>
                </div>
              </div>
            </div>
            <p style={{ color: T.mutedL, margin: "1rem 0 0", fontSize: 14, lineHeight: 1.7 }}>{resumeData.summary}</p>
          </div>

          <div style={s.grid2}>
            <div style={s.card}>
              <h3 style={s.h3}>Domain Scores</h3>
              <ResponsiveContainer width="100%" height={240}>
                <RadarChart data={domains}>
                  <PolarGrid stroke={T.border} />
                  <PolarAngleAxis dataKey="domain" tick={{ fill: T.muted, fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: T.muted, fontSize: 10 }} />
                  <Radar name="Score" dataKey="score" stroke={T.teal} fill={T.teal} fillOpacity={0.25} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div style={s.card}>
              <h3 style={s.h3}>Score Breakdown</h3>
              {domains.map(({ domain, score }) => (
                <div key={domain} style={{ marginBottom: 10 }}>
                  <div style={{ ...s.flex, justifyContent: "space-between", fontSize: 13 }}>
                    <span style={{ color: T.mutedL }}>{domain}</span>
                    <span style={{ fontWeight: 600, color: score >= 70 ? T.teal : score >= 45 ? T.amber : T.danger }}>{score}</span>
                  </div>
                  <ProgressBar value={score} color={score >= 70 ? T.teal : score >= 45 ? T.amber : T.danger} />
                </div>
              ))}
            </div>
          </div>

          <div style={{ ...s.grid2, marginTop: "1rem" }}>
            <div style={s.card}>
              <h3 style={s.h3}>Extracted Skills</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                {resumeData.skills.map(skill => <Tag key={skill} color={T.teal}>{skill}</Tag>)}
              </div>
            </div>
            <div style={s.card}>
              <h3 style={s.h3}>💡 AI Suggestions</h3>
              {resumeData.suggestions.map((s_, i) => (
                <div key={i} style={{ ...s.flex, gap: 10, marginBottom: 10, fontSize: 14 }}>
                  <span style={{ color: T.amber, flexShrink: 0 }}>→</span>
                  <span style={{ color: T.mutedL, lineHeight: 1.5 }}>{s_}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── SKILL ASSESSMENT ────────────────────────────────────────────────────────
const SkillAssessment = () => {
  const domains = ["Web Development", "Machine Learning", "Data Science", "Cloud & DevOps", "Databases", "System Design", "Python Programming"];
  const [selected, setSelected] = useState("");
  const [questions, setQuestions] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const SYSTEM = `Generate a 5-question multiple choice quiz for the domain provided. Return ONLY valid JSON array (no markdown):
[{"q":"question text","options":["A) ...","B) ...","C) ...","D) ..."],"correct":0,"explanation":"why correct"}]
correct is 0-indexed. Make questions practical and interview-relevant.`;

  const startQuiz = async () => {
    setLoading(true); setQuestions(null); setAnswers({}); setResult(null);
    try {
      const raw = await callClaude(SYSTEM, `Generate quiz for: ${selected}`);
      const clean = raw.replace(/```json|```/g, "").trim();
      setQuestions(JSON.parse(clean));
    } catch (e) { alert("Failed to generate quiz. Try again."); }
    setLoading(false);
  };

  const submit = async () => {
    if (Object.keys(answers).length < questions.length) { alert("Please answer all questions."); return; }
    let correct = 0;
    questions.forEach((q, i) => { if (answers[i] === q.correct) correct++; });
    const pct = Math.round((correct / questions.length) * 100);
    setResult({ correct, total: questions.length, pct, grade: pct >= 80 ? "Excellent" : pct >= 60 ? "Good" : pct >= 40 ? "Average" : "Needs Work", color: pct >= 80 ? T.success : pct >= 60 ? T.teal : pct >= 40 ? T.amber : T.danger });
  };

  return (
    <div>
      <h1 style={s.h1}>🧠 Skill Assessment</h1>
      <p style={{ color: T.mutedL, margin: "0 0 1.5rem" }}>Select a domain and take an AI-generated quiz. Get instant feedback and improvement tips.</p>

      {!questions && !loading && (
        <div style={s.card}>
          <h3 style={s.h3}>Choose a Domain</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, margin: "1rem 0" }}>
            {domains.map(d => (
              <div key={d} onClick={() => setSelected(d)}
                style={{ padding: "1rem", borderRadius: 12, border: `1px solid ${selected === d ? T.amber : T.border}`, cursor: "pointer", textAlign: "center", background: selected === d ? T.amber + "11" : "transparent", transition: "all .15s", fontSize: 14, fontWeight: selected === d ? 600 : 400, color: selected === d ? T.amber : T.mutedL }}>
                {d}
              </div>
            ))}
          </div>
          <button style={{ ...s.btn(T.amber), opacity: selected ? 1 : 0.5 }} onClick={startQuiz} disabled={!selected}>Generate Quiz →</button>
        </div>
      )}

      {loading && <Spinner />}

      {questions && !loading && !result && (
        <div>
          <div style={{ ...s.flex, justifyContent: "space-between", marginBottom: "1rem" }}>
            <h2 style={{ ...s.h2, margin: 0 }}>Quiz: {selected}</h2>
            <span style={s.chip(T.amber)}>{Object.keys(answers).length} / {questions.length} answered</span>
          </div>
          {questions.map((q, i) => (
            <div key={i} style={{ ...s.card, marginBottom: "1rem" }}>
              <div style={{ ...s.flex, gap: 12, marginBottom: "1rem" }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: T.teal + "22", color: T.teal, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>Q{i + 1}</div>
                <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, fontWeight: 500 }}>{q.q}</p>
              </div>
              {q.options.map((opt, j) => (
                <div key={j} onClick={() => setAnswers({ ...answers, [i]: j })}
                  style={{ padding: "10px 14px", borderRadius: 10, border: `1px solid ${answers[i] === j ? T.teal : T.border}`, cursor: "pointer", marginBottom: 8, fontSize: 14, background: answers[i] === j ? T.teal + "18" : "transparent", color: answers[i] === j ? T.teal : T.mutedL, transition: "all .15s" }}>
                  {opt}
                </div>
              ))}
            </div>
          ))}
          <button style={s.btn(T.teal)} onClick={submit}>Submit & Get Results</button>
        </div>
      )}

      {result && (
        <div>
          <div style={{ ...s.card, borderColor: result.color + "44", textAlign: "center", marginBottom: "1.5rem" }}>
            <div style={{ fontSize: 56, fontWeight: 800, color: result.color, lineHeight: 1 }}>{result.pct}%</div>
            <div style={{ fontSize: 22, fontWeight: 600, margin: "0.5rem 0 0.25rem" }}>{result.grade}</div>
            <p style={{ color: T.mutedL, margin: 0 }}>{result.correct} / {result.total} correct answers in {selected}</p>
          </div>
          <h3 style={s.h3}>Answer Review</h3>
          {questions.map((q, i) => {
            const correct = answers[i] === q.correct;
            return (
              <div key={i} style={{ ...s.card, marginBottom: "1rem", borderColor: correct ? T.success + "44" : T.danger + "44" }}>
                <div style={{ ...s.flex, gap: 10, marginBottom: 8 }}>
                  <span style={{ color: correct ? T.success : T.danger }}>{correct ? "✓" : "✗"}</span>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{q.q}</span>
                </div>
                {!correct && <p style={{ fontSize: 13, color: T.danger, margin: "0 0 4px" }}>Your answer: {q.options[answers[i]]}</p>}
                <p style={{ fontSize: 13, color: T.success, margin: "0 0 4px" }}>Correct: {q.options[q.correct]}</p>
                <p style={{ fontSize: 13, color: T.mutedL, margin: 0, fontStyle: "italic" }}>💡 {q.explanation}</p>
              </div>
            );
          })}
          <button style={s.btn(T.amber)} onClick={() => { setQuestions(null); setResult(null); setSelected(""); }}>Take Another Quiz</button>
        </div>
      )}
    </div>
  );
};

// ── JOB RECOMMENDATIONS ─────────────────────────────────────────────────────
const JobRecommendations = ({ resumeData }) => {
  const [jobs, setJobs] = useState(null);
  const [loading, setLoading] = useState(false);
  const [manualSkills, setManualSkills] = useState("");
  const [mode, setMode] = useState("auto");

  const SYSTEM = `You are a job matching expert. Given a candidate's skill scores or skills, recommend 6 relevant tech job roles. Return ONLY valid JSON array:
[{"title":"Job Title","company":"Example Companies in India","match":85,"salary":"₹X-Y LPA","skills":["skill1","skill2","skill3"],"description":"2 sentence role description","level":"Entry/Mid/Senior","domain":"Web/ML/Data etc"}]
match is 0-100. Be realistic and specific to the Indian job market.`;

  const getJobs = async () => {
    setLoading(true);
    try {
      const input = resumeData
        ? `Candidate profile: ${JSON.stringify(resumeData.scores)}, Skills: ${resumeData.skills.join(", ")}`
        : `Skills: ${manualSkills}`;
      const raw = await callClaude(SYSTEM, input);
      const clean = raw.replace(/```json|```/g, "").trim();
      setJobs(JSON.parse(clean));
    } catch (e) { alert("Failed to fetch recommendations. Try again."); }
    setLoading(false);
  };

  const domainColors = { Web: T.teal, ML: T.purple, Data: T.amber, Cloud: T.success, Mobile: "#06b6d4" };
  const getDColor = (d) => Object.entries(domainColors).find(([k]) => d?.includes(k))?.[1] || T.mutedL;

  return (
    <div>
      <h1 style={s.h1}>💼 Job Recommendations</h1>
      <p style={{ color: T.mutedL, margin: "0 0 1.5rem" }}>AI ranks the best-matching job roles for your profile using skill similarity scoring.</p>

      {!jobs && !loading && (
        <div style={s.card}>
          {resumeData ? (
            <div>
              <div style={{ ...s.flex, gap: 12, marginBottom: "1rem" }}>
                <span style={{ fontSize: 20 }}>✅</span>
                <div>
                  <div style={{ fontWeight: 600 }}>Resume analyzed: {resumeData.name}</div>
                  <div style={{ fontSize: 13, color: T.mutedL }}>Top strength: {resumeData.topStrength}</div>
                </div>
              </div>
              <button style={s.btn(T.purple)} onClick={getJobs}>Find Matching Jobs →</button>
            </div>
          ) : (
            <div>
              <h3 style={s.h3}>Enter Your Skills</h3>
              <input style={{ ...s.input, marginTop: 8 }} placeholder="e.g. React, Node.js, Python, Machine Learning, MongoDB..." value={manualSkills} onChange={e => setManualSkills(e.target.value)} />
              <button style={{ ...s.btn(T.purple), marginTop: "1rem", opacity: manualSkills ? 1 : 0.5 }} onClick={getJobs} disabled={!manualSkills}>Find Matching Jobs →</button>
            </div>
          )}
        </div>
      )}

      {loading && <Spinner />}

      {jobs && !loading && (
        <div>
          <div style={{ ...s.flex, justifyContent: "space-between", marginBottom: "1.25rem" }}>
            <h2 style={{ ...s.h2, margin: 0 }}>Top {jobs.length} Matches</h2>
            <button style={s.btnGhost} onClick={() => { setJobs(null); }}>↺ Refresh</button>
          </div>
          {jobs.sort((a, b) => b.match - a.match).map((job, i) => (
            <div key={i} style={{ ...s.card, marginBottom: "1rem", borderLeft: `3px solid ${getDColor(job.domain)}` }}>
              <div style={{ ...s.flex, justifyContent: "space-between", marginBottom: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ ...s.flex, gap: 10, marginBottom: 4 }}>
                    <h3 style={{ ...s.h2, margin: 0, fontSize: 17 }}>{job.title}</h3>
                    <Tag color={getDColor(job.domain)}>{job.domain}</Tag>
                    <Tag color={T.mutedL}>{job.level}</Tag>
                  </div>
                  <div style={{ fontSize: 13, color: T.muted }}>{job.company} · {job.salary}</div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 16 }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: job.match >= 80 ? T.success : job.match >= 60 ? T.teal : T.amber }}>{job.match}%</div>
                  <div style={{ fontSize: 11, color: T.muted }}>match</div>
                </div>
              </div>
              <p style={{ fontSize: 13, color: T.mutedL, margin: "8px 0", lineHeight: 1.6 }}>{job.description}</p>
              <ProgressBar value={job.match} color={job.match >= 80 ? T.success : job.match >= 60 ? T.teal : T.amber} />
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                {job.skills.map(sk => <Tag key={sk} color={T.muted}>{sk}</Tag>)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── LEARNING PATH ───────────────────────────────────────────────────────────
const LearningPath = ({ resumeData }) => {
  const [path, setPath] = useState(null);
  const [loading, setLoading] = useState(false);
  const [goal, setGoal] = useState("");
  const [checked, setChecked] = useState({});

  const SYSTEM = `You are a learning path curator. Given a candidate's skill profile and career goal, generate a personalized learning roadmap. Return ONLY valid JSON:
{
  "goal": "stated goal",
  "timeline": "X months",
  "phases": [
    {
      "phase": 1,
      "title": "Phase title",
      "duration": "X weeks",
      "courses": [
        {"name":"Course Name","platform":"Coursera/Udemy/YouTube/etc","level":"Beginner/Intermediate/Advanced","duration":"X hours","free":true,"link":"https://..."}
      ],
      "skills": ["skill gained1","skill gained2"],
      "milestone": "what you can build/do after this phase"
    }
  ],
  "certifications": [{"name":"Cert Name","provider":"AWS/Google/etc","value":"High/Medium"}],
  "weeklyPlan": "Suggested weekly study hours and focus areas"
}`;

  const generatePath = async () => {
    setLoading(true); setPath(null);
    try {
      const profile = resumeData
        ? `Skills: ${JSON.stringify(resumeData.scores)}, Career goal: ${goal || "full stack developer"}`
        : `Career goal: ${goal || "software developer"}`;
      const raw = await callClaude(SYSTEM, profile);
      const clean = raw.replace(/```json|```/g, "").trim();
      setPath(JSON.parse(clean));
    } catch (e) { alert("Failed to generate learning path. Try again."); }
    setLoading(false);
  };

  const toggleCheck = (key) => setChecked(prev => ({ ...prev, [key]: !prev[key] }));
  const totalCourses = path?.phases?.reduce((a, p) => a + p.courses.length, 0) || 0;
  const doneCount = Object.values(checked).filter(Boolean).length;

  return (
    <div>
      <h1 style={s.h1}>🚀 Personalized Learning Path</h1>
      <p style={{ color: T.mutedL, margin: "0 0 1.5rem" }}>AI analyzes your skill gaps and builds a custom roadmap of courses, certifications, and milestones.</p>

      <div style={s.card}>
        <h3 style={s.h3}>Your Career Goal</h3>
        <input style={{ ...s.input, marginTop: 8 }} placeholder="e.g. Full Stack Developer, ML Engineer, Data Scientist, Cloud Architect..." value={goal} onChange={e => setGoal(e.target.value)} />
        {resumeData && <p style={{ fontSize: 13, color: T.teal, margin: "8px 0 0" }}>✓ Using your analyzed resume profile as baseline</p>}
        <button style={{ ...s.btn(T.success), marginTop: "1rem" }} onClick={generatePath}>Generate My Learning Path →</button>
      </div>

      {loading && <Spinner />}

      {path && !loading && (
        <div style={{ marginTop: "1.5rem" }}>
          <div style={{ ...s.card, borderColor: T.success + "44", marginBottom: "1rem" }}>
            <div style={s.grid3}>
              <div style={s.stat}><div style={s.label}>Goal</div><div style={{ fontSize: 15, fontWeight: 600, marginTop: 4 }}>{path.goal}</div></div>
              <div style={s.stat}><div style={s.label}>Timeline</div><div style={{ fontSize: 22, fontWeight: 700, color: T.success, marginTop: 4 }}>{path.timeline}</div></div>
              <div style={s.stat}>
                <div style={s.label}>Progress</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: T.teal, marginTop: 4 }}>{doneCount}/{totalCourses}</div>
                <ProgressBar value={totalCourses ? Math.round((doneCount / totalCourses) * 100) : 0} color={T.success} />
              </div>
            </div>
            <p style={{ fontSize: 13, color: T.mutedL, margin: "1rem 0 0" }}>📅 {path.weeklyPlan}</p>
          </div>

          {path.phases?.map((phase) => (
            <div key={phase.phase} style={{ ...s.card, marginBottom: "1rem" }}>
              <div style={{ ...s.flex, gap: 12, marginBottom: "1rem" }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: T.success + "22", color: T.success, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, flexShrink: 0 }}>P{phase.phase}</div>
                <div>
                  <h3 style={{ ...s.h2, margin: 0, fontSize: 16 }}>{phase.title}</h3>
                  <span style={{ fontSize: 12, color: T.muted }}>{phase.duration}</span>
                </div>
              </div>
              {phase.courses.map((c, ci) => {
                const key = `${phase.phase}-${ci}`;
                return (
                  <div key={ci} onClick={() => toggleCheck(key)} style={{ ...s.flex, gap: 12, padding: "10px 12px", borderRadius: 10, border: `1px solid ${checked[key] ? T.success + "44" : T.border}`, marginBottom: 8, cursor: "pointer", background: checked[key] ? T.success + "08" : "transparent", transition: "all .15s" }}>
                    <div style={{ width: 20, height: 20, borderRadius: 6, border: `1.5px solid ${checked[key] ? T.success : T.border}`, background: checked[key] ? T.success : "transparent", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>{checked[key] ? "✓" : ""}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 500, color: checked[key] ? T.mutedL : T.text }}>{c.name}</div>
                      <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>{c.platform} · {c.duration} · {c.level}</div>
                    </div>
                    <div style={{ ...s.flex, gap: 6 }}>
                      {c.free && <Tag color={T.success}>Free</Tag>}
                      <Tag color={T.teal}>{c.level}</Tag>
                    </div>
                  </div>
                );
              })}
              <div style={{ marginTop: 10, padding: "10px 12px", background: T.surface, borderRadius: 10 }}>
                <span style={{ fontSize: 12, color: T.amber }}>🎯 Milestone: </span>
                <span style={{ fontSize: 13, color: T.mutedL }}>{phase.milestone}</span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                {phase.skills?.map(sk => <Tag key={sk} color={T.purple}>{sk}</Tag>)}
              </div>
            </div>
          ))}

          {path.certifications?.length > 0 && (
            <div style={s.card}>
              <h3 style={s.h3}>🏆 Recommended Certifications</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
                {path.certifications.map((cert, i) => (
                  <div key={i} style={{ ...s.stat, ...s.flex, gap: 12 }}>
                    <span style={{ fontSize: 24 }}>🎖️</span>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{cert.name}</div>
                      <div style={{ fontSize: 12, color: T.muted }}>{cert.provider}</div>
                      <Tag color={cert.value === "High" ? T.amber : T.teal}>{cert.value} value</Tag>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ── DASHBOARD ───────────────────────────────────────────────────────────────
const Dashboard = ({ resumeData }) => {
  const techStack = [
    { layer: "Frontend", tech: "React / Angular / Flutter", icon: "⚛️" },
    { layer: "Backend", tech: "Node.js / Django / Flask", icon: "🔧" },
    { layer: "NLP / ML", tech: "Python, SpaCy / TensorFlow / Scikit-Learn", icon: "🤖" },
    { layer: "Database", tech: "MongoDB / PostgreSQL", icon: "🗄️" },
    { layer: "Deployment", tech: "AWS / Heroku / Azure", icon: "☁️" },
    { layer: "DevOps", tech: "GitHub CI/CD, Docker", icon: "🐳" },
  ];

  const features = [
    { icon: "📄", title: "Resume Analyzer", status: "Built" },
    { icon: "🧠", title: "Skill Assessment", status: "Built" },
    { icon: "💼", title: "Job Recommendation Engine", status: "Built" },
    { icon: "🚀", title: "Personalized Learning Path", status: "Built" },
    { icon: "📊", title: "Dashboard & Analytics", status: "Built" },
    { icon: "🔗", title: "Job Portal API Integration", status: "Planned" },
    { icon: "📱", title: "Mobile App Version", status: "Planned" },
    { icon: "🤝", title: "Chatbot Career Guidance", status: "Planned" },
  ];

  const barData = resumeData
    ? Object.entries(resumeData.scores).map(([k, v]) => ({ name: k.split("/")[0], score: v }))
    : [{ name: "Analyze Resume", score: 0 }];

  return (
    <div>
      <h1 style={s.h1}>📊 Project Dashboard</h1>
      <p style={{ color: T.mutedL, margin: "0 0 1.5rem" }}>AI-Driven Job Recommendation & Skill Assessment Platform · Sem 6 Project</p>

      <div style={s.grid4}>
        {[
          { label: "Core Features", value: "5", color: T.teal },
          { label: "AI Models Used", value: "3", color: T.amber },
          { label: "Tech Stack Layers", value: "6", color: T.purple },
          { label: "ML Techniques", value: "4+", color: T.success },
        ].map(st => (
          <div key={st.label} style={s.stat}>
            <div style={s.label}>{st.label}</div>
            <div style={{ fontSize: 30, fontWeight: 800, color: st.color, marginTop: 4 }}>{st.value}</div>
          </div>
        ))}
      </div>

      <div style={{ ...s.grid2, marginTop: "1.5rem" }}>
        <div style={s.card}>
          <h3 style={s.h3}>Feature Status</h3>
          {features.map(f => (
            <div key={f.title} style={{ ...s.flex, justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${T.border}` }}>
              <div style={{ ...s.flex, gap: 8, fontSize: 14 }}><span>{f.icon}</span><span style={{ color: T.mutedL }}>{f.title}</span></div>
              <Tag color={f.status === "Built" ? T.success : T.amber}>{f.status}</Tag>
            </div>
          ))}
        </div>
        <div>
          <div style={s.card}>
            <h3 style={s.h3}>Tech Stack</h3>
            {techStack.map(t => (
              <div key={t.layer} style={{ ...s.flex, gap: 12, padding: "8px 0", borderBottom: `1px solid ${T.border}`, fontSize: 13 }}>
                <span>{t.icon}</span>
                <div style={{ width: 80, color: T.teal, fontWeight: 600, flexShrink: 0 }}>{t.layer}</div>
                <div style={{ color: T.mutedL }}>{t.tech}</div>
              </div>
            ))}
          </div>
          {resumeData && (
            <div style={{ ...s.card, marginTop: "1rem" }}>
              <h3 style={s.h3}>Your Domain Scores</h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={barData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                  <XAxis dataKey="name" tick={{ fill: T.muted, fontSize: 10 }} />
                  <YAxis domain={[0, 100]} tick={{ fill: T.muted, fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, fontSize: 12 }} />
                  <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                    {barData.map((entry, i) => <Cell key={i} fill={entry.score >= 70 ? T.teal : entry.score >= 45 ? T.amber : T.danger} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <div style={{ ...s.card, marginTop: "1.5rem", borderColor: T.amber + "44" }}>
        <h3 style={{ ...s.h3, color: T.amber }}>📌 Final Take — Why This Project Stands Out</h3>
        <div style={s.grid2}>
          {["High Resume Impact", "Cutting-Edge AI/NLP", "Real Industry Problem Solved", "Full-Stack Implementation", "Portfolio-Ready Demo", "Great Interview Talking Point"].map(item => (
            <div key={item} style={{ ...s.flex, gap: 10, fontSize: 14, padding: "6px 0" }}>
              <span style={{ color: T.success }}>✓</span>
              <span style={{ color: T.mutedL }}>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── ROOT APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home");
  const [resumeData, setResumeData] = useState(null);

  const tabs = [
    { id: "home", label: "🏠 Home" },
    { id: "resume", label: "📄 Resume" },
    { id: "skills", label: "🧠 Skills" },
    { id: "jobs", label: "💼 Jobs" },
    { id: "learning", label: "🚀 Learning" },
    { id: "dashboard", label: "📊 Dashboard" },
  ];

  return (
    <div style={s.app}>
      <style>{`* { box-sizing: border-box; } button:hover { opacity: 0.85; } textarea:focus, input:focus { border-color: #14b8a6 !important; box-shadow: 0 0 0 2px rgba(20,184,166,.15); }`}</style>
      <header style={s.header}>
        <div style={s.logo}>
          <span style={{ fontSize: 22 }}>⚡</span>
          CareerAI
        </div>
        <nav style={s.nav}>
          {tabs.map(t => (
            <button key={t.id} style={s.navBtn(page === t.id)} onClick={() => setPage(t.id)}>{t.label}</button>
          ))}
        </nav>
        {resumeData && (
          <div style={{ ...s.flex, gap: 8, fontSize: 13 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: T.success, display: "inline-block" }} />
            <span style={{ color: T.mutedL }}>{resumeData.name}</span>
          </div>
        )}
      </header>
      <main style={s.main}>
        {page === "home" && <HomePage setPage={setPage} resumeData={resumeData} />}
        {page === "resume" && <ResumeAnalyzer resumeData={resumeData} setResumeData={setResumeData} />}
        {page === "skills" && <SkillAssessment />}
        {page === "jobs" && <JobRecommendations resumeData={resumeData} />}
        {page === "learning" && <LearningPath resumeData={resumeData} />}
        {page === "dashboard" && <Dashboard resumeData={resumeData} />}
      </main>
    </div>
  );
}
