/* eslint-disable prettier/prettier */

export const generateSlug = (name: string) => {
  return name.toLowerCase().replace(/ /g, '-');
};
