import React from "react";
import colors from "../../theme/colors";

function Button({ 
  onClick, 
  disabled, 
  children, 
  className = "", 
  bgColor = colors.accent,
  textColor = "white",
  ...props 
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`font-bold py-3 px-8 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      } ${className}`}
      style={{
        backgroundColor: disabled ? "#e2e8f0" : bgColor,
        color: disabled ? "#94a3b8" : textColor,
        border: "none",
        transform: "scale(1)",
      }}
      onMouseDown={(e) => !disabled && (e.currentTarget.style.transform = "scale(0.98)")}
      onMouseUp={(e) => !disabled && (e.currentTarget.style.transform = "scale(1)")}
      onMouseOver={(e) => !disabled && (e.currentTarget.style.transform = "scale(1.05)")}
      onMouseOut={(e) => !disabled && (e.currentTarget.style.transform = "scale(1)")}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;