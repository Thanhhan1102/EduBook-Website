(() => {
  const list = document.querySelector('#chatThreadList');
  if (!list) return;
  const messagesBox = document.querySelector('#adminChatMessages');
  const form = document.querySelector('#adminChatForm');
  const input = document.querySelector('#adminChatInput');
  const feedback = document.querySelector('#adminChatFeedback');
  const search = document.querySelector('#chatSearch');
  const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const timeText = (value) => new Date(value).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
  });
  let threads = [];
  let selectedId = '';
  let messageIds = '';
  let started = false;
  let loadingThreads = false;
  let loadingMessages = false;
  let queuedMessages = false;

  const showFeedback = (message) => {
    feedback.textContent = message;
    feedback.hidden = !message;
  };
  const renderThreads = () => {
    const query = search.value.trim().toLocaleLowerCase('vi');
    const visible = threads.filter((thread) =>
      [thread.full_name, thread.student_id].some((value) =>
        String(value || '').toLocaleLowerCase('vi').includes(query)));
    list.innerHTML = visible.length ? visible.map((thread) => `
      <button class="admin-chat-thread ${selectedId === thread.user_id ? 'is-selected' : ''}" type="button" data-chat-user="${escapeHtml(thread.user_id)}" aria-pressed="${selectedId === thread.user_id}">
        <span class="admin-chat-thread-top"><strong>${escapeHtml(thread.full_name)}</strong><time>${timeText(thread.last_at)}</time></span>
        <small>${escapeHtml(thread.student_id)}</small>
        <span class="admin-chat-thread-bottom"><span>${escapeHtml(thread.last_body)}</span>${Number(thread.unread_count) ? `<b aria-label="${Number(thread.unread_count)} tin nhắn chưa đọc">${Number(thread.unread_count)}</b>` : ''}</span>
      </button>`).join('') : `<p class="admin-chat-list-empty">${threads.length ? 'Không tìm thấy tài khoản phù hợp.' : 'Chưa có cuộc trò chuyện nào.'}</p>`;
    const unread = threads.reduce((total, thread) => total + Number(thread.unread_count || 0), 0);
    const badge = document.querySelector('#adminChatUnread');
    badge.hidden = unread === 0;
    badge.textContent = unread > 99 ? '99+' : String(unread);
  };
  const renderMessages = (messages) => {
    const ids = messages.map((message) => message.id).join(',');
    if (ids === messageIds) return;
    const follow = !messageIds || messagesBox.scrollHeight - messagesBox.scrollTop - messagesBox.clientHeight < 80;
    messageIds = ids;
    messagesBox.innerHTML = messages.length ? messages.map((message) => `
      <div class="support-message ${message.sender_role === 'student' ? 'mine' : 'theirs'}">
        <span class="support-message-author">${message.sender_role === 'student' ? 'Sinh viên' : 'EduBook'}</span>
        <div class="support-message-bubble">${escapeHtml(message.body)}</div>
        <time datetime="${escapeHtml(message.created_at)}">${timeText(message.created_at)}</time>
      </div>`).join('') : '<p class="admin-chat-list-empty">Chưa có tin nhắn.</p>';
    if (follow) messagesBox.scrollTop = messagesBox.scrollHeight;
  };
  const refreshThreads = async () => {
    if (!started || loadingThreads) return;
    loadingThreads = true;
    let firstId = '';
    try {
      threads = await window.eduBackend.getSupportChats();
      if (!selectedId && threads.length) firstId = threads[0].user_id;
      renderThreads();
      showFeedback('');
    } catch (error) {
      list.innerHTML = `<p class="admin-chat-list-empty">${escapeHtml(error.message || 'Không tải được danh sách chat.')}</p>`;
      showFeedback(error.message || 'Không tải được danh sách chat.');
    } finally { loadingThreads = false; }
    if (firstId) selectThread(firstId);
  };
  const refreshMessages = async () => {
    if (!selectedId) return;
    if (loadingMessages) { queuedMessages = true; return; }
    loadingMessages = true;
    const userId = selectedId;
    try {
      const messages = await window.eduBackend.getSupportMessages(userId);
      if (selectedId !== userId) return;
      renderMessages(messages);
      if (messages.some((message) => message.sender_role === 'student' && !message.read_at)) {
        await window.eduBackend.markSupportRead(userId, 'student');
        await refreshThreads();
      }
      showFeedback('');
    } catch (error) { showFeedback(error.message || 'Không tải được tin nhắn.'); }
    finally {
      loadingMessages = false;
      if (queuedMessages) { queuedMessages = false; refreshMessages(); }
    }
  };
  function selectThread(userId) {
    selectedId = userId;
    messageIds = '';
    const thread = threads.find((item) => item.user_id === userId);
    document.querySelector('#chatRecipient').textContent = thread?.full_name || 'Sinh viên';
    document.querySelector('#chatRecipientId').textContent = thread?.student_id || '';
    messagesBox.innerHTML = '<p class="admin-chat-list-empty">Đang tải cuộc trò chuyện...</p>';
    form.hidden = false;
    renderThreads();
    refreshMessages();
  }

  list.addEventListener('click', (event) => {
    const button = event.target.closest('[data-chat-user]');
    if (button) selectThread(button.dataset.chatUser);
  });
  search.addEventListener('input', renderThreads);
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const body = input.value.trim();
    if (!body || !selectedId) return;
    const button = form.querySelector('button');
    button.disabled = true;
    try {
      await window.eduBackend.sendSupportMessage(selectedId, 'staff', body);
      input.value = '';
      await refreshMessages();
      await refreshThreads();
      input.focus();
    } catch (error) { showFeedback(error.message || 'Không gửi được câu trả lời.'); }
    finally { button.disabled = false; }
  });
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      form.requestSubmit();
    }
  });
  window.eduAdminChat = {
    start() {
      if (started) return;
      started = true;
      refreshThreads();
      window.setInterval(async () => {
        if (document.hidden) return;
        await refreshThreads();
        if (location.hash === '#chats') refreshMessages();
      }, 10000);
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) { refreshThreads(); if (location.hash === '#chats') refreshMessages(); }
      });
    },
    onTabChange(name) {
      if (name === 'chats' && started) { refreshThreads(); refreshMessages(); }
    }
  };
})();
