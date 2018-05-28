$(function() {

  const $contacts = $('#contacts');
  const $addContactBtn = $('#add-contact-btn');
  const $contactForm = $('#contact-form');

  const contactTemplate = Handlebars.compile($('#contact-template').html());

  $.ajax({
    method: 'GET',
    url: '/api/contacts',
    dataType: 'json',
    success: function(response) {
      let contactsHtml;

      response.forEach(contact => contact.tags = contact.tags.split(','));
      contactsHtml = contactTemplate({contacts: response})
      $contacts.html(contactsHtml);
    }
  });

  $addContactBtn.on('click', 'button', function(e) {
    e.preventDefault();
    $contactForm.slideToggle();
  });

  $contactForm.on('click', 'button[name="cancel"]', function(e) {
    $contactForm.slideUp();
  });

  $contactForm.on('submit', function(e) {
    e.preventDefault();
    data = $contactForm.serializeArray();
    formatTags(data);
    json = jsonize(data);

    $.ajax({
      method: 'POST',
      url: '/api/contacts',
      contentType: 'application/json',
      dataType: 'json',
      data: json,
    });
  });

  function formatTags(data) {
    const tagsObj = data.find(field => field.name === 'tags');
    tagsObj.value = tagsObj.value.replace(/\W/g, ' ').trim().split(/ +/).join(',');
  }

  function jsonize(data) {
    const newObj = {}

    newObj.full_name = data.find(field => field.name === 'full_name').value;
    newObj.phone_number = data.find(field => field.name === 'phone_number').value;
    newObj.email = data.find(field => field.name === 'email').value;
    newObj.tags = data.find(field => field.name === 'tags').value;

    return JSON.stringify(newObj);
  }
});
