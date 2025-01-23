"use strict";(()=>{(()=>{let l="/api/widget/bundle.js",s="/api/widget/styles.css",t=document.currentScript,r=t.getAttribute("data-celebrity-id"),o=t.getAttribute("data-primary-color");if(console.log("Widget initialization:",{celebrityId:r,primaryColor:o,scriptAttributes:{"data-celebrity-id":t.getAttribute("data-celebrity-id"),"data-primary-color":t.getAttribute("data-primary-color")}}),!r){console.error("Widget Error: Missing data-celebrity-id attribute");return}let e=document.createElement("div");e.id="hyperagent-chat-widget",e.style.cssText="position: fixed; z-index: 9999; bottom: 20px; right: 0;",document.body.appendChild(e);let i=e.attachShadow({mode:"closed"}),n=document.createElement("div");n.innerHTML="Loading chat...",n.className="loading",i.appendChild(n);let d=document.createElement("link");d.rel="stylesheet",d.href=s,i.appendChild(d);let c=document.createElement("style");c.textContent=`
    :host {
      --primary-color: ${o||"#0F172A"};
      display: block;
      width: auto;
      height: auto;
      margin: 0;
      padding: 0;
    }
  `,i.appendChild(c);let a=document.createElement("script");a.src=l,a.onload=()=>{window.HyperAgentWidget.init({container:i,celebrityId:r||"",theme:{primaryColor:o||"#0F172A"}})},document.body.appendChild(a)})();})();
