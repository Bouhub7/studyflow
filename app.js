const $ = (selector) => document.querySelector(selector);
const today = new Date();
$('#today').textContent = today.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

let tasks = JSON.parse(localStorage.getItem('studyflow-tasks') || '[]');
let sessions = JSON.parse(localStorage.getItem('studyflow-sessions') || '[]');
let filter = 'all';

function save() {
  localStorage.setItem('studyflow-tasks', JSON.stringify(tasks));
  localStorage.setItem('studyflow-sessions', JSON.stringify(sessions));
}
function renderTasks() {
  const visible = tasks.filter(t => filter === 'all' || (filter === 'open' ? !t.done : t.done));
  $('#taskList').innerHTML = visible.map(t => `
    <li class="task-item ${t.done ? 'completed' : ''}">
      <input type="checkbox" data-toggle="${t.id}" ${t.done ? 'checked' : ''} aria-label="Mark ${escapeHtml(t.title)} as completed">
      <div class="task-main"><div class="task-title">${escapeHtml(t.title)}</div><div class="task-meta">${escapeHtml(t.subject)}</div></div>
      <span class="priority ${t.priority === 'High' ? 'high' : ''}">${t.priority === 'High' ? 'High priority' : 'Normal'}</span>
      <button class="delete" data-delete="${t.id}" aria-label="Delete task">Delete</button>
    </li>`).join('');
  $('#emptyState').hidden = visible.length > 0;
  const done = tasks.filter(t => t.done).length;
  const remaining = tasks.length - done;
  const percent = tasks.length ? Math.round(done / tasks.length * 100) : 0;
  $('#remainingCount').textContent = remaining;
  $('#doneCount').textContent = done;
  $('#progressLabel').textContent = `${percent}% complete`;
  $('#progressBar').style.width = `${percent}%`;
  $('#sessionCount').textContent = `${(sessions.reduce((sum, s) => sum + s.minutes, 0) / 60).toFixed(1).replace('.0','')}h`;
}
function renderSessions() {
  $('#sessionList').innerHTML = sessions.map(s => `
    <li class="session-item"><strong>${escapeHtml(s.name)}</strong><span>${s.minutes} min</span><button class="delete" data-session-delete="${s.id}">Remove</button></li>`).join('');
}
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
}
$('#taskForm').addEventListener('submit', event => {
  event.preventDefault();
  tasks.unshift({ id: crypto.randomUUID(), title: $('#taskInput').value.trim(), subject: $('#subjectInput').value, priority: $('#priorityInput').value, done: false });
  $('#taskInput').value = '';
  save(); renderTasks();
});
$('#sessionForm').addEventListener('submit', event => {
  event.preventDefault();
  sessions.push({ id: crypto.randomUUID(), name: $('#sessionName').value.trim(), minutes: Number($('#duration').value) });
  $('#sessionName').value = '';
  save(); renderSessions(); renderTasks();
});
$('#taskList').addEventListener('change', event => {
  const id = event.target.dataset.toggle;
  if (!id) return;
  tasks = tasks.map(t => t.id === id ? {...t, done: event.target.checked} : t);
  save(); renderTasks();
});
$('#taskList').addEventListener('click', event => {
  const id = event.target.dataset.delete;
  if (!id) return;
  tasks = tasks.filter(t => t.id !== id);
  save(); renderTasks();
});
$('#sessionList').addEventListener('click', event => {
  const id = event.target.dataset.sessionDelete;
  if (!id) return;
  sessions = sessions.filter(s => s.id !== id);
  save(); renderSessions(); renderTasks();
});
document.querySelectorAll('.filter').forEach(button => button.addEventListener('click', () => {
  filter = button.dataset.filter;
  document.querySelectorAll('.filter').forEach(b => b.classList.toggle('active', b === button));
  renderTasks();
}));
renderTasks(); renderSessions();
