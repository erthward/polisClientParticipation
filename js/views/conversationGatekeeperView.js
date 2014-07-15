var template = require("../tmpl/conversationGatekeeper");
//var UserCreateView = require(".views/userCreateView");
var MetadataQuestionsView = require("../views/metadataQuestionsView");
var MetadataQuestionCollection = require("../collections/MetadataQuestions");
var MetadataQuestion = require("../models/metadataQuestion");
var PolisStorage = require("../util/polisStorage");
var Handlebones = require("handlebones");
var serialize = require("../util/serialize");
var URLs = require("../util/url");

var urlPrefix = URLs.urlPrefix;

module.exports = Handlebones.ModelView.extend({
  name: "conversationGatekeeper",
  template: template,
  events: {
    "submit form": function(event){
      var that = this;
      event.preventDefault();
      serialize(this, function(attrs){
        // pull out the for values for pmaid

        var numbers = _.chain(attrs)
          .values()  // attrs is {pmqid: pmaid} or {pmqid: [pmaid]}. We only need to upload the pmaids.
          .flatten() // when !is_exclusive, you can get an array of pmaid for each pmqid
          .map(Number)
          .filter(function(num) {
          return !_.isNaN(num) && _.isNumber(num);
        }).value();
        // delete them from the hash
        numbers.forEach(function(num) {
          delete attrs[num];
        });
        // add the pmaid values as answers
        attrs.answers = numbers;

        var params = that.params;
        if (params.sid) {
          attrs.sid = params.sid;
        }
        if (params.suzinvite) {
          attrs.suzinvite = params.suzinvite;
        }
        attrs.sid = params.sid;

        var url = urlPrefix + "v3/participants";
        if (params.suzinvite || params.sid) {
          url = urlPrefix + "v3/joinWithInvite";
        }

        $.ajax({
          url: url,
          type: "POST",
          dataType: "json",
          xhrFields: {
              withCredentials: true
          },
          // crossDomain: true,
          data: attrs
        }).then(function(data) {
          that.trigger("done");
        }, function(err) {
          console.dir(arguments);
          console.error(err.responseText);
        });
      });
    }
  },
  initialize: function(options) {
    Handlebones.ModelView.prototype.initialize.apply(this, arguments);
    this.options = options;
    this.model = options.model;
    var sid = options.sid;
    var suzinvite = options.suzinvite;
    var params = {
      sid: sid,
    };
    if (options.sid) {
      params.sid = options.sid;
    }
    if (options.suzinvite) {
      params.suzinvite = options.suzinvite;
    }
    this.params = params;

    var MetadataQuestionModelWithZinvite = MetadataQuestion.extend(params);

    this.metadataCollection = new MetadataQuestionCollection([], {
      model: MetadataQuestionModelWithZinvite,
      sid: sid
    });
    this.metadataCollection.fetch({
        data: $.param(params),
        processData: true
    });
    this.metadataQuestionsView = this.addChild(new MetadataQuestionsView({
      collection: this.metadataCollection,
      suzinvite: suzinvite,
      sid: sid
    }));
    // this.gatekeeperAuthView = new UserCreateView({
    //   zinvite: zinvite,
    // });
  }
});