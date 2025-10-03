// user-profile.js
import { auth, db } from './firebase-init.js';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { doc, getDoc, updateDoc, arrayUnion, setDoc } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

// Site color
const BRAND = '#E63946';

function showSection(id) {
  ['userinfo','calendar','myuniversities','wizard'].forEach(s => {
    const el = document.getElementById(s);
    if (el) el.style.display = (s === id) ? 'block' : 'none';
  });
}

// expose for inline menu links
window.showSection = showSection;

// small stylesheet for the calendar & profile area
const css = `
  .ua-profile { max-width:720px;margin:18px auto;padding:18px;border-radius:10px;background:#fff;box-shadow:0 6px 18px rgba(0,0,0,0.04);} 
  .ua-profile h3{color:#222;margin-bottom:6px}
  .ua-profile .meta{color:#666;margin-bottom:12px}
  .ua-btn{background:${BRAND};color:#fff;border:none;padding:8px 12px;border-radius:8px;cursor:pointer}
  .ua-calendar { max-width:720px;margin:18px auto;background:#fff;padding:12px;border-radius:10px;box-shadow:0 6px 18px rgba(0,0,0,0.04);} 
  .ua-cal-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}
  .ua-cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:6px}
  .ua-day{min-height:72px;padding:6px;border-radius:8px;border:1px solid #f0f0f0;background:#fafafa}
  .ua-day .date{font-weight:600;color:#222;margin-bottom:6px}
  .ua-event{display:block;background:${BRAND};color:#fff;padding:4px 6px;border-radius:6px;font-size:13px;margin-top:4px}
  .ua-controls button{margin-left:6px}
  @media(max-width:420px){ .ua-day{min-height:64px} }
`;
const styleEl = document.createElement('style'); styleEl.textContent = css; document.head.appendChild(styleEl);

async function fetchUserDoc(uid) {
  try {
    const ref = doc(db, 'user info', uid);
    const snap = await getDoc(ref);
    if (snap.exists()) return snap.data();
    // if no doc, create a minimal one from auth
    return null;
  } catch (e) {
    console.error('fetchUserDoc', e);
    return null;
  }
}

async function saveUserDoc(uid, data) {
  try {
    const ref = doc(db, 'user info', uid);
    await setDoc(ref, data, { merge: true });
    return true;
  } catch (e) { console.error('saveUserDoc', e); return false; }
}

function formatDateISO(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth()+1).padStart(2,'0');
  const dd = String(d.getDate()).padStart(2,'0');
  return `${yyyy}-${mm}-${dd}`;
}

function renderProfilePane(uid, authUser, userDoc) {
  const el = document.getElementById('user-info');
  if (!el) return;
  const data = userDoc || {};
  const name = data.name || authUser.displayName || (authUser.email||'').split('@')[0] || 'Kullanıcı';
  const email = authUser.email || data.email || '';
  const phone = data.phone || '';
  const uni = data.university || '';

  el.innerHTML = `
    <div class="ua-profile">
      <h3>${name}</h3>
      <div class="meta">${email}${phone ? ' • ' + phone : ''}</div>
      <div style="margin-bottom:8px">Üniversite: <strong>${uni || 'Belirtilmemiş'}</strong></div>
      <div style="display:flex;gap:8px;justify-content:center">
        <button id="edit-profile-btn" class="ua-btn">Profili Düzenle</button>
        <button id="refresh-profile-btn" class="ua-btn" style="background:#2a2a2a">Yenile</button>
      </div>
      <div id="profile-editor" style="display:none;margin-top:12px"></div>
    </div>
  `;

  document.getElementById('edit-profile-btn').addEventListener('click', () => {
    showProfileEditor(uid, data);
  });
  document.getElementById('refresh-profile-btn').addEventListener('click', async () => {
    const fresh = await fetchUserDoc(uid);
    renderProfilePane(uid, authUser, fresh || {});
  });
}

