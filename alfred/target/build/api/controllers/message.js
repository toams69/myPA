"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const api_error_1 = require("error/api-error");
const status_code_1 = require("api/status-code");
function proceedMessage(request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            response.json({ status: { code: status_code_1.StatusCode.OK }, data: { 'msg': 'processing the message' } });
        }
        catch (e) {
            api_error_1.respondWithError('proceedMessage', e, response);
        }
    });
}
module.exports = {
    proceedMessage: proceedMessage
};
//# sourceMappingURL=message.js.map