import React from "react";
import { firstLetterFromString } from "./utils/stringUtils";
function BasicComponent() {
  return (
    <div className="basic-component">
        <h1>Basic Component</h1>
        <h2>my name is nevo, and i start with the letter{firstLetterFromString("nevo")}</h2>
      <p>Hello, this is a basic component!</p>
    </div>
  );
}
export default BasicComponent;