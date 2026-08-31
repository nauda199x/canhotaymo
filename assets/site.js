/* canhotaymo.com — script dùng chung cho các trang đích.
   Gồm: form nhận nhu cầu, ghi nhận nguồn quảng cáo (gclid/utm),
   theo dõi chuyển đổi Google Ads, thanh CTA cố định trên mobile. */
(function () {
  'use strict';

  /* =======================================================================
     ⚠️ CẦN ĐIỀN — LẤY TỪ GOOGLE ADS
     Mục tiêu → Chuyển đổi → Hành động chuyển đổi → Tạo mới.
     Khi id còn rỗng, script KHÔNG tải thẻ Google và KHÔNG bắn chuyển đổi
     (trang vẫn chạy bình thường, không lỗi console).
     ======================================================================= */
  var ADS = {
    id: '',                 // ví dụ: 'AW-123456789'
    labels: {
      form: '',             // nhãn chuyển đổi "Gửi form thành công" (trang /cam-on/)
      call: '',             // nhãn chuyển đổi "Bấm nút gọi"
      zalo: ''              // nhãn chuyển đổi "Bấm nút Zalo"
    }
  };

  var ENDPOINT = 'https://script.google.com/macros/s/AKfycbxnhNIFQnwKlsXNGtohOHOx_JxMeYfNnEJGAUq-xumXNJOm2hssIVRnzHuIdTgOz7lX/exec';
  var THANK_YOU = '/cam-on/';
  var UTM_KEYS = ['gclid', 'gbraid', 'wbraid', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];

  /* ---------- Thẻ Google (an toàn khi chưa cấu hình) ---------- */
  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== 'function') {
    window.gtag = function () { window.dataLayer.push(arguments); };
  }
  if (ADS.id) {
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(ADS.id);
    document.head.appendChild(s);
    window.gtag('js', new Date());
    window.gtag('config', ADS.id);
  }

  function track(name, params) {
    window.gtag('event', name, params || {});
  }

  /* Bắn chuyển đổi Google Ads. callback chạy kể cả khi chưa cấu hình id. */
  function conversion(labelKey, callback) {
    var label = ADS.labels[labelKey];
    var done = false;
    function go() { if (!done) { done = true; if (callback) callback(); } }
    if (ADS.id && label) {
      window.gtag('event', 'conversion', { send_to: ADS.id + '/' + label, event_callback: go });
      setTimeout(go, 1200); // không để callback bị treo nếu thẻ chậm
    } else {
      go();
    }
  }

  /* ---------- Nguồn truy cập: gclid / utm ---------- */
  var params = new URLSearchParams(location.search);
  var attribution = {};
  UTM_KEYS.forEach(function (key) {
    var value = params.get(key);
    if (value) {
      try { localStorage.setItem('lead_' + key, value); } catch (e) { /* chế độ riêng tư */ }
    } else {
      try { value = localStorage.getItem('lead_' + key); } catch (e) { value = null; }
    }
    attribution[key] = value || '';
  });

  /* ---------- Tiện ích ---------- */
  function ensureField(form, name, value) {
    var field = form.querySelector('[name="' + name + '"]');
    if (!field) {
      field = document.createElement('input');
      field.type = 'hidden';
      field.name = name;
      form.appendChild(field);
    }
    if (value !== undefined && !field.value) field.value = value;
    return field;
  }

  function setStatus(box, kind, html) {
    if (!box) return;
    box.style.display = 'block';
    box.style.background = kind === 'ok' ? '#ecfdf3' : '#fff2f0';
    box.style.color = kind === 'ok' ? '#067647' : '#b42318';
    box.innerHTML = html;
  }

  /* ---------- Ngày hôm nay ---------- */
  var now = new Date();
  var today = String(now.getDate()).padStart(2, '0') + '/' +
              String(now.getMonth() + 1).padStart(2, '0') + '/' + now.getFullYear();
  document.querySelectorAll('.js-today').forEach(function (el) { el.textContent = today; });

  /* ---------- Theo dõi click gọi điện / Zalo ---------- */
  document.querySelectorAll('a[href^="tel:"]').forEach(function (el) {
    el.addEventListener('click', function () {
      track('call_click', { location: document.body.dataset.page || 'unknown' });
      conversion('call');
    });
  });
  document.querySelectorAll('a[href*="zalo.me"]').forEach(function (el) {
    el.addEventListener('click', function () {
      track('zalo_click', { location: document.body.dataset.page || 'unknown' });
      conversion('zalo');
    });
  });
  document.querySelectorAll('.track-lead-cta').forEach(function (el) {
    el.addEventListener('click', function () { track('lead_cta_click'); });
  });
  document.querySelectorAll('.track-gallery').forEach(function (el) {
    el.addEventListener('click', function () { track('gallery_to_form_click'); });
  });

  /* ---------- Thanh CTA cố định: ẩn khi form đang hiển thị ---------- */
  var sticky = document.querySelector('.sticky');
  var formCard = document.querySelector('.card');
  if (sticky && formCard && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      sticky.classList.toggle('hide', entries[0].isIntersecting);
    }, { threshold: 0.18 }).observe(formCard);
  }

  /* ---------- Chuyển đổi trên trang cảm ơn ---------- */
  if (document.body.dataset.page === 'cam-on') {
    track('generate_lead', { method: 'form', destination: 'google_sheet' });
    conversion('form');
  }

  /* ---------- Form nhận nhu cầu ---------- */
  document.querySelectorAll('form[data-lead-form]').forEach(function (form) {
    var typeInput = ensureField(form, 'type');
    var phone = form.querySelector('input[type="tel"]');
    var budget = form.querySelector('select[name="budget"]');
    var submitBtn = form.querySelector('button[type="submit"]');
    var statusBox = form.querySelector('.status');
    var typeButtons = Array.prototype.slice.call(form.querySelectorAll('.type'));

    UTM_KEYS.forEach(function (key) { ensureField(form, key).value = attribution[key]; });
    ensureField(form, 'page_url').value = location.href;
    ensureField(form, 'referrer').value = document.referrer || '';
    ensureField(form, 'user_agent').value = navigator.userAgent || '';
    ensureField(form, 'source_page', document.body.dataset.page || '');

    function setType(value) {
      typeInput.value = value || '';
      typeButtons.forEach(function (b) { b.classList.toggle('active', b.dataset.type === value); });
    }
    typeButtons.forEach(function (b) {
      b.addEventListener('click', function () {
        setType(b.dataset.type);
        track('type_select', { type: b.dataset.type });
      });
    });

    if (phone) {
      phone.addEventListener('input', function () {
        phone.value = phone.value.replace(/[^0-9 ]/g, '').slice(0, 14);
      });
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();

      var honeypot = form.querySelector('[name="website"]');
      if (honeypot && honeypot.value) return;

      var normalized = phone ? phone.value.replace(/\s+/g, '') : '';
      if (!/^[0-9]{9,11}$/.test(normalized)) {
        setStatus(statusBox, 'error', 'Vui lòng nhập đúng số điện thoại/Zalo (9–11 số).');
        if (phone) phone.focus();
        return;
      }

      var originalLabel = submitBtn ? submitBtn.textContent : '';
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Đang gửi nhu cầu...'; }
      if (statusBox) statusBox.style.display = 'none';

      var payload = new URLSearchParams(new FormData(form));
      payload.set('phone', normalized);
      payload.set('submitted_at_client', new Date().toISOString());

      fetch(ENDPOINT, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
        body: payload.toString()
      }).then(function () {
        track('generate_lead', {
          method: 'form',
          destination: 'google_sheet',
          type: typeInput.value || 'unspecified',
          budget: budget ? budget.value : ''
        });
        if (submitBtn) submitBtn.textContent = 'Đã gửi thành công ✓';
        location.href = THANK_YOU;
      }).catch(function () {
        setStatus(statusBox, 'error',
          'Không gửi được form. Anh/chị có thể <a href="https://zalo.me/0977923284" target="_blank" rel="noopener" style="text-decoration:underline;font-weight:900">nhắn Zalo trực tiếp tại đây</a> hoặc <a href="tel:0977923284" style="text-decoration:underline;font-weight:900">gọi 0977 923 284</a>.');
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = originalLabel; }
      });
    });
  });
})();
