# set camera scrolling multipliers

Sets multipliers to control how fast the background image scrolls when the camera moves. A value of 1 means the scroll should move at the same speed as the camera, higher values will make the image scroll faster, and values between 0 and 1 will make the image scroll slower.

Scrolling slower us useful if you want to achieve a parallax effect to give your game a sense of depth!

```sig
scroller.setCameraScrollingMultipliers(1, 1)
```

## Parameters

* **x**: A multiplier for speed on the horiztonal axis
* **y**: A multiplier for speed on the vertical axis

## Example #example


```blocks

```

```package
arcade-background-scroll=github:microsoft/arcade-background-scroll
```