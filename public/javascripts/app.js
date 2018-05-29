const contactManager = {
  $contacts: $('#contacts'),
  $addContactBtn: $('#add-contact-btn'),
  $contactForm: $('#contact-form'),
  $searchQuery: $('#search input'),
  contactFormPath: '',
  contactFormMethod: '',

  contactTemplate: Handlebars.compile($('#contact-template').html()),

  renderContacts(...args) {
    $.ajax({
      method: 'GET',
      url: '/api/contacts',
      dataType: 'json',
      success: contacts => this.showContacts(contacts, args[0]),
    });
  },

  showContacts(contacts, query) {
    let contactsHtml;

    if (query) contacts = this.filterContacts(contacts, query);

    contacts.forEach(contact => contact.tags = contact.tags.split(','));
    contactsHtml = this.contactTemplate({contacts: contacts});
    this.$contacts.html(contactsHtml);
  },

  filterContacts(contacts, query) {
    query = query.toLowerCase();

    return contacts.filter(function(contact) {
      let name = contact.full_name.toLowerCase();
      let tags = contact.tags.toLowerCase();

      return !!name.match(query) || !!tags.match(query);
    });
  },

  bindEvents() {
    this.$addContactBtn.on('click', this.openNewContactForm.bind(this));
    this.$contactForm.on('click', 'button[name="cancel"]', this.closeContactForm.bind(this));
    this.$contactForm.on('submit', this.submitContactForm.bind(this));
    this.$searchQuery.on('input', this.submitSearch.bind(this));
    this.$contacts.on('click', 'li.tag', this.submitTagSearch.bind(this));
    this.$contacts.on('click', 'form[method="put"]', this.editContact.bind(this));
    this.$contacts.on('click', 'form[method="delete"]', this.deleteContact.bind(this));
  },

  setContactFormPathAndMethod(path, method) {
    this.contactFormPath = path;
    this.contactFormMethod = method;
  },

  clearContactFormPathAndMethod() {
    this.setContactFormPathAndMethod('', '');
  },

  openNewContactForm(e) {
    e.preventDefault();

    this.setContactFormPathAndMethod('/api/contacts', 'post');
    this.$contactForm.slideDown();
  },

  closeContactForm() {
    this.$contactForm.get(0).reset();
    this.clearContactFormPathAndMethod();
    this.$addContactBtn.html('Add Contact');
    this.$contactForm.slideUp();
  },

  submitContactForm(e) {
    e.preventDefault();
    const formattedTags = this.getFormattedTagsFromContactForm();

    this.$contactForm.find('input[name="tags"]').val(formattedTags);

    $.ajax({
      method: this.contactFormMethod,
      url: this.contactFormPath,
      data: this.$contactForm.serialize(),
      success: function() {
        this.renderContacts();
        this.closeContactForm();
      }.bind(this),
    });
  },

  getFormattedTagsFromContactForm() {
    const $tagsInput = this.$contactForm.find('input[name="tags"]');
    const tags = $tagsInput.val();

    return this.formatTags(tags);
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

  editContact(e) {
    e.preventDefault();
    const path = $(e.target).closest('form').attr('action');

    this.setContactFormPathAndMethod(path, 'put');
    this.populateContactFormFields(path);
    this.$addContactBtn.html('Edit Contact');
    this.$contactForm.slideDown();
  },

  deleteContact(e) {
    e.preventDefault();
    const path = $(e.target).closest('form').attr('action');

    $.ajax({
      method: 'delete',
      url: path,
      success: () => this.renderContacts(),
    });
  },

  populateContactFormFields(path) {
    $.ajax({
      method: 'get',
      url: path,
      dataType: 'json',
      success: json => this.updateFields(json),
    });
  },

  updateFields(json) {
    this.$contactForm.find('input[name="full_name"]').val(json.full_name);
    this.$contactForm.find('input[name="phone_number"]').val(json.phone_number);
    this.$contactForm.find('input[name="email"]').val(json.email);
    this.$contactForm.find('input[name="tags"]').val(json.tags);
  },

  init() {
    this.bindEvents();
    this.renderContacts();
  },
}

contactManager.init();
