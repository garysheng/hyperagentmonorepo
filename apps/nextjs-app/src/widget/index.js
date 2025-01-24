"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/** @jsx h */
const preact_1 = require("preact");
const ChatWidget_1 = require("./components/ChatWidget");
class HyperAgentWidget {
    init(config) {
        this.config = config;
        this.root = document.createElement('div');
        this.config.container.appendChild(this.root);
        console.log('Widget config:', config);
        (0, preact_1.render)((0, preact_1.h)(ChatWidget_1.ChatWidget, { celebrityId: this.config.celebrityId, theme: this.config.theme }), this.root);
    }
    destroy() {
        if (this.root) {
            (0, preact_1.render)(null, this.root);
        }
    }
}
// Expose to global scope
window.HyperAgentWidget = new HyperAgentWidget();
