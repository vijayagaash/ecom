/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 */
define(['N/https', 'N/log'], function (https, log) {

  function beforeSubmit(context) {
    try {
      if (context.type !== context.UserEventType.CREATE) return;

      var newRecord = context.newRecord;

      // Get field values
      var prodName = newRecord.getValue({ fieldId: 'custrecord163' });
      var prodDesc = newRecord.getValue({ fieldId: 'custrecord164' });
      var prodPrice = newRecord.getValue({ fieldId: 'custrecord165'});
      var prodUrl= newRecord.getValue({ fieldId: 'custrecord166' });

      var postData = {
        name: prodName,
        description: prodDesc,
        price: prodPrice,
        url: prodUrl
      };

      var response = https.post({
        url: 'https://3a111751f913.ngrok-free.app/api/products',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(postData)
      });

      log.debug('API Response Code', response.code);
      log.debug('API Response Body', response.body);

    } catch (e) {
      log.error('Error sending customer to external API', e);
    }
  }

  return {
    beforeSubmit: beforeSubmit
  };
});
