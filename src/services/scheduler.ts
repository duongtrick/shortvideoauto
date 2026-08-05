export function createManualPublishChecklist(platform: string) {
  return {
    platform,
    steps: [
      "Download MP4",
      "Copy caption and hashtags",
      "Open platform upload screen",
      "Paste caption",
      "Confirm affiliate disclosure",
      "Publish or schedule manually"
    ]
  };
}
