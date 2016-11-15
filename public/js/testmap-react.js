ReactDOM.render(
  React.DOM.h1(
    {id: "my-heading"},
    React.DOM.span(null,
      React.DOM.em(null, "Hell"),
      "o"
    ),
    " world!"
  ),
  document.getElementById('app')
);
