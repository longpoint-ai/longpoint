import { mimeTypeToMediaType } from './media.utils';

describe('media.utils', () => {
  // it('should convert a video mime type to video type', () => {
  //   expect(mimeTypeToMediaType('video/mp4')).toEqual('VIDEO');
  // });

  it('should convert a image mime type to image type', () => {
    expect(mimeTypeToMediaType('image/jpeg')).toEqual('IMAGE');
  });

  // it('should convert a audio mime type to audio type', () => {
  //   expect(mimeTypeToMediaType('audio/mpeg')).toEqual('AUDIO');
  // });

  it('should throw an error for an unsupported mime type', () => {
    expect(() => mimeTypeToMediaType('application/pdf')).toThrow(
      'Unsupported media type: application/pdf'
    );
  });
});
