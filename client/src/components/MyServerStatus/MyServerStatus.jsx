import React from "react";
import Auth from "../../modules/Auth";


const MyServerStatus = ({ serverStatus, onClick }) => {
  const handleOnClick = option => () => {
    if(onClick){
      onClick(option);
    }
  }

  let items = [];

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
            <div>
          </div>  
        )}

    </div>
  );
};

export default MyServerStatus;
