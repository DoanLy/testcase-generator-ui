import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import "./App.css";
import FileUpload from "./components/FileUpload";
import Sidebar from "./components/Sidebar";
import NotFound from "./components/NotFound";
import { TitleProvider, useTitle } from "./context/TitleContext";

const AppContent: React.FC = () => {
  const { title } = useTitle();

  return (
    <div className="App">
      <header className="App-header">
        <h1>{title}</h1>
      </header>
      <div className="app-container">
        <Sidebar />
        <div className="main-content">
          <Switch>
            <Route path="/upload" component={FileUpload} />
            <Route
              path="/"
              exact
              render={() => <div>Welcome to Test Manager</div>}
            />
            <Route component={NotFound} />
          </Switch>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <TitleProvider>
        <AppContent />
      </TitleProvider>
    </Router>
  );
};

export default App;
