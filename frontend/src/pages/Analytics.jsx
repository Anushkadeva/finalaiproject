import { useState, useEffect } from 'react';
import { api } from '../services/api';

const DOMAIN_CONFIG = {
  'IT / Software': { color: '#ff6b35', bg: 'rgba(255,107,53,0.08)', icon: '💻' },
  'Data & AI':     { color: '#8b5cf6', bg: 'rgba(139,92,246,0.08)', icon: '🤖' },
  'Design':        { color: '#14b8a6', bg: 'rgba(20,184,166,0.08)', icon: '🎨' },
  'Marketing':     { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', icon: '📣' },
};

const SKILL_LABELS = {
  comm: 'Communication', aptitude: 'Aptitude', ps: 'Problem Solving',
  teamwork: 'Teamwork', adapt: 'Adaptability', prog: 'Programming',
  dsa: 'DSA', webdev: 'Web Dev', sql: 'SQL', ml: 'Machine Learning',
  da: 'Data Analysis', cloud: 'Cloud/DevOps', cyber: 'Cybersecurity',
  dm: 'Digital Marketing', seo: 'SEO', content: 'Content Writing',
  social: 'Social Media', uiux: 'UI/UX Design', graphic: 'Graphic Design',
  video: 'Video Editing', creativity: 'Creativity',
};

function KpiCard({ icon, label, value, sub, color, bg }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 16, padding: '1.5rem',
      boxShadow: '0 2px 16px rgba(0,0,0,0.07)', border: '1px solid rgba(0,0,0,0.06)',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: `linear-gradient(90deg, ${color}, ${color}99)`,
        borderRadius: '16px 16px 0 0',
      }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', color: '#9999bb', marginBottom: 8 }}>{label}</div>
          <div style={{ fontSize: 32, fontWeight: 800, color, lineHeight: 1, marginBottom: 4 }}>{value}</div>
          {sub && <div style={{ fontSize: 12, color: '#9999bb', marginTop: 4 }}>{sub}</div>}
        </div>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function AnimatedBar({ pct, color, height = 8 }) {
  return (
    <div style={{ height, background: '#f2ede8', borderRadius: 99, overflow: 'hidden' }}>
      <div style={{
        height: '100%', width: `${Math.min(pct, 100)}%`, background: color,
        borderRadius: 99, transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)',
      }} />
    </div>
  );
}

