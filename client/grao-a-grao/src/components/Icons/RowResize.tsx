import React from "react";

const RowResize = (
  props: React.JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>
) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="currentColor"
    viewBox="0 0 24 24"
    {...props}
  >
    {/* Chevron Up — moved up */}
    <path d="M8.71 5.71 12 2.41l3.29 3.3 1.41-1.42-4-4a1 1 0 0 0-1.41 0l-4 4 1.42 1.42Z" />

    {/* Top line — moved down */}
    <path d="M4 11h16v1H4z" />

    {/* Bottom line — moved down */}
    <path d="M4 14h16v1H4z" />

    {/* Chevron Down — moved down */}
    <path d="M15.29 18.29 12 21.59l-3.29-3.3-1.41 1.42 4 4a1 1 0 0 0 1.41 0l4-4-1.42-1.42Z" />
  </svg>
);

export default RowResize;
