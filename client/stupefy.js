Meteor.subscribe("directory");
Meteor.subscribe("items");

Meteor.startup(function () {
  Meteor.autorun(function () {
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

Template.page.events({
	'click input.create': function () {
		if (! Meteor.userId())
			return;
		openCreateDialog();
	}
});

Template.details.creatorName = function () {
  var owner = Meteor.users.findOne(this.owner);
  if (owner._id === Meteor.userId())
    return "me";
  return displayName(owner);
};

Template.details.selected = function () {
	return this._id === Session.get("selected");
};

Template.details.events({
	'click .details': function () {
		if( Session.get("selected") === this._id ) {
			Session.set("selected", null );
		}
		Session.set("selected", this._id);
	},
	'dblclick .details': function () {
		if( this.owner === Meteor.userId() ) {
			Session.set("editing", this._id);
		}
		Session.set("selected", this._id);
	}
});

Template.selectedDetails.canRemove = function () {
  return this.owner === Meteor.userId();
};

Template.selectedDetails.events({
	'click .remove': function () {
		Items.remove( this._id );
		return false;
	},
	'click .description': function () {
		Session.set("selected", null );
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