export default function Analytics() {
  const [analytics, setAnalytics] = useState({
    domainDistribution: {}, readinessTrends: [],
    skillGaps: [], topSkills: [], placementPredictions: {}
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAnalytics(); }, []);

  const fetchAnalytics = async () => {
    try {
      const [students, analyses] = await Promise.all([
        api.getStudents(),
        fetch('http://localhost:5000/api/analysis/results').then(r => r.json()).catch(() => []),
      ]);

      // Domain distribution
      const domainCounts = {};
      analyses.forEach(a => {
        domainCounts[a.best_domain] = (domainCounts[a.best_domain] || 0) + 1;
      });

      // Readiness trends by month
      const byMonth = {};
      analyses.forEach(a => {
        const month = new Date(a.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
        if (!byMonth[month]) byMonth[month] = [];
        byMonth[month].push(a.readiness_pct);
      });
      const trends = Object.entries(byMonth).map(([month, scores]) => ({
        month,
        average: scores.reduce((s, v) => s + v, 0) / scores.length,
        count: scores.length,
      }));

      // Skill scores
      const skillScores = {};
      students.forEach(student => {
        Object.entries(student).forEach(([key, val]) => {
          if (key.includes('_rating') && typeof val === 'number') {
            const sk = key.replace('_rating', '');
            if (!skillScores[sk]) skillScores[sk] = [];
            skillScores[sk].push(val);
          }
        });
      });

      const skillGaps = Object.entries(skillScores)
        .map(([skill, scores]) => ({
          skill,
          average: scores.reduce((s, v) => s + v, 0) / scores.length,
          studentsBelow3: scores.filter(s => s < 3).length,
        }))
        .filter(s => s.average < 3)
        .sort((a, b) => a.average - b.average)
        .slice(0, 6);

      const topSkills = Object.entries(skillScores)
        .map(([skill, scores]) => ({
          skill,
          average: scores.reduce((s, v) => s + v, 0) / scores.length,
        }))
        .sort((a, b) => b.average - a.average)
        .slice(0, 8);

      setAnalytics({ domainDistribution: domainCounts, readinessTrends: trends, skillGaps, topSkills });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const totalStudents = Object.values(analytics.domainDistribution).reduce((s, v) => s + v, 0);
  const maxDomain = Math.max(...Object.values(analytics.domainDistribution), 1);
  const avgReadiness = analytics.readinessTrends.length
    ? (analytics.readinessTrends.reduce((s, t) => s + t.average, 0) / analytics.readinessTrends.length).toFixed(1)
    : '—';
  const maxTrend = Math.max(...analytics.readinessTrends.map(t => t.average), 1);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: 16 }}>
      <div className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }} />
      <div style={{ color: 'var(--text3)', fontSize: 14 }}>Loading analytics...</div>
    </div>
  );

  return (
    <div style={{ maxWidth: 1200 }}>

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <div style={{ width: 4, height: 28, background: 'var(--orange)', borderRadius: 99 }} />
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text)' }}>Analytics</h1>
          <span style={{ background: 'var(--orange-dim)', color: 'var(--orange)', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99, border: '1px solid var(--orange-border)' }}>LIVE</span>
        </div>
        <p style={{ fontSize: 14, color: 'var(--text2)', marginLeft: 16 }}>Comprehensive insights and placement analytics</p>
      </div>

      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: '2rem' }}>
        <KpiCard icon="👥" label="Total Analyzed" value={totalStudents || '—'} sub="students in system" color="#ff6b35" bg="rgba(255,107,53,0.08)" />
        <KpiCard icon="📊" label="Avg Readiness" value={avgReadiness !== '—' ? `${avgReadiness}%` : '—'} sub="across all analyses" color="#8b5cf6" bg="rgba(139,92,246,0.08)" />
        <KpiCard icon="⚠️" label="Skill Gaps" value={analytics.skillGaps.length} sub="skills below avg 3/5" color="#ef4444" bg="rgba(239,68,68,0.08)" />
        <KpiCard icon="🏆" label="Top Skills" value={analytics.topSkills.length} sub="skills tracked" color="#14b8a6" bg="rgba(20,184,166,0.08)" />
      </div>

      {/* Row 1: Domain Distribution + Readiness Trends */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>

        {/* Domain Distribution */}
        <div className="card" style={{ margin: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div>
              <div className="card-title" style={{ marginBottom: 2 }}>Domain Distribution</div>
              <div style={{ fontSize: 12, color: 'var(--text3)' }}>{totalStudents} students across {Object.keys(analytics.domainDistribution).length} domains</div>
            </div>
            <span style={{ fontSize: 22 }}>🎯</span>
          </div>

          {Object.keys(analytics.domainDistribution).length === 0 ? (
            <div className="empty-state"><div className="empty-icon">📊</div>No data yet</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {Object.entries(analytics.domainDistribution)
                .sort((a, b) => b[1] - a[1])
                .map(([domain, count]) => {
                  const cfg = DOMAIN_CONFIG[domain] || { color: '#ff6b35', bg: 'rgba(255,107,53,0.08)', icon: '📌' };
                  const pct = Math.round((count / maxDomain) * 100);
                  return (
                    <div key={domain} style={{ background: cfg.bg, borderRadius: 12, padding: '14px 16px', border: `1px solid ${cfg.color}22` }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: 18 }}>{cfg.icon}</span>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{domain}</div>
                            <div style={{ fontSize: 11, color: 'var(--text3)' }}>{count} students</div>
                          </div>
                        </div>
                        <div style={{ fontFamily: 'var(--mono)', fontSize: 18, fontWeight: 800, color: cfg.color }}>{Math.round((count / totalStudents) * 100)}%</div>
                      </div>
                      <AnimatedBar pct={pct} color={cfg.color} height={6} />
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* Readiness Trends */}
        <div className="card" style={{ margin: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div>
              <div className="card-title" style={{ marginBottom: 2 }}>Readiness Trends</div>
              <div style={{ fontSize: 12, color: 'var(--text3)' }}>Monthly average readiness scores</div>
            </div>
            <span style={{ fontSize: 22 }}>📈</span>
          </div>

          {analytics.readinessTrends.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">📈</div>No trend data yet</div>
          ) : (
            <div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 180, padding: '0 8px', marginBottom: 12 }}>
                {analytics.readinessTrends.map((trend) => {
                  const barH = Math.max((trend.average / maxTrend) * 140, 8);
                  const color = trend.average >= 70 ? '#22c55e' : trend.average >= 50 ? '#ff6b35' : '#ef4444';
                  return (
                    <div key={trend.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color, fontFamily: 'var(--mono)' }}>{trend.average.toFixed(0)}%</div>
                      <div style={{
                        width: '100%', maxWidth: 36, height: barH, background: color,
                        borderRadius: '6px 6px 0 0', opacity: 0.85,
                        boxShadow: `0 4px 12px ${color}44`,
                        transition: 'height 0.6s ease',
                      }} />
                      <div style={{ fontSize: 9, color: 'var(--text3)', textAlign: 'center', lineHeight: 1.2 }}>{trend.month}</div>
                    </div>
                  );
                })}
              </div>
              <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
                {[['#22c55e', '≥70% Ready'], ['#ff6b35', '50–70%'], ['#ef4444', '<50%']].map(([c, l]) => (
                  <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text3)' }}>
                    <div style={{ width: 10, height: 10, borderRadius: 3, background: c }} />{l}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Row 2: Top Skills + Skill Gaps */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* Top Skills */}
        <div className="card" style={{ margin: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div>
              <div className="card-title" style={{ marginBottom: 2 }}>Top Skills</div>
              <div style={{ fontSize: 12, color: 'var(--text3)' }}>Highest rated skills across students</div>
            </div>
            <span style={{ fontSize: 22 }}>⭐</span>
          </div>

          {analytics.topSkills.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">⭐</div>No skill data yet</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {analytics.topSkills.map((skill, i) => {
                const label = SKILL_LABELS[skill.skill] || skill.skill.replace(/_/g, ' ');
                const pct = (skill.average / 5) * 100;
                const color = skill.average >= 4 ? '#22c55e' : skill.average >= 3 ? '#ff6b35' : '#f59e0b';
                const rankColors = ['#ff6b35', '#8b5cf6', '#14b8a6', '#f59e0b', '#22c55e'];
                return (
                  <div key={skill.skill} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'var(--bg3)', borderRadius: 10 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 8, background: rankColors[i % rankColors.length],
                      color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 800, flexShrink: 0,
                    }}>#{i + 1}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', textTransform: 'capitalize' }}>{label}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color, fontFamily: 'var(--mono)' }}>{skill.average.toFixed(1)}/5</span>
                      </div>
                      <AnimatedBar pct={pct} color={color} height={5} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Skill Gaps */}
        <div className="card" style={{ margin: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div>
              <div className="card-title" style={{ marginBottom: 2 }}>Skill Gaps</div>
              <div style={{ fontSize: 12, color: 'var(--text3)' }}>Skills needing improvement (avg &lt; 3/5)</div>
            </div>
            <span style={{ fontSize: 22 }}>⚠️</span>
          </div>

          {analytics.skillGaps.length === 0 ? (
            <div className="empty-state" style={{ color: 'var(--success)' }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>✅</div>
              No critical skill gaps found!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {analytics.skillGaps.map((gap, i) => {
                const label = SKILL_LABELS[gap.skill] || gap.skill.replace(/_/g, ' ');
                const severity = gap.average < 1.5 ? 'Critical' : gap.average < 2 ? 'High' : 'Medium';
                const sevColor = gap.average < 1.5 ? '#ef4444' : gap.average < 2 ? '#f59e0b' : '#ff6b35';
                const pct = (gap.average / 5) * 100;
                return (
                  <div key={gap.skill} style={{
                    padding: '12px 14px', borderRadius: 10,
                    background: `${sevColor}08`, border: `1px solid ${sevColor}22`,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 14 }}>⚠️</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', textTransform: 'capitalize' }}>{label}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: `${sevColor}18`, color: sevColor }}>{severity}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: sevColor, fontFamily: 'var(--mono)' }}>{gap.average.toFixed(1)}/5</span>
                      </div>
                    </div>
                    <AnimatedBar pct={pct} color={sevColor} height={5} />
                    <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 6 }}>
                      {gap.studentsBelow3} students rated below 3.0
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
