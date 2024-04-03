function* combinator<C>(variants: C[][]): Iterable<[number[], C[]]> {
  const length = variants.length;
  const indexesIterator: number[] = Array<number>(length).fill(0);

  const throwError = () => {
    throw new Error('Not valid variants argument');
  }

  const sucIndex = (): boolean => {
    let variantIndex = 0;

    while (variantIndex < length) {
      indexesIterator[variantIndex] += 1;
      if (indexesIterator[variantIndex] != variants[variantIndex].length) {
        return true;
      }

      indexesIterator[variantIndex] = 0;
      variantIndex += 1;
    }

    return false;
  }

  if (length == 0) {
    throwError()
  }

  for (const vrs of variants) {
    if (vrs.length === 0) {
      throwError();
    }
  }

  do {
    yield [[...indexesIterator], indexesIterator.map((index, pos) => variants[pos][index])]
  } while (sucIndex())

  return
}