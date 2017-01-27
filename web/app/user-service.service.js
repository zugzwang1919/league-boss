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
var http_1 = require('@angular/http');
require('rxjs/add/operator/toPromise');
var mock_users_1 = require('./mock-users');
var UserService = (function () {
    function UserService(http) {
        this.http = http;
    }
    UserService.prototype.getUsers = function () {
        return Promise.resolve(mock_users_1.USERS);
    };
    UserService.prototype.getUsersSlowly = function () {
        var _this = this;
        return new Promise(function (resolve) {
            // Simulate server latency with 5 second delay
            setTimeout(function () { return resolve(_this.getUsers()); }, 5000);
        });
    };
    UserService.prototype.getUser = function (id) {
        var _this = this;
        console.log("Looking for User with an id of " + id);
        //return Promise.resolve(this.buildUserFromHttpResponse(undefined));
        return new Promise(function (resolve) {
            _this.http.get('http://localhost:1919/user/' + id)
                .toPromise()
                .then(function (res) { return resolve(_this.buildUserFromHttpResponse(id, res)); })
                .catch(function (error) { return resolve(null); });
        });
    };
    UserService.prototype.buildUserFromHttpResponse = function (id, res) {
        if (res.ok === false) {
            console.log("Yuck!  Looks like that did not work.  We were trying to retrieve a user id of " + id);
            console.log("We received a status code of " + res.status);
            return null;
        }
        else {
            console.log("Successfully found user id " + id);
            var u = res.json();
            return u;
        }
    };
    UserService = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [http_1.Http])
    ], UserService);
    return UserService;
}());
exports.UserService = UserService;
//# sourceMappingURL=user-service.service.js.map