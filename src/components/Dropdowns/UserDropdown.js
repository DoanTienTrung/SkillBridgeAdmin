import React, { useRef, useState } from "react";
import { createPopper } from "@popperjs/core";

const UserDropdown = ({ avatarUrl }) => {
  const [isOpen, setIsOpen] = useState(false);
  const btnRef = useRef(null);
  const popoverRef = useRef(null);

  const toggleDropdown = () => {
    if (isOpen) {
      setIsOpen(false);
    } else {
      createPopper(btnRef.current, popoverRef.current, {
        placement: "bottom-start",
      });
      setIsOpen(true);
    }
  };

  return (
    <div className="relative inline-block">
      {/* Nút avatar */}
      <button
        ref={btnRef}
        onClick={toggleDropdown}
        className="focus:outline-none"
      >
        <div className="flex items-center">
          <span className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
            <img
              alt="avatar"
              className="w-full h-full object-cover border-none shadow-lg"
              src={avatarUrl || require("assets/img/team-1-800x800.jpg")}
            />
          </span>
        </div>
      </button>

      {/* Menu dropdown */}
      <div
        ref={popoverRef}
        className={`${
          isOpen ? "block" : "hidden"
        } bg-white text-sm z-50 mt-2 py-2 list-none text-left rounded shadow-lg min-w-[12rem]`}
      >
        <button
          className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
          onClick={() => alert("Action")}
        >
          Action
        </button>
        <button
          className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
          onClick={() => alert("Another action")}
        >
          Another action
        </button>
        <button
          className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
          onClick={() => alert("Something else here")}
        >
          Something else here
        </button>
        <div className="h-px my-2 bg-gray-200" />
        <button
          className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
          onClick={() => alert("Separated link")}
        >
          Separated link
        </button>
      </div>
    </div>
  );
};

export default UserDropdown;
