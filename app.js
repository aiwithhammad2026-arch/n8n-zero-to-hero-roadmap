/**
 * n8n Zero to Hero Roadmap - Application Script
 * Dynamically parses the roadmap markdown and manages user progress.
 */

// State Management
const STATE = {
  markdown: '',
  metadata: {},
  phases: [],
  extras: [],
  checkedItems: {}, // Key: "phase-id:item-text", Value: boolean
  activeView: 'dashboard',
  activePhaseId: null,
  activeExtraId: null
};

// Initialize Application
document.addEventListener('DOMContentLoaded', async () => {
  initTheme();
  initProgressStorage();
  await loadRoadmapData();
  setupEventListeners();
  registerServiceWorker();
});

// Register Service Worker for PWA
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then((reg) => console.log('Service Worker registered successfully:', reg.scope))
      .catch((err) => console.error('Service Worker registration failed:', err));
  }
}

// Theme Management
function initTheme() {
  const theme = localStorage.getItem('n8n-roadmap-theme') || 'dark';
  setTheme(theme);

  const toggleBtn = document.getElementById('theme-toggle');
  toggleBtn.addEventListener('click', () => {
    const currentTheme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  });
}

function setTheme(theme) {
  const toggleBtn = document.getElementById('theme-toggle');
  if (theme === 'dark') {
    document.body.classList.remove('light-theme');
    document.body.classList.add('dark-theme');
    toggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
  } else {
    document.body.classList.remove('dark-theme');
    document.body.classList.add('light-theme');
    toggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
  }
  localStorage.setItem('n8n-roadmap-theme', theme);
}

// Progress LocalStorage Management
function initProgressStorage() {
  const saved = localStorage.getItem('n8n-roadmap-progress');
  if (saved) {
    try {
      STATE.checkedItems = JSON.parse(saved);
    } catch (e) {
      console.error('Error parsing progress storage:', e);
      STATE.checkedItems = {};
    }
  }
}

function saveProgress() {
  localStorage.setItem('n8n-roadmap-progress', JSON.stringify(STATE.checkedItems));
  updateProgressIndicators();
  generatePrintLayout();
}

