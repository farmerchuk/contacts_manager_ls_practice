const contactManager = {
  $contacts: $('#contacts'),
  $addContactBtn: $('#add-contact-btn'),
  $contactForm: $('#contact-form'),

  contactTemplate: Handlebars.compile($('#contact-template').html()),

  renderContacts() {
    $.ajax({
      method: 'GET',
      url: '/api/contacts',
      dataType: 'json',
      success: function(json) {
        this.showContacts(json);
      }.bind(this),
    });
  },

  showContacts(response) {
    let contactsHtml;

    response.forEach(contact => contact.tags = contact.tags.split(','));
    contactsHtml = this.contactTemplate({contacts: response});
    this.$contacts.html(contactsHtml);
  },

  bindEvents() {
    this.$addContactBtn.on('click', 'button', this.toggleNewContactForm.bind(this));
    this.$contactForm.on('click', 'button[name="cancel"]', this.closeNewContactForm.bind(this));
    this.$contactForm.on('submit', this.submitNewContactForm.bind(this));
  },

  toggleNewContactForm(e) {
    e.preventDefault();
    this.$contactForm.slideToggle();
  },

  closeNewContactForm(e) {
    e.preventDefault();

    this.$contactForm.get(0).reset();
    this.$contactForm.slideUp();
  },

  submitNewContactForm(e) {
    e.preventDefault();

    const $tagsInput = this.$contactForm.find('input[name="tags"]');
    const tags = $tagsInput.val();
    const formattedTags = this.formatTags(tags);

    $tagsInput.val(formattedTags);

    $.ajax({
      method: 'POST',
      url: '/api/contacts',
      dataType: 'json',
      data: this.$contactForm.serialize(),
      success: function(json) {
        this.renderContacts();
        this.closeNewContactForm();
      }.bind(this),
    });
  },

  formatTags(tags) {
    return tags.replace(/\W/g, ' ').trim().split(/ +/).join(',');
  },

  init() {
    this.bindEvents();
    this.renderContacts();
  },
}

contactManager.init();
