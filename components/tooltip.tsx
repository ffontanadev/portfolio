"use client";

import React, { useState } from "react";
import classNames from "classnames";

type TooltipProps = {
  content: string;
  children: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
};

const positionClasses = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  left: "right-full top-1/2 -translate-y-1/2 mr-2",
  right: "left-full top-1/2 -translate-y-1/2 ml-2",
};

const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = "top",
}) => {
  const [visible, setVisible] = useState(false);

  return (
    <div
      className="relative inline-block group"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      <div
        role="tooltip"
        className={classNames(
          "absolute z-50 px-3 py-2 text-sm font-medium text-white bg-[#ea580c] rounded-lg shadow transition-opacity duration-300 whitespace-nowrap pointer-events-none",
          positionClasses[position],
          {
            "opacity-100 visible": visible,
            "opacity-0 invisible": !visible,
          }
        )}
      >
        {content}
        <div
          className="absolute w-2 h-2 bg-transparent dark:bg-gray-700 rotate-45"
          style={{
            [position === "top"
              ? "bottom"
              : position === "bottom"
                ? "top"
                : position === "left"
                  ? "right"
                  : "left"]: "-4px",
            [position === "top" || position === "bottom" ? "left" : "top"]:
              "50%",
            transform: "translate(-50%, -50%)",
          }}
        />
      </div>
    </div>
  );
};

export default Tooltip;