// Fetch & Parse Markdown
async function loadRoadmapData() {
  try {
    const response = await fetch('/n8n-zero-to-hero-roadmap.md');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const markdown = await response.text();
    STATE.markdown = markdown;
    
    parseRoadmapMarkdown(markdown);
    
    // Set dynamic elements in HTML
    if (STATE.metadata.preparedFor) {
      document.getElementById('user-name').textContent = STATE.metadata.preparedFor;
      // Extract initials for avatar
      const initials = STATE.metadata.preparedFor
        .split(' ')
        .map(n => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase();
      document.querySelector('.avatar').textContent = initials;
    }

    renderSidebarMenu();
    renderDashboardPhases();
    updateProgressIndicators();
    generatePrintLayout();
    
  } catch (error) {
    console.error('Error loading roadmap markdown:', error);
    document.getElementById('phases-grid').innerHTML = `
      <div class="loading-state" style="color: var(--color-danger)">
        <i class="fa-solid fa-triangle-exclamation" style="font-size: 40px"></i>
        <p>Error loading roadmap: ${error.message}</p>
        <button onclick="window.location.reload()" class="back-to-dashboard-btn" style="margin-top: 10px">
          <i class="fa-solid fa-rotate-right"></i> Retry
        </button>
      </div>
    `;
  }
}

/**
 * Custom parser designed to extract structural elements from the roadmap markdown
 */
function parseRoadmapMarkdown(markdown) {
  const lines = markdown.split(/\r?\n/);
  
  STATE.metadata = {
    preparedFor: '',
    email: '',
    phone: '',
    stats: ''
  };
  STATE.phases = [];
  STATE.extras = [];

  let currentBlockType = 'intro'; // 'intro', 'phase', 'extra'
  let currentPhase = null;
  let currentExtra = null;
  let currentGroup = 'Default';
  let tableLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // 1. Parse Metadata in intro
    if (trimmed.startsWith('# ')) {
      STATE.metadata.title = trimmed.replace('# ', '');
      continue;
    }
    if (trimmed.startsWith('**Prepared for:**')) {
      STATE.metadata.preparedFor = trimmed.replace('**Prepared for:**', '').trim();
      continue;
    }
    if (trimmed.startsWith('**Email:**')) {
      STATE.metadata.email = trimmed.replace('**Email:**', '').trim();
      continue;
    }
    if (trimmed.startsWith('**Phone:**')) {
      STATE.metadata.phone = trimmed.replace('**Phone:**', '').trim();
      continue;
    }
    if (trimmed.startsWith('**Stats:**')) {
      STATE.metadata.stats = trimmed.replace('**Stats:**', '').trim();
      continue;
    }

    // 2. Parse Section Headers
    if (trimmed.startsWith('## ')) {
      // If we had a table accumulating, parse it before starting a new section
      if (tableLines.length > 0) {
        parseAndAttachTable(currentPhase, tableLines);
        tableLines = [];
      }

      const headerText = trimmed.replace('## ', '');
      
      if (headerText.toLowerCase().includes('phase ')) {
        // Start a new Phase
        currentBlockType = 'phase';
        
        // Extract Phase Details: "Phase 0 — Foundations (Beginner) · ⏱ 3–5 days"
        const parts = headerText.split('·');
        const titlePart = parts[0].trim();
        const durationPart = parts[1] ? parts[1].trim() : '';
        
        // Extract phase number
        const phaseNumMatch = titlePart.match(/Phase\s+(\d+)/i);
        const phaseNumber = phaseNumMatch ? parseInt(phaseNumMatch[1]) : STATE.phases.length;
        const phaseId = `phase-${phaseNumber}`;

        currentPhase = {
          id: phaseId,
          number: phaseNumber,
          title: titlePart,
          duration: durationPart,
          goal: '',
          groups: {}, // Group Name -> Array of Checklist Items
          youtubeSearches: [],
          practiceBuilds: [],
          tables: []
        };
        currentGroup = 'General';
        currentPhase.groups[currentGroup] = [];
        
        STATE.phases.push(currentPhase);
      } else {
        // Start a generic section (e.g. "How to use this roadmap", "Bonus...", "Resources...")
        currentBlockType = 'extra';
        const extraId = 'extra-' + headerText.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        
        currentExtra = {
          id: extraId,
          title: headerText,
          contentLines: []
        };
        
        STATE.extras.push(currentExtra);
      }
      continue;
    }

    // Skip horizontal rules
    if (trimmed === '---') {
      if (tableLines.length > 0) {
        parseAndAttachTable(currentPhase, tableLines);
        tableLines = [];
      }
      continue;
    }

    // 3. Process lines based on current block
    if (currentBlockType === 'phase' && currentPhase) {
      // Parse Goal
      if (trimmed.startsWith('**Goal:**') || trimmed.startsWith('Goal:')) {
        currentPhase.goal = trimmed.replace(/^\*\*Goal:\*\*\s*|^\*Goal:\*\s*|^Goal:\s*/i, '').trim();
        continue;
      }

      // Parse Checklist Group Title (e.g. "**Get n8n running:**")
      if (trimmed.startsWith('**') && (trimmed.endsWith(':**') || trimmed.endsWith('**') || trimmed.endsWith(':'))) {
        const groupName = trimmed.replace(/\*\*|:/g, '').trim();
        currentGroup = groupName;
        if (!currentPhase.groups[currentGroup]) {
          currentPhase.groups[currentGroup] = [];
        }
        continue;
      }

      // Parse Checklist Checkbox Items
      if (trimmed.startsWith('- [ ]') || trimmed.startsWith('- [x]')) {
        const checked = trimmed.startsWith('- [x]');
        const itemContent = trimmed.substring(5).trim();
        
        // Extract description if present: "Text — Description"
        let title = itemContent;
        let desc = '';
        const dividerIdx = itemContent.indexOf('—');
        
        if (dividerIdx !== -1) {
          title = itemContent.substring(0, dividerIdx).trim();
          desc = itemContent.substring(dividerIdx + 1).trim();
        }

        currentPhase.groups[currentGroup].push({
          title: title,
          description: desc,
          rawText: itemContent
        });
        continue;
      }

      // Parse YouTube Searches
      if (trimmed.startsWith('**YouTube searches:**')) {
        const searchContent = trimmed.replace('**YouTube searches:**', '').trim();
        // Extract phrases in backticks
        const phrases = [];
        const matches = searchContent.matchAll(/`([^`]+)`/g);
        for (const match of matches) {
          phrases.push(match[1].trim());
        }
        currentPhase.youtubeSearches = phrases;
        continue;
      }

      // Parse Practice Builds
      if (trimmed.startsWith('**🏆 Build') || trimmed.startsWith('🏆 Build')) {
        const buildText = trimmed.replace(/^\*\*🏆 Build\s*#?\d*:\*\*\s*|^\*\*🏆 Build\s*#?\d*:\*\s*|^🏆 Build\s*#?\d*:\s*/i, '').trim();
        currentPhase.practiceBuilds.push(buildText);
        continue;
      }

      // Table lines accumulator
      if (trimmed.startsWith('|')) {
        tableLines.push(trimmed);
        continue;
      } else if (tableLines.length > 0) {
        // Table ended
        parseAndAttachTable(currentPhase, tableLines);
        tableLines = [];
      }

    } else if (currentBlockType === 'extra' && currentExtra) {
      currentExtra.contentLines.push(line);
    }
  }

  // End of file cleanup for remaining tables
  if (tableLines.length > 0 && currentPhase) {
    parseAndAttachTable(currentPhase, tableLines);
  }
}

/**
 * Parses markdown table lines and structures them into JSON
 */
function parseAndAttachTable(phase, lines) {
  if (lines.length < 3) return; // Must have header, separator, and at least 1 row
  
  const headers = lines[0].split('|').map(s => s.trim()).filter(s => s !== '');
  const rows = [];

  // Skip lines[0] (header) and lines[1] (separator like |---|---|)
  for (let i = 2; i < lines.length; i++) {
    const cells = lines[i].split('|').map(s => s.trim()).filter((_, idx) => idx > 0 && idx < lines[i].split('|').length - 1);
    if (cells.length > 0) {
      rows.push(cells);
    }
  }

  phase.tables.push({
    headers: headers,
    rows: rows
  });
}

// Sidebar Links Generation
function renderSidebarMenu() {
  const sidebarLinks = document.getElementById('sidebar-links');
  
  // Clear dynamic elements, keeping static "Overview" and "Dashboard"
  const overviewHeader = sidebarLinks.querySelector('.menu-label');
  const dashboardItem = sidebarLinks.querySelector('a[data-view="dashboard"]').parentElement;
  
  sidebarLinks.innerHTML = '';
  sidebarLinks.appendChild(overviewHeader);
  sidebarLinks.appendChild(dashboardItem);

  // Add Phase Headers
  const phaseLabel = document.createElement('li');
  phaseLabel.className = 'menu-label';
  phaseLabel.textContent = 'Roadmap Phases';
  sidebarLinks.appendChild(phaseLabel);

  STATE.phases.forEach(phase => {
    const li = document.createElement('li');
    // Get phase short title
    const shortTitle = phase.title.replace('Phase ', 'P');
    
    li.innerHTML = `
      <a href="#${phase.id}" class="menu-item" data-view="phase" data-id="${phase.id}">
        <i class="fa-solid fa-list-check"></i>
        <span>${phase.title}</span>
        <span class="phase-badge" id="sidebar-badge-${phase.id}">0%</span>
      </a>
    `;
    sidebarLinks.appendChild(li);
  });

  // Add Extras (Bonus, Resources, etc.)
  const extrasLabel = document.createElement('li');
  extrasLabel.className = 'menu-label';
  extrasLabel.textContent = 'Resources & Extras';
  sidebarLinks.appendChild(extrasLabel);

  STATE.extras.forEach(extra => {
    const li = document.createElement('li');
    let icon = 'fa-bookmark';
    if (extra.title.toLowerCase().includes('bonus')) icon = 'fa-gift';
    if (extra.title.toLowerCase().includes('avoid')) icon = 'fa-circle-xmark';
    
    li.innerHTML = `
      <a href="#${extra.id}" class="menu-item" data-view="extra" data-id="${extra.id}">
        <i class="fa-solid ${icon}"></i>
        <span>${extra.title}</span>
      </a>
    `;
    sidebarLinks.appendChild(li);
  });

  // Add Contact Shortcut
  const contactLi = document.createElement('li');
  contactLi.innerHTML = `
    <a href="#contact" class="menu-item" data-view="contact" id="sidebar-contact-btn">
      <i class="fa-solid fa-paper-plane"></i>
      <span>Contact & Socials</span>
    </a>
  `;
  sidebarLinks.appendChild(contactLi);

  // Bind clicks to sidebar items
  document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Close mobile sidebar if open
      document.getElementById('sidebar').classList.remove('mobile-open');

      const view = item.getAttribute('data-view');
      const id = item.getAttribute('data-id');
      
      switchView(view, id);
    });
  });
}

// Render Dashboard View Phase Cards
function renderDashboardPhases() {
  const grid = document.getElementById('phases-grid');
  grid.innerHTML = '';

  STATE.phases.forEach(phase => {
    const card = document.createElement('div');
    card.className = 'phase-card';
    card.setAttribute('data-id', phase.id);
    
    // Count items
    let itemCount = 0;
    Object.values(phase.groups).forEach(items => {
      itemCount += items.length;
    });

    card.innerHTML = `
      <div class="phase-card-header">
        <h3 class="phase-card-title">${phase.title}</h3>
        <span class="phase-duration">${phase.duration}</span>
      </div>
      <p class="phase-goal">${phase.goal || 'No goal description provided.'}</p>
      <div class="phase-card-footer">
        <div class="phase-card-progress">
          <span class="phase-progress-label">${itemCount} Learning items</span>
          <span class="phase-progress-val" id="card-pct-${phase.id}">0%</span>
        </div>
        <div class="phase-card-progress-bar">
          <div class="phase-card-progress-fill" id="card-bar-${phase.id}" style="width: 0%"></div>
        </div>
      </div>
    `;

    card.addEventListener('click', () => {
      switchView('phase', phase.id);
    });

    grid.appendChild(card);
  });
}

// Calculate Progress and Update all UI Indicators
function updateProgressIndicators() {
  let totalItemsCount = 0;
  let totalCheckedCount = 0;
  
  STATE.phases.forEach(phase => {
    let phaseItemsCount = 0;
    let phaseCheckedCount = 0;

    Object.values(phase.groups).forEach(items => {
      items.forEach(item => {
        phaseItemsCount++;
        totalItemsCount++;
        const itemKey = `${phase.id}:${item.title}`;
        if (STATE.checkedItems[itemKey]) {
          phaseCheckedCount++;
          totalCheckedCount++;
        }
      });
    });

    const phasePct = phaseItemsCount > 0 ? Math.round((phaseCheckedCount / phaseItemsCount) * 100) : 0;
    
    // Update Sidebar badges
    const badge = document.getElementById(`sidebar-badge-${phase.id}`);
    if (badge) {
      badge.textContent = `${phasePct}%`;
      if (phasePct === 100) {
        badge.style.backgroundColor = 'var(--color-success)';
      } else {
        badge.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
      }
    }

    // Update Phase cards on Dashboard
    const cardPct = document.getElementById(`card-pct-${phase.id}`);
    const cardBar = document.getElementById(`card-bar-${phase.id}`);
    if (cardPct && cardBar) {
      cardPct.textContent = `${phasePct}%`;
      cardBar.style.width = `${phasePct}%`;
    }

    // Update current active phase detail progress (if open)
    const detailPctVal = document.getElementById('detail-pct-val');
    const detailBarFill = document.getElementById('detail-bar-fill');
    if (detailPctVal && detailBarFill && STATE.activePhaseId === phase.id) {
      detailPctVal.textContent = `${phasePct}% (${phaseCheckedCount}/${phaseItemsCount} items)`;
      detailBarFill.style.width = `${phasePct}%`;
    }
  });

  const globalPct = totalItemsCount > 0 ? Math.round((totalCheckedCount / totalItemsCount) * 100) : 0;

  // Update Global Header progress
  document.getElementById('global-progress-percentage').textContent = `${globalPct}%`;
  document.getElementById('global-progress-bar').style.width = `${globalPct}%`;

  // Update Dashboard Overview widgets
  document.getElementById('dashboard-items-count').textContent = `${totalCheckedCount} / ${totalItemsCount} Completed`;
  document.getElementById('completed-items-num').textContent = totalCheckedCount;
  document.getElementById('remaining-items-num').textContent = totalItemsCount - totalCheckedCount;
  document.getElementById('dashboard-progress-ring-text').textContent = `${globalPct}%`;

  // SVG Ring calculation: circumference = 2 * PI * r = 2 * 3.14159 * 50 = 314.16
  const strokeDashoffset = 314.16 - (globalPct / 100) * 314.16;
  document.getElementById('dashboard-progress-ring').style.strokeDashoffset = strokeDashoffset;

  // Determine Active Phase based on progress (first phase not 100% completed)
  let activePhase = STATE.phases[0];
  for (let i = 0; i < STATE.phases.length; i++) {
    const phase = STATE.phases[i];
    let phaseItems = 0;
    let phaseChecked = 0;
    Object.values(phase.groups).forEach(items => {
      items.forEach(item => {
        phaseItems++;
        if (STATE.checkedItems[`${phase.id}:${item.title}`]) phaseChecked++;
      });
    });
    if (phaseChecked < phaseItems) {
      activePhase = phase;
      break;
    }
  }

  if (activePhase) {
    document.getElementById('active-phase-name').textContent = activePhase.title;
  } else {
    document.getElementById('active-phase-name').textContent = 'Roadmap completed! 🎉';
  }
}

// Render Phase Detail Page Content
function renderPhaseDetail(phaseId) {
  const phase = STATE.phases.find(p => p.id === phaseId);
  const container = document.getElementById('phase-detail-container');
  if (!phase || !container) return;

  // Create content structure
  let html = `
    <div class="phase-detail-header">
      <div class="phase-meta-badges">
        <span class="badge success">${phase.duration}</span>
        <span class="badge">Difficulty: ${phase.title.includes('Advanced') ? 'Advanced' : phase.title.includes('Intermediate') ? 'Intermediate' : 'Beginner'}</span>
      </div>
      <h1 class="gradient-text">${phase.title}</h1>
    </div>

    <div class="phase-detail-goal">
      <h3>Phase Goal</h3>
      <p>${phase.goal || 'No goal specified for this phase.'}</p>
    </div>

    <!-- Phase Progress Meter -->
    <div class="card" style="padding: 20px; margin-bottom: 30px;">
      <div class="phase-card-progress" style="margin-bottom: 8px;">
        <span class="phase-progress-label" style="font-weight: 600">Phase Completion</span>
        <span class="phase-progress-val" id="detail-pct-val" style="font-weight: 700">0%</span>
      </div>
      <div class="phase-card-progress-bar" style="height: 8px;">
        <div class="phase-card-progress-fill" id="detail-bar-fill" style="width: 0%"></div>
      </div>
    </div>
  `;

  // Render Core Tables if Phase has them
  if (phase.tables && phase.tables.length > 0) {
    phase.tables.forEach(table => {
      html += `<div class="card table-card" style="overflow-x: auto;">`;
      html += `<table><thead><tr>`;
      
      table.headers.forEach(h => {
        html += `<th>${h}</th>`;
      });
      html += `</tr></thead><tbody>`;

      table.rows.forEach(row => {
        html += `<tr>`;
        row.forEach(cell => {
          // Parse links or styling inside tables
          html += `<td>${marked.parseInline(cell)}</td>`;
        });
        html += `</tr>`;
      });
      html += `</tbody></table></div>`;
    });
  }

  // Render Checklist Groups
  Object.keys(phase.groups).forEach(groupName => {
    const items = phase.groups[groupName];
    if (items.length === 0) return;

    html += `
      <div class="checklist-group">
        <h3 class="checklist-group-title">${groupName}</h3>
        <div class="checklist-list">
    `;

    items.forEach(item => {
      const itemKey = `${phase.id}:${item.title}`;
      const isChecked = STATE.checkedItems[itemKey] ? 'checked' : '';
      
      html += `
        <div class="checklist-item ${isChecked}" data-key="${itemKey}">
          <div class="checklist-checkbox-wrapper">
            <input type="checkbox" ${isChecked ? 'checked' : ''} />
            <div class="custom-checkbox"><i class="fa-solid fa-check"></i></div>
          </div>
          <div class="checklist-content">
            <span class="checklist-text">${marked.parseInline(item.title)}</span>
            ${item.description ? `<span class="checklist-desc">${marked.parseInline(item.description)}</span>` : ''}
          </div>
        </div>
      `;
    });

    html += `
        </div>
      </div>
    `;
  });

  // Render Practice Builds (🏆 Showcases)
  if (phase.practiceBuilds && phase.practiceBuilds.length > 0) {
    html += `<div class="practice-showcase">`;
    html += `<h3><i class="fa-solid fa-trophy"></i> Practice Build Projects</h3>`;
    phase.practiceBuilds.forEach(build => {
      html += `<p style="margin-bottom: 8px;">${marked.parseInline(build)}</p>`;
    });
    html += `</div>`;
  }

  // Render YouTube searches
  if (phase.youtubeSearches && phase.youtubeSearches.length > 0) {
    html += `
      <div class="youtube-section">
        <h3><i class="fa-brands fa-youtube"></i> Recommended YouTube Search Terms</h3>
        <p style="font-size: 13px; color: var(--color-text-secondary); margin-bottom: 12px;">Click a term to search directly on YouTube:</p>
        <div class="chips-container">
    `;
    phase.youtubeSearches.forEach(term => {
      html += `
        <div class="youtube-chip" data-query="${term}">
          <i class="fa-brands fa-youtube"></i>
          <span>${term}</span>
          <i class="fa-solid fa-arrow-up-right-from-square" style="font-size: 10px; margin-left: 4px; opacity: 0.5;"></i>
        </div>
      `;
    });
    html += `
        </div>
      </div>
    `;
  }

  container.innerHTML = html;

  // Bind checkbox toggle events
  container.querySelectorAll('.checklist-item').forEach(el => {
    const checkbox = el.querySelector('input[type="checkbox"]');
    const key = el.getAttribute('data-key');
    
    // Toggle by clicking anywhere on the card
    el.addEventListener('click', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.closest('a')) {
        return; // Let the native checkbox or links handle themselves
      }
      checkbox.checked = !checkbox.checked;
      triggerCheckboxToggle(checkbox, el, key);
    });

    checkbox.addEventListener('change', () => {
      triggerCheckboxToggle(checkbox, el, key);
    });
  });

  // Bind YouTube chip search events
  container.querySelectorAll('.youtube-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const query = chip.getAttribute('data-query');
      const url = `https://www.youtube.com/results?search_query=n8n+${encodeURIComponent(query)}`;
      window.open(url, '_blank');
    });
  });
}

