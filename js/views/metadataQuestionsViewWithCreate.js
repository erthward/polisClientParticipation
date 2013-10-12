define([
  'models/metadataQuestion',
  'views/metadataQuestionAndAnswersViewWithCreate',
  'views/metadataQuestionsView',
], function (
  MetadataQuestion,
  MetadataQuestionAndAnswersViewWithCreate,
  MetadataQuestionsView
) {
  return MetadataQuestionsView.extend({
    name: 'metadataQuestionsViewWithCreate',
    itemView: MetadataQuestionAndAnswersViewWithCreate,
    allowCreate: true,
    events: {
      "blur .add_question_form": "hideAddQuestionForm"
    },
    hideAddQuestionForm: function() {
      var that = this;
      var formAction = $(event.target).data('action');
      this.serialize(function(attrs){

        // Make sure the form isn't empty.
        if (attrs.questionInput && attrs.questionInput.length) {
          var data = {
            zid: that.zid,
            key: attrs.questionInput,
          };
          var model = new MetadataQuestion(data);
          model.save().then(that.collection.fetch({
            data: $.param({
              zid: that.zid
            }), 
            processData: true,
          }));
        }
        that.formActive = false;
        that.render();
      });
    },
    showAddQuestionForm: function() {
      this.formActive = true;
      this.render();
    },
});
});