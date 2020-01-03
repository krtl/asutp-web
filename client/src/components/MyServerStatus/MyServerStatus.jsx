import React from "react";
// import "./MyServerStatus.css";

const MyServerStatus = ({ socketStatus, serverStatus, onClick }) => {
  const handleOnClick = option => () => onClick(option);

  let items = [];
  items.push(`socket: ${socketStatus}`);
  for (var prop in serverStatus) {
    items.push(`${prop}: ${serverStatus[prop]}`);
  }

  return (
    <div>
      <select>
        {items.map(item => (
          <option key={item} onClick={handleOnClick(item)}>
            {item}
          </option>
        ))}
      </select>
    </div>
  );
};

export default MyServerStatus;
