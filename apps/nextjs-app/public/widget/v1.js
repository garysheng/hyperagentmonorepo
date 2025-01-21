"use strict";(()=>{(()=>{let r="/api/widget/bundle.js",s="/api/widget/styles.css",d=document.currentScript,l=d.getAttribute("data-celebrity-id"),c=d.getAttribute("data-primary-color"),t=document.createElement("div");t.id="hyperagent-chat-widget",t.style.cssText="position: fixed; z-index: 9999; bottom: 20px; right: 0;",document.body.appendChild(t);let e=t.attachShadow({mode:"closed"}),n=document.createElement("div");n.innerHTML="Loading chat...",n.className="loading",e.appendChild(n);let i=document.createElement("link");i.rel="stylesheet",i.href=s,e.appendChild(i);let a=document.createElement("style");a.textContent=`
    :host {
      --primary-color: ${c||"#0F172A"};
      display: block;
      width: auto;
      height: auto;
      margin: 0;
      padding: 0;
    }
  `,e.appendChild(a);let o=document.createElement("script");o.src=r,o.onload=()=>{window.HyperAgentWidget.init({container:e,celebrityId:l||"",theme:{primaryColor:c||"#0F172A"}})},document.body.appendChild(o)})();})();
