
export const fillZero = (number: number, length = 2) => {
  let result = `${number.toString()}`;
  while (result.length < length) {
    result = `0${result}`;
  }
  return result;
}

export const timeToString = (seconds: number) => {
  if (isNaN(seconds)) return '00:00';

  const _time = Math.floor(seconds);
  const minute = Math.floor(_time / 60);
  const second = Math.floor(_time % 60);

  return `${fillZero(minute)}:${fillZero(second)}`;
};
