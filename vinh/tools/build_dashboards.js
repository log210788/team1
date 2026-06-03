const fs = require('fs');
const path = require('path');

// Paths
const expandedCurriculumPath = path.join(__dirname, 'expanded_curriculum.json');
const tutorDashboardPath = path.join(__dirname, '..', 'Tutor_Dashboard.html');
const studentDashboardPath = path.join(__dirname, '..', 'Student_Dashboard.html');

console.log('Starting build process...');

// 1. Read expanded curriculum database
if (!fs.existsSync(expandedCurriculumPath)) {
  console.error(`Error: ${expandedCurriculumPath} not found!`);
  process.exit(1);
}
const expandedData = JSON.parse(fs.readFileSync(expandedCurriculumPath, 'utf8'));
const databaseString = JSON.stringify(expandedData, null, 2);

console.log(`Successfully loaded ${expandedData.length} lessons from expanded_curriculum.json.`);

// 2. Update Tutor_Dashboard.html
if (fs.existsSync(tutorDashboardPath)) {
  let tutorHtml = fs.readFileSync(tutorDashboardPath, 'utf8');
  
  // Replace curriculumData array in Tutor_Dashboard.html
  // We use a robust regex that matches the declaration up to the let currentLessonIndex declaration
  const regex = /const curriculumData\s*=\s*\[[\s\S]*?\];*\s*(?=\s*let currentLessonIndex)/;
  if (regex.test(tutorHtml)) {
    tutorHtml = tutorHtml.replace(regex, `const curriculumData = ${databaseString};\n\n    `);
    fs.writeFileSync(tutorDashboardPath, tutorHtml, 'utf8');
    console.log('Successfully updated Tutor_Dashboard.html with the expanded database!');
  } else {
    console.error('Failed to locate curriculumData array in Tutor_Dashboard.html to replace.');
  }
} else {
  console.warn('Tutor_Dashboard.html not found, skipping update.');
}

