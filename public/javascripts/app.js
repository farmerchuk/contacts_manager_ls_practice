const contactManager = {
  $contacts: $('#contacts'),
  $addContactBtn: $('#add-contact-btn'),
  $contactForm: $('#contact-form'),
  $searchQuery: $('#search input'),

  contactTemplate: Handlebars.compile($('#contact-template').html()),

  renderContacts(...args) {
    const query = args[0];

    $.ajax({
      method: 'GET',
      url: '/api/contacts',
      dataType: 'json',
      success: function(json) {
        this.showContacts(json, query);
      }.bind(this),
    });
  },

  showContacts(json, query) {
    let contactsHtml;
    let filteredContacts = json;

    if (query) {
      query = query.toLowerCase();

      filteredContacts = filteredContacts.filter(function(contact) {
        let name = contact.full_name.toLowerCase();
        let tags = contact.tags.toLowerCase();
        return !!name.match(query) || !!tags.match(query);
      });
    }

    filteredContacts.forEach(contact => contact.tags = contact.tags.split(','));
    contactsHtml = this.contactTemplate({contacts: filteredContacts});
    this.$contacts.html(contactsHtml);
  },

  bindEvents() {
    this.$addContactBtn.on('click', 'button', this.toggleNewContactForm.bind(this));
    this.$contactForm.on('click', 'button[name="cancel"]', this.closeNewContactForm.bind(this));
    this.$contactForm.on('submit', this.submitNewContactForm.bind(this));
    this.$searchQuery.on('input', this.submitSearch.bind(this));
    this.$contacts.on('click', 'li.tag', this.submitTagSearch.bind(this));
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

  submitSearch(e) {
    e.preventDefault();
    const query = this.$searchQuery.val();
    this.renderContacts(query);
  },

  submitTagSearch(e) {
    e.preventDefault();
    const tag = e.target.textContent;
    this.renderContacts(tag);
  },

  init() {
    this.bindEvents();
    this.renderContacts();
  },
}

contactManager.init();
