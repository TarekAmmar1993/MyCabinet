
import ReactDOM from "react-dom";
import { BrowserRouter as Router } from "react-router-dom";
import Auth0ProviderWithHistory from "../auth/auth0-provider-with-history";
import App from "./App";
import { RecordsContextProvider } from "../context/context";


ReactDOM.render(
  <RecordsContextProvider>
    <Router>
       <Auth0ProviderWithHistory>
        <App />
      </Auth0ProviderWithHistory>
    </Router>

  </RecordsContextProvider>
  ,
  document.getElementById("root")
);
