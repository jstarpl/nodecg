import React, { useMemo, useState, useLayoutEffect, useRef } from "react"

interface IProps {
  width: number;
  height?: number;
  align: "left" | "right" | "center";

  fontScaleX?: number;
  showBorder?: boolean;
  allowLines?: boolean;
  narrowFont?: string;
}

const DEFAULT_NARROW_FONT = "var(--condensed-font)";

export function FitText({
  children,
  width,
  height,
  align,
  fontScaleX,
  showBorder,
  allowLines,
  narrowFont,
}: React.PropsWithChildren<IProps>) {
  const [scaleX, setScaleX] = useState<number | null>(null);
  const container = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [useNarrowFont, setNarrowFont] = useState(false);

  narrowFont = narrowFont ?? DEFAULT_NARROW_FONT;

  const justifyContent: React.CSSProperties["justifyContent"] =
    align === "center"
      ? "center"
      : align === "left"
      ? "flex-start"
      : "flex-end";
  const transformOrigin: React.CSSProperties["transformOrigin"] =
    align === "center"
      ? "center top"
      : align === "left"
      ? "left top"
      : "right top";

  const [containerStyle, innerStyle] = useMemo<
    [React.CSSProperties, React.CSSProperties]
  >(
    () => [
      {
        display: "inline-flex",
        verticalAlign: "top",
        width: width + "px",
        height: height ? height + "px" : undefined,
        textAlign: align,
        // Vertical align
        alignItems: "center",
        // Horizontal align
        justifyContent,
        outline: showBorder ? `1px solid #ff00ff` : undefined,
      },
      {
        flex: allowLines && useNarrowFont ? "1 1 100%" : "0",
        display: "inline-block",
        whiteSpace: allowLines && useNarrowFont ? "normal" : "nowrap",
        fontFamily: useNarrowFont ? narrowFont : undefined,
        transformOrigin,
        transform: scaleX !== null ? `scaleX(${scaleX})` : undefined,
      },
    ],
    [width, height, align, children, scaleX, allowLines, narrowFont]
  );

  useLayoutEffect(() => {
    if (container.current && inner.current) {
      const {
        width: containerWidth,
      } = container.current.getBoundingClientRect();
      const innerWidth = inner.current.scrollWidth;

      if (innerWidth * (fontScaleX || 1) > containerWidth) {
        if (!useNarrowFont && allowLines) {
          console.log("Set narrow font ON");
          setNarrowFont(true);
          requestAnimationFrame(() => {
            setScaleX(fontScaleX || null);
          });
        } else {
          setScaleX(containerWidth / innerWidth);
        }
      } else {
        setScaleX(fontScaleX || null);
        setNarrowFont(false);
      }
    } else {
      setScaleX(fontScaleX || null);
      setNarrowFont(false);
    }
  }, [
    width,
    height,
    align,
    fontScaleX,
    children,
    container.current,
    inner.current,
    useNarrowFont,
  ]);

  return (
    <div style={containerStyle} ref={container}>
      <div style={innerStyle} ref={inner}>
        {children}
      </div>
    </div>
  );
}