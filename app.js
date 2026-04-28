const STORAGE_KEY = "gestion-opticas-infra-v3";

const SITES = [
  "P.C. El Tesoro",
  "C.C Oviedo",
  "C.C San Diego",
  "C.C Punto Clave",
  "C.C Premium Plaza",
  "C.C Santafe",
  "Av. Poblado",
  "Bolivariana",
  "Suramericana",
  "H. Pablo Tobon Uribe",
  "P.C Florida",
  "P.C Florida 2",
  "C.C Los Molinos 1",
  "C.C Los Molinos 2",
  "C.C Arkadia",
  "Av. Oriental",
  "Sucre",
  "C.C La Central",
  "Envigado 1",
  "Envigado 2",
  "C.C Viva Envigado",
  "C.C Mayorca 1",
  "C.C Mayorca 2",
  "Itagui 1",
  "C.C Plaza Arrayanes",
  "Bello centro",
  "C.C Puerta del Norte",
  "C.C Estacion Niquia",
  "C.C Parque Fabricato",
  "Rionegro 1",
  "Rionegro 2",
  "C.C San Nicolas",
  "C.C San Nicolas 2",
  "C.C Nuestro Uraba",
  "C.C Plaza del rio",
  "C.C Gran Estacion",
  "C.C Viva Tunja",
  "C.C Andino",
  "Sede Administrativa Poblado",
  "Sede Administrativa Patio Bonito",
  "Optica Alma Mater",
  "CC Viva Barranquilla",
];

const AREAS = [
  "Todas",
  "Operacion diaria",
  "Mantenimiento",
  "Obras y reformas",
  "Cotizaciones y proveedores",
  "Evidencias y notas",
];

const STATUSES = [
  "Todos",
  "Reportado",
  "Revisado",
  "Cotizando",
  "Aprobado",
  "En ejecucion",
  "Pendiente cierre",
  "Cerrado",
];

const PRIORITIES = ["Todas", "Alta", "Media", "Baja"];
const IMPACTS = ["Operativo", "Comercial", "Imagen", "Seguridad"];
const TRAFFIC = ["Rojo", "Amarillo", "Verde"];

const SAMPLE_CASES = [
  {
    site: "P.C. El Tesoro",
    area: "Mantenimiento",
    title: "Pintura en backing",
    detail: "Se detecta desgaste visible en pared principal del punto. Se requiere visita y definicion de alcance.",
    priority: "Media",
    status: "Reportado",
    impact: "Imagen",
    traffic: "Amarillo",
    owner: "Infraestructura",
    dueDate: todayPlusDays(3),
    provider: "",
    budget: "",
    progress: 10,
    createdAt: new Date().toISOString(),
  },
  {
    site: "P.C. El Tesoro",
    area: "Mantenimiento",
    title: "Limpieza de vidrios",
    detail: "Coordinar servicio de limpieza exterior y confirmar fecha con centro comercial.",
    priority: "Baja",
    status: "En ejecucion",
    impact: "Imagen",
    traffic: "Verde",
    owner: "Servicios generales",
    dueDate: todayPlusDays(2),
    provider: "Brillo Total",
    budget: "180000",
    progress: 60,
    createdAt: new Date().toISOString(),
  },
  {
    site: "Envigado 1",
    area: "Obras y reformas",
    title: "Remodelacion de recepcion",
    detail: "Se requiere propuesta de rediseno, validacion de presupuesto y cronograma de ejecucion.",
    priority: "Alta",
    status: "Cotizando",
    impact: "Comercial",
    traffic: "Rojo",
    owner: "Diseno",
    dueDate: todayPlusDays(7),
    provider: "Arquivisual SAS",
    budget: "8500000",
    progress: 20,
    createdAt: new Date().toISOString(),
  },
];

const state = {
  search: "",
  area: "Todas",
  priority: "Todas",
  status: "Todos",
  activeSiteModal: null,
  focusedEntry: null,
  sites: loadSites(),
};

const els = {};

document.addEventListener("DOMContentLoaded", () => {
  bindElements();
  populateFilters();
  attachEvents();
  render();
});

function bindElements() {
  const ids = [
    "searchInput",
    "typeFilter",
    "priorityFilter",
    "statusFilter",
    "metricsGrid",
    "siteGrid",
    "siteModalRoot",
    "summaryList",
    "loadSamplesButton",
    "exportAllButton",
  ];

  ids.forEach((id) => {
    els[id] = document.getElementById(id);
  });
}

function populateFilters() {
  fillSelect(els.typeFilter, AREAS);
  fillSelect(els.priorityFilter, PRIORITIES);
  fillSelect(els.statusFilter, STATUSES);
}

