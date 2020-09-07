const RENDER_TO_DOM = Symbol('render to dom');

export class Component {
    constructor() {
        this.props = Object.create(null);
        this.children = [];
        this._root = null;
    }
    setAttribute(key, value) {
        this.props[key] = value;
    }
    appendChild(comp) {
        this.children.push(comp)
    }
    [RENDER_TO_DOM](dom_range) {
        this.render()[RENDER_TO_DOM](dom_range);
    }
}

export class Fragment {
    constructor() {
        this.key;
        this._childs = [];
    }
    setAttribute(key, value) {
        if (key !== "key") return;
        this.key = value;
    }
    appendChild(comp) {
        this._childs.push(comp)
    }
    [RENDER_TO_DOM](dom_range) {
        return this._childs.map(c => {
            c[RENDER_TO_DOM](dom_range);
            dom_range.collapse();
        });
    }
}

class ElementWrapper {
    constructor(tagName) {
        this.root = document.createElement(tagName);
    }
    setAttribute(key, value) {
        this.root.setAttribute(key, value);
    }
    appendChild(comp) {
        let range = document.createRange();
        range.setStart(this.root, this.root.childNodes.length);
        range.setEnd(this.root, this.root.childNodes.length);
        comp[RENDER_TO_DOM](range);
    }
    [RENDER_TO_DOM](dom_range) {
        dom_range.deleteContents();
        dom_range.insertNode(this.root);
    }
}

class TextWrapper {
    constructor(text) {
        this.root = document.createTextNode(text);
    }
    [RENDER_TO_DOM](dom_range) {
        dom_range.deleteContents();
        dom_range.insertNode(this.root);
    }
}

export function createElement(type, attrs, ...childs) {
    let e;
    if (typeof type === "string") {
        e = new ElementWrapper(type);
    }
    else {
        e = new type;
    }

    for (let p in attrs) {
        e.setAttribute(p, attrs[p]);
    }

    let insertChilds = (childs) => {
        for (let child of childs) {
            if (child === void 0 || child === null) {
                continue;
            }
            if (typeof child === "string") {
                child = new TextWrapper(child);
            }
            if (typeof child == "object" && child instanceof Array) {
                insertChilds(child);
            }
            else e.appendChild(child);
        }
    }
    insertChilds(childs);
    return e;
}

export function render(component, parentElement) {
    let range = document.createRange();
    range.setStart(parentElement, 0);
    range.setEnd(parentElement, parentElement.childNodes.length);
    range.deleteContents();
    component[RENDER_TO_DOM](range)
}