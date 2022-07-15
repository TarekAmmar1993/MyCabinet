import {NavLink} from "react-router-dom";
import React from "react";

const MainNav = () => (
  <div className="navbar-nav mr-auto">
    <NavLink
      to="/"
      exact
      className="nav-link"
      activeClassName="router-link-exact-active"
    >
      Patient
    </NavLink>
    <NavLink
      to="/records"
      exact
      className="nav-link"
      activeClassName="router-link-exact-active"
    >
      Records
    </NavLink>

  </div>
);

export default MainNav;
