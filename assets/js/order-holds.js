(() => {
  const activeStatuses = new Set(['pending', 'confirmed', 'ready']);
  const statusNames = {
    pending: 'Chờ xác nhận', confirmed: 'Đã xác nhận', ready: 'Sẵn sàng nhận',
    completed: 'Hoàn tất', cancelled: 'Đã hủy'
  };
  const urgentWindow = 2 * 60 * 60 * 1000;
  const recentWindow = 24 * 60 * 60 * 1000;

  const remainingMs = (order, now = Date.now()) => {
    const until = Date.parse(order.expires_at || '');
    return Number.isFinite(until) ? Math.max(0, until - now) : null;
  };
  const isActive = (order) => activeStatuses.has(order.status);
  const formatRemaining = (milliseconds) => {
    const seconds = Math.ceil(milliseconds / 1000);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  };
  const statusLabel = (order) => {
    if (order.expired_at) return 'Hết hạn giữ sách';
    if (isActive(order) && remainingMs(order) === 0) return 'Đang xử lý hết hạn';
    return statusNames[order.status] || order.status;
  };
  const countdownHtml = (order) => {
    if (!isActive(order)) return '';
    const until = Date.parse(order.expires_at || '');
    if (!Number.isFinite(until)) return '';
    return `<span class="hold-countdown" data-hold-until="${until}" aria-live="off"></span>`;
  };
  const updateCountdowns = (root = document) => {
    root.querySelectorAll('[data-hold-until]').forEach((element) => {
      const remaining = Math.max(0, Number(element.dataset.holdUntil) - Date.now());
      element.textContent = remaining ? `Còn ${formatRemaining(remaining)}` : 'Đã hết 24 giờ giữ sách';
      element.classList.toggle('is-urgent', remaining > 0 && remaining <= urgentWindow);
      element.classList.toggle('is-expired', remaining === 0);
      if (!remaining) {
        const order = element.closest('[data-order-hold]');
        const status = order?.querySelector('[data-hold-status]');
        const select = order?.querySelector('[data-order-status]');
        if (status) status.textContent = 'Đang xử lý hết hạn';
        if (select) select.disabled = true;
      }
    });
  };
  const notice = (orders, audience) => {
    const now = Date.now();
    const active = orders.filter((order) => isActive(order) && remainingMs(order, now) !== null);
    const urgent = active.filter((order) => remainingMs(order, now) <= urgentWindow);
    const expired = orders.filter((order) => {
      const time = Date.parse(order.expired_at || '');
      return Number.isFinite(time) && now - time < recentWindow;
    });
    const messages = [];
    if (urgent.length) messages.push(audience === 'admin'
      ? `${urgent.length} yêu cầu sắp hoặc đã hết 24 giờ giữ sách.`
      : `${urgent.length} đơn của bạn sắp hoặc đã hết 24 giờ giữ sách.`);
    else if (active.length) messages.push(audience === 'admin'
      ? `Đang giữ sách cho ${active.length} yêu cầu, tối đa 24 giờ từ lúc đặt.`
      : `Bạn có ${active.length} đơn đang được giữ sách trong 24 giờ.`);
    if (expired.length) messages.push(`${expired.length} đơn đã hết hạn gần đây; sách được trả về kho.`);
    return { text: messages.join(' '), urgent: urgent.length > 0 || expired.length > 0,
      urgentCount: urgent.length, expiredCount: expired.length };
  };

  window.eduOrderHolds = { remainingMs, isActive, statusLabel, countdownHtml, updateCountdowns, notice };
})();
