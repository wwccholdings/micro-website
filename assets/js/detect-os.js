function detectOS() {
  const ua = navigator.userAgent;
  const platform = navigator.platform || "";

  if (/android/i.test(ua)) {
    return "android";
  }

  const isApple =
    /Mac|iPhone|iPad|iPod/.test(platform) ||
    (platform === "MacIntel" && navigator.maxTouchPoints > 1) ||
    /Macintosh/i.test(ua);

  if (isApple) {
    return "ios";
  }
  return "other";
}

document.addEventListener("DOMContentLoaded", () => {
  const links = document.querySelectorAll(".app-link");
  const os = detectOS();

  const IOS_URL =
    "https://apps.apple.com/us/app/cross-connect-prayer-bible/id6748592295";
  const ANDROID_URL =
    "https://play.google.com/store/apps/details?id=com.wisdom_wear.cross_connect";

  links.forEach((link) => {
    if (os === "ios") {
      link.href = IOS_URL;
      sessionStorage.setItem("appLink", IOS_URL);
    } else {
      link.href = ANDROID_URL;
      sessionStorage.setItem("appLink", ANDROID_URL);
    }
  });
});