function triggerCheckboxToggle(checkbox, element, key) {
  if (checkbox.checked) {
    element.classList.add('checked');
    STATE.checkedItems[key] = true;
  } else {
    element.classList.remove('checked');
    delete STATE.checkedItems[key];
  }
  saveProgress();
}

// Render Extra Sections (Markdown Pages like "How to use", "Bonus", "Resources")
function renderExtraSection(extraId) {
  const extra = STATE.extras.find(e => e.id === extraId);
  const container = document.getElementById('extra-section-container');
  if (!extra || !container) return;

  const rawMarkdown = extra.contentLines.join('\n');

  // Let's optimize rendering of the "Bonus" section if it matches
  if (extra.title.toLowerCase().includes('bonus')) {
    renderBonusSection(extra, container);
  } else {
    container.innerHTML = `
      <h1 class="gradient-text">${extra.title}</h1>
      <div class="markdown-body">
        ${marked.parse(rawMarkdown)}
      </div>
    `;
  }
}

// Renders the Bonus section in a premium collapsible/card style
function renderBonusSection(extra, container) {
  const lines = extra.contentLines;
  let mistakes = [];
  let habits = [];
  let currentGroup = '';

  lines.forEach(line => {
    const trimmed = line.trim();
    if (trimmed.includes('Beginner mistakes')) {
      currentGroup = 'mistakes';
    } else if (trimmed.includes('Pro habits')) {
      currentGroup = 'habits';
    } else if (trimmed.startsWith('- ')) {
      const text = trimmed.replace('- ', '');
      if (currentGroup === 'mistakes') mistakes.push(text);
      if (currentGroup === 'habits') habits.push(text);
    }
  });

  let html = `
    <h1 class="gradient-text">${extra.title}</h1>
    <p class="subtitle" style="margin-bottom: 30px;">Critical habits to adopt and common errors to avoid as you build n8n workflows.</p>
    
    <div class="collapsible-container active">
      <div class="collapsible-header" style="border-left: 4px solid var(--color-danger)">
        <h3><i class="fa-solid fa-circle-xmark text-danger" style="color: var(--color-danger)"></i> 🚫 Avoid These (Beginner Mistakes)</h3>
        <i class="fa-solid fa-chevron-down collapsible-icon"></i>
      </div>
      <div class="collapsible-content">
        <ul style="margin: 0; padding-left: 20px;">
  `;
  
  mistakes.forEach(m => {
    html += `<li style="margin-bottom: 12px; font-size: 15px; color: var(--color-text-secondary);">${marked.parseInline(m)}</li>`;
  });

  html += `
        </ul>
      </div>
    </div>

    <div class="collapsible-container active" style="margin-top: 20px">
      <div class="collapsible-header" style="border-left: 4px solid var(--color-success)">
        <h3><i class="fa-solid fa-circle-check text-success" style="color: var(--color-success)"></i> ✅ Do These (Pro Habits)</h3>
        <i class="fa-solid fa-chevron-down collapsible-icon"></i>
      </div>
      <div class="collapsible-content">
        <ul style="margin: 0; padding-left: 20px;">
  `;

  habits.forEach(h => {
    html += `<li style="margin-bottom: 12px; font-size: 15px; color: var(--color-text-secondary);">${marked.parseInline(h)}</li>`;
  });

  html += `
        </ul>
      </div>
    </div>
  `;

  container.innerHTML = html;

  // Setup collapsible triggers
  container.querySelectorAll('.collapsible-header').forEach(header => {
    header.addEventListener('click', () => {
      header.parentElement.classList.toggle('active');
    });
  });
}

