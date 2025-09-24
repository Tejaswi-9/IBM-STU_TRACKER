const SELECTORS = {
  tasks: document.getElementById('tasks'),
  input: document.getElementById('taskInput'),
  addBtn: document.getElementById('addBtn'),
  counts: document.getElementById('counts'),
  progressBar: document.getElementById('progressBar'),
  clearCompleted: document.getElementById('clearCompleted'),
  clearAll: document.getElementById('clearAll')
};

const STORAGE_KEY = 'tm_tasks_v1';
let tasks = loadTasks();
function saveTasks(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); }
function loadTasks(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return [];
    return JSON.parse(raw);
  }catch(e){ console.error('Failed to load tasks', e); return []; }
}

function render(){
  SELECTORS.tasks.innerHTML = '';
  if(tasks.length === 0){ SELECTORS.tasks.innerHTML = '<div class="small">No tasks yet — add something!</div>'; }
  tasks.forEach(t=>{
    const el = document.createElement('div');
    el.className = 'task' + (t.completed ? ' completed' : '');
    el.dataset.id = t.id;
    el.innerHTML = `
      <input type="checkbox" class="task-check" ${t.completed ? 'checked' : ''} aria-label="Mark task complete" />
      <div class="title">
        <p class="${t.completed ? 'done' : ''}">${escapeHtml(t.text)}</p>
        <div class="small">${t.createdAt ? new Date(t.createdAt).toLocaleString() : ''}</div>
      </div>
      <div class="controls">
        <button class="icon-btn editBtn" title="Edit">✏️</button>
        <button class="icon-btn deleteBtn" title="Delete">🗑️</button>
      </div>
    `;
    SELECTORS.tasks.appendChild(el);
  });
  updateProgress();
}
function addTask(text){
  if(!text || !text.trim()) return;
  const task = { id: Date.now().toString(36)+Math.random().toString(36).slice(2,7), text: text.trim(), completed:false, createdAt: Date.now() };
  tasks.unshift(task);
  saveTasks();
  render();
  SELECTORS.input.value = '';
  SELECTORS.input.focus();
}
function toggleComplete(id){ const t=tasks.find(x=>x.id===id); if(!t) return; t.completed=!t.completed; saveTasks(); render(); }
function deleteTask(id){ tasks=tasks.filter(x=>x.id!==id); saveTasks(); render(); }
function editTask(id){
  const t=tasks.find(x=>x.id===id); if(!t) return;
  const newText=prompt('Edit task',t.text); if(newText===null) return; t.text=newText.trim()||t.text; saveTasks(); render();
}
function clearCompleted(){ tasks=tasks.filter(x=>!x.completed); saveTasks(); render(); }
function clearAll(){ if(!confirm('Clear ALL tasks? This cannot be undone.')) return; tasks=[]; saveTasks(); render(); }
function updateProgress(){
  const total=tasks.length;
  const done=tasks.filter(x=>x.completed).length;
  SELECTORS.counts.textContent=`${done} / ${total} completed`;
  SELECTORS.progressBar.style.width=(total===0?0:Math.round((done/total)*100))+'%';
}
SELECTORS.addBtn.addEventListener('click',()=>addTask(SELECTORS.input.value));
SELECTORS.input.addEventListener('keydown',e=>{if(e.key==='Enter') addTask(SELECTORS.input.value);});
SELECTORS.tasks.addEventListener('click',e=>{
  const item=e.target.closest('.task'); if(!item) return;
  const id=item.dataset.id;
  if(e.target.classList.contains('task-check')){ toggleComplete(id); return; }
  if(e.target.classList.contains('deleteBtn')){ deleteTask(id); return; }
  if(e.target.classList.contains('editBtn')){ editTask(id); return; }
  if(e.target.closest('.task')){ if(e.target.closest('.controls')) return; toggleComplete(id); }
});
SELECTORS.clearCompleted.addEventListener('click',clearCompleted);
SELECTORS.clearAll.addEventListener('click',clearAll);

function escapeHtml(str){ return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;'); }

render();