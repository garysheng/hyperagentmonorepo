"use strict";(()=>{(()=>{let d="/api/widget/bundle.js",a="/api/widget/styles.css",e=document.currentScript,r=e.getAttribute("data-celebrity-id"),n=document.createElement("div");n.id="hyperagent-chat-widget",document.body.appendChild(n);let t=n.attachShadow({mode:"closed"}),o=document.createElement("div");o.innerHTML="Loading chat...",t.appendChild(o);let i=document.createElement("link");i.rel="stylesheet",i.href=a,t.appendChild(i);let c=document.createElement("script");c.src=d,c.onload=()=>{window.HyperAgentWidget.init({container:t,celebrityId:r,theme:{primaryColor:e.getAttribute("data-primary-color"),position:e.getAttribute("data-position")||"bottom-right"}})},t.appendChild(c)})();})();
