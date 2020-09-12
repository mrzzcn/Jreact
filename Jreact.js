const RENDER_TO_DOM = Symbol('Render To Dom');

function replaceContent(range, node) {
  range.insertNode(node);
  range.setStartAfter(node);
  range.deleteContents();

  range.setStartBefore(node);
  range.setEndAfter(node);
}

export class Component {
  constructor() {
    this.props = Object.create(null);
    this.children = [];
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
    this._vdom = this.vdom;
    return this._vdom[RENDER_TO_DOM](range)
  }

  update() {
    const isSameNode = (oldNode, newNode) => {
      if (oldNode.type !== newNode.type) {
        return false;
      }
      if (Object.keys(oldNode.props).length !== Object.keys(newNode.props).length) {
        return false;
      }
      for (let name in newNode.props) {
        if (newNode.props[name] !== oldNode.props[name] && !name.match(/^on([\s\S]+)$/)) {
          return false;
        }
      }

      if (newNode.type === '#text' && oldNode.content !== newNode.content) {
        return false
      }
      return true;
    }
    const update = (oldNode, newNode) => {
      // type: 
      // props: 
      // children: 
      // #text: content
      if (!isSameNode(oldNode, newNode)) {
        newNode[RENDER_TO_DOM](oldNode._range);
        return;
      }
      newNode._range = oldNode._range;
      const newVChildren = newNode.vchildren;
      const oldVChildren = oldNode.vchildren;

      if (!newVChildren || !newVChildren.length) {
        return;
      }

      let tailRange;
      if (oldVChildren && oldVChildren.length) {
        tailRange = oldVChildren[oldVChildren.length - 1]._range;
      } else {
        tailRange = document.createRange();
        tailRange.setStart(oldNode._range.startContainer.children[oldNode._range.startOffset], 0);
        tailRange.setEnd(oldNode._range.startContainer.children[oldNode._range.startOffset], 0);
      }

      for (let i = 0; i < newVChildren.length; i++) {
        const newChild = newVChildren[i];
        const oldChild = oldVChildren[i];
        if (i < oldVChildren.length) {
          update(oldChild, newChild);
        } else {
          // Add Node
          const range = document.createRange();
          range.setStart(tailRange.endContainer, tailRange.endOffset);
          range.setEnd(tailRange.endContainer, tailRange.endOffset);

          newChild[RENDER_TO_DOM](range);

          tailRange = range;
        }
      }
    }
    const vdom = this.vdom;
    update(this._vdom, vdom);
    this._vdom = vdom;
  }

  // rerender() {
  //   this._range.deleteContents();
  //   this[RENDER_TO_DOM](this._range);

  //   // TODO: Range Bug, 未重现
  //   // const prevRange = this._range;

  //   // const range = document.createRange();
  //   // range.setStart(this._range.startContainer, this._range.startOffset);
  //   // range.setEnd(this._range.startContainer, this._range.startOffset);
  //   // this[RENDER_TO_DOM](range);

  //   // prevRange.setStart(range.endContainer, range.endOffset);
  //   // prevRange.deleteContents();
  // }

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
    // this.rerender();
    this.update();
  }

  get vdom() {
    return this.render().vdom
  }

}

class ElementWrapper extends Component {
  constructor(type) {
    super(type)
    this.type = type;
    this._range = null;
  }

  get vdom() {
    this.vchildren = this.children.map(c => c.vdom);
    // return {
    //   type: this.type,
    //   props: this.props,
    //   children: this.children.map(c => c.vdom)
    // }
    return this;
  }

  [RENDER_TO_DOM](range) {
    this._range = range;

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
    if (!this.vchildren) {
      this.vchildren = this.children.map(child => child.vdom)
    }
    for (let child of this.vchildren) {
      const childRange = document.createRange();
      childRange.setStart(root, root.childNodes.length);
      childRange.setEnd(root, root.childNodes.length);

      child[RENDER_TO_DOM](childRange);
    }

    replaceContent(range, root);
  }
}

class TextWrapper extends Component {
  constructor(content) {
    super(content);
    this.type = '#text';
    this.content = content;
    this._range = null;
  }

  get vdom() {
    // return {
    //   type: '#text',
    //   content: this.content
    // }
    return this;
  }

  [RENDER_TO_DOM](range) {
    this._range = range;
    const root = document.createTextNode(this.content);
    replaceContent(range, root)
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