"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function padRight(s, width) {
    try {
        if (width - s.length + 1 <= 0) {
            return s;
        }
        else {
            return s + Array(width - s.length + 1).join(' ');
        }
    }
    catch (e) {
        return s;
    }
}
exports.padRight = padRight;
//# sourceMappingURL=log-utils.js.map