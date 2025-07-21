/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @description Enhanced NetSuite Sales Order Integration Script
 */
define(['N/https', 'N/log', 'N/search', 'N/record'], function (https, log, search, record) {

    function afterSubmit(context) {
        try {
            if (context.type !== context.UserEventType.CREATE) return;

            var newRecord = context.newRecord;
            var recordId = newRecord.id;

            // Get sales order details
            var salesOrderData = getSalesOrderData(recordId);
            
            if (salesOrderData) {
                // Send sales order to external API
                sendSalesOrderToExternalAPI(salesOrderData);
            }

        } catch (e) {
            log.error('Error in sales order processing', e);
        }
    }

    /**
     * Get sales order data
     */
    function getSalesOrderData(salesOrderId) {
        try {
            var salesOrderRecord = record.load({
                type: record.Type.SALES_ORDER,
                id: salesOrderId
            });

            // Get header information
            var customerId = salesOrderRecord.getValue({ fieldId: 'entity' });
            var tranId = salesOrderRecord.getValue({ fieldId: 'tranid' });
            var tranDate = salesOrderRecord.getValue({ fieldId: 'trandate' });
            var total = salesOrderRecord.getValue({ fieldId: 'total' });
            var status = salesOrderRecord.getText({ fieldId: 'status' });
            var memo = salesOrderRecord.getValue({ fieldId: 'memo' });

            // Get customer information
            var customerData = getCustomerData(customerId);

            // Get line items
            var lineItems = [];
            var lineCount = salesOrderRecord.getLineCount({ sublistId: 'item' });
            
            for (var i = 0; i < lineCount; i++) {
                var item = {
                    item: salesOrderRecord.getSublistText({ sublistId: 'item', fieldId: 'item', line: i }),
                    description: salesOrderRecord.getSublistValue({ sublistId: 'item', fieldId: 'description', line: i }),
                    quantity: salesOrderRecord.getSublistValue({ sublistId: 'item', fieldId: 'quantity', line: i }),
                    rate: salesOrderRecord.getSublistValue({ sublistId: 'item', fieldId: 'rate', line: i }),
                    amount: salesOrderRecord.getSublistValue({ sublistId: 'item', fieldId: 'amount', line: i })
                };
                lineItems.push(item);
            }

            // Get shipping address
            var shippingAddress = getShippingAddress(salesOrderRecord);

            return {
                netsuite_sales_order_id: salesOrderId,
                transaction_id: tranId,
                customer: customerData,
                order_date: tranDate,
                total_amount: total,
                status: status,
                memo: memo,
                line_items: lineItems,
                shipping_address: shippingAddress,
                action: 'sales_order_created'
            };

        } catch (e) {
            log.error('Error getting sales order data', e);
            return null;
        }
    }

    /**
     * Get customer data
     */
    function getCustomerData(customerId) {
        try {
            var customerRecord = record.load({
                type: record.Type.CUSTOMER,
                id: customerId
            });

            return {
                netsuite_id: customerId,
                name: customerRecord.getValue({ fieldId: 'companyname' }) || 
                      (customerRecord.getValue({ fieldId: 'firstname' }) + ' ' + 
                       customerRecord.getValue({ fieldId: 'lastname' })),
                email: customerRecord.getValue({ fieldId: 'email' }),
                phone: customerRecord.getValue({ fieldId: 'phone' })
            };

        } catch (e) {
            log.error('Error getting customer data', e);
            return null;
        }
    }

    /**
     * Get shipping address
     */
    function getShippingAddress(salesOrderRecord) {
        try {
            var shippingAddressId = salesOrderRecord.getValue({ fieldId: 'shipaddresslist' });
            
            if (shippingAddressId) {
                // Get address details from the customer record
                var customerId = salesOrderRecord.getValue({ fieldId: 'entity' });
                var customerRecord = record.load({
                    type: record.Type.CUSTOMER,
                    id: customerId
                });

                var addressCount = customerRecord.getLineCount({ sublistId: 'addressbook' });
                for (var i = 0; i < addressCount; i++) {
                    var addressSubrecord = customerRecord.getSublistSubrecord({
                        sublistId: 'addressbook',
                        fieldId: 'addressbookaddress',
                        line: i
                    });

                    if (addressSubrecord) {
                        return {
                            addr1: addressSubrecord.getValue({ fieldId: 'addr1' }),
                            addr2: addressSubrecord.getValue({ fieldId: 'addr2' }),
                            city: addressSubrecord.getValue({ fieldId: 'city' }),
                            state: addressSubrecord.getValue({ fieldId: 'state' }),
                            zip: addressSubrecord.getValue({ fieldId: 'zip' }),
                            country: addressSubrecord.getValue({ fieldId: 'country' })
                        };
                    }
                }
            }

            return null;

        } catch (e) {
            log.error('Error getting shipping address', e);
            return null;
        }
    }

    /**
     * Send sales order to external API
     */
    function sendSalesOrderToExternalAPI(salesOrderData) {
        try {
            var response = https.post({
                url: 'https://3a111751f913.ngrok-free.app/api/orders/netsuite-sync',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer your-api-token' // Add authentication if needed
                },
                body: JSON.stringify(salesOrderData)
            });

            log.debug('API Response Code', response.code);
            log.debug('API Response Body', response.body);

            if (response.code >= 200 && response.code < 300) {
                log.audit('Sales Order Sync Success', 'Sales order successfully synced with external system');
            } else {
                log.error('Sales Order Sync Failed', 'Failed to sync sales order. Response: ' + response.body);
            }

        } catch (e) {
            log.error('Error sending sales order to external API', e);
        }
    }

    return {
        afterSubmit: afterSubmit
    };
});
