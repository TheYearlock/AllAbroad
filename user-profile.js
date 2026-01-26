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
  .ua-profile h3{color:#222;margin-bottom:6px;font-size:24px}
  .ua-profile .meta{color:#666;margin-bottom:12px;font-size:14px}
  .ua-btn{background:${BRAND};color:#fff;border:none;padding:10px 16px;border-radius:8px;cursor:pointer;font-weight:500;transition:all 0.2s}
  .ua-btn:hover{background:#c91c2e;transform:translateY(-2px)}
  .ua-calendar { max-width:720px;margin:18px auto;background:#fff;padding:12px;border-radius:10px;box-shadow:0 6px 18px rgba(0,0,0,0.04);} 
  .ua-cal-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;flex-wrap:wrap;gap:8px}
  .ua-cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:6px}
  .ua-day{min-height:72px;padding:6px;border-radius:8px;border:1px solid #f0f0f0;background:#fafafa;font-size:12px}
  .ua-day .date{font-weight:600;color:#222;margin-bottom:6px;font-size:13px}
  .ua-event{display:block;background:${BRAND};color:#fff;padding:4px 6px;border-radius:6px;font-size:11px;margin-top:4px;cursor:pointer}
  .ua-controls{display:flex;gap:6px;flex-wrap:wrap}
  .ua-controls button{margin-left:0;margin-right:6px;font-size:13px;padding:6px 10px}
  @media(max-width:768px){ 
    .ua-profile { padding:12px;margin:12px;} 
    .ua-calendar { padding:8px;margin:12px;}
    .ua-day{min-height:60px;padding:4px;font-size:11px}
    .ua-day .date{font-size:11px}
    .ua-event{font-size:10px;padding:2px 4px}
    .ua-controls{gap:4px}
    .ua-controls button{margin-right:4px;padding:5px 8px;font-size:12px}
  }
  @media(max-width:420px){ 
    .ua-day{min-height:50px;padding:3px}
    .ua-day .date{font-size:10px;margin-bottom:3px}
    .ua-event{font-size:9px;padding:1px 3px;margin-top:2px}
    .ua-cal-head{gap:4px}
    .ua-controls{gap:2px;flex-wrap:wrap}
    .ua-controls button{margin:0;padding:4px 6px;font-size:11px}
  }
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
  const bio = data.bio || '';
  const location = data.location || '';
  const profilePic = authUser.photoURL || '';

  el.innerHTML = `
    <div class="ua-profile">
      ${profilePic ? `<div style="margin-bottom:12px"><img src="${profilePic}" alt="Profil Fotoğrafı" style="width:80px;height:80px;border-radius:50%;object-fit:cover;border:3px solid #E63946"></div>` : ''}
      <h3>${name}</h3>
      <div class="meta">${email}${phone ? ' • ' + phone : ''}</div>
      ${bio ? `<div style="color:#555;margin:8px 0;font-size:14px">${bio}</div>` : ''}
      ${location ? `<div style="color:#666;margin:8px 0;font-size:13px">📍 ${location}</div>` : ''}
      <div style="display:flex;gap:8px;justify-content:center;margin-top:12px">
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
    <div style="display:flex;flex-direction:column;gap:10px">
      <input id="pf-name" placeholder="İsim" value="${data.name || ''}" style="padding:10px;border:1px solid #ddd;border-radius:8px;font-size:14px;" />
      <input id="pf-phone" placeholder="Telefon" value="${data.phone || ''}" style="padding:10px;border:1px solid #ddd;border-radius:8px;font-size:14px;" />
      <textarea id="pf-bio" placeholder="Biyografi (isteğe bağlı)" style="padding:10px;border:1px solid #ddd;border-radius:8px;resize:vertical;min-height:80px;font-size:14px">${data.bio || ''}</textarea>
      <input id="pf-location" placeholder="Konum (şehir, ülke)" value="${data.location || ''}" style="padding:10px;border:1px solid #ddd;border-radius:8px;font-size:14px;" />
      <div style="display:flex;gap:10px;justify-content:center;margin-top:8px;flex-wrap:wrap">
        <button id="pf-save" class="ua-btn">Kaydet</button>
        <button id="pf-cancel" style="background:#999;color:#fff;border:none;padding:10px 16px;border-radius:8px;cursor:pointer;font-weight:500;">İptal</button>
      </div>
    </div>
  `;
  document.getElementById('pf-cancel').addEventListener('click', () => { editor.style.display='none'; });
  document.getElementById('pf-save').addEventListener('click', async () => {
    const updated = {
      name: document.getElementById('pf-name').value.trim(),
      phone: document.getElementById('pf-phone').value.trim(),
      bio: document.getElementById('pf-bio').value.trim(),
      location: document.getElementById('pf-location').value.trim()
    };
    await saveUserDoc(uid, updated);
    const fresh = await fetchUserDoc(uid);
    renderProfilePane(uid, auth.currentUser, fresh || {});
    editor.style.display='none';
  });
}

// Calendar implementation
function buildCalendar(month, year, events, onDeleteEvent) {
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
    dayEvents.slice(0,3).forEach((ev, evIdx) => {
      const evEl = document.createElement('span'); evEl.className='ua-event'; 
      evEl.style.cursor='pointer';
      evEl.title='Silmek için tıkla';
      evEl.textContent = ev.title;
      evEl.addEventListener('click', () => {
        if (confirm(`"${ev.title}" etkinliğini sil?`)) {
          onDeleteEvent(ev);
        }
      });
      cell.appendChild(evEl);
    });
    if (dayEvents.length > 3) {
      const more = document.createElement('span');
      more.style.fontSize='12px';
      more.style.color='#999';
      more.textContent = `+${dayEvents.length-3} daha`;
      cell.appendChild(more);
    }
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

  const deleteEvent = async (eventToDelete) => {
    try {
      const newEvents = events.filter(ev => !(ev.date === eventToDelete.date && ev.title === eventToDelete.title));
      const ref = doc(db, 'user info', uid);
      await setDoc(ref, { events: newEvents }, { merge: true });
      // Update local array
      const idx = events.indexOf(eventToDelete);
      if (idx !== -1) events.splice(idx, 1);
      draw();
    } catch (e) { console.error('delete event', e); }
  };

  function draw() {
    calEl.innerHTML = '';
    const { container, prev, next, today, addBtn } = buildCalendar(month, year, events, deleteEvent);
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
  modal.style.background='#fff'; modal.style.padding='16px'; modal.style.borderRadius='10px'; modal.style.boxShadow='0 10px 40px rgba(0,0,0,0.12)';
  modal.style.maxWidth='400px'; modal.style.marginLeft='auto'; modal.style.marginRight='auto';
  modal.innerHTML = `
    <div style="font-weight:700;margin-bottom:12px;font-size:16px;color:#222">Yeni Etkinlik Ekle</div>
    <input id="ev-date" type="date" style="padding:10px;border:1px solid #ddd;border-radius:8px;width:100%;margin-bottom:10px;font-size:14px;" />
    <input id="ev-title" placeholder="Etkinlik başlığı" style="padding:10px;border:1px solid #ddd;border-radius:8px;width:100%;margin-bottom:12px;font-size:14px;" />
    <div style="display:flex;gap:10px;justify-content:flex-end;flex-wrap:wrap">
      <button id="ev-cancel" style="padding:10px 16px;border-radius:8px;background:#999;border:none;color:#fff;cursor:pointer;font-weight:500;font-size:14px">İptal</button>
      <button id="ev-save" class="ua-btn" style="padding:10px 16px;font-size:14px">Kaydet</button>
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

// Universities management
async function renderMyUniversitiesSection(uid, userDoc) {
  const uniEl = document.getElementById('myuniversities');
  if (!uniEl) return;
  const savedUnis = (userDoc && Array.isArray(userDoc.savedUniversities)) ? userDoc.savedUniversities : [];
  
  if (savedUnis.length === 0) {
    uniEl.innerHTML = '<div class="ua-profile" style="text-align:center"><p style="color:#666;margin-bottom:12px">Henüz üniversite eklemediniz.</p><a href="universities.html" class="ua-btn" style="display:inline-block;margin-top:8px">Üniversiteler\'e Git</a></div>';
    return;
  }
  
  let html = '<div class="ua-profile"><h3 style="margin-bottom:16px">Üniversitelerim</h3><div style="margin-top:12px">';
  savedUnis.forEach((uniName, idx) => {
    html += `<div style="display:flex;justify-content:space-between;align-items:center;padding:12px;margin:8px 0;border-radius:8px;background:#f9f9f9;border:1px solid #eee">
      <span style="font-weight:500;color:#222">${uniName}</span>
      <button class="remove-uni-btn" data-index="${idx}" style="background:#E63946;color:#fff;border:none;padding:6px 12px;border-radius:6px;cursor:pointer;font-size:13px;font-weight:500;">Kaldır</button>
    </div>`;
  });
  html += '</div></div>';
  uniEl.innerHTML = html;
  
  document.querySelectorAll('.remove-uni-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const idx = parseInt(e.target.dataset.index);
      if (confirm(`"${savedUnis[idx]}" üniversitesini kaldırmak istediğinize emin misiniz?`)) {
        savedUnis.splice(idx, 1);
        try {
          await saveUserDoc(uid, { savedUniversities: savedUnis });
          renderMyUniversitiesSection(uid, { savedUniversities: savedUnis });
        } catch (err) {
          console.error('Failed to remove university', err);
          alert('Üniversite kaldırılamadı');
        }
      }
    });
  });
}

// Function to add university to saved list (will be called from universities pages)
window.addUniversityToList = async function(universityName) {
  const user = auth.currentUser;
  if (!user) {
    alert('Lütfen önce giriş yapın');
    return false;
  }
  
  try {
    const userDoc = await fetchUserDoc(user.uid);
    let savedUnis = (userDoc && Array.isArray(userDoc.savedUniversities)) ? userDoc.savedUniversities : [];
    
    // Check if already saved
    if (savedUnis.includes(universityName)) {
      alert('Bu üniversite zaten listenizde var');
      return false;
    }
    
    savedUnis.push(universityName);
    await saveUserDoc(user.uid, { savedUniversities: savedUnis });
    alert('Üniversite listenize eklendi!');
    return true;
  } catch (err) {
    console.error('Failed to add university', err);
    alert('Üniversite eklenemedi');
    return false;
  }
};

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
  renderMyUniversitiesSection(uid, userDoc || {});
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
