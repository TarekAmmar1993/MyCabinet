import {Switch } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { NavBar,Loading } from "../components";
import ProtectedRoute from "../auth/protected-route";
import "./app.scss";
import Patient from "../views/Patient";
import Records from "../views/records";

const App = () => {
   const { isLoading } = useAuth0();

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div id="app" className="d-flex flex-column h-100">
      <NavBar />
      <div className="container flex-grow-1">
        <Switch>
          <ProtectedRoute path="/" exact component={Patient} />
          <ProtectedRoute path="/records" component={Records} />
        </Switch>
      </div>
    </div>
  );
};

export default App;
