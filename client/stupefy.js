Meteor.subscribe("directory");
Meteor.subscribe("items");

Meteor.startup(function () {
  Meteor.autorun(function () {
    if (! Session.get("selected")) {
      var item = Items.findOne();
      if (item)
        Session.set("selected", item._id);
    }
  });
});

Template.page.item = function () {
  return Items.findOne();
};

Template.page.myItems = function () {
  return Items.find({ owner: Meteor.userId() });
};

Template.page.items = function () {
  if( Meteor.userId() ) {
	  return Items.find( { $or: [ { owner: Meteor.userId() }, { published: true } ] } );
  }
  return Items.find( { published: true } );
};

Template.page.anyItems = function () {
  return Items.find().count() > 0;
};

Template.details.creatorName = function () {
  var owner = Meteor.users.findOne(this.owner);
  if (owner._id === Meteor.userId())
    return "me";
  return displayName(owner);
};

Template.details.canRemove = function () {
  return this.owner === Meteor.userId();
};

Template.details.remove = function () {
  return Items.remove( Meteor.userId(), this.item );
};

Template.page.events({
	'click input.create': function () {
		if (! Meteor.userId())
			return;
		openCreateDialog();
	}
});

// Create an item
var openCreateDialog = function () {
  Session.set("createError", null);
  Session.set("showCreateDialog", true);
};

Template.page.showCreateDialog = function () {
  return Session.get("showCreateDialog");
};

Template.createDialog.events({
  'click .save': function (event, template) {
    var title = template.find(".title").value;
    var description = template.find(".description").value;
    var published = template.find(".publish").checked;

    if (title.length && description.length) {
      Meteor.call('createItem', {
        title: title,
        description: description,
        published: published
      }, function (error, item) {
        if (! error) {
          Session.set("selected", item);
        }
      });
      Session.set("showCreateDialog", false);
    } else {
      Session.set("createError",
                  "It needs a title and a description, or why bother?");
    }
  },

  'click .cancel': function () {
    Session.set("showCreateDialog", false);
  }
});

Template.createDialog.error = function () {
  return Session.get("createError");
};