function showProfileEditor(uid, data) {
  const editor = document.getElementById('profile-editor');
  editor.style.display = 'block';
  editor.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:8px">
      <input id="pf-name" placeholder="İsim" value="${data.name || ''}" style="padding:8px;border:1px solid #ddd;border-radius:8px;" />
      <input id="pf-phone" placeholder="Telefon" value="${data.phone || ''}" style="padding:8px;border:1px solid #ddd;border-radius:8px;" />
      <input id="pf-university" placeholder="Üniversite" value="${data.university || ''}" style="padding:8px;border:1px solid #ddd;border-radius:8px;" />
      <div style="display:flex;gap:8px;justify-content:center;margin-top:6px">
        <button id="pf-save" class="ua-btn">Kaydet</button>
        <button id="pf-cancel" style="background:#ddd;border:none;padding:8px;border-radius:8px;">İptal</button>
      </div>
    </div>
  `;
  document.getElementById('pf-cancel').addEventListener('click', () => { editor.style.display='none'; });
  document.getElementById('pf-save').addEventListener('click', async () => {
    const updated = {
      name: document.getElementById('pf-name').value.trim(),
      phone: document.getElementById('pf-phone').value.trim(),
      university: document.getElementById('pf-university').value.trim()
    };
    await saveUserDoc(uid, updated);
    const fresh = await fetchUserDoc(uid);
    renderProfilePane(uid, auth.currentUser, fresh || {});
    editor.style.display='none';
  });
}

// Calendar implementation
function buildCalendar(month, year, events) {
  // events: array of {date: 'YYYY-MM-DD', title}
  const monthNames = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
  const first = new Date(year, month, 1);
  const startDay = first.getDay(); // 0-6 Sun-Sat
  const daysInMonth = new Date(year, month+1, 0).getDate();

  const container = document.createElement('div');
  container.className = 'ua-calendar';

  const head = document.createElement('div'); head.className = 'ua-cal-head';
  head.innerHTML = `<div style="font-weight:700">${monthNames[month]} ${year}</div>`;
  const controls = document.createElement('div'); controls.className = 'ua-controls';
  const prev = document.createElement('button'); prev.className='ua-btn'; prev.textContent='‹';
  const next = document.createElement('button'); next.className='ua-btn'; next.textContent='›';
  const today = document.createElement('button'); today.className='ua-btn'; today.style.background='#2a2a2a'; today.textContent='Bugün';
  const addBtn = document.createElement('button'); addBtn.className='ua-btn'; addBtn.textContent='Etkinlik Ekle';
  controls.append(prev,next,today,addBtn);
  head.appendChild(controls);
  container.appendChild(head);

  const grid = document.createElement('div'); grid.className='ua-cal-grid';
  // weekday headers
  ['Paz','Pzt','Sal','Çar','Per','Cum','Cmt'].forEach(d => {
    const el = document.createElement('div'); el.style.fontWeight='700'; el.style.textAlign='center'; el.textContent = d; grid.appendChild(el);
  });
  // empty cells for startDay (assuming first day Sun=0 -> we want week starting Sun as Paz)
  for (let i=0;i<startDay;i++) grid.appendChild(document.createElement('div'));
  for (let d=1; d<=daysInMonth; d++){
    const cell = document.createElement('div'); cell.className='ua-day';
    const dateSpan = document.createElement('div'); dateSpan.className='date'; dateSpan.textContent = d;
    cell.appendChild(dateSpan);
    const iso = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const dayEvents = (events||[]).filter(ev => ev.date === iso);
    dayEvents.slice(0,3).forEach(ev => {
      const evEl = document.createElement('span'); evEl.className='ua-event'; evEl.textContent = ev.title; cell.appendChild(evEl);
    });
    grid.appendChild(cell);
  }
  container.appendChild(grid);

  return { container, prev, next, today, addBtn };
}

async function renderCalendarSection(uid, userDoc) {
  const calEl = document.getElementById('calendar');
  if (!calEl) return;
  // use events from userDoc.events array if present
  const events = (userDoc && Array.isArray(userDoc.events)) ? userDoc.events : [];
  let now = new Date();
  let month = now.getMonth(); let year = now.getFullYear();

  function draw() {
    calEl.innerHTML = '';
    const { container, prev, next, today, addBtn } = buildCalendar(month, year, events);
    calEl.appendChild(container);
    prev.addEventListener('click', () => { month--; if (month<0){month=11;year--;} draw(); });
    next.addEventListener('click', () => { month++; if (month>11){month=0;year++;} draw(); });
    today.addEventListener('click', () => { const t=new Date(); month=t.getMonth(); year=t.getFullYear(); draw(); });
    addBtn.addEventListener('click', () => openAddEvent(uid, events, draw));
  }
  draw();
}

function openAddEvent(uid, events, onDone) {
  const modal = document.createElement('div');
  modal.style.position='fixed'; modal.style.left='12px'; modal.style.right='12px'; modal.style.top='20%'; modal.style.zIndex=3000;
  modal.style.background='#fff'; modal.style.padding='12px'; modal.style.borderRadius='10px'; modal.style.boxShadow='0 10px 40px rgba(0,0,0,0.12)';
  modal.innerHTML = `
    <div style="font-weight:700;margin-bottom:8px">Yeni Etkinlik Ekle</div>
    <input id="ev-date" type="date" style="padding:8px;border:1px solid #ddd;border-radius:8px;width:100%;margin-bottom:8px" />
    <input id="ev-title" placeholder="Etkinlik başlığı" style="padding:8px;border:1px solid #ddd;border-radius:8px;width:100%;margin-bottom:8px" />
    <div style="display:flex;gap:8px;justify-content:flex-end">
      <button id="ev-cancel" style="padding:8px;border-radius:8px;background:#ddd;border:none">İptal</button>
      <button id="ev-save" class="ua-btn">Kaydet</button>
    </div>
  `;
  document.body.appendChild(modal);
  document.getElementById('ev-cancel').addEventListener('click', () => modal.remove());
  document.getElementById('ev-save').addEventListener('click', async () => {
    const date = document.getElementById('ev-date').value;
    const title = document.getElementById('ev-title').value.trim();
    if (!date || !title) return alert('Lütfen tarih ve başlık girin');
    // persist into user doc as events array
    try {
      const ref = doc(db, 'user info', uid);
      // Use setDoc with merge to be safe if doc doesn't exist yet
      await setDoc(ref, { events: arrayUnion({ date, title }) }, { merge: true });
      // update local events array by pushing
      events.push({ date, title });
      modal.remove();
      onDone();
    } catch (e) { console.error('save event', e); alert('Etkinlik kaydedilemedi'); }
  });
}

// wire up auth state and render
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    document.getElementById('user-info').innerHTML = '<p>Lütfen giriş yapın.</p><p><a href="login.html" class="login-btn">Giriş Yap</a></p>';
    return;
  }
  const uid = user.uid;
  const userDoc = await fetchUserDoc(uid);
  renderProfilePane(uid, user, userDoc || {});
  renderCalendarSection(uid, userDoc || {});
});

// sign out handler (in case button exists)
document.addEventListener('click', (ev) => {
  if (ev.target && ev.target.id === 'sign-out-btn') {
    ev.preventDefault();
    firebaseSignOut(auth).then(() => {
      try { localStorage.setItem('allabroad_signed_in','0'); } catch(e){}
      window.location.href = 'index.html';
    }).catch(e => console.error(e));
  }
});