function attachEvents() {
  els.searchInput.addEventListener("input", (event) => {
    state.search = event.target.value.trim().toLowerCase();
    render();
  });

  els.typeFilter.addEventListener("change", (event) => {
    state.area = event.target.value;
    render();
  });

  els.priorityFilter.addEventListener("change", (event) => {
    state.priority = event.target.value;
    render();
  });

  els.statusFilter.addEventListener("change", (event) => {
    state.status = event.target.value;
    render();
  });

  els.loadSamplesButton.addEventListener("click", seedExamples);
  els.exportAllButton.addEventListener("click", exportData);

  els.siteGrid.addEventListener("click", handleSiteGridClick);
  els.siteModalRoot.addEventListener("click", handleSiteModalClick);
  els.siteModalRoot.addEventListener("change", handleSiteModalChange);
  els.siteModalRoot.addEventListener("submit", handleSiteModalSubmit);
}

function render() {
  persistSites();
  renderMetrics();
  renderSidebarSummary();
  renderSiteGrid();
  renderSiteModal();
}

function renderMetrics() {
  const visibleSites = getVisibleSites();
  const allEntries = flattenEntries(visibleSites);
  const criticalSites = visibleSites.filter((site) => site.entries.some((entry) => entry.traffic === "Rojo" && entry.status !== "Cerrado")).length;
  const activeProjects = allEntries.filter((entry) => entry.area === "Obras y reformas" && entry.status !== "Cerrado").length;
  const quoting = allEntries.filter((entry) => entry.status === "Cotizando").length;
  const overdue = allEntries.filter((entry) => isOverdue(entry)).length;

  const metrics = [
    { label: "Sedes criticas", value: criticalSites },
    { label: "Obras activas", value: activeProjects },
    { label: "Cotizaciones pendientes", value: quoting },
    { label: "Casos vencidos", value: overdue },
  ];

  const template = document.getElementById("metricTemplate");
  els.metricsGrid.innerHTML = "";

  metrics.forEach((metric) => {
    const clone = template.content.cloneNode(true);
    clone.querySelector(".metric-label").textContent = metric.label;
    clone.querySelector(".metric-value").textContent = metric.value;
    els.metricsGrid.appendChild(clone);
  });
}

function renderSidebarSummary() {
  const allEntries = flattenEntries(getVisibleSites());
  const summary = [
    ["Reportados", allEntries.filter((entry) => entry.status === "Reportado").length],
    ["En ejecucion", allEntries.filter((entry) => entry.status === "En ejecucion").length],
    ["Pendientes cierre", allEntries.filter((entry) => entry.status === "Pendiente cierre").length],
    ["Impacto seguridad", allEntries.filter((entry) => entry.impact === "Seguridad" && entry.status !== "Cerrado").length],
    ["Proyectos aprobados", allEntries.filter((entry) => entry.status === "Aprobado").length],
  ];

  els.summaryList.innerHTML = summary.map(([label, value]) => `
    <div class="summary-item">
      <span>${label}</span>
      <strong>${value}</strong>
    </div>
  `).join("");
}

function renderSiteGrid() {
  const sites = getVisibleSites();

  els.siteGrid.innerHTML = sites.map((site) => {
    const entries = getFilteredEntries(site.entries);
    const latest = entries.slice(0, 3);
    const counts = summarizeEntries(site.entries);
    const initials = getInitials(site.name);
    const coverClass = site.image ? "site-cover has-image" : "site-cover";
    const coverStyle = site.image ? `style="background-image:url('${site.image}')"` : "";
    const severity = getSiteSeverity(site.entries);

    return `
      <article class="site-card" data-site-card="${escapeHtml(site.name)}">
        <div class="${coverClass}" ${coverStyle}>
          <div class="cover-overlay"></div>
          <div class="site-badge">${escapeHtml(initials)}</div>
        </div>

        <div class="site-main">
          <div class="site-header">
            <div>
              <h4 class="site-title">${escapeHtml(site.name)}</h4>
              <p class="site-subtitle">${site.image ? "Con imagen cargada" : "Sin imagen todavia"}</p>
            </div>
            <span class="status-dot severity-${severity.toLowerCase()}"></span>
          </div>

          <div class="mini-stats">
            ${renderMiniStat(counts.operacion, "Operacion")}
            ${renderMiniStat(counts.mantenimiento, "Mantto.")}
            ${renderMiniStat(counts.obras, "Obras")}
            ${renderMiniStat(counts.cotizaciones, "Cotiz.")}
          </div>

          <div class="site-kpis">
            <span class="tag traffic-${severity.toLowerCase()}">${severity}</span>
            <span class="tag">${counts.pending} activas</span>
            <span class="tag">${counts.security} seguridad</span>
          </div>

          <div class="latest-list">
            ${latest.length ? latest.map(renderCompactEntry).join("") : '<div class="empty-state">Esta sede aun no tiene casos en la vista actual.</div>'}
          </div>

          <div class="site-actions">
            <button class="action-button primary" type="button" data-open-site-modal="${escapeHtml(site.name)}">Abrir sede</button>
            <button class="action-button ghost" type="button" data-export-site="${escapeHtml(site.name)}">Exportar sede</button>
          </div>
        </div>

      </article>
    `;
  }).join("");
}

