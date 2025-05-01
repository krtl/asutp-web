import React from "react";
import Auth from "../../modules/Auth";
// import "./MyServerStatus.css";

const MyServerStatus = ({ socketStatus, serverStatus, onClick }) => {
  const handleOnClick = option => () => onClick(option);

  let items = [];

  items.push(`socket: ${socketStatus}`);
  for (const prop in serverStatus) {
    if (prop === "clients")
    {
      for (const str of serverStatus[prop]) {
        if (str !== "")
        {
          items.push(`${str}`);
        }
      }
    }
    else
    {
      items.push(`${prop}: ${serverStatus[prop]}`);
    }
  }

  return (
    <div>
        {(Auth.canSeeServerStatus()) ? (
            <select id="serverStatus">
            {items.map(item => (
              <option key={item} onClick={handleOnClick(item)}>
                {item}
              </option>
            ))}
          </select>
        ) : (
            <div className="column">
            {`socket: ${socketStatus}`}
          </div>  
        )}

    </div>
  );
};

export default MyServerStatus;
