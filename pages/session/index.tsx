import React from "react";
import { NextPage } from "next";

type Props = {};

const SessionIn: NextPage<Props> = props => {
  console.log(props);
  return <div>session</div>;
};

export default SessionIn;
