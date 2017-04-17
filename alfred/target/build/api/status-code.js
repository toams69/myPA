"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var StatusCode;
(function (StatusCode) {
    ///////////////////////////////////////////////////////////
    // Common
    ///////////////////////////////////////////////////////////
    StatusCode[StatusCode["OK"] = 0] = "OK";
    StatusCode[StatusCode["ParameterMissing"] = 1] = "ParameterMissing";
    StatusCode[StatusCode["InvalidParameter"] = 2] = "InvalidParameter";
    StatusCode[StatusCode["Forbidden"] = 3] = "Forbidden";
    StatusCode[StatusCode["InternalError"] = 4] = "InternalError";
    StatusCode[StatusCode["Unauthorized"] = 5] = "Unauthorized";
    StatusCode[StatusCode["ResourceNotFound"] = 6] = "ResourceNotFound";
    StatusCode[StatusCode["PartialResult"] = 7] = "PartialResult";
    ///////////////////////////////////////////////////////////
    // login
    ///////////////////////////////////////////////////////////
    StatusCode[StatusCode["GetTokenFailed"] = 7000] = "GetTokenFailed";
    StatusCode[StatusCode["UsernameNotProvided"] = 7001] = "UsernameNotProvided";
    StatusCode[StatusCode["PasswordNotProvided"] = 7002] = "PasswordNotProvided";
    StatusCode[StatusCode["RedisDown"] = 7003] = "RedisDown";
    StatusCode[StatusCode["ChangePasswordFailed"] = 7004] = "ChangePasswordFailed";
})(StatusCode = exports.StatusCode || (exports.StatusCode = {}));
//# sourceMappingURL=status-code.js.map