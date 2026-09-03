/* canhotaymo.com — sales lead landing only.
   Tách biệt hoàn toàn với assets/site.js của landing thuê. */
(function () {
  'use strict';

  var ADS = {
    id: 'AW-18390668698',
    labels: {
      form: '',
      call: '',
      zalo: ''
    }
  };

  var ENDPOINT = 'https://script.google.com/macros/s/AKfycbxnhNIFQnwKlsXNGtohOHOx_JxMeYfNnEJGAUq-xumXNJOm2hssIVRnzHuIdTgOz7lX/exec';
  var THANK_YOU = '/cam-on-mua/';
  var UTM_KEYS = ['gclid', 'gbraid', 'wbraid', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];

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

  function conversion(labelKey, callback) {
    var label = ADS.labels[labelKey];
    var done = false;
    function go() {
      if (!done) {
        done = true;
        if (callback) callback();
      }
    }
    if (ADS.id && label) {
      window.gtag('event', 'conversion', {
        send_to: ADS.id + '/' + label,
        event_callback: go
      });
      setTimeout(go, 1200);
    } else {
      go();
    }
  }

  var urlParams = new URLSearchParams(location.search);
  var attribution = {};
  UTM_KEYS.forEach(function (key) {
    var value = urlParams.get(key);
    if (value) {
      try { localStorage.setItem('sale_lead_' + key, value); } catch (e) {}
    } else {
      try { value = localStorage.getItem('sale_lead_' + key); } catch (e) { value = null; }
    }
    attribution[key] = value || '';
  });

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
    box.style.background = kind === 'ok' ? '#ecfdf5' : '#fff1f2';
    box.style.color = kind === 'ok' ? '#047857' : '#be123c';
    box.innerHTML = html;
  }

  document.querySelectorAll('a[href^="tel:"]').forEach(function (el) {
    el.addEventListener('click', function () {
      track('sale_call_click', { page: document.body.dataset.page || 'unknown' });
      conversion('call');
    });
  });

  document.querySelectorAll('a[href*="zalo.me"]').forEach(function (el) {
    el.addEventListener('click', function () {
      track('sale_zalo_click', { page: document.body.dataset.page || 'unknown' });
      conversion('zalo');
    });
  });

  document.querySelectorAll('.track-sale-cta').forEach(function (el) {
    el.addEventListener('click', function () {
      track('sale_lead_cta_click', { page: document.body.dataset.page || 'unknown' });
    });
  });

  var sticky = document.querySelector('.sticky-sale');
  var formCard = document.querySelector('.lead-card');
  if (sticky && formCard && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      sticky.classList.toggle('hide', entries[0].isIntersecting);
    }, { threshold: 0.15 }).observe(formCard);
  }

  if (document.body.dataset.page === 'cam-on-mua') {
    track('generate_lead', {
      method: 'form',
      intent: 'buy',
      destination: 'google_sheet'
    });
    conversion('form');
  }

  document.querySelectorAll('form[data-sale-lead-form]').forEach(function (form) {
    var typeInput = ensureField(form, 'type');
    var phone = form.querySelector('input[type="tel"]');
    var budget = form.querySelector('select[name="budget"]');
    var area = form.querySelector('select[name="area"]');
    var submitBtn = form.querySelector('button[type="submit"]');
    var statusBox = form.querySelector('.status');
    var typeButtons = Array.prototype.slice.call(form.querySelectorAll('.type'));

    UTM_KEYS.forEach(function (key) {
      ensureField(form, key).value = attribution[key];
    });

    ensureField(form, 'page_url').value = location.href;
    ensureField(form, 'referrer').value = document.referrer || '';
    ensureField(form, 'user_agent').value = navigator.userAgent || '';
    ensureField(form, 'submitted_from').value = 'sales_landing';
    ensureField(form, 'campaign_bucket').value = 'smart_city_sales';

    function setType(value) {
      typeInput.value = value || '';
      typeButtons.forEach(function (button) {
        button.classList.toggle('active', button.dataset.type === value);
      });
    }

    typeButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        setType(button.dataset.type);
        track('sale_type_select', { type: button.dataset.type });
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
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Đang gửi nhu cầu...';
      }
      if (statusBox) statusBox.style.display = 'none';

      var selectedType = typeInput.value || 'Chưa chọn loại';
      var selectedArea = area && area.value ? area.value : 'Chưa chọn khu';
      var payload = new URLSearchParams(new FormData(form));
      payload.set('phone', normalized);
      payload.set('unit_type', selectedType);
      payload.set('type', 'SMART CITY - Mua bán - ' + selectedArea + ' - ' + selectedType);
      payload.set('intent', 'Mua bán Smart City');
      payload.set('lead_kind', 'buy');
      payload.set('submitted_at_client', new Date().toISOString());

      fetch(ENDPOINT, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
        body: payload.toString()
      }).then(function () {
        track('generate_lead', {
          method: 'form',
          intent: 'buy',
          destination: 'google_sheet',
          type: selectedType,
          budget: budget ? budget.value : '',
          area: area ? area.value : ''
        });
        if (submitBtn) submitBtn.textContent = 'Đã gửi thành công ✓';
        location.href = THANK_YOU;
      }).catch(function () {
        setStatus(
          statusBox,
          'error',
          'Không gửi được form. Anh/chị có thể <a href="https://zalo.me/0977923284" target="_blank" rel="noopener" style="text-decoration:underline;font-weight:900">nhắn Zalo</a> hoặc <a href="tel:0977923284" style="text-decoration:underline;font-weight:900">gọi 0977 923 284</a>.'
        );
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalLabel;
        }
      });
    });
  });
})();
