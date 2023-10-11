import React from "react";

export function ThinText({
  children,
  thinClassName,
  thinSecondSeparator,
  thinFirstSeparator,
}: {
  children: string | undefined | null;
  thinClassName?: string;
  thinSecondSeparator?: string;
  thinFirstSeparator?: string;
}): React.ReactElement {
  children = children ?? "";
  const FIRST_SEPARATOR = thinFirstSeparator ?? "$";
  const SECOND_SEPARATOR = thinSecondSeparator ?? "%";
  const isOfficial = children.indexOf(FIRST_SEPARATOR) >= 0;
  const isAthlete = children.indexOf(SECOND_SEPARATOR) >= 0;

  let line: React.ReactElement;

  if (isAthlete) {
    const elems = children.split(SECOND_SEPARATOR, 2);
    line = (
      <>
        {elems[0]}&nbsp;<span className={thinClassName}>{elems[1]}</span>
      </>
    );
  } else if (isOfficial) {
    const elems = children.split(FIRST_SEPARATOR, 2);
    line = (
      <>
        <span className={thinClassName}>{elems[0]}</span>&nbsp;{elems[1]}
      </>
    );
  } else {
    line = <>{children}</>;
  }

  return line;
}
