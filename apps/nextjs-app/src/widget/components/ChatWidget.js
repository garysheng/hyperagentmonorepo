"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatWidget = ChatWidget;
/** @jsx h */
const preact_1 = require("preact");
const hooks_1 = require("preact/hooks");
function ChatWidget({ celebrityId, theme }) {
    const [isOpen, setIsOpen] = (0, hooks_1.useState)(false);
    const [messages, setMessages] = (0, hooks_1.useState)([
        {
            type: 'system',
            content: 'Hi! Tell us about your proposal. Please include:\n- Your background\n- Project details\n- Goals and timeline'
        }
    ]);
    const [email, setEmail] = (0, hooks_1.useState)('');
    const [currentMessage, setCurrentMessage] = (0, hooks_1.useState)('');
    const [isSubmitting, setIsSubmitting] = (0, hooks_1.useState)(false);
    const handleSubmit = (e) => __awaiter(this, void 0, void 0, function* () {
        e.preventDefault();
        if (!currentMessage.trim() || isSubmitting)
            return;
        setIsSubmitting(true);
        setMessages(prev => [...prev, { type: 'user', content: currentMessage }]);
        setCurrentMessage('');
        try {
            const payload = {
                celebrityId,
                email,
                message: currentMessage
            };
            console.log('Sending request with payload:', payload);
            const response = yield fetch('/api/widget/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) {
                const contentType = response.headers.get('content-type');
                let errorMessage;
                if (contentType === null || contentType === void 0 ? void 0 : contentType.includes('application/json')) {
                    const errorData = yield response.json();
                    errorMessage = errorData.error || `Request failed with status ${response.status}`;
                }
                else {
                    // Don't include HTML content in error message
                    errorMessage = `Request failed with status ${response.status}`;
                }
                throw new Error(errorMessage);
            }
            setMessages(prev => [
                ...prev,
                {
                    type: 'system',
                    content: 'Thanks for your message! We\'ll review it and get back to you if there\'s a good fit.'
                }
            ]);
        }
        catch (error) {
            console.error('Error sending message:', error);
            setMessages(prev => [
                ...prev,
                {
                    type: 'system',
                    content: error instanceof Error ? error.message : 'Sorry, there was an error sending your message. Please try again.'
                }
            ]);
        }
        finally {
            setIsSubmitting(false);
        }
    });
    const handleEmailChange = (e) => {
        setEmail(e.currentTarget.value);
    };
    const handleMessageChange = (e) => {
        setCurrentMessage(e.currentTarget.value);
    };
    return ((0, preact_1.h)("div", null,
        (0, preact_1.h)("button", { className: "chat-button", onClick: () => setIsOpen(!isOpen), style: {
                backgroundColor: theme.primaryColor,
                transform: 'scaleX(-1)'
            } }, "\uD83D\uDCAC"),
        isOpen && ((0, preact_1.h)("div", { className: "chat-window" },
            (0, preact_1.h)("div", { className: "chat-header" },
                (0, preact_1.h)("h3", null, "Chat with HyperAgent"),
                (0, preact_1.h)("button", { onClick: () => setIsOpen(false) }, "\u2715")),
            (0, preact_1.h)("div", { className: "chat-messages" }, messages.map((msg, i) => ((0, preact_1.h)("div", { key: i, className: `message ${msg.type}` }, msg.content)))),
            (0, preact_1.h)("form", { onSubmit: handleSubmit, className: "chat-form" },
                (0, preact_1.h)("div", { className: `email-input-container ${email ? 'hidden' : ''}` },
                    (0, preact_1.h)("input", { type: "email", placeholder: "Your email", value: email, onChange: handleEmailChange, required: !email })),
                (0, preact_1.h)("div", { className: "message-input" },
                    (0, preact_1.h)("textarea", { placeholder: "Type your message...", value: currentMessage, onChange: handleMessageChange, rows: 3, required: true }),
                    (0, preact_1.h)("button", { type: "submit", disabled: isSubmitting || !email, style: {
                            backgroundColor: theme.primaryColor
                        } }, isSubmitting ? '...' : '→')))))));
}
