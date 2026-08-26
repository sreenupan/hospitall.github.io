// Shared interactions for the Pharmacy UX prototype.
// This makes every header button and generic action clickable with dummy feedback,
// so the developer can see intended behavior. All actions are demo-only.

(function () {
  // Lightweight toast
  function toast(msg) {
    var t = document.createElement('div');
    t.textContent = msg;
    t.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);' +
      'background:#1a237e;color:#fff;padding:10px 18px;border-radius:8px;font-size:13px;' +
      'font-family:Inter,sans-serif;box-shadow:0 4px 16px rgba(0,0,0,0.25);z-index:9999;opacity:0;transition:opacity .2s;';
    document.body.appendChild(t);
    requestAnimationFrame(function () { t.style.opacity = '1'; });
    setTimeout(function () { t.style.opacity = '0'; setTimeout(function () { t.remove(); }, 250); }, 1800);
  }
  window.pharmacyToast = toast;

  document.addEventListener('DOMContentLoaded', function () {
    // Header action buttons (set .onclick so the catch-all below skips them)
    document.querySelectorAll('.btn-export').forEach(function (b) {
      if (!b.onclick) b.onclick = function () { toast('Exporting data as CSV… (demo)'); };
    });
    document.querySelectorAll('.btn-import').forEach(function (b) {
      if (!b.onclick) b.onclick = function () { toast('Opening CSV import dialog… (demo)'); };
    });
    document.querySelectorAll('.btn-reset').forEach(function (b) {
      if (!b.onclick) b.onclick = function () {
        if (confirm('Reset demo data? This is a demo-only action.')) toast('Data reset. (demo)');
      };
    });
    document.querySelectorAll('.btn-logout').forEach(function (b) {
      if (!b.onclick) b.onclick = function () { window.location.href = 'login.html'; };
    });

    // Generic delete buttons that have no explicit handler
    document.querySelectorAll('.btn-del').forEach(function (b) {
      if (!b.onclick && !b.getAttribute('onclick')) {
        b.addEventListener('click', function (e) {
          e.stopPropagation();
          if (confirm('Delete this record? (demo only)')) toast('Record deleted. (demo)');
        });
      }
    });

    // Inline "Remove" line buttons (purchase/sale line items)
    document.querySelectorAll('.btn-danger-sm').forEach(function (b) {
      if (!b.onclick && !b.getAttribute('onclick')) {
        b.addEventListener('click', function (e) {
          e.stopPropagation();
          var line = b.closest('.line-item');
          if (line) { line.remove(); toast('Line removed. (demo)'); }
        });
      }
    });

    // "+ Add Another Line" buttons — clone the last line-item
    document.querySelectorAll('.btn-outline').forEach(function (b) {
      if (b.textContent.trim().indexOf('Add Another Line') !== -1 && !b.getAttribute('onclick')) {
        b.addEventListener('click', function () {
          var lines = document.querySelectorAll('.line-item');
          if (lines.length) {
            var clone = lines[lines.length - 1].cloneNode(true);
            var lbl = clone.querySelector('.label');
            if (lbl) lbl.textContent = 'Line ' + (lines.length + 1);
            lines[lines.length - 1].parentNode.insertBefore(clone, b);
            // re-bind remove on the clone
            var rm = clone.querySelector('.btn-danger-sm');
            if (rm) rm.addEventListener('click', function (e) { e.stopPropagation(); clone.remove(); toast('Line removed. (demo)'); });
          }
        });
      }
    });

    // Generic form Save buttons (btn-success / btn-save / btn-add) that only need feedback
    document.querySelectorAll('.btn-add').forEach(function (b) {
      var txt = b.textContent.trim().toLowerCase();
      // Only wire the ones that submit a record (Add Damage, Add Return, Adjust)
      if (!b.getAttribute('onclick') &&
          (txt.indexOf('add damage') !== -1 || txt.indexOf('add return') !== -1 || txt.indexOf('adjust') !== -1)) {
        b.addEventListener('click', function () { toast('Saved. (demo)'); });
      }
    });

    // Generic "Add" style buttons that only toggle a form already work; leave them.

    // Auto-order buttons on overview
    document.querySelectorAll('.btn-auto-order').forEach(function (b) {
      b.addEventListener('click', function () { toast('Auto-order raised to supplier. (demo)'); });
    });

    // Submit reconciliation
    document.querySelectorAll('.btn-submit').forEach(function (b) {
      if (!b.onclick) b.addEventListener('click', function (e) { e.preventDefault(); toast('Reconciliation log submitted. (demo)'); });
    });

    // Simulate online order
    document.querySelectorAll('.btn-simulate').forEach(function (b) {
      b.addEventListener('click', function () { toast('Simulated a new online order. (demo)'); });
    });

    // Hold / Park bill (sales)
    document.querySelectorAll('.btn-hold').forEach(function (b) {
      if (!b.getAttribute('onclick')) {
        b.addEventListener('click', function () { toast('Bill parked — shown as "On Hold" in the invoice list. (demo)'); });
      }
    });

    // Export PO as Excel/PDF (purchase orders)
    document.querySelectorAll('.btn-export-po').forEach(function (b) {
      if (!b.getAttribute('onclick')) {
        b.addEventListener('click', function () { toast('Purchase order exported to send to supplier. (demo)'); });
      }
    });

    // Expiry "Report Batches" link on overview
    document.querySelectorAll('.expiry-block .link').forEach(function (l) {
      l.addEventListener('click', function () { window.location.href = 'reports.html'; });
    });

    // Catch-all for labelled action buttons that have no onclick yet
    var labelActions = [
      { match: 'whatsapp', msg: 'Sharing via WhatsApp… (demo)' },
      { match: 'download pdf', msg: 'PDF download would start. (demo)' },
      { match: 'print grn', msg: 'Opening print preview… (demo)' },
      { match: 'print invoice', msg: 'Opening print preview… (demo)' },
      { match: 'report issue', msg: null },
      { match: 'refresh', msg: 'Refreshed. (demo)' },
      { match: 'generate', msg: 'Report generated. (demo)' },
      { match: 'csv', msg: 'Exporting CSV… (demo)' },
      { match: 'export', msg: 'Exporting data as CSV… (demo)' },
      { match: 'import', msg: 'Opening CSV import dialog… (demo)' }
    ];
    document.querySelectorAll('button, .btn').forEach(function (b) {
      if (b.onclick || b.getAttribute('onclick')) return;
      var txt = (b.textContent || '').trim().toLowerCase();
      for (var i = 0; i < labelActions.length; i++) {
        if (labelActions[i].msg && txt.indexOf(labelActions[i].match) !== -1) {
          (function (msg) { b.addEventListener('click', function () { toast(msg); }); })(labelActions[i].msg);
          break;
        }
      }
    });
  });
})();
