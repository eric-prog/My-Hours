import React from "react";
import Link from "next/link";
import "./index.module.scss"

const Index = () => {
  return (
    <div className="container">
      <Link href={'/join'}>
        <a className="join-link">Join</a>
      </Link>
    </div>
  );
};

export default Index;
