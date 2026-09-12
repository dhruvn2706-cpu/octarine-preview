/* Static build only.
   The PHP version of this site posts the enquiry form to contact.php, which
   validates it, writes it to storage/enquiries.log and emails it. There is no
   PHP here, so the form would post nowhere and every enquiry would be lost
   without anyone noticing.

   This composes the same fields into the visitor's own mail client instead.
   Nothing is captured on the page and nothing is sent anywhere except to
   info@octarinestudio.com, by the visitor, from their own address. */
(function () {
  var form = document.querySelector('form[data-static-form]');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var get = function (n) {
      var el = form.querySelector('[name="' + n + '"]');
      return el ? String(el.value || '').trim() : '';
    };

    if (get('website')) return;                 // honeypot, same as the PHP side

    var name = get('name'), email = get('email');
    if (!name || !email || !get('message')) {
      form.reportValidity && form.reportValidity();
      return;
    }

    var lines = [
      'Name: '    + name,
      'Email: '   + email,
      'Phone: '   + (get('phone')   || '-'),
      'Company: ' + (get('company') || '-'),
      'Service: ' + (get('service') || '-'),
      '',
      get('message')
    ];

    window.location.href = 'mailto:info@octarinestudio.com'
      + '?subject=' + encodeURIComponent('Project enquiry - ' + name)
      + '&body='    + encodeURIComponent(lines.join('\n'));
  });
})();
