import Jreact, { render, Component } from './Jreact'
console.log('Hello World');

class MyComponent extends Component {
  constructor(props) {
    super();
    this.state = {
      hello: 'Jack',
      a: 1,
      b: 2
    }
  }

  render() {
    return (
      <div>
        <h1>My Component: {this.state.hello}</h1>
        <p>
          count: {this.state.a} | b: {this.state.b}
        </p>
        <button onclick={() => { this.setState({ a: this.state.a + 1 }) }}>
          Increase
        </button>
        <hr />
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