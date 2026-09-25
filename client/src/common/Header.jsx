/**
 * ============================================================================
 * PATH: client/src/common/Header.jsx
 * DESCRIPTION: Global Header wrapper linking the utility top-bar and navigation.
 * ============================================================================
 */

import React from "react";
import HeaderTopBar from "./HeaderTopBar";
import Navbar from "./Navbar";

export default function Header({ isSticky = true }) {
  return (
    <header className={`w-full bg-white z-50 shadow-mmt ${isSticky ? "sticky top-0" : ""}`}>
      {/* 1. Top red notification/helpline strip */}
      {/* <HeaderTopBar /> */}

      {/* 2. Main white navigation details */}
      <Navbar />
    </header>
  );
}