function renderSiteModal() {
  if (!state.activeSiteModal) {
    els.siteModalRoot.innerHTML = "";
    return;
  }

  const site = state.sites.find((item) => item.name === state.activeSiteModal);
  if (!site) {
    els.siteModalRoot.innerHTML = "";
    return;
  }

  const entries = getFilteredEntries(site.entries);
  const grouped = groupEntriesByArea(entries);
  const severity = getSiteSeverity(site.entries);
  const focusedEntry = getFocusedEntry(site.name);

  els.siteModalRoot.innerHTML = `
    <div class="site-modal-overlay">
      <button class="site-modal-backdrop" type="button" data-close-site-modal="true" aria-label="Cerrar sede"></button>
      <section class="site-modal">
        <header class="site-modal-header">
          <div>
            <p class="eyebrow">Centro de control</p>
            <h3>${escapeHtml(site.name)}</h3>
            <p class="muted">Gestiona operacion, mantenimiento, obras, proveedores y seguimiento desde una sola vista.</p>
          </div>
          <div class="site-actions">
            <span class="tag traffic-${severity.toLowerCase()}">${severity}</span>
            <button class="small-button" type="button" data-close-site-modal="true">Cerrar</button>
          </div>
        </header>

        <div class="site-modal-body">
          <div class="site-modal-main">
            <div class="executive-grid">
              ${renderExecutiveStat("Criticas", site.entries.filter((entry) => entry.traffic === "Rojo" && entry.status !== "Cerrado").length)}
              ${renderExecutiveStat("Cotizando", site.entries.filter((entry) => entry.status === "Cotizando").length)}
              ${renderExecutiveStat("En obra", site.entries.filter((entry) => entry.area === "Obras y reformas" && entry.status !== "Cerrado").length)}
              ${renderExecutiveStat("Cerradas", site.entries.filter((entry) => entry.status === "Cerrado").length)}
            </div>

            <div class="upload-row modal-upload">
              <div>
                <p class="eyebrow">Identificacion visual</p>
                <p class="muted small">Carga la fachada para reconocer la sede mas rapido.</p>
              </div>
              <div class="site-actions">
                <button class="upload-button" type="button" data-trigger-upload="${escapeHtml(site.name)}">Cargar imagen</button>
                ${site.image ? `<button class="small-button" type="button" data-remove-image="${escapeHtml(site.name)}">Quitar imagen</button>` : ""}
              </div>
              <input id="upload-modal-${slugify(site.name)}" class="hidden-input" type="file" accept="image/*" data-upload-image="${escapeHtml(site.name)}">
            </div>

            <div class="section-grid">
              ${AREAS.slice(1).map((area) => renderAreaSection(site.name, area, grouped[area] || [])).join("")}
            </div>
          </div>

          <aside class="site-modal-side">
            <section class="site-modal-panel">
              <p class="eyebrow">Nuevo caso</p>
              <h4>Registrar actividad</h4>
              <form class="entry-form" data-entry-form="${escapeHtml(site.name)}">
                <div class="entry-form-grid">
                  <label class="field">
                    <span>Frente de trabajo</span>
                    <select name="area">${AREAS.slice(1).map((area) => `<option value="${escapeHtml(area)}">${escapeHtml(area)}</option>`).join("")}</select>
                  </label>
                  <label class="field">
                    <span>Prioridad</span>
                    <select name="priority">${PRIORITIES.slice(1).map((priority) => `<option value="${escapeHtml(priority)}">${escapeHtml(priority)}</option>`).join("")}</select>
                  </label>
                  <label class="field">
                    <span>Estado</span>
                    <select name="status">${STATUSES.slice(1).map((status) => `<option value="${escapeHtml(status)}">${escapeHtml(status)}</option>`).join("")}</select>
                  </label>
                  <label class="field">
                    <span>Semaforo</span>
                    <select name="traffic">${TRAFFIC.map((item) => `<option value="${escapeHtml(item)}">${escapeHtml(item)}</option>`).join("")}</select>
                  </label>
                  <label class="field">
                    <span>Impacto</span>
                    <select name="impact">${IMPACTS.map((impact) => `<option value="${escapeHtml(impact)}">${escapeHtml(impact)}</option>`).join("")}</select>
                  </label>
                  <label class="field">
                    <span>Avance %</span>
                    <input name="progress" type="number" min="0" max="100" value="0">
                  </label>
                  <label class="field full">
                    <span>Titulo</span>
                    <input name="title" type="text" placeholder="Ej. Reforma de recepcion o novedad de mantenimiento" required>
                  </label>
                  <label class="field full">
                    <span>Seguimiento o detalle</span>
                    <textarea name="detail" placeholder="Describe el caso, el bloqueo, el avance o la necesidad."></textarea>
                  </label>
                  <label class="field">
                    <span>Responsable</span>
                    <input name="owner" type="text" placeholder="Nombre o area">
                  </label>
                  <label class="field">
                    <span>Proveedor</span>
                    <input name="provider" type="text" placeholder="Si aplica">
                  </label>
                  <label class="field">
                    <span>Fecha compromiso</span>
                    <input name="dueDate" type="date">
                  </label>
                  <label class="field">
                    <span>Presupuesto</span>
                    <input name="budget" type="text" placeholder="Ej. 8500000">
                  </label>
                </div>
                <div class="site-actions">
                  <button class="action-button primary" type="submit">Guardar caso</button>
                </div>
              </form>
            </section>

            ${focusedEntry ? renderModalFocusedPanel(site.name, focusedEntry) : `
              <section class="site-modal-panel">
                <p class="eyebrow">Edicion rapida</p>
                <h4>Selecciona un caso</h4>
                <p class="muted">Haz clic en cualquier caso de la sede para abrirlo aqui y editarlo sin deformar las tarjetas.</p>
              </section>
            `}
          </aside>
        </div>
      </section>
    </div>
  `;
}

