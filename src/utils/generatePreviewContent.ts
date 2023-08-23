/* eslint-disable prettier/prettier */

export const generatePostPreviewContent = (blocks: any, time: number): any => {
  // Take the first element of the array
  const firstBlock = blocks[0];

  // Generate previsualization depending on the block type
  switch (firstBlock.type) {
    case 'paragraph':
      // Extract only the text removing HTML labels using a regular expression
      const textContent = firstBlock.data.text.replace(/<[^>]+>/g, '');
      return {
        type: 'paragraph',
        content: textContent,
        time,
      };
    case 'image':
      return {
        type: 'image',
        content: firstBlock.data.file.url,
        time,
      };
    default:
      return {
        type: 'other',
        content: '',
        time,
      };
  }
};
