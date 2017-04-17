"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getDurationInMs(startTime) {
    let diff = process.hrtime(startTime);
    return Math.floor((diff[0] * 1e9 + diff[1]) / 1000000);
}
exports.getDurationInMs = getDurationInMs;
//# sourceMappingURL=duration.js.map