function renderMiniStat(value, label) {
  return `<div class="mini-stat"><strong>${value}</strong><span>${label}</span></div>`;
}

function renderCompactEntry(entry) {
  return `
    <button class="latest-item latest-button" type="button" data-open-entry="${entry.id}">
      <div class="entry-top">
        <strong>${escapeHtml(entry.title)}</strong>
        <span class="tag priority-${entry.priority.toLowerCase()}">${escapeHtml(entry.priority)}</span>
      </div>
      <p class="muted small">${escapeHtml(entry.area)} | ${escapeHtml(entry.status)}</p>
    </button>
  `;
}

function renderExecutiveStat(label, value) {
  return `<div class="executive-stat"><strong>${value}</strong><span>${label}</span></div>`;
}

function renderAreaSection(siteName, area, entries) {
  return `
    <section class="area-section">
      <div class="entry-top">
        <div>
          <p class="eyebrow">Frente</p>
          <h4>${escapeHtml(area)}</h4>
        </div>
        <span class="tag">${entries.length} casos</span>
      </div>
      <div class="timeline-list">
        ${entries.length ? entries.map((entry) => renderTimelineEntry(siteName, entry)).join("") : '<div class="empty-state">Sin registros en este frente.</div>'}
      </div>
    </section>
  `;
}

function renderQuickEntryPanel(siteName, entry) {
  return `
    <button class="entry-drawer-backdrop" type="button" data-close-entry="${escapeHtml(siteName)}" aria-label="Cerrar vista rapida"></button>
    <section class="quick-entry-panel entry-drawer">
      <div class="entry-top">
        <div>
          <p class="eyebrow">Vista rapida</p>
          <strong>${escapeHtml(entry.title)}</strong>
        </div>
        <button class="small-button" type="button" data-close-entry="${escapeHtml(siteName)}">Cerrar</button>
      </div>

      <div class="quick-kpis">
        <span class="tag type">${escapeHtml(entry.area)}</span>
        <span class="tag priority-${entry.priority.toLowerCase()}">${escapeHtml(entry.priority)}</span>
        <span class="tag traffic-${entry.traffic.toLowerCase()}">${escapeHtml(entry.traffic)}</span>
      </div>

      <form class="entry-form" data-edit-entry-form="${escapeHtml(siteName)}" data-entry-id="${entry.id}">
        <div class="entry-form-grid">
          <label class="field">
            <span>Frente</span>
            <select name="area">${AREAS.slice(1).map((area) => `<option value="${escapeHtml(area)}" ${entry.area === area ? "selected" : ""}>${escapeHtml(area)}</option>`).join("")}</select>
          </label>
          <label class="field">
            <span>Prioridad</span>
            <select name="priority">${PRIORITIES.slice(1).map((priority) => `<option value="${escapeHtml(priority)}" ${entry.priority === priority ? "selected" : ""}>${escapeHtml(priority)}</option>`).join("")}</select>
          </label>
          <label class="field">
            <span>Estado</span>
            <select name="status">${STATUSES.slice(1).map((status) => `<option value="${escapeHtml(status)}" ${entry.status === status ? "selected" : ""}>${escapeHtml(status)}</option>`).join("")}</select>
          </label>
          <label class="field">
            <span>Semaforo</span>
            <select name="traffic">${TRAFFIC.map((item) => `<option value="${escapeHtml(item)}" ${entry.traffic === item ? "selected" : ""}>${escapeHtml(item)}</option>`).join("")}</select>
          </label>
          <label class="field">
            <span>Impacto</span>
            <select name="impact">${IMPACTS.map((impact) => `<option value="${escapeHtml(impact)}" ${entry.impact === impact ? "selected" : ""}>${escapeHtml(impact)}</option>`).join("")}</select>
          </label>
          <label class="field">
            <span>Avance %</span>
            <input name="progress" type="number" min="0" max="100" value="${Number(entry.progress || 0)}">
          </label>
          <label class="field full">
            <span>Titulo</span>
            <input name="title" type="text" value="${escapeAttribute(entry.title)}" required>
          </label>
          <label class="field full">
            <span>Seguimiento o detalle</span>
            <textarea name="detail">${escapeHtml(entry.detail || "")}</textarea>
          </label>
          <label class="field">
            <span>Responsable</span>
            <input name="owner" type="text" value="${escapeAttribute(entry.owner || "")}">
          </label>
          <label class="field">
            <span>Proveedor</span>
            <input name="provider" type="text" value="${escapeAttribute(entry.provider || "")}">
          </label>
          <label class="field">
            <span>Fecha compromiso</span>
            <input name="dueDate" type="date" value="${entry.dueDate || ""}">
          </label>
          <label class="field">
            <span>Presupuesto</span>
            <input name="budget" type="text" value="${escapeAttribute(entry.budget || "")}">
          </label>
        </div>
        <div class="site-actions">
          <button class="action-button primary" type="submit">Guardar cambios</button>
          <button class="small-button" type="button" data-advance-entry="${entry.id}" data-site="${escapeHtml(siteName)}">Mover estado</button>
        </div>
      </form>
    </section>
  `;
}

