# Testing Checklist - AllAbroad User Features

## ✅ Pre-Testing Setup
- [ ] User is logged in with Google OAuth
- [ ] Firebase console shows user_info collection
- [ ] Browser console is open (F12) to check for errors
- [ ] Test on desktop, tablet (768px), and mobile (375px) views

---

## 🧪 User Profile Tests

### Profile Display
- [ ] Profile picture displays from Google account
- [ ] User name shows correctly
- [ ] Email address displays
- [ ] Bio field shows (if entered)
- [ ] Location field shows (if entered)
- [ ] "Profili Düzenle" button is visible
- [ ] "Yenile" button is visible

### Profile Editing
- [ ] Click "Profili Düzenle" button
- [ ] Form inputs appear with current values
- [ ] Edit name field and save → updates in UI
- [ ] Edit phone field and save → updates in UI
- [ ] Edit bio field (leave empty) → saves correctly
- [ ] Edit location field and save → updates in UI
- [ ] Cancel button closes form without saving
- [ ] "Yenile" button reloads data from Firebase
- [ ] No errors in browser console

### Firebase Data
- [ ] Check Firebase: user_info > [userId] > name field updated
- [ ] Check Firebase: phone field saved correctly
- [ ] Check Firebase: bio field saved correctly
- [ ] Check Firebase: location field saved correctly
- [ ] Refresh page → data persists correctly

---

## 📅 Calendar Tests

### Calendar Display
- [ ] Calendar shows current month
- [ ] All weekdays display correctly (Paz, Pzt, Sal, etc.)
- [ ] Correct number of days for month
- [ ] Navigation buttons (‹, ›) work
- [ ] "Bugün" button jumps to current date
- [ ] "Etkinlik Ekle" button is visible

### Add Events
- [ ] Click "Etkinlik Ekle" → modal appears
- [ ] Modal has date input field
- [ ] Modal has title input field
- [ ] Enter date and title
- [ ] Click "Kaydet" → modal closes
- [ ] Event appears on calendar on correct date
- [ ] Check Firebase: events array has new entry
- [ ] Multiple events on same day: shows up to 3, "+X more" for rest
- [ ] Refresh page → events persist

### Delete Events
- [ ] Add an event to calendar
- [ ] Click on event text
- [ ] Confirmation dialog appears
- [ ] Click confirm → event removed
- [ ] Click cancel → event stays
- [ ] Check Firebase: event removed from array
- [ ] Calendar updates in real-time

### Calendar Navigation
- [ ] Navigate to different months
- [ ] Events stay on correct dates when navigating
- [ ] Previous month button works
- [ ] Next month button works
- [ ] "Bugün" button returns to current month

### Responsiveness
- [ ] Desktop (1024px): Full 7-column grid
- [ ] Tablet (768px): Text size adjusts
- [ ] Mobile (375px): Compact view, readable text
- [ ] Events still clickable on mobile
- [ ] Modal form responsive on mobile

---

## 🏫 University Management Tests

### Add Universities - Method 1 (Master List)
- [ ] Go to universities.html
- [ ] Find a university in list
- [ ] Click "+ Ekle" button
- [ ] If not logged in: alert "Lütfen önce giriş yapın"
- [ ] If logged in: Button changes to "✓ Eklendi"
- [ ] Button returns to "+ Ekle" after 2 seconds
- [ ] University appears in user.html#myuniversities
- [ ] Check Firebase: savedUniversities array updated

### Add Universities - Method 2 (Detail Page)
- [ ] Visit harvard-university.html (or any university)
- [ ] Scroll to CTA section (buttons: Visit Website, Follow Instagram)
- [ ] See "📚 Listemize Ekle" button
- [ ] Click button
- [ ] If not logged in: alert "Lütfen önce giriş yapın"
- [ ] If logged in: Button shows "✓ Listemize Eklendi"
- [ ] University added to "Üniversitelerim" section
- [ ] Works on all 150 university pages

### View My Universities
- [ ] Go to user.html#myuniversities
- [ ] Saved universities display in list
- [ ] Each university has "Kaldır" button
- [ ] Empty state shows when no universities saved
- [ ] "Üniversiteler'e Git" link works

### Remove Universities
- [ ] Click "Kaldır" button next to university
- [ ] Confirmation dialog appears
- [ ] Click confirm → university removed
- [ ] Click cancel → university stays
- [ ] List updates immediately
- [ ] Check Firebase: removed from array

### Duplicate Prevention
- [ ] Try adding same university twice
- [ ] Alert: "Bu üniversite zaten listenizde var"
- [ ] No duplicate added to list
- [ ] List shows only one entry

### Responsiveness
- [ ] Desktop (1024px): Clean list layout
- [ ] Tablet (768px): List wraps properly
- [ ] Mobile (375px): Full-width, touch-friendly buttons
- [ ] Buttons readable and clickable on all sizes

---

## 🔐 Authentication Tests

### Login State
- [ ] Logged in: User button shows in header
- [ ] Not logged in: Login button shows in header
- [ ] Logged out: Redirected to login page
- [ ] Profile picture changes when switching accounts

