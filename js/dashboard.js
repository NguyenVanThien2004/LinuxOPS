// js/dashboard.js
import { auth, db } from "./firebase.js";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
  where
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

/* ========== DOM ======== */
const userEmailEl = document.getElementById('user-email');
const openCreate = document.getElementById('open-create');
const modal = document.getElementById('modal');
const modalCancel = document.getElementById('modal-cancel');
const modalSave = document.getElementById('modal-save');
const titleEl = document.getElementById('task-title');
const descEl = document.getElementById('task-desc');
const priorityEl = document.getElementById('task-priority');
const statusEl = document.getElementById('task-status');

const colTodo = document.getElementById('col-todo');
const colIn = document.getElementById('col-inprogress');
const colDone = document.getElementById('col-done');
const countTodo = document.getElementById('count-todo');
const countIn = document.getElementById('count-in');
const countDone = document.getElementById('count-done');
const searchInput = document.getElementById('search');
const logoutBtn = document.getElementById('logoutBtn');

let cachedTasks = [];
let unsubscribe = null;

/* ========== Auth guard & start realtime ========= */
onAuthStateChanged(auth, (user) => {
  if (!user) {
    // not logged in -> redirect to login page
    location.replace('./index.html');
    return;
  }
  // show user
  userEmailEl.textContent = user.email || '—';
  // start listening tasks for this user (you can remove where(...) if you want all tasks)
  startListeningTasks(user.uid);
});

/* ========== UI events ========== */
openCreate && openCreate.addEventListener('click', ()=> modal.classList.add('show'));
modalCancel && modalCancel.addEventListener('click', ()=> modal.classList.remove('show'));
logoutBtn && logoutBtn.addEventListener('click', async ()=> {
  await signOut(auth);
  location.replace('./index.html');
});

modalSave && modalSave.addEventListener('click', async ()=>{
  const user = auth.currentUser;
  if(!user) { alert('Bạn chưa đăng nhập'); return; }
  const title = (titleEl.value || '').trim();
  if(!title) { alert('Nhập tiêu đề'); return; }
  try {
    await addDoc(collection(db,'tasks'), {
      title,
      description: descEl.value || '',
      priority: priorityEl.value || 'normal',
      status: statusEl.value || 'todo',
      ownerUid: user.uid,
      ownerEmail: user.email || null,
      createdAt: serverTimestamp()
    });
    // reset
    titleEl.value=''; descEl.value=''; priorityEl.value='normal'; statusEl.value='todo';
    modal.classList.remove('show');
  } catch(e){
    alert('Lỗi tạo task: ' + e.message);
  }
});

/* ========== Realtime listener ========== */
function startListeningTasks(uid){
  // detach old listener
  if(typeof unsubscribe === 'function') unsubscribe();

  const q = query(
    collection(db,'tasks'),
    where('ownerUid','==', uid),
    orderBy('createdAt','desc')
  );

  unsubscribe = onSnapshot(q, (snap) => {
    const arr = [];
    snap.forEach(d => arr.push({ id: d.id, ...d.data() }));
    cachedTasks = arr;
    renderTasks();
  }, err => {
    console.error('onSnapshot error', err);
    // console message for debugging permission/other issues
  });
}

/* ========== Render ========= */
function renderTasks(){
  const q = (searchInput && searchInput.value || '').trim().toLowerCase();
  colTodo.innerHTML=''; colIn.innerHTML=''; colDone.innerHTML='';
  let t=0,i=0,d=0;
  cachedTasks.forEach(tk=>{
    if(q){
      const match = (tk.title||'').toLowerCase().includes(q) || (tk.description||'').toLowerCase().includes(q);
      if(!match) return;
    }
    const el = document.createElement('div');
    el.className = 'task';
    el.innerHTML = `
      <div style="flex:1">
        <div class="title"><strong>${escapeHtml(tk.title)}</strong></div>
        <div class="meta">${escapeHtml(tk.description||'')}</div>
        <div class="meta small">Priority: ${escapeHtml(tk.priority||'normal')}</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:6px">
        <button class="btn-ghost" data-act="toggle">${tk.status === 'done' ? 'Undo' : 'Hoàn thành'}</button>
        <button class="btn-ghost" data-act="delete" style="border-color:#fecaca;color:#b91c1c">Xóa</button>
      </div>
    `;
    el.querySelector('[data-act="toggle"]').addEventListener('click', ()=> toggleStatus(tk));
    el.querySelector('[data-act="delete"]').addEventListener('click', ()=> deleteTask(tk));
    if(tk.status === 'todo'){ colTodo.appendChild(el); t++; }
    else if(tk.status === 'inprogress'){ colIn.appendChild(el); i++; }
    else { colDone.appendChild(el); d++; }
  });
  countTodo.textContent = t;
  countIn.textContent = i;
  countDone.textContent = d;
}

searchInput && searchInput.addEventListener('input', ()=> renderTasks());

/* ========== Actions ========= */
async function deleteTask(task){
  if(!confirm('Xoá task này?')) return;
  try {
    await deleteDoc(doc(db,'tasks',task.id));
  } catch(e){
    alert('Lỗi xóa: '+ e.message);
  }
}
async function toggleStatus(task){
  const newStatus = task.status === 'done' ? 'todo' : 'done';
  try {
    await updateDoc(doc(db,'tasks',task.id), { status: newStatus });
  } catch(e){
    alert('Lỗi cập nhật: ' + e.message);
  }
}

/* ========== Helpers ========= */
function escapeHtml(s){ if(!s) return ''; return s.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