function renderModalFocusedPanel(siteName, entry) {
  return `
    <section class="site-modal-panel">
      <div class="entry-top">
        <div>
          <p class="eyebrow">Caso seleccionado</p>
          <h4>${escapeHtml(entry.title)}</h4>
        </div>
        <div class="site-actions">
          <span class="tag traffic-${entry.traffic.toLowerCase()}">${escapeHtml(entry.traffic)}</span>
          <button class="small-button" type="button" data-clear-focused-entry="true">Limpiar</button>
        </div>
      </div>

      <div class="quick-kpis">
        <span class="tag type">${escapeHtml(entry.area)}</span>
        <span class="tag priority-${entry.priority.toLowerCase()}">${escapeHtml(entry.priority)}</span>
        <span class="tag">${escapeHtml(entry.status)}</span>
      </div>

      <form class="entry-form" data-edit-entry-form="${escapeHtml(siteName)}" data-entry-id="${entry.id}">
        <div class="entry-form-grid">
          <label class="field">
            <span>Frente</span>
            <select name="area">${AREAS.slice(1).map((area) => `<option value="${escapeHtml(area)}" ${entry.area === area ? "selected" : ""}>${escapeHtml(area)}</option>`).join("")}</select>
          </label>
          <label class="field">
            <span>Prioridad</span>
            <select name="priority">${PRIORITIES.slice(1).map((priority) => `<option value="${escapeHtml(priority)}" ${entry.priority === priority ? "selected" : ""}>${escapeHtml(priority)}</option>`).join("")}</select>
          </label>
          <label class="field">
            <span>Estado</span>
            <select name="status">${STATUSES.slice(1).map((status) => `<option value="${escapeHtml(status)}" ${entry.status === status ? "selected" : ""}>${escapeHtml(status)}</option>`).join("")}</select>
          </label>
          <label class="field">
            <span>Semaforo</span>
            <select name="traffic">${TRAFFIC.map((item) => `<option value="${escapeHtml(item)}" ${entry.traffic === item ? "selected" : ""}>${escapeHtml(item)}</option>`).join("")}</select>
          </label>
          <label class="field">
            <span>Impacto</span>
            <select name="impact">${IMPACTS.map((impact) => `<option value="${escapeHtml(impact)}" ${entry.impact === impact ? "selected" : ""}>${escapeHtml(impact)}</option>`).join("")}</select>
          </label>
          <label class="field">
            <span>Avance %</span>
            <input name="progress" type="number" min="0" max="100" value="${Number(entry.progress || 0)}">
          </label>
          <label class="field full">
            <span>Titulo</span>
            <input name="title" type="text" value="${escapeAttribute(entry.title)}" required>
          </label>
          <label class="field full">
            <span>Seguimiento o detalle</span>
            <textarea name="detail">${escapeHtml(entry.detail || "")}</textarea>
          </label>
          <label class="field">
            <span>Responsable</span>
            <input name="owner" type="text" value="${escapeAttribute(entry.owner || "")}">
          </label>
          <label class="field">
            <span>Proveedor</span>
            <input name="provider" type="text" value="${escapeAttribute(entry.provider || "")}">
          </label>
          <label class="field">
            <span>Fecha compromiso</span>
            <input name="dueDate" type="date" value="${entry.dueDate || ""}">
          </label>
          <label class="field">
            <span>Presupuesto</span>
            <input name="budget" type="text" value="${escapeAttribute(entry.budget || "")}">
          </label>
        </div>
        <div class="site-actions">
          <button class="action-button primary" type="submit">Guardar cambios</button>
          <button class="small-button" type="button" data-advance-entry="${entry.id}" data-site="${escapeHtml(siteName)}">Mover estado</button>
          <button class="small-button" type="button" data-delete-entry="${entry.id}" data-site="${escapeHtml(siteName)}">Eliminar</button>
        </div>
      </form>
    </section>
  `;
}

