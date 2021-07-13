import './App.css';
import Home from "./pages/Home"
import {BrowserRouter as Router,
Switch,
Route,
Link
} from "react-router-dom";

function App() {
  return (
    <div >
     <Router>
      <div>
        {/* <nav>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/account">Account</Link>
            </li>
          </ul>
        </nav> */}

        {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
        <Switch>
          <Route path="/account">
            <Account />
          </Route>
          <Route path="/">
            <Home />
          </Route>
        </Switch>
      </div>
    </Router>
            
    </div>
  );
}


function Account() {
  return <h2>Account</h2>;
}

export default App;
