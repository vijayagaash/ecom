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
      var custName = newRecord.getValue({ fieldId: 'custrecord160' });
      var custEmail = newRecord.getValue({ fieldId: 'custrecord161' });
      var custPassword = newRecord.getValue({ fieldId: 'custrecord162'}) // Static password for demo (replace as needed)

      var postData = {
        cust_name: custName,
        cust_email: custEmail,
        cust_password: custPassword
      };

      var response = https.post({
        url: 'https://3a111751f913.ngrok-free.app/api/customers',
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
