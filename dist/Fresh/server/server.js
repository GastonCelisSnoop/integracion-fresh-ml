const handleExternalEvent = require('./handlers/externalEventHandler');
const handlerConversation = require('./handlers/conversationHandler')
const handlerConversationUpdate = require('./handlers/conversationUpdateHandler')

exports = {
  onConversationCreate: function(event) {
    handlerConversation(event);
  },

  onConversationUpdate: function(event) {
    handlerConversationUpdate(event)
  },
  
  onExternalEventHandler: function(event) {
    handleExternalEvent(event);
  },

  onAppInstallCallback: function(){
    generateTargetUrl().done(function (targetUrl) {
      renderData(null, { message: targetUrl });
      console.info("Url Webhook: " + targetUrl);
    });
  }
};