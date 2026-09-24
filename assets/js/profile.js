const profileSession = window.eduAuth.getSession();
if (!profileSession) {
  window.location.replace('login.html');
} else {
  const isAdmin = profileSession.role === 'admin';
  document.querySelector('#profileInitials').textContent = isAdmin ? 'AD' : 'LA';
  document.querySelector('#profileName').textContent = profileSession.name;
  document.querySelector('#profileSubtitle').textContent = profileSession.subtitle;
  document.querySelector('#profileEmail').textContent = profileSession.email;
  document.querySelector('#profileRole').textContent = isAdmin ? 'Quản trị viên IUH' : 'Sinh viên IUH';
  document.querySelector('#profileRoleDetail').textContent = isAdmin ? 'Quản trị viên' : 'Sinh viên';
  document.querySelector('#profileId').textContent = profileSession.studentId || profileSession.staffId || 'Chưa cập nhật';
  document.querySelector('#profileFaculty').textContent = profileSession.faculty || 'Chưa cập nhật';
  document.querySelector('#profilePhone').textContent = profileSession.phone || 'Chưa cập nhật';
  document.querySelector('#profileBirthday').textContent = profileSession.birthday || 'Chưa cập nhật';
  document.querySelector('#profileAddress').textContent = profileSession.address || 'Chưa cập nhật';
}
