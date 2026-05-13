import { buildNotes, toolCatalog } from "./toolCatalog.js";

const app = document.querySelector("#app");
const preferredTool = window.location.hash.replace("#", "");
const firstToolId = toolCatalog.some((tool) => tool.id === preferredTool)
  ? preferredTool
  : toolCatalog[0].id;

const state = {
  activeToolId: firstToolId,
  query: "",
};

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getFilteredTools() {
  const query = state.query.trim().toLowerCase();

  if (!query) {
    return toolCatalog;
  }

  return toolCatalog.filter((tool) => {
    const haystack = [
      tool.name,
      tool.group,
      tool.summary,
      ...tool.futureSurfaces,
    ].join(" ");

    return haystack.toLowerCase().includes(query);
  });
}

function getActiveTool() {
  return (
    toolCatalog.find((tool) => tool.id === state.activeToolId) ||
    toolCatalog[0]
  );
}

function renderToolButton(tool) {
  const isActive = tool.id === state.activeToolId;

  return `
    <button
      class="tool-button ${isActive ? "is-active" : ""}"
      type="button"
      data-tool-id="${escapeHtml(tool.id)}"
      aria-pressed="${isActive ? "true" : "false"}"
    >
      <span class="tool-button__mark color-${escapeHtml(tool.accent)}"></span>
      <span>
        <span class="tool-button__name">${escapeHtml(tool.name)}</span>
        <span class="tool-button__group">${escapeHtml(tool.group)}</span>
      </span>
      <span class="tool-button__stage">${escapeHtml(tool.stage)}</span>
    </button>
  `;
}

function renderToolCard(tool) {
  return `
    <article class="tool-card color-border-${escapeHtml(tool.accent)}">
      <div class="tool-card__topline">
        <span class="tool-card__group">${escapeHtml(tool.group)}</span>
        <span class="status-pill">${escapeHtml(tool.stage)}</span>
      </div>
      <h3>${escapeHtml(tool.name)}</h3>
      <p>${escapeHtml(tool.summary)}</p>
      <div class="surface-list" aria-label="Future module surfaces">
        ${tool.futureSurfaces
          .map((surface) => `<span>${escapeHtml(surface)}</span>`)
          .join("")}
      </div>
    </article>
  `;
}

function renderWorkspace() {
  const activeTool = getActiveTool();
  const filteredTools = getFilteredTools();

  app.innerHTML = `
    <aside class="sidebar" aria-label="Mechanism sections">
      <a class="brand" href="./" aria-label="Mechanisim Calculator home">
        <img src="./assets/mechanism-mark.svg" alt="" width="40" height="40">
        <span>
          <strong>Mechanisim</strong>
          <span>Calculator</span>
        </span>
      </a>

      <nav class="tool-nav" aria-label="Planned mechanism tools">
        ${toolCatalog.map(renderToolButton).join("")}
      </nav>
    </aside>

    <main class="workspace">
      <header class="workspace-header">
        <div>
          <p class="eyebrow">Static robotics calculator shell</p>
          <h1>Mechanisim Calculator</h1>
        </div>
        <label class="search-field">
          <span class="visually-hidden">Filter planned areas</span>
          <input
            type="search"
            name="tool-search"
            placeholder="Filter areas"
            value="${escapeHtml(state.query)}"
            autocomplete="off"
          >
        </label>
      </header>

      <section class="status-strip" aria-label="Project constraints">
        ${buildNotes.map((note) => `<span>${escapeHtml(note)}</span>`).join("")}
      </section>

      <section class="focus-layout" aria-label="Selected mechanism area">
        <article class="focus-panel color-border-${escapeHtml(activeTool.accent)}">
          <div>
            <span class="focus-panel__label">${escapeHtml(activeTool.group)}</span>
            <h2>${escapeHtml(activeTool.name)}</h2>
            <p>${escapeHtml(activeTool.summary)}</p>
          </div>

          <div class="blueprint-shell" aria-label="Future calculator slots">
            <div>
              <span>Inputs</span>
              <strong>Reserved</strong>
            </div>
            <div>
              <span>Logic</span>
              <strong>Reserved</strong>
            </div>
            <div>
              <span>Output</span>
              <strong>Reserved</strong>
            </div>
          </div>
        </article>

        <figure class="diagram-panel">
          <img src="./assets/mechanism-board.svg" alt="Abstract mechanism layout diagram">
        </figure>
      </section>

      <section class="tool-grid" aria-label="Planned tool varieties">
        ${
          filteredTools.length
            ? filteredTools.map(renderToolCard).join("")
            : `<p class="empty-state">No planned area matches that filter.</p>`
        }
      </section>
    </main>
  `;

  bindEvents();
}

function renderFilteredTools() {
  const toolGrid = app.querySelector(".tool-grid");
  const filteredTools = getFilteredTools();

  toolGrid.innerHTML = filteredTools.length
    ? filteredTools.map(renderToolCard).join("")
    : `<p class="empty-state">No planned area matches that filter.</p>`;
}

function bindEvents() {
  app.querySelectorAll("[data-tool-id]").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeToolId = button.dataset.toolId;
      window.history.replaceState(null, "", `#${state.activeToolId}`);
      renderWorkspace();
    });
  });

  const searchInput = app.querySelector('input[name="tool-search"]');
  searchInput.addEventListener("input", (event) => {
    state.query = event.target.value;
    renderFilteredTools();
  });
}

renderWorkspace();
