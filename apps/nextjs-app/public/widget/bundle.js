"use strict";(()=>{var R,v,ae,Pe,x,oe,ue,B,ce,X,J,V,Ne,M={},fe=[],We=/acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i,z=Array.isArray;function S(t,e){for(var _ in e)t[_]=e[_];return t}function G(t){t&&t.parentNode&&t.parentNode.removeChild(t)}function C(t,e,_){var n,i,o,s={};for(o in e)o=="key"?n=e[o]:o=="ref"?i=e[o]:s[o]=e[o];if(arguments.length>2&&(s.children=arguments.length>3?R.call(arguments,2):_),typeof t=="function"&&t.defaultProps!=null)for(o in t.defaultProps)s[o]===void 0&&(s[o]=t.defaultProps[o]);return F(t,s,n,i,null)}function F(t,e,_,n,i){var o={type:t,props:e,key:_,ref:n,__k:null,__:null,__b:0,__e:null,__c:null,constructor:void 0,__v:i==null?++ae:i,__i:-1,__u:0};return i==null&&v.vnode!=null&&v.vnode(o),o}function q(t){return t.children}function I(t,e){this.props=t,this.context=e}function E(t,e){if(e==null)return t.__?E(t.__,t.__i+1):null;for(var _;e<t.__k.length;e++)if((_=t.__k[e])!=null&&_.__e!=null)return _.__e;return typeof t.type=="function"?E(t):null}function pe(t){var e,_;if((t=t.__)!=null&&t.__c!=null){for(t.__e=t.__c.base=null,e=0;e<t.__k.length;e++)if((_=t.__k[e])!=null&&_.__e!=null){t.__e=t.__c.base=_.__e;break}return pe(t)}}function ie(t){(!t.__d&&(t.__d=!0)&&x.push(t)&&!L.__r++||oe!==v.debounceRendering)&&((oe=v.debounceRendering)||ue)(L)}function L(){var t,e,_,n,i,o,s,a;for(x.sort(B);t=x.shift();)t.__d&&(e=x.length,n=void 0,o=(i=(_=t).__v).__e,s=[],a=[],_.__P&&((n=S({},i)).__v=i.__v+1,v.vnode&&v.vnode(n),Y(_.__P,n,i,_.__n,_.__P.namespaceURI,32&i.__u?[o]:null,s,o==null?E(i):o,!!(32&i.__u),a),n.__v=i.__v,n.__.__k[n.__i]=n,me(s,n,a),n.__e!=o&&pe(n)),x.length>e&&x.sort(B));L.__r=0}function he(t,e,_,n,i,o,s,a,u,l,f){var r,p,c,g,y,m,h=n&&n.__k||fe,d=e.length;for(u=Me(_,e,h,u,d),r=0;r<d;r++)(c=_.__k[r])!=null&&(p=c.__i===-1?M:h[c.__i]||M,c.__i=r,m=Y(t,c,p,i,o,s,a,u,l,f),g=c.__e,c.ref&&p.ref!=c.ref&&(p.ref&&K(p.ref,null,c),f.push(c.ref,c.__c||g,c)),y==null&&g!=null&&(y=g),4&c.__u||p.__k===c.__k?u=de(c,u,t):typeof c.type=="function"&&m!==void 0?u=m:g&&(u=g.nextSibling),c.__u&=-7);return _.__e=y,u}function Me(t,e,_,n,i){var o,s,a,u,l,f=_.length,r=f,p=0;for(t.__k=new Array(i),o=0;o<i;o++)(s=e[o])!=null&&typeof s!="boolean"&&typeof s!="function"?(u=o+p,(s=t.__k[o]=typeof s=="string"||typeof s=="number"||typeof s=="bigint"||s.constructor==String?F(null,s,null,null,null):z(s)?F(q,{children:s},null,null,null):s.constructor===void 0&&s.__b>0?F(s.type,s.props,s.key,s.ref?s.ref:null,s.__v):s).__=t,s.__b=t.__b+1,a=null,(l=s.__i=De(s,_,u,r))!==-1&&(r--,(a=_[l])&&(a.__u|=2)),a==null||a.__v===null?(l==-1&&p--,typeof s.type!="function"&&(s.__u|=4)):l!=u&&(l==u-1?p--:l==u+1?p++:(l>u?p--:p++,s.__u|=4))):t.__k[o]=null;if(r)for(o=0;o<f;o++)(a=_[o])!=null&&!(2&a.__u)&&(a.__e==n&&(n=E(a)),ve(a,a));return n}function de(t,e,_){var n,i;if(typeof t.type=="function"){for(n=t.__k,i=0;n&&i<n.length;i++)n[i]&&(n[i].__=t,e=de(n[i],e,_));return e}t.__e!=e&&(e&&t.type&&!_.contains(e)&&(e=E(t)),_.insertBefore(t.__e,e||null),e=t.__e);do e=e&&e.nextSibling;while(e!=null&&e.nodeType==8);return e}function De(t,e,_,n){var i,o,s=t.key,a=t.type,u=e[_];if(u===null||u&&s==u.key&&a===u.type&&!(2&u.__u))return _;if(n>(u!=null&&!(2&u.__u)?1:0))for(i=_-1,o=_+1;i>=0||o<e.length;){if(i>=0){if((u=e[i])&&!(2&u.__u)&&s==u.key&&a===u.type)return i;i--}if(o<e.length){if((u=e[o])&&!(2&u.__u)&&s==u.key&&a===u.type)return o;o++}}return-1}function se(t,e,_){e[0]=="-"?t.setProperty(e,_==null?"":_):t[e]=_==null?"":typeof _!="number"||We.test(e)?_:_+"px"}function A(t,e,_,n,i){var o;e:if(e=="style")if(typeof _=="string")t.style.cssText=_;else{if(typeof n=="string"&&(t.style.cssText=n=""),n)for(e in n)_&&e in _||se(t.style,e,"");if(_)for(e in _)n&&_[e]===n[e]||se(t.style,e,_[e])}else if(e[0]=="o"&&e[1]=="n")o=e!=(e=e.replace(ce,"$1")),e=e.toLowerCase()in t||e=="onFocusOut"||e=="onFocusIn"?e.toLowerCase().slice(2):e.slice(2),t.l||(t.l={}),t.l[e+o]=_,_?n?_.u=n.u:(_.u=X,t.addEventListener(e,o?V:J,o)):t.removeEventListener(e,o?V:J,o);else{if(i=="http://www.w3.org/2000/svg")e=e.replace(/xlink(H|:h)/,"h").replace(/sName$/,"s");else if(e!="width"&&e!="height"&&e!="href"&&e!="list"&&e!="form"&&e!="tabIndex"&&e!="download"&&e!="rowSpan"&&e!="colSpan"&&e!="role"&&e!="popover"&&e in t)try{t[e]=_==null?"":_;break e}catch(s){}typeof _=="function"||(_==null||_===!1&&e[4]!="-"?t.removeAttribute(e):t.setAttribute(e,e=="popover"&&_==1?"":_))}}function le(t){return function(e){if(this.l){var _=this.l[e.type+t];if(e.t==null)e.t=X++;else if(e.t<_.u)return;return _(v.event?v.event(e):e)}}}function Y(t,e,_,n,i,o,s,a,u,l){var f,r,p,c,g,y,m,h,d,P,H,D,N,re,U,$,j,w=e.type;if(e.constructor!==void 0)return null;128&_.__u&&(u=!!(32&_.__u),o=[a=e.__e=_.__e]),(f=v.__b)&&f(e);e:if(typeof w=="function")try{if(h=e.props,d="prototype"in w&&w.prototype.render,P=(f=w.contextType)&&n[f.__c],H=f?P?P.props.value:f.__:n,_.__c?m=(r=e.__c=_.__c).__=r.__E:(d?e.__c=r=new w(h,H):(e.__c=r=new I(h,H),r.constructor=w,r.render=Ae),P&&P.sub(r),r.props=h,r.state||(r.state={}),r.context=H,r.__n=n,p=r.__d=!0,r.__h=[],r._sb=[]),d&&r.__s==null&&(r.__s=r.state),d&&w.getDerivedStateFromProps!=null&&(r.__s==r.state&&(r.__s=S({},r.__s)),S(r.__s,w.getDerivedStateFromProps(h,r.__s))),c=r.props,g=r.state,r.__v=e,p)d&&w.getDerivedStateFromProps==null&&r.componentWillMount!=null&&r.componentWillMount(),d&&r.componentDidMount!=null&&r.__h.push(r.componentDidMount);else{if(d&&w.getDerivedStateFromProps==null&&h!==c&&r.componentWillReceiveProps!=null&&r.componentWillReceiveProps(h,H),!r.__e&&(r.shouldComponentUpdate!=null&&r.shouldComponentUpdate(h,r.__s,H)===!1||e.__v==_.__v)){for(e.__v!=_.__v&&(r.props=h,r.state=r.__s,r.__d=!1),e.__e=_.__e,e.__k=_.__k,e.__k.some(function(W){W&&(W.__=e)}),D=0;D<r._sb.length;D++)r.__h.push(r._sb[D]);r._sb=[],r.__h.length&&s.push(r);break e}r.componentWillUpdate!=null&&r.componentWillUpdate(h,r.__s,H),d&&r.componentDidUpdate!=null&&r.__h.push(function(){r.componentDidUpdate(c,g,y)})}if(r.context=H,r.props=h,r.__P=t,r.__e=!1,N=v.__r,re=0,d){for(r.state=r.__s,r.__d=!1,N&&N(e),f=r.render(r.props,r.state,r.context),U=0;U<r._sb.length;U++)r.__h.push(r._sb[U]);r._sb=[]}else do r.__d=!1,N&&N(e),f=r.render(r.props,r.state,r.context),r.state=r.__s;while(r.__d&&++re<25);r.state=r.__s,r.getChildContext!=null&&(n=S(S({},n),r.getChildContext())),d&&!p&&r.getSnapshotBeforeUpdate!=null&&(y=r.getSnapshotBeforeUpdate(c,g)),a=he(t,z($=f!=null&&f.type===q&&f.key==null?f.props.children:f)?$:[$],e,_,n,i,o,s,a,u,l),r.base=e.__e,e.__u&=-161,r.__h.length&&s.push(r),m&&(r.__E=r.__=null)}catch(W){if(e.__v=null,u||o!=null)if(W.then){for(e.__u|=u?160:128;a&&a.nodeType==8&&a.nextSibling;)a=a.nextSibling;o[o.indexOf(a)]=null,e.__e=a}else for(j=o.length;j--;)G(o[j]);else e.__e=_.__e,e.__k=_.__k;v.__e(W,e,_)}else o==null&&e.__v==_.__v?(e.__k=_.__k,e.__e=_.__e):a=e.__e=Ue(_.__e,e,_,n,i,o,s,u,l);return(f=v.diffed)&&f(e),128&e.__u?void 0:a}function me(t,e,_){for(var n=0;n<_.length;n++)K(_[n],_[++n],_[++n]);v.__c&&v.__c(e,t),t.some(function(i){try{t=i.__h,i.__h=[],t.some(function(o){o.call(i)})}catch(o){v.__e(o,i.__v)}})}function Ue(t,e,_,n,i,o,s,a,u){var l,f,r,p,c,g,y,m=_.props,h=e.props,d=e.type;if(d=="svg"?i="http://www.w3.org/2000/svg":d=="math"?i="http://www.w3.org/1998/Math/MathML":i||(i="http://www.w3.org/1999/xhtml"),o!=null){for(l=0;l<o.length;l++)if((c=o[l])&&"setAttribute"in c==!!d&&(d?c.localName==d:c.nodeType==3)){t=c,o[l]=null;break}}if(t==null){if(d==null)return document.createTextNode(h);t=document.createElementNS(i,d,h.is&&h),a&&(v.__m&&v.__m(e,o),a=!1),o=null}if(d===null)m===h||a&&t.data===h||(t.data=h);else{if(o=o&&R.call(t.childNodes),m=_.props||M,!a&&o!=null)for(m={},l=0;l<t.attributes.length;l++)m[(c=t.attributes[l]).name]=c.value;for(l in m)if(c=m[l],l!="children"){if(l=="dangerouslySetInnerHTML")r=c;else if(!(l in h)){if(l=="value"&&"defaultValue"in h||l=="checked"&&"defaultChecked"in h)continue;A(t,l,null,c,i)}}for(l in h)c=h[l],l=="children"?p=c:l=="dangerouslySetInnerHTML"?f=c:l=="value"?g=c:l=="checked"?y=c:a&&typeof c!="function"||m[l]===c||A(t,l,c,m[l],i);if(f)a||r&&(f.__html===r.__html||f.__html===t.innerHTML)||(t.innerHTML=f.__html),e.__k=[];else if(r&&(t.innerHTML=""),he(t,z(p)?p:[p],e,_,n,d=="foreignObject"?"http://www.w3.org/1999/xhtml":i,o,s,o?o[0]:_.__k&&E(_,0),a,u),o!=null)for(l=o.length;l--;)G(o[l]);a||(l="value",d=="progress"&&g==null?t.removeAttribute("value"):g!==void 0&&(g!==t[l]||d=="progress"&&!g||d=="option"&&g!==m[l])&&A(t,l,g,m[l],i),l="checked",y!==void 0&&y!==t[l]&&A(t,l,y,m[l],i))}return t}function K(t,e,_){try{if(typeof t=="function"){var n=typeof t.__u=="function";n&&t.__u(),n&&e==null||(t.__u=t(e))}else t.current=e}catch(i){v.__e(i,_)}}function ve(t,e,_){var n,i;if(v.unmount&&v.unmount(t),(n=t.ref)&&(n.current&&n.current!==t.__e||K(n,null,e)),(n=t.__c)!=null){if(n.componentWillUnmount)try{n.componentWillUnmount()}catch(o){v.__e(o,e)}n.base=n.__P=null}if(n=t.__k)for(i=0;i<n.length;i++)n[i]&&ve(n[i],e,_||typeof t.type!="function");_||G(t.__e),t.__c=t.__=t.__e=void 0}function Ae(t,e,_){return this.constructor(t,_)}function Q(t,e,_){var n,i,o,s;e==document&&(e=document.documentElement),v.__&&v.__(t,e),i=(n=typeof _=="function")?null:_&&_.__k||e.__k,o=[],s=[],Y(e,t=(!n&&_||e).__k=C(q,null,[t]),i||M,M,e.namespaceURI,!n&&_?[_]:i?null:e.firstChild?R.call(e.childNodes):null,o,!n&&_?_:i?i.__e:e.firstChild,n,s),me(o,t,s)}R=fe.slice,v={__e:function(t,e,_,n){for(var i,o,s;e=e.__;)if((i=e.__c)&&!i.__)try{if((o=i.constructor)&&o.getDerivedStateFromError!=null&&(i.setState(o.getDerivedStateFromError(t)),s=i.__d),i.componentDidCatch!=null&&(i.componentDidCatch(t,n||{}),s=i.__d),s)return i.__E=i}catch(a){t=a}throw t}},ae=0,Pe=function(t){return t!=null&&t.constructor==null},I.prototype.setState=function(t,e){var _;_=this.__s!=null&&this.__s!==this.state?this.__s:this.__s=S({},this.state),typeof t=="function"&&(t=t(S({},_),this.props)),t&&S(_,t),t!=null&&this.__v&&(e&&this._sb.push(e),ie(this))},I.prototype.forceUpdate=function(t){this.__v&&(this.__e=!0,t&&this.__h.push(t),ie(this))},I.prototype.render=q,x=[],ue=typeof Promise=="function"?Promise.prototype.then.bind(Promise.resolve()):setTimeout,B=function(t,e){return t.__v.__b-e.__v.__b},L.__r=0,ce=/(PointerCapture)$|Capture$/i,X=0,J=le(!1),V=le(!0),Ne=0;var ee,b,Z,ge,te=0,xe=[],k=v,ye=k.__b,be=k.__r,ke=k.diffed,Ce=k.__c,we=k.unmount,He=k.__;function Fe(t,e){k.__h&&k.__h(b,t,te||e),te=0;var _=b.__H||(b.__H={__:[],__h:[]});return t>=_.__.length&&_.__.push({}),_.__[t]}function T(t){return te=1,Ie(Ee,t)}function Ie(t,e,_){var n=Fe(ee++,2);if(n.t=t,!n.__c&&(n.__=[_?_(e):Ee(void 0,e),function(a){var u=n.__N?n.__N[0]:n.__[0],l=n.t(u,a);u!==l&&(n.__N=[l,n.__[1]],n.__c.setState({}))}],n.__c=b,!b.u)){var i=function(a,u,l){if(!n.__c.__H)return!0;var f=n.__c.__H.__.filter(function(p){return!!p.__c});if(f.every(function(p){return!p.__N}))return!o||o.call(this,a,u,l);var r=n.__c.props!==a;return f.forEach(function(p){if(p.__N){var c=p.__[0];p.__=p.__N,p.__N=void 0,c!==p.__[0]&&(r=!0)}}),o&&o.call(this,a,u,l)||r};b.u=!0;var o=b.shouldComponentUpdate,s=b.componentWillUpdate;b.componentWillUpdate=function(a,u,l){if(this.__e){var f=o;o=void 0,i(a,u,l),o=f}s&&s.call(this,a,u,l)},b.shouldComponentUpdate=i}return n.__N||n.__}function Le(){for(var t;t=xe.shift();)if(t.__P&&t.__H)try{t.__H.__h.forEach(O),t.__H.__h.forEach(_e),t.__H.__h=[]}catch(e){t.__H.__h=[],k.__e(e,t.__v)}}k.__b=function(t){b=null,ye&&ye(t)},k.__=function(t,e){t&&e.__k&&e.__k.__m&&(t.__m=e.__k.__m),He&&He(t,e)},k.__r=function(t){be&&be(t),ee=0;var e=(b=t.__c).__H;e&&(Z===b?(e.__h=[],b.__h=[],e.__.forEach(function(_){_.__N&&(_.__=_.__N),_.i=_.__N=void 0})):(e.__h.forEach(O),e.__h.forEach(_e),e.__h=[],ee=0)),Z=b},k.diffed=function(t){ke&&ke(t);var e=t.__c;e&&e.__H&&(e.__H.__h.length&&(xe.push(e)!==1&&ge===k.requestAnimationFrame||((ge=k.requestAnimationFrame)||Re)(Le)),e.__H.__.forEach(function(_){_.i&&(_.__H=_.i),_.i=void 0})),Z=b=null},k.__c=function(t,e){e.some(function(_){try{_.__h.forEach(O),_.__h=_.__h.filter(function(n){return!n.__||_e(n)})}catch(n){e.some(function(i){i.__h&&(i.__h=[])}),e=[],k.__e(n,_.__v)}}),Ce&&Ce(t,e)},k.unmount=function(t){we&&we(t);var e,_=t.__c;_&&_.__H&&(_.__H.__.forEach(function(n){try{O(n)}catch(i){e=i}}),_.__H=void 0,e&&k.__e(e,_.__v))};var Se=typeof requestAnimationFrame=="function";function Re(t){var e,_=function(){clearTimeout(n),Se&&cancelAnimationFrame(e),setTimeout(t)},n=setTimeout(_,100);Se&&(e=requestAnimationFrame(_))}function O(t){var e=b,_=t.__c;typeof _=="function"&&(t.__c=void 0,_()),b=e}function _e(t){var e=b;t.__c=t.__(),b=e}function Ee(t,e){return typeof e=="function"?e(t):e}function Te({celebrityId:t,theme:e}){let[_,n]=T(!1),[i,o]=T([{type:"system",content:`Hi! Tell us about your proposal. Please include:
- Your background
- Project details
- Goals and timeline`}]),[s,a]=T(""),[u,l]=T(""),[f,r]=T(!1),p=async y=>{if(y.preventDefault(),!(!u.trim()||f)){r(!0),o(m=>[...m,{type:"user",content:u}]),l("");try{let m={celebrityId:t,email:s,message:u};console.log("Sending request with payload:",m);let h=await fetch("/api/widget/submit",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(m,null,2)});if(!h.ok){let d=await h.json();throw console.error("Request failed:",{status:h.status,statusText:h.statusText,error:d}),new Error(`Failed to send message: ${d.error}`)}o(d=>[...d,{type:"system",content:"Thanks for your message! We'll review it and get back to you soon."}])}catch(m){o(h=>[...h,{type:"system",content:"Sorry, there was an error sending your message. Please try again: "+m}])}finally{r(!1)}}},c=y=>{a(y.currentTarget.value)},g=y=>{l(y.currentTarget.value)};return C("div",null,C("button",{className:"chat-button",onClick:()=>n(!_),style:{backgroundColor:e.primaryColor,transform:"scaleX(-1)"}},"\u{1F4AC}"),_&&C("div",{className:"chat-window"},C("div",{className:"chat-header"},C("h3",null,"Chat with HyperAgent"),C("button",{onClick:()=>n(!1)},"\u2715")),C("div",{className:"chat-messages"},i.map((y,m)=>C("div",{key:m,className:`message ${y.type}`},y.content))),C("form",{onSubmit:p,className:"chat-form"},!s&&C("input",{type:"email",placeholder:"Your email",value:s,onChange:c,required:!0}),C("div",{className:"message-input"},C("textarea",{placeholder:"Type your message...",value:u,onChange:g,rows:3,required:!0}),C("button",{type:"submit",disabled:f||!s,style:{backgroundColor:e.primaryColor}},f?"...":"\u2192")))))}var ne=class{init(e){this.config=e,this.root=document.createElement("div"),this.config.container.appendChild(this.root),console.log("Widget config:",e),Q(C(Te,{celebrityId:this.config.celebrityId,theme:this.config.theme}),this.root)}destroy(){this.root&&Q(null,this.root)}};window.HyperAgentWidget=new ne;})();
