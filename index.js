console.log('Hello World');

window.Jreact = {
  createElement: (tagName, attributes, ...children) => {
    const element = document.createElement(tagName);
    for (const attr in attributes) {
      element.setAttribute(attr, attributes[attr])
    }
    for (let child of children) {
      if (typeof child === 'string') {
        child = document.createTextNode(child)
      }
      element.appendChild(child)
    }
    return element;
  }
}

document.body.appendChild(<div id="root" class="class1">
  <div>Hello World</div>
  <div></div>
  <div></div>
</div>)