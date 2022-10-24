function decodeUnsignedInteger(
  data: Uint8Array,
  argument: number,
  index: number
): [number, number] {
  if (argument < 24) {
    return [argument, 1];
  }
  const remainingDataLength = data.length - index - 1;
  switch (argument) {
    case 24: {
      if (remainingDataLength > 0) {
        const value = data[index + 1];
        if (value < 24) {
          break;
        }
        return [value, 2];
      }
      break;
    }
    case 25: {
      if (remainingDataLength > 1) {
        const value1 = data[index + 1];
        const value2 = data[index + 2];
        const value = (value1 << 8) | value2;
        return [value, 3];
      }
      break;
    }
    // Bigger integers not supported
  }
  throw new Error('integer is not supported or not well formed');
}
function decodeNegativeInteger(
  data: Uint8Array,
  argument: number,
  index: number
): [number, number] {
  const [value, length] = decodeUnsignedInteger(data, argument, index);
  return [-value - 1, length];
}

function decodeByteString(
  data: Uint8Array,
  argument: number,
  index: number
): [Uint8Array, number] {
  const remainingDataLength = data.length - index - 1;
  if (argument < 24) {
    if (remainingDataLength >= argument) {
      return [data.slice(index + 1, index + 1 + argument), argument + 1];
    }
  }
  if (argument === 24 && remainingDataLength > 1) {
    const length = data[index + 1];
    if (remainingDataLength - 1 >= length) {
      return [data.slice(index + 2, index + 2 + length), length + 2];
    }
  }
  throw new Error('string is not supported or not well formed');
}

/*eslint node/prefer-global/text-decoder: [error]*/
const TEXT_DECODER = new TextDecoder();
function decodeString(
  data: Uint8Array,
  argument: number,
  index: number
): [string, number] {
  const [value, length] = decodeByteString(data, argument, index);
  return [TEXT_DECODER.decode(value), length];
}

function decodeNext(data: Uint8Array, index: number): [any, number] {
  const byte = data[index];
  const majorType = byte >> 5;
  const argument = byte & 0x1f;
  switch (majorType) {
    case 0: {
      return decodeUnsignedInteger(data, argument, index);
    }
    case 1: {
      return decodeNegativeInteger(data, argument, index);
    }
    case 2: {
      return decodeByteString(data, argument, index);
    }
    case 3: {
      return decodeString(data, argument, index);
    }
  }
  throw new Error('Unsupported or not well formed');
}

export function decode(data: Uint8Array): any {
  if (data.length === 0) {
    throw new Error('No data');
  }
  const [result, number] = decodeNext(data, 0);
  if (number !== data.length) {
    throw new Error('Data was decoded, but the whole stream was not processed');
  }
  return result;
}