// Routing/View Switcher
function switchView(viewName, resourceId = null) {
  STATE.activeView = viewName;
  STATE.activePhaseId = viewName === 'phase' ? resourceId : null;
  STATE.activeExtraId = viewName === 'extra' ? resourceId : null;

  // Deactivate all views
  document.querySelectorAll('.content-view').forEach(view => {
    view.classList.remove('active');
  });

  // Deactivate all sidebar active styles
  document.querySelectorAll('.menu-item').forEach(item => {
    item.classList.remove('active');
  });

  // Activate Sidebar Item
  if (viewName === 'dashboard') {
    const item = document.querySelector(`.menu-item[data-view="dashboard"]`);
    if (item) item.classList.add('active');
    document.getElementById('view-dashboard').classList.add('active');
  } else if (viewName === 'phase' && resourceId) {
    const item = document.querySelector(`.menu-item[data-view="phase"][data-id="${resourceId}"]`);
    if (item) item.classList.add('active');
    
    renderPhaseDetail(resourceId);
    document.getElementById('view-phase-detail').classList.add('active');
    updateProgressIndicators();
  } else if (viewName === 'extra' && resourceId) {
    const item = document.querySelector(`.menu-item[data-view="extra"][data-id="${resourceId}"]`);
    if (item) item.classList.add('active');
    
    renderExtraSection(resourceId);
    document.getElementById('view-extra-section').classList.add('active');
  } else if (viewName === 'contact') {
    const item = document.getElementById('sidebar-contact-btn');
    if (item) item.classList.add('active');
    
    // Deactivate detail/extra/search
    document.getElementById('view-phase-detail').classList.remove('active');
    document.getElementById('view-extra-section').classList.remove('active');
    document.getElementById('view-search-results').classList.remove('active');
    
    // Activate dashboard view
    document.getElementById('view-dashboard').classList.add('active');
    
    // Scroll to contact section
    const contactSec = document.getElementById('contact-section');
    if (contactSec) {
      setTimeout(() => {
        contactSec.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  } else if (viewName === 'search') {
    document.getElementById('view-search-results').classList.add('active');
  }

  // Scroll main container to top (unless transitioning to contact)
  if (viewName !== 'contact') {
    document.getElementById('content-body').scrollTop = 0;
  }
}

// Search Logic
function performSearch(query) {
  const q = query.trim().toLowerCase();
  const searchResultsCount = document.getElementById('search-results-count');
  const searchResultsContainer = document.getElementById('search-results-container');
  const queryDisplay = document.getElementById('search-query-display');

  queryDisplay.textContent = `"${query}"`;
  
  if (q === '') {
    switchView('dashboard');
    return;
  }

  switchView('search');

  let resultsCount = 0;
  let html = '';

  // Helper to highlight match
  function highlight(text) {
    const idx = text.toLowerCase().indexOf(q);
    if (idx === -1) return text;
    
    // Safe text replacement keeping casing
    const originalText = text.substring(idx, idx + q.length);
    return text.replace(new RegExp(q, 'i'), `<span class="highlight">${originalText}</span>`);
  }

  // 1. Search in Phases
  STATE.phases.forEach(phase => {
    let phaseHasMatch = false;
    let phaseHtml = `
      <div class="card" style="margin-bottom: 24px;">
        <h3 class="gradient-text" style="font-family: var(--font-heading); font-size: 18px; margin-bottom: 12px; cursor:pointer;" onclick="window.appSwitchView('phase', '${phase.id}')">
          ${phase.title} <i class="fa-solid fa-arrow-right-long" style="font-size: 12px; margin-left: 6px;"></i>
        </h3>
    `;

    // Search Goal
    if (phase.goal && phase.goal.toLowerCase().includes(q)) {
      phaseHasMatch = true;
      resultsCount++;
      phaseHtml += `
        <div style="background-color: var(--bg-input); padding: 12px; border-radius: var(--radius-sm); border-left: 3px solid var(--color-primary); margin-bottom: 12px;">
          <span style="font-size: 11px; text-transform: uppercase; color: var(--color-primary); font-weight: 700; display: block;">Phase Goal Match</span>
          <p style="font-size: 13px; color: var(--color-text-secondary); margin-top: 4px;">${highlight(phase.goal)}</p>
        </div>
      `;
    }

    // Search Checklist Items
    let itemsHtml = '';
    Object.keys(phase.groups).forEach(groupName => {
      phase.groups[groupName].forEach(item => {
        const titleMatch = item.title.toLowerCase().includes(q);
        const descMatch = item.description && item.description.toLowerCase().includes(q);
        
        if (titleMatch || descMatch) {
          phaseHasMatch = true;
          resultsCount++;
          const itemKey = `${phase.id}:${item.title}`;
          const isChecked = STATE.checkedItems[itemKey] ? 'checked' : '';

          itemsHtml += `
            <div class="checklist-item ${isChecked}" data-key="${itemKey}" style="padding: 10px 12px; font-size:14px; margin-bottom: 8px;">
              <div class="checklist-checkbox-wrapper">
                <input type="checkbox" ${isChecked ? 'checked' : ''} />
                <div class="custom-checkbox" style="width:18px; height:18px; font-size:8px;"><i class="fa-solid fa-check"></i></div>
              </div>
              <div class="checklist-content">
                <span class="checklist-text" style="font-size: 14px;">${highlight(item.title)}</span>
                ${item.description ? `<span class="checklist-desc" style="font-size: 12px;">${highlight(item.description)}</span>` : ''}
              </div>
            </div>
          `;
        }
      });
    });

    if (itemsHtml !== '') {
      phaseHtml += `
        <div style="margin-bottom: 12px;">
          <span style="font-size: 11px; text-transform: uppercase; color: var(--color-text-muted); font-weight: 700; display: block; margin-bottom: 6px;">Checklist Matches</span>
          ${itemsHtml}
        </div>
      `;
    }

    // Search YouTube searches
    const matchedYoutube = phase.youtubeSearches.filter(y => y.toLowerCase().includes(q));
    if (matchedYoutube.length > 0) {
      phaseHasMatch = true;
      resultsCount += matchedYoutube.length;
      
      let chips = '';
      matchedYoutube.forEach(term => {
        chips += `
          <div class="youtube-chip search-youtube-chip" data-query="${term}" style="font-size: 11px; padding: 6px 12px;">
            <i class="fa-brands fa-youtube"></i>
            <span>${highlight(term)}</span>
          </div>
        `;
      });

      phaseHtml += `
        <div style="margin-bottom: 12px;">
          <span style="font-size: 11px; text-transform: uppercase; color: var(--color-danger); font-weight: 700; display: block; margin-bottom: 6px;">YouTube Search Match</span>
          <div class="chips-container">${chips}</div>
        </div>
      `;
    }

    // Search tables
    let tableMatchHtml = '';
    if (phase.tables && phase.tables.length > 0) {
      phase.tables.forEach(table => {
        let headerMatch = table.headers.some(h => h.toLowerCase().includes(q));
        let matchedRows = table.rows.filter(row => row.some(cell => cell.toLowerCase().includes(q)));

        if (headerMatch || matchedRows.length > 0) {
          phaseHasMatch = true;
          resultsCount += matchedRows.length || 1;

          tableMatchHtml += `<table style="margin: 10px 0; font-size:12px;"><thead><tr>`;
          table.headers.forEach(h => {
            tableMatchHtml += `<th>${highlight(h)}</th>`;
          });
          tableMatchHtml += `</tr></thead><tbody>`;

          // Display either all matching rows or all rows if headers matched
          const rowsToDisplay = matchedRows.length > 0 ? matchedRows : table.rows;
          rowsToDisplay.forEach(row => {
            tableMatchHtml += `<tr>`;
            row.forEach(cell => {
              tableMatchHtml += `<td>${highlight(cell)}</td>`;
            });
            tableMatchHtml += `</tr>`;
          });

          tableMatchHtml += `</tbody></table>`;
        }
      });
    }

    if (tableMatchHtml !== '') {
      phaseHtml += `
        <div>
          <span style="font-size: 11px; text-transform: uppercase; color: var(--color-secondary); font-weight: 700; display: block;">Table Match</span>
          <div style="overflow-x: auto;">${tableMatchHtml}</div>
        </div>
      `;
    }

    phaseHtml += `</div>`;

    if (phaseHasMatch) {
      html += phaseHtml;
    }
  });

  // 2. Search in Extra sections
  STATE.extras.forEach(extra => {
    let extraHasMatch = false;
    let extraHtml = `
      <div class="card" style="margin-bottom: 24px;">
        <h3 class="gradient-text" style="font-family: var(--font-heading); font-size: 18px; margin-bottom: 12px; cursor:pointer;" onclick="window.appSwitchView('extra', '${extra.id}')">
          ${extra.title} <i class="fa-solid fa-arrow-right-long" style="font-size: 12px; margin-left: 6px;"></i>
        </h3>
        <div style="font-size:14px; color: var(--color-text-secondary); line-height: 1.5;">
    `;

    // Filter paragraph lines that match query
    let snippetCount = 0;
    extra.contentLines.forEach(line => {
      const cleanLine = line.trim();
      if (cleanLine.length > 5 && cleanLine.toLowerCase().includes(q) && !cleanLine.startsWith('#') && !cleanLine.startsWith('---')) {
        extraHasMatch = true;
        snippetCount++;
        resultsCount++;
        
        extraHtml += `
          <p style="background-color: var(--bg-input); padding: 8px 12px; border-radius: var(--radius-sm); margin-bottom: 8px; font-size: 13px;">
            ... ${highlight(cleanLine)} ...
          </p>
        `;
      }
    });

    extraHtml += `</div></div>`;

    if (extraHasMatch && snippetCount > 0) {
      html += extraHtml;
    }
  });

  searchResultsCount.textContent = `Found ${resultsCount} matches`;
  
  if (resultsCount === 0) {
    searchResultsContainer.innerHTML = `
      <div class="loading-state" style="padding: 40px 0;">
        <i class="fa-solid fa-magnifying-glass-minus" style="font-size: 40px; color: var(--color-text-muted)"></i>
        <p>No results found for "${query}". Try searching for specific nodes (e.g. "HTTP Request", "IF") or topics.</p>
      </div>
    `;
  } else {
    searchResultsContainer.innerHTML = html;
    
    // Bind checkbox events in search results
    searchResultsContainer.querySelectorAll('.checklist-item').forEach(el => {
      const checkbox = el.querySelector('input[type="checkbox"]');
      const key = el.getAttribute('data-key');

      el.addEventListener('click', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.closest('a')) return;
        checkbox.checked = !checkbox.checked;
        triggerCheckboxToggle(checkbox, el, key);
      });

      checkbox.addEventListener('change', () => {
        triggerCheckboxToggle(checkbox, el, key);
      });
    });

    // Bind YouTube searches in search results
    searchResultsContainer.querySelectorAll('.search-youtube-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const query = chip.getAttribute('data-query');
        const url = `https://www.youtube.com/results?search_query=n8n+${encodeURIComponent(query)}`;
        window.open(url, '_blank');
      });
    });
  }
}

