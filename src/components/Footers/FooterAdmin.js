import React from "react";
import { Link } from "react-router-dom";

export default function FooterAdmin() {
  return (
    <>
      <footer className="block py-4">
        <div className="container mx-auto px-4">
          <hr className="mb-4 border-b-1 border-blueGray-200" />
          <div className="flex flex-wrap items-center md:justify-between justify-center">
            <div className="w-full md:w-6/12">
              <div className="text-sm text-blueGray-500 w-fit font-semibold py-1 text-center md:text-left">
                Copyright © {new Date().getFullYear()}{" "}
                <a
                href="https://www.creative-tim.com/"
                className="text-blueGray-500 hover:text-blueGray-700 text-sm font-semibold py-1"
                target="_blank"
                >
                  Creative Tim 
                </a>
                {" | "}Distributed by{" "}
                <a
                href="https://themewagon.com/"
                className="text-blueGray-500 hover:text-blueGray-700 text-sm font-semibold py-1"
                target="_blank"
                >
                  ThemeWagon
                </a>
              </div>
            </div>
            <div className="w-full md:w-6/12 px-4">
              <ul className="flex flex-wrap list-none md:justify-end  justify-center">
                <li>
                  <a
                    href="https://www.creative-tim.com/"
                    target="_blank"
                    className="text-blueGray-600 hover:text-blueGray-800 text-sm font-semibold block py-1 px-3"
                  >
                    Creative Tim
                  </a>
                </li>
                <li>
                  <Link
                  onClick={(e) => e.preventDefault()}
                  to=""
                    className="text-blueGray-600 hover:text-blueGray-800 text-sm font-semibold block py-1 px-3"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                  onClick={(e) => e.preventDefault()}
                  to=""
                    className="text-blueGray-600 hover:text-blueGray-800 text-sm font-semibold block py-1 px-3"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                  onClick={(e) => e.preventDefault()}
                  to=""
                  
                    className="text-blueGray-600 hover:text-blueGray-800 text-sm font-semibold block py-1 px-3"
                  >
                    MIT Licensee
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
