"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
const src_1 = require("../../src");
const AuditedPerson_1 = require("./AuditedPerson");
let Company = class Company extends src_1.Model {
};
__decorate([
    src_1.property, src_1.length(20), src_1.mock('companyName'),
    __metadata("design:type", String)
], Company.prototype, "name", void 0);
__decorate([
    src_1.property,
    __metadata("design:type", String)
], Company.prototype, "founded", void 0);
__decorate([
    src_1.hasMany(() => AuditedPerson_1.Person),
    __metadata("design:type", Array)
], Company.prototype, "employees", void 0);
Company = __decorate([
    src_1.model({ dbOffset: "authenticated", audit: true })
], Company);
exports.Company = Company;
//# sourceMappingURL=Company.js.map