function renderTimelineEntry(siteName, entry) {
  return `
    <article class="timeline-item">
      <div class="entry-top">
        <strong>${escapeHtml(entry.title)}</strong>
        <div class="tag-row">
          <span class="tag type">${escapeHtml(entry.status)}</span>
          <span class="tag traffic-${entry.traffic.toLowerCase()}">${escapeHtml(entry.traffic)}</span>
        </div>
      </div>
      <p>${escapeHtml(entry.detail || "Sin detalle adicional.")}</p>
      <div class="entry-meta small muted">
        <span>${escapeHtml(entry.impact)}</span>
        <span>${entry.owner ? `Responsable: ${escapeHtml(entry.owner)}` : "Sin responsable"}</span>
        <span>${entry.provider ? `Proveedor: ${escapeHtml(entry.provider)}` : "Sin proveedor"}</span>
        <span>${entry.dueDate || "Sin fecha"}</span>
      </div>
      <div class="entry-meta small muted">
        <span>Presupuesto: ${entry.budget || "Sin valor"}</span>
        <span>Avance: ${Number(entry.progress || 0)}%</span>
        <span>${formatDateTime(entry.createdAt)}</span>
      </div>
      <div class="entry-actions">
        <button class="small-button" type="button" data-open-entry="${entry.id}">Ver y editar</button>
        <button class="small-button" type="button" data-advance-entry="${entry.id}" data-site="${escapeHtml(siteName)}">Mover estado</button>
        <button class="small-button" type="button" data-delete-entry="${entry.id}" data-site="${escapeHtml(siteName)}">Eliminar</button>
      </div>
    </article>
  `;
}

function handleEntrySubmit(event) {
  event.preventDefault();
  if (!event.currentTarget.reportValidity()) return;
  const siteName = event.currentTarget.dataset.entryForm;
  const site = state.sites.find((item) => item.name === siteName);
  if (!site) return;

  const formData = new FormData(event.currentTarget);
  site.entries.unshift(buildEntryFromForm(formData));
  event.currentTarget.reset();
  render();
}

function handleEntryEditSubmit(event) {
  event.preventDefault();
  if (!event.currentTarget.reportValidity()) return;
  const form = event.currentTarget;
  const siteName = form.dataset.editEntryForm;
  const entryId = form.dataset.entryId;
  const site = state.sites.find((item) => item.name === siteName);
  if (!site) return;

  const entry = site.entries.find((item) => item.id === entryId);
  if (!entry) return;

  const formData = new FormData(form);
  const updated = buildEntryFromForm(formData, entry);
  Object.assign(entry, updated, { id: entry.id, createdAt: entry.createdAt });
  render();
}

function handleSiteGridClick(event) {
  const openSiteButton = event.target.closest("[data-open-site-modal]");
  if (openSiteButton) {
    state.activeSiteModal = openSiteButton.dataset.openSiteModal;
    state.focusedEntry = null;
    render();
    return;
  }

  const openEntryButton = event.target.closest("[data-open-entry]");
  if (openEntryButton) {
    const siteName = openEntryButton.closest("[data-site-card]")?.dataset.siteCard;
    if (!siteName) return;
    state.activeSiteModal = siteName;
    state.focusedEntry = { siteName, entryId: openEntryButton.dataset.openEntry };
    render();
    return;
  }

  const exportButton = event.target.closest("[data-export-site]");
  if (exportButton) {
    exportData(exportButton.dataset.exportSite);
  }
}

function handleSiteModalClick(event) {
  const closeModalButton = event.target.closest("[data-close-site-modal]");
  if (closeModalButton) {
    state.activeSiteModal = null;
    state.focusedEntry = null;
    render();
    return;
  }

  const clearFocusedButton = event.target.closest("[data-clear-focused-entry]");
  if (clearFocusedButton) {
    state.focusedEntry = null;
    render();
    return;
  }

  const removeImageButton = event.target.closest("[data-remove-image]");
  if (removeImageButton) {
    removeSiteImage(removeImageButton.dataset.removeImage);
    return;
  }

  const triggerUploadButton = event.target.closest("[data-trigger-upload]");
  if (triggerUploadButton) {
    const input = els.siteModalRoot.querySelector(`[data-upload-image="${cssEscape(triggerUploadButton.dataset.triggerUpload)}"]`);
    input?.click();
    return;
  }

  const openEntryButton = event.target.closest("[data-open-entry]");
  if (openEntryButton) {
    const siteName = state.activeSiteModal;
    if (!siteName) return;
    state.focusedEntry = { siteName, entryId: openEntryButton.dataset.openEntry };
    render();
    return;
  }

  const advanceButton = event.target.closest("[data-advance-entry]");
  if (advanceButton) {
    advanceEntry(advanceButton.dataset.site, advanceButton.dataset.advanceEntry);
    return;
  }

  const deleteButton = event.target.closest("[data-delete-entry]");
  if (deleteButton) {
    deleteEntry(deleteButton.dataset.site, deleteButton.dataset.deleteEntry);
  }
}

function handleSiteModalChange(event) {
  const uploadInput = event.target.closest("[data-upload-image]");
  if (uploadInput) {
    handleImageUpload({ currentTarget: uploadInput });
  }
}

