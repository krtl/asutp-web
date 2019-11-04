import React from "react";
import "./ContextMenu.css";

const ContextMenu = ({ position, items, onOptionSelected }) => {
  const handleOptionSelected = option => () => onOptionSelected(option);

  return (
    <div
      className="menu"
      style={{
        position: "absolute",
        left: position.x,
        top: position.y
      }}
    >
      <ul>
        {items.map(item => (
          <li key={item} onClick={handleOptionSelected(item)}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ContextMenu;
