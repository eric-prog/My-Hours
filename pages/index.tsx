import React from "react";
import Link from "next/link";

const Index = () => {
  return (
    <div className="home-body">
      <Link href={'/join'}>
        <a className="join-link">Join</a>
      </Link>
    </div>
  );
};

export default Index;
