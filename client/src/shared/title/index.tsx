import React from "react";

type TitleProps = {
    level: 1 | 2 | 3 | 4 | 5 | 6;
    children: React.ReactNode;
};
  
export const Title = ({ level, children }: TitleProps) => {
  const Tag = `h${level}` as const;
  return <Tag className="title">{children}</Tag>;
};