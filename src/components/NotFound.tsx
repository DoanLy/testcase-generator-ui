import React from "react";
import "./NotFound.css";

const NotFound: React.FC = () => {
  return (
    <div className="not-found">
      <div className="not-found-content">
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p>
          The page you are looking for does not exist or is under development.
        </p>
      </div>
    </div>
  );
};

export default NotFound;
