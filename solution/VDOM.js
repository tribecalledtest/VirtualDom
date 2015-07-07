let helpers = require('./helpers');

class VDOM {
    // Returning an object represneting the Node
    createElement(tag, attrs, children) {
        if (!tag) throw new Error("Tag is not defined");

        return new VElement(tag, attrs, children);
    }

    // Returning the component that is yet to be rendered
    createClass(displayName, options) {
        if (!displayName) throw new Error("display name was not specified");

        return (attrs, children) => {
            let component = new VClass(displayName, options, attrs, children);

            if (component.setState) {
                return this.setState(component);
            }

            return component.render();
        }
    }

    setState(component) {
        let vDom = component.render();

        // attach the state object on any of the events that are tied to each virtual DOM
        let attachState = (x) => {
            if ((x instanceof Object) && x.events) {
                Object.keys(x.events).forEach((eventKey) => {
                    let func = x.events[eventKey];

                    x.events[eventKey] = (event) => {
                        func.call(component, event);
                        let newVdom = component.render();
                        this.diff(newVdom);
                    }
                });
            }

            if (x.children) {
                if (Array.isArray(x.children)) {
                    return x.children.forEach((child, i) => {
                        attachState(child);
                    });
                }

                attachState(x.children);
            }
        };

        attachState(vDom);
        return vDom;
    }

    attachHooks(hooks, node) {

        // Assign eventhandlers on specified hook
        Object.keys(hooks).forEach((id) => {
            let query = node.querySelector(`[${helpers.hookId}="${id}"]`);

            if (!query["on" + hooks[id].eventName])
                query["on" + hooks[id].eventName] = hooks[id].eventHandler;
        });
    }

    diff(newVDOM) {
        // Find the difference between the existing DOM and new DOM. This function gets invoked whenever
        // eventHandler is triggered
        if (this.vdom) {
            function recurseDiff(x) {
                if (x.constructor.name === 'VElement') {
                    if (helpers.match(x, newVDOM)) {
                        helpers.merge(x, newVDOM);
                    } else {
                        if (Array.isArray(x.children)) {
                            return x.children.forEach((child) => {
                                recurseDiff(child);
                            });
                        }

                        return recurseDiff(x.children);
                    }
                }
            }

            recurseDiff(this.vdom);

            this.render(this.vdom, this.node);
        }
    }


    attachTemplate(template, node) {
        node.innerHTML = template;
    }

    render(vdom, node) {
        if (!node) throw new Error("DOM is not defined");
        this.node = node;

        helpers.addHookIds(vdom);

        // This will return an object with the hook-id as the property
        // and the new information in the virtual dom as the value
        let dirtyDoms = helpers.findDirty(vdom);

        Object.keys(dirtyDoms).forEach((data_key) => {
            let parentNode = data_key === 'root' ? node : node.querySelector(`[data-id="${data_key}"]`);

            let hooks = helpers.toHooks(dirtyDoms[data_key]);
            let htmlTemplate = helpers.toHTML(dirtyDoms[data_key]);

            this.attachTemplate(htmlTemplate, parentNode);

            if (Object.keys(hooks).length) {
                this.attachHooks(hooks, parentNode);
            }
        });

        this.vdom = vdom;
    }


}

class VElement {
    constructor(tag, attrs, children) {
        this.tag = tag;

        this.attrs = null;
        if (attrs) {
            this.attrs = {};
            Object.keys(attrs).forEach((key) => {
                if (key.indexOf('on') !== -1) {
                    this.events = this.events || {};
                    let eventName = key.slice(2).toLowerCase();

                    this.events[eventName] = attrs[key];
                    return;
                }
                this.attrs[key] = attrs[key];
            });
        }

        this.children = null;
        if (children !== undefined) {
            this.children = children;
        }

        this.dirty = true;
    }
}

class VClass {
    constructor(displayName, opt, attrs, children) {
        this.displayName = helpers.camelToDash(displayName);

        if (opt) {
            Object.keys(opt).forEach((key) => {
                this[key] = opt[key];
            });
        }

        this.state = {};

        if (this.setState) {
            this.state = this.setState();
        }

        this.render = () => {
            let vDom = opt.render.call(this);

            vDom.attrs = vDom.attrs || {};
            vDom.attrs.className = vDom.attrs.className ? vDom.attrs.className + ' ' + this.displayName : this.displayName;

            if (attrs) {
                helpers.attachAttrs(vDom, attrs);
            }

            if (children)
                helpers.attachChildren(vDom, children);

            return vDom;
        }
    }
}

module.exports = function() {
    return new VDOM;
};