function handleSiteModalSubmit(event) {
  const form = event.target;
  if (!(form instanceof HTMLFormElement)) return;

  if (form.matches("[data-entry-form]")) {
    handleEntrySubmit(event);
    return;
  }

  if (form.matches("[data-edit-entry-form]")) {
    handleEntryEditSubmit(event);
  }
}

function buildEntryFromForm(formData, original = null) {
  return {
    id: original?.id || crypto.randomUUID(),
    area: String(formData.get("area") || original?.area || "Operacion diaria"),
    title: String(formData.get("title") || original?.title || "").trim(),
    detail: String(formData.get("detail") || "").trim(),
    priority: String(formData.get("priority") || original?.priority || "Media"),
    status: String(formData.get("status") || original?.status || "Reportado"),
    impact: String(formData.get("impact") || original?.impact || "Operativo"),
    traffic: String(formData.get("traffic") || original?.traffic || "Verde"),
    owner: String(formData.get("owner") || "").trim(),
    dueDate: String(formData.get("dueDate") || ""),
    provider: String(formData.get("provider") || "").trim(),
    budget: String(formData.get("budget") || "").trim(),
    progress: clampProgress(formData.get("progress")),
    createdAt: original?.createdAt || new Date().toISOString(),
  };
}

function handleImageUpload(event) {
  const input = event.currentTarget;
  const siteName = input.dataset.uploadImage;
  const file = input.files && input.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    const site = state.sites.find((item) => item.name === siteName);
    if (!site) return;
    site.image = String(reader.result);
    render();
  };
  reader.readAsDataURL(file);
}

function removeSiteImage(siteName) {
  const site = state.sites.find((item) => item.name === siteName);
  if (!site) return;
  site.image = "";
  render();
}

function advanceEntry(siteName, entryId) {
  const site = state.sites.find((item) => item.name === siteName);
  if (!site) return;
  const entry = site.entries.find((item) => item.id === entryId);
  if (!entry) return;

  const order = STATUSES.slice(1);
  const currentIndex = Math.max(0, order.indexOf(entry.status));
  entry.status = order[(currentIndex + 1) % order.length];
  entry.progress = inferProgress(entry.status, entry.progress);
  render();
}

function deleteEntry(siteName, entryId) {
  const site = state.sites.find((item) => item.name === siteName);
  if (!site) return;
  site.entries = site.entries.filter((entry) => entry.id !== entryId);
  if (state.focusedEntry?.siteName === siteName && state.focusedEntry?.entryId === entryId) {
    state.focusedEntry = null;
  }
  render();
}

function seedExamples() {
  SAMPLE_CASES.forEach((sample) => {
    const site = state.sites.find((item) => item.name === sample.site);
    if (!site) return;
    site.entries.unshift({ ...sample, id: crypto.randomUUID() });
  });
  render();
}

function exportData(singleSiteName) {
  const sites = singleSiteName
    ? state.sites.filter((site) => site.name === singleSiteName)
    : getVisibleSites();

  const rows = flattenEntries(sites).map((entry) => ({
    Sede: entry.siteName,
    Frente: entry.area,
    Titulo: entry.title,
    Detalle: entry.detail,
    Prioridad: entry.priority,
    Estado: entry.status,
    Semaforo: entry.traffic,
    Impacto: entry.impact,
    Responsable: entry.owner,
    Proveedor: entry.provider,
    Presupuesto: entry.budget,
    Avance: `${Number(entry.progress || 0)}%`,
    FechaCompromiso: entry.dueDate,
    Creado: formatDateTime(entry.createdAt),
  }));

  if (!rows.length) {
    alert("No hay informacion para exportar.");
    return;
  }

  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => csvEscape(row[header] ?? "")).join(",")),
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${singleSiteName ? slugify(singleSiteName) : "gestion-infra-opticas"}-${new Date().toISOString().slice(0, 10)}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

function getVisibleSites() {
  return state.sites
    .filter((site) => {
      const matchesSearch = !state.search || [site.name, ...site.entries.flatMap((entry) => [entry.title, entry.detail, entry.owner, entry.provider])]
        .join(" ")
        .toLowerCase()
        .includes(state.search);
      if (!matchesSearch) return false;
      if (isDefaultFilter()) return true;
      return getFilteredEntries(site.entries).length > 0 || site.name.toLowerCase().includes(state.search);
    });
}

