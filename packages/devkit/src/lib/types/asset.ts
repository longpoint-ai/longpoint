export interface AssetSource {
  /**
   * A raw base64 encoded string of the asset.
   */
  base64?: string;
  /**
   * A base64 encoded data URI of the asset.
   */
  base64DataUri?: string;
  /**
   * A URL to the asset.
   */
  url?: string;
  /**
   * The MIME type of the asset.
   */
  mimeType: string;
}
