import Jreact, { render, Component } from './Jreact'
console.log('Hello World');

class MyComponent extends Component {
  render() {
    return (
      <div>
        <h1>My Component</h1>
        {this.children}
      </div>
    )
  }
}


render(
  <MyComponent id="root" class="class1">
    <div>Hello World</div>
    <div></div>
    <div></div>
  </MyComponent>,
  document.body
)