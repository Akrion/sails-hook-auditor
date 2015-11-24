/*
 * Audit hook which writes to the ActivityLog for both requests and responses.
 * Note that 
 * The request/response MUST contain an audit object as part of your JSON:

    ... YOUR JSON REQUEST/RESPONSE OBJECT BEGIN...

    audit: {                    
        target: {
            YOUR TARGET DATA
        },
        type: YOUR TYPE // eg: 'SmartExport',
        category: YOUR CATEGORY // eg: 'Status Change',
        data: {
            YOUR DATA
        }
    }

    ... YOUR JSON REQUEST/RESPONSE OBJECT END ...
*/

var _  = require('lodash');

module.exports = function(sails) {
    // Service function to create the actual audit record in the db
    function createAuditModel(req, params){
        var Models = sails.mongols,
            audit  =        _.extend(params, {
            user:           _.get(req, 'user._id', null),
            userProfile:    _.get(req, 'user.profile', null),
            customer:       _.get(req, 'customer._id', null),
            customerName:   _.get(req, 'customer.name', null)
        });

        // Create the audit model
        var model = new Models.ActivityLog(audit);

        model.save();
    }

    return {
        defaults: {
           auditor: {
              auditKey: 'audit',
              clearResponseAuditOnClient: false
           }
        },
        routes: {
            before: {
                '/*': function(req, res, next) {
                    var auditKey = sails.config.auditor.auditKey;

                    // --- REQUESTS ---
                    var requestParameters  = req.allParams();

                    // Check of the audit object exists
                    if (requestParameters[auditKey])        
                        createAuditModel(req, requestParameters[auditKey]);  // Record audit data                    

                    // --- RESPONSES ---
                    var send = res.send;
                    
                    res.send = function() {
                        // Get the audit object from the response
                        var auditObject = _.get(arguments, '0.' + auditKey, null);

                        // Check of the audit object exists
                        if (auditObject) {        
                            createAuditModel(req, auditObject);  // Record audit data

                            if (sails.config.auditor.clearResponseAuditOnClient)
                                if (_.has(arguments, '0.' + auditKey))
                                    delete arguments[0][auditKey];  // _.omit caused weird behavior                                    
                        }
                        return send.apply(res, arguments);
                    };

                    return next();
                }
            }
        }
    };
};
