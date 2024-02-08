"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = [
    {
        method: "GET",
        path: "/credentials",
        handler: "googleController.getCredentials",
        config: {
            policies: [],
        },
    },
    {
        method: "POST",
        path: "/credentials/add",
        handler: "googleController.createCredentials",
        config: {
            policies: [],
        },
    },
    {
        method: "POST",
        path: "/auth",
        handler: "googleController.auth",
        config: {
            auth: false,
        },
    },
];
