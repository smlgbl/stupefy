
Meteor.publish("directory", function () {
  return Meteor.users.find({}, {fields: {emails: 1, profile: 1}});
});

Meteor.publish("items", function () {
  return Items.find(
    {$or: [{"published": true}, {owner: this.userId}]});
});
