(() => {
  if (!document.querySelector('[data-open-support]')) return;

  const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const timeText = (value) => new Date(value).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
  });
  const panel = document.createElement('dialog');
  panel.className = 'support-chat-panel';
  panel.setAttribute('aria-labelledby', 'supportChatTitle');
  panel.innerHTML = `
    <div class="support-chat-head">
      <span class="support-chat-mark" aria-hidden="true">?</span>
      <div><h2 id="supportChatTitle">EduBook hỗ trợ</h2><p>Trò chuyện cùng đội ngũ nhà sách</p></div>
      <button class="support-chat-close" type="button" aria-label="Đóng hỗ trợ">×</button>
    </div>
    <div class="support-chat-timeline" role="log" aria-label="Lịch sử trò chuyện" aria-live="polite"></div>
    <p class="support-chat-feedback" role="status" hidden></p>
    <form class="support-chat-compose" hidden>
      <label class="visually-hidden" for="supportChatInput">Nội dung tin nhắn</label>
      <textarea id="supportChatInput" rows="2" maxlength="2000" placeholder="Nhập nội dung cần hỗ trợ..." required></textarea>
      <button class="button primary" type="submit">Gửi <span aria-hidden="true">➜</span></button>
    </form>`;
  document.body.append(panel);

  const timeline = panel.querySelector('.support-chat-timeline');
  const compose = panel.querySelector('.support-chat-compose');
  const input = compose.querySelector('textarea');
  const feedback = panel.querySelector('.support-chat-feedback');
  let session = null;
  let loading = false;
  let messageIds = '';
  let closeTimer = 0;

  const showFeedback = (message) => {
    feedback.textContent = message;
    feedback.hidden = !message;
  };
  const renderMessages = (messages) => {
    const ids = messages.map((message) => message.id).join(',');
    if (ids === messageIds) return;
    const follow = !messageIds || timeline.scrollHeight - timeline.scrollTop - timeline.clientHeight < 80;
    messageIds = ids;
    timeline.innerHTML = messages.length ? messages.map((message) => `
      <div class="support-message ${message.sender_role === 'student' ? 'mine' : 'theirs'}">
        <span class="support-message-author">${message.sender_role === 'student' ? 'Bạn' : 'EduBook'}</span>
        <div class="support-message-bubble">${escapeHtml(message.body)}</div>
        <time datetime="${escapeHtml(message.created_at)}">${timeText(message.created_at)}</time>
      </div>`).join('') : '<div class="support-chat-empty"><strong>Xin chào! EduBook có thể giúp gì cho bạn?</strong><p>Hãy gửi câu hỏi về sách, đơn đặt hoặc nơi nhận. Cuộc trò chuyện sẽ được lưu trong tài khoản của bạn.</p></div>';
    if (follow) timeline.scrollTop = timeline.scrollHeight;
  };
  const refreshMessages = async () => {
    if (!panel.open || !session || session.role !== 'student' || loading) return;
    loading = true;
    try {
      const messages = await window.eduBackend.getSupportMessages(session.id);
      renderMessages(messages);
      if (messages.some((message) => message.sender_role === 'staff' && !message.read_at)) {
        await window.eduBackend.markSupportRead(session.id, 'staff');
      }
      showFeedback('');
    } catch (error) {
      showFeedback(error.message || 'Không tải được cuộc trò chuyện.');
    } finally { loading = false; }
  };
  const openPanel = async () => {
    window.clearTimeout(closeTimer);
    if (!panel.open) panel.showModal();
    panel.classList.remove('is-closing');
    messageIds = '';
    timeline.innerHTML = '<div class="support-chat-loading">Đang tải cuộc trò chuyện...</div>';
    compose.hidden = true;
    showFeedback('');
    await window.eduAuth.ready;
    session = window.eduAuth.getSession();
    if (!session) {
      timeline.innerHTML = '<div class="support-chat-empty"><strong>Đăng nhập để nhắn tin với EduBook</strong><p>Lịch sử hỗ trợ được lưu theo tài khoản để bạn xem lại bất cứ lúc nào.</p><a class="button primary" href="login.html">Đăng nhập / Đăng ký</a></div>';
      return;
    }
    if (session.role !== 'student') {
      timeline.innerHTML = '<div class="support-chat-empty"><strong>Quản lý hỗ trợ</strong><p>Admin và SubAdmin trả lời sinh viên trong dashboard.</p><a class="button primary" href="admin.html#chats">Mở quản lý chat</a></div>';
      return;
    }
    compose.hidden = false;
    await refreshMessages();
    input.focus();
  };
  const closePanel = () => {
    panel.classList.add('is-closing');
    closeTimer = window.setTimeout(() => { panel.close(); panel.classList.remove('is-closing'); }, 170);
  };

  document.querySelectorAll('[data-open-support]').forEach((button) =>
    button.addEventListener('click', openPanel));
  panel.querySelector('.support-chat-close').addEventListener('click', closePanel);
  panel.addEventListener('cancel', (event) => { event.preventDefault(); closePanel(); });
  panel.addEventListener('click', (event) => { if (event.target === panel) closePanel(); });
  compose.addEventListener('submit', async (event) => {
    event.preventDefault();
    const body = input.value.trim();
    if (!body || !session) return;
    const button = compose.querySelector('button');
    button.disabled = true;
    try {
      await window.eduBackend.sendSupportMessage(session.id, 'student', body);
      input.value = '';
      await refreshMessages();
      input.focus();
    } catch (error) { showFeedback(error.message || 'Không gửi được tin nhắn.'); }
    finally { button.disabled = false; }
  });
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      compose.requestSubmit();
    }
  });
  window.setInterval(() => { if (!document.hidden) refreshMessages(); }, 10000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refreshMessages(); });
})();