// 3. Generate Student_Dashboard.html
const studentHtmlTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vinh's RP Accent Refinement Dashboard & Journey</title>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Fira+Code:wght@400;500&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-dark: #090d16;
      --card-bg: rgba(17, 24, 39, 0.6);
      --card-border: rgba(255, 255, 255, 0.08);
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
      --primary: #6366f1;
      --primary-hover: #4f46e5;
      --voiced: #10b981;
      --voiceless: #f87171;
      --amber: #f59e0b;
      --glow: rgba(99, 102, 241, 0.25);
    }
    
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Outfit', sans-serif; }
    body { background: radial-gradient(circle at top right, #1e1b4b, #090d16 60%); color: var(--text-main); min-height: 100vh; overflow-x: hidden; padding-bottom: 80px; }
    
    /* Navigation Bar */
    header {
      background: rgba(15, 23, 42, 0.7);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--card-border);
      padding: 15px 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: sticky;
      top: 0;
      z-index: 100;
    }
    
    .logo-container {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .logo-badge {
      background: linear-gradient(135deg, var(--primary), #a855f7);
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1.2rem;
      border: 1px solid rgba(255,255,255,0.2);
    }
    
    .logo-text h1 {
      font-size: 1.1rem;
      font-weight: 700;
      letter-spacing: 0.5px;
    }
    
    .logo-text p {
      font-size: 0.75rem;
      color: var(--text-muted);
    }
    
    .nav-tabs {
      display: flex;
      gap: 8px;
    }
    
    .tab-btn {
      background: transparent;
      border: 1px solid transparent;
      color: var(--text-muted);
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 0.9rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .tab-btn:hover {
      background: rgba(255,255,255,0.04);
      color: var(--text-main);
    }
    
    .tab-btn.active {
      background: rgba(99, 102, 241, 0.15);
      border-color: rgba(99, 102, 241, 0.3);
      color: var(--text-main);
      box-shadow: 0 0 10px var(--glow);
    }
    
    /* Layout container */
    .app-container { max-width: 1400px; margin: 30px auto; padding: 0 20px; }
    
    /* Glassmorphism Cards */
    .glass-card { background: var(--card-bg); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border: 1px solid var(--card-border); border-radius: 16px; padding: 25px; box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3); transition: all 0.3s ease; }
    .glass-card:hover { border-color: rgba(255, 255, 255, 0.12); }
    
    .card-title { font-size: 1.1rem; font-weight: 600; margin-bottom: 15px; display: flex; align-items: center; gap: 8px; color: var(--primary); }
    .card-title span { color: var(--text-main); }
    
    /* Tab Contents */
    .tab-content { display: none; }
    .tab-content.active { display: block; animation: fadeIn 0.3s ease-in-out; }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(5px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    /* ---------------------------------------------------- */
    /* ACCENT JOURNEY PRESENTATION STYLING */
    /* ---------------------------------------------------- */
    .presentation-container {
      display: flex;
      flex-direction: column;
      gap: 25px;
    }
    
    .timeline-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: relative;
      padding: 0 10px;
      margin-bottom: 10px;
    }
    
    .timeline-line {
      position: absolute;
      top: 50%;
      left: 20px;
      right: 20px;
      height: 3px;
      background: rgba(255,255,255,0.06);
      z-index: 1;
      transform: translateY(-50%);
    }
    
    .timeline-line-progress {
      position: absolute;
      top: 50%;
      left: 20px;
      height: 3px;
      background: linear-gradient(90deg, var(--primary), var(--voiced));
      z-index: 2;
      transform: translateY(-50%);
      transition: width 0.4s ease;
      width: 0%;
    }
    
    .timeline-step {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #111827;
      border: 2px solid rgba(255,255,255,0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.85rem;
      color: var(--text-muted);
      cursor: pointer;
      position: relative;
      z-index: 3;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .timeline-step:hover {
      border-color: var(--primary);
      color: var(--text-main);
      transform: scale(1.1);
    }
    
    .timeline-step.completed {
      background: var(--voiced);
      border-color: var(--voiced);
      color: white;
    }
    
    .timeline-step.active {
      background: var(--primary);
      border-color: var(--primary);
      color: white;
      box-shadow: 0 0 15px var(--primary);
      transform: scale(1.15);
    }
    
    .timeline-step-label {
      position: absolute;
      top: 42px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 0.7rem;
      white-space: nowrap;
      color: var(--text-muted);
      font-weight: 500;
      opacity: 0.8;
      transition: all 0.2s;
    }
    
    .timeline-step.active .timeline-step-label {
      color: var(--primary);
      font-weight: 600;
      opacity: 1;
    }
    
    /* Presentation Slide Card */
    .slide-card {
      background: linear-gradient(135deg, rgba(23, 28, 41, 0.8), rgba(9, 13, 22, 0.8));
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 20px;
      padding: 40px;
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      gap: 40px;
      position: relative;
      overflow: hidden;
      box-shadow: 0 20px 50px rgba(0,0,0,0.5);
    }
    
    .slide-card::before {
      content: '';
      position: absolute;
      top: -10%;
      right: -10%;
      width: 300px;
      height: 300px;
      background: radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%);
      pointer-events: none;
    }
    
    .slide-left {
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 20px;
    }
    
    .slide-right {
      display: flex;
      flex-direction: column;
      justify-content: center;
      background: rgba(255,255,255,0.02);
      border: 1px solid rgba(255,255,255,0.05);
      border-radius: 16px;
      padding: 25px;
      gap: 20px;
    }
    
    .slide-badge {
      align-self: flex-start;
      background: linear-gradient(90deg, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.2));
      border: 1px solid rgba(99, 102, 241, 0.4);
      color: #a5b4fc;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .slide-title {
      font-size: 2rem;
      font-weight: 700;
      line-height: 1.2;
      color: #fff;
    }
    
    .slide-sound-focus {
      font-size: 1.1rem;
      color: var(--voiced);
      font-family: 'Fira Code', monospace;
      background: rgba(16, 185, 129, 0.08);
      padding: 8px 12px;
      border-radius: 8px;
      border-left: 4px solid var(--voiced);
    }
    
    .slide-description {
      font-size: 0.95rem;
      line-height: 1.6;
      color: var(--text-muted);
    }
    
    .slide-dc-connection {
      background: rgba(245, 158, 11, 0.05);
      border-left: 4px solid var(--amber);
      padding: 12px 15px;
      border-radius: 0 8px 8px 0;
      font-size: 0.9rem;
      line-height: 1.5;
    }
    
    .slide-dc-connection strong {
      color: var(--amber);
    }
    
    .slide-vocab-box {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 10px;
    }
    
    .slide-vocab-item {
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.06);
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 0.8rem;
      color: #cbd5e1;
    }
    
    .roi-pill {
      display: flex;
      align-items: center;
      gap: 10px;
      background: rgba(99, 102, 241, 0.08);
      padding: 10px 15px;
      border-radius: 10px;
      border: 1px solid rgba(99, 102, 241, 0.15);
      font-size: 0.85rem;
      line-height: 1.4;
    }
    
    .roi-pill span {
      background: var(--primary);
      color: white;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: bold;
      flex-shrink: 0;
    }
    
    .slide-practice-box {
      background: rgba(0,0,0,0.2);
      border-radius: 12px;
      padding: 18px;
      border: 1px solid rgba(255,255,255,0.04);
    }
    
    .slide-practice-header {
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--primary);
      text-transform: uppercase;
      margin-bottom: 8px;
      letter-spacing: 0.5px;
    }
    
    .slide-practice-phrase {
      font-size: 1.05rem;
      line-height: 1.5;
      font-weight: 500;
      color: #f1f5f9;
      margin-bottom: 12px;
    }
    
    .slide-practice-action {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
    }
    
    .slide-practice-ipa {
      font-family: 'Fira Code', monospace;
      font-size: 0.78rem;
      color: var(--text-muted);
      background: rgba(255,255,255,0.03);
      padding: 4px 8px;
      border-radius: 4px;
      max-width: 65%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    /* Navigation Controls */
    .presentation-controls {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 10px 20px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.9rem;
      cursor: pointer;
      border: 1px solid transparent;
      transition: all 0.2s ease;
      text-decoration: none;
    }
    
    .btn-primary { background: var(--primary); color: white; }
    .btn-primary:hover { background: var(--primary-hover); box-shadow: 0 0 12px var(--glow); }
    .btn-secondary { background: rgba(255,255,255,0.05); border-color: var(--card-border); color: var(--text-main); }
    .btn-secondary:hover { background: rgba(255,255,255,0.1); }
    .btn-secondary:disabled { background: rgba(255,255,255,0.01); color: rgba(255,255,255,0.15); border-color: rgba(255,255,255,0.02); cursor: not-allowed; }
    
    /* ---------------------------------------------------- */
    /* PRACTICE LAB (LESSON VIEW) STYLING */
    /* ---------------------------------------------------- */
    .lab-layout {
      display: grid;
      grid-template-columns: 320px 1fr;
      gap: 25px;
    }
    
    .lab-sidebar {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    
    .lab-lessons-nav {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .lab-nav-item {
      display: flex;
      align-items: center;
      padding: 12px 16px;
      background: rgba(255,255,255,0.02);
      border: 1px solid transparent;
      border-radius: 10px;
      color: var(--text-muted);
      cursor: pointer;
      transition: all 0.2s ease;
      gap: 10px;
      text-decoration: none;
      font-size: 0.88rem;
    }
    
    .lab-nav-item:hover {
      background: rgba(255,255,255,0.04);
      color: var(--text-main);
    }
    
    .lab-nav-item.active {
      background: rgba(99, 102, 241, 0.12);
      border-color: rgba(99, 102, 241, 0.25);
      color: var(--text-main);
      box-shadow: 0 0 15px rgba(99, 102, 241, 0.1);
    }
    
    .lab-nav-item .badge {
      background: rgba(255,255,255,0.08);
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 0.72rem;
      font-weight: 700;
      color: var(--text-main);
    }
    
    .lab-nav-item.active .badge {
      background: var(--primary);
    }
    
    .lab-nav-item .chk-completed {
      margin-left: auto;
      width: 16px;
      height: 16px;
      border-radius: 4px;
      border: 1px solid rgba(255,255,255,0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.65rem;
      color: transparent;
      transition: all 0.2s;
    }
    
    .lab-nav-item.completed .chk-completed {
      background: var(--voiced);
      border-color: var(--voiced);
      color: white;
    }
    
    .lab-nav-item.completed .chk-completed::after {
      content: "✓";
      display: block;
      font-weight: bold;
    }
    
    /* Lab Main Area */
    .lab-main {
      display: flex;
      flex-direction: column;
      gap: 25px;
    }
    
    .lab-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 1px solid var(--card-border);
      padding-bottom: 15px;
    }
    
    .lab-title-area h2 {
      font-size: 1.6rem;
      font-weight: 700;
      color: white;
      margin-bottom: 4px;
    }
    
    .lab-title-area p {
      font-size: 0.9rem;
      color: var(--text-muted);
    }
    
    .lab-columns {
      display: grid;
      grid-template-columns: 1.3fr 1fr;
      gap: 25px;
    }
    
    /* Click to Reveal Cards */
    .drill-instruction { font-size: 0.85rem; color: var(--text-muted); margin-bottom: 15px; }
    .drill-list { display: flex; flex-direction: column; gap: 10px; }
    .drill-group-title { font-size: 0.85rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin: 15px 0 5px; border-bottom: 1px dashed rgba(255,255,255,0.08); padding-bottom: 4px; }
    
    .drill-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04); border-radius: 10px; padding: 12px 16px; cursor: pointer; transition: all 0.2s ease; }
    .drill-card:hover { background: rgba(255,255,255,0.04); border-color: rgba(255,255,255,0.08); }
    .drill-card.expanded { background: rgba(30, 41, 59, 0.6); border-color: rgba(99, 102, 241, 0.25); }
    
    .drill-main-line { display: flex; align-items: center; justify-content: space-between; }
    .drill-word-container { display: flex; align-items: center; gap: 8px; }
    .drill-word { font-weight: 600; font-size: 1.05rem; }
    .drill-word.pair-word { font-size: 0.95rem; }
    .drill-ipa { font-family: 'Fira Code', monospace; font-size: 0.82rem; color: var(--voiced); background: rgba(16, 185, 129, 0.08); padding: 2px 6px; border-radius: 4px; }
    .speaker-btn { background: rgba(255,255,255,0.05); border: none; color: var(--text-main); width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background 0.2s; font-size: 0.75rem; }
    .speaker-btn:hover { background: var(--primary); }
    
    .drill-pair-connector { color: var(--text-muted); font-size: 0.75rem; padding: 0 2px; }
    
    .reveal-details { max-height: 0; overflow: hidden; opacity: 0; transition: max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease; }
    .drill-card.expanded .reveal-details { max-height: 350px; opacity: 1; margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.06); }
    
    .guide-box { display: grid; grid-template-columns: 1fr; gap: 10px; font-size: 0.85rem; line-height: 1.45; }
    .guide-section { padding: 10px; border-radius: 6px; }
    .guide-section.sensation { background: rgba(16, 185, 129, 0.04); border-left: 3px solid var(--voiced); }
    .guide-section.sensation strong { color: var(--voiced); }
    
    /* Warm-up lists */
    .warmup-item { display: flex; gap: 10px; margin-bottom: 8px; font-size: 0.88rem; line-height: 1.45; }
    .warmup-num { width: 20px; height: 20px; border-radius: 50%; background: rgba(99, 102, 241, 0.2); color: var(--primary); font-weight: bold; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 0.75rem; margin-top: 2px; }
    
    /* Homework tasks */
    .homework-list { display: flex; flex-direction: column; gap: 10px; font-size: 0.88rem; }
    .homework-item { display: flex; gap: 8px; align-items: flex-start; }
    .homework-item input { margin-top: 3px; cursor: pointer; }
    
    .video-card { display: flex; align-items: center; gap: 12px; background: rgba(255, 0, 0, 0.03); border: 1px dashed rgba(239, 68, 68, 0.2); border-radius: 10px; padding: 12px; margin-top: 15px; text-decoration: none; color: inherit; }
    .video-card:hover { background: rgba(255, 0, 0, 0.05); }
    .video-icon { font-size: 1.8rem; color: #ef4444; }
    
    /* ---------------------------------------------------- */
    /* VOCAL TRACT DIAGRAM STYLING */
    /* ---------------------------------------------------- */
    .vocal-tract-layout {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
      align-items: center;
    }
    
    .vocal-tract-svg { width: 100%; max-height: 380px; background: rgba(10, 15, 30, 0.4); border-radius: 16px; border: 1px solid rgba(255,255,255,0.05); padding: 10px; }
    .articulator { fill: none; stroke: #334155; stroke-width: 5; stroke-linecap: round; transition: all 0.3s ease; }
    .articulator-fill { fill: rgba(51, 65, 85, 0.1); stroke: #334155; stroke-width: 2; stroke-linecap: round; transition: all 0.3s ease; }
    
    svg .active[data-part="lips"] { stroke: #f43f5e; filter: drop-shadow(0 0 6px #f43f5e); }
    svg .active[data-part="teeth"] { stroke: #f8fafc; filter: drop-shadow(0 0 6px #ffffff); }
    svg .active[data-part="alveolar"] { stroke: #6366f1; filter: drop-shadow(0 0 6px #6366f1); }
    svg .active[data-part="palate"] { stroke: #a855f7; filter: drop-shadow(0 0 6px #a855f7); }
    svg .active[data-part="velum"] { stroke: #ec4899; filter: drop-shadow(0 0 6px #ec4899); }
    svg .active[data-part="tongue-tip"] { stroke: #f97316; filter: drop-shadow(0 0 6px #f97316); }
    svg .active[data-part="tongue-body"] { stroke: #ef4444; fill: rgba(239, 68, 68, 0.25); filter: drop-shadow(0 0 6px #ef4444); }
    svg .active[data-part="throat"] { stroke: #10b981; filter: drop-shadow(0 0 6px #10b981); }
    
    .legend-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
    .legend-item { display: flex; align-items: center; gap: 8px; padding: 10px; background: rgba(255,255,255,0.02); border-radius: 8px; cursor: pointer; transition: all 0.2s; border-left: 4px solid transparent; font-size: 0.88rem; }
    .legend-item:hover { background: rgba(255,255,255,0.05); }
    .legend-item.active { background: rgba(255,255,255,0.06); }
    .legend-item.lips { border-color: #f43f5e; }
    .legend-item.teeth { border-color: #f8fafc; }
    .legend-item.alveolar { border-color: #6366f1; }
    .legend-item.palate { border-color: #a855f7; }
    .legend-item.velum { border-color: #ec4899; }
    .legend-item.tongue-tip { border-color: #f97316; }
    .legend-item.tongue-body { border-color: #ef4444; }
    .legend-item.throat { border-color: #10b981; }
    
    .legend-info-box { font-size: 0.92rem; line-height: 1.5; background: rgba(255,255,255,0.03); border-radius: 12px; padding: 15px; border: 1px solid rgba(255,255,255,0.05); min-height: 80px; }
    
    /* ---------------------------------------------------- */
    /* VOICE RECORDER STYLING */
    /* ---------------------------------------------------- */
    .recorder-layout {
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      gap: 30px;
    }
    
    .recorder-widget { display: flex; flex-direction: column; gap: 15px; }
    .canvas-container { position: relative; width: 100%; height: 120px; background: #070a13; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255, 255, 255, 0.05); }
    #waveform-canvas { width: 100%; height: 100%; display: block; }
    .recorder-controls { display: flex; gap: 12px; align-items: center; justify-content: space-between; }
    .rec-time { font-family: 'Fira Code', monospace; font-size: 1rem; color: var(--text-muted); }
    
    .record-btn { display: flex; align-items: center; gap: 8px; background: rgba(239, 68, 68, 0.15); border-color: rgba(239, 68, 68, 0.3); color: #f87171; }
    .record-btn.recording { background: #ef4444; color: white; animation: pulse 1.5s infinite; }
    .record-btn.recording .pulse-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: white; }
    
    .comparison-engine {
      background: rgba(255,255,255,0.02);
      border: 1px solid rgba(255,255,255,0.05);
      border-radius: 16px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 15px;
    }
    
    .comp-textarea {
      width: 100%;
      height: 80px;
      background: rgba(0,0,0,0.25);
      border: 1px solid var(--card-border);
      border-radius: 8px;
      padding: 10px 12px;
      color: var(--text-main);
      font-size: 0.9rem;
      resize: none;
      outline: none;
    }
    
    .comp-textarea:focus {
      border-color: var(--primary);
    }
    
    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
      70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
      100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
    }
    
    /* Footer Persistent Bar */
    .footer-bar { position: fixed; bottom: 0; left: 0; right: 0; height: 75px; background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(15px); border-top: 1px solid var(--card-border); display: flex; align-items: center; justify-content: space-between; padding: 0 40px; z-index: 100; box-shadow: 0 -4px 20px rgba(0,0,0,0.4); }
    .footer-info { display: flex; align-items: center; gap: 10px; }
    
    /* Print Layout Template */
    #print-layout { display: none; }
    
    @media print {
      body * { visibility: hidden; background: transparent !important; color: black !important; }
      #print-layout, #print-layout * { visibility: visible; }
      #print-layout { display: block !important; position: absolute; left: 0; top: 0; width: 100%; color: black; background: white; padding: 30px; font-size: 11pt; }
      .print-header { border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; text-align: center; }
      .print-title { font-size: 18pt; font-weight: 700; margin-bottom: 5px; }
      .print-subtitle { font-size: 11pt; color: #555; }
      .print-section { margin-bottom: 20px; page-break-inside: avoid; }
      .print-section-title { font-size: 13pt; font-weight: 600; border-bottom: 1px solid #ccc; padding-bottom: 4px; margin-bottom: 8px; text-transform: uppercase; color: #4f46e5; }
      .print-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
      .print-table th, .print-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
      .print-table th { background-color: #f3f4f6 !important; font-weight: 600; }
    }
    
    @media (max-width: 1024px) {
      .lab-layout { grid-template-columns: 1fr; }
      .lab-columns { grid-template-columns: 1fr; }
      .vocal-tract-layout { grid-template-columns: 1fr; }
      .recorder-layout { grid-template-columns: 1fr; }
      .slide-card { grid-template-columns: 1fr; padding: 25px; gap: 20px; }
      header { flex-direction: column; gap: 15px; padding: 15px; }
    }
  </style>
</head>
<body>

  <!-- Top Navigation Header -->
  <header class="no-print">
    <div class="logo-container">
      <div class="logo-badge">V</div>
      <div class="logo-text">
        <h1>Vinh's Accent Journey</h1>
        <p>RP Accent Refinement for D.C. Finance</p>
      </div>
    </div>
    
    <div class="nav-tabs">
      <button class="tab-btn active" onclick="switchTab('journey')">🚀 Journey Roadmap</button>
      <button class="tab-btn" onclick="switchTab('lab')">📚 Practice Lab</button>
      <button class="tab-btn" onclick="switchTab('vocal')">👄 Vocal Tract</button>
      <button class="tab-btn" onclick="switchTab('recorder')">🎙️ Voice Recorder</button>
      <a href="lesson_rp_storytelling.html" target="_blank" class="tab-btn" style="text-decoration: none; color: var(--primary); border: 1px solid rgba(99, 102, 241, 0.3);">📖 Storytelling Masterclass 🚀</a>
    </div>
  </header>

  <div class="app-container no-print">
    
    <!-- 1. ACCENT JOURNEY ROADMAP TAB -->
    <div id="tab-journey" class="tab-content active">
      <div class="glass-card presentation-container">
        <div>
          <h2 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 5px;">🚀 Your Received Pronunciation (RP) Journey</h2>
          <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 20px;">An interactive roadmap mapping out your progress over the next 8 lessons to build executive presence in Washington D.C.</p>
        </div>
        
        <!-- Timeline Navigation Indicator -->
        <div class="timeline-container">
          <div class="timeline-line"></div>
          <div id="timeline-progress" class="timeline-line-progress"></div>
          
          <div class="timeline-step active" onclick="jumpToSlide(0)" data-slide="0">
            1
            <div class="timeline-step-label">Awareness</div>
          </div>
          <div class="timeline-step" onclick="jumpToSlide(1)" data-slide="1">
            2
            <div class="timeline-step-label">Plosives</div>
          </div>
          <div class="timeline-step" onclick="jumpToSlide(2)" data-slide="2">
            3
            <div class="timeline-step-label">Fricatives</div>
          </div>
          <div class="timeline-step" onclick="jumpToSlide(3)" data-slide="3">
            4
            <div class="timeline-step-label">Softeners</div>
          </div>
          <div class="timeline-step" onclick="jumpToSlide(4)" data-slide="4">
            5
            <div class="timeline-step-label">Plurals</div>
          </div>
          <div class="timeline-step" onclick="jumpToSlide(5)" data-slide="5">
            6
            <div class="timeline-step-label">Past Tense</div>
          </div>
          <div class="timeline-step" onclick="jumpToSlide(6)" data-slide="6">
            7
            <div class="timeline-step-label">Rhythm</div>
          </div>
          <div class="timeline-step" onclick="jumpToSlide(7)" data-slide="7">
            8
            <div class="timeline-step-label">Linking</div>
          </div>
          <div class="timeline-step" onclick="jumpToSlide(8)" data-slide="8">
            9
            <div class="timeline-step-label">Pitch</div>
          </div>
        </div>
        
        <!-- Presentation Slide Content -->
        <div class="slide-card" id="slide-card">
          <!-- Populated by JS -->
        </div>
        
        <!-- Controls -->
        <div class="presentation-controls">
          <button class="btn btn-secondary" id="prev-slide-btn" onclick="prevSlide()">← Previous Milestone</button>
          <div style="font-size: 0.9rem; color: var(--text-muted);" id="slide-counter-display">Milestone 1 of 9</div>
          <button class="btn btn-primary" id="next-slide-btn" onclick="nextSlide()">Next Milestone →</button>
        </div>
      </div>
    </div>
    
    <!-- 2. PRACTICE LAB (LESSON ARCH) TAB -->
    <div id="tab-lab" class="tab-content">
      <div class="lab-layout">
        
        <!-- Lab Sidebar: 9 Lesson Selector -->
        <div class="lab-sidebar">
          <div class="glass-card">
            <h3 class="card-title">📚 Course <span>Curriculum</span></h3>
            <div class="lab-lessons-nav" id="lab-curriculum-nav">
              <!-- Populated by JS -->
            </div>
            
            <div style="margin-top: 20px; border-top: 1px solid var(--card-border); padding-top: 15px;">
              <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 8px;">
                <span color="var(--text-muted)">Overall Completion</span>
                <span id="completion-percentage-display" style="font-weight: 600; color: var(--voiced);">0%</span>
              </div>
              <div style="height: 6px; background: rgba(255,255,255,0.08); border-radius: 3px; overflow: hidden;">
                <div id="overall-progress-bar-fill" style="height: 100%; width: 0%; background: linear-gradient(90deg, var(--primary), var(--voiced)); transition: width 0.4s ease;"></div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Lab Main Area -->
        <div class="lab-main">
          <div class="glass-card">
            <div class="lab-header">
              <div class="lab-title-area">
                <h2 id="lab-lesson-headline">Lesson 1: The D.C. Pitch & Articulator Awareness</h2>
                <p id="lab-lesson-sub">Focus on physical control and mouth mapping</p>
              </div>
              <div>
                <button class="btn btn-secondary" onclick="generatePrintCard()">🖨️ Print Cheat Sheet</button>
                <button class="btn btn-secondary" id="lab-mark-complete-btn" onclick="toggleCurrentLessonCompletion()" style="margin-left: 8px;">Mark Completed</button>
              </div>
            </div>
            
            <div class="lab-columns">
              
              <!-- Left Column: Core Focus, Warm-ups, and Click-to-Reveal Drills -->
              <div>
                <h3 class="card-title" style="margin-top: 15px;">🎯 Focus & Boardroom Importance</h3>
                <div id="lab-lesson-focus" style="font-size: 0.9rem; line-height: 1.5; color: #e2e8f0; margin-bottom: 10px;">
                  Mouth mapping.
                </div>
                <div class="slide-dc-connection" id="lab-lesson-dc-connection" style="margin-bottom: 20px;">
                  <strong>D.C. Finance Impact:</strong> Precision at word endings matches transaction digits.
                </div>
                
                <h3 class="card-title">🔥 Physical Warm-up Routines</h3>
                <div id="lab-warmup-container" style="margin-bottom: 25px;">
                  <!-- Warm-ups rendered by JS -->
                </div>
                
                <h3 class="card-title">🗣️ Practice Exercises (Click to Pronounce)</h3>
                <p class="drill-instruction">Click on words or minimal pairs to hear the model British RP pronunciation. Click opens structural details and physical vocal sensation cues.</p>
                <div class="drill-list" id="lab-drill-list-container">
                  <!-- Drills rendered by JS -->
                </div>
              </div>
              
              <!-- Right Column: Home Practice, Video resources, and session notes -->
              <div style="display: flex; flex-direction: column; gap: 20px;">
                
                <!-- Persistent Recorder Link Card -->
                <div class="glass-card" style="background: rgba(99, 102, 241, 0.05); border-color: rgba(99, 102, 241, 0.15);">
                  <h4 style="font-size: 1rem; font-weight: 600; color: var(--primary); margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">🎙️ Self-Practice Recorder</h4>
                  <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 12px;">Need to test your pronunciation? Use our dedicated recording deck to check your airflow, vowel length, and ending releases.</p>
                  <button class="btn btn-primary" style="width: 100%;" onclick="switchTab('recorder')">Launch Recorder tab</button>
                </div>
                
                <!-- Homework Checklist -->
                <div class="glass-card">
                  <h3 class="card-title">🏡 Daily Practice Homework</h3>
                  <div class="homework-list" id="lab-homework-container">
                    <!-- Homework checklist items -->
                  </div>
                  
                  <a href="#" target="_blank" class="video-card" id="lab-video-link">
                    <div class="video-icon">▶</div>
                    <div>
                      <div style="font-weight: 600; font-size: 0.82rem; color: #ef4444;">RECOMMENDED LESSON VIDEO</div>
                      <div id="lab-video-title" style="font-size: 0.8rem; color: var(--text-muted);">Video description</div>
                    </div>
                  </a>
                </div>
                
                <!-- Session Notes Display (Customized by tutor during class) -->
                <div class="glass-card" id="student-notes-card" style="display: none;">
                  <h3 class="card-title" style="color: var(--amber);">📝 Customized Tutor Feedback</h3>
                  <div id="student-notes-content" style="font-size: 0.85rem; line-height: 1.5; color: #cbd5e1; background: rgba(0,0,0,0.15); padding: 12px; border-radius: 8px; border-left: 3px solid var(--amber);">
                    No customized comments left yet.
                  </div>
                </div>
                
              </div>
              
            </div>
          </div>
        </div>
        
      </div>
    </div>
    
    <!-- 3. VOCAL TRACT TAB -->
    <div id="tab-vocal" class="tab-content">
      <div class="glass-card">
        <h2 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 10px;">👄 Vocal Tract Placement Guide</h2>
        <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 25px;">Understanding where sounds are produced physically in the mouth is the most powerful tool for accent modification. Click on any articulator name or path in the SVG below to reveal the mechanical instructions.</p>
        
        <div class="vocal-tract-layout">
          <!-- Left side: SVG -->
          <svg viewBox="0 0 260 260" class="vocal-tract-svg" id="vocal-tract">
            <!-- Pharynx wall -->
            <path id="part-throat" class="articulator" data-part="throat" d="M 180,80 L 180,220" />
            
            <!-- Contour Face background -->
            <path d="M 40,20 C 40,50 30,70 30,80 Q 20,90 20,100 C 35,105 35,110 30,115 C 25,120 20,122 20,128 C 20,134 35,136 30,142 C 25,148 15,150 18,158 C 20,166 35,170 30,185 C 25,200 20,210 20,230" fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="2" />
            
            <!-- Lips -->
            <path id="part-lips-upper" class="articulator" data-part="lips" d="M 60,95 C 70,95 78,97 82,105" />
            <path id="part-lips-lower" class="articulator" data-part="lips" d="M 58,142 C 68,142 76,139 79,130" />
            
            <!-- Teeth -->
            <path id="part-teeth" class="articulator" data-part="teeth" d="M 82,105 L 81,113 M 79,130 L 79,122" stroke-width="3" />
            
            <!-- Alveolar Ridge -->
            <path id="part-alveolar" class="articulator" data-part="alveolar" d="M 82,105 C 92,105 100,101 106,92" />
            
            <!-- Hard Palate -->
            <path id="part-palate" class="articulator" data-part="palate" d="M 106,92 C 115,80 135,80 150,92" />
            
            <!-- Soft Palate / Velum -->
            <path id="part-velum" class="articulator" data-part="velum" d="M 150,92 C 160,102 165,112 162,125" />
            
            <!-- Tongue Tip -->
            <path id="part-tongue-tip" class="articulator" data-part="tongue-tip" d="M 83,122 C 92,122 100,120 106,114" stroke-width="6" />
            
            <!-- Tongue Body -->
            <path id="part-tongue-body" class="articulator-fill" data-part="tongue-body" d="M 106,114 C 120,107 145,112 155,140 C 162,160 162,185 158,195 L 122,195 C 126,180 122,150 106,140 Z" />
            
            <!-- Larynx cords area -->
            <path class="articulator" data-part="throat" d="M 122,195 L 122,220" />
            <path class="articulator" data-part="throat" d="M 158,195 L 158,220" />
          </svg>
          
          <!-- Right side: Legend and description -->
          <div style="display: flex; flex-direction: column; gap: 20px;">
            <div class="legend-grid">
              <div class="legend-item lips" data-part="lips">Lips</div>
              <div class="legend-item teeth" data-part="teeth">Teeth</div>
              <div class="legend-item alveolar" data-part="alveolar">Alveolar Ridge</div>
              <div class="legend-item palate" data-part="palate">Hard Palate</div>
              <div class="legend-item velum" data-part="velum">Soft Palate (Velum)</div>
              <div class="legend-item tongue-tip" data-part="tongue-tip">Tongue Tip</div>
              <div class="legend-item tongue-body" data-part="tongue-body">Tongue Body</div>
              <div class="legend-item throat" data-part="throat">Larynx/Vocal Cords</div>
            </div>
            
            <div class="legend-info-box" id="vocal-articulator-info">
              Hover or click on any articulator or name above to see detailed mechanical placement tips.
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 4. PRACTICE RECORDER TAB -->
    <div id="tab-recorder" class="tab-content">
      <div class="glass-card">
        <h2 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 10px;">🎙️ Self-Study Speech Recorder & Vocal Analyzer</h2>
        <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 25px;">Compare your pronunciation with standard RP. Record yourself, listen to the playback, and watch your voice envelope on our real-time oscilloscope waveform.</p>
        
        <div class="recorder-layout">
          <!-- Left: Voice recorder widget -->
          <div class="recorder-widget glass-card" style="border-color: rgba(99, 102, 241, 0.15);">
            <h3 class="card-title">🎙️ Audio Analyzer & <span>Waveform</span></h3>
            
            <div class="canvas-container">
              <canvas id="waveform-canvas"></canvas>
            </div>
            
            <div class="recorder-controls">
              <button class="btn record-btn" id="record-btn" onclick="toggleRecord()">
                <span class="pulse-dot"></span> <span id="record-btn-text">Record Voice</span>
              </button>
              <button class="btn btn-secondary" id="playback-btn" onclick="playRecording()" disabled>▶ Playback Voice</button>
              <span class="rec-time" id="timer-display">00:00</span>
            </div>
          </div>
          
          <!-- Right: Text-to-speech comparison engine -->
          <div class="comparison-engine">
            <h3 class="card-title" style="color: var(--voiced);">🔊 RP Voice Model Comparison</h3>
            <p style="font-size: 0.85rem; color: var(--text-muted);">Enter any boardroom phrase, financial term, or sentence below, and click "Play Model RP Pronunciation" to hear a reference vocal track in the standard British RP accent.</p>
            <textarea class="comp-textarea" id="comparison-text-input" placeholder="e.g. Our portfolio's growth this quarter was driven by strong assets."></textarea>
            <button class="btn btn-primary" onclick="playReferenceRPText()">Play Model RP Pronunciation 🔊</button>
          </div>
        </div>
      </div>
    </div>
    
  </div>

  <!-- Persistent Active Indicator Bar at the Bottom -->
  <div class="footer-bar no-print">
    <div class="footer-info">
      <div style="width: 10px; height: 10px; border-radius: 50%; background: var(--voiced);"></div>
      <div>
        <div style="font-size: 0.85rem; font-weight: 600;">Accent Course: <span id="footer-lesson-name">Milestone 1</span></div>
        <div style="font-size: 0.75rem; color: var(--text-muted);">Tailored RP Pronunciation training for Vinh • Peter Roach Framework</div>
      </div>
    </div>
    <div>
      <span style="font-size: 0.8rem; color: var(--text-muted); margin-right: 10px;">Select British Accent voice model if available on system.</span>
    </div>
  </div>

  <!-- Printable Layout Template -->
  <div id="print-layout">
    <div class="print-header">
      <div class="print-title">Vinh's RP Pronunciation Cheat Sheet</div>
      <div class="print-subtitle">Tailored RP Pronunciation training for D.C. Finance • Peter Roach Framework</div>
    </div>
    
    <div class="print-section">
      <h2 class="print-section-title" id="print-lesson-title">Lesson 1</h2>
      <div class="print-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
        <div>
          <strong>Focus:</strong>
          <p id="print-lesson-focus" style="margin-top: 4px;"></p>
        </div>
        <div>
          <strong>DC Finance Motivation:</strong>
          <p id="print-lesson-dc" style="margin-top: 4px;"></p>
        </div>
      </div>
    </div>
    
    <div class="print-section">
      <h2 class="print-section-title">Physical Mouth Correction Cues</h2>
      <p id="print-mouth-cues"></p>
    </div>

    <div class="print-section">
      <h2 class="print-section-title">Target Drill Words</h2>
      <table class="print-table" id="print-drills-table">
        <thead>
          <tr>
            <th>Target Word / Phrase</th>
            <th>Phonetic IPA</th>
            <th>Mouth Sensation & Practice Cue</th>
          </tr>
        </thead>
        <tbody id="print-drills-tbody">
        </tbody>
      </table>
    </div>

    <div class="print-section">
      <h2 class="print-section-title">Vinh's Homework & Practice Plan</h2>
      <ul id="print-homework-list" style="margin-left: 20px; line-height: 1.6;">
      </ul>
    </div>
  </div>

  <!-- Curriculum Database (Programmatically injected) -->
  <script>
    const curriculumData = ${databaseString};

    // Slideshow Presentation Database (Lessons 2 - 9 Visual Journey)
    const presentationSlides = [
      {
        id: 0,
        lessonNum: 1,
        title: "The D.C. Pitch & Articulator Awareness",
        badge: "Milestone 1 • Sound & Awareness",
        focus: "Physical awareness of lips, teeth, alveolar ridge, hard/soft palate, larynx",
        dcConnection: "In Washington D.C., executive presence starts with visual and physical control. Pronunciation details are like transaction margins.",
        description: "Your journey starts here. Before you can change how a sound comes out, you must map the mouth's physical machinery. You will learn to isolate the tongue tip, raise the soft palate for RP resonance, and feel the tactile differences in alveolar, palatal, and velar contact.",
        vocab: ["capital", "firm", "yield", "balance sheet", "net assets"],
        phrase: "Our firm is facing private risk.",
        ipa: "/ˈaʊə fɜːm ɪz ˈfeɪsɪŋ ˈpraɪvət rɪsk/",
        roi: ["Command immediate attention", "Eliminate slurred endings", "Anchor your pitch registers"]
      },
      {
        id: 1,
        lessonNum: 2,
        title: "Stopping the Drop: Plosives & Vowel Clipping",
        badge: "Milestone 2 • Consonant Releases",
        focus: "Final stops /p, t, k/ vs /b, d, g/ • Pre-fortis vowel shortening",
        dcConnection: "Differentiating 'debt' from 'dead' is non-negotiable. Approximate consonants translate to approximate finances.",
        description: "Vietnamese speakers naturally swallow final consonants (unreleased stops). In this milestone, you will learn to release the final puff of air for voiceless stops and stretch the vowel length before voiced stops. This creates the structural differentiation native ears expect.",
        vocab: ["debt vs. dead", "cap vs. cab", "back vs. bag", "rate vs. raid"],
        phrase: "The firm's debt is rising.",
        ipa: "/ðə fɜːmz det ɪz ˈraɪzɪŋ/",
        roi: ["Distinguish numbers clearly", "Sound authoritative, not vague", "Create clear verbal structure"]
      },
      {
        id: 2,
        lessonNum: 3,
        title: "The Hiss & The Buzz: Continuous Fricatives",
        badge: "Milestone 3 • Continuous Airflow",
        focus: "Continuous airflow on final fricatives /s, z/ and /f, v/",
        dcConnection: "Legal and financial clarity in metrics depends on the hiss vs buzz. Think 'price' vs 'prize'.",
        description: "Vietnamese has no final fricatives. You will learn to sustain a continuous leakage of air at the end of words. We will practice the voiceless hiss (/s/) and turn on the voice box for the buzzing /z/. Airflow must NEVER stop abruptly here.",
        vocab: ["price vs. prize", "safe vs. save", "loss vs. laws", "face vs. phase"],
        phrase: "What is the price of the asset?",
        ipa: "/wɒt ɪz ðə praɪs əv ði ˈæset/",
        roi: ["Avoid costly metric slip-ups", "Maintain professional cadence", "Pronounce plural verbs correctly"]
      },
      {
        id: 3,
        lessonNum: 4,
        title: "The Finance Softeners: Dental & Affricate Sounds",
        badge: "Milestone 4 • Advanced Contacts",
        focus: "Dental fricatives /θ, ð/ (TH), post-alveolar /ʃ/, and affricates /tʃ, dʒ/",
        dcConnection: "Corporate metrics revolve around 'growth', 'wealth', and 'hedging'. Dropping these ruins financial delivery.",
        description: "Here you master complex mouth gymnastics. We will extend the tongue tip between the teeth for the /θ/ in 'growth' (preventing it from becoming 'growt' or 'grows'). We will also master the tactile stop-and-release of affricates in words like 'charge' and 'average'.",
        vocab: ["growth", "wealth", "charge", "hedge", "average", "transaction"],
        phrase: "The average growth of the portfolio was strong.",
        ipa: "/ði ˈævərɪdʒ ɡrəʊθ əv ðə pɔːtˈfəʊliəʊ wəz strɒŋ/",
        roi: ["Command boardroom authority", "Sound native on technical terms", "Deliver smooth metric updates"]
      },
      {
        id: 4,
        lessonNum: 5,
        title: "Suffix Hurdles: Consonant Clusters & Plurals",
        badge: "Milestone 5 • Grammar Suffixes",
        focus: "Grammar suffix endings (-s / -es) and codas (/sts, ndz, ldz/)",
        dcConnection: "Boardroom partners associate plural drop with lack of attention to details. It sounds like a grammar error.",
        description: "Vietnamese has no consonant clusters. We will build clusters step-by-step like blocks. We will master adding the voiceless /s/ to voiceless base words ('assets') and the voiced buzz /z/ to voiced bases ('bonds', 'funds'). You will never drop plural markers again.",
        vocab: ["assets", "stocks", "costs", "rates", "bonds", "funds", "yields"],
        phrase: "The costs of these funds exceed their yields.",
        ipa: "/ðə kɒsts əv ðiːz fʌndz ɪkˈsiːd ðeə jiːldz/",
        roi: ["Eliminate perception of grammatical error", "Demonstrate extreme detail-orientation", "Master complex financial terms"]
      },
      {
        id: 5,
        lessonNum: 6,
        title: "Past-Tense Traps: Suffix /t, d/ Clusters",
        badge: "Milestone 6 • Historical Reporting",
        focus: "Past tense endings (-ed) and consonant codas (/kt, st, zd, dʒd/)",
        dcConnection: "Reporting historical performance requires perfect past tense. 'Yesterday we close the deal' sounds corporate-deficient.",
        description: "Just like plurals, past tense clusters require specific tongue movement. You will learn to snap from base consonants directly into voiceless /t/ ('worked', 'priced') or voiced /d/ ('hedged', 'saved'), and add an extra syllable for base t/d endings ('audited', 'funded').",
        vocab: ["worked", "priced", "hedged", "saved", "closed", "audited", "funded"],
        phrase: "We hedged the risk and closed the deal.",
        ipa: "/wiː hedʒd ðə rɪsk ənd kləʊzd ðə diːl/",
        roi: ["Sound highly professional in status updates", "Master reported metrics", "Clean historical reporting delivery"]
      },
      {
        id: 6,
        lessonNum: 7,
        title: "The Rhythm of Finance: Weak Syllables & Schwa",
        badge: "Milestone 7 • cadential Rhythm",
        focus: "Stress-timed rhythm, vowel reduction to schwa /ə/, syllabic consonants",
        dcConnection: "Corporate presence relies on stress cadence. Equal-weight speaking makes you sound rigid.",
        description: "Vietnamese is syllable-timed (equal time per syllable). English is stress-timed. Stressed syllables must be long, loud, and resonant; unstressed syllables must shrink into a relaxed 'schwa' (/ə/) or syllabic consonants. This contraction gives you the physical time to say final consonants!",
        vocab: ["capital", "dividend", "inflation", "financial", "certain", "federal"],
        phrase: "Inflation increased the costs of capital.",
        ipa: "/ɪnˈfleɪʃn̩ ɪnˈkriːst ðə kɒsts əv ˈkæpɪtl̩/",
        roi: ["Increase speaking speed naturally", "Sound relaxed and confident", "Adopt natural British RP cadence"]
      },
      {
        id: 7,
        lessonNum: 8,
        title: "Connected Flow: Linking & Elision",
        badge: "Milestone 8 • Connected Speech",
        focus: "Consonant-to-vowel linking, linking /r/, alveolar elision",
        dcConnection: "Choppy speech sounds like hesitance. Connected speech is the key to fluid negotiations.",
        description: "Native speakers don't talk word-by-word; they glide. You will learn consonant-to-vowel links ('cost of' becomes 'cos-tov') and standard RP linking /r/ ('clear asset' becomes 'clear-rasset'). You will also learn the native speaker elision shortcuts to drop difficult stops before consonants ('last month' -> 'las-month').",
        vocab: ["cost of", "interest rate", "clear asset", "last month", "standard rate"],
        phrase: "Last month, the standard rate of return dropped.",
        ipa: "/lɑːs mʌnθ ðə ˈstændə reɪt əv rɪˈtɜːn drɒpt/",
        roi: ["Deliver speeches effortlessly", "Sound completely natural", "Reduce oral muscle fatigue"]
      },
      {
        id: 8,
        lessonNum: 9,
        title: "The Boardroom Pitch: Capstone Integration",
        badge: "Milestone 9 • Capstone Pitch",
        focus: "Accent integration: non-rhoticity, bath vowel /ɑː/, goat vowel /əʊ/",
        dcConnection: "Your ultimate pitch. Presenting financial results with executive authority to D.C. partners.",
        description: "The capstone milestone. We bring together every physical articulatory skill, every timing trick, and connected flow shortcut. We will polish key RP markers like non-rhoticity (silent post-vocalic R in 'director'), the broad bath vowel in 'master', and a pure goat vowel in 'portfolio'.",
        vocab: ["portfolio", "liquidity", "amortization", "derivative", "macroeconomics"],
        phrase: "Our portfolio's growth this quarter was driven by strong assets.",
        ipa: "/ˈaʊə pɔːtˈfəʊliəʊz ɡrəʊθ ðɪs ˈkwɔːtə wəz ˈdrɪvən baɪ strɒŋ ˈæsets/",
        roi: ["Command full boardroom authority", "Stand out in high-stakes presentations", "Perfect executive British accent integration"]
      }
    ];

    let activeSlideIndex = 0;
    let activeLessonIndex = 0;
    
    // Voice Recorder State
    let mediaRecorder;
    let audioChunks = [];
    let audioContext;
    let analyser;
    let dataArray;
    let bufferLength;
    let source;
    let isRecording = false;
    let isPlaying = false;
    let audioBlob;
    let audioUrl;
    let audioPlayer = new Audio();
    let recorderTimer;
    let recordingSeconds = 0;
    let canvas = document.getElementById("waveform-canvas");
    let ctx = canvas.getContext("2d");
    let animationFrameId;

    // Load Speech Synthesis Voices
    let voices = [];
    function loadVoices() {
      if ('speechSynthesis' in window) {
        voices = window.speechSynthesis.getVoices();
      }
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
      loadVoices();
    }

    // Initialize Dashboard
    document.addEventListener("DOMContentLoaded", () => {
      // Setup initial visual presentation slide
      renderSlide(0);
      
      // Render practice lab navigation
      renderLabNav();
      
      // Load active lesson in lab
      loadLabLesson(0);
      
      // Setup vocal tract diagram interaction
      setupVocalTractInteractivity();
      
      // Setup waveform canvas
      initCanvas();
      
      // Load stored homework/lesson completion progress
      loadLocalStorageProgress();
    });

    // Tab Switcher
    function switchTab(tabName) {
      document.querySelectorAll(".tab-btn").forEach(btn => btn.classList.remove("active"));
      document.querySelectorAll(".tab-content").forEach(content => content.classList.remove("active"));
      
      // Set active button
      const clickedBtn = Array.from(document.querySelectorAll(".tab-btn")).find(btn => btn.innerText.toLowerCase().includes(tabName));
      if (clickedBtn) clickedBtn.classList.add("active");
      
      const targetContent = document.getElementById(\`tab-\${tabName}\`);
      if (targetContent) targetContent.classList.add("active");
      
      if (tabName === 'recorder') {
        setTimeout(initCanvas, 50); // Redraw canvas on view
      }
    }

    // ----------------------------------------------------
    // PRESENTATION LOGIC
    // ----------------------------------------------------
    function renderSlide(index) {
      activeSlideIndex = index;
      const slide = presentationSlides[index];
      const slideContainer = document.getElementById("slide-card");
      
      // Update Slide content
      slideContainer.innerHTML = \`
        <div class="slide-left">
          <span class="slide-badge">\${slide.badge}</span>
          <h2 class="slide-title">Lesson \${slide.lessonNum}: \${slide.title}</h2>
          <div class="slide-sound-focus">🎯 Sound Focus: \${slide.focus}</div>
          <p class="slide-description">\${slide.description}</p>
          <div class="slide-dc-connection">
            <strong>D.C. Boardroom Impact:</strong> \${slide.dcConnection}
          </div>
          <div>
            <span style="font-size: 0.8rem; font-weight: bold; color: var(--text-muted); display: block; margin-bottom: 6px;">EXECUTIVE VOCABULARY:</span>
            <div class="slide-vocab-box">
              \${slide.vocab.map(v => \`<span class="slide-vocab-item">\${v}</span>\`).join('')}
            </div>
          </div>
        </div>
        <div class="slide-right">
          <h4 style="font-size: 1rem; font-weight: bold; color: white; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 8px;">💼 Milestone ROI</h4>
          <div class="roi-pill"><span>1</span> \${slide.roi[0]}</div>
          <div class="roi-pill"><span>2</span> \${slide.roi[1]}</div>
          <div class="roi-pill"><span>3</span> \${slide.roi[2]}</div>
          
          <div class="slide-practice-box">
            <div class="slide-practice-header">Practice Executive Pitch</div>
            <div class="slide-practice-phrase">"\${slide.phrase}"</div>
            <div class="slide-practice-action">
              <span class="slide-practice-ipa">\${slide.ipa}</span>
              <button class="btn btn-primary btn-voiced" onclick="playSpeechText('\${slide.phrase.replace(/"/g, '\\\\"')}')" style="padding: 6px 12px; font-size: 0.78rem;">🔊 Listen</button>
            </div>
          </div>
        </div>
      \`;
      
      // Update timeline indicator
      document.querySelectorAll(".timeline-step").forEach((step, i) => {
        step.classList.remove("active");
        if (i < index) {
          step.classList.add("completed");
        } else if (i === index) {
          step.classList.add("active");
          step.classList.remove("completed");
        } else {
          step.classList.remove("completed");
        }
      });
      
      const percentage = (index / (presentationSlides.length - 1)) * 100;
      document.getElementById("timeline-progress").style.width = \`\${percentage}%\`;
      
      // Update counters
      document.getElementById("slide-counter-display").innerText = \`Milestone \${index + 1} of \${presentationSlides.length}\`;
      
      // Update disabled status of control buttons
      document.getElementById("prev-slide-btn").disabled = index === 0;
      document.getElementById("next-slide-btn").innerText = index === presentationSlides.length - 1 ? "Start Practicing!" : "Next Milestone →";
    }

    function prevSlide() {
      if (activeSlideIndex > 0) {
        renderSlide(activeSlideIndex - 1);
      }
    }

    function nextSlide() {
      if (activeSlideIndex < presentationSlides.length - 1) {
        renderSlide(activeSlideIndex + 1);
      } else {
        // Move to Practice Lab tab
        switchTab('lab');
      }
    }

    function jumpToSlide(index) {
      renderSlide(index);
    }

    // Speech Synthesis
    function playSpeechText(text) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        const rpVoice = voices.find(v => v.lang.includes('GB') || v.lang.includes('en-GB') || v.name.includes('UK') || v.name.includes('Great Britain') || v.name.includes('British'));
        if (rpVoice) {
          utterance.voice = rpVoice;
        }
        utterance.rate = 0.8;
        window.speechSynthesis.speak(utterance);
      }
    }

    // ----------------------------------------------------
    // PRACTICE LAB LOGIC
    // ----------------------------------------------------
    function renderLabNav() {
      const nav = document.getElementById("lab-curriculum-nav");
      nav.innerHTML = "";
      curriculumData.forEach((lesson, index) => {
        const item = document.createElement("a");
        item.href = "#";
        item.className = "lab-nav-item";
        item.setAttribute("data-index", index);
        item.onclick = (e) => {
          e.preventDefault();
          loadLabLesson(index);
        };
        
        item.innerHTML = \`
          <span class="badge">L\${lesson.id}</span>
          <span style="flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">\${lesson.title}</span>
          <div class="chk-completed" onclick="event.stopPropagation(); toggleLessonCompletion(\${index})"></div>
        \`;
        nav.appendChild(item);
      });
    }

    function loadLabLesson(index) {
      activeLessonIndex = index;
      const lesson = curriculumData[index];
      
      // Update nav class
      document.querySelectorAll(".lab-nav-item").forEach(item => item.classList.remove("active"));
      const selectedNav = document.querySelector(\`.lab-nav-item[data-index="\${index}"]\`);
      if (selectedNav) selectedNav.classList.add("active");
      
      // Update active lesson header
      document.getElementById("lab-lesson-headline").innerText = \`Lesson \${lesson.id}: \${lesson.title}\`;
      document.getElementById("lab-lesson-sub").innerText = lesson.sub;
      document.getElementById("footer-lesson-name").innerText = \`Milestone \${lesson.id}\`;
      
      // Update focus & DC connection
      document.getElementById("lab-lesson-focus").innerHTML = \`<p>\${lesson.focus}</p>\`;
      document.getElementById("lab-lesson-dc-connection").innerHTML = \`<strong>D.C. Finance Impact:</strong> \${lesson.dcConnection}\`;
      
      // Update Warmups
      const warmupContainer = document.getElementById("lab-warmup-container");
      warmupContainer.innerHTML = "";
      lesson.warmups.forEach((warmup, idx) => {
        warmupContainer.innerHTML += \`
          <div class="warmup-item">
            <div class="warmup-num">\${idx+1}</div>
            <div>\${warmup}</div>
          </div>
        \`;
      });
      
      // Update drills list
      const drillContainer = document.getElementById("lab-drill-list-container");
      drillContainer.innerHTML = "";
      
      lesson.drills.forEach(group => {
        drillContainer.innerHTML += \`<div class="drill-group-title">\${group.title}</div>\`;
        group.items.forEach(item => {
          if (item.pair) {
            drillContainer.appendChild(createStudentPairDrillCard(item));
          } else {
            drillContainer.appendChild(createStudentSingleDrillCard(item));
          }
        });
      });
      
      // Update Homework Checkboxes
      const hwContainer = document.getElementById("lab-homework-container");
      hwContainer.innerHTML = "";
      lesson.homework.forEach((task, idx) => {
        hwContainer.innerHTML += \`
          <div class="homework-item">
            <input type="checkbox" id="hw-\${lesson.id}-\${idx}" onchange="saveHomeworkState(\${lesson.id}, \${idx})" \${localStorage.getItem(\`hw_\${lesson.id}_\${idx}\`) === 'true' ? 'checked' : ''}>
            <label for="hw-\${lesson.id}-\${idx}">\${task}</label>
          </div>
        \`;
      });
      
      // Update video recommendation card
      document.getElementById("lab-video-title").innerText = lesson.videoQuery;
      document.getElementById("lab-video-link").href = \`https://www.youtube.com/results?search_query=\${encodeURIComponent(lesson.videoQuery)}\`;
      
      // Check for saved notes left by the tutor
      const tutorNotes = localStorage.getItem(\`lesson_\${lesson.id}_notes\`);
      const notesCard = document.getElementById("student-notes-card");
      if (tutorNotes && tutorNotes.trim() !== "") {
        document.getElementById("student-notes-content").innerHTML = tutorNotes.replace(/\\n/g, '<br>');
        notesCard.style.display = "block";
      } else {
        notesCard.style.display = "none";
      }
      
      // Update completion button text
      const completeBtn = document.getElementById("lab-mark-complete-btn");
      const isCompleted = localStorage.getItem(\`lesson_\${lesson.id}_completed\`) === "true";
      completeBtn.innerText = isCompleted ? "Completed ✓" : "Mark Completed";
      if (isCompleted) {
        completeBtn.style.background = "var(--voiced)";
        completeBtn.style.color = "white";
      } else {
        completeBtn.style.background = "rgba(255,255,255,0.05)";
        completeBtn.style.color = "var(--text-main)";
      }
      
      // Highlight SVG articulators for this lesson in the vocal tract guia tab
      highlightLessonArticulators(lesson.articulators);
    }

    // Helper functions to build Student Drill Cards
    function createStudentSingleDrillCard(item) {
      const card = document.createElement("div");
      card.className = "drill-card";
      card.onclick = () => card.classList.toggle("expanded");
      
      card.innerHTML = \`
        <div class="drill-main-line">
          <div class="drill-word-container">
            <span class="drill-word">\${item.label}</span>
            <span class="drill-ipa">\${item.ipa}</span>
          </div>
          <button class="speaker-btn" onclick="event.stopPropagation(); playSpeechText('\${item.label}')">🔊</button>
        </div>
        <div class="reveal-details">
          <div class="guide-box">
            <div class="guide-section sensation">
              <strong>👄 Vocal Sensation & Mechanical Cue</strong>
              <p>\${item.studentCue || item.cue}</p>
            </div>
          </div>
        </div>
      \`;
      return card;
    }

    function createStudentPairDrillCard(item) {
      const card = document.createElement("div");
      card.className = "drill-card";
      card.onclick = () => card.classList.toggle("expanded");
      
      card.innerHTML = \`
        <div class="drill-main-line">
          <div class="drill-word-container">
            <span class="drill-word pair-word">\${item.wordA}</span>
            <span class="drill-ipa">\${item.ipaA}</span>
            <span class="drill-pair-connector">vs.</span>
            <span class="drill-word pair-word">\${item.wordB}</span>
            <span class="drill-ipa">\${item.ipaB}</span>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="speaker-btn" onclick="event.stopPropagation(); playSpeechText('\${item.wordA}')" title="Play \${item.wordA}">A</button>
            <button class="speaker-btn" onclick="event.stopPropagation(); playSpeechText('\${item.wordB}')" title="Play \${item.wordB}">B</button>
          </div>
        </div>
        <div class="reveal-details">
          <div class="guide-box">
            <div class="guide-section sensation">
              <strong>👄 Word A (\${item.wordA}) Physical Sensation</strong>
              <p>\${item.studentCueA || item.cueA}</p>
              <hr style="margin: 8px 0; border: none; border-top: 1px solid rgba(255,255,255,0.06);">
              <strong>👄 Word B (\${item.wordB}) Physical Sensation</strong>
              <p>\${item.studentCueB || item.cueB}</p>
            </div>
          </div>
        </div>
      \`;
      return card;
    }

    // Local Storage progress management
    function saveHomeworkState(lessonId, index) {
      const chk = document.getElementById(\`hw-\${lessonId}-\${index}\`);
      localStorage.setItem(\`hw_\${lessonId}_\${index}\`, chk.checked);
    }

    function toggleLessonCompletion(index) {
      const lesson = curriculumData[index];
      const navItem = document.querySelector(\`.lab-nav-item[data-index="\${index}"]\`);
      const key = \`lesson_\${lesson.id}_completed\`;
      
      const wasCompleted = localStorage.getItem(key) === "true";
      localStorage.setItem(key, !wasCompleted);
      
      if (!wasCompleted) {
        if (navItem) navItem.classList.add("completed");
      } else {
        if (navItem) navItem.classList.remove("completed");
      }
      
      if (index === activeLessonIndex) {
        loadLabLesson(index);
      }
      updateProgressBar();
    }

    function toggleCurrentLessonCompletion() {
      toggleLessonCompletion(activeLessonIndex);
    }

    function updateProgressBar() {
      let completedCount = 0;
      curriculumData.forEach(lesson => {
        if (localStorage.getItem(\`lesson_\${lesson.id}_completed\`) === "true") {
          completedCount++;
        }
      });
      const percent = (completedCount / curriculumData.length) * 100;
      document.getElementById("overall-progress-bar-fill").style.width = \`\${percent}%\`;
      document.getElementById("completion-percentage-display").innerText = \`\${Math.round(percent)}%\`;
    }

    function loadLocalStorageProgress() {
      curriculumData.forEach((lesson, index) => {
        const completed = localStorage.getItem(\`lesson_\${lesson.id}_completed\`) === "true";
        if (completed) {
          const navItem = document.querySelector(\`.lab-nav-item[data-index="\${index}"]\`);
          if (navItem) navItem.classList.add("completed");
        }
      });
      updateProgressBar();
    }

    // ----------------------------------------------------
    // VOCAL TRACT DIAGRAM LOGIC
    // ----------------------------------------------------
    const articulatorInfoMap = {
      lips: "<strong>Lips (Bilabial / Labiodental):</strong> Touch lips together completely for /p, b, m/ releases. Rest upper front teeth on lower lip to sustain continuous airflow for /f, v/. Keep lips rounded for RP 'goat' vowel /əʊ/.",
      teeth: "<strong>Teeth (Dental Contact):</strong> The crucial articulation zone for 'growth' and 'wealth'. Extend your tongue tip slightly past the edges of your upper teeth to blow soft air (/θ/). Never let it hit the teeth block as a stop (/t/).",
      alveolar: "<strong>Alveolar Ridge (Bumpy Ridge):</strong> Located immediately behind your upper teeth. The contact point for stops /t, d/, nasals /n/, lateral /l/, and fricatives /s, z/. Press tongue tip firmly here for final releases.",
      palate: "<strong>Hard Palate:</strong> Roof of the mouth. Essential for palato-alveolar friction in 'cash' (/ʃ/) and affricates /tʃ, dʒ/ ('charge', 'hedge'). Stop air behind the alveolar ridge, then pull tongue back against hard palate.",
      velum: "<strong>Soft Palate (Velum):</strong> Back soft roof of mouth. Lifted to close off nasal cavity for clean plosive clicks /k, g/. Lowered to allow nasal resonance for bank /ŋ/ (ensure the back of tongue meets velum before air escapes).",
      "tongue-tip": "<strong>Tongue Tip:</strong> Your primary driver. Directs stops on the alveolar ridge, slides out for dental fricatives (/θ/), or curls up/flattens. Focus on keeping the tongue tip agile and firm at word endings.",
      "tongue-body": "<strong>Tongue Body / Blade:</strong> The broad central mass of your tongue. Flat and completely relaxed in the bottom of your mouth for the unstressed schwa /ə/ ('capital', 'dividend') to facilitate rapid cadential speech.",
      throat: "<strong>Larynx / Vocal Cords (Voice Box):</strong> Vibrates continuously for voiced (lenis) final sounds like /d, b, g, z, v, dʒ/ (feel the throat buzz on 'dead, hedge'). Stays silent and open for voiceless (fortis) sounds (/t, p, k, s, f, tʃ/)."
    };

    function setupVocalTractInteractivity() {
      // Setup clicks on SVG elements
      document.querySelectorAll("#vocal-tract .articulator, #vocal-tract .articulator-fill").forEach(el => {
        const part = el.getAttribute("data-part");
        
        el.addEventListener("mouseenter", () => showArticulatorInfo(part));
        el.addEventListener("click", () => showArticulatorInfo(part));
      });
      
      // Setup legend item hover and click
      document.querySelectorAll(".legend-item").forEach(item => {
        const part = item.getAttribute("data-part");
        
        item.addEventListener("mouseenter", () => {
          showArticulatorInfo(part);
          highlightSVGPart(part);
        });
        
        item.addEventListener("mouseleave", () => {
          resetSVGHighlights();
        });
      });
    }

    function showArticulatorInfo(part) {
      if (articulatorInfoMap[part]) {
        document.getElementById("vocal-articulator-info").innerHTML = articulatorInfoMap[part];
        
        // Highlight corresponding legend item
        document.querySelectorAll(".legend-item").forEach(item => {
          if (item.getAttribute("data-part") === part) {
            item.classList.add("active");
          } else {
            item.classList.remove("active");
          }
        });
      }
    }

    function highlightSVGPart(part) {
      document.querySelectorAll("#vocal-tract .articulator, #vocal-tract .articulator-fill").forEach(el => {
        if (el.getAttribute("data-part") === part) {
          el.classList.add("active");
        } else {
          el.classList.remove("active");
        }
      });
    }

    function resetSVGHighlights() {
      const activeArticulators = curriculumData[activeLessonIndex].articulators;
      highlightLessonArticulators(activeArticulators);
      document.querySelectorAll(".legend-item").forEach(item => item.classList.remove("active"));
    }

    function highlightLessonArticulators(partsArray) {
      document.querySelectorAll("#vocal-tract .articulator, #vocal-tract .articulator-fill").forEach(el => {
        const part = el.getAttribute("data-part");
        if (partsArray && partsArray.includes(part)) {
          el.classList.add("active");
        } else {
          el.classList.remove("active");
        }
      });
    }

    // ----------------------------------------------------
    // RECORDER & AUDIO ANALYSIS LOGIC
    // ----------------------------------------------------
    function initCanvas() {
      canvas.width = canvas.parentElement.clientWidth * window.devicePixelRatio;
      canvas.height = canvas.parentElement.clientHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      drawStaticWaveform();
    }
    
    window.addEventListener("resize", initCanvas);

    function drawStaticWaveform() {
      ctx.fillStyle = "#070a13";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = "rgba(255,255,255,0.05)";
      ctx.lineWidth = 1;
      
      // Grid lines
      ctx.beginPath();
      for (let i = 0; i < canvas.width; i += 30) {
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
      }
      ctx.stroke();
      
      // Midline
      ctx.strokeStyle = "rgba(99,102,241,0.2)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, canvas.height / (2 * window.devicePixelRatio));
      ctx.lineTo(canvas.width / window.devicePixelRatio, canvas.height / (2 * window.devicePixelRatio));
      ctx.stroke();
    }

    async function toggleRecord() {
      const recordBtn = document.getElementById("record-btn");
      const recordBtnText = document.getElementById("record-btn-text");
      
      if (!isRecording) {
        // Start Recording
        isRecording = true;
        recordBtn.classList.add("recording");
        recordBtnText.innerText = "Stop Recording";
        document.getElementById("playback-btn").disabled = true;
        recordingSeconds = 0;
        document.getElementById("timer-display").innerText = "00:00";
        
        recorderTimer = setInterval(() => {
          recordingSeconds++;
          const mins = String(Math.floor(recordingSeconds / 60)).padStart(2, "0");
          const secs = String(recordingSeconds % 60).padStart(2, "0");
          document.getElementById("timer-display").innerText = \`\${mins}:\${secs}\`;
        }, 1000);

        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          audioContext = new (window.AudioContext || window.webkitAudioContext)();
          analyser = audioContext.createAnalyser();
          source = audioContext.createMediaStreamSource(stream);
          source.connect(analyser);
          
          analyser.fftSize = 256;
          bufferLength = analyser.frequencyBinCount;
          dataArray = new Uint8Array(bufferLength);
          
          mediaRecorder = new MediaRecorder(stream);
          audioChunks = [];
          
          mediaRecorder.ondataavailable = e => {
            audioChunks.push(e.data);
          };
          
          mediaRecorder.onstop = () => {
            audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            audioUrl = URL.createObjectURL(audioBlob);
            audioPlayer.src = audioUrl;
            document.getElementById("playback-btn").disabled = false;
            cancelAnimationFrame(animationFrameId);
            drawStaticWaveform();
          };
          
          mediaRecorder.start();
          visualizeRealTime();
        } catch (err) {
          console.warn("Microphone access unavailable or blocked. Running simulated waveforms.", err);
          // Run simulation waveform
          visualizeSimulation();
        }
      } else {
        // Stop Recording
        isRecording = false;
        recordBtn.classList.remove("recording");
        recordBtnText.innerText = "Record Voice";
        clearInterval(recorderTimer);
        
        if (mediaRecorder && mediaRecorder.state !== "inactive") {
          mediaRecorder.stop();
          mediaRecorder.stream.getTracks().forEach(track => track.stop());
        } else {
          // Simulation stop
          cancelAnimationFrame(animationFrameId);
          document.getElementById("playback-btn").disabled = false;
          drawStaticWaveform();
        }
      }
    }

    function visualizeRealTime() {
      if (!isRecording) return;
      animationFrameId = requestAnimationFrame(visualizeRealTime);
      
      analyser.getByteTimeDomainData(dataArray);
      
      ctx.fillStyle = "#070a13";
      ctx.fillRect(0, 0, canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio);
      
      ctx.strokeStyle = "#10b981";
      ctx.lineWidth = 3;
      ctx.shadowColor = "#10b981";
      ctx.shadowBlur = 8;
      ctx.beginPath();
      
      const sliceWidth = (canvas.width / window.devicePixelRatio) / bufferLength;
      let x = 0;
      
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = v * (canvas.height / window.devicePixelRatio) / 2;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        x += sliceWidth;
      }
      
      ctx.lineTo(canvas.width / window.devicePixelRatio, (canvas.height / window.devicePixelRatio) / 2);
      ctx.stroke();
      ctx.shadowBlur = 0; // reset
    }

    // Simulation fallback wave generator (useful for offline file loading/iframe sandbox)
    let simTime = 0;
    function visualizeSimulation() {
      if (!isRecording && !isPlaying) return;
      animationFrameId = requestAnimationFrame(visualizeSimulation);
      
      ctx.fillStyle = "#070a13";
      ctx.fillRect(0, 0, canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio);
      
      ctx.strokeStyle = isRecording ? "#ef4444" : "#6366f1";
      ctx.lineWidth = 3;
      ctx.shadowColor = ctx.strokeStyle;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      
      simTime += 0.15;
      const points = 100;
      const sliceWidth = (canvas.width / window.devicePixelRatio) / points;
      let x = 0;
      
      for (let i = 0; i <= points; i++) {
        let factor = Math.sin(i * 0.1 + simTime) * Math.cos(i * 0.05 - simTime);
        if (isRecording) {
          factor += (Math.random() - 0.5) * 0.25; // add voice noise
        } else {
          factor *= Math.sin(simTime * 0.5); // decay playback wave
        }
        const y = (canvas.height / window.devicePixelRatio / 2) + factor * (canvas.height / window.devicePixelRatio * 0.35);
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        x += sliceWidth;
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    function playRecording() {
      if (audioUrl) {
        audioPlayer.play();
        isPlaying = true;
        document.getElementById("playback-btn").disabled = true;
        
        audioPlayer.onended = () => {
          isPlaying = false;
          document.getElementById("playback-btn").disabled = false;
          cancelAnimationFrame(animationFrameId);
          drawStaticWaveform();
        };
        
        // Sim playback animation
        visualizeSimulation();
      } else {
        // Simulation playback
        isPlaying = true;
        document.getElementById("playback-btn").disabled = true;
        let count = 0;
        visualizeSimulation();
        
        const simInterval = setInterval(() => {
          count++;
          if (count >= 30) { // Play for 3s in demo
            clearInterval(simInterval);
            isPlaying = false;
            document.getElementById("playback-btn").disabled = false;
            cancelAnimationFrame(animationFrameId);
            drawStaticWaveform();
          }
        }, 100);
      }
    }

    function playReferenceRPText() {
      const text = document.getElementById("comparison-text-input").value;
      if (text.trim() !== "") {
        playSpeechText(text);
      } else {
        alert("Please enter some text to compare!");
      }
    }

    // ----------------------------------------------------
    // PRINT SHET GENERATOR LOGIC
    // ----------------------------------------------------
    function generatePrintCard() {
      const lesson = curriculumData[activeLessonIndex];
      
      // Populate print data
      document.getElementById("print-lesson-title").innerText = \`Lesson \${lesson.id}: \${lesson.title}\`;
      document.getElementById("print-lesson-focus").innerText = lesson.focus;
      document.getElementById("print-lesson-dc").innerText = lesson.dcConnection;
      document.getElementById("print-mouth-cues").innerText = lesson.mouthCueSummary;
      
      // Populate drills table
      const tbody = document.getElementById("print-drills-tbody");
      tbody.innerHTML = "";
      
      lesson.drills.forEach(group => {
        group.items.forEach(item => {
          if (item.pair) {
            tbody.innerHTML += \`
              <tr>
                <td><strong>\${item.wordA}</strong> vs. <strong>\${item.wordB}</strong></td>
                <td><code style="font-family: monospace;">\${item.ipaA}</code> / <code style="font-family: monospace;">\${item.ipaB}</code></td>
                <td>
                  <strong>\${item.wordA}:</strong> \${item.studentCueA || item.cueA}<br>
                  <strong>\${item.wordB}:</strong> \${item.studentCueB || item.cueB}
                </td>
              </tr>
            \`;
          } else {
            tbody.innerHTML += \`
              <tr>
                <td><strong>\${item.label}</strong></td>
                <td><code style="font-family: monospace;">\${item.ipa}</code></td>
                <td>\${item.studentCue || item.cue}</td>
              </tr>
            \`;
          }
        });
      });
      
      // Populate homework
      const hwList = document.getElementById("print-homework-list");
      hwList.innerHTML = "";
      lesson.homework.forEach(task => {
        hwList.innerHTML += \`<li>\${task}</li>\`;
      });
      
      // Trigger print dialog
      window.print();
    }
  </script>
</body>
</html>`;

fs.writeFileSync(studentDashboardPath, studentHtmlTemplate, 'utf8');
const indexHtmlPath = path.join(path.dirname(studentDashboardPath), 'index.html');
fs.writeFileSync(indexHtmlPath, studentHtmlTemplate, 'utf8');
console.log('Successfully generated Student_Dashboard.html and index.html with the embedded expanded database and Accent Journey presentation!');

// 4. Validate script compilation
const vm = require('vm');
let tutorValid = true;
let studentValid = true;

// Validate Tutor
try {
  const tutorHtml = fs.readFileSync(tutorDashboardPath, 'utf8');
  const scriptRegex = /<script>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = scriptRegex.exec(tutorHtml)) !== null) {
    new vm.Script(match[1]);
  }
  console.log('Tutor_Dashboard.html script validation: PASSED');
} catch (err) {
  console.error('Tutor_Dashboard.html script validation: FAILED', err.message);
  tutorValid = false;
}

// Validate Student
try {
  const studentHtml = fs.readFileSync(studentDashboardPath, 'utf8');
  const scriptRegex = /<script>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = scriptRegex.exec(studentHtml)) !== null) {
    new vm.Script(match[1]);
  }
  console.log('Student_Dashboard.html script validation: PASSED');
} catch (err) {
  console.error('Student_Dashboard.html script validation: FAILED', err.message);
  studentValid = false;
}

if (tutorValid && studentValid) {
  console.log('ALL DASHBOARDS BUILT AND VALIDATED SUCCESSFULLY! Ready to deploy.');
} else {
  console.error('Build succeeded with script syntax errors. Please inspect reports.');
  process.exit(1);
}
