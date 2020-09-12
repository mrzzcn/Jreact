const RENDER_TO_DOM = Symbol('Render To Dom');

export class Component {
  constructor() {
    this.props = Object.create(null);
    this.children = [];
    this._root = null;
    this._range = null;
  }

  setAttribute(name, value) {
    this.props[name] = value;
  }

  appendChild(component) {
    this.children.push(component);
  }

  [RENDER_TO_DOM](range) {
    this._range = range;
    return this.render()[RENDER_TO_DOM](range)
  }

  rerender() {
    this._range.deleteContents();
    this[RENDER_TO_DOM](this._range);

    // TODO: Range Bug, 未重现
    // const prevRange = this._range;

    // const range = document.createRange();
    // range.setStart(this._range.startContainer, this._range.startOffset);
    // range.setEnd(this._range.startContainer, this._range.startOffset);
    // this[RENDER_TO_DOM](range);

    // prevRange.setStart(range.endContainer, range.endOffset);
    // prevRange.deleteContents();
  }

  setState(newState) {
    if (this.state === null || typeof this.state !== 'object') {
      this.state = newState;
      this.rerender();
      return;
    }

    const merge = (oldState, newState) => {
      for (let key in newState) {
        if (oldState[key] === null || typeof oldState[key] !== 'object') {
          oldState[key] = newState[key];
          continue;
        } else {
          merge(oldState[key], newState[key]);
        }
      }
    }

    merge(this.state, newState);
    this.rerender();
  }

  get vdom() {
    return this.render().vdom
  }

  get vchildren() {
    return this.children.map(child => child.vdom)
  }
}

class ElementWrapper extends Component {
  constructor(type) {
    super(type)
    this.type = type;
  }

  get vdom() {
    // return {
    //   type: this.type,
    //   props: this.props,
    //   children: this.children.map(c => c.vdom)
    // }
    return this;
  }

  [RENDER_TO_DOM](range) {
    range.deleteContents();

    const root = document.createElement(this.type);
    for (let name in this.props) {
      const value = this.props[name];
      if (name.match(/^on([\s\S]+)$/)) {
        root.addEventListener(RegExp.$1.replace(/^[\s\S]/, c => c.toLowerCase()), value)
      } else {
        if (name === 'className') {
          name = 'class'
        }
        root.setAttribute(name, value);
      }
    }
    for (let child of this.children) {
      const childRange = document.createRange();
      childRange.setStart(root, root.childNodes.length);
      childRange.setEnd(root, root.childNodes.length);

      child[RENDER_TO_DOM](childRange);
    }

    range.insertNode(root);
  }
}

class TextWrapper extends Component {
  constructor(content) {
    super(content);
    this.type = '#text';
    this.content = content;
  }

  get vdom() {
    // return {
    //   type: '#text',
    //   content: this.content
    // }
    return this;
  }

  [RENDER_TO_DOM](range) {
    range.deleteContents();
    const root = document.createTextNode(this.content);
    range.insertNode(root);
  }
}


export function createElement(type, attributes, ...children) {
  let element
  if (typeof type === 'string') {
    element = new ElementWrapper(type);
  } else {
    element = new type;
  }
  for (const attr in attributes) {
    element.setAttribute(attr, attributes[attr])
  }
  const insertChildren = (children) => {
    for (let child of children) {
      if (typeof child === 'string' ||
        typeof child === 'number' ||
        typeof child === 'bigint' ||
        typeof child === 'boolean' ||
        typeof child === 'symbol'
      ) {
        child = new TextWrapper(child)
      }
      if (child === null || child === undefined) {
        continue
      }
      if (Array.isArray(child)) {
        insertChildren(child)
      } else {
        element.appendChild(child)
      }
    }
  }
  insertChildren(children)
  return element;
}

export function render(component, parentDom) {
  console.log('rendering', component, parentDom)
  // parentDom.appendChild(component.root)
  const range = document.createRange();
  range.setStart(parentDom, 0);
  range.setStart(parentDom, parentDom.childNodes.length);
  range.deleteContents()
  component[RENDER_TO_DOM](range)
}

const Jreact = { createElement };

export default Jreact;