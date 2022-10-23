function decodeUnsignedInteger(data: Uint8Array, argument: number, index: number): [number, number] {
  if (argument < 24) {
    return [argument, 1];
  }
  const remainingDataLength = data.length - index - 1;
  switch (argument) {
    case 24: {
      if (remainingDataLength > 0) {
        const value = data[index + 1];
        if (value < 24) {
          throw new Error('Unsigned integer is not well formed');
        }
        return [value, 2];
      } else {
        throw new Error('Unsigned integer is not well formed, the stream ended early');
      }
    }
    case 25: {
      if (remainingDataLength > 1) {
        const value1 = data[index + 1];
        const value2 = data[index + 2];
        const value = (value1 << 8) | value2;
        return [value, 3];
      } else {
        throw new Error('Unsigned integer is not well formed, the stream ended early');
      }
    }
    case 26: {
      break;
    }
    case 27: {
      break;
    }
  }
  throw new Error('Unsigned integer is not supported or not well formed');
}

function decodeNext(data: Uint8Array, index: number): [any, number] {
  const byte = data[index];
  const majorType = byte >> 5;
  const argument = byte & 0x1F;
  switch (majorType) {
    case 0: {
      return decodeUnsignedInteger(data, argument, index);
    }
  }
  throw new Error('Unsupported or not well formed');
}

export function decode(data: Uint8Array) : any {
  if (data.length == 0) {
    return undefined;
  }
  const [result, number] = decodeNext(data, 0);
  if (number != data.length) {
    throw new Error('Data was decoded, but the whole stream was not processed');
  }
  return result;
}
