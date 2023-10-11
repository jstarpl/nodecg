import React from "react";
import { Button, ButtonProps } from "@mui/material";
import { keyframes } from "@emotion/react";
import { styled } from "@mui/material/styles";
import { PlayArrowRounded, HideImageRounded } from "@mui/icons-material";

interface IProps {
  onAir: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  duration?: number;
  iconOnly?: boolean;
  playLabel?: string;
  stopLabel?: string;
}

const animateWidth = keyframes`
	0% {
		width: 0%
	}
	100% {
		width: 100%
	}
`;

interface AnimatedButtonProps {
  animationDuration?: number;
  showProgress?: boolean;
}

const AnimatedButton = styled(
  (props: ButtonProps & AnimatedButtonProps) => <Button {...props} />,
  {
    shouldForwardProp: (prop) =>
      prop !== "animationDuration" && prop !== "showProgress",
  }
)(({ theme, animationDuration, showProgress }) => ({
  "::after": {
    content: '" "',
    display: "block",
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "0%",
    height: "5px",
    background: "rgba(0, 0, 0, 0.5)",
    animation: showProgress
      ? `${animateWidth} ${animationDuration}ms linear both`
      : undefined,
  },
  textTransform: "uppercase",
}));

export function OnAirToggleButton({
  onAir,
  onClick,
  duration,
  iconOnly,
  playLabel,
  stopLabel,
}: IProps) {
  return (
    <AnimatedButton
      variant="contained"
      color={onAir ? "error" : undefined}
      onClick={onClick}
      animationDuration={duration}
      showProgress={duration && onAir ? true : false}
      startIcon={
        iconOnly ? undefined : onAir ? (
          <HideImageRounded />
        ) : (
          <PlayArrowRounded />
        )
      }
    >
      {onAir
        ? iconOnly && <HideImageRounded />
        : iconOnly && <PlayArrowRounded />}
      {onAir ? !iconOnly && (stopLabel ?? "Stop") : !iconOnly && (playLabel ?? "Play")}
    </AnimatedButton>
  );
}