function getFilteredEntries(entries) {
  return [...entries]
    .filter((entry) => state.area === "Todas" || entry.area === state.area)
    .filter((entry) => state.priority === "Todas" || entry.priority === state.priority)
    .filter((entry) => state.status === "Todos" || entry.status === state.status)
    .filter((entry) => {
      if (!state.search) return true;
      return [entry.title, entry.detail, entry.owner, entry.provider, entry.area].join(" ").toLowerCase().includes(state.search);
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function summarizeEntries(entries) {
  return {
    operacion: entries.filter((entry) => entry.area === "Operacion diaria").length,
    mantenimiento: entries.filter((entry) => entry.area === "Mantenimiento").length,
    obras: entries.filter((entry) => entry.area === "Obras y reformas").length,
    cotizaciones: entries.filter((entry) => entry.area === "Cotizaciones y proveedores").length,
    pending: entries.filter((entry) => entry.status !== "Cerrado").length,
    security: entries.filter((entry) => entry.impact === "Seguridad" && entry.status !== "Cerrado").length,
  };
}

function groupEntriesByArea(entries) {
  return entries.reduce((acc, entry) => {
    if (!acc[entry.area]) acc[entry.area] = [];
    acc[entry.area].push(entry);
    return acc;
  }, {});
}

function flattenEntries(sites) {
  return sites.flatMap((site) => site.entries.map((entry) => ({ ...entry, siteName: site.name })));
}

function getFocusedEntry(siteName) {
  if (!state.focusedEntry || state.focusedEntry.siteName !== siteName) return null;
  const site = state.sites.find((item) => item.name === siteName);
  if (!site) return null;
  return site.entries.find((entry) => entry.id === state.focusedEntry.entryId) || null;
}

function getSiteSeverity(entries) {
  const active = entries.filter((entry) => entry.status !== "Cerrado");
  if (active.some((entry) => entry.traffic === "Rojo")) return "Rojo";
  if (active.some((entry) => entry.traffic === "Amarillo")) return "Amarillo";
  return "Verde";
}

function isOverdue(entry) {
  return entry.dueDate && entry.status !== "Cerrado" && new Date(entry.dueDate) < startOfToday();
}

function isDefaultFilter() {
  return !state.search && state.area === "Todas" && state.priority === "Todas" && state.status === "Todos";
}

function loadSites() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return normalizeSites(JSON.parse(raw));
    }
  } catch (error) {
    console.warn("No fue posible cargar la informacion guardada.", error);
  }

  return SITES.map((name) => ({ name, image: "", entries: [] }));
}

function normalizeSites(sites) {
  const map = new Map((Array.isArray(sites) ? sites : []).map((site) => [site.name, site]));
  return SITES.map((name) => {
    const existing = map.get(name);
    return {
      name,
      image: existing?.image || "",
      entries: normalizeEntries(existing?.entries),
    };
  });
}

function normalizeEntries(entries) {
  return (Array.isArray(entries) ? entries : []).map((entry) => ({
    id: entry.id || crypto.randomUUID(),
    area: entry.area || guessArea(entry.type),
    title: entry.title || "Sin titulo",
    detail: entry.detail || entry.description || "",
    priority: entry.priority || "Media",
    status: normalizeStatus(entry.status),
    impact: entry.impact || "Operativo",
    traffic: entry.traffic || guessTraffic(entry.priority),
    owner: entry.owner || "",
    dueDate: entry.dueDate || "",
    provider: entry.provider || entry.vendor || "",
    budget: entry.budget || "",
    progress: clampProgress(entry.progress ?? inferProgress(normalizeStatus(entry.status), 0)),
    createdAt: entry.createdAt || new Date().toISOString(),
  }));
}

function guessArea(type) {
  if (type === "Cotizacion" || type === "Proveedor") return "Cotizaciones y proveedores";
  if (type === "Nota") return "Evidencias y notas";
  if (type === "Tarea prioritaria") return "Mantenimiento";
  if (type === "Informe") return "Operacion diaria";
  return "Operacion diaria";
}

function normalizeStatus(status) {
  const map = {
    Pendiente: "Reportado",
    "En seguimiento": "Revisado",
    Completada: "Cerrado",
    Bloqueada: "Cotizando",
  };
  return map[status] || status || "Reportado";
}

function guessTraffic(priority) {
  if (priority === "Alta") return "Rojo";
  if (priority === "Media") return "Amarillo";
  return "Verde";
}

function persistSites() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.sites));
}

function fillSelect(select, options) {
  select.innerHTML = options.map((option) => `<option value="${escapeHtml(option)}">${escapeHtml(option)}</option>`).join("");
}

function clampProgress(value) {
  const number = Number(value);
  if (Number.isNaN(number)) return 0;
  return Math.max(0, Math.min(100, Math.round(number)));
}

function inferProgress(status, current) {
  const fallback = clampProgress(current);
  const map = {
    Reportado: 5,
    Revisado: 20,
    Cotizando: 35,
    Aprobado: 55,
    "En ejecucion": 75,
    "Pendiente cierre": 90,
    Cerrado: 100,
  };
  return map[status] ?? fallback;
}

function getInitials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatDateTime(value) {
  if (!value) return "Sin fecha";
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function csvEscape(value) {
  return `"${String(value).replace(/"/g, '""')}"`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll("'", "&#39;");
}

function cssEscape(value) {
  if (window.CSS && typeof window.CSS.escape === "function") {
    return window.CSS.escape(value);
  }
  return String(value).replace(/["\\]/g, "\\$&");
}

function todayPlusDays(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}
