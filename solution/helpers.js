'use strict';

function attr(name, value) {
    return ' ' + name + '="' + value + '"';
}

function isFunction(obj) {
    return !!(obj && obj.constructor && obj.call && obj.apply);
}

let camelToDashReg = /[A-Z]/g;

let camelToDash = function(str) {

    var strList = str.match(camelToDashReg);
    var letter = strList.length > 1 ? strList[1] : strList[0];

    var index = str.indexOf(letter);

    str = str.toLowerCase();

    return str.substr(0, index) + '-' + str.substr(index);
};

function toHTML(x) {
    // if Array
    if (Array.isArray(x)) {
        return x.map(toHTML).join('');
    }

    if (isFunction(x.tag)) {
        return toHTML(x.tag(x.attrs, x.children));
    }

    if (x.constructor.name === 'VElement') {
        x.dirty = false;
        var html = '<' + x.tag;

        // attrs
        if (x.attrs) {
            Object.keys(x.attrs).forEach((key) => {
                if (key === 'className') {
                    html += attr('class', x.attrs[key])
                } else {
                    html += attr(key, x.attrs[key]);
                }
            });
        }

        // children
        if (x.children !== null) {
            html += '>';
            html += toHTML(x.children);
            html += '</' + x.tag + '>';
        } else {
            html += '/>';
        }
        return html;
    }

    return x;
}

let hookId = "data-id";
let addHookIds = function(vdom, level, index) {
    level = level ? level + '.' : '.';
    index = index || 0;
    level += index;

    if (isFunction(vdom.tag)) {
        let componentVdom = vdom.tag(vdom.attrs, vdom.children);

        vdom.tag = componentVdom.tag;
        vdom.attrs = componentVdom.attrs;
        vdom.children = componentVdom.children;
    }

    if (vdom instanceof Object && !Array.isArray(vdom)) {

        vdom.attrs = vdom.attrs || {};

        if (typeof vdom.attrs[hookId] !== "undefined") {
            level = vdom.attrs[hookId];
        } else {
            vdom.attrs[hookId] = level;
        }
    }

    if (!vdom.children) {
        return vdom;
    }

    if (Array.isArray(vdom.children)) {
        vdom.children.forEach((child, i) => {
            if (child.constructor.name === 'VElement') {
                if (child) {
                   return addHookIds(child, level, i);
                }
            }
        });

        return vdom;
    }

    return addHookIds(vdom.children, level, 0);
};

let toHooks = function(vdom, hooks) {
    hooks = hooks || {};

    if (vdom.attrs && vdom.attrs[hookId] && vdom.events) {
        hooks[vdom.attrs[hookId]] = Object.keys(vdom.events).reduce((hookEvent, key) => {
            hookEvent = {
                eventName : key,
                eventHandler : vdom.events[key]
            };

            return hookEvent;
        }, {});
    }

    if (!vdom.children) {
        return hooks;
    }

    if (Array.isArray(vdom.children)) {
        return vdom.children.reduce((hk, child) => {
            return toHooks(child, hk);
        }, hooks);
    }

    return toHooks(vdom.children, hooks);
};

let attachAttrs = function(vdom, attrs) {
    Object.keys(attrs).forEach((key) => {
        if (key === 'className') {
            vdom.attrs[key] += ' ' + attrs[key];
        } else {
            vdom.attrs[key] = attrs[key];
        }
    });
};

let attachChildren = function(vdom, children) {
    if (!vdom.children) {
        vdom.children = children;
    } else {
        let child = vdom.children;
        do {
            if (child.children) {
                if (!child.children.children) {
                    if (Array.isArray(child.children)) {

                        if (Array.isArray(children)) {
                            child.children.concat(children);
                        } else {
                            child.children.push(children);
                        }

                    } else {
                        child.children = [child.children, children];
                    }
                }

                child = child.children;
            }
        } while(child.children);
    }
};

let match = function(oldVdom, newVdom) {
    if (oldVdom.tag !== newVdom.tag) {
        return false;
    }

    if (oldVdom.attrs) {
        if (!newVdom.attrs) return false;

        return Object.keys(oldVdom.attrs).every((key) => {
            if (key === hookId) {
                return true;
            }

            if (!newVdom.attrs[key]) return false;

            return oldVdom.attrs[key] === newVdom.attrs[key];
        });
    }
};

let merge = function(oldVdom, newVdom) {
    if (!newVdom.children) return;

    if (!(newVdom.children instanceof Object)) {
        if (oldVdom.children !== newVdom.children) {
            oldVdom.children = newVdom.children;
            oldVdom.dirty = true;
        }
    }

    if (Array.isArray(newVdom.children)) {
        return newVdom.children.forEach((child, i) => {
            merge(oldVdom.children[i], child);
        });
    }

    return merge(oldVdom.children, newVdom.children);
};

let findDirty = function(vdom, returnDom) {
    returnDom = returnDom || {};

    if (vdom.dirty === true) {
        let parentNode = vdom.attrs[hookId].slice(0, vdom.attrs[hookId].length - 2);
        parentNode = parentNode === '' ? 'root' : parentNode;

        let parentKeys = Object.keys(returnDom);
        let parentExists = parentKeys.length > 0 ? Object.keys(returnDom).some((parent) => {
            return vdom.attrs[hookId].indexOf(parent) !== -1;
        }) : false;

        if (!parentExists) {
            returnDom[parentNode] = vdom;
        }
    }

    if (vdom.attrs && vdom.attrs[hookId] === '.0' && vdom.dirty === true) {
        return returnDom;
    } else {
        if (!vdom.children) {
            return returnDom;
        }

        if (Array.isArray(vdom.children)) {
            return vdom.children.reduce((returnList, vElem) => {
                return findDirty(vElem, returnList);
            }, returnDom);
        }


        return findDirty(vdom.children, returnDom);
    }
};

module.exports = {
    findDirty,
    isFunction,
    attachChildren,
    attachAttrs,
    addHookIds,
    toHTML,
    toHooks,
    camelToDash,
    match,
    merge,
    hookId
};
