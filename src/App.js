import React, { Component} from "react";
import {hot} from "react-hot-loader";
import "./App.css";

function formatName(user) {
  return user.firstName + ' ' + user.lastName;
}

const user = {
  firstName: 'Nishit',
  lastName: 'Kumar'
};

class App extends Component{
  render(){
    return(
      <div className="App">
        <h1> Hello, {formatName(user)}! </h1>
      </div>
    );
  }
}

export default hot(module)(App);