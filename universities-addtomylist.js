// universities-addtomylist.js
// This script adds "Add to My List" functionality to university detail pages

import { auth, db } from './firebase-init.js';
import { doc, getDoc, setDoc } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';

// Extract university name from page title or heading
function getUniversityName() {
  const h1 = document.querySelector('h1.page-title');
  if (h1) return h1.textContent.trim();
  const titleTag = document.title.split(' - ')[0];
  return titleTag || 'Unknown University';
}

// Add button to CTA row
function addAddToListButton() {
  const ctaRow = document.querySelector('.cta-row');
  if (!ctaRow) return;

  const btn = document.createElement('button');
  btn.id = 'add-to-mylist-btn';
  btn.textContent = '📚 Listemize Ekle';
  btn.style.background = '#E63946';
  btn.style.color = '#fff';
  btn.style.border = 'none';
  btn.style.padding = '12px 24px';
  btn.style.borderRadius = '8px';
  btn.style.cursor = 'pointer';
  btn.style.fontSize = '14px';
  btn.style.fontWeight = '600';
  btn.style.transition = 'all 0.3s ease';
  
  btn.addEventListener('mouseover', () => {
    btn.style.background = '#c91c2e';
  });
  btn.addEventListener('mouseout', () => {
    btn.style.background = '#E63946';
  });

  btn.addEventListener('click', async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) {
      alert('Lütfen önce giriş yapın');
      return;
    }

    try {
      const ref = doc(db, 'user info', user.uid);
      const snap = await getDoc(ref);
      const userDoc = snap.exists() ? snap.data() : {};
      let savedUnis = (userDoc && Array.isArray(userDoc.savedUniversities)) ? userDoc.savedUniversities : [];
      
      const uniName = getUniversityName();
      
      // Check if already saved
      if (savedUnis.includes(uniName)) {
        alert('Bu üniversite zaten listenizde var');
        return;
      }
      
      savedUnis.push(uniName);
      await setDoc(ref, { savedUniversities: savedUnis }, { merge: true });
      
      // Visual feedback
      btn.textContent = '✓ Listemize Eklendi';
      btn.style.background = '#2a2a2a';
      btn.disabled = true;
      
      setTimeout(() => {
        btn.textContent = '📚 Listemize Ekle';
        btn.style.background = '#E63946';
        btn.disabled = false;
      }, 2500);
      
    } catch (err) {
      console.error('Failed to add university', err);
      alert('Üniversite eklenemedi');
    }
  });

  ctaRow.appendChild(btn);
}

// Initialize when auth is ready
onAuthStateChanged(auth, (user) => {
  // Add button regardless of auth state, but it will check on click
  addAddToListButton();
});
