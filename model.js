// stupefying items -- data model
// Loaded on both the client and the server

///////////////////////////////////////////////////////////////////////////////
// Items

/*
  Each item is represented by a document in the items collection:
    owner: user id
    title, description: String
    published: Boolean
*/
Items = new Meteor.Collection("items");

Items.allow({
  insert: function (userId, item) {
    return false; // no cowboy inserts -- use createItem method
  },
  update: function (userId, items, fields, modifier) {
    return _.all(items, function (item) {
      if (userId !== item.owner)
        return false; // not the owner

      var allowed = ["title", "description", "published"];
      if (_.difference(fields, allowed).length)
        return false; // tried to write to forbidden field

      // A good improvement would be to validate the type of the new
      // value of the field (and if a string, the length.) In the
      // future Meteor will have a schema system to make that easier.
      return true;
    });
  },
  remove: function (userId, items) {
    return ! _.any(items, function (item) {
      // deny if not the owner
      return item.owner !== userId;
    });
  }
});

Meteor.methods({
  // options should include: title, description, published, tags
  createItem: function (options) {
    options = options || {};
    if (! (typeof options.title === "string" && options.title.length &&
           typeof options.description === "string" &&
           options.description.length ))
      throw new Meteor.Error(400, "Required parameter missing");
    if (options.title.length > 100)
      throw new Meteor.Error(413, "Title too long");
    if (options.tags && options.tags.length > 100)
      throw new Meteor.Error(413, "Too many tags");
    if (options.description.length > 1000)
      throw new Meteor.Error(413, "Description too long");
    if (! this.userId)
      throw new Meteor.Error(403, "You must be logged in");

    return Items.insert({
      owner: this.userId,
      title: options.title,
      description: options.description,
      published: !! options.published
    });
  },
  changeItem: function (id, options) {
    options = options || {};
    if (! (typeof options.title === "string" && options.title.length &&
           typeof options.description === "string" &&
           options.description.length ))
      throw new Meteor.Error(400, "Required parameter missing");
    if (options.title.length > 100)
      throw new Meteor.Error(413, "Title too long");
    if (options.tags && options.tags.length > 100)
      throw new Meteor.Error(413, "Too many tags");
    if (options.description.length > 1000)
      throw new Meteor.Error(413, "Description too long");
    if (! this.userId)
      throw new Meteor.Error(403, "You must be logged in");

    return Items.update({ _id: id },{ $set: {
      title: options.title,
      description: options.description,
      published: !! options.published
    }});
  }

});

///////////////////////////////////////////////////////////////////////////////
// Users

var displayName = function (user) {
  if (user.profile && user.profile.name)
    return user.profile.name;
  return user.emails[0].address;
};

var contactEmail = function (user) {
  if (user.emails && user.emails.length)
    return user.emails[0].address;
  if (user.services && user.services.facebook && user.services.facebook.email)
    return user.services.facebook.email;
  return null;
};
