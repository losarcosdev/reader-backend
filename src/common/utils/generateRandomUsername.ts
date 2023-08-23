/* eslint-disable prettier/prettier */
export const generateRandomUsername = ({ name }: { name: string }) => {
  const letters = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const characters = letters + numbers;
  const length = 7; // Longitud exacta de 12 caracteres

  let randomString = '';
  for (let i = 0; i < length; i++) {
    const randomCharacter = characters.charAt(
      Math.floor(Math.random() * characters.length),
    );
    randomString += randomCharacter;
  }

  const username = `@${name.split(' ', 1).join().toLowerCase()}${randomString}`;

  return username;
};
