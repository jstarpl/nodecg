import React, { useEffect, useRef, useState } from "react";

interface IProps {
  className?: string;
  steps: number[];
  step?: number;
  muted?: boolean;
  onStepCompleted?: (e: { step: number }) => void;
  onStepEntered?: (e: { step: number }) => void;
}

export function PausingVideo(
  props: Pick<
    React.MediaHTMLAttributes<HTMLVideoElement> &
      React.VideoHTMLAttributes<HTMLVideoElement>,
    "src" | "width" | "height" | "id"
  > &
    IProps
) {
  const { steps, onStepCompleted, onStepEntered, src } = props;
  const [currentStep, setCurrentStep] = useState(0);
  const videoEl = useRef<HTMLVideoElement>(null);
  const trackedStep = useRef<number | null>(null);
  const trackedCurrentTime = useRef<number | null>(null);
  const nextAnimationFrameRequest = useRef<number | null>(null);
  const step = props.step ?? 0;

  const onTimeUpdate = () => {
    let finished = false;
    if (videoEl.current) {
      const time = Math.floor(videoEl.current.currentTime * 1000);

      if (trackedCurrentTime.current !== time) {
        if (step < steps.length && time >= (steps[step] || 0)) {
          videoEl.current.pause();
          setCurrentStep(step);
          if (onStepCompleted) onStepCompleted({ step });
          finished = true;
        } else if (step >= steps.length && videoEl.current.ended) {
          setCurrentStep(step);
          if (onStepCompleted) onStepCompleted({ step });
          finished = true;
        }

        trackedCurrentTime.current = time;

        const inStep =
          time < steps[0]
            ? -1
            : steps.findIndex(
                (value, index, obj) =>
                  Math.floor(time / 10) > Math.floor(value / 10) &&
                  (Math.floor(time / 10) < Math.floor(obj[index + 1] / 10) ||
                    index + 1 === obj.length)
              );

        if (
          !videoEl.current.paused &&
          inStep >= 0 &&
          inStep !== trackedStep.current
        ) {
          trackedStep.current = inStep;
          if (onStepEntered) onStepEntered({ step: inStep });
        }
      }
    }

    if (!finished) {
      nextAnimationFrameRequest.current = window.requestAnimationFrame(
        onTimeUpdate
      );
    }
  };

  useEffect(() => {
    if (!videoEl.current) return;
    // if (step === 0 && videoEl.current.currentTime > steps[0]) {
    //   videoEl.current.currentTime = steps[0];
    //   videoEl.current.addEventListener(
    //     "timeupdate",
    //     () => {
    //       videoEl.current?.pause();
    //     },
    //     {
    //       once: true,
    //       passive: false,
    //     }
    //   );
    //   videoEl.current.play().catch(console.error);
    // } else
    if (step >= steps.length) {
      const targetTime = (steps[steps.length - 1] || 0) / 1000;
      const currentTime = videoEl.current.currentTime;
      if (currentTime !== 0) {
        const diff = targetTime - videoEl.current.currentTime;
        if (diff < 0 || diff > 0.25) {
          videoEl.current.currentTime = targetTime;
        }
        videoEl.current.play().catch(console.error);
      }
      setCurrentStep(step - 1);
    } else if (step >= 0) {
      const targetTime = (steps[step - 1] || 0) / 1000;
      const diff = targetTime - videoEl.current.currentTime;
      if (diff < 0 || diff > 0.25) {
        videoEl.current.currentTime = targetTime;
      }
      videoEl.current.play().catch(console.error);
      setCurrentStep(step - 1);
    } else if (step === -1) {
      const currentTime = videoEl.current.currentTime;
      if (currentTime !== 0) {
        videoEl.current.currentTime = 0;
        videoEl.current.addEventListener(
          "timeupdate",
          () => {
            videoEl.current?.pause();
          },
          {
            once: true,
            passive: false,
          }
        );
        videoEl.current.play().catch(console.error);
      }
    } else {
      videoEl.current.play().catch(console.error);
    }
  }, [src, step, JSON.stringify(steps)]);

  // useEffect(() => {
  // 	console.log(currentStep, step)
  // }, [currentStep, step])

  useEffect(() => {
    nextAnimationFrameRequest.current = window.requestAnimationFrame(
      onTimeUpdate
    );
    return () => {
      if (nextAnimationFrameRequest.current) {
        window.cancelAnimationFrame(nextAnimationFrameRequest.current);
      }
    };
  }, [step]);

  return (
    <video
      id={props.id}
      className={props.className}
      src={src}
      width={props.width}
      height={props.height}
      ref={videoEl}
      muted={props.muted}
      preload="auto"
    ></video>
  );
}
