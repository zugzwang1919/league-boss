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
var core_1 = require('@angular/core');
var user_service_service_1 = require('./user-service.service');
var AppComponent = (function () {
    function AppComponent(userService) {
        this.userService = userService;
    }
    AppComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.userService.getUsers().
            then(function (users) {
            _this.users = users;
            _this.userService.getUser(1).then(function (user) {
                _this.selectedUser = user;
                _this.displayedId = String(_this.selectedUser.id);
            });
        });
    };
    AppComponent.prototype.setSelectedUserData = function () {
        var _this = this;
        console.log("Looking for user id = " + this.displayedId);
        this.userService.getUser(Number(this.displayedId)).then(function (user) {
            if (user == null) {
                console.log("user id " + _this.displayedId + " was not found.");
                alert("That user could not be found.");
                // reset the displayedId if the specified id could not be found.
                _this.displayedId = String(_this.selectedUser.id);
            }
            else {
                _this.selectedUser = user;
                _this.displayedId = String(_this.selectedUser.id);
            }
        });
    };
    AppComponent = __decorate([
        core_1.Component({
            selector: 'my-app',
            template: "\n    <div *ngIf=\"displayedId\">\n      <label> Select a User by Id: </label>\n      <input [(ngModel)]=\"displayedId\" placeholder=\"id\" (blur)=\"setSelectedUserData()\" (keyup.enter)=\"setSelectedUserData()\"/>\n    <div>\n    <my-user-detail [user]=\"selectedUser\"></my-user-detail>\n    "
        }), 
        __metadata('design:paramtypes', [user_service_service_1.UserService])
    ], AppComponent);
    return AppComponent;
}());
exports.AppComponent = AppComponent;
//# sourceMappingURL=app.component.js.map