### Permission Tests
- [ ] Not logged in: Can't add universities (alert shown)
- [ ] Not logged in: User page shows "Lütfen giriş yapın"
- [ ] Logged in: Full access to all features
- [ ] Can't edit another user's profile

---

## 📱 Mobile-Specific Tests

### Screen Sizes
- [ ] 375px (iPhone SE): All content readable
- [ ] 414px (iPhone 12): All buttons clickable
- [ ] 768px (iPad): Optimized layout
- [ ] 1024px (Desktop): Full experience

### Touch Interactions
- [ ] Calendar events clickable on touch
- [ ] Buttons have adequate padding (min 44px)
- [ ] No text overflow on small screens
- [ ] Modals readable on small screens
- [ ] Form inputs have good font size (≥14px)

### Keyboard
- [ ] Tab navigation works
- [ ] Enter key submits forms
- [ ] Escape key closes modals

---

## 🎨 Visual Tests

### Styling
- [ ] All buttons are red (#E63946) primary color
- [ ] Hover effects work (buttons darken)
- [ ] Consistent spacing between elements
- [ ] Shadows are subtle and professional
- [ ] Border radius consistent (8px)

### Typography
- [ ] Font is Montserrat
- [ ] Heading sizes proportional
- [ ] Text color contrast meets WCAG AA
- [ ] Line spacing readable

### Consistency
- [ ] Calendar style matches profile section
- [ ] Button styles match throughout
- [ ] Color palette consistent with site
- [ ] Icons (emoji) render correctly

---

## 🚀 Performance Tests

### Loading
- [ ] User page loads in <2 seconds
- [ ] Universities page loads in <3 seconds
- [ ] No lag when opening modals
- [ ] Events render smoothly

### Responsiveness
- [ ] Clicking buttons responds immediately
- [ ] No UI freezing during Firebase calls
- [ ] Smooth calendar navigation
- [ ] Real-time updates feel instant

### Storage
- [ ] LocalStorage not bloated by feature
- [ ] Firebase doesn't create unnecessary docs
- [ ] No duplicate data stored
- [ ] Data structure normalized

---

## 🐛 Error Handling Tests

### Network Issues
- [ ] Slow connection: Loading indicators work
- [ ] No connection: Error message shows
- [ ] Reconnect: Data syncs correctly

### Invalid Input
- [ ] Empty event title: Alert shown
- [ ] Missing date: Alert shown
- [ ] Very long bio: Textarea wraps correctly
- [ ] Special characters in name: Saved correctly

### Edge Cases
- [ ] Delete all events: Shows empty calendar
- [ ] Delete all universities: Shows empty message
- [ ] Add university immediately after refresh: Works
- [ ] Rapid form submissions: Only saves once

---

## 📊 Firebase Tests

### Data Structure
- [ ] user_info collection exists
- [ ] Each user has UID document
- [ ] Fields: name, phone, bio, location
- [ ] Array field: events
- [ ] Array field: savedUniversities

### Read Operations
- [ ] Data loads on page load
- [ ] Multiple users don't see each other's data
- [ ] Refresh loads fresh data from Firebase

### Write Operations
- [ ] New events write to array correctly
- [ ] Updates merge with existing data
- [ ] Deletions remove from array
- [ ] No overwrites of existing fields

### Real-time Updates
- [ ] Edit profile in one tab: Updates in another tab
- [ ] Add event in one tab: Shows in another tab
- [ ] Delete in one tab: Removes from another tab

---

## 🌐 Cross-Browser Tests

### Chrome/Edge
- [ ] All features work
- [ ] Firebase SDK loads
- [ ] No console errors

### Firefox
- [ ] All features work
- [ ] CSS displays correctly
- [ ] No compatibility issues

### Safari
- [ ] All features work
- [ ] Modals display correctly
- [ ] Touch interactions work

---

## ✨ Final Acceptance Tests

### User Story 1: Profile Management
- [ ] User can view their profile with photo
- [ ] User can edit name, phone, bio, location
- [ ] Changes persist after page refresh
- [ ] Data only visible to logged-in user

### User Story 2: Calendar
- [ ] User can add events with date and title
- [ ] Events display on calendar
- [ ] User can delete events
- [ ] Data persists across sessions

### User Story 3: University List
- [ ] User can add universities from two locations
- [ ] Universities appear in "My Universities"
- [ ] User can remove universities
- [ ] Duplicates prevented automatically

### User Story 4: Responsive Design
- [ ] All features work on mobile
- [ ] All features work on tablet
- [ ] All features work on desktop
- [ ] Touch-friendly on all screens

---

## 📝 Sign-Off

**Date Tested:** _______________
**Tester Name:** _______________
**Test Environment:** _______________
**Browsers Tested:** _______________

**Overall Result:** ☐ PASS ☐ FAIL

**Critical Issues Found:** 
- 

**Minor Issues Found:**
- 

**Notes:**
- 

---

**Last Updated:** January 26, 2026
