/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @description Enhanced NetSuite Customer Integration Script
 */
define(['N/https', 'N/log', 'N/search', 'N/record'], function (https, log, search, record) {

    function beforeSubmit(context) {
        try {
            if (context.type !== context.UserEventType.CREATE) return;

            var newRecord = context.newRecord;

            // Get field values
            var custName = newRecord.getValue({ fieldId: 'custrecord160' });
            var custEmail = newRecord.getValue({ fieldId: 'custrecord161' });
            var custPassword = newRecord.getValue({ fieldId: 'custrecord162' });
            var custPhone = newRecord.getValue({ fieldId: 'custrecord163' }) || '';
            var custAddress = newRecord.getValue({ fieldId: 'custrecord164' }) || '';

            // Validate required fields
            if (!custName || !custEmail) {
                log.error('Missing Required Fields', 'Customer name and email are required');
                return;
            }

            // Check if customer already exists in NetSuite
            var existingCustomer = findExistingCustomer(custEmail);
            if (existingCustomer) {
                log.debug('Customer Already Exists', 'Customer with email ' + custEmail + ' already exists with ID: ' + existingCustomer);
                
                // Send existing customer info to external API
                sendCustomerToExternalAPI({
                    cust_name: custName,
                    cust_email: custEmail,
                    cust_password: custPassword,
                    cust_phone: custPhone,
                    cust_address: custAddress,
                    netsuite_customer_id: existingCustomer,
                    action: 'existing_customer'
                });
                return;
            }

            // Create new customer in NetSuite
            var customerId = createNetSuiteCustomer({
                name: custName,
                email: custEmail,
                phone: custPhone,
                address: custAddress
            });

            if (customerId) {
                log.debug('Customer Created', 'New customer created with ID: ' + customerId);
                
                // Send new customer info to external API
                sendCustomerToExternalAPI({
                    cust_name: custName,
                    cust_email: custEmail,
                    cust_password: custPassword,
                    cust_phone: custPhone,
                    cust_address: custAddress,
                    netsuite_customer_id: customerId,
                    action: 'new_customer'
                });
            }

        } catch (e) {
            log.error('Error in customer processing', e);
        }
    }

    /**
     * Find existing customer by email
     */
    function findExistingCustomer(email) {
        try {
            var customerSearch = search.create({
                type: search.Type.CUSTOMER,
                filters: [
                    ['email', 'is', email]
                ],
                columns: ['internalid']
            });

            var searchResult = customerSearch.run().getRange({ start: 0, end: 1 });
            
            if (searchResult && searchResult.length > 0) {
                return searchResult[0].getValue('internalid');
            }
            
            return null;
        } catch (e) {
            log.error('Error finding existing customer', e);
            return null;
        }
    }

    /**
     * Create new customer in NetSuite
     */
    function createNetSuiteCustomer(customerData) {
        try {
            var customerRecord = record.create({
                type: record.Type.CUSTOMER
            });

            // Split name into first and last name
            var nameParts = customerData.name.split(' ');
            var firstName = nameParts[0] || '';
            var lastName = nameParts.slice(1).join(' ') || '';

            customerRecord.setValue({ fieldId: 'firstname', value: firstName });
            customerRecord.setValue({ fieldId: 'lastname', value: lastName });
            customerRecord.setValue({ fieldId: 'companyname', value: customerData.name });
            customerRecord.setValue({ fieldId: 'email', value: customerData.email });
            customerRecord.setValue({ fieldId: 'phone', value: customerData.phone });
            customerRecord.setValue({ fieldId: 'isperson', value: true });

            // Add address if provided
            if (customerData.address) {
                customerRecord.setSublistValue({
                    sublistId: 'addressbook',
                    fieldId: 'addr1',
                    line: 0,
                    value: customerData.address
                });
                customerRecord.setSublistValue({
                    sublistId: 'addressbook',
                    fieldId: 'defaultshipping',
                    line: 0,
                    value: true
                });
                customerRecord.setSublistValue({
                    sublistId: 'addressbook',
                    fieldId: 'defaultbilling',
                    line: 0,
                    value: true
                });
            }

            var customerId = customerRecord.save();
            return customerId;

        } catch (e) {
            log.error('Error creating NetSuite customer', e);
            return null;
        }
    }

    /**
     * Send customer data to external API
     */
    function sendCustomerToExternalAPI(postData) {
        try {
            var response = https.post({
                url: 'https://3a111751f913.ngrok-free.app/api/customers/netsuite-sync',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer your-api-token' // Add authentication if needed
                },
                body: JSON.stringify(postData)
            });

            log.debug('API Response Code', response.code);
            log.debug('API Response Body', response.body);

            if (response.code >= 200 && response.code < 300) {
                log.audit('Customer Sync Success', 'Customer successfully synced with external system');
            } else {
                log.error('Customer Sync Failed', 'Failed to sync customer. Response: ' + response.body);
            }

        } catch (e) {
            log.error('Error sending customer to external API', e);
        }
    }

    return {
        beforeSubmit: beforeSubmit
    };
});