// Expose switchView to window so inline onclick handlers in Search Results work
window.appSwitchView = switchView;

// Set up UI Event Listeners
function setupEventListeners() {
  // Back to dashboard
  document.getElementById('back-to-dashboard').addEventListener('click', () => {
    switchView('dashboard');
  });

  // Mobile sidebar toggle
  const mobileToggle = document.getElementById('mobile-toggle');
  const closeSidebar = document.getElementById('close-sidebar');
  const sidebar = document.getElementById('sidebar');

  mobileToggle.addEventListener('click', () => {
    sidebar.classList.add('mobile-open');
  });

  closeSidebar.addEventListener('click', () => {
    sidebar.classList.remove('mobile-open');
  });

  // Close mobile sidebar by clicking outside
  document.addEventListener('click', (e) => {
    if (sidebar.classList.contains('mobile-open') && 
        !sidebar.contains(e.target) && 
        !mobileToggle.contains(e.target)) {
      sidebar.classList.remove('mobile-open');
    }
  });

  // Search logic listeners
  const searchInput = document.getElementById('search-input');
  const clearSearchBtn = document.getElementById('clear-search');

  searchInput.addEventListener('input', (e) => {
    const val = e.target.value;
    if (val.trim() !== '') {
      clearSearchBtn.style.display = 'block';
    } else {
      clearSearchBtn.style.display = 'none';
    }
    performSearch(val);
  });

  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    clearSearchBtn.style.display = 'none';
    searchInput.focus();
    switchView('dashboard');
  });

  // Contact Form Submit Handler
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const name = document.getElementById('form-name').value;
      const email = document.getElementById('form-email').value;
      const subject = document.getElementById('form-subject').value;
      const message = document.getElementById('form-message').value;
      
      const emailBody = `Full Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`;
      
      // Construct mailto link
      const mailtoUrl = `mailto:aiwithhammad2026@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
      
      // Trigger mailto
      window.location.href = mailtoUrl;
      
      // Reset form
      contactForm.reset();
      
      // Show confirmation message
      showToastMessage("Opening your default email client...");
    });
  }

  // PDF Download Button Handler
  const downloadPdfBtn = document.getElementById('download-pdf-btn');
  if (downloadPdfBtn) {
    downloadPdfBtn.addEventListener('click', () => {
      window.print();
    });
  }
}

// Custom Toast Message Function
function showToastMessage(msg) {
  let toast = document.getElementById('toast-notification');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast-notification';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.className = 'toast-show';
  
  setTimeout(() => {
    toast.className = '';
  }, 4000);
}

// Generate print-only DOM container structure with full checklist details
function generatePrintLayout() {
  const container = document.getElementById('print-container');
  if (!container) return;

  let html = `
    <div class="print-header">
      <h1>${STATE.metadata.title || 'n8n Zero to Hero Roadmap'}</h1>
      <div class="print-meta">
        <p><strong>Prepared for:</strong> ${STATE.metadata.preparedFor || 'Hammad Ullah'}</p>
        <p><strong>Email:</strong> ${STATE.metadata.email || 'aiwithhammad2026@gmail.com'} | <strong>Phone:</strong> ${STATE.metadata.phone || '0333-1904805'}</p>
        <p><strong>Stats:</strong> ${STATE.metadata.stats || '11 Learning phases · 30+ Core nodes'}</p>
      </div>
    </div>
    <hr style="border:none; border-top: 2px solid #000; margin: 20px 0;" />
  `;

  // Append phases sequentially
  STATE.phases.forEach(phase => {
    html += `
      <div class="print-phase" style="page-break-inside: avoid; margin-bottom: 30px;">
        <h2 style="font-size: 20px; margin-bottom: 8px;">${phase.title} <span style="font-size: 13px; font-weight: normal; color: #555;">— ${phase.duration}</span></h2>
        <div class="print-goal" style="background-color: #f7f7f7; border-left: 3px solid #ff4500; padding: 10px; font-size: 13px; margin-bottom: 15px; font-style: italic;">
          <strong>Goal:</strong> ${phase.goal}
        </div>
    `;

    // Tables
    if (phase.tables && phase.tables.length > 0) {
      phase.tables.forEach(table => {
        html += `<table style="width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 12px;"><thead style="background-color: #f0f0f0;"><tr>`;
        table.headers.forEach(h => html += `<th style="border: 1px solid #ddd; padding: 8px; text-align: left;">${h}</th>`);
        html += `</tr></thead><tbody>`;
        table.rows.forEach(row => {
          html += `<tr>`;
          row.forEach(cell => html += `<td style="border: 1px solid #ddd; padding: 8px; text-align: left;">${marked.parseInline(cell)}</td>`);
          html += `</tr>`;
        });
        html += `</tbody></table>`;
      });
    }

    // Checklist
    Object.keys(phase.groups).forEach(groupName => {
      const items = phase.groups[groupName];
      if (items.length === 0) return;
      html += `<h3 style="font-size: 14px; margin-top: 15px; margin-bottom: 8px; border-bottom: 1px solid #eee; padding-bottom: 4px;">${groupName}</h3>`;
      html += `<ul style="list-style: none; padding-left: 0; margin-bottom: 15px;">`;
      items.forEach(item => {
        const itemKey = `${phase.id}:${item.title}`;
        const isChecked = STATE.checkedItems[itemKey] ? '☒' : '☐';
        html += `<li style="font-size: 13px; margin-bottom: 6px; display: flex; align-items: flex-start; gap: 8px;">`;
        html += `<span style="font-family: monospace; font-size: 14px; line-height: 1;">${isChecked}</span>`;
        html += `<span><strong>${item.title}</strong>${item.description ? ` — ${item.description}` : ''}</span>`;
        html += `</li>`;
      });
      html += `</ul>`;
    });

    // Practice Builds
    if (phase.practiceBuilds && phase.practiceBuilds.length > 0) {
      html += `<h4 style="font-size: 13px; margin-top: 15px; margin-bottom: 6px;">Practice Builds:</h4>`;
      html += `<ul style="padding-left: 20px; font-size: 13px; margin-bottom: 15px;">`;
      phase.practiceBuilds.forEach(build => {
        html += `<li style="margin-bottom: 4px;">🏆 ${build}</li>`;
      });
      html += `</ul>`;
    }

    // Youtube Searches
    if (phase.youtubeSearches && phase.youtubeSearches.length > 0) {
      html += `<p style="font-size: 12px; color: #555; margin-top: 10px;"><strong>YouTube Searches:</strong> ${phase.youtubeSearches.map(s => `<code>${s}</code>`).join(' · ')}</p>`;
    }

    html += `</div><hr style="border:none; border-top: 1px solid #ddd; margin: 20px 0;" />`;
  });

  // Append extras
  STATE.extras.forEach(extra => {
    const rawMarkdown = extra.contentLines.join('\n');
    html += `
      <div class="print-extra" style="page-break-inside: avoid; margin-bottom: 30px;">
        <h2 style="font-size: 20px; margin-bottom: 15px;">${extra.title}</h2>
        <div class="print-markdown" style="font-size: 13px; line-height: 1.5;">
          ${marked.parse(rawMarkdown)}
        </div>
      </div>
      <hr style="border:none; border-top: 1px solid #ddd; margin: 20px 0;" />
    `;
  });

  // Footer
  html += `
    <div class="print-footer" style="text-align: center; font-size: 11px; color: #777; margin-top: 30px; page-break-before: avoid;">
      <p>Roadmap prepared for <strong>${STATE.metadata.preparedFor || 'Hammad Ullah'}</strong></p>
      <p>Contact: ${STATE.metadata.email || 'aiwithhammad2026@gmail.com'} | ${STATE.metadata.phone || '0333-1904805'}</p>
      <p>Generated dynamically from the live web roadmap website</p>
    </div>
  `;

  container.innerHTML = html;
}
