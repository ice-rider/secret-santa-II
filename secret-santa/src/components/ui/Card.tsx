import { Card as SuidCard, CardContent, CardActions, CardHeader } from "@suid/material";
import type { Component, JSX } from "solid-js";

interface CardComponentProps {
  title?: string;
  children: JSX.Element;
  actions?: JSX.Element;
  sx?: any;
  [key: string]: any;
}

const Card: Component<CardComponentProps> = (props) => {
  const { title, children, actions, ...rest } = props;

  return (
    <SuidCard {...rest}>
      {title && <CardHeader title={title} />}
      <CardContent>
        {children}
      </CardContent>
      {actions && <CardActions>{actions}</CardActions>}
    </SuidCard>
  );
};

export { Card };