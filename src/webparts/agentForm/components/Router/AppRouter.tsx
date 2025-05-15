import * as React from "react";
import { Component } from "react";
import { Router, Route, IndexRoute, hashHistory } from "react-router";
import AgentForm from "../AgentForm";
import { Layout } from "../Layout/Layout";
import Cart from "../Cart/Cart";
export default class AppRouter extends Component<any, any> {
  public render() {
    return (
      <Router history={hashHistory}>
        <Route path="/" component={Layout}>
          <IndexRoute component={AgentForm} />
          <Route path="cart" component={Cart} />
        </Route>
      </Router>
    );
  }
}
