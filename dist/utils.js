"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = genHashvalue;
const pattern = "qwilewqerttipoizxcbvnmugbcufw13600289718149";
const length = pattern.length;
function genHashvalue(size) {
    let hash = "";
    for (let i = 0; i < size; i++) {
        hash += pattern[Math.floor(Math.random() * length)];
    }
    return hash;
}
